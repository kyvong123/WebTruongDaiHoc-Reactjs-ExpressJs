import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, FormDatePicker, FormTextBox, getValue, FormRichTextBox, renderTable, TableCell, FormCheckbox } from 'view/component/AdminPage';
import { SelectAdapter_FwStudentKhenThuong } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_DtLopFilter } from 'modules/mdCongTacSinhVien/ctsvDtLop/redux';
import { SelectAdapter_CtsvDmThanhTich } from 'modules/mdCongTacSinhVien/ctsvKhenThuongThanhTich/redux';
import { SelectAdapter_PhoTruong } from 'modules/mdTccb/qtChucVu/redux';
import FileBox from 'view/component/FileBox';
import { MAPPER_DOI_TUONG } from '../adminPage';
import { Tooltip } from '@mui/material';
import { getCtsvKhenThuong, updateCtsvKhenThuong, createCtsvKhenThuong } from '../redux';
import { Link } from 'react-router-dom';
import { SelectAdapter_SoDangKyAlternative } from 'modules/mdHanhChinhTongHop/hcthSoDangKy/redux/soDangKy';
import { svCheckSoQuyetDinh } from 'modules/mdCongTacSinhVien/svManageQuyetDinh/redux';
import T from 'view/js/common';

export class ModalCtsvKhenThuong extends AdminModal {
    state = { loaiDoiTuong: 'CN', danhSach: [], kyKhuyetDanh: false, namHoc: null, maThanhTich: null, tenThanhTich: null }
    onShow = (item) => {
        const { id, soQd, loaiDoiTuong, mssv, maLop, maThanhTich, tenThanhTich, namHoc, ngayKy, nguoiKy, ghiChu } = item || {};
        this.setState({ id, item, loaiDoiTuong: loaiDoiTuong ?? 'CN', danhSach: [], kyKhuyetDanh: !!id && !nguoiKy, namHoc, maThanhTich, tenThanhTich }, () => {
            this.soQd.value(soQd || '');
            this.loaiDoiTuong.value(loaiDoiTuong || 'CN');
            this.mssv?.value(mssv || '');
            this.maLop?.value(maLop || '');
            this.maThanhTich.value(maThanhTich || '');
            this.namHoc.value(namHoc || '');
            this.ngayKy.value(ngayKy || Date.now());
            this.nguoiKy.value(nguoiKy || '');
            this.ghiChu.value(ghiChu || '');
            this.kyKhuyetDanh.value(!!id && !nguoiKy);
            id && this.props.getCtsvKhenThuong(id, ({ danhSach }) => {
                this.setState({ danhSach: danhSach ?? [] });
            });
        });
    }

    onSubmit = () => {
        const { danhSach, kyKhuyetDanh, idCvd } = this.state;
        const data = {
            soQd: getValue(this.soQd),
            loaiDoiTuong: getValue(this.loaiDoiTuong),
            maThanhTich: getValue(this.maThanhTich),
            namHoc: getValue(this.namHoc),
            ghiChu: this.ghiChu.value(),
            ngayKy: getValue(this.ngayKy).getTime(),
            nguoiKy: kyKhuyetDanh ? '' : getValue(this.nguoiKy),
            danhSach: danhSach?.length ? danhSach : 0,
            idCvd,
        };
        T.confirm('Xác nhận ' + (this.state.id ? 'cập nhật' : 'tạo') + ' quyết định khen thưởng?', '', isConfirm => {
            if (isConfirm) {
                this.state.id ? this.props.updateCtsvKhenThuong(this.state.id, data) : this.props.createCtsvKhenThuong(data);
                this.hide();
            }
        });
    }

    addItem = ({ mssv, hoTen, maLop }) => {
        const { namHoc, maThanhTich, tenThanhTich } = this.state || {};
        if (namHoc && maThanhTich) {
            this.setState(prevState => ({
                danhSach: [
                    ...prevState.danhSach.filter(item => (!mssv || item.mssv != mssv) && (!maLop || item.maLop != maLop)),
                    { mssv, hoTen, maLop, maThanhTich, tenThanhTich, namHoc }]
            }));
        }
        else {
            T.notify('Hãy chọn thành tích và năm đạt được', 'danger');
        }
        this.danhSachItem.clear();
    }

    removeItem = (mssv) => {
        T.confirm('Xác nhận xóa sinh viên?', '', isConfirm => {
            if (isConfirm) {
                this.setState({ danhSach: [...this.state.danhSach.filter(item => item.mssv != mssv)] });
            }
        });
    }

