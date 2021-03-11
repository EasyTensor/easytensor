import React from "react";
import { UploadDashboard } from "./upload_page";
import Tabs from "@material-ui/core/Tabs"
import AppBar from "@material-ui/core/AppBar"
import Tab from "@material-ui/core/Tab"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import Paper from "@material-ui/core/Paper";
const saveModelString = `# Step 1: save your model
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
)`;
const comperssModelString = `# Step 2: compress your model
tar -czf my_model.tar.gz -C ~/my_model .`;

const pythonUploadString = `export_path = "~/my_model"
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

import easytensor
model_id, access_token = easytensor.upload_model("My Model", export_path)
`;

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


const GuiInstructions = (
  <div>
    <SaveModelComponent />
    <CompressModelComponent />
    <p>Step 3: Upload the compressed model 👇</p>
    <UploadDashboard />
  </div>
)

const PythonInstructions = (
  <div>
    <SyntaxHighlighter
      customStyle={{ borderRadius: ".8em" }}
      language="python"
      style={tomorrow}
    >
      {pythonUploadString}
    </SyntaxHighlighter>
  </div>
)


function FirstStep() {
  const [value, setValue] = React.useState(0);
  const [instructions, setInstructions] = React.useState(PythonInstructions)
  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (newValue == 0) {
      setInstructions(PythonInstructions)
    } else if (newValue == 1) {
      setInstructions(GuiInstructions)
    }
  };


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
        <AppBar position="static" color="secondary">

          <Tabs
            value={value}
            indicatorColor="primary"
            textColor="primary"
            onChange={handleChange}
            centered
          >
            <Tab label="Python" />
            <Tab label="GUI" />
          </Tabs>
        </AppBar>


        {instructions}
      </Paper>

    </div>

  );
}

export { FirstStep };
