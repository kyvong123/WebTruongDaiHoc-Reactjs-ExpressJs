import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { BaseCongTac, DeclineModal, ChonPhongHopModal, CongTacListComponent, CongTacModal, EasePicker, ReportModal, TicketModal, TicketPage, LichPreview } from './components';
import { getCongTacTicketPage, censorTicket, getCongTacTicket, declineItem } from './redux/congTac';
import { getLichCongTacPage } from './redux/lichCongTac';
import T from 'view/js/common';
import { FormCheckbox, TableCell, renderTable } from 'view/component/AdminPage';
import moment from 'moment';

/**TODO
 * cải thiện giao diện chị Trinh
 * read notification
 */

const mapStateToProps = state => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });

class CongTacList extends CongTacListComponent {
    getButtons = (item) => {
        const buttons = [];
        if (item.trangThai == this.trangThaiCongTacItemDict.DANG_KY.id) {
            buttons.push(<button key={'tu-choi_' + item.id} title='Từ chối' className='btn btn-danger' onClick={e => e.preventDefault() || this.declineItem(item
            )}>
                <i className='fa fa-times' />
            </button>);
        }
        return buttons;
    }


    declineItem = (item) => {
        T.confirm('Từ chối sự kiện', `Từ chối sự kiện '${item.ten}'`, true, confirm => {
            confirm && declineItem(item.id, this.props.reload)();
        });
    }

    render() {
        return <div className=''>
            {this.renderShortTable()}
            <ChonPhongHopModal ref={e => this.chonPhongModal = e} getPageModals={this.getModals} />
            <CongTacModal ref={e => this.congTacModal = e} congTacTicketId={this.getTicketItem()?.id} openOnDone getPageModals={this.getModals} minDate={this.props.minDate} maxDate={this.props.maxDate} />
        </div>;
    }
}

class RowExpansion extends BaseCongTac {
    componentDidMount() {
        this.getData();
    }

    getData = () => {
        getCongTacTicket(this.props.id, (item) => this.setState({ item }))(() => null);
    }

    render() {
        return <tr>
            <td style={{ padding: '20' }} colSpan={8}>
                <CongTacList reload={this.getData} isEditable={this.checkAddPermission} list={this.state.item?.congTacItems} minDate={this.state.item?.batDau ? new Date(this.state.item?.batDau) : null} maxDate={this.state.item?.ketThuc ? new Date(this.state.item?.ketThuc) : null} />
            </td>
        </tr>;
    }
}

class AdminCongTacTicketPage extends TicketPage {
    state = { searching: false, loaiDonVi: [], previewItem: '' };

    componentDidMount() {
        T.ready('/user/hcth', () => {
            this.onDomReady();
            this.getLichPage(0, 100);
        });
    }

