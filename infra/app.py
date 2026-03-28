#!/usr/bin/env python3
import os

import aws_cdk as cdk

from infra.infra_stack import StaticSiteStack


app = cdk.App()

StaticSiteStack(app, "HintViewerDev",
    environment="dev",
    env=cdk.Environment(account=os.getenv('CDK_DEFAULT_ACCOUNT'), region=os.getenv('CDK_DEFAULT_REGION')),
)

StaticSiteStack(app, "HintViewerProd",
    environment="prod",
    env=cdk.Environment(account=os.getenv('CDK_DEFAULT_ACCOUNT'), region=os.getenv('CDK_DEFAULT_REGION')),
)

app.synth()

app.synth()
