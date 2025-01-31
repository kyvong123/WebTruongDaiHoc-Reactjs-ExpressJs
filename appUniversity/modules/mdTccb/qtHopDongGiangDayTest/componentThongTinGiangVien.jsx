import React from "react";
import { connect } from "react-redux";
import {
  AdminPage,
  FormSelect,
  FormTextBox,
  FormDatePicker,
} from "view/component/AdminPage";
import { SelectApdater_DaiDienKy } from "modules/mdTccb/qtChucVu/redux";
import { SelectAdapter_DmNganHang } from "modules/mdDanhMuc/dmNganHang/redux";

import { SelectAdapter_DmQuocGia } from "modules/mdDanhMuc/dmQuocGia/redux";
import { SelectAdapter_FwCanBoGiangVien } from "modules/mdTccb/tccbCanBo/redux";
import { SelectAdapter_DmGioiTinhV2 } from "modules/mdDanhMuc/dmGioiTinh/redux";
import { SelectAdapter_DmDanTocV2 } from "modules/mdDanhMuc/dmDanToc/redux";
import { SelectAdapter_DmTonGiaoV2 } from "modules/mdDanhMuc/dmTonGiao/redux";
import { SelectAdapter_DmTrinhDoV2 } from "modules/mdDanhMuc/dmTrinhDo/redux";
import { SelectAdapter_DmNgachCdnnV3 } from "modules/mdDanhMuc/dmNgachCdnn/redux";
import { getStaff } from "../tccbCanBo/redux";

class ComponentThongTinGiangVien extends AdminPage {
  state = { soTheTamTru: "", soHoChieu: "", canBoEdit: false };
  componentDidMount() {
    this.value(null, null);
  }

  componentDidUpdate(prevProps) {
    if (this.props.shcc != prevProps.shcc) {
      const shcc = this.props.shcc;
      this.value(null, shcc);
    }
    if (this.props.canBoEdit != prevProps.canBoEdit) {
      const canBoEdit = this.props.canBoEdit;
      if (canBoEdit) {
        this.value(canBoEdit, null);
        this.setState({ canBoEdit: true });
      }
    }
  }

  validate = (selector) => {
    const data = selector.value();
    const isRequired = selector.props.required;
    if (data || data === 0) return data;
    if (isRequired) {
      throw selector;
    }
    return null;
  };

  getDataSave = () => {
    try {
      const data = {
        soHopDong: this.validate(this.soHopDong),
        ngayKyHopDong: this.validate(this.ngayKy)?.getTime(),
        nguoiKy: this.validate(this.daiDien),
        nguoiDuocThue: this.validate(this.canBo),
        tenGiangVien: this.canBo.data().text,
        soHoChieu: this.soHoChieu?.value() || "",
        ngayCapHoChieu: Number(this.ngayCapHoChieu?.value()),
        ngayHetHanHoChieu: Number(this.ngayHetHanHoChieu?.value()),
        soTheTamTru: this.soTheTamTru.value() || "",
        ngayCapTheTamTru: Number(this.ngayCapTheTamTru.value()),
        noiCapTheTamTru: this.noiCapTheTamTru.value(),
        ngayHetHanTheTamTru: Number(this.ngayHetHanTheTamTru.value()),
        maSoThue: this.maSoThue.value(),
      };
      return data;
    } catch (selector) {
      selector.focus();
      T.notify(
        "<b>" + (selector.props.label || "Dữ liệu") + "</b> bị trống!",
        "danger"
      );
      return false;
    }
  };

  value = (data, shcc) => {
    if (!data) {
      this.ngayKy?.value(new Date().getTime());
      this.tenNganHang.value("VCB");
      if (shcc) this.canBo.value(shcc, this.getDataCanBo);
    } else {
      this.soHopDong.value(data.soHopDong || "");
      this.daiDien.value(data.nguoiKy || "");
      this.canBo.value(data.nguoiDuocThue || "", this.getDataCanBo);
      this.ngayKy.value(data.ngayKyHopDong ? new Date(data.ngayKyHopDong) : "");
      this.setState({
        ngayBatDau: data.ngayBatDauLamViec,
        soTheTamTru: data.soTheTamTru,
        soHoChieu: data.soHoChieu,
      });
      this.soHoChieu.value(data.soHoChieu || "");
      this.ngayCapHoChieu.value(
        data.ngayCapHoChieu ? new Date(data.ngayCapHoChieu) : ""
      );
      this.ngayHetHanHoChieu.value(
        data.ngayHetHanHoChieu ? new Date(data.ngayHetHanHoChieu) : ""
      );
      this.soTheTamTru.value(data.soTheTamTru || "");
      this.ngayCapTheTamTru.value(
        data.ngayCapTheTamTru ? new Date(data.ngayCapTheTamTru) : ""
      );
      this.ngayHetHanTheTamTru.value(
        data.ngayHetHanTheTamTru ? new Date(data.ngayHetHanTheTamTru) : ""
      );
      this.noiCapTheTamTru.value(data.noiCapTheTamTru || "");
      this.maSoThue.value(data.maSoThue || "");
      this.tenNganHang.value("VCB");
    }
  };

