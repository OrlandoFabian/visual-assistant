import json
from typing import Any

SSE_DONE = "data: [DONE]\n\n"


def format_sse_event(event: str, payload: dict[str, Any]) -> str:
    return f"event: {event}\ndata: {json.dumps(payload)}\n\n"


def format_sse_error(message: str, code: str = "server_error") -> str:
    error = {
        "error": {
            "message": message,
            "type": "server_error",
            "code": code,
        }
    }
    return f"event: error\ndata: {json.dumps(error)}\n\n"


def format_sse_retry(ms: int) -> str:
    return f"retry: {ms}\n\n"
