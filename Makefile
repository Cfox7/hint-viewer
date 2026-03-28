include .env.make

BROADCASTER_DIR = broadcaster-site

# ── Infrastructure ────────────────────────────────────────────────────────────

infra-dev:
	cd infra && cdk deploy HintViewerDev

infra-prod:
	cd infra && cdk deploy HintViewerProd

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

.PHONY: infra-dev infra-prod infra-all build-dev build-prod deploy-dev deploy-prod outputs-dev outputs-prod
