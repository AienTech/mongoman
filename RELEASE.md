# Release Process

This document describes how to create and publish new releases of MongoMan.

## Overview

MongoMan uses a hybrid release system:
- **Development builds**: Pushing to `main` branch creates Docker images tagged as `latest`
- **Versioned releases**: Pushing version tags (e.g., `v0.1.2`) creates:
  - Docker images with version tags (`0.1.2`, `v0.1.2`, `0.1`)
  - GitHub Releases with auto-generated changelogs
  - Release notes with installation instructions

---

## Creating a New Release

### Prerequisites

- Write access to the repository
- Git configured locally
- All changes merged to `main` branch

### Step-by-Step Process

#### 1. Update the version in package.json

Edit `package.json` and update the version number following [Semantic Versioning](https://semver.org/):

```json
{
  "name": "mongoman",
  "version": "0.1.2",  // Update this
  ...
}
```

**Semantic Versioning Guide:**
- **Major** (1.0.0): Breaking changes, incompatible API changes
- **Minor** (0.1.0): New features, backward-compatible
- **Patch** (0.0.1): Bug fixes, backward-compatible

#### 2. Commit the version change

```bash
git add package.json
git commit -m "chore: bump version to 0.1.2"
```

#### 3. Create and push the git tag

```bash
# Create the tag (must match package.json version with 'v' prefix)
git tag v0.1.2

# Push the commit and tag
git push origin main
git push origin v0.1.2
```

> **Important**: The tag version (without the `v` prefix) MUST match the version in `package.json`. The workflow will validate this and fail if they don't match.

#### 4. Monitor the workflows

1. Go to the [Actions tab](../../actions) on GitHub
2. Watch the following workflows:
   - **Docker Build and Publish**: Builds and publishes Docker images
   - **Create GitHub Release**: Creates the GitHub release

Both should complete successfully.

#### 5. Verify the release

- **GitHub Release**: Check the [Releases page](../../releases) for the new release
- **Docker Image**: Verify the image is available:
  ```bash
  docker pull ghcr.io/aientech/mongoman:0.1.2
  docker pull ghcr.io/aientech/mongoman:v0.1.2
  ```

---

## Release Checklist

Before creating a release, ensure:

- [ ] All intended changes are merged to `main`
- [ ] Tests pass locally (if applicable)
- [ ] Documentation is up to date
- [ ] CHANGELOG or commit messages clearly describe changes
- [ ] Version number follows semantic versioning
- [ ] No sensitive information in commit history

---

## Docker Image Tags

Each release creates multiple Docker image tags:

| Tag Format | Example | Description |
|------------|---------|-------------|
| `latest` | `latest` | Always points to the most recent main branch build |
| `X.Y.Z` | `0.1.2` | Exact version tag (without `v` prefix) |
| `vX.Y.Z` | `v0.1.2` | Exact version tag (with `v` prefix) |
| `X.Y` | `0.1` | Minor version tag (auto-updated for patches) |
| `main-SHA` | `main-abc1234` | Commit SHA for traceability |

**Recommended usage:**
- **Production**: Use exact version tags (`0.1.2` or `v0.1.2`)
- **Development/Testing**: Use `latest` tag

---

## Rollback Procedure

If a release has issues, you can rollback:

### 1. Revert to a previous Docker image

```bash
# Use a specific older version
docker pull ghcr.io/aientech/mongoman:0.1.1
```

Update your deployment to use the older version.

### 2. Create a hotfix release

1. Fix the issue in a new branch
2. Merge to `main`
3. Create a new patch release (e.g., `v0.1.3`)

### 3. Delete a bad release (if necessary)

```bash
# Delete the tag locally
git tag -d v0.1.2

# Delete the tag remotely
git push origin :refs/tags/v0.1.2
```

Then manually delete the GitHub Release from the [Releases page](../../releases).

> **Note**: Deleting a tag doesn't remove Docker images. You may need to manually delete the image from the GitHub Container Registry if necessary.

---

## Troubleshooting

### Error: Tag version doesn't match package.json

**Problem**: The Docker workflow fails with a version mismatch error.

**Solution**: 
1. Delete the tag: `git tag -d v0.1.2 && git push origin :refs/tags/v0.1.2`
2. Fix the version in `package.json`
3. Commit and push the fix
4. Create the tag again with the correct version

### Release workflow didn't trigger

**Problem**: GitHub Release wasn't created after pushing a tag.

**Solution**:
1. Verify the tag format matches `v*.*.*` (e.g., `v0.1.2`)
2. Check the [Actions tab](../../actions) for errors
3. Re-run the workflow manually if needed

### Docker image not available

**Problem**: Can't pull the Docker image after release.

**Solution**:
1. Check if the workflow completed successfully
2. Verify you're using the correct image name: `ghcr.io/aientech/mongoman:0.1.2`
3. Ensure the package is public or you're authenticated to GHCR

---

## Additional Resources

- [Semantic Versioning](https://semver.org/)
- [GitHub Releases Documentation](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
