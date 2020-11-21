from collections import OrderedDict
import logging
from controller.migrations.m_0001_change_model_labels import change_model_labels

logging.basicConfig()
LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.DEBUG)


def noop():
    pass


migrations = OrderedDict({0: noop, 1: change_model_labels})


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
