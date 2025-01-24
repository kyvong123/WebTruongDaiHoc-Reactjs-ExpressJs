import * as HoverCard from '@radix-ui/react-hover-card';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { FormCheckbox, FormRichTextBox, FormSelect, FormTextBox, } from 'view/component/AdminPage';
import { SelectAdapter_FwCanBoWithDonVi } from 'modules/mdTccb/tccbCanBo/redux';
import { AddTicketModal, ChonPhongHopModal, CongTacListComponent, CongTacModal, EasePicker, LuuY, ReportModal, StatusComponent, TicketPage } from './components';
import BaseCongTac, { BaseCongTacModal } from './components/BaseCongTac';
import HcthCongTacTicketModal from './components/TicketModal';
import { getLich, requestLich, censorLich, publishLich, addTicketToLich, notifyUsers, revokeLich } from './redux/lichCongTac';
import { getCongTacItem, declineItem, update } from './redux/congTac';
import { createCensorMessage, getCensorMessage, resolveCensorMessage } from './redux/censorMessages';

const mapStateToProps = state => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });

class SubmitModal extends BaseCongTacModal {
    userRef = {}

    onSubmit = () => {
        this.props.submit(this.state.items.filter(i => this.userRef[i.shcc]?.value()));
    }

    onShow = (items) => {
        this.setState({ items });
    }

    render = () => {
        return this.renderModal({
            title: 'Gửi kiểm duyệt lịch',
            body: <div className='row'>
                <span className='text-primary col-md-12'>Gửi yêu cầu duyệt lịch</span>
                <div className='list-group col-md-12 ml-2'>
                    {this.state.items?.map(user => {
                        return <FormCheckbox className='list-group-item' ref={e => this.userRef[user.shcc] = e} label={`${user.ho} ${user.ten}`} key={user.shcc} />;
                    })}
                </div>
            </div>
        });
    }
}

class ProblemList extends BaseCongTac {

    getItem = () => {
        return this.props.item || this.state.item;
    }

    renderStaffProblem = (problem) => {
        const shcc = problem.staff;
        const canBo = this.getItem().thanhPhan.find(i => i.shcc == shcc);
        const targetItem = this.props.getTaskItem(problem.with);
        if (problem.message) {
            return problem.message;
        }
        else if (problem.type == 'Trùng thời gian tham gia công tác') {
            return `${`${canBo.hoCanBoNhan || ''} ${canBo.tenCanBoNhan}`.trim().normalizedName()} ${problem.type.toLowerCase()} '${targetItem.ten}'`;
        }
    }

    renderProblem = (problem) => {
        return <div className='d-flex align-items-center' style={{ gap: 10 }}>
            {problem.level == 'danger' ? <i className='text-danger fa fa-lg fa-exclamation' /> : <i className='text-warning fa fa-lg fa-exclamation-triangle' />}
            <span>{problem.staff ? this.renderStaffProblem(problem) : this.renderRoomProplem(problem)}</span>
        </div>;
    }

    render = () => {
        return <div className='col-md-12 list-group text-dark'>
            {this.getItem()?.problems?.map((problem, index) => <a key={index} onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                this.props.onClick(this.getItem(), this.props.getTaskItem(problem.with));
            }} className='list-group-item list-group-item-action'>{this.renderProblem(problem)}</a>)}
        </div>;
    }
}

class _CensorModal extends BaseCongTacModal {

    componentDidMount() {
        $(document).ready(() => {
            this.onHidden(() => {
                console.log('hahahs');
                this.props.reRender && this.props.reRender();
            });
        });
    }

    onShow = (item) => {
        this.setState({ item });
    }

    renderMessage = (censorMessage) => {
        return <>
            <div className='d-flex align-items-center' style={{ gap: 10 }}>
                {censorMessage.isResolved ? <i className='text-success fa fa-lg fa-check' /> : <i className='text-danger fa fa-lg fa-exclamation' />}
                <span>{censorMessage.noiDung}</span>
            </div>
            {this.getLichPermission().canResolveCensorMessages(censorMessage) && <div className='d-flex justify-content-center align-items-center' style={{ gap: 0 }}>
                <button className='btn bg-transparent' onClick={(e) => this.onResolve(e, censorMessage)} ><i className='fa fa-lg fa-check text-success hover-zoom' data-toggle='tooltip' title='Hoàn tất' /></button>
            </div>}
        </>;
    }

