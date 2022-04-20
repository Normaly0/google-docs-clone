const mongoose = require("mongoose");
const Document = require("./document");

mongoose.connect('mongodb://localhost/google-docs-clone');

const io = require("socket.io")(3001, {
    cors: {
        origin: ["http://foxstation:3000", "http://localhost:3000"],
        methods: ["GET", "POST"],
    }
})

const defaultValue = '';

io.on("connection", socket => {

    socket.on("get-document", async documentId => {
        const document = await findOrCreateDocument(documentId);
        
        socket.join(documentId);
        socket.emit("load-document", document.data);
        
        socket.on("send-changes", delta => {
            socket.broadcast.to(documentId).emit("receive-changes", delta);
        })

        socket.on("save-document", async (data, img) => {
            await Document.findByIdAndUpdate(documentId, { data });
            await Document.findByIdAndUpdate(documentId, { img });
        })

    })
    
    socket.on("get-dashboard-data", async () => {
        const data = await Document.find({}).select('_id img');
        socket.emit("load-all", data)
    })

})

async function findOrCreateDocument(id) {
    if(id == null) return;

    const document = await Document.findById(id);
    if (document) return document;
    return await Document.create({ _id: id, data: defaultValue});

}