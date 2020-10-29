import React, { useState } from "react";

function Bubble({ children, ...rest }) {
  return (
    <div
      {...rest}
      style={{
        // display: "flex",
        justifyContent: "center",
        textAlign: "center",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: "1em",
        boxShadow: "-.3em .3em 15px 4px #ffffff60",
        margin: "1em 0em 1em 0em",
        padding: "1em",
        // overflow: "auto",
      }}
    >
      {children}
    </div>
  );
}

export { Bubble };
