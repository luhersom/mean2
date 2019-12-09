'use strict'

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// cargar rutas
var user_routes = require('./routes/user');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// configurar cabeceras http

// rutas base
app.use('/api', user_routes);

module.exports = app;