import React, { useState } from "react";
import { CookiesProvider, Cookies, useCookies } from "react-cookie";
import { is_authenticated } from "./auth";
import { Link } from "react-router-dom";

function NavBar() {
  const [cookies, setCookie, removeCookie] = useCookies(["jwt-auth"]);

  function logout() {
    removeCookie("jwt-auth");
  }

  return (
    <div style={{ display: "flex" }}>
      <div>
        <Link to="/">Home</Link>
      </div>

      {is_authenticated(cookies) ? (
        <div onClick={(e) => logout()}>Logout</div>
      ) : (
        <div>
          <Link to="/login">Login</Link>
        </div>
      )}
    </div>
  );
}

export { NavBar };
