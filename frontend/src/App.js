import React from 'react';
import logo from './logo.svg';
import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import { Dashboard } from '@uppy/react'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'

import './App.css';


const uppy = new Uppy({
  meta: { type: 'avatar' },
  restrictions: { maxNumberOfFiles: 1 },
  autoProceed: true
})
console.log("here;s my env:", process.env)
console.log("going to ", process.env.UPLOAD_SERVER_URL )
uppy.use(Tus, { endpoint: `http://${process.env.REACT_APP_UPLOAD_SERVER_URL}:1080/files/` })

uppy.on('complete', (result) => {
  // const url = result.successful[0].uploadURL
  // store.dispatch({
  //   type: 'SET_USER_AVATAR_URL',
  //   payload: { url: url }
  // })
})


// const AvatarPicker = ({ currentAvatar }) => {
//   return (
//     <div>
//       <img src={currentAvatar} alt="Current Avatar" />
//       <DragDrop
//         uppy={uppy}
//         locale={{
//           strings: {
//             // Text to show on the droppable area.
//             // `%{browse}` is replaced with a link that opens the system file selection dialog.
//             dropHereOr: 'Drop here or %{browse}',
//             // Used as the label for the link that opens the system file selection dialog.
//             browse: 'browse'
//           }
//         }}
//       />
//     </div>
//   )
// }

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
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
