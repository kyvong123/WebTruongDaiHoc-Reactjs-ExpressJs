import { SelectAdapter_FwCanBoWithDonVi } from 'modules/mdTccb/tccbCanBo/redux';
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { BaseCongTac, BienBan, CanBoThamGia, ChonPhongHopModal, ChuongTrinh, CongTacModal, FileList, PhanHoi, PhongHopTicketInfo, StatusComponent } from './components';
import { getCongTacItem, getCongTacItemVersion, invite, declineItem, getCongTacItemLogs } from './redux/congTac';
import { updatePhongHopTicket } from './redux/phongHopTicket';
import Slider from '@mui/material/Slider';


function valuetext(value) {
    return `${value}°C`;
}

class HistorySlider extends BaseCongTac {
    state = { value: null }
    componentDidMount() {
        this.setState({ value: this.props.value });
        getCongTacItemLogs(this.props.id, (logs) => this.setState({ logs }))();
    }

    componentDidUpdate(prevProps) {
        if (this.props.id != prevProps.id) {
            getCongTacItemLogs(this.props.id, (logs) => this.setState({ logs }))();
        }
        if (this.props.value != prevProps.value) {
            this.setState({ value: this.props.value });
        }
    }

    onChange = (e) => {
        this.setState({ value: e.target.value });
    }

    viewVersion = (item, newTab = false) => {
        if ('URLSearchParams' in window) {
            let searchParams = new URLSearchParams(window.location.search);
            searchParams.set('version', item.thoiGian);
            if (newTab) {
                window.open(window.location.toString().replace(/\?.*/, '?' + searchParams.toString()), '_blank');
            } else
                window.location.search = searchParams.toString();
        }
    }

    render() {
        const marks = this.state.logs?.slice(1).map((i, index) => {
            return {
                value: index + 1,
                label: index + 1
            };
        }) || [];
        const valueLabelFormat = (value) => {
            return value;
        };

        return <div className='tile'>
            <h3 className='tile-header'>Lịch sử thay đổi</h3>
            <div className='tile-body row'>
                <div className='col-md-12 d-flex flex-column'>
                    {/* {this.state.value} */}
                    <label className='form-label'>Các phiên bản</label>
                    <div className='px-5 d-none'>
                        <Slider
                            key={marks.length || 0}
                            aria-label='Always visible'
                            defaultValue={0}
                            valueLabelFormat={valueLabelFormat}
                            getAriaValueText={valuetext}
                            step={1}
                            marks={marks}
                            min={0}
                            max={this.state.logs?.length || 0}
                            valueLabelDisplay='on'
                        />
                    </div>
                </div>
                <div className='col-md-12'>
                    {renderTable({
                        getDataSource: () => this.state.logs,
                        className: 'thead-light',
                        renderHead: () => <tr>
                            <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Phiên bản</th>
                            <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Thời gian</th>
                            <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Cập nhật bởi</th>
                            <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Thao tác</th>
                        </tr>,
                        renderRow: (item, index) => {
                            return <tr key={index} className={this.state.value == item.thoiGian ? 'table-primary' : ''}>
                                <TableCell content={this.state.logs?.length - index} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={moment(new Date(item.thoiGian)).format('HH:mm, DD/MM/YYYY')} />
                                <TableCell content={item.tenNguoiTao} />
                                <TableCell type='buttons'>
                                    <button className='btn btn-primary' onClick={(e) => e.preventDefault() || this.viewVersion(item, true)} >
                                        <i className='fa fa-eye' />
                                    </button>
                                    <button className='btn btn-info' onClick={(e) => e.preventDefault() || this.viewVersion(item, false)}>
                                        <i className='fa fa-search' />
                                    </button>
                                </TableCell>
                            </tr>;
                        }
                    })}
                </div>
            </div>
        </div>;
    }
}

