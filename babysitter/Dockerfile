FROM alpine:3.12

RUN apk add unzip jq bash python3 curl

RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py && python3 get-pip.py && rm get-pip.py

# wget --header "Authorization: Bearer ya29.a0AfH6SMCXy6iCvt1eBK83_00cz44SYPEA-qG43aexvdMCYtUCinNnxiBSNpkGWJMhTzarJZWtgg4lk1IWdHKMZ489ZFGK7H0Bob7FHIwgzjX31TDSMd-wqJLIUeQXzlqgnFuyMXrYPiZeSyn4RBu57kWzOnUyI8GGsqc" https://storage.googleapis.com/storage/v1/b/easytensor-model-uploads/o/037c9a04-d91d-48f8-a748-f8712651a98f?alt=media -O zip-model

RUN mkdir /app
WORKDIR /app
COPY run.sh .
RUN echo "hi"
CMD bash run.sh