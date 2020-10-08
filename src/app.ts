import express from "express";
import Job from "./cron";

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Hello from Node.js server!");
});

app.listen(PORT, () => {
    console.log(`server is listening on ${PORT}`);
    Job.start();
});
