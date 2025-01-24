import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, FormSelect, FormDatePicker, FormCheckbox, FormTabs, renderTable, TableCell } from 'view/component/AdminPage';
import { getStudentAdmin, updateStudentAdmin, getStudentChungNhanAdmin, getStudentQuyetDinhAdmin, downloadQuyetDinhWord, createStudentManageQuyetDinh, updateStudentManageQuyetDinh, huyQuyetDinh, createStudentChungNhanAdmin, updateStudentChungNhanAdmin, deleteStudentChungNhanAdmin, getStudentQuyetDinhKhenThuong } from './redux';
import { downloadWord } from 'modules/mdCongTacSinhVien/svManageForm/redux';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_CstvDmQuocGia } from '../ctsvDmQuocGia/redux';
import { SelectAdapter_CtsvDmDanToc } from '../ctsvDmDanToc/redux';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { SelectAdapter_CtsvDmTonGiao } from '../ctsvDmTonGiao/redux';
import { SelectAdapter_CtsvDmGioiTinh } from '../ctsvDmGioiTinh/redux';
// import { SelectAdapter_DtNganhDaoTaoStudent } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_CtsvDmTinhThanhPho } from '../ctsvDmDiaDiem/reduxTinhThanhPho';
import { SelectAdapter_CtsvDmDoiTuongTs } from '../ctsvDmDoiTuongTs/redux';
import { SelectAdapter_CtsvDmPhuongThucTuyenSinh } from '../ctsvDmPhuongThucTuyenSinh/redux';
import { SelectAdapter_CtsvDmTinhTrangSinhVien } from '../ctsvDmTinhTrangSinhVien/redux';
import AddModal from 'modules/mdCongTacSinhVien/svManageQuyetDinh/modal/addModal';
import { Tooltip } from '@mui/material';
import HuyQuyetDinhModal from '../svManageQuyetDinh/HuyQuyetDinhModal';
import { AddModal as ChungNhanAddModal, EditModal as ChungNhanEditModal } from '../svManageForm/adminPage';
import ChungNhanRejectModal from '../svManageForm/RejectModal';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { getDtChuongTrinhDaoTaoTheoNganh, SelectAdapter_KhungDaoTaoCtsvFilter, SelectAdapter_KhungDaoTaoCtsv } from '../ctsvDtChuongTrinhDaoTao/redux';
import { SelectAdapter_DtNganhDaoTao, SelectAdapter_DtNganhDaoTaoV2 } from '../ctsvDtNganhDaoTao/redux';
import { SelectAdapter_DtChuyenNganhDaoTao } from '../ctsvDtChuyenNganh/redux';
import { SelectAdapter_DtLopCtdt } from '../ctsvDtLop/redux';
import { getCtdt, getSoQuyetDinhRaCuoi } from '../svManageQuyetDinh/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmCaoDang } from 'modules/mdCongTacSinhVien/dmCaoDangHocVien/redux';
import { SelectAdapter_DmDaiHoc } from 'modules/mdCongTacSinhVien/dmDaiHoc/redux';
import { ajaxSelectTinhThanhPho } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import BangDiem from './bangDiemComponent';
import BangDiemRenLuyen from './component/diemRenLuyenComponent';
import { SelectAdapter_DmNoiCapCccd } from 'modules/mdDanhMuc/dmNoiCapCccd/redux';
import ThongTinKhacComponent from './component/thongTinKhac';
import BangDiemSection from 'modules/mdDaoTao/dtMoPhongDangKy/section/BangDiemSection';
import LichSuKyLuat from './component/lichSuKyLuatComponent';


const APPROVED_MAPPER = {
    3: <span className='text-primary'><i className='fa fa-asterisk' /> Đang xử lý</span>,
    2: <span className='text-success'><i className='fa fa-check' /> Đã nhận</span>,
    1: <span className='text-info'><i className='fa fa-clock-o' /> Chấp nhận</span>,
    0: <span className='text-danger'><i className='fa fa-plus-square' /> Đăng ký mới</span>,
    [-1]: <span className='text-secondary'><i className='fa fa-times' /> Từ chối</span>,
};

const notificationChapNhan = (toEmail, tenBieuMau) => ({
    toEmail: toEmail,
    title: `Biểu mẫu ${tenBieuMau} đã được xác nhận`,
    subTitle: 'Vui lòng đến nhận kết quả 2 ngày sau',
    icon: 'fa-check',
    iconColor: 'success',
    link: '/user/chung-nhan-truc-tuyen'
}), TEXT_APPROVED_MAPPER = {
    'C': 'hoàn thành',
    'A': 'xử lý',
};

class SinhVienPage extends AdminPage {
    state = { item: null, lastModified: null, image: '', noiTru: false, daTotNghiepDd: false, daTotNghiepCd: false, daTotNghiepTc: false, daTotNghiepPt: false, truongDhKhac: false, truongCdKhac: false, noiSinhQuocGia: null, isMatCha: false, isMatMe: false }
    totNghiep = { 'ĐH': {}, 'CĐ': {}, 'TC': {}, 'PT': {}, };
    daTotNghiep = {}
    isAllFilled = true;
    firstInvalidIndex = null;

    componentDidMount() {
        T.ready('/user/ctsv', () => {
            let route = T.routeMatcher('/user/ctsv/profile/:mssv'),
                mssv = route.parse(window.location.pathname).mssv;
            this.props.getStudentAdmin(mssv, data => {
                if (data.error) {
                    T.notify('Lấy thông tin sinh viên bị lỗi!', 'danger');
                } else {
                    this.setState({
                        noiSinhQuocGia: data.noiSinhQuocGia ? data.noiSinhQuocGia : 'VN',
                        mssv, emailTruong: data.emailTruong, tinhTrangHienTai: data.tinhTrang, canEdit: true,
                        loaiHinhDaoTao: data.loaiHinhDaoTao, khoaDtSinhVien: data.khoaSinhVien || data.namVao,
                        ctdtSinhVien: data.maCtdt || data.dataCtdt.maCtdt, nganhSinhVien: data.maNganh,
                        chuyenNganhSinhVien: data.maChuyenNganh || '', heDaoTaoLop: data.heDaoTao || data.loaiHinhDaoTao,
                        namVao: data.dataCtdt.khoaSinhVien, khoa: data.khoa,
                        noiTru: data.maNoiTru ? true : false,
                        daTotNghiepDh: (data.dataTotNghiep['ĐH'] != undefined), daTotNghiepCd: (data.dataTotNghiep['CĐ'] != undefined), daTotNghiepTc: (data.dataTotNghiep['TC'] != undefined), daTotNghiepPt: (data.dataTotNghiep['PT'] != undefined),
                        truongDhKhac: (data.dataTotNghiep['ĐH'] != undefined && data.dataTotNghiep['ĐH'][0].truongKhac != null),
                        truongCdKhac: (data.dataTotNghiep['CĐ'] != undefined && data.dataTotNghiep['CĐ'][0].truongKhac != null),
                    }, () => this.setVal(data, () => this.getAndValidate(false)));
                    this.bangDiem.setValue(mssv, 1);
                    this.props.getStudentChungNhanAdmin(undefined, undefined, data.emailTruong);
                    this.props.getStudentQuyetDinhAdmin(undefined, undefined, data.emailTruong, { kieuQuyetDinh: '', isDeleted: '0', ks_mssv: mssv });
                    this.props.getStudentQuyetDinhKhenThuong(undefined, undefined, mssv);
                }
            });
        });
        T.socket.on('updated-data', (data) => {
            if (data && !data.isNew) {
                const { firstName, lastName, action, maDangKy } = data;
                TEXT_APPROVED_MAPPER[action] && T.notify(`Cán bộ ${firstName} ${lastName} đã ${TEXT_APPROVED_MAPPER[action]} !${maDangKy}`, 'info');
            }
            this.props.getSvManageFormPage();
        });
    }

    componentWillUnmount() {
        T.socket.off('updated-data');
    }

