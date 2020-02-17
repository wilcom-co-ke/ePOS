import React, { Component } from "react";
import swal from "sweetalert";
import Table from "./Table";
import TableWrapper from "./TableWrapper";
import Modal from "react-awesome-modal";
var _ = require("lodash");
class Branches extends Component {
  constructor() {
    super();
    this.state = {
      Branches: [],
      privilages: [],
      Name: "",
      Description: "",
      BranchID: "",
      open: false,
      isUpdate: false
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

  openModal() {
    this.setState({ open: true });
    this.Resetsate();
  }

  closeModal() {
    this.setState({ open: false });
  }
  handleInputChange = event => {
    event.preventDefault();
    this.setState({ [event.target.name]: event.target.value });
  };
  Resetsate() {
    const data = {
      Name: "",

      BranchID: "",
      isUpdate: false
    };
    this.setState(data);
  }

  fetchBranches = () => {
    fetch("/api/Branches/" + localStorage.getItem("CompanyID"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("xtoken")
      }
    })
      .then(res => res.json())
      .then(Branches => {
        if (Branches.length > 0) {
          this.setState({ Branches: Branches });
        } else {
          //swal("", "Branches.message", "error");
          swal("", Branches.message, "error");
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
              this.fetchBranches();
              this.ProtectRoute();
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
    let CompanyID = localStorage.getItem("CompanyID");
    const data = {
      CompanyID: CompanyID,
      Name: this.state.Name
    };

    if (this.state.isUpdate) {
      this.UpdateData("/api/Branches/" + this.state.BranchID, data);
    } else {
      this.postData("/api/Branches", data);
    }
  };
  handleEdit = Name => {
    const data = {
      Name: Name.Name,
      open: true,
      isUpdate: true,
      BranchID: Name.BranchID
    };

    this.setState(data);
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
          "/api/Branches/" + k + "/" + localStorage.getItem("CompanyID"),
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
              this.fetchBranches();
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
          this.fetchBranches();

          if (data.success) {
            swal("", "Record has been updated!", "success");
            this.setState({ open: false });
            this.Resetsate();
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
          this.fetchBranches();

          if (data.success) {
            swal("", "Record has been saved!", "success");
            this.setState({ open: false });
            this.Resetsate();
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
        label: "action",
        field: "action",
        sort: "asc",
        width: 200
      }
    ];
    let Rowdata1 = [];

    const rows = [...this.state.Branches];

    if (rows.length > 0) {
      rows.forEach(k => {
        const Rowdata = {
         
          Name: k.Name,

          action: (
            <span>
              {this.validaterole("Branches", "Edit") ? (
                <a
                  className="fa fa-edit"
                  style={{ color: "#007bff" }}
                  onClick={e => this.handleEdit(k, e)}
                >
                  Edit |
                </a>
              ) : (
                <i>-</i>
              )}
              &nbsp;
              {this.validaterole("Branches", "Remove") ? (
                <a
                  className="fa fa-trash"
                  style={{ color: "#f44542" }}
                  onClick={e => this.handleDelete(k.BranchID, e)}
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

    let tablestyle = {
      width: "60%"
    };

    return (
      <div>
        <div>
          <div className="row wrapper border-bottom white-bg page-heading">
            <div className="col-lg-12">
              <br />
              <div className="row">
                <div className="col-sm-9">
                  <h2>Branches</h2>
                </div>
                <div className="col-sm-3">
                  <span className="float-right">
                    {this.validaterole("Branches", "AddNew") ? (
                      <button
                        type="button"
                        onClick={this.openModal}
                        className="btn btn-primary  fa fa-plus"
                      >
                        New
                      </button>
                    ) : null}
                    &nbsp;
                    {this.validaterole("Branches", "Export") ? (
                      <button
                        onClick={this.exportpdf}
                        type="button"
                        className="btn btn-primary  fa fa-file-pdf-o fa-2x"
                      >
                        &nbsp;PDF
                      </button>
                    ) : null}
                    &nbsp;
                  </span>
                </div>
              </div>
            </div>
            <Modal
              visible={this.state.open}
              width="65%"
              height="250px"
              effect="fadeInUp"
            >
              <div>
                <a className="close text-red" onClick={this.closeModal}>
                  &times;
                </a>
                <div className="row">
                  <div className="col-sm-5"></div>
                  <div className="col-sm-4 font-weight-bold">
                    Security Groups{" "}
                  </div>
                </div>

                <div>
                  <div className="container-fluid">
                    <div className="col-sm-12">
                      <div className="ibox-content">
                        <form onSubmit={this.handleSubmit}>
                          <div className=" row">
                            <div className="col-sm">
                              <div className="form-group">
                                <label
                                  htmlFor="exampleInputEmail1"
                                  className="font-weight-bold"
                                >
                                  Name
                                </label>
                                <input
                                  type="text"
                                  name="Name"
                                  required
                                  onChange={this.handleInputChange}
                                  value={this.state.Name}
                                  className="form-control"
                                  id="exampleInputPassword1"
                                  placeholder="Name"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-sm-12 ">
                            <div className=" row">
                              <div className="col-sm-2" />
                              <div className="col-sm-8" />
                              <div className="col-sm-1"></div>
                              <div className="col-sm-1">
                                <button
                                  type="submit"
                                  className="btn btn-primary float-left"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Modal>
          </div>
        </div>

        <TableWrapper>
          <Table Rows={Rowdata1} columns={ColumnData} />
        </TableWrapper>
      </div>
    );
  }
}

export default Branches;
