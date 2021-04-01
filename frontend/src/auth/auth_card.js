import React, { useState } from "react";
import Paper from "@material-ui/core/Paper";
import { CleanLink } from "../link";
import Grid from "@material-ui/core/Grid";

import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Button from "@material-ui/core/Button";
import { Registration } from "./registration_form";
import { Login } from "./login_form";
import { useCookies } from "react-cookie";
import { is_authenticated } from "./helper";

function AuthCard({ register = false }) {
  const [isRegistering, setIsRegistration] = useState(register);
  const [value, setValue] = useState(isRegistering ? 1 : 0);
  const [cookies, setCookie, removeCookie] = useCookies();

  const handleChange = (event, newValue) => {
    // 0 for login, 1 for registration
    if (newValue == 1) {
      setIsRegistration(true);
    } else {
      setIsRegistration(false);
    }
    setValue(newValue);
  };

  function logout() {
    console.log("removing cookie");
    removeCookie("jwt-auth", { path: "/" });
    console.log("cookies after removing:");
    console.log(cookies);
  }
  if (is_authenticated(cookies)) {
    return (
      <Paper
        style={{
          // margin: "1em",
          // padding: ".5em",
          height: "fit-content",
          textAlign: "center",
          padding: "1em",
          margin: "1em",
        }}
      >
        <p>You are already logged in. Did you mean to logout?</p>
        <Button variant="contained" onClick={logout} style={{ margin: "1em" }}>
          Yes, Log me out
        </Button>
        <CleanLink to="/">
          <Button variant="contained" color="primary" style={{ margin: "1em" }}>
            No, go Home.
          </Button>
        </CleanLink>
      </Paper>
    );
  }

  return (
    <Grid container direction="row" justify="center" alignItems="center">
      <Grid item cs={6}>
        <Paper
          style={{
            // margin: "1em",
            // padding: ".5em",
            height: "fit-content",
            textAlign: "center",
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            // aria-label="simple tabs example"
            // indicatorColor="#FF750D"
            // textColor="secondary"

            indicatorColor="primary"
            // textColor="secondary"
          >
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
          <div>{isRegistering ? <Registration /> : <Login />}</div>
        </Paper>
      </Grid>
    </Grid>
  );
}

export { AuthCard };
