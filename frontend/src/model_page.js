import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MDEditor from "@uiw/react-md-editor";
import { Alert } from "./alert";
import Snackbar from "@material-ui/core/Snackbar";

import { Paper, Button, Typography } from "@material-ui/core";
import { GetModelPage, GetModel } from "./api";

function ModelPage() {
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

  return (
    <div>
      <Paper
        style={{
          margin: "0 2em 2em 2em",
        }}
      >
        <div style={{ padding: "1em" }}>
          <MDEditor.Markdown source={value} />
        </div>
      </Paper>
    </div>
  );
}

export { ModelPage };
