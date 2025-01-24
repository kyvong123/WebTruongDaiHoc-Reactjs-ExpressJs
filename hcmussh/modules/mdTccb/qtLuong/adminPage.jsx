import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import {
  AdminPage,
  TableCell,
  renderDataTable,
  AdminModal,
  FormSelect,
  FormTextBox,
  FormCheckbox,
  FormDatePicker,
  TableHead,
} from "view/component/AdminPage";
import Pagination from "view/component/Pagination";
import { DateInput } from "view/component/Input";
import Dropdown from "view/component/Dropdown";
import {
  createQtLuongStaff,
  updateQtLuongStaff,
  deleteQtLuongStaff,
  getQtLuongGroupPage,
  getQtLuongPage,
} from "./redux";

import {
  SelectAdapter_BacLuong_Filter,
  getDmNgachLuong,
} from "modules/mdDanhMuc/dmNgachLuong/redux";
import {
  SelectAdapter_DmNgachCdnnV2,
  getDmNgachCdnnAll,
} from "modules/mdDanhMuc/dmNgachCdnn/redux";

import { SelectAdapter_FwCanBo } from "modules/mdTccb/tccbCanBo/redux";

const EnumDateType = Object.freeze({
    0: { text: "" },
    1: { text: "dd/mm/yyyy" },
    2: { text: "mm/yyyy" },
    3: { text: "yyyy" },
  }),
  typeMapper = {
    yyyy: "year",
    "mm/yyyy": "month",
    "dd/mm/yyyy": "date",
  };

class EditModal extends AdminModal {
  state = {
    id: null,
    batDau: "",
    ketThuc: "",
    batDauType: "dd/mm/yyyy",
    ketThucType: "dd/mm/yyyy",
  };

  cdnnMapper = {};

  componentDidMount() {
    this.props.getDmNgachCdnnAll((data) =>
      data.forEach((item) => (this.cdnnMapper[item.ma] = item.id))
    );
  }
  multiple = false;
  onShow = (item, multiple = true) => {
    this.multiple = multiple;
    let {
      id,
      batDau,
      batDauType,
      ketThuc,
      ketThucType,
      chucDanhNgheNghiep,
      bac,
      heSoLuong,
      phuCapThamNienVuotKhung,
      mocNangBacLuong,
      soHieuVanBan,
      shcc,
      tyLeVuotKhung,
      tyLePhuCapThamNien,
      tyLePhuCapUuDai,
    } = item
      ? item
      : {
          id: "",
          batDau: "",
          batDauType: "",
          ketThuc: "",
          ketThucType: "",
          chucDanhNgheNghiep: "",
          bac: "",
          heSoLuong: "",
          phuCapThamNienVuotKhung: "",
          mocNangBacLuong: "",
          soHieuVanBan: "",
          shcc: "",
          tyLeVuotKhung: null,
          tyLePhuCapThamNien: null,
          tyLePhuCapUuDai: null,
        };
    this.setState(
      {
        id,
        batDauType: batDauType ? batDauType : "dd/mm/yyyy",
        ketThucType: ketThucType ? ketThucType : "dd/mm/yyyy",
        batDau,
        ketThuc,
        ngach: this.cdnnMapper[chucDanhNgheNghiep],
      },
      () => {
        this.shcc.value(shcc);
        this.chucDanhNgheNghiep.value(
          chucDanhNgheNghiep ? chucDanhNgheNghiep : ""
        );
        this.bac.value(bac ? bac : "");
        this.heSoLuong.value(heSoLuong ? heSoLuong : "");
        this.phuCapThamNienVuotKhung.value(
          phuCapThamNienVuotKhung ? phuCapThamNienVuotKhung : ""
        );
        this.mocNangBacLuong.value(mocNangBacLuong ? mocNangBacLuong : "");
        this.soHieuVanBan.value(soHieuVanBan ? soHieuVanBan : "");
        this.tyLeVuotKhung.value(tyLeVuotKhung ? tyLeVuotKhung : "");
        this.tyLePhuCapThamNien.value(
          tyLePhuCapThamNien ? tyLePhuCapThamNien : ""
        );
        this.tyLePhuCapUuDai.value(tyLePhuCapUuDai ? tyLePhuCapUuDai : "");
        this.batDauType.setText({
          text: batDauType ? batDauType : "dd/mm/yyyy",
        });
        this.state.ketThuc != -1 &&
          this.ketThucType.setText({
            text: ketThucType ? ketThucType : "dd/mm/yyyy",
          });
        if (this.state.ketThuc == -1) {
          this.setState({ denNay: true });
          this.denNayCheck.value(true);
          $("#ketThucDate").hide();
        } else {
          this.setState({ denNay: false });
          this.denNayCheck.value(false);
          $("#ketThucDate").show();
        }
        this.batDau.setVal(batDau ? batDau : "");
        this.state.ketThuc != -1 && this.ketThuc.setVal(ketThuc ? ketThuc : "");
      }
    );
  };

