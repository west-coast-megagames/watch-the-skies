import React, {Component, useState } from 'react'; // React import
import TeamAvatar from '../../../components/common/teamAvatar';
import { Container, Content, Sidebar, FlexboxGrid, Button, ButtonGroup, IconButton, Icon, Tag, TagGroup } from 'rsuite';
import { Form, ControlLabel, RadioGroup, Radio, FormGroup, FormControl, HelpBlock, CheckPicker, DateRangePicker, Checkbox, CheckboxGroup, SelectPicker, TagPicker, InputPicker, Slider, DatePicker } from 'rsuite';
import axios from 'axios';

const TradeOffer = (props) => {

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
      },
      {
        "label": "Marty",
        "value": "Marty",
        "role": "Master"
      },
      {
        "label": "Kenya",
        "value": "Kenya",
        "role": "Master"
      },
      {
        "label": "Hal",
        "value": "Hal",
        "role": "Developer"
      },
      {
        "label": "Julius",
        "value": "Julius",
        "role": "Developer"
      },
      {
        "label": "Travon",
        "value": "Travon",
        "role": "Developer"
      },
      {
        "label": "Vincenza",
        "value": "Vincenza",
        "role": "Developer"
      },
      {
        "label": "Dominic",
        "value": "Dominic",
        "role": "Developer"
      },
      {
        "label": "Pearlie",
        "value": "Pearlie",
        "role": "Guest"
      },
      {
        "label": "Tyrel",
        "value": "Tyrel",
        "role": "Guest"
      },
      {
        "label": "Jaylen",
        "value": "Jaylen",
        "role": "Guest"
      },
      {
        "label": "Rogelio",
        "value": "Rogelio",
        "role": "Guest"
      }
    ]

    const [formValue, setFormValue] = useState({
        input:
          "React Suite is a set of react component libraries for enterprise system products. Built by HYPERS front-end team and UX team, mainly serving company's big data products. After three major revisions, a large number of components and rich functionality have been accumulated.",
        checkbox: ['Node.js', 'CSS3', 'HTML5'],
        radio: 'HTML5',
        slider: 10,
        datePicker: new Date(),
        dateRangePicker: [new Date(), new Date()],
        checkPicker: [
          'Eugenia',
          'Kariane',
          'Louisa',
          'Marty',
          'Kenya',
          'Hal',
          'Julius',
          'Travon',
          'Vincenza',
          'Dominic',
          'Pearlie',
          'Tyrel',
          'Jaylen',
          'Rogelio'
        ],
        selectPicker: 'Louisa',
        tagPicker: [
          'Eugenia',
          'Kariane',
          'Louisa',
          'Marty',
          'Kenya',
          'Hal',
          'Julius',
          'Travon',
          'Vincenza',
          'Dominic',
          'Pearlie',
          'Tyrel',
          'Jaylen',
          'Rogelio'
        ],
        inputPicker: 'Rogelio',
        cascader: '1-1-5',
        multiCascader: ['1-1-4', '1-1-5']
      });

      const [mode, setMode] = useState('readonly');
      const disabled = mode === 'disabled';
      const readOnly = mode === 'readonly';

    return(
        <div className='trade'>

            <ButtonGroup>
                <IconButton size='sm' icon={<Icon icon="pencil" />} onClick={() => setMode("normal")}></IconButton>
                <IconButton size='sm' icon={<Icon icon="check" />} onClick={() => setMode("readonly")}></IconButton>
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
                <FormGroup>
                    <ControlLabel>Input</ControlLabel><HelpBlock tooltip>This is a tooltip description.</HelpBlock>
                    <FormControl
                    name="input"
                    rows={5} 
                    componentClass="textarea"
                    disabled={disabled}
                    readOnly={readOnly}
                    />
                    <HelpBlock tooltip>This is a tooltip description.</HelpBlock>
                </FormGroup>

                <FormGroup>
                    <ControlLabel>Checkbox</ControlLabel>
                    <FormControl
                    name="checkbox"
                    accepter={CheckboxGroup}
                    inline
                    disabled={disabled}
                    readOnly={readOnly}
                    >
                    <Checkbox disabled={disabled} value="Node.js">
                        Node.js
                    </Checkbox>
                    <Checkbox disabled={disabled} value="Webpack">
                        Webpack
                    </Checkbox>
                    <Checkbox disabled={disabled} value="CSS3">
                        CSS3
                    </Checkbox>
                    <Checkbox disabled={disabled} value="Javascript">
                        Javascript
                    </Checkbox>
                    <Checkbox disabled={disabled} value="HTML5">
                        HTML5
                    </Checkbox>
                    </FormControl>
                    <HelpBlock>This default description.</HelpBlock>
                </FormGroup>

                <FormGroup>
                    <ControlLabel>Radio</ControlLabel>
                    <FormControl
                    name="radio"
                    accepter={RadioGroup}
                    disabled={disabled}
                    readOnly={readOnly}
                    >
                    <Radio disabled={disabled} value="Node.js">
                        Node.js
                    </Radio>
                    <Radio disabled={disabled} value="Webpack">
                        Webpack
                    </Radio>
                    <Radio disabled={disabled} value="CSS3">
                        CSS3
                    </Radio>
                    <Radio disabled={disabled} value="Javascript">
                        Javascript
                    </Radio>
                    <Radio disabled={disabled} value="HTML5">
                        HTML5
                    </Radio>
                    </FormControl>
                </FormGroup>

                <FormGroup>
                    <ControlLabel>Slider</ControlLabel>
                    <FormControl
                    accepter={Slider}
                    min={0}
                    max={20}
                    name="slider"
                    label="Level"
                    style={{ width: 200, margin: '10px 0' }}
                    disabled={disabled}
                    readOnly={readOnly}
                    />
                </FormGroup>

                <FormGroup>
                    <ControlLabel>DatePicker</ControlLabel>
                    <FormControl
                    name="datePicker"
                    accepter={DatePicker}
                    disabled={disabled}
                    readOnly={readOnly}
                    />
                </FormGroup>

                <FormGroup>
                    <ControlLabel>DateRangePicker</ControlLabel>
                    <FormControl
                    name="dateRangePicker"
                    accepter={DateRangePicker}
                    disabled={disabled}
                    readOnly={readOnly}
                    />
                </FormGroup>

                <FormGroup>
                    <ControlLabel>CheckPicker</ControlLabel>
                    <FormControl
                    name="checkPicker"
                    accepter={CheckPicker}
                    data={pickerData}
                    disabled={disabled}
                    readOnly={readOnly}
                    />
                </FormGroup>

                <FormGroup>
                    <ControlLabel>SelectPicker</ControlLabel>
                    <FormControl
                    name="selectPicker"
                    accepter={SelectPicker}
                    data={pickerData}
                    disabled={disabled}
                    readOnly={readOnly}
                    />
                </FormGroup>

                <FormGroup>
                    <ControlLabel>TagPicker</ControlLabel>
                    <FormControl
                    name="tagPicker"
                    accepter={TagPicker}
                    data={pickerData}
                    disabled={disabled}
                    readOnly={readOnly}
                    />
                </FormGroup>

                <FormGroup>
                    <ControlLabel>InputPicker</ControlLabel>
                    <FormControl
                    name="inputPicker"
                    accepter={InputPicker}
                    data={pickerData}
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
                            <TradeOffer team={myTrade.team} />
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
 
export default Trade;