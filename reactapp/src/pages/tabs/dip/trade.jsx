import React, {Component, useState } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { useSelector } from 'react-redux'
import TeamAvatar from '../../../components/common/teamAvatar';
import { Container, Content, Sidebar, FlexboxGrid, ButtonGroup, IconButton, Icon, Tag, TagGroup, Panel, PanelGroup } from 'rsuite';
import { Form, ControlLabel, FormGroup, FormControl, TagPicker, Slider } from 'rsuite';
import { getTreasuryAccount } from '../../../store/entities/accounts';
import { getCompletedResearch } from '../../../store/entities/research';

const formatData = (array) => {
    let data = []
    for (let el of array) {
        data.push({ label: el.name, value: el._id, })
    }
    return data;
}

const pickerData =   
    [
      {
        "label": "Eugenia",
        "value": "Eugenia",
        "role": "Master"
      },
      {
        "label": "Kariane",
        "value": "Kariane",
        "role": "Master"
      },
      {
        "label": "Louisa",
        "value": "Louisa",
        "role": "Master"
      }
    ]

const TradeOffer = (props) => {
    let research = useSelector(getCompletedResearch)
    console.log(research)
    props.team._id !== useSelector(state => state.auth.team)._id ? research = [] : research = research = formatData(research);
        
    console.log(research)



    const [formValue, setFormValue] = useState({
        input:
          "I want all your things!!.",
        slider: 0,
        aircraft: [],
        intel: [],
        research: [],
        sites: [],
        equipment: [],
      });

      const [mode, setMode] = useState('disabled');
      const disabled = mode === 'disabled';
      const readOnly = mode === 'readonly';

    return(
        <div className='trade'>

            <ButtonGroup>
                <IconButton size='sm' icon={<Icon icon="pencil" />} onClick={() => setMode("normal")}></IconButton>
                <IconButton size='sm' icon={<Icon icon="check" />} onClick={() => setMode("disabled")}></IconButton>
                <IconButton size='sm' icon={<Icon icon="trash" />}></IconButton>
            </ButtonGroup>
            <TagGroup style={{display: 'inline', paddingLeft: '20px'}}>
                <Tag color="yellow">Pending</Tag>
                <Tag color="red">Rejected</Tag>
                <Tag color="green">Accepted</Tag>
                <Tag color="blue">Completed</Tag>
            </TagGroup>
            <h2><TeamAvatar size='md' teamCode={props.team.teamCode} />{props.team.name}</h2>
            <Form formValue={formValue} onChange={formValue => setFormValue(formValue)}>

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

                {!disabled ? <FormGroup>
                    <ControlLabel>Aircraft</ControlLabel>
                    <FormControl
                    name="aircraft"
                    accepter={TagPicker}
                    data={pickerData}
                    disabled={disabled}
                    readOnly={readOnly}
                    />
                </FormGroup> : null }

                {disabled && formValue.aircraft.length > 0 ? <Panel header={<span><b>Aircraft</b> - {formValue.aircraft.length} Aircraft</span>} collapsible>
                    <PanelGroup>{formValue.aircraft.map((unit) => <Panel className='trade-list' hover key={unit}>{unit}</Panel>)}</PanelGroup>
                </Panel> : null }

                {!disabled ? <FormGroup>
                    <ControlLabel>Intel</ControlLabel>
                    <FormControl
                    name="intel"
                    accepter={TagPicker}
                    data={pickerData}
                    disabled={disabled}
                    readOnly={readOnly}
                    />
                </FormGroup> : null }

                {disabled && formValue.intel.length > 0 ? <Panel header={<span><b>Intel</b> - {formValue.intel.length} Intelegence Reports</span>} collapsible>
                    <PanelGroup>{formValue.intel.map((unit) => <Panel className='trade-list' hover key={unit}>{unit}</Panel>)}</PanelGroup>
                </Panel> : null }

                {!disabled ? <FormGroup>
                    <ControlLabel>Research</ControlLabel>
                    <FormControl
                    name="research"
                    accepter={TagPicker}
                    data={research}
                    disabled={disabled}
                    readOnly={readOnly}
                    />
                </FormGroup> : null }

                {disabled && formValue.research.length > 0 ? <Panel header={<span><b>Research</b> - {formValue.research.length} Research reports</span>} collapsible>
                    <PanelGroup>{formValue.research.map((unit) => <Panel className='trade-list' hover key={unit}>{unit}</Panel>)}</PanelGroup>
                </Panel> : null }

                {!disabled ? <FormGroup>
                    <ControlLabel>Sites</ControlLabel>
                    <FormControl
                    name="sites"
                    accepter={TagPicker}
                    data={pickerData}
                    disabled={disabled}
                    readOnly={readOnly}
                    />
                </FormGroup> : null }

                {disabled && formValue.sites.length > 0 ? <Panel header={<span><b>Sites</b> - {formValue.sites.length} Sites</span>} collapsible>
                    <PanelGroup>{formValue.sites.map((unit) => <Panel className='trade-list' hover key={unit}>{unit}</Panel>)}</PanelGroup>
                </Panel> : null }

                {!disabled ? <FormGroup>
                    <ControlLabel>Sites</ControlLabel>
                    <FormControl
                    name="sites"
                    accepter={TagPicker}
                    data={pickerData}
                    disabled={disabled}
                    readOnly={readOnly}
                    />
                </FormGroup> : null }

                {!disabled ? <FormGroup>
                    <ControlLabel>Equipment</ControlLabel>
                    <FormControl
                    name="equipment"
                    accepter={TagPicker}
                    data={pickerData}
                    disabled={disabled}
                    readOnly={readOnly}
                    />
                </FormGroup> : null }

                {disabled && formValue.equipment.length > 0 ? <Panel header={<span><b>Equipment</b> - {formValue.equipment.length} Equipment</span>} collapsible>
                    <PanelGroup>{formValue.equipment.map((unit) => <Panel className='trade-list' hover key={unit}>{unit}</Panel>)}</PanelGroup>
                </Panel> : null }

                {!disabled ? <FormGroup>
                    <ControlLabel>Equipment</ControlLabel>
                    <FormControl
                    name="equipment"
                    accepter={TagPicker}
                    data={pickerData}
                    disabled={disabled}
                    readOnly={readOnly}
                    />
                </FormGroup> : null }

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
            </Form>
        </div>
    )
}