  onSubmit = (e) => {
    e.preventDefault();
    let listMa = this.shcc.value();
    if (!Array.isArray(listMa)) {
      listMa = [listMa];
    }
    if (listMa.length == 0) {
      T.notify("Danh sách cán bộ trống", "danger");
      this.shcc.focus();
    } else if (!this.batDau.getVal()) {
      T.notify("Ngày bắt đầu trống", "danger");
      this.batDau.focus();
    } else if (!this.state.denNay && !this.ketThuc.getVal()) {
      T.notify("Ngày kết thúc trống", "danger");
      this.ketThuc.focus();
    } else if (
      !this.state.denNay &&
      this.batDau.getVal() > this.ketThuc.getVal()
    ) {
      T.notify("Ngày bắt đầu lớn hơn ngày kết thúc", "danger");
      this.batDau.focus();
    } else {
      listMa.forEach((ma, index) => {
        const changes = {
          shcc: ma,
          batDauType: this.state.batDauType,
          batDau: this.batDau.getVal(),
          ketThucType: !this.state.denNay ? this.state.ketThucType : "",
          ketThuc: !this.state.denNay ? this.ketThuc.getVal() : -1,
          chucDanhNgheNghiep: this.chucDanhNgheNghiep.value(),
          bac: this.bac.value(),
          heSoLuong: this.heSoLuong.value(),
          phuCapThamNienVuotKhung: this.phuCapThamNienVuotKhung.value(),
          mocNangBacLuong: Number(this.mocNangBacLuong.value()),
          soHieuVanBan: this.soHieuVanBan.value(),
          tyLeVuotKhung: this.tyLeVuotKhung.value(),
          tyLePhuCapUuDai: this.tyLePhuCapUuDai.value(),
          tyLePhuCapThamNien: this.tyLePhuCapThamNien.value(),
        };
        if (index == listMa.length - 1) {
          this.state.id
            ? this.props.update(this.state.id, changes, this.hide)
            : this.props.create(changes, this.hide);
          this.setState({
            id: "",
          });
        } else {
          this.state.id
            ? this.props.update(this.state.id, changes, null)
            : this.props.create(changes, null);
        }
      });
    }
  };

  handleKetThuc = (value) => {
    value ? $("#ketThucDate").hide() : $("#ketThucDate").show();
    this.setState({ denNay: value });
    if (!value) {
      this.ketThucType?.setText({
        text: this.state.ketThucType ? this.state.ketThucType : "dd/mm/yyyy",
      });
    } else {
      this.ketThucType?.setText({ text: "" });
    }
  };

  handleNgach = (item) => {
    this.setState({ ngach: this.cdnnMapper[item.id], maNgach: item.id }, () => {
      this.bac.value(null);
      this.heSoLuong.value(null);
    });
  };

  handleBac = (item) => {
    this.props.getDmNgachLuong(item.id, this.state.ngach, (data) => {
      if (data) {
        if (data.bac != 0) {
          this.heSoLuong.value(data.heSo.toFixed(2));
        }
      }
    });
  };

