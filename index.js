'use strict'

const mongoose = require('mongoose');
const app = require('./app');
const port = process.env.PORT || 3977;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/mean2', {useNewUrlParser: true}, (err) => {
	if(err){
		console.log('Could not connect to database: ', err);
	}else{
		console.log('Connected to Mongoose database')

		app.listen(port, function(){
			console.log("Servidor del api rest de musica escuchando en http://localhost:"+port);
		});
	}
});

 