import React from 'react';

const TxtInput = ({ name, label, value, error, onChange }) => {
    return (
    <div className="form-group">
        <label htmlFor={ name }>{ label }</label>
        <input 
            autoFocus
            value={ value }
            onChange={ onChange }
            id={ name }
            name={ name }
            type="text"
            className="form-control"
        />
        {error && <div className="alert alert-danger">{error}</div>}
    </div>
    )
;}
 
export default TxtInput;