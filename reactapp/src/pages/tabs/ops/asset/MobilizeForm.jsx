import React, { useEffect } from 'react';
import { connect } from 'react-redux'; // Redux store provider
import { Alert, Drawer, SelectPicker, CheckPicker, Divider, Tag, Button, TagGroup, FlexboxGrid, List, ButtonGroup, Loader } from 'rsuite';
import { getMilitary } from '../../../../store/entities/military';
import socket from '../../../../../src/socket';

const MobilizeForm = (props) => {
	const [mobilization, setMobilization] = React.useState([]); 


	// useEffect(() => {

	// }, [])

	const handleExit = () => {
		setMobilization([]);
		props.hide();
	}

	const handleUnits = (mobilization) => {
		setMobilization(mobilization);
	};


	const submitDeployment = async () => { 
		try {
			socket.emit('request', { route: 'military', action: 'mobilize', data: { units: mobilization }});
				// socket.emit( 'militarySocket', state.deployType, deployment);
		} catch (err) {
				Alert.error(`Error: ${err.body} ${err.message}`, 5000)
		}
		handleExit();
	}   

	return (
		<Drawer size='sm' placement='right' show={props.show} onHide={handleExit}>
			<Drawer.Body>
					<h6>Select Units</h6>
					{<CheckPicker block placeholder='Select Units'
							data={ props.military.filter(el => !el.status.some(el2 => el2 === 'mobilized')) }
							onChange={handleUnits}
							valueKey='_id'
							labelKey='name'
							value={ mobilization }
					/>}
			</Drawer.Body>
			<Drawer.Footer>
					<Button onClick={submitDeployment} appearance="primary">Confirm</Button>
					<Button onClick={handleExit} appearance="subtle">Cancel</Button>
			</Drawer.Footer>
	</Drawer>
	);
}

	const mapStateToProps = state => ({
	military: getMilitary(state),
	});
	
	const mapDispatchToProps = dispatch => ({
	});
export default connect(mapStateToProps, mapDispatchToProps)(MobilizeForm);