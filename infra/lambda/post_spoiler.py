import json
import os
from datetime import datetime, timezone

import boto3

from auth import verify_token
from utils import floats_to_decimals

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

    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Invalid JSON"}),
        }

    if not body:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Missing spoiler data"}),
        }

    hint_fields = ["Wrinkly Hints"]

    hints = {key: body[key] for key in hint_fields if key in body}
    if not hints:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "No recognized hint data in spoiler"}),
        }

    uploaded_at = datetime.now(timezone.utc).isoformat()
    table = dynamodb.Table(TABLE_NAME)
    table.put_item(Item={
        "channelId": channel_id,
        "spoilerData": floats_to_decimals(hints),
        "uploadedAt": uploaded_at,
        "revealedHints": [],
    })

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"ok": True, "uploadedAt": uploaded_at}),
    }