class Trade extends Component {
    state = {
        trade: {
            offers: [
                { team: {}, megabucks: 0, units: [], intel: [], research: [], countries: [], equipment: [], ratified: false, pending: false, complete: false},
                { team: {}, megabucks: 0, units: [], intel: [], research: [], countries: [], equipment: [], ratified: false, pending: false, complete: false}
            ],
            status: {draft: true, proposal: false, complete: false}   
        }
    }

    componentWillMount() {
        let trade = this.state.trade;
        trade.offers[0].team = this.props.team;
        trade.offers[1].team = this.props.teams[4];
    }

    render() {
        let myTrade = {}
        let theirTrade = {}
        for (let offer of this.state.trade.offers) {
            if (Object.keys(offer.team).length > 0) {
                offer.team.name === this.props.team.name ? myTrade = offer : theirTrade = offer;
            }
        }

        return (
            <Container>
                <Content>
                    <FlexboxGrid>
                        <FlexboxGrid.Item colspan={12}>
                            <TradeOffer account={this.props.account} team={myTrade.team} />
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item colspan={12}>
                            <TradeOffer team={theirTrade.team} />
                        </FlexboxGrid.Item>
                    </FlexboxGrid>
                </Content>
                <Sidebar>
                    <IconButton block icon={<Icon icon="exchange" />}>Start New Trade</IconButton>
                    <hr />
                    <h5>Draft Trades</h5>
                    <hr />
                    <h5>Pending Trades</h5>
                    <hr />
                    <h5>Completed Trades</h5>
                </Sidebar>
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