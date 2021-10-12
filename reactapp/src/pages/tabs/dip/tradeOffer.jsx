import React, { useEffect, useState } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { useSelector } from 'react-redux';
import axios from 'axios';
import { gameServer } from "../../../config";
import TeamAvatar from '../../../components/common/teamAvatar';
import { Container, Content, Alert, Sidebar, FlexboxGrid, SelectPicker, Button, Modal, IconButton, Icon, Tag, TagGroup, Panel, PanelGroup, List, Whisper, Tooltip, Divider } from 'rsuite';
import { Form, ControlLabel, FormGroup, FormControl, TagPicker, Slider } from 'rsuite';
import { getTreasuryAccount } from '../../../store/entities/accounts';
import { getCompletedResearch } from '../../../store/entities/research';
import { getAircrafts } from '../../../store/entities/aircrafts';
import { rand } from '../../../scripts/dice';
import socket from '../../../socket';


const formatData = (array) => {
	let data = []
	for (let el of array) {
		data.push({ label: el.name, value: el, })
	}
	return data;
}

const TradeOffer = (props) => { //trade object
	let aircraft = useSelector(getAircrafts);
	let research = useSelector(getCompletedResearch);
	let intel = []
	let sites = []
	let upgrade = []
	if (props.team._id !== useSelector(state => state.auth.team)._id) {
		aircraft = []
		research = []
		intel = []
		sites = []
		upgrade = []
	} else {
		research = formatData(research);
		aircraft = formatData(aircraft)
	} 

	// console.log(research)

	const [formValue, setFormValue] = useState({
		comments: props.offer.comments,
		megabucks: props.offer.megabucks, 
		aircraft: props.offer.aircraft,
		intel: [],
		research: [],
		sites: [],
		upgrade: []
	});

	const [mode, setMode] = useState('disabled');
	const disabled = mode === 'disabled';
	const readOnly = mode === 'readonly';

	function onEdit(){
		// props.onOfferEdit();
		setMode("normal");
	}

	const submitEdit = async () => {
		props.onOfferEdit(formValue);
		setMode("disabled")
	}

	return(
		<div className='trade' style={{padding: '8px'}}>
			<h3><TeamAvatar size='md' code={props.team.code} />{props.team.name}</h3>
			{props.status === 'Completed' && <Divider style={{ textAlign: 'center' }}>Traded away these items</Divider>}
			<Form fluid formValue={formValue} onChange={formValue => setFormValue(formValue)}>

				{!disabled ? <FormGroup>
					<ControlLabel><Icon icon="money" /> Megabucks</ControlLabel>
					<FormControl
					accepter={Slider}
					min={0}
					max={props.account === undefined ? 100 : props.account.balance}
					name="megabucks"
					label="Level"
					style={{ width: 200, margin: '10px 0' }}
					disabled={disabled}
					readOnly={readOnly}
					/>
				</FormGroup> : null }
				{disabled ? <PanelGroup>
					<Panel>
						<h5><Icon icon="money" /> M$: {formValue.megabucks}</h5>
					</Panel>
				</PanelGroup> : null }

				{!disabled && aircraft && aircraft.length > 0 ? <FormGroup>
					<ControlLabel>Aircraft</ControlLabel>
					<FormControl
					block
					name="aircraft"
					accepter={TagPicker}
					data={aircraft}
					disabled={disabled}
					readOnly={readOnly}
					/>
				</FormGroup> : null }

				{disabled && formValue.aircraft.length > 0 ? <Panel header={<span><b>Aircraft</b> - {formValue.aircraft.length} Aircraft</span>} collapsible>
					<PanelGroup>{formValue.aircraft.map((unit) => <Panel className='trade-list' hover key={unit._id}>{unit.name}</Panel>)}</PanelGroup>
				</Panel> : null }

				{!disabled && intel.length > 0 ? <FormGroup>
					<ControlLabel>Intel</ControlLabel>
					<FormControl
					block
					name="intel"
					accepter={TagPicker}
					data={intel}
					disabled={disabled}
					readOnly={readOnly}
					/>
				</FormGroup> : null }

				{disabled && formValue.intel.length > 0 ? <Panel header={<span><b>Intel</b> - {formValue.intel.length} Intelegence Reports</span>} collapsible>
					<PanelGroup>{formValue.intel.map((unit) => <Panel className='trade-list' hover key={unit}>{unit}</Panel>)}</PanelGroup>
				</Panel> : null }

				{!disabled && research.length > 0 ? <FormGroup>
					<ControlLabel>Research</ControlLabel>
					<FormControl
					block
					name="research"
					accepter={TagPicker}
					data={research}
					disabled={disabled}
					readOnly={readOnly}
					/>
				</FormGroup> : null }

				{disabled && formValue.research.length > 0 ? <Panel header={<span><b>Research</b> - {formValue.research.length} Research reports</span>} collapsible>
					<PanelGroup>{formValue.research.map((tech) => <Panel className='trade-list' hover key={tech._id}>{tech.name}</Panel>)}</PanelGroup>
				</Panel> : null }

				{!disabled && sites.length ? <FormGroup>
					<ControlLabel>Sites</ControlLabel>
					<FormControl
					block
					name="sites"
					accepter={TagPicker}
					data={sites}
					disabled={disabled}
					readOnly={readOnly}
					/>
				</FormGroup> : null }

				{disabled && formValue.sites.length > 0 ? <Panel header={<span><b>Sites</b> - {formValue.sites.length} Sites</span>} collapsible>
					<PanelGroup>{formValue.sites.map((unit) => <Panel className='trade-list' hover key={unit}>{unit}</Panel>)}</PanelGroup>
				</Panel> : null }

				{!disabled && upgrade.length > 0 ? <FormGroup>
					<ControlLabel>Upgrade</ControlLabel>
					<FormControl
					block
					name="upgrade"
					accepter={TagPicker}
					data={upgrade}
					disabled={disabled}
					readOnly={readOnly}
					/>
				</FormGroup> : null }

				{disabled && formValue.upgrade.length > 0 ? <Panel header={<span><b>Upgrade</b> - {formValue.upgrade.length} Upgrade</span>} collapsible>
					<PanelGroup>{formValue.upgrade.map((unit) => <Panel className='trade-list' hover key={unit}>{unit}</Panel>)}</PanelGroup>
				</Panel> : null }

				<FormGroup >
					<ControlLabel>Comments</ControlLabel>
					<FormControl
					name="comments"
					rows={5}
					width='100%'
					componentClass="textarea"
					disabled={disabled}
					readOnly={readOnly}
					/>

				</FormGroup>
				{props.status !== 'Completed' && <FlexboxGrid>
					<FlexboxGrid.Item colspan={12} >
					{props.myTeam._id === props.team._id && <div>
						{disabled && <IconButton size='sm' icon={<Icon icon="pencil" />} onClick={() => onEdit()}>Edit Trade</IconButton>}
						{!disabled && <IconButton size='sm' icon={<Icon icon="check" />} onClick={() => submitEdit()}>Save Offer</IconButton> }
					</div>}
					</FlexboxGrid.Item>
					<FlexboxGrid.Item colspan={12} >
						{props.myTeam._id === props.team._id && <div>
							{ props.ratified &&<IconButton loading={props.loading} color={'orange'} disabled={!disabled || props.loading} block size='sm' icon={<Icon icon="thumbs-down" />} onClick={() => props.rejectProposal()}>Reject Proposal</IconButton>}
							{ !props.ratified && <IconButton loading={props.loading} color={'green'} disabled={!disabled || props.loading} block size='sm' icon={<Icon icon="check" />} onClick={() => props.submitApproval()}>Approve Proposal</IconButton>}
						</div>}
						{props.myTeam._id !== props.team._id && <div>
							{ props.ratified && <Tag color='green'>Deal Approved by {props.team.shortName}</Tag>}
							{ !props.ratified && <Tag color='red'>Awaiting approval by {props.team.shortName}</Tag>}
						</div>}

					</FlexboxGrid.Item>
				</FlexboxGrid>}
			</Form>
		</div>
	)
}

export default (TradeOffer);