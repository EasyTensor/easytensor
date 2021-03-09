import React, { useState, useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import { Delete, Add, CloudDownload } from "@material-ui/icons";
import Button from "@material-ui/core/Button";
import Fab from "@material-ui/core/Fab";

import IconButton from "@material-ui/core/IconButton";
import ToolTip from "@material-ui/core/Tooltip";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import TfIcon from "./images/tf_icon.png"
import {
  GetModels,
  PatchModel,
  DeleteModel,
  DeleteAllModels,
  GetModelStatus,
} from "./api";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { QueryModal } from "./query_modal";
import Dialog from "@material-ui/core/Dialog";

function DeleteAll() {
  function delete_models() {
    console.log("deleting all models");
    DeleteAllModels();
  }

  return <button onClick={delete_models}>delete all</button>;
}
function getModelFrameworkIcon(model) {
  return {
    TF: <img src={TfIcon} style={{ width: "20px", height: "20px" }} title="TensorFlow model" />,
    PT: <img src={TfIcon} style={{ width: "20px", height: "20px" }} title="PyTorch model" />,
  }[model.framework]
}

// todo: add ability to finish editing with click outside div
// https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
function EditableText({ initialText, editedCallback }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialText);
  if (isEditing) {
    return (
      <input
        variant="h5"
        type="text"
        onChange={(e) => setEditValue(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            editedCallback(editValue);
            setIsEditing(false);
          }
        }}
        value={editValue}
      />
    );
  } else {
    return (
      <Typography
        variant="h5"
        onMouseOver={(e) => {
          e.target.style.borderColor = "#bbb";
        }}
        onMouseOut={(e) => (e.target.style.borderColor = "transparent")}
        style={{
          display: "flex",
          alignItems: "center",
          flexGrow: 1,
          textAlign: "left",
          borderWidth: "0.01em",
          borderRadius: "0.1em",
          borderStyle: "solid",
          borderColor: "transparent",
        }}
        onChange={(e) => console.log(e.target)}
        onClick={() => setIsEditing(true)}
      >
        {initialText}
      </Typography>
    );
  }
}
function Model({ model, onDelete }) {
  const [name, setName] = useState(model.name);
  // const address = model.address;
  const id = model.id;
  const size = model.size;
  // const scale = model.scale;
  const [isDeployed] = useState(model.deployed);

  function delete_model(model_id) {
    console.log("Deleting", model_id);
    DeleteModel(model_id).then(() => {
      onDelete(model_id);
    });
  }

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };


  return (
    <Grid item xs={4}>
      <Card foo="bar" style={{ padding: ".5em", borderRadius: "1em" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {getModelFrameworkIcon(model)}
          <Typography variant="h5" style={{
            display: "flex",
            flexGrow: 1,
            overflow: "hidden",
            textAlign: "left",
            borderWidth: "0.01em",
            borderRadius: "0.1em",
            borderStyle: "solid",
            borderColor: "transparent",
          }}>
            {name}
          </Typography>
          <div>
            <ToolTip title="Delete Model">
              <IconButton onClick={() => delete_model(id)} color="primary">
                <Delete />
              </IconButton>
            </ToolTip>
          </div>
        </div>


        <p>id: {id}</p>
        <p>
          size:
          {Math.round(size / 1024 / 1024) < 1
            ? Math.round(model.size / 1024) + "KB"
            : Math.round(size / 1024 / 1024) + "MB"}
        </p>
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpen}
              disabled={!isDeployed}
            >
              Query
            </Button>
          </div>
          <Dialog
            fullWidth={true}
            maxWidth="lg"
            open={open}
            onClose={handleClose}
            aria-labelledby="max-width-dialog-title"
          >
            <QueryModal model={model} />
          </Dialog>
        </div>
      </Card>
    </Grid>
  );
}

function ModelList() {
  const [models, setModels] = useState([]);

  useEffect(() => {
    GetModels("public=true").then((response) => {
      setModels(response.data);
    });
  }, []);

  return (
    <Grid container spacing={2}>
      {models.map((model) => (
        <Model model={model} />
      ))}
    </Grid>
  );
}
function ExplorePage() {
  return (
    <div style={{ width: "80%" }}>
      <ModelList />
    </div>
  );
}
export { ExplorePage };
