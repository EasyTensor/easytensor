import React from 'react';
import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import AwsS3 from '@uppy/aws-s3'
import { Dashboard } from '@uppy/react'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import axios from 'axios';

import './App.css';


const uppy = new Uppy({
  meta: { type: 'avatar' },
  restrictions: { maxNumberOfFiles: 20 },
  autoProceed: false
})

console.log("here;s my env:", process.env)
console.log("going to ", process.env.UPLOAD_SERVER_URL)
uppy.use(AwsS3, {
  getUploadParameters(file) {
    // Send a request to our PHP signing endpoint.
    return fetch(`http://${process.env.REACT_APP_BACKEND_SERVER_URL}:8000/model-uploads/`, {
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

uppy.on('upload-success', (file, response) => {
  console.log(response)
  console.log(file.name, response.uploadURL)
  var file_location = response.uploadURL.split("/").pop()
  console.log("file location:", file_location)
  console.log(file.meta['key'])
  // axios.post(
  //   `http://${process.env.REACT_APP_BACKEND_SERVER_URL}:8000/model-uploads/`,
  //   {
  //     "original_name": file.name,
  //     "upload_location": file_location
  //   }
  // )
})


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
