#!/usr/bin/env bash

max_retry=50
counter=0
echo "starting to wait for model to be available"
until [[ -f /models/model/model.py && -d /models/model/model_weights ]]
do
   sleep 1
   [[ counter -eq $max_retry ]] && echo "Failed!" && exit 1
   echo "Trying again. Try #$counter"
   ((counter++))
done
echo "Success!"