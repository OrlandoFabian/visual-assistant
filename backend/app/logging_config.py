"""Structured JSON logging for the Flask app.

Emits one JSON object per log line to stdout so container log collectors
(docker, Loki, CloudWatch, Datadog) can parse them without regex. Every
line carries a request_id when one is in scope, so a single HTTP request
can be grep'd end-to-end across layers.

"""

from __future__ import annotations

import json
import logging
import sys
from datetime import UTC, datetime
from typing import Any

from flask import Flask, g, has_request_context

_BASE_KEYS = ("timestamp", "level", "logger", "message", "request_id")


class JsonFormatter(logging.Formatter):
    """Emit each record as a one-line JSON object."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.now(UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": getattr(record, "request_id", None),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        for key, value in record.__dict__.items():
            if key in payload or key.startswith("_"):
                continue
            if key in (
                "args", "asctime", "created", "exc_info", "exc_text", "filename",
                "funcName", "levelname", "levelno", "lineno", "module", "msecs",
                "message", "msg", "name", "pathname", "process", "processName",
                "relativeCreated", "stack_info", "thread", "threadName",
                "taskName",
            ):
                continue
            payload[key] = value
        ordered = {k: payload[k] for k in _BASE_KEYS if k in payload}
        ordered.update({k: v for k, v in payload.items() if k not in ordered})
        return json.dumps(ordered, default=str)


class _RequestIdFilter(logging.Filter):
    """Attach g.request_id to every record if we're inside a request."""

    def filter(self, record: logging.LogRecord) -> bool:
        if has_request_context():
            record.request_id = getattr(g, "request_id", None)
        else:
            record.request_id = None
        return True


def configure_logging(app: Flask) -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    handler.addFilter(_RequestIdFilter())
    app.logger.handlers.clear()
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)
    app.logger.propagate = False
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(logging.INFO)
