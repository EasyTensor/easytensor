import React, { useState, useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import { Add, Link, Error, Loop, FiberManualRecord } from "@material-ui/icons";
import Button from "@material-ui/core/Button";
import Fab from "@material-ui/core/Fab";
import { ModelStatusIndicator } from "./model_utils";

import ToolTip from "@material-ui/core/Tooltip";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Paper from "@material-ui/core/Paper";
import { green, yellow, red, grey } from "@material-ui/core/colors";
import TfIcon from "./images/tf_icon.png";
import PyTorchIcon from "./images/pytorch_icon.png";
import { CleanLink } from "./link";
import Tooltip from "@material-ui/core/Tooltip";
import { GetModels, GetModelStatus } from "./api";
import { QueryModal } from "./query_modal";
import Dialog from "@material-ui/core/Dialog";

function getModelFrameworkIcon(model) {
  return (
    <div style={{ paddingRight: "0.25em" }}>
      {
        {
          TF: (
            <ToolTip title="TensorFlow model">
              <img src={TfIcon} style={{ width: "20px", height: "20px" }} />
            </ToolTip>
          ),
          PT: (
            <ToolTip title="PyTorch model">
              <img
                src={PyTorchIcon}
                style={{ width: "20px", height: "20px" }}
              />
            </ToolTip>
          ),
        }[model.framework]
      }
    </div>
  );
}

function getModelIDCopyLink(model_id) {
  return (
    <div style={{ paddingLeft: ".25em", paddingRight: ".25em" }}>
      <ToolTip title={"Copy Model ID"}>
        <Link
          onClick={(e) => {
            navigator.clipboard.writeText(model_id);
          }}
          style={{ cursor: "pointer" }}
        />
      </ToolTip>
    </div>
  );
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

function Model({ model }) {
  const [name] = useState(model.name);
  const [description] = useState(model.description);
  // const address = model.address;
  const id = model.id;
  const size = model.size;
  // const scale = model.scale;
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

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
      <Card foo="bar" style={{ padding: ".5em", borderRadius: "1em" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h5" style={{ alignItems: "center" }}>
            {name}
          </Typography>
        </div>
        <div style={{ alignItems: "end", display: "flex" }}>
          {getModelFrameworkIcon(model)}
          {
            <ModelStatusIndicator
              statusInd={status}
              deploymentMsg={deploymentMsg}
            />
          }
          {getModelIDCopyLink(model.id)}
          <Typography style={{ paddingLeft: ".25em", paddingRight: ".25em" }}>
            {Math.round(size / 1024 / 1024) < 1
              ? Math.round(model.size / 1024) + " KB"
              : Math.round(size / 1024 / 1024) + " MB"}
          </Typography>
        </div>
        <Typography
          style={{
            minHeight: "6em",
            width: "100%",
            margin: "1em 0 1em 0",
            variant: "body2",
          }}
        >
          {description}
        </Typography>
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button variant="contained" color="primary" onClick={handleOpen}>
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

  if (models.length <= 0) {
    return <EmptyModelList />;
  }
  const ModelsGridList = models.map((model) => (
    <Model model={model} key={model.id} />
  ));
  return (
    <Grid
      container
      spacing={2}
      direction="row"
      justify="flex-start"
      alignItems="flex-start"
    >
      {" "}
      {ModelsGridList}
    </Grid>
  );
}
function ExplorePage() {
  return (
    <div>
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
export { ExplorePage };
