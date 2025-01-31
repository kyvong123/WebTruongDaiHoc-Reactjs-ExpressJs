import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import {
  AdminPage,
  FormCheckbox,
  FormDatePicker,
  FormImageBox,
  FormSelect,
  FormTextBox,
  getValue,
} from "view/component/AdminPage";
import {
  downloadWord,
  getSinhVienEditUser,
  updateStudentUser,
  updateStudentUserNganHangInfo,
} from "./redux";
import { SelectAdapter_DmNganHang } from "modules/mdDanhMuc/dmNganHang/redux";
import { SelectAdapter_DmQuocGia } from "modules/mdDanhMuc/dmQuocGia/redux";
import { SelectAdapter_DmDanTocV2 } from "modules/mdDanhMuc/dmDanToc/redux";
import { ComponentDiaDiem } from "modules/mdDanhMuc/dmDiaDiem/componentDiaDiem";
import { SelectAdapter_DmTonGiaoV2 } from "modules/mdDanhMuc/dmTonGiao/redux";
import { SelectAdapter_DmGioiTinhV2 } from "modules/mdDanhMuc/dmGioiTinh/redux";
import { updateSystemState } from "modules/_default/_init/reduxSystem";
import { SelectAdapter_DtNganhDaoTaoStudent } from "modules/mdDaoTao/dtNganhDaoTao/redux";
import { ajaxSelectTinhThanhPho } from "modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho";
import { SelectAdapter_DmSvDoiTuongTs } from "modules/mdDanhMuc/dmSvDoiTuongTs/redux";
import { SelectAdapter_DmPhuongThucTuyenSinh } from "modules/mdDanhMuc/dmPhuongThucTuyenSinh/redux";
// import { getSvBaoHiemYTe } from '../svManageBaoHiemYTe/redux';
import BhModal from "../svManageBaoHiemYTe/BhModal";
// import DangKyBaoHiemModal from '../svBaoHiemYTe/DangKyModal';
import { SelectAdapter_DtLopCtdt } from "modules/mdCongTacSinhVien/ctsvDtLop/redux";
import { SelectAdapter_DtChuyenNganhDaoTao } from "modules/mdCongTacSinhVien/ctsvDtChuyenNganh/redux";
import { SelectAdapter_DmCaoDang } from "modules/mdCongTacSinhVien/dmCaoDangHocVien/redux";
import { SelectAdapter_DmDaiHoc } from "modules/mdCongTacSinhVien/dmDaiHoc/redux";
import { SelectAdapter_DmSvLoaiHinhDaoTao } from "modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux";
import { SelectAdapter_DmNoiCapCccd } from "modules/mdDanhMuc/dmNoiCapCccd/redux";

// const editSection = {
//     'all': 'Tất cả',
//     'noiTruTamTru': 'Thông tin nội trú tạm trú',
//     'lienLac': 'Thông tin liên lạc',
//     'nganHang': 'Thông tin ngân hàng',
//     'thongTinKhac': 'Thông tin khác'
// };

class SinhVienPage extends AdminPage {
  state = {
    item: null,
    lastModified: null,
    image: "",
    noiTru: false,
    daTotNghiepDh: false,
    daTotNghiepCd: false,
    daTotNghiepTc: false,
    daTotNghiepPt: false,
    loaiHinhDaoTao: "",
    truongDhKhac: false,
    truongCdKhac: false,
    noiSinhQuocGia: null,
    isMatCha: null,
    isMatMe: null,
  };
  isAllFilled = true;

  isInvalid = {};

  totNghiep = { ĐH: {}, CĐ: {}, TC: {}, PT: {} };
  daTotNghiep = {};

  componentDidMount() {
    T.ready("/user", () => {
      this.props.getSinhVienEditUser((data) => {
        if (data.error) {
          T.notify("Lấy thông tin sinh viên bị lỗi!", "danger");
        } else {
          let user = this.props.system.user;
          let { canEdit, sectionEdit, namTuyenSinh, chuaDongHocPhi } =
            data.item;
          let isTanSinhVien =
            user.isStudent && namTuyenSinh == new Date().getFullYear();
          this.setState(
            {
              anhThe: data.item.anhThe,
              noiSinhQuocGia: data.item.noiSinhQuocGia
                ? data.item.noiSinhQuocGia
                : "VN",
              isTanSinhVien,
              chuaDongHocPhi,
              ngayNhapHoc: data.item.ngayNhapHoc,
              canEdit,
              ctdtSinhVien: data.maCtdt,
              nganhSinhVien: data.maNganh,
              noiTru: data.item.maNoiTru ? 1 : 0,
              daTotNghiepDh: data.item.dataTotNghiep["ĐH"] != undefined,
              daTotNghiepCd: data.item.dataTotNghiep["CĐ"] != undefined,
              daTotNghiepTc: data.item.dataTotNghiep["TC"] != undefined,
              daTotNghiepPt: data.item.dataTotNghiep["PT"] != undefined,
              loaiHinhDaoTao: data.item.loaiHinhDaoTao,
              truongDhKhac:
                data.item.dataTotNghiep["ĐH"] != undefined &&
                data.item.dataTotNghiep["ĐH"][0].truongKhac != null,
              truongCdKhac:
                data.item.dataTotNghiep["CĐ"] != undefined &&
                data.item.dataTotNghiep["CĐ"][0].truongKhac != null,
              sectionEdit,
            },
            () => this.setVal(data.item)
          );
        }
      });
    });
  }

  onUploadAnhThe = (data) => {
    this.setState({ anhThe: data.anhThe }, () => {
      this.anhThe.setData(
        "CardImage",
        `/api/sv/image-card?t=${new Date().getTime()}`
      );
    });
  };

