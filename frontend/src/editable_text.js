import React, { useState, useEffect } from "react";
import { Check } from "@material-ui/icons";
import ToolTip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

// todo: add ability to finish editing with click outside div
// https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
function EditableText({ initialText, editedCallback, emptyPlaceHolder = "", variant = "body1", style, inputstyle, inputTag = "text" }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(initialText);
    const inputBox = (
      inputTag == "text" ? (
        <input
          // type="text"
          onChange={(e) => setEditValue(e.target.value)}
          value={editValue}
          style={{ border: "none 0", outline: "none", flexGrow: "1", ...inputstyle }}
        />
      ) :
        <textarea
          // type="text"
          onChange={(e) => setEditValue(e.target.value)}
          value={editValue}
          style={{ border: "none 0", outline: "none", flexGrow: "1", ...inputstyle }}
        />
    )
    if (isEditing) {
      return (
        <ToolTip title="Click ✔ to save" open={isEditing} arrow placement="top">
          <div
            style={{
              display: "flex",
              border: "solid",
              borderColor: "#bbb",
              borderWidth: "0.05em",
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: "0.25em",
              ...style
            }}
          >
            {inputBox}
            <Check onClick={(e) => {
              editedCallback(editValue);
              setIsEditing(false);
            }} />
          </div>
        </ToolTip>
      );
    } else {
      return (
        <Typography
          variant={variant}
          onMouseOver={(e) => {
            e.target.style.borderColor = "#bbb";
          }}
          onMouseOut={(e) => (e.target.style.borderColor = "transparent")}
          style={{
            display: "flex",
            flexGrow: 1,
            overflow: "hidden",
            textAlign: "left",
            borderWidth: "0.01em",
            borderRadius: "0.1em",
            borderStyle: "solid",
            borderColor: "transparent",
            ...style
          }}
          onChange={(e) => console.log(e.target)}
          onClick={() => setIsEditing(true)}
        >
          {initialText.trim() ? initialText : emptyPlaceHolder}
        </Typography>
      );
    }
  }

  export {EditableText};