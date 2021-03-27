import React from "react";
import { green, yellow, red, grey } from '@material-ui/core/colors';
import ToolTip from "@material-ui/core/Tooltip";
import { Error, Loop, FiberManualRecord } from "@material-ui/icons";



function ModelStatusIndicator({statusInd, deploymentMsg}) {
    const status_title = {
      "READY": "Model deployment is ready",
      "NOT_READY": "Model deployment is not ready",
      "FAILED": "Model deployment has failed",
      "NOT_DEPLOYED": "Model deployment is not deployed",
      "Retrieving...": "Retrieving model deployment status",
    }[statusInd] + ". " + deploymentMsg
    return (
      <div style={{ paddingLeft: ".25em", paddingRight: ".25em" }}>
        <ToolTip title={status_title}>
          {
            {
              "READY": <FiberManualRecord style={{ color: green[500] }} />,
              "NOT_READY": <FiberManualRecord style={{ color: yellow[500] }} />,
              "FAILED": <Error style={{ color: red[500] }} />,
              "NOT_DEPLOYED": <FiberManualRecord style={{ color: grey[700] }} />,
              "Retrieving...": <Loop />,
            }[statusInd]
          }
        </ToolTip>
      </div>
    )
  }

export {ModelStatusIndicator};