  setVal = (data = {}) => {
    this.anhThe.setData(
      "CardImage",
      `/api/sv/image-card?t=${new Date().getTime()}`
    );
    this.mssv.value(data.mssv ? data.mssv : "");
    this.heDaoTao.value(data.loaiHinhDaoTao ? data.loaiHinhDaoTao : "");
    this.phongThuTuc?.value(data.phongThuTuc || "");
    this.ho.value(data.ho ? data.ho : "");
    this.ten.value(data.ten ? data.ten : "");
    this.ngaySinh.value(data.ngaySinh ? data.ngaySinh : "");
    this.danToc.value(data.danToc ? data.danToc : "");
    this.cmnd.value(data.cmnd || "");
    this.cmndNgayCap.value(data.cmndNgayCap);
    this.cmndNoiCap.value(data.cmndNoiCap || "");
    this.dienThoaiCaNhan.value(
      data.dienThoaiCaNhan ? data.dienThoaiCaNhan : ""
    );
    this.emailCaNhan.value(data.emailCaNhan ? data.emailCaNhan : "");
    this.gioiTinh.value(data.gioiTinh ? "0" + String(data.gioiTinh) : "");
    this.state.noiSinhQuocGia == "VN" &&
      this.noiSinhMaTinh.value(data.noiSinhMaTinh);
    this.noiSinhQuocGia.value(data.noiSinhQuocGia || "VN");
    this.doiTuongTuyenSinh.value(data.doiTuongTuyenSinh);
    this.khuVucTuyenSinh.value(data.khuVucTuyenSinh);
    this.phuongThucTuyenSinh.value(data.phuongThucTuyenSinh);
    this.diemThi.value(data.diemThi ? Number(data.diemThi).toFixed(2) : "");
    this.doiTuongChinhSach.value(data.doiTuongChinhSach || "");
    this.maNganh.value(data.maNganh ? data.maNganh : "");
    this.maChuyenNganh.value(data.maChuyenNganh ? data.maChuyenNganh : "");
    this.thuongTru.value(
      data.thuongTruMaTinh,
      data.thuongTruMaHuyen,
      data.thuongTruMaXa,
      data.thuongTruSoNha
    );
    // Thong tin cha
    this.tenCha.value(data.tenCha ? data.tenCha : "");
    this.ngaySinhCha.value(data.ngaySinhCha ? data.ngaySinhCha : "");
    if (data.sdtCha == "-1") {
      this.setState({ isMatCha: true }, () => this.isMatCha.value(1));
    } else {
      this.sdtCha.value(data.sdtCha ? data.sdtCha : "");
      this.ngheNghiepCha.value(data.ngheNghiepCha ? data.ngheNghiepCha : "");
      this.thuongTruCha.value(
        data.thuongTruMaTinhCha?.toString().length == 1
          ? `0${data.thuongTruMaTinhCha}`
          : data.thuongTruMaTinhCha,
        data.thuongTruMaHuyenCha,
        data.thuongTruMaXaCha,
        data.thuongTruSoNhaCha
      );
    }
    // Thong tin me
    this.tenMe.value(data.tenMe ? data.tenMe : "");
    this.ngaySinhMe.value(data.ngaySinhMe ? data.ngaySinhMe : "");
    if (data.sdtMe == "-1") {
      this.setState({ isMatMe: true }, () => this.isMatMe.value(1));
    } else {
      this.sdtMe.value(data.sdtMe ? data.sdtMe : "");
      this.ngheNghiepMe.value(data.ngheNghiepMe ? data.ngheNghiepMe : "");
      this.thuongTruMe.value(
        data.thuongTruMaTinhMe?.toString().length == 1
          ? `0${data.thuongTruMaTinhMe}`
          : data.thuongTruMaTinhMe,
        data.thuongTruMaHuyenMe,
        data.thuongTruMaXaMe,
        data.thuongTruSoNhaMe
      );
    }
    this.thuongTruNguoiLienLac.value(
      data.lienLacMaTinh || "",
      data.lienLacMaHuyen || "",
      data.lienLacMaXa || "",
      data.lienLacSoNha || ""
    );
    this.tonGiao.value(data.tonGiao ? data.tonGiao : "");
    this.quocTich.value(data.quocGia ? data.quocGia : "");
    // this.imageBox.setData('SinhVienImage:' + data.mssv, data.image ? data.image : '/img/avatar.png');

    this.hoTenNguoiLienLac.value(
      data.hoTenNguoiLienLac ? data.hoTenNguoiLienLac : ""
    );
    this.sdtNguoiLienLac.value(
      data.sdtNguoiLienLac ? data.sdtNguoiLienLac : ""
    );
    this.lopSinhVien.value(data.lop ? data.lop : "");
    data.ngayVaoDang &&
      this.setState({ isDangVien: true }, () => {
        this.isDangVien.value();
        this.ngayVaoDang.value(data.ngayVaoDang);
      });
    data.ngayVaoDoan &&
      this.setState({ isDoanVien: true }, () => {
        this.isDoanVien.value();
        this.ngayVaoDoan.value(data.ngayVaoDoan);
      });
    this.noiTru.value(this.state.noiTru);
    if (this.state.noiTru) {
      // địa chỉ nội trú
      const { ktxTen, ktxToaNha, ktxSoPhong } = data.dataNoiTru || {};
      this.ktxTen.value(ktxTen || "");
      this.ktxToaNha.value(ktxToaNha || "");
      this.ktxSoPhong.value(ktxSoPhong || "");
    } else {
      // địa chỉ tạm trú
      const { tamTruMaTinh, tamTruMaHuyen, tamTruMaXa, tamTruSoNha } =
        data.dataTamTru || {};
      this.tamTru.value(
        tamTruMaTinh || "",
        tamTruMaHuyen || "",
        tamTruMaXa || "",
        tamTruSoNha || ""
      );
    }
    // thong tin ngan hang
    this.tenNganhangCapNhat.value(data.tenNganHang);
    this.tenChuTaiKhoan.value(data.ho + " " + data.ten || "");
    this.soTaiKhoanNganHangCapNhat.value(data.soTkNh || "");

    // this.soTkNh.value(data.soTkNh || '');
    // this.tenNh.value(data.tenNganHang ? data.tenNganHangInfo + ' (' + data.tenNganHang + ')' : '');

    // thong tin tot nghiep
    if (data.dataTotNghiep) {
      Object.keys(data.dataTotNghiep).forEach((trinhDo) => {
        this.daTotNghiep[trinhDo]?.value(1);
        Object.keys(this.totNghiep[trinhDo]).forEach((key) => {
          this.totNghiep[trinhDo][key].value(
            data.dataTotNghiep[trinhDo][0][key] || ""
          );
        });
        if (data.dataTotNghiep[trinhDo][0]["truongKhac"]) {
          this.totNghiep[trinhDo]["truongKhacCheck"]?.value(1);
          this.totNghiep[trinhDo]["truongKhac"]?.value(
            data.dataTotNghiep[trinhDo][0]["truongKhac"]
          );
        }
      });
    }
  };

