try:
    from ._version import __version__
except ImportError:
    # Fallback when using the package in dev mode without installing
    # in editable mode with pip. It is highly recommended to install
    # the package from a stable release or in editable mode: https://pip.pypa.io/en/stable/topics/local-project-installs/#editable-installs
    import warnings
    warnings.warn("Importing 'purdue_af_shutdown_button' outside a proper installation.")
    __version__ = "dev"


from .handlers import setup_handlers


def _jupyter_labextension_paths():
    return [{
        "src": "labextension",
        "dest": "purdue-af-shutdown-button"
    }]


def _jupyter_server_extension_points():
    return [{"module": "purdue_af_shutdown_button"}]


def _load_jupyter_server_extension(server_app):
    """Register the endpoint the button posts to."""
    setup_handlers(server_app.web_app)
    server_app.log.info("Registered purdue_af_shutdown_button server extension")
