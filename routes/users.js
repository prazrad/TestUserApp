/*
Documentation:
==============
This program is to create a set of REST services that can be used to manage user operations.

Auther : Prashanth Radhakrishnan
Organisation : aarini
email : mailme.prasaanth@gmail.com
*/

var express = require('express');
var router = express.Router();

const mysql = require('mysql')
const bcrypt = require('bcrypt');

//MySQL configurations
const mysqlConfig = require('../config/mysqlDB.js');
const conn = mysql.createConnection(mysqlConfig.databaseOptions);

//#1 : User registration - POST
router.post('/register', function(req, res) {
  try {
    const { user_name, given_name, sur_name, dob, user_pwd } = req.body;
    //Data validation
    if (user_name && typeof user_name !== 'string') {
      res.json({"status":"failed", "error":'user_name must be a string.'});
    }
    else if (given_name && typeof given_name !== 'string') {
      res.json({"status":"failed", "error":'given_name must be a string.'});
    }
    else if (sur_name && typeof sur_name !== 'string') {
      res.json({"status":"failed", "error":'sur_name must be a string.'});
    }
    else if (!user_pwd) {
      res.json({"status":"failed", "error":'user_pwd is required for registration'});
    }
    else if (user_name) {
      //Build user_info insert query
      /*
        UUID() - Ge unnerates unique 16bit userid each time
      */
      sqlQuery = "insert into aarini.user_info(id, user_name, given_name, sur_name, dob) values(UUID(), ?, ?, ?, ?)";
      sqlData = [user_name, given_name, sur_name, dob];

      conn.query(sqlQuery, sqlData, (err, data) => {
         if (err) {
          res.json({"status":"failed", "error":err.sqlMessage});
         }
         else {
           //Build user_auth insert query
           /*
              bcrypt.hashSync(user_pwd, 10) - auto-gen a salt and hash
           */
           sqlQuery = "insert into aarini.user_auth(user_name, user_pwd) values(?, ?)";
           sqlData = [user_name, bcrypt.hashSync(user_pwd, 10)];

           conn.query(sqlQuery, sqlData, (err, result) => {
              if (err) {
               res.json({"status":"failed", "error":err.sqlMessage});
              }
              else {
               res.json({"status":"success", "result":"User registration success"});
              }
           });
         }
      });
    }
    else {
      throw new Error('user_name is a required field.');
    }
  }
  catch (err) {
    throw new Error('Error in user registration',err);
  }
});


//#2 : User login - POST
router.post('/login', function(req, res) {
  try {
    const { user_name, user_pwd } = req.body;
    //Data validation
    if (user_name && typeof user_name !== 'string') {
      res.json({"status":"failed", "error":'user_name must be a string.'});
    }
    else if (!user_pwd) {
      res.json({"status":"failed", "error":'user_pwd is required for registration'});
    }
    else if (user_name) {
      //Build user_info insert query
      /*
        Inner Join select query to fetch data querying from two tables - "user_info" & "user_auth"
      */
      sqlQuery = "SELECT ui.id, ua.user_name, ui.given_name, ui.sur_name, DATE(ui.dob), ua.user_pwd FROM aarini.user_info ui INNER JOIN aarini.user_auth ua ON ua.user_name = ui.user_name WHERE ua.user_name=?";
      sqlData = [user_name];

      conn.query(sqlQuery, sqlData, (err, data) => {
         if (err) {
          res.json({"status":"failed", "error":err.sqlMessage});
         }
         else if(data.length==0) {
           res.json({"status":"failed", "error":"Invalid Username/Password"});
         }
         else {

           //bcrypt - Check if the password is matching with the hased password in the database
           if(bcrypt.compareSync(user_pwd, data[0].user_pwd.toString('utf8')))
           {
             //Build user_auth update loggedin query
             sqlQuery = "UPDATE aarini.user_auth SET loggedin=?";
             sqlData = [true];

             conn.query(sqlQuery, sqlData, (err, result) => {
                if (err) {
                 res.json({"status":"failed", "error":err.sqlMessage});
                }
                else {
                 res.json({"status":"success", "result":"User login success", "data":{ "id":data[0].id, "user_name" : data[0].user_name, "given_name" : data[0].given_name, "sur_name" : data[0].sur_name, "dob" : data[0].dob } });
                }
             });
           }
           else
           {
             res.json({"msg" : "failed", "error" : "Password does not match"});
           }
         }
      });
    }
    else {
      throw new Error('user_name is a required field.');
    }
  }
  catch (err) {
    throw new Error('Error in user registration',err);
  }
});


//#3 : User details - GET
router.get('/:user_name', function(req, res) {
  try {
    const { user_name } = req.params;
    //Data validation
    if (user_name && typeof user_name !== 'string') {
      res.json({"status":"failed", "error":'user_name must be a string.'});
    }
    else if (user_name) {
      //Build user_info insert query
      sqlQuery = "SELECT id, user_name, given_name, sur_name, DATE_FORMAT(dob,'%d-%m-%Y') as dob FROM aarini.user_info WHERE user_name=?";
      sqlData = [user_name];

      conn.query(sqlQuery, sqlData, (err, data) => {
         if (err) {
          res.json({"status":"failed", "error":err.sqlMessage});
         }
         else if(data.length==0) {
           res.json({"status":"failed", "error":"Invalid user_name"});
         }
         else {
           res.json({"status":"success", "result":"User details success", "data":{ "id":data[0].id, "user_name" : data[0].user_name, "given_name" : data[0].given_name, "sur_name" : data[0].sur_name, "dob" : data[0].dob } });
         }
      });
    }
    else {
      throw new Error('user_name is a required field.');
    }
  }
  catch (err) {
    throw new Error('Error in user registration',err);
  }
});

module.exports = router;
