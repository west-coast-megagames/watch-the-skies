import React, {Component, useState } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { useSelector } from 'react-redux';
import axios from 'axios';
import { gameServer } from "../../../config";
import TeamAvatar from '../../../components/common/teamAvatar';
import { Container, Content, Alert, Sidebar, FlexboxGrid, SelectPicker, Button, Modal, IconButton, Icon, Tag, TagGroup, Panel, PanelGroup, Header, Divider } from 'rsuite';
import { Form, ControlLabel, FormGroup, FormControl, TagPicker, Slider } from 'rsuite';
import { getTreasuryAccount } from '../../../store/entities/accounts';
import { getCompletedResearch } from '../../../store/entities/research';
import { getAircrafts } from '../../../store/entities/aircrafts';
import { rand } from '../../../scripts/dice';

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
    let facilities = []
    if (props.team._id !== useSelector(state => state.auth.team)._id) {
        aircraft = []
        research = []
        intel = []
        sites = []
        upgrade = []
        facilities = []
    } else {
        research = formatData(research);
        aircraft = formatData(aircraft)
    } 
        
    console.log(research)

    const [formValue, setFormValue] = useState({
        input:
          "I want all your things!!.",
        slider: 0,
        aircraft: [],
        intel: [],
        research: [],
        sites: [],
        upgrade: [],
        facilities: []
      });

      const [mode, setMode] = useState('disabled');
      const disabled = mode === 'disabled';
      const readOnly = mode === 'readonly';

     function onEdit(){
          props.onOfferEdit();
          setMode("normal");
      }

    return(
        <div className='trade' style={{padding: '8px'}}>
            <h3><TeamAvatar size='md' teamCode={props.team.teamCode} />{props.team.name}</h3>
            <Form fluid formValue={formValue} onChange={formValue => setFormValue(formValue)}>

                {!disabled ? <FormGroup>
                    <ControlLabel><Icon icon="money" /> Megabucks</ControlLabel>
                    <FormControl
                    accepter={Slider}
                    min={0}
                    max={props.account === undefined ? 100 : props.account.balance}
                    name="slider"
                    label="Level"
                    style={{ width: 200, margin: '10px 0' }}
                    disabled={disabled}
                    readOnly={readOnly}
                    />
                </FormGroup> : null }
                {disabled ? <PanelGroup>
                    <Panel>
                        <h5><Icon icon="money" /> M$: {formValue.slider}</h5>
                    </Panel>
                </PanelGroup> : null }

                {!disabled && aircraft.length > 0 ? <FormGroup>
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
                    <ControlLabel>Comment Input</ControlLabel>
                    <FormControl
                    name="input"
                    rows={5}
                    width='100%'
                    componentClass="textarea"
                    disabled={disabled}
                    readOnly={readOnly}
                    />
                </FormGroup>
                {disabled && <IconButton size='sm' icon={<Icon icon="pencil" />} onClick={() => onEdit()}>Edit Trade</IconButton>}
                {!disabled && <IconButton size='sm' icon={<Icon icon="check" />} onClick={() => setMode("disabled")}>Save Offer</IconButton> }
            </Form>
        </div>
    )
}

class Trade extends Component {
    state = {
        trade: {
            initiator: {
                team: {},
                ratified: false,
                modified: false,
                offer: {
                    megabucks: 0, 
                    aircraft: [], 
                    //intel: [], 
                    research: [], 
                    //sites: [], 
                    upgrade: [],  
                    comments: []
                }
            },//initiator
            tradePartner: {
                team: {},
                ratified: false,
                modified: false,
                offer: {
                    megabucks: 0, 
                    aircraft: [], 
                    //intel: [], 
                    research: [], 
                    //sites: [], 
                    upgrade: [],  
                    comments: []
                }
            },//initiator
            status: {draft: true, proposal: false, pending: false, rejected: false, complete: false, deleted: false, },
            lastUpdated: Date.now(),
            _id: ""
        },
        partner: null,
        newTrade: false,
        viewTrade: false
    }//state

    onOfferEdit(team, offer) {
        Alert.success(`WE DID IT REDDIT`, 3000);
    }

    componentWillMount() {
        let trade = this.state.trade;
        trade.initiator.team = this.props.team;
        trade.tradePartner.team = this.props.team[rand(this.props.teams.length - 1)];
        this.setState({ trade })
    }

    toggleNew () {
        let { newTrade } = this.state;
        this.setState({ newTrade: !newTrade })
    }

    createTrade = async () => {
        console.log('Creating a new Trade...');
        let trade = {
            initiator: this.props.team._id,
            tradePartner: this.state.partner
        };
        try {
          console.log(trade)
          let response = await axios.post(`${gameServer}api/trade`, trade);    
        //   Alert.success(response.data.comment[0].body);
          this.setState({newTrade: false, partner: null, trade: response.data, viewTrade: true });
        } catch (err) {
          Alert.error(`${err.data} - ${err.message}`)
        };
      }

