import json
import os

import boto3

dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ["TABLE_NAME"]


def handler(event, context):
    channel_id = event["pathParameters"]["channelId"]

    table = dynamodb.Table(TABLE_NAME)
    table.update_item(
        Key={"channelId": channel_id},
        UpdateExpression="SET revealedHints = :empty, completedHints = :empty",
        ExpressionAttributeValues={":empty": []},
    )

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"ok": True}),
    }
