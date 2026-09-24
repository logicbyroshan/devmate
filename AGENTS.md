# Agent Instructions & Guidelines: DevMate

## Mandatory Git Branching & Development Workflow

> **CRITICAL RULE**: NEVER perform normal development work directly on the `main` branch. `main` is the protected production/release branch.

### Standard Branch Hierarchy

```text
    main
      ↑
      │ merge completed/stable code
      │
     dev
      ↑
      │ merge completed features/fixes
      │
    feature/* / bugfix/* / hotfix/* / refactor/* / chore/* / docs/* / test/* / perf/*
```

---

### 1. Main Branch (`main`)

`main` is protected production code.

**Agents MUST NOT:**
- Directly modify code on `main`
- Create commits directly on `main`
- Develop features directly on `main`
- Run experimental changes directly on `main`
- Reset/rebase/force-push `main`
- Push directly to `main`

If the current branch is `main` and development work is requested, **STOP** and switch to an appropriate development branch.

`main` receives code only through the repository's approved merge process:
```text
dev → main
```
Only merge into `main` when the code is considered ready for production/release.

---

### 2. Dev Branch (`dev`)

`dev` is the primary integration and development branch.

Normal feature, bugfix, refactor, and chore branches **MUST** be created from `dev`.

**Examples:**
- `feature/user-profile`
- `feature/new-dashboard`
- `feature/api-caching`
- `bugfix/login-error`
- `bugfix/mobile-layout`
- `refactor/api-client`
- `chore/update-dependencies`
- `docs/deployment-guide`

After completing work, the branch should be merged back into `dev`.
Do **NOT** merge individual feature branches directly into `main` unless an explicit emergency/hotfix process is being followed.

---

### 3. Feature Branches (`feature/*`)

For new functionality:
```text
dev → feature/<short-description> → dev
```

**Workflow:**
```bash
git switch dev
git pull origin dev
git switch -c feature/user-dashboard
```
1. Work on the feature branch.
2. Test the changes.
3. Review the changes.
4. Commit the changes.
5. Push the feature branch.
6. Merge the feature branch into `dev`.
7. Remove the feature branch if it is no longer needed.

Never use `main` as the base for ordinary feature development.

---

### 4. Bugfix Branches (`bugfix/*`)

For normal bugs found during development:
```text
dev → bugfix/<short-description> → dev
```

**Examples:**
- `bugfix/navbar-overflow`
- `bugfix/api-timeout`
- `bugfix/mobile-responsive-layout`

Bugfix branches should normally merge into `dev`, not directly into `main`.

---

### 5. Refactor / Chore / Docs / Test / Perf Branches

Use appropriate branches for non-feature work:
- `refactor/<description>`
- `chore/<description>`
- `docs/<description>`
- `test/<description>`
- `perf/<description>`

These branches must be based on `dev` and merged back into `dev`.

---

### 6. Hotfixes (`hotfix/*`)

For a genuine production emergency where `main` must be fixed immediately:
```text
main → hotfix/<short-description> → main → dev
```

A hotfix is an exception to the normal feature flow. After a hotfix is merged into `main`, the same fix **MUST** also be merged/cherry-picked into `dev` so that the development branch does not fall behind production.

Do not use `hotfix/*` for ordinary feature development.

---

### 7. Production Release Flow

The normal production release flow:
```text
feature/* ──► dev ──► testing/review ──► main ──► production
```

When a version is ready for deployment:
1. Ensure `dev` is tested.
2. Ensure the working tree is clean.
3. Review the commits/diff between `dev` and `main`.
4. Merge `dev` into `main` using the approved repository process.
5. The production deployment pipeline is triggered from `main`.

Do **NOT** deploy unfinished feature branches directly to production.

---

### 8. Deployment Rule

Production deployment must correspond to `main`.

The deployment workflow is:
```text
feature/* ──► dev ──► main ──► production
```

Do not change the production deployment workflow to deploy arbitrary feature branches unless explicitly requested.
If a development/staging deployment is later introduced, it may use `dev`, but that must remain separate from the production `main` deployment.

---

