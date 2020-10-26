import React, { useState } from "react";
import { CookiesProvider, Cookies, useCookies } from "react-cookie";
import { UploadDashboard } from "./upload_page";
import { AuthRow } from "./auth";
import { ModelList, Delete_all } from "./models";
import { Route, Switch } from "react-router-dom";
import { NavBar } from "./nav_row";
import { PrivateRoute } from "./routes";
import { MyDrawer } from "./drawer";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";

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
const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: "auto",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

function App() {
  const classes = useStyles();

  return (
    <CookiesProvider>
      <Box className={classes.root}>
        <CssBaseline />
        <NavBar />
        <MyDrawer />
        {/* <main style={{ flexGrow: "1" }}> */}
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
        {/* </main> */}
      </Box>
    </CookiesProvider>
  );
}

export default App;
