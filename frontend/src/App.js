import React from 'react';
import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
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
console.log("going to ", process.env.UPLOAD_SERVER_URL )
uppy.use(Tus, { endpoint: `http://${process.env.REACT_APP_UPLOAD_SERVER_URL}:1080/files/` })


uppy.on('upload-success', (file, response) => {
  console.log(response)
  console.log(file.name, response.uploadURL)
  var file_location = response.uploadURL.split("/").pop()
  console.log("file location:", file_location)
  axios.post(
    `http://${process.env.REACT_APP_BACKEND_SERVER_URL}:8000/model-uploads/`,
    {
      "original_name": file.name,
      "upload_location": file_location
    }
  )
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