    setVal = (data = {}, done) => {
        this.mssv.value(data.mssv ? data.mssv : '');
        this.ho.value(data.ho ? data.ho : '');
        this.ten.value(data.ten ? data.ten : '');
        this.ngaySinh.value(data.ngaySinh ? data.ngaySinh : '');
        this.danToc.value(data.danToc ? data.danToc : '');
        this.cmnd.value(data.cmnd || '');
        this.ngayNhapHoc.value(data.ngayNhapHoc > 0 ? data.ngayNhapHoc : '');
        this.tinhTrang.value(data.tinhTrang || '');
        this.cmndNgayCap.value(data.cmndNgayCap);
        this.cmndNoiCap.value(data.cmndNoiCap || '');
        this.dienThoaiCaNhan.value(data.dienThoaiCaNhan ? data.dienThoaiCaNhan : '');
        this.emailCaNhan.value(data.emailCaNhan ? data.emailCaNhan : '');
        this.gioiTinh.value(data.gioiTinh ? ('0' + String(data.gioiTinh)) : '');
        this.noiSinhQuocGia.value(data.noiSinhQuocGia ? data.noiSinhQuocGia : 'VN');
        this.state.noiSinhQuocGia == 'VN' && this.noiSinhMaTinh.value(data.noiSinhMaTinh);
        this.doiTuongTuyenSinh.value(data.doiTuongTuyenSinh);
        this.khuVucTuyenSinh.value(data.khuVucTuyenSinh);
        this.phuongThucTuyenSinh.value(data.phuongThucTuyenSinh);
        this.diemThi.value(data.diemThi ? Number(data.diemThi).toFixed(2) : '0.00');
        this.doiTuongChinhSach.value(data.doiTuongChinhSach);
        // this.maNganh.value(data.maNganh ? data.maNganh : '');
        this.thuongTru.value(data.thuongTruMaTinh, data.thuongTruMaHuyen, data.thuongTruMaXa, data.thuongTruSoNha);
        this.tenCha.value(data.tenCha ? data.tenCha : '');
        this.ngaySinhCha.value(data.ngaySinhCha ? data.ngaySinhCha : '');
        if (data.sdtCha == '-1') {
            this.setState({ isMatCha: true }, () => this.isMatCha.value(1));
        } else {
            this.sdtCha.value(data.sdtCha ? data.sdtCha : '');
            this.ngheNghiepCha.value(data.ngheNghiepCha ? data.ngheNghiepCha : '');
            this.thuongTruCha.value(data.thuongTruMaTinhCha?.toString().length == 1 ? `0${data.thuongTruMaTinhCha}` : data.thuongTruMaTinhCha, data.thuongTruMaHuyenCha, data.thuongTruMaXaCha, data.thuongTruSoNhaCha);
        }
        this.tenMe.value(data.tenMe ? data.tenMe : '');
        this.ngaySinhMe.value(data.ngaySinhMe ? data.ngaySinhMe : '');
        if (data.sdtMe == '-1') {
            this.setState({ isMatMe: true }, () => this.isMatMe.value(1));
        } else {
            this.sdtMe.value(data.sdtMe ? data.sdtMe : '');
            this.ngheNghiepMe.value(data.ngheNghiepMe ? data.ngheNghiepMe : '');
            this.thuongTruMe.value(data.thuongTruMaTinhMe?.toString().length == 1 ? `0${data.thuongTruMaTinhMe}` : data.thuongTruMaTinhMe, data.thuongTruMaHuyenMe, data.thuongTruMaXaMe, data.thuongTruSoNhaMe);
        }
        this.thuongTruNguoiLienLac.value(data.lienLacMaTinh, data.lienLacMaHuyen, data.lienLacMaXa, data.lienLacSoNha);
        this.tonGiao.value(data.tonGiao ? data.tonGiao : '');
        this.quocTich.value(data.quocGia ? data.quocGia : '');
        // this.imageBox.setData('SinhVienImage:' + data.mssv, data.image ? data.image : '/img/avatar.png');
        this.hoTenNguoiLienLac.value(data.hoTenNguoiLienLac ? data.hoTenNguoiLienLac : '');
        this.sdtNguoiLienLac.value(data.sdtNguoiLienLac ? data.sdtNguoiLienLac : '');
        data.ngayVaoDang && this.setState({ isDangVien: true }, () => {
            this.isDangVien.value();
            this.ngayVaoDang.value(data.ngayVaoDang);
        });
        data.ngayVaoDoan && this.setState({ isDoanVien: true }, () => {
            this.isDoanVien.value();
            this.ngayVaoDoan.value(data.ngayVaoDoan);
        });
        // Thong tin Hoc vu
        this.lopSinhVien.value(data.maLop || '');
        this.khoaDtSinhVien.value(data.khoaSinhVien || '');
        this.ctdtSinhVien.value(data.maCtdt || '');
        this.nganhSinhVien.value(data.maNganh || '');
        this.chuyenNganhSinhVien.value(data.maChuyenNganh || '');
        this.heDaoTaoLop.value(data.loaiHinhDaoTao || '');
        this.nienKhoa.value(data.nienKhoa || '');
        // Thong tin trung tuyen
        this.loaiHinhDaoTao.value(data.dataCtdt.loaiHinhDaoTao || '');
        this.namVao.value(data.namVao || '');
        this.khoaTrungTuyen.value(data.dataCtdt.maKhoa || '');
        this.nganhTrungTuyen.value(data.dataCtdt.maNganh || '');
        this.ctdtTrungTuyen.value(data.dataCtdt.maCtdt || '');
        // Loại tạm trú
        this.noiTru.value(this.state.noiTru);
        if (this.state.noiTru) {
            // địa chỉ nội trú
            const { ktxTen, ktxToaNha, ktxSoPhong } = data.dataNoiTru || {};
            this.ktxTen.value(ktxTen || '');
            this.ktxToaNha.value(ktxToaNha || '');
            this.ktxSoPhong.value(ktxSoPhong || '');
        } else {
            // địa chỉ tạm trú
            const { tamTruMaTinh, tamTruMaHuyen, tamTruMaXa, tamTruSoNha } = data.dataTamTru || {};
            this.tamTru.value(tamTruMaTinh || '', tamTruMaHuyen || '', tamTruMaXa || '', tamTruSoNha || '');
        }
        if (data.dataTotNghiep) {
            Object.keys(data.dataTotNghiep).forEach(trinhDo => {
                // this.daTotNghiep[trinhDo].value(1);
                Object.keys(this.totNghiep[trinhDo]).forEach(key => {
                    this.totNghiep[trinhDo][key].value(data.dataTotNghiep[trinhDo][0][key] || '');
                });
                if (data.dataTotNghiep[trinhDo][0]['truongKhac']) {
                    this.totNghiep[trinhDo]['truongKhac']?.value(data.dataTotNghiep[trinhDo][0]['truongKhac']);
                }
            });
        }
        // thong tin ngan hang
        this.soTkNh.value(data.soTkNh || '');
        this.chiNhanhNh.value(data.chiNhanhNh || '');
        this.tenNh.value(data.tenNganHang || '');
        this.thongTinKhac.setUpData(data.ghiChu);
        setTimeout(() => {
            done && done();
        }, 1000);
    };