  getDataCanBo = () => {
    this.setState({ mscb: null }, () => {
      this.gioiTinh?.value("");
      this.quocTich?.value("");
      this.danToc?.value("");
      this.tonGiao?.value("");
      this.cmnd?.value("");
      this.cmndNgayCap?.value("");
      this.cmndNoiCap?.value("");
      this.email?.value("");
      this.dienThoai?.value("");
      this.ngaySinh?.value("");
      this.hocVi?.value("");
      const mscb = this.canBo.value();
      mscb &&
        this.props.getStaff(mscb, (data) => {
          data = data.item;
          if (data) {
            this.setState({ mscb });
            this.setState({ canUpdate: true });
            this.gioiTinh?.value(data.phai || "");
            this.quocTich?.value(data.quocGia || "");
            this.danToc?.value(data.danToc || "");
            this.tonGiao?.value(data.tonGiao || "");
            this.cmnd?.value(data.cmnd || "");
            this.cmndNgayCap?.value(data.cmndNgayCap || "");
            this.cmndNoiCap?.value(data.cmndNoiCap || "");
            this.email?.value(data.email || "");
            this.dienThoai?.value(data.dienThoaiCaNhan || "");
            this.ngaySinh?.value(data.ngaySinh || "");
            this.hocVi?.value(data.hocVi || "");
            this.chucDanhNgheNghiep?.value(data.ngach || "");
            this.soTaiKhoan?.value(data.soTaiKhoan || "");
            this.tenNganHang?.value(data.nganHang || "");
            return data;
          }
        });
    });
  };

