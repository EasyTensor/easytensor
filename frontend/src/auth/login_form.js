import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import { PostLogin } from "../api";
import { useCookies } from "react-cookie";

function Login() {
  // const [isLoggedIn, setLoggedIn] = useState(false)

  let history = useHistory();
  let location = useLocation();
  const [cookies, setCookie, cookie] = useCookies();

  const [email, changeEmail] = useState("");
  const [password, changePassword] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    console.log(e);

    return PostLogin(email, password)
      .then((resp) => {
        if (!resp.data.access_token) {
          alert("invalid login");
          console.log(resp.data);
          return;
        }

        setCookie("jwt-auth", resp.data.access_token, {
          path: "/",
          maxAge: 60 * 60 * 24,
        });

        const to_loc = { pathname: "/" };
        history.replace(to_loc);
      })
      .catch((error) => {
        alert("Invalid Login.");
        if ("response" in error && "data" in error.response) {
          alert(JSON.stringify(error.response.data));
        }
        console.log("error ->", error);
      })
      .catch((error) => {
        alert("An unexpected error occured.");
        console.log("error ->", error);
      });
  }

  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: "grid", padding: "1em", margin: "1em" }}>
        <TextField
          id="standard-basic"
          label="Email"
          onChange={(e) => changeEmail(e.target.value)}
          value={email}
          type="email"
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
        <Button
          color="primary"
          variant="contained"
          type={"submit"}
          style={{ width: "70%" }}
        >
          Login
        </Button>
      </div>
    </form>
  );
}

export { Login };
