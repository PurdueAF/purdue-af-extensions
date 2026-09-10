# Changelog

<!-- <START NEW CHANGELOG ENTRY> -->

## 0.2.0

The button now asks JupyterHub to stop the session, instead of shutting the
local Jupyter server down.

Shutting the server down told the Hub nothing: it kept the pod running and
still reported the session as healthy, while nothing answered on it. The user
got a 503 and a session that could not be used and never went away.

- Adds a server extension exposing `POST purdue-af-shutdown-button/stop`, which
  calls `DELETE /hub/api/users/<user>/server` with the session's own token. The
  browser cannot make that call: JupyterHub scopes its `_xsrf` cookie to
  `/hub/`, so a page at `/user/<name>/` cannot read the token it would have to
  send.
- A failed stop now reports what went wrong and links to the Hub control panel,
  rather than a dialog claiming success.
- Sets `skipLibCheck`, without which the package could not be built at all
  against current `@types/node`.

Requires the Hub to grant `delete:servers!server` to the `server` role.

<!-- <END NEW CHANGELOG ENTRY> -->