    onSaveCensorMessages = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const noiDung = this.censorMessage.value();
        this.props.createCensorMessage(this.state.item.id, noiDung, () => {
            this.censorMessage.value('');
            this.onReload();
        });
    }

    onHide = () => {
        this.props.reRender && this.props.reRender();
    }

    onReload = () => {
        this.props.getCensorMessage(this.state.item.id, (items) => {
            const { item } = this.state;
            item.censorMessages = items;
            this.setState({ item });
        });
    }

    onResolve = (e, message) => {
        e.preventDefault();
        e.stopPropagation();
        this.props.resolveCensorMessage(message.id, this.onReload);
    }

    render = () => {
        return this.renderModal({
            title: 'Thông điệp kiểm duyệt',
            size: 'large',
            body: <div className='p-3'>
                <div className='row'>
                    <div className='col-md-12 list-group text-dark'>
                        {this.state.item?.censorMessages?.map((message, index) => <div key={index} onClick={(e) => e.preventDefault()} className='list-group-item list-group-item-action d-flex justify-content-between align-items-center'>{
                            this.renderMessage(message)
                        }</div>)}
                        {this.getLichPermission().canAddCensorMessages() && <div className='list-group-item list-group-item-action d-flex justify-content-between align-items-center'>
                            <FormTextBox className='w-100 m-0 p-0 mr-2' placeholder='Nhập thông điệp' ref={e => this.censorMessage = e} />
                            <div className='d-flex justify-content-center align-items-center' style={{ gap: 0 }}>
                                <button className='btn bg-transparent' onClick={this.onSaveCensorMessages} ><i className='fa fa-lg fa-save text-primary hover-zoom' data-toggle='tooltip' title='Lưu' /></button>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
        });
    }
}

const CensorModal = connect(mapStateToProps, { getLich, requestLich, censorLich, publishLich, createCensorMessage, getCensorMessage, resolveCensorMessage }, false, { forwardRef: true })(_CensorModal);

class ProblemModal extends BaseCongTacModal {

    onShow = (item) => {
        this.setState({ item });
    }

    render = () => {
        return this.renderModal({
            title: 'Các vấn đề',
            size: 'large',
            body: <div className='p-3'>
                <div className='row'>
                    <ProblemList item={this.state.item} getTaskItem={this.props.getTaskItem} onClick={(task, withTask) => {
                        this.hide();
                        this.props.onProblemClick(task, withTask);
                    }} />
                </div>
            </div>
        });
    }
}

class ProblemHover extends BaseCongTac {
    render() {
        return <HoverCard.Root openDelay={300}>
            <HoverCard.Trigger asChild>
                {this.props.button}
            </HoverCard.Trigger>
            <HoverCard.Portal>
                <HoverCard.Content sideOffset={5}>
                    <div className='row pr-3' style={{ minWidth: '300px', zIndex: 5000, maxWidth: '80vw' }}>
                        <ProblemList item={this.props.item} getTaskItem={this.props.getTaskItem} onClick={(task, withTask) => {
                            this.props.onProblemClick(task, withTask);
                        }} />
                    </div>
                    <HoverCard.Arrow />
                </HoverCard.Content>
            </HoverCard.Portal>
        </HoverCard.Root>;
    }
}

class _CongTacList extends CongTacListComponent {

    onProblemClick = (task, withTask) => {
        // $('.table-warning').toggleClass('table-warning');
        setTimeout(() => {
            $(`#${task.id}`).toggleClass('table-warning');
            $(`#${withTask.id}`).toggleClass('table-warning');
            setTimeout(() => {
                $(`#${task.id}`).toggleClass('table-warning');
                $(`#${withTask.id}`).toggleClass('table-warning');
            }, 2000);
        }, 100);
    }

    declineItem = (item) => {
        T.confirm('Từ chối sự kiện', `Từ chối sự kiện '${item.ten}'`, true, confirm => {
            confirm && declineItem(item.id)();
        });
    }

