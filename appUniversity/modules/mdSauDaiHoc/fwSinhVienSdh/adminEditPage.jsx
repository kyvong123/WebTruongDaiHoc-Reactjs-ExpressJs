import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, FormSelect, FormDatePicker, FormImageBox } from 'view/component/AdminPage';
import { getSvSdhAdmin, updateSvSdhAdmin, createStudentAdmin } from './redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmDanTocV2 } from 'modules/mdDanhMuc/dmDanToc/redux';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { SelectAdapter_DmTonGiaoV2 } from 'modules/mdDanhMuc/dmTonGiao/redux';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmTinhTrangSinhVienV2 } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmNganhSdh } from 'modules/mdSauDaiHoc/dmNganhSauDaiHoc/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmHocSdhVer2 } from 'modules/mdSauDaiHoc/dmHocSdh/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

class SinhVienSdhPage extends AdminPage {
    state = { data: {}, image: '', mssv: '', khoa: '', isUpdate: false }

    componentDidMount() {
        T.ready('/user/ctsv', () => {
            let route = T.routeMatcher('/user/sau-dai-hoc/sinh-vien/item/:mssv'),
                mssv = route.parse(window.location.pathname).mssv;
            this.setState({ isNew: mssv === 'new' }, () => {
                this.setState({ mssv });
                !this.state.isNew && this.props.getSvSdhAdmin(mssv, data => {
                    if (!data) {
                        T.notify('Lấy thông tin sinh viên bị lỗi!', 'danger');
                    } else {
                        this.setState({ data, khoa: data.maKhoa ? data.maKhoa : '' });
                        this.setVal(data);
                    }
                });
            });

        });
    }

    setVal = (data) => {
        this.mssv.value(data.mssv ? data.mssv : '');
        this.ho.value(data.ho ? data.ho : '');
        this.ten.value(data.ten ? data.ten : '');
        this.ngaySinh.value(data.ngaySinh ? data.ngaySinh : '');
        this.nienKhoa.value(data.nienKhoa ? data.nienKhoa : '');
        this.imageBox.setData('SinhVienSdhImage:' + data.email, data.image ? data.image : '/img/avatar.png');
        this.danToc.value(data.danToc ? data.danToc : '');
        this.namTuyenSinh.value(data.namTuyenSinh || '');
        this.dienThoaiCaNhan.value(data.sdtCaNhan ? data.sdtCaNhan : '');
        this.dienThoaiLienLac.value(data.sdtLienHe ? data.sdtLienHe : '');
        this.emailTruong.value(data.email ? data.email : '');
        this.gioiTinh.value(data.gioiTinh ? data.gioiTinh : '');
        this.khoa.value(data.maKhoa ? Number(data.maKhoa) : '');
        this.nganh.value(data.maNganh ? Number(data.maNganh) : '');
        this.thuongTru.value(data.thuongTruMaTinh, data.thuongTruMaHuyen, data.thuongTruMaXa, data.thuongTruSoNha);
        this.hienTai.value(data.lienLacMaTinh, data.lienLacMaHuyen, data.lienLacMaXa, data.lienLacSoNha);
        this.heDaoTao.value(data.heDaoTao ? data.heDaoTao : '');
        this.bacDaoTao.value(data.bacDaoTao ? data.bacDaoTao : '');
        this.tinhTrang.value(data.tinhTrang ? data.tinhTrang : '');
        this.tonGiao.value(data.tonGiao ? data.tonGiao : '');
        this.quocTich.value(data.quocTich ? data.quocTich : '');
        this.chuongTrinhDaoTao.value(data.chuongTrinhDaoTao ? data.chuongTrinhDaoTao : '');
        this.coQuan.value(data.coQuan ? data.coQuan : '');
        this.tenDeTai.value(data.tenDeTai ? data.tenDeTai : '');
        this.gvhd.value(data.gvhd ? JSON.parse(data.gvhd) : []);
    };

