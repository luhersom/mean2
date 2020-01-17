'user strict'
var fs = require('fs');
var path = require('path');
var dbmysql = require('../routes/dbmysql');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');

function pruebas(res, res){
	res.status(200).send({
		message: 'Probando una accion del conmtrolados de usuarios del api rest con Node y MongoDB'
	});
};


function saveUser(req, res){
	var user = new User();
	var params =  req.body;

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
											//console.log("err");
										}else{
											//console.log("good");	
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
							res.status(200).send({
								token: jwt.createToken(user)
							});
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

	

	// Inicio - Insert en Base de Datos MySQL
	var sql = "select * from users where email = ?";
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

function updateUser(req, res){
	var userId = req.params.id;
	var update = req.body;

	User.findByIdAndUpdate(userId, update, (err, userUpdated) => {
		if(err){
			res.status(500).send({message: 'Error al actulizar el usuario'});
		}else{
			if(!userUpdated){
				res.status(404).send({message: 'No se ha podido actualizar el usuario '});
			}else{
				res.status(200).send({user: userUpdated});
			}
		}
	});
}

function uploadImage(req, res){
	var userId = req.params.id;
	var file_name = 'no Subido...';

	if(req.files){
		var file_path = req.files.image.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[2]; 
		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];
		
		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif'){
			User.findByIdAndUpdate(userId, {image: file_name}, (err, userUpdated) => {
				if(!userUpdated){
					res.status(404).send({message: 'No se ha podido actualizar el usuario '});
				}else{
					res.status(200).send({user: userUpdated});
				}
			});
		}else{
			res.status(200).send({message: 'Extension de la imagen no valida'});
		}
	}else{
		res.status(200).send({message: 'No ha subido ninguna imagen...'});
	}
}

function getImageFile(req, res){
	var imageFile = req.params.imageFile;
	var path_file = './uploads/users/'+imageFile;

	fs.exists(path_file, function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(200).send({message: 'No existe la imagen...'});
		}
	});
}

module.exports =  {
	pruebas,
	saveUser,
	loginUser,
	loginUserMySql,
	updateUser,
	uploadImage,
	getImageFile
}; 

