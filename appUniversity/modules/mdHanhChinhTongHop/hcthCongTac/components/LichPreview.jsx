import * as HoverCard from '@radix-ui/react-hover-card';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { declineItem, getCongTacItem, update, censorTicket } from '../redux/congTac';
import { censorLich, getLich, notifyUsers, publishLich, requestLich } from '../redux/lichCongTac';
import BaseCongTac, { BaseCongTacModal } from './BaseCongTac';
import ChonPhongHopModal from './ChonPhongHopModal';
import { CongTacListComponent } from './CongTacList';
import CongTacModal from './CongTacModal';
import DeclineModal from './DeclineModal';
import moment from 'moment';

const mapStateToProps = state => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });

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

    getCongTacItemClassName = (item) => {
        if (item.congTacTicketId == this.props.highlightTicket)
            return 'table-success';
        else return '';
    }

    declineItem = (item) => {
        T.confirm('Từ chối sự kiện', `Từ chối sự kiện '${item.ten}'`, true, confirm => {
            confirm && declineItem(item.id)();
        });
    }

    renderExtendsButton = (item) => {
        const setHighlightTicket = this.props.setHighlightTicket;
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
                                <div className='list-group-item list-group-item-action d-flex align-items-center' style={{ gap: 10 }} onClick={(e) => e.preventDefault() || setHighlightTicket(item)}>
                                    <i className='fa fa-lightbulb-o' /> <span>Đánh dấu phiếu này</span>
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

    render() {
        return <div className='tile-body row'>
            <div className='col-md-12'>
                {this.renderShortTable()}
            </div>
            <ProblemModal onProblemClick={this.onProblemClick} ref={e => this.problemModal = e} getTaskItem={this.props.getTaskItem} />
            <ChonPhongHopModal ref={e => this.chonPhongModal = e} getPageModals={this.getModals} />
            <CongTacModal onSuccess={() => {
                this.props.reload();
                this.congTacModal.hide();
            }} ref={e => this.congTacModal = e} lichId={this.getLichItem()?.id} openOnDone getPageModals={this.getModals} backRoute={window.location.pathname} minDate={this.props.minDate} maxDate={this.props.maxDate} />
        </div>;
    }
}

const CongTacList = connect(mapStateToProps, {}, false, { forwardRef: true })(_CongTacList);

class EventPreviewList extends BaseCongTac {
    state = { searching: false, loaiDonVi: [], filter: {}, highLighting: null };

    componentDidMount() {
        this.getData();
    }

    getItems = () => {
        const items = this.state.tasks;
        if (!items) return items;
        items.sort((a, b) => {
            const value = a.batDau - b.batDau;
            if (value != 0) return value;
            return a.id - b.id;
        });
        return items;
    }

    getData = () => {
        getLich('preview', (_, tasks, tickets) => this.setState({ tasks, tickets }))(() => { });
    }

    getTaskItem = (id) => {
        return this.state.tasks?.find(i => i.id == id);
    }

    renderTickets = () => {
        let items = this.state.tickets || [];
        if (!items.length) {
            return 'Chưa có phiếu được đăng ký';
        } else {
            return <div className='list-group' style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {items.map((item) => {
                    return <div key={item.id} id={item.id} className='list-group-item list-group-item-active d-flex'>
                        <div className='d-flex flex-column' style={{ flex: 1 }}>
                            <span>{item.nguoiTaoItem.ho} {item.nguoiTaoItem.ten}</span>
                            <span className={`text-${this.trangThaiCongTacTicketDict[item.trangThai]?.level}`}>{this.trangThaiCongTacTicketDict[item.trangThai]?.text}</span>
                            <div style={{ width: '100%', textAlign: 'right' }}>
                                {this.getTicketButtons(item)}
                            </div>
                        </div>
                    </div>;
                })}
            </div>;
        }
    }

    getTicketButtons = (item) => {
        return <div className='btn-group btn-group-sm d-flex'>
            <button className={'btn btn-' + (this.state.highLighting == item.id ? 'warning' : 'light')} onClick={() => {
                this.setState({ highLighting: this.state.highLighting == item.id ? '' : item.id });
            }}>
                <i className='fa fa-sm fa-lightbulb-o' />
            </button>
            <div style={{ flex: 1 }} />
            <button className='btn btn-info' onClick={(e) => {
                e.preventDefault();
                window.open('/user/vpdt/cong-tac/dang-ky/' + item.id, '_blank');
            }}>
                <i className='fa fa-eye' />
            </button>
            {item.trangThai == this.trangThaiCongTacTicketDict.DA_GUI.id && <button className='btn btn-success' data-toggle='tooltip' title='tiếp nhận' onClick={(e) => {
                e.preventDefault();
                T.confirm('Cảnh báo', `Tiếp nhận phiếu đăng ký công tác từ ${moment(new Date(item.batDau)).format('DD/MM/YYYY')} đến ${moment(new Date(item.ketThuc)).format('DD/MM/YYYY')} của ${`${item.nguoiTaoItem.ho} ${item.nguoiTaoItem.ten}`.normalizedName()}`, true, confirm => confirm && this.props.censorTicket(item.id, 1, 0, '', () => this.changeAdvancedSearch()));
            }}>
                <i className='fa fa-check' />
            </button>}
            {item.trangThai == this.trangThaiCongTacTicketDict.DA_GUI.id && <button className='btn btn-danger' data-toggle='tooltip' title='từ chối' onClick={(e) => {
                e.preventDefault();
                this.declineModal.show(item);
            }}>
                <i className='fa fa-times' />
            </button>}
        </div>;
    }

    render() {
        return <>
            <div className='col-md-12 d-flex justify-content-end'>
                <button className='btn btn-light' type='button' onClick={() => this.getData()}><i className='fa fa-rotate-left' /></button>
            </div>
            <div className='col-md-3 p-2 pl-3' >
                {this.renderTickets()}
            </div>
            <div className='col-md-9 p-2' style={{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }}>
                <CongTacList highlightTicket={this.state.highLighting} canEdit staffView={false} list={this.getItems()} getTaskItem={this.getTaskItem} reload={this.getData} setHighlightTicket={(item) => this.setState({ highLighting: item.congTacTicketId })} />
            </div>
            <DeclineModal ref={e => this.declineModal = e} submitCallback={() => {
                this.getData();
                this.declineModal.hide();
            }} />
        </>;
    }
}

const mapActionsToProps = { getLich, requestLich, censorLich, publishLich, notifyUsers, censorTicket };
export default connect(mapStateToProps, mapActionsToProps)(EventPreviewList);
