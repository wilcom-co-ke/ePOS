var express = require("express");
var GroupAccess = express();
var mysql = require("mysql");
var config = require("./DB");
var con = mysql.createPool(config);
var auth = require("./auth");

GroupAccess.get(
  "/:ID/:CompanyID",
  auth.validateRole("Assign User Access"),
  function(req, res) {
    const ID = req.params.ID;
    const CompanyID = req.params.CompanyID;
    con.getConnection(function(err, connection) {
      if (err) {
        res.json({
          success: false,
          message: err.message
        });
      } // not connected!
      else {
        let sp = "call SPGetGroupRoles(?,?)";
        connection.query(sp, [ID, CompanyID], function(error, results, fields) {
          if (error) {
            res.json({
              success: false,
              message: error.message
            });
          } else {
            res.json(results[0]);
          }
          connection.release();
        });
      }
    });
  }
);

GroupAccess.put("/", auth.validateRole("Assign User Access"), function(
  req,
  res
) {
  let data = [
    req.body.UserGroup,
    req.body.Role,
    req.body.Status,
    req.body.Name,
    res.locals.user,
    req.body.CompanyID,
    req.body.BranchID
  ];

  con.getConnection(function(err, connection) {
    if (err) {
      res.json({
        success: false,
        message: err.message
      });
    } // not connected!
    else {
      let sp = "call SPUpdateGroupRoles(?,?,?,?,?,?,?)";
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
});
GroupAccess.put("/:ID/:User", auth.validateRole("Assign User Access"), function(
  req,
  res
) {
  const ID = req.params.ID;
  const User = req.params.User;

  con.getConnection(function(err, connection) {
    if (err) {
      res.json({
        success: false,
        message: err.message
      });
    } // not connected!
    else {
      if (ID === "Remove") {
        let sp = "call RemoveAllUserroles(?)";
        connection.query(sp, User, function(error, results, fields) {
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
      } else {
        let sp = "call GiveUserAllRoles(?)";
        connection.query(sp, User, function(error, results, fields) {
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
    }
  });
});
module.exports = GroupAccess;
