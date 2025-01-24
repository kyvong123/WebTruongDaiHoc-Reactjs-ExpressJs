import React from 'react';
import { AdminPage, FormSelect, FormDatePicker, renderDataTable, TableCell, AdminModal, FormTextBox } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getPage, getSoTien, createGiaoDich } from './redux';
import Pagination from 'view/component/Pagination';
import { NumberIcon } from '../tcHocPhi/adminPage';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmPhuongThucThanhToan } from 'modules/mdDanhMuc/dmBank/redux';
const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => {
        const nam = i + new Date().getFullYear() - 10;
        return { id: nam, text: `${nam}` };
    });
};

const trangThai = [
    {
        id: 1,
        text: 'Thành công'
    },
    {
        id: 0,
        text: 'Thất bại'
    }
];
export class CreateModal extends AdminModal {
    onShow = () => {
        this.nam?.value('');
        this.shcc?.value('');
        this.thanhChu?.value('');
        this.ghiChu?.value('');
        this.pttt?.value('');
        this.thoiGianSoPhu?.value('');
        this.soTien?.value('');
    }
    onGetSoTien = () => {
        const nam = this.nam.value();
        const shcc = this.shcc.value();
        if (nam && shcc) {
            this.props.getSoTien(shcc, nam, res => {
                this.soTien.value(res.soTienThanhToan);
                this.onChangeQuery();
            });
        }
    }
    onSubmit = () => {
        this.setState({ isLoading: true });
        const data = {
            nam: this.nam.value(),
            shcc: this.shcc.value(),
            thanhChu: this.thanhChu.value(),
            ghiChu: this.ghiChu.value(),
            pttt: this.pttt.value(),
            thoiGianSoPhu: this.thoiGianSoPhu?.value()?.getTime(),
            soTien: this.soTien.value()
        };
        if (!data.nam) {
            T.notify('Vui lòng nhập năm quyết toán thuế!', 'danger');
            this.nam.focus();
        } else if (!data.shcc) {
            T.notify('Vui lòng nhập mã số cán bộ !', 'danger');
            this.shcc.focus();
        } else if (!data.pttt) {
            T.notify('Vui lòng nhập phương thức thanh toán !', 'danger');
            this.pttt.focus();
        } else if (!data.thoiGianSoPhu) {
            T.notify('Vui lòng nhập thời gian sổ phụ!', 'danger');
            this.thoiGianSoPhu.focus();
        } else if (!data.soTien) {
            T.notify('Vui lòng nhập số tiền!', 'danger');
            this.soTien.focus();
        } else {
            this.props.createGiaoDich(data, () => {
                this.setState({ isLoading: false }, () => {
                    this.hide();
                });
            });
        }
    }
    onChangeQuery = () => {
        this.setAmountText(this.soTien.value());
    }

