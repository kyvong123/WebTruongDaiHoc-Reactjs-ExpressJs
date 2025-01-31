import React from 'react';
import { AdminModal, getValue, FormTextBox, FormSelect, FormDatePicker, FormCheckbox, FormRichTextBox } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
// import { SelectAdapter_SoQuyetDinhVao } from './redux';
import { SelectAdapter_PhoTruong } from 'modules/mdTccb/qtChucVu/redux';
import { SelectAdapter_FwStudentsManageForm } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_CtsvDmFormType } from 'modules/mdCongTacSinhVien/svDmFormType/redux';
import { SelectAdapter_DmTinhTrangSinhVienV2 } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdCongTacSinhVien/ctsvDtNganhDaoTao/redux';
import { SelectAdapter_DtChuyenNganhDaoTao } from 'modules/mdCongTacSinhVien/ctsvDtChuyenNganh/redux';
import { getDtChuongTrinhDaoTaoTheoNganh, SelectAdapter_KhungDaoTaoCtsvFilter } from 'modules/mdCongTacSinhVien/ctsvDtChuongTrinhDaoTao/redux';
import { SelectAdapter_DtLopCtdt, SelectAdapter_DtLopFilterQuyetDinh } from 'modules/mdCongTacSinhVien/ctsvDtLop/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_SoDangKyAlternative } from 'modules/mdHanhChinhTongHop/hcthSoDangKy/redux/soDangKy';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmLyDoLoaiQuyetDinh } from 'modules/mdCongTacSinhVien/svDmLyDoQuyetDinh/redux';
// import AddModalDaoTao from 'modules/mdDaoTao/dtQuanLyQuyetDinh/modal/dtQuyetDinhModal';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import CustomParamComponent from 'modules/mdCongTacSinhVien/svManageForm/component/customParam';
import { getScheduleSettings, getCtsvSemester } from 'modules/mdCongTacSinhVien/ctsvDtSetting/redux';

const quyetDinhRa = '1';
const quyetDinhVao = '2';
// const quyetDinhKhac = '3';
const tinhTrangNghiHocTamThoi = '2';

class AddModal extends AdminModal {
    state = {
        student: '', isSubmit: false, customParam: [], typeQuyetDinh: '', maKhoa: '', lhdtMoi: '', maNganhMoi: '',
        chuyenNganhMoi: null, khoaDtMoi: '', ctdtMoi: '', kyKhuyetDanh: false, soQuyetDinhRaTruoc: '', chuyenTinhTrang: null,
        namHoc: null, vanBanDaPhatHanh: 0
    }
    componentDidMount() {
        this.disabledClickOutside();
        this.onHidden(this.onHide);
        this.props.getScheduleSettings(data => {
            const { namHoc, hocKy } = data.currentSemester;
            this.setState({ namHocHienTai: namHoc, hocKyHienTai: hocKy, semesterHienTai: data.currentSemester });
            // this.namHocHieuLuc.value(namHoc);
            // this.hocKyHieuLuc.value(hocKy);
        });
    }

    onHide = () => {
        this.soQuyetDinh.value('');
    }

