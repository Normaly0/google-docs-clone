import React from 'react';
import { useNavigate } from 'react-router-dom';
import {v4 as uuidV4} from 'uuid';

function Navbar() {

    const navigate = useNavigate();
    
    function navigateHome() {
        navigate("/home")
    }

    function newDoc() {
        navigate("/documents/" + uuidV4())
    }

    return (
        <nav className = "nav-bar">
            <div className = "nav-bar-logo">
                <i className="fa-solid fa-file-lines"></i>
            </div>
            <h1 className = "nav-bar-title">Docs</h1>
            <div className = "nav-bar-buttons">
                <button onClick = {navigateHome}>Home</button>
                <button onClick = {newDoc}>New Document</button>
            </div>
        </nav>
    )
}

export default Navbar;