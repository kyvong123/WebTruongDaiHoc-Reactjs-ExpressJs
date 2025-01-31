import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { BaseCongTacModal, CongTacListComponent, EasePicker, FileListComponent, ReportModal, TicketModal, TicketPage } from './components';
import { getUserCongTacPage, getCongTacItem } from './redux/congTac';
import { getLichCongTacPage } from './redux/lichCongTac';
import T from 'view/js/common';
import { TableCell, renderTable, FormSelect } from 'view/component/AdminPage';
import moment from 'moment';
import UyQuyenComponent from './uyQuyenComponent';

const SelectAdapterDateRange = () => {
    const toDay = new Date();
    toDay.setHours(0, 0, 0, 0);
    const tomorrow = new Date(toDay.getTime() + 24 * 60 * 3600 * 1000);
    const monday = T.getMonday(toDay);
    const sunDay = new Date(monday.getTime() + 1000 * 3600 * 24 * 6.5);
    sunDay.setHours(23, 59, 59, 999);

    const thisMonth = new Date(new Date().setDate(1));
    thisMonth.setHours(0, 0, 0, 0);
    const lastDateOfThisMonth = new Date(T.getLastDateOfMonth(thisMonth).setHours(23, 59, 59, 999));

    const lastMonth = new Date(new Date().setMonth(toDay.getMonth() - 1));
    lastMonth.setDate(1);
    lastMonth.setHours(0, 0, 0, 0);
    const lastDateOfLastMonth = new Date(T.getLastDateOfMonth(lastMonth).setHours(23, 59, 59, 999));

    return [
        { id: 'today', text: 'Hôm nay', value: [toDay, new Date(new Date(toDay).setHours(23, 59, 59, 999))] },
        { id: 'tomorrow', text: 'Ngày mai', value: [tomorrow, new Date(new Date(tomorrow).setHours(23, 59, 59, 999))] },
        { id: 'thisWeek', text: 'Tuần này', value: [monday, sunDay] },
        { id: 'thisMonth', text: 'Tháng này', value: [thisMonth, lastDateOfThisMonth] },
        { id: 'lastMonth', text: 'Tháng trước', value: [lastMonth, lastDateOfLastMonth] },
        { id: 'other', text: 'Khác' },
    ];
};

export class CongTacAttachmentModal extends BaseCongTacModal {
    onShow = (item) => {
        this.setState({ item, loading: true }, () => {
            getCongTacItem(item.id, (item) => {
                this.setState({ item, loading: false });
            }, null, this.hide)(() => null);
        });
    }

    render = () => {
        return this.renderModal({
            // title: 'Tệp tin đính kèm',
            body: <div className='tile-body'>
                {this.state.loading ? <div className="col-md-12 d-flex justify-content-center">
                    <i className='fa fa-lg fa-spin fa-spinner' />
                </div> : <FileListComponent hcthCongTac={{ item: this.state.item }} readOnly system={{ user: { staff: {} } }} />}
            </div>

        });
    }
}

class _LichCuaBan extends CongTacListComponent {
    componentDidMount() {
        const [batDau, ketThuc] = SelectAdapterDateRange()[0].value;
        this.setRange(batDau, ketThuc, this.getPage);
    }

    setRange = (batDau, ketThuc, done) => {
        this.setState({ batDau, ketThuc }, () => done && done());
    }

    getPage = (pageN, pageS, pageC, done) => {
        const { batDau, ketThuc } = this.state;
        this.props.getUserCongTacPage(pageN ?? 1, pageS ?? 100, pageC, { ...this.state.filter, batDau: batDau?.getTime(), ketThuc: ketThuc?.getTime(), isParticipant: 1 }, (page) => this.setState({ loading: false }, () => done && done(page)));
    }

