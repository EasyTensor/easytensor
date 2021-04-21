import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MDEditor from "@uiw/react-md-editor";
import { Alert } from "./alert";
import Snackbar from "@material-ui/core/Snackbar";

import { Paper, Button, Typography } from "@material-ui/core";
import { CreateModelPage, GetModelPage, GetModel } from "./api";
import { get_user } from "./auth/helper";
import NoAccessPaper from "./no_access";

function ModelPageEditor() {
  let { modelId } = useParams();

  const [value, setValue] = useState("**Hello world!!!**");
  const [isAuthor, setIsAuthor] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [model, setModel] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveFailure, setSaveFailure] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    GetModelPage(modelId)
      .then((res) => {
        if (res.data.content === null) {
          setValue("## My first model\n");
          return;
        }
        setValue(res.data.content);
      })
      .catch((e) => {
        console.log(e);
        console.log(e.response);
        // for any 400 response
        if (e.response.status & (400 === 400)) {
          setHasAccess(false);
        }
      });
  }, []);

  useEffect(() => {
    GetModel(modelId)
      .then((r) => setModel(r.data))
      .catch((e) => {
        // for any 400 response
        if (e.response.status & (400 === 400)) {
          setHasAccess(false);
        }
      });
  }, []);

  useEffect(() => {
    setIsAuthor(
      Boolean(
        "owner" in model &&
          get_user() !== undefined &&
          model.owner == get_user().pk
      )
    );
  }, [model]);

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

      {hasAccess && isAuthor && (
        <Paper
          style={{
            margin: "0 2em 2em 2em",
          }}
        >
          <div style={{ display: "flex", padding: "1em" }}>
            <div style={{ flexGrow: "1" }}>
              <div>
                <Typography variant="h5">{model.name}</Typography>
              </div>
              <div style={{ paddingTop: "1em" }}>
                <Typography variant="body1">
                  {model.public ? "Public" : "Private"}
                </Typography>
              </div>
            </div>

            {showEditor && (
              <div>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={handleContentSave}
                  style={{ marginLeft: "0.5em", marginRight: "0.5em" }}
                >
                  Save
                </Button>
              </div>
            )}
            <div>
              <Button
                color="primary"
                variant="contained"
                onClick={(e) => setShowEditor(!showEditor)}
                style={{ marginLeft: "0.5em", marginRight: "0.5em" }}
              >
                {showEditor ? "Hide Editor" : "Edit"}
              </Button>
            </div>
          </div>
          {isAuthor && showEditor && (
            <MDEditor
              value={value}
              onChange={setValue}
              height={"700"}
              maxHeight={1200}
              minHeights={100}
            />
          )}
        </Paper>
      )}
      {hasAccess && (
        <Paper
          style={{
            margin: "0 2em 2em 2em",
          }}
        >
          <div style={{ padding: "1em" }}>
            <MDEditor.Markdown source={value} />
          </div>
        </Paper>
      )}
      {!hasAccess && <NoAccessPaper />}
    </div>
  );
}

export { ModelPageEditor };
