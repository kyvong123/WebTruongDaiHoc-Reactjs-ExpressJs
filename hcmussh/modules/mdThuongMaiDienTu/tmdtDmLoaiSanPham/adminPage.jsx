import React from 'react';
import { connect } from 'react-redux';
import { getDmLoaiSanPhamPage, createDmLoaiSanPham, deleteDmLoaiSanPham, updateDmLoaiSanPham } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    onShow = (item) => {
        let { id, ten, moTa } = item ? item : { id: null, ten: '', moTa: '' };

        this.setState({ id, ten });
        this.ten.value(ten);
        this.moTa.value(moTa ? moTa : '');
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: this.ten.value(),
            moTa: this.moTa.value(),
        };
        if (!changes.ten) {
            T.notify('Tên không được trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    render = () => {
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật loại sản phẩm' : 'Tạo mới loại sản phẩm',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên loại sản phẩm' placeholder='Tên loại sản phẩm' required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.moTa = e} label='Mô tả loại sản phẩm' placeholder='Mô tả loại sản phẩm' required />
                {/* SelectAdapter_LoaiSanPham */}

            </div>
        }
        );
    }
}

class dmLoaiSanPhamAdminPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        T.ready('/user/category', () => {
            this.props.getDmLoaiSanPhamPage();
        });
    }

    showModal = (e, item) => {
        e.preventDefault();
        this.modal.show(item);
    }

    render() {
        const permission = {};
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tmdtDmLoaiSanPham && this.props.tmdtDmLoaiSanPham.page ?
            this.props.tmdtDmLoaiSanPham.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };

        let table = 'Không có dữ liệu loại sản phẩm';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>#</th>
                        <th style={{ width: '40%' }}>Tên</th>
                        <th style={{ width: '60%' }}>Mô tả</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={index + 1} style={{ textAlign: 'center' }} />
                        <TableCell type='text' content={item.ten} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.moTa} />
                        <TableCell type='buttons' content={item} onEdit={() => this.modal.show(item)}></TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Loại Sản Phẩm Y-Shop',
            breadcrumb: [
                <Link key={0} to='/user/tmdt/y-shop'>Y-Shop</Link>,
                'Loại Sản Phẩm Y-Shop'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmLoaiSanPhamPage} />
                <EditModal ref={e => this.modal = e} permission={permission} create={this.props.createDmLoaiSanPham} update={this.props.updateDmLoaiSanPham} />
            </>,
            backRoute: '/user/tmdt/y-shop',
            onCreate: (e) => this.showModal(e)
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tmdtDmLoaiSanPham: state.tmdt.tmdtDmLoaiSanPham });
const mapActionsToProps = { getDmLoaiSanPhamPage, createDmLoaiSanPham, deleteDmLoaiSanPham, updateDmLoaiSanPham };
export default connect(mapStateToProps, mapActionsToProps)(dmLoaiSanPhamAdminPage);