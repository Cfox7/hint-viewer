import aws_cdk as cdk
from aws_cdk import (
    aws_s3 as s3,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_certificatemanager as acm,
    aws_route53 as route53,
    aws_route53_targets as targets,
)
from constructs import Construct

PROD_CERT_ARN = "arn:aws:acm:us-east-1:900977800708:certificate/1301568c-8ea7-44ba-8a49-a9b41421379d"
PROD_DOMAIN = "hintviewer.com"

DEV_CERT_ARN = "arn:aws:acm:us-east-1:900977800708:certificate/1fdd9e40-ed8a-40d6-ad7e-37cd8fc03313"
DEV_DOMAIN = "dev.hintviewer.com"


class StaticSiteStack(cdk.Stack):

    def __init__(self, scope: Construct, construct_id: str, environment: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        bucket = s3.Bucket(
            self, "SiteBucket",
            bucket_name=f"hint-viewer-{environment}-site",
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            removal_policy=cdk.RemovalPolicy.DESTROY if environment == "dev" else cdk.RemovalPolicy.RETAIN,
            auto_delete_objects=environment == "dev",
        )

        distribution_kwargs = dict(
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3BucketOrigin.with_origin_access_control(bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            ),
            default_root_object="index.html",
            error_responses=[
                cloudfront.ErrorResponse(
                    http_status=403,
                    response_http_status=200,
                    response_page_path="/index.html",
                ),
                cloudfront.ErrorResponse(
                    http_status=404,
                    response_http_status=200,
                    response_page_path="/index.html",
                ),
            ],
        )

        if environment == "prod":
            cert = acm.Certificate.from_certificate_arn(self, "Cert", PROD_CERT_ARN)
            distribution_kwargs["domain_names"] = [PROD_DOMAIN, f"www.{PROD_DOMAIN}"]
            distribution_kwargs["certificate"] = cert
        elif environment == "dev":
            cert = acm.Certificate.from_certificate_arn(self, "Cert", DEV_CERT_ARN)
            distribution_kwargs["domain_names"] = [DEV_DOMAIN]
            distribution_kwargs["certificate"] = cert

        distribution = cloudfront.Distribution(self, "SiteDistribution", **distribution_kwargs)

        if environment == "prod":
            zone = route53.HostedZone.from_lookup(self, "Zone", domain_name=PROD_DOMAIN)
            route53.ARecord(
                self, "AliasRecord",
                zone=zone,
                target=route53.RecordTarget.from_alias(targets.CloudFrontTarget(distribution)),
            )
            route53.ARecord(
                self, "WwwAliasRecord",
                zone=zone,
                record_name="www",
                target=route53.RecordTarget.from_alias(targets.CloudFrontTarget(distribution)),
            )
        elif environment == "dev":
            zone = route53.HostedZone.from_lookup(self, "Zone", domain_name=PROD_DOMAIN)
            route53.ARecord(
                self, "DevAliasRecord",
                zone=zone,
                record_name="dev",
                target=route53.RecordTarget.from_alias(targets.CloudFrontTarget(distribution)),
            )

        cdk.CfnOutput(self, "BucketName", value=bucket.bucket_name)
        cdk.CfnOutput(self, "DistributionId", value=distribution.distribution_id)
        cdk.CfnOutput(self, "DistributionUrl", value=f"https://{distribution.distribution_domain_name}")
