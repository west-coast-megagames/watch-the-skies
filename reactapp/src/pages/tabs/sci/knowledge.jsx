import React, { Component } from 'react';
import { Progress } from 'rsuite';
import { Table } from 'rsuite';

const { Column, HeaderCell, Cell, Pagination } = Table;



class Knowledge extends Component {
    state = { 
        lab : ['lab1', 'lab2', 'lab3']
    }
    

    
    handleEdit() {
        console.log("handleEdit");
    }
    
    render() { 
        //console.log('ALLKNOWLEDGE:', this.props.allKnowledge);
        const { allKnowledge } = this.props;        // Scientific Knowledge Names
        console.log('ALLKNOWLEDGE:', allKnowledge);
        const names = [...new Set(allKnowledge.map(index => index.name))];      // Uniquify the names so that no knowledge is repeated, place into names array
        console.log('NAMES: ', names);
        const completedKnowledge = allKnowledge.filter(knowledge => knowledge.status.completed);
        console.log('completedKnowledge: ', completedKnowledge);
        const inProgressKnowledge = allKnowledge.filter(knowledge => !knowledge.status.completed);
        console.log('inProgressKnowledge: ', inProgressKnowledge);
        /* COMMENT FOR BELOW IN RETURN
        <ul>{ allKnowledge.map(index => (<li key={index._id}> Name: {index.name} </li>))}</ul>
        <ul>{ names.map(index => (<li key={index}> Unique: {index} </li>))}</ul>
        */
        return ( 
            <div>
                <h5>Active focus: Computer Science I</h5>
                <Progress.Line percent={25} status='active' />
                <Table
                height={400}
                //data={this.state.data}
                data={allKnowledge}
                //onRowClick={data => {
                //    console.log(data);
                //}}
                >
                <Column width={130} align="left" fixed>
                    <HeaderCell>Field</HeaderCell>
                    <Cell dataKey="field" />
                </Column>
        
                <Column width={50} align="center" fixed>
                    <HeaderCell>Level</HeaderCell>
                    <Cell dataKey="level" />
                </Column>
        
                <Column width={75} align="center" >
                    <HeaderCell>Progress</HeaderCell>
                    <Cell dataKey="status.progress" />
                </Column>
        
                <Column width={200}>
                    <HeaderCell>Description</HeaderCell>
                    <Cell dataKey="desc" />
                </Column>
        
                <Column width={200}>
                    <HeaderCell>Street</HeaderCell>
                    <Cell dataKey="field" />
                </Column>

                <Column width={120} fixed="right">
                    <HeaderCell>Action</HeaderCell>
        
                    <Cell>
                    {rowData => {
                        function handleAction() {
                        alert(`id:${rowData.id}`);
                        }
                        return (
                        <span>
                            <a onClick={ () => {this.handleEdit()}}> Edit </a> |{' '}
                            <a onClick={ () => {this.handleEdit()}}> Remove </a>
                        </span>
                        );
                    }}
                    </Cell>
                </Column>
                </Table>
            </div>
        );
    }
}

export default Knowledge;






//class FixedColumnTable extends React.Component {
//    constructor(props) {
//      super(props);
//      this.state = {
//        data: fakeData
//      };
//    }
//    render() {
//      return (



//      );
//    }
//  }
//  ReactDOM.render(<FixedColumnTable />);