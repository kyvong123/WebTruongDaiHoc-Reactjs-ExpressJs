import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { renderTable, TableCell, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import BaseCongTac, { BaseCongTacModal } from './components/BaseCongTac';
import { EasePicker, FileListComponent } from './components';

// import {  } from './redux/congTac';
import { getPhongHopTicketPage, censorPhongHopTicket } from './redux/phongHopTicket';
import moment from 'moment';
import T from '../../../view/js/common';
import { SelectAdapter_FwCanBoWithDonVi } from '../../mdTccb/tccbCanBo/redux';
import { FormDatePicker, FormTextBox } from '../../../view/component/AdminPage';
import * as HoverCard from '@radix-ui/react-hover-card';
import { SelectAdapter_DmPhongHop } from './redux/phongHop';
import { getCongTacItem } from './redux/congTac';

const weekDays = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật',];

class CongTacAttachmentModal extends BaseCongTacModal {
    onShow = (item) => {
        this.setState({ item, loading: true }, () => {
            getCongTacItem(item.congTacItemId, (item) => {
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

class TrangThaiTicket extends BaseCongTac {
    setData = (item) => {
        setTimeout(() => {
            this.setState({ item }, () => {
                this.canBoKiemDuyet?.value(item.canBoKiemDuyet);
                this.canBoCapNhat?.value(item.canBoCapNhat);
                this.thoiGianCapNhat?.value(item.thoiGianCapNhat);
                this.lyDo?.value(item.lyDo);
            });
        }, 500); // due to openDelay={500}
    }
    render() {
        return <HoverCard.Root openDelay={500} onOpenChange={() => this.setData(this.props.item)}>
            <HoverCard.Trigger asChild>
                <a href='#' className={`text-${this.trangThaiPhongHopTicketDict[this.props.item.trangThai]?.level}`}>{this.trangThaiPhongHopTicketDict[this.props.item.trangThai]?.text}</a>
            </HoverCard.Trigger>
            <HoverCard.Portal>
                <HoverCard.Content sideOffset={5}>
                    <div className="tile" style={{ maxWidth: '50vw', minWidth: '20vw', zIndex: 5000, position: 'sticky' }}>
                        <div className="tile-body row">
                            <FormDatePicker type='time' className='col-md-12' label='Cập nhật lần cuối lúc' ref={e => this.thoiGianCapNhat = e} readOnly />
                            <FormSelect className='col-md-12' data={SelectAdapter_FwCanBoWithDonVi} ref={e => this.canBoCapNhat = e} label='Cập nhật lần cuối bởi' readOnly />
                            {!!this.props.item.canBoKiemDuyet && <FormSelect className='col-md-12' ref={e => this.canBoKiemDuyet = e} data={SelectAdapter_FwCanBoWithDonVi} label='Kiểm duyệt bởi' readOnly />}
                            {!!this.props.item.lyDo && <FormTextBox className='col-md-12' label='Lý do từ chối' ref={e => this.lyDo = e} readOnly />}
                        </div>
                    </div>
                    <HoverCard.Arrow />
                </HoverCard.Content>
            </HoverCard.Portal>
        </HoverCard.Root>;
    }
}

class AdminPhongHopTicketPage extends BaseCongTac {
    state = { searching: false, loaiDonVi: [], isDeleted: false };

    componentDidMount() {
        T.ready(this.getSiteSetting().readyUrl, () => {
            const queryParams = new URLSearchParams(window.location.search);
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.trangThaiPhongHopTicket.forEach(i => this[i.id]);
            this.dateRange.value(new Date().setHours(0, 0, 0, 0));
            this.setState({
                focusItem: queryParams.get('focusItem') || ''
            }, () => {
                this.changeAdvancedSearch(true, () => {
                    this.state.focusItem && this.scrollToItem(this.state.focusItem);
                });
            });
        });
    }

    scrollToItem = () => {
        try {
            this.focusItemRef.scrollIntoView({ block: 'start', behavior: 'smooth' });
        } catch (error) {
            // ignore
            console.error(error);
        }
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


    changeAdvancedSearch = (isInitial = false, done) => {
        let { pageNumber, pageSize } = this.props.hcthCongTac?.phongHopTicketPage || { pageNumber: 1, pageSize: 100 };
        const pageFilter = isInitial ? {} : {};
        pageFilter.trangThai = this.trangThaiPhongHopTicket.filter(i => this[i.id] && this[i.id].value()).map(i => i.id).toString();
        pageFilter.isDeleted = Number(this.isDeleted.value());
        pageFilter.phongHop = this.phongHop.value();
        const [batDau, ketThuc] = this.dateRange.value();
        pageFilter.batDau = batDau?.getTime();
        pageFilter.ketThuc = ketThuc?.getTime();
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                done && done();
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    // if (!$.isEmptyObject(filter) && filter && (filter.donViNhan || filter.canBoNhan)) this.showAdvanceSearch();
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
    unDoDelete = (e, item) => {
        e.preventDefault();
        T.confirm('Phục hồi đăng ký phòng họp', `Phục hồi đăng ký phòng họp ${item.tenPhongHop} bắt đầu lúc ${moment(new Date(item.batDau)).format('HH:mm, DD/MM/YYYY')} đến ${moment(new Date(item.ketThuc)).format('HH:mm, DD/MM/YYYY')}?`, true, isConfirm =>
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


    renderExtendsButton = (item) => {
        const ExtendButton = ({ item }) => {
            return <HoverCard.Root>
                <HoverCard.Trigger asChild>
                    <button className='btn btn-light'><i className='fa fs-sm fa-ellipsis-v' /></button>
                </HoverCard.Trigger>
                <HoverCard.Portal>
                    <HoverCard.Content sideOffset={5}>
                        <div className='row pr-3' style={{ minWidth: '300px', zIndex: 5000, maxWidth: '80vw' }}>
                            <div className='col-md-12 list-group text-dark' style={{}}>
                                <div className='list-group-item list-group-item-action d-flex align-items-center' style={{ gap: 10 }} onClick={(e) => {
                                    e.preventDefault();
                                    this.attachmentModal.show(item);
                                }}>
                                    <i className='fa fa-paperclip' />
                                    <label>Tệp tin đính kèm</label>
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

    renderRow = (list) => {
        const components = [];
        let currentDayInWeek = -1;
        let currentDate = -1;
        let currentPhongHop = 0;
        let resetFlag = true;

        if (list) {
            list.forEach((item, index) => {
                const dayInWeek = (new Date(item.batDau).getDay() + 6) % 7;
                const date = new Date(item.batDau).getDate();
                if (dayInWeek != currentDayInWeek || date != currentDate) {
                    components.push(<tr key={`day-${item.batDau}`} className='table-success'><th colSpan={8} style={{ textAlign: 'center' }}>{<span className='font-weight-bold align-self-center'>{`${weekDays[dayInWeek]}, ngày ${moment(new Date(item.batDau)).format('DD/MM/YYYY')}`}</span>}</th>
                    </tr>);
                    currentDayInWeek = dayInWeek;
                    currentDate = date;
                    resetFlag = true;
                    currentPhongHop = 0;
                } else {
                    resetFlag = false;
                }
                if (index > 0 && (item.phongHop != list[index - 1].phongHop) && !resetFlag) {
                    currentPhongHop += 1;
                }
                const className = currentPhongHop % 2 == 1 ? 'table-primary' : '';
                components.push(this.rowComponent(item, index, item.id == this.state.focusItem && item.trangThai == 'DA_DANG_KY' ? 'table-warning' : className));
            });
        }
        return components;
    }

    rowComponent = (item, index, className) => {
        return (
            <tr id={item.id} key={index} ref={e => this.state.focusItem && item.id == this.state.focusItem && (this.focusItemRef = e)} className={className}>
                <TableCell type='text' style={{ textAlign: 'right' }} content={item.R} />
                <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                    <div className='d-flex flex-column'>
                        <span>{item.tenNguoiTao?.normalizedName()}</span>
                        <span>{item.tenDonVi}</span>
                    </div>}
                />
                <TableCell type='text' contentClassName='multiple-lines-3' contentStyle={{ width: '100%' }} content={<a href={`/user/vpdt/cong-tac/${item.congTacItemId}`} target='_blank' rel='noreferrer noopener'>{item.ten}</a>} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center', textOverflow: 'ellipsis' }} content={item.tenPhongHop} />
                <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center', color: 'blue' }} content={
                    <div className='d-flex flex-column'>
                        <span className='text-primary'>{moment(new Date(item.batDau)).format('HH:mm, DD/MM/YYYY')}</span>
                        <span className='text-danger'>{moment(new Date(item.ketThuc)).format('HH:mm, DD/MM/YYYY')}</span>
                    </div>}
                />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={moment(new Date(item.thoiGianTao)).format('HH:mm, DD/MM/YYYY')} />
                <TableCell type='text' content={<TrangThaiTicket item={item} />} style={{ whiteSpace: 'nowrap' }} />


                <TableCell type='buttons' style={{ textAlign: 'right' }} content={item} permission={{}}>

                    {!item.isDeleted ? <>
                        {item.trangThai == 'DA_DANG_KY' && <>
                            <Tooltip title='Từ chối' arrow>
                                <button className='btn btn-danger' onClick={(e) => this.decline(e, item)}><i className='fa fa-lg fa-times' /></button>
                            </Tooltip>
                            <Tooltip title='Duyệt' arrow>
                                <button className='btn btn-success' onClick={(e) => this.approve(e, item)}><i className='fa fa-lg fa-check' /></button>
                            </Tooltip>
                        </>}
                        <Tooltip title='Xóa' arrow>
                            <button className='btn btn-danger' onClick={(e) => this.delete(e, item)}><i className='fa fa-lg fa-trash' /></button>
                        </Tooltip>
                    </> : <>
                        <Tooltip title='Phục hồi' arrow>
                            <button className='btn btn-warning' onClick={(e) => this.unDoDelete(e, item)}><i className='fa fa-lg fa-undo' /></button>
                        </Tooltip>
                    </>}
                    {this.renderExtendsButton(item)}
                </TableCell>
            </tr>
        );
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
            loadingClassName: 'd-flex justify-content-center align-items-center',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tạo bởi</th>
                    <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Nội dung</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phòng họp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đăng ký lúc</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: this.renderRow(list)
        });

        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Quản lý đăng ký phòng họp',
            breadcrumb,
            content: <>
                <div className='tile'>
                    <div className='tile-body row'>
                        <div className='col-md-12 d-flex align-items-center mb-2' style={{ gap: 20 }}>
                            {this.trangThaiPhongHopTicket.filter(i => i.allowFilter).map(i => {
                                return <FormCheckbox key={i.id} value={true} ref={e => this[i.id] = e} label={i.text} onChange={() => this.changeAdvancedSearch()} />;
                            })}
                            <FormCheckbox ref={e => this.isDeleted = e} label='Đã xóa' onChange={() => this.changeAdvancedSearch()} />
                            <FormSelect allowClear ref={e => this.phongHop = e} data={SelectAdapter_DmPhongHop} style={{ width: '200px' }} onChange={() => this.changeAdvancedSearch()} label={'Phòng họp'} />
                            <EasePicker.EaseDateRangePicker ref={e => this.dateRange = e} placeholder={'Khoảng thời gian'} middleWare={(start, end) => {
                                start.setHours(0, 0, 0, 0);
                                end.setHours(23, 59, 59, 999);
                                return [start, end];
                            }} onChange={(batDau, ketThuc) => this.setState({ batDau, ketThuc }, this.changeAdvancedSearch)} style={{ width: '400px' }} label={'chọn thời gian'} />
                            <a className='btn btn-success' download='LICH_DANG_KY_PHONG_HOP' href={'/api/hcth/cong-tac/phong-hop-ticket/download?' + T.objectToQueryString({ filter: this.state.filter })} target='_blank' rel='noreferrer'><i className='fa fa-lg fa-download' />Tải xuống</a>
                        </div>
                        <div className='col-md-12'>
                            {table}
                        </div>
                    </div>
                </div>
                <CongTacAttachmentModal ref={e => this.attachmentModal = e} />
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
