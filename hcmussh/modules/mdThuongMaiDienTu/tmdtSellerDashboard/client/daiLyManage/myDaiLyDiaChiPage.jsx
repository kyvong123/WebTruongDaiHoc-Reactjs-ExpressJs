import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getTmdtDiaChiPage, createDiaChi, updateDiaChi, deleteDiaChi } from 'modules/mdThuongMaiDienTu/tmdtSellerDashboard/redux/diaChiRedux';
import { getTmdtDaiLy } from 'modules/mdThuongMaiDienTu/tmdtSellerDashboard/redux/myDaiLyRedux.jsx';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, getValue } from 'view/component/AdminPage';
import T from 'view/js/common';
import Pagination from 'view/component/Pagination';


class EditModal extends AdminModal {
    onShow = (data) => {
        const { item, maDaiLy } = data;
        let { id, address } = item ? item : { id: '', address: '' };
        this.setState({ id, maDaiLy });
        this.address.value(address);
    };

    onSubmit = (e) => {
        e.preventDefault();
        try {
            const changes = {
                address: getValue(this.address),
                maDaiLy: this.state.maDaiLy,
            };
            this.state.id ? this.props.update(this.state.maDaiLy, this.state.id, changes, this.hide) : this.props.create(this.state.maDaiLy, changes, this.hide);

        } catch (error) {
            error.props && T.notify(`${error.props.label || 'Dữ liệu'} bị trống!`, 'danger');
        }
    };

    render = () => {
        return this.renderModal({
            title: this.state.id ? 'Cập nhật địa chỉ' : 'Tạo mới địa chỉ',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.address = e} label='Địa chỉ' placeholder='Địa chỉ' required />
            </div>
        });
    }
}

class SellerDiaChiPage extends AdminPage {
    state = {
        maDaiLy: null,
        filter: {},
    };

    componentDidMount() {
        const route = T.routeMatcher('/user/tmdt/y-shop/seller/dia-chi/:maDaiLy'), maDaiLy = route.parse(window.location.pathname).maDaiLy;
        this.setState({ maDaiLy, isLoading: true });
        T.ready('/user/tmdt/y-shop/seller/dia-chi/:maDaiLy', () => {
            this.getPage();
            this.props.getTmdtDaiLy(maDaiLy);
            this.setState({ maDaiLy, isLoading: false });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getTmdtDiaChiPage(this.state.maDaiLy, pageN, pageS, pageC, this.state.filter, done);
    }



    delete = (e, item) => {
        T.confirm('Xóa địa chỉ', `Bạn có chắc bạn muốn xóa địa chỉ ${item.address ? `<b>${item.address}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteDiaChi(this.state.maDaiLy, item.id);
        });
        e.preventDefault();
    }

    render() {
        const daiLyInfo = this.props.tmdtSellerMyDaiLy && this.props.tmdtSellerMyDaiLy.item ? this.props.tmdtSellerMyDaiLy.item : null;
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tmdtSellerDiaChi && this.props.tmdtSellerDiaChi.page ?
            this.props.tmdtSellerDiaChi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có dữ liệu địa chỉ!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: '50px', whiteSpace: 'nowrap' }}>STT</th>
                        <th style={{ width: '1200px', whiteSpace: 'nowrap' }}>Địa chỉ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell content={index + 1} />
                        <TableCell type='text' content={item.address} />
                        <TableCell type='buttons' content={item} permission={{ write: true, delete: true }} onEdit={() => this.modal.show({ item: item, maDaiLy: this.state.maDaiLy })} onDelete={this.delete} />
                    </tr>
                )
            });
        }
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: `Địa chỉ của đại lý ${daiLyInfo?.ten} (${daiLyInfo?.maCode})`,
            breadcrumb: [
                <Link key={0} to='/user/tmdt/y-shop' >Y-Shop</Link>,
                <Link key={1} to='/user/tmdt/y-shop/seller/my-dai-ly'>Đại lý của tôi</Link>,
                'Địa chỉ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getTmdtDiaChiPage} />
                <EditModal ref={e => this.modal = e} create={this.props.createDiaChi} update={this.props.updateDiaChi} />
            </>,
            backRoute: `/user/tmdt/y-shop/seller/my-dai-ly/${this.state.maDaiLy}`,
            onCreate: () => this.modal.show({ maDaiLy: this.state.maDaiLy })
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tmdtSellerDiaChi: state.tmdt.tmdtSellerDiaChi, tmdtSellerMyDaiLy: state.tmdt.tmdtSellerMyDaiLy });
const mapActionsToProps = { getTmdtDiaChiPage, createDiaChi, updateDiaChi, deleteDiaChi, getTmdtDaiLy };
export default connect(mapStateToProps, mapActionsToProps)(SellerDiaChiPage);