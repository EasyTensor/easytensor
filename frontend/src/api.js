import Cookies from "universal-cookie";
import { BACKEND_URL, QUERY_URL } from "./constants";
import axios from "axios";

const cookies = new Cookies();

function getAuthorization() {
  return `Bearer ${cookies.get("jwt-auth")}`;
}
function getConfig() {
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthorization(),
      Accept: "application/json",
    },
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
  return axios.delete(`${BACKEND_URL}/v1/models/${model_id}/`, getConfig());
}

// Token URLS
export function GetQueryAccessTokens() {
  return axios.get(`${BACKEND_URL}/v1/query-access-token/`, getConfig());
}

export function CreateQueryAccessToken(model_id) {
  return axios.post(
    `${BACKEND_URL}/v1/query-access-token/`,
    { model: model_id },
    getConfig()
  );
}

export function Query(access_token, body) {
  return axios.post(`${QUERY_URL}/query/`, body, {
    headers: { accessToken: access_token },
  });
}

export function PostRegistration(username, password1, password2) {
  return axios.post(
    `${BACKEND_URL}/v1/dj-rest-auth/registration/`,
    {
      username: username,
      password1: password1,
      password2: password2,
    },
    {
      withCredentials: false,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
}

export function PostLogin(username, password) {
  return axios.post(
    `${BACKEND_URL}/v1/dj-rest-auth/login/`,
    {
      username: username,
      password: password,
    },
    {
      withCredentials: false,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
}

export function PostChangePassword(
  new_password,
  new_password2,
  current_password
) {
  return axios.post(
    `${BACKEND_URL}/v1/dj-rest-auth/password/change/`,
    {
      new_password1: new_password,
      new_password2: new_password2,
      old_password: current_password,
    },
    {
      withCredentials: false,
      headers: getConfig()["headers"],
    }
  );
}