    onShow = (item) => {
        // let { kieuQuyetDinh, idSoQuyetDinh, lyDoQuyetDinh, ghiChu, maDangKy, mssvDangKy, maFormDangKy, nguoiKy, emailDangKy,
        //     chucVuNguoiKy, model, dataCustom, tinhTrangHienTai, chuyenTrangThaiRa, ngayHetHan, ngayBatDau, ngayDuKienTiepNhan,
        //     thoiGianNghiDuKien, tinhVaoThoiGianDaoTao, chuyenTrangThaiVao, khoaDtMoi, lhdtMoi, lopMoi, ctdtMoi, nganhMoi, khoaMoi,
        //     soQuyetDinhRaTruoc, maNganhCha, ngayKy, namHocFormDangKy, hocKyFormDangKy } = item ? item : {
        //         kieuQuyetDinh: '', maDangKy: null, lyDoQuyetDinh: '', ghiChu: '', emailDangKy: '', tenDangKy: '',
        //         hoDangKy: '', mssvDangKy: '', tenFormDangKy: '', staffSign: '', idSoQuyetDinh: '', soQuyetDinh: '',
        //         tinhTrangCapNhat: '', model: null, dataCustom: null, tinhTrangHienTai: '', chuyenTrangThaiRa: '', ngayHetHan: '',
        //         ngayBatDau: '', ngayDuKienTiepNhan: '', thoiGianNghiDuKien: '', tinhVaoThoiGianDaoTao: '', chuyenTrangThaiVao: '',
        //         khoaDtMoi: '', khoaMoi: '', lopMoi: '', ctdtMoi: '', nganhMoi: '', bdtMoi: '', lhdtMoi: '', soQuyetDinhRaTruoc: '',
        //         ngayKy: '', nguoiKy: '', namHocFormDangKy: '', namHoc: '', hocKy: ''
        //     };
        let { kieuQuyetDinh = '', maDangKy = null, lyDoQuyetDinh = '', ghiChu = '', emailDangKy = '',
            mssvDangKy = '', idSoQuyetDinh = '',
            model = null, dataCustom = null, tinhTrangHienTai = '', chuyenTrangThaiRa = '', ngayHetHan = '',
            ngayBatDau = '', ngayDuKienTiepNhan = '', thoiGianNghiDuKien = '', tinhVaoThoiGianDaoTao = '', chuyenTrangThaiVao = '',
            khoaDtMoi = '', khoaMoi = '', lopMoi = '', ctdtMoi = '', nganhMoi = '', lhdtMoi = '', soQuyetDinhRaTruoc = '',
            ngayKy = '', nguoiKy = '', namHocFormDangKy = '', maNganhCha = '', maFormDangKy = '', namHocHieuLuc, hocKyHieuLuc, chucVuNguoiKy } = item ?? {};
        model = model ? JSON.parse(model) : [];
        dataCustom = dataCustom ? JSON.parse(dataCustom) : {};
        this.setState({ isSubmit: false, typeQuyetDinh: kieuQuyetDinh, chuyenTinhTrang: chuyenTrangThaiRa ? chuyenTrangThaiRa : chuyenTrangThaiVao, maDangKy, item, student: emailDangKy, staffSign: nguoiKy, kyKhuyetDanh: nguoiKy === null ? true : false, staffSignPosition: chucVuNguoiKy, customParam: model, khoaDtMoi, ctdtMoi, maNganhMoi: maNganhCha, chuyenNganhMoi: maNganhCha ? nganhMoi : null, lhdtMoi, soQuyetDinhRaTruoc }, () => {
            model.forEach(item => this[item.ma].value(dataCustom[item.ma] ? dataCustom[item.ma] : ''));
            this.props.getSvInfo(mssvDangKy, sv => {
                if (this.state.typeQuyetDinh == quyetDinhRa) {
                    this.chuyenTinhTrang.value(chuyenTrangThaiRa);
                    this.ngayHetHan?.value(ngayHetHan || '');
                    this.ngayBatDau?.value(ngayBatDau || '');
                    this.ngayDuKienTiepNhan?.value(ngayDuKienTiepNhan || '');

                    this.thoiGianNghiDuKien?.value(thoiGianNghiDuKien || '');
                    this.tinhVaoThoiGianDaoTao?.value(tinhVaoThoiGianDaoTao ? 1 : 0);
                }
                else if (this.state.typeQuyetDinh == quyetDinhVao) {
                    this.props.getCtdt(sv.dataCtdt.maCtdt, res => {
                        this.setState({ origin: res });
                        this.namTuyenSinh.value(res.khoaSinhVien || '');
                        this.heDaoTaoGoc.value(res.loaiHinhDaoTao || '');
                        this.nganhTrungTuyen.value(res.maNganh || '');
                        this.khoaTrungTuyen.value(res.maKhoa || '');
                    });
                    this.chuyenTinhTrang.value(chuyenTrangThaiVao || '');
                    this.khoaDtMoi.value(khoaDtMoi || '');
                    this.khoaMoi.value(khoaMoi || '');
                    this.bdtMoi.value('DH');
                    this.lopMoi.value(lopMoi || '');
                    this.chuyenNganhMoi.value(maNganhCha ? nganhMoi : '');
                    this.nganhMoi.value(maNganhCha ? maNganhCha : nganhMoi);
                    this.ctdtMoi.value(ctdtMoi || '');
                    this.lhdtMoi.value(lhdtMoi || '');
                    this.soQuyetDinhRaTruoc.value(soQuyetDinhRaTruoc || '');
                }
            });
            this.formType.value(maFormDangKy);
            this.lyDoQuyetDinh.value(lyDoQuyetDinh);
            this.ghiChuQuyetDinh.value(ghiChu || '');
            this.loaiQuyetDinh.value(kieuQuyetDinh || '');
            this.soQuyetDinh.value(idSoQuyetDinh);
            this.mssv.value(mssvDangKy || '');
            this.kyKhuyetDanh.value(nguoiKy === null ? true : false);
            this.nguoiKy.value(nguoiKy || '');
            this.ngayKy.value(ngayKy ? ngayKy : Date.now());
            this.trangThaiHienTai.value(tinhTrangHienTai || '');
            if (namHocFormDangKy) {
                this.setState({ namHoc: namHocFormDangKy }, () => {
                    this.namHoc.value(namHocFormDangKy);
                    // this.hocKy.value(hocKyFormDangKy);
                });
            } else {
                this.namHoc.value(this.state.namHocHienTai);
                // this.hocKy.value(this.state.hocKy);
            }
            this.namHocHieuLuc.value(namHocHieuLuc ?? this.state.namHocHienTai);
            this.hocKyHieuLuc.value(hocKyHieuLuc ?? this.state.hocKyHienTai);
            if (namHocHieuLuc && hocKyHieuLuc) {
                this.props.getCtsvSemester(namHocHieuLuc, hocKyHieuLuc, semester => this.setState({ semester }));
            } else {
                this.setState({ semester: this.state.semesterHienTai });
            }
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const svManageQuyetDinh = {
            student: this.state.student,
            formType: getValue(this.formType),
            tenForm: this.state.tenForm,
            lyDo: getValue(this.lyDoQuyetDinh),
            ghiChu: getValue(this.ghiChuQuyetDinh),
            namHoc: getValue(this.namHocHieuLuc),
            hocKy: getValue(this.hocKyHieuLuc),
            soQuyetDinh: getValue(this.soQuyetDinh),
            kieuQuyetDinh: getValue(this.loaiQuyetDinh),
            staffSign: this.state.kyKhuyetDanh ? null : getValue(this.nguoiKy),
            staffSignPosition: this.state.kyKhuyetDanh ? 'Hiệu trưởng' : this.state.position,
            dataCustom: this.getDataDangKy(),
            model: JSON.stringify(this.state.customParam),
            action: this.state.maDangKy ? 'U' : null,
            data: this.getDataQuyetDinh(this.state.typeQuyetDinh),
            ngayKy: Number(getValue(this.ngayKy)),
        };
        const done = (data) => {
            this.setState({ isSubmit: true, maDangKy: null }, () => {
                this.hide();
                this.props.getPage();
            });
            data.maDangKy = data.id;
            data.maFormDangKy = data.formType;
            // this.props.download(e, data);
            this.props.downloadWord(data);
        };
        T.confirm('Xác nhận tạo quyết định',
            '<p>Bạn có chắc chắn muốn tạo quyết định này?</p><p style="color:red">Lưu ý: Một khi đã xác nhận, hệ thống sẽ lập tức cập nhật thông tin sinh viên. Vui lòng kiểm tra kỹ thông tin quyết định</p></>'
            , isConfirm => {
                isConfirm && (
                    this.state.maDangKy ? this.props.update(this.state.maDangKy, svManageQuyetDinh, done) : this.props.create({ ...svManageQuyetDinh, idCvd: this.state.idCvd }, done)
                );
            });
    }

    checkSoQuyetDinh = (data) => {
        const user = this.props.user;
        if (data && data.email != user.email && data.isNew) {
            const currentSqd = this.soQuyetDinh?.value() || null;
            if (currentSqd && data.soQuyetDinh == currentSqd) {
                const { firstName, lastName } = data;
                T.notify(`Cán bộ ${lastName} ${firstName} đã sử dụng !${data.soQuyetDinh}`, 'warning');
                this.soQuyetDinh && this.soQuyetDinh.value(null);
            }
        }
    }

    getDataQuyetDinh = (typeQuyetDinh) => {
        let data = {};
        if (typeQuyetDinh == quyetDinhRa) {
            data.trangThaiHienTai = getValue(this.trangThaiHienTai);
            data.chuyenTrangThai = getValue(this.chuyenTinhTrang);
            if (this.state.chuyenTinhTrang == tinhTrangNghiHocTamThoi) {
                data.thoiGianNghiDuKien = getValue(this.thoiGianNghiDuKien);
                data.ngayHetHan = getValue(this.ngayHetHan) !== '' ? getValue(this.ngayHetHan).getTime() : '';
                data.ngayBatDau = getValue(this.ngayBatDau) !== '' ? getValue(this.ngayBatDau).getTime() : '';
                data.ngayDuKienTiepNhan = getValue(this.ngayDuKienTiepNhan) !== '' ? getValue(this.ngayDuKienTiepNhan).getTime() : '';
                data.tinhVaoThoiGianDaoTao = this.tinhVaoThoiGianDaoTao.value() ? 1 : 0;
            }
        }
        else if (typeQuyetDinh == quyetDinhVao) {
            data.tinhTrangHienTai = getValue(this.trangThaiHienTai);
            data.soQuyetDinhRaTruoc = this.state.soQuyetDinhRaTruoc;
            data.chuyenTinhTrang = getValue(this.chuyenTinhTrang);
            data.lhdtMoi = getValue(this.lhdtMoi);
            data.nganhMoi = getValue(this.chuyenNganhMoi) != null ? getValue(this.chuyenNganhMoi) : getValue(this.nganhMoi);
            data.khoaDtMoi = getValue(this.khoaDtMoi);
            data.khoaMoi = getValue(this.khoaMoi);
            data.lopMoi = getValue(this.lopMoi);
            data.ctdtMoi = getValue(this.ctdtMoi);
        }
        return data;
    }

    getDataDangKy = () => {
        let data = {};
        this.state.customParam.forEach(item => {
            Object.assign(data, this[item.ma].getDataDangKy());
        });
        return JSON.stringify(data);
    }


    changeChucVu = (value) => {
        let shcc = value.id,
            content = value.text;
        this.setState({ staffSign: shcc, position: content.split(': ')[0] });
    }

    changeRegister = item => {
        this.setState({ student: item.email });
        this.trangThaiHienTai.value(item.tinhTrangHienTai ? item.tinhTrangHienTai : '');
        if (this.state.typeQuyetDinh == quyetDinhVao) {
            this.props.getSoQDCuoi(item.email, item => {
                this.soQuyetDinhRaTruoc.value(item ? item.soCongVan : '');
                this.setState({ soQuyetDinhRaTruoc: item ? item.soCongVan : '' });
            });
            this.props.getCtdt(item.maCtdt, res => {
                const { khoaSinhVien, loaiHinhDaoTao, maNganh } = res;
                this.setState({ origin: res, khoaDtMoi: khoaSinhVien, lhdtMoi: loaiHinhDaoTao, maNganhMoi: maNganh, ctdtMoi: item.maCtdt }, () => {
                    this.namTuyenSinh.value(res.khoaSinhVien || '');
                    this.heDaoTaoGoc.value(res.loaiHinhDaoTao || '');
                    this.nganhTrungTuyen.value(res.maNganh || '');
                    this.khoaTrungTuyen.value(res.maKhoa || '');
                    // Set default
                    this.lhdtMoi.value(res.loaiHinhDaoTao || '');
                    this.nganhMoi.value(res.maNganh || '');
                    this.khoaDtMoi.value(res.khoaSinhVien || '');
                    this.lopMoi.value(null);
                    this.ctdtMoi.value(item.maCtdt);
                    this.chuyenTinhTrang.value(1);
                });
            });
            this.lopMoi.value(item.lop);
            this.khoaMoi.value(item.khoa);
        }

    }

    changeKieuQuyetDinh = (value) => {
        this.setState({ customParam: [] });
        this.setState({ tenForm: value.text, customParam: value.customParam.map(item => { item.data = JSON.parse(item.data); return item; }) }, () => {
            this.state.customParam.forEach(item => {
                this[item.ma].value('');
                if (item.type == '1')
                    this[item.ma].value(item.data.text);
            });
        });
    }

    changeKyKhuyetDanh = (value) => {
        this.setState({ kyKhuyetDanh: value });
    }

    changeFormType = (value) => {
        if (this.state.typeQuyetDinh != value.id) {
            this.setState({ typeQuyetDinh: value.id }, () => {
                this.formType.value(null);
                this.lyDoQuyetDinh.value(null);
                this.mssv.value(null);
                this.formType.focus();
                if (this.state.typeQuyetDinh == quyetDinhVao) {
                    this.bdtMoi.value('DH');
                }
            });
        }
    }

    changeLhdt = (value) => {
        this.setState({ lhdtMoi: value.id }, () => {
            this.ctdtMoi.value(null);
            this.khoaDtMoi.focus();
        });
    }

    changeKichHoat = value => this.tinhVaoThoiGianDaoTao.value(value ? 1 : 0) || this.tinhVaoThoiGianDaoTao.value(value);

    changeCtdtMoi = (value) => {
        this.nganhMoi.value(value.maNganh);
        this.nganhMoi.props.data.fetchOne(value.maNganh, res => {
            this.khoaMoi.value(res.khoa);
        });
        this.setState({ ctdtMoi: value.id, maNganhMoi: value.maNganh }, () => {
            this.lopMoi.value(null);
            if (value.maChuyenNganh) {
                this.setState({ chuyenNganhMoi: value.maChuyenNganh });
                this.chuyenNganhMoi.value(value.maChuyenNganh);
            } else {
                this.setState({ chuyenNganhMoi: null });
            }
        });
    }

    onChangeChuyenTinhTrang = (value) => {
        if (value.id == tinhTrangNghiHocTamThoi) {
            const semester = this.state.semester;
            if (semester) {
                this.ngayBatDau.value(semester.beginTime);
            }
        }
    }

    componentQuyetDinhRa = () => {
        const readOnly = this.props.readOnly;
        return (
            <>
                <FormSelect ref={e => this.chuyenTinhTrang = e} label='Chuyển tình trạng' className='col-md-6' data={SelectAdapter_DmTinhTrangSinhVienV2} onChange={value => this.setState({ chuyenTinhTrang: value.id }, () => this.onChangeChuyenTinhTrang(value))} readOnly={readOnly} required />
                {this.state.chuyenTinhTrang == tinhTrangNghiHocTamThoi ? (
                    <>
                        {/* <FormTextBox type='number' ref={e => this.thoiGianNghiDuKien = e} label='Thời gian nghỉ dự kiến (hoc kỳ)' className='col-md-6' readOnly={readOnly} /> */}
                        <FormSelect type='number' ref={e => this.thoiGianNghiDuKien = e} label='Thời gian nghỉ dự kiến' className='col-md-6' readOnly={readOnly} data={Array.from({ length: 8 }, (_, i) => ({ id: i + 1, text: `${i + 1} học kỳ` }))} onChange={value => this.calculateNghiHocTamThoi(value.id)} />
                        <FormDatePicker type='date-mask' ref={e => this.ngayBatDau = e} label='Ngày bắt đầu nghỉ' className='col-md-4' readOnly={readOnly} required />
                        <FormDatePicker type='date-mask' ref={e => this.ngayHetHan = e} label='Ngày hết hạn' className='col-md-4' readOnly={readOnly} required />
                        <FormDatePicker type='date-mask' ref={e => this.ngayDuKienTiepNhan = e} label='Ngày dự kiến tiếp nhận' className='col-md-4' readOnly={readOnly} />
                        <FormCheckbox className='col-md-4' ref={e => this.tinhVaoThoiGianDaoTao = e} label='Tính vào thời gian đào tạo' isSwitch={true} readOnly={readOnly}
                            onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                    </>
                ) : null}
            </>
        );
    }


    changeKhoaDaoTao = (value) => {
        // this.setState({ khoaDtMoi: value.id }, () => { this.ctdtMoi.value(null); this.nganhMoi.value(null); });
        this.setState({ khoaDtMoi: value.id }, () => {
            const origin = this.state.origin || {};
            const maNganh = origin.maNganh,
                heDaoTao = origin.loaiHinhDaoTao;

            maNganh && heDaoTao && SelectAdapter_DtLopFilterQuyetDinh(maNganh, null, heDaoTao, value.id).fetchAll(items => {
                if (items && items.length) {
                    const item = items[0];
                    this.lopMoi.value(item.id);
                    this.nganhMoi.value(maNganh);
                    this.ctdtMoi.value(item.maCtdt);
                } else {
                    this.ctdtMoi.value(null);
                    this.lopMoi.value(null);
                }
            });
        });
    }

    changeNganhMoi = (value) => {
        this.setState({ maNganhMoi: value.id, chuyenNganhMoi: null }, () => {
            this.chuyenNganhMoi.value(null);
            this.khoaMoi.value(value.khoa);
            const { lhdtMoi, maNganhMoi, chuyenNganhMoi, khoaDtMoi } = this.state;
            this.props.getDtChuongTrinhDaoTaoTheoNganh(lhdtMoi, maNganhMoi, chuyenNganhMoi, khoaDtMoi, (data) => {
                this.ctdtMoi.value(data ? data.maCtdt : null);
                this.setState({ ctdtMoi: data ? data.maCtdt : null }, () => this.lopMoi.value(null));
            });
        });
    }

    changeChuyenNganhMoi = (value) => {
        this.setState({ chuyenNganhMoi: value ? value.id : null }, () => {

            const { lhdtMoi, maNganhMoi, chuyenNganhMoi, khoaDtMoi } = this.state;
            this.props.getDtChuongTrinhDaoTaoTheoNganh(lhdtMoi, maNganhMoi, chuyenNganhMoi, khoaDtMoi, (data) => {
                this.ctdtMoi.value(data ? data.maCtdt : null);
                this.setState({ ctdtMoi: data ? data.maCtdt : null }, () => this.lopMoi.value(null));
            });
        });
    }

    componentQuyetDinhVao = () => {
        const readOnly = this.props.readOnly;
        return (
            <>
                {/* Thong tin tuyen sinh */}
                <FormTextBox ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' className='col-md-3' readOnly />
                <FormSelect ref={e => this.heDaoTaoGoc = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Hệ đào tạo trúng tuyển' className='col-md-3' readOnly />
                <FormSelect ref={e => this.khoaTrungTuyen = e} data={SelectAdapter_DmDonViFaculty_V2} label='Khoa trúng tuyển' className='col-md-3' readOnly />
                <FormSelect ref={e => this.nganhTrungTuyen = e} data={SelectAdapter_DtNganhDaoTao} label='Ngành trúng tuyển' className='col-md-3' readOnly />
                <FormTextBox ref={e => this.bdtMoi = e} label='Bậc đào tạo mới' className='col-md-3' readOnly={true} />
                <FormTextBox ref={e => this.soQuyetDinhRaTruoc = e} label='Số quyết định ra trước' className='col-md-9' readOnly />
                {/* Thong tin moi */}
                <FormSelect minimumResultsForSearch={-1} ref={e => this.lhdtMoi = e} label='Hệ đào tạo mới' className='col-md-3' data={SelectAdapter_DmSvLoaiHinhDaoTao} readOnly={readOnly} onChange={this.changeLhdt} />
                <FormSelect minimumResultsForSearch={-1} type='year' ref={e => this.khoaDtMoi = e} label='Khóa đào tạo mới' className='col-md-3' data={SelectAdapter_DtKhoaDaoTao} readOnly={readOnly} required onChange={this.changeKhoaDaoTao} />
                <FormSelect ref={e => this.chuyenTinhTrang = e} label='Chuyển tình trạng' className='col-md-3' data={SelectAdapter_DmTinhTrangSinhVienV2} readOnly={readOnly} />
                <FormSelect ref={e => this.nganhMoi = e} label='Ngành mới' data={SelectAdapter_DtNganhDaoTao} className='col-md-3' onChange={this.changeNganhMoi} readOnly={readOnly} />
                <FormSelect allowClear={true} ref={e => this.chuyenNganhMoi = e} label='Chuyên ngành mới' data={SelectAdapter_DtChuyenNganhDaoTao(this.state.maNganhMoi)} onChange={this.changeChuyenNganhMoi} className='col-md-3' readOnly={readOnly} />
                <FormSelect ref={e => this.ctdtMoi = e} label='Chương trình đào tạo mới' data={SelectAdapter_KhungDaoTaoCtsvFilter(this.state.lhdtMoi, this.state.khoaDtMoi, this.state.maNganhMoi)} onChange={this.changeCtdtMoi} className='col-md-3' readOnly={readOnly} required />
                <FormSelect minimumResultsForSearch={-1} ref={e => this.lopMoi = e} data={SelectAdapter_DtLopCtdt(this.state.ctdtMoi)} label='Lớp mới' className='col-md-3' readOnly={readOnly} required />
                <FormSelect ref={e => this.khoaMoi = e} label='Khoa đào tạo mới' className='col-md-3' data={SelectAdapter_DmDonViFaculty_V2} readOnly />
            </>
        );
    }

    deleteItem = (item) => {
        T.confirm('Xóa quyết định này', 'Bạn có chắc bạn muốn xóa quyết định này?', true, isConfirm =>
            isConfirm && this.props.deleteSvManageQuyetDinh(item.maDangKy));
    }

    onShowRequestModal = () => {
        $(this.modal).modal('hide');
        setTimeout(() => {
            this.props.requestModal.show({
                onHide: () => $(this.modal).modal('show'), onCreateCallback: (data, done) => {
                    done && done();
                    data.soVanBan && this.soQuyetDinh.value(data.soVanBan);
                },
                loaiVanBan: 42,
                lyDo: this.formType.data()?.text
            });
        }, 300);
    }

    onCreateRequest = () => {
        $(this.props.requestModal.modal).modal;
    }

    changeSoQuyetDinh = (value) => {
        this.props.svCheckSoQuyetDinh(value.id, (data) => {
            if (data.error) {
                this.soQuyetDinh.value('');
            } else {
                this.setState({ idCvd: value.idVanBan });
            }
        });
    }

    changeNamHoc = (value) => {
        if (value && value.id) {
            this.setState({ namHoc: value.id }, () => {
                this.formType.value('');
            });
        }
    }

    changeThoiGianHieuLuc = ({ namHoc, hocKy }) => {
        const { semester } = this.state;
        let newNamHoc = namHoc ?? semester.namHoc;
        let newHocKy = hocKy ?? semester.hocKy;

        if (newNamHoc != semester.namHoc || newHocKy != semester.hocKy) {
            this.props.getCtsvSemester(newNamHoc, newHocKy, semester => this.setState({ semester }, () => {
                this.calculateNghiHocTamThoi();
            }));
        }
    }

    calculateNghiHocTamThoi = (nHocKy) => {
        if (this.state.chuyenTinhTrang == tinhTrangNghiHocTamThoi) {
            nHocKy = nHocKy ?? this.thoiGianNghiDuKien.value();
            const semester = this.state.semester;
            this.ngayBatDau.value(semester.beginTime);
            if (nHocKy == 1) {
                this.ngayHetHan.value(semester.endTime);
                this.ngayDuKienTiepNhan.value(semester.endTime);
            } else if (nHocKy % 2 == 0) {
                let beginTime = new Date(semester.beginTime);
                let endTime = beginTime.setFullYear(beginTime.getFullYear() + nHocKy / 2);
                this.ngayHetHan.value(endTime);
                this.ngayDuKienTiepNhan.value(endTime);
            } else {
                this.ngayHetHan.value('');
                this.ngayDuKienTiepNhan.value('');
                this.ngayHetHan.focus();
            }
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        const namHocHienTai = this.state.namHoc ?? this.state.namHocHienTai;
        const { typeQuyetDinh = '' } = this.state;
        this.disabledClickOutside();
        return this.renderModal({
            title: this.state.maDangKy ? 'Chi tiết quyết định' : 'Tạo quyết định mới',
            size: 'elarge',
            body: (
                <div style={{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }}>
                    <div className='row'>
                    </div>
                    <div className='row'>
                        {!this.state.maDangKy ? <>
                            <FormCheckbox ref={e => this.vanBanDaPhatHanh = e} label='Văn bản đã tồn tại bên vpdt' className='col-md-12' onChange={value => this.setState({ vanBanDaPhatHanh: value }, () => this.soQuyetDinh.value(''))} />
                        </> : ''}
                        <FormSelect ref={e => this.soQuyetDinh = e} className='col-md-12' label={(this.state.maDangKy ? true : readOnly) ? 'Số quyết định' : <div>Số quyết định <span className='text-danger'>*&nbsp;</span> <Link to='#' onClick={this.onShowRequestModal}>(Nhấn vào đây để thêm)</Link></div>} data={SelectAdapter_SoDangKyAlternative([32], 'TRUONG', ['QĐ'], this.state.vanBanDaPhatHanh ? 1 : 0)} readOnly={this.state.maDangKy ? true : readOnly} placeholder='Số quyết định' onChange={value => this.changeSoQuyetDinh(value)} />
                        <FormSelect className='col-md-3' ref={e => this.namHoc = e} label='Nhóm biểu mẫu (năm học)' required data={SelectAdapter_SchoolYear} onChange={(value) => this.changeNamHoc(value)} readOnly={readOnly || this.state.maDangKy} />
                        {/* <FormSelect className='col-md-6' ref={e => this.hocKy = e} label='Học kỳ' required data={[{ id: 1, text: 'Học kỳ 1' }, { id: 2, text: 'Học kỳ 2' }, { id: 3, text: 'Học kỳ 3' }]} readOnly={readOnly || this.state.id} /> */}
                        <FormSelect minimumResultsForSearch={-1} ref={e => this.loaiQuyetDinh = e} label='Loại quyết định' className='col-md-3' data={[{ id: 1, text: 'Quyết định ra' }, { id: 2, text: 'Quyết định vào' }, { id: 3, text: 'Quyết định khác' }]} onChange={value => this.changeFormType(value)} readOnly={this.state.maDangKy ? true : readOnly} required />
                        <FormSelect minimumResultsForSearch={-1} ref={e => this.formType = e} label='Kiểu quyết định' className='col-md-3' data={this.state.typeQuyetDinh ? SelectAdapter_CtsvDmFormType(namHocHienTai, this.state.typeQuyetDinh) : []} onChange={this.changeKieuQuyetDinh} readOnly={readOnly} required />
                        <FormSelect minimumResultsForSearch={-1} ref={e => this.lyDoQuyetDinh = e} label='Lý do' className='col-md-3' data={this.state.typeQuyetDinh ? SelectAdapter_DmLyDoLoaiQuyetDinh(this.state.typeQuyetDinh) : []} readOnly={readOnly} />
                    </div>
                    <div className='row'>
                        <p className='col-md-3'>Quyết định vào hiệu lực từ <span className='text-danger'>*</span></p>
                        <FormSelect ref={e => this.namHocHieuLuc = e} label={this.state.maDangKy ? 'Năm học' : null} placeholder='Năm học' className='col-md-3' data={SelectAdapter_SchoolYear} required readOnly={this.state.maDangKy ? true : readOnly} onChange={value => this.changeThoiGianHieuLuc({ namHoc: value.id })} />
                        <FormSelect ref={e => this.hocKyHieuLuc = e} label={this.state.maDangKy ? 'Học kỳ' : null} placeholder='Học kỳ' className='col-md-3' data={[{ id: 1, text: 'Học kỳ 1' }, { id: 2, text: 'Học kỳ 2' }, { id: 3, text: 'Học kỳ 3' }]} required readOnly={this.state.maDangKy ? true : readOnly} onChange={value => this.changeThoiGianHieuLuc({ hocKy: value.id })} />
                    </div>
                    <div className='row'>
                        {this.state.customParam.length ? this.state.customParam.map((item, index) => {
                            return <CustomParamComponent key={index} ref={e => this[item.ma] = e} param={item} host={this.state.host} />;
                        }) : null}
                    </div>
                    <div className='row'>
                        <FormSelect ref={e => this.mssv = e} label='Sinh viên' className='col-md-4' data={SelectAdapter_FwStudentsManageForm} onChange={this.changeRegister} readOnly={readOnly} required={typeQuyetDinh == quyetDinhRa || typeQuyetDinh == quyetDinhVao} />
                        <FormSelect ref={e => this.trangThaiHienTai = e} label='Tình trạng hiện tại' data={SelectAdapter_DmTinhTrangSinhVienV2} className='col-md-4' style={{ display: this.state.student ? '' : 'none' }} readOnly={true} />
                    </div>
                    <div className='row'>
                        {typeQuyetDinh == quyetDinhRa && this.componentQuyetDinhRa()}
                        {typeQuyetDinh == quyetDinhVao && this.componentQuyetDinhVao()}
                    </div>
                    <div className='row'>
                        <FormRichTextBox ref={e => this.ghiChuQuyetDinh = e} label='Ghi chú cho quyết định' className='col-md-12' readOnly={readOnly} />
                        <FormCheckbox ref={e => this.kyKhuyetDanh = e} label='Ký khuyết danh' className='col-md-12' onChange={value => this.changeKyKhuyetDanh(value)} readOnly={readOnly} />
                        <FormSelect ref={e => this.nguoiKy = e} label='Người ký' className='col-md-6' data={SelectAdapter_PhoTruong(68)} onChange={this.changeChucVu} required readOnly={readOnly} disabled={this.state.kyKhuyetDanh ? true : false} />
                        <FormDatePicker type='date-mask' ref={e => this.ngayKy = e} label='Ngày ký' className='col-md-6' readOnly={readOnly} />
                    </div>
                </div>),
            submitText: this.state.maDangKy ? 'Lưu' : 'Tạo',
        }
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDtChuongTrinhDaoTaoTheoNganh, getScheduleSettings, getCtsvSemester };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AddModal);