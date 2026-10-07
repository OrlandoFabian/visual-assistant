import os
import time
import uuid

from flask import Flask, Response, g, request

from app.api import register_blueprints
from app.api.errors import register_error_handlers
from app.cli import register_cli
from app.extensions import db, limiter, migrate
from app.logging_config import configure_logging


def create_app(config_override: dict | None = None) -> Flask:
    app = Flask(__name__)
    app.config["UPLOAD_FOLDER"] = os.environ.get("UPLOAD_FOLDER", "uploads")
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "sqlite:///dev.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    engine_options: dict = {"pool_pre_ping": True}
    if not app.config["SQLALCHEMY_DATABASE_URI"].startswith("sqlite"):
        engine_options["pool_size"] = 20
        engine_options["max_overflow"] = 10
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = engine_options
    app.config["RATELIMIT_HEADERS_ENABLED"] = True

    if config_override:
        app.config.update(config_override)

    db.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)
    if app.config.get("TESTING"):
        limiter.enabled = False

    from app import models  # noqa: F401

    register_blueprints(app)
    register_error_handlers(app)
    register_cli(app)
    _register_request_id(app)

    if not app.config.get("TESTING"):
        configure_logging(app)

    return app


def _register_request_id(app: Flask) -> None:

    @app.before_request
    def _assign_request_id() -> None:
        incoming = request.headers.get("X-Request-ID")
        g.request_id = incoming if incoming else uuid.uuid4().hex
        g.request_start_ms = time.monotonic()

    @app.after_request
    def _finish_request(response: Response) -> Response:
        rid = getattr(g, "request_id", None)
        if rid:
            response.headers["X-Request-ID"] = rid
        start = getattr(g, "request_start_ms", None)
        duration_ms = round((time.monotonic() - start) * 1000, 1) if start else None
        app.logger.info(
            "request",
            extra={
                "method": request.method,
                "path": request.path,
                "status": response.status_code,
                "duration_ms": duration_ms,
            },
        )
        return response
