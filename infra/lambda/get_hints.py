import json
import os

import boto3

dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ["TABLE_NAME"]


def handler(event, context):
    channel_id = event["pathParameters"]["channelId"]

    table = dynamodb.Table(TABLE_NAME)
    response = table.get_item(Key={"channelId": channel_id})
    item = response.get("Item")

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"revealed": item.get("revealedHints", []) if item else []}),
    }
