import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { XTerm } from "xterm-for-react";

import Typography from "@material-ui/core/Typography";
import { CloudDownload } from "@material-ui/icons";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import useWebSocket, { ReadyState } from "react-use-websocket";

import { useParams } from "react-router-dom";

import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { GetModelPodList } from "./api";

function Logs({ podId, container }) {
  const xtermRef = React.useRef(null);
  const [socketUrl, setSocketUrl] = useState(
    `ws://localhost:9090/logs/stream/${podId}/${container}`
  );
  console.log("Logs: ws url is now:", socketUrl);
  const { _, lastMessage, readyState } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage != null) {
      function splitLines(t) {
        return t.split(/\r\n|\r|\n/);
      }
      const lines = splitLines(lastMessage.data);
      for (var i = 0; i < lines.length; i++) {
        console.log(lines[i]);
        xtermRef.current.terminal.writeln(lines[i]);
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    console.log("Logs: conatiner selection changed to", container);
    setSocketUrl(`ws://localhost:9090/logs/stream/${podId}/${container}`);
    xtermRef.current.terminal.clear();
  }, [container, podId]);

  return <XTerm ref={xtermRef} />;
}

function ModelLogs() {
  let { modelId } = useParams();
  let [selectedPod, setSelectedPod] = useState("");
  const [podList, setPodList] = useState([]);
  const [podContainers, setPodContainers] = useState({});
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedContainer, setSelectedContainer] = useState("");

  useEffect(() => {
    GetModelPodList(modelId).then((r) => {
      console.log(r.data);
      setPodContainers(r.data.pods);
      const pods = [];

      Object.keys(r.data.pods).map(function (key, index) {
        pods.push(key);
      });
      if (pods.length > 0) {
        setSelectedPod(pods[0]);
      }
      setPodList(pods);
    });
  }, []);

  return (
    <Grid container direction="row" justify="center" alignItems="flex-start">
      <Grid item xs={12}>
        <Paper
          elevation={12}
          style={{
            borderRadius: "1em",
            display: "flex",
          }}
        >
          <div style={{ marginRight: "1em", marginTop: "1em", flex: "none" }}>
            {podList.map((pod, index) => {
              const isSelected = pod == selectedPod;
              return (
                <div
                  style={{
                    cursor: "pointer",
                    paddingTop: "0.5em",
                    paddingBottom: "0.5em",
                    display: "flex",
                    color: isSelected ? "rgba(255, 117, 13)" : "",
                  }}
                  onClick={() => setSelectedPod(pod)}
                  key={pod}
                >
                  <div style={{ marginRight: "0.5em", marginLeft: "0.5em" }}>
                    Pod {index + 1}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ width: "100%", padding: "1em" }}>
            {podList.length > 0 &&
            selectedPod != "undefined" &&
            podContainers[selectedPod] != "undefined" ? (
              <div style={{ textAlign: "center" }}>
                <Tabs
                  value={selectedTab}
                  indicatorColor="primary"
                  textColor="primary"
                  onChange={(e, val) => {
                    setSelectedContainer(podContainers[selectedPod][val]);
                    setSelectedTab(val);
                  }}
                  centered
                >
                  {podContainers[selectedPod].map((container) => (
                    <Tab key={container} label={container} />
                  ))}
                </Tabs>
                <Logs podId={selectedPod} container={selectedContainer} />
              </div>
            ) : (
              <p> No pod selected</p>
            )}
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
}
export { ModelLogs };
