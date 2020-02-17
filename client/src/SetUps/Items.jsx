import React, { Component } from "react";
import swal from "sweetalert";
import Table from "./../SystemAdmin/Table";
import TableWrapper from "./../SystemAdmin/TableWrapper";
import Modal from "react-awesome-modal";
import Select from "react-select";
import { Progress } from "reactstrap";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
var _ = require("lodash");
class Items extends Component {
  constructor() {
    super();
    this.state = {
      Items: [],     
      privilages: [],
      ItemCategories:[],
      ItemName: "",
      ItemCategory:"",
      Description: "",
      Cost: "",
      Price: "",
      Photo: "default.png",
      Taxrate: "",
      Istaxable: false,
      ID:"",
      Logo: "",
      open: false,    
      IsActive: false,
      isUpdate: false,    
      selectedFile: null,
      fileName: "" 
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
      ItemName: "",
      Description: "",
      Cost: "",
      Logo: "default.png",
      Price: "",    
      IsActive: false,
      isUpdate: false,
      Taxrate: "",
      Istaxable: false
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



  
  handleInputChange = event => {
    // event.preventDefault();
    // this.setState({ [event.target.name]: event.target.value });
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({ [name]: value });
  };
 
  fetchItems = () => {
    this.setState({ Items: [] });
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
  fetchItemCategoriess = () => {
    fetch("/api/ItemCategories/" + localStorage.getItem("CompanyID"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("xtoken")
      }
    })
      .then(res => res.json())
      .then(ItemCategories => {
        if (ItemCategories.length > 0) {
          this.setState({ ItemCategories: ItemCategories });
        } else {
          swal("", ItemCategories.message, "error");
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
              this.fetchItems();
            this.fetchItemCategoriess();
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
    }
    return true;
  };


  onChangeHandler = event => {
    //for multiple files
    var files = event.target.files;
    if (
    
      this.checkMimeType(event)
    ) {
      this.setState({
      
        loaded: 0
      });

      const data = new FormData();
      
      for (var x = 0; x < files.length; x++) {
        data.append("file", files[x]);
      }
      axios
        .post("/api/Uploads/Items", data, {
          // receive two parameter endpoint url ,form data
          onUploadProgress: ProgressEvent => {
            this.setState({
              loaded: (ProgressEvent.loaded / ProgressEvent.total) * 100
            });
          }
        })
        .then(res => {
          this.setState({
            Photo: res.data
          });
         
          toast.success("upload success");         
        })
        .catch(err => {
          toast.error("upload fail");
        });
    }
  };
  handleSubmit = event => {
    event.preventDefault();
    let ComapnyID = localStorage.getItem("CompanyID");
    let BranchID = localStorage.getItem("BranchID");
    const data = {
      BranchID: BranchID,
      ComapnyID: ComapnyID,
      ItemName: this.state.ItemName,
      Description: this.state.Description,
      Cost: this.state.Cost,
      Price: this.state.Price,     
      Logo: this.state.Photo,
      Active: this.state.IsActive,
      Taxrate: this.state.Taxrate,
      Istaxable: this.state.Istaxable,
      ItemCategory:this.state.ItemCategory,
    };

    if (this.state.isUpdate) {
      this.UpdateData("/api/Items/" + this.state.ID, data);
    } else {
      this.postData("/api/Items", data);
    }
  };
  handleEdit = Items => {
    const data = {
      ItemName: Items.ItemName,
      Description: Items.Description,
      Cost: Items.Cost,
      Price: Items.Price,
      Taxrate: Items.Taxrate,
      IsActive: !!+Items.Active,
      ItemCategory:Items.ItemCategoryID,
      Photo: Items.Logo,
      ID: Items.ItemID,
      Istaxable: !!+Items.Istaxable, 
      open: true,
      isUpdate: true
    };

    this.setState(data);

    // this.handleRolesOpoup(Items.Description);
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
          "/api/Items/" +
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
                this.fetchItems();
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
            this.fetchItems();
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
          if (data.success) {
           
            swal("", "Record has been saved!", "success");
            //this.Resetsate();
            this.fetchItems();
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
      },
      {
        label: "Cost",
        field: "Cost",
        sort: "asc",
        width: 200
      },
      {
        label: "Price",
        field: "Price",
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
        label: "Taxrate",
        field: "Taxrate",
        sort: "asc",
        width: 200
      },

      {
        label: "Istaxable",
        field: "Istaxable",
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
   
    const Rows = [...this.state.Items];

    if (Rows.length > 0) {
      Rows.map((k, i) => {
        let Rowdata = {
          ItemName: k.ItemName,
          Description: k.Description,
          Cost: k.Cost,
          Price: k.Price,
          Active: k.Active,
          Taxrate: k.Taxrate,
          Istaxable: k.Istaxable,
          
          action: (
            <span>
             
              &nbsp;
              {this.validaterole("Items", "Edit") ? (
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
              {this.validaterole("Items", "Remove") ? (
                <a
                  className="text-red"
                  style={{ color: "#f44542" }}
                  onClick={e => this.handleDelete(k.ItemID, e)}
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
   
    let photostyle = {
      height: 150,
      width: 150
    };
    const ItemCategoriesOptions = [...this.state.ItemCategories].map((k, i) => {
        return {
          value: k.ID,
          label: k.Description
        };
      }); 

    return (
      <div>
        <div className="row wrapper border-bottom white-bg page-heading">
          <div className="col-lg-12">
            <br />
            <div className="row">
              <div className="col-sm-8">
                <b>Items</b>
              </div>
              <div className="col-sm-4">
                 
                <span className="float-right">
                  
                  {this.validaterole("Items", "AddNew") ? (
                    <button
                      type="button"
                      onClick={this.openModal}
                      className="btn btn-primary fa fa-plus"
                    >
                      &nbsp;New
                    </button>
                  ) : null}
                  &nbsp;&nbsp;
                  {this.validaterole("Items", "Export") ? (
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
                Items
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
                              Item Name
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="ItemName"
                              id="ItemName"
                              required
                              onChange={this.handleInputChange}
                              value={this.state.ItemName}
                            />
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor="Datereceived"
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
                              EnabledStatus
                            />
                          </div>
                        </div>
                        <div className="col-sm">
                            <div className="row">
                            <div className="col-sm">
                            <div className="form-group">
                            <img
                              alt=""
                              className=""
                              src={
                                process.env.REACT_APP_BASE_URL +
                                "/Items/" +
                                this.state.Photo
                              }
                              style={photostyle}
                            />
                          </div>
                            </div>
                            <div className="col-sm">
                            <div className="form-group">
                      <div className="form-group files">
                        <label className="font-weight-bold">
                          Upload 
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          name="file"
                          onChange={this.onChangeHandler}
                          
                        />
                      </div>
                      <div class="form-group">
                        <Progress
                          max="100"
                          color="success"
                          value={this.state.loaded}
                        >
                          {Math.round(this.state.loaded, 2)}%
                        </Progress>
                      </div>
                    </div>
                            </div>
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
                              ItemCategory
                            </label>
                            <Select
                                  name="ItemCategory"
                                  value={ItemCategoriesOptions.filter(
                                    option =>
                                      option.value === this.state.ItemCategory
                                  )}
                                  onChange={this.handleSelectChange}
                                  options={ItemCategoriesOptions}
                                  required
                                />
                          </div>
                        </div>
                        <div className="col-sm">
                        <div className=" row">
                        <div className=" col-sm">
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
                          <div className=" col-sm">
                          <div className="form-group">
                            <br />
                            <br />
                            <input
                              className="checkbox"
                              id="IsActive"
                              type="checkbox"
                              name="Istaxable"
                              checked={this.state.Istaxable}
                              // defaultChecked={this.state.IsActive}
                              onChange={this.handleInputChange}
                            />{" "}
                            <label htmlFor="Istaxable" className="fontWeight-bold">
                            Istaxable
                            </label>
                          </div>
                        </div>
                      
                        </div>
                        </div>
                      </div>
                      <div className=" row">
                        <div className="col-sm">
                        <div className=" row">
                        <div className=" col-sm">
                          <div className="form-group">
                            <label
                              htmlFor="Datereceived"
                              className="fontWeight-bold"
                            >
                              Cost
                            </label>
                            <input
                              type="Cost"
                              className="form-control"
                              name="Cost"
                              id="Cost"
                              required
                              onChange={this.handleInputChange}
                              value={this.state.Cost}
                            />
                          </div>
                          </div> 
                          <div className=" col-sm">
                            <div className="form-group">
                            <label
                              htmlFor="Datereceived"
                              className="fontWeight-bold"
                            >
                              Price
                            </label>
                            <input
                              type="Price"
                              className="form-control"
                              name="Price"
                              id="Price"
                              required
                              onChange={this.handleInputChange}
                              value={this.state.Price}
                            />
                          </div>
                        </div>
                        </div>
                        </div>
                        <div className="col-sm">
                        <div className=" row">
                       <div className=" col-sm">
                          <div className="form-group">
                          <label for="Description" className="fontWeight-bold">
                          Taxrate
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="Taxrate"
                            id="Taxrate"
                            required
                            onChange={this.handleInputChange}
                            value={this.state.Taxrate}
                          />
                          </div>
                        </div>
                        <div className=" col-sm">
                          <div className="form-group">
                          <br/>
                          <button
                            className="btn btn-primary float-right"
                            type="submit"
                          >
                            Save
                          </button>
                          </div>
                        </div>
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
export default Items;