    submitProposal = async () => {
      console.log('Submitting trade proposal...');
      try {
          console.log(this.state)
          let { initiator, tradePartner } = this.state.trade;
          if (initiator.team._id === this.props.team._id)
              initiator.modified = true;
          else    
              tradePartner.modified = true;

          let response = await axios.put(`${gameServer}game/trade/modify`, this.state.trade);    
        //   Alert.success(response.data.comment[0].body);
          this.setState({newTrade: false, partner: null, trade: response.data, viewTrade: true });
        } catch (err) {
          Alert.error(`${err.data} - ${err.message}`)
        };
    }

    render() {
        let myTrade = {}
        let theirTrade = {}

        if (this.state.trade.initiator.team.name === this.props.team.name){
            myTrade = this.state.trade.initiator;
            theirTrade = this.state.trade.tradePartner;
        }
        else {
            myTrade = this.state.trade.tradePartner;
            theirTrade = this.state.trade.initiator;
        }

        let { status, lastUpdated } = this.state.trade;

        return (
            <Container>
                <Content>
                    { !this.state.viewTrade && <h4>I didn't create a trade feed... so sorry...</h4>}
                    { this.state.viewTrade && <FlexboxGrid>
                        <FlexboxGrid.Item colspan={12}>
                            <TradeOffer account={this.props.account} team={myTrade.team} onOfferEdit={this.onOfferEdit}/>
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item colspan={12}>
                            <TradeOffer team={theirTrade.team} onOfferEdit={this.onOfferEdit}/>
                        </FlexboxGrid.Item>
                    </FlexboxGrid>}
                </Content>
                <Sidebar>
                    {!this.state.newTrade && !this.state.viewTrade && <IconButton block size='sm' onClick={() => this.toggleNew()} icon={<Icon icon="exchange" />}>Start New Trade</IconButton>}
                    { this.state.viewTrade && <IconButton block size='sm' icon={<Icon icon="check" />} onClick={() =>this.submitProposal()}>Submit Proposal</IconButton>}
                    { this.state.viewTrade && <IconButton block size='sm' icon={<Icon icon="thumbs-down" />} onClick={() => Alert.warning('Rejection has not been implemented...', 4000)}>Reject Proposal</IconButton>}
                    { this.state.viewTrade &&<IconButton block size='sm' icon={<Icon icon="trash" />} onClick={() => Alert.warning('Trashing a trade deal has not been implemented...', 4000)}>Trash Trade</IconButton>}
                    { this.state.viewTrade &&<IconButton block size='sm' icon={<Icon icon="window-close-o" />} onClick={() => this.setState({ viewTrade: false })}>Close Trade</IconButton>}
                    <br />
                    { this.state.viewTrade && <PanelGroup>
                        <Panel header="Trade Details">
                            <TagGroup>
                                { status.draft && <Tag color="red">Draft</Tag> }
                                { status.pending && <Tag color="yellow">Pending Execution</Tag> }
                                { status.rejected && <Tag color="red">Rejected</Tag> }
                                { status.proposal && <Tag color="yellow">Awaiting Ratification</Tag> }
                                { status.proposal && <Tag color="green">Completed</Tag> }
                            </TagGroup>
                            <p><b>Last Updated:</b> {`${new Date(lastUpdated).toLocaleTimeString()} - ${new Date(lastUpdated).toDateString()}`}</p>
                        </Panel>
                        <Panel header="Activity Feed">
                        </Panel>
                    </PanelGroup> }
                    { !this.state.viewTrade && <PanelGroup>
                        <Panel header="Draft Trades">
                        </Panel>
                        <Panel header="Pending Trades">
                        </Panel>
                        <Panel header="Completed Trades">
                        </Panel>
                    </PanelGroup> }
                </Sidebar>
                <Modal size="xs" show={this.state.newTrade} onHide={() => this.setState({newTrade: false})}>
                    <Modal.Header>
                        <Modal.Title>New Trade Submission</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <SelectPicker
                            block
                            data={this.props.teams.filter(el => el._id !== this.props.team._id)}
                            labelKey='name'
                            valueKey='_id'
                            onChange={(value) => this.setState({partner: value})} 
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => this.createTrade()}>Create Trade</Button>
                        <Button onClick={() => this.setState({newTrade: false})}>Cancel</Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        );
    }
}

const mapStateToProps = state => ({
    login: state.auth.login,
    team: state.auth.team,
    teams: state.entities.teams.list,
    account: getTreasuryAccount(state)
});
  
const mapDispatchToProps = dispatch => ({
});
  
export default connect(mapStateToProps, mapDispatchToProps)(Trade);