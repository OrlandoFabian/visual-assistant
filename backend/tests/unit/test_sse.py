import json

from app.utils.sse import SSE_DONE, format_sse_error, format_sse_event, format_sse_retry


def test_sse_done_sentinel():
    assert SSE_DONE == "data: [DONE]\n\n"


def test_format_event_emits_named_event_with_json_payload():
    result = format_sse_event("response.output_text.delta", {"delta": "hi"})
    lines = result.rstrip("\n").split("\n")
    assert lines[0] == "event: response.output_text.delta"
    assert lines[1].startswith("data: ")
    assert result.endswith("\n\n")
    payload = json.loads(lines[1][len("data: "):])
    assert payload == {"delta": "hi"}


def test_format_error_matches_openai_shape():
    result = format_sse_error("something broke", code="server_error")
    lines = result.rstrip("\n").split("\n")
    assert lines[0] == "event: error"
    payload = json.loads(lines[1][len("data: "):])
    assert payload == {
        "error": {
            "message": "something broke",
            "type": "server_error",
            "code": "server_error",
        }
    }


def test_format_retry_emits_retry_field():
    assert format_sse_retry(3000) == "retry: 3000\n\n"
