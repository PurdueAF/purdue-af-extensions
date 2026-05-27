# purdue_af_vscode_button

Adds a JupyterLab topbar button that opens the proxied code-server (VS Code) interface in a new browser tab.

## Command ID

Register this command in `top-bar.jupyterlab-settings`:

```
jupyterlab-topbar:switch-to-vscode
```

## Top bar configuration

Add the button to `.jupyter/lab/user-settings/@jupyterlab/application-extension/top-bar.jupyterlab-settings` (or via `config-extensions.sh` in the purdue-af image):

```json
{
    "toolbar": [
        {
            "name": "vscode",
            "command": "jupyterlab-topbar:switch-to-vscode",
            "disabled": false,
            "rank": 155
        },
        {
            "name": "shutdown",
            "command": "jupyterlab-topbar:shutdown",
            "disabled": false,
            "rank": 160
        }
    ]
}
```

Clicking the button opens `{baseUrl}vscode/?folder=/home/{username}` in a new tab, using the Jupyter single-user server `baseUrl` (no hardcoded hostnames).

## purdue-af image integration (downstream)

After publishing to PyPI, update the purdue-af repository:

1. `docker/purdue-af/pixi.toml` — add `purdue-af-vscode-button = "==0.1.0"` (or `purdue_af_vscode_button` per your lockfile convention).
2. `docker/purdue-af/scripts/config-extensions.sh` — add the topbar entry shown above before the shutdown button.

## Requirements

- JupyterLab >= 4.0.0

## Install

```bash
pip install purdue_af_vscode_button
```

## Uninstall

```bash
pip uninstall purdue_af_vscode_button
```

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Change directory to the purdue-af-vscode-button directory
pip install -e "."
jupyter labextension develop . --overwrite
jlpm build
```

```bash
jlpm watch
jupyter lab
```

### Development uninstall

```bash
pip uninstall purdue_af_vscode_button
```

Remove the `purdue-af-vscode-button` symlink from the labextensions folder reported by `jupyter labextension list`.

### Packaging the extension

See [RELEASE](RELEASE.md)
