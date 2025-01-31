import React from "react";
import { connect } from "react-redux";
import { AdminPage, FormSelect } from "view/component/AdminPage";
import { SelectAdapter_DmNgachCdnnV3 } from "modules/mdDanhMuc/dmNgachCdnn/redux";
import { SelectAdapter_DtDmHocKy } from "modules/mdDaoTao/dtDmHocKy/redux";
import { SelectAdapter_DmSvLoaiHinhDaoTao } from "modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux";
import { SelectAdapter_DmTcMauHopDongGiangDay } from "modules/mdDanhMuc/dmTcMauHopDongGiangDay/redux";
import { SelectAdapter_DmDonVi } from "modules/mdDanhMuc/dmDonVi/redux";
import { SelectAdapter_LoaiCanBo } from "./redux";
import { getStaff } from "../tccbCanBo/redux";

const yearDatas = () => {
  return Array.from({ length: 15 }, (_, i) => {
    const year = i + new Date().getFullYear() - 14;
    return `${year} - ${year + 1}`;
  });
};

class ComponentHocPhan extends AdminPage {
  state = { loaiHinhDaoTao: null, loaiCanBo: null };
  componentDidMount() {
    this.value();
  }

  componentDidUpdate(prevProps) {
    if (this.props.canBoEdit != prevProps.canBoEdit) {
      this.value(this.props.canBoEdit);
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
        loaiHinhDaoTao: this.validate(this.loaiHinhDaoTao),
        donViGiangDay: this.validate(this.donVi),
        maNgach: this.validate(this.chucDanhChuyenMon),
        hocKy: this.validate(this.hocKy),
        namHoc: this.validate(this.namHoc),
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

  getMaMauHopDong = () => {
    return this.maMauHopDong?.value();
  };

  value = (data) => {
    if (!data) this.chucDanhChuyenMon.value("V.07.01.03");
    else {
      this.hocKy.value(data.hocKy || "");
      this.namHoc.value(data.namHoc || "");
      this.loaiHinhDaoTao.value(data.loaiHinhDaoTao || "");
      this.donVi.value(data.donViGiangDay || "");
      this.setState({
        loaiHinhDaoTao: data.loaiHinhDaoTao,
      });
      this.chucDanhChuyenMon.value("V.07.01.03");
    }
  };

  render() {
    let permissions = this.getUserPermission("qtHopDongGiangDayTest"),
      readOnly = !permissions || !permissions.write;

    return (
      <>
        <div className="tile">
          <div className="tile-body row">
            <h4
              className="col-md-12"
              style={{ marginBottom: "1.5rem", textAlign: "center" }}
            >
              {"THÔNG TIN ĐIỀU KHOẢN"}
            </h4>
            <div className="col-md-12">
              <hr style={{ margin: "0 0 1rem 0", padding: 0 }} />
            </div>
            <FormSelect
              ref={(e) => (this.hocKy = e)}
              data={SelectAdapter_DtDmHocKy}
              className="col-md-2"
              label="Học kỳ"
              required
              readOnly={readOnly}
            />
            <FormSelect
              ref={(e) => (this.namHoc = e)}
              data={yearDatas()?.reverse()}
              className="col-md-4"
              label="Năm học"
              required
              readOnly={readOnly}
            />
            <div className="col-md-12">
              <hr style={{ margin: "0 0 1rem 0", padding: 0 }} />
            </div>
            <FormSelect
              ref={(e) => (this.loaiHinhDaoTao = e)}
              onChange={() => {
                this.setState(
                  { loaiHinhDaoTao: this.loaiHinhDaoTao.value() },
                  () => {
                    this.maMauHopDong.value("");
                  }
                );
              }}
              data={SelectAdapter_DmSvLoaiHinhDaoTao}
              className="col-md-6"
              label="Loại hình đào tạo"
              required
              readOnly={readOnly}
            />
            <FormSelect
              ref={(e) => (this.maMauHopDong = e)}
              data={SelectAdapter_DmTcMauHopDongGiangDay(
                this.state.loaiHinhDaoTao
              )}
              className="col-md-6"
              type="date-mask"
              label="Mẫu hợp đồng"
              readOnly={readOnly}
            />
            <div className="col-md-12">
              <hr style={{ margin: "0 0 1rem 0", padding: 0 }} />
            </div>

            <FormSelect
              ref={(e) => (this.donVi = e)}
              data={SelectAdapter_DmDonVi}
              className="col-md-6"
              label="Đơn vị giảng dạy"
              readOnly={readOnly}
              required
            />
            <FormSelect
              ref={(e) => (this.chucDanhChuyenMon = e)}
              data={SelectAdapter_DmNgachCdnnV3}
              className="col-md-6"
              label="Chức danh chuyên môn"
              disabled
              required
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
const mapActionsToProps = { getStaff };
export default connect(mapStateToProps, mapActionsToProps, null, {
  forwardRef: true,
})(ComponentHocPhan);
