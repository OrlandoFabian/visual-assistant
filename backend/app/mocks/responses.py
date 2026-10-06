import time

MOCK_MODEL = "mock-gpt-4o"


def build_response(
    *,
    response_id: str,
    message_id: str,
    text: str,
    input_tokens: int,
    output_tokens: int,
    model: str = MOCK_MODEL,
) -> dict:
    return {
        "id": response_id,
        "object": "response",
        "created_at": int(time.time()),
        "status": "completed",
        "model": model,
        "output": [
            {
                "id": message_id,
                "type": "message",
                "role": "assistant",
                "status": "completed",
                "content": [
                    {
                        "type": "output_text",
                        "text": text,
                        "annotations": [],
                    }
                ],
            }
        ],
        "usage": {
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_tokens": input_tokens + output_tokens,
        },
    }


def extract_text(response: dict) -> str:
    text = response["output"][0]["content"][0]["text"]
    assert isinstance(text, str)
    return text
