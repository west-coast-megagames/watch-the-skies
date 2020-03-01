import React from 'react';
import flask from '../../img/sci.svg'
import flask1 from '../../img/sci1.svg'
import flask2 from '../../img/sci2.svg'
import flask3 from '../../img/sci3.svg'
import flask4 from '../../img/sci4.svg'

const SciIcon = (props) => {
    return (
        <React.Fragment>
            {props.level === 0 && <img style={{height: props.size, width: props.size}} src={flask} alt='Science Flask' />}
            {props.level === 1 && <img style={{height: props.size, width: props.size}} src={flask1} alt='Science Flask' />}
            {props.level === 2 && <img style={{height: props.size, width: props.size}} src={flask2} alt='Science Flask' />}
            {props.level === 3 && <img style={{height: props.size, width: props.size}} src={flask3} alt='Science Flask' />}
            {props.level === 4 && <img style={{height: props.size, width: props.size}} src={flask4} alt='Science Flask' />}
        </React.Fragment>
    );
}
 
export default SciIcon;