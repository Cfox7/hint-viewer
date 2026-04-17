include .env.make

BROADCASTER_DIR = broadcaster-site
export AWS_PAGER =

# ── Infrastructure ────────────────────────────────────────────────────────────

infra-dev:
	cd infra && cdk deploy HintViewerDev HintViewerApiDev

infra-prod:
	cd infra && cdk deploy HintViewerProd HintViewerApiProd

infra-all:
	cd infra && cdk deploy --all

# ── Build ─────────────────────────────────────────────────────────────────────

build-dev:
	cd $(BROADCASTER_DIR) && npm run build -- --mode dev-aws

build-prod:
	cd $(BROADCASTER_DIR) && npm run build -- --mode prod-aws

# ── Deploy site ───────────────────────────────────────────────────────────────

deploy-dev: build-dev
	aws s3 sync $(BROADCASTER_DIR)/dist/ s3://$(DEV_BUCKET) --delete
	aws cloudfront create-invalidation --distribution-id $(DEV_CF_DISTRIBUTION) --paths "/*"
	@echo "Deployed to dev: https://$(DEV_CF_DOMAIN)"

deploy-prod: build-prod
	aws s3 sync $(BROADCASTER_DIR)/dist/ s3://$(PROD_BUCKET) --delete
	aws cloudfront create-invalidation --distribution-id $(PROD_CF_DISTRIBUTION) --paths "/*"
	@echo "Deployed to prod: https://$(PROD_CF_DOMAIN)"

# ── Helpers ───────────────────────────────────────────────────────────────────

outputs-dev:
	aws cloudformation describe-stacks --stack-name HintViewerDev --query "Stacks[0].Outputs"

outputs-prod:
	aws cloudformation describe-stacks --stack-name HintViewerProd --query "Stacks[0].Outputs"

# ── Emergency kill switch (throttle read Lambdas to stop costs instantly) ────
# Usage: make lambda-off-prod  /  make lambda-on-prod

lambda-off-prod:
	aws lambda put-function-concurrency --function-name HintViewerApiProd-GetSpoiler5E60ECB0-4tmrgJq7VwQa --reserved-concurrent-executions 0
	aws lambda put-function-concurrency --function-name HintViewerApiProd-GetHints58039557-UqyfNeEYcoHI --reserved-concurrent-executions 0
	@echo "Prod read Lambdas throttled to 0 — API returns 429"

lambda-on-prod:
	aws lambda delete-function-concurrency --function-name HintViewerApiProd-GetSpoiler5E60ECB0-4tmrgJq7VwQa
	aws lambda delete-function-concurrency --function-name HintViewerApiProd-GetHints58039557-UqyfNeEYcoHI
	@echo "Prod read Lambdas restored"

.PHONY: infra-dev infra-prod infra-all build-dev build-prod deploy-dev deploy-prod outputs-dev outputs-prod lambda-off-prod lambda-on-prod
