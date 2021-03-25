#!/usr/bin/env bash

max_retry=50
counter=0
echo "starting to wait for migrations"
until python3 manage.py shell <check_latest_migration.py
do
   sleep 1
   [[ counter -eq $max_retry ]] && echo "Failed!" && exit 1
   echo "Trying again. Try #$counter"
   ((counter++))
done
echo "Success!"
