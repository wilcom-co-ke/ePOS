import React, { Component } from "react";
import swal from "sweetalert";
import Table from "./Table";
import TableWrapper from "./TableWrapper";

class Audittrails extends Component {
  constructor() {
    super();
    this.state = {
      Audittrails: [],
      Users: [],
      Branches: [],
      privilages: [],
      UserName: "",
      Description: "",
      BranchID: "",
      open: false,
      isUpdate: false
    };
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

  fetchAudittrails = () => {
    fetch("/api/Audittrails/" + localStorage.getItem("CompanyID"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("xtoken")
      }
    })
      .then(res => res.json())
      .then(Audittrails => {
        if (Audittrails.length > 0) {
          this.setState({ Audittrails: Audittrails });
        } else {
          //swal("", "Audittrails.message", "error");
          swal("", Audittrails.message, "error");
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
              this.fetchAudittrails();
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

  render() {
    const ColumnData = [
      {
        label: "ID",
        field: "ID",
        sort: "asc",
        width: 200
      },
      {
        label: "Date",
        field: "Date",
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
        label: "Description",
        field: "Description",
        sort: "asc",
        width: 200
      },
      {
        label: "Category",
        field: "Category",
        sort: "asc",
        width: 200
      },
      {
        label: "Branch",
        field: "BranchName",
        sort: "asc",
        width: 200
      }
    ];
    let Rowdata1 = [];

    const rows = [...this.state.Audittrails];

    if (rows.length > 0) {
      rows.forEach(k => {
        const Rowdata = {
          ID: k.ID,
          Date: k.Date,
          UserName: k.UserName,
          Description: k.Description,
          Category: k.Category,
          BranchName: k.BranchName
        };
        Rowdata1.push(Rowdata);
      });
    }

    return (
      <div>
        <div>
          <div className="row wrapper border-bottom white-bg page-heading">
            <div className="col-lg-12">
              <br />
              <div className="row">
                <div className="col-sm-9">
                  <h2>Audit Trails</h2>
                </div>
                <div className="col-sm-3">
                  <span className="float-right">
                    &nbsp;
                    {this.validaterole("Audit Trails", "Export") ? (
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
          </div>
        </div>

        <TableWrapper>
          <Table Rows={Rowdata1} columns={ColumnData} />
        </TableWrapper>
      </div>
    );
  }
}

export default Audittrails;
