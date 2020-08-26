import React from 'react';
import software from '../../img/software_icon.png';
import placeholder from '../../img/Unknown_Icon.png';

const FieldIcon = (props) => {
    let src = ''
    switch (props.field) {
        case('Computer Science'):
            src = software;
            break;
        default:
            src = placeholder
    }
    return (
        <React.Fragment>
            <img className='rs-avatar-image' style={{width:'30px'}} src={src} alt="RS"/> {props.field}
        </React.Fragment>
    )
}
 
export default FieldIcon;