    renderExtendsButton = (item) => {
        const ExtendButton = ({ item }) => {
            const [open, setOpen] = useState(false);
            const [spaces, setSpaces] = useState(item.spaces);
            const onChange = (e, increase) => {
                e.preventDefault();
                const _spaces = increase ? spaces + 1 : Math.max(spaces - 1, 0);
                update(item.id, { spaces: _spaces }, () => {
                    setSpaces(_spaces);
                })();
            };
            return <HoverCard.Root open={open}>
                <HoverCard.Trigger asChild>
                    <button className='btn btn-light' onClick={e => e.preventDefault() || setOpen(!open)}><i className='fa fs-sm fa-bars' /></button>
                </HoverCard.Trigger>
                <HoverCard.Portal>
                    <HoverCard.Content sideOffset={5}>
                        <div className='row pr-3' style={{ minWidth: '300px', zIndex: 5000, maxWidth: '80vw' }}>
                            <div className='col-md-12 list-group text-dark' style={{}}>
                                <div className='list-group-item list-group-item-action d-flex flex-column'>
                                    <label>Định dạng khoảng trắng</label>
                                    <div className='btn-group btn-group-sm'>
                                        <button className='btn btn-secondary' onClick={(e) => {
                                            onChange(e, false);
                                        }} ><i className='fa fa-sm fa-minus' /></button>
                                        <button className='btn btn-light' style={{ width: '50px' }}>{spaces || 0}</button>
                                        <button className='btn btn-secondary' onClick={(e) => {
                                            onChange(e, true);
                                        }} ><i className='fa fa-sm fa-plus' /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <HoverCard.Arrow />
                    </HoverCard.Content>
                </HoverCard.Portal>
            </HoverCard.Root>;
        };
        return <ExtendButton key={'extends_' + item.id} item={item} />;
    }

    getButtons = (item) => {
        const buttons = [];
        if (!this.props.staffView && this.props.canEdit) {
            buttons.push(this.renderExtendsButton(item));
            buttons.push(<button key={'item_edit_' + item.id} onClick={(e) => e.preventDefault() || getCongTacItem(item.id, item => this.congTacModal.show(item))(() => { })} title='Chỉnh sửa' data-toggle='tooltip' className='btn btn-primary'>
                <i className='fa fa-pencil-square-o' />
            </button>);
            buttons.push(<a key={'ticket_direct_' + item.id} href={`/user/vpdt/cong-tac/${item.id}?backRoute=${window.location.pathname}`}
                // target='_blank' rel='noreferer noopener noreferrer' 
                title='Xem phiếu đăng ký' data-toggle='tooltip' className='btn btn-info'>
                <i className='fa fa-eye' />
            </a>);
            if (this.getLichPermission().canReadCensorMessages() && item.censorMessages?.length) {
                buttons.push(<button key={'censor_message_' + item.id} onClick={(e) => e.preventDefault() || this.censorModal.show(item)} title='Thông điệp kiểm duyệt' data-toggle='tooltip' className='btn btn'>
                    {item?.censorMessages?.find(i => !i.isResolved) ? <i className='fa fa-gavel text-danger' /> : <i className='fa fa-check-circle-o text-success' />}
                </button>);
            }
            if (item.trangThai == this.trangThaiCongTacItemDict.DANG_KY.id) {
                buttons.push(<button key={'tu-choi_' + item.id} title='Từ chối' className='btn btn-danger' onClick={e => e.preventDefault() || this.declineItem(item
                )}>
                    <i className='fa fa-times' />
                </button>);
            }
            if (item.problems.length && item.problems.some(i => i.level == 'danger')) {
                buttons.push(<ProblemHover onProblemClick={this.onProblemClick} problems={item.problems} item={item} getTaskItem={this.props.getTaskItem} key='nguy_hiem_' button={<button className='btn' onClick={e => e.preventDefault() || this.problemModal.show(item)}>
                    <i className='fa text-danger fa-exclamation' />
                </button>} />);
            } else if (item.problems.length && item.problems.some(i => i.level == 'warning')) {
                buttons.push(<ProblemHover onProblemClick={this.onProblemClick} problems={item.problems} item={item} getTaskItem={this.props.getTaskItem} key='nguy_hiem_' button={
                    <button key={'canh_bao_' + item.id} title='Cảnh báo' className='btn' onClick={e => e.preventDefault() || this.problemModal.show(item)}>
                        <i className='fa text-warning fa-exclamation-triangle' />
                    </button>} />);
            }
        } else {
            if (this.getLichPermission().canAddCensorMessages()) {
                buttons.push(<button key={'censor_message_' + item.id} onClick={(e) => e.preventDefault() || this.censorModal.show(item)} title='Thông điệp kiểm duyệt' data-toggle='tooltip' className='btn btn'>
                    {(!item?.censorMessages || !item.censorMessages.length) ? <i className='fa fa-question text-danger' /> : item?.censorMessages?.find(i => !i.isResolved) ? <i className='fa fa-gavel text-danger' /> : <i className='fa fa-check-circle-o text-success' />}
                </button>);
            }
            buttons.push(<button key={'item_view_' + item.id} onClick={(e) => e.preventDefault() || window.open(`/user/vpdt/cong-tac/${item.id}?backRoute=${window.location.pathname}`, '_blank')} title='Xem thông tin công tác' data-toggle='tooltip' className='btn btn-primary'>
                <i className='fa fa-eye' />
            </button>);
        }

        return buttons;
    }

