## Migration Branch Workflow

This document defines the execution workflow for the Astro migration.

### Branch roles

- `master`
  - current production branch
  - remains the live site branch until the migration cutover is approved
- `develop`
  - current integration branch outside the migration
  - should remain untouched until the migration is ready for final merge
- `feat/astro-migration-foundation`
  - long-lived migration branch
  - accumulates reviewed migration work until parity and launch gates are satisfied

### Pull request flow

1. create a task branch from `feat/astro-migration-foundation`
2. open the task PR into `feat/astro-migration-foundation`
3. review and merge task PRs into `feat/astro-migration-foundation` as issues are completed
4. keep the long-lived base PR from `feat/astro-migration-foundation` into `develop` open for migration visibility
5. merge `feat/astro-migration-foundation` into `develop` only after `#78` parity verification and launch sign-off

### Required checks

- `pnpm verify:all` must pass for migration task branches
- GitHub Actions `Astro CI` must pass on the migration branch head
- issue-specific verification criteria must be satisfied before the issue is checked off

### Deployment expectations

- preview and staging behavior should follow `feat/astro-migration-foundation` and task PR branches
- production remains tied to `master` until cutover
- rollback means returning traffic to the last known-good pre-migration deployment and leaving Astro work on the migration branch

### Scope rule

Migration work on `feat/astro-migration-foundation` should stay parity-first for phase 1. Broad redesign work should not be mixed into cutover-critical pull requests.
