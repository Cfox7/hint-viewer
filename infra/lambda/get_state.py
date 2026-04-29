import json
import os

import boto3

from utils import decimals_to_floats

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
        "body": json.dumps({
            "game": item.get("game") if item else None,
            "spoilerData": decimals_to_floats(item.get("spoilerData")) if item else None,
            "uploadedAt": item.get("uploadedAt") if item else None,
            "revealed": item.get("revealedHints", []) if item else [],
            "completed": item.get("completedHints", []) if item else [],
            "hinted": item.get("hintedItems", {}) if item else {},
        }),
    }
