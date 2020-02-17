import React, { Component } from "react";
import { MDBDataTable } from "mdbreact";

// import "./Styles/tablestyle.css";

class Table extends Component {
  render() {
    const data = {
      columns: this.props.columns,
      rows: this.props.Rows
    };
    return (
      <div className="table-responsive">
        <MDBDataTable striped bordered hover data={data} />
      </div>
    );
  }
}

export default Table;
