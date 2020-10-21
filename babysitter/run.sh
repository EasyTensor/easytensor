#! /bin/env sh
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

echo "Trying to unzip"
unzip model -d /models/model/
UNZIP=$?
if [[ UNZIP==0 ]]; then
    echo "Unzipping worked!"
    imdone
else
    echo "Unzipping failed."
fi

echo "Trying to untar"
tar -xzvf model -C /models/model/
UNTAR=$?
if [[ UNTAR==0 ]]; then
    echo "Untarring worked!"
    imdone
else
    echo "Untarring failed."
fi

echo "I ran out of ways to uncompress your file :( "
exit 1
