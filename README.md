## Extensions:

- purdue-af-shutdown-button
- purdue-af-grafana-iframe

## Publishing instructions

```shell
pip install build twine hatch
cd  <subdirectory>
hatch version <new-version>
jlpm clean:all
git clean -dfX
python -m build
twine upload dist/*
```