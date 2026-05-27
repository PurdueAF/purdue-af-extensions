## Extensions:

- purdue-af-shutdown-button
- purdue-af-vscode-button
- purdue-af-grafana-iframe

## Publishing instructions

From the extension subdirectory (e.g. `purdue-af-vscode-button/`):

```shell
pip install build twine hatch 'jupyterlab>=4.0.0,<5'
cd <subdirectory>
hatch version <new-version>   # skip on first publish if package.json is already that version
jlpm clean:all
git clean -dfX                # optional; removes ignored files such as node_modules/
jlpm install                  # only needed if you ran git clean -dfX
python -m build
twine upload dist/*
```

`python -m build` runs `jlpm build:prod` via hatch (see each extension's `pyproject.toml`). PyPI package names use underscores (e.g. `purdue_af_vscode_button`); `pip install purdue-af-vscode-button` also works.