    getAndValidate = () => {
        try {
            const { maTinhThanhPho: thuongTruMaTinh, maQuanHuyen: thuongTruMaHuyen, maPhuongXa: thuongTruMaXa, soNhaDuong: thuongTruSoNha } = this.thuongTru.value();
            const { maTinhThanhPho: lienLacMaTinh, maQuanHuyen: lienLacMaHuyen, maPhuongXa: lienLacMaXa, soNhaDuong: lienLacSoNha } = this.hienTai.value();
            const data = {
                ho: this.validation(this.ho),
                ten: this.validation(this.ten),
                namTuyenSinh: this.namTuyenSinh?.value() ? Number(this.namTuyenSinh.value()) : '',
                ngaySinh: this.validation(this.ngaySinh).getTime(),
                danToc: this.danToc ? this.danToc.value() : '',
                nienKhoa: this.nienKhoa ? this.nienKhoa.value() : '',
                dienThoaiCaNhan: this.dienThoaiCaNhan ? this.dienThoaiCaNhan.value() : '',
                dienThoaiLienLac: this.dienThoaiLienLac ? this.dienThoaiLienLac.value() : '',
                gioiTinh: this.gioiTinh ? this.gioiTinh.value() : '',
                khoa: this.khoa ? this.khoa.value() : '',
                maKhoa: this.maKhoa ? this.maKhoa.value() : '',
                maNganh: this.maNganh ? this.maNganh.value() : '',
                heDaoTao: this.heDaoTao ? this.heDaoTao.value() : '',
                bacDaoTao: this.bacDaoTao ? this.bacDaoTao.value() : '',
                chuongTrinhDaoTao: this.chuongTrinhDaoTao ? this.chuongTrinhDaoTao.value() : '',
                tinhTrang: this.tinhTrang ? this.tinhTrang.value() : '',
                tonGiao: this.tonGiao ? this.tonGiao.value() : '',
                quocGia: this.quocTich ? this.quocTich.value() : '',
                thuongTruMaHuyen, thuongTruMaTinh, thuongTruMaXa, thuongTruSoNha,
                lienLacMaHuyen, lienLacMaTinh, lienLacMaXa, lienLacSoNha,
                coQuan: this.coQuan ? this.coQuan.value() : '',
                tenDeTai: this.tenDeTai ? this.tenDeTai.value() : '',
                gvhd: JSON.stringify(this.gvhd ? this.gvhd.value() : '')
            };
            if (this.state.isNew) {
                data.mssv = this.validation(this.mssv);
            }
            return data;
        } catch (selector) {
            selector?.focus();
            T.notify('<b>' + (selector.props.placeholder || selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }

    };

    validation = (selector) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired) throw selector;
        return '';
    };

    copyAddress = e => {
        e.preventDefault();
        const dataThuongTru = this.thuongTru.value();
        this.hienTai.value(dataThuongTru.maTinhThanhPho, dataThuongTru.maQuanHuyen, dataThuongTru.maPhuongXa, dataThuongTru.soNhaDuong);
    };

    save = () => {
        const studentData = this.getAndValidate();
        if (studentData) {
            this.state.isNew ? this.props.createStudentAdmin(studentData, data => {
                this.props.history.push(`/user/sau-dai-hoc/sinh-vien/item/${data.mssv}`);
                this.setState({ isUpdate: false, isNew: false, mssv: data.mssv });
                this.setVal(data);
            }) : this.props.updateSvSdhAdmin(this.state.mssv, studentData, item => {
                this.setVal(item);
                this.setState({ isUpdate: false });
            });
        }
    };

    imageChanged = (data) => {
        if (data && data.image) {
            T.notify('Cập nhật ảnh đại diện thành công!', 'success');
            const user = Object.assign({}, this.props.system.user, { image: data.image });
            this.props.readOnly && this.props.updateSystemState({ user });
        }
    };

    reset = () => {
        this.props.getSvSdhAdmin(this.state.mssv, data => {
            if (!data) {
                T.notify('Reset bị lỗi!', 'danger');
            } else {
                this.setState({ data, khoa: data.maKhoa ? data.maKhoa : '', isUpdate: false });
                this.setVal(data);
            }
        });
    }

