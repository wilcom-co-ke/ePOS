import React, { Component } from "react";

import swal from "sweetalert";
import Table from "./../SystemAdmin/Table";
import TableWrapper from "./../SystemAdmin/TableWrapper";
import Modal from "react-awesome-modal";
import Select from "react-select";
var dateFormat = require("dateformat");
//var jsPDF = require("jspdf");
//require("jspdf-autotable");
var _ = require("lodash");
class PaymentModes extends Component {
  constructor() {
    super();
    this.state = {
      PaymentModes: [],    
      privilages: [],
      Description: "",
     
      open: false,  
      isUpdate: false,

   
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.Resetsate = this.Resetsate.bind(this);
  }
  
  ProtectRoute() {
    fetch("/api/UserAccess", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("xtoken")
      }
    })
      .then(res => res.json())
      .then(data => {
        this.setState({ privilages: data });
      })
      .catch(err => {
        //this.setState({ loading: false, redirect: true });
      });
    //end
  }
  validaterole = (rolename, action) => {
    let array = [...this.state.privilages];
    let AuditTrailsObj = array.find(obj => obj.RoleName === rolename);
    if (AuditTrailsObj) {
      if (action === "AddNew") {
        if (AuditTrailsObj.AddNew) {
          return true;
        } else {
          return false;
        }
      } else if (action === "View") {
        if (AuditTrailsObj.View) {
          return true;
        } else {
          return false;
        }
      } else if (action === "Edit") {
        if (AuditTrailsObj.Edit) {
          return true;
        } else {
          return false;
        }
      } else if (action === "Export") {
        if (AuditTrailsObj.Export) {
          return true;
        } else {
          return false;
        }
      } else if (action == "Remove") {
        if (AuditTrailsObj.Remove) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  };


  Resetsate() {
    const data = {
      Description: ""
    
    };
    this.setState(data);
  }
  openModal() {
    const data = {
      Description: "",
      ID: "",
      open: true,
      isUpdate: false
    };

    this.setState(data);
    
  }

 
  closeModal() {
    this.setState({ open: false });
  }

  
  handleInputChange = event => {
    // event.preventDefault();
    // this.setState({ [event.target.name]: event.target.value });
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({ [name]: value });
  };
  handleSelectChange = (UserGroup, actionMeta) => {
 
      this.setState({ [actionMeta.name]: UserGroup.value });
   
  };
  
  fetchPaymentModess = () => {
    fetch("/api/PaymentModes/" + localStorage.getItem("CompanyID"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("xtoken")
      }
    })
      .then(res => res.json())
      .then(PaymentModes => {
        if (PaymentModes.length > 0) {
          this.setState({ PaymentModes: PaymentModes });
        } else {
          swal("", PaymentModes.message, "error");
        }
      })
      .catch(err => {
        swal("", err.message, "error");
      });
  };
  componentDidMount() {
    let token = localStorage.getItem("xtoken");
    if (token == null) {
      localStorage.clear();
      return (window.location = "/#/Logout");
    } else {
      fetch("/api/ValidateTokenExpiry", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": localStorage.getItem("xtoken")
        }
      })
        .then(response =>
          response.json().then(data => {
            if (data.success) {
              this.ProtectRoute();
              this.fetchPaymentModess();
            } else {
              localStorage.clear();
              return (window.location = "/#/Logout");
            }
          })
        )
        .catch(err => {
          localStorage.clear();
          return (window.location = "/#/Logout");
        });
    }
  }
  handleSubmit = event => {
    event.preventDefault();
    let ComapnyID = localStorage.getItem("CompanyID");
    let BranchID = localStorage.getItem("BranchID");
    const data = {
      BranchID: BranchID,
      ComapnyID: ComapnyID,
      Description: this.state.Description
     
    };

    if (this.state.isUpdate) {
      this.UpdateData("/api/PaymentModes/" + this.state.ID, data);
    } else {
      this.postData("/api/PaymentModes", data);
    }
  };
  handleEdit = PaymentModes => {
    const data = {
      Description: PaymentModes.Description,
      ID: PaymentModes.ID,
      open: true,
      isUpdate: true
    };

    this.setState(data);

    // this.handleRolesOpoup(PaymentModes.Amount);
  };
  handleDelete = k => {
    swal({
      text: "Are you sure that you want to delete this record?",
      icon: "warning",
      dangerMode: true,
      buttons: true
    }).then(willDelete => {
      if (willDelete) {
        return fetch(
          "/api/PaymentModes/" +
            k +
            "/" +
            localStorage.getItem("CompanyID") +
            "/" +
            localStorage.getItem("BranchID"),
          {
            method: "Delete",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": localStorage.getItem("xtoken")
            }
          }
        )
          .then(response =>
            response.json().then(data => {
              if (data.success) {
                swal("", "Record has been deleted!", "success");
                this.Resetsate();
              } else {
                swal("", data.message, "error");
              }
              this.fetchPaymentModess();
            })
          )
          .catch(err => {
            swal("", err.message, "error");
          });
      }
    });
  };
 
  UpdateData(url = ``, data = {}) {
    fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("xtoken")
      },
      body: JSON.stringify(data)
    })
      .then(response =>
        response.json().then(data => {
          if (data.success) {
            swal("", "Record has been updated!", "success");
            this.Resetsate();
            this.setState({ open: false });
            this.fetchPaymentModess();
          } else {
            swal("", data.message, "error");
          }
        })
      )
      .catch(err => {
        swal("", err.message, "error");
      });
  }
  postData(url = ``, data = {}) {
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("xtoken")
      },
      body: JSON.stringify(data)
    })
      .then(response =>
        response.json().then(data => {
          if (data.success) {
          
            swal("", "Record has been saved!", "success");
            //this.Resetsate();
            this.fetchPaymentModess();
          } else {
            
              swal("", data.message, "error");
          
          }
        })
      )
      .catch(err => {
        swal("", err.message, "error");
      });
  }

  render() {
    const ColumnData = [
      {
        label: "Description",
        field: "Description",
        sort: "asc",
        width: 200
      },
      
       {
        label: "action",
        field: "action",
        sort: "asc",
        width: 200
      }
    ];
    let Rowdata1 = [];
    
    const Rows = [...this.state.PaymentModes];

    if (Rows.length > 0) {
      Rows.map((k, i) => {
        let Rowdata = {
          Description: k.Description,
              
         
          action: (
            <span>
            
              &nbsp;
              {this.validaterole("Payment Modes", "Edit") ? (
                <a
                  className="text-blue"
                  style={{ color: "#007bff" }}
                  onClick={e => this.handleEdit(k, e)}
                >
                  Edit |
                </a>
              ) : (
                <i>-</i>
              )}
              &nbsp;
              {this.validaterole("Payment Modes", "Remove") ? (
                <a
                  className="text-red"
                  style={{ color: "#f44542" }}
                  onClick={e => this.handleDelete(k.ID, e)}
                >
                  Delete
                </a>
              ) : (
                <i>-</i>
              )}
            </span>
          )
        };
        Rowdata1.push(Rowdata);
      });
    }
  
    

   

    return (
      <div>
        <div className="row wrapper border-bottom white-bg page-heading">
          <div className="col-lg-12">
            <br />
            <div className="row">
              <div className="col-sm-8">
                <b>PaymentModes</b>
              </div>
              <div className="col-sm-4">
                <span className="float-right">
                  {this.validaterole("Payment Modes", "AddNew") ? (
                    <button
                      type="button"
                      onClick={this.openModal}
                      className="btn btn-primary fa fa-plus"
                    >
                      &nbsp;New
                    </button>
                  ) : null}
               
                </span>
              </div>
            </div>
          </div>

          <Modal
            visible={this.state.open}
            width="60%"
            height="200px"
            effect="fadeInUp"
          >
            <div style={{ "overflow-y": "scroll", height: "200px" }}>
              <a className="close" onClick={() => this.closeModal()}>
                &times;
              </a>

              <div className="row">
                <div className="col-sm-5"></div>
                <div className="col-sm-4 fontWeight-bold text-blue">
                  Payment Modes{" "}
                </div>
              </div>
              <div className="container-fluid">
                <div className="col-sm-12">
                  <div className="ibox-content">
                    <form
                      className="form-horizontal"
                      onSubmit={this.handleSubmit}
                    >
                      <div className=" row">
                        <div className="col-sm">
                          <div className="form-group">
                            <label
                              htmlFor="Datereceived"
                              className="fontWeight-bold"
                            >
                              Description
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="Description"
                              id="Name"
                              required
                              onChange={this.handleInputChange}
                              value={this.state.Description}
                            />
                          </div>
                          </div>
                      
                        
                      </div>

                     
                      <div className="row">
                        <div className="col-sm-10"></div>
                        <div className="col-sm-2">
                          <button
                            className="btn btn-primary float-right"
                            type="submit"
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
          </div>

        <TableWrapper>
          <Table Rows={Rowdata1} columns={ColumnData} />
        </TableWrapper>
      </div>
    );
  }
}
export default PaymentModes;
