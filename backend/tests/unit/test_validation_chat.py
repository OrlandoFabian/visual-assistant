import pytest

from app.validation.chat import ChatValidationError, validate_chat_prompt


def test_accepts_valid_prompt():
    assert validate_chat_prompt({"prompt": "Hello"}) == "Hello"


def test_strips_whitespace():
    assert validate_chat_prompt({"prompt": "  hi  "}) == "hi"


def test_rejects_missing_body():
    with pytest.raises(ChatValidationError) as exc:
        validate_chat_prompt(None)
    assert exc.value.code == "missing_prompt"


def test_rejects_missing_prompt_field():
    with pytest.raises(ChatValidationError) as exc:
        validate_chat_prompt({})
    assert exc.value.code == "missing_prompt"


def test_rejects_non_string_prompt():
    with pytest.raises(ChatValidationError) as exc:
        validate_chat_prompt({"prompt": 123})
    assert exc.value.code == "invalid_prompt"


def test_rejects_empty_prompt():
    with pytest.raises(ChatValidationError) as exc:
        validate_chat_prompt({"prompt": "   "})
    assert exc.value.code == "invalid_prompt"


def test_rejects_too_long_prompt():
    with pytest.raises(ChatValidationError) as exc:
        validate_chat_prompt({"prompt": "x" * 5000})
    assert exc.value.code == "prompt_too_long"
