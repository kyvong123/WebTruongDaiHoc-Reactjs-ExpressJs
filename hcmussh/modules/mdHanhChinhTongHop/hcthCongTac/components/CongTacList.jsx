import React from 'react';
import { connect } from 'react-redux';
import BaseCongTac from './BaseCongTac';
import CongTacModal from './CongTacModal';
import ChonPhongHopModal from './ChonPhongHopModal';
import { TableCell, renderTable } from '../../../../view/component/AdminPage';
import moment from 'moment';
import { Tooltip } from '@mui/material';
import * as HoverCard from '@radix-ui/react-hover-card';
const weekDays = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật',];

class _MemberHover extends BaseCongTac {
    render() {
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
                                {i.shcc == this.getShcc() && <span className={'p-1 badge badge-pill badge-primary px-3 py-1'} >Bạn</span>}
                            </div>)}
                        </div>
                    </div>
                    <HoverCard.Arrow />
                </HoverCard.Content>
            </HoverCard.Portal>
        </HoverCard.Root >;
    }
}

const MemberHover = connect((state) => ({ system: state.system }), {}, false, { forwardRef: true })(_MemberHover);

export class CongTacListComponent extends BaseCongTac {
    getData = () => {
        return this.props.list || this.getTicketItem()?.congTacItems;
    }

    isThanhPhanThamGia = (item) => {
        return item?.thanhPhan?.some(i => i.shcc == this.props.shcc);
    }

    renderThanhPhan = (item) => {
        return <MemberHover thanhPhan={item.thanhPhan}>
            <div className='d-flex flex-column w-100'>
                <span className='text-justify text-secondary'>{this.isThanhPhanThamGia(item) && <span className={'p-1 badge badge-pill badge-primary px-2'} style={{ width: 'auto' }}>Tham gia</span>} {item.banTheHienThanhPhan || this.getThanhPhanSummary(item.thanhPhan)}</span>
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
        renderRow: this.renderRow(true)
    });

    rowComponent = (item, index) => {
        return (<tr key={item.id} id={item.id}>
            <TableCell content={index + 1} style={{ textAlign: 'right', whiteSpace: 'nowrap' }} />
            <TableCell content={<a href={`/user/vpdt/cong-tac/${item.id}?backRoute=${window.location.pathname}`} target='_blank' rel='noreferrer noopener'>{item.ten}</a>} style={{ textAlign: 'left' }} />
            <TableCell content={
                <div className='d-flex flex-column w-100'>
                    <Tooltip arrow title={item.noiDung}>
                        <span className=' multiple-lines-3 w-100'>{item.noiDung}</span>
                    </Tooltip>
                    <span className=''>{item.banTheHienThanhPhan || this.getThanhPhanSummary(item.thanhPhan)}</span>
                </div>
            } contentClassName={'w-100 h-100'} style={{ textAlign: 'left' }} />
            <TableCell content={
                <div className='d-flex flex-column text-nowrap'>
                    <span>Bắt đầu: <span className='text-primary'>{moment(new Date(item.batDau)).format('HH:mm, [ngày] DD/MM/YYYY')}</span></span>
                    <span>Kết thúc: <span className='text-danger'>{moment(new Date(item.ketThuc)).format('HH:mm, [ngày] DD/MM/YYYY')}</span></span>
                </div>
            } />
            <TableCell content={
                item.isOnline ? <a href={item.duongDan} target='_blank' rel='noreferrer noopener'>{item.duongDan}</a> :
                    item.dangKyPhongHop ? <div className='d-flex flex-column align-items-center'>{item.tenPhongHop}
                        {!this.props.hideTrangThaiPhongHop && <span className={'p-1 badge badge-pill badge-' + this.trangThaiPhongHopTicketDict[item.trangThaiPhongHopTicket]?.level}>{this.trangThaiPhongHopTicketDict[item.trangThaiPhongHopTicket]?.text}</span>}
                    </div> :
                        <span className='text-justify'>{item.diaDiem}</span>
            } contentClassName='text-justify w-100' />
            <TableCell content={<span className={`text-nowrap text-${this.trangThaiCongTacItemDict[item.trangThai]?.level || 'primary'}`}>{this.trangThaiCongTacItemDict[item.trangThai]?.text || item.trangThai}</span>} />
            <TableCell type='buttons' style={{ textAlign: 'left' }}>{this.getButtons(item)}</TableCell>
        </tr>);
    };

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
        return <span className={`text-nowrap text-${this.trangThaiCongTacItemDict[item.trangThai]?.level || 'primary'}`}>{this.trangThaiCongTacItemDict[item.trangThai]?.text || item.trangThai}</span>;
    }

    renderRow = (isShort = false) => {
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
                components.push(isShort ? this.shortRowComponent(item, index) : this.rowComponent(item, index));
            });
        }
        return components;
    }

    getButtons = () => null

    renderTable = () => renderTable({
        emptyTable: 'Chưa có lịch công tác được đăng ký trong phiếu',
        getDataSource: () => this.getData(),
        loadingClassName: 'd-flex justify-content-center align-items-center',
        loadingOverlay: false,
        header: 'thead-light',
        renderHead: () => <tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>STT</th>
            <th style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tên</th>
            <th style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }}>Nội dung</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian</th>
            <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Địa điểm</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Trạng thái</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
        </tr>,
        renderRow: this.renderRow()
    });

    getModals = () => ({ mainModal: this.congTacModal, chonPhongModal: this.chonPhongModal });

    render() {
        return <div className='tile'>
            <div className='tile-body row justify-content-center'>
                <div className='col-md-12 d-flex justify-content-between align-items-center mb-2'>
                    <p className='tile-title'> <i className='fa fa-list' /> Danh sách lịch công tác/làm việc </p>
                    {this.getCongTacTicketChecker().isEditable() && <button className='btn btn-success' onClick={(e) => {
                        e.preventDefault();
                        this.congTacModal.show();
                    }}><i className='fa fa-lg fa-plus' />Thêm lịch công tác/làm việc</button>}
                </div>
                <div className='col-md-12'>
                    {this.renderShortTable()}
                </div>
                <ChonPhongHopModal ref={e => this.chonPhongModal = e} getPageModals={this.getModals} />
                <CongTacModal ref={e => this.congTacModal = e} congTacTicketId={this.getTicketItem()?.id} openOnDone getPageModals={this.getModals} minDate={this.props.minDate} maxDate={this.props.maxDate} />
            </div>
        </div>;
    }
}

const stateToProps = (state) => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const actionsToProps = {};
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(CongTacListComponent);
