import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, FormSelect, FormDatePicker, FormRichTextBox, FormCheckbox, getValue } from 'view/component/AdminPage';
// import Pagination from 'view/component/Pagination';
// import { Tooltip } from '@mui/material';
import { getThongTinHienTaiSinhVien, createDtQuanLyQuyetDinh, updateDtQuanLyQuyetDinh, dtCheckSoQuyetDinh } from '../redux';
import { SelectAdapter_FwStudentsManageForm } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_DmTinhTrangSinhVienV2 } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';
import { SelectAdapter_PhoTruong } from 'modules/mdTccb/qtChucVu/redux';
// import CreateRequest from 'modules/mdHanhChinhTongHop/hcthSoDangKy/components/createRequest';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_KhungDaoTaoCtsvFilter } from 'modules/mdCongTacSinhVien/ctsvDtChuongTrinhDaoTao/redux';
import { SelectAdapter_DtLopFilter } from 'modules/mdDaoTao/dtLop/redux';
import { SelectAdapter_DtLopCtdt } from 'modules/mdCongTacSinhVien/ctsvDtLop/redux';
import { SelectAdapter_SoDangKyAlternative } from 'modules/mdHanhChinhTongHop/hcthSoDangKy/redux/soDangKy';

const quyetDinhKhac = 3;

