import React, { Component } from "react";
import swal from "sweetalert";
import Table from "./Table";
import TableWrapper from "./TableWrapper";
import Modal from "react-awesome-modal";
import { Progress } from "reactstrap";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
var dateFormat = require("dateformat");
var _ = require("lodash");
class Companies extends Component {
  constructor() {
    super();
    this.state = {
      Companies: [],
      privilages: [],
      Name: "",
      Email: "",
      Mobile: "",
      Telephone: "",
      Website: "",
      PostalAddress: "",
      PostalCode: "",
      Town: "",
      RegistrationDate: "",
      Pin: "",
      ID: "",
      Logo: "",
      open: false,
      isUpdate: false,
      selectedFile: null
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.Resetsate = this.Resetsate.bind(this);
  }
  maxSelectFile = event => {
    let files = event.target.files; // create file object
    if (files.length > 1) {
      const msg = "Only One image can be uploaded at a time";
      event.target.value = null; // discard selected file
      toast.warn(msg);
      return false;
    }
    return true;
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
      return false;
    }
    return true;
  };
  checkFileSize = event => {
    let files = event.target.files;
    let size = 2000000;
    let err = [];
    for (var x = 0; x < files.length; x++) {
      if (files[x].size > size) {
        err[x] = files[x].type + "is too large, please pick a smaller file\n";
      }
    }
    for (var z = 0; z < err.length; z++) {
      toast.error(err[z]);
      event.target.value = null;
    }
    return true;
  };
  onClickHandler = () => {
    if (this.state.selectedFile) {
      const data = new FormData();
      // var headers = {
      //   "Content-Type": "multipart/form-data",
      //   "x-access-token": localStorage.getItem("xtoken")
      // };

      //for single files
      //data.append("file", this.state.selectedFile);
      //for multiple files
      for (var x = 0; x < this.state.selectedFile.length; x++) {
        data.append("file", this.state.selectedFile[x]);
      }
      axios
        .post("/api/Uploads/CompanyLogo", data, {
          // receive two parameter endpoint url ,form data
          onUploadProgress: ProgressEvent => {
            this.setState({
              loaded: (ProgressEvent.loaded / ProgressEvent.total) * 100
            });
          }
        })
        .then(res => {
          this.setState({
            Logo: res.data
          });
          // localStorage.setItem("UserPhoto", res.data);
          toast.success("upload success");
        })
        .catch(err => {
          toast.error("upload fail");
        });
    } else {
      toast.warn("Please select a photo to upload");
    }
  };
  onChangeHandler = event => {
    //for multiple files
    var files = event.target.files;
    if (
      this.maxSelectFile(event) &&
      this.checkFileSize(event) &&
      this.checkMimeType(event)
    ) {
      this.setState({
        selectedFile: files,
        loaded: 0
      });

      //for single file
      // this.setState({
      //   selectedFile: event.target.files[0],
      //   loaded: 0
      // });
    }
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
      Email: "",
      Mobile: "",
      Telephone: "",
      Website: "",
      PostalAddress: "",
      PostalCode: "",
      Town: "",
      RegistrationDate: "",
      Pin: "",
      Logo: "",
      ID: "",
      isUpdate: false
    };
    this.setState(data);
  }

  fetchCompanies = () => {
    fetch("/api/Companies", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("xtoken")
      }
    })
      .then(res => res.json())
      .then(Companies => {
        if (Companies.length > 0) {
          this.setState({ Companies: Companies });
        } else {
          //swal("", "Companies.message", "error");
          swal("", Companies.message, "error");
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
              this.fetchCompanies();
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

    const data = {
      Name: this.state.Name,
      Email: this.state.Email,
      Mobile: this.state.Mobile,
      Telephone: this.state.Telephone,
      Website: this.state.Website,
      PostalAddress: this.state.PostalAddress,
      PostalCode: this.state.PostalCode,
      Town: this.state.Town,
      RegistrationDate: this.state.RegistrationDate,
      Pin: this.state.Pin,
      Logo: this.state.Logo
    };

    if (this.state.isUpdate) {
      this.UpdateData("/api/Companies/" + this.state.ID, data);
    } else {
      this.postData("/api/Companies", data);
    }
  };
  handleEdit = k => {
    const data = {
      Name: k.Name,
      Email: k.Email,
      Mobile: k.Mobile,
      Telephone: k.Telephone,
      Website: k.Website,
      PostalAddress: k.PostalAddress,
      PostalCode: k.PostalCode,
      Town: k.Town,
      RegistrationDate: dateFormat(
        new Date(k.RegistrationDate).toLocaleDateString(),
        "isoDate"
      ),
      Pin: k.PIN,
      ID: k.id_company,
      Logo: k.Logo,
      open: true,
      isUpdate: true
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
        return fetch("/api/Companies/" + k, {
          method: "Delete",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": localStorage.getItem("xtoken")
          }
        })
          .then(response =>
            response.json().then(data => {
              if (data.success) {
                swal("", "Record has been deleted!", "success");
                this.Resetsate();
              } else {
                swal("", data.message, "error");
              }
              this.fetchCompanies();
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
          this.fetchCompanies();

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
          this.fetchCompanies();

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
        label: "ID",
        field: "id_company",
        sort: "asc",
        width: 200
      },
      {
        label: "Name",
        field: "Name",
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
        label: "Website",
        field: "Website",
        sort: "asc",
        width: 200
      },
      {
        label: "Mobile",
        field: "Mobile",
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
        label: "PostalAddress",
        field: "PostalAddress",
        sort: "asc",
        width: 200
      },
      {
        label: "PostalCode",
        field: "PostalCode",
        sort: "asc",
        width: 200
      },
      {
        label: "Town",
        field: "Town",
        sort: "asc",
        width: 200
      },
      {
        label: "PostalCode",
        field: "PostalCode",
        sort: "asc",
        width: 200
      },
      {
        label: "RegistrationDate",
        field: "RegistrationDate",
        sort: "asc",
        width: 200
      },
      {
        label: "PIN",
        field: "PIN",
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

    const rows = [...this.state.Companies];

    if (rows.length > 0) {
      rows.forEach(k => {
        const Rowdata = {
          id_company: k.id_company,
          Name: k.Name,
          Email: k.Email,
          Website: k.Website,
          Mobile: k.Mobile,
          Telephone: k.Telephone,
          PostalAddress: k.PostalAddress,
          PostalCode: k.PostalCode,
          Town: k.Town,
          RegistrationDate: k.RegistrationDate,
          PIN: k.PIN,
          action: (
            <span>
              {this.validaterole("Companies", "Edit") ? (
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
              {this.validaterole("Companies", "Remove") ? (
                <a
                  className="fa fa-trash"
                  style={{ color: "#f44542" }}
                  onClick={e => this.handleDelete(k.id_company, e)}
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
    let Signstyle = {
      height: 100,
      width: 100
    };
    return (
      <div>
        <div>
          <div className="row wrapper border-bottom white-bg page-heading">
            <div className="col-lg-12">
              <br />
              <div className="row">
                <div className="col-sm-9">
                  <h2>Companies</h2>
                </div>
                <div className="col-sm-3">
                  <span className="float-right">
                    {this.validaterole("Companies", "AddNew") ? (
                      <button
                        type="button"
                        onClick={this.openModal}
                        className="btn btn-primary  fa fa-plus"
                      >
                        New
                      </button>
                    ) : null}
                    &nbsp;
                    {this.validaterole("Companies", "Export") ? (
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
              height="700px"
              effect="fadeInUp"
            >
              <div style={{ "overflow-y": "scroll", height: "700px" }}>
                <a className="close text-red" onClick={this.closeModal}>
                  &times;
                </a>
                <ToastContainer />
                <div className="row">
                  <div className="col-sm-5"></div>
                  <div className="col-sm-4 font-weight-bold">
                    <span className="text-blue">Companies</span>{" "}
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
                            <div className="col-sm">
                              <div className="form-group">
                                <label
                                  htmlFor="exampleInputEmail1"
                                  className="font-weight-bold"
                                >
                                  Email
                                </label>
                                <input
                                  type="email"
                                  name="Email"
                                  required
                                  onChange={this.handleInputChange}
                                  value={this.state.Email}
                                  className="form-control"
                                />
                              </div>
                            </div>
                          </div>
                          <div className=" row">
                            <div className="col-sm">
                              <div className="form-group">
                                <label
                                  htmlFor="exampleInputEmail1"
                                  className="font-weight-bold"
                                >
                                  Mobile
                                </label>
                                <input
                                  type="text"
                                  name="Mobile"
                                  required
                                  onChange={this.handleInputChange}
                                  value={this.state.Mobile}
                                  className="form-control"
                                />
                              </div>
                            </div>
                            <div className="col-sm">
                              <div className="form-group">
                                <label
                                  htmlFor="exampleInputEmail1"
                                  className="font-weight-bold"
                                >
                                  Telephone
                                </label>
                                <input
                                  type="text"
                                  name="Telephone"
                                  required
                                  onChange={this.handleInputChange}
                                  value={this.state.Telephone}
                                  className="form-control"
                                />
                              </div>
                            </div>
                          </div>
                          <div className=" row">
                            <div className="col-sm">
                              <div className="form-group">
                                <label
                                  htmlFor="exampleInputEmail1"
                                  className="font-weight-bold"
                                >
                                  Website
                                </label>
                                <input
                                  type="text"
                                  name="Website"
                                  required
                                  onChange={this.handleInputChange}
                                  value={this.state.Website}
                                  className="form-control"
                                />
                              </div>
                            </div>

                            <div className="col-sm">
                              <div className="form-group">
                                <label
                                  htmlFor="exampleInputEmail1"
                                  className="font-weight-bold"
                                >
                                  PostalAddress
                                </label>
                                <input
                                  type="text"
                                  name="PostalAddress"
                                  className="form-control"
                                  required
                                  onChange={this.handleInputChange}
                                  value={this.state.PostalAddress}
                                />
                              </div>
                            </div>
                          </div>
                          <div className=" row">
                            <div className="col-sm">
                              <div className="form-group">
                                <label
                                  htmlFor="exampleInputEmail1"
                                  className="font-weight-bold"
                                >
                                  PostalCode
                                </label>
                                <input
                                  type="text"
                                  name="PostalCode"
                                  className="form-control"
                                  required
                                  onChange={this.handleInputChange}
                                  value={this.state.PostalCode}
                                />
                              </div>
                            </div>
                            <div className="col-sm">
                              <div className="form-group">
                                <label
                                  htmlFor="exampleInputEmail1"
                                  className="font-weight-bold"
                                >
                                  Town
                                </label>
                                <input
                                  className="form-control"
                                  type="text"
                                  name="Town"
                                  required
                                  onChange={this.handleInputChange}
                                  value={this.state.Town}
                                />
                              </div>
                            </div>
                          </div>

                          <div className=" row">
                            <div className="col-sm">
                              <div className="form-group">
                                <label
                                  htmlFor="exampleInputEmail1"
                                  className="font-weight-bold"
                                >
                                  RegistrationDate
                                </label>
                                <input
                                  type="date"
                                  name="RegistrationDate"
                                  required
                                  onChange={this.handleInputChange}
                                  value={this.state.RegistrationDate}
                                  className="form-control"
                                />
                              </div>
                            </div>
                            <div className="col-sm">
                              <div className="form-group">
                                <label
                                  htmlFor="exampleInputEmail1"
                                  className="font-weight-bold"
                                >
                                  Pin
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="Pin"
                                  required
                                  onChange={this.handleInputChange}
                                  value={this.state.Pin}
                                />
                              </div>
                            </div>
                          </div>
                          <div className=" row">
                            <div className="col-sm">
                              <div className="form-group">
                                <label
                                  className="font-weight-bold"
                                  for="inputState"
                                >
                                  Logo
                                </label>

                                <input
                                  type="file"
                                  className="form-control"
                                  name="file"
                                  onChange={this.onChangeHandler}
                                />
                                <div class="form-group">
                                  <Progress
                                    max="100"
                                    color="success"
                                    value={this.state.loaded}
                                  >
                                    {Math.round(this.state.loaded, 2)}%
                                  </Progress>
                                </div>
                                <button
                                  type="button"
                                  class="btn btn-success "
                                  onClick={this.onClickHandler}
                                >
                                  Upload
                                </button>
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
                                    this.state.Logo
                                  }
                                  style={Signstyle}
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

export default Companies;
