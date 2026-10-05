import os

from flask import Flask

from app.api import register_blueprints
from app.api.errors import register_error_handlers
from app.extensions import db, migrate


def create_app(config_override: dict | None = None) -> Flask:
    app = Flask(__name__)
    app.config["UPLOAD_FOLDER"] = os.environ.get("UPLOAD_FOLDER", "uploads")
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "sqlite:///dev.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    if config_override:
        app.config.update(config_override)

    db.init_app(app)
    migrate.init_app(app, db)

    from app import models  # noqa: F401

    register_blueprints(app)
    register_error_handlers(app)
    return app
