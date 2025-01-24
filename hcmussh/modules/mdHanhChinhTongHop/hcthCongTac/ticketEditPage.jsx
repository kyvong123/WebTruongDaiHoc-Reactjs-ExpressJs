import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { FormSelect } from 'view/component/AdminPage';
import BaseCongTac from './components/BaseCongTac';
import HcthCongTacTicketModal from './components/TicketModal';
import { getCongTacTicket, updateTicketTrangThai, deleteCongTacItem, removeItem } from './redux/congTac';
import { SelectAdapter_FwCanBoWithDonVi } from '../../mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmDonVi } from '../../mdDanhMuc/dmDonVi/redux';
import { AddSuKien, CongTacListComponent, EasePicker, StatusComponent } from './components';
import T from 'view/js/common';
import * as HoverCard from '@radix-ui/react-hover-card';

class _CongTacList extends CongTacListComponent {

    removeItem = (e, item) => {
        e.preventDefault();
        T.confirm('Xác nhận', 'Chuyển sự kiện trong phiếu thành sự kiện không lên lịch. Bạn vẫn có thể mời các thành phần tham dự nhưng sự kiện sẽ không lên lịch trường', true, i =>
            i && this.props.removeItem(item.id, () => this.props.getData()));
    }

    renderExtendsButton = (item) => {
        const buttons = [];
        if (this.props.isEditable()) {
            buttons.push(<div key={'remove'} onClick={(e) => this.removeItem(e, item)} className='list-group-item list-group-item-action d-flex align-items-center' style={{ gap: 10 }}>
                <i className='fa fa-lg fa-repeat text-primary' />
                <span>Sự kiện không lên lịch</span>
            </div>);
        }
        const ExtendButton = () => {
            return <HoverCard.Root>
                <HoverCard.Trigger asChild>
                    <button className='btn btn-light'><i className='fa fs-sm fa-bars' /></button>
                </HoverCard.Trigger>
                <HoverCard.Portal>
                    <HoverCard.Content sideOffset={5}>
                        <div className='row pr-3' style={{ minWidth: '300px', zIndex: 5000, maxWidth: '80vw' }}>
                            <div className='col-md-12 list-group text-dark' style={{}}>
                                {buttons}
                            </div>
                        </div>
                        <HoverCard.Arrow />
                    </HoverCard.Content>
                </HoverCard.Portal>
            </HoverCard.Root>;
        };
        return buttons.length ? <ExtendButton key={'extends_' + item.id} item={item} /> : null;
    }

    getButtons = (item) => {
        return <>
            {this.renderExtendsButton(item)}
            <a className='btn btn-info' href={'/user/vpdt/cong-tac/' + item.id + '?backRoute=' + window.location.pathname}>
                <i className='fa fa-lg fa-eye' />
            </a>
            {(this.getCongTacItemPermissionChecker(item).isDeletable() || this.getCongTacTicketChecker(this.props.ticket).isEditable()) && <button className='btn btn-danger' onClick={() => {
                T.confirm('Cảnh báo', 'Xác nhận xóa sự kiện', true, (isConfirm) => {
                    isConfirm && this.props.deleteCongTacItem(item.id, () => window.location.reload());
                });
            }}>
                <i className='fa fa-trash' />
            </button>}
        </>;
    }
}

const CongTacList = connect(state => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac }), { deleteCongTacItem, removeItem }, false, { forwardRef: true })(_CongTacList);

class TicketEditPage extends BaseCongTac {
    state = { searching: false, loaiDonVi: [], filter: {}, addSuKien: false };

    componentDidMount() {
        T.ready(this.getSiteSetting().readyUrl, this.onDomReady);
    }

    onDomReady = () => {
        const { routeMatcherUrl } = this.getSiteSetting();
        const params = T.routeMatcher(routeMatcherUrl).parse(window.location.pathname);
        const queryParams = new URLSearchParams(window.location.search);
        this.setState({
            id: params.id,
            backRoute: queryParams.get('backRoute') || ''
        }, () => {
            this.getData();
            if (this.state.id) {
                //TODO: Long
                // setTimeout(() => this.props.readNotification(this.state.id), 2000);
            }
        });
    }

    setData = item => {
        this.setState({ item });
        this.dateRangeText.value(item.batDau, item.ketThuc);
        this.dateRange.value(item.batDau, item.ketThuc);
        this.donVi.value(item.donVi);
        this.nguoiTao.value(item.nguoiTao);
    }

    getData = () => {
        this.props.getCongTacTicket(this.state.id, this.setData);
    }

    getSiteSetting = () => {
        return {
            readyUrl: '/user/van-phong-dien-tu',
            breadcrumb: [
                <Link key={0} to='/user/van-phong'>Văn phòng điện tử</Link>,
                'Đăng ký công tác',
            ],
            backRoute: '/user/van-phong-dien-tu',
            baseUrl: '/user/van-phong-dien-tu',
            routeMatcherUrl: '/user/vpdt/cong-tac/dang-ky/:id',

        };
    }

