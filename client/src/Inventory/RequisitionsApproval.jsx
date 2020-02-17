import React, { Component } from "react";
import swal from "sweetalert";
import Table from "./../SystemAdmin/Table";
import TableWrapper from "./../SystemAdmin/TableWrapper";
import Modal from "react-awesome-modal";
import Select from "react-select";
var _ = require("lodash");
class RequisitionsApproval extends Component {
  constructor() {
    super();
    this.state = {
      RequisitionsApproval: [],     
      privilages: [],
      Items:[],
      Suppliers:[],
      SupplierID:"",
      ReqID:""
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
   

    this.handleInputChange=this.handleInputChange.bind(this)
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


  openModal=(k)=> {
    this.setState({ ReqID:k.RequisitionID,open: true ,ReqNo:k.RequisitionID,Branch:k.Branch});
    this.fetchRequisitionsItems(k.RequisitionID);
  }
  fetchRequisitionsItems = (ID) => {
    this.setState({ Items: [] });
    fetch("/api/RequisitionsApproval/" + localStorage.getItem("CompanyID")+"/"+ID, {
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
 
 
  closeModal() {
    this.setState({ open: false });
  }


  

 
  fetchRequisitionsApproval = () => {
    this.setState({ RequisitionsApproval: [] });
    fetch("/api/RequisitionsApproval/" + localStorage.getItem("CompanyID"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("xtoken")
      }
    })
      .then(res => res.json())
      .then(RequisitionsApproval => {
        if (RequisitionsApproval.length > 0) {
          this.setState({ RequisitionsApproval: RequisitionsApproval });
        } else {
          swal("", RequisitionsApproval.message, "error");
        }
      })
      .catch(err => {
        swal("", err.message, "error");
      });
  };
  fetchSuppliers = () => {
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
              this.fetchRequisitionsApproval();
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


  
  submitforReview= event => {
    event.preventDefault();
    let ComapnyID = localStorage.getItem("CompanyID");
    let BranchID = localStorage.getItem("BranchID");
    const data = {
      
    };

      this.postData("/api/RequisitionsApproval/"+BranchID+"/"+ComapnyID, data);
    
  };


  handleSelectChange = (UserGroup, actionMeta) => {
            
      this.setState({ [actionMeta.name]: UserGroup.value });       
     
  };
  completeApproval=()=>{
    let ComapnyID = localStorage.getItem("CompanyID");
    let BranchID = localStorage.getItem("BranchID");  
    if(this.state.SupplierID){
    const data = {
      BranchID: BranchID,
      ComapnyID: ComapnyID,   
      RequisitionID: this.state.ReqID,
      SupplierID: this.state.SupplierID     
    }
   
    fetch("/api/RequisitionsApproval/ID/Complete", {
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
           
            swal("", "Item has been Ordered!", "success");
            this.setState({ open: false });
           this.fetchRequisitionsApproval();
          } else {
            
              swal("", data.message, "error");
          
          }
        })
      )
      .catch(err => {
        swal("", err.message, "error");
      });
    }else{
      swal("", "Select supplier to continue", "error");
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
           
            
          } else {
            
              swal("", data.message, "error");
          
          }
        })
      )
      .catch(err => {
        swal("", err.message, "error");
      });
  }
  
