var express = require("express");
var RequisitionsApproval = express();
var mysql = require("mysql");
var config = require(".././SystemAdmin/DB");
var con = mysql.createPool(config);
const Joi = require("@hapi/joi");

var auth = require(".././SystemAdmin/auth");
RequisitionsApproval.get("/:CompanyID", auth.validateRole("Requisition Approval"), function(
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
      let sp = "call SPgetPendingRequisitions(?,?)";
      connection.query(sp, [ res.locals.user,  req.params.CompanyID], function(
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
RequisitionsApproval.get("/:CompanyID/:ID", auth.validateRole("Requisition Approval"), function(
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
      let sp = "call SPGetrequisitionsApproval(?,?)";
      connection.query(sp, [ req.params.ID,  req.params.CompanyID], function(
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

RequisitionsApproval.post("/", auth.validateRole("Requisition Approval"), function(req, res) {
  const schema = Joi.object({
    ComapnyID: Joi.number().integer(),
    BranchID: Joi.number().integer(),
    RequisitionID: Joi.number()
      .required(),
      ID: Joi.number().integer(),
      Quantity: Joi.number(),
      Desc: Joi.string() .required(),
  });
  
  try {
    const { error, value } = schema.validate(req.body);
  
    if (!error) {  
        let data = [
          req.body.RequisitionID,  
          req.body.ID,     
          req.body.Desc,  
          req.body.Quantity,
            req.body.BranchID  ,
            req.body.ComapnyID,
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
            let sp = "call SPAdjustRequestedItem(?,?,?,?,?,?,?)";
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
RequisitionsApproval.post("/:ID", auth.validateRole("Requisition Approval"), function(req, res) {

    
    try { 
      let data = [
        req.body.RequisitionID,  
        req.body.ID,  
          req.body.BranchID  ,
          req.body.ComapnyID,
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
              let sp = "call SPApproveRequestedItem(?,?,?,?,?)";
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
      
     
    } catch (err) {
      //console.log(err);
      res.json({
        success: false,
        message: err
      });
    }
  });
  RequisitionsApproval.post("/:ID/:Complete", auth.validateRole("Requisition Approval"), function(req, res) {

    
    try { 
      let data = [
        req.body.BranchID,
        req.body.ComapnyID,
        req.body.RequisitionID,  
        res.locals.user ,
        req.body.SupplierID
      ];        

          con.getConnection(function(err, connection) {
            if (err) {
              res.json({
                success: false,
                message: err.message
              });
            } // not connected!
            else {
              let sp = "call SPCompleteRequistionApproval(?,?,?,?,?)";
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
      
     
    } catch (err) {
      //console.log(err);
      res.json({
        success: false,
        message: err
      });
    }
  });
module.exports = RequisitionsApproval;
