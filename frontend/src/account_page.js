import React, { useState, useEffect } from "react";
import Paper from "@material-ui/core/Paper";
import { AccountCircle, SubscriptionsSharp } from "@material-ui/icons";
import { CleanLink } from "./link";

import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { useHistory } from "react-router-dom";
import { GetSubscriptions, PostChangePassword } from "./api";
import { remove_jwt_cookie } from "./auth/helper";
import { useCookies } from "react-cookie";

const SUBSCRIPTION = {
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
  const [subscriptions, setSubscription] = useState([]);
  const [currentPassword, changeCurrentPassword] = useState("");
  const [newPassword, changeNewPassword] = useState("");
  const [newPassword2, changeNewPassword2] = useState("");
  let history = useHistory();

  useEffect(() => {
    GetSubscriptions().then((res) => {
      const subs = res.data;
      setSubscription(subs);
    });
  }, []);

  const subscriptionList =
    subscriptions.length == 0 ? (
      <Typography>Free</Typography>
    ) : (
      <div>
        {subscriptions.map((sub) => (
          <div style={{ display: "flex" }}>
            <div style={{ padding: "0.5em" }}>
              <Typography>
                {
                  {
                    DEVELOPMENT: "Development",
                    PRODUCTION: "Production",
                  }[sub.plan]
                }
              </Typography>
            </div>
            <div style={{ padding: "0.5em" }}>
              {sub.start_date} - {sub.end_date}
            </div>
          </div>
        ))}
      </div>
    );

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
        window.location.reload();
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
          borderRadius: "1em",
          margin: "1em 0em 1em 0em",
        }}
      >
        <div
          style={{
            display: "flex",
            backgroundColor: "rgba(255, 117, 13, 0.1)",
          }}
        >
          <div
            style={{
              padding: "1em",
            }}
          >
            <AccountCircle />
          </div>
          <div style={{ padding: "1em" }}>
            <Typography>{username}</Typography>
          </div>
        </div>
        <div>
          {subscriptionList}
          <div style={{ padding: "1em" }}>
            <CleanLink to="/pricing">
              <Button color="primary" variant="contained">
                Modify
              </Button>
            </CleanLink>
          </div>
        </div>
      </Paper>
      <Paper
        elevation={24}
        style={{
          textAlign: "center",
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
              <TextField
                id="old_password"
                label="Current Password"
                type={"password"}
                value={currentPassword}
                onChange={(e) => changeCurrentPassword(e.target.value)}
                fullWidth
              />
            </div>
            <div>
              <TextField
                id="new_password"
                label="New Password"
                type={"password"}
                value={newPassword}
                onChange={(e) => changeNewPassword(e.target.value)}
                fullWidth
              />
            </div>
            <div>
              <TextField
                id="confirm_new_password"
                label="Confirm New Password"
                type={"password"}
                value={newPassword2}
                onChange={(e) => changeNewPassword2(e.target.value)}
                fullWidth
              />
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
