var express = require("express");
var Companies = express();
var mysql = require("mysql");
var config = require("./DB");
var con = mysql.createPool(config);
const Joi = require("@hapi/joi");
var auth = require("./auth");
Companies.get("/", auth.validateRole("Companies"), function(req, res) {
  con.getConnection(function(err, connection) {
    if (err) {
      res.json({
        success: false,
        message: err.message
      });
    } // not connected!
    else {
      let sp = "call SPGetAllCompanies()";
      connection.query(sp, function(error, results, fields) {
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
Companies.get("/:ID", auth.validateRole("Companies"), function(req, res) {
  const ID = req.params.ID;
  con.getConnection(function(err, connection) {
    if (err) {
      res.json({
        success: false,
        message: err.message
      });
    } // not connected!
    else {
      let sp = "call SPGetOneCompany(?)";
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

Companies.post("/", auth.validateRole("Companies"), function(req, res) {
  const schema = Joi.object({
    Name: Joi.string().required(),
    Mobile: Joi.number().integer(),
    Telephone: Joi.string().required(),
    PostalAddress: Joi.string().required(),
    Email: Joi.string().email({ minDomainSegments: 2 }),
    PostalCode: Joi.string().required(),
    RegistrationDate: Joi.date().required(),
    Website: Joi.string()
      .allow(null)
      .allow(""),
    Logo: Joi.string()
      .allow(null)
      .allow(""),

    Town: Joi.string().required(),
    Pin: Joi.string().required()
  });
  //   const result = Joi.validate(, schema);
  //   if (!result.error) {
  try {
    const { error, value } = schema.validate(req.body);

    if (!error) {
      let data = [
        req.body.Name,
        req.body.Email,
        req.body.Website,
        req.body.Mobile,
        req.body.Telephone,
        req.body.PostalAddress,
        req.body.PostalCode,
        req.body.Town,
        req.body.RegistrationDate,
        req.body.Logo,
        req.body.Pin,
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
          let sp = "call SPSaveCompany(?,?,?,?,?,?,?,?,?,?,?,?)";
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
Companies.put("/:ID", auth.validateRole("Companies"), function(req, res) {
  const schema = Joi.object({
    Name: Joi.string().required(),
    Mobile: Joi.number().integer(),
    Telephone: Joi.string().required(),
    PostalAddress: Joi.string().required(),
    Email: Joi.string().email({ minDomainSegments: 2 }),
    PostalCode: Joi.string().required(),
    RegistrationDate: Joi.date().required(),
    Website: Joi.string()
      .allow(null)
      .allow(""),
    Logo: Joi.string()
      .allow(null)
      .allow(""),

    Town: Joi.string().required(),
    Pin: Joi.string().required()
  });
  try {
    const { error, value } = schema.validate(req.body);

    if (!error) {
      const ID = req.params.ID;
      let data = [
        ID,
        req.body.Name,
        req.body.Email,
        req.body.Website,
        req.body.Mobile,
        req.body.Telephone,
        req.body.PostalAddress,
        req.body.PostalCode,
        req.body.Town,
        req.body.RegistrationDate,
        req.body.Logo,
        req.body.Pin,
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
          let sp = "call SPUpdateCompany(?,?,?,?,?,?,?,?,?,?,?,?,?)";
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
Companies.delete("/:ID", auth.validateRole("Companies"), function(req, res) {
  const ID = req.params.ID;
  let data = [ID, res.locals.user];
  con.getConnection(function(err, connection) {
    if (err) {
      res.json({
        success: false,
        message: err.message
      });
    } // not connected!
    else {
      let sp = "call SPDeleteCompany(?,?)";
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
});
module.exports = Companies;
