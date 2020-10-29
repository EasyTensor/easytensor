import Cookies from "universal-cookie";
import { BACKEND_HTTP_URL } from "./constants";
import axios from "axios";

const cookies = new Cookies();

function getAuthorization() {
  return `Bearer ${cookies.get("jwt-auth")}`;
}

export function GetModels() {
  return axios.get(`${BACKEND_HTTP_URL}/models/`, {
    headers: { Authorization: getAuthorization() },
  });
}
