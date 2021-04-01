import React, { useState, useEffect } from "react";
import Paper from "@material-ui/core/Paper";
import { AccountCircle } from "@material-ui/icons";
import { CleanLink } from "./link";

import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { useHistory } from "react-router-dom";
import { GetSubscriptions, PostChangePassword } from "./api";
import { remove_jwt_cookie } from "./auth/helper";
import { useCookies } from "react-cookie";

const subscriptions = {
  FREE: {
    name: "Free Plan",
    cta_text: "Upgrade",
  },
  DEVELOPMENT: {
    name: "Development Plan",
    cta_text: "Upgrade",
  },
  PRODUCTION: {
    name: "Production Plan",
    cta_text: "Modify",
  },
};
function AccountPage() {
  const [cookies] = useCookies("user");
  const [username] = useState(cookies.user.email);
  const [subscription, setSubscription] = useState(subscriptions["FREE"]);
  const [currentPassword, changeCurrentPassword] = useState("");
  const [newPassword, changeNewPassword] = useState("");
  const [newPassword2, changeNewPassword2] = useState("");
  let history = useHistory();

  useEffect(() => {
    GetSubscriptions().then((res) => {
      const subs = res.data;
      if (subs.length == 0) {
        setSubscription(subscriptions["FREE"]);
        return;
      }
      setSubscription(subscriptions[subs[0]["plan"]]);
    });
  }, []);

  function onChangePassword(e) {
    e.preventDefault();
    return PostChangePassword(newPassword, newPassword2, currentPassword)
      .then((resp) => {
        if (!resp.status >= 300) {
        }
        alert("New password saved. Login with your new credentials");
        remove_jwt_cookie();
        let { from } = { from: { pathname: "/" } };
        history.replace(from);
      })
      .catch((error) => {
        if (
          error.hasOwnProperty("response") &&
          error.response.hasOwnProperty("data")
        ) {
          alert("Invalid credentials!");
          alert(JSON.stringify(error.response.data));
        } else {
          alert("unexpected error.");
          console.log(error);
        }
      });
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
        }}
      >
        <div style={{ display: "flex" }}>
          <div style={{ padding: "1em" }}>
            <AccountCircle />
          </div>
          <div style={{ padding: "1em" }}>
            <Typography>{username}</Typography>
          </div>
        </div>
        <div style={{ padding: "1em" }}>
          <Typography>{subscription.name}</Typography>
          <CleanLink to="/pricing">
            <Button color="primary" variant="contained">
              {subscription.cta_text}
            </Button>
          </CleanLink>
        </div>
      </Paper>
      <Paper
        elevation={24}
        style={{
          textAlign: "center",
          width: "80%",
          borderRadius: "1em",
          margin: "1em 0em 1em 0em",
        }}
      >
        <div style={{ padding: "1em" }}>
          <Typography variant="h6">Reset Password</Typography>
        </div>
        <div style={{ padding: "1em" }}>
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
            <div style={{ padding: "1em" }}>
              <Button type={"submit"} variant="contained" color="primary">
                Change Password
              </Button>
            </div>
          </form>
        </div>
      </Paper>
    </div>
  );
}

export { AccountPage };
