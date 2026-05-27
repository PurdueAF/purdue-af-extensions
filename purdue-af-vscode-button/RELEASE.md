# Making a new release of purdue_af_vscode_button

The extension can be published to `PyPI` manually or using the [Jupyter Releaser](https://github.com/jupyter-server/jupyter_releaser).

## Manual release

### Python package

```bash
pip install build twine hatch 'jupyterlab>=4.0.0,<5'
```

Bump the version using `hatch` (skip on first publish if `package.json` is already that version):

```bash
hatch version <new-version>
```

Clean development artifacts:

```bash
jlpm clean:all
```

Optional deep clean (removes ignored files such as `node_modules/`):

```bash
git clean -dfX
jlpm install
```

Build (hatch runs `jlpm build:prod` automatically):

```bash
python -m build
```

Upload to PyPI:

```bash
twine upload dist/*
```

PyPI distribution name: `purdue_af_vscode_button` (`pip install purdue-af-vscode-button` also works).
