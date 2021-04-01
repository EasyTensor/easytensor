import Cookies from "universal-cookie";
const cookies = new Cookies();

function is_authenticated(reactCookies) {
  console.log("checking if is authenticated");
  const authCookie = reactCookies["jwt-auth"];
  console.log(authCookie);
  return (
    authCookie != "" && authCookie != undefined && authCookie != "undefined"
  );
}

// allCookies could be react cookeis or static global cookies
// this function helps maintain a uniform way to access the
function get_jwt_cookie() {
  return cookies.get("jwt-auth", { path: "/" });
}

function remove_jwt_cookie() {
  console.log("removing the JWT token");
  for (const [key, value] of Object.entries(cookies.cookies)) {
    console.log("cookie to delete:", key, value);
  }
  cookies.remove("jwt-auth", { path: "/" });
}

export { is_authenticated, get_jwt_cookie, remove_jwt_cookie };
