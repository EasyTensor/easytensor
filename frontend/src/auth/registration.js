import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { useHistory, useLocation } from "react-router-dom";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import { PostLogin, PostRegistration } from "../api";

function Registration() {
  let history = useHistory();
  let location = useLocation();
  const [cookies, setCookie, removeCookie] = useCookies();

  const [isRegistering, setIsRegistration] = useState(false);
  const [username, changeUsername] = useState("");
  const [email, changeEmail] = useState("");
  const [password, changePassword] = useState("");
  const [password2, changePassword2] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    return PostRegistration(username, email, password, password2)
      .then((resp) => {
        if (resp.status >= 300) {
          alert("Invalid Registration");
          alert(JSON.stringify(resp.data));
          throw resp.data;
        }
        setCookie("jwt-auth", resp.data.access_token, { maxAge: 60 * 60 * 24 });
        history.replace({ pathname: "/" });
      })
      .catch((error) => {
        console.log("error ->", error);
        alert(JSON.stringify(error.response.data));
      })
      .catch((error) => {
        alert("something unexpected happened.");
        console.log(error);
      });
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
          label="Email"
          onChange={(e) => changeEmail(e.target.value)}
          value={email}
        />
        <TextField
          id="standard-basic"
          label="Password"
          type="password"
          onChange={(e) => changePassword(e.target.value)}
          value={password}
        />
        <TextField
          id="standard-basic"
          label="Confirm Password"
          type="password"
          onChange={(e) => changePassword2(e.target.value)}
          value={password2}
        />
      </div>
      <div style={{ margin: "1em 0em 2em 0em" }}>
        <Button color="primary" variant="contained" type={"submit"} style={{ width: "70%" }}>
          Register
        </Button>
      </div>
    </form>
  );
}

export { Registration };