  handleInputChange = (k,event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;   
    let ComapnyID = localStorage.getItem("CompanyID");
    let BranchID = localStorage.getItem("BranchID");  
    const data = {
      BranchID: BranchID,
      ComapnyID: ComapnyID,   
      RequisitionID: k.RequisitionID,
      ID: k.ID,
      Quantity:value,
      Desc: target.name,
     
    }
    if(value){
      this.postData("/api/RequisitionsApproval", data);
    }
   
  };
  handleApproveItem= (k,e) => {
    e.preventDefault();
    let ComapnyID = localStorage.getItem("CompanyID");
    let BranchID = localStorage.getItem("BranchID");  
    const data = {
      BranchID: BranchID,
      ComapnyID: ComapnyID,   
      RequisitionID: k.RequisitionID,
      ID: k.ID,
     
    }
   
    fetch("/api/RequisitionsApproval/"+k.ID, {
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
           
            swal("", "Item has been Approved!", "success");
           
           this.fetchRequisitionsItems(this.state.ReqID);
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
        label: "RequisitionID",
        field: "RequisitionID",
        sort: "asc",
        width: 200
      },
      {
        label: "Branch",
        field: "Branch",
        sort: "asc",
        width: 200
      },
      {
        label: "Status",
        field: "Status",
        sort: "asc",
        width: 200
      }
     ,{
        label: "action",
        field: "action",
        sort: "asc",
        width: 200
      }
    ];
    let Rowdata1 = [];
   
    const Rows = [...this.state.RequisitionsApproval];

    if (Rows.length > 0) {
      Rows.map((k, i) => {
       
          let Rowdata = {
            RequisitionID:k.RequisitionID,
            Branch:k.Branch,
            Status: k.Status,            
            
            action: (
              <span>
               
                  <a
                    className="text-green"
                    onClick={e => this.openModal(k, e)}
                  >
                    Approve
                  </a>
               
              </span>
            )
          };
       
          Rowdata1.push(Rowdata);
        
      });
    }
   
    const ItemsOptions = [...this.state.Suppliers].map((k, i) => {
        return {
          value: k.ID,
          label: k.Name
        };
      }); 
      let handleInputChange = this.handleInputChange;
      let handleApproveItem=this.handleApproveItem;
    return (
      <div>
        <div className="row wrapper border-bottom white-bg page-heading">
          <div className="col-lg-12">
            <br />
            <div className="row">
              <div className="col-sm-8">
                <b>RequisitionsApproval</b>
              </div>
              <div className="col-sm-4">
                 
                <span className="float-right">
                
                </span>
              </div>
            </div>
          </div>

          <Modal
            visible={this.state.open}
            width="85%"
            height="500px"
            effect="fadeInUp"
          >
            <div style={{ "overflow-y": "scroll", height: "500px" }}>
              <a className="close" onClick={() => this.closeModal()}>
                &times;
              </a>
              <h3 className="text-green" style={{"text-align": "center"}}>PURCHASE REQUISITION APPROVE</h3>
              <hr/>
            
              <div className=" row">
             
              <div className="col-sm" style={{"margin-left": "20px"}}>
            <h3>Requisition No: {this.state.ReqNo}</h3>
            <h3>Branch: {this.state.Branch}</h3>
    
              </div>
                     <div className="col-sm" style={{"margin-right": "20px"}}>
                  
                       <div className="form-group">
                         <label
                           htmlFor="Datereceived"
                           className="fontWeight-bold"
                         >
                           Supplier
                         </label>
                         <Select
                               name="SupplierID"
                               
                               onChange={this.handleSelectChange}
                               options={ItemsOptions}
                               required
                             />
                       </div>
                     </div>
               
                   </div>
                 
<div>

  <div>
    <div>
    <form>
    <table className="table" style={{margin:"10px"}}>
                  <thead className="table-success">
         
            <th>Item Name</th>
            <th>RX</th>
            <th>Quantity</th>
            <th>Cost</th>
            <th>Taxrate(%)</th>
            <th>TaxAmount</th>
            <th>LineTotal</th>
            <th >Action</th>
         
        </thead>
        <tbody>
      
        {this.state.Items.map((k, i) => {
                      return (
                        <tr id={i}>
         
            <td >{k.ItemName}</td>
            <td >{"Spehere("+k.Spehere+") Cylinder("+k.Cylinder+")Axis ("+k.Axis+") Add("+k._Add+")"}</td>
            <td>
                            <input
                               type="number"
                               className="form-control no-border"
                               name="QTY"
                               id={i} 
                               defaultValue  ={k.Quantity}     
                               onChange={e => handleInputChange(k, e)}                     
                               
                            />
            </td>
            
            <td>
                            <input
                               type="number"
                               step="0.01" min="0" 
                              className="form-control no-border"
                              defaultValue={k.Cost}
                              name="Cost"
                              onChange={e => handleInputChange(k, e)} 
                             
                            />
            </td>
            <td>
                            <input
                               type="number"
                               step="0.01" min="0" 
                              className="form-control no-border"
                              defaultValue={k.Taxrate}
                              name="VAT"
                              onChange={e => handleInputChange(k, e)} 
                             
                            />
            </td>
            <td>
            {k.TaxAmount}
            </td>
            <td>
            {k.LineTotal}
            </td>
            {k.Status==="Approved"?
            <td>Approved</td>:
            <td><button className="btn btn-primary" onClick={e => handleApproveItem(k,e)} >Approve</button></td>
          }</tr>)})}
        
          
        </tbody>
        
      </table>
      </form>
    </div>
  </div>
</div>
<div className="row">
  <div className="col-sm" ></div>
  <div className="col-sm" ></div>
  <div className="col-sm" >
  <button className="btn btn-success float-right" style={{margin:"10px"}} onClick={this.completeApproval}>Complete Requisition</button>
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
export default RequisitionsApproval;
