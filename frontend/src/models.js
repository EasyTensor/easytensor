import React, { useState, useEffect } from "react";
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
import { GetModels, PatchModel, DeleteModel, DeleteAllModels } from "./api";
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
function getModelFrameworkString(model) {
  return {
    TF: "TensorFlow",
    PT: "PyTorch",
  }[model.framework];
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
            editedCallback(editValue)
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
  const [isDeployed, setDeployed] = useState(model.deployed);

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

  function switchDeploy() {
    // patch to whatever the opposite of this is
    PatchModel(id, { deployed: !isDeployed }).then((resp) => {
      if (resp.status != 200) {
        console.log(resp.data);
        alert("could not update models");
        throw "could not update models";
      }
      setDeployed(!isDeployed);
    });
  }

  function handleNameEdit(newName) {
    console.log("callback!")
    PatchModel(id, {name: newName}).then((resp) => {
      if (resp.status != 200) {
        alert("could not update model name");
      }
      setName(newName);
    })
  }

  return (
    <Grid item xs={4}>
      <Card foo="bar" style={{ padding: ".5em", borderRadius: "1em" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <EditableText initialText={name} editedCallback={handleNameEdit}></EditableText>
          <div>
            <ToolTip title="Delete Model">
              <IconButton onClick={() => delete_model(id)} color="primary">
                <Delete />
              </IconButton>
            </ToolTip>
          </div>
        </div>
        <p>{getModelFrameworkString(model)}</p>
        <p>id: {id}</p>
        <p>
          size:
          {Math.round(size / 1024 / 1024) < 1
            ? Math.round(model.size / 1024) + "KB"
            : Math.round(size / 1024 / 1024) + "MB"}
        </p>
        <div style={{ display: "flex" }}>
          <div style={{ flexGrow: 1 }}>
            Not Deployed
            <Switch
              checked={isDeployed}
              onChange={switchDeploy}
              name="isDeployed"
              color="primary"
              inputProps={{ "aria-label": "secondary checkbox" }}
            />
            Deployed
          </div>
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
    GetModels().then((response) => {
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
