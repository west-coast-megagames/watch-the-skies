import React from 'react';
import { Link } from 'react-router-dom';

const SideBar = () => {
    return (
    <div className="sidebar">
    <nav className="sidebar-nav">
        <ul className="nav">
            <li className="nav-title">Nav Title</li>
            <li className="nav-item">
            <Link className="nav-link" href="#">
            <i className="nav-icon cui-speedometer"></i> Nav item
            </Link>
        </li>
        <li className="nav-item">
            <Link className="nav-link" href="#">
            <i className="nav-icon cui-speedometer"></i> With badge
            <span className="badge badge-primary">NEW</span>
            </Link>
        </li>
        <li className="nav-item nav-dropdown">
            <Link className="nav-link nav-dropdown-toggle" href="#">
            <i className="nav-icon cui-puzzle"></i> Nav dropdown
            </Link>
            <ul className="nav-dropdown-items">
            <li className="nav-item">
                <Link className="nav-link" href="#">
                <i className="nav-icon cui-puzzle"></i> Nav dropdown item
                </Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link" href="#">
                <i className="nav-icon cui-puzzle"></i> Nav dropdown item
                </Link>
            </li>
            </ul>
        </li>
        <li className="nav-item mt-auto">
            <Link className="nav-link nav-link-success" href="https://coreui.io">
            <i className="nav-icon cui-cloud-download"></i> Download CoreUI</Link>
        </li>
        <li className="nav-item">
            <Link className="nav-link nav-link-danger" href="https://coreui.io/pro/">
            <i className="nav-icon cui-layers"></i> Try CoreUI
            <strong>PRO</strong>
            </Link>
        </li>
        </ul>
    </nav>
    <button className="sidebar-minimizer brand-minimizer" type="button"></button>
    </div>
    );
}
 
export default SideBar;