  getAndValidate = (validate = true) => {
    try {
      this.isAllFilled = true;
      const {
          maTinhThanhPho: thuongTruMaTinh,
          maQuanHuyen: thuongTruMaHuyen,
          maPhuongXa: thuongTruMaXa,
          soNhaDuong: thuongTruSoNha,
        } = this.getAdressValue(this.thuongTru, validate),
        {
          maTinhThanhPho: lienLacMaTinh,
          maQuanHuyen: lienLacMaHuyen,
          maPhuongXa: lienLacMaXa,
          soNhaDuong: lienLacSoNha,
        } = this.getAdressValue(this.thuongTruNguoiLienLac, validate),
        {
          maTinhThanhPho: tamTruMaTinh,
          maQuanHuyen: tamTruMaHuyen,
          maPhuongXa: tamTruMaXa,
          soNhaDuong: tamTruSoNha,
        } = this.tamTru?.value() || {};

      const emailCaNhan = this.emailCaNhan.value();
      if (
        emailCaNhan &&
        !T.validateEmail(emailCaNhan) &&
        !this.state.sectionEdit
      ) {
        this.emailCaNhan.focus();
        T.notify("Email cá nhân không hợp lệ", "danger");
        return false;
      } else {
        const data = {
          isSubmit: 1,
          mssv: this.getValue(this.mssv, null, validate),
          ho: this.getValue(this.ho, null, validate),
          ten: this.getValue(this.ten, null, validate),
          cmnd: this.getValue(this.cmnd, null, validate),
          cmndNgayCap: this.getValue(this.cmndNgayCap, "date", validate),
          cmndNoiCap: this.getValue(this.cmndNoiCap, null, validate),
          noiSinhMaTinh:
            this.state.noiSinhQuocGia == "VN"
              ? this.getValue(this.noiSinhMaTinh, null, validate)
              : null,
          noiSinhQuocGia: this.getValue(this.noiSinhQuocGia, null, validate),
          danToc: this.getValue(this.danToc, null, validate),
          dienThoaiCaNhan: this.getValue(this.dienThoaiCaNhan, null, validate),
          emailCaNhan,
          doiTuongChinhSach: this.getValue(
            this.doiTuongChinhSach,
            null,
            validate
          ),

          // ngheNghiepMe: this.getValue(this.ngheNghiepMe, null, validate),
          tonGiao: this.getValue(this.tonGiao, null, validate),
          quocGia: this.getValue(this.quocTich, null, validate),
          thuongTruMaHuyen,
          thuongTruMaTinh,
          thuongTruMaXa,
          thuongTruSoNha,
          lienLacMaHuyen,
          lienLacMaTinh,
          lienLacMaXa,
          lienLacSoNha,
          hoTenNguoiLienLac: this.getValue(
            this.hoTenNguoiLienLac,
            null,
            validate
          ),
          sdtNguoiLienLac: this.getValue(this.sdtNguoiLienLac, null, validate),
          ngayVaoDang: this.state.isDangVien
            ? this.getValue(this.ngayVaoDang, "date", validate)
            : "",
          ngayVaoDoan: this.state.isDoanVien
            ? this.getValue(this.ngayVaoDoan, "date", validate)
            : "",
          noiTru: Number(this.state.noiTru),
          ...(this.state.noiTru
            ? {
                // Thong tin noi tru
                ktxTen: this.getValue(this.ktxTen, null, validate),
                ktxToaNha: this.getValue(this.ktxToaNha, null, validate),
                ktxSoPhong: this.getValue(this.ktxSoPhong, null, validate),
              }
            : {
                // Thong tin tam tru
                tamTruMaTinh,
                tamTruMaHuyen,
                tamTruMaXa,
                tamTruSoNha,
              }),
          // Thong tin ngan hang
          soTkNh: this.getValue(this.soTaiKhoanNganHangCapNhat, null, validate),
          tenNganHang: this.getValue(this.tenNganhangCapNhat, null, validate),
          dataTotNghiep: this.getTotNghiepInfo(),
          tenCha: this.getValue(this.tenCha, null, validate),
          ngaySinhCha: this.getValue(this.ngaySinhCha, "date", validate),
          tenMe: this.getValue(this.tenMe, null, validate),
          ngaySinhMe: this.getValue(this.ngaySinhMe, "date", validate),
        };
        if (!this.state.isMatCha) {
          const {
            maTinhThanhPho: thuongTruMaTinhCha,
            maQuanHuyen: thuongTruMaHuyenCha,
            maPhuongXa: thuongTruMaXaCha,
            soNhaDuong: thuongTruSoNhaCha,
          } = this.getAdressValue(this.thuongTruCha, validate);
          data.tenCha = this.getValue(this.tenCha, null, validate);
          data.ngaySinhCha = this.getValue(this.ngaySinhCha, "date", validate);
          data.ngheNghiepCha = this.getValue(
            this.ngheNghiepCha,
            null,
            validate
          );
          data.thuongTruMaHuyenCha = thuongTruMaHuyenCha;
          data.thuongTruMaTinhCha = thuongTruMaTinhCha;
          data.thuongTruMaXaCha = thuongTruMaXaCha;
          data.thuongTruSoNhaCha = thuongTruSoNhaCha;
          data.sdtCha = this.getValue(this.sdtCha, null, validate);
        } else {
          data.sdtCha = "-1";
        }
        if (!this.state.isMatMe) {
          const {
            maTinhThanhPho: thuongTruMaTinhMe,
            maQuanHuyen: thuongTruMaHuyenMe,
            maPhuongXa: thuongTruMaXaMe,
            soNhaDuong: thuongTruSoNhaMe,
          } = this.getAdressValue(this.thuongTruMe, validate);
          data.tenMe = this.getValue(this.tenMe, null, validate);
          data.ngaySinhMe = this.getValue(this.ngaySinhMe, "date", validate);
          data.ngheNghiepMe = this.getValue(this.ngheNghiepMe, null, validate);
          data.sdtMe = this.getValue(this.sdtMe, null, validate);
          data.thuongTruMaHuyenMe = thuongTruMaHuyenMe;
          data.thuongTruMaTinhMe = thuongTruMaTinhMe;
          data.thuongTruMaXaMe = thuongTruMaXaMe;
          data.thuongTruSoNhaMe = thuongTruSoNhaMe;
        } else {
          data.sdtMe = "-1";
        }
        if (!this.state.anhThe) {
          this.isAllFilled = false;
        }
        return data;
      }
    } catch (selector) {
      console.error(selector);
      selector.props && selector.focus();
      T.notify(
        "<b>" + (selector.props.label || "Dữ liệu") + "</b> bị trống!",
        "danger"
      );
      return false;
    }
  };

  getTotNghiepInfo = () => {
    const dataTotNghiep = [];
    Object.keys(this.daTotNghiep).forEach((trinhDo) => {
      this.daTotNghiep[trinhDo] &&
        this.daTotNghiep[trinhDo].value() == true &&
        dataTotNghiep.push({
          trinhDo,
          namTotNghiep: this.totNghiep[trinhDo].namTotNghiep?.value() || "",
          truong: this.totNghiep[trinhDo].truong?.value() || "",
          truongKhac: this.totNghiep[trinhDo].truongKhac?.value() || "",
          tinh: this.totNghiep[trinhDo].tinh?.value() || "",
          nganh: this.totNghiep[trinhDo].nganh?.value() || "",
          soHieuBang: this.totNghiep[trinhDo].soHieuBang?.value() || "",
          soVaoSoCapBang: this.totNghiep[trinhDo].soVaoSoCapBang?.value() || "",
        });
    });
    return dataTotNghiep;
  };

  copyAddress = (e) => {
    e.preventDefault();
    const dataThuongTru = this.thuongTru.value();
    this.lienLac.value(
      dataThuongTru.maTinhThanhPho,
      dataThuongTru.maQuanHuyen,
      dataThuongTru.maPhuongXa,
      dataThuongTru.soNhaDuong
    );
  };

  copyAddressTo = (e, target) => {
    e.preventDefault();
    const dataThuongTru = this.thuongTru.value();
    target.value(
      dataThuongTru.maTinhThanhPho,
      dataThuongTru.maQuanHuyen,
      dataThuongTru.maPhuongXa,
      dataThuongTru.soNhaDuong
    );
  };

  copyAddressCha = (e) => {
    e.preventDefault();
    const dataThuongTru = this.thuongTru.value();
    this.thuongTruCha.value(
      dataThuongTru.maTinhThanhPho,
      dataThuongTru.maQuanHuyen,
      dataThuongTru.maPhuongXa,
      dataThuongTru.soNhaDuong
    );
  };

  copyAddressMe = (e) => {
    e.preventDefault();
    const dataThuongTru = this.thuongTruCha.value();
    this.thuongTruMe.value(
      dataThuongTru.maTinhThanhPho,
      dataThuongTru.maQuanHuyen,
      dataThuongTru.maPhuongXa,
      dataThuongTru.soNhaDuong
    );
  };

