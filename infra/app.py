#!/usr/bin/env python3
import os

import aws_cdk as cdk

from infra.infra_stack import StaticSiteStack
from infra.api_stack import ApiStack


app = cdk.App()

env = cdk.Environment(account=os.getenv('CDK_DEFAULT_ACCOUNT'), region=os.getenv('CDK_DEFAULT_REGION'))

StaticSiteStack(app, "HintViewerDev", environment="dev", env=env)
StaticSiteStack(app, "HintViewerProd", environment="prod", env=env)

ApiStack(app, "HintViewerApiDev", environment="dev", env=env)
ApiStack(app, "HintViewerApiProd", environment="prod", env=env)

app.synth()
