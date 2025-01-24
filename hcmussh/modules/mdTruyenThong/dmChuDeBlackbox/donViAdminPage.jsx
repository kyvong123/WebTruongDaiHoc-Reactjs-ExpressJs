import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDmChuDeBlackboxDonViPage, createDmChuDeBlackboxDonVi, updateDmChuDeBlackboxDonVi, deleteDmChuDeBlackboxDonVi } from './redux';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox, FormSelect, getValue } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    onShow = (item) => {
        let { id, ten, doiTuong, thoiGianXuLy, kichHoat } = item ? item : { id: '', ten: '', doiTuong: '', thoiGianXuLy: '', kichHoat: true };
        this.setState({ id });
        this.ten.value(ten);
        this.doiTuong.value(doiTuong.split(','));
        this.thoiGianXuLy.value(thoiGianXuLy / 3600000);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        try {
            const changes = {
                ten: getValue(this.ten),
                doiTuong: getValue(this.doiTuong).join(','),
                maDonVi: this.props.maDonVi,
                thoiGianXuLy: Number(getValue(this.thoiGianXuLy)),
                kichHoat: Number(getValue(this.kichHoat))
            };

            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        } catch (error) {
            console.log('error', error);
            error.props && T.notify(`${error.props.label || 'Dữ liệu'} bị trống!`, 'danger');
        }
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật chủ đề Blackbox' : 'Tạo mới chủ đề Blackbox',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên chủ đề Blackbox' readOnly={readOnly} placeholder='Tên chủ đề Blackbox' required />
                <FormSelect className='col-12' ref={e => this.doiTuong = e} data={[{ id: '1', text: 'Cán bộ' }, { id: '2', text: 'Sinh viên' }]} label='Đối tượng' multiple required />
                <FormTextBox type='number' className='col-12' ref={e => this.thoiGianXuLy = e} label='Thời gian xử lý (giờ)' readOnly={readOnly} placeholder='Thời gian xử lý (giờ)' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }}
                    onChange={value => this.changeKichHoat(value)} required />
            </div>
        });
    }
}
class DmChuDeBlackboxPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmChuDeBlackboxDonViPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmChuDeBlackboxDonViPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa chủ đề Blackbox', `Bạn có chắc bạn muốn xóa chủ đề Blackbox ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmChuDeBlackboxDonVi(item.id);
        });
        e.preventDefault();
    }

    mapDoiTuong = (item) => {
        let listDoiTuong = '';
        if (item.includes('0')) listDoiTuong = listDoiTuong + 'Khách';
        if (item.includes('1')) listDoiTuong = listDoiTuong + (item.includes('0') ? ', Cán bộ ' : 'Cán bộ');
        if (item.includes('2')) listDoiTuong = listDoiTuong + (item.includes('0') || item.includes('1') ? ', Sinh viên ' : 'Sinh viên');
        return listDoiTuong;
    }

    milisToDays = (milis) => {
        return Number(milis) / 3600000;
    }

    render() {
        const user = this.props.system && this.props.system.user;
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmChuDeBlackbox && this.props.dmChuDeBlackbox.donViPage ?
            this.props.dmChuDeBlackbox.donViPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có dữ liệu chủ đề Blackbox!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: '800px', whiteSpace: 'nowrap' }}>Tên chủ đề Blackbox</th>
                        <th style={{ width: '600px', whiteSpace: 'nowrap' }}>Đối tượng liên hệ</th>
                        <th style={{ width: '200px', whiteSpace: 'nowrap' }}>Số giờ chờ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => {
                    return <tr key={index}>
                        <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={this.mapDoiTuong(item.doiTuong)} />
                        <TableCell type='text' content={this.milisToDays(item.thoiGianXuLy)} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={{ write: true }}
                            onChanged={value => this.props.updateDmChuDeBlackboxDonVi(item.id, { kichHoat: Number(value) })} />
                        <TableCell type='buttons' content={item} permission={{ write: true }}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>;
                }
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Chủ đề Blackbox',
            breadcrumb: [
                < Link key={0} to='/user/tt/lien-he' > Liên hệ</Link >,
                'Chủ đề Blackbox đơn vị'
            ],
            content: <>
                <div className='tile'>
                    <h3>Chủ đề Blackbox của đơn vị: {user.tenDonVi}</h3>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmChuDeBlackboxDonViPage} />
                <EditModal ref={e => this.modal = e} permission={{ write: true }} maDonVi={user.maDonVi} create={this.props.createDmChuDeBlackboxDonVi} update={this.props.updateDmChuDeBlackboxDonVi} />
            </>,
            backRoute: '/user/tt/lien-he',
            onCreate: (e) => this.showModal(e)
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmChuDeBlackbox: state.danhMuc.dmChuDeBlackbox });
const mapActionsToProps = { getDmChuDeBlackboxDonViPage, createDmChuDeBlackboxDonVi, updateDmChuDeBlackboxDonVi, deleteDmChuDeBlackboxDonVi };
export default connect(mapStateToProps, mapActionsToProps)(DmChuDeBlackboxPage);