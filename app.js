const cors = require("cors");
const express = require('express');
require("dotenv").config();
const AuthController = require('./main');

const app = express();
app.use(cors());

app.use('/api/auth', AuthController);

const port = process.env.PORT || 5500;
app.listen(port, () => {
  console.log(`Listning on ${port}`);
});