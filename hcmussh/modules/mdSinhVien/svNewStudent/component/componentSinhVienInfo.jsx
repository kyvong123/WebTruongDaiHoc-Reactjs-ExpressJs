import React from 'react';
import { connect } from 'react-redux';
import { FormCheckbox, FormDatePicker, FormSelect, FormTextBox, FormImageBox } from 'view/component/AdminPage';
import { getSinhVienEditUser, updateStudentUser, updateStudentUserNganHangInfo } from 'modules/mdSinhVien/svInfo/redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmDanTocV2 } from 'modules/mdDanhMuc/dmDanToc/redux';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { SelectAdapter_DmTonGiaoV2 } from 'modules/mdDanhMuc/dmTonGiao/redux';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
// import { updateSystemState } from 'modules/_default/_init/reduxSystem';
import { SelectAdapter_DtNganhDaoTaoStudent } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { ajaxSelectTinhThanhPho } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
import { SelectAdapter_DmSvDoiTuongTs } from 'modules/mdDanhMuc/dmSvDoiTuongTs/redux';
import { SelectAdapter_DmPhuongThucTuyenSinh } from 'modules/mdDanhMuc/dmPhuongThucTuyenSinh/redux';
// import { getSvBaoHiemYTe } from '../svManageBaoHiemYTe/redux';
// import { SelectAdapter_DtLopCtdt } from 'modules/mdCongTacSinhVien/ctsvDtLop/redux';
// import { SelectAdapter_DtChuyenNganhDaoTao } from 'modules/mdCongTacSinhVien/ctsvDtChuyenNganh/redux';
import { SelectAdapter_DmCaoDang } from 'modules/mdCongTacSinhVien/dmCaoDangHocVien/redux';
import { SelectAdapter_DmDaiHoc } from 'modules/mdCongTacSinhVien/dmDaiHoc/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { loadSpinner } from './common';
import { SelectAdapter_DmNoiCapCccd } from 'modules/mdDanhMuc/dmNoiCapCccd/redux';
import { SelectAdapter_DmNganHang } from 'modules/mdDanhMuc/dmNganHang/redux';

class SinhVienInfo extends React.Component {
    state = {
        ngayNhapHoc: -1, canEdit: 1, sectionEdit: [], lastModified: null, loaiHinhDaoTao: 'VB2',
        daTotNghiepDh: false, daTotNghiepCd: false, daTotNghiepTc: false, daTotNghiepPt: false, truongDhKhac: false, truongCdKhac: false,
        isLoading: false, activeIndex: 0
    };

    sections = []

    totNghiep = { 'ĐH': {}, 'CĐ': {}, 'TC': {}, 'PT': {} };
    daTotNghiep = {};
    isAllFilled = true;
    firstInvalidIndex = null;

    componentDidMount() {
        this.setState({ isLoading: true });
        this.props.getSinhVienEditUser(data => {
            if (data.error) {
                T.notify('Lấy thông tin sinh viên bị lỗi!', 'danger');
            } else {
                let user = this.props.system?.user;
                let { canEdit, sectionEdit, namTuyenSinh, chuaDongHocPhi } = data.item;
                let isTanSinhVien = user.isStudent && namTuyenSinh == new Date().getFullYear();
                this.setState({
                    isLoading: false,
                    anhThe: data.item.anhThe,
                    noiSinhQuocGia: data.item.noiSinhQuocGia ? data.item.noiSinhQuocGia : 'VN', isTanSinhVien, chuaDongHocPhi, ngayNhapHoc: data.item.ngayNhapHoc, canEdit, ctdtSinhVien: data.maCtdt, nganhSinhVien: data.maNganh,
                    // noiTru: data.item.maNoiTru ? 1 : 0,
                    daTotNghiepDh: (data.item.dataTotNghiep['ĐH'] != undefined), daTotNghiepCd: data.item.dataTotNghiep['CĐ'] != undefined, daTotNghiepTc: data.item.dataTotNghiep['TC'] != undefined, daTotNghiepPt: data.item.dataTotNghiep['PT'] != undefined,
                    loaiHinhDaoTao: data.item.loaiHinhDaoTao,
                    truongDhKhac: (data.item.dataTotNghiep['ĐH'] != undefined && data.item.dataTotNghiep['ĐH'][0].truongKhac != null),
                    truongCdKhac: (data.item.dataTotNghiep['CĐ'] != undefined && data.item.dataTotNghiep['CĐ'][0].truongKhac != null),
                    sectionEdit,
                }, () => this.setVal(data.item));
            }
        });
    }

