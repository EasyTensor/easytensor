import React, { useState } from "react";
import Paper from "@material-ui/core/Paper";
import { AccountCircle } from "@material-ui/icons";
import Button from "@material-ui/core/Button";
import { BACKEND_URL } from "./constants";
import { useCookies } from "react-cookie";
import { useHistory } from "react-router-dom";

function AccountPage() {
  const [currentPassword, changeCurrentPassword] = useState("");
  const [newPassword, changeNewPassword] = useState("");
  const [newPassword2, changeNewPassword2] = useState("");
  const [cookies, setCookie, removeCookie] = useCookies(["jwt-auth"]);
  let history = useHistory();

  function onChangePassword(e) {
    e.preventDefault();
    return fetch(`${BACKEND_URL}/dj-rest-auth/password/change/`, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${cookies["jwt-auth"]}`,
      },
      body: JSON.stringify({
        new_password1: newPassword,
        new_password2: newPassword2,
        old_password: currentPassword,
      }),
    })
      .then((resp) => {
        if (!resp.ok) {
          alert("Invalid credentials!");
          throw resp.text();
        } else {
          return resp.json();
        }
      })
      .then((data) => {
        console.log("password change return:", data);
        alert("New password saved. Login with your new credentials");
        removeCookie("jwt-auth");
        let { from } = { from: { pathname: "/" } };
        history.replace(from);
      })
      .catch((error) => console.log("error ->", error));
  }
  return (
    <div>
      <Paper
        elevation={24}
        style={{
          textAlign: "center",
          width: "80%",
          borderRadius: "1em",
          margin: "1em 0em 1em 0em",
          padding: "1em",
        }}
      >
        <div style={{ display: "flex" }}>
          <AccountCircle /> {}
        </div>
      </Paper>
      <Paper
        elevation={24}
        style={{
          textAlign: "center",
          width: "80%",
          borderRadius: "1em",
          margin: "1em 0em 1em 0em",
          padding: "1em",
        }}
      >
        <h4>Reset Password</h4>
        <div>
          <form onSubmit={onChangePassword}>
            <div>
              <label>
                Current Password
                <input
                  onChange={(e) => changeCurrentPassword(e.target.value)}
                  value={currentPassword}
                  type={"password"}
                  name={"currentPassword"}
                />
              </label>
            </div>
            <div>
              <label>
                New Password
                <input
                  onChange={(e) => changeNewPassword(e.target.value)}
                  value={newPassword}
                  type={"password"}
                  name={"newPassword"}
                />
              </label>
            </div>
            <div>
              <label>
                Confirm New Password
                <input
                  onChange={(e) => changeNewPassword2(e.target.value)}
                  value={newPassword2}
                  type={"password"}
                  name={"newPassword2"}
                />
              </label>
            </div>
            <Button type={"submit"} variant="contained">
              Change Password
            </Button>
          </form>
        </div>
      </Paper>
    </div>
  );
}

export { AccountPage };
