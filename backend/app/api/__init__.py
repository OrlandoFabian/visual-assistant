"""HTTP routes (blueprints) for the API."""

from flask import Flask

from app.api.health import health_bp
from app.api.images import images_bp


def register_blueprints(app: Flask) -> None:
    app.register_blueprint(health_bp)
    app.register_blueprint(images_bp)
