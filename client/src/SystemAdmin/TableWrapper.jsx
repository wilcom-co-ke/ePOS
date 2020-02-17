import React from "react";
const TableWrapper = props => {
  return (
    <div>
      <div className="wrapper wrapper-content animated fadeInRight">
        <div className="row">
          <div className="col-lg-12">
            <div className="ibox ">
              <div className="ibox-content">{props.children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableWrapper;
