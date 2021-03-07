import os
from unittest import TestCase
from path_utils import get_app_path


class MigrationCheckTest(TestCase):
    def test_latest_migration_is_correct(self):
        migrations_folder = os.path.join(
            get_app_path(),
            "uploads",
            "migrations",
        )
        latest_migration_file = os.path.join(
            migrations_folder,
            "LATEST_MIGRATION.txt",
        )
        with open(latest_migration_file) as fin:
            latest_required_migration = fin.read().strip()

        self.assertIn(latest_required_migration+".py", os.listdir(migrations_folder))
