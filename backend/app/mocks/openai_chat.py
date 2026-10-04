import random
import re
import secrets
import time
from collections.abc import Iterator


def mock_openai_chat(
    prompt: str, image_id: str, history: list | None = None
) -> dict:
    time.sleep(0.2)
    reply = _compose_reply(prompt, image_id, history)
    prompt_tokens = _estimate_tokens(prompt)
    completion_tokens = _estimate_tokens(reply)
    return {
        "id": f"chatcmpl-{secrets.token_urlsafe(8)}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": "mock-gpt-4o",
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": reply},
                "finish_reason": "stop",
            }
        ],
        "usage": {
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
        },
    }


def mock_openai_chat_stream(
    prompt: str, image_id: str, history: list | None = None
) -> Iterator[dict]:
    completion_id = f"chatcmpl-{secrets.token_urlsafe(8)}"
    created = int(time.time())
    model = "mock-gpt-4o"
    response_text = _compose_reply(prompt, image_id, history)

    yield _chunk(completion_id, created, model, delta={"role": "assistant"})

    for token in _tokenize(response_text):
        time.sleep(random.uniform(0.03, 0.08))
        yield _chunk(completion_id, created, model, delta={"content": token})

    yield _chunk(completion_id, created, model, delta={}, finish_reason="stop")


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


def _chunk(
    completion_id: str,
    created: int,
    model: str,
    delta: dict,
    finish_reason: str | None = None,
) -> dict:
    return {
        "id": completion_id,
        "object": "chat.completion.chunk",
        "created": created,
        "model": model,
        "choices": [
            {
                "index": 0,
                "delta": delta,
                "finish_reason": finish_reason,
            }
        ],
    }


def _tokenize(text: str) -> list[str]:
    return re.findall(r"\S+\s*|\s+", text)
