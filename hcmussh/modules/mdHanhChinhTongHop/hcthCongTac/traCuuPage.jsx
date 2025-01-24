import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { renderTable, TableCell, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import BaseCongTac from './components/BaseCongTac';
import { EasePicker } from './components';
// import {  } from './redux/congTac';
import { getPhongHopTicketPage, censorPhongHopTicket } from './redux/phongHopTicket';
import moment from 'moment';
import T from '../../../view/js/common';
import { SelectAdapter_DmPhongHop } from './redux/phongHop';

class AdminPhongHopTicketPage extends BaseCongTac {
    state = { searching: false, loaiDonVi: [], isDeleted: false };

    componentDidMount() {
        T.ready(this.getSiteSetting().readyUrl, () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            // this.trangThaiPhongHopTicket.forEach(i => this[i.id]);
            this.changeAdvancedSearch(true);
        });
    }

    getSiteSetting = () => {
        return {
            readyUrl: '/user/hcth',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                'Quản lý đăng ký phòng họp',
            ],
            backRoute: '/user/hcth',
            baseUrl: '/user/hcth/lich-hop',
        };
    }


    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props.hcthCongTac?.phongHopTicketPage || { pageNumber: 1, pageSize: 50 };
        const pageFilter = isInitial ? { isDeleted: 0 } : { isDeleted: 0 };
        pageFilter.phongHop = this.phongHop.value();
        const [batDau, ketThuc] = this.dateRange.value();
        pageFilter.batDau = batDau?.getTime();
        pageFilter.ketThuc = ketThuc?.getTime();
        pageFilter.trangThai = this.trangThaiPhongHopTicket.filter(i => this[i.id] && this[i.id].value()).map(i => i.id).toString();
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                }
            });
        });
    };

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getPhongHopTicketPage(pageN, pageS, pageC, this.state.filter, (page) => this.setState({ loading: false }, () => done(page)));
    }

    decline = (e, item) => {
        e.preventDefault();
        swal({ // eslint-disable-line
            title: 'Cập nhật đăng ký phòng họp',
            text: `Từ chối đăng ký phòng họp ${item.tenPhongHop} bắt đầu lúc ${moment(new Date(item.batDau)).format('HH:mm, DD/MM/YYYY')} đến ${moment(new Date(item.ketThuc)).format('HH:mm, DD/MM/YYYY')}?`,
            content: {
                element: 'input',
                attributes: {
                    placeholder: 'Lý do từ chối',
                    type: 'text',
                    required: true,
                },
            },
            icon: 'warning',
            buttons: {
                cancel: true,
                confirm: true
            },
            dangerMode: true,
        }).then((lyDo) => {
            if (!lyDo) {
                T.notify('Lý do từ chối trống', 'danger');
            } else {
                this.props.censorPhongHopTicket(item.id, { trangThai: this.trangThaiPhongHopTicketDict.TU_CHOI.id, lyDo }, () => this.changeAdvancedSearch());
            }
        });

    }

    approve = (e, item) => {
        e.preventDefault();
        T.confirm('Xác nhận', `Duyệt đăng ký phòng họp ${item.tenPhongHop} bắt đầu lúc ${moment(new Date(item.batDau)).format('HH:mm, DD/MM/YYYY')} đến ${moment(new Date(item.ketThuc)).format('HH:mm, DD/MM/YYYY')}?`, true, isConfirm =>
            isConfirm && this.props.censorPhongHopTicket(item.id, { trangThai: this.trangThaiPhongHopTicketDict.DA_DUYET.id }, () => this.changeAdvancedSearch())
        );
    }
    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa đăng ký phòng họp', `Xóa đăng ký phòng họp ${item.tenPhongHop} bắt đầu lúc ${moment(new Date(item.batDau)).format('HH:mm, DD/MM/YYYY')} đến ${moment(new Date(item.ketThuc)).format('HH:mm, DD/MM/YYYY')}?`, true, isConfirm =>
            isConfirm && this.props.censorPhongHopTicket(item.id, { isDeleted: 1 }, () => this.changeAdvancedSearch())
        );
    }


    getItems = () => {
        return this.props.hcthCongTac?.page?.list;
    }

    clearAdvanceSearch = (e) => {
        e.preventDefault();
        this.changeAdvancedSearch();
    }

    render() {
        const
            // currentPermissions = this.getCurrentPermissions(),
            { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list = null } = this.props.hcthCongTac?.phongHopTicketPage || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null },
            { breadcrumb, backRoute } = this.getSiteSetting(),
            buttons = [];

        let table = renderTable({
            emptyTable: 'Không có lịch họp được đăng ký!',
            getDataSource: () => list,
            header: 'thead-light',
            loadingOverlay: false,
            // className: 'table-fix-col',
            loadingClassName: 'd-flex justify-content-center align-items-center',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Đăng ký bởi</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Phòng họp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái</th>
                </tr>
            ),
            renderRow: (item, index) => {
                item.trangThai = this.resolveTrangThai(item, Date.now());
                return (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                            <div className='d-flex flex-column'>
                                <span>{item.tenNguoiTao?.normalizedName()}</span>
                                <span>{item.tenDonVi}</span>
                            </div>} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center', color: 'blue' }} content={
                            <div className='d-flex flex-column'>
                                <span className='text-primary'>{moment(new Date(item.batDau)).format('HH:mm, DD/MM/YYYY')}</span>
                                <span className='text-danger'>{moment(new Date(item.ketThuc)).format('HH:mm, DD/MM/YYYY')}</span>
                            </div>} />
                        <TableCell type={item.isOnline ? 'link' : 'text'} to={item.duongDan} style={{ whiteSpace: 'nowrap', textAlign: 'center', maxWidth: '20px', textOverflow: 'ellipsis' }} content={item.tenPhongHop} />
                        <TableCell type='text' content={<a href='#' className={`text-${this.trangThaiPhongHopTicketDict[item.trangThai]?.level}`}>{this.trangThaiPhongHopTicketDict[item.trangThai]?.text}</a>
                        } style={{ whiteSpace: 'nowrap' }} />
                    </tr>
                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Tra cứu đăng ký phòng họp',
            breadcrumb,
            content: <>
                <div className='tile'>
                    <div className='tile-body row'>
                        <div className='col-md-12 d-flex align-items-center mb-2' style={{ gap: 20 }}>
                            {this.trangThaiPhongHopTicket.filter(i => i.allowUserFilter).map(i => {
                                return <FormCheckbox key={i.id} value={true} ref={e => this[i.id] = e} label={i.text} onChange={() => this.changeAdvancedSearch()} />;
                            })}
                            <FormSelect allowClear ref={e => this.phongHop = e} data={SelectAdapter_DmPhongHop} style={{ width: '200px' }} onChange={() => this.changeAdvancedSearch()} label={'Phòng họp'} />
                            <EasePicker.EaseDateRangePicker ref={e => this.dateRange = e} placeholder={'Khoảng thời gian'} middleWare={(start, end) => {
                                start.setHours(0, 0, 0, 0);
                                end.setHours(23, 59, 59, 999);
                                return [start, end];
                            }} onChange={(batDau, ketThuc) => this.setState({ batDau, ketThuc }, this.changeAdvancedSearch)} style={{ width: '400px' }} label={'chọn thời gian'}
                            />


                        </div>
                        <div className='col-md-12'>
                            {table}
                        </div>
                    </div>
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </>,
            backRoute,
            buttons
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const mapActionsToProps = { getPhongHopTicketPage, censorPhongHopTicket };
export default connect(mapStateToProps, mapActionsToProps)(AdminPhongHopTicketPage);
