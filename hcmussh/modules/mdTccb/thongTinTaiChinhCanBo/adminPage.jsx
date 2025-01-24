import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderDataTable, TableHead, TableCell, FormCheckbox } from 'view/component/AdminPage';
import { getThongTinTaiChinhCanBoPage, exportExcel } from './redux';
import Pagination from 'view/component/Pagination';

class DanhSachThongTinTaiChinhCanBoPage extends AdminPage {
    state = { filter: {}, sortTerm: 'hoTen_ASC', searchText: '' };
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => {
                this.getPage(undefined, undefined, searchText || '');
                this.setState({ searchText });
            };
            T.showSearchBox();
            this.getPage(undefined, undefined, '');
        });
        this.getPage();
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getThongTinTaiChinhCanBoPage(pageN, pageS, pageC, this.state.filter, this.state?.sortTerm || '', done);
    };

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    };

    export = (e) => {
        e.preventDefault();
        this.props.exportExcel(this.state.filter, this.state.searchText, this.state.sortTerm);
    }

    render() {
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null;
        const permission = this.getUserPermission('tccbThongTinTaiChinhCanBo', ['read', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.danhSachThongTinTaiChinhCanBo && this.props.danhSachThongTinTaiChinhCanBo.page ? this.props.danhSachThongTinTaiChinhCanBo.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = renderDataTable({
            emptyTable: 'Không có thông tin tài chính cán bộ',
            data: list,
            divStyle: { height: '80vh' },
            header: 'thead-light',
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (
                <tr>
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='STT' />
                    <TableHead style={{ minwidth: 60, width: 'auto', textAlign: 'center' }} content='Họ và tên' keyCol='hoTen' onKeySearch={onKeySearch} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                    <TableHead style={{ minwidth: 60, width: 'auto', textAlign: 'center' }} content='Mã cán bộ' keyCol='shcc' onKeySearch={onKeySearch} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                    <TableHead style={{ minwidth: 60, width: 'auto', textAlign: 'center' }} content='Tên Đơn vị' keyCol='tenDonVi' onKeySearch={onKeySearch} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                    <TableHead style={{ minwidth: 80, width: 'auto', textAlign: 'center' }} content='Chức vụ' keyCol='chucVu' onKeySearch={onKeySearch} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                    <TableHead style={{ minwidth: 80, width: 'auto', textAlign: 'center' }} content='Ngạch' keyCol='ngach' onKeySearch={onKeySearch} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                    <TableHead style={{ minwidth: 90, width: 'auto', textAlign: 'center' }} content='Tên ngạch' keyCol='tenNgach' onKeySearch={onKeySearch} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                    <TableHead style={{ minwidth: 150, width: 'auto', textAlign: 'center' }} content='Ngày hưởng lương' keyCol='ngayHuongLuong' onKeySearch={onKeySearch} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} typeSearch='date' />
                    <TableHead style={{ minwidth: 80, width: 'auto', textAlign: 'center' }} content='Hệ số lương' keyCol='heSoLuong' onKeySearch={onKeySearch} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                    <TableHead style={{ minwidth: 80, width: 'auto', textAlign: 'center' }} content='Bậc lương' keyCol='bacLuong' onKeySearch={onKeySearch} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                    <TableHead style={{ minwidth: 120, width: 'auto', textAlign: 'center' }} content='Ngày bắt đầu lương' keyCol='batDauLuong' onKeySearch={onKeySearch} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} typeSearch='date' />
                    <TableHead style={{ minwidth: 120, width: 'auto', textAlign: 'center' }} content='Ngày kết thúc lương' keyCol='ketThucLuong' onKeySearch={onKeySearch} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} typeSearch='date' />
                    <TableHead style={{ minwidth: 150, width: 'auto', textAlign: 'center' }} content='Phần trăm hưởng lương' keyCol='phanTramHuong' onKeySearch={onKeySearch} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                    <TableHead style={{ minwidth: 180, width: 'auto', textAlign: 'center' }} content='Phương thức trả lương' keyCol='phuongThucTraLuong' onKeySearch={onKeySearch} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                    <TableHead style={{ minwidth: 120, width: 'auto', textAlign: 'center' }} content='Mốc nâng lương' keyCol='mocNangLuong' onKeySearch={onKeySearch} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} typeSearch='date' />
                    <TableHead style={{ minwidth: 120, width: 'auto', textAlign: 'center' }} content='Mốc bậc lương cuối cùng' keyCol='mocBacLuongCuoiCung' onKeySearch={onKeySearch} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} typeSearch='date' />
                    <TableHead style={{ minwidth: 80, width: 'auto', textAlign: 'center' }} content='Tỷ lệ vượt khung' keyCol='tyLeVuotKhung' onKeySearch={onKeySearch} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                    <TableHead style={{ minwidth: 80, width: 'auto', textAlign: 'center' }} content='Tỷ lệ phụ cấp thâm niên' keyCol='tyLePhuCapThamNien' onKeySearch={onKeySearch} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                    <TableHead style={{ minwidth: 80, width: 'auto', textAlign: 'center' }} content='Tỷ lệ phụ cấp ưu đãi' keyCol='tyLePhuCapUuDai' onKeySearch={onKeySearch} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                    <TableHead style={{ minwidth: 80, width: 'auto', textAlign: 'center' }} content='Phụ cấp' keyCol='phuCap' onKeySearch={onKeySearch} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                    <TableHead style={{ minwidth: 120, width: 'auto', textAlign: 'center' }} content='Phúc lợi' keyCol='phucLoi' onKeySearch={onKeySearch} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                    <TableHead style={{ minwidth: 100, width: 'auto', textAlign: 'center' }} content='Số BHXH' keyCol='soBHXH' onKeySearch={onKeySearch} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                    <TableHead style={{ minwidth: 120, width: 'auto', textAlign: 'center' }} content='Ngày bắt đầu BHXH' keyCol='ngayBatDauBHXH' onKeySearch={onKeySearch} typeSearch='date' onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                    <TableHead style={{ minwidth: 120, width: 'auto', textAlign: 'center' }} content='Ngày kết thúc BHXH' keyCol='ngayKetThucBHXH' onKeySearch={onKeySearch} typeSearch='date' onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.ho} ${item.ten}`} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.shcc} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenDonVi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.chucVu} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ngach} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNgach} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayHuongLuong} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.heSoLuong ? Number(item.heSoLuong).toFixed(2) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.bacLuong ? Number(item.bacLuong).toFixed(2) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.batDauLuong} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.ketThucLuong} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phanTramHuong} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phuongThucTraLuong} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.mocNangLuong} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.mocBacLuongCuoiCung} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tyLeVuotKhung ? Number(item.tyLeVuotKhung).toFixed(2) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tyLePhuCapThamNien ? Number(item.tyLePhuCapThamNien).toFixed(2) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tyLePhuCapUuDai ? Number(item.tyLePhuCapUuDai).toFixed(2) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phuCap ? Number(item.phuCap).toFixed(2) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phucLoi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soBHXH} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayBatDauBHXH} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayKetThucBHXH} />
                </tr>
            ),
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách thông tin tài chính cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>
                    Tổ chức cán bộ
                </Link>,
                'Danh sách thông tin tài chính cán bộ',
            ],
            content: (
                <>
                    <div className='tile'>
                        <div style={{ marginBottom: '10px' }}>Kết quả: {<b>{totalItem}</b>} thông tin tài chính cán bộ</div>
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
            onExport: permission && permission.export ? (e) => this.export(e) : null,
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, danhSachThongTinTaiChinhCanBo: state.tccb.tccbThongTinTaiChinhCanBo });
const mapActionsToProps = { getThongTinTaiChinhCanBoPage, exportExcel };
export default connect(mapStateToProps, mapActionsToProps)(DanhSachThongTinTaiChinhCanBoPage);
