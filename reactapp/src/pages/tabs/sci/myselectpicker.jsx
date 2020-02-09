import React, { Component } from 'react';
import { SelectPicker } from 'rsuite';

 
class MySelectPicker extends Component {

    state = {
    //    data: []
    };
  
	handleChange(data) {
	  	this.setState( {data} );
	}

	componentDidMount() {
    };

    componentDidUpdate(prevProps, prevState) {
        if (prevProps !== this.props) {
            this.loadTable();
        }
    }
	
    loadTable() {
		//console.log('PROPS=', this.props);
		console.log(`Load: Data ${this.props.allKnowledge}`);
        let data = [{
			label: 'Label1',
			value: 'Value1',
			role:  'Master1'
		}, {
			label: 'Label2',
			value: 'Value2',
			role:  'Master2'
		}, {
			label: this.props.allKnowledge.map(el => el.name),
			value: 'ValueJunk',
			role:  'MasterJunk'
		}];
        
        this.setState( {data} );
    }	


	
	render() {
		const { allKnowledge, team } = this.props;                    // Prop Objects holding all Knowledge known and team
		console.log('ALLKNOW=', this.props.allKnowledge);
		console.log('DATA=', this.state.data);
		return (
			<SelectPicker
				value={this.state.value}
		  		onChange={this.handleChange}
		  		data={this.state.data}
		  		style={{ width: 224 }}
			/>
	  	);
	}
}
  
export default MySelectPicker;