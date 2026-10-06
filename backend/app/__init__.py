import os

from flask import Flask

from app.api import register_blueprints
from app.api.errors import register_error_handlers
from app.cli import register_cli
from app.extensions import db, migrate


def create_app(config_override: dict | None = None) -> Flask:
    app = Flask(__name__)
    app.config["UPLOAD_FOLDER"] = os.environ.get("UPLOAD_FOLDER", "uploads")
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "sqlite:///dev.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    # Validate pooled connections before use so stale/dropped sockets
    # (idle timeouts on load balancers, Postgres restarts) are detected
    # and recycled transparently rather than surfacing as a 500 on the
    # first unlucky request.
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"pool_pre_ping": True}

    if config_override:
        app.config.update(config_override)

    db.init_app(app)
    migrate.init_app(app, db)

    from app import models  # noqa: F401

    register_blueprints(app)
    register_error_handlers(app)
    register_cli(app)
    return app
