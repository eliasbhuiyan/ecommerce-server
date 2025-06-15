require("dotenv").config();
const express = require("express");
const dbConfig = require("./dbConfig/db");
const router = require("./router");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors())

dbConfig();

app.use(router);

app.listen(8000, () => console.log("Server is running"));