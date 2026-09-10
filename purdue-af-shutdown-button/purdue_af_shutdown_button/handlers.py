"""Server-side half of the shutdown button.

The browser cannot call the Hub API itself. JupyterHub scopes its `_xsrf`
cookie to `/hub/`, so a page served from `/user/<name>/` cannot read the token
it would have to echo back, and a cookie-authenticated DELETE is refused.

The single-user server can: it holds `JUPYTERHUB_API_TOKEN`, and token
authentication skips the XSRF check. So the button posts here, and this asks
the Hub to stop the server — which is what deletes the pod. Shutting the
Jupyter server down locally does not: the Hub is never told, so it keeps the
pod running and reports the session as healthy while nothing answers on it.
"""

import json
import os

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
from tornado import web
from tornado.httpclient import AsyncHTTPClient, HTTPClientError, HTTPRequest


def hub_server_url() -> str:
    """The Hub's endpoint for this server, or "" when not running under a Hub."""
    api_url = os.environ.get("JUPYTERHUB_API_URL")
    user = os.environ.get("JUPYTERHUB_USER")
    if not api_url or not user:
        return ""
    # A named server has its own endpoint; the default server has none.
    parts = ["users", user, "server"]
    server_name = os.environ.get("JUPYTERHUB_SERVER_NAME")
    if server_name:
        parts.append(server_name)
    return url_path_join(api_url, *parts)


class StopServerHandler(APIHandler):
    """Ask the Hub to stop this session."""

    @web.authenticated
    async def post(self):
        url = hub_server_url()
        token = os.environ.get("JUPYTERHUB_API_TOKEN")
        if not url or not token:
            raise web.HTTPError(
                501, "Not running under JupyterHub; nothing to stop."
            )

        try:
            await AsyncHTTPClient().fetch(
                HTTPRequest(
                    url,
                    method="DELETE",
                    headers={"Authorization": f"token {token}"},
                    # The Hub stops the server in the background and answers
                    # 202 straight away; it only takes longer when it decides
                    # to wait, which is not this request's problem.
                    request_timeout=60,
                )
            )
        except HTTPClientError as e:
            if e.code == 403:
                # The server's own token is not allowed to stop it unless the
                # Hub grants the `servers!server` scope to the `server` role.
                raise web.HTTPError(
                    403,
                    "The Hub refused: this server's token may not stop it. "
                    "Grant the 'servers!server' scope to the 'server' role.",
                ) from e
            raise web.HTTPError(
                e.code, f"The Hub refused to stop the server: {e}"
            ) from e

        self.finish(json.dumps({"stopped": True}))


def setup_handlers(web_app):
    base_url = web_app.settings["base_url"]
    route = url_path_join(base_url, "purdue-af-shutdown-button", "stop")
    web_app.add_handlers(".*$", [(route, StopServerHandler)])
