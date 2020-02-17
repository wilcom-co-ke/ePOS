import React, { Component } from "react";
import swal from "sweetalert";
import Table from "./../SystemAdmin/Table";
import TableWrapper from "./../SystemAdmin/TableWrapper";
import Modal from "react-awesome-modal";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
var _ = require("lodash");
class Requisitions extends Component {
  constructor() {
    super();
    this.state = {
      Requisitions: [],     
      privilages: [],
      Items:[],
     
      Item:"",
      Description: "",
      Quantity: "",
      Sphere:null,
      Cylinder:null,
      Axis:null,
      Add:null,
      ID:"",    
      msg:"",
      open: false,   
      showrx:false,
      isUpdate: false
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.Resetsate = this.Resetsate.bind(this);   
    this.CheckValue=this.CheckValue.bind(this)
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
  validaterole = (RoleName, action) => {
     
    let array = [...this.state.privilages];
    

    let AuditTrailsObj = array.find(obj => obj.RoleName === RoleName);
    
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
      Description: "",
      Quantity: "",     
      Item: "",   
      isUpdate: false,    
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

CheckValue=(Value,desc)=>{
  
  if(Value.includes(".")){
    var last = Value.charAt(Value.length-1);
    var secondlast = Value.charAt(Value.length-2);
    if(secondlast =="."){
      
     if(last =="0" || last =="2" || last=="5" ||last=="7"){
      this.setState({ desc: Value,msg: "" });
     }else{
      this.setState({ msg: "Invalid value for "+desc });
     
     }
    }  else{
      if(last =="0" || last =="5")  {
        if(secondlast =="0" || secondlast =="2" ||secondlast =="5" ||secondlast =="7"){
         
          this.setState({ desc: Value ,msg: ""});
         }else{
          this.setState({ msg: "Invalid value for "+desc });
         }
       
       }else{
        this.setState({ msg: "Invalid value for "+desc });
       }
    }
 
  }else{
    this.setState({ desc: Value,msg: "" });
  }
  
}

  
  handleInputChange = event => {
    // event.preventDefault();
    // this.setState({ [event.target.name]: event.target.value });
    
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    if(name==="Add" || name==="Sphere" || name==="Cylinder"  ){
      this.CheckValue(value,name);
    }else{
      this.setState({ [name]: value });
    }
    
  };
 
  fetchRequisitions = () => {
    this.setState({ Requisitions: [] });
    fetch("/api/Requisitions/" + localStorage.getItem("CompanyID"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("xtoken")
      }
    })
      .then(res => res.json())
      .then(Requisitions => {
        if (Requisitions.length > 0) {
          this.setState({ Requisitions: Requisitions });
        } else {
          swal("", Requisitions.message, "error");
        }
      })
      .catch(err => {
        swal("", err.message, "error");
      });
  };
  fetchItems = () => {
    fetch("/api/Items/" + localStorage.getItem("CompanyID"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("xtoken")
      }
    })
      .then(res => res.json())
      .then(Items => {
        if (Items.length > 0) {
          this.setState({ Items: Items });
        } else {
          swal("", Items.message, "error");
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
              this.fetchRequisitions();
            this.fetchItems();
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
      Description: this.state.Description,
      Quantity: this.state.Quantity,     
      ItemID:this.state.Item,
      Sphere:this.state.Sphere,
      Cylinder:this.state.Cylinder,
      Axis:this.state.Axis,
      Add:this.state.Add
    };
    if(this.state.msg.includes("Invalid ")){
      swal("", "Invalid RX Values!", "error");
    }else{
      this.postData("/api/Requisitions", data);
    }
      
    
  };
  
  submitforReview= event => {
    event.preventDefault();
    let ComapnyID = localStorage.getItem("CompanyID");
    let BranchID = localStorage.getItem("BranchID");
    const data = {
      
    };

      this.postData("/api/Requisitions/"+BranchID+"/"+ComapnyID, data);
    
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
          "/api/Requisitions/" +
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
                this.fetchRequisitions();
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

  handleSelectChange = (UserGroup, actionMeta) => {
         
   
    
    let itemobject=this.state.Items.filter(
      option =>
        option.ItemID ===  UserGroup.value
    )
    if(itemobject[0].ItemCategory ===  "Progressive lens" || itemobject[0].ItemCategory ===  "Bifocal lens" || itemobject[0].ItemCategory ===  "Single Vision lens"){
      this.setState({showrx:true,msg:"", [actionMeta.name]: UserGroup.value });
    }else{
      this.setState({showrx:false,msg:"", [actionMeta.name]: UserGroup.value });
     
    }
 
    
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
          if (data.success) {
           
            swal("", "Record has been saved!", "success");
            //this.Resetsate();
            this.fetchRequisitions();
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
        label: "ItemName",
        field: "ItemName",
        sort: "asc",
        width: 200
      },
      {
        label: "Description",
        field: "Description",
        sort: "asc",
        width: 200
      }, {
        label: "RX",
        field: "RX",
        sort: "asc",
        width: 200
      },
      {
        label: "Quantity",
        field: "Quantity",
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
   
    const Rows = [...this.state.Requisitions];

    if (Rows.length > 0) {
      Rows.map((k, i) => {
        if(k.Spehere==null){
          let Rowdata = {
            ItemName: k.ItemName,
            Description: k.Description,
            Quantity: k.Quantity,
            RX:"-",
            Price: k.Price,
            Active: k.Active,
            Taxrate: k.Taxrate,
            Istaxable: k.Istaxable,
            
            action: (
              <span>
               
                  <a
                    className="text-red"
                    style={{ color: "#f44542" }}
                    onClick={e => this.handleDelete(k.RequestID, e)}
                  >
                    Delete
                  </a>
               
              </span>
            )
          };
       
          Rowdata1.push(Rowdata);
        }else{
        let Rowdata = {
          ItemName: k.ItemName,
          Description: k.Description,
          Quantity: k.Quantity,
          RX:"Spehere("+k.Spehere+") Cylinder("+k.Cylinder+")Axis ("+k.Axis+") Add("+k._Add+")",
          Price: k.Price,
          Active: k.Active,
          Taxrate: k.Taxrate,
          Istaxable: k.Istaxable,
          
          action: (
            <span>
             
                <a
                  className="text-red"
                  style={{ color: "#f44542" }}
                  onClick={e => this.handleDelete(k.RequestID, e)}
                >
                  Delete
                </a>
             
            </span>
          )
        };
     
        Rowdata1.push(Rowdata);
      }
      });
    }
   
 
    const ItemsOptions = [...this.state.Items].map((k, i) => {
        return {
          value: k.ItemID,
          label: k.ItemName
        };
      }); 

    return (
      <div>
        <div className="row wrapper border-bottom white-bg page-heading">
          <div className="col-lg-12">
            <br />
            <div className="row">
              <div className="col-sm-8">
                <b>Requisitions</b>
              </div>
              <div className="col-sm-4">
                 
                <span className="float-right">
                  
                  {this.validaterole("Purchase Requisition", "AddNew") ? (
                    <button
                      type="button"
                      onClick={this.openModal}
                      className="btn btn-primary fa fa-plus"
                    >
                      &nbsp;New
                    </button>
                  ) : null}
                  &nbsp;&nbsp;
                  {this.validaterole("Purchase Requisition", "Export") ? (
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
            height="400px"
            effect="fadeInUp"
          >
            <div style={{ "overflow-y": "scroll", height: "400px" }}>
              <a className="close" onClick={() => this.closeModal()}>
                &times;
              </a>
<ToastContainer/>
              <div className="row">
                <div className="col-sm-5"></div>
                <div className="col-sm-4 fontWeight-bold text-blue">
                Requisitions
                </div>
              </div>
              <div className="container-fluid">
                <div className="col-sm-12">
                  <div className="ibox-content">
                    <form
                      className="form-horizontal"
                      onSubmit={this.handleSubmit}
                    >
                      <p className="text-red">{this.state.msg}</p>
                      <div className=" row">
                     
                        <div className="col-sm">
                     
                          <div className="form-group">
                            <label
                              htmlFor="Datereceived"
                              className="fontWeight-bold"
                            >
                              Item
                            </label>
                            <Select
                                  name="Item"
                                  value={ItemsOptions.filter(
                                    option =>
                                      option.value === this.state.Item
                                  )}
                                  onChange={this.handleSelectChange}
                                  options={ItemsOptions}
                                  required
                                />
                          </div>
                        </div>
                  
                      </div>
                      {this.state.showrx ?
                      <div className=" row">
                        <div className="col-sm">
                        <div className=" row">
                        <div className=" col-sm">
                          <div className="form-group">
                            <label
                              htmlFor="Datereceived"
                              className="fontWeight-bold"
                            >
                              Sphere
                            </label>
                            <input
                              type="number"
                              step="0.01" min="-10" max="10"
                              className="form-control"
                              name="Sphere"
                              id="Sphere"
                              required
                              onChange={this.handleInputChange}
                              value={this.state.Sphere}
                            />
                           
                          </div>
                          </div> 
                          <div className=" col-sm">
                            <div className="form-group">
                            <label
                              htmlFor="Cylinder"
                              className="fontWeight-bold"
                            >
                              Cylinder
                            </label>
                            <input
                              type="number"
                              step="0.01" min="-10" max="10"
                              className="form-control"
                              name="Cylinder"
                              id="Cylinder"
                              required
                              onChange={this.handleInputChange}
                              value={this.state.Cylinder}
                            />
                          </div>
                        </div>
                        </div>
                        </div>
                        <div className="col-sm">
                        <div className=" row">
                        <div className=" col-sm">
                          <div className="form-group">
                            <label
                              htmlFor="Datereceived"
                              className="fontWeight-bold"
                            >
                              Axis
                            </label>
                            <input
                               type="number"
                               max="180"
                              className="form-control"
                              name="Axis"
                              id="Axis"
                              required
                              onChange={this.handleInputChange}
                              value={this.state.Axis}
                            />
                          </div>
                          </div> 
                          <div className=" col-sm">
                            <div className="form-group">
                            <label
                              htmlFor="Datereceived"
                              className="fontWeight-bold"
                            >
                              Add
                            </label>
                            <input
                               type="number"
                               step="0.01" min="-10" max="10"
                              className="form-control"
                              name="Add"
                              id="Add"
                              required
                              onChange={this.handleInputChange}
                              value={this.state.Add}
                            />
                            
                          </div>
                        </div>
                        </div>
                        
                        </div>
                      </div>:null}
                      <div className=" row">
                        
                        <div className=" col-sm">
                          <div className="form-group">
                            <label
                              htmlFor="Datereceived"
                              className="fontWeight-bold"
                            >
                              Quantity
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              name="Quantity"
                              id="Quantity"
                              required
                              min="1"
                              onChange={this.handleInputChange}
                              value={this.state.Quantity}
                            />
                          </div>
                          </div> 
                          <div className=" col-sm">
                            <div className="form-group">
                            <label
                              htmlFor="Cylinder"
                              className="fontWeight-bold"
                            >
                              Description
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="Description"
                              id="Description"
                              required
                              onChange={this.handleInputChange}
                              value={this.state.Description}
                            />
                          </div>
                        </div>
                       
                         </div>
                      <div className=" row">
                       <div className=" col-sm">
                          <div className="form-group">
                         
                          </div>
                        </div>
                        <div className=" col-sm"></div>
                        <div className=" col-sm">

                          <div className="form-group">
                          <br/>
                          <button
                            className="btn btn-primary "
                            type="submit"
                          >
                            Add 
                          </button>
                          &nbsp;
                          <button
                            className="btn btn-success float-right"
                            type="button"
                            onClick={this.submitforReview}
                          >
                            Submit for approval
                          </button>
                          </div>
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
export default Requisitions;
