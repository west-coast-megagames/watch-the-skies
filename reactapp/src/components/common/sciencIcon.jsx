import React from 'react';
import flask from '../../img/sci.svg'
import flask1 from '../../img/sci1.svg'
import flask2 from '../../img/sci2.svg'
import flask3 from '../../img/sci3.svg'
import flask4 from '../../img/sci4.svg'
import flask5 from '../../img/sci5.svg'

const SciIcon = (props) => {
    return (
        <React.Fragment>
            {props.level === 0 && <img style={{height: props.size, width: props.size}} src={flask} alt='Level 0' />}
            {props.level === 1 && <img style={{height: props.size, width: props.size}} src={flask1} alt='Level 1' />}
            {props.level === 2 && <img style={{height: props.size, width: props.size}} src={flask2} alt='Level 2' />}
            {props.level === 3 && <img style={{height: props.size, width: props.size}} src={flask3} alt='Level 3' />}
            {props.level === 4 && <img style={{height: props.size, width: props.size}} src={flask4} alt='Level 4' />}
            {props.level === 5 && <img style={{height: props.size, width: props.size}} src={flask5} alt='Level 5' />}
        </React.Fragment>
    );
}
 
export default SciIcon;