  imageChanged = (data) => {
    if (data && data.image) {
      const user = Object.assign({}, this.props.system.user, {
        image: data.image,
      });
      this.props.updateSystemState({ user });
    }
  };

  getValue = (selector, type = null, validate = true) => {
    const data = selector.value();
    const isRequired = selector.props.required;
    if (data || data === 0) {
      selector.valid && selector.valid(true);
      if (type && type === "date") return data.getTime();
      else if (type && type === "number") return Number(data);
      else if (type && type === "address") return Number(data);
      return data;
    }
    if (isRequired) {
      if (validate) throw selector;
      else {
        selector.valid && selector.valid(false);
      }
      (this.state.tinhTrang == 11 || this.state.ngayNhapHoc == -1) &&
        (this.isAllFilled = false);
    }
    return "";
  };

  getAdressValue = (selector, validate = true) => {
    const { maTinhThanhPho, maQuanHuyen, maPhuongXa, soNhaDuong } =
      selector.value();
    const { required, requiredSoNhaDuong } = selector.props;
    if (maPhuongXa && (!requiredSoNhaDuong || soNhaDuong)) {
      selector.valid && selector.valid(true);
      return { maTinhThanhPho, maQuanHuyen, maPhuongXa, soNhaDuong };
    }
    if (required) {
      // Check empty ngược từ số nhà đến tỉnh thành
      if (validate)
        throw (
          (requiredSoNhaDuong && !soNhaDuong && selector.soNhaDuong) ||
          (!maPhuongXa && selector.maPhuongXa) ||
          (!maQuanHuyen && selector.maQuanHuyen) ||
          (!maTinhThanhPho && selector.maTinhThanhPho)
        );
      else {
        selector.valid && selector.valid(false);
      }
      (this.state.tinhTrang == 11 || this.state.ngayNhapHoc == -1) &&
        (this.isAllFilled = false);
    }
    return {};
  };

  getData = (done) => {
    const studentData = this.getAndValidate(false);
    if (studentData) {
      this.props.updateStudentUser(
        { ...studentData, lastModified: new Date().getTime() },
        done
      );
    }
  };

  save = () => {
    T.confirm(
      "Xác nhận",
      "Bạn có chắc chắn muốn lưu thay đổi thông tin cá nhân?",
      "info",
      true,
      (isConfirm) => {
        if (isConfirm) {
          this.getData(() => {
            T.notify("Cập nhật thông tin sinh viên thành công!", "success");
            !this.isAllFilled &&
              T.notify(
                "Lưu ý: Một số thông tin cần thiết chưa được điền",
                "warning"
              );
          });
          this.onSubmit();
        }
      }
    );
  };

  downloadWord = (e) => {
    e.preventDefault();
    const saveThongTin = () =>
      this.props.updateStudentUser(
        { ngayNhapHoc: -1, lastModified: new Date().getTime() },
        () => {
          this.setState({ ngayNhapHoc: -1 }, () => {
            setTimeout(
              () =>
                this.state.isTanSinhVien &&
                this.state.chuaDongHocPhi &&
                T.alert(
                  "Bạn đã hoàn tất cập nhật lý lịch sinh viên",
                  "success",
                  false,
                  2000
                ),
              2000
            );
          });
        }
      );
    const studentData = this.getAndValidate();
    if (studentData) {
      this.props.updateStudentUser(
        { ...studentData, lastModified: new Date().getTime() },
        () => {
          T.notify(
            "Hệ thống sẽ tự động tải về sơ yếu lý lịch sau vài giây!",
            "success"
          );
          T.download("/api/sv/download-syll");
          saveThongTin();
          // T.confirmLoading('LƯU Ý',
          //     '<div>Vui lòng đảm bảo bạn ĐÃ HOÀN THIỆN thông tin cá nhân trước khi tạo file sơ yếu lý lịch!</div>', 'info',
          //     {
          //         loadingText: 'Hệ thống đang gửi sơ yếu lý lịch đến email sinh viên',
          //         successText: 'Vui lòng kiểm tra email sinh viên (kể cả ở mục spam, thư rác)!',
          //         failText: 'Hệ thống sẽ tự động tải về sơ yếu lý lịch sau vài giây!'
          //     }, () => new Promise((resolve) => this.props.downloadWord(result => resolve(result))), () => {
          //         T.download('/api/sv/download-syll');
          //         saveThongTin();
          //     }, saveThongTin);
        }
      );
    }
  };

  downloadSyll = () => {
    T.alert("Vui lòng chờ trong giấy lát", "info", false);
    T.download("/api/sv/download-syll");
  };

  componentNoiTruTamTru = () => {
    const { tinhTrang } = this.props.system.user.data;
    let { canEdit, sectionEdit } = this.state;
    let readOnly = !(
      canEdit == 1 ||
      tinhTrang == 11 ||
      (sectionEdit &&
        (sectionEdit.includes("noiTruTamTru") || sectionEdit.includes("all")))
    );
    return (
      <div className="col-md-12">
        <div className="row">
          <h6 className="col-md-12">Thông tin tạm trú và nội trú</h6>
          <FormCheckbox
            className="col-md-12"
            ref={(e) => (this.noiTru = e)}
            label="Ở ký túc xá"
            onChange={() => this.setState({ noiTru: !this.state.noiTru })}
            readOnly={readOnly}
          />
          {this.state.noiTru ? (
            <div className="row col-md-12">
              <FormSelect
                ref={(e) => (this.ktxTen = e)}
                className="col-md-8"
                label="Ký túc xá"
                minimumResultsForSearch="-1"
                data={["Ký túc xá khu A", "Ký túc xá khu B"]}
                onChange={() => this.ktxToaNha.focus()}
                readOnly={readOnly}
              />
              <FormTextBox
                ref={(e) => (this.ktxToaNha = e)}
                className="col-md-4"
                label="Tòa nhà"
                onKeyDown={(e) => e.code === "Enter" && this.ktxPhong.focus()}
                readOnly={readOnly}
              />
              <FormTextBox
                ref={(e) => (this.ktxSoPhong = e)}
                className="col-md-4"
                label="Số phòng"
                readOnly={readOnly}
              />
            </div>
          ) : (
            <ComponentDiaDiem
              ref={(e) => (this.tamTru = e)}
              className="col-md-12"
              label={
                <span>
                  Địa chỉ tạm trú{" "}
                  {!readOnly && (
                    <a
                      href="#"
                      onClick={(e) => this.copyAddressTo(e, this.tamTru)}
                    >
                      (Giống địa chỉ thường trú của <b>sinh viên</b>)
                    </a>
                  )}
                </span>
              }
              requiredSoNhaDuong={true}
              readOnly={readOnly}
            />
          )}
        </div>
      </div>
    );
  };

