# DK64 Randomizer Hint Viewer: Development Guide

Twitch extension and broadcaster site for DK64 Randomizer hint viewing. Hosted on AWS (S3 + CloudFront + API Gateway + Lambda + DynamoDB).

## Structure

- **extension/** — Twitch extension panel (viewers)
- **broadcaster-site/** — DKHome web app (broadcasters)
- **infra/** — AWS CDK infrastructure (Python)
- **shared/** — Shared TypeScript types and utilities

## Local Development

### Broadcaster Site

```bash
cd broadcaster-site
npm install
npm run dev
```

Runs on `http://localhost:3000` by default.

### Extension https://dulrvobi1xht4.cloudfront.net

```bash
cd extension
npm install
npm run build:serve
```

Builds the extension and serves `dist/` on `http://localhost:5173`. Set that as the Asset Hosting URL in the Twitch developer console.

## Environment Setup

The Makefile reads from `.env.make` in the repo root. This file is not committed. Create it with:

```
DEV_BUCKET=<dev s3 bucket name>
DEV_CF_DISTRIBUTION=<dev cloudfront distribution id>
DEV_CF_DOMAIN=<dev cloudfront domain>

PROD_BUCKET=<prod s3 bucket name>
PROD_CF_DISTRIBUTION=<prod cloudfront distribution id>
PROD_CF_DOMAIN=<prod cloudfront domain>
```

Requires AWS CLI configured and CDK bootstrapped (`cd infra && cdk bootstrap`).

## Deployment

### Infrastructure

Run on first setup or after any stack changes.

```bash
make infra-dev    # deploy HintViewerDev + HintViewerApiDev stacks
make infra-prod   # deploy HintViewerProd + HintViewerApiProd stacks
make infra-all    # deploy all four stacks
```

### Broadcaster Site

```bash
make deploy-dev   # build (dev-aws mode) + sync to S3 + invalidate CloudFront
make deploy-prod  # build (prod-aws mode) + sync to S3 + invalidate CloudFront
```

Build only (without deploying):

```bash
make build-dev
make build-prod
```

### Extension

```bash
make bundle-dev   # produces extension/hint-viewer-bundle-dev.zip
make bundle-prod  # produces extension/hint-viewer-bundle-prod.zip
```

Upload the zip to the Twitch developer console.

## Helpers

```bash
make outputs-dev   # print CloudFormation stack outputs for dev
make outputs-prod  # print CloudFormation stack outputs for prod
```

## Emergency Kill Switch

Throttles the prod read Lambdas to stop costs immediately. API returns 429 while off.

```bash
make lambda-off-prod   # set reserved concurrency to 0
make lambda-on-prod    # restore concurrency
```

## Architecture

```
Broadcaster Site  ──POST/DELETE──►  API Gateway  ──►  Lambda  ──►  DynamoDB
(S3 + CloudFront)                                                      ▲
                                                                       │
Extension Panel   ──GET (poll)──►   API Gateway  ──►  Lambda  ─────────┘
(Twitch hosted)
```
