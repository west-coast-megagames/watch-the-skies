import React, { Component } from 'react';
import { Progress, Table } from 'rsuite';
import MySelectPicker from './myselectpicker';

const { Column, HeaderCell, Cell } = Table;

const ProgressCell = ({ rowData, dataKey, ...props }) => {
	return (
	<Cell {...props} style={{ padding: 0 }}>
	  	<div>
	  		<Progress.Line percent={rowData.pct} status='active' />
	  	</div>
	</Cell>
	);
};

class ResearchLabs extends Component {
	constructor() {
		super();
		this.state = {
			research: [],
			labUpdates: [],
			labs2 : [],
			Labs: [
				{
					research: null,
					lab: "Lab 0",
					pct: 100
				},
				{
					research: null,
					lab: "Lab 1",
					pct: 50
				},
				{
					research: null,
					lab: "Lab 2",
					pct: 61
				}
			],
			junk: null
		}
		this.handleUpdate = this.handleUpdate.bind(this);
    }
  
	handleUpdate(updatedLab) {
		let labUpdates = this.state.labUpdates;
		labUpdates.push(updatedLab);
		this.setState({labUpdates});
		this.props.alert({type: 'success', title: 'Research Selected', body: `${updatedLab.lab} is working on ${updatedLab.research}`})
	}
  
	componentDidMount(){
		let research = this.props.allKnowledge.filter(el => el.type !== "Knowledge" && el.team === this.props.team._id);
		//let labs2 = this.props.everythingProp.filter(el => el.type === "Lab" && el.team._id === this.props.team._id);
		//this.setState({research});
		//let labs2 = this.props.everythingProp.filter(el => el.type === 'Lab' && el.team._id === this.props.team._id);
		//this.setState({research, labs2});
		this.setState({research});
	}
	
	render() { 
		//console.log('TEAM=', this.props.team);
		//console.log('EVERYTHING=', this.props.everythingProp);
		let props = this.props;
		let research = this.state.research;
		let sendUpdate = this.handleUpdate;
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
						function handleChange(value) {
							let updatedLab = { lab: rowData.lab, research: value };
							sendUpdate(updatedLab);
						}          
						return (
							<MySelectPicker
								lab={ rowData.lab }
								team={ props.team }
								allKnowledge={ props.allKnowledge }
								availibleResearch={ research }
								//accounts={ this.props.accounts }
								handleChange={ handleChange }
								alert={ props.alert }
							/>   
						)}}

					</Cell>
                </Column>
        
                <Column width={200}>
                    <HeaderCell>Current Progress</HeaderCell>
                    <ProgressCell dataKey="lab"/>
                </Column>
        
                <Column width={200}>
                    <HeaderCell>Progress Value</HeaderCell>
					<Cell dataKey="pct" />
                </Column>
    

                </Table>



				<hr />
				<span>Lab 2: </span>
				<MySelectPicker
					lab='Lab 2'  
					team={ this.props.team }
					allKnowledge={this.props.allKnowledge}
					alert={ this.props.alert }
				/>
			</div>
    	);
  	}
}

export default ResearchLabs;

