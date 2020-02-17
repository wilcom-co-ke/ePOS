var express = require("express");
var ItemCategories = express();
var mysql = require("mysql");
var config = require("../SystemAdmin/DB");
var con = mysql.createPool(config);
const Joi = require("@hapi/joi");

var auth = require("../SystemAdmin/auth");
ItemCategories.get("/:CompanyID", auth.validateRole("Item categories"), function(
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
      let sp = "call SPgetitemcategories(?)";
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
ItemCategories.get("/:ID/:CompanyID", auth.validateRole("Item categories"), function(
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
      let sp = "call SPgetOneitemcategory(?,?)";
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

ItemCategories.post("/", auth.validateRole("Item categories"), function(req, res) {
  const schema = Joi.object({
    ComapnyID: Joi.number().integer(),
    BranchID: Joi.number().integer(),
   
      Description: Joi.string()
      .required()
  });
  //   const result = Joi.validate(, schema);
  //   if (!result.error) {
  try {
    const { error, value } = schema.validate(req.body);

    if (!error) {  

        let data = [
            req.body.Description,
           
            res.locals.user,           
            req.body.ComapnyID,  
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
            let sp = "call SPSaveItemCategories(?,?,?,?)";
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
ItemCategories.put("/:ID", auth.validateRole("Item categories"), function(req, res) {
    const schema = Joi.object({
        ComapnyID: Joi.number().integer(),
        BranchID: Joi.number().integer(),
       
          Description: Joi.string()
          .required()
      });
  try {
    const { error, value } = schema.validate(req.body);

    if (!error) {
      const ID = req.params.ID;
      let data = [
        ID,
        req.body.Description,
            res.locals.user,           
            req.body.ComapnyID,  
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
          let sp = "call SPUpdateitemcategory(?,?,?,?,?)";
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
ItemCategories.delete(
  "/:ID/:ComapnyID/:BranchID",
  auth.validateRole("Item categories"),
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
        let sp = "call SPDeleteitemcategory(?,?,?,?)";
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
module.exports = ItemCategories;
