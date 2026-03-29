import os

import aws_cdk as cdk
from aws_cdk import (
    aws_dynamodb as dynamodb,
    aws_lambda as lambda_,
    aws_apigatewayv2 as apigatewayv2,
    aws_apigatewayv2_integrations as integrations,
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

        get_spoiler_fn = make_fn("GetSpoiler", "get_spoiler")
        post_spoiler_fn = make_fn("PostSpoiler", "post_spoiler")
        delete_spoiler_fn = make_fn("DeleteSpoiler", "delete_spoiler")
        get_hints_fn = make_fn("GetHints", "get_hints")
        post_revealed_hints_fn = make_fn("PostRevealedHints", "post_revealed_hints")
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
            path="/api/spoiler/{channelId}",
            methods=[apigatewayv2.HttpMethod.GET],
            integration=integrations.HttpLambdaIntegration("GetSpoilerInt", get_spoiler_fn),
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
            methods=[apigatewayv2.HttpMethod.GET],
            integration=integrations.HttpLambdaIntegration("GetHintsInt", get_hints_fn),
        )
        api.add_routes(
            path="/api/hints/{channelId}",
            methods=[apigatewayv2.HttpMethod.DELETE],
            integration=integrations.HttpLambdaIntegration("DeleteRevealedHintsInt", delete_revealed_hints_fn),
        )
        # Note: /api/hints/reveal is more specific and will be matched before /api/hints/{channelId}
        api.add_routes(
            path="/api/hints/reveal",
            methods=[apigatewayv2.HttpMethod.POST],
            integration=integrations.HttpLambdaIntegration("PostRevealedHintsInt", post_revealed_hints_fn),
        )

        cdk.CfnOutput(self, "ApiUrl", value=api.api_endpoint)
