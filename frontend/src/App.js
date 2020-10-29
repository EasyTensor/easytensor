import React, { useState } from "react";
import { CookiesProvider, Cookies, useCookies } from "react-cookie";
import { UploadDashboard } from "./upload_page";
import { AuthRow } from "./auth";
import { ModelPage } from "./models";
import { Route, Switch } from "react-router-dom";
import { NavBar } from "./nav_row";
import { PrivateRoute } from "./routes";
import CssBaseline from "@material-ui/core/CssBaseline";
import { FirstStep } from "./first_step";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import WhiteShadows from "./light_shadows";
import { AccountPage } from "./account_page";

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
      secondary: "#FFFFFF",
    },
  },
  shadows: WhiteShadows,
});

theme.shadows.forEach((element) => {
  console.log(element);
  console.log(element[4]);
});

function App() {
  const [cookies, setCookie, removeCookie] = useCookies(["jwt-auth"]);

  console.log(cookies);

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
            }}
          >
            <Switch>
              <Route path="/login">
                <AuthRow />
              </Route>
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
              minHeight: "5em",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
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
