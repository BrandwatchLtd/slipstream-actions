# Slipstream Actions

A collection of GitHub Actions for working with Slipstream. A full end-to-end example can be seen on the [slipstream-actions-example](https://github.com/BrandwatchLtd/slipstream-actions-example/blob/master/.github/workflows/build.yaml) repository.

## Actions

See [Action definition](install-cli/action.yml) for additional details.

### Push Image

![](https://github.com/BrandwatchLtd/slipstream-actions/workflows/Push%20Image/badge.svg)

The `push-image` action builds a Docker image and pushes it to an appropriate Google Cloud Registry for use by Kubernetes. Additionally it generates and pushes artifact metadata to Slipstream.

```yaml
- name: Build and push Docker image
  uses: BrandwatchLtd/slipstream-actions/push-image@main
  id: push-image
  with:
    service: myservice
    labels: project=myproject
```

See [Action definition](push-image/action.yml) for additional details.

### Push Files (experimental)

![](https://github.com/BrandwatchLtd/slipstream-actions/workflows/Push%20Files/badge.svg)

The `push-files` action packages up a directory of files and pushes it to an appropriate Google Cloud Storage bucket for use in static website hosting. Additionally it generates and pushes artifact metadata to Slipstream.

```yaml
- name: Push static files
  uses: BrandwatchLtd/slipstream-actions/push-image@main
  id: push-image
  with:
    service: myservice
    filesDir: ./myfiles
    stageVersionCheckURL: https://myservice.stage.brandwatch.com/metadata/version
    prodVersionCheckURL: https://myservice.brandwatch.com/metadata/version
    labels: project=myproject
```

See [Action definition](push-files/action.yml) for additional details.

### Install CLI

![](https://github.com/BrandwatchLtd/slipstream-actions/workflows/Install%20CLI/badge.svg)

The `install-cli` action downloads and installs the Slipstream CLI. Useful for deployment requests, or querying for information about services and artifacts. NB: Requires the gcloud CLI to be installed and configured for authentication.

```yaml
- uses: BrandwatchLtd/slipstream-actions/install-cli@main
- uses: GoogleCloudPlatform/github-actions/setup-gcloud@0.1.2
  with:
    service_account_key: ${{ secrets.BW_PROD_ARTIFACTS_KEY }}
    export_default_credentials: true
```

### Deploy

![](https://github.com/BrandwatchLtd/slipstream-actions/workflows/Deploy/badge.svg)

The `deploy` action can be used to create a deployment request for a given artifact. This is typically used immediately after building an image to request a deployment to stage.

```yaml
- name: Deploy new image to stage
  uses: BrandwatchLtd/slipstream-actions/deploy@main
  with:
    environment: stage
    service: myservice
    id: ${{ steps.push-image.outputs.imageDigest }}
```

See [Action definition](deploy/action.yml) for additional details.

## Development

__NB: The default branch for this repo is `main`.__

Each action is in its own `/<action>` directory. Shared functionality is in `/lib`.

When working on these actions, in the root directory you should run:

```
npm run dev
```

This starts a file watcher for each action and rebuilds the `<action>/dist/index.js` file for each action. Changes to these should be checked in to git as they are the entry point for each action.

To run all the actions unit tests run:

```
npm test
```
