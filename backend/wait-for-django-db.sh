#!/usr/bin/env bash

max_retry=10
counter=0
echo "starting to wait for django database"
until eval "$(python3 manage.py dbshell -- -c ';')"
do
   sleep 1
   [[ counter -eq $max_retry ]] && echo "Failed!" && exit 1
   echo "Trying again. Try #$counter"
   ((counter++))
done
echo "Success!"
