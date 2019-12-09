'user strict'
var dbmysql = require('../routes/dbmysql');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');

function pruebas(req, res){
	res.status(200).send({
		message: 'Probando una accion'
	});
}

function saveUser(req, res){
	var user = new User();

	var params =  req.body;

	console.log(params);

	user.name = params.name;
	user.surname = params.surname;
	user.email = params.email;
	user.role = 'ROLE_USER';
	user.image = 'null';

	if (params.password) {
		//encriptar password y guardar
		bcrypt.hash(params.password, null, null, function(err, hash){
			user.password = hash;
			if (user.name != null && user.surname != null && user.email != null){
				//guardar usuario
				user.save((err, userStored) => {
					if(err){
						res.status(500).send({message: 'error al guardar el usuario'});
					}else{
						if(!userStored){
							res.status(404).send({message: 'No se ha registrado el usuario'});
						}else{
							res.status(200).send({user: userStored});

								// Inicio - Insert en Base de Datos MySQL
								var sql = "INSERT INTO users (name, surname, email, role, password, image) VALUES ?";
								var values = [
								 [user.name, user.surname, user.email, user.role, user.password, user.image]
								];
									dbmysql.query(sql, [values], function (err, res) {
										if (!err){
											console.log("err");
										}else{
											console.log("good");	
										}
									});
									dbmysql.destroy();   
									console.log("1 record inserted in MySQL DataBase");
								// Fin - Insert en Base de Datos MySQL
								 
						}
					}
				});
			}else{
				res.status(200).send({message: 'rellena todos los campos'});
			}
		});
	}else{
		res.status(200).send({message: 'Introduce la contraseña'});
	}

}

module.exports =  {
	pruebas,
	saveUser
}; 