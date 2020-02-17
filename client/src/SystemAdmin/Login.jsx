import React, { Component } from "react";
import swal from "sweetalert";
import { Link } from "react-router-dom";
import Select from "react-select";
class Login extends Component {
  constructor() {
    super();
    this.state = {
      username: "",
      password: "",
      Branches: [],
      BranchID: "",
      ShowBranches: false,
      redirect: false
    };
  }
  handleSelectChange = (UserGroup, actionMeta) => {
    localStorage.setItem("BranchID", UserGroup.value);
    this.setState({
      redirect: true
    });
  };
  handleInputChange = event => {
    event.preventDefault();
    this.setState({ [event.target.name]: event.target.value });
  };
  handleSubmit = event => {
    event.preventDefault();
    const data = {
      UserName: this.state.username,
      Password: this.state.password
    };

    this.postData("/api/login", data);
  };
  fetchBranches = (UserName, xtoken) => {
    fetch(
      "/api/BranchAccess/" + localStorage.getItem("CompanyID") + "/" + UserName,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": xtoken
        }
      }
    )
      .then(res => res.json())
      .then(Branches => {
        if (Branches.length > 0) {
          this.setState({ Branches: Branches, ShowBranches: true });
        } else {
          //swal("", "Branches.message", "error");
          swal("", Branches.message, "error");
        }
      })
      .catch(err => {
        swal("", err.message, "error");
      });
  };
  postData(url = ``, data = {}, req, res) {
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(response =>
        response.json().then(data => {
          if (data.success) {
            localStorage.setItem("UserName", data.userdata.UserName);
            localStorage.setItem("UserData", JSON.stringify(data.userdata));
            localStorage.setItem("UserPhoto", data.userdata.Photo);
            localStorage.setItem("CompanyID", data.userdata.CompanyID);
            localStorage.setItem("xtoken", data.token);
            this.fetchBranches(data.userdata.UserName, data.token);
          } else {
            let Msgg = data.message;
            if (Msgg === "Email Not Verified!") {
              let emailaddress = data.userdata.Email;
              let activationCode = data.userdata.ActivationCode;
              localStorage.setItem(
                "UnverifiedUserName",
                data.userdata.UserName
              );
              swal({
                title: "Email Not verified",
                text: "Click OK to send verification code to your email",
                icon: "warning",
                dangerMode: false
              }).then(ValidateNow => {
                if (ValidateNow) {
                  alert("Verification Code has been sent to your email");
                  this.setState({
                    VerifyEmailWindow: true
                  });
                  this.SendMail(activationCode, emailaddress);
                }
              });
            } else {
              swal("", data.message, "error");
            }
          }
        })
      )
      .catch(err => {
        swal("", err.message, "error");
      });
  }
  SendMail(activationCode, email) {
    const emaildata = {
      to: email,
      subject: "EMAIL ACTIVATION",
      activationCode: activationCode
    };
    fetch("/api/sendMail/EmailVerification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emaildata)
    })
      .then(response =>
        response.json().then(data => {
          // if (data.success) {
          // } else {
          //   swal("", "Email Could not be sent", "error");
          // }
        })
      )
      .catch(err => {
        //swal("Oops!", err.message, "error");
      });
  }

  render() {
    if (this.state.redirect) {
      return (window.location = "/");
    }
    if (this.state.VerifyEmailWindow) {
      return (window.location = "#/EmailVerification");
    }

    const BranchesOptions = [...this.state.Branches].map((k, i) => {
      return {
        value: k.BranchID,
        label: k.Name
      };
    });
    let btnstyle = {
      background: "#1ab394",
      color: "white"
    };
    return (
      <div className="container">
        <div className="row vertical-center-row">
          <div className="col-sm-9 col-md-7 col-lg-5 mx-auto">
            <div className="card card-signin my-5">
              <div className="card">
                <div className="card-body">
                  <h3 className="card-title text-center">Sign In</h3>
                  <form className="form-signin" onSubmit={this.handleSubmit}>
                    <label htmlFor="Datereceived" className="font-weight-bold">
                      Username/Email
                    </label>
                    {/* <p>{process.env.REACT_APP_BASE_URL}</p> */}
                    <div className="input-group form-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="fa fa-user" />
                        </span>
                      </div>
                      <input
                        type="text"
                        id="inputEmail"
                        className="form-control"
                        placeholder="Username"
                        required
                        onChange={this.handleInputChange}
                        name="username"
                        value={this.state.username}
                      />
                    </div>
                    <label htmlFor="Datereceived" className="font-weight-bold">
                      Password
                    </label>
                    <div className="input-group form-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="fa fa-key" />
                        </span>
                      </div>
                      <input
                        type="password"
                        id="inputpassword"
                        className="form-control"
                        placeholder="password"
                        required
                        onChange={this.handleInputChange}
                        value={this.state.password}
                        name="password"
                      />
                    </div>
                    {this.state.ShowBranches ? (
                      <div>
                        <label
                          htmlFor="Datereceived"
                          className="font-weight-bold"
                        >
                          Branch
                        </label>
                        <div className="input-group form-group">
                          <div className="input-group-prepend">
                            <span className="input-group-text"></span>
                          </div>
                          <Select
                            name="BranchID"
                            className="form-control"
                            value={BranchesOptions.filter(
                              option => option.value === this.state.BranchID
                            )}
                            onChange={this.handleSelectChange}
                            options={BranchesOptions}
                            required
                          />
                        </div>
                      </div>
                    ) : null}
                    <div className="input-group form-group text">
                      <button
                        type="submit"
                        style={btnstyle}
                        className="btn  btn-primary form-control"
                        //   onClick={this.VerifySMS}
                      >
                        Login
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="card-footer">
                <div className="d-flex justify-content-center">
                  <Link to="ForgotPassword">Forgot your password?</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
