import React from 'react';

const TxtInput = ({ name, label, value, error, onChange }) => {
    return (
    <div className="form-group">
        {error && <div className="alert alert-danger">{error}</div>}
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
        
    </div>
    )
;}
 
export default TxtInput;