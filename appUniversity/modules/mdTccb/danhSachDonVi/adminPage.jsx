import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, renderDataTable, TableHead, TableCell, FormCheckbox, FormSelect, FormTextBox, FormDatePicker } from 'view/component/AdminPage';
import { getDanhSachDonViPage, deleteDonVi, updateDonVi, createDonVi } from './redux';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmBacDonVi } from 'modules/mdDanhMuc/dmBacDonVi/redux';
import { SelectAdapter_TccbLoaiDonVi } from '../tccbLoaiDonVi/redux';

class EditModal extends AdminModal {
    state = {
        id: null,
        ten: '',
        loai: '',
        kichHoat: false,
        vietTat: '',
        capBac: '',
        maTt: '',
        ngayThanhLap: '',
        ghiChu: '',
        idLoai: '',
        idCapBac: '',
    };
    onShow = (item) => {
        let { id, ten, loai, kichHoat, idLoai, idCapBac, vietTat, capBac, maTt, ngayThanhLap, ghiChu } = item ? item : { idLoai: '', idCapBac: '', id: '', ten: '', loai: '', kichHoat: 0, vietTat: '', capBac: '', maTt: '', ngayThanhLap: null, ghiChu: '' };
        this.setState({ id, ten, loai, kichHoat, vietTat, capBac, maTt, ngayThanhLap, ghiChu, idLoai, idCapBac },
            () => {
                this.ten.value(ten || '');
                this.loai.value(idLoai || '');
                this.kichHoat.value(kichHoat || '');
                this.vietTat.value(vietTat || '');
                this.capBac.value(idCapBac || '');
                this.maTt.value(maTt || '');
                this.ngayThanhLap.value(ngayThanhLap || '');
                this.ghiChu.value(ghiChu || '');
            }
        );
    };

    changeKichHoat = (value) => this.kichHoat.value(Number(value));

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: this.ten.value(),
            vietTat: this.vietTat.value(),
            loai: this.loai.value(),
            capBac: this.capBac.value(),
            kichHoat: this.kichHoat.value(),
            maTt: this.maTt.value(),
            ngayThanhLap: this.ngayThanhLap.value() ? Number(this.ngayThanhLap.value()) : '',
            ghiChu: this.ghiChu.value(),
        };
        if (!this.ten.value()) {
            T.notify('Tên đơn vị bị trống', 'danger');
            this.ten.focus();
        } else {
            this.props.update(this.state.id, changes, this.hide);
        }
    };
    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Cập nhật đơn vị',
            size: 'elarge',
            body: (
                <div className='row'>
                    <FormTextBox className='col-md-6' ref={(e) => (this.ten = e)} label='Tên đơn vị' readOnly={readOnly} required />
                    <FormTextBox className='col-md-6' ref={(e) => (this.vietTat = e)} label='Tên viết tắt' readOnly={readOnly} />
                    <FormSelect className='col-md-6' ref={(e) => (this.loai = e)} label='Loại đơn vị' data={SelectAdapter_TccbLoaiDonVi} readOnly={readOnly} />
                    <FormSelect className='col-md-6' ref={(e) => (this.capBac = e)} label='Bậc đơn vị' data={SelectAdapter_DmBacDonVi} readOnly={readOnly} />
                    <FormDatePicker className='col-md-6' ref={(e) => (this.ngayThanhLap = e)} label='Ngày thành lập' type='date-mask' readOnly={readOnly} />
                    <FormSelect data={SelectAdapter_DmDonViAll} className='col-md-6' ref={(e) => (this.maTt = e)} label='Đơn vị truyền thông' readOnly={readOnly} />
                    <FormTextBox className='col-md-12' ref={(e) => (this.ghiChu = e)} label='Ghi chú' readOnly={readOnly} />
                    <FormCheckbox className='col-md-3' ref={(e) => (this.kichHoat = e)} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }} onChange={(value) => this.changeKichHoat(value ? 1 : 0)} />
                </div>
            ),
        });
    };
}