    setVal = (data = {}) => {
        this.anhThe.setData('NewCardImage', `/api/sv/image-card?t=${new Date().getTime()}`);
        this.mssv.value(data.mssv ? data.mssv : '');
        this.heDaoTao.value(data.loaiHinhDaoTao ? data.loaiHinhDaoTao : '');
        this.phongThuTuc?.value(data.phongThuTuc || '');
        this.ho.value(data.ho ? data.ho : '');
        this.ten.value(data.ten ? data.ten : '');
        this.ngaySinh.value(data.ngaySinh ? data.ngaySinh : '');
        this.danToc.value(data.danToc ? data.danToc : '');
        this.cmnd.value(data.cmnd || '');
        this.cmndNgayCap.value(data.cmndNgayCap);
        this.cmndNoiCap.value(data.cmndNoiCap || '');
        this.dienThoaiCaNhan.value(data.dienThoaiCaNhan ? data.dienThoaiCaNhan : '');
        this.emailCaNhan.value(data.emailCaNhan ? data.emailCaNhan : '');
        this.gioiTinh.value(data.gioiTinh ? ('0' + String(data.gioiTinh)) : '');
        this.state.noiSinhQuocGia == 'VN' && this.noiSinhMaTinh.value(data.noiSinhMaTinh);
        this.noiSinhQuocGia.value(data.noiSinhQuocGia || 'VN');
        this.doiTuongTuyenSinh.value(data.doiTuongTuyenSinh);
        this.khuVucTuyenSinh.value(data.khuVucTuyenSinh);
        this.phuongThucTuyenSinh.value(data.phuongThucTuyenSinh);
        this.diemThi.value(data.diemThi ? Number(data.diemThi).toFixed(2) : '');
        this.doiTuongChinhSach.value(data.doiTuongChinhSach || '');
        this.maNganh.value(data.maNganh ? data.maNganh : '');
        // this.maChuyenNganh.value(data.maChuyenNganh ? data.maChuyenNganh : '');
        this.thuongTru.value(data.thuongTruMaTinh, data.thuongTruMaHuyen, data.thuongTruMaXa, data.thuongTruSoNha);
        // Thong tin cha
        this.tenCha.value(data.tenCha ? data.tenCha : '');
        this.ngaySinhCha.value(data.ngaySinhCha ? data.ngaySinhCha : '');
        if (data.sdtCha == '-1') {
            this.setState({ isMatCha: true }, () => this.isMatCha.value(1));
        } else {
            this.sdtCha.value(data.sdtCha ? data.sdtCha : '');
            this.ngheNghiepCha.value(data.ngheNghiepCha ? data.ngheNghiepCha : '');
            this.thuongTruCha.value(data.thuongTruMaTinhCha?.toString().length == 1 ? `0${data.thuongTruMaTinhCha}` : data.thuongTruMaTinhCha, data.thuongTruMaHuyenCha, data.thuongTruMaXaCha, data.thuongTruSoNhaCha);
        }
        // Thong tin me
        this.tenMe.value(data.tenMe ? data.tenMe : '');
        this.ngaySinhMe.value(data.ngaySinhMe ? data.ngaySinhMe : '');
        if (data.sdtMe == '-1') {
            this.setState({ isMatMe: true }, () => this.isMatMe.value(1));
        } else {
            this.sdtMe.value(data.sdtMe ? data.sdtMe : '');
            this.ngheNghiepMe.value(data.ngheNghiepMe ? data.ngheNghiepMe : '');
            this.thuongTruMe.value(data.thuongTruMaTinhMe?.toString().length == 1 ? `0${data.thuongTruMaTinhMe}` : data.thuongTruMaTinhMe, data.thuongTruMaHuyenMe, data.thuongTruMaXaMe, data.thuongTruSoNhaMe);
        }
        this.thuongTruNguoiLienLac.value(data.lienLacMaTinh || '', data.lienLacMaHuyen || '', data.lienLacMaXa || '', data.lienLacSoNha || '');
        this.tonGiao.value(data.tonGiao ? data.tonGiao : '');
        this.quocTich.value(data.quocGia ? data.quocGia : '');
        // this.imageBox.setData('SinhVienImage:' + data.mssv, data.image ? data.image : '/img/avatar.png');

        this.hoTenNguoiLienLac.value(data.hoTenNguoiLienLac ? data.hoTenNguoiLienLac : '');
        this.sdtNguoiLienLac.value(data.sdtNguoiLienLac ? data.sdtNguoiLienLac : '');
        // this.lopSinhVien.value(data.lop ? data.lop : '');
        data.ngayVaoDang && this.setState({ isDangVien: true }, () => {
            this.isDangVien.value(1);
            this.ngayVaoDang.value(data.ngayVaoDang);
        });
        data.ngayVaoDoan && this.setState({ isDoanVien: true }, () => {
            this.isDoanVien.value(1);
            this.ngayVaoDoan.value(data.ngayVaoDoan);
        });
        // this.noiTru.value(this.state.noiTru);
        // if (this.state.noiTru) {
        //     // địa chỉ nội trú
        //     const { ktxTen, ktxToaNha, ktxSoPhong } = data.dataNoiTru || {};
        //     this.ktxTen.value(ktxTen || '');
        //     this.ktxToaNha.value(ktxToaNha || '');
        //     this.ktxSoPhong.value(ktxSoPhong || '');
        // } else {
        //     // địa chỉ tạm trú
        //     const { tamTruMaTinh, tamTruMaHuyen, tamTruMaXa, tamTruSoNha } = data.dataTamTru || {};
        //     this.tamTru.value(tamTruMaTinh || '', tamTruMaHuyen || '', tamTruMaXa || '', tamTruSoNha || '');
        // }

        // thong tin ngan hang
        // thong tin ngan hang
        this.tenNganhangCapNhat.value(data.tenNganHang);
        this.tenChuTaiKhoan.value(data.ho + ' ' + data.ten || '');
        this.soTaiKhoanNganHangCapNhat.value(data.soTkNh || '');
        // this.soTkNh.value(data.soTkNh || '');
        // this.chiNhanhNh.value(data.chiNhanhNh || '');
        // this.tenNh.value(data.tenNganHang || '');
        // thong tin tot nghiep
        if (data.dataTotNghiep) {
            Object.keys(data.dataTotNghiep).forEach(trinhDo => {
                this.daTotNghiep[trinhDo]?.value(1);
                Object.keys(this.totNghiep[trinhDo]).forEach(key => {
                    this.totNghiep[trinhDo][key].value(data.dataTotNghiep[trinhDo][0][key] || '');
                });
                if (data.dataTotNghiep[trinhDo][0]['truongKhac']) {
                    this.totNghiep[trinhDo]['truongKhacCheck']?.value(1);
                    this.totNghiep[trinhDo]['truongKhac']?.value(data.dataTotNghiep[trinhDo][0]['truongKhac']);
                }
            });
        }
    };

