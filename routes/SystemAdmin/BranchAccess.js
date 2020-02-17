var express = require("express");
var BranchAccess = express();
var mysql = require("mysql");
var config = require("./DB");
var con = mysql.createPool(config);

const Joi = require("@hapi/joi");

var auth = require("./auth");
BranchAccess.get("/:CompanyID", auth.validateRole("Branch Access"), function(
  req,
  res
) {
  const CompanyID = req.params.CompanyID;
  con.getConnection(function(err, connection) {
    if (err) {
      res.json({
        success: false,
        message: err.message
      });
    } // not connected!
    else {
      let sp = "call SPGetBranchAccess(?)";
      connection.query(sp, [CompanyID], function(error, results, fields) {
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
BranchAccess.get("/:CompanyID/:UserName", function(req, res) {
  const CompanyID = req.params.CompanyID;
  const UserName = req.params.UserName;
  con.getConnection(function(err, connection) {
    if (err) {
      res.json({
        success: false,
        message: err.message
      });
    } // not connected!
    else {
      let sp = "call SPGetUserBranchAccess(?,?)";
      connection.query(sp, [CompanyID, UserName], function(
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
BranchAccess.post("/", auth.validateRole("Branch Access"), function(req, res) {
  const schema = Joi.object({
    CompanyID: Joi.number().integer(),
    BranchID: Joi.number().integer(),
    UserName: Joi.string().required()
  });
  //   const result = Joi.validate(, schema);
  //   if (!result.error) {
  try {
    const { error, value } = schema.validate(req.body);

    if (!error) {
      //console.log(res.locals);
      let data = [
        req.body.CompanyID,
        req.body.BranchID,
        req.body.UserName,
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
          let sp = "call SPSaveBranchAccess(?,?,?,?)";
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

BranchAccess.delete(
  "/:ID/:CompanyID/:UserName",
  auth.validateRole("Branch Access"),
  function(req, res) {
    const BranchID = req.params.ID;
    const CompanyID = req.params.CompanyID;
    const UserName = req.params.UserName;
    let data = [CompanyID, BranchID, UserName, res.locals.user];
    con.getConnection(function(err, connection) {
      if (err) {
        res.json({
          success: false,
          message: err.message
        });
      } // not connected!
      else {
        let sp = "call SpDeleteBranchAccess(?,?,?,?)";
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
module.exports = BranchAccess;