class CreateModal extends AdminModal {
    state = {
        ten: '',
        loai: '',
        kichHoat: false,
        vietTat: '',
        capBac: '',
        maTt: '',
        ngayThanhLap: '',
        ghiChu: '',
    };

    onShow = () => {
        this.ten.value('');
        this.loai.value('');
        this.kichHoat.value('');
        this.vietTat.value('');
        this.capBac.value('');
        this.maTt.value('');
        this.ngayThanhLap.value('');
        this.ghiChu.value('');
    };

    changeKichHoat = (value) => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: this.ten.value(),
            loai: this.loai.value(),
            kichHoat: this.kichHoat.value(),
            vietTat: this.vietTat.value(),
            capBac: this.capBac.value(),
            maTt: this.maTt.value(),
            ngayThanhLap: this.ngayThanhLap.value() ? Number(this.ngayThanhLap.value()) : '',
            ghiChu: this.ghiChu.value(),
        };
        if (!this.ten.value()) {
            T.notify('Tên đơn vị bị trống', 'danger');
            this.ten.focus();
        } else {
            this.props.create(changes, this.hide);
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Tạo mới đơn vị',
            size: 'elarge',
            body: (
                <div className='row'>
                    <FormTextBox className='col-md-6' ref={(e) => (this.ten = e)} label='Tên đơn vị' readOnly={readOnly} required placeholder='Nhập tên đơn vị' />
                    <FormTextBox className='col-md-6' ref={(e) => (this.vietTat = e)} label='Tên viết tắt' readOnly={readOnly} placeholder='Nhập tên đơn vị viết tắt' />
                    <FormSelect className='col-md-6' ref={(e) => (this.loai = e)} label='Loại đơn vị' data={SelectAdapter_TccbLoaiDonVi} readOnly={readOnly} />
                    <FormSelect className='col-md-6' ref={(e) => (this.capBac = e)} label='Bậc đơn vị' data={SelectAdapter_DmBacDonVi} readOnly={readOnly} />
                    <FormDatePicker className='col-md-6' ref={(e) => (this.ngayThanhLap = e)} label='Ngày thành lập' type='date-mask' readOnly={readOnly} />
                    <FormSelect data={SelectAdapter_DmDonViAll} className='col-md-6' ref={(e) => (this.maTt = e)} label='Đơn vị truyền thông' readOnly={readOnly} />
                    <FormTextBox className='col-md-12' ref={(e) => (this.ghiChu = e)} label='Ghi chú' readOnly={readOnly} />
                    <FormCheckbox className='col-md-6' ref={(e) => (this.kichHoat = e)} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }} onChange={(value) => this.changeKichHoat(value ? 1 : 0)} />
                </div>
            ),
        });
    };
}

class DanhSachDonViPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
        });
        this.getPage();
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getDanhSachDonViPage(pageN, pageS, pageC, this.state.filter, done);
    };

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    };

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    showCreateModal = (e) => {
        e.preventDefault();
        this.createModal.show();
    };

    delete = (e, id) => {
        T.confirm('Xóa đơn vị', 'Bạn có chắc bạn muốn xóa đơn vị này?', 'warning', true, (isConfirm) => {
            isConfirm &&
                this.props.deleteDonVi(id, (error) => {
                    if (error) T.notify(error.message ? error.message : 'Xoá đơn vị bị lỗi!', 'danger');
                    else T.alert('Xoá đơn vị thành công!', 'success', false, 800);
                });
        });
        e.preventDefault();
    };

    export = (e) => {
        e.preventDefault();
        if (e.type == 'click') {
            this.setState({ exported: true }, () => {
                T.download(`/api/tccb/ds-don-vi/download-excel/?filter=${T.stringify(this.state.filter)}`, 'DANH_SACH_CAN_BO.xlsx');
                setTimeout(() => {
                    this.setState({ exported: false });
                }, 1000);
            });
        }
    }

    render() {
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null;
        const permission = this.getUserPermission('tccbDanhSachDonVi', ['read', 'write', 'delete', 'manage', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.danhSachDonVi && this.props.danhSachDonVi.page ? this.props.danhSachDonVi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu',
            data: list,
            divStyle: { height: '80vh' },
            header: 'thead-light',
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (
                <tr>
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='STT' />
                    <TableHead style={{ width: '25%', textAlign: 'center' }} content='Tên đơn vị' keyCol='ten' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: '15%', textAlign: 'center' }} content='Tên viết tắt' keyCol='vietTat' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: '10%', textAlign: 'center' }} content='Loại đơn vị' keyCol='loai' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: '10%', textAlign: 'center' }} content='Cấp bậc' keyCol='capBac' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: '10%', textAlign: 'center' }} content='Đơn vị truyền thông' keyCol='capBac' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: '15%', textAlign: 'center' }} content='Ngày thành lập' keyCol='ngayThanhLap' onKeySearch={onKeySearch} typeSearch='date' />
                    <TableHead style={{ width: '20%', textAlign: 'center' }} content='Ghi chú' keyCol='ghiChu' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} typeSearch='select' data={[{ id: 0, text: 'Chưa kích hoạt' }, { id: 1, text: 'Đã kích hoạt' }]} content='Kích hoạt' keyCol='kichHoat' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Thao tác' />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.vietTat} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loai} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.capBac} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.dvTt} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ngayThanhLap ? T.dateToText(item.ngayThanhLap, 'dd/mm/yyyy') : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission} onChanged={(value) => T.confirm('Cập nhật đơn vị', 'Bạn có chắc bạn muốn cập nhật đơn vị này?', 'warning', true, (isConfirm) => { isConfirm && this.props.updateDonVi(item.id, { kichHoat: value ? 1 : 0 }); })
                    } />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onEdit={() => (permission.write ? this.modal.show(item) : T.notify('Vui lòng liên hệ phòng Tổ chức - Cán bộ', 'warning'))} onDelete={(e) => (permission.delete ? this.delete(e, item.id) : T.notify('Vui lòng liên hệ phòng Tổ chức - Cán bộ', 'warning'))}></TableCell>
                </tr>
            ),
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách đơn vị',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>
                    Tổ chức cán bộ
                </Link>,
                'Danh sách đơn vị',
            ],
            content: (
                <>
                    <div className='tile'>
                        <div style={{ marginBottom: '10px' }}>Kết quả: {<b>{totalItem}</b>} đơn vị</div>
                        <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                            <div className='title'>
                                <div style={{ gap: 10, display: 'inline-flex' }}>
                                    <FormCheckbox label='Tìm theo cột' onChange={(value) => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }} />
                                    <FormCheckbox label='Thao tác nhanh' onChange={(value) => this.setState({ isFixCol: value })} style={{ marginBottom: '0' }} />
                                </div>
                            </div>
                            <div className='btn-group'>
                                <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} pageRange={3} />
                                <EditModal ref={(e) => (this.modal = e)} readOnly={!permission.write} update={this.props.updateDonVi} />
                                <CreateModal ref={(e) => (this.createModal = e)} readOnly={!permission.write} create={this.props.createDonVi} />
                            </div>
                        </div>
                        {table}
                    </div>
                </>
            ),
            backRoute: '/user/tccb',
            collapse: [
                { icon: 'fa-plus-square', name: 'Thêm hợp đồng mới', permission: permission && permission.write, type: 'info', onClick: (e) => this.showCreateModal(e) },
                { icon: 'fa-print', name: 'Export', permission: permission && permission.export, type: 'info', onClick: (e) => e.preventDefault() || this.export(e) }
            ]
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, danhSachDonVi: state.tccb.dsdv });
const mapActionsToProps = { getDanhSachDonViPage, deleteDonVi, updateDonVi, createDonVi };
export default connect(mapStateToProps, mapActionsToProps)(DanhSachDonViPage);
