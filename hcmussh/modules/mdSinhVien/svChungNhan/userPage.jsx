import React from 'react';
import { connect } from 'react-redux';
import { createSvManageForm, getPageSvManageFormStudent, updateSvManageFormStudent, downloadWordSvManageFormStudent, getScheduleSettings } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormTextBox, FormDatePicker, FormSelect, getValue, FormRichTextBox } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { SelectAdapter_DtNganhDaoTaoStudent } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { ajaxSelectTinhThanhPho } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
import { SelectAdapter_SvDmFormType } from 'modules/mdSinhVien/svDmFormType/redux';
import { SelectAdapter_DmNoiNhanForm } from 'modules/mdSinhVien/svDmNoiNhanForm/redux';
import CustomParamComponent from 'modules/mdCongTacSinhVien/svManageForm/component/customParam';
import ReasonModal from './RejectModal';

const APPROVED_MAPPER = {
    2: <span className='text-success'><i className='fa fa-check' /> Đã nhận</span>,
    1: <span className='text-info'><i className='fa fa-clock-o' /> Đã chấp nhận</span>,
    0: <span className='text-danger'><i className='fa fa-plus-square' /> Đăng ký mới</span>,
    [-1]: <span className='text-danger'><i className='fa fa-times' /> Từ chối</span>,
};

class SinhVienManageFormPage extends AdminPage {
    state = { customParam: [], namHoc: null }
    componentDidMount() {
        T.ready('/user/chung-nhan-truc-tuyen', () => {
            // Lấy năm học hiện tại được kích hoạt bởi phòng đào tạo
            this.props.getScheduleSettings(data => {
                this.setState({ namHoc: data.currentSemester.namHoc });
            });
            this.props.getPageSvManageFormStudent(1, 50, () => {
                this.setFormValue(this.props.svManageForm.dataSinhVien);
            });

            T.socket.on('updated-data', () => {
                this.props.getPageSvManageFormStudent(1, 50, () => {
                    this.setFormValue(this.props.svManageForm.dataSinhVien);
                });
            });
        });
    }

    componentWillUnmount() {
        T.socket.off('updated-data');
    }

    setFormValue = (item) => {
        this.hoTen.value(`${item.ho} ${item.ten}`);
        this.mssv.value(item.mssv);
        this.ngaySinh.value(item.ngaySinh);
        this.noiSinhMaTinh.value(item.noiSinhMaTinh);
        this.thuongTru.value(item.thuongTruMaTinh, item.thuongTruMaHuyen, item.thuongTruMaXa, item.thuongTruSoNha);
        this.maNganh.value(item.maNganh);
    }

    downloadWord = (id) => {
        this.props.downloadWordSvManageFormStudent(id, data => {
            T.FileSaver(new Blob([new Uint8Array(data.content.data)]), data.filename);
        });
    }

    handleDangKiIn = (e) => {
        try {
            e.preventDefault();
            const svManageForm = {
                formType: getValue(this.formType),
                noiNhan: parseInt(getValue(this.noiNhanKetQua)),
                dataCustom: this.getDataDangKy(),
                ghiChu: getValue(this.ghiChu),
                model: JSON.stringify(this.state.customParam)
            };
            T.confirm('Xác nhận đăng kí in biểu mẫu', 'Bạn có chắc bạn muốn in biểu mẫu!', isConfirm => isConfirm && this.props.createSvManageForm({ svManageForm }, (result) => {
                this.clearForm();
                result.allowDownload && this.downloadWord(result.id);
            })
            );
        } catch (error) {
            T.notify(`${error.props.label} bị trống!`, 'danger');
            error.focus();
        }
    }

    getDataDangKy = () => {
        let data = {};
        this.state.customParam.forEach(item => {
            Object.assign(data, this[item.ma].getDataDangKy());
        });
        return JSON.stringify(data);
    }

    clearForm = () => {
        this.formType.value('');
        this.noiNhanKetQua.value('');
        this.ghiChu.value('');
        this.setState({ customParam: [] });
    }

    renderSwitch({ tinhTrang, soNgayXuLy }) {
        switch (tinhTrang) {
            case null: // New
                return APPROVED_MAPPER[0];
            case 'A':  // Accept
                return <>
                    {APPROVED_MAPPER[1]}
                    <br />
                    <small><i><b>Thời gian trả kết quả:</b> sau {soNgayXuLy} ngày làm việc</i></small>
                </>;
            case 'C': //Complete
                return APPROVED_MAPPER[2];
            case 'R': //Reject
                return APPROVED_MAPPER[-1];
            default:
                return 'Unknown state';
        }
    }

    thongTinCoBan = () => <div className='tile'>
        <div className='tile-title'>
            <h3>Thông tin cơ bản</h3>
            <label className='text-danger' style={{ fontSize: '1rem' }}>Vui lòng kiểm tra thông tin trước khi đăng kí in biểu mẫu. Nếu có sai sót, vui lòng cập nhật thông tin tại <Link key={0} to='/user/profile-student'>Thông tin cá nhân sinh viên</Link>.</label>
        </div>

