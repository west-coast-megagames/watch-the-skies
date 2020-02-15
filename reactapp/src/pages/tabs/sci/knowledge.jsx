import React, { Component } from 'react';
import { Progress } from 'rsuite';
import { Table } from 'rsuite';

const { Column, HeaderCell, Cell } = Table;

/*
const ActionCell = ({ rowData, dataKey, ...props }) => {
    function handleDrew() {
      alert(`id:${rowData[dataKey]}`);
    }
    return (
      <Cell {...props} className="link-group">
        <IconButton
          appearance="subtle"
          onClick={handleDrew}
          icon={<Icon icon="edit2" />}
        />
        <Divider vertical />
        <Whisper>
          <IconButton appearance="subtle" icon={<Icon icon="more" />} />
        </Whisper>
      </Cell>
    );
  };


const ImageCell = ({ rowData, dataKey, ...props }) => (
    <Cell {...props} style={{ padding: 0 }}>
      <div
        style={{
          width: 40,
          height: 40,
          background: '#f5f5f5',
          borderRadius: 20,
          marginTop: 2,
          overflow: 'hidden',
          display: 'inline-block'
        }}
      >
        <img src={rowData[dataKey]} width="44" />
        <p className="card-text"><Progress.Line percent={30} status='active' /></p>
      </div>
    </Cell>
  );
*/

  const ProgressCell = ({ rowData, dataKey, ...props }) => (
    <Cell {...props} style={{ padding: 0 }}>
      <div>
        <Progress.Line percent={25} status='active' />
      </div>
    </Cell>
  );
  
  
  class Labs extends Component {
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
//            <React.Fragment>
//                <h5>Active focus: Computer Science I</h5>
//                <Progress.Line percent={25} status='active' />
//                <table className="table">
//                    <thead>
//                        <tr>
//                            <th>Knowledge</th>
//                            <th>Level</th>
//                            <th>Progress</th>
//                            <th>Desc</th>
//                        </tr>
//                    </thead>
//                    <tbody>
//                        {allKnowledge.map(index => (
//                            <tr>
//                                <td>{index.field}</td>
//                                <td>{index.level}</td>
//                                <td>{index.status.progress}</td>
//                                <td>{index.desc}</td>
//                            </tr>
//                        ))}
//                    </tbody>
//                </table>
//            </React.Fragment>



            <div>
                
                <Table
                height={400}
                //data={this.state.data}
                data={allKnowledge}
                //onRowClick={data => {
                //    console.log(data);
                //}}
                >
                <Column width={70} align="center" fixed>
                    <HeaderCell>Id</HeaderCell>
                    <Cell dataKey="field" />
                </Column>
        
                <Column width={200} fixed>
                    <HeaderCell>First Name</HeaderCell>
                    <Cell dataKey="level" />
                </Column>
        
                <Column width={200}>
                    <HeaderCell>Last Name</HeaderCell>
                    <Cell dataKey="status.progress" />
                </Column>
        
                <Column width={200}>
                    <HeaderCell>City</HeaderCell>
                    <Cell dataKey="desc" />
                </Column>
        
                <Column width={200}>
                    <HeaderCell>Street</HeaderCell>
                    <Cell dataKey="field" />
                </Column>
        
                <Column width={300}>
                    <HeaderCell>Company Name</HeaderCell>
                    <Cell dataKey="field" />
                </Column>
        
                <Column width={300}>
                    <HeaderCell>Email</HeaderCell>
                    <Cell dataKey="field" />
                </Column>
                <Column width={120} fixed="right">
                    <HeaderCell>Action</HeaderCell>
        
                    <Cell>
                    {rowData => {
                        //function handleAction() {
                        //alert(`id:${rowData.id}`);
                        //}
                        return (
                        <span>
                        </span>
                        );
                    }}
                    </Cell>
                </Column>
                <Column width={120} fixed="right">
            <       HeaderCell>Action</HeaderCell>
                    <ProgressCell dataKey="id" />
                </Column>

                </Table>
            </div> 
        );
    }
}

export default Labs;






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