  render() {
    const { permissions } = this.props,
      { canBoEdit, mscb } = this.state,
      readOnly = !permissions || !permissions.write;

    return (
      <>
        <div className="tile">
          <div className="tile-body row">
            <h4
              className="col-md-12"
              style={{ marginBottom: "1.5rem", textAlign: "center" }}
            >
              {"THÔNG TIN CHUNG"}
            </h4>
            <div className="col-md-12">
              <hr style={{ margin: "0 0 1rem 0", padding: 0 }} />
            </div>
            <FormTextBox
              ref={(e) => (this.soHopDong = e)}
              label="Số hợp đồng"
              className="col-md-4"
              required
              maxLength={100}
              readOnly={readOnly}
            />
            <FormDatePicker
              ref={(e) => (this.ngayKy = e)}
              className="col-md-4"
              type="date-mask"
              label="Ngày ký"
              required
              readOnly={readOnly}
            />
            <FormSelect
              ref={(e) => (this.daiDien = e)}
              data={SelectApdater_DaiDienKy}
              className="col-md-4"
              label="Đại diện ký"
              required
              readOnly={readOnly}
            />
          </div>
        </div>

        <div className="tile">
          <div className="tile-body row">
            <h4
              className="col-md-12"
              style={{ marginBottom: "1.5rem", textAlign: "center" }}
            >
              {"THÔNG TIN GIẢNG VIÊN"}
            </h4>
            <div className="col-md-12">
              <hr style={{ margin: "0 0 1rem 0", padding: 0 }} />
            </div>
            <FormSelect
              ref={(e) => (this.canBo = e)}
              label="Cán bộ"
              data={SelectAdapter_FwCanBoGiangVien}
              className="col-md-12"
              onChange={this.getDataCanBo}
              allowClear
              readOnly={canBoEdit}
              required
            />
            <FormSelect
              ref={(e) => (this.gioiTinh = e)}
              label="Giới tính"
              data={SelectAdapter_DmGioiTinhV2}
              className="col-lg-3 col-md-6"
              readOnly={canBoEdit}
              disabled={!mscb}
              required
            />
            <FormSelect
              ref={(e) => (this.quocTich = e)}
              data={SelectAdapter_DmQuocGia}
              className="col-lg-3 col-md-6"
              label="Quốc tịch"
              readOnly={canBoEdit}
              disabled={!mscb}
              required
            />
            <FormSelect
              ref={(e) => (this.danToc = e)}
              data={SelectAdapter_DmDanTocV2}
              className="col-lg-3 col-md-6"
              label="Dân tộc"
              readOnly={canBoEdit}
              disabled={!mscb}
              required
            />
            <FormSelect
              ref={(e) => (this.tonGiao = e)}
              data={SelectAdapter_DmTonGiaoV2}
              className="col-lg-3 col-md-6"
              label="Tôn giáo"
              readOnly={canBoEdit}
              disabled={!mscb}
              required
            />
            <FormTextBox
              ref={(e) => (this.cmnd = e)}
              className="col-lg-3 col-md-6"
              label="CMND/CCCD"
              readOnly={canBoEdit}
              disabled={!mscb}
              required
            />
            <FormDatePicker
              ref={(e) => (this.cmndNgayCap = e)}
              className="col-lg-3 col-md-6"
              type="date-mask"
              label="Ngày cấp"
              readOnly={canBoEdit}
              disabled={!mscb}
              required
            />
            <FormTextBox
              ref={(e) => (this.cmndNoiCap = e)}
              className="col-lg-6 col-md-12"
              label="Nơi cấp"
              readOnly={canBoEdit}
              disabled={!mscb}
              required
            />
            <FormTextBox
              ref={(e) => (this.soHoChieu = e)}
              className="col-lg-3 col-md-6"
              label="Số hộ chiếu"
              readOnly={canBoEdit}
              disabled={!mscb}
              onChange={() => {
                this.setState({ soHoChieu: this.soHoChieu?.value() });
                this.ngayCapHoChieu?.value(null);
                this.ngayHetHanHoChieu?.value(null);
              }}
            />
            <FormDatePicker
              ref={(e) => (this.ngayCapHoChieu = e)}
              label="Ngày cấp"
              className="col-lg-3 col-md-6"
              readOnly={canBoEdit}
              disabled={!mscb || !this.state.soHoChieu}
              type="date-mask"
            />
            <FormDatePicker
              ref={(e) => (this.ngayHetHanHoChieu = e)}
              label="Ngày hết hạn"
              className="col-lg-6 col-md-12"
              readOnly={canBoEdit}
              disabled={!mscb || !this.state.soHoChieu}
              type="date-mask"
            />
            <FormTextBox
              ref={(e) => (this.email = e)}
              label="Email trường"
              className="col-md-8"
              readOnly={canBoEdit}
              disabled={!mscb}
              required
            />
            <FormTextBox
              ref={(e) => (this.dienThoai = e)}
              label="Số điện thoại"
              className="col-md-4"
              readOnly={canBoEdit}
              disabled={!mscb}
              required
            />
            <FormDatePicker
              ref={(e) => (this.ngaySinh = e)}
              className="col-md-4"
              type="date-mask"
              label="Ngày sinh"
              readOnly={canBoEdit}
              disabled={!mscb}
              required
            />
            <FormSelect
              ref={(e) => (this.hocVi = e)}
              data={SelectAdapter_DmTrinhDoV2}
              label="Trình độ học vị"
              className="col-md-4"
              readOnly={canBoEdit}
              disabled={!mscb}
              required
            />
            <FormSelect
              ref={(e) => (this.chucDanhNgheNghiep = e)}
              data={SelectAdapter_DmNgachCdnnV3}
              className="col-md-4"
              label="Chức danh nghề nghiệp"
              required
              disabled={!mscb}
              readOnly={canBoEdit}
            />
            <FormTextBox
              ref={(e) => (this.soTaiKhoan = e)}
              label="Số tài khoản"
              className="col-md-4"
              readOnly={canBoEdit}
              disabled={!mscb}
            />
            <FormSelect
              ref={(e) => (this.tenNganHang = e)}
              data={SelectAdapter_DmNganHang}
              label="Tên ngân hàng"
              className="col-md-4"
              readOnly={canBoEdit}
              disabled={!mscb}
            />
            <FormTextBox
              ref={(e) => (this.chiNhanh = e)}
              label="Chi nhánh"
              className="col-md-4"
              readOnly={canBoEdit}
              disabled={!mscb}
            />
            <FormTextBox
              ref={(e) => (this.maSoThue = e)}
              label="Mã số thuế"
              className="col-md-6"
            />
            <div className="col-md-12">
              <hr style={{ margin: "0 0 1rem 0", padding: 0 }} />
            </div>

            <FormTextBox
              ref={(e) => (this.soTheTamTru = e)}
              label="Số thẻ tạm trú"
              className="col-md-4"
              onChange={() => {
                this.setState({ soTheTamTru: this.soTheTamTru?.value() });
                this.ngayHetHanTheTamTru?.value(null);
                this.ngayCapTheTamTru?.value(null);
                this.noiCapTheTamTru?.value("");
              }}
            />
            <FormDatePicker
              ref={(e) => (this.ngayCapTheTamTru = e)}
              label="Ngày cấp"
              className="col-md-4"
              disabled={!this.state.soTheTamTru}
              type="date-mask"
            />
            <FormDatePicker
              ref={(e) => (this.ngayHetHanTheTamTru = e)}
              label="Ngày hết hạn"
              disabled={!this.state.soTheTamTru}
              className="col-md-4"
              type="date-mask"
            />
            <FormTextBox
              ref={(e) => (this.noiCapTheTamTru = e)}
              label="Nơi cấp"
              disabled={!this.state.soTheTamTru}
              className="col-md-4"
            />
            <div className="col-md-12">
              <hr style={{ margin: "0 0 1rem 0", padding: 0 }} />
            </div>
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  system: state.system,
  qtHopDongGiangDayTest: state.tccb.qtHopDongGiangDayTest,
});
const mapActionsToProps = {
  getStaff,
};
export default connect(mapStateToProps, mapActionsToProps, null, {
  forwardRef: true,
})(ComponentThongTinGiangVien);
