import json
import os

import boto3

dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ["TABLE_NAME"]


def handler(event, context):
    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Invalid JSON"}),
        }

    channel_id = body.get("channelId")
    revealed_hints = body.get("revealedHints")

    if not channel_id or not isinstance(revealed_hints, list):
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Invalid payload"}),
        }

    table = dynamodb.Table(TABLE_NAME)
    table.update_item(
        Key={"channelId": channel_id},
        UpdateExpression="SET revealedHints = :hints",
        ExpressionAttributeValues={":hints": revealed_hints},
    )

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"ok": True}),
    }
