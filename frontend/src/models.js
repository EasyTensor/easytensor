import React, { useState, useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import { Delete, Add, CloudDownload, Link } from "@material-ui/icons";
import Button from "@material-ui/core/Button";
import Fab from "@material-ui/core/Fab";

import IconButton from "@material-ui/core/IconButton";
import ToolTip from "@material-ui/core/Tooltip";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Paper from "@material-ui/core/Paper";
import TfIcon from "./images/tf_icon.png"
import PyTorchIcon from "./images/pytorch_icon.png"
import { CleanLink } from "./link";
import {
  GetModels,
  PatchModel,
  DeleteModel,
  DeleteAllModels,
  GetModelStatus,
  GetModelDownloadLink,
} from "./api";
import Switch from "@material-ui/core/Switch";
import { QueryModal } from "./query_modal";
import Dialog from "@material-ui/core/Dialog";
import { EditableText } from "./editable_text";
import { ModelStatusIndicator } from "./model_utils"

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
            <img src={PyTorchIcon} style={{ width: "20px", height: "20px" }} />
          </ToolTip>
        ),
      }[model.framework]
    }
  </div>
}



function getModelIDCopyLink(model_id) {
  return (
    <div style={{ paddingLeft: ".25em", paddingRight: ".25em" }}>
      <ToolTip title={"Copy Model ID. " + model_id}>
        <Link
          onClick={(e) => { navigator.clipboard.writeText(model_id); }}
          style={{ cursor: "pointer" }}
        />
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
        <div>
          <p>You haven't uploaded any models yet.</p>
        </div>
        <div>
          <p>Let's try adding your first one!</p>
        </div>
        <div style={{ padding: "2em" }}>
          <CleanLink to="/">
            <Button color="primary" variant="contained">
              Add Model
          </Button>
          </CleanLink>
        </div>
      </div>
    </Paper>
  );
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
  const [deploymentMsg, setDeploymentMsg] = useState("");

  useEffect(() => {
    GetModelStatus(id).then((resp) => {
      if (resp.status != 200) {
        console.log("could not fetch model status");
        console.log(resp.data);
      }
      setStatus(resp.data.status);
      setDeploymentMsg(resp.data.message);
    });
  });

  function delete_model(model_id) {
    console.log("Deleting", model_id);
    DeleteModel(model_id).then(() => {
      onDelete(model_id);
    });
  }

  function download_model(model_id) {
    console.log("Downloading", model_id);
    GetModelDownloadLink(model_id).then(response => {
      window.open(response.data.url);
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
        <div style={{ alignItems: "end", display: "flex" }}>
          {getModelFrameworkIcon(model)}
          <ModelStatusIndicator statusInd={status} deploymentMsg={deploymentMsg} />
          {getModelIDCopyLink(model.id)}
          <Typography style={{ "paddingLeft": ".25em", "paddingRight": ".25em" }}>{model.public ? "Public" : "Private"}</Typography>
          <Typography style={{ "paddingLeft": ".25em", "paddingRight": ".25em" }}>{Math.round(size / 1024 / 1024) < 1
            ? Math.round(model.size / 1024) + " KB"
            : Math.round(size / 1024 / 1024) + " MB"}
          </Typography>
        </div>
        <EditableText
          initialText={description}
          editedCallback={handleDescriptionEdit}
          emptyPlaceHolder="Add a description..."
          style={{ minHeight: "6em", width: "100%", margin: "1em 0 1em 0", variant: "body2" }}
          inputstyle={{ minHeight: "6em" }}
          inputTag="textarea"
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

  const ModelsGridItems = models.map((model) => (
    <Model model={model} onDelete={onModelDelete} key={model.id} />
  ))
  return (
    <Grid container spacing={2}>
      {ModelsGridItems}
    </Grid>
  );
}
function ModelPage() {
  return (
    <div style={{ width: "80%" }}>
      <ModelList />
      <CleanLink to="/">
        <ToolTip title="Add Model">
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
        </ToolTip>
      </CleanLink>
    </div>
  );
}
export { ModelList, DeleteAll, ModelPage };
