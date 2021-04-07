#! /usr/bin/env bash
if [[ "$MODEL_TYPE" = "tensorflow" ]]; then
    ./tensorflow_start.sh
elif [[ "$MODEL_TYPE" = "pytorch" ]]; then
    ./pytorch_start.sh
elif [[ "$MODEL_TYPE" = "transformer" ]]; then
    ./pytorch_start.sh
else
    echo "Model type $MODEL_TYPE is not recognized"
fi