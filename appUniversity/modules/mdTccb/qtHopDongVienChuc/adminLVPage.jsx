import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderDataTable, TableHead, TableCell, FormCheckbox, FormDatePicker } from 'view/component/AdminPage';
import { getQtHopDongVienChucPage, downloadWord, deleteQtHopDongVienChuc } from './redux';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';

class QtHopDongVienChucPage extends AdminPage {
    defaultSort = 'ngayKy_DESC';
    state = { filter: { sortKey: 'ngayKy', sortMode: 'DESC' } };
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                let filterCookie = T.getCookiePage('pageQtHopDongVienChuc', 'F'),
                    { fromDate = '', toDate = '' } = filterCookie;
                this.fromDate.value(fromDate);
                this.toDate.value(toDate);
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.changeAdvancedSearch(true);
        });
        this.getPage();
    }

    downloadWord = (item) => {
        downloadWord(item.ma, (data) => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), item.shcc + '_hopdong.docx');
        });
    };

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, sortKey: (sortTerm || this.defaultSort).split('_')[0], sortMode: (sortTerm || this.defaultSort).split('_')[1] } }, () => this.getPage(pageNumber, pageSize, pageCondition));
    };

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.qtHopDongVienChuc && this.props.qtHopDongVienChuc.page ? this.props.qtHopDongVienChuc.page : { pageNumber: 1, pageSize: 50, pageCondition: {} };

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
                    const filterCookie = T.getCookiePage('pageQtHopDongVienChuc', 'F');
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
        this.props.getQtHopDongVienChucPage(pageN, pageS, pageC, this.state.filter, done);
    };

    delete = (e, item) => {
        T.confirm('Xóa hợp đồng', 'Bạn có chắc bạn muốn xóa hợp đồng này?', 'warning', true, (isConfirm) => {
            isConfirm &&
                this.props.deleteQtHopDongVienChuc(item.ma, (error) => {
                    if (error) T.notify(error.message ? error.message : 'Xoá hợp đồng bị lỗi!', 'danger');
                    else T.alert('Xoá hợp đồng thành công!', 'success', false, 800);
                });
        });
        e.preventDefault();
    };

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    };

    render() {
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null;
        const permission = this.getUserPermission('qtHopDongVienChuc', ['read', 'write', 'delete', 'manage', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtHopDongVienChuc && this.props.qtHopDongVienChuc.page ? this.props.qtHopDongVienChuc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu thời khóa biểu',
            data: list,
            divStyle: { height: '80vh' },
            header: 'thead-light',
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (
                <tr>
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='STT' />
                    <TableHead style={{ width: '20%', whiteSpace: 'nowrap' }} content='Số quyết đinh' keyCol='soQuyetDinh' onKeySearch={onKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '120px', whiteSpace: 'nowrap' }} content='Ngày ký' keyCol='ngayKy' onKeySearch={onKeySearch} onSort={this.onSort} typeSearch='date' />
                    <TableHead style={{ width: '120px', whiteSpace: 'nowrap' }} content='Bắt đầu' keyCol='ngayBatDau' onKeySearch={onKeySearch} onSort={this.onSort} typeSearch='date' />
                    <TableHead style={{ width: '120px', whiteSpace: 'nowrap' }} content='Hết hạn' keyCol='ngayKetThuc' onKeySearch={onKeySearch} onSort={this.onSort} typeSearch='date' />
                    <TableHead style={{ width: '120px', whiteSpace: 'nowrap' }} content='Tái ký' keyCol='ngayTaiKy' onKeySearch={onKeySearch} onSort={this.onSort} typeSearch='date' />
                    <TableHead style={{ width: '100px', whiteSpace: 'nowrap' }} content='MSCB' keyCol='shcc' onKeySearch={onKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Họ tên' keyCol='hoTen' onKeySearch={onKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Loại HĐ' keyCol='loaiHd' onKeySearch={onKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Ngày sinh' keyCol='ngaySinh' onKeySearch={onKeySearch} onSort={this.onSort} typeSearch='year' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Giới tính' keyCol='gioiTinh' onKeySearch={onKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Đơn vị' keyCol='donVi' onKeySearch={onKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Dân tộc' keyCol='danToc' onKeySearch={onKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Tôn giáo' keyCol='tonGiao' onKeySearch={onKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Mã ngạch' keyCol='maNgach' onKeySearch={onKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Người ký' keyCol='nguoiKy' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Thao tác' />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.soQuyetDinh} onClick={() => window.open(`/user/tccb/qua-trinh/hop-dong-lam-viec/${item.ma}`, '_blank')} />
                    <TableCell style={{ textAlign: 'center' }} content={item.ngayKyHopDong ? new Date(item.ngayKyHopDong).ddmmyyyy() : ''} />
                    <TableCell style={{ textAlign: 'center' }} content={item.batDauLamViec ? new Date(item.batDauLamViec).ddmmyyyy() : ''} />
                    <TableCell style={{ textAlign: 'center' }} content={item.ketThucHopDong ? new Date(item.ketThucHopDong).ddmmyyyy() : ''} />
                    <TableCell style={{ textAlign: 'center' }} content={item.ngayKyHopDongTiepTheo ? new Date(item.ngayKyHopDongTiepTheo).ddmmyyyy() : ''} />
                    <TableCell content={item.shcc} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={(item.hoBenA ? item.hoBenA : '') + ' ' + (item.tenBenA ? item.tenBenA : '')} />
                    <TableCell content={item.loaiHopDong} />
                    <TableCell style={{ textAlign: 'center' }} content={item.ngaySinh ? new Date(item.ngaySinh).ddmmyyyy() : ''} />
                    <TableCell content={item.gioiTinh == '01' ? 'Nam' : 'Nữ'} />
                    <TableCell contentClassName='multiple-lines-3' content={item.donVi} />
                    <TableCell content={item.tenDanToc} />
                    <TableCell content={item.tenTonGiao} />
                    <TableCell content={item.maNgach} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.hoNguoiKy} ${item.tenNguoiKy}`.normalizedName()} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onEdit={() => (permission.write ? this.props.history.push(`/user/tccb/qua-trinh/hop-dong-lam-viec/${item.ma}`) : T.notify('Vui lòng liên hệ phòng Tổ chức - Cán bộ', 'warning'))} onDelete={this.delete}>
                        {permission.export && (
                            <Tooltip title='Xuất hợp đồng'>
                                <button type='button' className='btn btn-outline-primary' style={{ width: '45px' }} onClick={(e) => e.preventDefault() || this.downloadWord(item)}>
                                    <i className='fa fa-lg fa-file-word-o' />
                                </button>
                            </Tooltip>
                        )}
                    </TableCell>
                </tr>
            ),
        });
        return this.renderPage({
            icon: 'fa fa-briefcase',
            title: 'Hợp đồng Làm việc',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>
                    Tổ chức cán bộ
                </Link>,
                'Hợp đồng Làm việc',
            ],
            header: (
                <>
                    <FormDatePicker type='date-mask' ref={(e) => (this.fromDate = e)} className='col-md-4' label='Từ ngày tái ký' />
                    <FormDatePicker type='date-mask' ref={(e) => (this.toDate = e)} className='col-md-4' label='Đến ngày tái ký' />
                    <button className='btn btn-info col-md-1' style={{ marginTop: '27px', height: '33px' }} type='button' onClick={(e) => e.preventDefault() || this.changeAdvancedSearch()}>
                        <i className='fa fa-fw fa-lg fa-search-plus' />
                    </button>
                    <button className='btn btn-danger col-md-1' style={{ marginTop: '27px', height: '33px' }} type='button' onClick={(e) => e.preventDefault() || this.changeAdvancedSearch(null, true)}>
                        <i className='fa fa-fw fa-lg fa-times' />
                    </button>
                </>
            ),
            content: (
                <>
                    <div className='tile'>
                        <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                            <div className='title'>
                                <div style={{ gap: 10, display: 'inline-flex' }}>
                                    <FormCheckbox label='Tìm theo cột' onChange={(value) => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }} />
                                    <FormCheckbox label='Thao tác nhanh' onChange={(value) => this.setState({ isFixCol: value })} style={{ marginBottom: '0' }} />
                                </div>
                            </div>
                            <div className='btn-group'>
                                <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} pageRange={3} />
                            </div>
                        </div>
                        {table}
                    </div>
                </>
            ),
            backRoute: '/user/tccb',
            collapse: [
                { icon: 'fa-plus-square', name: 'Thêm hợp đồng mới', permission: permission.write, type: 'info', onClick: (e) => e.preventDefault() || window.open('/user/tccb/qua-trinh/hop-dong-lam-viec/new', '_blank') },
                { icon: 'fa-print', name: 'Export', permission: permission.export, onClick: (e) => e.preventDefault() || T.download(T.url('/api/tccb/qua-trinh/hop-dong-lam-viec/download-excel'), 'HDLV.xlsx'), type: 'success' },
            ],
        });
    }
}
const mapStateToProps = (state) => ({ system: state.system, qtHopDongVienChuc: state.tccb.qtHopDongVienChuc });
const mapActionsToProps = {
    getQtHopDongVienChucPage,
    deleteQtHopDongVienChuc,
};
export default connect(mapStateToProps, mapActionsToProps)(QtHopDongVienChucPage);
