import React, { Component } from 'react';
import { Table, Icon } from 'rsuite';

const { Column, HeaderCell, Cell } = Table;



class Labs extends Component {
    state = { 
        lab : ['lab1', 'lab2', 'lab3']
    }
    

    
    formatTableData(origData) {
        //console.log('ORIGDATA=', origData);
        //const names = [...new Set(origData.allKnowledge.map(index => index.name))];      // Uniquify the names so that no knowledge is repeated, place into names array
        //console.log('FUNKNAMES=', names);
        const knowledgeTypes = origData.filter(knowledge => (knowledge.type === "Knowledge"));
        console.log('KNOWLEDGETYPES=', knowledgeTypes);
        const physicsKnowledge = knowledgeTypes.filter(knowledge => (knowledge.field === "Physics"));
        const socialScienceKnowledge = knowledgeTypes.filter(knowledge => (knowledge.field === "Social Science"));
        const biologyKnowledge = knowledgeTypes.filter(knowledge => (knowledge.field === "Biology"));
        const engineeringKnowledge = knowledgeTypes.filter(knowledge => (knowledge.field === "Engineering"));
        const electronicsKnowledge = knowledgeTypes.filter(knowledge => (knowledge.field === "Electronics"));
        const geneticsKnowledge = knowledgeTypes.filter(knowledge => (knowledge.field === "Genetics"));

        const techTypes = origData.filter(knowledge => (knowledge.type === "Tech"));
        console.log('TECHTYPES=', techTypes);
        
        
        const tableData = [
            {
              id: 'h1ScientificKnowledge',
              labelName: 'Scientific Knowledge',
              children: [
                {
                    id: 'h2Physics',
                    labelName: 'Physics',
                    children: physicsKnowledge.map(index => {
                        return {id:index._id, labelName:index.name, level:index.level, progress:index.status.progress  };
                    })
                },
                {
                    id: 'h2SocialScience',
                    labelName: 'Social Science',
                    children: socialScienceKnowledge.map(index => {
                        return {id:index._id, labelName:index.name, level:index.level, progress:index.status.progress  };
                    })
                },
                {
                    id: 'h2Biology',
                    labelName: 'Biology',
                    children: biologyKnowledge.map(index => {
                        return {id:index._id, labelName:index.name, level:index.level, progress:index.status.progress  };
                    })
                },
                {
                    id: 'h2Engineering',
                    labelName: 'Engineering',
                    children: engineeringKnowledge.map(index => {
                        return {id:index._id, labelName:index.name, level:index.level, progress:index.status.progress  };
                    })
                },
                {
                    id: 'h2Electronics',
                    labelName: 'Electronics',
                    children: electronicsKnowledge.map(index => {
                        return {id:index._id, labelName:index.name, level:index.level, progress:index.status.progress  };
                    })
                },
                {
                    id: 'h2Genetics',
                    labelName: 'Genetics',
                    children: geneticsKnowledge.map(index => {
                        return {id:index._id, labelName:index.name, level:index.level, progress:index.status.progress  };
                    })
                }
              ]
            },
            {
                id: 'h2AppliedTechnology',
                labelName: 'Applied Technology',
                children: [
                  {
                      id: 'h2FoodAndAgricultre',
                      labelName: 'Food & Agriculture',
                      children: [
                          //{
                          //    id: 'Food1', //names._id,
                          //    labelName: 'blah2',
                          //    status: 'ENABLED',
                          //    count: 460
                          //}
                      ]
                  }
                ]
              },
              {
                id: 'h2Analysis',
                labelName: 'Analysis',
                children: [
                  //{
                  //    id: 'h2FoodAndAgricultre',
                  //    labelName: 'Food & Agriculture',
                  //    children: [
                          //{
                          //    id: 'Food1', //names._id,
                          //    labelName: 'blah2',
                          //    status: 'ENABLED',
                          //    count: 460
                          //}
                  //    ]
                  //}
                ]
              }
          ];
          
          return (tableData)
        
    }
    
    render() { 
        const myTableData = this.formatTableData(this.props.allKnowledge);
        console.log('MYTABLEDATA:', myTableData);
        const { allKnowledge } = this.props;        // Scientific Knowledge Names
        console.log('ALLKNOWLEDGE:', allKnowledge);
        const names = [...new Set(allKnowledge.map(index => index.name))];      // Uniquify the names so that no knowledge is repeated, place into names array
        console.log('NAMES: ', names);
        const completedKnowledge = allKnowledge.filter(knowledge => knowledge.status.completed);
        console.log('completedKnowledge: ', completedKnowledge);
        const inProgressKnowledge = allKnowledge.filter(knowledge => (!knowledge.status.completed && knowledge.status.available));
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
                    isTree
                    defaultExpandAllRows={false}
                    rowKey="id"
                    height={800}
                    data={myTableData}
                    onExpandChange={(isOpen, rowData) => {
                        //console.log(isOpen, rowData);
                    }}
                    renderTreeToggle={(icon, rowData) => {
                        if (rowData.children && rowData.children.length === 0) {
                        return <Icon icon="spinner" spin />;
                        }
                        return icon;
                    }}
                    >
                    <Column flexGrow={5}>
                        <HeaderCell>Knowledge Type</HeaderCell>
                        <Cell dataKey="labelName" />
                    </Column>
                
                    <Column width={100}>
                        <HeaderCell>Level</HeaderCell>
                        <Cell dataKey="level" />
                    </Column>

                    <Column width={200}>
                        <HeaderCell>Progress</HeaderCell>
                        <Cell dataKey="progress" />
                    </Column>
                </Table>
            </div>
        );
    }
}

export default Labs;






//class TreeTable extends React.Component {
//    constructor(props) {
//      super(props);
//      this.state = {
//        data: fakeTreeData
//      };
//    }
//    render() {
//      const { data } = this.state;
//      return (




//      );
//    }
//  }
  
//ReactDOM.render(<TreeTable />);