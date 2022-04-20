import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import Quill from 'quill';
import "quill/dist/quill.snow.css";
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';

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
    const { id: documentId } = useParams();

    const navigate = useNavigate();

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
        
        socket.once("load-document", document => {
            quill.setContents(document);
            quill.enable();;
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
                
                socket.emit("save-document", quill.getContents(), base64image);
            });
            
        }, 2000)
        
        return (() => {
            clearInterval(interval);
        })
    }, [socket, quill])

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

    function redirectHome() {
        navigate("/home")
    }

    return (
        <>
            <nav className = "nav-bar">
                <button onClick = {redirectHome}>Home</button>
            </nav>
            <div className="container" ref={wrapperRef}>
            </div>
        </>
    )
}

export default TextEditor;