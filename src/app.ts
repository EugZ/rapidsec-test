import express from "express";

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Hello from Node.js server!");
});

app.listen(PORT, () => {
    return console.log(`server is listening on ${PORT}`);
});