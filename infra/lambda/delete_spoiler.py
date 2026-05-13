import json
import os

import boto3

from auth import verify_token

dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ["TABLE_NAME"]


def handler(event, context):
    channel_id = event["pathParameters"]["channelId"]
    headers = event.get("headers") or {}

    if not verify_token(headers, channel_id):
        return {
            "statusCode": 401,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Unauthorized"}),
        }

    body = json.loads(event.get("body") or "{}")

    table = dynamodb.Table(TABLE_NAME)
    table.update_item(
        Key={"channelId": channel_id},
        UpdateExpression="REMOVE spoilerData, uploadedAt, revealedHints, completedHints, hintedItems SET game = :g",
        ExpressionAttributeValues={":g": body.get("game")},
    )

    return {"statusCode": 204, "body": ""}