    getSiteSetting = () => {
        return {
            readyUrl: '/user/hcth',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                'Quản lý đăng ký công tác',
            ],
            backRoute: '/user/hcth',
            baseUrl: '/user/hcth/cong-tac/dang-ky',
        };
    }

    getPage = (pageN, pageS, pageC, done) => {
        const [batDau, ketThuc] = this.dateRange.value();
        this.props.getCongTacTicketPage(pageN, pageS, pageC, { ...this.state.filter, batDau: batDau?.getTime(), ketThuc: ketThuc?.getTime() }, (page) => this.setState({ loading: false }, () => done && done(page)));
    }

    getLichPage = (pageN, pageS, pageC, done) => {
        this.props.getLichCongTacPage(pageN, pageS, pageC, { isAdmin: 1 }, (page) => this.setState({ loading: false }, () => done && done(page)));
    }

    clearAdvanceSearch = (e) => {
        e.preventDefault();
        this.changeAdvancedSearch();
    }

    renderExtraRow = (item) => {
        return this.state.previewItem == item.id ? <RowExpansion key={item.id} id={item.id} /> : null;
    }

    getItemButtons = (item) => {
        return <>
            <button className='btn btn-primary' type='button' onClick={() => {
                this.setState({ previewItem: this.state.previewItem == item.id ? '' : item.id });
            }}>
                <i className={this.state.previewItem == item.id ? 'fa fa-angle-up' : 'fa fa-angle-down'} />
            </button>
            <button className='btn btn-info' onClick={(e) => {
                e.preventDefault();
                window.open('/user/vpdt/cong-tac/dang-ky/' + item.id, '_blank');
            }}>
                <i className='fa fa-eye' />
            </button>
            {item.trangThai == this.trangThaiCongTacTicketDict.DA_GUI.id && <button className='btn btn-success' data-toggle='tooltip' title='tiếp nhận' onClick={(e) => {
                e.preventDefault();
                T.confirm('Cảnh báo', `Tiếp nhận phiếu đăng ký công tác từ ${moment(new Date(item.batDau)).format('DD/MM/YYYY')} đến ${moment(new Date(item.ketThuc)).format('DD/MM/YYYY')} của ${item.tenNguoiTao?.normalizedName()}`, true, confirm => confirm && this.props.censorTicket(item.id, 1, 0, '', () => this.changeAdvancedSearch()));
            }}>
                <i className='fa fa-check' />
            </button>}
            {item.trangThai == this.trangThaiCongTacTicketDict.DA_GUI.id && <button className='btn btn-danger' data-toggle='tooltip' title='từ chối' onClick={(e) => {
                e.preventDefault();
                this.declineModal.show(item);
            }}>
                <i className='fa fa-times' />
            </button>}
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
                                    <button className="btn btn-primary" data-toggle='tooltip' title='Truy cập lịch' onClick={() => window.open(`/user/hcth/cong-tac/tong-hop/${item.id}`, '_blank')}>
                                        <i className='fa fa-lg fa-eye' />
                                    </button>
                                }
                            </TableCell>
                        </tr>
                    );
                }
            })}
            <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                getPage={this.getPage} />
        </>;
    }

    render() {
        const
            { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list = null } = this.props.hcthCongTac?.ticketPage || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null },
            { breadcrumb, backRoute } = this.getSiteSetting(),
            buttons = [];

        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Quản lý đăng ký công tác',
            breadcrumb,
            content: <>
                <ReportModal ref={e => this.reportModal = e} />
                <div className='tile-body row' >
                    <div className='col-md-12'>
                        <ul className='nav nav-tabs'>
                            <li className='nav-item'>
                                <a className='nav-link' data-toggle='tab' href='#phieuDangKy'>Phiếu đăng ký công tác</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link ' data-toggle='tab' href='#lichCongTac'>Lịch công tác</a>
                            </li>
                            <li className='nav-item'>
                                <a className='nav-link active show' data-toggle='tab' href='#CongTacList'>Các sự kiện</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className='tab-content tile' style={{ overflowY: 'auto', height: '80vh' }}>
                    <div className='tab-pane fade' id='phieuDangKy'>
                        <div className='tile-body row'>
                            <div className="col-md-12 d-flex mb-2 justify-content-between align-items-center">
                                <div className='d-flex align-items-center' style={{ gap: 10 }}>
                                    <button className='btn btn-primary' onClick={this.tongHop}>
                                        <i className='fa fa-lg fa-cog' /> Tổng hợp các phiếu đăng ký
                                    </button>
                                    {this.trangThaiCongTacTicket.filter(i => i.adminFilter).map(i => {
                                        return <FormCheckbox key={i.id} value={i.defaultAdminFilter} ref={e => this[i.id] = e} label={i.text} onChange={() => this.changeAdvancedSearch()} />;
                                    })}
                                </div>
                                <EasePicker.EaseDateRangePicker ref={e => this.dateRange = e} placeholder={'Khoảng thời gian'} inputClassName='m-0 p-0 pl-2' className='m-0 p-0 d-flex align-items-center' middleWare={(start, end) => {
                                    start.setHours(0, 0, 0, 0);
                                    end.setHours(23, 59, 59, 999);
                                    return [start, end];
                                }} onChange={() => this.changeAdvancedSearch()} style={{ width: '350px' }} />
                            </div>
                            <div className='col-md-12'>
                                {this.renderTicketTable(list, pageNumber, pageSize, true)}
                            </div>
                        </div>
                        <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                            getPage={this.getPage} />
                    </div>
                    <div className='tab-pane ' id='lichCongTac'>
                        <div className='tile-body row'>
                            <div className='col-md-12'>
                                {this.renderLichTable()}
                            </div>
                        </div>
                    </div>
                    <div className='tab-pane active show' id='CongTacList'>
                        <div className='tile-body row'>
                            <LichPreview declineModal={this.declineModal} />
                        </div>
                    </div>
                </div>
                <DeclineModal ref={e => this.declineModal = e} submitCallback={() => {
                    this.changeAdvancedSearch();
                    this.declineModal.hide();
                }} />
                <TicketModal ref={e => this.ticketModal = e} />
            </>,
            backRoute,
            buttons,
            onCreate: () => {
                this.ticketModal.show();
            }
        });
    }
}


const mapActionsToProps = { getCongTacTicketPage, getLichCongTacPage, censorTicket };
export default connect(mapStateToProps, mapActionsToProps)(AdminCongTacTicketPage);
