var express = require("express");
var Requisitions = express();
var mysql = require("mysql");
var config = require(".././SystemAdmin/DB");
var con = mysql.createPool(config);
const Joi = require("@hapi/joi");

var auth = require(".././SystemAdmin/auth");
Requisitions.get("/:CompanyID", auth.validateRole("Purchase Requisition"), function(
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
      let sp = "call SPGetDraftrequisitions(?,?)";
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


Requisitions.post("/", auth.validateRole("Purchase Requisition"), function(req, res) {
  const schema = Joi.object({
    ComapnyID: Joi.number().integer(),
    BranchID: Joi.number().integer(),
      ItemID: Joi.number()
      .required(),
      Description: Joi.string() .required(),
      Quantity: Joi.number()
      .required(),
      Sphere: Joi.string() .allow(null)
      .allow(""),
      Cylinder: Joi.string() .allow(null)
      .allow(""),
      Axis: Joi.string() .allow(null)
      .allow(""),
      Add: Joi.string() .allow(null)
      .allow("")
  });
  
  try {
    const { error, value } = schema.validate(req.body);

    if (!error) {  
        let data = [
            req.body.BranchID  ,
            req.body.ComapnyID,             
            req.body.ItemID,             
            req.body.Description,             
            req.body.Quantity,
            res.locals.user,  
            req.body.Sphere,
            req.body.Cylinder,
            req.body.Axis,
            req.body.Add

          
        ];
        con.getConnection(function(err, connection) {
          if (err) {
            res.json({
              success: false,
              message: err.message
            });
          } // not connected!
          else {
            let sp = "call SPSaveRequisition(?,?,?,?,?,?,?,?,?,?)";
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
Requisitions.post("/:Branch/:CompanyID", auth.validateRole("Purchase Requisition"), function(req, res) {

    
    try { 
          let data = [
            req.params.Branch  ,
            req.params.CompanyID,
              res.locals.user,    
            
          ];
          con.getConnection(function(err, connection) {
            if (err) {
              res.json({
                success: false,
                message: err.message
              });
            } // not connected!
            else {
              let sp = "call SPSubmiteRequisition(?,?,?)";
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
Requisitions.delete(
  "/:ID/:ComapnyID/:BranchID",
  auth.validateRole("Purchase Requisition"),
  function(req, res) {
    const ID = req.params.ID;
    let data = [ID, res.locals.user,req.params.BranchID, req.params.ComapnyID ];
    con.getConnection(function(err, connection) {
      if (err) {
        res.json({
          success: false,
          message: err.message
        });
      } // not connected!
      else {
        let sp = "call SPDeleterequisition(?,?,?,?)";
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
module.exports = Requisitions;
