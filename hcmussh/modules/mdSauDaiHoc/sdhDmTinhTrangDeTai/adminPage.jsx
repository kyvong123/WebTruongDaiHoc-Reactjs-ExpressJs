import React from 'react';
import { connect } from 'react-redux';
import { getSdhTinhTrangDeTai, updateSdhTinhTrangDeTai, deleteSdhTinhTrangDeTai, createSdhTinhTrangDeTai } from './redux';
import { AdminModal, AdminPage, FormCheckbox, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: false };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten ? ten : '');
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0
        };

        if (!this.state.ma && !this.ma.value()) {
            T.notify('Mã không được trống!', 'danger');
            this.ma.focus();
        } else if (!changes.ten) {
            T.notify('Tên không được trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);


    render = () => {
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật tình trạng đề tài' : 'Tạo mới tình trạng đề tài',
            body: <div className='row'>
                <FormTextBox type='text' className='col-sm-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma ? true : false} placeholder='Mã' required />
                <FormTextBox type='text' className='col-sm-12' ref={e => this.ten = e} label='Tên' placeholder='Tên' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        });
    }
}

class sdhTinhTrangDeTaiPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getSdhTinhTrangDeTai();
        });
    }

    delete = (e, item) => {
        T.confirm('Xóa loại tình trạng đề tài', `Bạn có chắc muốn xóa loại tình trạng đề tài ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteSdhTinhTrangDeTai(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá loại tình trạng đề tài ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá loại tình trạng đề tài ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const permission = this.getUserPermission('sdhDmTinhTrangDeTai', ['write', 'delete']);
        const items = this.props.sdhDmTinhTrangDeTai ? this.props.sdhDmTinhTrangDeTai.items : [];
        let table = 'Chưa có dữ liệu';
        if (items && items.length > 0) {
            table = renderTable({
                getDataSource: () => items,
                stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>

                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={index + 1} />
                        <TableCell type='text' content={item.ten} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateSdhTinhTrangDeTai(item.ma, { kichHoat: value ? 1 : 0, })} />

                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                )
            });
        }



        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Tình trạng đề tài',
            breadcrumb: [
                <Link key={0} to={'/user/sau-dai-hoc'}>{'Sau đại học'}</Link>,
                'Tình trạng đề tài'
            ],
            content: <>
                <div className='tile'>{table}</div>
                {/* <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} /> */}
                <EditModal ref={e => this.modal = e} update={this.props.updateSdhTinhTrangDeTai} create={this.props.createSdhTinhTrangDeTai} permission={currentPermissions} />
            </>,
            backRoute: '/user/sau-dai-hoc',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
} const mapStateToProps = state => ({ system: state.system, sdhDmTinhTrangDeTai: state.sdh.sdhDmTinhTrangDeTai });
const mapActionsToProps = { getSdhTinhTrangDeTai, updateSdhTinhTrangDeTai, createSdhTinhTrangDeTai, deleteSdhTinhTrangDeTai };

export default connect(mapStateToProps, mapActionsToProps)(sdhTinhTrangDeTaiPage);