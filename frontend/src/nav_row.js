import React, { useState } from "react";
import { CookiesProvider, Cookies, useCookies } from "react-cookie";
import { is_authenticated } from "./auth";
import { Link } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import AccountCircle from "@material-ui/icons/AccountCircle";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import { withTheme } from "@material-ui/styles";

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
          <Typography variant="h4" noWrap className={classes.title}>
            <Link to="/" style={{ color: "white", textDecoration: "none" }}>
              EasyTensor
            </Link>
          </Typography>
          {is_authenticated(cookies) && (
            <div className={classes.headerItems}>
              <Typography variant="h6" className={classes.headerItem}>
                <Link to="/" style={{ color: "white", textDecoration: "none" }}>
                  Home
                </Link>
              </Typography>
              <Typography variant="h6" className={classes.headerItem}>
                <Link
                  to="/models"
                  style={{ color: "white", textDecoration: "none" }}
                >
                  Models
                </Link>
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
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={open}
                onClose={handleClose}
              >
                {/* <div onClick={(e) => logout()}></div> */}
                {/* <MenuItem onClick={handleClose}>Profile</MenuItem> */}
                <MenuItem onClick={(e) => logout()}>Logout</MenuItem>
              </Menu>
            </div>
            {/* ) : ( */}
            <div
              style={{
                display: is_authenticated(cookies) ? "none" : "block",
              }}
            >
              <Button variant="contained" color="secondary">
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
