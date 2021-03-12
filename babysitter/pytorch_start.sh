#! /bin/env bash
# NOTE: we need to unzip the files in a temp directory first before placing
# it in /models/model because Tensorflow Serving will pick up new files
# immediately and will complain about files missing if the decompression takes
# a long time.
set -e

imdone() {
    echo "taking a long nap ..."
    sleep infinity
}


place_model() {
    # Expects the models to be extracted in ~/model
    echo "placing model"
        rm -rf ~/model-store/*
        mv ~/model ~/model-store/
    fi
}

# authentication
# TODO: change this to an access token
echo "Authenticating"
wget -qO- "${BACKEND_SERVER_ADDRESS}":"${BACKEND_SERVER_PORT}"/v1/dj-rest-auth/login/ --post-data="$(
    cat <<EOF
{
    "username": "${CONTROLLER_USERNAME}",
    "email": "${CONTROLLER_EMAIL}",
    "password": "${CONTROLLER_PASSWORD}"
}
EOF
)" --header="Content-Type:application/json" | jq -r .access_token >auth_token.txt

echo "Getting download URL"
wget -qO- "${BACKEND_SERVER_ADDRESS}":"${BACKEND_SERVER_PORT}"/v1/model-uploads/${MODEL_ID}/ --header="Authorization: Bearer $(cat auth_token.txt)" | jq -r .url >download_url.txt

echo "Downloading model"
cat download_url.txt | xargs wget -q -O model


if ! (extract_model && place_model); then
    echo "extracting did not work, exiting with error"
    exit 1
else
    imdone
fi
