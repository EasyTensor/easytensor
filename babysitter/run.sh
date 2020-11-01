#! /bin/env sh
# NOTE: we need to unzip the files in a temp directory first before placing
# it in /models/model because Tensorflow Serving will pick up new files
# immediately and will complain about files missing if the decompression takes
# a long time.
-e 

imdone()
{
    echo "taking a long nap ..."
    sleep infinity
}
echo "Getting download URL"
wget -qO- backend-service:8000/model-uploads/${MODEL_ADDRESS}/ | jq -r .url > download_url.txt

echo "Downloading model"
cat download_url.txt | xargs wget -q -O model

echo "Uncompressing the model"

# sleep infinity 
echo "Trying to unzip"
unzip model -d /models/tmp/
UNZIP=$?
if [[ "$UNZIP" == "0" ]]; then
    echo "Unzipping worked!"
    rm -rf /models/model/
    mv /models/tmp /models/model
    imdone
else
    echo "Unzipping failed."
    rm -rf /models/tmp
fi

echo "Trying to untar"
tar -xzvf model -C /models/tmp/
UNTAR=$?
if [[ "$UNTAR" == "0" ]]; then
    echo "Untarring worked!"
    rm -rf /models/model/
    mv /models/tmp /models/model
    imdone
else
    echo "Untarring failed."
    rm -rf /models/tmp
fi

echo "I ran out of ways to uncompress your file :( "
exit 1
