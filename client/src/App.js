import React from "react";
import Login from "./SystemAdmin/Login";
import { Route, Switch, HashRouter } from "react-router-dom";

import SideBar from "./SystemAdmin/SideBar";
import Header from "./SystemAdmin/Header";
import Systemusers from "./SystemAdmin/Systemusers";
import UserGroups from "./SystemAdmin/UserGroups";
import Branches from "./SystemAdmin/Branches";
import Companies from "./SystemAdmin/Companies";
import BranchAccess from "./SystemAdmin/BranchAccess";
import Audittrails from "./SystemAdmin/Audittrails";
import Profile from "./SystemAdmin/Profile";
import Logout from "./SystemAdmin/Logout";


//SetIps

import PaymentModes from "./SetUps/PaymentModes"
import ItemCategories from "./SetUps/ItemCategories"
import Suppliers from "./SetUps/Suppliers"
import Items from "./SetUps/Items"

//Inventory
import Requisitions from "./Inventory/Requisitions"
import RequisitionsApproval from "./Inventory/RequisitionsApproval"

function App() {
  let token = localStorage.getItem("xtoken");
  if (token) {
    return (
      <div id="wrapper">
        <HashRouter>
          <SideBar />
          <Header>
            <Switch>
              <Route path="/" exact component={Systemusers} />
              <Route path="/Systemusers" exact component={Systemusers} />
              <Route path="/SecurityGroups" exact component={UserGroups} />
              <Route path="/Branches" exact component={Branches} />
              <Route path="/Companies" exact component={Companies} />
              <Route path="/BranchAccess" exact component={BranchAccess} />
              <Route path="/Audittrails" exact component={Audittrails} />
              <Route path="/Profile" exact component={Profile} />
             
              
              <Route path="/PaymentModes" exact component={PaymentModes} />
              <Route path="/ItemCategories" exact component={ItemCategories} />
              <Route path="/Suppliers" exact component={Suppliers} />
              <Route path="/Items" exact component={Items} />    
              <Route path="/Requisitions" exact component={Requisitions} />    
              <Route path="/RequisitionsApproval" exact component={RequisitionsApproval} />    
              <Route path="/Logout" exact component={Logout} />    
              
            </Switch>
          </Header>
        </HashRouter>
      </div>
    );
  } else {
    return (
      <div id="wrapper">
        <HashRouter>
          <Switch>
            <Route path="/" exact component={Login} />
            <Route path="/Logout" exact component={Logout} />   
          </Switch>
        </HashRouter>
      </div>
    );
  }
}

export default App;
