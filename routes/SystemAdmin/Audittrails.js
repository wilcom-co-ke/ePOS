var express = require("express");
var Audittrails = express();
var mysql = require("mysql");
var config = require("./DB");
var con = mysql.createPool(config);
var auth = require("./auth");

Audittrails.get("/:ID", auth.validateRole("Audit Trails"), function(req, res) {
  const ID = req.params.ID;
  con.getConnection(function(err, connection) {
    if (err) {
      res.json({
        success: false,
        message: err.message
      });
    } // not connected!
    else {
      let sp = "call SPgetAuditTrails(?,?)";
      connection.query(sp, [res.locals.user, ID], function(
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
      });
    }
  });
});

module.exports = Audittrails;
