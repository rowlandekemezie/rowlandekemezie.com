## Migration Branch Workflow

This document defines the execution workflow for the Astro migration.

### Branch roles

- `develop`
  - long-lived integration branch for the Astro rebuild
  - all migration implementation work should target this branch through feature PRs
- `master`
  - production branch
  - remains the live site branch until the migration cutover is approved

### Pull request flow

1. create a feature branch from `develop`
2. open the pull request into `develop`
3. require review and CI before merge
4. use preview deployments from the feature branch PR and from `develop`
5. merge `develop` into `master` only after `#78` parity verification and launch sign-off

### Required checks

- build must pass on `develop` pull requests
- schema/content validation must pass once introduced
- route-level verification should be added as the migration proceeds

### Deployment expectations

- preview/staging behavior should be tied to `develop` and PR branches
- production should remain tied to `master` until cutover
- rollback should mean returning traffic to the last known-good `master` deployment if the Astro cutover fails

### Scope rule

Migration work on `develop` should stay parity-first for phase 1. Broad redesign work should not be mixed into cutover-critical pull requests.
