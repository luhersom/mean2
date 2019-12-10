'user strict'
var dbmysql = require('../routes/dbmysql');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');


function saveUser(req, res){
	var user = new User();

	var params =  req.body;

	console.log(params);

	user.name = params.name;
	user.surname = params.surname;
	user.email = params.email;
	user.role = 'ROLE_ADMIN';
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

function loginUser(req, res){
	var params = req.body;

	var email = params.email;
	var password = params.password;

	User.findOne({email: email.toLowerCase()}, (err, user) =>{
		if (err){
			res.status(500).send({message: 'Error en la peticion'});
		}else{
			if(!user){
				res.status(404).send({message: 'El usuario no existe'});
			}else{
				//comprobar la contraseña
				bcrypt.compare(password, user.password, function(err, check){
					if(check){
						//devolver datos de usuario logueado
						if(params.gethash){
							//devolver un token de jwt
						}else{
							res.status(200).send({user});
						}
					}else{
						res.status(404).send({message: 'El usuario no ha podido loguearse'});
					}
				});
			}
			
		}
	});
}

function loginUserMySql(req, res){
	var params = req.body;

	var email = params.email;
	var password = params.password;

	var contra ='';

	console.log(params)

	// Inicio - Insert en Base de Datos MySQL
	var sql = "select email from users where email = ?";
		dbmysql.query(sql, [email], function (err, user) {
			if (err){	
				res.status(500).send({message: 'Error en la peticion'});
			}else{
				Object.keys(user).forEach(function(key) {
					var row = user[key];
					contra = row.email
				});	
				if(contra !== email){					
					res.status(404).send({message: 'El usuario no existe'});
				}else{
				//comprobar la contraseña
					var sql = "select * from users where email = ?";
					dbmysql.query(sql, [email], function (err, result, fields) {
						if (err) throw err;
						Object.keys(result).forEach(function(key) {
							var row = result[key];
							bcrypt.compare(password, row.password, function(err, check){
								if(check){
										//devolver datos de usuario logueado
										if(params.gethash){
											//devolver un token de jwt
										}else{
											res.status(200).send({user});
										}
								}else{
									res.status(404).send({message: 'El usuario no ha podido loguearse'});
								}
							});
						});		
				    });
				}	
			}	
		});
}

module.exports =  {
	saveUser,
	loginUser,
	loginUserMySql
}; 

