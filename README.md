# Slipstream Actions

A collection of GitHub Actions for working with Slipstream

## Install CLI

The `install-cli` action downloads and installs the Slipstream CLI. Useful for deployment requests, or querying for information about services and artifacts. NB: Requires the gcloud CLI to be installed and configured for authentication.

```yaml
- uses: BrandwatchLtd/slipstream-actions/install-cli@master
- uses: GoogleCloudPlatform/github-actions/setup-gcloud@0.1.2
  with:
    service_account_key: ${{ secrets.BW_PROD_ARTIFACTS_KEY }}
    export_default_credentials: true
```

See [Action definition](install-cli/action.yml) for additional details.

## Push Image

The `push-image` action builds a Docker image and pushes it to an appropriate Google Cloud Registry for use by Kubernetes. Additionally it generates and pushes artifact metadata to Slipstream.

```yaml
- name: Build and push Docker image
  uses: BrandwatchLtd/slipstream-actions/push-image@master
  id: push-image
  with:
    service: myservice
    labels: project=myproject
```

See [Action definition](push-image/action.yml) for additional details.

## Deploy

The `deploy` action can be used to create a deployment request for a given artifact. This is typically used immediately after building an image to request a deployment to stage.

```yaml
- name: Deploy new image to stage
  uses: BrandwatchLtd/slipstream-actions/deploy@master
  with:
    environment: stage
    service: myservice
    id: ${{ steps.push-image.outputs.imageDigest }}
```

See [Action definition](deploy/action.yml) for additional details.



