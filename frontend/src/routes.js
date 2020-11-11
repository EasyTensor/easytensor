import React from "react";

import { is_authenticated } from "./auth/helper";
import { Route, Redirect } from "react-router-dom";
import { useCookies } from "react-cookie";

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function PrivateRoute({ children, ...rest }) {
  const [cookies, setCookies, removeCookies] = useCookies();
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