    onUploadSuccess = (res) => {
        if (res.error) return T.notify(res.error, 'danger');
        T.confirm(this.state.danhSach.length > 0 ? 'Xác nhận ghi đè danh sách?' : 'Xác nhận tải lên danh sách?', '', isConfirm => {
            if (!isConfirm) return;
            if (res.failed?.length > 0) { res.failed.forEach(item => T.notify(item.message, item.color)); return; }
            // if (res.items?.length > 0) {
            //     this.setState({
            //         maThanhTich: res.items[0].maThanhTich,
            //         tenThanhTich: res.items[0].tenThanhTich,
            //         namHoc: res.items[0].namHoc,
            //     });
            //     this.maThanhTich.value(res.items[0].maThanhTich || '');
            //     this.namHoc.value(res.items[0].namHoc || '');
            // }
            this.setState({
                danhSach: res.items ?? [],
                failed: res.failed ?? []
            });
        });
    }

    changeSoQuyetDinh = (value) => {
        this.props.svCheckSoQuyetDinh(value.id, (data) => {
            if (data.error) {
                this.soQd.value('');
            } else {
                this.setState({ idCvd: value.idVanBan });
            }
        });
    }

    onShowRequestModal = () => {
        $(this.modal).modal('hide');
        setTimeout(() => {
            this.props.requestModal.show({
                onHide: () => $(this.modal).modal('show'), onCreateCallback: (data, done) => {
                    done && done();
                    data.soVanBan && this.soQd.value(data.soVanBan);
                },
                loaiVanBan: 42,
                lyDo: 'Quyết định khen thưởng'
            });
        }, 300);
    }

