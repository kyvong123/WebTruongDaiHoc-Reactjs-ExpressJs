import React from 'react';
import { connect } from 'react-redux';
import { getDtDiemDmHeDiemAll, createDtDiemDmHeDiem, updateDtDiemDmHeDiem, deleteDtDiemDmHeDiem } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderDataTable, FormTextBox } from 'view/component/AdminPage';
import T from 'view/js/common';

class EditModal extends AdminModal {

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { id, ten, giaTri } = item ? item : { id: null, ten: '', giaTri: null };
        this.setState({ id, item });

        this.ten.value(ten);
        this.giaTri.value(giaTri);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: this.ten.value(),
            giaTri: this.giaTri.value(),
        };
        if (!changes.ten) {
            T.notify('Tên không được trống!', 'danger');
            this.ma.focus();
        } else {
            this.state.item ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        return this.renderModal({
            title: this.state.item ? 'Cập nhật học kỳ' : 'Tạo mới học kỳ',
            body: <div className='row'>
                <FormTextBox ref={e => this.ten = e} label='Tên hệ điểm' className='col-md-12' required />
                <FormTextBox ref={e => this.giaTri = e} label='Giá trị' className='col-md-12' />
            </div>
        });
    }
}

class DtDiemDmHeDiemPage extends AdminPage {
    componentDidMount() {
        this.props.getDtDiemDmHeDiemAll();
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa hệ điểm', 'Bạn có chắc bạn muốn xóa hệ điểm này?', true, isConfirm =>
            isConfirm && this.props.deleteDtDiemDmHeDiem(item.id));
    }

    render() {
        const permission = this.getUserPermission('dtDiemDmHeDiem');
        let items = this.props.dtDiemDmHeDiem ? this.props.dtDiemDmHeDiem.items : [];
        const table = renderDataTable({
            emptyTable: 'Chưa có dữ liệu',
            header: 'thead-light',
            data: items,
            stickyHead: items && items.length > 12 ? true : false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '80%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tên hệ điểm</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Giá trị</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.ten} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.giaTri} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={value => this.props.updateDtDiemDmHeDiem(item.id, { kichHoat: value ? 1 : 0 })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} />
                </tr>
            )
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách hệ điểm',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/grade-manage'>Cấu hình điểm</Link>,
                'Hệ điểm'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createDtDiemDmHeDiem} update={this.props.updateDtDiemDmHeDiem} />
            </>,
            backRoute: '/user/dao-tao/grade-manage',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDiemDmHeDiem: state.danhMuc.dtDiemDmHeDiem });
const mapActionsToProps = { getDtDiemDmHeDiemAll, createDtDiemDmHeDiem, updateDtDiemDmHeDiem, deleteDtDiemDmHeDiem };
export default connect(mapStateToProps, mapActionsToProps)(DtDiemDmHeDiemPage);