class HcthCongTacItem extends BaseCongTac {
    state = { showHistory: false }
    onDomReady = () => {
        const { routeMatcherUrl } = this.getSiteSetting();
        const params = T.routeMatcher(routeMatcherUrl).parse(window.location.pathname);
        const queryParams = new URLSearchParams(window.location.search);
        this.setState({
            id: params.id,
            backRoute: queryParams.get('backRoute') || '',
            version: queryParams.get('version')
        }, () => {
            this.getData();
            if (this.state.id) {
                //TODO: Long
                // setTimeout(() => this.props.readNotification(this.state.id), 2000);
            }
        });
    }

    getData = () => {
        this.props.getCongTacItemVersion(this.state.id, this.state.version, this.setData);
    }

    setData = (item) => {
        this.setState({ item }, () => {
            // this.batDau.value(item.batDau || '');
            // this.ketThuc.value(item.ketThuc || '');
            this.chuTri.value(item.chuTri || '');
            this.phongHop?.setData(item.phongHopTicket, item.phongHopItem, item.diaDiem);
            item.nguoiTao && this.nguoiTao?.value(item.nguoiTao || '');
            this.diaDiem?.value(item.diaDiem || '');
        });
    }

    componentDidMount() {
        const { readyUrl } = this.getSiteSetting();
        T.ready(readyUrl, this.onDomReady);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.location.pathname != this.props.location.pathname) {
            this.onDomReady();
        }
    }

    getSiteSetting = () => {
        const pathName = window.location.pathname;
        if (pathName.startsWith('/user/hcth'))
            return {
                readyUrl: '/user/hcth',
                routeMatcherUrl: '/user/hcth/cong-tac/:id',
                breadcrumb: [
                    <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                    <Link key={1} to='/user/hcth/cong-tac'>Công tác</Link>,
                    this.state.id ? 'Cập nhật' : 'Tạo mới'
                ],
                backRoute: '/user/hcth/cong-tac'
            };
        else
            return {
                routeMatcherUrl: '/user/vpdt/cong-tac/:id',
                readyUrl: '/user/van-phong-dien-tu',
                breadcrumb: [
                    <Link key={0} to='/user/van-phong-dien-tu'>...</Link>,
                    <Link key={1} to='/user/vpdt/cong-tac'>Công tác</Link>,
                    this.state.id ? 'Lịch họp' : 'Tạo mới'
                ],
                backRoute: '/user/vpdt/cong-tac'
            };
    }

    inviteUser = () => {
        T.confirm('Cảnh báo', 'Hệ thống sẽ gửi lời mời tới tất cả cán bộ tham gia sự kiện này', true, isConfirm => {
            isConfirm && this.props.invite(this.getItem().id);
        });
    }

    renderTimeLine = () => {
        if (!this.state.item) return '';
        const batDau = new Date(this.state.item.batDau);
        const ketThuc = new Date(this.state.item.ketThuc);
        const momentBatDau = moment(batDau);
        const momentKetThuc = moment(ketThuc);
        if (momentBatDau.format('DD/MM/YYYY') == momentKetThuc.format('DD/MM/YYYY')) {
            return <><span className={'text-primary'}>{momentBatDau.format('HH:mm')}</span>-<span className={'text-danger'}>{momentKetThuc.format('HH:mm')}</span>, <span className={'text-primary'}>{momentBatDau.format('[ngày] DD/MM/YYYY')}</span></>;
        }
        return <><span className={'text-primary'}>{momentBatDau.format('HH:mm, [ngày] DD/MM/YYYY')}</span>-<span className={'text-danger'}>{momentKetThuc.format('HH:mm, [ngày] DD/MM/YYYY')}</span></>;
    }

    getModals = () => {
        return { mainModal: this.editModal, chonPhongModal: this.chonPhongModal };
    }

    decline = (e, item) => {
        e.preventDefault();
        T.confirm('Cập nhật lịch họp', `Từ chối đăng ký phòng họp ${item.phongHop} bắt đầu lúc ${moment(new Date(item.batDau)).format('HH:mm, DD/MM/YYYY')} đến ${moment(new Date(item.ketThuc)).format('HH:mm, DD/MM/YYYY')}?`, true, isConfirm =>
            isConfirm && this.props.updateTrangThaiLichHop(item.id, 0, 1, () => this.getData())
        );
    }


    sendTicket = () => {
        T.confirm('Gửi phiếu đăng ký phòng họp', `Phiếu đăng ký phòng họp ${this.state.item.phongHopItem.ten} bắt đầu lúc ${moment(new Date(this.state.item.batDau)).format('HH:mm, DD/MM/YYYY')} đến ${moment(new Date(this.state.item.ketThuc)).format('HH:mm, DD/MM/YYYY')}?`, true, isConfirm =>
            isConfirm && this.props.updatePhongHopTicket(this.state.item.phongHopTicket.id, { trangThai: this.trangThaiPhongHopTicketDict.DA_DANG_KY.id }, () => this.getData())
        );
    }


    getButtons = () => {
        const buttons = [];
        // if (this.canApprove()) {
        //     buttons.push({ className: 'btn-success', icon: 'fa-check', tooltip: 'Duyệt', onClick: e => this.approve(e, this.getItem()) });
        //     buttons.push({ className: 'btn-danger', icon: 'fa-times', tooltip: 'Từ chối', onClick: e => this.decline(e, this.getItem()) });
        // }
        return buttons;
    }

    render() {
        const id = this.state.id;
        const item = this.getItem();
        return this.renderPage({
            title: 'Công tác',
            backRoute: this.state.backRoute,
            icon: 'fa fa-calendar-check-o',
            buttons: this.getButtons(),
            content: <div>
                <div className='tile'>
                    <div className='tile-body row'>
                        <h5 className='tile-title col-md-12'>{item.isOnline ? '(trực tuyến) ' : ''} {item.ten}</h5>
                        <p className='tile-text col-md-12 text-muted' style={{ whiteSpace: 'pre-line' }}>{item.noiDung}</p>
                        {/* <FormTextBox className='col-md-12 d-none' ref={e => this.diaDiem = e} label='Địa điểm' readOnly /> */}
                        {!!item.isOnline && <div className='col-md-12 form-group d-flex'>
                            Đường dẫn:&nbsp;<a href={item.duongDan} target='_blank' rel='noreferrer noopener'>{item.duongDan}</a>
                        </div>}
                        {(!item.isOnline && !!item.dangKyPhongHop) && <div className='col-md-12 form-group d-flex'>
                            <PhongHopTicketInfo ref={e => this.phongHop = e} />
                        </div>}
                        {!item.isOnline && !item.dangKyPhongHop && <FormTextBox ref={e => this.diaDiem = e} className='col-md-12' label='Địa điểm' readOnly />}
                        {!!(item?.congTacTicketId || item?.lichId) && <div className='col-md-5 form-group d-flex'>
                            Trạng thái:&nbsp;<StatusComponent objectType='congTacItem' reload={this.getData} canEdit={this.getCongTacItemPermissionChecker().isHcthManager()} id={item.id} trangThai={item.trangThai}>
                                <span className={`font-weight-bold text-${this.trangThaiCongTacItemDict[item.trangThai]?.level}`}>{this.trangThaiCongTacItemDict[item.trangThai]?.text}</span>
                            </StatusComponent>
                        </div>}
                        <FormSelect data={SelectAdapter_FwCanBoWithDonVi} className='col-md-7' ref={e => this.chuTri = e} label='Chủ trì' readOnly readOnlyEmptyText='Chưa cập nhật' />
                        <div className='col-md-5 form-group d-flex'>
                            <span className='text-nowrap'>Thời gian:</span>&nbsp;{this.renderTimeLine()}
                        </div>
                        <FormSelect data={SelectAdapter_FwCanBoWithDonVi} className='col-md-7' ref={e => this.nguoiTao = e} label='Tạo bởi' readOnly />
                        <div className='form-group col-md-12'>Thành phần tham gia (tóm tắt): <span className='font-weight-bold'>{item?.banTheHienThanhPhan || this.getThanhPhanSummary(item?.thanhPhan)}</span></div>
                        {/* <FormTextBox className='col-md-12' readOnly label='Thành phần tham gia (tóm tắt)' ref={e => this.banTheHienThanhPhan = e} /> */}
                        {<div className='col-md-12 d-flex justify-content-end align-items-center flex-wrap' style={{ gap: 10 }}>
                            {this.isEditable() && this.getCongTacItemPermissionChecker().isHcthManager() && <button className='btn btn-warning' onClick={(e) => {
                                e.preventDefault();
                                this.setState({ showHistory: !this.state.showHistory });
                            }}><i className='fa fa-history' /></button>}
                            {this.isEditable() && item.phongHopTicket?.trangThai == 'CHUA_DANG_KY' && <button className='btn btn-success' onClick={(e) => {
                                e.preventDefault();
                                this.sendTicket();
                            }}><i className='fa fa-paper-plane' />Gửi phiếu đăng ký phòng họp</button>}
                            {this.getCongTacItemPermissionChecker().isInvitable() && <button className='btn btn-danger' onClick={(e) => {
                                e.preventDefault();
                                this.inviteUser();
                            }}><i className='fa fa-bullhorn' /> Mời tham gia / Nhắc nhở</button>}
                            {this.isEditable() && this.getCongTacItemPermissionChecker().isEditable() && <button className='btn btn-primary' onClick={(e) => {
                                e.preventDefault();
                                this.editModal.show(item);
                            }}><i className='fa fa-pencil-square' />Chỉnh sửa</button>}
                        </div>}
                    </div>
                </div>
                {this.state.showHistory && <HistorySlider id={this.state.id} value={this.state.version} />}
                <CongTacModal ref={e => this.editModal = e} getPageModals={this.getModals} />
                <ChonPhongHopModal ref={e => this.chonPhongModal = e} getPageModals={this.getModals} />
                {!!this.getItem()?.id && <div className='tile-body row' >
                    <div className='col-md-12'>
                        <ul className='nav nav-tabs'>
                            <li className='nav-item'>
                                <a className='nav-link active show' data-toggle='tab' href='#canBoThamGia'>Cán bộ tham gia</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link ' data-toggle='tab' href='#chuongTrinhHop'>Chương trình/Kế hoạch</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link ' data-toggle='tab' href='#bienBan'>Biên bản/Kết luận</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link ' data-toggle='tab' href='#phanHoi'>Phản hồi</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link ' data-toggle='tab' href='#fileDinhKem'>Tệp tin đính kèm</a>
                            </li>
                        </ul>
                        <div className='tab-content tile' style={{ overflowY: 'auto', maxHeight: '80vh' }}>
                            <div className='tab-pane fade active show' id='canBoThamGia'>
                                <CanBoThamGia id={this.state.id} />
                            </div>
                            <div className='tab-pane fade' id='chuongTrinhHop'>
                                <ChuongTrinh id={this.state.id} />
                            </div>
                            <div className='tab-pane fade' id='bienBan'>
                                <BienBan id={this.state.id} />
                            </div>
                            <div className='tab-pane fade' id='phanHoi'>
                                <PhanHoi id={id} />
                            </div>
                            <div className='tab-pane fade' id='fileDinhKem'>
                                <FileList id={id} />
                            </div>
                        </div>
                    </div>
                </div>}
            </div >
        });
    }
}

const stateToProps = (state) => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const actionsToProps = { getCongTacItem, getCongTacItemVersion, invite, declineItem, updatePhongHopTicket };
export default connect(stateToProps, actionsToProps)(HcthCongTacItem);
