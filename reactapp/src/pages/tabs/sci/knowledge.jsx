import React, { Component } from 'react';
import { Table, Badge, Tag, Progress } from 'rsuite';

const { Column, HeaderCell, Cell } = Table;
const fields = ['Biology', 'Computer Science', 'Electronics', 'Engineering', 'Genetics', 'Material Science','Physics', 'Psychology', 'Social Science', 'Quantum Mechanics'];

class Knowledge extends Component {
    state = { 
        data: []
    }

    componentDidMount() {
        let knowledge = this.props.allResearch.filter(el => el.type === 'Knowledge')
        let tableKnowlege = this.createTable(knowledge);
        this.setState({ data: tableKnowlege });
    }
    
    createTable = (knowledge) => {
        let data = this.state.data;
        console.log(fields)
        for (let field of fields) {
            let object = {}
            console.log(field)
            object.field = field;
            object.research = undefined;
            object.complete = []
            let fieldResearch = knowledge.filter(el => el.field === field);
            for (let el of fieldResearch) {
                if (el.status.completed === true) {
                    object.complete.push(el)
                } else if (el.status.completed === false) {
                    object.research = el
                }
            };
            data.push(object);
        }
        return data;
    }
    
    render() { 
        
        return ( 
            <div>
                <Table
                    rowKey="field"
                    autoHeight
                    data={this.state.data}
                    >
                    <Column width={200}>
                        <HeaderCell>Field</HeaderCell>
                        <Cell dataKey="field" />
                    </Column>
                
                    <Column align='center' width={100}>
                        <HeaderCell>Global Level</HeaderCell>
                        <Cell>{rowData => {
                            let currentLevel = rowData.research.level - 1;
                            return(
                                <Tag color='green'>{currentLevel}</Tag>
                        )}}</Cell>
                    </Column>

                    <Column width={300}>
                        <HeaderCell>Global Progress Towards next Level</HeaderCell>
                        <Cell dataKey="research.progress">{rowData => {
                            let totalProgress = 0;
                            // for (let [value] of rowData.research.progress) {
                            //     totalProgress += value;
                            // };
                            let percent = totalProgress / this.props.techCost[rowData.research.level] * 100
                            console.log(percent);
                            return(
                                <Progress.Line percent={5} />
                        )}}</Cell>

                    </Column>
                </Table>
            </div>
        );
    }
}

export default Knowledge;