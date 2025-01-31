import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { BaseCongTac, ChonPhongHopModal, CongTacListComponent, CongTacModal, TicketModal, TicketPage } from './components';
import { getUserCongTacTicketPage, updateTicketTrangThai, getUserCongTacPage, deleteCongTacTicket } from './redux/congTac';
import { Tooltip } from '@mui/material';
import moment from 'moment';
import { CirclePageButton } from 'view/component/AdminPage';
import T from 'view/js/common';

class _UserTicketPage extends TicketPage {
    state = { searching: false, loaiDonVi: [] };

    getSiteSetting = () => {
        return {
            readyUrl: '/user/hcth',
            breadcrumb: [
                <Link key={0} to='/user/van-phong-dien-tu'>Văn phòng điện tử</Link>,
                'Đăng ký công tác',
            ],
            backRoute: '/user/van-phong-dien-tu',
            baseUrl: '/user/hcth/cong-tac/dang-ky',
        };
    }

    getPage = (pageN, pageS, pageC, done) => {
        const { batDau, ketThuc } = this.state;
        this.props.getUserCongTacTicketPage(pageN, pageS, pageC, { ...this.state.filter, batDau: batDau?.getTime(), ketThuc: ketThuc?.getTime() }, (page) => this.setState({ loading: false }, () => done && done(page)));
    }

    clearAdvanceSearch = (e) => {
        e.preventDefault();
        this.changeAdvancedSearch();
    }


    sendTicket = (item) => {
        T.confirm('Gửi phiếu đăng ký công tác', `Phiếu đăng ký công tác từ ${moment(new Date(item.batDau)).format('DD/MM/YYYY')} đến ngày ${moment(new Date(item.ketThuc)).format('DD/MM/YYYY')}?`, true, isConfirm => isConfirm && this.props.updateTicketTrangThai(item.id, this.trangThaiCongTacTicketDict.DA_GUI.id, () => this.changeAdvancedSearch()));
    }

    deleteTicket = (item) => {
        T.confirm('Xóa phiếu đăng ký công tác', `Xóa phiếu đăng ký công tác từ ${moment(new Date(item.batDau)).format('DD/MM/YYYY')} đến ngày ${moment(new Date(item.ketThuc)).format('DD/MM/YYYY')}?`, true, isConfirm => isConfirm && this.props.deleteCongTacTicket(item.id, () => this.changeAdvancedSearch()));
    }



    getItemButtons = (item) => {
        return <>
            <Tooltip arrow title='Truy cập'>
                <button className='btn btn-info' onClick={(e) => {
                    e.preventDefault();
                    window.open('/user/vpdt/cong-tac/dang-ky/' + item.id, '_blank');
                }}>
                    <i className='fa fa-eye' />
                </button>
            </Tooltip>
            {item.trangThai == 'KHOI_TAO' && <Tooltip arrow title='Xóa'>
                <button className='btn btn-danger' onClick={(e) => {
                    e.preventDefault();
                    this.deleteTicket(item);
                }}>
                    <i className='fa fa-trash' />
                </button>
            </Tooltip>}
        </>;
    }

    getSelectedId = () => {
        return Object.keys(this.checkBox).filter(i => {
            try {
                return this.checkBox[i].value();
            } catch {
                return false;
            }
        });
    }

    tongHop = (e) => {
        e.preventDefault();
        const selectedTicket = this.getSelectedId();
        if (!selectedTicket.length)
            return T.notify('Bạn chưa chọn phiếu đăng ký công tác', 'danger');
        const [batDau, ketThuc] = this.dateRange.value();
        this.reportModal.show({
            batDau, ketThuc, items: selectedTicket
        });
    }

    onCheckAllChange = (value) => {
        Object.values(this.checkBox).forEach(i => {
            try {
                i.value(value);
            } catch { // ignore
            }
        });
    }

