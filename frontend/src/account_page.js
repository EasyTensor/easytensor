import React, { useState } from "react";
import Paper from "@material-ui/core/Paper";
import { AccountCircle } from "@material-ui/icons";
import Button from "@material-ui/core/Button";

function AccountPage() {
  const [currentPassword, changeCurrentPassword] = useState("");
  const [newPassword, changeNewPassword] = useState("");
  const [newPassword2, changeNewPassword2] = useState("");

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
          <form>
            <div>
              <label>
                Current Password
                <input
                  onChange={(e) => changeCurrentPassword(e.target.value)}
                  value={currentPassword}
                  type={"input"}
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
                  type={"input"}
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
                  type={"input"}
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
