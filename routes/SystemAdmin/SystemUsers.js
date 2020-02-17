var express = require("express");
var SystemUsers = express();
var mysql = require("mysql");
var config = require("./DB");
var con = mysql.createPool(config);
const bcrypt = require("bcryptjs");
const Joi = require("@hapi/joi");

var auth = require("./auth");
SystemUsers.get("/:CompanyID", auth.validateRole("System Users"), function(
  req,
  res
) {
  con.getConnection(function(err, connection) {
    if (err) {
      res.json({
        success: false,
        message: err.message
      });
    } // not connected!
    else {
      let sp = "call SPGetUsers(?,?)";
      connection.query(sp, [req.params.CompanyID, res.locals.user], function(
        error,
        results,
        fields
      ) {
        if (error) {
          res.json({
            success: false,
            message: error.message
          });
        } else {
          res.json(results[0]);
        }
        connection.release();
        // Don't use the connection here, it has been returned to the pool.
      });
    }
  });
});
SystemUsers.get("/:ID/:CompanyID", auth.validateRole("System Users"), function(
  req,
  res
) {
  const ID = req.params.ID;
  con.getConnection(function(err, connection) {
    if (err) {
      res.json({
        success: false,
        message: err.message
      });
    } // not connected!
    else {
      let sp = "call SPGetOneUser(?)";
      connection.query(sp, [ID], function(error, results, fields) {
        if (error) {
          res.json({
            success: false,
            message: error.message
          });
        } else {
          res.json(results[0]);
        }
        connection.release();
        // Don't use the connection here, it has been returned to the pool.
      });
    }
  });
});

SystemUsers.post("/", auth.validateRole("System Users"), function(req, res) {
  const schema = Joi.object({
    ComapnyID: Joi.number().integer(),
    BranchID: Joi.number().integer(),
    MobileNo: Joi.string()
      .min(10)
      .required(),
    UserGroup: Joi.number().integer(),
    UserName: Joi.string()
      .min(3)
      .required(),
    Password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
    Email: Joi.string().email({ minDomainSegments: 2 }),
    IDNumber: Joi.string().required(),
    DOB: Joi.date().required(),
    Gender: Joi.string()
      .allow(null)
      .allow(""),
    Photo: Joi.string()
      .allow(null)
      .allow(""),

    Active: Joi.boolean(),
    Names: Joi.string().required()
  });
  //   const result = Joi.validate(, schema);
  //   if (!result.error) {
  try {
    const { error, value } = schema.validate(req.body);

    if (!error) {
      bcrypt.hash(req.body.UserName, 10, function(err, hash) {
        if (err) {
          return res.json({
            success: false,
            message: "failed to bcyrpt the password"
          });
        }

        let data = [
          req.body.BranchID,
          req.body.ComapnyID,
          req.body.UserName,
          req.body.MobileNo,
          req.body.Email,
          req.body.IDNumber,
          req.body.Gender,
          req.body.DOB,
          req.body.UserGroup,
          req.body.Photo,
          req.body.Names,
          res.locals.user,
          hash
        ];
        con.getConnection(function(err, connection) {
          if (err) {
            res.json({
              success: false,
              message: err.message
            });
          } // not connected!
          else {
            let sp = "call SPSaveUser(?,?,?,?,?,?,?,?,?,?,?,?,?)";
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
SystemUsers.put("/:ID", auth.validateRole("System Users"), function(req, res) {
  const schema = Joi.object({
    BranchID: Joi.number().integer(),
    ComapnyID: Joi.number().integer(),
    MobileNo: Joi.string()
      .min(10)
      .required(),
    UserGroup: Joi.number().integer(),
    UserName: Joi.string()
      .min(3)
      .required(),
    Password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
    Email: Joi.string().email({ minDomainSegments: 2 }),
    IDNumber: Joi.string().required(),
    DOB: Joi.date().required(),
    Gender: Joi.string()
      .allow(null)
      .allow(""),
    Photo: Joi.string()
      .allow(null)
      .allow(""),

    Active: Joi.boolean(),
    Names: Joi.string().required()
  });
  try {
    const { error, value } = schema.validate(req.body);

    if (!error) {
      const ID = req.params.ID;
      let data = [
        req.body.BranchID,
        req.body.ComapnyID,
        req.body.UserName,
        req.body.MobileNo,
        req.body.Email,
        req.body.IDNumber,
        req.body.Gender,
        req.body.DOB,
        req.body.UserGroup,
        req.body.Photo,
        req.body.Names,
        req.body.Active,
        res.locals.user
      ];
      con.getConnection(function(err, connection) {
        if (err) {
          res.json({
            success: false,
            message: err.message
          });
        } // not connected!
        else {
          let sp = "call SPUpdateUser(?,?,?,?,?,?,?,?,?,?,?,?,?)";
          connection.query(sp, data, function(error, results, fields) {
            if (error) {
              res.json({
                success: false,
                message: error.message
              });
            } else {
              res.json({
                success: true,
                message: "updated"
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
SystemUsers.delete(
  "/:ID/:ComapnyID/:BranchID",
  auth.validateRole("System Users"),
  function(req, res) {
    const ID = req.params.ID;
    let data = [ID, res.locals.user, req.params.ComapnyID, req.params.BranchID];
    con.getConnection(function(err, connection) {
      if (err) {
        res.json({
          success: false,
          message: err.message
        });
      } // not connected!
      else {
        let sp = "call SPDeleteUser(?,?,?,?)";
        connection.query(sp, data, function(error, results, fields) {
          if (error) {
            res.json({
              success: false,
              message: error.message
            });
          } else {
            res.json({
              success: true,
              message: "deleted Successfully"
            });
          }
          connection.release();
          // Don't use the connection here, it has been returned to the pool.
        });
      }
    });
  }
);
module.exports = SystemUsers;
