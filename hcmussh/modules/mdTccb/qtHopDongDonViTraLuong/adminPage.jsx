import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormCheckbox, FormDatePicker, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { createQtHopDongDvtl, deleteQtHopDongDvtl, downloadWord, getQtHopDongDvtlAll, getQtHopDongDvtlGroupPage, getQtHopDongDvtlPage, updateQtHopDongDvtl } from './redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';

class QtHopDongDvtlPage extends AdminPage {
    checked = parseInt(T.cookie('hienThiTheoCanBo')) == 1 ? true : false;
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                let filterCookie = T.getCookiePage('pageQtHopDongDvtl', 'F'),
                    { fromDate = '', toDate = '' } = filterCookie;
                this.fromDate.value(fromDate);
                this.toDate.value(toDate);
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            if (this.checked) {
                this.hienThiTheoCanBo.value(true);
            }
            this.getPage();
            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.qtHopDongDvtl && this.props.qtHopDongDvtl.page ? this.props.qtHopDongDvtl.page : { pageNumber: 1, pageSize: 50, pageCondition: {} };

        if (pageCondition && typeof pageCondition == 'string') T.setTextSearchBox(pageCondition);
        let fromDate = null;
        if (this.fromDate.value()) {
            fromDate = this.fromDate.value();
            fromDate.setHours(0, 0, 0, 0);
            fromDate = fromDate.getTime();
        }
        let toDate = null;
        if (this.toDate.value()) {
            toDate = this.toDate.value();
            toDate.setHours(23, 59, 59, 999);
            toDate = toDate.getTime();
        }
        const pageFilter = isInitial || isReset ? {} : { fromDate, toDate };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    const filterCookie = T.getCookiePage('pageQtHopDongDvtl', 'F');
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });

                    this.fromDate.value(filter.fromDate || filterCookie.fromDate || '');
                    this.toDate.value(filter.toDate || filterCookie.toDate || '');
                    if (this.fromDate.value() || this.toDate.value()) this.showAdvanceSearch();
                } else if (isReset) {
                    this.fromDate.value('');
                    this.toDate.value('');
                }
            });
        });
    };

    getPage = (pageN, pageS, pageC, done) => {
        if (this.checked) this.props.getQtHopDongDvtlGroupPage(pageN, pageS, pageC, this.state.filter, done);
        else this.props.getQtHopDongDvtlPage(pageN, pageS, pageC, this.state.filter, done);
    };

    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
        this.getPage();
    };

    downloadWord = (item) => {
        downloadWord(item.id, (data) => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), item.shcc + '_hopdong.docx');
        });
    };

    list = (text, i, j) => {
        if (i == 0 || text == ' ') return [];
        let deTais = text.split('??').map((str) => (
            <div key={i--}>
                Lần {j - i}: <b>{T.dateToText(Number(str.slice(0, -1)), 'dd/mm/yyyy')}</b>
                <br/>
            </div>
        ));
        return deTais;
    };

    delete = (e, item) => {
        T.confirm('Xóa hợp đồng', 'Bạn có chắc bạn muốn xóa hợp đồng này?', 'warning', true, (isConfirm) => {
            isConfirm &&
            this.props.deleteQtHopDongDvtl(item.id, (error) => {
                if (error) T.notify(error.message ? error.message : 'Xoá hợp đồng bị lỗi!', 'danger');
                else T.alert('Xoá hợp đồng thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    };

    render() {
        const permission = this.getUserPermission('qtHopDongDvtl', ['read', 'write', 'delete', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (this.props.qtHopDongDvtl && this.props.qtHopDongDvtl.pageGr ? this.props.qtHopDongDvtl.pageGr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list }) : this.props.qtHopDongDvtl && this.props.qtHopDongDvtl.page ? this.props.qtHopDongDvtl.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        // let maDonVi = this.curState;
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list,
                stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Số hợp đồng</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>}
                        {!this.checked && <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày tái ký HĐ</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ ký</th>}
                        {this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số HĐ đã ký</th>}
                        {this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Danh sách</th>}
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={(pageNumber - 1) * pageSize + index + 1}/>
                        <TableCell
                            type='text'
                            style={{ whiteSpace: 'nowrap' }}
                            content={
                                <>
                                    <a href={'/user/tccb/qua-trinh/hop-dong-dvtl/' + item.id}>
                                        <span>{(item.hoBenA ? item.hoBenA : '') + ' ' + (item.tenBenA ? item.tenBenA : '')}</span>
                                        <br/>
                                        <span>{item.shcc}</span>
                                    </a>
                                </>
                            }
                        />
                        {!this.checked && (
                            <TableCell
                                type='text'
                                content={
                                    <>
                                        <span style={{ whiteSpace: 'nowrap' }}>Số: {item.soHopDong}</span>
                                        <br/>
                                        <span>
                                            Ngày ký: <span style={{ color: 'blue' }}>{item.ngayKyHopDong ? new Date(item.ngayKyHopDong).ddmmyyyy() : ''}</span>
                                        </span>
                                    </>
                                }
                            />
                        )}
                        {!this.checked && (
                            <TableCell
                                type='text'
                                style={{ textAlign: 'justify' }}
                                content={
                                    item.loaiHopDong != '07' ? (
                                        <p>
                                            <b style={{ whiteSpace: 'nowrap' }}>{item.tenLoaiHopDong?.replace('Hợp đồng lao động', 'Hợp đồng') || ''}</b>
                                            <br/>
                                            <span style={{ whiteSpace: 'nowrap' }}>
                                                Từ ngày: <span style={{ color: 'blue' }}>{item.batDauLamViec ? new Date(item.batDauLamViec).ddmmyyyy() : ''}</span>
                                            </span>
                                            <br/>
                                            <span style={{ whiteSpace: 'nowrap' }}>
                                                Đến ngày: <span style={{ color: 'blue' }}>{item.ketThucHopDong ? new Date(item.ketThucHopDong).ddmmyyyy() : ''}</span>
                                            </span>
                                        </p>
                                    ) : (
                                        <p>
                                            <span>{item.tenLoaiHopDong.replace('Hợp đồng lao động', 'Hợp đồng')}</span>
                                            <br/>
                                        </p>
                                    )
                                }
                            />
                        )}
                        {!this.checked ? (
                            item.loaiHopDong != '07' ? (
                                <TableCell
                                    type='text'
                                    style={{ textAlign: 'center' }}
                                    content={
                                        <>
                                            <span style={{ whiteSpace: 'nowrap', color: 'red' }}>{item.ngayTaiKy ? new Date(item.ngayTaiKy).ddmmyyyy() : ''}</span>
                                        </>
                                    }
                                />
                            ) : (
                                <TableCell/>
                            )
                        ) : null}
                        {!this.checked && (
                            <TableCell
                                style={{ whiteSpace: 'nowrap' }}
                                type='text'
                                content={
                                    <>
                                        <span>
                                            {item.hoNguoiKy ? item.hoNguoiKy + ' ' + item.tenNguoiKy : 'Chưa xác định'}
                                            <br/>
                                        </span>
                                        <Link to={'/user/tccb/staff/' + item.shccNguoiKy}>{item.shccNguoiKy}</Link>
                                    </>
                                }
                            />
                        )}
                        {this.checked && <TableCell style={{ textAlign: 'right' }} content={item.soHd}/>}
                        {this.checked && <TableCell style={{ whiteSpace: 'nowrap' }} content={this.list(item.danhSachHd, item.soHd, item.soHd)}/>}
                        {!this.checked && (
                            <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onEdit={() => (permission.write ? this.props.history.push(`/user/tccb/qua-trinh/hop-dong-dvtl/${item.id}`) : T.notify('Vui lòng liên hệ phòng Tổ chức - Cán bộ!', 'warning'))} onDelete={this.delete}>
                                {permission.export && (
                                    <a href='#' className='btn btn-primary' style={{ width: '45px' }} onClick={(e) => e.preventDefault() || this.downloadWord(item)}>
                                        <i className='fa fa-lg fa-file-word-o'/>
                                    </a>
                                )}
                            </TableCell>
                        )}
                        {this.checked && (
                            <TableCell type='buttons' style={{ textAlign: 'center', width: '45px' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={'/user/tccb/qua-trinh/hop-dong-lao-dong/group/' + item.shcc}>
                                    <i className='fa fa-lg fa-compress'/>
                                </Link>
                            </TableCell>
                        )}
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-briefcase',
            title: 'Hợp đồng Đơn vị trả lương',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>
                    Tổ chức cán bộ
                </Link>,
                'Hợp đồng Đơn vị trả lương'
            ],
            header: (
                <>
                    <FormDatePicker type='date-mask' ref={(e) => (this.fromDate = e)} className='col-md-4' label='Từ ngày tái ký'/>
                    <FormDatePicker type='date-mask' ref={(e) => (this.toDate = e)} className='col-md-4' label='Đến ngày tái ký'/>
                    <button className='btn btn-info col-md-1' style={{ marginTop: '27px', height: '33px' }} type='button' onClick={(e) => e.preventDefault() || this.changeAdvancedSearch()}>
                        <i className='fa fa-fw fa-lg fa-search-plus'/>
                    </button>
                    <button className='btn btn-danger col-md-1' style={{ marginTop: '27px', height: '33px' }} type='button' onClick={(e) => e.preventDefault() || this.changeAdvancedSearch(null, true)}>
                        <i className='fa fa-fw fa-lg fa-times'/>
                    </button>
                </>
            ),
            content: (
                <>
                    <div className='tile'>
                        <FormCheckbox label='Hiển thị theo cán bộ' ref={(e) => (this.hienThiTheoCanBo = e)} onChange={this.groupPage}/>
                        {table}
                    </div>
                    <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage}/>
                    {/* {permission.export &&
                     <button className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }} onClick={this.download} >
                     <i className='fa fa-lg fa-print' />
                     </button>
                     } */}
                </>
            ),
            backRoute: '/user/tccb',
            onCreate: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/tccb/qua-trinh/hop-dong-dvtl/new') : null
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, qtHopDongDvtl: state.tccb.qtHopDongDvtl });
const mapActionsToProps = {
    getQtHopDongDvtlPage,
    getQtHopDongDvtlAll,
    updateQtHopDongDvtl,
    deleteQtHopDongDvtl,
    createQtHopDongDvtl,
    getQtHopDongDvtlGroupPage,
    getDmDonViAll
};
export default connect(mapStateToProps, mapActionsToProps)(QtHopDongDvtlPage);
