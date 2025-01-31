import React from 'react';
import { connect } from 'react-redux';
import { createDtDmHocKy, deleteDtDmHocKy, getDtDmHocKyAll, updateDtDmHocKy } from './redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormCheckbox, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';

class EditModal extends AdminModal {

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: true };
        this.setState({ ma, item });

        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    changeKichHoat = value => this.kichHoat.value(Number(value));

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            kichHoat: Number(this.kichHoat.value())
        };
        if (!changes.ma) {
            T.notify('Mã không được trống!', 'danger');
            this.ma.focus();
        } else if (!changes.ten) {
            T.notify('Tên không được trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.item ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    render = () => {
        return this.renderModal({
            title: this.state.item ? 'Cập nhật học kỳ' : 'Tạo mới học kỳ',
            body: <div className='row'>
                <FormTextBox ref={e => this.ma = e} label='Mã' className='col-md-6' required/>
                <FormTextBox ref={e => this.ten = e} label='Tên' className='col-md-6' required/>
                <FormCheckbox ref={e => this.kichHoat = e} label='Kích hoạt' className='col-md-12' onChanged={value => this.changeKichHoat(value)}/>
            </div>
        });
    };
}

class DtDmHocKyPage extends AdminPage {
    componentDidMount() {
        T.onSearch = (searchText) => this.props.getDtDmHocKyAll(undefined, undefined, searchText || '');
        T.showSearchBox();
        this.props.getDtDmHocKyAll();
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    changeActive = item => this.props.updateDtDmHocKy(item.ma, { kichHoat: !item.kichHoat });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa học kỳ', 'Bạn có chắc bạn muốn xóa học kỳ này?', true, isConfirm =>
            isConfirm && this.props.deleteDtDmHocKy(item.ma));
    };

    render() {
        const permission = this.getUserPermission('dtDmHocKy');
        let items = this.props.dtDmHocKy ? this.props.dtDmHocKy.items : [];
        const table = renderTable({
            getDataSource: () => items,
            stickyHead: true,
            emptyTable: 'Không có học kỳ',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%', textAlign: 'center' }}>Mã</th>
                    <th style={{ width: '50%' }}>Học kỳ</th>
                    <th style={{ width: 'auto' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1}/>
                    <TableCell type='link' style={{ textAlign: 'center' }} content={item.ma} onClick={() => this.modal.show(item)}/>
                    <TableCell content={item.ten}/>
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                               onChanged={value => this.props.updateDtDmHocKy(item.ma, { kichHoat: value ? 1 : 0 })}/>
                    <TableCell type='buttons' content={item} permission={permission}
                               onEdit={() => this.modal.show(item)} onDelete={this.delete}/>
                </tr>
            )
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách học kỳ',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/data-dictionary'>Từ điển dữ liệu</Link>,
                'Học kỳ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                           create={this.props.createDtDmHocKy} update={this.props.updateDtDmHocKy}/>
            </>,
            backRoute: '/user/dao-tao/data-dictionary',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDmHocKy: state.danhMuc.dtDmHocKy });
const mapActionsToProps = { getDtDmHocKyAll, createDtDmHocKy, updateDtDmHocKy, deleteDtDmHocKy };
export default connect(mapStateToProps, mapActionsToProps)(DtDmHocKyPage);