  componentThongTinLienLac = () => {
    const { tinhTrang } = this.props.system.user.data;
    let { canEdit, sectionEdit } = this.state;
    let readOnly = !(
      canEdit == 1 ||
      tinhTrang == 11 ||
      (sectionEdit &&
        (sectionEdit.includes("lienLac") || sectionEdit.includes("all")))
    );
    return (
      <div className="col-md-12">
        <div className="row">
          <h6 className="col-md-12">Thông tin liên lạc</h6>
          <FormTextBox
            ref={(e) => (this.dienThoaiCaNhan = e)}
            label="Điện thoại cá nhân"
            className="form-group col-md-6"
            type="phone"
            required
            readOnly={readOnly}
          />
          <FormTextBox
            ref={(e) => (this.emailCaNhan = e)}
            label="Email cá nhân"
            className="form-group col-md-6"
            required
            readOnly={readOnly}
          />
          <FormTextBox
            ref={(e) => (this.hoTenNguoiLienLac = e)}
            label="Họ và tên người liên lạc"
            className="form-group col-md-6"
            required
            readOnly={readOnly}
          />
          <FormTextBox
            ref={(e) => (this.sdtNguoiLienLac = e)}
            label="Số điện thoại người liên lạc"
            className="form-group col-md-6"
            type="phone"
            required
            readOnly={readOnly}
          />
          <ComponentDiaDiem
            ref={(e) => (this.thuongTruNguoiLienLac = e)}
            label="Địa chỉ liên lạc"
            className="form-group col-md-12"
            requiredSoNhaDuong={true}
            readOnly={readOnly}
          />
        </div>
      </div>
    );
  };

  componentThongTinNganHang = () => {
    const { tinhTrang } = this.props.system.user.data;
    let { canEdit, sectionEdit } = this.state;
    let readOnly = !(
      canEdit == 1 ||
      tinhTrang == 11 ||
      (sectionEdit &&
        (sectionEdit.includes("nganHang") || sectionEdit.includes("all")))
    );
    // return (<div className='col-md-12'>
    //     <div className='row'>
    //         <h6 className='col-md-12'>Thông tin ngân hàng</h6>
    //         <FormTextBox ref={e => this.soTkNh = e} label='Số tài khoản ngân hàng' className='form-group col-md-6' readOnly={readOnly} />
    //         <FormTextBox ref={e => this.tenNh = e} label='Tên ngân hàng' className='form-group col-md-6' readOnly={readOnly} />
    //     </div>
    // </div>);
    return (
      <div className="tile">
        <h4 className="tile-title">
          Cập nhật thông tin tài khoản ngân hàng của sinh viên{" "}
          <span className="text-danger">*</span>
        </h4>
        <div className="tile-body">
          <div className="row">
            <FormTextBox
              className="col-md-4"
              ref={(e) => (this.tenChuTaiKhoan = e)}
              label="Tên chủ tài khoản"
              required
              disabled
              readOnly={readOnly}
            />
            <FormSelect
              className="col-md-4"
              ref={(e) => (this.tenNganhangCapNhat = e)}
              label="Tên ngân hàng"
              data={SelectAdapter_DmNganHang}
              required
            />
            <FormTextBox
              className="col-md-4"
              ref={(e) => (this.soTaiKhoanNganHangCapNhat = e)}
              label="Số tài khoản ngân hàng"
              required
            />
          </div>
        </div>
        {/* <div className='tile-footer' style={{ textAlign: 'right' }}>
                <button className='btn btn-primary' type='button' onClick={e => e.preventDefault() || this.onSubmit()} >
                    Lưu thông tin
                </button>
            </div> */}
      </div>
    );
  };

