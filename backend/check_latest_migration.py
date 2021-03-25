#! /usr/bin/env python3
from django.db.migrations.recorder import MigrationRecorder

last_migration = MigrationRecorder.Migration.objects.filter(app="uploads").latest("id")

with open("/app/uploads/migrations/LATEST_MIGRATION.txt") as fin:
    required_migration = fin.read().strip()
print(f"Latest Migration required: {required_migration}")
print(f"Current latest migration is {last_migration.name}")

if required_migration != last_migration.name:
    print("Failing.")
    exit(1)

exit(0)
