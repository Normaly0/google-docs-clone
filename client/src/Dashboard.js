import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {v4 as uuidV4} from 'uuid';

import Navbar from './Navbar';

function Dashboard() {

    const [socket, setSocket] = useState();
    const [data, setData] = useState([]);

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
                                </a>
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