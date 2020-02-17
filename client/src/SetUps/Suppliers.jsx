import React, { Component } from "react";

import swal from "sweetalert";
import Table from "./../SystemAdmin/Table";
import TableWrapper from "./../SystemAdmin/TableWrapper";
import Modal from "react-awesome-modal";
import { Progress } from "reactstrap";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
var _ = require("lodash");
class Suppliers extends Component {
  constructor() {
    super();
    this.state = {
      Suppliers: [],
     
      privilages: [],
      Name: "",
      Telephone: "",
      Email: "",
      MobileNo: "",
      Photo: "default.png",
      Address: "",
      PhysicalLocation: "",
      ID:"",
      Logo: "",
      open: false,    
      IsActive: false,
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
      Name: "",
      Telephone: "",
      Email: "",
      Logo: "default.png",
      MobileNo: "",
    
      IsActive: false,
      isUpdate: false,
      Address: "",
      PhysicalLocation: ""
    };
    this.setState(data);
  }
  openModal() {
    this.setState({ open: true });
    this.Resetsate();
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

  checkMimeType = event => {
    let files = event.target.files;
    let err = []; // create empty array
    const types = ["image/png", "image/jpeg", "image/gif"];
    for (var x = 0; x < files.length; x++) {
      if (types.every(type => files[x].type !== type)) {
        err[x] = files[x].type + " is not a supported format\n";
        // assign message to array
      }
    }
    for (var z = 0; z < err.length; z++) {
      // loop create toast massage
      event.target.value = null;
      toast.error(err[z]);
    }
    return true;
  };


  onChangeHandler = event => {
    //for multiple files
    var files = event.target.files;
    if (
    
      this.checkMimeType(event)
    ) {
      this.setState({
      
        loaded: 0
      });

      const data = new FormData();
      
      for (var x = 0; x < files.length; x++) {
        data.append("file", files[x]);
      }
      axios
        .post("/api/Uploads/Profile", data, {
          // receive two parameter endpoint url ,form data
          onUploadProgress: ProgressEvent => {
            this.setState({
              loaded: (ProgressEvent.loaded / ProgressEvent.total) * 100
            });
          }
        })
        .then(res => {
          this.setState({
            Photo: res.data
          });
         
          toast.success("upload success");         
        })
        .catch(err => {
          toast.error("upload fail");
        });
    }
  };
  fetchSuppliers = () => {
    this.setState({ Suppliers: [] });
    fetch("/api/Suppliers/" + localStorage.getItem("CompanyID"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("xtoken")
      }
    })
      .then(res => res.json())
      .then(Suppliers => {
        if (Suppliers.length > 0) {
          this.setState({ Suppliers: Suppliers });
        } else {
          swal("", Suppliers.message, "error");
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
              this.fetchSuppliers();
            
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
      Name: this.state.Name,
      Telephone: this.state.Telephone,
      Email: this.state.Email,
      MobileNo: this.state.MobileNo,     
      Logo: this.state.Photo,
      Active: this.state.IsActive,
      Address: this.state.Address,
      PhysicalLocation: this.state.PhysicalLocation,
     
    };

    if (this.state.isUpdate) {
      this.UpdateData("/api/Suppliers/" + this.state.ID, data);
    } else {
      this.postData("/api/Suppliers", data);
    }
  };
  handleEdit = Suppliers => {
    const data = {
      Name: Suppliers.Name,
      Telephone: Suppliers.Telephone,
      Email: Suppliers.Email,
      MobileNo: Suppliers.MobileNo,
      Address: Suppliers.Address,
      IsActive: !!+Suppliers.Active,

      Photo: Suppliers.Logo,
      ID: Suppliers.ID,
      PhysicalLocation: Suppliers.PhysicalLocation,
 
      open: true,
      isUpdate: true
    };

    this.setState(data);

    // this.handleRolesOpoup(Suppliers.Telephone);
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
          "/api/Suppliers/" +
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
                this.fetchSuppliers();
              //  this.Resetsate();
              } else {
                swal("", data.message, "error");
              }
              
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
            this.fetchSuppliers();
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
            this.fetchSuppliers();
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
        label: "Name",
        field: "Name",
        sort: "asc",
        width: 200
      },
      {
        label: "Telephone",
        field: "Telephone",
        sort: "asc",
        width: 200
      },
      {
        label: "Email",
        field: "Email",
        sort: "asc",
        width: 200
      },
      {
        label: "MobileNo",
        field: "MobileNo",
        sort: "asc",
        width: 200
      },
      {
        label: "Active",
        field: "Active",
        sort: "asc",
        width: 200
      },
      {
        label: "Address",
        field: "Address",
        sort: "asc",
        width: 200
      },

      {
        label: "PhysicalLocation",
        field: "PhysicalLocation",
        sort: "asc",
        width: 200
      },{
        label: "action",
        field: "action",
        sort: "asc",
        width: 200
      }
    ];
    let Rowdata1 = [];
   
    const Rows = [...this.state.Suppliers];

