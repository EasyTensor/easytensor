from collections import OrderedDict
import logging
from controller.migrations.m_0001_change_model_labels import change_model_labels
from controller.migrations.m_0002_include_model_id_in_babysitter import (
    include_model_id_in_babysitter_env,
)
from controller.migrations.m_0003_remove_model_type_from_object_names import (
    remove_model_type_from_object_names,
)


logging.basicConfig()
LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.DEBUG)


def noop():
    pass


migrations = OrderedDict(
    {
        0: noop,
        1: change_model_labels,
        2: include_model_id_in_babysitter_env,
        3: remove_model_type_from_object_names,
    }
)


def run_migrations(migration_state: str):
    """
    migration_state: a string representing the current state of the application. Any migrations above the provided state number will be run.
    """
    for mig_num, migration in migrations.items():
        if mig_num > migration_state:
            LOGGER.info("Migration %d: running", mig_num)
            migration()
        else:
            LOGGER.info("Migration %d: skipping", mig_num)
