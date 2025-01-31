import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormSelect } from 'view/component/AdminPage';
import { getAll } from './redux';

class EditModal extends AdminModal {
    state = { active: false }

    onShow = (item) => {
        this.namTuyenSinh?.value(item?.namTuyenSinh || '');
    };

    onSubmit = () => {
        try {
            const namTuyenSinh = this.namTuyenSinh?.value();
            const dot = this.dot?.value();
            if (!namTuyenSinh) {
                T.notify('Năm tuyển sinh trống', 'danger');
                this.namTuyenSinh.focus();
            } else if (!dot) {
                T.notify('Đợt tuyển sinh trống', 'danger');
                this.dot.focus();
            } else {
                this.props.history.push(`/user/dao-tao/tuyen-sinh/chi-tieu/${namTuyenSinh}/${dot}`);
            }
        } catch (e) {
            console.error(e);
        }
    };


    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            isLoading: this.state.isLoading,
            title: this.state.ma ? 'Cập nhật hệ thống' : 'Tạo mới hệ thống',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-6' ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' readOnly={readOnly} />
                <FormSelect type='text' data={[{ id: 1, text: 'Đợt 1' }, { id: 2, text: 'Đợt 2' }, { id: 3, text: 'Đợt 3' }]} className='col-md-6' ref={e => this.dot = e} label='Đợt tuyển sinh' placeholder='Đợt tuyển sinh' /> :
            </div>
        });
    }
}

class ChiTieuTuyenSinh extends AdminPage {
    state = { filter: {} }
    componentDidMount() {
        T.ready('/user/daoTao', () => {
            this.props.getAll();
        });
    }

    getPage = (pageNumber, pageSize, pageCondition, done) => {
        this.props.getPage(pageNumber, pageSize, this.state.filter, pageCondition, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        //TODO
        T.confirm('Xóa hệ thống trạng thái', 'Xác nhận xóa hệ thống trạng thái?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteSystem(item.id, () => this.getPage()));
    };

    render() {
        const permission = this.getUserPermission('dtDmChiTieuTuyenSinh');
        const items = this.props.dtDmChiTieuTuyenSinh && this.props.dtDmChiTieuTuyenSinh.items;

        let table = 'Không có dữ liệu!';
        if (items && items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                loadingClassName: 'd-flex justify-content-center align-items-center',
                header: 'thead-light',
                loadingOverlay: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>STT</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Năm tuyển sinh</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đợt tuyển sinh</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell content={index + 1} />
                        <TableCell type='link' content={item.namTuyenSinh} onClick={() => this.props.history.push(`/user/dao-tao/tuyen-sinh/chi-tieu/${item.namTuyenSinh}/${item.dot}`)} />
                        <TableCell type='text' content={`Đợt ${item.dot}`} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} ></TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách Chỉ tiêu tuyển sinh',
            breadcrumb: [
                <Link key={0} to='/user/dt'>Đào tạo</Link>,
                'Danh sách Chỉ tiêu tuyển sinh'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} history={this.props.history} />
            </>,
            backRoute: '/user/hcth',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDmChiTieuTuyenSinh: state.daoTao.dtDmChiTieuTuyenSinh });
const mapActionsToProps = { getAll };
export default connect(mapStateToProps, mapActionsToProps)(ChiTieuTuyenSinh);
