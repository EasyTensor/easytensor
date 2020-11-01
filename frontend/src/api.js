import Cookies from "universal-cookie";
import { BACKEND_HTTP_URL } from "./constants";
import axios from "axios";

const cookies = new Cookies();

function getAuthorization() {
  return `Bearer ${cookies.get("jwt-auth")}`;
}
function getConfig () {
  return {
    headers: { Authorization: getAuthorization() },
  }
}

export function CreateModel(body) {
  return axios.post(`${BACKEND_HTTP_URL}/models/`, body, getConfig());
}
export function GetModels() {
  return axios.get(`${BACKEND_HTTP_URL}/models/`, getConfig());
}

export function PatchModel(model_id, patch_body) {
  return axios.patch(`${BACKEND_HTTP_URL}/models/${model_id}/`, patch_body, getConfig())
}


export function PostModelUploadURL(body) {
  return axios.post(`${BACKEND_HTTP_URL}/model-uploads/`, body, getConfig())
}


export function DeleteAllModels(body) {
  return axios.delete(`${BACKEND_HTTP_URL}/models/`, getConfig())
}

export function DeleteModel(model_id) {
  return axios.delete(`${BACKEND_HTTP_URL}/models/${model_id}/`, getConfig())
}