    getButtons = (item) => {
        return <>
            <button key={'item_attachment_' + item.id} onClick={(e) => e.preventDefault() || this.attachmentModal.show(item)} title='Danh sách đính kèm' data-toggle='tooltip' className='btn btn-warning'>
                <i className='fa fa-paperclip' style={{ transform: 'rotate(90deg)' }} />
            </button>
            <button key={'item_view_' + item.id} onClick={(e) => e.preventDefault() || window.open(`/user/vpdt/cong-tac/${item.id}`, '_blank')} title='Xem thông tin công tác' data-toggle='tooltip' className='btn btn-primary'>
                <i className='fa fa-eye' />
            </button>
        </>;
    }

    getData = () => {
        return this.props.hcthCongTac?.page?.list?.map(i => ({ ...i, thanhPhan: T.parse(i.thanhPhan, []) }));
    }

    onChangeDateRange = (item) => {
        this.setState({ showRangePicker: item && !item.value }, () => {
            if (!item) {
                this.setRange(null, null, this.getPage);
            } else {
                if (item.value) {
                    this.setRange(item.value[0], item.value[1], this.getPage);
                } else {
                    const [batDau, ketThuc] = this.dateRange?.value();
                    this.setRange(batDau, ketThuc, this.getPage);
                }
            }
        });
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition } = this.props.hcthCongTac?.page || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        return <>
            <div className='tile-body row'>
                <div className="col-md-12 row d-flex justify-content-start align-items-center">
                    <FormSelect className='col-md-3' value={'today'} data={SelectAdapterDateRange()} label='Khoảng thời gian' onChange={this.onChangeDateRange} allowClear />
                    <EasePicker.EaseDateRangePicker ref={e => this.dateRange = e} placeholder={'Khoảng thời gian'} label='Chọn khoảng thời gian' middleWare={(start, end) => {
                        start.setHours(0, 0, 0, 0);
                        end.setHours(23, 59, 59, 999);
                        return [start, end];
                    }} onChange={(batDau, ketThuc) => this.setRange(batDau, ketThuc, this.getPage)} className={'col-md-9 ' + (this.state.showRangePicker ? '' : 'd-none')} />
                </div>
                <div className="col-md-12">
                    {this.renderShortTable()}
                </div>
            </div>
            <CongTacAttachmentModal ref={e => this.attachmentModal = e} />
            <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                getPage={this.getPage} />
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const LichCuaBan = connect(mapStateToProps, { getUserCongTacPage }, false, { forwardRef: true })(_LichCuaBan);

class AdminPhongHopTicketPage extends TicketPage {
    state = { searching: false, loaiDonVi: [] };

    componentDidMount() {
        T.ready('/user/vpdt', () => {
            // this.onDomReady();
            this.getLichPage(0, 100);
        });
    }

    getSiteSetting = () => {
        return {
            readyUrl: '/user/hcth',
            breadcrumb: [
                <Link key={0} to='/user/vpdt'>Văn phòng điện tử</Link>,
                'Lịch công tác',
            ],
            backRoute: '/user/van-phong-dien-tu',
            baseUrl: '/user/hcth/cong-tac/dang-ky',
        };
    }

    getLichPage = (pageN, pageS, pageC, done) => {
        const isRectors = this.props.system.user?.permissions?.includes('rectors:login');
        this.props.getLichCongTacPage(pageN, pageS, pageC, { isRectors: Number(isRectors), isAdmin: 1 }, (page) => this.setState({ loading: false }, () => done && done(page)));
    }

    clearAdvanceSearch = (e) => {
        e.preventDefault();
        this.changeAdvancedSearch();
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
        const [batDau, ketThuc] = this.dateRange.value();
        if (!batDau || !ketThuc) {
            T.notify('Vui lòng chọn khoảng thời gian trước', 'danger');
            this.dateRange.focus();
            return;
        }
        if (!selectedTicket.length)
            return T.notify('Bạn chưa chọn phiếu đăng ký công tác', 'danger');
        this.reportModal.show({
            batDau, ketThuc, items: selectedTicket
        });
    }

    onCheckAllChange = (value) => {
        Object.values(this.checkBox).forEach(i => {
            try {
                i.value(value);
            } catch {
                // ignore
            }
        });
    }

