import React, { useState } from "react";
import { CookiesProvider } from "react-cookie";
import { AuthCard } from "./auth/auth_card";
import Container from "@material-ui/core/Container";

import {
  RegistrationFailure,
  RegistrationSuccess,
} from "./auth/registration_status";
import { ModelsPage } from "./models";
import { Route, Switch } from "react-router-dom";
import { NavBar } from "./nav_bar";
import { PrivateRoute } from "./routes";
import CssBaseline from "@material-ui/core/CssBaseline";
import { FirstStep } from "./first_step";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import WhiteShadows from "./light_shadows";
import { AccountPage } from "./account_page";
import { ExplorePage } from "./explore";
import { ModelLogs } from "./model_logs";

import Box from "@material-ui/core/Box";
import { PricingPage, PaymentSuccessPage } from "./pricing";

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
            backgroundImage:
              " linear-gradient(54deg, #FF750D 60%, #F5F6F7 100%)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CssBaseline />
          <NavBar />
          <Container maxWidth="xl" style={{ flexGrow: "1" }}>
            <Switch>
              <Route path="/login">
                <AuthCard />
              </Route>
              <Route path="/register">
                <AuthCard register />
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
              <PrivateRoute path="/models/:modelId/logs">
                <ModelLogs />
              </PrivateRoute>
              <PrivateRoute path="/models">
                <ModelsPage />
              </PrivateRoute>
              <PrivateRoute path="/pricing/success">
                <PaymentSuccessPage />
              </PrivateRoute>
              <Route path="/pricing">
                <PricingPage />
              </Route>
              <PrivateRoute path="/account">
                <AccountPage />
              </PrivateRoute>
              {/* This must be the last path in the switch */}
              <PrivateRoute path="/">
                <FirstStep />
              </PrivateRoute>
            </Switch>
          </Container>

          <div
            style={{
              height: "3em",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              bottom: 0,
              left: 0,
              width: "100%",
            }}
          >
            <Typography color="secondary">© 2021 EasyTensor</Typography>
          </div>
        </Box>
      </ThemeProvider>
    </CookiesProvider>
  );
}

export default App;
