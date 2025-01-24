import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getTmdtVoucherPage, createVoucher, updateVoucher, deleteVoucher } from 'modules/mdThuongMaiDienTu/tmdtSellerDashboard/redux/voucherRedux';
import { getTmdtDaiLy } from 'modules/mdThuongMaiDienTu/tmdtSellerDashboard/redux/myDaiLyRedux.jsx';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, getValue, FormDatePicker, FormCheckbox } from 'view/component/AdminPage';
import T from 'view/js/common';
import Pagination from 'view/component/Pagination';


class EditModal extends AdminModal {
    onShow = (data) => {
        const { item, maDaiLy } = data;
        let { id, name, mucGiam, minCondition, totalNumber, currentNumber, startDate, endDate, kichHoat } = item ? item : { id: '', name: '', maDaiLy: '', mucGiam: '', minCondition: '', totalNumber: '', currentNumber: '', startDate: '', endDate: '', kichHoat: 0 };
        this.setState({ id, maDaiLy });
        this.name.value(name);
        this.mucGiam.value(mucGiam);
        this.minCondition.value(minCondition);
        this.totalNumber.value(totalNumber);
        this.currentNumber.value(currentNumber);
        this.startDate.value(startDate);
        this.endDate.value(endDate);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        try {
            const changes = {
                name: getValue(this.name),
                maDaiLy: this.state.maDaiLy,
                mucGiam: getValue(this.mucGiam),
                minCondition: getValue(this.minCondition),
                totalNumber: Number(getValue(this.totalNumber)),
                currentNumber: Number(getValue(this.currentNumber)),
                startDate: Number(getValue(this.startDate)),
                endDate: Number(getValue(this.endDate)),
                kichHoat: Number(getValue(this.kichHoat))
            };
            if (changes.startDate >= changes.endDate) {
                this.endDate.focus();
                T.notify('Ngày bắt đầu phải sớm hơn ngày hết hạn!', 'danger');
            } else if (changes.totalNumber < this.currentNumber) {
                this.currentNumber.focus();
                T.notify('Số lượng còn lại phải nhỏ hơn tổng số lượng!', 'danger');
            } else {
                this.state.id ? this.props.update(this.state.maDaiLy, this.state.id, changes, this.hide) : this.props.create(this.state.maDaiLy, changes, this.hide);
            }

        } catch (error) {
            error.props && T.notify(`${error.props.label || 'Dữ liệu'} bị trống!`, 'danger');
        }
    };

    render = () => {
        const readOnly = this.state.id ? true : false;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật voucher' : 'Tạo mới voucher',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.name = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
                <FormTextBox type='number' className='col-12' ref={e => this.mucGiam = e} label='Mức giảm' readOnly={readOnly} placeholder='Mức giảm' required />
                <FormTextBox type='number' className='col-12' ref={e => this.minCondition = e} label='Điều kiện tối thiểu' readOnly={readOnly} placeholder='Điều kiện tối thiểu' required />
                <FormTextBox type='number' className='col-12' ref={e => this.totalNumber = e} label='Tổng số lượng' readOnly={readOnly} placeholder='Tổng số lượng' required />
                <FormTextBox type='number' className='col-12' ref={e => this.currentNumber = e} label='Số lượng còn lại' readOnly={readOnly} placeholder='Số lượng còn lại' required />
                <FormCheckbox isSwitch ref={e => this.kichHoat = e} label='Kích hoạt' className='col-md-12 form-group' />
                <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.startDate = e} label='Ngày bắt đầu' readOnly={readOnly} required />
                <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.endDate = e} label='Ngày hết hạn' readOnly={readOnly} required />
            </div>
        });
    }
}

class SellerVoucherPage extends AdminPage {
    state = {
        maDaiLy: null,
        filter: {},
    };

