import React, { useState } from "react";
import { CookiesProvider, Cookies, useCookies } from "react-cookie";
import { is_authenticated } from "./auth/checker";
import { Link } from "react-router-dom";
import ToolTip from "@material-ui/core/Tooltip";

import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import { ExitToApp, AccountCircle } from "@material-ui/icons";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import { withTheme } from "@material-ui/styles";
import { CleanLink } from "./link";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "flex-start",
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: "#ffffff00",
    boxShadow: "none",
  },
  title: {
    // flexGrow: 1,
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  headerItems: {
    display: "flex",
    flexGrow: 3,
    justifyContent: "flex-start",
  },
  headerItem: {
    padding: "1em",
  },
  rightMenu: {
    alignSelf: "flex-end",
  },
  endItems: {
    flexGrow: 1,
    display: "flex",
    justifyContent: "flex-end",
  },
}));

function NavBar() {
  const [cookies, setCookie, removeCookie] = useCookies();

  function logout() {
    console.log("removing the JWT token");
    removeCookie("jwt-auth");
  }
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  return (
    <div className={classes.root}>
      <AppBar position="sticky" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h4" className={classes.title}>
            <CleanLink to="/">EasyTensor</CleanLink>
          </Typography>
          {is_authenticated() && (
            <div className={classes.headerItems}>
              <Typography variant="h6" className={classes.headerItem}>
                <CleanLink to="/">Home</CleanLink>
              </Typography>
              <Typography variant="h6" className={classes.headerItem}>
                <CleanLink
                  to="/models"
                  // style={{ color: "white", textDecoration: "none" }}
                >
                  Models
                </CleanLink>
              </Typography>
            </div>
          )}
          <div className={classes.endItems}>
            {is_authenticated() && (
              <div
                style={{
                  display: is_authenticated() ? "block" : "none",
                }}
              >
                <ToolTip title="Account">
                  <CleanLink to="/account">
                    <IconButton
                      aria-label="Account"
                      aria-controls="menu-appbar"
                      aria-haspopup="true"
                      color="primary"
                    >
                      <AccountCircle />
                    </IconButton>
                  </CleanLink>
                </ToolTip>

                <ToolTip title="Logout">
                  <IconButton
                    aria-label="Logout"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={(e) => logout()}
                    color="primary"
                  >
                    <ExitToApp />
                  </IconButton>
                </ToolTip>
              </div>
            )}
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
}
export { NavBar };
