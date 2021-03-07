import os

def get_app_path():
    """
    Returns the app path as it is defined in the environment variable.
    """
    app_path = os.getenv("BACKEND_APP_PATH")
    if app_path is  None:
        raise BaseException("App path is not set.")
    return app_path