    getAndValidate = (validate = true) => {
        try {
            this.isAllFilled = true;
            this.firstInvalidIndex = null;
            const { maTinhThanhPho: thuongTruMaTinh, maQuanHuyen: thuongTruMaHuyen, maPhuongXa: thuongTruMaXa, soNhaDuong: thuongTruSoNha } = this.getAddressValue(this.thuongTru, validate),
                { maTinhThanhPho: lienLacMaTinh, maQuanHuyen: lienLacMaHuyen, maPhuongXa: lienLacMaXa, soNhaDuong: lienLacSoNha } = this.getAddressValue(this.thuongTruNguoiLienLac, validate);
            // { maTinhThanhPho: tamTruMaTinh, maQuanHuyen: tamTruMaHuyen, maPhuongXa: tamTruMaXa, soNhaDuong: tamTruSoNha } = this.tamTru?.value() || {};
            const emailCaNhan = this.emailCaNhan.value();
            if (emailCaNhan && !T.validateEmail(emailCaNhan) && !this.state.sectionEdit) {
                this.emailCaNhan.focus();
                T.notify('Email cá nhân không hợp lệ', 'danger');
                return false;
            } else {
                const data = {
                    isSubmit: 1,
                    mssv: this.getValue(this.mssv, null, validate),
                    ho: this.getValue(this.ho, null, validate),
                    ten: this.getValue(this.ten, null, validate),
                    cmnd: this.getValue(this.cmnd, null, validate),
                    cmndNgayCap: this.getValue(this.cmndNgayCap, 'date', validate),
                    cmndNoiCap: this.getValue(this.cmndNoiCap, null, validate),
                    noiSinhMaTinh: this.state.noiSinhQuocGia == 'VN' ? this.getValue(this.noiSinhMaTinh, null, validate) : null,
                    noiSinhQuocGia: this.getValue(this.noiSinhQuocGia, null, validate),
                    danToc: this.getValue(this.danToc, null, validate),
                    dienThoaiCaNhan: this.getValue(this.dienThoaiCaNhan, null, validate),
                    gioiTinh: this.getValue(this.gioiTinh, null, validate),
                    emailCaNhan: this.getValue(this.emailCaNhan, null, validate),
                    doiTuongChinhSach: this.getValue(this.doiTuongChinhSach, null, validate),

                    // ngheNghiepMe: this.getValue(this.ngheNghiepMe, null, validate),
                    tonGiao: this.getValue(this.tonGiao, null, validate),
                    quocGia: this.getValue(this.quocTich, null, validate),
                    thuongTruMaHuyen, thuongTruMaTinh, thuongTruMaXa, thuongTruSoNha,
                    lienLacMaHuyen, lienLacMaTinh, lienLacMaXa, lienLacSoNha,
                    hoTenNguoiLienLac: this.getValue(this.hoTenNguoiLienLac, null, validate),
                    sdtNguoiLienLac: this.getValue(this.sdtNguoiLienLac, null, validate),
                    ngayVaoDang: this.state.isDangVien ? this.getValue(this.ngayVaoDang, 'date', validate) : '',
                    ngayVaoDoan: this.state.isDoanVien ? this.getValue(this.ngayVaoDoan, 'date', validate) : '',
                    // noiTru: Number(this.state.noiTru),
                    // ...(this.state.noiTru ?
                    //     {
                    //         // Thong tin noi tru
                    //         ktxTen: this.getValue(this.ktxTen, null, validate),
                    //         ktxToaNha: this.getValue(this.ktxToaNha, null, validate),
                    //         ktxSoPhong: this.getValue(this.ktxSoPhong, null, validate)
                    //     } : {
                    //         // Thong tin tam tru
                    //         tamTruMaTinh, tamTruMaHuyen, tamTruMaXa, tamTruSoNha
                    //     }),
                    // Thong tin ngan hang
                    // soTkNh: this.getValue(this.soTkNh, null, validate),
                    // chiNhanhNh: this.getValue(this.chiNhanhNh, null, validate),
                    // tenNganHang: this.getValue(this.tenNh, null, validate),
                    dataTotNghiep: this.getTotNghiepInfo(),
                    tenCha: this.getValue(this.tenCha, null, validate),
                    ngaySinhCha: this.getValue(this.ngaySinhCha, 'date', validate),
                    tenMe: this.getValue(this.tenMe, null, validate),
                    ngaySinhMe: this.getValue(this.ngaySinhMe, 'date', validate)
                };
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
                if (!this.state.anhThe) {
                    if (validate) throw { props: { label: 'Ảnh thẻ' } };
                    this.isAllFilled = false;
                }
                return data;
            }
        }
        catch (selector) {
            console.error(selector);
            T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            selector.focus && selector.focus();
            return false;
        }
    };

    getTotNghiepInfo = () => {
        const dataTotNghiep = [];
        Object.keys(this.daTotNghiep).forEach(trinhDo => {
            (this.daTotNghiep[trinhDo] && this.daTotNghiep[trinhDo].value() == true) && dataTotNghiep.push({
                trinhDo,
                namTotNghiep: this.totNghiep[trinhDo].namTotNghiep?.value() || '',
                truong: this.totNghiep[trinhDo].truong?.value() || '',
                truongKhac: this.totNghiep[trinhDo].truongKhac?.value() || '',
                tinh: this.totNghiep[trinhDo].tinh?.value() || '',
                nganh: this.totNghiep[trinhDo].nganh?.value() || '',
                soHieuBang: this.totNghiep[trinhDo].soHieuBang?.value() || '',
                soVaoSoCapBang: this.totNghiep[trinhDo].soVaoSoCapBang?.value() || ''
            });
        });
        return dataTotNghiep;
    };

    getData = (done) => {
        const studentData = this.getAndValidate(false);
        if (studentData) {
            this.props.updateStudentUser({ ...studentData, lastModified: new Date().getTime() }, () => {
                this.updateNganHangInfo(done);
            });
        }
    };

