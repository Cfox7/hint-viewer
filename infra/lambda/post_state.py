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
    if not channel_id:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Missing channelId"}),
        }

    updates = []
    values = {}

    if "revealedHints" in body:
        if not isinstance(body["revealedHints"], list):
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "revealedHints must be a list"}),
            }
        updates.append("revealedHints = :revealed")
        values[":revealed"] = body["revealedHints"]

    if "completedHints" in body:
        if not isinstance(body["completedHints"], list):
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "completedHints must be a list"}),
            }
        updates.append("completedHints = :completed")
        values[":completed"] = body["completedHints"]

    if "hintedItems" in body:
        if not isinstance(body["hintedItems"], dict):
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "hintedItems must be a dict"}),
            }
        updates.append("hintedItems = :hinted")
        values[":hinted"] = body["hintedItems"]

    if "shopTracker" in body:
        if not isinstance(body["shopTracker"], dict):
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "shopTracker must be a dict"}),
            }
        updates.append("shopTracker = :shop")
        values[":shop"] = body["shopTracker"]

    if not updates:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "No valid fields to update"}),
        }

    table = dynamodb.Table(TABLE_NAME)
    table.update_item(
        Key={"channelId": channel_id},
        UpdateExpression="SET " + ", ".join(updates),
        ExpressionAttributeValues=values,
    )

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"ok": True}),
    }
