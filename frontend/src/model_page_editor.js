import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MDEditor from "@uiw/react-md-editor";
import { Alert } from "./alert";
import Snackbar from "@material-ui/core/Snackbar";

import { Paper, Button, Typography } from "@material-ui/core";
import { CreateModelPage, GetModelPage, GetModel } from "./api";

function ModelPageEditor() {
  let { modelId } = useParams();

  const [value, setValue] = useState("**Hello world!!!**");
  const [model, setModel] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveFailure, setSaveFailure] = useState(false);
  useEffect(() => {
    GetModelPage(modelId).then((res) => {
      if (res.data.content === null) {
        setValue("## My first model\n");
        return;
      }
      setValue(res.data.content);
    });
  }, []);

  useEffect(() => {
    GetModel(modelId).then((r) => setModel(r.data));
  }, []);

  function handleContentSave() {
    CreateModelPage(modelId, { content: value })
      .then(setSaveSuccess(true))
      .catch((err) => {
        console.log(err);
        setSaveFailure(true);
      });
  }

  return (
    <div>
      <Snackbar
        open={saveSuccess}
        autoHideDuration={1000}
        onClose={(e) => setSaveSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success">Saved!</Alert>
      </Snackbar>
      <Snackbar
        open={saveFailure}
        autoHideDuration={1000}
        onClose={(e) => setSaveFailure(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error">Something went wrong! Saving failed.</Alert>
      </Snackbar>

      <Paper
        style={{
          margin: "0 2em 2em 2em",
        }}
      >
        <div style={{ display: "flex", padding: "1em" }}>
          <div style={{ flexGrow: "1" }}>
            <Typography variant="h5">{model.name}</Typography>
          </div>
          <Button
            color="primary"
            variant="contained"
            onClick={handleContentSave}
          >
            Save
          </Button>
        </div>
        <MDEditor
          value={value}
          onChange={setValue}
          height={"700"}
          maxHeight={1200}
          minHeights={100}
        />
      </Paper>
      <Paper
        style={{
          margin: "0 2em 2em 2em",
        }}
      >
        <div style={{ display: "flex", padding: "1em" }}>
          <div style={{ flexGrow: "1" }}>
            <Typography variant="h5"> Preview </Typography>
          </div>
        </div>

        <div style={{ padding: "1em" }}>
          <MDEditor.Markdown source={value} />
        </div>
      </Paper>
    </div>
  );
}

export { ModelPageEditor };
