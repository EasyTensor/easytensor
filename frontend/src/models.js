import React, { useState, useEffect } from "react";
import { BACKEND_HTTP_URL } from "./constants";
import axios from "axios";
import Typography from "@material-ui/core/Typography";
import { Delete, Add, CloudDownload } from "@material-ui/icons";
import Button from "@material-ui/core/Button";
import Fab from "@material-ui/core/Fab";

import IconButton from "@material-ui/core/IconButton";
import ToolTip from "@material-ui/core/Tooltip";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Paper from "@material-ui/core/Paper";
import { CleanLink } from "./link";
import Tooltip from "@material-ui/core/Tooltip";

function DeleteAll() {
  function delete_models() {
    console.log("deleting all models");
    axios.delete(`${BACKEND_HTTP_URL}/models/`);
  }

  return <button onClick={delete_models}>delete all</button>;
}

function EmptyModelList() {
  return (
    <Paper
      elevation={24}
      style={{
        minHeight: "80%",
        minWidth: "80%",
        backgroundColor: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "1em",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <p>You haven't uploaded any models yet.</p>
        <p>Let's try adding your first one!</p>
        <CleanLink to="/">
          <Button color="primary" variant="contained">
            Add Model
          </Button>
        </CleanLink>
      </div>
    </Paper>
  );
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

  const download_model = (model_id) => {
    alert("functionality not implemented");
    //TODO: implement this
  };

  if (models.length <= 0) {
    return <EmptyModelList />;
  }

  return (
    <Grid container spacing={2}>
      {models.map((model) => (
        <Grid item>
          <Card foo="bar" style={{ padding: ".5em" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexGrow: 1,
                  textAlign: "left",
                }}
              >
                <Typography variant="h5">{model.name}</Typography>
              </div>
              <div>
                <ToolTip title="Download Model">
                  <IconButton
                    onClick={() => download_model(model.id)}
                    color="primary"
                  >
                    <CloudDownload />
                  </IconButton>
                </ToolTip>
                <ToolTip title="Delete Model">
                  <IconButton
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
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
function ModelPage() {
  return (
    <div style={{ width: "80%" }}>
      <ModelList />
      <CleanLink to="/">
        <Tooltip title="Add Model">
          <Fab
            style={{
              position: "fixed",
              right: "2%",
              bottom: "2%",
              // color: "primary",
            }}
            color="secondary"
          >
            <Add />
          </Fab>
        </Tooltip>
      </CleanLink>
    </div>
  );
}
export { ModelList, DeleteAll, ModelPage };
