import React, { useState } from "react";
import { UploadDashboard } from "./upload_page";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Bubble } from "./bubble";
import Paper from "@material-ui/core/Paper";
const saveModelString = `import
export_path = "~/my_model"
print("export_path = {}".format(export_path))

tf.keras.models.save_model(
    model,
    export_path,
    overwrite=True,
    include_optimizer=True,
    save_format=None,
    signatures=None,
    options=None
)
`;

const comperssModelString = `tar -czf ~/my_model`;

const SaveModelComponent = () => {
  return (
    <SyntaxHighlighter
      customStyle={{ borderRadius: ".8em" }}
      language="python"
      style={tomorrow}
    >
      {saveModelString}
    </SyntaxHighlighter>
  );
};

const CompressModelComponent = () => {
  return (
    <SyntaxHighlighter
      customStyle={{ borderRadius: ".8em" }}
      language="shell"
      style={tomorrow}
    >
      {comperssModelString}
    </SyntaxHighlighter>
  );
};

function FirstStep() {
  return (
    <div style={{ textAlign: "center", width: "80%" }}>
      <Paper
        elevation={12}
        style={{
          borderRadius: "1em",
          margin: "1em 0em 1em 0em",
          padding: "1em",
        }}
      >
        <p>
          Step 1: Save your model
          <SaveModelComponent />
        </p>
      </Paper>
      <Paper
        elevation={12}
        style={{
          borderRadius: "1em",
          margin: "1em 0em 1em 0em",
          padding: "1em",
        }}
      >
        <p>Step 2: Compress your model</p>
        <CompressModelComponent />
      </Paper>
      <Paper
        elevation={12}
        style={{
          borderRadius: "1em",
          margin: "1em 0em 1em 0em",
          padding: "1em",
        }}
      >
        <p>Step 3: Upload your model 👇</p>
        <UploadDashboard />
      </Paper>
    </div>
  );
}

export { FirstStep };
