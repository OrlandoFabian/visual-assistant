import pytest

from app import create_app


@pytest.fixture()
def app():
    app = create_app()
    app.config.update(TESTING=True)
    yield app


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture(autouse=True)
def _clear_repos():
    from app.repositories.history_repo import history_repo
    from app.repositories.image_repo import image_repo

    image_repo.clear_all()
    history_repo.clear_all()
    yield
