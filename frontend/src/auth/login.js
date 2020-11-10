import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { useHistory, useLocation } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import { Delete, Add, CloudDownload } from "@material-ui/icons";
import Button from "@material-ui/core/Button";
import Fab from "@material-ui/core/Fab";

import IconButton from "@material-ui/core/IconButton";
import ToolTip from "@material-ui/core/Tooltip";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";

import { PostLogin, PostRegistration } from "../api";

function is_authenticated(cookies) {
  return Boolean(
    "jwt-auth" in cookies &&
      cookies["jwt-auth"] != undefined &&
      cookies["jwt-auth"] != "undefined"
  );
}

function Login() {
  // const [isLoggedIn, setLoggedIn] = useState(false)

  let history = useHistory();
  let location = useLocation();
  const [cookies, setCookie, removeCookie] = useCookies();

  const [isRegistering, setIsRegistration] = useState(false);
  const [username, changeUsername] = useState("");
  const [password, changePassword] = useState("");
  const [password2, changePassword2] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    console.log(e);

    return PostLogin(username, password)
      .then((resp) => {
        if (!resp.data.access_token) {
          alert("invalid login");
          console.log(resp.data);
          return;
        }
        setCookie("jwt-auth", resp.data.access_token, { maxAge: 60 * 60 * 24 });

        const to_loc = { pathname: "/" };
        history.replace(to_loc);
      })
      .catch((error) => console.log("error ->", error));
  }

  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: "grid", padding: "1em", margin: "1em" }}>
        <TextField
          id="standard-basic"
          label="Username"
          onChange={(e) => changeUsername(e.target.value)}
          value={username}
        />
        <TextField
          id="standard-basic"
          label="Password"
          type="password"
          onChange={(e) => changePassword(e.target.value)}
          value={password}
        />
      </div>
      <div style={{ margin: "1em 0em 2em 0em" }}>
        <Button color="primary"  variant="contained" type={"submit"} style={{ width: "70%" }}>
          Login
        </Button>
      </div>
    </form>
  );
}

export { Login };