        <div className='tile-body'>
            <div className='row'>
                <FormTextBox type='text' className='col-md-6' ref={e => this.hoTen = e} label='Họ và tên' required readOnly />
                <FormTextBox type='text' className='col-md-6' ref={e => this.mssv = e} label='MSSV' required readOnly />
                <FormDatePicker type='date-mask' className='form-group col-md-4' ref={e => this.ngaySinh = e} label='Ngày sinh' required readOnly />
                <FormSelect className='col-md-4' ref={e => this.noiSinhMaTinh = e} data={ajaxSelectTinhThanhPho} readOnly label='Nơi sinh' required />
                <FormSelect ref={e => this.maNganh = e} label='Ngành' className='form-group col-md-4' data={SelectAdapter_DtNganhDaoTaoStudent} readOnly required />
                <ComponentDiaDiem className='form-group col-md-12' ref={e => this.thuongTru = e} label='Địa chỉ thường trú' requiredSoNhaDuong readOnly />
            </div>
        </div>
    </div>

    changeFormType = (value) => {
        this.setState({ customParam: [] });
        this.setState({ customParam: value.customParam.map(item => { item.data = JSON.parse(item.data); return item; }) }, () => {
            this.state.customParam.forEach(item => {
                this[item.ma].value('');
                if (item.type == '1')
                    this[item.ma].value(item.data.text);
            });
        });
    }

    render() {
        const items = this.props.svManageForm?.page?.list;
        const { firstName, lastName, mssv } = this.props.system.user;
        const namHocHienTai = this.state.namHoc;
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition } = this.props.svManageForm && this.props.svManageForm.page ? this.props.svManageForm.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {} };
        const table = renderTable({
            getDataSource: () => items ? items : [],
            style: { display: items ? '' : 'none' },
            stickyHead: items && items.length > 10 ? true : false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Loại xác nhận</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời điểm đăng ký</th>
                    <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Nơi nhận kết quả</th>
                    <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Trạng thái</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời điểm hoàn thành</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.maDangKy ? item.maDangKy : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenFormDangKy ? item.tenFormDangKy : ''} />
                    <TableCell type='date' style={{ whiteSpace: 'nowrap' }} content={item.thoiGianDangKy ? item.thoiGianDangKy : ''} dateFormat='dd/mm/yyyy HH:MM:ss' />
                    <TableCell type='text' content={item.noiNhan ? item.noiNhan : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={this.renderSwitch(item)} />
                    <TableCell type='date' style={{ whiteSpace: 'nowrap' }} content={item.thoiGianHoanThanh ? item.thoiGianHoanThanh : ''} dateFormat='dd/mm/yyyy HH:MM:ss' />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<>
                        {item.tinhTrang === 'A' && <Tooltip title='Xác nhận đã nhận' arrow>
                            <button className='btn btn-success' onClick={e => {
                                e.preventDefault();
                                this.props.updateSvManageFormStudent(item.maDangKy, { action: 'C' });
                            }}>
                                <i className='fa fa-lg fa-check' />
                            </button>
                        </Tooltip>}
                        {item.tinhTrang === 'R' && <Tooltip title='Lý do từ chối' arrow>
                            <button className='btn btn-danger' onClick={e => {
                                e.preventDefault();
                                this.reasonModal.show(item);
                            }}>
                                <i className='fa fa-lg fa-exclamation' />
                            </button>
                        </Tooltip>}
                        {item.allowDownload == 1 && <Tooltip title='Tải xuống' arrow>
                            <button className='btn btn-info' onClick={e => {
                                e.preventDefault();
                                this.downloadWord(item.maDangKy);
                            }}>
                                <i className='fa fa-lg fa-download' />
                            </button>
                        </Tooltip>}
                    </>
                    } />
                </tr>
            )
        });
        return this.renderPage({
            title: 'Đăng ký xác nhận trực tuyến',
            icon: 'fa fa-snowflake-o',
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Đăng ký xác nhận trực tuyến'
            ],
            content: <>
                {this.thongTinCoBan()}
                <div className='tile'>
                    <h3 className='tile-title'>Đăng kí in biểu mẫu</h3>
                    <div className='tile-body'>
                        <FormSelect ref={e => this.formType = e} label='Loại xác nhận' className='form-group col-md-12' data={SelectAdapter_SvDmFormType(namHocHienTai, 0)} onChange={this.changeFormType} readOnly={false} required />
                        {this.state.customParam.length ? this.state.customParam.map((item, index) => {
                            return <CustomParamComponent key={index} ref={e => this[item.ma] = e} param={item} host={{ mssv, hoTen: lastName + ' ' + firstName }} />;
                        }) : null}
                        <FormRichTextBox ref={e => this.ghiChu = e} label='Thông tin bổ sung' className='form-group col-md-12' />
                        <FormSelect ref={e => this.noiNhanKetQua = e} label='Nơi nhận kết quả' className='form-group col-md-12' data={SelectAdapter_DmNoiNhanForm} required />
                    </div>
                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                        <button className='btn btn-primary' type='button' onClick={this.handleDangKiIn}>
                            <i className='fa fa-fw fa-lg fa-save' />Đăng kí in
                        </button>
                    </div>
                </div>
                <div className='tile'>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', marginBottom: '10px' }}>
                        <div className='tile-title'><h3>Lịch sử đăng kí</h3></div>
                        <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getSvManageFormPage} pageRange={3} />
                        <ReasonModal ref={e => this.reasonModal = e} readOnly />
                    </div>
                    {table}
                </div>
            </>,
            backRoute: '/user'
        });
    }
}

const mapStateToProps = state => ({ system: state.system, svManageForm: state.student.svManageForm });
const mapActionsToProps = { createSvManageForm, getPageSvManageFormStudent, updateSvManageFormStudent, downloadWordSvManageFormStudent, getScheduleSettings };
export default connect(mapStateToProps, mapActionsToProps)(SinhVienManageFormPage);