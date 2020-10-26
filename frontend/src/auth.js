import React, { useState } from "react";
import { CookiesProvider, Cookies, useCookies } from "react-cookie";
import { useHistory, useLocation } from "react-router-dom";

function is_authenticated(cookies) {
  return Boolean(
    "jwt-auth" in cookies &&
      cookies["jwt-auth"] != undefined &&
      cookies["jwt-auth"] != "undefined"
  );
}

function AuthRow() {
  // const [isLoggedIn, setLoggedIn] = useState(false)

  let history = useHistory();
  let location = useLocation();
  const [cookies, setCookie, removeCookie] = useCookies(["jwt-auth"]);
  console.log("JWT: ", cookies);

  const [isLoggedIn, setIsLoggedIn] = useState(is_authenticated(cookies));
  const [isRegistering, setIsRegistration] = useState(false);
  const [resp, changeResponse] = useState(null);
  const [username, changeUsername] = useState("");
  const [password, changePassword] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    if (isRegistering) {
      return fetch("http://localhost:8000/dj-rest-auth/registration/", {
        method: "POST",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: username,
          password1: password,
          password2: password,
        }),
      })
        .then((resp) => resp.json())
        .then((data) => {
          console.log("login return:", data);
          setCookie("jwt-auth", data.access_token);
          setIsLoggedIn(is_authenticated(cookies));
          changeResponse(data);
        })
        .catch((error) => console.log("error ->", error));
    } else {
      return fetch("http://localhost:8000/dj-rest-auth/login/", {
        method: "POST",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      })
        .then((resp) => resp.json())
        .then((data) => {
          console.log("login return:", data);
          if (!data.access_token) {
            console.log("Invalid Login!");
            alert("invalid login");
            return;
          }
          setCookie("jwt-auth", data.access_token);
          setIsLoggedIn(is_authenticated(cookies));

          let { from } = location.state || { from: { pathname: "/" } };
          history.replace(from);
        })
        .catch((error) => console.log("error ->", error));
    }
  }

  function logout() {
    removeCookie("jwt-auth");
    setIsLoggedIn(false);
  }

  return (
    <div>
      <header className="App-header">
        <h1>{isRegistering ? "Register" : "Login"}</h1>
        <div>
          <form onSubmit={onSubmit}>
            <div>
              <label>
                {" "}
                Username
                <input
                  onChange={(e) => changeUsername(e.target.value)}
                  value={username}
                  type={"input"}
                  name={"username"}
                />
              </label>
            </div>
            <div>
              <label>
                {" "}
                Password
                <input
                  onChange={(e) => changePassword(e.target.value)}
                  value={password}
                  type={"password"}
                  name={"password"}
                />
              </label>
            </div>
            <button type={"submit"}>Submit</button>
          </form>
          <div style={{ display: "flex" }}>
            <div
              style={{ width: "50%" }}
              onClick={(e) => setIsRegistration(false)}
            >
              <p>Login</p>
            </div>
            <div
              style={{ width: "50%" }}
              onClick={(e) => setIsRegistration(true)}
            >
              <p>Register</p>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export { AuthRow, is_authenticated };
