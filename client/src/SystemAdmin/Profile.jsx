import React, { Component } from "react";
import axios from "axios";
import { Progress } from "reactstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import swal from "sweetalert";
import { Link } from "react-router-dom";
let userphoto1 = localStorage.getItem("UserPhoto");
let userdateils = localStorage.getItem("UserData");
let data = JSON.parse(userdateils);

class Profile extends Component {
  constructor() {
    super();
    this.state = {
      UserGroup: data.UserGroupID,
      Name: data.FullNames,
      Username: data.UserName,
      Email: data.Email,
      Phone: data.MobileNo,
      userphoto: userphoto1,
      selectedFile: null,
      fileName: ""
    };
  }

  handleInputChange = event => {
    event.preventDefault();
    this.setState({ [event.target.name]: event.target.value });
  };

  maxSelectFile = event => {
    let files = event.target.files; // create file object
    if (files.length > 1) {
      const msg = "Only 1 image can be uploaded at a time";
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
      //   "x-access-token": localStorage.getItem("token")
      // };

      //for single files
      //data.append("file", this.state.selectedFile);
      //for multiple files
      for (var x = 0; x < this.state.selectedFile.length; x++) {
        data.append("file", this.state.selectedFile[x]);
      }
      axios
        .post("/api/Uploads/Profile", data, {
          // receive two parameter endpoint url ,form data
          onUploadProgress: ProgressEvent => {
            this.setState({
              loaded: (ProgressEvent.loaded / ProgressEvent.total) * 100
            });
          }
        })
        .then(res => {
          this.setState({
            userphoto: res.data
          });
          localStorage.setItem("UserPhoto", res.data);
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

  handleSubmit = event => {
    event.preventDefault();
    let CompanyID = localStorage.getItem("CompanyID");
    let BranchID = localStorage.getItem("BranchID");
    const data = {
      Name: this.state.Name,
      Username: this.state.Username,
      Email: this.state.Email,
      Phone: this.state.Phone,
      Photo: this.state.userphoto,
      CompanyID: CompanyID,
      BranchID: BranchID
    };

    this.UpdateData("/api/UpdateProfile", data);
  };
 
  UpdateData(url = ``, data = {}) {
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
            swal("", "Profile has been updated!", "success");
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
    let photostyle = {
      height: 150,
      width: 150
    };
    let profile = this.state.userphoto;
    if (!this.state.userphoto) {
      profile = "default.png";
    }

    return (
      <div className="container-fluid">
        <div className="col-sm-12">
          <div className="row">
            <div className="col-sm-2">
              <img
                alt="image"
                className=""
                src={process.env.REACT_APP_BASE_URL + "/Photos/" + profile}
                style={photostyle}
              />
            </div>{" "}
            <div className="col-sm-4">
              <h2> {localStorage.getItem("UserName")}</h2>
              <h2> {this.state.Phone}</h2>
            </div>
          </div>
        </div>
        <br />
        <div className="col-sm-12">
          <div className="ibox ">
            <div className="ibox-content">
              <form onSubmit={this.handleSubmit} encType="multipart/form-data">
                <div className=" row">
                  <div className="col-sm">
                    <div className="form-group">
                      <label
                        htmlFor="exampleInputEmail1"
                        className="font-weight-bold"
                      >
                        Email address
                      </label>
                      <input
                        type="email"
                        name="Email"
                        required
                        className="form-control"
                        id="Email"
                        aria-describedby="emailHelp"
                        placeholder="Enter email"
                        onChange={this.handleInputChange}
                        value={this.state.Email}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="Telephone" className="font-weight-bold">
                        MobileNo
                      </label>
                      <input
                        type="text"
                        name="Phone"
                        className="form-control"
                        id="Phone"
                        placeholder="Phone"
                        onChange={this.handleInputChange}
                        value={this.state.Phone}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-sm">
                    <div className="form-group">
                      <label htmlFor="Name" className="font-weight-bold">
                        Full Names
                      </label>
                      <input
                        type="text"
                        name="Name"
                        className="form-control"
                        id="Name"
                        placeholder="Name"
                        onChange={this.handleInputChange}
                        value={this.state.Name}
                      />
                    </div>

                    <div className="form-group">
                      <div className="form-group files">
                        <label className="font-weight-bold">
                          Upload Your photo{" "}
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          name="file"
                          onChange={this.onChangeHandler}
                          multiple
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
                <div className="row">
                  <div className="col-sm-7"></div>
                  <div className="col-sm-5">
                    <button
                      type="button"
                      class="btn btn-success"
                      onClick={this.onClickHandler}
                    >
                      Upload
                    </button>
                    &nbsp;&nbsp;
                    <button type="submit" className="btn btn-primary">
                      Update Now
                    </button>
                    &nbsp;&nbsp;
                    <Link to="/ResetPassword">
                      <button type="button" className="btn btn-info">
                        Change Password
                      </button>
                    </Link>
                  </div>
                </div>
                <ToastContainer />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Profile;
