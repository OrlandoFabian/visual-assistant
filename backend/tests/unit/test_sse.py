import json

from app.utils.sse import SSE_DONE, format_sse_chunk, format_sse_error, format_sse_retry


def test_sse_done_sentinel():
    assert SSE_DONE == "data: [DONE]\n\n"


def test_format_chunk_wraps_json_payload():
    result = format_sse_chunk({"a": 1, "b": "hi"})
    assert result.startswith("data: ")
    assert result.endswith("\n\n")
    payload = json.loads(result[len("data: "): -2])
    assert payload == {"a": 1, "b": "hi"}


def test_format_error_matches_openai_shape():
    result = format_sse_error("something broke", code="server_error")
    payload = json.loads(result[len("data: "): -2])
    assert payload == {
        "error": {
            "message": "something broke",
            "type": "server_error",
            "code": "server_error",
        }
    }


def test_format_retry_emits_retry_field():
    assert format_sse_retry(3000) == "retry: 3000\n\n"
