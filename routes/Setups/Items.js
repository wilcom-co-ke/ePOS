var express = require("express");
var Items = express();
var mysql = require("mysql");
var config = require(".././SystemAdmin/DB");
var con = mysql.createPool(config);
const Joi = require("@hapi/joi");

var auth = require(".././SystemAdmin/auth");
Items.get("/:CompanyID", auth.validateRole("Items"), function(
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
      let sp = "call SPGetItems(?)";
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
Items.get("/:ID/:CompanyID", auth.validateRole("Items"), function(
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
      let sp = "call SPGetOneItem(?,?)";
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

Items.post("/", auth.validateRole("Items"), function(req, res) {
  const schema = Joi.object({
    ComapnyID: Joi.number().integer(),
    BranchID: Joi.number().integer(),   
    ItemName: Joi.string()
      .required(),
      ItemCategory: Joi.number()
      .required(),
      Description: Joi.string() .required(),
      Cost: Joi.number()
      .required(),
      Price: Joi.number()
      .required(),
      Taxrate: Joi.number()
      .required(),      
      Logo: Joi.string()
      .allow(null)
      .allow(""),
      Istaxable:Joi.boolean(),
      Active:Joi.boolean(),
  });
  
  try {
    const { error, value } = schema.validate(req.body);

    if (!error) {  

        let data = [
            req.body.BranchID  ,
            req.body.ComapnyID,             
            req.body.ItemCategory,             
            req.body.ItemName,             
            req.body.Description,             
            req.body.Cost,   
            req.body.Price,     
            req.body.Istaxable,  
            req.body.Taxrate,   
            req.body.Active,            
            req.body.Logo, 
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
            let sp = "call SPSaveItem(?,?,?,?,?,?,?,?,?,?,?,?)";
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
Items.put("/:ID", auth.validateRole("Items"), function(req, res) {
    const schema = Joi.object({
      ComapnyID: Joi.number().integer(),
    BranchID: Joi.number().integer(),   
    ItemName: Joi.string()
      .required(),
      ItemCategory: Joi.number()
      .required(),
      Description: Joi.string() .required(),
      Cost: Joi.number()
      .required(),
      Price: Joi.number()
      .required(),
      Taxrate: Joi.number()
      .required(),      
      Logo: Joi.string()
      .allow(null)
      .allow(""),
      Istaxable:Joi.boolean(),
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
            req.body.ItemCategory,             
            req.body.ItemName,             
            req.body.Description,             
            req.body.Cost,   
            req.body.Price,     
            req.body.Istaxable,  
            req.body.Taxrate,   
            req.body.Active,            
            req.body.Logo, 
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
          let sp = "call SPUpdateItem(?,?,?,?,?,?,?,?,?,?,?,?,?)";
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
Items.delete(
  "/:ID/:ComapnyID/:BranchID",
  auth.validateRole("Items"),
  function(req, res) {
    const ID = req.params.ID;
    let data = [ID, req.params.BranchID, req.params.ComapnyID, res.locals.user];
    con.getConnection(function(err, connection) {
      if (err) {
        res.json({
          success: false,
          message: err.message
        });
      } // not connected!
      else {
        let sp = "call SPDeleteItem(?,?,?,?)";
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
module.exports = Items;
