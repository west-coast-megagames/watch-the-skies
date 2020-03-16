import React, { Component } from 'react';
import { Table, Icon, Button, Progress, Affix } from 'rsuite';
import { lookupPct } from './../../../scripts/labs';
import SciIcon from './../../../components/common/sciencIcon';
import InfoTech from './InfoTech';
import BalanceHeader from '../../../components/common/BalanceHeader';
const { Column, HeaderCell, Cell } = Table;
const fields = ['Military', 'Infrastructure', 'Biomedical', 'Agriculture'];


// Places the progress bar into the cell within the Table
const ProgressCell = ({ rowData, dataKey, ...props }) => {
    let getPctResult = rowData.progressPct;
    if (getPctResult < 0) {     // If it is -1, then its a category.  Print "--"
        return (
            <Cell dataKey="progress" style={{ padding: 0 }} ></Cell>
        )
    } else {
        return (                // If it is >= 0, then its a research item.  Print the progress line
            <Cell {...props} style={{ padding: 0 }}>
                <div> <Progress.Line strokeWidth={10} percent={ rowData.progressPct } status='active' /> </div>
            </Cell>
        )
    }
};


class TechList extends Component {
    state = {
        showInfo: false,    // Boolean to tell whether to open the Info Drawer
        research: {},       // The research item to display inside the Info Drawer
        data: []            // All of the data to display in the tech list table
    };

    // Loads the table when switching to this tab
    componentDidMount() {
        this.loadTable();
    };

    // Reloads the table when props are updated
    componentDidUpdate(prevProps, prevState) {
        if (prevProps !== this.props) {
            this.loadTable();
        }
    };


    render() {
        let props = this.props;

        return (            
            <div>
				<BalanceHeader 
					accounts={this.props.accounts}
					code={"SCI"}
					title={"Currently Known Applied Technologies"}
				/>
                <React.Fragment>
                    <Table
                        isTree
                        defaultExpandAllRows
                        rowKey="id"
                        autoHeight
                        data={this.state.data}
                        onExpandChange={(isOpen, rowData) => {
//                            console.log(isOpen, rowData);
                        }}
                        renderTreeToggle={(icon, rowData) => {
                            if (rowData.children && rowData.children.length === 0) {
                            return <Icon icon="spinner" spin />;
                            }
                            return icon;
                        }}
                        >
                        <Column verticalAlign='middle' width={275}>
                            <HeaderCell>Known Technologies</HeaderCell>
                            <Cell dataKey="labelName" />
                        </Column>

                        <Column align='center' verticalAlign='middle' width={50}>
                            <HeaderCell>Level</HeaderCell>
                            <Cell style={{ padding: 0 }} >
                            {rowData => {
                                return (
                                    <div>
                                        <SciIcon size={40} level={rowData.level} />
                                    </div>
                                )
                            }}
                            </Cell>
                        </Column>

                        <Column align='center' verticalAlign='middle' width={150}  >
                            <HeaderCell>Current Progress</HeaderCell>
                            <ProgressCell 
                                allresearch={ props.allResearch }
                                techcost={ props.techCost }
                            />
                        </Column>

                        <Column width={100} flexGrow={1} >
                            <HeaderCell>Description</HeaderCell>
                            <Cell dataKey="desc" />
                        </Column>

                        <Column align='center' verticalAlign='middle' width={150} fixed="right">
                            <HeaderCell>Action</HeaderCell>
                            <Cell style={{ padding: 0 }} >
                            {rowData => {
                                if (rowData.type !== 'category') {
                                return (
                                    <div style={{ verticalAlign: 'top'}}>
                                        <Button color='blue' size='sm' onClick={ () => this.infoPressed(rowData) } > Add'l Info </Button>
                                    </div>)
                                } 
                            }}
                            </Cell>
                        </Column>
                    </Table>
                
                    { this.state.showInfo ? 
                        <InfoTech
                            show={ this.state.showInfo }
                            onClick={ this.infoPressed }
                            research={ this.state.research}
                        /> 
                        : 
                        null 
                    }
                </React.Fragment>
            </div>
        );
    }

    // If info button is pressed, change the state so that the drawer will look only at the current row
    infoPressed = async (rowData) => {
        this.setState({
            showInfo: !this.state.showInfo,
            research: rowData
        });
    };

    // Loads the complete array of data[] to use in the table
    loadTable() {
        let data = this.state.data;
        let research = [];          // Array of objects which hold all techs of a certain field (Military, Agriculture, etc)

        let id_count = 0;           // A unique count to assign to the fields
        let obj = {};               // Object to add to the data array
        data = [];                  // Data to populate the table with
        
        for (let field of fields) {   
            id_count++; 
//            console.log("TEAM=",this.props.team);
            research = this.props.allResearch.filter(el => el.type !== "Knowledge" && el.team === this.props.team._id && el.field === field);
//            console.log("RES=",research);
            obj = {
                id: id_count,       // Unique ID.  For categories, use "1, 2, 3, 4, etc"
                type: `category`,   // Type is "category", for main groups
                labelName: field,   // Name of the group (Military, Agriculture, etc)
                level: '',          // Not used for groups
                progressPct: -1,    // Groups do not have progress. keep at -1 so that no progress bar is shown on these lines
                desc: '',           // Not used for groups
                prereqs: {},        // Not used for groups
                theoretical: {},    // Not used for groups
                children: research.map(el => {
                    return {
                        id:el._id,                      // Unique ID.  For children (techs), use the ID from reserach array
                        type:el.type,                   // Not used in children (techs), but assigned to the type from reserach array
                        labelName:el.name,              // Name from reserach array (i.e. Improved Alloys)
                        level:el.level,                 // Level from reserach array
                        progressPct:lookupPct(el._id, research, this.props.techCost),   // % of completion of the child (tech)
                        desc:el.desc,                   // Description from reserach array
                        prereqs:el.prereq,              // Prereqs for this child (tech) from reserach array
                        theoretical:el.theoretical      // Theoretical unlocks for this child (tech) from reserach array
                    };
                })
            }
            data.push(obj);
        }    

        this.setState({ data })
    }
}

export default TechList;
