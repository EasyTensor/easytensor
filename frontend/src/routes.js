import React, { useState } from "react";

import { is_authenticated } from "./auth";
import { CookiesProvider, Cookies, useCookies } from "react-cookie";
import { Route, Redirect } from "react-router-dom";

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function PrivateRoute({ children, ...rest }) {
  const [cookies, setCookie, removeCookie] = useCookies(["jwt-auth"]);

  return (
    <Route
      {...rest}
      render={({ location }) =>
        is_authenticated(cookies) ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}

export { PrivateRoute };
