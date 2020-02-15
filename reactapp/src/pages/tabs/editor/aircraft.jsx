import React, { Component, useState } from 'react';
import { Form, FormGroup, FormControl, ControlLabel, HelpBlock } from 'rsuite';
import { RadioGroup, Radio, CheckboxGroup, Checkbox, Slider, DatePicker, DateRangePicker, CheckPicker, SelectPicker, TagPicker, InputPicker, Cascader, MultiCascader, Input, InputGroup } from 'rsuite';

const pickerData = [];
const models = ['Equipment', 'facility', 'site', 'account', 'log', 'article', 'military', 'aircraft', 'spacecraft', 'reserach', 'site', 'base', 'team', 'country', 'user'];

const Aircraft = () => {
const cascaderData = models;
const [formValue, setFormValue] = useState({
  name: "Rawr!",
  test: "Testing",
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
const plaintext = mode === 'plaintext';

return (
  <Form formValue={formValue} onChange={formValue => setFormValue(formValue)}>
    <ControlLabel>Change show mode</ControlLabel>
    <RadioGroup inline value={mode} onChange={value => setMode(value)}>
      <Radio value="normal">normal</Radio>
      <Radio value="readonly">readonly</Radio>
      <Radio value="disabled">disabled</Radio>
      <Radio value="plaintext">plaintext</Radio>
    </RadioGroup>

    <FormGroup>
      <ControlLabel classPrefix={'input-addon'}>Name: </ControlLabel>
      <FormControl 
        name="name"
        disabled={disabled}
        readOnly={readOnly}
        plaintext={plaintext}
      />
      <HelpBlock tooltip>This is a tooltip description.</HelpBlock>
    </FormGroup>

    <InputGroup>
      <Input
        name="test"
        disabled={disabled}
        readOnly={readOnly}
        plaintext={plaintext}
      />
      <InputGroup.Addon>.com</InputGroup.Addon>
    </InputGroup>

    <FormGroup>
      <ControlLabel>Checkbox</ControlLabel>
      <FormControl
        name="checkbox"
        accepter={CheckboxGroup}
        inline
        disabled={disabled}
        readOnly={readOnly}
        plaintext={plaintext}
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
        plaintext={plaintext}
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
        plaintext={plaintext}
      />
    </FormGroup>

    <FormGroup>
      <ControlLabel>DatePicker</ControlLabel>
      <FormControl
        name="datePicker"
        accepter={DatePicker}
        disabled={disabled}
        readOnly={readOnly}
        plaintext={plaintext}
      />
    </FormGroup>

    <FormGroup>
      <ControlLabel>DateRangePicker</ControlLabel>
      <FormControl
        name="dateRangePicker"
        accepter={DateRangePicker}
        disabled={disabled}
        readOnly={readOnly}
        plaintext={plaintext}
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
        plaintext={plaintext}
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
        plaintext={plaintext}
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
        plaintext={plaintext}
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
        plaintext={plaintext}
      />
    </FormGroup>

    <FormGroup>
      <ControlLabel>Cascader</ControlLabel>
      <FormControl
        name="cascader"
        accepter={Cascader}
        data={cascaderData}
        disabled={disabled}
        readOnly={readOnly}
        plaintext={plaintext}
      />
    </FormGroup>

    <FormGroup>
      <ControlLabel>MultiCascader</ControlLabel>
      <FormControl
        name="multiCascader"
        accepter={MultiCascader}
        data={cascaderData}
        disabled={disabled}
        readOnly={readOnly}
        plaintext={plaintext}
      />
    </FormGroup>
  </Form>
);
};
 
export default Aircraft;