    updateNganHangInfo = (done) => {
        try {
            const changes = {
                mssv: this.getValue(this.mssv),
                soTkNh: this.getValue(this.soTaiKhoanNganHangCapNhat),
                tenNganHang: this.getValue(this.tenNganhangCapNhat),
            };
            this.props.updateStudentUserNganHangInfo(changes, done);
        }
        catch (error) {
            if (error.props)
                T.notify(error.props.label + ' bị trống', 'danger');
        }
    }

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
            (this.state.tinhTrang == 11 || this.state.ngayNhapHoc == -1) && (this.isAllFilled = false);
            selector.valid && selector.valid(false);
            if (!this.firstInvalidIndex && selector.props && (selector.props.index === 0 || selector.props.index)) {
                this.firstInvalidIndex = selector.props.index;
            }
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
            if (validate) {
                if (!maTinhThanhPho) throw selector.dmTinhThanhPho;
                if (!maQuanHuyen) throw selector.dmQuanHuyen;
                if (!maPhuongXa) throw selector.dmPhuongXa;
                if (requiredSoNhaDuong && !soNhaDuong) {
                    throw selector.soNhaDuong;
                }
            }
            (this.state.tinhTrang == 11 || this.state.ngayNhapHoc == -1) && (this.isAllFilled = false);
            selector.valid && selector.valid(false);
            if (!this.firstInvalidIndex && selector.props && (selector.props.index === 0 || selector.props.index)) {
                this.firstInvalidIndex = selector.props.index;
            }
        }
        return { maTinhThanhPho, maQuanHuyen, maPhuongXa, soNhaDuong };
    }

    save = () => {
        T.confirm('Xác nhận', 'Bạn có chắc chắn muốn lưu thay đổi thông tin cá nhân?', 'warning', true, isConfirm => {
            if (isConfirm) {
                this.getData(() => {
                    T.notify('Cập nhật thông tin sinh viên thành công!', 'success');
                    if (this.isAllFilled) {
                        this.props.onComplete && this.props.onComplete();
                    } else {
                        this.props.onComplete && this.props.onUnComplete();
                        T.notify('Lưu ý: Một số trường bắt buộc chưa được điền!', 'warning');
                    }
                });
            }
        });
    };

    handleMaxSize = (value, maxSize, field) => {
        if (value && value.toString().length > maxSize) {
            field.value(value.toString().substring(0, maxSize));
        }
    }

    onUploadAnhThe = (data) => {
        this.setState({ anhThe: data.anhThe }, () => {
            this.anhThe.setData('NewCardImage', `/api/sv/image-card?t=${new Date().getTime()}`);
        });
    }

    copyAddressTo = (e, source, target) => {
        e.preventDefault();
        const dataThuongTru = source.value();
        target.value(dataThuongTru.maTinhThanhPho, dataThuongTru.maQuanHuyen, dataThuongTru.maPhuongXa, dataThuongTru.soNhaDuong);
    };

    changeActive = (index) => {
        this.setState({ activeIndex: index });
    }

    procceed = (next) => {
        this.setState(prevState => ({ activeIndex: prevState.activeIndex + (next ? 1 : -1) }));
    }

    downloadSyll = () => {
        const data = this.getAndValidate(true);
        data && T.handleDownload('/api/sv/student-enroll/download-syll');
    }

    componentThongTinCoBan = (index) => {
        const { tinhTrang } = this.props.system.user?.data;
        let { canEdit, sectionEdit } = this.state;
        let readOnly = !(canEdit == 1 || tinhTrang == 11 || (sectionEdit && sectionEdit.includes('all')));
        return <>
            <p className='tile-title font-weight-bold text-primary'>{index + 1}. Thông tin cơ bản</p>

            <div className='tile-body'>
                <div className='row'>
                    <FormTextBox index={index} ref={e => this.ho = e} label='Họ và tên lót' className='form-group col-md-4' readOnly onChange={e => this.ho.value(e.target.value.toUpperCase())} required />
                    <FormTextBox index={index} ref={e => this.ten = e} label='Tên' className='form-group col-md-4' readOnly onChange={e => this.ten.value(e.target.value.toUpperCase())} required />
                    <FormTextBox index={index} ref={e => this.mssv = e} label='Mã số sinh viên' className='form-group col-md-4' readOnly required />
                    <FormDatePicker index={index} ref={e => this.ngaySinh = e} label='Ngày sinh' type='date-mask' className='form-group col-md-4' required readOnly />
                    <FormSelect index={index} ref={e => this.heDaoTao = e} label='Hệ đào tạo' className='input-group col-md-4' data={SelectAdapter_DmSvLoaiHinhDaoTao} readOnly required />
                    <FormSelect index={index} ref={e => this.maNganh = e} label='Ngành' className='input-group col-md-4' data={SelectAdapter_DtNganhDaoTaoStudent} readOnly required />
                    <FormSelect index={index} ref={e => this.doiTuongTuyenSinh = e} label='Đối tượng tuyển sinh' className='input-group col-md-4' data={SelectAdapter_DmSvDoiTuongTs} required readOnly />
                    <FormSelect index={index} ref={e => this.khuVucTuyenSinh = e} label='Khu vực tuyển sinh' className='input-group col-md-4' data={['KV1', 'KV2', 'KV2-NT', 'KV3']} readOnly required />
                    <FormTextBox index={index} ref={e => this.phongThuTuc = e} label='Phòng làm thủ tục' className='form-group col-md-3' style={{ visibility: tinhTrang == 11 ? '' : 'hidden' }} readOnly={true} />
                    <FormSelect index={index} ref={e => this.phuongThucTuyenSinh = e} label='Phương thức tuyển sinh' className='input-group col-md-4' data={SelectAdapter_DmPhuongThucTuyenSinh} readOnly required />
                    <FormTextBox index={index} ref={e => this.diemThi = e} label='Điểm thi (THPT/ĐGNL)' className='col-md-8' readOnly />
                    <FormSelect index={index} ref={e => this.gioiTinh = e} label='Giới tính' className='input-group col-md-4' data={SelectAdapter_DmGioiTinhV2} readOnly={readOnly} required />
                    <FormSelect index={index} className='input-group col-md-4' ref={e => this.noiSinhQuocGia = e} data={SelectAdapter_DmQuocGia} readOnly={readOnly} label='Nơi sinh (quốc gia)' required
                        onChange={(value) => this.setState({ noiSinhQuocGia: value.id })} />
                    {this.state.noiSinhQuocGia == 'VN' &&
                        <FormSelect index={index} className='input-group col-md-4' ref={e => this.noiSinhMaTinh = e} data={ajaxSelectTinhThanhPho} readOnly={readOnly} label='Nơi sinh' required />}
                    <ComponentDiaDiem index={index} ref={e => this.thuongTru = e} label={<span>Địa chỉ thường trú</span>} className='form-group col-md-12' required
                        requiredSoNhaDuong={true} readOnly={readOnly} maxLengthSoNha='200' />

                </div>
            </div>
            <hr className='mt-0' />
        </>;
    };

    componentThongTinNoiTamTru = (index) => {
        const { tinhTrang } = this.props.system.user.data;
        let { canEdit, sectionEdit } = this.state;
        let readOnly = !(canEdit == 1 || tinhTrang == 11 || (sectionEdit && (sectionEdit.includes('noiTruTamTru') || sectionEdit.includes('all'))));
        return (<>
            <p className='tile-title font-weight-bold text-primary'>{index + 1}. Thông tin tạm trú và nội trú</p>
            <div className='tile-body'>
                <div className='row'>
                    <FormCheckbox index={index} className='col-md-12' ref={e => this.noiTru = e} label='Ở ký túc xá' onChange={() => this.setState({ noiTru: !this.state.noiTru })} readOnly={readOnly} />
                    {this.state.noiTru ?
                        <div className='col-12'>
                            <div className='row'>
                                <FormSelect index={index} ref={e => this.ktxTen = e} className='input-group col-md-4' label='Ký túc xá' minimumResultsForSearch='-1' data={['Ký túc xá khu A', 'Ký túc xá khu B']}
                                    onChange={() => this.ktxToaNha.focus()} readOnly={readOnly} />
                                <FormTextBox index={index} ref={e => this.ktxToaNha = e} className='col-md-4' label='Tòa nhà' onKeyDown={e => e.code === 'Enter' && this.ktxSoPhong.focus()} readOnly={readOnly} />
                                <FormTextBox index={index} ref={e => this.ktxSoPhong = e} className='col-md-4' label='Số phòng' readOnly={readOnly} />
                            </div>
                        </div>
                        :
                        <ComponentDiaDiem index={index} ref={e => this.tamTru = e} className='col-md-12' label={<span>Địa chỉ tạm trú {!readOnly &&
                            <a href='#' onClick={(e) => this.copyAddressTo(e, this.thuongTru, this.tamTru)}>(Giống địa chỉ thường trú của <b>sinh viên</b>)</a>}</span>} requiredSoNhaDuong={true} readOnly={readOnly} maxLengthSoNha='200' />
                    }
                </div>
            </div>
            <hr className='mt-0' />
        </>);
    };

    componentThongTinLienLac = (index) => {
        const { tinhTrang } = this.props.system.user.data;
        let { canEdit, sectionEdit } = this.state;
        let readOnly = !(canEdit == 1 || tinhTrang == 11 || (sectionEdit && (sectionEdit.includes('lienLac') || sectionEdit.includes('all'))));
        return <>
            <p className='tile-title font-weight-bold text-primary'>{index + 1}. Thông tin liên lạc</p>
            <div className='tile-body'>
                <div className='row'>
                    <FormTextBox index={index} ref={e => this.dienThoaiCaNhan = e} maxLength='10' label='Điện thoại cá nhân' className='form-group col-md-6' type='phone' required readOnly={readOnly} />
                    <FormTextBox index={index} ref={e => this.emailCaNhan = e} label='Email cá nhân' className='form-group col-md-6' required readOnly={readOnly} maxLength='50' />
                    <FormTextBox index={index} ref={e => this.hoTenNguoiLienLac = e} label='Họ và tên người liên lạc' className='form-group col-md-6' required readOnly={readOnly} maxLength='100' />
                    <FormTextBox index={index} ref={e => this.sdtNguoiLienLac = e} label='Số điện thoại người liên lạc' className='form-group col-md-6' type='phone' required readOnly={readOnly} maxLength='10' />
                    <ComponentDiaDiem index={index} ref={e => this.thuongTruNguoiLienLac = e} label='Địa chỉ liên lạc' className='form-group col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} required maxLengthSoNha='200' />
                </div>
            </div>
            <hr className='mt-0' />
        </>;
    };

    componentThongTinNganHang = (index) => {
        const { tinhTrang } = this.props.system.user.data;
        let { canEdit, sectionEdit } = this.state;
        let readOnly = !(canEdit == 1 || tinhTrang == 11 || (sectionEdit && (sectionEdit.includes('nganHang') || sectionEdit.includes('all'))));
        return <>
            <p className='tile-title font-weight-bold text-primary'>{index + 1}. Thông tin ngân hàng</p>
            {/* <div className='tile-body'>
                <div className='row'>
                    <FormTextBox index={index} ref={e => this.soTkNh = e} label='Số tài khoản ngân hàng' className='form-group col-md-6' readOnly={readOnly} />
                    <FormTextBox index={index} ref={e => this.tenNh = e} label='Tên ngân hàng' className='form-group col-md-6' readOnly={readOnly} />
                    <FormTextBox index={index} ref={e => this.chiNhanhNh = e} label='Chi nhánh ngân hàng' className='form-group col-md-12' readOnly={readOnly} />
                </div>
            </div> */}
            <div className='tile-body'><div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.tenChuTaiKhoan = e} label='Tên chủ tài khoản' required readOnly />
                <FormSelect className='input-group col-md-6' ref={e => this.tenNganhangCapNhat = e} label='Tên ngân hàng' data={SelectAdapter_DmNganHang} required readOnly={readOnly} />
                <FormTextBox className='col-md-6' ref={e => this.soTaiKhoanNganHangCapNhat = e} label='Số tài khoản ngân hàng' required readOnly={readOnly} maxLength='50' />
            </div></div>
            <hr className='mt-0' />
        </>;
    };


    componentThongTinBangCap = (index) => {
        return <>
            <p className='tile-title font-weight-bold text-primary'>{index + 1}. Thông tin bằng cấp</p>
            <div className='tile-body'>
                <div className='row'>
                    <FormCheckbox index={index} ref={e => this.daTotNghiep['PT'] = e} className='col-md-3' label='Đã tốt nghiệp THPT/GDTX'
                        onChange={() => this.setState({ daTotNghiepPt: !this.state.daTotNghiepPt })} />
                    <FormCheckbox index={index} ref={e => this.daTotNghiep['ĐH'] = e} className='col-md-3' label='Đã tốt nghiệp Đại học'
                        onChange={() => this.setState({ daTotNghiepDh: !this.state.daTotNghiepDh, truongDhKhac: false })} />
                    <FormCheckbox index={index} ref={e => this.daTotNghiep['CĐ'] = e} className='col-md-3' label='Đã tốt nghiệp Cao đẳng - Học viện'
                        onChange={() => this.setState({ daTotNghiepCd: !this.state.daTotNghiepCd, truongCdKhac: false })} />
                    <FormCheckbox index={index} ref={e => this.daTotNghiep['TC'] = e} className='col-md-3' label='Đã tốt nghiệp Trung cấp'
                        onChange={() => this.setState({ daTotNghiepTc: !this.state.daTotNghiepTc })} />
                </div>
            </div>
            {this.state.daTotNghiepPt && <>
                <b className='tile-title'>Thông tin bằng phổ thông</b>
                <div className='tile-body'>
                    <div className='row'>
                        <FormTextBox index={index} ref={e => this.totNghiep['PT'].namTotNghiep = e} type='year' className='col-md-4' label='Năm tốt nhiệp' />
                        <FormTextBox index={index} ref={e => this.totNghiep['PT'].truong = e} className='col-md-4' label='Trường THPT/GDTX tốt nghiệp' maxLength='50' />
                        <FormSelect index={index} ref={e => this.totNghiep['PT'].tinh = e} className='input-group col-md-4' label='Tỉnh/Thành phố tốt nghiệp' data={ajaxSelectTinhThanhPho} />
                    </div>
                </div>
            </>}
            {this.state.daTotNghiepDh && <>
                <b className='tile-title'>Thông tin bằng đại học</b>
                <div className='tile-body'>
                    <div className='row'>
                        <FormTextBox index={index} ref={e => this.totNghiep['ĐH'].namTotNghiep = e} type='year' className='col-md-4' label='Năm tốt nghiệp' />
                        {this.state.truongDhKhac ? (
                            <FormTextBox index={index} ref={e => this.totNghiep['ĐH'].truongKhac = e} className='col-md-4' label='Trường đại học khác' maxLength='200' />
                        ) : (
                            <FormSelect index={index} ref={e => this.totNghiep['ĐH'].truong = e} className='input-group col-md-4' label='Trường Đại học' data={SelectAdapter_DmDaiHoc} />
                        )}
                        <FormCheckbox index={index} ref={e => this.totNghiep['ĐH'].truongKhacCheck = e} className='col-md-4' label='Trường đại học khác' maxLength='200'
                            onChange={() => this.setState({ truongDhKhac: !this.state.truongDhKhac })} />
                        <FormTextBox index={index} ref={e => this.totNghiep['ĐH'].nganh = e} className='col-md-4' label='Ngành tốt nhiệp' maxLength='200' />
                        <FormTextBox index={index} ref={e => this.totNghiep['ĐH'].soHieuBang = e} className='col-md-4' label='Số hiệu bằng' />
                        <FormTextBox index={index} ref={e => this.totNghiep['ĐH'].soVaoSoCapBang = e} className='col-md-4' label='Số vào sổ cấp bằng' />
                    </div>
                </div>
            </>}
            {this.state.daTotNghiepCd && <>
                <b className='tile-title'>Thông tin bằng cao đẳng</b>
                <div className='tile-body'>
                    <div className='row'>
                        <FormTextBox index={index} ref={e => this.totNghiep['CĐ'].namTotNghiep = e} type='year' className='col-md-4' label='Năm tốt nghiệp' />
                        {this.state.truongCdKhac ? (
                            <FormTextBox index={index} ref={e => this.totNghiep['CĐ'].truongKhac = e} className='col-md-4' label='Trường Cao đẳng/Học viện khác' maxLength='200' />
                        ) : (
                            <FormSelect index={index} ref={e => this.totNghiep['CĐ'].truong = e} className='input-group col-md-4' label='Trường Cao đẳng/Học viện' data={SelectAdapter_DmCaoDang} />
                        )}
                        <FormCheckbox index={index} ref={e => this.totNghiep['CĐ'].truongKhacCheck = e} className='col-md-4' label='Trường Cao đẳng/Học viện khác'
                            onChange={() => this.setState({ truongCdKhac: !this.state.truongCdKhac })} />
                        <FormTextBox index={index} ref={e => this.totNghiep['CĐ'].nganh = e} className='col-md-4' label='Ngành tốt nhiệp' maxLength='200' />
                        <FormTextBox index={index} ref={e => this.totNghiep['CĐ'].soHieuBang = e} className='col-md-4' label='Số hiệu bằng' />
                        <FormTextBox index={index} ref={e => this.totNghiep['CĐ'].soVaoSoCapBang = e} className='col-md-4' label='Số vào sổ cấp bằng' />
                    </div>
                </div>
            </>}
            {this.state.daTotNghiepTc && <>
                <b className='tile-title'>Thông tin bằng trung cấp</b>
                <div className='tile-body'>
                    <div className='row'>
                        <FormTextBox index={index} ref={e => this.totNghiep['TC'].namTotNghiep = e} type='year' className='col-md-4' label='Năm tốt nhiệp' />
                        <FormTextBox index={index} ref={e => this.totNghiep['TC'].truong = e} className='col-md-4' label='Trường Trung cấp tốt nghiệp' maxLength='200' />
                        <FormSelect index={index} ref={e => this.totNghiep['TC'].tinh = e} className='input-group col-md-4' label='Tỉnh/Thành phố tốt nghiệp' data={ajaxSelectTinhThanhPho} />
                        <FormTextBox index={index} ref={e => this.totNghiep['TC'].nganh = e} className='col-md-4' label='Ngành tốt nhiệp' maxLength='200' />
                        <FormTextBox index={index} ref={e => this.totNghiep['TC'].soHieuBang = e} className='col-md-4' label='Số hiệu bằng' />
                        <FormTextBox index={index} ref={e => this.totNghiep['TC'].soVaoSoCapBang = e} className='col-md-4' label='Số vào sổ cấp bằng' />
                    </div>
                </div>
            </>}
            <hr className='mt-0' />
        </>;
    };

    componentThongTinCaNhan = (index) => {
        const { tinhTrang } = this.props.system.user.data;
        let { canEdit, sectionEdit } = this.state;
        let readOnly = !(canEdit == 1 || tinhTrang == 11 || (sectionEdit && (sectionEdit.includes('thongTinKhac') || sectionEdit.includes('all'))));
        return <>
            <p className='tile-title font-weight-bold text-primary'>{index + 1}. Thông tin cá nhân</p>
            <div className='tile-body'>
                <div className='row'>
                    <FormTextBox index={index} ref={e => this.cmnd = e} maxLength='12' label='CCCD/Mã định danh' className='col-md-4' required readOnly={readOnly} />
                    <FormDatePicker index={index} type='date-mask' ref={e => this.cmndNgayCap = e} label='Ngày cấp' className='col-md-4' required readOnly={readOnly} />
                    {/* <FormTextBox index={index} ref={e => this.cmndNoiCap = e} label='Nơi cấp' className='col-md-4' required readOnly={readOnly} /> */}
                    <FormSelect ref={e => this.cmndNoiCap = e} label='Nơi cấp' className='input-group col-md-4' readOnly={readOnly} data={SelectAdapter_DmNoiCapCccd} required />
                    <FormSelect index={index} ref={e => this.quocTich = e} label='Quốc tịch' className='input-group col-md-4' data={SelectAdapter_DmQuocGia} required readOnly={readOnly} />
                    <FormSelect index={index} ref={e => this.danToc = e} label='Dân tộc' className='input-group col-md-4' data={SelectAdapter_DmDanTocV2} required readOnly={readOnly} />
                    <FormSelect index={index} ref={e => this.tonGiao = e} label='Tôn giáo' className='input-group col-md-4' data={SelectAdapter_DmTonGiaoV2} required readOnly={readOnly} />
                    <FormTextBox index={index} ref={e => this.doiTuongChinhSach = e} label='Đối tượng chính sách' placeholder='Ghi rõ đối tượng chính sách, nếu không thuộc diện này thì ghi là Không'
                        className='col-md-12' readOnly={readOnly} required maxLength='200' />
                    <FormCheckbox index={index} label='Đoàn viên' className={this.state.isDoanVien ? 'col-md-3' : 'col-md-12'} onChange={value => this.setState({ isDoanVien: value })} ref={e => this.isDoanVien = e}
                        readOnly={readOnly} />
                    <FormDatePicker index={index} label='Ngày vào đoàn' type='date-mask' className='col-md-9' style={{ display: this.state.isDoanVien ? 'block' : 'none' }} required={this.state.isDoanVien}
                        ref={e => this.ngayVaoDoan = e} readOnly={readOnly} />
                    <FormCheckbox index={index} label='Đảng viên' className={this.state.isDangVien ? 'col-md-3' : 'col-md-12'} onChange={value => this.setState({ isDangVien: value })} ref={e => this.isDangVien = e}
                        readOnly={readOnly} />
                    <FormDatePicker index={index} label='Ngày vào đảng' className='col-md-9' style={{ display: this.state.isDangVien ? 'block' : 'none' }} required={this.state.isDangVien} type='date-mask'
                        ref={e => this.ngayVaoDang = e} readOnly={readOnly} />
                    {/* <FormSelect ref={e => this.doiTuongTuyenSinh = e} label='Đối tượng tuyển sinh' className='input-group col-md-6' data={SelectAdapter_DmSvDoiTuongTs} required readOnly />
                    <FormSelect ref={e => this.khuVucTuyenSinh = e} label='Khu vực tuyển sinh' className='input-group col-md-6' data={['KV1', 'KV2', 'KV2-NT', 'KV3']} readOnly required />
                    <FormSelect ref={e => this.phuongThucTuyenSinh = e} label='Phương thức tuyển sinh' className='input-group col-md-6' data={SelectAdapter_DmPhuongThucTuyenSinh} readOnly required />
                    <FormTextBox ref={e => this.diemThi = e} label='Điểm thi (THPT/ĐGNL)' className='col-md-6' readOnly /> */}
                </div>
            </div>
            <hr className='mt-0' />
        </>;
    };

    componentThongTinNguoiThan = (index) => {
        const { tinhTrang } = this.props.system.user.data;
        let { canEdit, sectionEdit } = this.state;
        let readOnly = !(canEdit == 1 || tinhTrang == 11 || (sectionEdit && (sectionEdit.includes('thongTinKhac') || sectionEdit.includes('all'))));
        return <>
            <p className='tile-title font-weight-bold text-primary'>{index + 1}. Thông tin người thân</p>
            <b className='tile-title'>Thông tin Cha</b>
            <div className='tile-body'>
                <div className='row'>
                    <FormTextBox index={index} ref={e => this.tenCha = e} label='Họ và tên cha' className='form-group col-md-6' readOnly={readOnly} maxLength='150' />
                    <FormDatePicker index={index} ref={e => this.ngaySinhCha = e} label='Ngày sinh cha' type='date-mask' className='form-group col-md-6' readOnly={readOnly} />
                    <FormCheckbox index={index} ref={e => this.isMatCha = e} className='col-md-12' label={'Đã mất'} onChange={value => this.setState({ isMatCha: value })} />
                    {/* <div className={'col-md-12 ' + (this.state.isMatCha ? 'disabled' : '')}> */}
                    <div style={{ display: this.state.isMatCha ? 'none' : '' }} className='col-md-12'>
                        <div className='row'>
                            <FormTextBox index={index} ref={e => this.sdtCha = e} maxLength='10' label='Số điện thoại cha' className='form-group col-md-6' type='phone' readOnly={readOnly} />
                            <FormTextBox index={index} ref={e => this.ngheNghiepCha = e} label='Nghề nghiệp cha' className='form-group col-md-6' readOnly={readOnly} />
                            <ComponentDiaDiem index={index} ref={e => this.thuongTruCha = e}
                                label={<span>Địa chỉ thường trú của cha {!readOnly && <a href='#' onClick={(e) => this.copyAddressTo(e, this.thuongTru, this.thuongTruCha)}>(Giống địa chỉ thường trú của <b>sinh viên</b>)</a>}</span>} className='form-group col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} maxLengthSoNha='200' />
                        </div>
                    </div>
                </div>
            </div>
            <b className='tile-title'>Thông tin mẹ</b>
            <div className='tile-body'>
                <div className='row'>
                    <FormTextBox index={index} ref={e => this.tenMe = e} label='Họ và tên mẹ' className='form-group col-md-6' readOnly={readOnly} maxLength='150' />
                    <FormDatePicker index={index} ref={e => this.ngaySinhMe = e} label='Ngày sinh mẹ' type='date-mask' className='form-group col-md-6' readOnly={readOnly} />
                    <FormCheckbox index={index} ref={e => this.isMatMe = e} className='col-md-12' onChange={value => this.setState({ isMatMe: value })} label={'Đã mất'} />
                    {/* <div className={'col-md-12 ' + (this.state.isMatMe ? 'disabled' : '')}> */}
                    <div style={{ display: this.state.isMatMe ? 'none' : '' }} className='col-md-12'>
                        <div className='row'>
                            <FormTextBox index={index} ref={e => this.sdtMe = e} maxLength='10' label='Số điện thoại mẹ' type='phone' className='form-group col-md-6' readOnly={readOnly} />
                            <FormTextBox index={index} ref={e => this.ngheNghiepMe = e} label='Nghề nghiệp mẹ' className='form-group col-md-6' readOnly={readOnly} />
                            <ComponentDiaDiem index={index} ref={e => this.thuongTruMe = e}
                                label={<span>Địa chỉ thường trú của mẹ {!readOnly && <a href='#' onClick={(e) => this.copyAddressTo(e, this.thuongTruCha, this.thuongTruMe)}>(Giống địa chỉ thường trú của <b>cha</b>)</a>}</span>} className='form-group col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} maxLengthSoNha='200' />
                        </div>
                    </div>
                </div>
            </div>
            <hr className='mt-0' />
        </>;
    }

    componentAnhThe = (index) => {
        const { tinhTrang } = this.props.system.user.data;
        let { canEdit, sectionEdit } = this.state;
        let readOnly = !(canEdit == 1 || tinhTrang == 11 || (sectionEdit && sectionEdit.includes('all')));
        return <>
            <p className='tile-title font-weight-bold text-primary'>{index + 1}. Ảnh thẻ sinh viên <span className='text-danger ml-1'>*</span></p>
            <div className='tile-body'>
                <div className='d-flex justify-content-evently align-items-center' style={{ gap: 10 }}>
                    <FormImageBox ref={e => this.anhThe = e} uploadType='NewCardImage' readOnly={readOnly} boxUploadStye={{ width: '150px' }} height='200px' onSuccess={this.onUploadAnhThe} />
                    <ul>
                        <li>Vui lòng tải lên ảnh <b className='text-danger'>đúng kích thước (3 x 4cm)</b>.</li>
                        <li>Độ lớn của file ảnh <b className='text-danger'>không quá 1MB</b>. Giảm kích thước file ảnh tại <a href='https://www.iloveimg.com/compress-image' target='_blank'
                            rel='noreferrer'>đây</a></li>
                        <li>Ảnh phải có nền 1 màu (trắng hoặc xanh), chi tiết rõ nét, nghiêm túc.</li>
                        <li>Đây là ảnh phục vụ cho công tác in thẻ sinh viên, <b className='text-danger'>bắt buộc</b> sinh viên tải lên để hoàn thành thông tin và chịu trách nhiệm với ảnh thẻ mình.</li>
                    </ul>
                </div>
            </div></>;
    }


    render() {
        const sections = [
            'componentThongTinCoBan',
            // ('componentThongTinNoiTamTru'),
            'componentThongTinLienLac',
            'componentThongTinNganHang',
            (!['CQ', 'CLC'].includes(this.state.loaiHinhDaoTao) && 'componentThongTinBangCap'),
            'componentThongTinCaNhan',
            'componentThongTinNguoiThan',
            'componentAnhThe',
        ].filter(sec => !!sec);

        return this.state.isLoading ? loadSpinner() : <>
            <div className='tile pb-0'>
                {sections.map((sec, index) =>
                    <React.Fragment key={index} >{this[sec](index)}</React.Fragment>)}
                <div className='tile-footer sticky'>
                    <button className='btn btn-danger' onClick={e => e.preventDefault() || this.downloadSyll()}><i className='fa fa-lg fa-file-pdf-o' />Tải lý lịch</button>
                    <button className='btn btn-primary' onClick={e => e.preventDefault() || this.save()}><i className='fa fa-lg fa-floppy-o' />Lưu thông tin</button>
                </div>
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getSinhVienEditUser, updateStudentUser, updateStudentUserNganHangInfo
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SinhVienInfo);