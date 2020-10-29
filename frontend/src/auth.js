import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { useHistory, useLocation } from "react-router-dom";
import { BACKEND_HTTP_URL } from "./constants";
import Typography from "@material-ui/core/Typography";
import { Delete, Add, CloudDownload } from "@material-ui/icons";
import Button from "@material-ui/core/Button";
import Fab from "@material-ui/core/Fab";

import IconButton from "@material-ui/core/IconButton";
import ToolTip from "@material-ui/core/Tooltip";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Paper from "@material-ui/core/Paper";
import { CleanLink } from "./link";
import Tooltip from "@material-ui/core/Tooltip";

function is_authenticated(cookies) {
  return Boolean(
    "jwt-auth" in cookies &&
      cookies["jwt-auth"] != undefined &&
      cookies["jwt-auth"] != "undefined"
  );
}

function AuthRow() {
  // const [isLoggedIn, setLoggedIn] = useState(false)

  let history = useHistory();
  let location = useLocation();
  const [cookies, setCookie, removeCookie] = useCookies(["jwt-auth"]);

  const [isRegistering, setIsRegistration] = useState(false);
  const [username, changeUsername] = useState("");
  const [password, changePassword] = useState("");
  const [password2, changePassword2] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    if (isRegistering) {
      return fetch(`${BACKEND_HTTP_URL}/dj-rest-auth/registration/`, {
        method: "POST",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: username,
          password1: password,
          password2: password2,
        }),
      })
        .then((resp) => resp.json())
        .then((data) => {
          console.log("login return:", data);
          setCookie("jwt-auth", data.access_token);
          let { from } = location.state || { from: { pathname: "/" } };
          history.replace(from);
        })
        .catch((error) => console.log("error ->", error));
    } else {
      return fetch(`${BACKEND_HTTP_URL}/dj-rest-auth/login/`, {
        method: "POST",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      })
        .then((resp) => resp.json())
        .then((data) => {
          console.log("login return:", data);
          if (!data.access_token) {
            console.log("Invalid Login!");
            alert("invalid login");
            return;
          }
          setCookie("jwt-auth", data.access_token);

          let { from } = location.state || { from: { pathname: "/" } };
          history.replace(from);
        })
        .catch((error) => console.log("error ->", error));
    }
  }

  return (
    <Paper
      style={{
        margin: "1em",
        padding: "1em",
        height: "fit-content",
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex" }}>
        <div style={{ width: "50%" }} onClick={(e) => setIsRegistration(false)}>
          <p>Login</p>
        </div>
        <div style={{ width: "50%" }} onClick={(e) => setIsRegistration(true)}>
          <p>Register</p>
        </div>
      </div>
      <div>
        <form onSubmit={onSubmit}>
          <div>
            <label>
              Username
              <input
                onChange={(e) => changeUsername(e.target.value)}
                value={username}
                type={"input"}
                name={"username"}
              />
            </label>
          </div>
          <div>
            <label>
              Password
              <input
                onChange={(e) => changePassword(e.target.value)}
                value={password}
                type={"password"}
                name={"password"}
              />
            </label>
          </div>
          {isRegistering && (
            <div>
              <label>
                Confirm Password
                <input
                  onChange={(e) => changePassword2(e.target.value)}
                  value={password2}
                  type={"password"}
                  name={"password2"}
                />
              </label>
            </div>
          )}
          <Button variant="contained" type={"submit"}>
            {isRegistering ? "Register" : "Login"}
          </Button>
        </form>
      </div>
    </Paper>
  );
}

export { AuthRow, is_authenticated };
