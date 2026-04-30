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
    completed_hints = body.get("completedHints")
    hinted_hints = body.get("hintedItems", {})

    if not channel_id or not isinstance(revealed_hints, list) or not isinstance(completed_hints, list) or not isinstance(hinted_hints, dict):
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Invalid payload"}),
        }

    table = dynamodb.Table(TABLE_NAME)
    table.update_item(
        Key={"channelId": channel_id},
        UpdateExpression="SET revealedHints = :revealed, completedHints = :completed, hintedItems = :hinted",
        ExpressionAttributeValues={
            ":revealed": revealed_hints,
            ":completed": completed_hints,
            ":hinted": hinted_hints,
        },
    )

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"ok": True}),
    }
