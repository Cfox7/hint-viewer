from decimal import Decimal


def floats_to_decimals(obj):
    """Recursively convert floats to Decimals for DynamoDB storage."""
    if isinstance(obj, float):
        return Decimal(str(obj))
    elif isinstance(obj, dict):
        return {k: floats_to_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [floats_to_decimals(i) for i in obj]
    return obj


def decimals_to_floats(obj):
    """Recursively convert Decimals back to ints/floats for JSON serialization."""
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    elif isinstance(obj, dict):
        return {k: decimals_to_floats(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [decimals_to_floats(i) for i in obj]
    return obj
