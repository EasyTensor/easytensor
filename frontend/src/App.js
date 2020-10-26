import React, { useState } from "react";
import { CookiesProvider, Cookies, useCookies } from "react-cookie";
import { UploadDashboard } from "./upload_page";
import { AuthRow } from "./auth";
import { ModelList, Delete_all } from "./models";
import "./App.css";
console.log("here;s my env:", process.env);
console.log("going to ", process.env.UPLOAD_SERVER_URL);

function App() {
  return (
    <CookiesProvider>
      <div className="App">
        <AuthRow></AuthRow>
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
          <ModelList />
          <Delete_all />
          <UploadDashboard />
        </header>
      </div>
    </CookiesProvider>
  );
}

export default App;
