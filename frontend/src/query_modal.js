import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { GetQueryAccessTokens, CreateQueryAccessToken, Query } from "./api";

import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import JSONInput from "react-json-editor-ajrm";
import locale from 'react-json-editor-ajrm/locale/en'

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
function QueryModal({ model }) {
  // getModalStyle is not a pure function, we roll the style only on the first render
  const classes = useStyles();
  const [queryTokens, setQueryTokens] = useState(undefined);
  const [reqBody, setReqBody] = useState(stubBody);
  const [isValid, setIsValid] = useState(true);
  const [responseBody, setResponseBody] = useState(null)

  useEffect(() => {
    GetQueryAccessTokens().then((response) => {
      var tokens = response.data
        .filter((token) => token.model == model.id)
        .map((token) => token.id);
      setQueryTokens(tokens);
    });
  }, []);

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
        setResponseBody(response.data)
      })
      .catch((error) => {
        alert("something went wrong.");
        console.log(error);
        setResponseBody(error)
      });
  }

  function onBodyChange(bodyProps) {
    setReqBody(bodyProps.json);
    setIsValid(!bodyProps.error);
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
          <h2 id="simple-modal-title">Quering {model.name}</h2>
          "Retrieving information to query the model..."
        </div>
      </DialogContent>
    );
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
        <Button
          variant="contained"
          color="primary"
          disabled={!isValid}
          onClick={sendQuery}
        >
          Send Query
        </Button>
        <div style={{display: "flex", width: "100%"}}>
          <JSONInput
            id="a_unique_id"
            locale={locale}
            placeholder={stubBody}
            // colors      = { darktheme }
            // locale      = { locale }
            height="550px"
            width="100%"
            onChange={onBodyChange}
          />
          <div style={{width:".2em", height: "100%"}}/>
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
  );

  return (
    <div>
      <DialogTitle id="max-width-dialog-title">
        Quering {model.name}
      </DialogTitle>
      {queryTokens.length == 0 ? noToken : QueryBox}
    </div>
  );
}
export { QueryModal };
