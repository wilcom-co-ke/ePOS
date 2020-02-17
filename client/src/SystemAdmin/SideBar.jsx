import React, { Component } from "react";
import { Link } from "react-router-dom";
class SideBar extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      redirect: true,
      showMenuAdmin: true,
      showMenuPatientmanagement: false,
      showMenuConfigurations:false,
      showMenuInventory:false,
      privilages: [],
      Logo: ""
    };
  }
  showMenu = (Module, event) => {
    event.preventDefault();
    if (Module === "System Administration") {
      this.setState({
        showMenuAdmin: !this.state.showMenuAdmin,
        showMenuConfigurations: false,
        showMenuInventory: false,
        showMenuPatientmanagement: false
      });
    } 
    else if (Module === "System Configurations") {
      this.setState({
        showMenuAdmin: false,
        showMenuPatientmanagement: false,
        showMenuInventory: false,
        showMenuConfigurations: !this.state.showMenuConfigurations
      });
    }
    else if (Module === "Inventory Management") {
      this.setState({
        showMenuInventory:!this.state.showMenuInventory,
        showMenuAdmin: false,
        showMenuPatientmanagement: false,
        showMenuConfigurations: false
      });
    }
    
  };
  fetchUserPrivilages() {
    fetch("/api/UserAccess", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("xtoken")
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          this.setState({ privilages: data });
        } else {
          localStorage.clear();
          return (window.location = "/#/Logout");
        }
      })
      .catch(err => {
        this.setState({ loading: false, redirect: true });
      });
    //end
  }
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
              this.fetchUserPrivilages();
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
  ViewFile = (k, e) => {
    let filepath =
      process.env.REACT_APP_BASE_URL + "/profilepics/ARCMS-UserGuide.pdf";
    window.open(filepath);
    //this.setState({ openFileViewer: true });
  };
  render() {
    let MenuStyle = {
      color: "#E7E7E7",
      cursor: "pointer",
      padding: "14px 20px 14px 25px",
      display: "block",
      fontWeight: 600,
      fontSize: 14
      // "font-family": `"Helvetica Neue", Helvetica, Arial, sans - serif`
    };
    return (
      <nav
        className="navbar-default navbar-static-side"
        role="navigation"
        style={{ backgroundColor: "#2f4050" }}
      >
        <div className="sidebar-collapse">
          <ul className="nav metismenu" id="side-menu">
            <li className="">
              <div className="dropdown profile-element">
                {/* <img
                                    src={
                                        process.env.REACT_APP_BASE_URL +
                                        "/profilepics/" +
                                        this.state.Logo
                                    }
                                    style={photostyle}
                                /> */}
              </div>
            </li>
            <DashBoards />
            <SystemAdmin
              validaterole={this.validaterole}
              showMenu={this.showMenu}
              showmenuvalue={this.state.showMenuAdmin}
              MenuStyle={MenuStyle}
            />
            <SetUpsmanagement
              validaterole={this.validaterole}
              showMenu={this.showMenu}
              showmenuvalue={this.state.showMenuConfigurations}
              MenuStyle={MenuStyle}
            />
            <Inventory
              validaterole={this.validaterole}
              showMenu={this.showMenu}
              showmenuvalue={this.state.showMenuInventory}
              MenuStyle={MenuStyle}
            />
            
          
          </ul>
        </div>
      </nav>
    );
  }
}

const SystemAdmin = props => {
  if (props.validaterole("System Administration", "View")) {
    return (
      <li>
        <li
          className=""
          onClick={e => props.showMenu("System Administration", e)}
          style={props.MenuStyle}
        >
          <i className="fa fa-cogs" />{" "}
          <span className="nav-label">System Administration</span>
        </li>
        {props.showmenuvalue ? (
          <ul className="nav nav-second-level">
            {props.validaterole("Companies", "View") ? (
              <li>
                <Link to="/Companies">
                  <i className="fa fa-user-plus " />
                  Company
                </Link>
              </li>
            ) : null}
            {props.validaterole("System Users", "View") ? (
              <li>
                <Link to="/Systemusers">
                  <i className="fa fa-user-plus " />
                  Users
                </Link>
              </li>
            ) : null}
            {props.validaterole("Branches", "View") ? (
              <li>
                <Link to="/Branches">
                  <i className="fa fa-user-plus " />
                  Branches
                </Link>
              </li>
            ) : null}
            {props.validaterole("Branch Access", "View") ? (
              <li>
                <Link to="/BranchAccess">
                  <i className="fa fa-user-plus " />
                  Branch Access
                </Link>
              </li>
            ) : null}
            {props.validaterole("Security Groups", "View") ? (
              <li>
                <Link to="/SecurityGroups">
                  <i className="fa fa-user-plus " />
                  Security Groups
                </Link>
              </li>
            ) : null}
            {props.validaterole("Audit Trails", "View") ? (
              <li>
                <Link to="/Audittrails">
                  <i className="fa fa-user-plus " />
                  Audit Trails
                </Link>
              </li>
            ) : null}
          </ul>
        ) : null}
      </li>
    );
  } else {
    return <div />;
  }
};

const SetUpsmanagement = props => {
  if (props.validaterole("Configurations", "View")) {
    return (
      <li>
        <li
          className=""
          onClick={e => props.showMenu("System Configurations", e)}
          style={props.MenuStyle}
        >
          <i className="fa fa-cogs" />{" "}
          <span className="nav-label">System Configurations</span>
        </li>
        {props.showmenuvalue ? (
          <ul className="nav nav-second-level">
           
                  {props.validaterole("Payment Modes", "View") ? (
              <li>
                <Link to="/PaymentModes">
                  <i className="fa fa-user-plus " />
                  Payment Modes
                </Link>
              </li>
            ) : null}
            {props.validaterole("Item categories", "View") ? (
              <li>
                <Link to="/ItemCategories">
                  <i className="fa fa-user-plus " />
                  Item Categories
                </Link>
              </li>
            ) : null}
            {props.validaterole("Suppliers", "View") ? (
              <li>
                <Link to="/Suppliers">
                  <i className="fa fa-user-plus " />
                  Suppliers
                </Link>
              </li>
            ) : null}
            {props.validaterole("Items", "View") ? (
              <li>
                <Link to="/Items">
                  <i className="fa fa-user-plus " />
                  Items
                </Link>
              </li>
            ) : null}
        
          </ul>
        ) : null}
      </li>
    );
  } else {
    return <div />;
  }
};
const Inventory = props => {
  if (props.validaterole("Inventory Management", "View")) {
    return (
      <li>
        <li
          className=""
          onClick={e => props.showMenu("Inventory Management", e)}
          style={props.MenuStyle}
        >
          <i className="fa fa-cogs" />{" "}
          <span className="nav-label">Inventory</span>
        </li>
        {props.showmenuvalue ? (
          <ul className="nav nav-second-level">
            {props.validaterole("Purchase Requisition", "View") ? (
              <li>
                <Link to="/Requisitions">
                  <i className="fa fa-user-plus " />
                  Purchase Requisition
                </Link>
              </li>
            ) : null}
                  {props.validaterole("Requisition Approval", "View") ? (
              <li>
                <Link to="/RequisitionsApproval">
                  <i className="fa fa-user-plus " />
                   Requisition Approval
                </Link>
              </li>
            ) : null}
        
          </ul>
        ) : null}
      </li>
    );
  } else {
    return <div />;
  }
};
const DashBoards = props => {
  return (
    <li className="">
      <Link to="/Home">
        <i className="fa fa-dashboard" />{" "}
        <span className="nav-label">DashBoard</span>
      </Link>
    </li>
  );
};

export default SideBar;
