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
from urllib.parse import quote

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
    # Quote: a username the Hub allows may still need escaping in a path.
    parts = ["users", quote(user, safe=""), "server"]
    server_name = os.environ.get("JUPYTERHUB_SERVER_NAME")
    if server_name:
        parts.append(quote(server_name, safe=""))
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
                # DELETE /users/<name>/server is @needs_scope('delete:servers'),
                # and the `server` role does not carry it by default.
                raise web.HTTPError(
                    403,
                    "The Hub refused: this server's token may not stop it. "
                    "Grant 'delete:servers!server' to the 'server' role.",
                ) from e
            # 599 is tornado's own code for a timeout or a refused connection.
            # It is not an HTTP status and must not be passed off as one.
            code = 502 if e.code >= 500 else e.code
            raise web.HTTPError(
                code, f"Could not reach the Hub to stop the server: {e}"
            ) from e
        except Exception as e:
            raise web.HTTPError(
                502, f"Could not reach the Hub to stop the server: {e}"
            ) from e

        self.finish(json.dumps({"stopped": True}))


def setup_handlers(web_app):
    base_url = web_app.settings["base_url"]
    route = url_path_join(base_url, "purdue-af-shutdown-button", "stop")
    web_app.add_handlers(".*$", [(route, StopServerHandler)])
