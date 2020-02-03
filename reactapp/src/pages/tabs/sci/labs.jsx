import React, { Component } from 'react';
import { Progress } from 'rsuite';

class Labs extends Component {
    state = { 
        lab : ['lab1', 'lab2', 'lab3']
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
            <React.Fragment>
                <h5>Active focus: Computer Science I</h5>
                <Progress.Line percent={25} status='active' />
                <table className="table">
                    <thead>
                        <tr>
                            <th>Knowledge</th>
                            <th>Level</th>
                            <th>Progress</th>
                            <th>Desc</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allKnowledge.map(index => (
                            <tr>
                                <td>{index.field}</td>
                                <td>{index.level}</td>
                                <td>{index.status.progress}</td>
                                <td>{index.desc}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </React.Fragment>
        );
    }
}

export default Labs;