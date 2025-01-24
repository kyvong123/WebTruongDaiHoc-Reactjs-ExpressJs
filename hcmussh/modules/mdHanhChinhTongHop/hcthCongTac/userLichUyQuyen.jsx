import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { getUserUyQuyenCongTacPage } from './redux/uyQuyen';
import { EasePicker } from './components';
import Pagination from 'view/component/Pagination';
import moment from 'moment';
import * as HoverCard from '@radix-ui/react-hover-card';
const { getThanhPhanSummary, trangThaiCongTacItemDict } = require('./tools')();
import { CongTacAttachmentModal } from './staffLichPage';

const weekDays = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật',];

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

class MemberHover extends React.Component {
    render() {
        console.log('props', this.props);
        return <HoverCard.Root>
            <HoverCard.Trigger asChild>
                {this.props.children}
            </HoverCard.Trigger>
            <HoverCard.Portal>
                <HoverCard.Content sideOffset={5}>
                    <div className='row pr-3' style={{ minWidth: '300px', zIndex: 5000, maxWidth: '80vw', maxHeight: '50vh', overflowY: 'auto' }}>
                        <div className='col-md-12 list-group text-dark' style={{}}>
                            {this.props.thanhPhan?.map((i) => <div key={i.shcc} className='list-group-item list-group-item-action d-flex align-items-center' style={{ border: '1px solid blue' }}>
                                <div className='d-flex flex-column' style={{ flex: 1 }}>
                                    <h5 className='text-bold'>{`${i.hoCanBoNhan} ${i.tenCanBoNhan}`.trim().normalizedName()}</h5>
                                    <small>{i.tenDonVi}</small>
                                </div>
                                {i.shcc == this.props.shcc && <span className={'p-1 badge badge-pill badge-primary px-3 py-1'} >Bạn</span>}
                            </div>)}
                        </div>
                    </div>
                    <HoverCard.Arrow />
                </HoverCard.Content>
            </HoverCard.Portal>
        </HoverCard.Root >;
    }
}

class AdminLichUyQuyen extends AdminPage {
    state = { listUyQuyen: [] }

    componentDidMount() {
        T.ready('/user/vpdt', () => {
            const route = T.routeMatcher('/user/vpdt/uy-quyen/lich-cong-tac/:shcc'),
                shcc = route.parse(window.location.pathname).shcc;
            this.shcc = shcc;

            const [batDau, ketThuc] = SelectAdapterDateRange()[0].value;
            this.setRange(batDau, ketThuc, this.getPage);
        });
    }

    setRange = (batDau, ketThuc, done) => {
        this.setState({ batDau, ketThuc }, () => done && done());
    }