  render = () => {
    const readOnly = this.props.readOnly;
    return this.renderModal({
      title: this.state.id
        ? "Cập nhật thông tin lương"
        : "Tạo mới thông tin lương",
      size: "large",
      body: (
        <div className="row">
          <FormSelect
            className="col-md-12"
            multiple={this.multiple}
            ref={(e) => (this.shcc = e)}
            data={SelectAdapter_FwCanBo}
            label="Cán bộ"
            readOnly={this.state.id ? true : false}
            required
          />

          <FormSelect
            ref={(e) => (this.chucDanhNgheNghiep = e)}
            data={SelectAdapter_DmNgachCdnnV2}
            onChange={(value) => {
              this.setState({ nhomNgach: value.nhom });
              this.handleNgach(value);
            }}
            className="col-md-4"
            label="Chức danh nghề nghiệp"
            required
          />
          <FormSelect
            ref={(e) => (this.bac = e)}
            label="Bậc lương"
            className="col-xl-4 col-md-4"
            data={
              this.state.ngach
                ? SelectAdapter_BacLuong_Filter(this.state.ngach)
                : []
            }
            onChange={this.handleBac}
            required
          />
          <FormTextBox
            type="number"
            step={0.01}
            ref={(e) => (this.heSoLuong = e)}
            label="Hệ số lương"
            className="col-xl-4 col-md-4"
            required
            disable={!this.state.ngach}
          />

          <FormTextBox
            type="text"
            className="col-md-12"
            ref={(e) => (this.soHieuVanBan = e)}
            label="Số hiệu văn bản"
            readOnly={readOnly}
          />

          <FormTextBox
            type="text"
            className="col-md-6"
            ref={(e) => (this.tyLePhuCapUuDai = e)}
            label="Tỷ lệ phụ cấp ưu đãi"
            readOnly={readOnly}
          />
          <FormTextBox
            type="text"
            className="col-md-6"
            ref={(e) => (this.tyLePhuCapThamNien = e)}
            label="Tỷ lệ phụ cấp thâm niên"
            readOnly={readOnly}
          />
          <FormTextBox
            type="text"
            className="col-md-6"
            ref={(e) => (this.tyLeVuotKhung = e)}
            label="Tỷ lệ vượt khung"
            readOnly={readOnly}
          />

          <FormTextBox
            type="text"
            className="col-md-6"
            ref={(e) => (this.phuCapThamNienVuotKhung = e)}
            label="Phụ cấp thâm niên vượt khung"
            readOnly={readOnly}
          />
          <FormDatePicker
            type="date-mask"
            className="col-md-12"
            ref={(e) => (this.mocNangBacLuong = e)}
            label={
              <div>
                Mốc nâng bậc lương &nbsp;<span style={{ color: "red" }}>*</span>
              </div>
            }
            readOnly={readOnly}
            placeholder="Mốc ngày nâng bậc lương"
          />

          <div className="form-group col-md-6">
            <DateInput
              ref={(e) => (this.batDau = e)}
              placeholder="Thời gian bắt đầu"
              label={
                <div style={{ display: "flex" }}>
                  Thời gian bắt đầu (định dạng:&nbsp;{" "}
                  <Dropdown
                    ref={(e) => (this.batDauType = e)}
                    items={[
                      ...Object.keys(EnumDateType).map(
                        (key) => EnumDateType[key].text
                      ),
                    ]}
                    onSelected={(item) => this.setState({ batDauType: item })}
                    readOnly={readOnly}
                  />
                  )&nbsp;<span style={{ color: "red" }}> *</span>
                </div>
              }
              type={
                this.state.batDauType ? typeMapper[this.state.batDauType] : null
              }
              readOnly={readOnly}
            />
          </div>
          <div className="form-group col-md-6" id="ketThucDate">
            <DateInput
              ref={(e) => (this.ketThuc = e)}
              placeholder="Thời gian kết thúc"
              label={
                <div style={{ display: "flex" }}>
                  Thời gian kết thúc (định dạng:&nbsp;{" "}
                  <Dropdown
                    ref={(e) => (this.ketThucType = e)}
                    items={[
                      ...Object.keys(EnumDateType).map(
                        (key) => EnumDateType[key].text
                      ),
                    ]}
                    onSelected={(item) => this.setState({ ketThucType: item })}
                    readOnly={readOnly}
                  />
                  )&nbsp;<span style={{ color: "red" }}> *</span>
                </div>
              }
              type={
                this.state.ketThucType
                  ? typeMapper[this.state.ketThucType]
                  : null
              }
            />
          </div>
          <FormCheckbox
            ref={(e) => (this.denNayCheck = e)}
            label="Đến nay"
            onChange={this.handleKetThuc}
            className="form-group col-md-3"
          />
        </div>
      ),
    });
  };
}