    render() {
        const
            { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list = null } = this.props.hcthCongTac?.ticketPage || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        return <>
            <div className='tile-body row'>
                <div className="col-md-12 d-flex mb-2 justify-content-between align-items-center">
                    <div>
                        <h3 className="tile-title">Danh sách phiếu đăng ký công tác</h3>
                    </div>
                </div>
                <div className='col-md-12'>
                    {this.renderTicketTable(list, pageNumber, pageSize)}
                </div>
            </div>
            <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                getPage={this.getPage} />
            <TicketModal ref={e => this.ticketModal = e} />
            <CirclePageButton type='create' onClick={() => {
                this.ticketModal.show();
            }} tooltip='Tạo mới' />
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const UserTicketPage = connect(mapStateToProps, { getUserCongTacTicketPage, updateTicketTrangThai, deleteCongTacTicket }, false, { forwardRef: true })(_UserTicketPage);


class _UserSuKienKhongLenLich extends CongTacListComponent {
    componentDidMount() {
        this.getPage(1, 50);
    }
    setRange = (batDau, ketThuc, done) => {
        this.setState({ batDau, ketThuc }, () => done && done());
    }

    getPage = (pageN, pageS, pageC, done) => {
        const { batDau, ketThuc } = this.state;
        this.props.getUserCongTacPage(pageN ?? 1, pageS ?? 50, pageC, { ...this.state.filter, batDau: batDau?.getTime(), ketThuc: ketThuc?.getTime(), isOrphan: 1, isCreator: 1 }, (page) => this.setState({ loading: false }, () => done && done(page)));
    }

    getButtons = (item) => {
        return <>
            <button key={'item_view_' + item.id} onClick={(e) => e.preventDefault() || window.open(`/user/vpdt/cong-tac/${item.id}`, '_blank')} title='Xem thông tin công tác' data-toggle='tooltip' className='btn btn-primary'>
                <i className='fa fa-eye' />
            </button>
        </>;
    }

    getData = () => {
        return this.props.hcthCongTac?.page?.list?.map(i => ({ ...i, thanhPhan: T.parse(i.thanhPhan, []) }));
    }
    isThanhPhanThamGia = () => { }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition } = this.props.hcthCongTac?.page || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        return <>
            <div className='tile-body row'>
                <div className="col-md-12">
                    {this.renderShortTable()}
                </div>
            </div>
            <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                getPage={this.getPage} />
            <CongTacModal ref={e => this.congTacModal = e} openOnDone getPageModals={this.getModals} minDate={new Date()} maxDate={this.props.maxDate} />
            <ChonPhongHopModal ref={e => this.chonPhongModal = e} getPageModals={this.getModals} />
            <CirclePageButton type='create' onClick={() => { this.congTacModal.show(); }} tooltip='Tạo mới' />
        </>;
    }
}

const UserSuKienKhongLenLich = connect(mapStateToProps, { getUserCongTacTicketPage, updateTicketTrangThai, getUserCongTacPage, deleteCongTacTicket }, false, { forwardRef: true })(_UserSuKienKhongLenLich);


class UserRegisterPage extends BaseCongTac {

    getSiteSetting = () => {
        return {
            readyUrl: '/user/hcth',
            breadcrumb: [
                <Link key={0} to='/user/van-phong-dien-tu'>Văn phòng điện tử</Link>,
                'Đăng ký công tác',
            ],
            backRoute: '/user/van-phong-dien-tu',
            baseUrl: '/user/hcth/cong-tac/dang-ky',
        };
    }

    render() {
        const { breadcrumb } = this.getSiteSetting();
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Quản lý đăng ký công tác',
            breadcrumb,
            // header: <EasePicker.EaseDateRangePicker ref={e => this.dateRange = e} placeholder={'Khoảng thời gian'} inputClassName='m-0 p-0 pl-2' className='m-0 p-0 d-flex align-items-center' middleWare={(start, end) => {
            //     start.setHours(0, 0, 0, 0);
            //     end.setHours(23, 59, 59, 999);
            //     return [start, end];
            // }} onChange={() => this.changeAdvancedSearch()} style={{ width: '350px' }} />,
            content: <>
                <div className='tile-body row' >
                    <div className='col-md-12'>
                        <ul className='nav nav-tabs'>
                            <li className='nav-item'>
                                <a className='nav-link active show' data-toggle='tab' href='#lichCongTac'>Phiếu đăng ký công tác</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link ' data-toggle='tab' href='#suKienKhongLenLich'>Sự kiện không lên lịch</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className='tab-content tile' style={{ overflowY: 'auto', height: '70vh' }}>
                    <div className='tab-pane fade active show' id='lichCongTac'>
                        <UserTicketPage ref={e => this.ticketPage = e} />
                    </div>
                    <div className='tab-pane fade' id='suKienKhongLenLich'>
                        <UserSuKienKhongLenLich ref={e => this.suKien = e} />
                    </div>
                </div>
            </>
        });
    }
}

const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(UserRegisterPage);
