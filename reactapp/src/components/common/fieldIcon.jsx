import React from 'react';
import computer from '../../img/icons/software_icon.png';
import social from '../../img/icons/social_icon.png';
import electronics from '../../img/icons/electronics_icon.png';
import genetics from '../../img/icons/genetics_icon.png';
import material from '../../img/icons/material_icon.png';
import physics from '../../img/icons/physics_icon.png';
import psycology from '../../img/icons/psycology_icon.png';
import quantum from '../../img/icons/quantum_icon.png';
import biology from '../../img/icons/biology_icon.png';
import engineering from '../../img/icons/engineering_icon.png';
import placeholder from '../../img/icons/Unknown_Icon.png';

const FieldIcon = (props) => {
	return (
		<React.Fragment>
			{props.field === 'Computer Science' && <span><img className='rs-avatar-image' style={{width:'30px'}} src={computer} alt="RS"/> {props.field}</span>}
			{props.field === 'Social Science' && <span><img className='rs-avatar-image' style={{width:'30px'}} src={social} alt="RS"/> {props.field}</span>}
			{props.field === 'Electronics' && <span><img className='rs-avatar-image' style={{width:'30px'}} src={electronics} alt="RS"/> {props.field}</span>}
			{props.field === 'Genetics' && <span><img className='rs-avatar-image' style={{width:'30px'}} src={genetics} alt="RS"/> {props.field}</span>}
			{props.field === 'Material Science' && <span><img className='rs-avatar-image' style={{width:'30px'}} src={material} alt="RS"/> {props.field}</span>}
			{props.field === 'Physics' && <span><img className='rs-avatar-image' style={{width:'30px'}} src={physics} alt="RS"/> {props.field}</span>}
			{props.field === 'Psychology' && <span><img className='rs-avatar-image' style={{width:'30px'}} src={psycology} alt="RS"/> {props.field}</span>}
			{props.field === 'Quantum Mechanics' && <span><img className='rs-avatar-image' style={{width:'30px'}} src={quantum} alt="RS"/> {props.field}</span>}
			{props.field === 'Biology' && <span><img className='rs-avatar-image' style={{width:'30px'}} src={biology} alt="RS"/> {props.field}</span>}
			{props.field === 'Engineering' && <span><img className='rs-avatar-image' style={{width:'30px'}} src={engineering} alt="RS"/> {props.field}</span>}
			{!props.field && <span><img className='rs-avatar-image' style={{width:'30px'}} src={placeholder} alt="RS"/> Unknown</span>}
		</React.Fragment>
	)
}

export default FieldIcon;
