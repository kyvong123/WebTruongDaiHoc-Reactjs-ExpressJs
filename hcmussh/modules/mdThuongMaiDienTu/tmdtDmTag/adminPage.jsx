import React from 'react';
import { connect } from 'react-redux';
import { getDmTagPage, createDmTag, deleteDmTag, updateDmTag } from './redux';
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
            title: this.state.id ? 'Cập nhật tag sản phẩm' : 'Tạo mới tag sản phẩm',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên tag sản phẩm' placeholder='Tên tag sản phẩm' required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.moTa = e} label='Mô tả tag sản phẩm' placeholder='Mô tả tag sản phẩm' required />
            </div>
        }
        );
    }
}

class dmLoaiSanPhamAdminPage extends AdminPage {
    state = { searching: false };

    componentDidMount() {
        T.ready('/user/category', () => {
            this.props.getDmTagPage();
        });
    }

    showModal = (e, item) => {
        e.preventDefault();
        this.modal.show(item);
    }

    render() {
        const permission = {};
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tmdtDmTag && this.props.tmdtDmTag.page ?
            this.props.tmdtDmTag.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };

        let table = 'Không có dữ liệu tag sản phẩm';
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
                        <TableCell type='link' content={item.ten ? item.ten : ''} onClick={() => this.modal.show(item)} />
                        <TableCell type='link' content={item.moTa ? item.moTa : ''} />
                        <TableCell type='buttons' content={item} onEdit={() => this.modal.show(item)}></TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Tag Sản Phẩm Y-Shop',
            breadcrumb: [
                <Link key={0} to='/user/tmdt/y-shop'>Y-Shop</Link>,
                'Tag Sản Phẩm Y-Shop'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmTagPage} />
                <EditModal ref={e => this.modal = e} permission={permission} create={this.props.createDmTag} update={this.props.updateDmTag} />
            </>,
            backRoute: '/user/tmdt/y-shop',
            onCreate: (e) => this.showModal(e)
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tmdtDmTag: state.tmdt.tmdtDmTag });
const mapActionsToProps = { getDmTagPage, createDmTag, deleteDmTag, updateDmTag };
export default connect(mapStateToProps, mapActionsToProps)(dmLoaiSanPhamAdminPage);