import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import {
  getQTHopDongGiangDayTestEdit,
  createHopDongGiangDayTest,
  updateHopDongGiangDayTest,
  downloadWord,
} from "./redux";
import { AdminPage } from "view/component/AdminPage";
import { getStaff } from "../tccbCanBo/redux";
import ComponentThongTinGiangVien from "./componentThongTinGiangVien";
import ComponentHocPhan from "./componentHocPhan";

class HopDongGiangDayEdit extends AdminPage {
  state = {
    canUpdate: false,
    soTheTamTru: "",
    soHoChieu: "",
    canBoEdit: null,
    isCreate: false,
  };
  componentDidMount() {
    T.ready("/user/tccb", () => {
      const route = T.routeMatcher("/user/tccb/hop-dong-giang-day-test/:ma"),
        ma = route.parse(window.location.pathname).ma;
      const query = new URLSearchParams(this.props.location.search);
      if (ma == "new") {
        this.setState({ isCreate: true });
        if (query) {
          this.setState({ shcc: query.get("shcc") });
          console.log("check shcc", this.state.shcc);
        }
      } else {
        this.setState({ ma });
        this.props.getQTHopDongGiangDayTestEdit(ma, (data) => {
          if (data.error) {
            T.notify("Lấy thông tin hợp đồng bị lỗi!", "danger");
          } else {
            this.setState({ canBoEdit: data });
          }
        });
      }
    });
  }

  saveHopDong = () => {
    const dataThongTinCaNhan = this.componentThongTinGiangVien?.getDataSave();
    let dataHocPhan;
    if (!this.checkProperties(dataThongTinCaNhan)) {
      dataHocPhan = this.componentHocPhan?.getDataSave();
    }
    if (this.state.isCreate) {
      const dataCanBo = {
        phai: dataThongTinCaNhan.gioiTinh,
        quocGia: dataThongTinCaNhan.quocTich,
        danToc: dataThongTinCaNhan.danToc,
        tonGiao: dataThongTinCaNhan.tonGiao,
        cmnd: dataThongTinCaNhan.cmnd,
        cmndNgayCap: T.dateToNumber(dataThongTinCaNhan.cmndNgayCap || ""),
        cmndNoiCap: dataThongTinCaNhan.cmndNoiCap,
        email: dataThongTinCaNhan.email,
        dienThoaiCaNhan: dataThongTinCaNhan.dienThoai,
        ngaySinh: T.dateToNumber(dataThongTinCaNhan.ngaySinh || ""),
        hocVi: dataThongTinCaNhan.hocVi,
        soTaiKhoan: dataThongTinCaNhan.soTaiKhoan,
        nganHang: dataThongTinCaNhan.tenNganHang,
      };
      if (
        !this.checkProperties(dataThongTinCaNhan) &&
        !this.checkProperties(dataHocPhan) &&
        !this.checkProperties(dataCanBo)
      ) {
        T.confirm(
          "Tạo hợp đồng giảng dạy",
          `Xác nhận tạo hợp đồng cho cán bộ ${dataThongTinCaNhan.tenGiangVien}?`,
          true,
          (isConfirm) => {
            isConfirm &&
              this.props.createHopDongGiangDayTest(
                { ...dataThongTinCaNhan, ...dataHocPhan },
                dataCanBo,
                () =>
                  this.props.history.push("/user/tccb/hop-dong-giang-day-test")
              );
          }
        );
      }
    } else {
      if (
        !this.checkProperties(dataThongTinCaNhan) &&
        !this.checkProperties(dataHocPhan)
      ) {
        T.confirm(
          "Cập nhật hợp đồng giảng dạy",
          `Xác nhận cập nhật thông tin hợp đồng cho cán bộ ${dataThongTinCaNhan.tenGiangVien}?`,
          true,
          (isConfirm) => {
            isConfirm &&
              this.props.updateHopDongGiangDayTest(this.state.ma, {
                ...dataThongTinCaNhan,
                ...dataHocPhan,
              });
          }
        );
      }
    }
  };

  checkProperties = (obj) => {
    return Object.values(obj).every((x) => x === null || x === "");
  };

  downloadWord = (item) => {
    if (!this.componentHocPhan.getMaMauHopDong()) {
      T.notify("Loại hợp đồng không được trống!", "danger");
    } else {
      this.props.downloadWord(
        item,
        this.componentHocPhan.getMaMauHopDong(),
        (data) => {
          T.FileSaver(
            new Blob([new Uint8Array(data.content.data)]),
            data.filename
          );
        }
      );
    }
  };

  render() {
    let permissions = this.getUserPermission("qtHopDongGiangDayTest"),
      readOnly = !permissions || !permissions.write;

    return this.renderPage({
      icon: "fa fa-briefcase",
      breadcrumb: [
        <Link key={0} to="/user/tccb">
          Tổ chức cán bộ
        </Link>,
        <Link key={1} to="/user/tccb/hop-dong-giang-day-test/">
          Danh sách hợp đồng
        </Link>,
        "Hợp đồng cán bộ",
      ],
      title: this.state.isCreate
        ? "Tạo mới hợp đồng giảng dạy"
        : "Chỉnh sửa hợp đồng giảng dạy",
      content: (
        <>
          <ComponentThongTinGiangVien
            ref={(e) => (this.componentThongTinGiangVien = e)}
            ma={this.state.ma}
            shcc={this.state.shcc}
            canBoEdit={this.state.canBoEdit}
            permissions={permissions}
          ></ComponentThongTinGiangVien>
          <ComponentHocPhan
            ref={(e) => (this.componentHocPhan = e)}
            ma={this.state.ma}
            canBoEdit={this.state.canBoEdit}
          ></ComponentHocPhan>
        </>
      ),
      backRoute: "/user/tccb/hop-dong-giang-day-test/",
      onSave: !readOnly ? this.saveHopDong : null,
      buttons: [
        {
          type: "warning",
          icon: "fa-file-word-o",
          className: "btn-warning" + (this.state.isCreate ? " d-none" : ""),
          tooltip: "Tải xuống hợp đồng",
          onClick: (e) =>
            e.preventDefault() || this.downloadWord(this.state.ma),
        },
      ],
    });
  }
}

const mapStateToProps = (state) => ({
  system: state.system,
  qtHopDongGiangDayTest: state.tccb.qtHopDongGiangDayTest,
});
const mapActionsToProps = {
  getQTHopDongGiangDayTestEdit,
  getStaff,
  createHopDongGiangDayTest,
  updateHopDongGiangDayTest,
  downloadWord,
};
export default connect(mapStateToProps, mapActionsToProps)(HopDongGiangDayEdit);
