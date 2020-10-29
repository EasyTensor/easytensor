import React, { useState, useEffect } from "react";
import { BACKEND_HTTP_URL } from "./constants";
import axios from "axios";
import { Bubble } from "./bubble";
import { Link } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import { Delete, Add } from "@material-ui/icons";
import Button from "@material-ui/core/Button";
import Fab from "@material-ui/core/Fab";

import IconButton from "@material-ui/core/IconButton";
import ToolTip from "@material-ui/core/Tooltip";

function DeleteAll() {
  function delete_models() {
    console.log("deleting all models");
    axios.delete(`${BACKEND_HTTP_URL}/models/`);
  }

  return <button onClick={delete_models}>delete all</button>;
}

function ModelList() {
  console.log("model list rendering");
  const [models, setModels] = useState([]);

  useEffect(() => {
    axios.get(`${BACKEND_HTTP_URL}/models/`).then((response) => {
      console.log("response:", response);
      setModels(response.data);
    });
  }, []);

  const delete_model = (model_id) => {
    console.log("Deleting", model_id);
    axios.delete(`${BACKEND_HTTP_URL}/models/${model_id}/`).then((response) => {
      setModels((models) => models.filter((model) => model.id != model_id));
    });
  };

  return (
    <div>
      {models.map((model) => (
        <Bubble>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ flexGrow: 1, textAlign: "left" }}>
              <Typography variant="h5">{model.name}</Typography>
            </div>
            <div>
              <ToolTip title="Delete Model">
                <IconButton
                  aria-label="Logout"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={() => delete_model(model.id)}
                  color="primary"
                >
                  <Delete />
                </IconButton>
              </ToolTip>
            </div>
          </div>
          <p>id: {model.id}</p>
          <p>address: {model.address}</p>
          <p>size: {Math.round(model.size / 1024)}MB</p>
          <p>scale: {model.scale}</p>
          {/* <button onClick={() => delete_model(model.id)}>Delete</button> */}
        </Bubble>
      ))}
    </div>
  );
}
function ModelPage() {
  return (
    <div style={{ width: "80%" }}>
      <ModelList />
      <Fab
        style={{
          position: "fixed",
          right: "2%",
          bottom: "2%",
          // color: "primary",
        }}
        color="secondary"
        aria-label="add"
      >
        <Add />
      </Fab>
    </div>
  );
}
export { ModelList, DeleteAll, ModelPage };
