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
import { CleanLink } from "../link";
import Tooltip from "@material-ui/core/Tooltip";


import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import { Registration } from "./registration";
import { Login } from "./login";

function AuthCard() {
  let history = useHistory();
  let location = useLocation();
  const [cookies, setCookie, removeCookie] = useCookies();
  const [isRegistering, setIsRegistration] = useState(false);
  const [username, changeUsername] = useState("");
  const [password, changePassword] = useState("");
  const [password2, changePassword2] = useState("");
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    // 0 for login, 1 for registration
    if(newValue == 1) {
      setIsRegistration(true)
    } else {
      setIsRegistration(false)
    }
    setValue(newValue)
  };


  return (
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
  );
}

export { AuthCard };