    componentDanhSachSinhVien = (danhSach) => {
        const { readOnly } = this.props;
        return renderTable({
            getDataSource: () => danhSach,
            renderHead: () => <tr>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>#</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>MSSV</th>
                <th style={{ whiteSpace: 'nowrap', width: '70%' }}>Họ tên</th>
                <th style={{ whiteSpace: 'nowrap', width: '30%' }}>Thành tích</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Năm đạt được</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Thao tác</th>
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <td>{index + 1}</td>
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenThanhTich} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namHoc} />
                <TableCell style={{ whiteSpace: 'nowrap' }} permission={{ delete: !readOnly }} type='buttons' onDelete={() => this.removeItem(item.mssv)} />
            </tr>
        });
    }


    componentDanhSachLop = (danhSach) => {
        const { readOnly } = this.props;
        return renderTable({
            getDataSource: () => danhSach,
            renderHead: () => <tr>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>#</th>
                <th style={{ whiteSpace: 'nowrap', width: '70%' }}>Lớp</th>
                <th style={{ whiteSpace: 'nowrap', width: '30%' }}>Thành tích</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Năm đạt được</th>
                <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Thao tác</th>
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <td>{index + 1}</td>
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maLop} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenThanhTich} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namHoc} />
                <TableCell style={{ whiteSpace: 'nowrap' }} permission={{ delete: !readOnly }} type='buttons' onDelete={() => this.removeItem(item.mssv)} />
            </tr>
        });
    }
    downloadExcel = () => {
        T.download(`/api/ctsv/khen-thuong/danh-sach/download?loaiDoiTuong=${this.state.loaiDoiTuong}&danhSach=${T.stringify(this.state.danhSach)}`);
    }

    render = () => {
        const { readOnly } = this.props;
        const { id, vanBanDaPhatHanh, danhSach = [], loaiDoiTuong, kyKhuyetDanh } = this.state;
        return this.renderModal({
            title: (this.state.id ? 'Cập nhật' : 'Tạo') + ' quyết định khen thưởng',
            size: 'elarge',
            body: <div className='row' style={{ height: '70vh', overflow: 'auto' }}>
                {/* Thông tin chung */}
                <div className='col-md-3'><div className='row'>
                    {!id && <>
                        <FormCheckbox ref={e => this.vanBanDaPhatHanh = e} label='Văn bản đã tồn tại bên vpdt' className='col-md-12' onChange={value => this.setState({ vanBanDaPhatHanh: value }, () => this.soQd.value(''))} />
                    </>}
                    <FormSelect ref={e => this.soQd = e} className='col-md-12' label={(readOnly || !!id) ? 'Số quyết định' : <div>Số quyết định <span className='text-danger'>*&nbsp;</span> <Link to='#' onClick={this.onShowRequestModal}>(Nhấn vào đây để thêm)</Link></div>} data={SelectAdapter_SoDangKyAlternative([32], 'TRUONG', ['QĐ'], vanBanDaPhatHanh ? 1 : 0)} readOnly={id ? true : readOnly} placeholder='Số quyết định' onChange={value => this.changeSoQuyetDinh(value)} />
                    {/* <FormSelect className='col-md-12' ref={e => this.soQd = e} label='Số quyết định' data={SelectAdapter_SoDangKy(32, 'TRUONG', 42, null)} readOnly={readOnly} required /> */}


                    <FormRichTextBox className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />
                    <FormCheckbox className='col-md-12' ref={e => this.kyKhuyetDanh = e} label='Ký khuyết danh' onChange={value => this.setState({ kyKhuyetDanh: value })} />
                    <FormSelect ref={e => this.nguoiKy = e} label='Người ký' className='col-md-12' data={SelectAdapter_PhoTruong(68)} onChange={this.changeChucVu} {...(kyKhuyetDanh ? { required: false, disabled: true } : { required: true })} readOnly={readOnly} />
                    <FormDatePicker className='col-md-12' ref={e => this.ngayKy = e} label='Ngày ký' readOnly={readOnly} required />
                </div></div>
                {/* Danh sách sinh viên */}
                <div className='col-md-9'>
                    <div className='row'>
                        <FormSelect className='col-md-4' ref={e => this.loaiDoiTuong = e} label='Loại đối tượng' data={Object.entries(MAPPER_DOI_TUONG).map(([id, text]) => ({ id, text }))} readOnly={readOnly} required
                            onChange={value => this.setState({ loaiDoiTuong: value.id, danhSach: [] })}
                        />
                        <FormSelect className='col-md-6' ref={e => this.maThanhTich = e} label='Thành tích' data={SelectAdapter_CtsvDmThanhTich} readOnly={readOnly} required
                            onChange={(thanhTich) => this.setState({ maThanhTich: thanhTich.id, tenThanhTich: thanhTich.text })}
                        />
                        <FormTextBox className='col-md-2' ref={e => this.namHoc = e} type='year' label='Năm đạt được' readOnly={readOnly} required
                            onChange={(namHoc) => this.setState({ namHoc })}
                        />
                        {loaiDoiTuong == 'CN' && <div className='col-md-12'><div className='d-flex align-items-end'>
                            <FormSelect className='flex-grow-1' ref={e => this.danhSachItem = e} data={SelectAdapter_FwStudentKhenThuong} readOnly={readOnly} onChange={({ id, hoTen }) => this.addItem({ mssv: id, hoTen })}
                                label={<>Sinh viên (Tải về bản mẫu tại <a href='/api/ctsv/khen-thuong/import/template'>đây</a>)</>} placeholder='Sinh viên'
                            />
                            <Tooltip className='mb-3 ml-3' title='Tải lên danh sách' arrow placement='top'><button className='btn btn-success ' type='button' onClick={() => this.danhSach.uploadInput.click()} ><i className='fa fa-file-excel-o' /></button></Tooltip>
                            <FileBox ref={e => this.danhSach = e} className='d-none' postUrl='/user/upload' accept='.xlsx' uploadType='ctsvUploadDsSinhVien' success={this.onUploadSuccess} />
                        </div></div>}
                        {loaiDoiTuong == 'TT' && <FormSelect className='col-md-12' ref={e => this.danhSachItem = e} label='Lớp' data={SelectAdapter_DtLopFilter()} readOnly={readOnly} required onChange={({ id }) => this.addItem({ maLop: id })} />}
                    </div>
                    <div className='modal-footer'><button type='button' className='btn btn-secondary' onClick={this.downloadExcel} style={{ display: this.state.id ? '' : 'none' }}>
                        <i className='fa fa-download' />Tải xuống
                    </button></div>
                    {loaiDoiTuong == 'CN' && this.componentDanhSachSinhVien(danhSach)}
                    {loaiDoiTuong == 'TT' && this.componentDanhSachLop(danhSach)}
                </div>
            </div>,
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system });

const mapActionToProps = { getCtsvKhenThuong, updateCtsvKhenThuong, createCtsvKhenThuong, svCheckSoQuyetDinh };

export default connect(mapStateToProps, mapActionToProps, null, { forwardRef: true })(ModalCtsvKhenThuong);
