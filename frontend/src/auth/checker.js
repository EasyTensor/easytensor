import Cookies from "universal-cookie";
const cookies = new Cookies();

function is_authenticated() {
  return Boolean(
    cookies.get("jwt-auth") != "" &&
      cookies.get("jwt-auth") != undefined &&
      cookies.get("jwt-auth") != "undefined"
  );
}

export { is_authenticated };
