def test_request_id_generated_when_absent(client):
    res = client.get("/health")
    assert res.status_code == 200
    rid = res.headers.get("X-Request-ID")
    assert rid is not None
    assert len(rid) == 32  # uuid4().hex


def test_request_id_honors_client_supplied(client):
    res = client.get("/health", headers={"X-Request-ID": "trace-abc-123"})
    assert res.status_code == 200
    assert res.headers["X-Request-ID"] == "trace-abc-123"


def test_each_request_gets_a_distinct_id_by_default(client):
    rid1 = client.get("/health").headers["X-Request-ID"]
    rid2 = client.get("/health").headers["X-Request-ID"]
    assert rid1 != rid2


def test_request_id_present_on_error_responses(client):
    res = client.get("/images/img_nothing/preview")
    assert res.status_code == 404
    assert "X-Request-ID" in res.headers
