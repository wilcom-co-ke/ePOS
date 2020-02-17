import React, { Component } from "react";

import swal from "sweetalert";
import Table from "./Table";
import TableWrapper from "./TableWrapper";
import Modal from "react-awesome-modal";
import Select from "react-select";
var dateFormat = require("dateformat");
//var jsPDF = require("jspdf");
//require("jspdf-autotable");
var _ = require("lodash");
class Systemusers extends Component {
  constructor() {
    super();
    this.state = {
      Users: [],
      UserGroups: [],
      privilages: [],
      Name: "",
      UserName: "",
      Email: "",
      MobileNo: "",
      Photo: "default.png",
      IDNumber: "",
      DOB: "",
      Gender: "",
      UserGroup: "",
      UserGroupID: "",
      open: false,
      RolesPoup: false,
      IsActive: false,

      isUpdate: false,

      Roles: [],
      AdminCategory: [],
      Menus: [],
      ReportsCategory: [],
      Patient_ManagementCategory:[],
      InventoryCategory:[],
      ConfigurationsCategory:[],
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.Resetsate = this.Resetsate.bind(this);
    this.closeRolesPoup = this.closeRolesPoup.bind(this);
  }
  exportpdf = () => {
    // var columns = [
    //   { title: "Name", dataKey: "Name" },
    //   { title: "UserName", dataKey: "UserName" },
    //   { title: "Email", dataKey: "Email" },
    //   { title: "MobileNo", dataKey: "MobileNo" },
    //   { title: "IsActive", dataKey: "IsActive" },
    //   { title: "Board", dataKey: "Board" },
    //   { title: "UserGroup", dataKey: "UserGroup" }
    // ];
    // const data = [...this.state.Users];
    // var doc = new jsPDF("p", "pt");
    // doc.autoTable(columns, data, {
    //   margin: { top: 60 },
    //   beforePageContent: function(data) {
    //     doc.text("SYSTEM USERS", 40, 50);
    //   }
    // });
    // doc.save("ArcmSystemusers.pdf");
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

  fetchRoles = User => {
    fetch("/api/UserAccess/" + User, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("xtoken")
      }
    })
      .then(res => res.json())
      .then(Roles => {
        if (Roles.length > 0) {
          const UserRoles = [_.groupBy(Roles, "Category")];

          this.setState({ AdminCategory: UserRoles[0].Admin ,
            Patient_ManagementCategory: UserRoles[0].PatientManagement,         
            Menus: UserRoles[0].Menus ,
            InventoryCategory:UserRoles[0].Inventory ,
            ConfigurationsCategory: UserRoles[0].Configurations });
        } else {
          swal("", Roles.message, "error");
        }
      })
      .catch(err => {
        swal("", err.message, "error");
      });
  };
  Resetsate() {
    const data = {
      Name: "",
      UserName: "",
      Email: "",
      Photo: "default.png",
      MobileNo: "",
      UserGroup: "",
      IsActive: false,
      isUpdate: false,
      IDNumber: "",
      DOB: "",
      Gender: "",
    };
    this.setState(data);
  }
  openModal() {
    this.setState({ open: true });
    this.Resetsate();
  }
  OpenRolesOpoup = K => {
    this.setState({
      RolesPoup: true,
      UserName: K.UserName,
      Roles: [],
      UserGroup: K.UserGroupName,
      AdminCategory: [],
      Menus: [],
      ReportsCategory: [],
      Patient_ManagementCategory:[],
      ConfigurationsCategory:[],
      InventoryCategory:[]
    });
    this.fetchRoles(K.UserName);
  };
  handleRolesOpoup = User => {
    this.setState({ Roles: [] });
    this.fetchRoles(User);
  };
  closeRolesPoup() {
    this.setState({ RolesPoup: false });
  }
  closeRolesPoup1 = () => {
    this.setState({ RolesPoup: false });
    swal("", "Roles Saved", "success");
  };
  closeModal() {
    this.setState({ open: false });
  }

