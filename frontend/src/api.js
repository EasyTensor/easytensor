import { BACKEND_URL, QUERY_URL, REPORTER_URL } from "./constants";
import axios from "axios";
import { get_jwt_cookie } from "./auth/helper";

// returns null if the app is not authorized.
// else returns the header content required for authorization.
function getAuthorization() {
  const jwt_cookie = get_jwt_cookie();
  if (jwt_cookie === null || jwt_cookie === undefined) {
    return null;
  }
  return `Bearer ${get_jwt_cookie()}`;
}
function getConfig() {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const auth = getAuthorization();
  if (auth !== null) {
    headers.Authorization = auth;
  }
  return {
    headers: headers,
  };
}

export function CreateModel(body) {
  return axios.post(`${BACKEND_URL}/v1/models/`, body, getConfig());
}

export function GetModels(query = "") {
  return axios.get(`${BACKEND_URL}/v1/models/?${query}`, getConfig());
}

export function GetModel(model_id) {
  return axios.get(`${BACKEND_URL}/v1/models/${model_id}/`, getConfig());
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

export function GetModelPage(model_id) {
  return axios.get(`${BACKEND_URL}/v1/models/${model_id}/page`, getConfig());
}

export function CreateModelPage(model_id, body) {
  return axios.post(
    `${BACKEND_URL}/v1/models/${model_id}/page`,
    body,
    getConfig()
  );
}

export function PatchModelPage(model_id, body) {
  return axios.patch(
    `${BACKEND_URL}/v1/models/${model_id}/page`,
    body,
    getConfig()
  );
}

export function GetModelDownloadLink(model_id) {
  return axios.get(`${BACKEND_URL}/v1/model-uploads/${model_id}/`, getConfig());
}

export function GetModelStatus(model_id) {
  return axios.get(
    `${REPORTER_URL}/info/model-status/${model_id}`,
    getConfig()
  );
}

export function GetModelPodList(model_id) {
  return axios.get(`${REPORTER_URL}/info/logs/list/${model_id}`, getConfig());
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

// Subscriptions
export function GetSubscriptions() {
  return axios.get(`${BACKEND_URL}/v1/payments/subscriptions/`, getConfig());
}

export function DeleteSubscription(subscription_id) {
  return axios.delete(
    `${BACKEND_URL}/v1/payments/subscriptions/${subscription_id}`,
    getConfig()
  );
}

export function Query(access_token, body) {
  return axios.post(`${QUERY_URL}/query/`, body, {
    headers: { accessToken: access_token },
  });
}

export function PostRegistration(username, email, password1, password2) {
  return axios.post(
    `${BACKEND_URL}/v1/dj-rest-auth/registration/`,
    {
      username: username,
      email: email,
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

export function CreateCheckoutSession(price_id) {
  return axios.post(
    `${BACKEND_URL}/v1/payments/create-checkout-sesssion`,
    {
      price_id: price_id,
    },
    getConfig()
  );
}

export function GetCheckoutSession(session_id) {
  return axios.post(
    `${BACKEND_URL}/v1/payments/get-checkout-sesssion`,
    {
      session_id: session_id,
    },
    getConfig()
  );
}

export function GetCustomerPortal(session_id) {
  return axios.post(
    `${BACKEND_URL}/v1/payments/get-customer-portal`,
    {
      session_id: session_id,
    },
    getConfig()
  );
}
