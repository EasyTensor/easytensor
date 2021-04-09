import React, { useState } from "react";
import { UploadDashboard } from "./upload_page";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Grid from "@material-ui/core/Grid";

import { CreateModel } from "./api";
import { Button } from "@material-ui/core";
import { useHistory } from "react-router-dom";

import TFIcon from "./images/tf_icon.png";
import PTIcon from "./images/pytorch_icon.png";

import TRIcon from "./images/huggingface.svg";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";

const TFSaveModelString = `# Step 1: save your model
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
const TFComperssModelString = `# Step 2: compress your model
tar -czf my_model.tar.gz -C ~/my_model .`;

const TFPythonUploadString = `export_path = "~/my_model"
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
model_id, access_token = easytensor.upload_model("My Model", export_path)`;

const PTSaveModelString = `# Step 1: save your model parameters
import os
from pathlib import Path
import torch.save
export_path = os.path.join(str(Path.home()), "my_model") # will point to ~/my_model
os.mkdir(export_path)
torch.save(model.state_dict(), os.path.join(export_path, "model.pt"))`;

const TRSaveModelString = `import os
from pathlib import Path
export_path = os.path.join(str(Path.home()), "my_model") # will point to ~/my_model
os.mkdir(export_path)
model.save_pretrained(os.path.join(export_path, "model_weights"))`;

const PTComperssModelString = `tar -czf my_model.tar.gz -C ~/my_model .`;

const PTPythonUploadString = `# 1. save the model class definition and a predict function in \`model.py\` 
# For more information, see https://github.com/EasyTensor/python-client/blob/main/docs/examples/PyTorch%20Text%20Classifier.ipynb

# 2. Upload model and model file 
import easytensor
easytensor.pytorch.upload_model("My PyTorch Model", model, "model.py")`;

const TRPythonModelFiletring = `# model.py
from transformers import MobileBertTokenizer, MobileBertModel

