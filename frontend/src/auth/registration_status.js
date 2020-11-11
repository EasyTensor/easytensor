import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import { Link } from "react-router-dom";
import { CleanLink } from "../link";

import Paper from "@material-ui/core/Paper";

function RegistrationSuccess() {
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
      <p>Your email is confirmed. Let's get you to work!</p>
      <CleanLink to="/login">
        <Button variant="contained" color="primary">
          Login
        </Button>
      </CleanLink>
    </Paper>
  );
}

function RegistrationFailure() {
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
      <p>Something went wrong confirming your regirstation.</p>
      <p>Your account might already be actiaveted.</p>
      <p>
        Try <Link to="/login">logging in</Link>
      </p>
    </Paper>
  );
}
export { RegistrationSuccess, RegistrationFailure };
