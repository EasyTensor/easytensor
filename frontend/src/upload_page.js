import React from "react";
import Uppy from "@uppy/core";
import AwsS3 from "@uppy/aws-s3";
import { Dashboard } from "@uppy/react";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import { PostModelUploadURL } from "./api";

const uppy = new Uppy({
  meta: { type: "avatar" },
  restrictions: {
    maxNumberOfFiles: 1,
    allowedFileTypes: [".7z", ".zip", ".gz", ".mar"],
    maxFileSize: 1024 * 1024 * 250 //250 MB
  },
  autoProceed: false,
});

uppy.use(AwsS3, {
  getUploadParameters(file) {
    const body = {
      filename: file.name,
    };
    return PostModelUploadURL(body).then((response) => {
      // Return an object in the correct shape.
      return {
        method: "PUT",
        url: response.data.url,
        fields: [],
        // Provide content type header required by S3
        headers: {
          "Content-Type": "application/octet-stream",
        },
      };
    });
  },
});

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

uppy.on("file-added", (file) => {
  file.original_name = file.name;
  file.name = uuidv4();
});

function UploadDashboard({ onSuccess }) {

  uppy.on("upload-success", (file, response) => {
    onSuccess(file);
  });

  return (
    <Dashboard
      uppy={uppy}
      inline={true}
      width="100%"
      height={200}
      showProgressDetails={true}
      theme="auto"
    />
  );
}
export { UploadDashboard };
