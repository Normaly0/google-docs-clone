import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {v4 as uuidV4} from 'uuid';

import Navbar from './Navbar';

function Dashboard() {

    const [socket, setSocket] = useState();
    const [data, setData] = useState([]);
    const [target, setTarget] = useState();

    useEffect(() => {
        const s = io("http://localhost:3001");
        setSocket(s);

        return () => {
            s.disconnect();
        }
    }, []);
    
    useEffect(() => {
        if (socket == null) return

        socket.emit("get-dashboard-data");

        socket.on("load-all", data => {
            setData(data);
        })

    }, [socket]);

    function expandDropdown(e) {
        const target = e.currentTarget.parentNode.querySelector("div");
        target.style.visibility = "visible";
        setTarget(target);
    }

    function hideDropdown() {
        target.style.visibility = "hidden";
    }

    //Hide Dropdown on Click
    useEffect(() => {
        if (target !== undefined) {
            window.addEventListener("mouseup", hideDropdown);
        }
        return () => {
            window.removeEventListener("mouseup", hideDropdown);
        }
    })

    function copyJoinLink(e) {
        navigator.clipboard.writeText(e.currentTarget.parentNode.querySelector("a").href)
    }

    function deleteDocument(e) {
        const id = e.target.parentNode.parentNode.id;
        socket.emit("delete-document", id);

        socket.emit("get-dashboard-data");
    }

    function formatTitle(title) {
        if (title.length > 17) {
            return title.slice(0, 18) + "..."
        } else {
            return title
        }
    }

    return (
        <>
            <Navbar />
            <h1>Dashboard</h1>
            <div className = "dashboard-container">
                {data[0] !== undefined &&
                [...Array(data.length)].map(
                    (value, index) => {
                        return (
                            <div className = "preview" id = {data[index]._id} key = {data[index]._id}>
                                <a href = {"/documents/" + data[index]._id}>
                                    <img src = {data[index].img} alt = "preview" />
                                    <p className = "img-title">{data[index].title === null ? "Untitled Document" : formatTitle(data[index].title)}</p>
                                </a>
                                <button className = "preview-expand" onClick = {expandDropdown}><i className="fa-solid fa-ellipsis-vertical"></i></button>
                                <div className = "preview-dropdown">
                                    <a href = {"/documents/" + data[index]._id} target = "_blank" rel="noreferrer"><i className="fa-solid fa-arrow-up-right-from-square"></i> Open in new Tab</a>
                                    <button onClick = {copyJoinLink}><i className="fa-solid fa-copy"></i> Copy Join Link</button>
                                    <button onClick = {deleteDocument}><i className="fa-solid fa-trash"></i> Delete Document</button>
                                </div>
                            </div>
                        )
                    }
                )
                }
            <a className = "preview new-doc" href = {`/documents/${uuidV4()}`}>
                <i className = "fa-solid fa-plus"></i>
            </a>
            </div>
        </>
    )
}

export default Dashboard;