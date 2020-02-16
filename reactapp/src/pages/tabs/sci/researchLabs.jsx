import React, { Component } from 'react';
import { Progress, Table } from 'rsuite';
import MySelectPicker from './myselectpicker';

const { Column, HeaderCell, Cell } = Table;

const ProgressCell = ({ rowData, dataKey, ...props }) => {
//	console.log("MYROWDATA=",rowData);
	return (
	<Cell {...props} style={{ padding: 0 }}>
	  <div>
	  <Progress.Line percent={10} status='active' />
	  </div>
	</Cell>
	);
};

const ProgressValCell = ({ rowData, dataKey, ...props }) => {
		return (
			<Cell dataKey="status.progress" />
		);
	 };


class ResearchLabs extends Component {
	constructor() {
		super();
		this.state = {
			labUpdates: [],
			Labs: [
				{
					research: null,
					lab: "Lab 0"
				},
				{
					research: null,
					lab: "Lab 1"
				},
				{
					research: null,
					lab: "Lab 2"
				}
			],
			junk: null
		}
		this.handleChange = this.handleChange.bind(this);
		this.update = this.update.bind(this);
    }
  
	update(update) {
		let labUpdates = this.state.labUpdates;
		labUpdates.push(update);
		this.setState({labUpdates})
	}
  
	handleChange(value) {
		  //this.setState({research:value})
		  this.props.alert({type: 'success', title: 'Research Selected', body: `${this.props.lab} Drew is working on ${value}`})
	}
	
	render() { 
		console.log('TEAM=', this.props.team);
		console.log('EVERYTHING=', this.props.everythingProp);
		let props = this.props;
		let handleUpdate = this.update
		let alert = this.props.alert
		return(
			<div>
				<Table
				height={400}
				rowHeight={50}
                data={this.state.Labs}
                >
                <Column width={200} align="left" fixed>
                    <HeaderCell>Lab Name</HeaderCell>
                    <Cell dataKey="lab" />
                </Column>
        
                <Column width={300} align="left" fixed>
                    <HeaderCell>Action</HeaderCell>
                    <Cell dataKey="lab">
					{rowData => {      
						function handleSubmit(value) {
							alert({type: 'success', title: 'Research Selected', body: `${rowData.lab} Drew is working on ${value}`});
							let update = { lab: rowData.lab, research: value };
							handleUpdate(update);
						}          
						return (
							<MySelectPicker
								lab={rowData.lab}
								team={ props.team }
								allKnowledge={ props.allKnowledge}
								//accounts={ this.props.accounts }
								handleChange={ handleSubmit }
								alert={ props.alert }
							/>   
						)}}

					</Cell>
                </Column>
        
                <Column width={200}>
                    <HeaderCell>Current Progress</HeaderCell>
                    <ProgressCell pct="10" dataKey="id" />
                </Column>
        
                <Column width={200}>
                    <HeaderCell>Progress Value</HeaderCell>
					<ProgressValCell 
						allKnowledge={this.props.allKnowledge}
						dataKey="status.progress" 
					/>
                </Column>
    

                </Table>



				<hr />
				<span>Lab 2: </span>
				<MySelectPicker
					lab='Lab 2'  
					team={ this.props.team }
					allKnowledge={this.props.allKnowledge}
					//accounts={ this.props.accounts }
					//handleChange={ this.props.handleChange }
					alert={ this.props.alert }
				/>
			</div>
    	);
  	}
}

export default ResearchLabs;