  handleCheckBoxChange = (Role, e) => {
    const target = e.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    let CompanyID = localStorage.getItem("CompanyID");
    let BranchID = localStorage.getItem("BranchID");
    let data = {
      UserName: this.state.UserName,
      Role: Role.RoleID,
      Name: name,
      Status: value,
      CompanyID: CompanyID,
      BranchID: BranchID
    };
    this.UpdateUserRoles("/api/UserAccess", data);
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
            //swal("", "Record has been updated!", "success");
          } else {
            swal("", data.message, "error");
          }
        })
      )
      .catch(err => {
        swal("", err.message, "error");
      });
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
    if (actionMeta.name === "UserGroup") {
      this.setState({ UserGroupID: UserGroup.value });
      this.setState({ [actionMeta.name]: UserGroup.label });
    } else {
      this.setState({ [actionMeta.name]: UserGroup.value });
    }
  };
  fetchUserGroups = () => {
    fetch("/api/SecurityGroups/" + localStorage.getItem("CompanyID"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("xtoken")
      }
    })
      .then(res => res.json())
      .then(UserGroups => {
        if (UserGroups.length > 0) {
          this.setState({ UserGroups: UserGroups });
        } else {
          swal("", UserGroups.message, "error");
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
              this.fetchUsers();
              this.fetchUserGroups();
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
      Names: this.state.Name,
      UserName: this.state.UserName,
      Email: this.state.Email,
      MobileNo: this.state.MobileNo,
      Password: this.state.UserName,
      UserGroup: this.state.UserGroupID,

      Active: this.state.IsActive,
      IDNumber: this.state.IDNumber,
      DOB: this.state.DOB,
      Gender: this.state.Gender,
      Photo: this.state.Photo
    };

    if (this.state.isUpdate) {
      this.UpdateData("/api/users/" + this.state.UserName, data);
    } else {
      this.postData("/api/users", data);
    }
  };
  handleEdit = Users => {
    const data = {
      Name: Users.FullNames,
      UserName: Users.UserName,
      Email: Users.Email,
      MobileNo: Users.MobileNo,
      UserGroup: Users.UserGroupName,
      IsActive: !!+Users.Active,

      Photo: Users.Photo,

      UserGroupID: Users.UserGroupID,
      IDNumber: Users.IDNumber,
      DOB: dateFormat(new Date(Users.DOB).toLocaleDateString(), "isoDate"),
      Gender: Users.Gender,
      open: true,
      isUpdate: true
    };

    this.setState(data);

    // this.handleRolesOpoup(Users.UserName);
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
          "/api/users/" +
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
              this.fetchUsers();
            })
          )
          .catch(err => {
            swal("", err.message, "error");
          });
      }
    });
  };
  SendSMS(MobileNumber, Msg) {
    let data = {
      MobileNumber: MobileNumber,
      Message: Msg
    };
    return fetch("/api/sendsms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(response =>
        response.json().then(data => {
          if (data.success) {
          } else {
            swal("", data.message, "error");
          }
        })
      )
      .catch(err => {
        swal("", err.message, "error");
      });
  }
  SendMail = () => {
    const emaildata = {
      to: this.state.Email,
      Name: this.state.Name,
      subject: "ARCMS REGISTRATION",
      UserName: this.state.UserName,
      Password: this.state.UserName,
      ID: "New User"
    };

    fetch("/api/NotifyApprover", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("xtoken")
      },
      body: JSON.stringify(emaildata)
    })
      .then(response => response.json().then(data => {}))
      .catch(err => {
        //swal("Oops!", err.message, "error");
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
            this.fetchUsers();
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
            this.SendMail();
            swal("", "Record has been saved!", "success");
            //this.Resetsate();
            this.fetchUsers();
          } else {
            
              swal("", data.message, "error");
          
          }
        })
      )
      .catch(err => {
        swal("", err.message, "error");
      });
  }

  AsignAllRoles = e => {
    let user = this.state.UserName;
    fetch("/api/UserAccess/GiveAll/" + user, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("xtoken")
      }
    })
      .then(response =>
        response.json().then(data => {
          if (data.success) {
            this.setState({ AdminCategory: [] });
            this.setState({
              SystemparameteresCategory: []
            });
            this.setState({
              CaseManagementCategory: []
            });
            this.fetchRoles(this.state.UserName);
          } else {
            swal("", data.message, "error");
          }
        })
      )
      .catch(err => {
        swal("", err.message, "error");
      });
  };
  RemoveAllRoles = e => {
    let user = this.state.UserName;
    fetch("/api/UserAccess/Remove/" + user, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("xtoken")
      }
    })
      .then(response =>
        response.json().then(data => {
          if (data.success) {
            this.setState({ AdminCategory: [],
              Menus: [],
              ReportsCategory: [],
              Patient_ManagementCategory:[],
              ConfigurationsCategory:[],
              InventoryCategory:[]
            });
            this.fetchRoles(this.state.UserName);
          } else {
            swal("", data.message, "error");
          }
        })
      )
      .catch(err => {
        swal("", err.message, "error");
      });
  };
  render() {
    const ColumnData = [
      {
        label: "FullNames",
        field: "FullNames",
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
        label: "UserGroup",
        field: "UserGroup",
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
    let tablestyle = {
      width: "60%"
    };
    const Rows = [...this.state.Users];

    if (Rows.length > 0) {
      Rows.map((k, i) => {
        let Rowdata = {
          FullNames: k.FullNames,
          UserName: k.UserName,
          Email: k.Email,
          MobileNo: k.MobileNo,
          Active: k.Active,
          UserGroup: k.UserGroupName,
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
              {this.validaterole("System Users", "Edit") ? (
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
              {this.validaterole("System Users", "Remove") ? (
                <a
                  className="text-red"
                  style={{ color: "#f44542" }}
                  onClick={e => this.handleDelete(k.UserName, e)}
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
    const UserGroupsOptions = [...this.state.UserGroups].map((k, i) => {
      return {
        value: k.UserGroupID,
        label: k.Name
      };
    });
    let GenderCategories = [
      {
        value: "Male",
        label: "Male"
      },
      {
        value: "Female",
        label: "Female"
      }
    ];

    let handleCheckBoxChange = this.handleCheckBoxChange;
    let photostyle = {
      height: 150,
      width: 150
    };
    let Signstyle = {
      height: 100,
      width: 100
    };

    return (
      <div>
        <div className="row wrapper border-bottom white-bg page-heading">
          <div className="col-lg-12">
            <br />
            <div className="row">
              <div className="col-sm-8">
                <b>System Users</b>
              </div>
              <div className="col-sm-4">
                <span className="float-right">
                  {this.validaterole("System Users", "AddNew") ? (
                    <button
                      type="button"
                      onClick={this.openModal}
                      className="btn btn-primary fa fa-plus"
                    >
                      &nbsp;New
                    </button>
                  ) : null}
                  &nbsp;&nbsp;
                  {this.validaterole("System Users", "Export") ? (
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
            height="530px"
            effect="fadeInUp"
          >
            <div style={{ "overflow-y": "scroll", height: "530px" }}>
              <a className="close" onClick={() => this.closeModal()}>
                &times;
              </a>

              <div className="row">
                <div className="col-sm-5"></div>
                <div className="col-sm-4 fontWeight-bold text-blue">
                  System User{" "}
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
                              Full Names
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
                              UserName
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="UserName"
                              id="UserName"
                              required
                              onChange={this.handleInputChange}
                              value={this.state.UserName}
                              EnabledStatus
                            />
                          </div>
                        </div>
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
                              type="number"
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
                          <label for="UserName" className="fontWeight-bold">
                            ID Number{" "}
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="IDNumber"
                            id="IDNumber"
                            required
                            onChange={this.handleInputChange}
                            value={this.state.IDNumber}
                          />
                        </div>
                        <div class="col-sm-6">
                          <label for="UserName" className="fontWeight-bold">
                            DOB{" "}
                          </label>
                          <input
                            type="date"
                            name="DOB"
                            defaultValue={this.state.DOB}
                            required
                            className="form-control"
                            onChange={this.handleInputChange}
                            id="DOB"
                          />
                        </div>
                      </div>
                      <div className=" row">
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label
                              htmlFor="Datereceived"
                              className="fontWeight-bold"
                            >
                              Security Group
                            </label>
                            <Select
                              name="UserGroup"
                              value={UserGroupsOptions.filter(
                                option => option.label === this.state.UserGroup
                              )}
                              onChange={this.handleSelectChange}
                              options={UserGroupsOptions}
                              required
                            />
                          </div>
                        </div>

                        <div class="col-sm-4">
                          <label for="UserName" className="fontWeight-bold">
                            Gender{" "}
                          </label>
                          <Select
                            name="Gender"
                            value={GenderCategories.filter(
                              option => option.label === this.state.Gender
                            )}
                            onChange={this.handleSelectChange}
                            options={GenderCategories}
                            required
                          />
                        </div>
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
          <Modal
            visible={this.state.RolesPoup}
            width="70%"
            height="560px"
            effect="fadeInUp"
          >
            <div style={{ "overflow-y": "scroll", height: "560px" }}>
              <a className="close" onClick={this.closeRolesPoup}>
                &times;
              </a>
              <div className="row">
                <div className="col-sm-4"></div>
                <div className="col-sm-8 font-weight-bold">
                  User Roles-{" "}
                  <span className="text-blue">{this.state.UserName}</span>
                </div>
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
                    {this.state.AdminCategory.map((role, i) => {
                      return (
                        <tr style={{ marginLeft: "20px" }} id={i}>
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
                      
                    <h5 style={{ marginLeft: "10px" }} className="text-blue">
                      {" "}
                      Reports
                    </h5>
                    {this.state.ReportsCategory.map((role, i) => {
                      return (
                        <tr style={{ marginLeft: "20px" }} id={i}>
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
                    <div className="col-sm-10"></div>
                    <div className="col-sm-2">
                      <button
                        type="button"
                        className="btn btn-primary float-right"
                        onClick={this.closeRolesPoup1}
                      >
                        DONE
                      </button>
                    </div>
                    <div className="col-sm-8" />
                  </div>
                </div>
              </form>
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
export default Systemusers;
