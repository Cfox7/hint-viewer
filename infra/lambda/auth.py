import json
import os
import urllib.request
import urllib.error

TWITCH_CLIENT_ID = os.environ["TWITCH_CLIENT_ID"]


def verify_token(headers: dict, expected_channel_id: str) -> bool:
    """Return True if the Bearer token in headers belongs to expected_channel_id."""
    auth_header = headers.get("authorization") or headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return False

    token = auth_header.split(" ", 1)[1]

    req = urllib.request.Request(
        "https://api.twitch.tv/helix/users",
        headers={
            "Authorization": f"Bearer {token}",
            "Client-Id": TWITCH_CLIENT_ID,
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read())
            users = data.get("data", [])
            if not users:
                return False
            return users[0]["id"] == expected_channel_id
    except Exception:
        return False
