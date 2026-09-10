"""The Hub endpoint this button posts to.

Getting the URL wrong is silent: the request 404s, the dialog reports a
failure, and the session stays up — the very thing this extension exists to
prevent.
"""

import importlib

import pytest

MODULE = "purdue_af_shutdown_button.handlers"
HUB_ENV = ("JUPYTERHUB_API_URL", "JUPYTERHUB_USER", "JUPYTERHUB_SERVER_NAME")


def handlers(monkeypatch, **env):
    for key in HUB_ENV:
        monkeypatch.delenv(key, raising=False)
    for key, value in env.items():
        monkeypatch.setenv(key, value)
    return importlib.reload(importlib.import_module(MODULE))


def test_default_server_url(monkeypatch):
    mod = handlers(
        monkeypatch,
        JUPYTERHUB_API_URL="http://hub:8081/hub/api",
        JUPYTERHUB_USER="alice",
    )
    assert mod.hub_server_url() == "http://hub:8081/hub/api/users/alice/server"


def test_named_server_gets_its_own_endpoint(monkeypatch):
    """A named server is not stopped by the default server's endpoint."""
    mod = handlers(
        monkeypatch,
        JUPYTERHUB_API_URL="http://hub:8081/hub/api",
        JUPYTERHUB_USER="alice",
        JUPYTERHUB_SERVER_NAME="gpu",
    )
    assert mod.hub_server_url() == "http://hub:8081/hub/api/users/alice/server/gpu"


def test_a_username_needing_escaping_is_not_mangled(monkeypatch):
    mod = handlers(
        monkeypatch,
        JUPYTERHUB_API_URL="http://hub:8081/hub/api",
        JUPYTERHUB_USER="user.name",
    )
    assert mod.hub_server_url().endswith("/users/user.name/server")


@pytest.mark.parametrize(
    "env",
    [
        {},
        {"JUPYTERHUB_API_URL": "http://hub:8081/hub/api"},
        {"JUPYTERHUB_USER": "alice"},
    ],
)
def test_no_hub_means_no_url(monkeypatch, env):
    """Outside JupyterHub there is nothing to stop; say so rather than guess."""
    assert handlers(monkeypatch, **env).hub_server_url() == ""
