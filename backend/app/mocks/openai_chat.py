import random
import secrets
import time
from collections.abc import Iterator

from app.mocks.responses import MOCK_MODEL, build_response


def mock_openai_chat(
    prompt: str, image_id: str, history: list | None = None
) -> dict:
    time.sleep(0.2)
    reply = _compose_reply(prompt, image_id, history)
    return build_response(
        response_id=f"resp_{secrets.token_urlsafe(8)}",
        message_id=f"msg_{secrets.token_urlsafe(8)}",
        text=reply,
        input_tokens=_estimate_tokens(prompt),
        output_tokens=_estimate_tokens(reply),
    )


def mock_openai_chat_stream(
    prompt: str, image_id: str, history: list | None = None
) -> Iterator[tuple[str, dict]]:
    response_id = f"resp_{secrets.token_urlsafe(8)}"
    message_id = f"msg_{secrets.token_urlsafe(8)}"
    text = _compose_reply(prompt, image_id, history)

    yield (
        "response.created",
        {
            "type": "response.created",
            "response": {
                "id": response_id,
                "object": "response",
                "status": "in_progress",
                "model": MOCK_MODEL,
                "output": [],
            },
        },
    )

    buffered = ""
    for token in _tokenize(text):
        time.sleep(random.uniform(0.03, 0.08))
        buffered += token
        yield (
            "response.output_text.delta",
            {
                "type": "response.output_text.delta",
                "item_id": message_id,
                "output_index": 0,
                "content_index": 0,
                "delta": token,
            },
        )

    completed = build_response(
        response_id=response_id,
        message_id=message_id,
        text=buffered,
        input_tokens=_estimate_tokens(prompt),
        output_tokens=_estimate_tokens(buffered),
    )
    yield (
        "response.completed",
        {"type": "response.completed", "response": completed},
    )


def _compose_reply(prompt: str, image_id: str, history: list | None) -> str:
    turn = (len(history) // 2) + 1 if history else 1
    prefix = f"[Turn {turn}] " if turn > 1 else ""
    return (
        f"{prefix}Regarding image {image_id}: based on the mock vision analysis, "
        f"here is my response to your question. You asked: '{prompt}'. "
        "A real vision-capable model would answer with actual observations "
        "about the image content."
    )


def _estimate_tokens(text: str) -> int:
    return max(1, len(text) // 4)


def _tokenize(text: str) -> list[str]:
    import re

    return re.findall(r"\S+\s*|\s+", text)
