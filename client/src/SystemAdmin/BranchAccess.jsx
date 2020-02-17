import React, { Component } from "react";
import swal from "sweetalert";
import Table from "./Table";
import TableWrapper from "./TableWrapper";
import Modal from "react-awesome-modal";
import Select from "react-select";
var _ = require("lodash");
class BranchAccess extends Component {
  constructor() {
    super();
    this.state = {
      BranchAccess: [],
      Users: [],
      Branches: [],
      privilages: [],
      UserName: "",
      Description: "",
      BranchID: "",
      open: false,
      isUpdate: false
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.Resetsate = this.Resetsate.bind(this);
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
  fetchUsers = () => {
    fetch("/api/users/" + localStorage.getItem("CompanyID"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("xtoken")
      }
    })
      .then(res => res.json())
      .then(Users => {
        if (Users.length > 0) {
          this.setState({ Users: Users });
        } else {
          swal("", Users.message, "error");
        }
      })
      .catch(err => {
        swal("", err.message, "error");
      });
  };
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

  fetchBranchAccess = () => {
    fetch("/api/BranchAccess/" + localStorage.getItem("CompanyID"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("xtoken")
      }
    })
      .then(res => res.json())
      .then(BranchAccess => {
        if (BranchAccess.length > 0) {
          this.setState({ BranchAccess: BranchAccess });
        } else {
          //swal("", "BranchAccess.message", "error");
          swal("", BranchAccess.message, "error");
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
              this.fetchBranchAccess();
              this.fetchUsers();
              this.fetchBranches();
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
      BranchID: this.state.BranchID,
      UserName: this.state.UserName
    };

    this.postData("/api/BranchAccess", data);
  };
  handleEdit = Name => {
    const data = {
      UserName: Name.UserName,
      BranchID: Name.BranchID,
      open: true
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
          "/api/BranchAccess/" +
            k.BranchID +
            "/" +
            localStorage.getItem("CompanyID") +
            "/" +
            k.UserName,
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
              this.fetchBranchAccess();
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
          this.fetchBranchAccess();

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
  handleSelectChange = (UserGroup, actionMeta) => {
    this.setState({ [actionMeta.name]: UserGroup.value });
  };
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
          this.fetchBranchAccess();

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
        label: "BranchName",
        field: "BranchName",
        sort: "asc",
        width: 200
      },
      {
        label: "UserName",
        field: "UserName",
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

    const rows = [...this.state.BranchAccess];

    if (rows.length > 0) {
      rows.forEach(k => {
        const Rowdata = {
          BranchName: k.BranchName,
          UserName: k.UserName,

          action: (
            <span>
              &nbsp;
              {this.validaterole("Branch Access", "Remove") ? (
                <a
                  style={{ color: "#f44542" }}
                  onClick={e => this.handleDelete(k, e)}
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

    const UsersOptions = [...this.state.Users].map((k, i) => {
      return {
        value: k.UserName,
        label: k.FullNames
      };
    });
    const BranchesOptions = [...this.state.Branches].map((k, i) => {
      return {
        value: k.BranchID,
        label: k.Name
      };
    });

    return (
      <div>
        <div>
          <div className="row wrapper border-bottom white-bg page-heading">
            <div className="col-lg-12">
              <br />
              <div className="row">
                <div className="col-sm-9">
                  <h2>Branch Access</h2>
                </div>
                <div className="col-sm-3">
                  <span className="float-right">
                    {this.validaterole("Branch Access", "AddNew") ? (
                      <button
                        type="button"
                        onClick={this.openModal}
                        className="btn btn-primary  fa fa-plus"
                      >
                        New
                      </button>
                    ) : null}
                    &nbsp;
                    {this.validaterole("Branch Access", "Export") ? (
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
                                  UserName
                                </label>
                                <Select
                                  name="UserName"
                                  value={UsersOptions.filter(
                                    option =>
                                      option.value === this.state.UserName
                                  )}
                                  onChange={this.handleSelectChange}
                                  options={UsersOptions}
                                  required
                                />
                              </div>
                            </div>
                            <div className="col-sm">
                              <div className="form-group">
                                <label
                                  htmlFor="exampleInputEmail1"
                                  className="font-weight-bold"
                                >
                                  Branch
                                </label>
                                <Select
                                  name="BranchID"
                                  value={BranchesOptions.filter(
                                    option =>
                                      option.value === this.state.BranchID
                                  )}
                                  onChange={this.handleSelectChange}
                                  options={BranchesOptions}
                                  required
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

export default BranchAccess;