class QtLuong extends AdminPage {
  checked = parseInt(T.cookie("hienThiTheoCanBo")) == 1 ? true : false;
  state = { filter: {} };
  componentDidMount() {
    T.ready("/user/tccb", () => {
      T.clearSearchBox();
      T.onSearch = (searchText) =>
        this.getPage(undefined, undefined, searchText || "");
      T.showSearchBox(() => {
        this.timeType?.value(0);
        this.fromYear?.value("");
        this.toYear?.value("");
        this.maDonVi?.value("");
        this.mulCanBo?.value("");
        this.tinhTrang?.value("");
        setTimeout(() => this.changeAdvancedSearch(), 50);
      });
      if (this.checked) {
        this.hienThiTheoCanBo.value(true);
      }
      this.getPage();
      this.changeAdvancedSearch(true);
    });
  }

  showModal = (e) => {
    e.preventDefault();
    this.modal.show();
  };

  changeAdvancedSearch = (isInitial = false) => {
    let { pageNumber, pageSize } =
      this.props && this.props.qtLuong && this.props.qtLuong.page
        ? this.props.qtLuong.page
        : { pageNumber: 1, pageSize: 50 };
    const timeType = this.timeType?.value() || 0;
    const fromYear =
      this.fromYear?.value() == "" ? null : this.fromYear?.value().getTime();
    const toYear =
      this.toYear?.value() == "" ? null : this.toYear?.value().getTime();
    const listDv = this.maDonVi?.value().toString() || "";
    const listShcc = this.mulCanBo?.value().toString() || "";
    const tinhTrang =
      this.tinhTrang?.value() == "" ? null : this.tinhTrang?.value();
    const pageFilter = isInitial
      ? {}
      : { listDv, fromYear, toYear, listShcc, tinhTrang, timeType };
    this.setState({ filter: pageFilter }, () => {
      this.getPage(pageNumber, pageSize, "", (page) => {
        if (isInitial) {
          const filter = page.filter || {};
          this.setState({
            filter: !$.isEmptyObject(filter) ? filter : pageFilter,
          });
          this.fromYear?.value(filter.fromYear || "");
          this.toYear?.value(filter.toYear || "");
          this.maDonVi?.value(filter.listDv);
          this.mulCanBo?.value(filter.listShcc);
          this.timeType?.value(filter.timeType);
          if (
            !$.isEmptyObject(filter) &&
            filter &&
            (filter.fromYear ||
              filter.toYear ||
              filter.listShcc ||
              filter.listDv ||
              filter.tinhTrang ||
              filter.timeType)
          )
            this.showAdvanceSearch();
        }
      });
    });
  };

  handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
    this.setState(
      {
        filter: {
          ...this.state.filter,
          [data.split(":")[0]]: data.split(":")[1],
        },
      },
      () => {
        this.getPage(pageNumber, pageSize, pageCondition);
      }
    );
  };

  getPage = (pageN, pageS, pageC, done) => {
    if (this.checked)
      this.props.getQtLuongGroupPage(
        pageN,
        pageS,
        pageC,
        this.state.filter,
        done
      );
    else
      this.props.getQtLuongPage(pageN, pageS, pageC, this.state.filter, done);
  };

  groupPage = () => {
    this.checked = !this.checked;
    T.cookie("hienThiTheoCanBo", this.checked ? 1 : 0);
    this.getPage();
  };

  list = (text, i, j) => {
    if (!text) return "";
    let deTais = text.split("??").map((str) => (
      <div key={i--}>
        Lần {j - i}:{" "}
        <b>
          {str.trim()
            ? T.dateToText(Number(str.trim().slice(0, -1)), "dd/mm/yyyy")
            : null}
        </b>
        <br />
      </div>
    ));
    return deTais;
  };

  delete = (e, item) => {
    T.confirm(
      "Xóa thông tin lương",
      "Bạn có chắc bạn muốn xóa thông tin lương này?",
      "warning",
      true,
      (isConfirm) => {
        isConfirm &&
          this.props.deleteQtLuongStaff(item.id, (error) => {
            if (error)
              T.notify(
                error.message ? error.message : "Xoá thông tin lương bị lỗi!",
                "danger"
              );
            else
              T.alert("Xoá thông tin lương thành công!", "success", false, 800);
          });
      }
    );
    e.preventDefault();
  };

  render() {
    const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null;
    const currentPermissions =
        this.props.system &&
        this.props.system.user &&
        this.props.system.user.permissions
          ? this.props.system.user.permissions
          : [],
      permission = this.getUserPermission("qtLuong", [
        "read",
        "write",
        "delete",
      ]);
    let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } =
      this.checked
        ? this.props.qtLuong && this.props.qtLuong.pageGr
          ? this.props.qtLuong.pageGr
          : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list }
        : this.props.qtLuong && this.props.qtLuong.page
        ? this.props.qtLuong.page
        : {
            pageNumber: 1,
            pageSize: 50,
            pageTotal: 1,
            totalItem: 0,
            pageCondition: {},
            list: [],
          };
    let table = renderDataTable({
      emptyTable: "Không có dữ liệu",
      data: list,
      className: this.state.isFixCol ? "table-fix-col" : "",
      divStyle: { height: "80vh" },
      renderHead: () => (
        <tr>
          <TableHead
            style={{ width: "auto", textAlign: "right" }}
            content="#"
          />
          <TableHead
            onKeySearch={onKeySearch}
            style={{ minWidth: "120px", whiteSpace: "nowrap" }}
            keyCol="shcc"
            content="MSCB"
          />
          <TableHead
            onKeySearch={onKeySearch}
            style={{ minWidth: "180px", whiteSpace: "nowrap" }}
            keyCol="ho"
            content="Họ"
          />
          <TableHead
            onKeySearch={onKeySearch}
            style={{ minWidth: "120px", whiteSpace: "nowrap" }}
            keyCol="ten"
            content="Tên"
          />

          {!this.checked && (
            <TableHead
              onKeySearch={onKeySearch}
              style={{
                minWidth: "120px",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
              keyCol="tenChucDanh"
              content="Chức danh"
            />
          )}

          {this.checked && (
            <TableHead
              style={{
                width: "auto",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
              content="Số lần hưởng"
            />
          )}
          {this.checked && (
            <TableHead
              style={{ width: "100%", whiteSpace: "nowrap" }}
              content="Danh sách ngày hưởng"
            />
          )}

          {!this.checked && (
            <TableHead
              onKeySearch={onKeySearch}
              style={{
                minWidth: "60px",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
              keyCol="bac"
              content="Bậc lương"
            />
          )}
          {!this.checked && (
            <TableHead
              onKeySearch={onKeySearch}
              style={{
                minWidth: "60px",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
              keyCol="heSoLuong"
              content="Hệ số lương"
            />
          )}
          {!this.checked && (
            <TableHead
              onKeySearch={onKeySearch}
              style={{
                minWidth: "60px",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
              keyCol="tyLePhuCapUuDai"
              content="Tỷ lệ phụ cấp ưu đãi"
            />
          )}
          {!this.checked && (
            <TableHead
              onKeySearch={onKeySearch}
              style={{
                minWidth: "60px",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
              keyCol="tyLePhuCapThamNien"
              content="Tỷ lệ phụ cấp thâm niên"
            />
          )}
          {!this.checked && (
            <TableHead
              onKeySearch={onKeySearch}
              style={{
                minWidth: "60px",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
              keyCol="tyLeVuotKhung"
              content="Tỷ lệ vượt khung"
            />
          )}
          {!this.checked && (
            <TableHead
              onKeySearch={onKeySearch}
              style={{
                minWidth: "60px",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
              keyCol="phuCapThamNienVuotKhung"
              content="Phụ cấp thâm niên vượt khung"
            />
          )}

          {!this.checked && (
            <TableHead
              onKeySearch={onKeySearch}
              style={{
                minWidth: "80px",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
              typeSearch="date"
              content="Ngày bắt đầu"
              keyCol="batDau"
            />
          )}
          {!this.checked && (
            <TableHead
              onKeySearch={onKeySearch}
              style={{
                minWidth: "80px",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
              typeSearch="date"
              content="Ngày kết thúc"
              keyCol="keyThuc"
            />
          )}
          {!this.checked && (
            <TableHead
              onKeySearch={onKeySearch}
              style={{
                minWidth: "80px",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
              typeSearch="date"
              content="Mốc ngày nâng lương"
              keyCol="mocNangBacLuong"
            />
          )}

          {!this.checked && (
            <TableHead
              onKeySearch={onKeySearch}
              style={{
                minWidth: "120px",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
              keyCol="soHieuVanBan"
              content="Số hiệu văn bản"
            />
          )}
          {!this.checked && (
            <TableHead
              onKeySearch={onKeySearch}
              style={{
                minWidth: "80px",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
              typeSearch="select"
              data={[
                { id: 0, text: "Không thể xác định" },
                { id: 1, text: "Chưa diễn ra" },
                { id: 2, text: "Đang diễn ra" },
                { id: 3, text: "Đã kết thúc" },
              ]}
              keyCol="tinhTrangVanBan"
              content="Tình trạng văn bản"
            />
          )}
          <TableHead
            style={{ width: "auto", whiteSpace: "nowrap", textAlign: "center" }}
            content="Thao tác"
          />
        </tr>
      ),
      renderRow: (item, index) => (
        <tr key={index}>
          <TableCell
            type="text"
            style={{ textAlign: "right" }}
            content={(pageNumber - 1) * pageSize + index + 1}
          />
          <TableCell
            type="text"
            style={{ whiteSpace: "nowrap" }}
            content={item.shcc}
          />
          <TableCell
            type="text"
            style={{ whiteSpace: "nowrap" }}
            content={item.ho}
          />
          <TableCell
            type="text"
            style={{ whiteSpace: "nowrap" }}
            content={item.ten}
          />
          {!this.checked && (
            <TableCell
              type="text"
              style={{ whiteSpace: "nowrap" }}
              content={item.tenChucDanh}
            />
          )}
          {!this.checked && (
            <TableCell
              type="text"
              style={{ whiteSpace: "nowrap" }}
              content={item.bac}
            />
          )}
          {!this.checked && (
            <TableCell
              type="text"
              style={{ whiteSpace: "nowrap" }}
              content={item.heSoLuong?.toFixed(2)}
            />
          )}
          {!this.checked && (
            <TableCell
              type="text"
              style={{ whiteSpace: "nowrap" }}
              content={item.tyLePhuCapUuDai?.toFixed(2)}
            />
          )}
          {!this.checked && (
            <TableCell
              type="text"
              style={{ whiteSpace: "nowrap" }}
              content={item.tyLePhuCapThamNien?.toFixed(2)}
            />
          )}
          {!this.checked && (
            <TableCell
              type="text"
              style={{ whiteSpace: "nowrap" }}
              content={item.tyLeVuotKhung?.toFixed(2)}
            />
          )}
          {!this.checked && (
            <TableCell
              type="text"
              style={{ whiteSpace: "nowrap" }}
              content={item.phuCapThamNienVuotKhung?.toFixed(2)}
            />
          )}

          {!this.checked && (
            <TableCell
              type="text"
              content={
                item.batDau
                  ? T.dateToText(
                      item.batDau,
                      item.batDauType ? item.batDauType : "dd/mm/yyyy"
                    )
                  : ""
              }
            />
          )}
          {!this.checked && (
            <TableCell
              type="text"
              content={
                item.ketThuc
                  ? item.ketThuc == -1
                    ? "Đến nay"
                    : T.dateToText(
                        item.ketThuc,
                        item.ketThucType ? item.ketThucType : "dd/mm/yyyy"
                      )
                  : ""
              }
            />
          )}
          {!this.checked && (
            <TableCell
              type="text"
              content={
                item.mocNangBacLuong
                  ? T.dateToText(item.mocNangBacLuong, "dd/mm/yyyy")
                  : ""
              }
            />
          )}

          {!this.checked && (
            <TableCell type="text" content={item.soHieuVanBan} />
          )}
          {!this.checked && (
            <TableCell
              type="text"
              content={
                <>
                  {!item.ketThuc || !item.batDau ? (
                    <span style={{ color: "red", whiteSpace: "nowrap" }}>
                      Không thể xác định
                    </span>
                  ) : item.ketThuc < item.today && item.ketThuc != -1 ? (
                    <span style={{ color: "red", whiteSpace: "nowrap" }}>
                      Đã kết thúc
                    </span>
                  ) : item.batDau > item.today ? (
                    <span style={{ color: "red", whiteSpace: "nowrap" }}>
                      Chưa diễn ra
                    </span>
                  ) : (
                    <span style={{ color: "red", whiteSpace: "nowrap" }}>
                      Đang diễn ra
                    </span>
                  )}
                </>
              }
            ></TableCell>
          )}
          {this.checked && <TableCell type="text" content={item.soNgayHuong} />}
          {this.checked && (
            <TableCell
              type="text"
              content={this.list(
                item.danhSachNgayHuong,
                item.soNgayHuong,
                item.soNgayHuong
              )}
            />
          )}
          {!this.checked && (
            <TableCell
              type="buttons"
              style={{ textAlign: "center" }}
              content={item}
              permission={permission}
              onEdit={() =>
                permission.write
                  ? this.modal.show(item, false)
                  : T.notify(
                      "Vui lòng liên hệ phòng Tổ chức - Cán bộ",
                      "warning"
                    )
              }
              onDelete={(e) =>
                permission.delete
                  ? this.delete(e, item)
                  : T.notify(
                      "Vui lòng liên hệ phòng Tổ chức - Cán bộ",
                      "warning"
                    )
              }
            ></TableCell>
          )}
          {this.checked && (
            <TableCell
              type="buttons"
              style={{ textAlign: "center" }}
              content={item}
              permission={permission}
            >
              <Link
                className="btn btn-success"
                to={`/user/tccb/qua-trinh/luong/group/${item.shcc}`}
              >
                <i className="fa fa-lg fa-compress" />
              </Link>
            </TableCell>
          )}
        </tr>
      ),
    });

    return this.renderPage({
      icon: "fa fa-money",
      title: "Quá trình lương - Cán bộ",
      breadcrumb: [
        <Link key={0} to="/user/tccb">
          Tổ chức cán bộ
        </Link>,
        "Quá trình lương",
      ],
      content: (
        <>
          <div className="tile">
            <div style={{ marginBottom: "10px" }}>
              Kết quả: {<b>{totalItem}</b>} quá trình lương
            </div>
            <div className="tile-title-w-btn" style={{ marginBottom: "5" }}>
              <div className="title">
                <div style={{ gap: 10, display: "inline-flex" }}>
                  {/*<FormCheckbox label='Hiển thị theo cán bộ' ref={e => this.hienThiTheoCanBo = e} onChange={this.groupPage} />*/}
                  <FormCheckbox
                    label="Tìm theo cột"
                    onChange={(value) => {
                      this.setState({ isKeySearch: value, filter: {} }, () =>
                        this.getPage()
                      );
                    }}
                    style={{ marginBottom: "0" }}
                  />
                  <FormCheckbox
                    label="Thao tác nhanh"
                    onChange={(value) => this.setState({ isFixCol: value })}
                    style={{ marginBottom: "0" }}
                  />
                </div>
              </div>
            </div>
            {table}
          </div>
          <Pagination
            style={{ marginLeft: "70px" }}
            {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
            getPage={this.getPage}
          />
          <EditModal
            ref={(e) => (this.modal = e)}
            permission={permission}
            permissions={currentPermissions}
            create={this.props.createQtLuongStaff}
            update={this.props.updateQtLuongStaff}
            getDmNgachCdnnAll={this.props.getDmNgachCdnnAll}
            getDmNgachLuong={this.props.getDmNgachLuong}
          />
        </>
      ),
      backRoute: "/user/tccb",
      collapse: [
        {
          icon: "fa-plus-square",
          name: "Tạo quá trình mới",
          permission: permission && permission.write && !this.checked,
          onClick: (e) => e.preventDefault() || this.showModal(e),
          type: "primary",
        },
        {
          icon: "fa-upload",
          name: "Import dữ liệu",
          permission: permission.write,
          onClick: (e) =>
            e.preventDefault() ||
            this.props.history.push("/user/tccb/qua-trinh/luong/import"),
          type: "info",
        },
      ],
    });
  }
}

const mapStateToProps = (state) => ({
  system: state.system,
  qtLuong: state.tccb.qtLuong,
});
const mapActionsToProps = {
  createQtLuongStaff,
  updateQtLuongStaff,
  deleteQtLuongStaff,
  getQtLuongGroupPage,
  getQtLuongPage,
  getDmNgachCdnnAll,
  getDmNgachLuong,
};
export default connect(mapStateToProps, mapActionsToProps)(QtLuong);
