import React from 'react';
import Uppy from '@uppy/core'
import AwsS3 from '@uppy/aws-s3'
import { Dashboard } from '@uppy/react'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import axios from 'axios';

import './App.css';


const uppy = new Uppy({
  meta: { type: 'avatar' },
  restrictions: { maxNumberOfFiles: 1, allowedFileTypes: [".7z", ".zip", ".tar.gz"] },
  autoProceed: false
})
const BACKEND_HTTP_ADDRESS = `${process.env.REACT_APP_BACKEND_SERVER_ADDRESS}`
const BACKEND_HTTP_PORT = `${process.env.REACT_APP_BACKEND_SERVER_PORT}`
const BACKEND_HTTP_URL = `http://${BACKEND_HTTP_ADDRESS}:${BACKEND_HTTP_PORT}`

console.log("here;s my env:", process.env)
console.log("going to ", process.env.UPLOAD_SERVER_URL)
uppy.use(AwsS3, {
  getUploadParameters(file) {
    // Send a request to our PHP signing endpoint.
    return fetch(`${BACKEND_HTTP_URL}/model-uploads/`, {
      method: 'post',
      // Send and receive JSON.
      headers: {
        accept: 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type
      })
    }).then((response) => {
      // Parse the JSON response.
      return response.json()
    }).then((data) => {
      // Return an object in the correct shape.
      return {
        method: "PUT",
        url: data.url,
        fields: [],
        // Provide content type header required by S3
        headers: {
          "Content-Type": "application/octet-stream"
        }
      }
    })
  }
})

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

uppy.on('file-added', (file) => {
  file.original_name = file.name
  file.name = uuidv4()
  console.log('Added file', file)
})
uppy.on('upload-success', (file, response) => {
  console.log(file)
  console.log(response)
  var file_location = response.uploadURL.split("/").pop()
  console.log("file location:", file_location)
  axios.post(
    `${BACKEND_HTTP_URL}/models/`,
    {
      "address": file.name,
      "name": file.original_name,
      "size": file.size
    }
  )
})

function Delete_all() {
  var delete_models = () => {
    axios.get(`${BACKEND_HTTP_URL}/models/`).then(
      (response) => { console.log("get response: ", response) }
    )
    axios.delete(`${BACKEND_HTTP_URL}/models/`)
  }

  return (
    <button onClick={delete_models}><p>delete all </p></button>
  )
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React! yay!
        </a>
        <Delete_all />
        <Dashboard
          uppy={uppy}
        // plugins={['Webcam']}
        // {...props}
        />
      </header>
    </div>
  );
}

export default App;