    getAndValidate = (validate = true) => {
        try {
            const { maTinhThanhPho: thuongTruMaTinh, maQuanHuyen: thuongTruMaHuyen, maPhuongXa: thuongTruMaXa, soNhaDuong: thuongTruSoNha } = this.getAddressValue(this.thuongTru, validate),
                { maTinhThanhPho: lienLacMaTinh, maQuanHuyen: lienLacMaHuyen, maPhuongXa: lienLacMaXa, soNhaDuong: lienLacSoNha } = this.getAddressValue(this.thuongTruNguoiLienLac, validate),
                { maTinhThanhPho: tamTruMaTinh, maQuanHuyen: tamTruMaHuyen, maPhuongXa: tamTruMaXa, soNhaDuong: tamTruSoNha } = this.tamTru?.value() || {};

            const emailCaNhan = this.emailCaNhan.value();
            if (emailCaNhan && !T.validateEmail(emailCaNhan)) {
                this.emailCaNhan.focus();
                T.notify('Email cá nhân không hợp lệ', 'danger');
                return false;
            } else {
                const data = {
                    ho: this.getValue(this.ho, null, validate),
                    ten: this.getValue(this.ten, null, validate),
                    mssv: this.getValue(this.mssv, null, validate),
                    ngaySinh: this.getValue(this.ngaySinh, 'date', validate),
                    cmnd: this.getValue(this.cmnd, null, validate),
                    cmndNgayCap: this.getValue(this.cmndNgayCap, 'date', validate),
                    cmndNoiCap: this.getValue(this.cmndNoiCap, null, validate),
                    noiSinhMaTinh: this.state.noiSinhQuocGia == 'VN' ? this.getValue(this.noiSinhMaTinh, null, validate) : null,
                    noiSinhQuocGia: this.getValue(this.noiSinhQuocGia, null, validate),
                    danToc: this.getValue(this.danToc, null, validate),
                    dienThoaiCaNhan: this.getValue(this.dienThoaiCaNhan, null, validate),
                    emailCaNhan: this.getValue(this.emailCaNhan, null, validate),
                    tinhTrang: this.getValue(this.tinhTrang, null, validate),
                    ngayNhapHoc: this.getValue(this.ngayNhapHoc, 'date', false),
                    gioiTinh: this.getValue(this.gioiTinh, null, validate),
                    doiTuongTuyenSinh: this.getValue(this.doiTuongTuyenSinh, null, validate),
                    khuVucTuyenSinh: this.getValue(this.khuVucTuyenSinh, null, validate),
                    phuongThucTuyenSinh: this.getValue(this.phuongThucTuyenSinh, null, validate),
                    doiTuongChinhSach: this.getValue(this.doiTuongChinhSach, null, validate),

                    tonGiao: this.getValue(this.tonGiao, null, validate),
                    quocGia: this.getValue(this.quocTich, null, validate),
                    thuongTruMaHuyen, thuongTruMaTinh, thuongTruMaXa, thuongTruSoNha,
                    lienLacMaHuyen, lienLacMaTinh, lienLacMaXa, lienLacSoNha,
                    hoTenNguoiLienLac: this.getValue(this.hoTenNguoiLienLac, null, validate),
                    sdtNguoiLienLac: this.getValue(this.sdtNguoiLienLac, null, validate),
                    ngayVaoDang: this.state.isDangVien ? this.getValue(this.ngayVaoDang, 'date', validate) : '',
                    ngayVaoDoan: this.state.isDoanVien ? this.getValue(this.ngayVaoDoan, 'date', validate) : '',
                    // Thong tin ngan hang
                    chiNhanhNh: this.getValue(this.chiNhanhNh, null, validate),
                    soTkNh: this.getValue(this.soTkNh, null, validate),
                    tenNganHang: this.getValue(this.tenNh, null, validate),
                    // Thong tin hoc vu
                    khoaSinhVien: this.getValue(this.khoaDtSinhVien, null, validate),
                    loaiHinhDaoTao: this.getValue(this.heDaoTaoLop, null, validate),
                    lop: this.getValue(this.lopSinhVien, null, validate),
                    maCtdt: this.getValue(this.ctdtTrungTuyen, null, validate),
                    maNganh: this.getValue(this.nganhSinhVien, null, validate),
                    khoa: this.state.khoa,
                    namVao: this.getValue(this.namVao, null, validate),
                    // Thong tin noi/tam tru
                    noiTru: Number(this.state.noiTru),
                    ...(this.state.noiTru ?
                        {
                            // Thong tin noi tru
                            ktxTen: this.getValue(this.ktxTen, null, validate),
                            ktxToaNha: this.getValue(this.ktxToaNha, null, validate),
                            ktxSoPhong: this.getValue(this.ktxSoPhong, null, validate),
                        } : {
                            // Thong tin tam tru
                            tamTruMaTinh, tamTruMaHuyen, tamTruMaXa, tamTruSoNha
                        }),
                    tenCha: this.getValue(this.tenCha, null, validate),
                    ngaySinhCha: this.getValue(this.ngaySinhCha, 'date', validate),
                    tenMe: this.getValue(this.tenMe, null, validate),
                    ngaySinhMe: this.getValue(this.ngaySinhMe, 'date', validate),
                    // Thông tin khác
                    ghiChu: this.thongTinKhac.getData() || 0,
                };

                data.ngayNhapHoc = data.ngayNhapHoc && data.ngayNhapHoc > 0 ? data.ngayNhapHoc : -1;
                if (!this.state.isMatCha) {
                    const { maTinhThanhPho: thuongTruMaTinhCha, maQuanHuyen: thuongTruMaHuyenCha, maPhuongXa: thuongTruMaXaCha, soNhaDuong: thuongTruSoNhaCha } = this.getAddressValue(this.thuongTruCha, validate);
                    data.tenCha = this.getValue(this.tenCha, null, validate);
                    data.ngaySinhCha = this.getValue(this.ngaySinhCha, 'date', validate);
                    data.ngheNghiepCha = this.getValue(this.ngheNghiepCha, null, validate);
                    data.thuongTruMaHuyenCha = thuongTruMaHuyenCha;
                    data.thuongTruMaTinhCha = thuongTruMaTinhCha;
                    data.thuongTruMaXaCha = thuongTruMaXaCha;
                    data.thuongTruSoNhaCha = thuongTruSoNhaCha;
                    data.sdtCha = this.getValue(this.sdtCha, null, validate);
                } else {
                    data.sdtCha = '-1';
                }
                if (!this.state.isMatMe) {
                    const { maTinhThanhPho: thuongTruMaTinhMe, maQuanHuyen: thuongTruMaHuyenMe, maPhuongXa: thuongTruMaXaMe, soNhaDuong: thuongTruSoNhaMe } = this.getAddressValue(this.thuongTruMe, validate);
                    data.tenMe = this.getValue(this.tenMe, null, validate);
                    data.ngaySinhMe = this.getValue(this.ngaySinhMe, 'date', validate);
                    data.ngheNghiepMe = this.getValue(this.ngheNghiepMe, null, validate);
                    data.sdtMe = this.getValue(this.sdtMe, null, validate);
                    data.thuongTruMaHuyenMe = thuongTruMaHuyenMe;
                    data.thuongTruMaTinhMe = thuongTruMaTinhMe;
                    data.thuongTruMaXaMe = thuongTruMaXaMe;
                    data.thuongTruSoNhaMe = thuongTruSoNhaMe;
                } else {
                    data.sdtMe = '-1';
                }
                return data;
            }
        } catch (selector) {
            selector.props && selector.focus();
            T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    };

    copyAddress = e => {
        e.preventDefault();
        const dataThuongTru = this.thuongTru.value();
        this.lienLac.value(dataThuongTru.maTinhThanhPho, dataThuongTru.maQuanHuyen, dataThuongTru.maPhuongXa, dataThuongTru.soNhaDuong);
    };

    copyAddressCha = e => {
        e.preventDefault();
        const dataThuongTru = this.thuongTru.value();
        this.thuongTruCha.value(dataThuongTru.maTinhThanhPho, dataThuongTru.maQuanHuyen, dataThuongTru.maPhuongXa, dataThuongTru.soNhaDuong);
    };

    copyAddressMe = e => {
        e.preventDefault();
        const dataThuongTru = this.thuongTruCha.value();
        this.thuongTruMe.value(dataThuongTru.maTinhThanhPho, dataThuongTru.maQuanHuyen, dataThuongTru.maPhuongXa, dataThuongTru.soNhaDuong);
    };

    copAddressTo = (e, address) => {
        e.preventDefault();
        const dataThuongTru = this.thuongTru.value();
        address.value(dataThuongTru.maTinhThanhPho, dataThuongTru.maQuanHuyen, dataThuongTru.maPhuongXa, dataThuongTru.soNhaDuong);
    }

    imageChanged = (data) => {
        if (data && data.image) {
            const user = Object.assign({}, this.props.system.user, { image: data.image });
            this.props.updateSystemState({ user });
        }
    };

    // getValue = (selector, type = null, validate = true) => {
    //     const data = selector.value();
    //     const isRequired = selector.props.required;
    //     if (data || data === 0) {
    //         if (type && type === 'date') return data.getTime();
    //         else if (type && type === 'number') return Number(data);
    //         return data;
    //     }
    //     if (validate && isRequired) throw selector;
    //     return '';
    // }

    getValue = (selector, type = null, validate = true) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) {
            selector.valid && selector.valid(true);
            if (type && type === 'date') return data.getTime();
            else if (type && type === 'number') return Number(data);
            return data;
        }
        if (isRequired) {
            if (validate) throw selector;
            // (this.state.tinhTrang == 11 || this.state.ngayNhapHoc == -1) && (this.isAllFilled = false);
            selector.valid && selector.valid(false);
            !this.firstInvalidIndex && selector.props && (selector.props.index === 0 || selector.props.index) && (this.firstInvalidIndex = selector.props.index);
        }
        return '';
    };

    getAddressValue = (selector, validate = true) => {
        const { maTinhThanhPho, maQuanHuyen, maPhuongXa, soNhaDuong } = selector.value();
        const { required, requiredSoNhaDuong } = selector.props;
        if (maPhuongXa && (!requiredSoNhaDuong || soNhaDuong)) {
            selector.valid && selector.valid(true);
            return { maTinhThanhPho, maQuanHuyen, maPhuongXa, soNhaDuong };
        }
        if (required) {
            // Check empty ngược từ số nhà đến tỉnh thành
            if (validate) throw (requiredSoNhaDuong && !soNhaDuong && selector.soNhaDuong) || (!maPhuongXa && selector.maPhuongXa) || (!maQuanHuyen && selector.maQuanHuyen) || (!maTinhThanhPho && selector.maTinhThanhPho);
            // (this.state.tinhTrang == 11 || this.state.ngayNhapHoc == -1) && (this.isAllFilled = false);
            selector.valid && selector.valid(false);
            !this.firstInvalidIndex && selector.props && (selector.props.index === 0 || selector.props.index) && (this.firstInvalidIndex = selector.props.index);
        }
        return { maTinhThanhPho, maQuanHuyen, maPhuongXa, soNhaDuong };
    }

    getData = () => {
        const studentData = this.getAndValidate(false);
        if (studentData) {
            this.props.updateStudentAdmin(this.state.mssv, { ...studentData });
        }
    }

    save = () => {
        T.confirm('CẢNH BÁO', 'Bạn có chắc chắn muốn lưu thay đổi thông tin cá nhân sinh viên?', 'warning', true, isConfirm => {
            if (isConfirm) {
                this.getData();
            }
        });
    };

    renderSwitch(param) {
        switch (param) {
            case null:
                return APPROVED_MAPPER[0];
            case 'A':
                return APPROVED_MAPPER[1];
            case 'C':
                return APPROVED_MAPPER[2];
            case 'P':
                return APPROVED_MAPPER[3];
            case 'R':
                return APPROVED_MAPPER[-1];
            default:
                return 'Unknown State';
        }
    }

    downloadChungNhan = (e, item) => {
        e.preventDefault();
        this.props.downloadWord(item.maDangKy, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), item.mssvDangKy + '_' + item.maFormDangKy + '.docx');
        });
    }

    deleteChungNhan = (item) => {
        T.confirm('Xóa chứng nhận này', 'Bạn có chắc bạn muốn xóa chứng nh này?', true, isConfirm =>
            isConfirm && this.props.deleteStudentChungNhanAdmin(item.maDangKy));
    }

    componentThongTinCaNhan = () => {
        let { canEdit } = this.state;
        let readOnly = !canEdit;
        return <div className='row mt-3'>
            {/* <ComponentDiaDiem ref={e => this.thuongTru = e} label='Thường trú' className='form-group col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} required /> */}
            <ComponentDiaDiem ref={e => this.thuongTru = e} label={<span>Địa chỉ thường trú</span>} className='form-group col-md-12' required
                requiredSoNhaDuong={true} readOnly={readOnly} />
            <div className='col-md-12'>
                <div className='row'>
                    <h6 className='col-md-12'>Thông tin tạm trú và nội trú</h6>
                    <FormCheckbox className='col-md-12' ref={e => this.noiTru = e} label='Ở ký túc xá' onChange={() => this.setState({ noiTru: !this.state.noiTru })} readOnly={readOnly} />
                    {this.state.noiTru ?
                        <div className='row col-md-12'>
                            <FormSelect ref={e => this.ktxTen = e} className='col-md-8' label="Ký túc xá" minimumResultsForSearch='-1' data={['Ký túc xá khu A', 'Ký túc xá khu B']} onChange={() => this.ktxToaNha.focus()} readOnly={readOnly} />
                            <FormTextBox ref={e => this.ktxToaNha = e} className='col-md-4' label="Tòa nhà" onKeyDown={e => e.code === 'Enter' && this.ktxPhong.focus()} readOnly={readOnly} />
                            <FormTextBox ref={e => this.ktxSoPhong = e} className='col-md-4' label="Số phòng" readOnly={readOnly} />
                        </div>
                        :
                        <ComponentDiaDiem ref={e => this.tamTru = e} className='col-md-12' label={<span>Địa chỉ tạm trú {!readOnly && <a href='#' onClick={(e) => this.copyAddressTo(e, this.tamTru)}>(Giống địa chỉ thường trú của <b>sinh viên</b>)</a>}</span>} requiredSoNhaDuong={true} readOnly={readOnly} />
                    }
                </div>
            </div>
            <h6 className='col-md-12'>Thông tin liên lạc</h6>
            <FormTextBox ref={e => this.dienThoaiCaNhan = e} label='Điện thoại cá nhân sinh viên' className='form-group col-md-6' type='phone' readOnly={readOnly} required />
            <FormTextBox ref={e => this.emailCaNhan = e} label='Email cá nhân sinh viên' className='form-group col-md-6' readOnly={readOnly} required />
            <FormTextBox ref={e => this.hoTenNguoiLienLac = e} label='Họ và tên người liên lạc' className='form-group col-md-6' readOnly={readOnly} required />
            <FormTextBox ref={e => this.sdtNguoiLienLac = e} label='Số điện thoại' className='form-group col-md-6' type='phone' readOnly={readOnly} required />
            <ComponentDiaDiem ref={e => this.thuongTruNguoiLienLac = e} label='Địa chỉ liên lạc' className='form-group col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} required />
            <h6 className='col-md-12'>Thông tin ngân hàng</h6>
            <FormTextBox ref={e => this.soTkNh = e} label='Số tài khoản ngân hàng' className='form-group col-md-6' readOnly={readOnly} />
            <FormTextBox ref={e => this.tenNh = e} label='Tên ngân hàng' className='form-group col-md-6' readOnly={readOnly} />
            <FormTextBox ref={e => this.chiNhanhNh = e} label='Chi nhánh ngân hàng' className='form-group col-md-6' readOnly={readOnly} />
            <h6 className='col-md-12'>Thông tin khác</h6>
            <FormTextBox ref={e => this.cmnd = e} label='CCCD/Mã định danh' className='col-md-4' readOnly={readOnly} required />
            <FormDatePicker type='date-mask' ref={e => this.cmndNgayCap = e} label='Ngày cấp' className='col-md-4' readOnly={readOnly} required />
            {/* <FormTextBox ref={e => this.cmndNoiCap = e} label='Nơi cấp' className='col-md-4' readOnly={readOnly} required /> */}
            <FormSelect ref={e => this.cmndNoiCap = e} label='Nơi cấp' className='col-md-4' readOnly={readOnly} data={SelectAdapter_DmNoiCapCccd} required />
            <FormSelect ref={e => this.quocTich = e} label='Quốc tịch' className='form-group col-md-4' data={SelectAdapter_CstvDmQuocGia} readOnly={readOnly} required />
            <FormSelect ref={e => this.danToc = e} label='Dân tộc' className='form-group col-md-4' data={SelectAdapter_CtsvDmDanToc} readOnly={readOnly} required />
            <FormSelect ref={e => this.tonGiao = e} label='Tôn giáo' className='form-group col-md-4' data={SelectAdapter_CtsvDmTonGiao} readOnly={readOnly} required />
            <FormTextBox ref={e => this.doiTuongChinhSach = e} label='Đối tượng chính sách' placeholder='Ghi rõ đối tượng chính sách, nếu không thuộc diện này thì ghi là Không' className='col-md-12' readOnly={readOnly} required />
            <FormCheckbox label='Đảng viên' className={this.state.isDangVien ? 'col-md-3' : 'col-md-12'} onChange={value => this.setState({ isDangVien: value })} ref={e => this.isDangVien = e} readOnly={readOnly} />
            <FormDatePicker label='Ngày vào đảng' className='col-md-9' style={{ display: this.state.isDangVien ? 'block' : 'none' }} type='date-mask' ref={e => this.ngayVaoDang = e} readOnly={readOnly} />
            <FormCheckbox label='Đoàn viên' className={this.state.isDoanVien ? 'col-md-3' : 'col-md-12'} onChange={value => this.setState({ isDoanVien: value })} ref={e => this.isDoanVien = e} readOnly={readOnly} />
            <FormDatePicker label='Ngày vào đoàn' type='date-mask' className='col-md-9' style={{ display: this.state.isDoanVien ? 'block' : 'none' }} ref={e => this.ngayVaoDoan = e} readOnly={readOnly} />
            {/* <FormCheckbox ref={e => this.daTotNghiep['ĐH'] = e} className='col-md-12' label='Đã tốt nghiệp Đại học' onChange={() => this.setState({ daTotNghiepDh: !this.state.daTotNghiepDh })} readOnly={true} /> */}
            {!['CQ', 'CLC'].includes(this.state.loaiHinhDaoTao) && <>
                {this.state.daTotNghiepDh && <>
                    <h6 className='tile-subtitle col-md-12'>Thông tin tốt nghiệp đại học</h6>
                    <FormTextBox ref={e => this.totNghiep['ĐH'].namTotNghiep = e} type='year' className='col-md-4' label='Năm tốt nghiệp' readOnly={true} />
                    {this.state.truongDhKhac ? (
                        <FormTextBox ref={e => this.totNghiep['ĐH'].truongKhac = e} className='col-md-8' label='Trường đại học khác' readOnly={true} />
                    ) : (
                        <FormSelect ref={e => this.totNghiep['ĐH'].truong = e} className='col-md-8' label='Trường Đại học' data={SelectAdapter_DmDaiHoc} readOnly={true} />
                    )}
                    <FormTextBox ref={e => this.totNghiep['ĐH'].nganh = e} className='col-md-4' label='Ngành tốt nhiệp' readOnly={true} />
                    <FormTextBox ref={e => this.totNghiep['ĐH'].soHieuBang = e} className='col-md-4' label='Số hiệu bằng' readOnly={true} />
                    <FormTextBox ref={e => this.totNghiep['ĐH'].soVaoSoCapBang = e} className='col-md-4' label='Số vào sổ cấp bằng' readOnly={true} />
                </>}
                {/* <FormCheckbox ref={e => this.daTotNghiep['CĐ'] = e} className='col-md-12' label='Đã tốt nghiệp Cao đẳng - Học viện' onChange={() => this.setState({ daTotNghiepCd: !this.state.daTotNghiepCd })} readOnly={true}/> */}
                {this.state.daTotNghiepCd && <>
                    <h6 className='tile-subtitle col-md-12'>Thông tin tốt nghiệp cao đẳng</h6>
                    <FormTextBox ref={e => this.totNghiep['CĐ'].namTotNghiep = e} type='year' className='col-md-4' label='Năm tốt nghiệp' readOnly={true} />
                    {this.state.truongCdKhac ? (
                        <FormTextBox ref={e => this.totNghiep['CĐ'].truongKhac = e} className='col-md-8' label='Trường Cao đẳng/Học viện khác' readOnly={true} />
                    ) : (
                        <FormSelect ref={e => this.totNghiep['CĐ'].truong = e} className='col-md-8' label='Trường Cao đẳng/Học viện tốt nghiệp' data={SelectAdapter_DmCaoDang} readOnly={true} />
                    )}
                    <FormTextBox ref={e => this.totNghiep['CĐ'].nganh = e} className='col-md-4' label='Ngành tốt nhiệp' readOnly={true} />
                    <FormTextBox ref={e => this.totNghiep['CĐ'].soHieuBang = e} className='col-md-4' label='Số hiệu bằng' readOnly={true} />
                    <FormTextBox ref={e => this.totNghiep['CĐ'].soVaoSoCapBang = e} className='col-md-4' label='Số vào sổ cấp bằng' readOnly={true} />
                </>}
                {/* <FormCheckbox ref={e => this.daTotNghiep['TC'] = e} className='col-md-12' label='Đã tốt nghiệp Trung cấp' onChange={() => this.setState({ daTotNghiepTc: !this.state.daTotNghiepTc })} readOnly={true}/> */}
                {this.state.daTotNghiepTc && <>
                    <h6 className='tile-subtitle col-md-12'>Thông tin tốt nghiệp trung cấp</h6>
                    <FormTextBox ref={e => this.totNghiep['TC'].namTotNghiep = e} type='year' className='col-md-4' label='Năm tốt nhiệp' readOnly={true} />
                    <FormTextBox ref={e => this.totNghiep['TC'].truong = e} className='col-md-4' label='Trường Trung cấp tốt nghiệp' readOnly={true} />
                    <FormSelect ref={e => this.totNghiep['TC'].tinh = e} className='col-md-4' label='Tỉnh trường' data={ajaxSelectTinhThanhPho} readOnly={true} />
                    <FormTextBox ref={e => this.totNghiep['TC'].nganh = e} className='col-md-4' label='Ngành tốt nhiệp' readOnly={true} />
                    <FormTextBox ref={e => this.totNghiep['TC'].soHieuBang = e} className='col-md-4' label='Số hiệu bằng' readOnly={true} />
                    <FormTextBox ref={e => this.totNghiep['TC'].soVaoSoCapBang = e} className='col-md-4' label='Số vào sổ cấp bằng' readOnly={true} />
                </>}
                {/* <FormCheckbox ref={e => this.daTotNghiep['PT'] = e} className='col-md-12' label='Đã tốt nghiệp THPT/GDTX' onChange={() => this.setState({ daTotNghiepPt: !this.state.daTotNghiepPt })} readOnly={true}/> */}
                {this.state.daTotNghiepPt && <>
                    <h6 className='tile-subtitle col-md-12'>Thông tin tốt nghiệp trung học phổ thông</h6>
                    <FormTextBox ref={e => this.totNghiep['PT'].namTotNghiep = e} type='year' className='col-md-4' label='Năm tốt nhiệp' readOnly={true} />
                    <FormTextBox ref={e => this.totNghiep['PT'].truong = e} className='col-md-4' label='Trường THPT/GDTX tốt nghiệp' readOnly={true} />
                    <FormSelect ref={e => this.totNghiep['PT'].tinh = e} className='col-md-4' label='Tỉnh trường' data={ajaxSelectTinhThanhPho} readOnly={true} />
                </>}</>}

            <FormTextBox ref={e => this.tenCha = e} label='Họ và tên cha' className='form-group col-md-6' readOnly={readOnly} required />
            <FormDatePicker ref={e => this.ngaySinhCha = e} label='Ngày sinh' type='date-mask' className='form-group col-md-6' readOnly={readOnly} required />
            <FormCheckbox ref={e => this.isMatCha = e} className='col-md-12' label={'Đã mất'} onChange={value => this.setState({ isMatCha: value })} />
            <div className='col-md-12'>
                <div style={{ display: this.state.isMatCha ? 'none' : '' }} className='row'>
                    <FormTextBox ref={e => this.sdtCha = e} label='Số điện thoại' className='form-group col-md-6' type='phone' readOnly={readOnly} />
                    <FormTextBox ref={e => this.ngheNghiepCha = e} label='Nghề nghiệp' className='form-group col-md-6' readOnly={readOnly} />
                    <ComponentDiaDiem ref={e => this.thuongTruCha = e} label={<span>Địa chỉ thường trú {!readOnly && <a href='#' onClick={this.copyAddressCha}>(Giống địa chỉ thường trú của <b>sinh viên</b>)</a>}</span>} className='form-group col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} required />
                </div>
            </div>
            <FormTextBox ref={e => this.tenMe = e} label='Họ và tên mẹ' className='form-group col-md-6' readOnly={readOnly} required />
            <FormDatePicker ref={e => this.ngaySinhMe = e} label='Ngày sinh' type='date-mask' className='form-group col-md-6' readOnly={readOnly} required />
            <FormCheckbox ref={e => this.isMatMe = e} className='col-md-12' onChange={value => this.setState({ isMatMe: value })} label={'Đã mất'} />
            <div className='col-md-12'>
                <div style={{ display: this.state.isMatMe ? 'none' : '' }} className='row'>
                    <FormTextBox ref={e => this.sdtMe = e} label='Số điện thoại' className='form-group col-md-6' readOnly={readOnly} />
                    <FormTextBox ref={e => this.ngheNghiepMe = e} label='Nghề nghiệp' className='form-group col-md-6' readOnly={readOnly} />
                    <ComponentDiaDiem ref={e => this.thuongTruMe = e} label={<span>Địa chỉ thường trú {!readOnly && <a href='#' onClick={this.copyAddressMe}>(Giống địa chỉ thường trú của <b>cha</b>)</a>}</span>} className='form-group col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} required />
                </div>
            </div>
        </div>;
    }

    componentThongTinDiemSo = () => {
        return (
            <BangDiem />
        );
    }

    componentThongTinDrl = () => {
        return (
            <BangDiemRenLuyen />
        );
    }

    componentThongTinHocTap = () => {
        let { canEdit } = this.state;
        let readOnly = !canEdit;
        return <div className='mt-3'>
            <h6 className="tile-subtitle">Thông tin tuyển sinh</h6>
            <div className="row">
                <FormSelect ref={e => this.doiTuongTuyenSinh = e} label='Đối tượng tuyển sinh' className='col-md-6' data={SelectAdapter_CtsvDmDoiTuongTs} readOnly />
                <FormSelect ref={e => this.khuVucTuyenSinh = e} label='Khu vực tuyển sinh' className='col-md-6' data={['KV1', 'KV2', 'KV2-NT', 'KV3']} readOnly />
                <FormSelect ref={e => this.phuongThucTuyenSinh = e} label='Phương thức tuyển sinh' className='col-md-6' data={SelectAdapter_CtsvDmPhuongThucTuyenSinh} readOnly />
                <FormTextBox ref={e => this.diemThi = e} label='Điểm thi (THPT/ĐGNL)' className='col-md-6' readOnly />
                <FormSelect minimumResultsForSearch={-1} ref={(e) => (this.namVao = e)} data={Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i)} label='Năm tuyển sinh' className='col-md-6' readOnly onChange={value => {
                    this.setState({ namVao: value.id }, () => {
                        this.ctdtTrungTuyen.value(null);
                    });
                }} />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} label='Hệ đào tạo trúng tuyển' className='col-md-6' data={SelectAdapter_DmSvLoaiHinhDaoTao} readOnly onChange={value => {
                    this.setState({ loaiHinhDaoTao: value.id }, () => {
                        this.ctdtTrungTuyen.value(null);
                    });
                }} />

                <FormSelect minimumResultsForSearch={-1} ref={(e) => (this.ctdtTrungTuyen = e)} data={SelectAdapter_KhungDaoTaoCtsv(this.state.loaiHinhDaoTao, this.state.namVao)} label='Chương trình đào tạo trúng tuyển' className='col-md-4' readOnly onChange={value => {
                    this.khoaTrungTuyen.value(value.maKhoa);
                    this.nganhTrungTuyen.value(value.maNganh);
                }} />
                <FormSelect ref={e => this.khoaTrungTuyen = e} label='Khoa trúng tuyển' data={SelectAdapter_DmDonViFaculty_V2} className='col-md-4' readOnly onChange={value => { this.setState({ khoaTrungTuyen: value.id }); this.nganhTrungTuyen.value(null); }} />
                <FormSelect ref={e => this.nganhTrungTuyen = e} label='Ngành trúng tuyển' data={SelectAdapter_DtNganhDaoTaoV2(this.state.khoaTrungTuyen)} className='col-md-4' readOnly />

            </div>
            <h6 className="tile-subtitle">Thông tin học vụ</h6>
            <div className='row'>
                <FormSelect minimumResultsForSearch={-1} ref={(e) => (this.khoaDtSinhVien = e)} data={SelectAdapter_DtKhoaDaoTao} label='Khóa sinh viên' className='col-md-3' readOnly={readOnly} onChange={value => {
                    this.setState({ khoaDtSinhVien: value.id });
                    // this.ctdtSinhVien.value(null);
                    this.heDaoTaoLop.value(null);
                    // this.lopSinhVien.value(null);
                    // this.nganhDaoTao.value(null);
                }} />
                <FormSelect minimumResultsForSearch={-1} ref={e => this.heDaoTaoLop = e} label='Hệ đào tạo' className='col-md-3' data={SelectAdapter_DmSvLoaiHinhDaoTao} readOnly={readOnly} onChange={value => {
                    this.setState({ heDaoTaoLop: value.id });
                    // this.ctdtSinhVien.value(null);
                    // this.lopSinhVien.value(null);
                    this.nganhSinhVien.value(null);
                }} />
                <FormSelect ref={e => this.nganhSinhVien = e} label='Ngành đào tạo' data={SelectAdapter_DtNganhDaoTao} className='col-md-3' readOnly={readOnly} onChange={value => {
                    this.setState({ nganhSinhVien: value.id, chuyenNganhSinhVien: null }, () => {
                        this.chuyenNganhSinhVien.value(null);
                        this.lopSinhVien.value(null);
                        const { heDaoTaoLop, nganhSinhVien, chuyenNganhSinhVien, khoaDtSinhVien } = this.state;
                        this.props.getDtChuongTrinhDaoTaoTheoNganh(heDaoTaoLop, nganhSinhVien, chuyenNganhSinhVien, khoaDtSinhVien, (data) => {
                            this.ctdtSinhVien.value(data ? data.maCtdt : null);
                            this.setState({ ctdtSinhVien: data ? data.maCtdt : null, khoa: data ? data.maKhoa : '' }, () => this.lopSinhVien.value(null));
                        });
                    });
                }} />
                <FormSelect allowClear={true} ref={e => this.chuyenNganhSinhVien = e} label='Chuyên ngành' data={SelectAdapter_DtChuyenNganhDaoTao(this.state.nganhSinhVien)} className='col-md-3' readOnly={readOnly} onChange={value => {
                    this.setState({ chuyenNganhSinhVien: value ? value.id : null }, () => {
                        const { heDaoTaoLop, nganhSinhVien, chuyenNganhSinhVien, khoaDtSinhVien } = this.state;
                        this.lopSinhVien.value(null);
                        this.props.getDtChuongTrinhDaoTaoTheoNganh(heDaoTaoLop, nganhSinhVien, chuyenNganhSinhVien, khoaDtSinhVien, (data) => {
                            this.ctdtSinhVien.value(data ? data.maCtdt : null);
                            this.setState({ ctdtSinhVien: data ? data.maCtdt : null, khoa: data ? data.maKhoa : '' }, () => this.lopSinhVien.value(null));
                        });
                    });
                }} />
                <FormSelect ref={e => this.ctdtSinhVien = e} label='Chương trình đào tạo' data={SelectAdapter_KhungDaoTaoCtsvFilter(this.state.heDaoTaoLop, this.state.khoaDtSinhVien, this.state.nganhSinhVien)} className='col-md-3' readOnly={readOnly} onChange={value => {
                    this.setState({ ctdtSinhVien: value.id }, () => {
                        this.lopSinhVien.value(null);
                    });
                }} />
                <FormSelect minimumResultsForSearch={-1} ref={e => this.lopSinhVien = e} label='Lớp sinh viên' className='col-md-3' data={SelectAdapter_DtLopCtdt(this.state.ctdtSinhVien)} readOnly={readOnly} onChange={value => {
                    this.nienKhoa.value(value.nienKhoa || '');
                }} />
                <FormTextBox ref={e => this.nienKhoa = e} label='Khóa đào tạo' className='col-md-3' readOnly />
            </div>
        </div>;
    }

    componentThongTinSinhVien = () => {
        let { canEdit } = this.state;
        let readOnly = !canEdit;
        return (
            <>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin cơ bản</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <div className='form-group col-md-12'>
                                <div className='row'>
                                    <FormTextBox ref={(e) => (this.ho = e)} label='Họ và tên lót' className='form-group col-md-6' readOnly={readOnly} onChange={(e) => this.ho.value(e.target.value.toUpperCase())} />
                                    <FormTextBox ref={(e) => (this.ten = e)} label='Tên' className='form-group col-md-3' readOnly={readOnly} onChange={(e) => this.ten.value(e.target.value.toUpperCase())} />
                                    <FormTextBox ref={(e) => (this.mssv = e)} label='Mã số sinh viên' className='form-group col-md-3' readOnly={readOnly} />
                                    {/* <FormSelect ref={(e) => (this.maNganh = e)} label='Ngành' className='form-group col-md-6' data={SelectAdapter_DtNganhDaoTaoStudent} readOnly={readOnly}  /> */}
                                    <FormDatePicker ref={(e) => (this.ngaySinh = e)} label='Ngày sinh' type='date-mask' className='form-group col-md-3' readOnly={readOnly} />
                                    <FormSelect ref={(e) => (this.gioiTinh = e)} label='Giới tính' className='form-group col-md-3' data={SelectAdapter_CtsvDmGioiTinh} readOnly={readOnly} required />
                                    <FormSelect ref={(e) => (this.noiSinhQuocGia = e)} data={SelectAdapter_DmQuocGia} className='form-group col-md-3' readOnly={readOnly} label='Nơi sinh quốc gia' onChange={value => this.setState({ noiSinhQuocGia: value.id })} required />
                                    {this.state.noiSinhQuocGia == 'VN' && <FormSelect className='col-md-3' ref={(e) => (this.noiSinhMaTinh = e)} data={SelectAdapter_CtsvDmTinhThanhPho} readOnly={readOnly} label='Nơi sinh' required />}
                                    <FormDatePicker type='date-mask' ref={(e) => (this.ngayNhapHoc = e)} readOnly={readOnly} label='Ngày nhập học' className='col-md-6' />
                                    <FormSelect ref={(e) => (this.tinhTrang = e)} readOnly={readOnly} label='Tình trạng sinh viên' className='col-md-6' data={SelectAdapter_CtsvDmTinhTrangSinhVien} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin cá nhân và học tập</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <div className='form-group col-md-12'>
                                <FormTabs
                                    // contentClassName="tile"
                                    tabs={[
                                        { title: 'Thông tin cá nhân sinh viên', component: this.componentThongTinCaNhan() },
                                        { title: 'Thông tin học tập', component: this.componentThongTinHocTap() },
                                        { title: 'Chương trình đào tạo', component: this.componentThongTinDiemSo() },
                                        { title: 'Điểm rèn luyện', component: this.componentThongTinDrl() },
                                        { title: 'Thông tin khác', component: <ThongTinKhacComponent ref={e => this.thongTinKhac = e} readOnly={readOnly} /> },
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    componentLichSuChungNhan = () => {
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dataSinhVien && this.props.dataSinhVien.chungNhanPage ?
            this.props.dataSinhVien.chungNhanPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null },
            pageCondition = this.state.emailTruong;
        const permission = this.getUserPermission('manageForm', ['read', 'write', 'delete', 'ctsv']),
            user = this.props.system.user;
        return <>
            <div className="tile">
                <h3 className='tile-title'>Lịch sử chứng nhận</h3>
                <div className='mb-3' style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                        getPage={this.props.getStudentChungNhanAdmin} />

                    <button className='btn btn-info' onClick={e => { e.preventDefault(); this.chungNhanAddModal.show({ mssv: this.state.mssv, register: this.state.emailTruong }); }}>
                        Thêm Chứng Nhận
                    </button>
                </div>

                {renderTable({
                    getDataSource: () => list ? list : [],
                    renderHead: () => (
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>Mã</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại biểu mẫu</th>
                            <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Ngày đăng ký</th>
                            <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Ngày xử lý</th>
                            <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Ngày hoàn thành</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Người xử lý</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thông tin bổ sung</th>
                            <th style={{ width: '15%' }}>Tình trạng</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>

                        </tr>
                    ),
                    renderRow: (item, index) => (
                        <tr key={index}>
                            <TableCell type='text' content={item.maDangKy} />
                            <TableCell type='text' contentClassName='multiple-lines-3' content={item.tenFormDangKy} />
                            <TableCell type='date' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.thoiGianDangKy ? item.thoiGianDangKy : ''} dateFormat='dd/mm/yyyy HH:MM:ss' />
                            <TableCell type='date' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.thoiGianXuLy ? item.thoiGianXuLy : ''} dateFormat='dd/mm/yyyy HH:MM:ss' />
                            <TableCell type='date' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.thoiGianHoanThanh ? item.thoiGianHoanThanh : ''} dateFormat='dd/mm/yyyy HH:MM:ss' />
                            <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hoNguoiXuLy != null && (item.hoNguoiXuLy + ' ' + item.tenNguoiXuLy)} />
                            <TableCell type='text' style={{ textAlign: 'left' }} content={item.ghiChu} />
                            <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={this.renderSwitch(item.tinhTrang)} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<>
                                {(!item.tinhTrang || (item.tinhTrang == 'P' && user.email == item.emailXuLy)) && <Tooltip title='Xác nhận xử lý' arrow>
                                    <button className='btn btn-info' onClick={e => {
                                        e.preventDefault();
                                        this.props.updateStudentChungNhanAdmin(item.maDangKy, { action: 'P' }, notificationChapNhan(item.emailDangKy, item.tenFormDangKy));
                                        this.chungNhanModal.show(item);
                                    }}>
                                        <i className='fa fa-lg fa-hand-paper-o' />
                                    </button>
                                </Tooltip>}
                                {(item.tinhTrang == 'C' || item.tinhTrang == 'A') && <Tooltip title='Download' arrow>
                                    <button className='btn btn-primary' onClick={e => { e.preventDefault(); this.downloadChungNhan(e, item); }}>
                                        <i className='fa fa-lg fa-file-word-o' />
                                    </button>

                                </Tooltip>}
                                {permission.write && !['A', 'C'].includes(item.tinhTrang) && <Tooltip title='Từ chối' arrow>
                                    <button className='btn btn-danger' onClick={e => { e.preventDefault(); this.rejectModal.show(item); }}>
                                        <i className={item.tinhTrang === 'R' ? 'fa fa-lg fa-exclamation' : 'fa fa-lg fa-ban'} />
                                    </button>

                                </Tooltip>}
                                {permission.delete && <Tooltip title='Xóa' arrow>
                                    <button className='btn btn-danger' onClick={e => { e.preventDefault(); this.deleteChungNhan(item); }}>
                                        <i className='fa fa-lg fa-trash-o' />
                                    </button>

                                </Tooltip>}
                            </>
                            }>
                            </TableCell>

                        </tr>
                    )
                })}
                {/* <ChungNhanDetailModal ref={ e => this.chungNhanModal = e}/> */}
                <ChungNhanEditModal ref={(e) => (this.chungNhanModal = e)} readOnly={!permission.write} update={this.props.updateStudentChungNhanAdmin} download={this.downloadChungNhan} />
                <ChungNhanAddModal ref={e => this.chungNhanAddModal = e} readOnly={!permission.write} create={this.props.createStudentChungNhanAdmin} download={this.downloadChungNhan} />
                <ChungNhanRejectModal ref={e => this.rejectModal = e} update={this.props.updateStudentChungNhanAdmin} />
            </div>
        </>;

    }

    downloadQuyetDinhWord = (e, item) => {
        e.preventDefault();
        this.props.downloadQuyetDinhWord(item.maDangKy, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), item.soQuyetDinh + '_' + item.maFormDangKy + '.docx');
        });
    }

    componentLichSuQuyetDinh = () => {
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dataSinhVien && this.props.dataSinhVien.quyetDinhPage ?
            this.props.dataSinhVien.quyetDinhPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null },
            pageCondition = this.state.emailTruong;
        // const { mssv, tinhTrangHienTai, emailTruong } = this.state;
        const permission = this.getUserPermission('manageQuyetDinh', ['read', 'write', 'cancel', 'delete', 'ctsv', 'edit']);
        return <>
            <div className="tile">
                <h3 className='tile-title'>Lịch sử quyết định</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between' }} className='mb-3'>
                    <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                        getPage={this.props.getStudentQuyetDinhAdmin} />
                    {/* <button className='btn btn-info' onClick={e => { e.preventDefault(); this.quyetDinhAddModal.show({ mssvDangKy: mssv, tinhTrangHienTai: tinhTrangHienTai, emailDangKy: emailTruong }); }}>
                        Thêm Quyết Định
                    </button> */}
                </div>


                {renderTable({
                    getDataSource: () => list ? list.filter(item => item.isDeleted == 0) : [],
                    renderHead: () => (
                        <tr>
                            {/* <th style={{ width: 'auto', textAlign: 'center' }}>#</th> */}
                            <th style={{ width: 'auto', textAlign: 'center' }}>Mã</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Số quyết định</th>
                            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Tình trạng</th>
                            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Loại quyết định</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày xử lý</th>
                            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Người xử lý</th>
                            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Ngày ký</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    ),
                    renderRow: (item, index) => (
                        <tr key={index}>
                            {/* <TableCell type='number' content={pageSize * pageNumber + index + 1 - pageSize} /> */}
                            <TableCell type='text' content={item.maDangKy} />
                            <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.soQuyetDinh} />
                            <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tinhTrangSinhVien != null && (item.tinhTrangSinhVien)} />
                            <TableCell type='text' contentClassName='multiple-lines-3' content={item.tenFormDangKy} />
                            <TableCell type='date' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.thoiGianXuLy ? item.thoiGianXuLy : ''} dateFormat='dd/mm/yyyy HH:MM:ss' />
                            <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hoNguoiXuLy != null && (item.hoNguoiXuLy + ' ' + item.tenNguoiXuLy)} />
                            <TableCell type='date' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayKy != null && (item.ngayKy)} dateFormat='dd/mm/yyyy HH:MM:ss' />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<>
                                {((item.tinhTrang == null || item.tinhTrang == 'U') && permission.edit) && <Tooltip title='Xem chi tiết' arrow>
                                    <button className='btn btn-info' onClick={e => {
                                        e.preventDefault();
                                        this.quyetDinhAddModal.show(item);
                                    }}>
                                        <i className='fa fa-lg fa-edit' />
                                    </button>
                                </Tooltip>}
                                {permission.cancel && <Tooltip title='Hủy' arrow>
                                    <button className='btn btn-danger' onClick={e => { e.preventDefault(); this.huyModal.show(item); }}>
                                        <i className='fa fa-lg fa-ban' />
                                    </button>
                                </Tooltip>}
                                <Tooltip title='Download' arrow>
                                    <button className='btn btn-primary' onClick={e => { e.preventDefault(); this.downloadQuyetDinhWord(e, item); }}>
                                        <i className='fa fa-lg fa-file-word-o' />
                                    </button>
                                </Tooltip>
                            </>
                            }>
                            </TableCell>
                        </tr>
                    ),
                })}
                <AddModal ref={e => this.quyetDinhAddModal = e} readOnly={!permission.write} create={this.props.createStudentManageQuyetDinh} update={this.props.updateStudentManageQuyetDinh} getSoQDCuoi={this.props.getSoQuyetDinhRaCuoi} getDtChuongTrinhDaoTaoTheoNganh={this.props.getDtChuongTrinhDaoTaoTheoNganh} getCtdt={this.props.getCtdt} getSvInfo={this.props.getStudentAdmin} />
                <HuyQuyetDinhModal ref={e => this.huyModal = e} readOnly={!permission.write} huyQuyetDinh={this.props.huyQuyetDinh} />
            </div>
        </>;

    }

    componentQuyetDinhKhenThuong = () => {
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dataSinhVien && this.props.dataSinhVien.khenThuongPage ?
            this.props.dataSinhVien.khenThuongPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null },
            pageCondition = this.state.mssv;
        return <>
            <div className="tile">
                <h3 className='tile-title'>Lịch sử khen thưởng</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between' }} className='mb-3'>
                    <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                        getPage={this.props.getStudentQuyetDinhKhenThuong} />
                    <a href='/user/ctsv/khen-thuong'><button className='btn btn-info'>Quản lý khen thưởng </button></a>
                </div>
                {renderTable({
                    getDataSource: () => list ? list : [],
                    renderHead: () => (
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>STT</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Số quyết định</th>
                            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Thành tích</th>
                            <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Năm đạt được</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày xử lý</th>
                            <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Người xử lý</th>
                            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Ngày ký</th>
                        </tr>
                    ),
                    renderRow: (item, index) => (
                        <tr key={index}>
                            <TableCell type='text' content={index + 1} />
                            <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.soQuyetDinh} />
                            <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenThanhTich} />
                            <TableCell type='text' contentClassName='multiple-lines-3' content={item.namHoc} />
                            <TableCell type='date' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.timeHandle ? item.timeHandle : ''} dateFormat='dd/mm/yyyy HH:MM:ss' />
                            <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hoNguoiXuLy != null && (item.hoNguoiXuLy + ' ' + item.tenNguoiXuLy)} />
                            <TableCell type='date' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayKy != null && (item.ngayKy)} dateFormat='dd/mm/yyyy HH:MM:ss' />
                        </tr>
                    ),
                })}
            </div>

        </>;

    }

    render() {
        let item = this.props.system && this.props.system.user ? this.props.system.user.student : null;
        let { canEdit } = this.state;
        // let readOnly = !canEdit;
        return this.renderPage({
            icon: 'fa fa-user-circle-o',
            title: 'Lý lịch cá nhân sinh viên',
            subTitle: <i style={{ color: 'blue' }}>{item ? item.ho + ' ' + item.ten : ''}</i>,
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                <Link key={1} to='/user/ctsv/list'>Danh sách sinh viên</Link>,
                'Lý lịch cá nhân sinh viên'
            ],
            content:
                <>
                    <FormTabs
                        tabs={[
                            { title: 'Thông tin cơ bản của sinh viên', component: this.componentThongTinSinhVien() },
                            { title: 'Chứng nhận Trực tuyến', component: this.componentLichSuChungNhan() },
                            { title: 'Quyết định', component: this.componentLichSuQuyetDinh() },
                            { title: 'Kỷ luật', component: <LichSuKyLuat mssv={this.state.mssv} /> },
                            { title: 'Khen thưởng', component: this.componentQuyetDinhKhenThuong() },
                            { title: 'Bảng điểm', component: <BangDiemSection ref={e => this.bangDiem = e} mssv={this.state.mssv} showThanhPhan={false} showChiTiet={false} /> }
                        ]}
                    />
                </>,
            backRoute: '/user/ctsv/list',
            buttons: [
                canEdit && {
                    icon: 'fa-save', className: 'btn-success', onClick: this.save, tooltip: 'Lưu thay đổi'
                },
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dataSinhVien: state.ctsv.dataSinhVien });
const mapActionsToProps = {
    getStudentAdmin, updateStudentAdmin, getStudentChungNhanAdmin, downloadWord, getStudentQuyetDinhAdmin, downloadQuyetDinhWord, createStudentManageQuyetDinh, updateStudentManageQuyetDinh, huyQuyetDinh, createStudentChungNhanAdmin, updateStudentChungNhanAdmin, deleteStudentChungNhanAdmin, getSoQuyetDinhRaCuoi, getDtChuongTrinhDaoTaoTheoNganh, getCtdt, getStudentQuyetDinhKhenThuong
};
export default connect(mapStateToProps, mapActionsToProps)(SinhVienPage);
