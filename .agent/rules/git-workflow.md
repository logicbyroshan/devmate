# Git Branching Strategy & Workflow Rules

## Core Directive: Never Develop Directly on `main`

`main` is strictly reserved for production/release deployments. Under no circumstances should an agent write code, commit, or push directly to `main` for standard development tasks.

### Branch Topology

```text
    main (Production / Live Release)
      ↑
      │ (Approved Release / PR Merge)
      │
     dev (Integration / Development Base)
      ↑
      │ (Feature / Fix Completion)
      │
    ├── feature/*   (New features)
    ├── bugfix/*    (Bug fixes)
    ├── refactor/*  (Code refactoring)
    ├── chore/*     (Maintenance / tooling)
    ├── docs/*      (Documentation updates)
    ├── test/*      (Test additions / updates)
    └── perf/*      (Performance improvements)
```

---

## Agent Pre-Task Protocol

Before modifying any file or running commands:
1. **Check current branch**: `git branch --show-current`
2. **Check status**: `git status --short`
3. If on `main`:
   ```bash
   git switch dev
   git pull origin dev
   git switch -c <type>/<description>
   ```
4. **Do not destroy uncommitted changes**: Never run `git reset --hard` or `git clean -fd` without explicit user permission.

---

## Branching Standards

### 1. Base Branch: `dev`
- All development tasks MUST branch off from `dev`.
- Pull the latest `dev` before branching: `git pull origin dev`.

### 2. Branch Naming Syntax
- `feature/<kebab-case-name>`
- `bugfix/<kebab-case-name>`
- `refactor/<kebab-case-name>`
- `chore/<kebab-case-name>`
- `docs/<kebab-case-name>`
- `test/<kebab-case-name>`
- `perf/<kebab-case-name>`

### 3. Merging Workflow
- When a task branch is verified and completed:
  1. Commit changes with clear, descriptive messages.
  2. Push the task branch: `git push origin <branch-name>`.
  3. Switch to `dev`: `git switch dev`.
  4. Pull latest `dev`: `git pull origin dev`.
  5. Merge task branch: `git merge <branch-name>`.
  6. Push `dev`: `git push origin dev`.

---

## Production Release & Hotfix Policies

### Production Release
- Only stable, tested `dev` commits are merged into `main`.
- Merging to `main` triggers the automated production deployment pipeline (`.github/workflows/deploy.yml`).

### Production Emergency Hotfix (`hotfix/*`)
- If a critical bug affects production directly:
  1. Branch from `main`: `git switch -c hotfix/<issue> main`.
  2. Fix and test thoroughly.
  3. Merge back into `main` and push.
  4. **Crucial**: Merge the hotfix into `dev` (`git switch dev && git merge hotfix/<issue> && git push origin dev`) so `dev` remains synchronized.

---

## Source of Truth
- GitHub repository is the canonical source of truth.
- Do not make untracked direct modifications on remote hosts/VPS without committing them to the repository.
