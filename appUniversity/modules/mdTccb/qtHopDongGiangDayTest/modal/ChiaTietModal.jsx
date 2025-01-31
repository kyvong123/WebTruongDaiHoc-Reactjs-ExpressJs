import React from "react";
import {
  AdminModal,
  renderTable,
  TableCell,
  FormSelect,
  FormTextBox,
} from "view/component/AdminPage";
import { SelectAdapter_FwCanBoGiangVien } from "modules/mdTccb/tccbCanBo/redux";
import { Tooltip } from "@mui/material";

export class ChiaTietModal extends AdminModal {
  onShow = (hocPhan, filter) => {
    this.setState(
      { data: [hocPhan], ...filter, maHocPhan: hocPhan.maHocPhan, hocPhan },
      this.setData
    );
  };

  onSubmit = () => {
    const data = {
      hocPhan: this.state.hocPhan,
      maHocPhan: this.state.maHocPhan,
      list: this.state.data,
      namHoc: this.state.namHoc,
      hocKy: this.state.hocKy,
    };
    this.props.updateChiaTiet(data, () => {
      this.props.getPage();
    });
    this.hide();
  };

  setData = () => {
    this.state?.data.map((hocPhan, index) => {
      this[`giangVien_${index}`]?.value(hocPhan?.nguoiDuocThue);
      this[`soTietDuocChia_${index}`]?.value(hocPhan?.tongSoTiet);
    });
  };
  handleChangeGiangVien = (index) => {
    this.state.data[index].nguoiDuocThue = this[`giangVien_${index}`]?.value();
  };
  handleChangeSoTietDuocChia = (index) => {
    this.state.data[index].tongSoTiet = parseInt(
      this[`soTietDuocChia_${index}`]?.value()
    );
  };

  chiaTiet = (soTietCanChia, soGiangVien) => {
    let soTietDu = parseInt(soTietCanChia) % parseInt(soGiangVien);
    let soTietCoBan = (soTietCanChia - soTietDu) / parseInt(soGiangVien);
    let result = [];
    for (let index = 0; index < soGiangVien; index++) {
      if (soTietDu > 0) {
        result[index] = soTietCoBan + 1;
        soTietDu--;
      } else {
        result[index] = soTietCoBan;
      }
    }
    return result;
  };
  splitRow = (hocPhan, indexRow, done) => {
    let tempObject = { ...hocPhan };
    const listChiaTiet = this.chiaTiet(this.state.data[indexRow].tongSoTiet, 2);
    hocPhan.tongSoTiet = listChiaTiet[0];
    tempObject.tongSoTiet = listChiaTiet[1];
    this.state.data.splice(indexRow + 1, 0, tempObject);
    this.setState({ data: this.state.data }, done);
  };

  deleteRow = (hocPhan, indexRow, done) => {
    let tempObject = { ...hocPhan };
    if (indexRow == 0) {
      T.notify("Không thể xóa hàng gốc!", "danger");
    } else {
      this.state.data[indexRow - 1].tongSoTiet += tempObject.tongSoTiet;
      this.state.data.splice(indexRow, 1);
      this.setState({ data: this.state.data }, done);
    }
  };

  render = () => {
    const style = (width = "auto", textAlign = "left") => ({
      width,
      textAlign,
      whiteSpace: "nowrap",
      backgroundColor: "#0275d8",
      color: "#fff",
    });
    let table = renderTable({
      emptyTable: "Không có dữ liệu sinh viên",
      stickyHead: true,
      header: "thead-light",
      getDataSource: () => this.state.data || [],
      renderHead: () => (
        <tr>
          <th style={style()}>STT</th>
          <th style={style("100%")}>Giảng viên</th>
          <th style={style("100%")}>Số tiết được chia</th>
          <th style={style("100%")}>Tách hàng</th>
        </tr>
      ),
      renderRow: (hocPhan, index) => (
        <tr key={index}>
          <TableCell
            style={{ textAlign: "center", whiteSpace: "nowrap" }}
            type="text"
            content={index + 1}
          />
          <TableCell
            style={{ textAlign: "left", whiteSpace: "nowrap" }}
            type="text"
            content={
              <FormSelect
                data={SelectAdapter_FwCanBoGiangVien}
                ref={(e) => (this[`giangVien_${index}`] = e)}
                className="col-md-12"
                style={{ margin: 0, padding: 0 }}
                onChange={() => this.handleChangeGiangVien(index)}
              ></FormSelect>
            }
          />
          <TableCell
            style={{ textAlign: "left", whiteSpace: "nowrap" }}
            type="text"
            content={
              <FormTextBox
                type="number"
                allowNegative={false}
                ref={(e) => (this[`soTietDuocChia_${index}`] = e)}
                style={{ margin: 0, padding: 0 }}
                onChange={() => this.handleChangeSoTietDuocChia(index)}
              ></FormTextBox>
            }
          />
          <TableCell
            style={{ textAlign: "left", whiteSpace: "nowrap" }}
            type="buttons"
          >
            <Tooltip title="Chia lại tiết giảng viên" arrow>
              <button
                className="btn btn-info"
                onClick={(e) =>
                  e.preventDefault() ||
                  this.splitRow(hocPhan, index, this.setData)
                }
              >
                <i className="fa fa-pie-chart" />
              </button>
            </Tooltip>
            <Tooltip title="Xóa hàng" arrow>
              <button
                className="btn btn-danger"
                onClick={(e) =>
                  e.preventDefault() ||
                  this.deleteRow(hocPhan, index, this.setData)
                }
              >
                <i className="fa fa-minus" />
              </button>
            </Tooltip>
          </TableCell>
        </tr>
      ),
    });

    const hocPhan = this.state.hocPhan || null;
    return this.renderModal({
      title: `Điều chỉnh số Tiết của Giảng viên ${hocPhan?.hoCanBo} ${
        hocPhan?.tenCanBo
      } - Môn ${hocPhan?.tenMonHoc || ""} (${hocPhan?.maHocPhan}) `,
      size: "elarge",
      body: <div className="">{table}</div>,
    });
  };
}
