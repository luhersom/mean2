var mysql = require('mysql');
var connmysql = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'mean2'
});

connmysql.connect(function(err) {
    if (err) throw err;
    console.log("MySQL Database Connected!");
});

module.exports = connmysql; 
