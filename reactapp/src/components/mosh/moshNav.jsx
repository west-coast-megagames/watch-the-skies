import React from 'react';

const NavBar = (props) => {
    return(
        <React.Fragment>
            <nav className="navbar navbar-light bg-light">
        <span className="navbar-brand mb-0 h1">Navbar <span className="badge badge-pill badge-secondary">{props.totalCounters}</span></span>

            </nav>
        </React.Fragment>
    );
}
 
export default NavBar;