import React from "react";

const TxtInput = (props) => {
  return (
    <div className="form-group">
      <label htmlFor={props.name}>{props.label}</label>
      <input
        autoFocus
        value={props.value}
        onChange={props.onChange}
        id={props.name}
        name={props.name}
        type={props.type}
        className="form-control"
      />
      {props.error && <div className="alert alert-danger">{props.error}</div>}
    </div>
  );
};

export default TxtInput;
