import React from 'react';
import { connect } from 'react-redux';
import { getAllDmLoaiNguoiNhan, createDmLoaiNguoiNhan, updateDmLoaiNguoiNhan, deleteDmLoaiNguoiNhan } from './reduxDmLoaiNguoiNhan';
import { AdminPage, AdminModal, renderTable, TableCell, FormTextBox } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class EditModal extends AdminModal {
    state = { id: null };

    componentDidMount() {
        this.onShown(() => this.tenLoai.focus());
    }

    onShow = item => {
        this.setState({ id: item?.id });
        this.tenLoai.value(item?.tenLoai || '');
    }

    onSubmit = () => {
        if (this.tenLoai.value()) {
            if (this.state.id) {
                this.props.update(this.state.id, { tenLoai: this.tenLoai.value() }, () => this.hide());
            }  else {
                this.props.create({ tenLoai: this.tenLoai.value() }, () => this.hide());
            }
        } else {
            T.notify('Tên loại danh mục bị trống', 'danger');
            this.tenLoai.focus();
        }
    }

    render = () => {
        return this.renderModal({
            title: this.state.id ? 'Cập nhật danh mục' : 'Tạo mới danh mục',
            body: <>
                <FormTextBox ref={e => this.tenLoai = e} label='Tên loại' required />
            </>
        });
    }
}

class DmLoaiNguoiNhan extends AdminPage {
    componentDidMount() {
        T.ready('/user/truyen-thong', () => {
            this.props.getAllDmLoaiNguoiNhan();
        });
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục', 'Bạn có chắc bạn muốn xóa danh mục này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmLoaiNguoiNhan(item.id));
    }

    render() {
        const permission = this.getUserPermission('fwENews');
        const items = this.props.dmLoaiNguoiNhan?.items || [];

        const table = renderTable({
            getDataSource: () => items,
            emptyTable: 'Chưa có danh mục nào!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tiêu loại</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={item.id}>
                    <TableCell content={index + 1} />
                    <TableCell type='link' onClick={() => this.modal.show(item)} content={item.tenLoai} />
                    <TableCell type='buttons' permission={permission} onEdit={() => this.modal.show(item)} content={item} onDelete={this.delete} />
                </tr>
            )
        });

        return this.renderPage({
            title: 'eNews: Danh mục loại người nhận',
            breadcrumb: [<Link key={0} to='/user/truyen-thong'>Truyền thông</Link>, 'eNews: Danh mục loại người nhận'],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} create={this.props.createDmLoaiNguoiNhan} update={this.props.updateDmLoaiNguoiNhan} />
            </>,
            onCreate: permission.write ? () => this.modal.show() : null,
            backRoute: '/user/truyen-thong'
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmLoaiNguoiNhan: state.truyenThong.fwENewsDmLoaiNguoiNhan });
const mapActionsToProps = { getAllDmLoaiNguoiNhan, createDmLoaiNguoiNhan, updateDmLoaiNguoiNhan, deleteDmLoaiNguoiNhan };
export default connect(mapStateToProps, mapActionsToProps)(DmLoaiNguoiNhan);