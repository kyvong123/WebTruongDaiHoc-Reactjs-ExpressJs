import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDmChuDePage, createDmChuDe, updateDmChuDe, deleteDmChuDe } from './redux';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox, FormSelect, getValue } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import T from 'view/js/common';

class EditModal extends AdminModal {
    onShow = (item) => {
        let { id, ten, doiTuong, maDonVi, thoiGianXuLy, kichHoat } = item ? item : { id: '', ten: '', doiTuong: '', maDonVi: '', thoiGianXuLy: '', kichHoat: true };
        this.setState({ id });
        this.ten.value(ten);
        this.doiTuong.value(doiTuong.split(','));
        this.maDonVi.value(maDonVi);
        this.thoiGianXuLy.value(thoiGianXuLy / 3600000);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        try {
            const changes = {
                ten: getValue(this.ten),
                doiTuong: getValue(this.doiTuong).join(','),
                maDonVi: getValue(this.maDonVi),
                tenDonVi: this.maDonVi.data().text,
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
            title: this.state.id ? 'Cập nhật chủ đề Q&A' : 'Tạo mới chủ đề Q&A',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên chủ đề Q&A' readOnly={readOnly} placeholder='Tên chủ đề Q&A' required />
                <FormSelect className='col-12' ref={e => this.doiTuong = e} data={[
                    { id: '1', text: 'Cán bộ' },
                    { id: '2', text: 'Sinh viên' },
                ]} label='Đối tượng' multiple required />
                <FormSelect className='col-12' ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} required />
                <FormTextBox type='number' className='col-12' ref={e => this.thoiGianXuLy = e} label='Thời gian xử lý (giờ)' readOnly={readOnly} placeholder='Thời gian xử lý (giờ)' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }}
                    onChange={value => this.changeKichHoat(value)} required />
            </div>
        });
    }
}
class DmChuDePage extends AdminPage {

    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmChuDePage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmChuDePage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa chủ đề Q&A', `Bạn có chắc bạn muốn xóa chủ đề Q&A ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDmChuDe(item.id);
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
        const permission = this.getUserPermission('dmChuDe', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmChuDe && this.props.dmChuDe.page ?
            this.props.dmChuDe.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có dữ liệu chủ đề Q&A!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên chủ đề Q&A</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Đối tượng liên hệ</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Đơn vị phụ trách</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số giờ chờ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={this.mapDoiTuong(item.doiTuong)} />
                        <TableCell type='text' content={item.tenDonVi} />
                        <TableCell type='text' content={this.milisToDays(item.thoiGianXuLy)} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmChuDe(item.id, { kichHoat: Number(value) })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                )
            });
        }
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Chủ đề Q&A',
            breadcrumb: [
                < Link key={0} to='/user/tt/lien-he'> Liên hệ</Link >,
                'Chủ đề Q&A'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmChuDePage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmChuDe} update={this.props.updateDmChuDe} />
            </>,
            backRoute: '/user/tt/lien-he',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmChuDe: state.danhMuc.dmChuDe });
const mapActionsToProps = { getDmChuDePage, createDmChuDe, updateDmChuDe, deleteDmChuDe };
export default connect(mapStateToProps, mapActionsToProps)(DmChuDePage);