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
import { GetModels, PatchModel } from "./api";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

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

function Model({ model, onDelete }) {
  const name = model.name;
  const address = model.address;
  const id = model.id;
  const size = model.size;
  const scale = model.scale;
  const [isDeployed, setDeployed] = useState(model.deployed);

  function delete_model(model_id) {
    console.log("Deleting", model_id);
    axios.delete(`${BACKEND_HTTP_URL}/models/${model_id}/`).then((response) => {
      onDelete(model_id);
    });
  }

  function download_model(model_id) {
    alert("functionality not implemented");
    //TODO: implement this
  }

  function switchDeploy() {
    // patch to whatever the opposite of this is
    PatchModel(id, { deployed: !isDeployed }).then((resp) => {
      if (resp.status != 200) {
        console.log(resp);
        alert("could not update models");
        throw "could not update models";
      }
      setDeployed(!isDeployed);
    });
  }

  return (
    <Grid item>
      <Card foo="bar" style={{ padding: ".5em", borderRadius: "1em" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexGrow: 1,
              textAlign: "left",
            }}
          >
            <Typography variant="h5">{name}</Typography>
          </div>
          <div>
            <ToolTip title="Download Model">
              <IconButton onClick={() => download_model(id)} color="primary">
                <CloudDownload />
              </IconButton>
            </ToolTip>
            <ToolTip title="Delete Model">
              <IconButton onClick={() => delete_model(id)} color="primary">
                <Delete />
              </IconButton>
            </ToolTip>
          </div>
        </div>
        <p>id: {id}</p>
        <p>address: {address}</p>
        <p>
          size:{" "}
          {Math.round(size / 1024 / 1024) < 1
            ? Math.round(model.size / 1024) + "KB"
            : Math.round(size / 1024 / 1024) + "MB"}
        </p>
        <p>scale: {scale}</p>
         Not Deployed <Switch
          checked={isDeployed}
          onChange={switchDeploy}
          name="isDeployed"
          color="primary"
          inputProps={{ "aria-label": "secondary checkbox" }}
        /> Deployed
        {/* <button onClick={() => delete_model(model.id)}>Delete</button> */}
      </Card>
    </Grid>
  );
}

function ModelList() {
  console.log("model list rendering");
  const [models, setModels] = useState([]);

  useEffect(() => {
    GetModels().then((response) => {
      console.log("response:", response);
      setModels(response.data);
    });
  }, []);

  function onModelDelete(model_id) {
    setModels((models) => models.filter((model) => model.id != model_id));
  }

  if (models.length <= 0) {
    return <EmptyModelList />;
  }

  return (
    <Grid container spacing={2}>
      {models.map((model) => (
        <Model model={model} onDelete={onModelDelete} />
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