    renderLichTable = () => {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list = null } = this.props.hcthCongTac?.lichPage || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        return <>
            {renderTable({
                emptyTable: 'Chưa có dữ liệu!',
                getDataSource: () => list,
                header: 'thead-light',
                loadingOverlay: false,
                loadingClassName: 'd-flex justify-content-center align-items-center',
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Từ ngày</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đến ngày</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Xử lý bởi</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái</th>
                        <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Ghi chú</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => {
                    return (
                        <tr key={index}>
                            <TableCell style={{ textAlign: 'right' }} content={<a href={'/user/vpdt/cong-tac/tong-hop/' + item.id} target='_blank' rel="noreferer noopener noreferrer">{(pageNumber - 1) * pageSize + index + 1}</a>} />
                            <TableCell type='text' content={<span className='text-primary'>{moment(new Date(item.batDau)).format('DD/MM/YYYY')}</span>} />
                            <TableCell type='text' content={<span className='text-danger'>{moment(new Date(item.ketThuc)).format('DD/MM/YYYY')}</span>} />
                            <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<div className='d-flex flex-column'>
                                <span className=''>{item.tenNguoiTao?.normalizedName()}</span>
                                {/* <span className=''>({item.tenDonVi})</span> */}
                            </div>} />
                            <TableCell type='text' content={<span className={`text-${this.trangThaiLichCongTacDict[item.trangThai]?.level}`}>{this.trangThaiLichCongTacDict[item.trangThai]?.text}</span>} style={{ whiteSpace: 'nowrap' }} />
                            <TableCell type='text' style={{ textAlign: 'left' }} content={item.ghiChu} />
                            <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={{}}>
                                {
                                    <button className="btn btn-primary" data-toggle='tooltip' title='Truy cập lịch' onClick={() => window.open(`/user/vpdt/lich-cong-tac/${item.id}`, '_blank')}>
                                        <i className='fa fa-lg fa-eye' />
                                    </button>
                                }
                            </TableCell>
                        </tr>
                    );
                }
            })}
            <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                getPage={this.getLichPage} />
        </>;
    }

    render() {
        const { breadcrumb, backRoute } = this.getSiteSetting(),
            { permissions } = this.props.system.user;
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Lịch công tác',
            breadcrumb,
            content: <>
                <ReportModal ref={e => this.reportModal = e} />
                <div className='tile-body row' >
                    <div className='col-md-12'>
                        <ul className='nav nav-tabs'>
                            <li className='nav-item'>
                                <a className='nav-link ' data-toggle='tab' href='#lichCongTac'>Lịch công tác trường</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link active show' data-toggle='tab' href='#lichCuaBan'>Lịch của bạn</a>
                            </li>
                            {
                                permissions?.includes('hcthCongTac:uyQuyen') && <li className='nav-item'>
                                    <a className='nav-link' data-toggle='tab' href='#uyQuyen'>Ủy quyền</a>
                                </li>
                            }
                        </ul>
                    </div>
                </div>
                <div className='tab-content tile' style={{ overflowY: 'auto', height: '70vh' }}>
                    <div className='tab-pane fade' id='lichCongTac'>
                        <div className='tile-body row'>
                            <div className='col-md-12'>
                                {this.renderLichTable()}
                            </div>
                        </div>
                    </div>
                    <div className='tab-pane fade active show' id='lichCuaBan'>
                        <LichCuaBan ref={e => this.lichCuaBan = e} hideTrangThai hideTrangThaiPhongHop />
                    </div>
                    {
                        permissions?.includes('hcthCongTac:uyQuyen') && <div className='tab-pane fade' id='uyQuyen'>
                            <UyQuyenComponent ref={e => this.uyQuyen = e} />
                        </div>
                    }
                </div>
                <TicketModal ref={e => this.ticketModal = e} />
            </>,
            backRoute,
        });
    }
}


const mapActionsToProps = { getLichCongTacPage };
export default connect(mapStateToProps, mapActionsToProps)(AdminPhongHopTicketPage);
