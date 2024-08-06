# Contributing workflow

## Naming conventions

- `main` is for production code only.
- `staging` is the step before merging into production.
- `develop` is for development. Anything goes.

```mermaid
graph TD
    A[Naming]
    A1[`main`: Production code only]
    A2[`staging`: Step before merging into production]
    A3[`develop`: Development, anything goes]

    A --> A1
    A --> A2
    A --> A3
```

## How'd you start a new feature, bug fix, etc.?

Create a new branch from `develop`, name your branch in some useful way (`feat/new-feature`, `fix/bug-fix`, `feature/#192`, etc.). Work on it until you're satisfied, and when you're done create a pull request. Once the pull request is approved and all the requirements are met, merge it into develop.

```mermaid
graph LR
    B[New feature or bug fix]
    B1[Create new branch from `develop`]
    B2[Name branch descriptively]
    B3[Work on the branch]
    B4[Create pull request]
    B5[Pull request approved]
    B6[Merge branch into `develop`]

    B --> B1
    B1 --> B2
    B2 --> B3
    B3 --> B4
    B4 --> B5
    B5 --> B6

```

## What about `staging`?

Once you reach a point where you feel like a new release is worth creating, merge `develop` into `staging` This is the branch where things should be tested and fixed before merging into `main`

Test `staging` thoroughly, fix all the bugs (yeah, right!), and once everything's ready merge `staging`'s changes into `develop` (for further development) and `main` (to create a new release).

### And what now?

So, `staging` is ready and you merged it into `main`. Time for a new release!

First, tag `main` following Semantic Versioning's guidelines: https://semver.org/

After you created a new tag, create a new release using that tag. That's it, everybody now can see that a new version is ready to use and if something's wrong they can go back to using a previous version temporarily.

```mermaid
graph TD
    C[Staging Process]
    C1[Merge `develop` into `staging`]
    C2[Test and fix bugs in `staging`]
    C3[Merge `staging` into `develop`]
    C4[Merge `staging` into `main`]

    D[Releasing a New Version]
    D1[Tag `main` following Semantic Versioning]
    D2[Create a new release using the tag]
    D3[New version is available]

    C --> C1
    C1 --> C2
    C2 --> C3
    C2 --> C4

    D --> D1
    D1 --> D2
    D2 --> D3

    C4 --> D
```
