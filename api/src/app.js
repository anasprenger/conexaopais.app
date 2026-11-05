const cors = require('cors');
const express = require('express');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const routes = require('./routes');

const app = express();

app.use(cors()); // libera o acesso do app (inclusive pelo navegador, no Expo Web)
app.use(express.json({ limit: '1mb' }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
