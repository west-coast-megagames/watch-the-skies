import React from "react";
import { Progress } from 'rsuite';
import sci1 from '../../sci1.svg'

const Header = (props) => {
    return (
        <span><img src={sci1} alt="Lv.1" style={{width:40, height:40, align: "left"}} />Computer Science I</span>
    );
};

const KnowledgeCard = (props) => {

    return (
        <div className="card border-dark mb-3" style={{width: 240}}>
            <div className="card-body text-dark">
                <h5 className="card-title"><Header /></h5>
                <p className="card-text"><Progress.Line percent={30} status='active' /></p>
            </div>
        </div>
    );
};

export default KnowledgeCard;