    renderTrangThai(item) {
        return <StatusComponent objectType='congTacItem' reload={this.props.getData} canEdit={this.getCongTacItemPermissionChecker(item).isHcthManager()} id={item?.id} trangThai={item?.trangThai}>
            {super.renderTrangThai(item)}
        </StatusComponent>;
    }

    getData = () => {
        if (!this.getLichPermission().isHcthManager()) {
            return this.props.list;
        }
        const available = this.trangThaiCongTacItem.filter(trangThaiObject => this['status_' + trangThaiObject.id]?.value()).map(i => i.id);
        return this.props.list.filter(i => available.includes(i.trangThai));
    }

    renderStateFilter = () => {
        return <div className='col-md-12 d-flex justify-content-end align-items-center mb-2' style={{ gap: 10 }}>
            {this.trangThaiCongTacItem.map(trangThaiObject => {
                return <FormCheckbox key={trangThaiObject.id} value={trangThaiObject.defaultFilter} ref={e => this['status_' + trangThaiObject.id] = e} label={trangThaiObject.text} onChange={() => this.setState({})} />;
            })}
        </div>;
    }

    render() {
        return <div className='tile-body row'>
            <div className='col-md-12 d-flex justify-content-between align-items-center mb-2' >
                <p className='tile-title'> <i className='fa fa-list' />Danh sách lịch công tác/làm việc</p>
                {this.getLichPermission().isEditable() && <button className='btn btn-success' onClick={(e) => e.preventDefault() || this.congTacModal.show()}><i className='fa fa-plus' />Tạo</button>}
            </div>
            {this.getLichPermission().isHcthManager() && this.renderStateFilter()}
            <div className='col-md-12'>
                {this.renderShortTable()}
            </div>
            <CensorModal ref={e => this.censorModal = e} reRender={() => this.setState({})} />
            <ProblemModal onProblemClick={this.onProblemClick} ref={e => this.problemModal = e} getTaskItem={this.props.getTaskItem} />
            <ChonPhongHopModal ref={e => this.chonPhongModal = e} getPageModals={this.getModals} />
            <CongTacModal ref={e => this.congTacModal = e} lichId={this.getLichItem()?.id} openOnDone getPageModals={this.getModals} backRoute={window.location.pathname} minDate={this.props.minDate} maxDate={this.props.maxDate} />
        </div>;
    }
}

const CongTacList = connect(mapStateToProps, {}, false, { forwardRef: true })(_CongTacList);

class _TicketList extends TicketPage {
    state = { adding: false }
    componentDidMount() { }

    getItemButtons = (item) => {
        return <>
            <button className='btn btn-primary' onClick={(e) => e.preventDefault() || window.open(`/user/vpdt/cong-tac/dang-ky/${item.id}?backRoute=${window.location.pathname}`, '_blank')}><i className='fa fa-eye' /></button>
            { }
        </>;
    }

    onAddTicket = () => {
        const ticketId = this.ticketSelector.value();
        if (!ticketId) {
            return T.alert('Vui lòng chọn phiếu', 'danger');
        }
        addTicketToLich(this.getLichItem()?.id, ticketId, () => window.location.reload())();
    }

