var express = require("express");
var UpdateProfile = express();
var mysql = require("mysql");
var config = require("./DB");
var con = mysql.createPool(config);
const Joi = require("@hapi/joi");

UpdateProfile.post("/",  function(req, res) {
   
  const schema = Joi.object({    
    Name: Joi.string()
    .required(),
  Phone: Joi.string()
    .required(),
  Username: Joi.string()
    .required(),
  Photo: Joi.string(),
  Email: Joi.string().required(),
  CompanyID: Joi.number().integer(),
 BranchID: Joi.number().integer()
  });
  
  try {
    const { error, value } = schema.validate(req.body);

    if (!error) {
        let data = [
            req.body.BranchID,
            req.body.CompanyID,
            req.body.Name,
            req.body.Email,
            req.body.Phone,
            req.body.Photo,
            req.body.Username
          ];
        con.getConnection(function(err, connection) {
          if (err) {
            res.json({
              success: false,
              message: err.message
            });
          } // not connected!
          else {
            let sp = "call SPUpdateProfile(?,?,?,?,?,?,?)";
            connection.query(sp, data, function(error, results, fields) {
              if (error) {
                res.json({
                  success: false,
                  message: error.message
                });
              } else {
                res.json({
                  success: true,
                  message: "saved"
                });
              }
              connection.release();
              // Don't use the connection here, it has been returned to the pool.
            });
          }
        });
    
    } else {
      res.json({
        success: false,
        message: error.details[0].message
      });
    }
  } catch (err) {
    //console.log(err);
    res.json({
      success: false,
      message: err
    });
  }
});

module.exports = UpdateProfile;
