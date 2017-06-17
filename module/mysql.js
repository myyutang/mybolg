/**
 * Created by sc on 2017/3/14.
 */
const mysql = require('mysql');
module.exports = function (sql,zhi,callback){
    var config = mysql.createConnection({
        host:"localhost",
        user:"root",
        password:"root",
        port:"3306",
        database:"test"
    });
    config.connect();
/*   config.query(sql,zhi,(err,data) => {
        callback&&callback(err,data);
});*/
    config.query(sql,zhi,function (err,data) {
        callback&&callback(err,data);
    })
    config.end();
};