    onSend = () => {
        const item = this.getTicketItem();
        const sendRequest = (confirm) => {
            confirm && this.props.updateTicketTrangThai(item.id, this.trangThaiCongTacTicketDict.DA_GUI.id, () => this.getData());
        };
        T.confirm('Gửi phiếu đăng ký công tác', 'Xác nhận gửi phiếu đăng ký công tác', true, (isConfirm) => {
            if (item.congTacItems.find(i => i.trangThaiPhongHopTicket && this.trangThaiPhongHopTicket.filter(t => t.warning).some(k => k.id == i.trangThaiPhongHopTicket))) {
                T.confirm('Bạn có lịch công tác có đăng ký phòng họp chưa được đăng ký', 'Vẫn tiếp tục', true, isConfirm => sendRequest(isConfirm));
            } else {
                sendRequest(isConfirm);
            }
        });
    }

    getTicketButtons = () => {
        const item = this.getTicketItem();
        if (!item) return;
        return <>
            {this.getCongTacTicketChecker().isSendable() && <button className='btn btn-success' onClick={e => e.preventDefault() || this.onSend()}>
                <i className='fa fa-paper-plane' /> Gửi phiếu đăng ký
            </button>}
            {this.getCongTacTicketChecker().isEditable() && <button className='btn btn-info' type='button' onClick={() => this.addModal.show({ batDau: new Date(this.state.item.batDau), ketThuc: new Date(this.state.item.ketThuc) })}><i className='fa fa-plus' />Sự kiện không lên lịch</button>}
            {this.getCongTacTicketChecker().isEditable() && <button className='btn btn-primary' type='button' onClick={() => this.ticketModal.show(item)}><i className='fa fa-pencil-square-o' />Chỉnh sửa</button>}
        </>;
    }

    getItems = () => {
        let list = this.getTicketItem()?.congTacItems;
        if (!list) return list;
        if (this.state.filter.batDau) {
            list = list.filter(i => i.batDau >= this.state.filter.batDau.getTime());
        }
        if (this.state.filter.ketThuc) {
            list = list.filter(i => i.ketThuc <= this.state.filter.ketThuc.getTime());
        }
        return list;
    }

    checkAddPermission = () => {
        const ticket = this.getTicketItem();
        if (!ticket) return false;
        return this.getCongTacTicketChecker(ticket).isEditable();
    }

    render() {
        const
            { breadcrumb, backRoute } = this.getSiteSetting(),
            buttons = [];


        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Phiếu đăng ký công tác',
            breadcrumb,
            content: <>
                <div className="row pb-2">
                    <div className='col-md-12 d-flex flex-row flex-wrap justify-content-center' style={{ gap: 20 }}>
                        <div className="tile " style={{ flex: 1 }}>
                            <h4 className="tile-title">Thông tin phiếu</h4>
                            <div className='tile-body row'>
                                <EasePicker.EaseDateRangePicker label='Thời gian đăng ký' ref={e => this.dateRangeText = e} readOnly className='col-md-12' />
                                <FormSelect readOnly className='col-md-12' ref={e => this.donVi = e} label='Đơn vị đăng ký' data={SelectAdapter_DmDonVi} />
                                <FormSelect readOnly className='col-md-12' ref={e => this.nguoiTao = e} label='Tạo bởi' data={SelectAdapter_FwCanBoWithDonVi} />
                                <span className='form-group col-md-12'>Ghi chú: {this.state.item?.ghiChu}</span>
                                <span className='form-group col-md-12'>Trạng thái:
                                    <StatusComponent objectType='congTacTicket' reload={this.getData} canEdit={this.getCongTacTicketChecker().isHcthManager()} id={this.state.item?.id} trangThai={this.state.item?.trangThai}>
                                        <span className={'font-weight-bold text-' + this.trangThaiCongTacTicketDict[this.state.item?.trangThai]?.level}>{this.trangThaiCongTacTicketDict[this.state.item?.trangThai]?.text}</span>
                                    </StatusComponent>
                                </span>

                                <div className="col-md-12 mb-2 d-flex justify-content-end align-items-center" style={{ gap: 10 }}>
                                    {this.getTicketButtons()}
                                </div>
                            </div>
                        </div>
                        <div className="" >
                            <div className='d-flex justify-content-center align-items-center'>
                                <EasePicker.EaseDateRangePicker ref={e => this.dateRange = e} inline inputClassName='d-none' minDate={this.state.item?.batDau} maxDate={this.state.item?.ketThuc} middleWare={(start, end) => {
                                    start?.setHours(0, 0, 0, 0);
                                    end?.setHours(23, 59, 59, 999);
                                    return [start, end];
                                }} onChange={(batDau, ketThuc) => {
                                    this.setState({ filter: { batDau, ketThuc } });
                                }} />
                            </div>
                        </div>
                    </div>
                </div>
                <AddSuKien ref={e => this.addModal = e} ticketId={this.state.id} getData={this.getData} />
                <CongTacList ticket={this.getTicketItem()} isEditable={this.checkAddPermission} list={this.getItems()} minDate={this.state.item?.batDau ? new Date(this.state.item?.batDau) : null} maxDate={this.state.item?.ketThuc ? new Date(this.state.item?.ketThuc) : null} getData={this.getData} />
                <HcthCongTacTicketModal ref={e => this.ticketModal = e} congTacTicketId={this.state.id} />
            </>,
            backRoute,
            buttons,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const mapActionsToProps = { getCongTacTicket, updateTicketTrangThai };
export default connect(mapStateToProps, mapActionsToProps)(TicketEditPage);
