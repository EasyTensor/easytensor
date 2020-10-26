import React, { useState } from "react";
import { BACKEND_HTTP_URL } from "./constants";
import axios from "axios";

function Delete_all() {
  var delete_models = () => {
    axios.get(`${BACKEND_HTTP_URL}/models/`).then((response) => {
      console.log("get response: ", response);
    });
    axios.delete(`${BACKEND_HTTP_URL}/models/`);
  };

  return (
    <button onClick={delete_models}>
      <p>delete all </p>
    </button>
  );
}

class ModelList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { models: [] };
  }
  componentDidMount() {
    axios.get(`${BACKEND_HTTP_URL}/models/`).then((response) => {
      console.log("response:", response);

      this.setState({ models: response.data });
      console.log(this.state.models);
    });
  }

  delete(id) {
    console.log("Deleting", id);
    axios.delete(`${BACKEND_HTTP_URL}/models/${id}/`);
  }

  render() {
    const modelItems = this.state.models.map((model) => (
      <div style={{ border: "solid", borderColor: "grey" }}>
        <p>name: {model.name}</p>
        <p>id: {model.id}</p>
        <p>address: {model.address}</p>
        <p>size: {model.size}</p>
        <p>scale: {model.scale}</p>
        <button onClick={this.delete.bind(this, model.id)}>Delete</button>
      </div>
    ));
    return <div>{modelItems}</div>;
  }
}

export { ModelList, Delete_all };
