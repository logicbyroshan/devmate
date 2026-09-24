#!/usr/bin/env bash

set -Eeuo pipefail

APP_DIR="/projects/apps/devmate"
COMPOSE_FILE="$APP_DIR/docker-compose.yml"
CONTAINER_NAME="devmate-frontend"
IMAGE_NAME="devmate-frontend"
PREFLIGHT_NAME="devmate-preflight"
PREFLIGHT_PORT="13080"

cd "$APP_DIR"

echo "==> Checking repository state"

if [[ -n "$(git status --porcelain)" ]]; then
    echo "ERROR: Working tree is not clean."
    exit 1
fi

echo "==> Updating source"

git fetch origin main
git pull --ff-only origin main

echo "==> Current commit:"
git log -1 --oneline

echo "==> Saving current production image"

OLD_IMAGE_ID="$(docker inspect --format '{{.Image}}' "$CONTAINER_NAME" 2>/dev/null || true)"

if [[ -n "$OLD_IMAGE_ID" ]]; then
    docker tag "$OLD_IMAGE_ID" "${IMAGE_NAME}:rollback"
    echo "Previous image: $OLD_IMAGE_ID"
else
    echo "No previous production image found."
fi

echo "==> Building new image"

docker compose -f "$COMPOSE_FILE" build frontend

echo "==> Removing previous preflight container if present"

docker rm -f "$PREFLIGHT_NAME" >/dev/null 2>&1 || true

echo "==> Starting preflight container"

docker run -d \
    --name "$PREFLIGHT_NAME" \
    -p "127.0.0.1:${PREFLIGHT_PORT}:80" \
    "$IMAGE_NAME:latest" >/dev/null

echo "==> Waiting for preflight healthcheck"

for i in {1..30}; do
    STATUS="$(docker inspect \
        --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' \
        "$PREFLIGHT_NAME" 2>/dev/null || true)"

    if [[ "$STATUS" == "healthy" ]]; then
        echo "Preflight healthcheck passed."
        break
    fi

    if [[ "$STATUS" == "unhealthy" ]]; then
        echo "ERROR: Preflight healthcheck failed."
        docker logs "$PREFLIGHT_NAME" || true
        docker rm -f "$PREFLIGHT_NAME" || true
        exit 1
    fi

    if [[ "$i" == "30" ]]; then
        echo "ERROR: Preflight healthcheck timed out."
        docker logs "$PREFLIGHT_NAME" || true
        docker rm -f "$PREFLIGHT_NAME" || true
        exit 1
    fi

    sleep 2
done

echo "==> Testing preflight HTTP response"

if ! curl -fsS --max-time 10 "http://127.0.0.1:${PREFLIGHT_PORT}/" >/dev/null; then
    echo "ERROR: Preflight HTTP test failed."
    docker logs "$PREFLIGHT_NAME" || true
    docker rm -f "$PREFLIGHT_NAME" || true
    exit 1
fi

echo "Preflight HTTP test passed."

docker rm -f "$PREFLIGHT_NAME" >/dev/null

echo "==> Deploying new version"

docker compose -f "$COMPOSE_FILE" up -d --no-build frontend

echo "==> Waiting for production healthcheck"

for i in {1..30}; do
    STATUS="$(docker inspect \
        --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' \
        "$CONTAINER_NAME" 2>/dev/null || true)"

    if [[ "$STATUS" == "healthy" ]]; then
        echo "Production healthcheck passed."
        break
    fi

    if [[ "$STATUS" == "unhealthy" ]]; then
        echo "ERROR: Production healthcheck failed."
        break
    fi

    if [[ "$i" == "30" ]]; then
        echo "ERROR: Production healthcheck timed out."
        break
    fi

    sleep 2
done

FINAL_STATUS="$(docker inspect \
    --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' \
    "$CONTAINER_NAME" 2>/dev/null || true)"

if [[ "$FINAL_STATUS" != "healthy" ]]; then
    echo "==> Deployment failed. Rolling back."

    if [[ -n "$OLD_IMAGE_ID" ]]; then
        docker tag "$OLD_IMAGE_ID" "${IMAGE_NAME}:latest"
        docker compose -f "$COMPOSE_FILE" up -d --no-build frontend

        echo "==> Rollback completed."

        sleep 5

        ROLLBACK_STATUS="$(docker inspect \
            --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' \
            "$CONTAINER_NAME" 2>/dev/null || true)"

        if [[ "$ROLLBACK_STATUS" == "healthy" ]]; then
            echo "Rollback healthcheck passed."
        else
            echo "WARNING: Rollback healthcheck is not healthy."
        fi
    else
        echo "No previous image available for rollback."
    fi

    exit 1
fi

echo "==> Final HTTP check"

if ! curl -fsS --max-time 10 "http://127.0.0.1:3080/" >/dev/null; then
    echo "ERROR: Production HTTP check failed."
    exit 1
fi

echo "==> Deployment successful"

docker ps --filter "name=${CONTAINER_NAME}"

echo "==> Cleaning dangling images"

docker image prune -f >/dev/null || true

echo "==> Done"
