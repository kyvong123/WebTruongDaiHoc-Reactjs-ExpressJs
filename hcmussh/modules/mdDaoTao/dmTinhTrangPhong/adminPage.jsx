import React from 'react';
import { connect } from 'react-redux';
import { getAllDmTinhTrangPhong, createDmTinhTrangPhong, updateDmTinhTrangPhong } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox, getValue } from 'view/component/AdminPage';

class EditModal extends AdminModal {

    onShow = (item) => {
        let { id = '', ten = '', kichHoat, isDangKy } = item ? item : { id: '', ten: '', kichHoat: 1, isDangKy: 1 };
        this.setState({ id });
        this.ten.value(ten);
        this.kichHoat.value(kichHoat);
        this.isDangKy.value(isDangKy);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: getValue(this.ten),
            kichHoat: Number(getValue(this.kichHoat)),
            isDangKy: Number(getValue(this.isDangKy)),
        };
        this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật' : 'Tạo mới',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }} required />
                <FormCheckbox className='col-md-6' ref={e => this.isDangKy = e} label='Được đăng ký' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }} required />
            </div>
        }
        );
    };
}

class DiemDmTinhTrangPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getAllDmTinhTrangPhong();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    render() {
        const permission = this.getUserPermission('dmTinhTrangPhong');
        let list = this.props.dmTinhTrangPhong && this.props.dmTinhTrangPhong.items ? this.props.dmTinhTrangPhong.items : null;
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Chưa có dữ liệu!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '100%' }}>Tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Được đăng ký</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={() => this.props.updateDmTinhTrangPhong(item.id, { kichHoat: item.kichHoat == 1 ? 0 : 1 })} />
                    <TableCell type='checkbox' content={item.isDangKy} permission={permission}
                        onChanged={() => this.props.updateDmTinhTrangPhong(item.id, { isDangKy: item.isDangKy == 1 ? 0 : 1 })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Tình trạng phòng',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/data-dictionary'>Từ điển dữ liệu</Link>,
                'Tình trạng phòng'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createDmTinhTrangPhong} update={this.props.updateDmTinhTrangPhong} />
            </>,
            backRoute: '/user/dao-tao/data-dictionary',
            onCreate: e => permission.write ? e.preventDefault() || this.modal.show() : null,
        });
    }


}

const mapStateToProps = state => ({ system: state.system, dmTinhTrangPhong: state.daoTao.dmTinhTrangPhong });
const mapActionsToProps = { getAllDmTinhTrangPhong, createDmTinhTrangPhong, updateDmTinhTrangPhong };
export default connect(mapStateToProps, mapActionsToProps)(DiemDmTinhTrangPage);