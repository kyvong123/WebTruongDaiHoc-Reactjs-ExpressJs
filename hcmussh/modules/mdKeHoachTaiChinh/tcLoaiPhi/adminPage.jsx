import React from 'react';
import { connect } from 'react-redux';
import { getTcLoaiPhiPage, createTcLoaiPhi, updateTcLoaiPhi, deleteTcLoaiPhi, getTcLoaiHocPhiAll, apply } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox, FormSelect } from 'view/component/AdminPage';
import LoaiHocPhiModal from './modal/LoaiHocPhiModal';
// import { Tooltip } from '@mui/material';
// import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
// import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';

// const yearDatas = () => {
//     return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 13);
// };

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => {
        const year = i + new Date().getFullYear() - 14;
        return { id: year, text: `${year} - ${year + 1}` };
    });
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

class EditModal extends AdminModal {

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { id, ten, kichHoat, xuatHoaDon, mienGiam, namPhatSinh, hocKyPhatSinh } = item ? item :
            { id: '', ten: '', kichHoat: 1, xuatHoaDon: 1, mienGiam: 1, namPhatSinh: '', hocKyPhatSinh: '' };

        this.setState({ id, item });
        this.ten.value(ten);
        this.namPhatSinh.value(namPhatSinh);
        this.hocKyPhatSinh.value(hocKyPhatSinh);
        this.kichHoat.value(kichHoat ? 1 : 0);
        this.xuatHoaDon.value(xuatHoaDon ? 1 : 0);
        this.mienGiam.value(mienGiam ? 1 : 0);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: this.ten.value(),
            namPhatSinh: this.namPhatSinh.value() || '',
            hocKyPhatSinh: this.hocKyPhatSinh.value() || '',
            kichHoat: this.kichHoat.value() ? 1 : 0,
            xuatHoaDon: this.xuatHoaDon.value() ? 1 : 0,
            mienGiam: this.mienGiam.value() ? 1 : 0
        };
        if (changes.ten == '') {
            T.notify('Tên không được trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) :
                this.props.create(changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);
    changeXuatHoaDon = value => this.xuatHoaDon.value(value ? 1 : 0) || this.xuatHoaDon.value(value);
    changeMienGiam = value => this.mienGiam.value(value ? 1 : 0) || this.mienGiam.value(value);
    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật loại phí' : 'Tạo mới loại phí',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên loại phí' placeholder='Tên loại phí' readOnly={readOnly} required />
                <FormSelect className='col-md-6' data={yearDatas()?.reverse() || []} ref={e => this.namPhatSinh = e} label='Năm phát sinh' placeholder='Năm phát sinh' readOnly={readOnly} required />
                <FormSelect className='col-md-6' data={termDatas} ref={e => this.hocKyPhatSinh = e} label='Học kỳ phát sinh' placeholder='Học kỳ phát sinh' readOnly={readOnly} required />
                <FormCheckbox className='col-md-4' ref={e => this.xuatHoaDon = e} label='Xuất hóa đơn' isSwitch={true} readOnly={readOnly}
                    onChange={value => this.changeXuatHoaDon(value ? 1 : 0)} />
                <FormCheckbox className='col-md-4' ref={e => this.mienGiam = e} label='Loại phí miễn giảm' isSwitch={true} readOnly={readOnly}
                    onChange={value => this.changeMienGiam(value ? 1 : 0)} />
                <FormCheckbox className='col-md-4' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }
        );
    }
}

class tcLoaiPhiAdminPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        T.ready('/user/finance', () => {
            T.onSearch = (searchText) => this.props.getTcLoaiPhiPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getTcLoaiPhiPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa loại phí', `Bạn có chắc bạn muốn xóa loại phí ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteTcLoaiPhi(item.id, error => {
                if (error) T.notify(error.message ? error.message : `Xoá loại phí ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá loại phí ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('tcLoaiPhi', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcLoaiPhi && this.props.tcLoaiPhi.page ?
            this.props.tcLoaiPhi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };

        let buttons = [];
        buttons.push({ className: 'btn-secondary', icon: 'fa-caret-right', tooltip: 'DS loại học phí', onClick: e => e.preventDefault() || this.loaiHocPhi.show() });

        let table = renderTable({
            emptyTable: 'Không có dữ liệu loại phí',
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Năm học phát sinh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Học kỳ phát sinh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Xuất hóa đơn</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Miễn giảm</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell type='link' content={item.ten ? item.ten : ''} onClick={() => this.modal.show(item)} />
                    <TableCell style={{ textAlign: 'center' }} content={`${item.namPhatSinh} - ${parseInt(item.namPhatSinh) + 1}`} />
                    <TableCell style={{ textAlign: 'center' }} content={`HK${item.hocKyPhatSinh}`} />
                    <TableCell type='checkbox' content={item.xuatHoaDon} permission={permission}
                        onChanged={value => this.props.updateTcLoaiPhi(item.id, { xuatHoaDon: value ? 1 : 0, })} />
                    <TableCell type='checkbox' content={item.mienGiam} permission={permission}
                        onChanged={value => this.props.updateTcLoaiPhi(item.id, { mienGiam: value ? 1 : 0, })} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={value => this.props.updateTcLoaiPhi(item.id, { kichHoat: value ? 1 : 0, })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={this.delete}>
                        {/* <Tooltip title='Áp dụng loại phí' arrow>
                            <button className='btn btn-success' onClick={e => e.preventDefault() || this.applyModal.show(item)}><i className='fa fa-lg fa-plus' /></button>
                        </Tooltip> */}
                    </TableCell>
                </tr>
            )

        });


        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Loại phí',
            breadcrumb: [
                'Loại phí'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getTcLoaiPhiPage} />
                <EditModal ref={e => this.modal = e}
                    create={this.props.createTcLoaiPhi} update={this.props.updateTcLoaiPhi} readOnly={!permission.write} />
                <LoaiHocPhiModal ref={e => this.loaiHocPhi = e} getAll={this.props.getTcLoaiHocPhiAll} permission={permission} />
            </>,
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            buttons
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcLoaiPhi: state.finance.tcLoaiPhi });
const mapActionsToProps = { getTcLoaiPhiPage, createTcLoaiPhi, updateTcLoaiPhi, deleteTcLoaiPhi, getTcLoaiHocPhiAll, apply };
export default connect(mapStateToProps, mapActionsToProps)(tcLoaiPhiAdminPage);