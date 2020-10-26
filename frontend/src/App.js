import React, { useState } from "react";
import { CookiesProvider, Cookies, useCookies } from "react-cookie";
import { UploadDashboard } from "./upload_page";
import { AuthRow } from "./auth";
import { ModelList, Delete_all } from "./models";
import { Route } from "react-router-dom";
import { NavBar } from "./nav_row";

import "./App.css";
console.log("here;s my env:", process.env);
console.log("going to ", process.env.UPLOAD_SERVER_URL);

function LandingPage() {
  return (
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
      <UploadDashboard />
    </header>
  );
}

function App() {
  return (
    <CookiesProvider>
      <div className="App">
        <NavBar />
        <switch>
          <Route path="/login">
            <AuthRow />
          </Route>
          <Route path="/models">
            <ModelList />
            <Delete_all />
          </Route>
          <Route path="/account">
            <div>User Accounts</div>
          </Route>
          <Route path="/">
            <LandingPage />
          </Route>
        </switch>
      </div>
    </CookiesProvider>
  );
}

export default App;