### 9. Before Starting Any Task (Mandatory Pre-Flight)

Before modifying code, the agent **MUST**:
1. Check the current Git branch (`git branch --show-current`).
2. Check Git status (`git status --short`).
3. Determine whether the requested work belongs on `dev` or a new branch.
4. Never assume `main` is the working branch.

If currently on `main` and normal development is requested:
```bash
git switch dev
git pull --ff-only origin dev
git switch -c <type>/<description>
```
Do not blindly modify the current branch.

---

### 10. Safety: Never Destroy Uncommitted User Work

Before switching branches, rebasing, resetting, pulling, or merging:
- Check `git status`.
- Do not discard uncommitted changes.
- Do not run `git reset --hard` unless explicitly authorized.
- Do not run `git clean -fd` unless explicitly authorized.
- Do not stash user changes automatically without explaining why.
- If the working tree contains unrelated user work, stop and ask before potentially affecting it.

---

### 11. Commit Rules

- Commits should be made on the appropriate working branch (`feature/*`, `bugfix/*`, `refactor/*`, etc.).
- Never create ordinary development commits on `main`.
- Use clear, descriptive commit messages (e.g. Conventional Commits format like `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`).

---

### 12. Merge Rules

**Normal:**
- `feature/*` → `dev`
- `bugfix/*` → `dev`
- `refactor/*` → `dev`
- `chore/*` → `dev`
- `docs/*` → `dev`

**Release:**
- `dev` → `main`

**Emergency:**
- `hotfix/*` → `main`
- `hotfix/*` → `dev`

Avoid bypassing the intended branch flow.

---

### 13. Agent Behavior Mandate

Whenever a user asks the agent to:
- Add a feature
- Fix a bug
- Refactor code
- Add tests
- Change UI
- Modify APIs
- Change database code
- Improve performance
- Update dependencies
- Add documentation
- Make any other code change

The agent **MUST** first determine the appropriate branch:
1. Start from `dev`.
2. Create an appropriate task branch (`feature/...`, `bugfix/...`, `refactor/...`, `chore/...`, `docs/...`).
3. Work there.
4. Merge back into `dev`.

Do **NOT** interpret "make this change" as permission to work directly on `main`.

---

### 14. Branch Naming Conventions

Use lowercase kebab-case where practical:
- `feature/<short-description>` (e.g. `feature/admin-dashboard`, `feature/contact-form`)
- `bugfix/<short-description>` (e.g. `bugfix/mobile-navbar`, `bugfix/auth-token-refresh`)
- `hotfix/<short-description>` (e.g. `hotfix/vps-ssl-cert`, `hotfix/crash-on-load`)
- `refactor/<short-description>` (e.g. `refactor/api-client`, `refactor/state-store`)
- `chore/<short-description>` (e.g. `chore/update-docker`, `chore/bump-deps`)
- `docs/<short-description>` (e.g. `docs/deployment`, `docs/api-specs`)
- `test/<short-description>` (e.g. `test/e2e-navigation`)
- `perf/<short-description>` (e.g. `perf/image-loading`, `perf/bundle-optimization`)

---

### 15. Source of Truth

**GitHub is the source of truth.**
- Do not create permanent deployment-only or development-only modifications directly on the VPS.
- Repository configuration, deployment scripts, CI/CD workflows, and agent instructions should be committed to Git whenever they are intended to persist.

---

### 16. Agent Pre-Action Safety Checklist

Before any Git operation that can affect branches, the agent must verify:
1. **What branch am I on?**
2. **What branch should this work be on?**
3. **Is my working tree clean?**
4. **Where will this branch eventually merge?**
5. **Could this operation modify production/main?**

If the answer is unclear, do not proceed blindly.

---

### Summary Checklist

| Context | Action |
| :--- | :--- |
| **Normal Development** | `dev` → `feature/*` / `bugfix/*` → `dev` |
| **Release to Prod** | `dev` → `main` → auto deployment |
| **Emergency Fix** | `main` → `hotfix/*` → `main` AND `dev` |
| **Prohibited** | Direct commits/edits/pushes on `main` without hotfix/release process |
