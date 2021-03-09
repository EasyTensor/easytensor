import React, { useState } from "react";
import { CookiesProvider } from "react-cookie";
import { AuthCard } from "./auth/auth_card";
import {
  RegistrationFailure,
  RegistrationSuccess,
} from "./auth/registration_status";
import { ModelPage } from "./models";
import { Route, Switch } from "react-router-dom";
import { NavBar } from "./nav_bar";
import { PrivateRoute } from "./routes";
import CssBaseline from "@material-ui/core/CssBaseline";
import { FirstStep } from "./first_step";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import WhiteShadows from "./light_shadows";
import { AccountPage } from "./account_page";
import { ExplorePage } from "./explore"

import Box from "@material-ui/core/Box";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#FF750D",
      dark: "#E64A19",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#FFFFFF",
    },
    text: {
      primary: "#424242",
      secondary: "#FF750D",
    },
  },
  shadows: WhiteShadows,
});

function App() {
  return (
    <CookiesProvider>
      <ThemeProvider theme={theme}>
        <Box
          style={{
            position: "fixed",
            overflow: "auto",
            width: "100%",
            height: "100%",
            minHeight: "100hv",
            // minHeight: "100%",
            // width: "100vh",
            backgroundImage:
              " linear-gradient(54deg, #FF750D 60%, #F5F6F7 100%)",
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
              paddingBottom: "3em",
            }}
          >
            <Switch>
              <Route path="/login">
                <AuthCard />
              </Route>
              <Route path="/registration/success/">
                <RegistrationSuccess />
              </Route>
              <Route path="/registration/failure/">
                <RegistrationFailure />
              </Route>
              <PrivateRoute path="/explore">
                <ExplorePage />
              </PrivateRoute>
              <PrivateRoute path="/models">
                <ModelPage />
              </PrivateRoute>

              <PrivateRoute path="/account">
                <AccountPage />
              </PrivateRoute>
              {/* This must be the last path in the switch */}
              <PrivateRoute path="/">
                <FirstStep />
              </PrivateRoute>
            </Switch>
          </div>
          <div
            style={{
              height: "3em",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "100%",
            }}
          >
            <Typography color="secondary">© 2020 EasyTensor</Typography>
          </div>
          {/* </main> */}
        </Box>
      </ThemeProvider>
    </CookiesProvider>
  );
}

export default App;
