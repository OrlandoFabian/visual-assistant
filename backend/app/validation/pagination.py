from dataclasses import dataclass

DEFAULT_LIMIT = 50
MAX_LIMIT = 200


@dataclass
class PaginationError(Exception):
    message: str
    code: str
    status: int = 400


@dataclass(frozen=True)
class Pagination:
    limit: int
    offset: int


def parse_pagination(args: dict) -> Pagination:
    limit = _parse_int(args, "limit", default=DEFAULT_LIMIT)
    offset = _parse_int(args, "offset", default=0)

    if limit < 1:
        raise PaginationError(
            message="limit must be >= 1", code="invalid_pagination"
        )
    if limit > MAX_LIMIT:
        raise PaginationError(
            message=f"limit must be <= {MAX_LIMIT}", code="invalid_pagination"
        )
    if offset < 0:
        raise PaginationError(
            message="offset must be >= 0", code="invalid_pagination"
        )

    return Pagination(limit=limit, offset=offset)


def _parse_int(args: dict, name: str, default: int) -> int:
    raw = args.get(name)
    if raw is None or raw == "":
        return default
    try:
        return int(raw)
    except (TypeError, ValueError) as e:
        raise PaginationError(
            message=f"{name} must be an integer", code="invalid_pagination"
        ) from e
