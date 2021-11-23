import React, { Component } from 'react';
import { connect } from 'react-redux'; // Redux store provider
import { Table, Tag, Progress } from 'rsuite';
import { getSciAccount } from '../../../store/entities/accounts';
import FieldIcon from '../../../components/common/fieldIcon';

const { Column, HeaderCell, Cell } = Table;
const fields = ['Biology', 'Computer Science', 'Electronics', 'Engineering', 'Genetics', 'Material Science','Physics', 'Psychology', 'Social Science', 'Quantum Mechanics'];

class Knowledge extends Component {
  constructor(props) {
		super(props);
		this.state = {
      data: [],
    }
    this.createTable = this.createTable.bind(this);
  }

	componentDidMount() {
		if (this.props.knowledge.length !== 0) {              
			let tableKnowlege = this.createTable();
			this.setState({ data: tableKnowlege });
		} 
	}

	componentDidUpdate (prevProps, prevState) {
		if (prevProps.lastFetch !== this.props.lastFetch) {
			if (this.props.knowledge.length !== 0) {              
				let tableKnowlege = this.createTable();
				this.setState({ data: tableKnowlege });
			} 
		}
  }
    
	createTable = () => {
		let knowledge = this.props.knowledge
		let data = [];
		for (let field of fields) {
			let object = {};
			object.field = field;
			object.research = undefined;
			object.complete = []
			object.research_id = ''
			let fieldResearch = knowledge.filter(el => el.field === field);
			for (let el of fieldResearch) {
				if (el.status.some(el2 => el2 === 'completed')) {
					object.complete.push(el)
				} else if (!el.status.some(el2 => el2 === 'completed')) {
					object.research = el
					object.research_id = el._id
				}
			};
			if (object.research === undefined) object.research = knowledge.find(el => el.field === field && el.level === 5);
			data.push(object);
		}
		return data;
  }
    
  render() {
    const { data } = this.state;

		return ( 
			<Table
					rowKey="field"
					autoHeight
					data={data}
			>
				<Column width={200}>
						<HeaderCell>Field</HeaderCell>
						<Cell style={{padding:'8px'}}>{rowData => {
								return (<FieldIcon size='sm' field={rowData.field} />)
						}}</Cell>
				</Column>

				<Column align='center' width={100}>
					<HeaderCell>Global Level</HeaderCell>
					<Cell>
						{rowData => {
							let currentLevel = rowData.research.level - 1;
							return(<Tag color='green'>{currentLevel}</Tag>)
						}}
					</Cell>
				</Column>

				<Column verticalAlign='middle' flexGrow={1}>
					<HeaderCell>Global Progress Towards next Level</HeaderCell>
					<Cell style={{padding: '8px'}}>
						{rowData => {
							let progress = rowData.research.progress;
							let percent = Math.floor(progress / (this.props.techCost[rowData.research.level] * 10) * 100);
							return(<Progress.Line percent={percent} />)
						}}
					</Cell>
				</Column>
			</Table>
		);
	}
}

const mapStateToProps = state => ({
    login: state.auth.login,
    team: state.auth.team,
    lastFetch: state.entities.research.lastFetch,
    facilities: state.entities.facilities.list,
    knowledge: state.entities.research.list.filter(el => el.type === 'Knowledge'),
    account: getSciAccount(state)
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Knowledge);