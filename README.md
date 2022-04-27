# Slipstream Actions

A collection of GitHub Actions for working with Slipstream. A full end-to-end example can be seen on the [slipstream-actions-example](https://github.com/BrandwatchLtd/slipstream-actions-example/blob/master/.github/workflows/build.yaml) repository.

## Actions

See [Action definition](install-cli/action.yml) for additional details.

## Example

```yaml
name: Build
on:
  push:
    branches:
      main

jobs:
  build:
    name: Build docker image
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - name: Slipstream Auth
      uses: 'google-github-actions/auth@v0'
      with:
        credentials_json: ${{ secrets.SERVICE_ACCOUNT }}

    - name: Slipstream setup Google Credentials
      uses: google-github-actions/setup-gcloud@v0

    - name: Build and push Docker image
      uses: BrandwatchLtd/slipstream-actions/push-image@main
      id: push-image
      with:
        service: <service_name>
        labels: project=<project_name>

    - name: Deploy new image to stage
      uses: BrandwatchLtd/slipstream-actions/deploy@main
      with:
        environment: stage
        service: <service_name>
        id: ${{ steps.push-image.outputs.imageDigest }}
```

## Slipstream Actions

### Prepare setup

Before you can use any of the actions you need to run the following setup steps.

```yaml
- name: Slipstream Auth
  uses: 'google-github-actions/auth@v0'
  with:
    credentials_json: ${{ secrets.SERVICE_ACCOUNT }}

- name: Slipstream setup Google Credentials
  uses: google-github-actions/setup-gcloud@v0
```
### Push Image

![](https://github.com/BrandwatchLtd/slipstream-actions/workflows/Push%20Image/badge.svg)

The `push-image` action builds a Docker image and pushes it to an appropriate Google Cloud Registry for use by Kubernetes. Additionally it generates and pushes artifact metadata to Slipstream.

```yaml
# Attention: This Action needs a google auth context. Please see "Prepare setup" section above.
- name: Build and push Docker image
  uses: BrandwatchLtd/slipstream-actions/push-image@main
  id: push-image
  with:
    service: myservice
    labels: project=myproject
```

#### How to push images to ECR

To push images to ECR you need to provide an ECR `dockerRegistry` and setup a few environment variables. For your image to be deployable via slipstream it is mandatory to set the `release` field to `true` otherwise your image will be considered as a development image.

```yaml
# Attention: This Action needs a google auth context. Please see "Prepare setup" section above.
- name: Build and push Docker image
  uses: BrandwatchLtd/slipstream-actions/push-image@main
  id: push-to-slipstream
  with:
    service: slipstream-pipeline-visualiser
    labels: project=appinfra
    dockerRegistry: <your_ecr_docker_registry>
    release: true #for image to be deployable via slipstream
  env:
    #The AWS secrets are already set as organisation level secrets, you don't need
    #to set them on a repository level, unless you want to use a different account
    AWS_ACCESS_KEY_ID: ${{ secrets.ARTIFACTS_PROD_AWS_ACCESS_KEY }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.ARTIFACTS_PROD_AWS_SECRET_KEY }}
    AWS_DEFAULT_REGION: eu-west-1
```

See [Action definition](push-image/action.yml) for additional details.


### Push Webapp

![](https://github.com/BrandwatchLtd/slipstream-actions/workflows/Push%Webapp/badge.svg)

The `push-webapp` action pushes a folder of static files to a CDN to be served by Webapp Service in Kubernetes. Additionally it generates and pushes artifact metadata to Slipstream.

```yaml
# Attention: This Action needs a google auth context. Please see "Prepare setup" section above.
- name: Push Webapp
  uses: BrandwatchLtd/slipstream-actions/push-webapp@main
  id: push-webapp
  with:
    service: myservice
    labels: project=myproject
    staticRoot: ./public
    indexFile: index.html
  env:
    #The AWS secrets are already set as organisation level secrets, you don't need
    #to set them on a repository level, unless you want to use a different account
    AWS_ACCESS_KEY_ID: ${{ secrets.CDN_PROD_AWS_ACCESS_KEY }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.CDN_PROD_AWS_SECRET_KEY }}
```

by default you will need to pass the above aws access credential environment variables as the default CDN bucket is stored in s3

See [Action definition](push-webapp/action.yml) for additional details.

### Push Files

![](https://github.com/BrandwatchLtd/slipstream-actions/workflows/Push%20Files/badge.svg)

The `push-files` action packages up a directory of files and pushes it to an appropriate Google Cloud Storage bucket for use in static website hosting. Additionally it generates and pushes artifact metadata to Slipstream.

```yaml
# Attention: This Action needs a google auth context. Please see "Prepare setup" section above.
- name: Push static files
  uses: BrandwatchLtd/slipstream-actions/push-files@main
  id: push-files
  with:
    service: myservice
    filesDir: ./myfiles
    stageVersionCheckURL: https://myservice.stage.brandwatch.com/metadata/version
    prodVersionCheckURL: https://myservice.brandwatch.com/metadata/version
    labels: project=myproject
```

See [Action definition](push-files/action.yml) for additional details.

### Push Module

![](https://github.com/BrandwatchLtd/slipstream-actions/workflows/Push%20Module/badge.svg)

The `push-module` generates and pushes module metadata to Slipstream.

```yaml
# Attention: This Action needs a google auth context. Please see "Prepare setup" section above.
- name: Push module metadata to slipstream
  uses: BrandwatchLtd/slipstream-actions/push-module@main
  with:
    bundleId: mybundleid
    version: mybundleversion
```

See [Action definition](push-module/action.yml) for additional details.

### Install CLI

![](https://github.com/BrandwatchLtd/slipstream-actions/workflows/Install%20CLI/badge.svg)

The `install-cli` action downloads and installs the Slipstream CLI. Useful for deployment requests, or querying for information about services and artifacts. NB: Requires the gcloud CLI to be installed and configured for authentication.

```yaml
# Attention: This Action needs a google auth context. Please see "Prepare setup" section above.
- uses: BrandwatchLtd/slipstream-actions/install-cli@main
```

### Deploy

![](https://github.com/BrandwatchLtd/slipstream-actions/workflows/Deploy/badge.svg)

The `deploy` action can be used to create a deployment request for a given artifact. This is typically used immediately after building an image to request a deployment to stage.

```yaml
# Attention: This Action needs a google auth context. Please see "Prepare setup" section above.
- name: Deploy new image to stage
  uses: BrandwatchLtd/slipstream-actions/deploy@main
  with:
    environment: stage
    service: myservice
    id: ${{ steps.push-image.outputs.imageDigest }}
```

See [Action definition](deploy/action.yml) for additional details.

### Maven Build

![](https://github.com/BrandwatchLtd/slipstream-actions/workflows/Maven%20Build/badge.svg)

The `maven-build` action build and tag your maven package that will be picked up by your docker build in the `target` folder.

```yaml
# Attention: This Action needs a google auth context. Please see "Prepare setup" section above.
- name: Maven build package
  uses: BrandwatchLtd/slipstream-actions/maven-build@main
```

See [Action definition](maven-build/action.yml) for additional details.

### Maven Verify

![](https://github.com/BrandwatchLtd/slipstream-actions/workflows/Maven%20Verify/badge.svg)

The `maven-verify` action will verify your maven package and run additional your tests on it.

```yaml

- name: Maven verify package
  uses: BrandwatchLtd/slipstream-actions/maven-verify@main
```

See [Action definition](maven-verify/action.yml) for additional details.

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
