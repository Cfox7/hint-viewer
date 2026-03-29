# DK64 Randomizer Hint Viewer

Twitch extension + broadcaster site for DK64 Randomizer hint viewing. Hosted on AWS (S3 + CloudFront + API Gateway + Lambda + DynamoDB).

## Structure

- **extension/** — Twitch extension panel and config page (viewers)
- **broadcaster-site/** — Web app for uploading spoiler logs (broadcasters)
- **infra/** — AWS CDK infrastructure (Python)
- **shared/** — Shared TypeScript types

## Local Development

### Broadcaster site

```bash
cd broadcaster-site
npm install
npm run dev
```

Runs on `http://localhost:5173` against `http://localhost:3000` by default.

### Extension

```bash
cd extension
npm install
npm run build:serve   # builds then serves dist/ on port 8081
```

Point ngrok at port 8081 and set that URL as the Asset Hosting URL in the Twitch developer console.

## AWS Deployment

Requires AWS CLI configured and CDK bootstrapped (`cd infra && cdk bootstrap`).

### Infrastructure (first time or after stack changes)

```bash
make infra-dev    # deploy HintViewerDev + HintViewerApiDev stacks
make infra-prod   # deploy HintViewerProd + HintViewerApiProd stacks
make infra-all    # deploy all four stacks
```

### Broadcaster site

```bash
make deploy-dev   # build with dev-aws env + sync to S3 + invalidate CloudFront
make deploy-prod  # build with prod-aws env + sync to S3 + invalidate CloudFront
```

### Extension

```bash
cd extension
./zip_assets.sh   # builds and produces hint-viewer-bundle.zip
```

Upload `hint-viewer-bundle.zip` to the Twitch developer console.

## Architecture

```
Broadcaster Site  ──POST/DELETE──►  API Gateway  ──►  Lambda  ──►  DynamoDB
(S3 + CloudFront)                                                      ▲
                                                                       │
Extension Panel   ──GET (poll 10s)──►  API Gateway  ──►  Lambda  ──────┘
(Twitch hosted)
```

