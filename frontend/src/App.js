import React, { useState } from "react";
import { CookiesProvider, Cookies, useCookies } from "react-cookie";
import { UploadDashboard } from "./upload_page";
import { AuthRow } from "./auth";
import { ModelList, Delete_all } from "./models";
import { Route, Switch } from "react-router-dom";
import { NavBar } from "./nav_row";
import { PrivateRoute } from "./routes";
import CssBaseline from "@material-ui/core/CssBaseline";
import { FirstStep } from "./first_step";

import Box from "@material-ui/core/Box";

// import "./App.css";
console.log("here;s my env:", process.env);
console.log("going to ", process.env.UPLOAD_SERVER_URL);

function LandingPage() {
  return (
    <div style={{ textAlign: "center" }}>
      <FirstStep />
      <UploadDashboard />
    </div>
  );
}

function App() {
  return (
    <CookiesProvider>
      <Box
        style={{
          position: "fixed",
          overflow: "auto",
          width: "100%",
          height: "100%",
          minHeight: "100hv",
          // minHeight: "100%",
          // width: "100vh",
          backgroundImage: " linear-gradient(54deg, #FF750D 60%, #F5F6F7 100%)",
        }}
      >
        <CssBaseline />
        <NavBar />
        {/* <main style={{ flexGrow: "1" }}> */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            minHeight: "80%",
          }}
        >
          <div
            style={{
              // display: "flex",
              width: "80%",
              justifyContent: "center",
              backgroundColor: "#ffffff90",
              borderRadius: "1em",
              boxShadow: "-.3em .3em 15px 4px #ffffff60",
              margin: " 0 0 0 0",
              padding: "4em",
              // overflow: "auto",
            }}
          >
            <Switch>
              <Route path="/login">
                <AuthRow />
              </Route>
              <PrivateRoute path="/models">
                <div> hi</div>
                <div> Bye</div>
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
        </div>
        <div
          style={{
            minHeight: "5em",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p>© 2020 EasyTensor</p>
        </div>
        {/* </main> */}
      </Box>
    </CookiesProvider>
  );
}

export default App;