    componentDidMount() {
        const route = T.routeMatcher('/user/tmdt/y-shop/seller/voucher/:maDaiLy'), maDaiLy = route.parse(window.location.pathname).maDaiLy;
        this.setState({ maDaiLy, isLoading: true });
        T.ready('/user/tmdt/y-shop/seller/voucher/:maDaiLy', () => {
            this.getPage();
            this.props.getTmdtDaiLy(maDaiLy);
            this.setState({ maDaiLy, isLoading: false });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getTmdtVoucherPage(this.state.maDaiLy, pageN, pageS, pageC, this.state.filter, done);
    }



    // delete = (e, item) => {
    //     T.confirm('Xóa voucher', `Bạn có chắc bạn muốn voucher${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
    //         isConfirm && this.props.deleteVoucher(this.state.maDaiLy, item.id);
    //     });
    //     e.preventDefault();
    // }

    changeActive = item => {
        this.props.updateVoucher(item.maDaiLy, item.id, { kichHoat: item.kichHoat == 1 ? 0 : 1 });
    }

    render() {
        const daiLyInfo = this.props.tmdtSellerMyDaiLy && this.props.tmdtSellerMyDaiLy.item ? this.props.tmdtSellerMyDaiLy.item : null;
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tmdtSellerVoucher && this.props.tmdtSellerVoucher.page ?
            this.props.tmdtSellerVoucher.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có dữ liệu voucher!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: '400px', whiteSpace: 'nowrap' }}>Tên</th>
                        <th style={{ width: '200px', whiteSpace: 'nowrap' }}>Mức giảm</th>
                        <th style={{ width: '200px', whiteSpace: 'nowrap' }}>Tổng số lượng</th>
                        <th style={{ width: '200px', whiteSpace: 'nowrap' }}>Số lượng còn lại</th>
                        <th style={{ width: '200px', whiteSpace: 'nowrap' }}>Đơn tối thiểu</th>
                        <th style={{ width: '200px', whiteSpace: 'nowrap' }}>Ngày bắt đầu</th>
                        <th style={{ width: '200px', whiteSpace: 'nowrap' }}>Ngày hết hạn</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={item.name} />
                        <TableCell type='text' content={item.mucGiam} />
                        <TableCell type='text' content={item.totalNumber} />
                        <TableCell type='text' content={item.currentNumber} />
                        <TableCell type='text' content={item.minCondition} />
                        <TableCell type='date' content={item.startDate} dateFormat='dd/mm/yyyy' />
                        <TableCell type='date' content={item.endDate} dateFormat='dd/mm/yyyy' />
                        <TableCell type='checkbox' permission={{ write: true }} content={item.kichHoat} onChanged={() => this.changeActive(item)} />
                        <TableCell type='buttons' content={item} permission={{ write: true }} onEdit={() => this.modal.show({ item: item, maDaiLy: this.state.maDaiLy })} />
                    </tr>
                )
            });
        }
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: `Voucher của đại lý ${daiLyInfo?.ten} (${daiLyInfo?.maCode})`,
            breadcrumb: [
                <Link key={0} to='/user/tmdt/y-shop' >Y-Shop</Link>,
                <Link key={1} to='/user/tmdt/y-shop/seller/my-dai-ly'>Đại lý của tôi</Link>,
                'Voucher'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getTmdtVoucherPage} />
                <EditModal ref={e => this.modal = e} create={this.props.createVoucher} update={this.props.updateVoucher} />
            </>,
            backRoute: `/user/tmdt/y-shop/seller/my-dai-ly/${this.state.maDaiLy}`,
            onCreate: () => this.modal.show({ maDaiLy: this.state.maDaiLy })
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tmdtSellerVoucher: state.tmdt.tmdtSellerVoucher, tmdtSellerMyDaiLy: state.tmdt.tmdtSellerMyDaiLy });
const mapActionsToProps = { getTmdtVoucherPage, createVoucher, updateVoucher, deleteVoucher, getTmdtDaiLy };
export default connect(mapStateToProps, mapActionsToProps)(SellerVoucherPage);