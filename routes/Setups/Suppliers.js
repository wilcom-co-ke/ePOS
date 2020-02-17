var express = require("express");
var Suppliers = express();
var mysql = require("mysql");
var config = require(".././SystemAdmin/DB");
var con = mysql.createPool(config);
const Joi = require("@hapi/joi");

var auth = require(".././SystemAdmin/auth");
Suppliers.get("/:CompanyID", auth.validateRole("Suppliers"), function(
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
      let sp = "call SPGetSuppliers(?)";
      connection.query(sp, [req.params.CompanyID], function(
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
Suppliers.get("/:ID/:CompanyID", auth.validateRole("Suppliers"), function(
  req,
  res
) {
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
      let sp = "call SPGetOneSupplier(?,?)";
      connection.query(sp, [ID,CompanyID], function(error, results, fields) {
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

Suppliers.post("/", auth.validateRole("Suppliers"), function(req, res) {
  const schema = Joi.object({
    ComapnyID: Joi.number().integer(),
    BranchID: Joi.number().integer(),   
    Name: Joi.string()
      .required(),
      MobileNo: Joi.string()
      .required(),
      Email: Joi.string().email({ minDomainSegments: 2 }),
      Telephone: Joi.string()
      .required(),
      Logo: Joi.string()
      .allow(null)
      .allow(""),
      Address: Joi.string()
      .required(),
      PhysicalLocation: Joi.string()
      .required(),
      Active:Joi.boolean(),
  });

  try {
    const { error, value } = schema.validate(req.body);

    if (!error) {  

        let data = [
            req.body.BranchID  ,
            req.body.ComapnyID,             
            req.body.Name,             
            req.body.MobileNo,             
            req.body.Email,             
            req.body.Telephone,             
            req.body.Logo,             
            req.body.Address,             
            req.body.PhysicalLocation,
            req.body.Active,            
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
            let sp = "call SPSaveSupplier(?,?,?,?,?,?,?,?,?,?,?)";
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
Suppliers.put("/:ID", auth.validateRole("Suppliers"), function(req, res) {
    const schema = Joi.object({
        ComapnyID: Joi.number().integer(),
        BranchID: Joi.number().integer(),   
        Name: Joi.string()
          .required(),
          MobileNo: Joi.string()
          .required(),
          Email: Joi.string().email({ minDomainSegments: 2 }),
          Telephone: Joi.string()
          .required(),
          Logo: Joi.string()
          .allow(null)
          .allow(""),
          Address: Joi.string()
          .required(),
          PhysicalLocation: Joi.string()
          .required(),
          Active:Joi.boolean(),
      });
  try {
    const { error, value } = schema.validate(req.body);

    if (!error) {
      const ID = req.params.ID;
      let data = [
          ID,
        req.body.BranchID  ,
        req.body.ComapnyID,             
        req.body.Name,             
        req.body.MobileNo,             
        req.body.Email,             
        req.body.Telephone,             
        req.body.Logo,             
        req.body.Address,             
        req.body.PhysicalLocation,
        req.body.Active,            
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
          let sp = "call SPUpdateSupplier(?,?,?,?,?,?,?,?,?,?,?,?)";
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
Suppliers.delete(
  "/:ID/:ComapnyID/:BranchID",
  auth.validateRole("Suppliers"),
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
        let sp = "call SPDeleteSupplier(?,?,?,?)";
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
module.exports = Suppliers;
