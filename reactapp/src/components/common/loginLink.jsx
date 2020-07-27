import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'rsuite';

const LoginLink = (props) => {
    return (
        <div className="center-text" style={{paddingTop: '4vh' }}><Button><Link replace to='login'>Click to Login</Link></Button></div>
    );
}
 
export default LoginLink;