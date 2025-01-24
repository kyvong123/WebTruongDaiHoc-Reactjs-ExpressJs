import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormCheckbox, FormDatePicker, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import { deleteQtHopDongLaoDong, downloadWord, getQtHopDongLaoDongPage } from './redux';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';

class QtHopDongLaoDongPage extends AdminPage {
    defaultSort = 'ngayKy_DESC';
    state = { filter: { sortKey: 'ngayKy', sortMode: 'DESC' } };
    mapperLanKy = {
        0: (
            <span className='text-primary'>
                <i className='fa fa-lg fa-lock'/> Không thời hạn
            </span>
        ),
        1: (
            <span className='text-success'>
                <i className='fa fa-lg fa-star'/> Thử việc
            </span>
        ),
        2: (
            <span className='text-warning'>
                <i className='fa fa-lg fa-step-forward'/> Gia hạn
            </span>
        ),
        3: (
            <span className='text-danger'>
                <i className='fa fa-lg fa-check-circle'/> Lần 1
            </span>
        ),
        4: (
            <span className='text-danger'>
                <i className='fa fa-lg fa-check-circle'/> Lần 2
            </span>
        )
    };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
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
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.qtHopDongLaoDong && this.props.qtHopDongLaoDong.page ? this.props.qtHopDongLaoDong.page : { pageNumber: 1, pageSize: 50, pageCondition: {} };

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
                    const filterCookie = T.getCookiePage('pageQtHopDongLaoDong', 'F');
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

    changeAdvancedSearchHetHan = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.qtHopDongLaoDong && this.props.qtHopDongLaoDong.page ? this.props.qtHopDongLaoDong.page : { pageNumber: 1, pageSize: 50, pageCondition: {} };

