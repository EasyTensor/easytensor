import React from "react";

import { is_authenticated } from "./auth";
import { useCookies } from "react-cookie";
import { Route, Redirect } from "react-router-dom";

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function PrivateRoute({ children, ...rest }) {
  const [cookies] = useCookies();
  console.log("private route cookies: ", cookies)

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
