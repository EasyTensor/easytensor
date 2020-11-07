import Cookies from "universal-cookie";
import { BACKEND_URL } from "./constants";
import axios from "axios";

const cookies = new Cookies();

function getAuthorization() {
  return `Bearer ${cookies.get("jwt-auth")}`;
}
function getConfig() {
  return {
    headers: { Authorization: getAuthorization() },
  };
}

export function CreateModel(body) {
  return axios.post(`${BACKEND_URL}/v1/models/`, body, getConfig());
}
export function GetModels() {
  return axios.get(`${BACKEND_URL}/v1/models/`, getConfig());
}

export function PatchModel(model_id, patch_body) {
  return axios.patch(
    `${BACKEND_URL}/v1/models/${model_id}/`,
    patch_body,
    getConfig()
  );
}

export function PostModelUploadURL(body) {
  return axios.post(`${BACKEND_URL}/v1/model-uploads/`, body, getConfig());
}

export function DeleteAllModels(body) {
  return axios.delete(`${BACKEND_URL}/v1/models/`, getConfig());
}

export function DeleteModel(model_id) {
  return axios.delete(
    `${BACKEND_URL}/v1/models/${model_id}/`,
    getConfig()
  );
}

export function PostRegistration(username, password1, password2) {
  return fetch(`${BACKEND_URL}/v1/dj-rest-auth/registration/`, {
    method: "POST",
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      username: username,
      password1: password1,
      password2: password2,
    }),
  });
}

export function PostLogin(username, password) {
  return fetch(`${BACKEND_URL}/v1/dj-rest-auth/login/`, {
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
  });
}