class MyModel(MobileBertModel):
    def __init__(self, *args, **kwargs):
        MobileBertModel.__init__(self, *args, **kwargs)
        self.tokenizer = MobileBertTokenizer.from_pretrained(
            "google/mobilebert-uncased"
        )

    def predict_single(self, text):
        inputs = self.tokenizer(text, return_tensors="pt")
        outputs = self.__call__(**inputs)
        return outputs`;

const TRPythonUploadString = `import easytensor
easytensor.transformers.upload_model("My Transformer Model", model, "model.py")`;

const TFSaveModelComponent = () => {
  return (
    <SyntaxHighlighter
      customStyle={{ borderRadius: ".8em" }}
      language="python"
      style={tomorrow}
      wrapLongLines={true}
    >
      {TFSaveModelString}
    </SyntaxHighlighter>
  );
};

const PTCompressModelComponent = () => {
  return (
    <SyntaxHighlighter
      customStyle={{ borderRadius: ".8em" }}
      language="python"
      style={tomorrow}
      wrapLongLines={true}
    >
      {PTComperssModelString}
    </SyntaxHighlighter>
  );
};

const PTSaveModelComponent = () => {
  return (
    <SyntaxHighlighter
      customStyle={{ borderRadius: ".8em" }}
      language="python"
      style={tomorrow}
      wrapLongLines={true}
    >
      {PTSaveModelString}
    </SyntaxHighlighter>
  );
};

const TRSaveModelComponent = () => {
  return (
    <SyntaxHighlighter
      customStyle={{ borderRadius: ".8em" }}
      language="python"
      style={tomorrow}
      wrapLongLines={true}
    >
      {TRSaveModelString}
    </SyntaxHighlighter>
  );
};

const TFCompressModelComponent = () => {
  return (
    <SyntaxHighlighter
      customStyle={{ borderRadius: ".8em" }}
      language="shell"
      style={tomorrow}
      wrapLongLines={true}
    >
      {TFComperssModelString}
    </SyntaxHighlighter>
  );
};

function TFGuiInstructions() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [size, setSize] = useState(0);
  const history = useHistory();

  function handleUploadSuccess(file) {
    setAddress(file.name);
    setSize(file.size);
  }

  function handleSave() {
    console.log(typeof address);
    console.log(address, name, size);
    if (address.trim() == "") {
      alert("Upload a model before saving it.");
      return;
    }
    CreateModel({
      address: address,
      name: name,
      size: size,
      framework: "TF",
    }).then(() => history.push("/models"));
  }

  return (
    <div>
      <TFSaveModelComponent />
      <TFCompressModelComponent />
      <p>Step 3: Upload your model and save it 👇</p>
      <div style={{ display: "flex", alignItems: "left" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: "1",
            alignItems: "end",
          }}
        >
          <div>
            <TextField
              label="Model Name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div style={{ alignItems: "left", marginTop: "1em" }}>
            <Button onClick={handleSave} variant="contained" color="primary">
              Save Model
            </Button>
          </div>
        </div>
        <div style={{ flexGrow: "1" }}>
          <UploadDashboard onSuccess={handleUploadSuccess} />
        </div>
      </div>
    </div>
  );
}

function TFPythonInstructions() {
  return (
    <div>
      <SyntaxHighlighter
        customStyle={{ borderRadius: ".8em" }}
        language="python"
        style={tomorrow}
        wrapLongLines={true}
      >
        {TFPythonUploadString}
      </SyntaxHighlighter>
    </div>
  );
}

function PTPythonInstructions() {
  return (
    <div>
      <SyntaxHighlighter
        customStyle={{ borderRadius: ".8em" }}
        language="python"
        style={tomorrow}
        wrapLongLines={true}
      >
        {PTPythonUploadString}
      </SyntaxHighlighter>
    </div>
  );
}

function PTGuiInstructions() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [size, setSize] = useState(0);
  const history = useHistory();

  function handleUploadSuccess(file) {
    setAddress(file.name);
    setSize(file.size);
  }

  function handleSave() {
    console.log(typeof address);
    console.log(address, name, size);
    if (address.trim() == "") {
      alert("Upload a model before saving it.");
      return;
    }
    CreateModel({
      address: address,
      name: name,
      size: size,
      framework: "PT",
    });
    history.push("/models");
  }

  return (
    <div>
      <PTSaveModelComponent />
      <p>
        Step 2: Store the model class definition in a file called{" "}
        <code>model.py</code>. The class definition must have a{" "}
        <code>predict_single</code> method that can run the predict method. Save
        the <code>model.py</code> file in <code>~/my_model</code>.
      </p>
      <PTCompressModelComponent />
      <p>Step 4: Upload your model and save it 👇</p>
      <div style={{ display: "flex", alignItems: "left" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: "1",
            alignItems: "end",
          }}
        >
          <div>
            <TextField
              label="Model Name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div style={{ alignItems: "left", marginTop: "1em" }}>
            <Button onClick={handleSave} variant="contained" color="primary">
              Save Model
            </Button>
          </div>
        </div>
        <div style={{ flexGrow: "1" }}>
          <UploadDashboard onSuccess={handleUploadSuccess} />
        </div>
      </div>
    </div>
  );
}

function TRPythonInstructions() {
  return (
    <div>
      <p>
        Step 1: Save an inference class in a file <code>model.py</code>.
      </p>
      <SyntaxHighlighter
        customStyle={{ borderRadius: ".8em" }}
        language="python"
        style={tomorrow}
        wrapLongLines={true}
      >
        {TRPythonModelFiletring}
      </SyntaxHighlighter>

      <p>Step 2. Upload model and model file </p>
      <SyntaxHighlighter
        customStyle={{ borderRadius: ".8em" }}
        language="python"
        style={tomorrow}
        wrapLongLines={true}
      >
        {TRPythonUploadString}
      </SyntaxHighlighter>
    </div>
  );
}

function TRGuiInstructions() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [size, setSize] = useState(0);
  const history = useHistory();

  function handleUploadSuccess(file) {
    setAddress(file.name);
    setSize(file.size);
  }

  function handleSave() {
    console.log(typeof address);
    console.log(address, name, size);
    if (address.trim() == "") {
      alert("Upload a model before saving it.");
      return;
    }
    CreateModel({
      address: address,
      name: name,
      size: size,
      framework: "PT",
    });
    history.push("/models");
  }

  return (
    <div>
      <p>
        Step 1: Save an inference class in a file <code>model.py</code>.
      </p>
      <SyntaxHighlighter
        customStyle={{ borderRadius: ".8em" }}
        language="python"
        style={tomorrow}
        wrapLongLines={true}
      >
        {TRPythonModelFiletring}
      </SyntaxHighlighter>
      <p>Step 2: save your model parameters</p>
      <TRSaveModelComponent />
      <p># Step 3: compress your model</p>
      <PTCompressModelComponent />
      <p>Step 4: Upload your model and save it 👇</p>
      <div style={{ display: "flex", alignItems: "left" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: "1",
            alignItems: "end",
          }}
        >
          <div>
            <TextField
              label="Model Name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div style={{ alignItems: "left", marginTop: "1em" }}>
            <Button onClick={handleSave} variant="contained" color="primary">
              Save Model
            </Button>
          </div>
        </div>
        <div style={{ flexGrow: "1" }}>
          <UploadDashboard onSuccess={handleUploadSuccess} />
        </div>
      </div>
    </div>
  );
}

function TensorFlowInstructions() {
  const [tab, setTab] = useState(0);

  return (
    <div style={{ textAlign: "center" }}>
      <Tabs
        value={tab}
        indicatorColor="primary"
        textColor="primary"
        onChange={(e, val) => setTab(val)}
        centered
      >
        <Tab label="Python" />
        <Tab label="GUI" />
      </Tabs>
      {
        {
          0: <TFPythonInstructions />,
          1: <TFGuiInstructions />,
        }[tab]
      }
    </div>
  );
}

function PyTorchInstructions() {
  const [tab, setTab] = useState(0);

  return (
    <div style={{ textAlign: "center" }}>
      <Tabs
        value={tab}
        indicatorColor="primary"
        textColor="primary"
        onChange={(e, val) => setTab(val)}
        centered
      >
        <Tab label="Python" />
        <Tab label="GUI" />
      </Tabs>
      {
        {
          0: <PTPythonInstructions />,
          1: <PTGuiInstructions />,
        }[tab]
      }
    </div>
  );
}

function TransformerInstructions() {
  const [tab, setTab] = useState(0);

  return (
    <div style={{ textAlign: "center" }}>
      <Tabs
        value={tab}
        indicatorColor="primary"
        textColor="primary"
        onChange={(e, val) => setTab(val)}
        centered
      >
        <Tab label="Python" />
        <Tab label="GUI" />
      </Tabs>
      {
        {
          0: <TRPythonInstructions />,
          1: <TRGuiInstructions />,
        }[tab]
      }
    </div>
  );
}

function FirstStep() {
  const [selectedFramework, setFramework] = useState("TF");

  return (
    <Grid container direction="row" justify="center" alignItems="flex-start">
      <Grid item xs={8}>
        <Paper
          elevation={12}
          style={{
            borderRadius: "1em",
            display: "flex",
          }}
        >
          <div style={{ marginRight: "1em", marginTop: "1em", flex: "none" }}>
            {[
              { displayName: "TensorFlow", label: "TF", icon: TFIcon },
              { displayName: "PyTorch", label: "PT", icon: PTIcon },
              { displayName: "Hugging Face", label: "TR", icon: TRIcon },
            ].map((framework) => {
              const isSelected = framework.label == selectedFramework;
              return (
                <div
                  style={{
                    cursor: "pointer",
                    paddingTop: "0.5em",
                    paddingBottom: "0.5em",
                    display: "flex",
                    color: isSelected ? "rgba(255, 117, 13)" : "",
                  }}
                  onClick={() => setFramework(framework.label)}
                >
                  <div style={{ marginRight: "0.5em", marginLeft: "0.5em" }}>
                    <img
                      src={framework.icon}
                      style={{
                        width: "20px",
                        height: "20px",
                        filter: !isSelected ? "grayscale(100%)" : "",
                      }}
                    />
                  </div>
                  <div style={{ marginRight: "0.5em", marginLeft: "0.5em" }}>
                    {" "}
                    {framework.displayName}{" "}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ width: "100%", padding: "1em" }}>
            {
              {
                TF: <TensorFlowInstructions />,
                PT: <PyTorchInstructions />,
                TR: <TransformerInstructions />,
              }[selectedFramework]
            }
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
}

export { FirstStep };
