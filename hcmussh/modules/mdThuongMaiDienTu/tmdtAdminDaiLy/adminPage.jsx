import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderDataTable, TableHead, AdminModal, FormTextBox, FormRichTextBox, FormCheckbox, FormSelect, getValue } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { getTmdtAdminDaiLyPage, createTmdtAdminDaiLy, updateTmdtAdminDaiLy, SelectAdapter_TmdtDaiLy_SearchUser } from './redux';
import Pagination from 'view/component/Pagination';


class EditModal extends AdminModal {
    state = {}
    onShow = (item) => {
        const { id, ten, maCode, gioiThieu, thanhVienEmailList, paymentInfo, shippingInfo } = item ? item : { ten: '', maCode: '', gioiThieu: '', id: null, thanhVienEmailList: null, paymentInfo: '', shippingInfo: '' };
        this.setState({ ten, id }, () => {
            this.ten.value(ten || '');
            this.maCode.value(maCode || '');
            this.gioiThieu.value(gioiThieu || '');
            this.thanhVienEmailList.value(thanhVienEmailList ? thanhVienEmailList.split(',') : []);
            this.paymentInfo.value(paymentInfo || '');
            this.shippingInfo.value(shippingInfo || '');
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        try {
            const changes = {
                ten: getValue(this.ten),
                maCode: getValue(this.maCode),
                gioiThieu: getValue(this.gioiThieu),
                thanhVienEmailList: getValue(this.thanhVienEmailList).toString(),
                paymentInfo: getValue(this.paymentInfo),
                shippingInfo: getValue(this.shippingInfo)
            };
            if (this.state.id) {
                this.props.update(this.state.id, changes);
            } else {
                this.props.create(changes);
            }
            this.hide();
        } catch (error) {
            console.error('error', error);
            error.props && T.notify(`${error.props.label || 'Dữ liệu'} bị trống!`, 'danger');
        }
    };

    render = () => {
        return this.renderModal({
            title: this.state.id ? 'Chỉnh sửa thông tin đại lý' : 'Tạo đại lý mới',
            size: 'elarge',
            body: <div className='row'>
                <FormTextBox className='col-12' ref={e => this.ten = e} label='Tên đại lý' required placeholder='Nhập tên đại lý' />
                <FormTextBox readOnly={this.state.id ? true : false} className='col-12' ref={e => this.maCode = e} label='Mã code đại lý' required placeholder='Nhập mã code đại lý' />
                <FormRichTextBox className='col-12' ref={e => this.gioiThieu = e} label='Bài viết giới thiệu đại lý' required placeholder='Viết bài giới thiệu' />
                <FormRichTextBox className='col-12' ref={e => this.paymentInfo = e} label='Thông tin thanh toán' required placeholder='Thông tin thanh toán' />
                <FormRichTextBox className='col-12' ref={e => this.shippingInfo = e} label='Thông tin giao hàng' required placeholder='Thông tin giao hàng' />
                <FormSelect className='col-12' multiple={true} ref={e => this.thanhVienEmailList = e} label='Thành viên đại lý' data={SelectAdapter_TmdtDaiLy_SearchUser} />
            </div>
        });
    };
}

class TMDTAdminPage extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/tmdt/y-shop/admin', () => {
            this.props.getTmdtAdminDaiLyPage();
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getTmdtAdminDaiLyPage(pageN, pageS, pageC, this.state.filter, done);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tmdtAdminDaiLy && this.props.tmdtAdminDaiLy.page ?
            this.props.tmdtAdminDaiLy.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        const table = renderDataTable({
            data: list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <TableHead ref={e => this.ks_ten = e} style={{ width: '200px', whiteSpace: 'nowrap' }} content='Tên Đại Lý' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='ten' />
                    <TableHead style={{ width: '100px', whiteSpace: 'nowrap' }} content='Mã code' onKeySearch={(ks) => this.handleKeySearch(ks)} keyCol='ma_code' />
                    <TableHead style={{ width: '100%', whiteSpace: 'nowrap' }} content='Giới Thiệu' />
                    <TableHead style={{ width: '300px', whiteSpace: 'nowrap' }} content='Thông tin thanh toán' />
                    <TableHead style={{ width: '300px', whiteSpace: 'nowrap' }} content='Thông tin giao hàng' />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={item.ten ? item.ten : ''} />
                    <TableCell type='text' content={item.maCode ? item.maCode : ''} />
                    <TableCell type='text' content={item.gioiThieu ? item.gioiThieu : ''} />
                    <TableCell type='text' content={item.paymentInfo ? item.paymentInfo : ''} />
                    <TableCell type='text' content={item.shippingInfo ? item.shippingInfo : ''} />
                    <TableCell permission={{ write: true }} type='buttons' onEdit={() => this.modal.show(item)} />
                </tr >
            )
        });


        return this.renderPage({
            icon: 'fa fa-shopping-bag',
            title: 'Danh sách Đại Lý Y-Shop',
            breadcrumb: [
                <Link key={0} to='/user/tmdt/y-shop' >Y-Shop</Link>,
                'Danh sách Đại Lý Y-Shop'
            ],
            onCreate: () => this.modal.show(),
            content: <div className='tile'>
                <h3>Danh sách Đại Lý Y-Shop</h3>
                <div style={{ marginBottom: '10px' }}>Kết quả: {<b>{totalItem}</b>} đại lý</div>
                <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                    <div className='title'>
                        <FormCheckbox label='Thao tác nhanh' onChange={(value) => this.setState({ isFixCol: value })} style={{ marginBottom: 0 }} />
                    </div>
                    <div className='btn-group'>
                        <Pagination style={{ position: '', marginBottom: '0' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} getPage={this.getPage} />
                    </div>
                </div>
                {table}
                <EditModal ref={e => this.modal = e} create={this.props.createTmdtAdminDaiLy} update={this.props.updateTmdtAdminDaiLy} />
            </div>,
            backRoute: '/user/tmdt/y-shop',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tmdtAdminDaiLy: state.tmdt.tmdtAdminDaiLy });
const mapActionsToProps = { getTmdtAdminDaiLyPage, createTmdtAdminDaiLy, updateTmdtAdminDaiLy };
export default connect(mapStateToProps, mapActionsToProps)(TMDTAdminPage);