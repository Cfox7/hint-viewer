import os

import aws_cdk as cdk
from aws_cdk import (
    aws_dynamodb as dynamodb,
    aws_lambda as lambda_,
    aws_apigatewayv2 as apigatewayv2,
    aws_apigatewayv2_integrations as integrations,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
)
from constructs import Construct


class ApiStack(cdk.Stack):

    def __init__(self, scope: Construct, construct_id: str, environment: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        table = dynamodb.Table(
            self, "HintViewerTable",
            table_name=f"hint-viewer-{environment}",
            partition_key=dynamodb.Attribute(name="channelId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=cdk.RemovalPolicy.DESTROY if environment == "dev" else cdk.RemovalPolicy.RETAIN,
        )

        lambda_env = {
            "TABLE_NAME": table.table_name,
            "TWITCH_CLIENT_ID": "nbgm3tlff6yg3labvl73y4cnztkxyj",
        }

        lambda_dir = os.path.join(os.path.dirname(__file__), "..", "lambda")

        def make_fn(name: str, handler_file: str) -> lambda_.Function:
            fn = lambda_.Function(
                self, name,
                runtime=lambda_.Runtime.PYTHON_3_12,
                handler=f"{handler_file}.handler",
                code=lambda_.Code.from_asset(lambda_dir),
                environment=lambda_env,
            )
            table.grant_read_write_data(fn)
            return fn

        get_state_fn = make_fn("GetState", "get_state")
        post_state_fn = make_fn("PostState", "post_state")
        post_spoiler_fn = make_fn("PostSpoiler", "post_spoiler")
        delete_spoiler_fn = make_fn("DeleteSpoiler", "delete_spoiler")
        delete_revealed_hints_fn = make_fn("DeleteRevealedHints", "delete_revealed_hints")

        api = apigatewayv2.HttpApi(
            self, "HintViewerApi",
            api_name=f"hint-viewer-{environment}",
            cors_preflight=apigatewayv2.CorsPreflightOptions(
                allow_origins=["*"],
                allow_methods=[apigatewayv2.CorsHttpMethod.ANY],
                allow_headers=["Content-Type", "Authorization"],
            ),
        )

        api.add_routes(
            path="/api/state/{channelId}",
            methods=[apigatewayv2.HttpMethod.GET],
            integration=integrations.HttpLambdaIntegration("GetStateInt", get_state_fn),
        )
        api.add_routes(
            path="/api/state/{channelId}",
            methods=[apigatewayv2.HttpMethod.POST],
            integration=integrations.HttpLambdaIntegration("PostStateInt", post_state_fn),
        )
        api.add_routes(
            path="/api/spoiler/{channelId}",
            methods=[apigatewayv2.HttpMethod.POST],
            integration=integrations.HttpLambdaIntegration("PostSpoilerInt", post_spoiler_fn),
        )
        api.add_routes(
            path="/api/spoiler/{channelId}",
            methods=[apigatewayv2.HttpMethod.DELETE],
            integration=integrations.HttpLambdaIntegration("DeleteSpoilerInt", delete_spoiler_fn),
        )
        api.add_routes(
            path="/api/hints/{channelId}",
            methods=[apigatewayv2.HttpMethod.DELETE],
            integration=integrations.HttpLambdaIntegration("DeleteRevealedHintsInt", delete_revealed_hints_fn),
        )

        cdk.CfnOutput(self, "ApiUrl", value=api.api_endpoint)

        # CloudFront in front of API Gateway — caches GET responses for 10s
        # Authorization must live in the CachePolicy (not OriginRequestPolicy) per CloudFront rules.
        cache_policy = cloudfront.CachePolicy(
            self, "ApiCachePolicy",
            default_ttl=cdk.Duration.seconds(10),
            min_ttl=cdk.Duration.seconds(0),
            max_ttl=cdk.Duration.seconds(30),
            cookie_behavior=cloudfront.CacheCookieBehavior.none(),
            header_behavior=cloudfront.CacheHeaderBehavior.allow_list("Authorization"),
            query_string_behavior=cloudfront.CacheQueryStringBehavior.none(),
        )

        # Forward Content-Type so POST body is correctly interpreted by API Gateway
        origin_request_policy = cloudfront.OriginRequestPolicy(
            self, "ApiOriginRequestPolicy",
            header_behavior=cloudfront.OriginRequestHeaderBehavior.allow_list("Content-Type"),
            cookie_behavior=cloudfront.OriginRequestCookieBehavior.none(),
            query_string_behavior=cloudfront.OriginRequestQueryStringBehavior.none(),
        )

        # CloudFront injects CORS headers into every response — no need to forward Origin to API GW
        response_headers_policy = cloudfront.ResponseHeadersPolicy(
            self, "ApiResponseHeadersPolicy",
            cors_behavior=cloudfront.ResponseHeadersCorsBehavior(
                access_control_allow_credentials=False,
                access_control_allow_headers=["Authorization", "Content-Type"],
                access_control_allow_methods=["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE"],
                access_control_allow_origins=["*"],
                origin_override=True,
            ),
        )

        api_domain = f"{api.api_id}.execute-api.{self.region}.amazonaws.com"

        api_distribution = cloudfront.Distribution(
            self, "ApiDistribution",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.HttpOrigin(
                    api_domain,
                    protocol_policy=cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
                ),
                allowed_methods=cloudfront.AllowedMethods.ALLOW_ALL,
                cached_methods=cloudfront.CachedMethods.CACHE_GET_HEAD,
                cache_policy=cache_policy,
                origin_request_policy=origin_request_policy,
                response_headers_policy=response_headers_policy,
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            ),
        )

        cdk.CfnOutput(self, "ApiCfUrl", value=f"https://{api_distribution.distribution_domain_name}")
