import React, { useState } from "react";
// import "./snippet.txt";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
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
    <SyntaxHighlighter language="python" style={tomorrow}>
      {saveModelString}
    </SyntaxHighlighter>
  );
};

const CompressModelComponent = () => {
  return (
    <SyntaxHighlighter language="shell" style={tomorrow}>
      {comperssModelString}
    </SyntaxHighlighter>
  );
};

function FirstStep() {
  return (
    <div>
      <p>
        Step 1: Save your model
        <SaveModelComponent />
      </p>
      <p>Step 2: Compress your model</p>
      <CompressModelComponent />

      <p>Step 3: Upload your model 👇</p>
    </div>
  );
}

export { FirstStep };
