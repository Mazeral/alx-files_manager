import express from 'express';

const app = express();
const port = process.env.PORT || 5000;

const routes = require('./routes/index');

app.use(routes);

app.listen(port);
