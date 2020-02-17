import React, { Component } from "react";
import swal from "sweetalert";
import Table from "./Table";
import TableWrapper from "./TableWrapper";
import Modal from "react-awesome-modal";
var _ = require("lodash");
class UserGroups extends Component {
  constructor() {
    super();
    this.state = {
      Usergroups: [],
      privilages: [],
      Name: "",
      Description: "",
      UserGroupID: "",
      open: false,
      isUpdate: false,
      RolesPoup: false,
      Roles: [],
      AdminCategory: [],
      Patient_ManagementCategory: [],
      Menus: [],
      CaseManagementCategory: [],
      ReportsCategory: [],
      ConfigurationsCategory:[],
      InventoryCategory:[],
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.Resetsate = this.Resetsate.bind(this);
    this.closeRolesPoup = this.closeRolesPoup.bind(this);
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

  OpenRolesOpoup = K => {
    this.setState({ RolesPoup: true, UserGroupID: K.UserGroupID, Roles: [], AdminCategory: [],
      Menus: [],
      ReportsCategory: [],
      Patient_ManagementCategory:[],
      InventoryCategory:[],
      ConfigurationsCategory:[],});
    this.fetchRoles(K.UserGroupID);
  };
  fetchRoles = GroupID => {
    fetch(
      "/api/GroupAccess/" + GroupID + "/" + localStorage.getItem("CompanyID"),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": localStorage.getItem("xtoken")
        }
      }
    )
      .then(res => res.json())
      .then(Roles => {
        if (Roles.length > 0) {
          const UserRoles = [_.groupBy(Roles, "Category")];
          
          this.setState({ AdminCategory: UserRoles[0].Admin ,
          Patient_ManagementCategory: UserRoles[0].PatientManagement,         
          Menus: UserRoles[0].Menus ,
          InventoryCategory: UserRoles[0].Inventory ,
          ConfigurationsCategory: UserRoles[0].Configurations });
        } else {
          swal("", Roles.message, "error");
        }
      })
      .catch(err => {
        swal("", err.message, "error");
      });
  };
  handleCheckBoxChange = (Role, e) => {
    const target = e.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    let CompanyID = localStorage.getItem("CompanyID");
    let BranchID = localStorage.getItem("BranchID");
    let data = {
      UserGroup: this.state.UserGroupID,
      Role: Role.RoleID,
      Status: value,
      Name: name,
      CompanyID: CompanyID,
      BranchID: BranchID
    };
    this.UpdateUserRoles("/api/GroupAccess", data);
  };
  UpdateUserRoles(url = ``, data = {}) {
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
            //swal("Saved!", "Record has been updated!", "success");
            // this.Resetsate();
          } else {
            swal("", data.message, "error");
          }
        })
      )
      .catch(err => {
        swal("", err.message, "error");
      });
  }

  openModal() {
    this.setState({ open: true });
    this.Resetsate();
  }

  closeRolesPoup=(event)=> {
    event.preventDefault();
    this.setState({ RolesPoup: false });
  }
  closeRolesPoup1 = (event) => {
    event.preventDefault();
    this.setState({ RolesPoup: false });
    swal("", "Roles Saved", "success");
  };
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

      UserGroupID: "",
      isUpdate: false
    };
    this.setState(data);
  }

  fetchUsergroups = () => {
    fetch("/api/SecurityGroups/" + localStorage.getItem("CompanyID"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("xtoken")
      }
    })
      .then(res => res.json())
      .then(Usergroups => {
        if (Usergroups.length > 0) {
          this.setState({ Usergroups: Usergroups });
        } else {
          swal("", "Usergroups.message", "error");
          // swal("", Usergroups.message, "error");
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
              this.fetchUsergroups();
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
      this.UpdateData("/api/SecurityGroups/" + this.state.UserGroupID, data);
    } else {
      this.postData("/api/SecurityGroups", data);
    }
  };
  handleEdit = Name => {
    const data = {
      Name: Name.Name,
      open: true,
      isUpdate: true,
      UserGroupID: Name.UserGroupID
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
          "/api/SecurityGroups/" + k + "/" + localStorage.getItem("CompanyID"),
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
              this.fetchUsergroups();
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
          this.fetchUsergroups();

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
          this.fetchUsergroups();

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

    const rows = [...this.state.Usergroups];

    if (rows.length > 0) {
      rows.forEach(k => {
        const Rowdata = {
         
          Name: k.Name,

          action: (
            <span>
              {this.validaterole("Assign User Access", "Edit") ? (
                <a
                  className="text-green"
                  style={{ color: "#007bff" }}
                  onClick={e => this.OpenRolesOpoup(k, e)}
                >
                  Roles |
                </a>
              ) : (
                <i>-</i>
              )}
              &nbsp;
              {this.validaterole("Security Groups", "Edit") ? (
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
              {this.validaterole("Security Groups", "Remove") ? (
                <a
                  className="text-red"
                  style={{ color: "#f44542" }}
                  onClick={e => this.handleDelete(k.UserGroupID, e)}
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

    let handleCheckBoxChange = this.handleCheckBoxChange;

    return (
      <div>
        <div>
          <div className="row wrapper border-bottom white-bg page-heading">
            <div className="col-lg-12">
              <br />
              <div className="row">
                <div className="col-sm-9">
                  <h2>User groups</h2>
                </div>
                <div className="col-sm-3">
                  <span className="float-right">
                    {this.validaterole("Security Groups", "AddNew") ? (
                      <button
                        type="button"
                        onClick={this.openModal}
                        className="btn btn-primary fa fa-plus"
                      >
                        &nbsp; New
                      </button>
                    ) : null}
                    &nbsp;&nbsp;
                    {this.validaterole("Security Groups", "Export") ? (
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
                <a className="close" onClick={this.closeModal}>
                  &times;
                </a>
                <div className="row">
                  <div className="col-sm-5"></div>
                  <div className="col-sm-4 font-weight-bold">User Group </div>
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
            <Modal
              visible={this.state.RolesPoup}
              width="70%"
              height="600px"
              effect="fadeInUp"
            >
              <div style={{ "overflow-y": "scroll", height: "600px" }}>
                <a className="close" onClick={this.closeRolesPoup}>
                  &times;
                </a>
                <div>
                  Group Roles- <b>{this.state.Name}</b>{" "}
                </div>

                <form>
                  <table className="table">
                    <thead className="table-success">
                      <th scope="col" style={tablestyle}>
                        Role
                      </th>
                      <th>Create</th>
                      <th>View</th>
                      <th>Delete</th>
                      <th>Update</th>
                      <th>Export</th>
                    </thead>
                    <tbody style={{ marginLeft: "30px" }}>
                      <h5 style={{ marginLeft: "10px" }} className="text-blue">
                        Menus
                      </h5>
                      {this.state.Menus.map((role, i) => {
                        return (
                          <tr id={i}>
                            <td>{role.RoleName}</td>
                            <td>
                              <input
                                className="checkbox"
                                id={i}
                                type="checkbox"
                                name="Create"
                                defaultChecked={role.AddNew}
                                onChange={e => handleCheckBoxChange(role, e)}
                                // onChange={handleCheckBoxChange(e)}
                              />
                            </td>
                            <td>
                              <input
                                className="checkbox"
                                id={i + 1}
                                type="checkbox"
                                name="View"
                                defaultChecked={role.View}
                                //   value=""
                                onChange={e => handleCheckBoxChange(role, e)}
                              />
                            </td>
                            <td>
                              <input
                                className="checkbox"
                                id={i + 2}
                                type="checkbox"
                                name="Delete"
                                defaultChecked={role.Remove}
                                onChange={e => handleCheckBoxChange(role, e)}
                              />
                            </td>
                            <td>
                              <input
                                className="checkbox"
                                id={i + 3}
                                type="checkbox"
                                name="Update"
                                defaultChecked={role.Edit}
                                onChange={e => handleCheckBoxChange(role, e)}
                              />
                            </td>
                            <td>
                              <input
                                className="checkbox"
                                id={i + 3}
                                type="checkbox"
                                name="Export"
                                defaultChecked={role.Export}
                                onChange={e => handleCheckBoxChange(role, e)}
                              />
                            </td>
                          </tr>
                        );
                      })}

                      <h5 style={{ marginLeft: "10px" }} className="text-blue">
                        System Administration
                      </h5>
                      {this.state.AdminCategory.map(function(role, i) {
                        return (
                          <tr id={i}>
                            <td>{role.RoleName}</td>
                            <td>
                              <input
                                className="checkbox"
                                id={i}
                                type="checkbox"
                                name="Create"
                                defaultChecked={role.AddNew}
                                onChange={e => handleCheckBoxChange(role, e)}
                                // onChange={handleCheckBoxChange(e)}
                              />
                            </td>
                            <td>
                              <input
                                className="checkbox"
                                id={i + 1}
                                type="checkbox"
                                name="View"
                                defaultChecked={role.View}
                                //   value=""
                                onChange={e => handleCheckBoxChange(role, e)}
                              />
                            </td>
                            <td>
                              <input
                                className="checkbox"
                                id={i + 2}
                                type="checkbox"
                                name="Delete"
                                defaultChecked={role.Remove}
                                onChange={e => handleCheckBoxChange(role, e)}
                              />
                            </td>
                            <td>
                              <input
                                className="checkbox"
                                id={i + 3}
                                type="checkbox"
                                name="Update"
                                defaultChecked={role.Edit}
                                onChange={e => handleCheckBoxChange(role, e)}
                              />
                            </td>
                            <td>
                              <input
                                className="checkbox"
                                id={i + 3}
                                type="checkbox"
                                name="Export"
                                defaultChecked={role.Export}
                                onChange={e => handleCheckBoxChange(role, e)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                      <h5 style={{ marginLeft: "10px" }} className="text-blue">
                        {" "}
                        Configurations 
                      </h5>
                      
                      {this.state.ConfigurationsCategory.map((role, i)=> {
                        return (
                          <tr id={i}>
                            <td>{role.RoleName}</td>
                            <td>
                              <input
                                className="checkbox"
                                id={i}
                                type="checkbox"
                                name="Create"
                                defaultChecked={role.AddNew}
                                onChange={e => handleCheckBoxChange(role, e)}
                                // onChange={handleCheckBoxChange(e)}
                              />
                            </td>
                            <td>
                              <input
                                className="checkbox"
                                id={i + 1}
                                type="checkbox"
                                name="View"
                                defaultChecked={role.View}
                                //   value=""
                                onChange={e => handleCheckBoxChange(role, e)}
                              />
                            </td>
                            <td>
                              <input
                                className="checkbox"
                                id={i + 2}
                                type="checkbox"
                                name="Delete"
                                defaultChecked={role.Remove}
                                onChange={e => handleCheckBoxChange(role, e)}
                              />
                            </td>
                            <td>
                              <input
                                className="checkbox"
                                id={i + 3}
                                type="checkbox"
                                name="Update"
                                defaultChecked={role.Edit}
                                onChange={e => handleCheckBoxChange(role, e)}
                              />
                            </td>
                            <td>
                              <input
                                className="checkbox"
                                id={i + 3}
                                type="checkbox"
                                name="Export"
                                defaultChecked={role.Export}
                                onChange={e => handleCheckBoxChange(role, e)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                        <h5 style={{ marginLeft: "10px" }} className="text-blue">
                        {" "}
                        Inventory Category
                      </h5>
                      {this.state.InventoryCategory.map((role, i)=> {
                        return (
                          <tr id={i}>
                            <td>{role.RoleName}</td>
                            <td>
                              <input
                                className="checkbox"
                                id={i}
                                type="checkbox"
                                name="Create"
                                defaultChecked={role.AddNew}
                                onChange={e => handleCheckBoxChange(role, e)}
                                // onChange={handleCheckBoxChange(e)}
                              />
                            </td>
                            <td>
                              <input
                                className="checkbox"
                                id={i + 1}
                                type="checkbox"
                                name="View"
                                defaultChecked={role.View}
                                //   value=""
                                onChange={e => handleCheckBoxChange(role, e)}
                              />
                            </td>
                            <td>
                              <input
                                className="checkbox"
                                id={i + 2}
                                type="checkbox"
                                name="Delete"
                                defaultChecked={role.Remove}
                                onChange={e => handleCheckBoxChange(role, e)}
                              />
                            </td>
                            <td>
                              <input
                                className="checkbox"
                                id={i + 3}
                                type="checkbox"
                                name="Update"
                                defaultChecked={role.Edit}
                                onChange={e => handleCheckBoxChange(role, e)}
                              />
                            </td>
                            <td>
                              <input
                                className="checkbox"
                                id={i + 3}
                                type="checkbox"
                                name="Export"
                                defaultChecked={role.Export}
                                onChange={e => handleCheckBoxChange(role, e)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                      <h5 style={{ marginLeft: "10px" }} className="text-blue">
                        {" "}
                        Patient Management
                      </h5>
                      {this.state.Patient_ManagementCategory.map((role, i)=> {
                        return (
                          <tr id={i}>
                            <td>{role.RoleName}</td>
                            <td>
                              <input
                                className="checkbox"
                                id={i}
                                type="checkbox"
                                name="Create"
                                defaultChecked={role.AddNew}
                                onChange={e => handleCheckBoxChange(role, e)}
                                // onChange={handleCheckBoxChange(e)}
                              />
                            </td>
                            <td>
                              <input
                                className="checkbox"
                                id={i + 1}
                                type="checkbox"
                                name="View"
                                defaultChecked={role.View}
                                //   value=""
                                onChange={e => handleCheckBoxChange(role, e)}
                              />
                            </td>
                            <td>
                              <input
                                className="checkbox"
                                id={i + 2}
                                type="checkbox"
                                name="Delete"
                                defaultChecked={role.Remove}
                                onChange={e => handleCheckBoxChange(role, e)}
                              />
                            </td>
                            <td>
                              <input
                                className="checkbox"
                                id={i + 3}
                                type="checkbox"
                                name="Update"
                                defaultChecked={role.Edit}
                                onChange={e => handleCheckBoxChange(role, e)}
                              />
                            </td>
                            <td>
                              <input
                                className="checkbox"
                                id={i + 3}
                                type="checkbox"
                                name="Export"
                                defaultChecked={role.Export}
                                onChange={e => handleCheckBoxChange(role, e)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                      
                    </tbody>
                  </table>

                  <br />
                  <div className="col-sm-12 ">
                    <div className=" row">
                      <div className="col-sm-11" />
                      <div className="col-sm-1">
                        <button
                          className="btn btn-primary float-left"
                          onClick={this.closeRolesPoup1}
                        >
                          DONE
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
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

export default UserGroups;
