"""Flask CLI commands for operational tasks.

These are kept out of the Flask request path on purpose: scheduled work
belongs with the ops layer (cron, Kubernetes CronJob, Celery beat), not
inside the gunicorn worker that serves user traffic. The commands here
are the reusable actions that any of those schedulers can invoke.
"""

import click
from flask import Flask
from flask.cli import AppGroup

from app.repositories import history_repo

retention_cli = AppGroup("retention", help="Chat-history retention commands.")


@retention_cli.command("prune")
@click.option(
    "--days",
    type=int,
    required=True,
    help="Delete chat messages older than this many days.",
)
def prune(days: int) -> None:
    """Remove chat messages older than --days days.

    Intended to be invoked on a schedule (cron, Kubernetes CronJob, etc.)
    rather than from the Flask app itself. Prints the row count removed so
    the scheduler can log it.
    """
    if days < 1:
        raise click.BadParameter("--days must be >= 1")

    removed = history_repo.delete_older_than(days)
    click.echo(f"Removed {removed} chat message(s) older than {days} day(s).")


def register_cli(app: Flask) -> None:
    app.cli.add_command(retention_cli)