    render() {
        return <div className='tile-body row'>
            {this.getLichPermission().isEditable() && <div className='col-md-12 mb-2 d-flex justify-content-between align-items-center' style={{ gap: 10 }}>
                <h3 className='tile-header'>Danh sách phiếu đăng ký</h3>
                <div className='d-flex justify-content-center align-items-center' style={{ gap: 10 }}>
                    <button className={'btn btn-success'} type='button' onClick={() => this.modal.show({})}><i className='fa fa-lg fa-plus' />Thêm</button>
                </div>
            </div>}
            <div className='col-md-12'>
                {this.renderTicketTable(this.props.list, 1, 500)}
            </div>
            <AddTicketModal ref={e => this.modal = e} lichId={this.props.lichId} />
        </div>;
    }
}

const TicketList = connect(mapStateToProps, {}, false, { forwardRef: true })(_TicketList);

class CompilePage extends BaseCongTac {
    state = { searching: false, loaiDonVi: [], filter: {} };

    componentDidMount() {
        T.ready(this.getSiteSetting().readyUrl, this.onDomReady);
    }

    onDomReady = () => {
        const { routeMatcherUrl } = this.getSiteSetting();
        const params = T.routeMatcher(routeMatcherUrl).parse(window.location.pathname);
        this.setState({
            id: params.id,
        }, () => {
            this.getData();
            if (this.state.id) {
                //TODO: Long
                // setTimeout(() => this.props.readNotification(this.state.id), 2000);
            }
        });
    }

    setData = item => {
        this.setState({ item }, () => {
            this.dateRangeText.value(item.batDau, item.ketThuc);
            this.dateRange.value(item.batDau, item.ketThuc);
            this.nguoiTao.value(item.nguoiTao);
            this.ghiChu.value(item.ghiChu || '');
            this.kiemDuyetBoi.value(item.kiemDuyetBoi || '');
        });
    }

