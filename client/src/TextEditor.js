import React, { useEffect, useCallback, useState } from 'react';
import html2canvas from 'html2canvas';
import Quill from 'quill';
import "quill/dist/quill.snow.css";
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';

import Navbar from "./Navbar";

const TOOLBAR_OPTIONS = [
    [{header: [1, 2, 3, 4, 5, 6, false]}],
    [{font: [] }],
    [{list: "ordered"}, {list: "bullet"}],
    ["bold", "italic", "underline"],
    [{color: "sub"}, {script: "super"}],
    [{align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"]
]

function TextEditor() {

    const [socket, setSocket] = useState();
    const [quill, setQuill] = useState();
    const [title, setTitle] = useState();
    const { id: documentId } = useParams();

    useEffect(() => {
        const s = io("http://localhost:3001");
        setSocket(s);

        return () => {
            s.disconnect();
        }
    }, []);

    useEffect(() => {
        if (socket == null || quill == null) return
        
        socket.emit("get-document", documentId);
        
        socket.once("load-document", data => {

            quill.setContents(data[0]);
            quill.enable();
            
            if (data[1] !== null) {
                document.querySelector("input").value = data[1];
                setTitle(data[1]);
            } 
        })
    }, [socket, quill, documentId])

    useEffect(() => {
        if (quill == null || socket == null) return

        const handler = (delta, oldDelta, source) => {
            if (source !== "user") return 
            socket.emit("send-changes", delta);
        }

        quill.on("text-change", handler);

        return () => {
            quill.off("text-change", handler);
        }
    }, [socket, quill])

    useEffect(() => {
        if (quill == null || socket == null) return

        const handler = (delta) => {
            quill.updateContents(delta)
        }

        socket.on("receive-changes", handler);

        return () => {
            socket.off("receive-changes", handler);
        }
    }, [socket, quill])

    useEffect(() => {
        if (socket == null || quill == null) return

        const interval = setInterval(() => {
            
            const screenshotTarget = document.getElementsByClassName("ql-container ql-snow")[0];
            
            html2canvas(screenshotTarget).then((canvas) => {
                const base64image = canvas.toDataURL("image/png");
                
                socket.emit("save-document", quill.getContents(), base64image, title);
            });
            
        }, 2000)
        
        return (() => {
            clearInterval(interval);
        })
    }, [socket, quill, title])

    function handleTitle(e) {
        setTitle(e.target.value);
    }

    const wrapperRef = useCallback((wrapper) => {
        if (wrapper == null) return

        wrapper.innerHTML = "";
        const editor = document.createElement("div");
        wrapper.append(editor);
        const q = new Quill(editor, {theme : "snow", modules: {toolbar: TOOLBAR_OPTIONS}});
        q.disable();
        q.setText("Loading...");
        setQuill(q);
    }, []);

    return (
        <>
            <Navbar />
            <div className = "document-title">
                <input type = "text" defaultValue={"Untitled Document"} onInput = {handleTitle} />
            </div>
            <div className="container" ref={wrapperRef}>
            </div>
        </>
    )
}

export default TextEditor;