import React, { useState } from "react";
import { UploadDashboard } from "./upload_page";
import Tabs from "@material-ui/core/Tabs"
import AppBar from "@material-ui/core/AppBar"
import Tab from "@material-ui/core/Tab"
import { CreateModel } from "./api";
import {Button} from "@material-ui/core";
import { useHistory } from 'react-router-dom';


import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import TextField from '@material-ui/core/TextField';
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

function GuiInstructions() {

  const [name, setName] = useState("");
  const [framework, setFramework] = useState("TF");
  const [address, setAddress] = useState("");
  const [size, setSize] = useState(0);
  const history = useHistory();


  function handleUploadSuccess(file) {
    setAddress(file.name);
    setSize(file.size)
  }

  function handleSave(){
    console.log( typeof address)
    console.log(address, name, size, framework)
    if (address.trim() == "") {
      alert("Upload a model before saving it.")
      return
    }
    CreateModel({
      address: address,
      name: name,
      size: size,
      framework: framework,
    });
   history.push('/models')
  }



  return (
    <div>
      <SaveModelComponent />
      <CompressModelComponent />
      <div style={{alignItems: "left" }}>
      <TextField label="name" onChange={(e) => setName(e.target.value)}/>
      <RadioGroup aria-label="framework" name="framework" value={framework} onChange={(e) => setFramework(e.target.value)}>
        <FormControlLabel value="TF" control={<Radio color="default"/>} label="TensorFlow" />
        <FormControlLabel value="PT" control={<Radio color="default" variant="outlined" />} label="PyTorch" />
        <FormControlLabel value="SK" control={<Radio color="default" />} label="SK Learn" />
      </RadioGroup>
      <Button onClick={handleSave} variant="contained" color="primary" >Save Model</Button>
      <UploadDashboard onSuccess={handleUploadSuccess} />
      </div>
    </div>
  )
}

function PythonInstructions() {
  return (
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
}


function FirstStep() {
  const [value, setValue] = useState(0);
  const [tab, setTab] = useState(1);

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
            onChange={(e, val) => setTab(val)}
            centered
          >
            <Tab label="Python" />
            <Tab label="GUI" />
          </Tabs>
        </AppBar>
        {
          {
            0: <PythonInstructions />,
            1: <GuiInstructions />
          }[tab]
        }
      </Paper>

    </div>

  );
}

export { FirstStep };
