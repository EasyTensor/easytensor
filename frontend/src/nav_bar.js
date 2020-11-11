import React, { useState } from "react";
import { is_authenticated, remove_jwt_cookie } from "./auth/helper";
import ToolTip from "@material-ui/core/Tooltip";
import { useCookies } from "react-cookie";

import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import { ExitToApp, AccountCircle } from "@material-ui/icons";
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

  const [cookies, setCookie, removeCookie] = useCookies()

  function logout() {
    removeCookie("jwt-auth", {path: "/"})
  }
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="sticky" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h4" className={classes.title}>
            <CleanLink to="/">EasyTensor</CleanLink>
          </Typography>
          {is_authenticated(cookies) && (
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
            {is_authenticated(cookies) && (
              <div
                style={{
                  display: is_authenticated(cookies) ? "block" : "none",
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
