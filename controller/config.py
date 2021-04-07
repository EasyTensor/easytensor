import os


def get_env_var(var_name, var_type=None):
    """
    Gets an environment variable name or raises an exception
    if it's not present.
    """
    var = os.getenv(var_name)
    if var is None:
        raise Exception(f"Variable {var_name} is not defined in the environment")
    if var_type is not None:
        return var_type(var)
    return var


CONTROLLER_USERNAME = get_env_var("CONTROLLER_USERNAME")
CONTROLLER_EMAIL = get_env_var("CONTROLLER_EMAIL")
CONTROLLER_PASSWORD = get_env_var("CONTROLLER_PASSWORD")
MIGRATION_STATE = get_env_var("MIGRATION_STATE", int)

BACKEND_SERVER_ADDRESS = get_env_var("BACKEND_SERVER_ADDRESS")
BACKEND_SERVER_PORT = get_env_var("BACKEND_SERVER_PORT")

BACKEND_SERVICE_URL = f"http://{BACKEND_SERVER_ADDRESS}:{BACKEND_SERVER_PORT}"
MODELS_URL = f"{BACKEND_SERVICE_URL}/v1/models/"
AUTH_URL = f"{BACKEND_SERVICE_URL}/v1/dj-rest-auth/login/"
NAMESPACE = get_env_var("CONTROLLED_NAMESPACE")
BABYSITTER_IMAGE = get_env_var("BABYSITTER_IMAGE")
PYTORCH_SERVE_IMAGE = get_env_var("PYTORCH_SERVE_IMAGE")
TRANSFORMER_SERVE_IMAGE = get_env_var("TRANSFORMER_SERVE_IMAGE")