    render() {
        let item = this.props.system && this.props.system.user ? this.props.system.user.student : null;
        let permission = this.getUserPermission('svSdh', ['read', 'write', 'delete']),
            readOnly = !permission.write && !this.state.isUpdate && !this.state.isNew;
        return this.renderPage({
            icon: 'fa fa-user-circle-o',
            title: 'Lý lịch cá nhân học viên',
            subTitle: <i style={{ color: 'blue' }}>{item ? item.ho + ' ' + item.ten : ''}</i>,
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Học viên</Link>,
                <Link key={1} to='/user/sau-dai-hoc/sinh-vien'>Danh sách học viên</Link>,
                'Lý lịch cá nhân học viên'
            ],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin cơ bản học viên</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <FormImageBox ref={e => this.imageBox = e} description='Nhấp hoặc kéo thả để thay đổi ảnh cá nhân'
                                postUrl='/user/upload' uploadType='SinhVienSdhImage' onSuccess={this.imageChanged} className='col-md-3 rounded-circle' isProfile={true} readOnly={readOnly} />
                            <div className="form-group col-md-9">
                                <div className="row">
                                    <FormTextBox ref={e => this.mssv = e} label='Mã số sinh viên' className='form-group col-md-4' readOnly={readOnly} required />
                                    <FormTextBox ref={e => this.ho = e} label='Họ và tên lót' className='form-group col-md-4' readOnly={readOnly} required />
                                    <FormTextBox ref={e => this.ten = e} label='Tên' className='form-group col-md-4' readOnly={readOnly} required />
                                    <FormSelect ref={e => this.gioiTinh = e} label='Giới tính' className='form-group col-md-4' readOnly={readOnly} data={SelectAdapter_DmGioiTinhV2} />
                                    <FormSelect ref={e => this.khoa = e} label='Khoa' className='form-group col-md-4' readOnly={readOnly} data={SelectAdapter_DmDonViFaculty_V2} onChange={value => this.setState({ khoa: value.id })} />
                                    <FormSelect ref={e => this.nganh = e} label='Ngành' className='form-group col-md-4' readOnly={readOnly} data={SelectAdapter_DmNganhSdh(this.state.khoa)} />
                                    <FormTextBox type='year' ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' className='col-md-4' readOnly={readOnly} />
                                    <FormTextBox ref={e => this.nienKhoa = e} label='Niên khóa' className='form-group col-md-4' readOnly={readOnly} />
                                    <FormSelect ref={e => this.bacDaoTao = e} label='Bậc đào tạo' className='form-group col-md-4' readOnly={readOnly} data={SelectAdapter_DmHocSdhVer2} />
                                </div>
                            </div>
                            <FormSelect ref={e => this.heDaoTao = e} label='Hệ đào tạo' className='form-group col-md-4' readOnly={readOnly} data={SelectAdapter_DmSvLoaiHinhDaoTao} />
                            <FormTextBox ref={e => this.chuongTrinhDaoTao = e} label='Chương trình đào tạo' className='form-group col-md-6' readOnly={readOnly} />
                            <FormSelect ref={e => this.tinhTrang = e} label='Tình trạng' className='form-group col-md-4' readOnly={readOnly} data={SelectAdapter_DmTinhTrangSinhVienV2} />
                            <FormDatePicker ref={e => this.ngaySinh = e} label='Ngày sinh' type='date-mask' className='form-group col-md-4' readOnly={readOnly} required />
                            <FormSelect ref={e => this.quocTich = e} label='Quốc tịch' className='form-group col-md-3' data={SelectAdapter_DmQuocGia} readOnly={readOnly} />
                            <FormSelect ref={e => this.danToc = e} label='Dân tộc' className='form-group col-md-3' data={SelectAdapter_DmDanTocV2} readOnly={readOnly} />
                            <FormSelect ref={e => this.tonGiao = e} label='Tôn giáo' className='form-group col-md-3' data={SelectAdapter_DmTonGiaoV2} readOnly={readOnly} />
                            <ComponentDiaDiem ref={e => this.thuongTru = e} label='Thường trú' className='form-group col-md-12' requiredSoNhaDuong={readOnly} readOnly={readOnly} />
                            {this.state.isUpdate ? <p className='form-group col-md-12'>
                                Nếu <b>Địa chỉ thường trú</b> là <b>Địa chỉ hiện tại</b> thì&nbsp;<a href='#' onClick={this.copyAddress}>nhấp vào đây</a>.
                            </p> : ''}
                            <ComponentDiaDiem ref={e => this.hienTai = e} label='Nơi ở hiện tại' className='form-group col-md-12' requiredSoNhaDuong={readOnly} readOnly={readOnly} />
                            <FormTextBox ref={e => this.dienThoaiCaNhan = e} label='Điện thoại cá nhân' className='form-group col-md-6' maxLength={10} readOnly={readOnly} />
                            <FormTextBox ref={e => this.dienThoaiLienLac = e} label='Điện thoại liên lạc' className='form-group col-md-6' maxLength={10} readOnly={readOnly} />
                            <FormTextBox ref={e => this.emailTruong = e} label='Email' className='form-group col-md-6' readOnly={readOnly} />
                            <FormTextBox ref={e => this.coQuan = e} label='Tên cơ quan' className='form-group col-md-6' readOnly={readOnly} />
                            <FormTextBox ref={e => this.tenDeTai = e} label='Tên đề tài' className='form-group col-md-6' readOnly={readOnly} />
                            <FormSelect ref={e => this.gvhd = e} label='Giảng viên hướng dẫn' className='form-group col-md-6' multiple readOnly={readOnly} data={SelectAdapter_FwCanBo} />
                        </div>
                    </div>
                </div>
            </>,
            backRoute: '/user/sau-dai-hoc/sinh-vien',
            buttons: permission.write && [
                { icon: 'fa fa-lg fa-save', tooltip: 'Save', onClick: this.save, className: 'btn btn-primary btn-circle' },
                { icon: 'fa fa-refresh', tooltip: 'Reset', onClick: this.reset, className: 'btn btn-warning', },
            ],
        });
    }
}

const mapStateToProps = state => ({ system: state.system, svSdh: state.sdh.svSdh });
const mapActionsToProps = {
    getSvSdhAdmin, updateSvSdhAdmin, createStudentAdmin
};
export default connect(mapStateToProps, mapActionsToProps)(SinhVienSdhPage);
