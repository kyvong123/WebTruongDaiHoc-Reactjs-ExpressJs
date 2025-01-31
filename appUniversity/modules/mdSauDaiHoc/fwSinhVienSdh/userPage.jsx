import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTextBox, FormSelect, FormDatePicker } from 'view/component/AdminPage';
import { getSvSdhAdmin, updateSvSdh, getSvInfo } from './redux';
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

class SinhVienInfoPage extends AdminPage {
    state = { data: {}, lastModified: null, mssv: '', khoa: '', isUpdate: false }

    componentDidMount() {
        T.ready('/user', () => {
            this.props.getSvInfo(data => {
                this.setState({ mssv: data.mssv });
                if (!data) {
                    T.notify('Lấy thông tin sinh viên bị lỗi!', 'danger');
                } else {
                    this.setState({ data, khoa: data.maKhoa ? data.maKhoa : '' });
                    this.setVal(data);
                }
            });
        });
    }

    setVal = (data = {}) => {
        this.mssv.value(data.mssv ? data.mssv : '');
        this.ho.value(data.ho ? data.ho : '');
        this.ten.value(data.ten ? data.ten : '');
        this.ngaySinh.value(data.ngaySinh ? data.ngaySinh : '');
        this.nienKhoa.value(data.nienKhoa ? data.nienKhoa : '');
        this.danToc.value(data.danToc ? data.danToc : '');
        this.namTuyenSinh.value(data.namTuyenSinh || '');
        this.dienThoaiCaNhan.value(data.sdtCaNhan ? data.sdtCaNhan : '');
        this.dienThoaiLienHe.value(data.sdtLienHe ? data.sdtLienHe : '');
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
                ngaySinh: this.validation(this.ngaySinh).getTime(),
                danToc: this.validation(this.danToc),
                sdtCaNhan: this.validation(this.dienThoaiCaNhan),
                sdtLienHe: this.validation(this.dienThoaiLienHe),
                tonGiao: this.validation(this.tonGiao),
                quocTich: this.validation(this.quocTich),
                thuongTruMaHuyen, thuongTruMaTinh, thuongTruMaXa, thuongTruSoNha,
                lienLacMaHuyen, lienLacMaTinh, lienLacMaXa, lienLacSoNha,
                coQuan: this.validation(this.coQuan),
            };
            return data;
        } catch (selector) {
            selector.focus();
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
            this.props.updateSvSdh(this.state.mssv, studentData, data => {
                this.setState({ mssv: data.ma });
                if (!data) {
                    T.notify('Lấy thông tin sinh viên bị lỗi!', 'danger');
                } else {
                    this.setState({ data, khoa: data.maKhoa ? data.maKhoa : '', isUpdate: false });
                    this.setVal(data);
                }
            });
        }
    };

    reset = () => {
        this.props.getSvInfo(data => {
            this.setState({ mssv: data.mssv });
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
        let permission = this.getUserPermission('studentSdh', ['read', 'write', 'delete', 'login']),
            readOnly = !this.state.isUpdate;
        return this.renderPage({
            icon: 'fa fa-user-circle-o',
            title: 'Lý lịch cá nhân sinh viên',
            subTitle: <i style={{ color: 'blue' }}>{item ? item.ho + ' ' + item.ten : ''}</i>,
            breadcrumb: [
                'Lý lịch cá nhân sinh viên'
            ],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin cơ bản</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <FormTextBox ref={e => this.mssv = e} label='Mã số sinh viên' className='form-group col-md-3' readOnly={true} />
                            <FormTextBox ref={e => this.ho = e} label='Họ và tên lót' className='form-group col-md-4' readOnly={true} />
                            <FormTextBox ref={e => this.ten = e} label='Tên' className='form-group col-md-3' readOnly={true} />
                            <FormSelect ref={e => this.gioiTinh = e} label='Giới tính' className='form-group col-md-2' readOnly={true} data={SelectAdapter_DmGioiTinhV2} />
                            <FormSelect ref={e => this.khoa = e} label='Khoa' className='form-group col-md-3' readOnly={true} data={SelectAdapter_DmDonViFaculty_V2} onChange={value => this.setState({ khoa: value.id })} />
                            <FormSelect ref={e => this.nganh = e} label='Ngành' className='form-group col-md-4' readOnly={true} data={SelectAdapter_DmNganhSdh(this.state.khoa)} />
                            <FormTextBox type='year' ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' className='col-md-2' readOnly={true} />
                            <FormTextBox ref={e => this.nienKhoa = e} label='Niên khóa' className='form-group col-md-3' readOnly={true} />
                            <FormSelect ref={e => this.bacDaoTao = e} label='Bậc đào tạo' className='form-group col-md-4' readOnly={true} data={SelectAdapter_DmHocSdhVer2} />
                            <FormSelect ref={e => this.heDaoTao = e} label='Hệ đào tạo' className='form-group col-md-4' readOnly={true} data={SelectAdapter_DmSvLoaiHinhDaoTao} />
                            <FormTextBox ref={e => this.chuongTrinhDaoTao = e} label='Chương trình đào tạo' className='form-group col-md-4' readOnly={true} />
                            <FormSelect ref={e => this.tinhTrang = e} label='Tình trạng' className='form-group col-md-3' readOnly={true} data={SelectAdapter_DmTinhTrangSinhVienV2} />
                            <FormDatePicker ref={e => this.ngaySinh = e} label='Ngày sinh' type='date-mask' className='form-group col-md-3' readOnly={readOnly} required />
                            <FormSelect ref={e => this.quocTich = e} label='Quốc tịch' className='form-group col-md-3' data={SelectAdapter_DmQuocGia} readOnly={readOnly} />
                            <FormSelect ref={e => this.danToc = e} label='Dân tộc' className='form-group col-md-3' data={SelectAdapter_DmDanTocV2} readOnly={readOnly} />
                            <FormSelect ref={e => this.tonGiao = e} label='Tôn giáo' className='form-group col-md-3' data={SelectAdapter_DmTonGiaoV2} readOnly={readOnly} />
                            <ComponentDiaDiem ref={e => this.thuongTru = e} label='Thường trú' className='form-group col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} />
                            {this.state.isUpdate ? <p className='form-group col-md-12'>
                                Nếu <b>Địa chỉ thường trú</b> là <b>Địa chỉ hiện tại</b> thì&nbsp;<a href='#' onClick={this.copyAddress}>nhấp vào đây</a>.
                            </p> : ''}
                            <ComponentDiaDiem ref={e => this.hienTai = e} label='Nơi ở hiện tại' className='form-group col-md-12' requiredSoNhaDuong={true} readOnly={readOnly} />
                            <FormTextBox ref={e => this.dienThoaiCaNhan = e} label='Điện thoại cá nhân' className='form-group col-md-6' maxLength={10} readOnly={readOnly} />
                            <FormTextBox ref={e => this.dienThoaiLienHe = e} label='Điện thoại liên hệ' className='form-group col-md-6' maxLength={10} readOnly={readOnly} />
                            <FormTextBox ref={e => this.emailTruong = e} label='Email' className='form-group col-md-6' readOnly={true} />
                            <FormTextBox ref={e => this.coQuan = e} label='Tên cơ quan' className='form-group col-md-6' readOnly={readOnly} />
                            <FormTextBox ref={e => this.tenDeTai = e} label='Tên đề tài' className='form-group col-md-6' readOnly />
                            <FormSelect ref={e => this.gvhd = e} label='Giảng viên hướng dẫn' className='form-group col-md-6' multiple data={SelectAdapter_FwCanBo} readOnly />

                        </div>
                    </div>
                </div>
            </>,
            backRoute: '/user',
            buttons: permission.login && [
                this.state.isUpdate ? { icon: 'fa fa-lg fa-save', tooltip: 'Save', onClick: this.save, className: 'btn btn-primary btn-circle' } : null,
                !this.state.isUpdate ? { icon: 'fa fa-lg fa-edit', tooltip: 'Edit', className: 'btn btn-primary', onClick: () => this.setState({ isUpdate: true }) } : null,
                { icon: 'fa fa-refresh', tooltip: 'Reset', onClick: this.reset, className: 'btn btn-warning', },

            ],
        });
    }
}

const mapStateToProps = state => ({ system: state.system, svSdh: state.sdh.svSdh });
const mapActionsToProps = {
    getSvSdhAdmin, updateSvSdh, getSvInfo
};
export default connect(mapStateToProps, mapActionsToProps)(SinhVienInfoPage);
