import React from "react";
import LockIcon from "@material-ui/icons/Lock";
import { Paper, Typography } from "@material-ui/core";

export default function NoAccessPaper() {
  return (
    <Paper
      style={{
        minHeight: "50vh",
        margin: "2em",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div style={{ margin: "1em" }}>
        <LockIcon style={{ fontSize: 50 }} />
      </div>

      <div style={{ margin: "1em" }}>
        <Typography variant="body1">
          You do not have access too this content.
        </Typography>
      </div>
    </Paper>
  );
}
