import React from 'react';
import { connect } from 'react-redux';
import { getPageNguoiNhan, createNguoiNhan, updateNguoiNhan, deleteNguoiNhan } from './reduxNguoiNhan';
import { searchDmNguoiNhanAdapter } from './reduxDmLoaiNguoiNhan';
import { AdminPage, AdminModal, renderTable, TableCell, FormTextBox, FormRichTextBox, FormSelect, getValue } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    state = { id: null };

    componentDidMount() {
        this.onShown(() => this.email.focus());
    }

    onShow = item => {
        this.setState({ id: item?.id }, () => {
            this.loaiNguoiNhan.value(item?.idLoaiNguoiNhan);
            this.email.value(item?.email || '');
            this.ho.value(item?.ho || '');
            this.ten.value(item?.ten || '');
            this.ghiChu.value(item?.ghiChu || '');
        });
    }

    onSubmit = () => {
        const changes = {
            idLoaiNguoiNhan: getValue(this.loaiNguoiNhan),
            email: getValue(this.email),
            ho: getValue(this.ho),
            ten: getValue(this.ten),
            ghiChu: getValue(this.ghiChu)
        };

        if (this.state.id) {
            this.props.update(this.state.id, changes, () => this.hide());
        } else {
            this.props.create(changes, () => this.hide());
        }
    }

    render = () => {
        return this.renderModal({
            title: this.state.id ? 'Cập nhật người nhận' : 'Tạo mới người nhận',
            size: 'large',
            body: <div className='row'>
                <FormSelect ref={e => this.loaiNguoiNhan = e} className='col-md-6' label='Loại người nhận' data={searchDmNguoiNhanAdapter} required minimumResultsForSearch={-1} />
                <div className='w-100' />
                <FormTextBox ref={e => this.email = e} className='col-md-4' label='Email' required />
                <FormTextBox ref={e => this.ho = e} className='col-md-5' label='Họ' />
                <FormTextBox ref={e => this.ten = e} className='col-md-3' label='Tên' />
                <FormRichTextBox ref={e => this.ghiChu = e} className='col-md-12' label='Ghi chú' />
            </div>
        });
    }
}

class NguoiNhan extends AdminPage {
    componentDidMount() {
        T.ready('/user/truyen-thong', () => {
            this.props.getPageNguoiNhan();
        });
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục', 'Bạn có chắc bạn muốn xóa người nhận này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteNguoiNhan(item.id));
    }

    render() {
        const permission = this.getUserPermission('fwENews');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.nguoiNhan?.page || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };

        const table = renderTable({
            getDataSource: () => list,
            emptyTable: 'Chưa có người nhận nào!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '20%' }}>Email</th>
                    <th style={{ width: '30%' }}>Họ và tên</th>
                    <th style={{ width: '20%' }}>Loại người nhận</th>
                    <th style={{ width: '40%' }}>Ghi chú</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={item.id}>
                    <TableCell content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' onClick={() => this.modal.show(item)} content={item.email} />
                    <TableCell content={item.ho + ' ' + item.ten} />
                    <TableCell content={item.tenLoai} />
                    <TableCell content={item.ghiChu} />
                    <TableCell type='buttons' permission={permission} onEdit={() => this.modal.show(item)} content={item} onDelete={this.delete} />
                </tr>
            )
        });

        return this.renderPage({
            title: 'eNews: Danh sách người nhận',
            breadcrumb: [<Link key={0} to='/user/truyen-thong'>Truyền thông</Link>, 'eNews: Danh sách người nhận'],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} create={this.props.createNguoiNhan} update={this.props.updateNguoiNhan} />
                <Pagination pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ marginLeft: '65px' }} getPage={this.props.getPageNguoiNhan} />
            </>,
            onCreate: permission.write ? () => this.modal.show() : null,
            onImport: () => this.props.history.push('/user/truyen-thong/e-news/nguoi-nhan/import'),
            backRoute: '/user/truyen-thong'
        });
    }
}

const mapStateToProps = state => ({ system: state.system, nguoiNhan: state.truyenThong.fwENewsNguoiNhan });
const mapActionsToProps = { getPageNguoiNhan, createNguoiNhan, updateNguoiNhan, deleteNguoiNhan };
export default connect(mapStateToProps, mapActionsToProps)(NguoiNhan);