export class AddModalQuyetDinhDaoTao extends AdminModal {
    state = { kyKhuyetDanh: false, isCtsv: false, isCtsvUpdate: false, vanBanDaPhatHanh: false }
    onShow = (item) => {
        const permissionCtsv = this.props.getUserPermission('manageQuyetDinh', ['write']);
        const { maDangKy, idSoQuyetDinh, lhdtMoi, khoaDtMoi, nganhMoi, ctdtMoi, lopMoi, nganhHienTai, lopHienTai, ctdtHienTai, khoaDtHienTai, loaiHinhDaoTaoHienTai, mssvDangKy, emailDangKy, tinhTrangHienTai, ngayKy, nguoiKy, tenNguoiCapNhat, ghiChu } = item ? item : { maDangKy: null, idSoQuyetDinh: '', lhdtMoi: '', khoaDtMoi: '', nganhMoi: '', ctdtMoi: '', lopMoi: '', nganhHienTai: '', lopHienTai: '', ctdtHienTai: '', khoaDtHienTai: '', loaiHinhDaoTaoHienTai: '', mssvDangKy: '', emailDangKy: '', tinhTrangHienTai: '', ngayKy: '', nguoiKy: null, tenNguoiCapNhat: null, ghiChu: '' };
        this.setState({ isCtsvUpdate: tenNguoiCapNhat ? true : false, maDangKy, student: emailDangKy, isCtsv: permissionCtsv.write, soQuyetDinh: idSoQuyetDinh, lhdtMoi: lhdtMoi ? lhdtMoi : loaiHinhDaoTaoHienTai, maNganhMoi: nganhMoi ? nganhMoi : nganhHienTai, khoaDtMoi: khoaDtMoi ? khoaDtMoi : khoaDtHienTai, kyKhuyetDanh: nguoiKy === null ? true : false }, () => {
            this.heDaoTaoMoi.value(lhdtMoi || '');
            this.nganhMoi.value(nganhMoi || '');
            this.khoaSinhVienMoi?.value(khoaDtMoi || '');
            this.ctdtMoi?.value(ctdtMoi || '');
            this.lopMoi?.value(lopMoi || '');
            this.tinhTrangHienTai?.value(tinhTrangHienTai || '');
            this.khoaSinhVienHienTai?.value(khoaDtHienTai || '');
            this.heDaoTaoHienTai?.value(loaiHinhDaoTaoHienTai || '');
            this.maNganhHienTai?.value(nganhHienTai || '');
            this.ctdtHienTai?.value(ctdtHienTai || '');
            this.lopHienTai?.value(lopHienTai || '');
            this.mssv.value(mssvDangKy || '');
            this.soQuyetDinh.value(idSoQuyetDinh || '');
            this.kyKhuyetDanh.value(nguoiKy === null ? true : false);
            this.nguoiKy.value(nguoiKy || '');
            this.ngayKy.value(ngayKy ? ngayKy : Date.now());
            this.ghiChuQuyetDinh.value(ghiChu || '');
        });
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
                lyDo: 'Quyết định chuyển hệ ngành'
            });
        }, 300);
    }

    onCreateRequest = () => {
        $(this.props.requestModal.modal).modal;
    }

    changeKyKhuyetDanh = (value) => {
        this.setState({ kyKhuyetDanh: value });
    }

    changeRegister = item => {
        this.setState({ student: item.email });
        this.props.getThongTinHienTaiSinhVien(item.id, res => {
            const { khoaSinhVien, loaiHinhDaoTao, maNganh, maCtdt, lop, tinhTrang } = res;
            this.setState({ heDaoTaoHienTai: loaiHinhDaoTao, maNganhHienTai: maNganh });
            this.khoaSinhVienHienTai.value(khoaSinhVien || '');
            this.heDaoTaoHienTai.value(loaiHinhDaoTao || '');
            this.maNganhHienTai.value(maNganh || '');
            this.tinhTrangHienTai.value(tinhTrang || '');
            this.lopHienTai.value(lop || '');
            this.ctdtHienTai.value(maCtdt || '');
        });
    }

    changeChucVu = (value) => {
        let shcc = value.id,
            content = value.text;
        this.setState({ staffSign: shcc, position: content.split(': ')[0] });
    }

    changeCtdtMoi = (value) => {
        this.setState({ ctdtMoi: value ? value.id : null }, () => {
            this.lopMoi.value(null);
        });
    }

    changeKhoaDaoTao = (value) => {
        this.setState({ khoaDtMoi: value.id }, () => { this.ctdtMoi.value(null); });
    }

    changeNganhMoi = (value) => {
        this.setState({ maNganhMoi: value ? value.id : null }, () => {
            this.ctdtMoi.value(null);
        });
    }

    changeLhdt = (value) => {
        this.setState({ lhdtMoi: value ? value.id : null }, () => {
            this.ctdtMoi.value(null);
        });
    }

    onSubmit = () => {
        const { maDangKy, isCtsv } = this.state;
        const data = {
            student: this.state.student,
            ghiChu: getValue(this.ghiChuQuyetDinh),
            soQuyetDinh: getValue(this.soQuyetDinh),
            staffSign: this.state.kyKhuyetDanh ? null : getValue(this.nguoiKy),
            staffSignPosition: this.state.kyKhuyetDanh ? 'Hiệu trưởng' : this.state.position,
            action: this.state.maDangKy ? 'U' : null,
            ngayKy: Number(getValue(this.ngayKy)),
            maDonVi: 33,
            kieuQuyetDinh: quyetDinhKhac,
            dataUpdate: this.getDataUpdate(),
        };

        if (!data.soQuyetDinh) {
            T.notify('Số quyết định bị trống', 'danger');
            this.soQuyetDinh.focus();
            return;
        } else {
            if (maDangKy) {
                const dataCtsv = isCtsv ? {
                    khoaDtMoi: getValue(this.khoaSinhVienMoi),
                    ctdtMoi: getValue(this.ctdtMoi),
                    lopMoi: getValue(this.lopMoi),
                    mssv: getValue(this.mssv)
                } : {};
                this.props.updateDtQuanLyQuyetDinh(maDangKy, !isCtsv ? data : { student: this.state.student, dataUpdate: dataCtsv }, () => this.hide());
            } else {
                T.confirm('Tạo quyết định', 'Hệ thống sẽ cập nhật thông tin theo quyết định, vui lòng kiểm tra lại thông tin trước khi tạo!', isConfirm => {
                    if (isConfirm) {
                        this.props.createDtQuanLyQuyetDinh({ ...data, idCvd: this.state.idCvd }, () => this.hide());
                    }
                });
            }
        }

    }

    getDataUpdate = () => {
        const { maDangKy } = this.state;
        let data = {
            lhdtMoi: getValue(this.heDaoTaoMoi),
            nganhMoi: getValue(this.nganhMoi),
            khoaDtMoi: getValue(this.khoaSinhVienMoi),
            lopMoi: getValue(this.lopMoi),
            ctdtMoi: getValue(this.ctdtMoi),
        };
        const dataHienTai = {
            lhdtHienTai: getValue(this.heDaoTaoHienTai),
            khoaDtHienTai: getValue(this.khoaSinhVienHienTai),
            nganhHienTai: getValue(this.maNganhHienTai),
        };
        if (!maDangKy) {
            data = { ...data, ...dataHienTai };
        }
        return data;
    }

    changeSoQuyetDinh = (value) => {
        this.props.dtCheckSoQuyetDinh(value.id, (data) => {
            if (data.error) {
                this.soQuyetDinh.value('');
            } else {
                this.setState({ idCvd: value.idVanBan });
            }
        });
    }

    render = () => {
        const readOnly = this.props.readOnly;
        const { soQuyetDinh, isCtsvUpdate, isCtsv } = this.state;
        this.disabledClickOutside();
        return this.renderModal({
            title: this.state.maDangKy ? 'Chi tiết quyết định' : 'Tạo quyết định chuyển ngành mới',
            size: 'elarge',
            body: (
                <div style={{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }}>
                    <div className='row'>
                        {!this.state.maDangKy ? <>
                            <FormCheckbox ref={e => this.vanBanDaPhatHanh = e} label='Văn bản đã tồn tại bên vpdt' className='col-md-12' onChange={value => this.setState({ vanBanDaPhatHanh: value }, () => this.soQuyetDinh.value(''))} />
                        </> : ''}
                        <FormSelect ref={e => this.soQuyetDinh = e} className='col-md-6' label={(soQuyetDinh ? true : readOnly) ? 'Số quyết định' : <div>Số quyết định <span className='text-danger'>*&nbsp;</span> <Link to='#'
                            onClick={this.onShowRequestModal}>(Nhấn vào đây để thêm)</Link></div>} data={SelectAdapter_SoDangKyAlternative([33, 80], 'TRUONG', ['QĐ'], this.state.vanBanDaPhatHanh ? 1 : 0)} readOnly={soQuyetDinh ? true : readOnly} placeholder='Số quyết định' onChange={value => this.changeSoQuyetDinh(value)} />
                        <FormSelect ref={e => this.mssv = e} label='Sinh viên' className='col-md-6' data={SelectAdapter_FwStudentsManageForm} onChange={this.changeRegister} readOnly={(isCtsvUpdate || isCtsv) ? true : false} required />
                    </div>
                    {this.state.student ? <div className='row'>
                        <p className='col-md-12'>Thông tin hiện tại sinh viên</p>
                        <FormSelect ref={e => this.tinhTrangHienTai = e} label='Tình trạng' data={SelectAdapter_DmTinhTrangSinhVienV2} className='col-md-4' readOnly={true} />
                        <FormSelect ref={e => this.heDaoTaoHienTai = e} label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} className='col-md-4' readOnly={true} />
                        <FormSelect ref={e => this.maNganhHienTai = e} label='Ngành' data={SelectAdapter_DtNganhDaoTao} className='col-md-4' readOnly={true} />
                        <FormSelect ref={e => this.khoaSinhVienHienTai = e} label='Khóa sinh viên' data={SelectAdapter_DtKhoaDaoTao} className='col-md-4' readOnly={true} />
                        <FormSelect ref={e => this.ctdtHienTai = e} label='Chương trình đào tạo' data={SelectAdapter_KhungDaoTaoCtsvFilter} className='col-md-4' readOnly={true} />
                        <FormSelect ref={e => this.lopHienTai = e} label='Lớp' data={SelectAdapter_DtLopFilter} className='col-md-4' readOnly={true} />
                    </div> : ''}
                    <div className='row'>
                        <FormSelect ref={e => this.heDaoTaoMoi = e} allowClear={true} label='Hệ đào tạo mới' data={SelectAdapter_DmSvLoaiHinhDaoTao} className='col-md-4' readOnly={(isCtsvUpdate || isCtsv) ? true : false} required onChange={value => this.changeLhdt(value)} />
                        <FormSelect ref={e => this.nganhMoi = e} allowClear={true} label='Ngành mới' data={SelectAdapter_DtNganhDaoTao} className='col-md-4' readOnly={(isCtsvUpdate || isCtsv) ? true : false} required onChange={value => this.changeNganhMoi(value)} />
                        <FormSelect ref={e => this.khoaSinhVienMoi = e} label='Khóa sinh viên' data={SelectAdapter_DtKhoaDaoTao} className='col-md-4' onChange={(value) => this.changeKhoaDaoTao(value)} required readOnly={false} />
                        <FormSelect ref={e => this.ctdtMoi = e} label='Chương trình đào tạo' data={SelectAdapter_KhungDaoTaoCtsvFilter(this.state.lhdtMoi || this.state.heDaoTaoHienTai, this.state.khoaDtMoi, this.state.maNganhMoi || this.state.maNganhHienTai)} className='col-md-4' onChange={value => this.changeCtdtMoi(value)} required readOnly={false} />
                        <FormSelect ref={e => this.lopMoi = e} label='Lớp mới' data={SelectAdapter_DtLopCtdt(this.state.ctdtMoi)} className='col-md-4' required readOnly={false} />
                    </div>
                    <div className='row'>
                        <FormRichTextBox ref={e => this.ghiChuQuyetDinh = e} label='Ghi chú cho quyết định' className='col-md-12' readOnly={(isCtsvUpdate || isCtsv) ? true : false} />
                        <FormCheckbox ref={e => this.kyKhuyetDanh = e} label='Ký khuyết danh' className='col-md-12' onChange={value => this.changeKyKhuyetDanh(value)} readOnly={(isCtsvUpdate || isCtsv) ? true : false} />
                        <FormSelect ref={e => this.nguoiKy = e} label='Người ký' className='col-md-6' data={SelectAdapter_PhoTruong(68)} onChange={this.changeChucVu} required readOnly={(isCtsvUpdate || isCtsv) ? true : false} disabled={this.state.kyKhuyetDanh ? true : false} />
                        <FormDatePicker type='date-mask' ref={e => this.ngayKy = e} label='Ngày ký' className='col-md-6' readOnly={(isCtsvUpdate || isCtsv) ? true : false} />
                    </div>
                </div>),
            submitText: this.state.maDangKy ? 'Lưu' : 'Tạo',
            isShowSubmit: (isCtsvUpdate && !isCtsv) ? false : true
        }
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dtQuanLyQuyetDinh: state.daoTao.dtQuanLyQuyetDinh });
const mapActionsToProps = {
    getThongTinHienTaiSinhVien, createDtQuanLyQuyetDinh, updateDtQuanLyQuyetDinh, dtCheckSoQuyetDinh
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AddModalQuyetDinhDaoTao);