    if (Rows.length > 0) {
      Rows.map((k, i) => {
        let Rowdata = {
          Name: k.Name,
          Telephone: k.Telephone,
          Email: k.Email,
          MobileNo: k.MobileNo,
          Active: k.Active,
          Address: k.Address,
          PhysicalLocation: k.PhysicalLocation,
          
          action: (
            <span>
             
              &nbsp;
              {this.validaterole("Suppliers", "Edit") ? (
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
              {this.validaterole("Suppliers", "Remove") ? (
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
   
    let photostyle = {
      height: 150,
      width: 150
    };
   

    return (
      <div>
        <div className="row wrapper border-bottom white-bg page-heading">
          <div className="col-lg-12">
            <br />
            <div className="row">
              <div className="col-sm-8">
                <b>Suppliers</b>
              </div>
              <div className="col-sm-4">
                <span className="float-right">
                  {this.validaterole("Suppliers", "AddNew") ? (
                    <button
                      type="button"
                      onClick={this.openModal}
                      className="btn btn-primary fa fa-plus"
                    >
                      &nbsp;New
                    </button>
                  ) : null}
                  &nbsp;&nbsp;
                  {this.validaterole("Suppliers", "Export") ? (
                    <button
                      onClick={this.exportpdf}
                      type="button"
                      className="btn btn-primary fa fa-file-pdf-o fa-2x"
                    >
                      &nbsp;PDF
                    </button>
                  ) : null}
                </span>
              </div>
            </div>
          </div>

          <Modal
            visible={this.state.open}
            width="60%"
            height="480px"
            effect="fadeInUp"
          >
            <ToastContainer/>
            <div style={{ "overflow-y": "scroll", height: "480px" }}>
              <a className="close" onClick={() => this.closeModal()}>
                &times;
              </a>

              <div className="row">
                <div className="col-sm-5"></div>
                <div className="col-sm-4 fontWeight-bold text-blue">
                Suppliers
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
                              Name
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="Name"
                              id="Name"
                              required
                              onChange={this.handleInputChange}
                              value={this.state.Name}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor="Datereceived"
                              className="fontWeight-bold"
                            >
                              Telephone
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="Telephone"
                              id="Telephone"
                              required
                              onChange={this.handleInputChange}
                              value={this.state.Telephone}
                              EnabledStatus
                            />
                          </div>
                        </div>
                        <div className="col-sm">
                            <div className="row">
                            <div className="col-sm">
                            <div className="form-group">
                            <img
                              alt=""
                              className=""
                              src={
                                process.env.REACT_APP_BASE_URL +
                                "/Photos/" +
                                this.state.Photo
                              }
                              style={photostyle}
                            />
                          </div>
                            </div>
                            <div className="col-sm">
                            <div className="form-group">
                      <div className="form-group files">
                        <label className="font-weight-bold">
                          Upload 
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          name="file"
                          onChange={this.onChangeHandler}
                          
                        />
                      </div>
                      <div class="form-group">
                        <Progress
                          max="100"
                          color="success"
                          value={this.state.loaded}
                        >
                          {Math.round(this.state.loaded, 2)}%
                        </Progress>
                      </div>
                    </div>
                            </div>
                            </div>
                      
                         
                        </div>
                      </div>

                      <div className=" row">
                        <div className="col-sm">
                          <div className="form-group">
                            <label
                              htmlFor="Datereceived"
                              className="fontWeight-bold"
                            >
                              Email
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              name="Email"
                              id="Email"
                              required
                              onChange={this.handleInputChange}
                              value={this.state.Email}
                            />
                          </div>
                        </div>
                        <div className="col-sm">
                          <div className="form-group">
                            <label
                              htmlFor="Datereceived"
                              className="fontWeight-bold"
                            >
                              Mobile
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="MobileNo"
                              id="MobileNo"
                              required
                              onChange={this.handleInputChange}
                              value={this.state.MobileNo}
                            />
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-sm-6">
                          <label for="Telephone" className="fontWeight-bold">
                          Address
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="Address"
                            id="Address"
                            required
                            onChange={this.handleInputChange}
                            value={this.state.Address}
                          />
                        </div>
                        <div class="col-sm-6">
                          <label for="Telephone" className="fontWeight-bold">
                            PhysicalLocation{" "}
                          </label>
                          <input
                            type="text"
                            name="PhysicalLocation"
                            defaultValue={this.state.PhysicalLocation}
                            required
                            className="form-control"
                            onChange={this.handleInputChange}
                            id="PhysicalLocation"
                          />
                        </div>
                      </div>
                      <div className=" row">
                      
                        <div className="col-sm-2">
                          <div className="form-group">
                            <br />
                            <br />
                            <input
                              className="checkbox"
                              id="IsActive"
                              type="checkbox"
                              name="IsActive"
                              checked={this.state.IsActive}
                              // defaultChecked={this.state.IsActive}
                              onChange={this.handleInputChange}
                            />{" "}
                            <label htmlFor="Active" className="fontWeight-bold">
                              Active
                            </label>
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
                            Save
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
export default Suppliers;