        if (pageCondition && typeof pageCondition == 'string') T.setTextSearchBox(pageCondition);
        let fromDateHetHan = null;
        if (this.fromDateHetHan.value()) {
            fromDateHetHan = this.fromDateHetHan.value();
            fromDateHetHan.setHours(0, 0, 0, 0);
            fromDateHetHan = fromDateHetHan.getTime();
        }
        let toDateHetHan = null;
        if (this.toDateHetHan.value()) {
            toDateHetHan = this.toDateHetHan.value();
            toDateHetHan.setHours(23, 59, 59, 999);
            toDateHetHan = toDateHetHan.getTime();
        }
        const pageFilter = isInitial || isReset ? {} : { fromDateHetHan, toDateHetHan };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    const filterCookie = T.getCookiePage('pageQtHopDongLaoDong', 'F');
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });

                    this.fromDateHetHan.value(filter.fromDateHetHan || filterCookie.fromDateHetHan || '');
                    this.toDateHetHan.value(filter.toDateHetHan || filterCookie.toDateHetHan || '');
                    if (this.fromDateHetHan.value() || this.toDateHetHan.value()) this.showAdvanceSearch();
                } else if (isReset) {
                    this.fromDateHetHan.value('');
                    this.toDateHetHan.value('');
                }
            });
        });
    };

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtHopDongLaoDongPage(pageN, pageS, pageC, this.state.filter, done);
    };

    delete = (e, item) => {
        T.confirm('Xóa hợp đồng', 'Bạn có chắc bạn muốn xóa hợp đồng này?', 'warning', true, (isConfirm) => {
            isConfirm &&
            this.props.deleteQtHopDongLaoDong(item.ma, (error) => {
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
        const permission = this.getUserPermission('qtHopDongLaoDong', ['read', 'write', 'delete', 'manage', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtHopDongLaoDong && this.props.qtHopDongLaoDong.page ? this.props.qtHopDongLaoDong.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu thời khóa biểu',
            data: list,
            divStyle: { height: '80vh' },
            header: 'thead-light',
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (
                <tr>
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='STT'/>
                    <TableHead style={{ width: '20%', whiteSpace: 'nowrap' }} content='Số hợp đồng' keyCol='soHopDong' onKeySearch={onKeySearch} onSort={this.onSort}/>
                    <TableHead style={{ width: '120px', whiteSpace: 'nowrap' }} content='Ngày ký' keyCol='ngayKy' onKeySearch={onKeySearch} onSort={this.onSort} typeSearch='date'/>
                    <TableHead style={{ width: '120px', whiteSpace: 'nowrap' }} content='Bắt đầu' keyCol='ngayBatDau' onKeySearch={onKeySearch} onSort={this.onSort} typeSearch='date'/>
                    <TableHead style={{ width: '120px', whiteSpace: 'nowrap' }} content='Hết hạn' keyCol='ngayKetThuc' onKeySearch={onKeySearch} onSort={this.onSort} typeSearch='date'/>
                    <TableHead style={{ width: '120px', whiteSpace: 'nowrap' }} content='Tái ký' keyCol='ngayTaiKy' onKeySearch={onKeySearch} onSort={this.onSort} typeSearch='date'/>
                    <TableHead style={{ width: '100px', whiteSpace: 'nowrap' }} content='MSCB' keyCol='shcc' onKeySearch={onKeySearch} onSort={this.onSort}/>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Họ tên' keyCol='hoTen' onKeySearch={onKeySearch} onSort={this.onSort}/>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Loại HĐ' keyCol='loaiHd' onKeySearch={onKeySearch} onSort={this.onSort}/>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Lần ký'/>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='% hưởng' keyCol='phanTramHuong' onKeySearch={onKeySearch} onSort={this.onSort}/>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Ngày sinh' keyCol='ngaySinh' onKeySearch={onKeySearch} onSort={this.onSort} typeSearch='year'/>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Giới tính' keyCol='gioiTinh' onKeySearch={onKeySearch} onSort={this.onSort}/>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Đơn vị' keyCol='donVi' onKeySearch={onKeySearch} onSort={this.onSort}/>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Dân tộc' keyCol='danToc' onKeySearch={onKeySearch} onSort={this.onSort}/>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Tôn giáo' keyCol='tonGiao' onKeySearch={onKeySearch} onSort={this.onSort}/>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Mã ngạch' keyCol='maNgach' onKeySearch={onKeySearch} onSort={this.onSort}/>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Người ký' keyCol='nguoiKy'/>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Ghi chú'/>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Thao tác'/>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={(pageNumber - 1) * pageSize + index + 1}/>
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.soHopDong} onClick={() => window.open(`/user/tccb/qua-trinh/hop-dong-lao-dong/${item.ma}`, '_blank')}/>
                    <TableCell style={{ textAlign: 'center' }} content={item.ngayKyHopDong ? new Date(item.ngayKyHopDong).ddmmyyyy() : ''}/>
                    <TableCell style={{ textAlign: 'center' }} content={item.batDauLamViec ? new Date(item.batDauLamViec).ddmmyyyy() : ''}/>
                    <TableCell style={{ textAlign: 'center' }} content={item.ketThucHopDong ? new Date(item.ketThucHopDong).ddmmyyyy() : ''}/>
                    <TableCell style={{ textAlign: 'center' }} content={item.ngayKyHopDongTiepTheo ? new Date(item.ngayKyHopDongTiepTheo).ddmmyyyy() : ''}/>
                    <TableCell content={item.shcc}/>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={(item.hoBenA ? item.hoBenA : '') + ' ' + (item.tenBenA ? item.tenBenA : '')}/>
                    <TableCell content={item.loaiHopDong}/>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={this.mapperLanKy[item.lanKy]}/>
                    <TableCell contentClassName='multiple-lines-4' style={{ whiteSpace: item.newPhanTramHuong ? 'nowrap' : '' }}
                               content={item.newPhanTramHuong ? <>{Object.keys(item.newPhanTramHuong).filter(key => item.newPhanTramHuong[key].ngayBatDau && item.newPhanTramHuong[key].ngayKetThuc).map(
                                   (key, index) => <span
                                       key={index}>{key}%: {item.newPhanTramHuong[key].ngayBatDau ? T.dateToText(Number(item.newPhanTramHuong[key].ngayBatDau), 'dd/mm/yyyy') : ''} - {item.newPhanTramHuong[key].ngayKetThuc ? T.dateToText(Number(item.newPhanTramHuong[key].ngayKetThuc), 'dd/mm/yyyy') : ''}<br/></span>)}</> : item.phanTramHuong}/>
                    <TableCell style={{ textAlign: 'center' }} content={item.ngaySinh ? new Date(item.ngaySinh).ddmmyyyy() : ''}/>
                    <TableCell content={item.gioiTinh == '01' ? 'Nam' : 'Nữ'}/>
                    <TableCell contentClassName='multiple-lines-3' content={item.donVi}/>
                    <TableCell content={item.tenDanToc}/>
                    <TableCell content={item.tenTonGiao}/>
                    <TableCell content={item.maNgach}/>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.hoNguoiKy} ${item.tenNguoiKy}`.normalizedName()}/>
                    <TableCell content={item.ghiChu}/>
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                               onEdit={() => (permission.write ? this.props.history.push(`/user/tccb/qua-trinh/hop-dong-lao-dong/${item.ma}`) : T.notify('Vui lòng liên hệ phòng Tổ chức - Cán bộ', 'warning'))}
                               onDelete={this.delete}>
                        {permission.export && (
                            <Tooltip title='Xuất hợp đồng'>
                                <button type='button' className='btn btn-outline-primary' style={{ width: '45px' }} onClick={(e) => e.preventDefault() || this.downloadWord(item)}>
                                    <i className='fa fa-lg fa-file-word-o'/>
                                </button>
                            </Tooltip>
                        )}
                    </TableCell>
                </tr>
            )
        });
        return this.renderPage({
            icon: 'fa fa-briefcase',
            title: 'Hợp đồng Lao động',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>
                    Tổ chức cán bộ
                </Link>,
                'Hợp đồng Lao động'
            ],
            content: (
                <>
                    <div className='tile'>
                        <div style={{ display: 'inline-flex' }}>
                            <FormDatePicker type='date-mask' ref={(e) => (this.fromDate = e)} className='col-md-4' label='Từ ngày tái ký'/>
                            <FormDatePicker type='date-mask' ref={(e) => (this.toDate = e)} className='col-md-4' label='Đến ngày tái ký'/>
                            <button className='btn btn-info col-md-0,5' style={{ marginTop: '27px', height: '33px' }} type='button' onClick={(e) => e.preventDefault() || this.changeAdvancedSearch()}>
                                <i className='fa fa-fw fa-lg fa-search-plus'/>
                            </button>
                            <button className='btn btn-danger col-md-0,5' style={{ marginTop: '27px', height: '33px' }} type='button'
                                    onClick={(e) => e.preventDefault() || this.changeAdvancedSearch(null, true)}>
                                <i className='fa fa-fw fa-lg fa-times'/>
                            </button>
                        </div>
                        <div style={{ display: 'inline-flex' }}>
                            <FormDatePicker type='date-mask' ref={(e) => (this.fromDateHetHan = e)} className='col-md-4' label='Từ ngày hết hạn'/>
                            <FormDatePicker type='date-mask' ref={(e) => (this.toDateHetHan = e)} className='col-md-4' label='Đến ngày hết hạn'/>
                            <button className='btn btn-info col-md-0,5' style={{ marginTop: '27px', height: '33px' }} type='button'
                                    onClick={(e) => e.preventDefault() || this.changeAdvancedSearchHetHan()}>
                                <i className='fa fa-fw fa-lg fa-search-plus'/>
                            </button>
                            <button className='btn btn-danger col-md-0,5' style={{ marginTop: '27px', height: '33px' }} type='button'
                                    onClick={(e) => e.preventDefault() || this.changeAdvancedSearchHetHan(null, true)}>
                                <i className='fa fa-fw fa-lg fa-times'/>
                            </button>
                        </div>
                    </div>
                    <div className='tile'>
                        <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                            <div className='title'>
                                <div style={{ gap: 10, display: 'inline-flex' }}>
                                    <FormCheckbox label='Tìm theo cột' onChange={(value) => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }}/>
                                    <FormCheckbox label='Thao tác nhanh' onChange={(value) => this.setState({ isFixCol: value })} style={{ marginBottom: '0' }}/>
                                </div>
                            </div>
                            <div className='btn-group'>
                                <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} pageRange={3}/>
                            </div>
                        </div>
                        {table}
                    </div>
                </>
            ),
            backRoute: '/user/tccb',
            collapse: [
                { icon: 'fa-plus-square', name: 'Thêm hợp đồng mới', permission: permission.write, type: 'info', onClick: (e) => e.preventDefault() || window.open('/user/tccb/qua-trinh/hop-dong-lao-dong/new', '_blank') },
                { icon: 'fa-print', name: 'Export', permission: permission.export, onClick: (e) => e.preventDefault() || T.download(T.url('/api/tccb/qua-trinh/hop-dong-lao-dong/download-excel'), 'HDLD.xlsx'), type: 'success' }
            ]
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, qtHopDongLaoDong: state.tccb.qtHopDongLaoDong });
const mapActionsToProps = {
    getQtHopDongLaoDongPage,
    deleteQtHopDongLaoDong
};
export default connect(mapStateToProps, mapActionsToProps)(QtHopDongLaoDongPage);