    getPage = (pageN, pageS, done) => {
        const { batDau, ketThuc } = this.state;
        this.props.getUserUyQuyenCongTacPage(pageN || 1, pageS || 100, { ...this.state.filter, batDau: batDau?.getTime(), ketThuc: ketThuc?.getTime(), isParticipant: 1, userShcc: this.shcc }, (page) => this.setState({ loading: false }, () => {
            done && done(page.page);
            this.setState({ ...page });
        }));
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
        return this.state.page?.list?.map(i => ({ ...i, thanhPhan: T.parse(i.thanhPhan, []) }));
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

    isThanhPhanThamGia = (item) => {
        return item?.thanhPhan?.some(i => i.shcc == this.shcc);
    }

    renderThanhPhan = (item) => {
        console.log(item);
        return <MemberHover thanhPhan={item.thanhPhan} shcc={this.shcc}>
            <div className='d-flex flex-column w-100'>
                <span className='text-justify text-secondary'>{this.isThanhPhanThamGia(item) && <span className={'p-1 badge badge-pill badge-primary px-2'} style={{ width: 'auto' }}>Tham gia</span>} {item.banTheHienThanhPhan || getThanhPhanSummary(item.thanhPhan)}</span>
            </div>
        </MemberHover>;
    }

    renderShortTable = () => renderTable({
        emptyTable: 'Chưa có lịch công tác được đăng ký',
        getDataSource: () => this.getData(),
        loadingClassName: 'd-flex justify-content-center align-items-center',
        loadingOverlay: false,
        header: 'thead-light',
        renderHead: () => <tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>STT</th>
            <th style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }}>Thành phần</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Giờ</th>
            <th style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }}>Nội dung</th>
            <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Địa điểm</th>
            {!this.props.hideTrangThai && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Trạng thái</th>}
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
        </tr>,
        renderRow: this.renderRow()
    });

    getCongTacItemClassName = () => {
        return '';
    }

    shortRowComponent = (item, index) => {
        const batDau = new Date(item.batDau);
        const ketThuc = new Date(item.ketThuc);
        return (<tr key={item.id} id={item.id} className={this.getCongTacItemClassName(item)}>
            <TableCell content={index + 1} style={{ textAlign: 'right', whiteSpace: 'nowrap' }} />
            <TableCell content={this.renderThanhPhan(item)} contentClassName={'w-100'} className='align-top' style={{ textAlign: 'left', verticalAlign: 'top !important' }} />
            <TableCell content={
                <div className={'d-flex flex-column text-nowrap ' + (batDau.getHours() > 12 ? 'text-right' : 'text-left')}>
                    {batDau.toDateString() == ketThuc.toDateString() ?
                        `${moment(batDau).format('HH:mm')}-${moment(ketThuc).format('HH:mm')}` : <div className='d-flex flex-column text-nowrap'>
                            <span>Bắt đầu: <span className='text-primary'>{moment(new Date(item.batDau)).format('HH:mm, [ngày] DD/MM/YYYY')}</span></span>
                            <span>Kết thúc: <span className='text-danger'>{moment(new Date(item.ketThuc)).format('HH:mm, [ngày] DD/MM/YYYY')}</span></span>
                        </div>
                    }
                </div>
            } />
            <TableCell content={<a href={`/user/vpdt/cong-tac/${item.id}?backRoute=${window.location.pathname}`} target='_blank' rel='noreferrer noopener' className='text-justify'>{item.ten}</a>} style={{ textAlign: 'left' }} />

            <TableCell content={
                item.isOnline ? 'Trực tuyến' :
                    item.dangKyPhongHop ? <div className='d-flex flex-column align-items-center'>
                        {item.tenPhongHop + (item.diaDiem ? `, ${item.diaDiem}` : '')}
                        {!this.props.hideTrangThaiPhongHop && <span className={'p-1 badge badge-pill badge-' + this.trangThaiPhongHopTicketDict[item.trangThaiPhongHopTicket]?.level}>{this.trangThaiPhongHopTicketDict[item.trangThaiPhongHopTicket]?.text}</span>}
                    </div> :
                        <span className='text-justify'>{item.diaDiem}</span>
            } />
            {!this.props.hideTrangThai && <TableCell content={this.renderTrangThai(item)} />}
            <TableCell type='buttons' style={{ textAlign: 'left' }}>{this.getButtons(item)}</TableCell>
        </tr>);
    }

    renderTrangThai(item) {
        return <span className={`text-nowrap text-${trangThaiCongTacItemDict[item.trangThai]?.level || 'primary'}`}>{trangThaiCongTacItemDict[item.trangThai]?.text || item.trangThai}</span>;
    }

    renderRow = () => {
        const components = [];
        let currentDayInWeek = -1, currentDate = -1;

        const list = this.getData();
        if (list) {
            list.forEach((item, index) => {
                const dayInWeek = (new Date(item.batDau).getDay() + 6) % 7;
                const date = new Date(item.batDau).getDate();
                if (dayInWeek != currentDayInWeek || date != currentDate) {
                    components.push(<tr key={`day-${dayInWeek}`} className='table-primary'><th colSpan={this.props.hideTrangThai ? 6 : 7} style={{ textAlign: 'center' }}>{<span className='font-weight-bold align-self-center'>{`${weekDays[dayInWeek]}, ngày ${moment(new Date(item.batDau)).format('DD/MM/YYYY')}`}</span>}</th>
                    </tr>);
                    currentDayInWeek = dayInWeek;
                    currentDate = date;
                }
                components.push(this.shortRowComponent(item, index));
            });
        }
        return components;
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition } = this.state.page || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null },
            { ho, ten } = this.state.canBoInfo || { ho: '', ten: '' };
        return this.renderPage({
            advanceSearchTitle: '',
            icon: 'fa fa-calendar',
            title: `Quản lịch công tác của ${ho} ${ten}`,
            breadcrumb: [
                <Link key={0} to='/user/van-phong-dien-tu'>Văn phòng điện tử</Link>,
                'Lịch công tác ủy quyền'
            ],
            content: <>
                <div className='tile'>
                    <div className='tile-body row'>
                        <div className='col-md-12 row d-flex justify-content-start align-items-center'>
                            <FormSelect className='col-md-3' value={'today'} data={SelectAdapterDateRange()} label='Khoảng thời gian' onChange={this.onChangeDateRange} allowClear />
                            <EasePicker.EaseDateRangePicker ref={e => this.dateRange = e} placeholder={'Khoảng thời gian'} label='Chọn khoảng thời gian' middleWare={(start, end) => {
                                start.setHours(0, 0, 0, 0);
                                end.setHours(23, 59, 59, 999);
                                return [start, end];
                            }} onChange={(batDau, ketThuc) => this.setRange(batDau, ketThuc, this.getPage)} className={'col-md-9 ' + (this.state.showRangePicker ? '' : 'd-none')} />
                        </div>
                        <div className='col-md-12'>
                            {this.renderShortTable()}
                        </div>
                    </div>
                    <CongTacAttachmentModal ref={e => this.attachmentModal = e} />
                    <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                        getPage={this.getPage} />
                </div>
            </>,
            backRoute: '/user/vpdt/uy-quyen/lich-cong-tac',
        });
    }
}


const mapStateToProps = state => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const mapActionsToProps = { getUserUyQuyenCongTacPage };
export default connect(mapStateToProps, mapActionsToProps)(AdminLichUyQuyen);