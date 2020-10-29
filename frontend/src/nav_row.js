import React, { useState } from "react";
import { CookiesProvider, Cookies, useCookies } from "react-cookie";
import { is_authenticated } from "./auth";
import { Link } from "react-router-dom";
import ToolTip from "@material-ui/core/Tooltip";

import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import AccountCircle from "@material-ui/icons/AccountCircle";
import { ExitToApp } from "@material-ui/icons";
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
  const [cookies, setCookie, removeCookie] = useCookies(["jwt-auth"]);

  function logout() {
    console.log("removing the JWT token");
    removeCookie("jwt-auth");
  }
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    console.log("opening menu for event", event);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
            {/* {is_authenticated(cookies) ? ( */}
            <div
              style={{
                display: is_authenticated(cookies) ? "block" : "none",
              }}
            >
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
            {/* ) : ( */}
            <div
              style={{
                display: is_authenticated(cookies) ? "none" : "block",
              }}
            >
              <Button variant="contained" color="primary">
                Login
              </Button>
            </div>
            {/* )} */}
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
}
export { NavBar };