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

extract_model() {
    echo "Uncompressing the model"
    echo "Trying to unzip"
    mkdir /models/tmp/
    if ! unzip model -d /models/tmp/; then
        echo "Unzipping failed."
        rm -rf /models/tmp
    else
        echo "Unzipping worked!"
        return
    fi

    echo "Trying to untar"
    mkdir /models/tmp/
    if ! tar -xzvf model -C /models/tmp/; then
            echo "Untarring failed."
        rm -rf /models/tmp
    else
        echo "Untarring worked!"
        return
    fi
    echo "I ran out of ways to uncompress your file :( "
    exit 1
}

place_model() {
    # Expects the models to be extracted in /models/tmp/
    echo "placing model"
    if [[ $(ls /models/tmp/ | wc -l) -gt 1 ]]; then
        rm -rf /models/model
        mkdir -p /models/model/0001
        mv /models/tmp/* /models/model/0001
    else
        rm -rf /models/model
        mv /models/tmp /models/model
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
