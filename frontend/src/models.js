import React, { useState, useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import { Delete, Add, CloudDownload } from "@material-ui/icons";
import Button from "@material-ui/core/Button";
import Fab from "@material-ui/core/Fab";

import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import ToolTip from "@material-ui/core/Tooltip";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Paper from "@material-ui/core/Paper";
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { green, yellow, red, grey } from '@material-ui/core/colors';
import Error from "@material-ui/icons/Error"
import Check from "@material-ui/icons/Check"
import LoopIcon from '@material-ui/icons/Loop';
import Stop from '@material-ui/icons/Stop';
import TfIcon from "./images/tf_icon.png"
import { CleanLink } from "./link";
import Tooltip from "@material-ui/core/Tooltip";
import {
  GetModels,
  PatchModel,
  DeleteModel,
  DeleteAllModels,
  GetModelStatus,
} from "./api";
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
  return <div style={{ "paddingRight": "0.25em" }}>
    {
      {
        TF: (
          <ToolTip title="TensorFlow model">
            <img src={TfIcon} style={{ width: "20px", height: "20px" }} />
          </ToolTip>
        ),
        PT: (
          <ToolTip title="PyTorch model" >
            <img src={TfIcon} style={{ width: "20px", height: "20px" }} />
          </ToolTip>
        ),
      }[model.framework]
    }
  </div>
}


function getModelStatusIndicator(status) {
  return (
    <div style={{ paddingLeft: ".25em", paddingRight: ".25em" }}>
      <ToolTip title={"Model deployment is " + status}>
        {
          {
            "Ready": <FiberManualRecordIcon style={{ color: green[500] }} />,
            "Not Ready": <FiberManualRecordIcon style={{ color: yellow[500] }} />,
            "Failed": <Error style={{ color: red[500] }} />,
            "Not Deployed": <FiberManualRecordIcon style={{ color: grey[700] }} />,
            "Retrieving...": <LoopIcon />,
          }[status]
        }
      </ToolTip>
    </div>
  )
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
function EditableText({ initialText, editedCallback, emptyPlaceHolder = "", variant = "body1", style, inputstyle }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialText);
  if (isEditing) {
    return (
      <ToolTip title="Click ✔ to save" open={isEditing} arrow placement="top">
        <div
          style={{
            display: "flex",
            border: "solid",
            borderColor: "#bbb",
            borderWidth: "0.05em",
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: "0.25em",
            ...style
          }}
        >
          <textarea
            // type="text"
            onChange={(e) => setEditValue(e.target.value)}
            value={editValue}
            style={{ border: "none 0", outline: "none", flexGrow: "1", ...inputstyle }}
          />
          <Check onClick={(e) => {
            editedCallback(editValue);
            setIsEditing(false);
          }} />
        </div>
      </ToolTip>
    );
  } else {
    return (
      <Typography
        variant={variant}
        onMouseOver={(e) => {
          e.target.style.borderColor = "#bbb";
        }}
        onMouseOut={(e) => (e.target.style.borderColor = "transparent")}
        style={{
          display: "flex",
          flexGrow: 1,
          overflow: "hidden",
          textAlign: "left",
          borderWidth: "0.01em",
          borderRadius: "0.1em",
          borderStyle: "solid",
          borderColor: "transparent",
          ...style
        }}
        onChange={(e) => console.log(e.target)}
        onClick={() => setIsEditing(true)}
      >
        {initialText.trim() ? initialText : emptyPlaceHolder}
      </Typography>
    );
  }
}
function Model({ model, onDelete }) {
  const [name, setName] = useState(model.name);
  const [description, setDescription] = useState(model.description);
  // const address = model.address;
  const id = model.id;
  const size = model.size;
  // const scale = model.scale;
  const [isDeployed, setDeployed] = useState(model.deployed);
  const [status, setStatus] = useState("Retrieving...");

  useEffect(() => {
    GetModelStatus(id).then((resp) => {
      if (resp.status != 200) {
        console.log("could not fetch model status");
        console.log(resp.data);
      }
      console.log("for model", id, resp.data);
      setStatus(resp.data.status);
    });
  });

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
        alert("could not update models");
        console.log(resp.data);
        throw "could not update models";
      }
      setDeployed(!isDeployed);
    });
  }

  function handleNameEdit(newName) {
    console.log("callback!");
    PatchModel(id, { name: newName }).then((resp) => {
      if (resp.status != 200) {
        alert("could not update model name");
      }
      setName(newName);
    });
  }


  function handleDescriptionEdit(newDescription) {
    console.log("callback!");
    PatchModel(id, { description: newDescription }).then((resp) => {
      if (resp.status != 200) {
        console.log("could not update model description");
        alert("could not update model description");
      }
      setDescription(newDescription);
    }).catch(error => {
      console.log(error);
      alert("could not update model description");
    });
  }

  return (
    <Grid item xs={4}>
      <Card foo="bar" style={{ padding: ".5em", borderRadius: "1em" }}>
        <div style={{
          display: "flex", justifyContent: "space-between"
        }}>
          <EditableText
            initialText={name}
            editedCallback={handleNameEdit}
            variant="h5"
            style={{ alignItems: "center" }}
          />
          <div>
            <ToolTip title="Delete Model">
              <IconButton onClick={() => delete_model(id)} color="primary">
                <Delete />
              </IconButton>
            </ToolTip>
          </div>
        </div>
        <div style={{ alignItems: "end", display: "flex" }}>
          {getModelFrameworkIcon(model)}
          {getModelStatusIndicator(status)}
          <Typography style={{ "paddingLeft": ".25em", "paddingRight": ".25em" }}>{model.public ? "Public" : "Private"}</Typography>
        </div>
        <p>id: {id}</p>
        <p>
          size:
          {Math.round(size / 1024 / 1024) < 1
            ? Math.round(model.size / 1024) + "KB"
            : Math.round(size / 1024 / 1024) + "MB"}
        </p>
        <EditableText
          initialText={description}
          editedCallback={handleDescriptionEdit}
          emptyPlaceHolder="Add a description..."
          style={{ minHeight: "6em", width: "100%", margin: "1em 0 1em 0", variant: "body2" }}
          inputstyle={{ minHeight: "6em" }}
        />
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
