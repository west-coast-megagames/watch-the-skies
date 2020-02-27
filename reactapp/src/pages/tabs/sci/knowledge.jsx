import React, { Component } from 'react';
import { Table, Tag, Progress, Checkbox, Button } from 'rsuite';

const { Column, HeaderCell, Cell } = Table;
const fields = ['Biology', 'Computer Science', 'Electronics', 'Engineering', 'Genetics', 'Material Science','Physics', 'Psychology', 'Social Science', 'Quantum Mechanics'];

class Knowledge extends Component {
    state = { 
        data: [],
        checkedKeys: [],
        cost: 0
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
        const { data, checkedKeys } = this.state;

        let checked = false;
        let indeterminate = false;
    
        if (checkedKeys.length === data.length) {
          checked = true;
        } else if (checkedKeys.length === 0) {
          checked = false;
        } else if (checkedKeys.length > 0 && checkedKeys.length < data.length) {
          indeterminate = true;
        }
        
        return ( 
            <div>
                <h5 style={{display: 'inline'}}>Research Field Funding</h5><Button>Submit funding</Button>
                <hr style={{margin: 10}} />
                <Table
                    rowKey="field"
                    autoHeight
                    data={data}
                    >
                    <Column width={50} align="center">
                        <HeaderCell style={{ padding: 0 }}>
                        <div style={{ lineHeight: '40px' }}>
                            <Checkbox
                            inline
                            checked={checked}
                            indeterminate={indeterminate}
                            onChange={this.handleCheckAll}
                            />
                        </div>
                        </HeaderCell>
                        <CheckCell
                            dataKey="field"
                            checkedKeys={checkedKeys}
                            onChange={this.handleCheck}
                        />
                    </Column>
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

                    <Column flexGrow={1}>
                        <HeaderCell>Global Progress Towards next Level <Tag color="green" style={{float:'right'}}>Funding Cost: $M{this.state.cost}</Tag></HeaderCell>
                        <Cell dataKey="research.progress">{rowData => {
                            let totalProgress = rowData.research.totalProgress;
                            let percent = totalProgress / this.props.techCost[rowData.research.level] * 100
                            console.log(percent);
                            return(
                                <Progress.Line percent={totalProgress} />
                        )}}</Cell>

                    </Column>
                </Table>
            </div>
        );
    }

    handleCheckAll = (value, checked) => {
        const checkedKeys = checked ? this.state.data.map(item => item.field) : [];
        this.setState({
          checkedKeys
        });
      }

    handleCheck = (value, checked) => {
        const { checkedKeys } = this.state;
        const nextCheckedKeys = checked
          ? [...checkedKeys, value]
          : checkedKeys.filter(item => item !== value);
    
        this.setState({
          checkedKeys: nextCheckedKeys
        });
    }
}

const CheckCell = ({ rowData, onChange, checkedKeys, dataKey, ...props }) => (
    <Cell {...props} style={{ padding: 0 }}>
      <div style={{ lineHeight: '46px' }}>
        <Checkbox
          value={rowData[dataKey]}
          inline
          onChange={onChange}
          checked={checkedKeys.some(item => item === rowData[dataKey])}
        />
      </div>
    </Cell>
  );

export default Knowledge;