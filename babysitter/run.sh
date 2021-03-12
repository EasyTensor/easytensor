#! /usr/bin/env bash
if [[ "$MODEL_TYPE" = "tensorflow" ]]; then
    ./tensorflow_start.sh
elif [[ "$MODEL_TYPE" = "pytorch" ]]; then
    ./pytorch_start.sh
fi