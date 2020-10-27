import React, { useState } from "react";
import { CookiesProvider, Cookies, useCookies } from "react-cookie";
import { UploadDashboard } from "./upload_page";
import { AuthRow } from "./auth";
import { ModelList, Delete_all } from "./models";
import { Route, Switch } from "react-router-dom";
import { NavBar } from "./nav_row";
import { PrivateRoute } from "./routes";
import CssBaseline from "@material-ui/core/CssBaseline";

import Box from "@material-ui/core/Box";

// import "./App.css";
console.log("here;s my env:", process.env);
console.log("going to ", process.env.UPLOAD_SERVER_URL);

function LandingPage() {
  return (
    <header>
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
      <Box>
        <CssBaseline />
        <NavBar />
        {/* <main style={{ flexGrow: "1" }}> */}
        <div style={{ margin: "auto", width: "80%" }}>
          <Switch>
            <Route path="/login">
              <AuthRow />
            </Route>
            <PrivateRoute path="/models">
              <ModelList />
              <Delete_all />
            </PrivateRoute>
            {/* <PrivateRoute path="/account">
            <div>User Accounts</div>
          </PrivateRoute> */}
            <PrivateRoute path="/">
              <LandingPage />
            </PrivateRoute>
          </Switch>
        </div>
        {/* </main> */}
      </Box>
    </CookiesProvider>
  );
}

export default App;