    setAmountText = (value) => {
        if (Number.isInteger(value))
            this.thanhChu?.value(T.numberToVnText(value.toString()) + ' đồng');
    }
    render = () => {
        return this.renderModal({

            title: 'Thêm giao dịch',
            size: 'large',
            isLoading: this.state.isLoading,
            body: <div className='row'>
                <FormSelect ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} className='col-md-12' label='Cán bộ' placeholder='Cán bộ' onChange={() => this.onGetSoTien()}></FormSelect>
                <FormTextBox type='number' ref={e => this.soTien = e} className='col-md-8' label='Số tiền' placeholder='Số tiền' onChange={() => this.onChangeQuery()}></FormTextBox>
                <FormSelect ref={e => this.nam = e} data={yearDatas()} className='col-md-4' label='Năm' placeholder='Năm' onChange={() => this.onGetSoTien()}></FormSelect>
                <FormTextBox ref={e => this.thanhChu = e} disabled className='col-md-12' label='Thành chữ' placeholder='Thành chữ'></FormTextBox>
                <FormSelect ref={e => this.pttt = e} className='col-md-12' label='Phương thức thanh toán' placeholder='Phương thức thanh toán' data={SelectAdapter_DmPhuongThucThanhToan}></FormSelect>
                <FormDatePicker ref={e => this.thoiGianSoPhu = e} className='col-md-12' label='Thời gian sổ phụ' placeholder='Thời gian sổ phụ'></FormDatePicker>
                <FormTextBox ref={e => this.ghiChu = e} className='col-md-12' label='Ghi chú' placeholder='Ghi chú'></FormTextBox>
            </div>
        });
    }
}
export class TcQuyetToanThueGiaoDich extends AdminPage {
    componentDidMount() {
        T.ready('/user/finance', () => {
            T.onSearch = (searchText) => {
                this.getPage(undefined, undefined, searchText || '');
                this.setState({ searchText: searchText || '' });
            };
            T.showSearchBox(true);
        });
        this.changeAdvancedSearch(true);
    }
    // Search 

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getPage(pageN, pageS, pageC, this.state.filter, done);
    }
    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.tcQuyetToanThueGiaoDich && this.props.tcQuyetToanThueGiaoDich.page ? this.props.tcQuyetToanThueGiaoDich.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
        if (pageCondition && (typeof pageCondition == 'string')) {
            T.setTextSearchBox(pageCondition);
        }
        let
            nam = this.nam.value(),
            trangThai = this.trangThai.value(),
            { tuNgay, denNgay } = this.getTimeFilter();

        const pageFilter = (isInitial || isReset) ? {} : { nam, tuNgay, denNgay, trangThai };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter });
                } else if (isReset) {
                    this.onClearSearch();
                    this.hideAdvanceSearch();
                }
            });
        });
    }
    getTimeFilter = () => {
        let tuNgay = this.tuNgay.value() || null,
            denNgay = this.denNgay.value() || null;
        if (tuNgay) {
            tuNgay.setHours(0, 0, 0, 0);
            tuNgay = tuNgay.getTime();
        }
        if (denNgay) {
            denNgay.setHours(23, 59, 59, 999);
            denNgay = denNgay.getTime();
        }
        return { tuNgay, denNgay };
    }
    onClearSearch = (e) => {
        e.preventDefault();
        ['tuNgay', 'denNgay', 'nam', 'trangThai'].forEach(key => this[key]?.value(''));
        this.changeAdvancedSearch();
    }
    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list, totalMoney } = this.props.tcQuyetToanThueGiaoDich && this.props.tcQuyetToanThueGiaoDich.page ? this.props.tcQuyetToanThueGiaoDich.page : {
            pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null
        };
        const mapperTrangThai = {
            1: <div style={{ color: 'green' }}><i className='fa fa-lg fa-check-circle-o' /> Thành công</div>,
            0: <div style={{ color: 'red' }}><i className='fa fa-lg fa-times-circle-o' /> Thất bại</div>

        };
        const table = renderDataTable(
            {
                data: list || [],
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã số cán bộ</th>
                        <th style={{ width: '20%', textAlign: 'left', whiteSpace: 'nowrap' }}>Họ và tên lót</th>
                        <th style={{ width: '20%', textAlign: 'left', whiteSpace: 'nowrap' }}>Tên</th>
                        <th style={{ width: '30%', textAlign: 'left', whiteSpace: 'nowrap' }}>Số tiền (VNĐ)</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày giao dịch</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời gian sổ phụ</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Trạng thái</th>
                        <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ghi chú</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'left' }} type='number' content={index + 1} />
                        <TableCell style={{ textAlign: 'center' }} type='text' content={item.shcc} />
                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.ho} />
                        <TableCell style={{ textAlign: 'left' }} content={item.ten} />
                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} type='text' content={T.numberDisplay(item.soTien)} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={T.dateToText(item.thoiGianDong, 'HH:MM dd/mm/yy')} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={T.dateToText(item.thoiGianSoPhu, 'HH:MM dd/mm/yy')} />
                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={mapperTrangThai[item.trangThai]} />
                        <TableCell style={{ textAlign: 'left' }} content={item.ghiChu} />
                    </tr>),
            }
        );
        return this.renderPage({
            title: 'Quản lý giao dịch quyết toán thuế  ',
            icon: 'fa fa-id-card-o',
            advanceSearch: <div className="row">
                <FormSelect ref={e => this.nam = e} label='Năm' data={yearDatas()} className='col-md-3' allowClear />
                <FormSelect ref={e => this.trangThai = e} label='Trạng thái' data={trangThai} className='col-md-3' allowClear />
                <FormDatePicker ref={e => this.tuNgay = e} label='Từ ngày' className='col-md-3' allowClear />
                <FormDatePicker ref={e => this.denNgay = e} label='Đến ngày' className='col-md-3' allowClear />
                <div className='col-md-12 d-flex justify-content-end' style={{ gap: 10 }}>
                    <button className='btn btn-danger' onClick={this.onClearSearch}><i className='fa fa-lg fa-times' />Xóa tìm kiếm</button>
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}><i className='fa fa-lg fa-search' />Tìm kiếm</button>
                </div>
            </div>,
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                <Link key={1} to='/user/tncn'>Thu nhập cá nhân</Link>,
                'Quyết toán thuế'],
            content: <div>
                <div className='row'>
                    <div className='col-md-6'>
                        <NumberIcon type='primary' icon='fa-users' title='Tổng số giao dịch' value={totalItem || 0} />
                    </div>
                    <div className='col-md-6'>
                        <NumberIcon type='info' icon='fa-money' title='Tổng số tiền đã đóng' value={totalMoney || 0} />
                    </div>
                </div>
                <div className='tile'>

                    {table}
                    <Pagination {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                        getPage={this.getPage} />
                </div>
                <CreateModal ref={e => this.modal = e} getSoTien={this.props.getSoTien} createGiaoDich={this.props.createGiaoDich}></CreateModal>
            </div>,
            onCreate: () => this.modal.show()
        });
    }
}




const mapStateToProps = state => ({ system: state.system, tcQuyetToanThueGiaoDich: state.finance.tcQuyetToanThueGiaoDich });
const mapActionsToProps = { getPage, getSoTien, createGiaoDich };
export default connect(mapStateToProps, mapActionsToProps)(TcQuyetToanThueGiaoDich);
