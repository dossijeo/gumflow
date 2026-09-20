# Code signing policy

GUMFLOW is applying for free code signing provided by SignPath.io, with a
certificate by SignPath Foundation.

Once approved, official signed Windows releases will be produced from this
repository through the project's automated GitHub Actions release workflow.
Until approval is granted, published binaries must not be described as signed
by SignPath Foundation.

## Team roles

- Authors / committers: Gabriel Fernández Robles (`@dossijeo`)
- Reviewer: Gabriel Fernández Robles (`@dossijeo`)
- Approver: Gabriel Fernández Robles (`@dossijeo`)

Changes submitted by contributors who are not committers must be reviewed by
the reviewer before they are merged. Each code-signing request must be manually
approved by the approver.

## Privacy policy

This program will not transfer any information to other networked systems
unless specifically requested by the user or the person installing or
operating it.

The browser version may be hosted by third-party services such as itch.io or
GitHub; those services have their own privacy policies. The native GUMFLOW
application itself does not require an online account or network service for
gameplay.

### Separately built CrazyGames web edition

The CrazyGames web edition loads the official CrazyGames SDK and sends game
lifecycle events and save data through that SDK. Account/guest storage and cloud
synchronization are handled by CrazyGames. This integration is not included in
the offline Windows/Linux packages covered by the planned signing process.
See [the CrazyGames integration guide](docs/CRAZYGAMES.md) for its scope.

## Release and signing process

1. Source code and build scripts are maintained in this repository.
2. Release binaries are built by the repository's GitHub Actions workflows.
3. Release artifacts are tested before publication.
4. Once SignPath Foundation approval is granted, eligible Windows artifacts
   will be submitted through the configured SignPath signing workflow.
5. A signing request requires manual approval by the project's approver.
6. Signed artifacts must correspond to a tagged release built from this
   repository.

After SignPath Foundation approval, the introductory statement above will be
replaced with SignPath Foundation's required attribution:

> Free code signing provided by SignPath.io, certificate by SignPath Foundation.