  onSubmit = () => {
    try {
      const changes = {
        mssv: getValue(this.mssv),
        soTkNh: getValue(this.soTaiKhoanNganHangCapNhat),
        tenNganHang: getValue(this.tenNganhangCapNhat),
      };

      this.props.updateStudentUserNganHangInfo(changes);
    } catch (error) {
      if (error.props) T.notify(error.props.label + " bị trống", "danger");
    }
  };
  componentThongTinKhac = () => {
    const { tinhTrang } = this.props.system.user.data;
    let { canEdit, sectionEdit } = this.state;
    let readOnly = !(
      canEdit == 1 ||
      tinhTrang == 11 ||
      (sectionEdit &&
        (sectionEdit.includes("thongTinKhac") || sectionEdit.includes("all")))
    );
    return (
      <div className="col-md-12">
        <div className="row">
          <h6 className="col-md-12">Thông tin khác</h6>
          <FormTextBox
            ref={(e) => (this.cmnd = e)}
            label="CCCD/Mã định danh"
            className="col-md-4"
            required
            readOnly={readOnly}
          />
          <FormDatePicker
            type="date-mask"
            ref={(e) => (this.cmndNgayCap = e)}
            label="Ngày cấp"
            className="col-md-4"
            required
            readOnly={readOnly}
          />
          {/* <FormTextBox ref={e => this.cmndNoiCap = e} label='Nơi cấp' className='col-md-4' required readOnly={readOnly} /> */}
          <FormSelect
            ref={(e) => (this.cmndNoiCap = e)}
            label="Nơi cấp"
            className="col-md-4"
            readOnly={readOnly}
            data={SelectAdapter_DmNoiCapCccd}
            required
          />
          <FormSelect
            ref={(e) => (this.quocTich = e)}
            label="Quốc tịch"
            className="form-group col-md-4"
            data={SelectAdapter_DmQuocGia}
            required
            readOnly={readOnly}
          />
          <FormSelect
            ref={(e) => (this.danToc = e)}
            label="Dân tộc"
            className="form-group col-md-4"
            data={SelectAdapter_DmDanTocV2}
            required
            readOnly={readOnly}
          />
          <FormSelect
            ref={(e) => (this.tonGiao = e)}
            label="Tôn giáo"
            className="form-group col-md-4"
            data={SelectAdapter_DmTonGiaoV2}
            required
            readOnly={readOnly}
          />
          <FormTextBox
            ref={(e) => (this.doiTuongChinhSach = e)}
            label="Đối tượng chính sách"
            placeholder="Ghi rõ đối tượng chính sách, nếu không thuộc diện này thì ghi là Không"
            className="col-md-12"
            readOnly={readOnly}
            required
          />
          <FormCheckbox
            label="Đảng viên"
            className={this.state.isDangVien ? "col-md-3" : "col-md-12"}
            onChange={(value) => this.setState({ isDangVien: value })}
            ref={(e) => (this.isDangVien = e)}
            readOnly={readOnly}
          />
          <FormDatePicker
            label="Ngày vào đảng"
            className="col-md-9"
            style={{ display: this.state.isDangVien ? "block" : "none" }}
            required={this.state.isDangVien}
            type="date-mask"
            ref={(e) => (this.ngayVaoDang = e)}
            readOnly={readOnly}
          />
          <FormCheckbox
            label="Đoàn viên"
            className={this.state.isDoanVien ? "col-md-3" : "col-md-12"}
            onChange={(value) => this.setState({ isDoanVien: value })}
            ref={(e) => (this.isDoanVien = e)}
            readOnly={readOnly}
          />
          <FormDatePicker
            label="Ngày vào đoàn"
            type="date-mask"
            className="col-md-9"
            style={{ display: this.state.isDoanVien ? "block" : "none" }}
            required={this.state.isDoanVien}
            ref={(e) => (this.ngayVaoDoan = e)}
            readOnly={readOnly}
          />
          <FormSelect
            ref={(e) => (this.doiTuongTuyenSinh = e)}
            label="Đối tượng tuyển sinh"
            className="col-md-6"
            data={SelectAdapter_DmSvDoiTuongTs}
            required
            readOnly
          />
          <FormSelect
            ref={(e) => (this.khuVucTuyenSinh = e)}
            label="Khu vực tuyển sinh"
            className="col-md-6"
            data={["KV1", "KV2", "KV2-NT", "KV3"]}
            readOnly
            required
          />
          <FormSelect
            ref={(e) => (this.phuongThucTuyenSinh = e)}
            label="Phương thức tuyển sinh"
            className="col-md-6"
            data={SelectAdapter_DmPhuongThucTuyenSinh}
            readOnly
            required
          />
          <FormTextBox
            ref={(e) => (this.diemThi = e)}
            label="Điểm thi (THPT/ĐGNL)"
            className="col-md-6"
            readOnly
          />
          {/* Thông tin tốt nghiệp cho văn bằng 2 */}
          {!["CQ", "CLC"].includes(this.state.loaiHinhDaoTao) && (
            <>
              <FormCheckbox
                ref={(e) => (this.daTotNghiep["ĐH"] = e)}
                className="col-md-12"
                label="Đã tốt nghiệp Đại học"
                readOnly={readOnly}
                onChange={() =>
                  this.setState({
                    daTotNghiepDh: !this.state.daTotNghiepDh,
                    truongDhKhac: false,
                  })
                }
              />
              {this.state.daTotNghiepDh && (
                <>
                  <FormTextBox
                    readOnly={readOnly}
                    ref={(e) => (this.totNghiep["ĐH"].namTotNghiep = e)}
                    type="year"
                    className="col-md-4"
                    label="Năm tốt nghiệp"
                  />
                  {this.state.truongDhKhac ? (
                    <FormTextBox
                      readOnly={readOnly}
                      ref={(e) => (this.totNghiep["ĐH"].truongKhac = e)}
                      className="col-md-4"
                      label="Trường đại học khác"
                    />
                  ) : (
                    <FormSelect
                      readOnly={readOnly}
                      ref={(e) => (this.totNghiep["ĐH"].truong = e)}
                      className="col-md-4"
                      label="Trường Đại học"
                      data={SelectAdapter_DmDaiHoc}
                    />
                  )}
                  <FormCheckbox
                    readOnly={readOnly}
                    ref={(e) => (this.totNghiep["ĐH"].truongKhacCheck = e)}
                    className="col-md-4"
                    label="Trường đại học khác"
                    onChange={() =>
                      this.setState({ truongDhKhac: !this.state.truongDhKhac })
                    }
                  />
                  <FormTextBox
                    readOnly={readOnly}
                    ref={(e) => (this.totNghiep["ĐH"].nganh = e)}
                    className="col-md-4"
                    label="Ngành tốt nhiệp"
                  />
                  <FormTextBox
                    readOnly={readOnly}
                    ref={(e) => (this.totNghiep["ĐH"].soHieuBang = e)}
                    className="col-md-4"
                    label="Số hiệu bằng"
                  />
                  <FormTextBox
                    readOnly={readOnly}
                    ref={(e) => (this.totNghiep["ĐH"].soVaoSoCapBang = e)}
                    className="col-md-4"
                    label="Số vào sổ cấp bằng"
                  />
                </>
              )}
              <FormCheckbox
                ref={(e) => (this.daTotNghiep["CĐ"] = e)}
                className="col-md-12"
                label="Đã tốt nghiệp Cao đẳng - Học viện"
                readOnly={readOnly}
                onChange={() =>
                  this.setState({
                    daTotNghiepCd: !this.state.daTotNghiepCd,
                    truongCdKhac: false,
                  })
                }
              />
              {this.state.daTotNghiepCd && (
                <>
                  <FormTextBox
                    readOnly={readOnly}
                    ref={(e) => (this.totNghiep["CĐ"].namTotNghiep = e)}
                    type="year"
                    className="col-md-4"
                    label="Năm tốt nghiệp"
                  />
                  {this.state.truongCdKhac ? (
                    <FormTextBox
                      readOnly={readOnly}
                      ref={(e) => (this.totNghiep["CĐ"].truongKhac = e)}
                      className="col-md-4"
                      label="Trường Cao đẳng/Học viện khác"
                    />
                  ) : (
                    <FormSelect
                      readOnly={readOnly}
                      ref={(e) => (this.totNghiep["CĐ"].truong = e)}
                      className="col-md-4"
                      label="Trường Cao đẳng/Học viện"
                      data={SelectAdapter_DmCaoDang}
                    />
                  )}
                  <FormCheckbox
                    readOnly={readOnly}
                    ref={(e) => (this.totNghiep["CĐ"].truongKhacCheck = e)}
                    className="col-md-4"
                    label="Trường Cao đẳng/Học viện khác"
                    onChange={() =>
                      this.setState({ truongCdKhac: !this.state.truongCdKhac })
                    }
                  />
                  <FormTextBox
                    readOnly={readOnly}
                    ref={(e) => (this.totNghiep["CĐ"].nganh = e)}
                    className="col-md-4"
                    label="Ngành tốt nhiệp"
                  />
                  <FormTextBox
                    readOnly={readOnly}
                    ref={(e) => (this.totNghiep["CĐ"].soHieuBang = e)}
                    className="col-md-4"
                    label="Số hiệu bằng"
                  />
                  <FormTextBox
                    readOnly={readOnly}
                    ref={(e) => (this.totNghiep["CĐ"].soVaoSoCapBang = e)}
                    className="col-md-4"
                    label="Số vào sổ cấp bằng"
                  />
                </>
              )}
              <FormCheckbox
                ref={(e) => (this.daTotNghiep["TC"] = e)}
                className="col-md-12"
                label="Đã tốt nghiệp Trung cấp"
                readOnly={readOnly}
                onChange={() =>
                  this.setState({ daTotNghiepTc: !this.state.daTotNghiepTc })
                }
              />
              {this.state.daTotNghiepTc && (
                <>
                  <FormTextBox
                    readOnly={readOnly}
                    ref={(e) => (this.totNghiep["TC"].namTotNghiep = e)}
                    type="year"
                    className="col-md-4"
                    label="Năm tốt nhiệp"
                  />
                  <FormTextBox
                    readOnly={readOnly}
                    ref={(e) => (this.totNghiep["TC"].truong = e)}
                    className="col-md-4"
                    label="Trường Trung cấp tốt nghiệp"
                  />
                  <FormSelect
                    readOnly={readOnly}
                    ref={(e) => (this.totNghiep["TC"].tinh = e)}
                    className="col-md-4"
                    label="Tỉnh/Thành phố tốt nghiệp"
                    data={ajaxSelectTinhThanhPho}
                  />
                  <FormTextBox
                    readOnly={readOnly}
                    ref={(e) => (this.totNghiep["TC"].nganh = e)}
                    className="col-md-4"
                    label="Ngành tốt nhiệp"
                  />
                  <FormTextBox
                    readOnly={readOnly}
                    ref={(e) => (this.totNghiep["TC"].soHieuBang = e)}
                    className="col-md-4"
                    label="Số hiệu bằng"
                  />
                  <FormTextBox
                    readOnly={readOnly}
                    ref={(e) => (this.totNghiep["TC"].soVaoSoCapBang = e)}
                    className="col-md-4"
                    label="Số vào sổ cấp bằng"
                  />
                </>
              )}
              <FormCheckbox
                ref={(e) => (this.daTotNghiep["PT"] = e)}
                className="col-md-12"
                label="Đã tốt nghiệp THPT/GDTX"
                readOnly={readOnly}
                onChange={() =>
                  this.setState({ daTotNghiepPt: !this.state.daTotNghiepPt })
                }
              />
              {this.state.daTotNghiepPt && (
                <>
                  <FormTextBox
                    readOnly={readOnly}
                    ref={(e) => (this.totNghiep["PT"].namTotNghiep = e)}
                    type="year"
                    className="col-md-4"
                    label="Năm tốt nhiệp"
                  />
                  <FormTextBox
                    readOnly={readOnly}
                    ref={(e) => (this.totNghiep["PT"].truong = e)}
                    className="col-md-4"
                    label="Trường THPT/GDTX tốt nghiệp"
                  />
                  <FormSelect
                    readOnly={readOnly}
                    ref={(e) => (this.totNghiep["PT"].tinh = e)}
                    className="col-md-4"
                    label="Tỉnh/Thành phố tốt nghiệp"
                    data={ajaxSelectTinhThanhPho}
                  />
                </>
              )}
            </>
          )}
          <FormTextBox
            ref={(e) => (this.tenCha = e)}
            label="Họ và tên cha"
            className="form-group col-md-6"
            readOnly={readOnly}
            required
          />
          <FormDatePicker
            ref={(e) => (this.ngaySinhCha = e)}
            label="Ngày sinh cha"
            type="date-mask"
            className="form-group col-md-6"
            readOnly={readOnly}
            required
          />
          <FormCheckbox
            ref={(e) => (this.isMatCha = e)}
            className="col-md-12"
            label={"Đã mất"}
            onChange={(value) => this.setState({ isMatCha: value })}
            readOnly={readOnly}
          />
          <div className="col-md-12">
            <div
              style={{ display: this.state.isMatCha ? "none" : "" }}
              className="row"
            >
              <FormTextBox
                ref={(e) => (this.sdtCha = e)}
                label="Số điện thoại cha"
                className="form-group col-md-6"
                type="phone"
                readOnly={readOnly}
              />
              <FormTextBox
                ref={(e) => (this.ngheNghiepCha = e)}
                label="Nghề nghiệp cha"
                className="form-group col-md-6"
                readOnly={readOnly}
              />
              <ComponentDiaDiem
                ref={(e) => (this.thuongTruCha = e)}
                label={
                  <span>
                    Địa chỉ thường trú của cha{" "}
                    {!readOnly && (
                      <a href="#" onClick={this.copyAddressCha}>
                        (Giống địa chỉ thường trú của <b>sinh viên</b>)
                      </a>
                    )}
                    <span className="text-danger ml-1">*</span>
                  </span>
                }
                className="form-group col-md-12"
                requiredSoNhaDuong={true}
                readOnly={readOnly}
                required
              />
            </div>
          </div>
          <FormTextBox
            ref={(e) => (this.tenMe = e)}
            label="Họ và tên mẹ"
            className="form-group col-md-6"
            readOnly={readOnly}
            required
          />
          <FormDatePicker
            ref={(e) => (this.ngaySinhMe = e)}
            label="Ngày sinh mẹ"
            type="date-mask"
            className="form-group col-md-6"
            readOnly={readOnly}
            required
          />
          <FormCheckbox
            ref={(e) => (this.isMatMe = e)}
            className="col-md-12"
            onChange={(value) => this.setState({ isMatMe: value })}
            label={"Đã mất"}
            readOnly={readOnly}
          />
          <div className="col-md-12">
            <div
              style={{ display: this.state.isMatMe ? "none" : "" }}
              className="row"
            >
              <FormTextBox
                ref={(e) => (this.sdtMe = e)}
                label="Số điện thoại mẹ"
                type="phone"
                className="form-group col-md-6"
                readOnly={readOnly}
              />
              <FormTextBox
                ref={(e) => (this.ngheNghiepMe = e)}
                label="Nghề nghiệp mẹ"
                className="form-group col-md-6"
                readOnly={readOnly}
              />
              <ComponentDiaDiem
                ref={(e) => (this.thuongTruMe = e)}
                label={
                  <span>
                    Địa chỉ thường trú của mẹ{" "}
                    {!readOnly && (
                      <a href="#" onClick={this.copyAddressMe}>
                        (Giống địa chỉ thường trú của <b>cha</b>)
                      </a>
                    )}
                    <span className="text-danger ml-1">*</span>
                  </span>
                }
                className="form-group col-md-12"
                requiredSoNhaDuong={true}
                readOnly={readOnly}
                required
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { tinhTrang } = this.props.system.user.data;
    let item =
      this.props.system && this.props.system.user
        ? this.props.system.user.student
        : null;
    let { ngayNhapHoc, canEdit, sectionEdit } = this.state;
    let readOnly = !(
      canEdit == 1 ||
      tinhTrang == 11 ||
      (sectionEdit && sectionEdit.includes("all"))
    );
    return this.renderPage({
      icon: "fa fa-user-circle-o",
      title: "Lý lịch cá nhân sinh viên",
      subTitle: (
        <i style={{ color: "blue" }}>{item ? item.ho + " " + item.ten : ""}</i>
      ),
      breadcrumb: [
        <Link key={0} to="/user/">
          Trang cá nhân
        </Link>,
        "Lý lịch cá nhân sinh viên",
      ],
      content: (
        <>
          <div className="tile">
            <h3 className="tile-title">Thông tin cơ bản</h3>
            <div className="tile-body">
              <div className="row">
                {/* <FormImageBox
                             ref={e => this.imageBox = e}
                             style={{ display: 'block' }}
                             label='Hình đại diện'
                             postUrl='/user/upload'
                             uploadType='SinhVienImage'
                             onSuccess={this.imageChanged}
                             readOnly={readOnly}
                             className='col-md-3 rounded-circle' isProfile={true}
                             /> */}
                <div className="form-group col-md-12">
                  <div className="row">
                    <FormTextBox
                      ref={(e) => (this.ho = e)}
                      label="Họ và tên lót"
                      className="form-group col-md-3"
                      readOnly
                      onChange={(e) =>
                        this.ho.value(e.target.value.toUpperCase())
                      }
                      required
                    />
                    <FormTextBox
                      ref={(e) => (this.ten = e)}
                      label="Tên"
                      className="form-group col-md-3"
                      readOnly
                      onChange={(e) =>
                        this.ten.value(e.target.value.toUpperCase())
                      }
                      required
                    />
                    <FormTextBox
                      ref={(e) => (this.mssv = e)}
                      label="Mã số sinh viên"
                      className="form-group col-md-3"
                      readOnly
                      required
                    />
                    <FormDatePicker
                      ref={(e) => (this.ngaySinh = e)}
                      label="Ngày sinh"
                      type="date-mask"
                      className="form-group col-md-3"
                      required
                      readOnly
                    />
                    <FormSelect
                      ref={(e) => (this.heDaoTao = e)}
                      label="Hệ đào tạo"
                      className="form-group col-md-3"
                      data={SelectAdapter_DmSvLoaiHinhDaoTao}
                      readOnly
                      required
                    />
                    <FormSelect
                      ref={(e) => (this.maNganh = e)}
                      label="Ngành"
                      className="form-group col-md-3"
                      data={SelectAdapter_DtNganhDaoTaoStudent}
                      readOnly
                      required
                    />
                    <FormSelect
                      ref={(e) => (this.maChuyenNganh = e)}
                      label="Chuyên ngành"
                      className="form-group col-md-3"
                      data={SelectAdapter_DtChuyenNganhDaoTao(
                        this.state.nganhSinhVien
                      )}
                      readOnly
                      required
                    />
                    <FormSelect
                      ref={(e) => (this.lopSinhVien = e)}
                      label="Lớp"
                      className="form-group col-md-3"
                      data={SelectAdapter_DtLopCtdt(this.state.ctdtSinhVien)}
                      readOnly
                      required
                    />
                    <FormSelect
                      ref={(e) => (this.gioiTinh = e)}
                      label="Giới tính"
                      className="form-group col-md-3"
                      data={SelectAdapter_DmGioiTinhV2}
                      readOnly={readOnly}
                      required
                    />
                    <FormSelect
                      className="col-md-3"
                      ref={(e) => (this.noiSinhQuocGia = e)}
                      data={SelectAdapter_DmQuocGia}
                      readOnly={readOnly}
                      label="Nơi sinh quốc gia"
                      required
                      onChange={(value) =>
                        this.setState({ noiSinhQuocGia: value.id })
                      }
                    />
                    {this.state.noiSinhQuocGia == "VN" && (
                      <FormSelect
                        className="col-md-3"
                        ref={(e) => (this.noiSinhMaTinh = e)}
                        data={ajaxSelectTinhThanhPho}
                        readOnly={readOnly}
                        label="Nơi sinh"
                        required
                      />
                    )}
                    {tinhTrang == 11 && (
                      <FormTextBox
                        ref={(e) => (this.phongThuTuc = e)}
                        label="Phòng làm thủ tục"
                        className="form-group col-md-3"
                        readOnly={true}
                      />
                    )}
                  </div>
                </div>
                <ComponentDiaDiem
                  ref={(e) => (this.thuongTru = e)}
                  label={
                    <span>
                      Địa chỉ thường trú
                      <span className="text-danger ml-1">*</span>
                    </span>
                  }
                  className="form-group col-md-12"
                  requiredSoNhaDuong={true}
                  readOnly={readOnly}
                />
                {this.componentNoiTruTamTru()}
                {this.componentThongTinLienLac()}
                {/* {this.componentThongTinNganHang()} */}
                {this.componentThongTinKhac()}
              </div>
            </div>
          </div>
          {this.componentThongTinNganHang()}
          <div className="tile">
            <h4 className="tile-title">
              Ảnh thẻ sinh viên <span className="text-danger">*</span>
            </h4>
            <div className="tile-body">
              <div
                className="d-flex justify-content-evently align-items-center"
                style={{ gap: 10 }}
              >
                <FormImageBox
                  ref={(e) => (this.anhThe = e)}
                  uploadType="CardImage"
                  readOnly={readOnly}
                  boxUploadStye={{ width: "150px" }}
                  height="200px"
                  onSuccess={this.onUploadAnhThe}
                />
                <ul style={{}}>
                  <li>
                    Vui lòng tải lên ảnh{" "}
                    <b className="text-danger">đúng kích thước (3 x 4cm)</b>.
                  </li>
                  <li>
                    Độ lớn của file ảnh{" "}
                    <b className="text-danger">không quá 1MB</b>. Giảm kích
                    thước file ảnh tại{" "}
                    <a
                      href="https://www.iloveimg.com/compress-image"
                      target="_blank"
                      rel="noreferrer"
                    >
                      đây
                    </a>
                  </li>
                  <li>
                    Ảnh phải có nền 1 màu (trắng hoặc xanh), chi tiết rõ nét,
                    nghiêm túc.
                  </li>
                  <li>
                    Đây là ảnh phục vụ cho công tác in thẻ sinh viên,{" "}
                    <b className="text-danger">bắt buộc</b> sinh viên phải tải
                    lên để hoàn thành bổ sung thông tin và chịu trách nhiệm với
                    ảnh thẻ mình.
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* <div className='tile'>
                    <h4 className='tile-title'>Cập nhật thông tin tài khoản ngân hàng của sinh viên <span className='text-danger'>*</span></h4>
                    <div className='tile-body'>
                        <FormSelect className='col-md-12' ref={e => this.tenNganhangCapNhat = e} label='Tên ngân hàng' data={SelectAdapter_DmNganHang} required />
                        <FormTextBox className='col-md-12' ref={e => this.tenChuTaiKhoan = e} label='Tên chủ tài khoản' required disabled />
                        <FormTextBox className='col-md-12' ref={e => this.soTaiKhoanNganHangCapNhat = e} label='Số tài khoản ngân hàng' required />
                    </div>
                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                        <button className='btn btn-primary' type='button' onClick={e => e.preventDefault() || this.onSubmit()} >
                            Lưu thông tin
                        </button>
                    </div>
                </div> */}
          <div className="tile">
            <h4 className="tile-title">Hướng dẫn thao tác</h4>
            <div className="tile-body">
              <ul className="col-md-12">
                <li>
                  Để <b>cập nhật và lưu thay đổi thông tin lý lịch</b>, sinh
                  viên nhấp và biểu tượng:
                  <div
                    className="btn btn-circle btn-success"
                    style={{ scale: "80%" }}
                  >
                    <i className="fa fa-lg fa-save" />
                  </div>
                </li>

                <li>
                  Để lưu và nhận tệp tin{" "}
                  <b className="text-primary">Sơ yếu lí lịch</b> và{" "}
                  <b className="text-primary">Biên nhận nhập học</b>, sinh viên
                  nhấp vào biểu tượng:
                  <div
                    className="btn btn-circle btn-danger"
                    style={{ scale: "80%" }}
                  >
                    <i className="fa fa-lg fa-file-pdf-o" />
                  </div>
                </li>
              </ul>
            </div>
          </div>
          {/* <DangKyBaoHiemModal ref={e => this.baoHiemModal = e} /> */}
          <BhModal ref={(e) => (this.infoBhytModal = e)} />
        </>
      ),
      backRoute: "/user",
      buttons: [
        (canEdit || sectionEdit || tinhTrang == 11) && {
          icon: "fa-save",
          className: "btn-success",
          onClick: this.save,
          tooltip: "Lưu thay đổi thông tin của bạn",
        },
        ((ngayNhapHoc == -1 && canEdit) || tinhTrang == 11) && {
          icon: "fa-file-pdf-o",
          className: "btn-danger",
          onClick: this.downloadWord,
          tooltip: "Xuất Sơ yếu lý lịch của bạn",
        },
        ngayNhapHoc == -1 &&
          !canEdit && {
            icon: "fa-arrow-down",
            className: "btn-info",
            onClick: this.downloadSyll,
            tooltip: "Tải Sơ yếu lý lịch của bạn",
          },
      ],
    });
  }
}

const mapStateToProps = (state) => ({ system: state.system });
const mapActionsToProps = {
  getSinhVienEditUser,
  updateStudentUser,
  updateSystemState,
  downloadWord,
  updateStudentUserNganHangInfo,
};
export default connect(mapStateToProps, mapActionsToProps)(SinhVienPage);