    getData = () => {
        this.props.getLich(this.state.id, this.setData);
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
            routeMatcherUrl: '/user/hcth/cong-tac/tong-hop/:id',
        };
    }

    getSiteSetting = () => {
        const pathName = window.location.pathname;
        if (pathName.startsWith('/user/hcth'))
            return {
                readyUrl: '/user/hcth',
                routeMatcherUrl: '/user/hcth/cong-tac/tong-hop/:id',
                breadcrumb: [
                    <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                    <Link key={1} to='/user/hcth/cong-tac'>Quản lý đăng ký công tác</Link>,
                    'Lịch công tác'
                ],
                backRoute: '/user/hcth/cong-tac'
            };
        else {
            if (!this.state.staffView) this.setState({ staffView: true });
            return {
                routeMatcherUrl: '/user/vpdt/lich-cong-tac/:id',
                readyUrl: '/user/van-phong-dien-tu',
                breadcrumb: [
                    <Link key={0} to='/user/van-phong-dien-tu'>...</Link>,
                    <Link key={1} to='/user/vpdt/lich-cong-tac'>Lịch công tác</Link>,
                    'Thông tin công tác'
                ],
                backRoute: '/user/vpdt/lich-cong-tac'
            };
        }
    }

    getTaskItem = (id) => {
        return this.getItems()?.find(i => i.id == id);
    }

    getItems = () => {
        let list = [];
        list.push(...(this.state.item?.ticketItems?.flatMap(i => i.congTacItems) || []));

        (this.state.item?.directTasks?.length && list.push(...this.state.item?.directTasks));
        list?.sort((a, b) => {
            const value = a.batDau - b.batDau;
            if (value != 0) return value;
            return a.id - b.id;
        });
        if (!list) return list;
        if (this.state.staffView) {
            list = list.filter(i => i.trangThai != this.trangThaiCongTacItemDict.TU_CHOI.id);
        }
        if (this.state.filter.batDau) {
            list = list.filter(i => i.batDau >= this.state.filter.batDau.getTime());
        }
        if (this.state.filter.ketThuc) {
            list = list.filter(i => i.ketThuc <= this.state.filter.ketThuc.getTime());
        }
        return list;
    }

    sendRequest = (items) => {
        T.confirm('Cảnh báo', `Xác nhận gửi kiểm duyệt lịch công tác tới ${items.map(i => `${i.ho} ${i.ten}`).join(', ')}`, true, (confirm) => {
            confirm && this.props.requestLich(this.state.item.id, items.map(i => i.shcc), () => {
                this.getData();
                this.submitModal.hide();
            });
        });
    }

    onPublish = (e) => {
        e.preventDefault();
        T.confirm('Cảnh báo', 'Xác nhận phát hành lịch công tác', true, (confirm) => {
            confirm && this.props.publishLich(this.state.item.id, this.getData);
        });
    }

    onApprove = (e) => {
        e.preventDefault();
        T.confirm('Cảnh báo', 'Xác nhận duyệt lịch công tác', true, (confirm) => {
            confirm && this.props.censorLich(this.state.item.id, 1, null, null, this.getData);
        });
    }

    onNotification = (e) => {
        e.preventDefault();
        T.confirm('Cảnh báo', 'Hệ thống sẽ gửi email thông báo đến các tài khoản đơn vị và các cán bộ liên quan', true, (confirm) => {
            confirm && this.props.notifyUsers(this.state.item.id);
        });
    }

    onRevoke = (e) => {
        e.preventDefault();
        T.confirm('Cảnh báo', 'Hệ thống sẽ thu hồi lịch', true, (confirm) => {
            confirm && this.props.revokeLich(this.state.item.id);
        });
    }

    onDecline = (e) => {
        e.preventDefault();
        swal({ // eslint-disable-line
            title: 'Cập nhật lịch công tác',
            text: 'Xác nhận từ chối lịch công tác?',
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
                this.props.censorLich(this.state.item.id, 0, 1, lyDo, () => this.getData());
            }
        });
    }

    getButtons = () => {
        const permission = this.getLichPermission();
        return <>
            {permission.isRequestable() && <button className='btn btn-primary' type='button' onClick={() => this.submitModal.show(this.state.item.danhSachCanBoKiemDuyet)}><i className='fa fa-lg fa-paper-plane' />
                Gửi kiểm duyệt
            </button>}
            <a className='btn btn-primary' download href={'/api/hcth/cong-tac/lich/download/' + this.state.id}><i className='fa fa-lg fa-file-word-o' /></a>
            <a className='btn btn-danger' target='_blank' href={'/api/hcth/cong-tac/lich/download/' + this.state.id + '?type=pdf'} rel='noreferrer'><i className='fa fa-lg fa-file-pdf-o' /></a>
            {permission.isCensorable() && <>
                <button className='btn btn-danger' onClick={this.onDecline}><i className='fa fa-lg fa-times' />
                    Từ chối
                </button>
                <button className='btn btn-success' onClick={this.onApprove}><i className='fa fa-lg fa-check' />
                    Duyệt
                </button>
            </>}
            {permission.isRevokable() && <button className='btn btn-danger' onClick={this.onRevoke}><i className='fa fa-lg fa-refresh' />
                Thu hồi
            </button>}
            {permission.canNotifyLich() && <button className='btn btn-success' onClick={this.onNotification}><i className='fa fa-lg fa-bullhorn ' />
                Thông báo
            </button>}
            {permission.isPublishable() && <button className='btn btn-success' onClick={this.onPublish}><i className='fa fa-lg fa-paper-plane' />
                Phát hành
            </button>}
            {permission.isEditable() && <button className='btn btn-priamry' onClick={() => this.reportModal.show(this.state.item)}><i className='fa fa-lg fa-pecil-square-o' />
                Chỉnh sửa
            </button>}
        </>;
    }

    render() {
        const
            { breadcrumb, backRoute } = this.getSiteSetting(),
            buttons = [];

        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Tổng hợp phiếu đăng ký công tác',
            breadcrumb,
            content: <>
                <div className='row pb-2'>
                    <div className='col-md-12 d-flex flex-row flex-wrap justify-content-center' style={{ gap: 20 }}>
                        <div className='tile d-flex flex-column' style={{ flex: 1 }}>
                            <h4 className='tile-title'>Thông tin lịch công tác</h4>
                            <div className='tile-body row'>
                                <EasePicker.EaseDateRangePicker label='Thời gian đăng ký' ref={e => this.dateRangeText = e} readOnly className='col-md-12' />
                                <div className='form-group col-md-4'>Trạng thái:
                                    <StatusComponent objectType='lichCongTac' reload={this.getData} canEdit={this.getLichPermission().isHcthManager()} id={this.state.item?.id} trangThai={this.state.item?.trangThai}>
                                        <span className={'text-bold text-' + this.trangThaiLichCongTacDict[this.state.item?.trangThai]?.level}>{this.trangThaiLichCongTacDict[this.state.item?.trangThai]?.text}</span>
                                    </StatusComponent>
                                </div>
                                <FormSelect readOnly className='col-md-8' ref={e => this.nguoiTao = e} label='Cán bộ tổng hợp' data={SelectAdapter_FwCanBoWithDonVi} />
                                <FormSelect readOnly className='col-md-8' ref={e => this.kiemDuyetBoi = e} label='Kiểm duyệt bởi' data={SelectAdapter_FwCanBoWithDonVi} readOnlyEmptyText='Chưa cập nhật' />
                                <FormRichTextBox readOnly className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' />
                                {!this.state.staffView && <>
                                    <div className='list-group col-md-12 pl-4'>
                                        <div className='list-group-item list-group-item-primary font-weight-bold'>Danh sách cán bộ kiểm duyệt:</div>
                                        {this.state.item?.danhSachCanBoKiemDuyet?.map(user => <div key={user.shcc} className='list-group-item'>{`${user.ho} ${user.ten}`}</div>)}
                                    </div>
                                </>}
                            </div>
                            <div className='d-flex flex-column justify-content-end align-items-end' style={{ flex: 1 }}>
                                <div style={{ flex: 1, }}></div>
                                <div className='d-flex justify-content-end align-items-center p-2'>
                                    <div className='d-flex' style={{ gap: 10 }}>
                                        {this.getButtons()}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='' >
                            <div className='d-flex justify-content-center align-items-center'>
                                <EasePicker.EaseDateRangePicker ref={e => this.dateRange = e} inline inputClassName='d-none' minDate={this.state.item?.batDau} maxDate={this.state.item?.ketThuc} withTime onChange={(batDau, ketThuc) => {
                                    this.setState({ filter: { batDau, ketThuc } });
                                }} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='tile'>
                    <h4 className='tile-title'>Lưu ý</h4>
                    <div className='tile-body'>
                        <LuuY id={this.state.id} />
                    </div>
                </div>
                <div className='tile-body row' >
                    <div className='col-md-12'>
                        <ul className='nav nav-tabs'>
                            <li className='nav-item'>
                                <a className='nav-link active show' data-toggle='tab' href='#lichCongTac'>Lịch công tác</a>
                            </li>
                            {!this.state.staffView && <li className='nav-item'>
                                <a className='nav-link ' data-toggle='tab' href='#phieuDangKy'>Danh sách phiếu đăng ký</a>
                            </li>}
                        </ul>
                    </div>
                </div>
                <div className='tab-content tile' style={{ overflowY: 'auto' }}>
                    <div className='tab-pane fade active show' id='lichCongTac'>
                        <CongTacList getData={this.getData} lich={this.getLichItem()} canEdit={this.getLichPermission().isEditable()} shcc={this.getShcc()} staffView={this.state.staffView} list={this.getItems()} minDate={this.state.item?.batDau ? new Date(this.state.item?.batDau) : null} maxDate={this.state.item?.ketThuc ? new Date(this.state.item?.ketThuc) : null} getTaskItem={this.getTaskItem} />
                    </div>
                    {!this.staffView && <div className='tab-pane fade' id='phieuDangKy'>
                        <TicketList list={this.state.item?.ticketItems} lichId={this.state.id} />
                    </div>}
                </div>
                <ReportModal ref={e => this.reportModal = e} />
                <SubmitModal ref={e => this.submitModal = e} submit={this.sendRequest} />
                <HcthCongTacTicketModal ref={e => this.ticketModal = e} congTacTicketId={this.state.id} />
            </>,
            backRoute,
            buttons,
        });
    }
}

const mapActionsToProps = { getLich, requestLich, censorLich, publishLich, notifyUsers, revokeLich };
export default connect(mapStateToProps, mapActionsToProps)(CompilePage);
