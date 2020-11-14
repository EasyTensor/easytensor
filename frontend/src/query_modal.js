import React, { useState, useEffect, useRef, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { GetQueryAccessTokens, CreateQueryAccessToken, Query } from "./api";

import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import JSONInput from "react-json-editor-ajrm";
import locale from "react-json-editor-ajrm/locale/en";
import { QUERY_URL } from "./constants";
import copy from "copy-to-clipboard";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    borderRadius: "1em",
  },
  model_content: {
    // display: "flex",
    justifyContent: "center",
    textAlign: "center",
  },
  model_text: {
    color: "black",
  },
}));
const stubBody = { instances: [1.0, 2.0, 5.0] };
const MAX_CONTENT_SIZE = 3 * 1024 * 1024;

function QueryModal({ model }) {
  // getModalStyle is not a pure function, we roll the style only on the first render
  const classes = useStyles();
  const [placeholder, setPlaceholder] = useState(stubBody);
  const [queryTokens, setQueryTokens] = useState(undefined);
  const [reqBody, setReqBody] = useState(stubBody);
  const [isValid, setIsValid] = useState(true);
  const [responseBody, setResponseBody] = useState(null);
  const [canDisplay, setCanDisplay] = useState(true);
  const [showCopiedSnackbar, setShowCopiedSnackbar] = useState(false);

  useEffect(() => {
    GetQueryAccessTokens().then((response) => {
      var tokens = response.data
        .filter((token) => token.model == model.id)
        .map((token) => token.id);
      setQueryTokens(tokens);
    });
  }, []);

  function resetRequestBody() {
    setPlaceholder(stubBody);
    setReqBody(stubBody);
    setCanDisplay(true);
  }
  function onCreateToken() {
    CreateQueryAccessToken(model.id)
      .then((response) => {
        setQueryTokens([response.data.id]);
      })
      .catch((error) => {
        alert("There was an issue creating the token.");
        console.log(error);
      });
  }

  function sendQuery() {
    Query(queryTokens[0], reqBody)
      .then((response) => {
        setResponseBody(response.data);
      })
      .catch((error) => {
        alert("something went wrong.");
        console.log(error);
        setResponseBody(error);
      });
  }

  function onBodyChange(bodyProps) {
    setIsValid(!bodyProps.error);
    if (!bodyProps.error) {
      setReqBody(bodyProps.jsObject);
    }
  }

  const getImage = (file) =>
    new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(file);
    });

  function onFileInputChange(element) {
    if (element.target.files.length == 0) {
      return;
    }
    getImage(element.target.files[0]).then((result) => {
      if (result.length > MAX_CONTENT_SIZE) {
        setCanDisplay(false);
      } else {
        setCanDisplay(true);
      }
      setReqBody({ instances: [{ b64: result }] });
      setPlaceholder({ instances: [{ b64: result }] });
    });
    // allow for second choice of the same file to work.
    element.target.value = "";
  }

  const noToken = (
    <DialogContent className={classes.model_content}>
      <DialogContentText className={classes.model_text}>
        No authentication token has been set up for this Model.
      </DialogContentText>
      <DialogContentText className={classes.model_text}>
        A token is required to securely access your model.
      </DialogContentText>
      <Button onClick={onCreateToken} variant="contained" color="primary">
        Create Token
      </Button>
    </DialogContent>
  );

  // at the start, before request is done loading.
  if (queryTokens === undefined) {
    return (
      <DialogContent className={classes.model_content}>
        <div className={classes.paper}>
          <h2 id="simple-modal-title">Querying {model.name}</h2>
          "Retrieving information to query the model..."
        </div>
      </DialogContent>
    );
  }

  function showCurl() {
    alert(
      `curl ${QUERY_URL}/query/ --header "content-type: application/json" --header "accessToken: ${
        queryTokens[0]
      }" --data '${JSON.stringify(reqBody)}'`
    );
  }

  function copyCurl() {
    copy(
      `curl ${QUERY_URL}/query/ --header "content-type: application/json" --header "accessToken: ${
        queryTokens[0]
      }" --data '${JSON.stringify(reqBody)}'`
    );
    setShowCopiedSnackbar(true);
  }

  const QueryBox = (
    <div>
      <DialogContent className={classes.model_content}>
        <DialogContentText className={classes.model_text}>
          Using token: <code>{queryTokens}</code>
        </DialogContentText>
        <DialogContentText className={classes.model_text}>
          Note that all requests to your model must conform to{" "}
          <a
            href="https://www.tensorflow.org/tfx/serving/api_rest#predict_api"
            target="_blank"
          >
            Tensorflow's Serving standard
          </a>
        </DialogContentText>
      </DialogContent>
      <div>
        <div>
          <Button
            variant="contained"
            color="primary"
            disabled={!isValid}
            onClick={sendQuery}
            style={{ margin: ".5em" }}
          >
            Send Query
          </Button>
          <Button
            variant="contained"
            disabled={!isValid || !canDisplay}
            onClick={showCurl}
            style={{ textTransform: "none", margin: ".5em" }}
          >
            SHOW cURL
          </Button>
          <Button
            variant="contained"
            disabled={!isValid}
            onClick={copyCurl}
            style={{ textTransform: "none", margin: ".5em" }}
          >
            COPY cURL
          </Button>
          <Snackbar
            anchorOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            open={showCopiedSnackbar}
            autoHideDuration={1000}
            onClose={() => setShowCopiedSnackbar(false)}
          >
            <Alert
              severity="success"
              onClose={() => setShowCopiedSnackbar(false)}
            >
              cURL Copied!
            </Alert>
          </Snackbar>
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="contained-button-file"
            type="file"
            onChange={onFileInputChange}
            on
          />
          <label htmlFor="contained-button-file">
            <Button
              variant="contained"
              style={{ margin: ".5em" }}
              component="span"
            >
              Use Image
            </Button>
          </label>
          <Button
            variant="contained"
            style={{ margin: ".5em" }}
            onClick={resetRequestBody}
          >
            Reset
          </Button>
        </div>
        <div style={{ display: "flex" }}>
          <div style={{ flexGrow: 1, textAlign: "center" }}>Request</div>
          <div style={{ flexGrow: 1, textAlign: "center" }}>Response</div>
        </div>
        <div>
          <div style={{ display: "flex", width: "100%" }}>
            <div style={{ width: "100%" }}>
              {canDisplay ? (
                <JSONInput
                  id="a_unique_id"
                  locale={locale}
                  placeholder={placeholder}
                  // colors      = { darktheme }
                  // locale      = { locale }
                  height="550px"
                  width="100%"
                  onChange={onBodyChange}
                  style={{ contentBox: { overflowWrap: "anywhere" } }}
                />
              ) : (
                <div>
                  <p>
                    The object is too large, but you can still send the query or
                    copy the cURL.
                  </p>
                  <p>
                    Please note that uploading larger images might result in
                    longer response times and slower interface.
                  </p>
                </div>
              )}
            </div>

            <div
              style={{
                width: ".2em",
                height: "inherit",
                backgroundColor: "green",
              }}
            />
            <JSONInput
              id="a_unique_id2"
              placeholder={responseBody}
              locale={locale}
              // colors      = { darktheme }
              // locale      = { locale }
              height="550px"
              width="100%"
              onChange={onBodyChange}
              viewOnly={true}
              confirmGood={false}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <DialogTitle id="max-width-dialog-title">
        Querying {model.name}
      </DialogTitle>
      {queryTokens.length == 0 ? noToken : QueryBox}
    </div>
  );
}
export { QueryModal };
