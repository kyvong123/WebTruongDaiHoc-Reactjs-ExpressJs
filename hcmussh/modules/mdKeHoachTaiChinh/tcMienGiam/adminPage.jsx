import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_DmBank } from 'modules/mdDanhMuc/dmBank/redux';
import { getPage } from './redux';
// import FileBox from 'view/component/FileBox';
import TranserMienGiamModal from './transferModal';
const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => {
        const nam = i + new Date().getFullYear() - 10;
        return { id: nam, text: `${nam} - ${nam + 1}` };
    });
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

class DanhSachMienGiam extends AdminPage {
    state = {
        filter: {},
    }

    componentDidMount() {
        T.ready('/user/finance', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '', page => this.setFilter(page));
            T.showSearchBox(true);
        });
        this.changeAdvancedSearch(true);
    }

    setFilter = (page, isInitial = false) => {
        const { settings: { namHoc, hocKy } } = page;
        this.setState({ filter: { namHoc, hocKy } });
        if (isInitial) {
            this.year.value(namHoc);
            this.term.value(hocKy);
        } else {
            this.year.value(namHoc);
            this.term.value(hocKy);
        }
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.tcGiaoDich && this.props.tcGiaoDich.page ? this.props.tcGiaoDich.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
        if (pageCondition && (typeof pageCondition == 'string')) {
            T.setTextSearchBox(pageCondition);
        }
        let
            namHoc = this.year.value(),
            hocKy = this.term.value(),
            listBacDaoTao = this.bacDaoTao.value().toString(),
            listLoaiHinhDaoTao = this.loaiHinhDaoTao.value().toString(),
            listNganh = this.nganh.value().toString(),
            listKhoa = this.khoa.value().toString();

        const pageFilter = (isInitial || isReset) ? { namHoc, hocKy } : { namHoc, hocKy, listBacDaoTao, listLoaiHinhDaoTao, listNganh, listKhoa };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                this.setFilter(page, isInitial);
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getPage(pageN, pageS, pageC, this.state.filter, done);
    }

    onClearSearch = (e) => {
        e.preventDefault();
        ['bacDaoTao', 'loaiHinhDaoTao', 'khoa', 'nganh'].forEach(key => this[key]?.value(''));
        this.changeAdvancedSearch();
    }
    downloadExcel = () => {
        let filter = {
            namHoc: this.year.value(),
            hocKy: this.term.value()
        };
        T.handleDownload(`/api/khtc/mien-giam/down-load-excel?filter=${T.stringify(filter)}`);
    }

    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcMienGiam && this.props.tcMienGiam.page ? this.props.tcMienGiam.page : {
            pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null
        };

        let permission = this.getUserPermission('tcMienGiam');
        let table = renderTable({
            loadingOverlay: false,
            loadingClassName: 'd-flex justify-content-center align-items-center',
            getDataSource: () => list,
            stickyHead: true,
            header: 'thead-light',
            emptyTable: 'Chưa có dữ liệu giao dịch học kỳ hiện tại',
            renderHead: () => (<tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm học-học kỳ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>MSSV</th>
                <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Họ & Tên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học phí (VNĐ)</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phần trăm miễn giảm </th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số tiền miễn giảm (VNĐ)</th>
            </tr>),
            renderRow: (item, index) => (<tr key={index}>
                <TableCell style={{ textAlign: 'right' }} content={item.R} />
                <TableCell style={{}} content={`${item.namHoc} - HK0${item.hocKy}`} />
                <TableCell style={{}} content={item.mssv} />
                <TableCell style={{}} content={`${item.ho || ''} ${item.ten || ''}`.trim().normalizedName()} />
                <TableCell style={{ textAlign: 'center' }} content={item.hocPhi} type='number' />
                <TableCell style={{ textAlign: 'center' }} content={`${item.phanTram}%`} />
                <TableCell style={{ textAlign: 'center' }} content={item.soTienMienGiam} type='number' />
            </tr>),

        });
        return this.renderPage({
            title: 'Danh sách miễn giảm',
            icon: 'fa fa-money',
            header: <>
                <FormSelect ref={e => this.year = e} style={{ width: '100px', marginBottom: '0', marginRight: 10 }} placeholder='Năm học' data={yearDatas()} onChange={() => this.changeAdvancedSearch()} />
                <FormSelect ref={e => this.term = e} style={{ width: '100px', marginBottom: '0' }} placeholder='Học kỳ' data={termDatas} onChange={() => this.changeAdvancedSearch()} />
            </>,
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.nganHang = e} label='Ngân hàng' data={SelectAdapter_DmBank} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.bacDaoTao = e} label='Bậc đào tạo' data={SelectAdapter_DmSvBacDaoTao} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.khoa = e} label='Khoa' data={SelectAdapter_DmDonViFaculty_V2} className='col-md-6' allowClear multiple />
                <FormSelect ref={e => this.nganh = e} label='Ngành' data={SelectAdapter_DtNganhDaoTao} className='col-md-6' allowClear multiple />
                <div className='col-md-12 d-flex justify-content-end' style={{ gap: 10 }}>
                    <button className='btn btn-danger' onClick={this.onClearSearch}><i className='fa fa-lg fa-times' />Xóa tìm kiếm</button>
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}><i className='fa fa-lg fa-search' />Tìm kiếm</button>
                </div>
            </div>,
            breadcrumb: ['Danh sách miễn giảm'],
            content: (<div className='tile'>
                <div className="tile-body row">
                    <div className='col-md-12'>
                        {table}
                        <Pagination {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                            getPage={this.getPage} />
                    </div>
                </div>
                {/* <ImportModal ref={e => this.importModal = e} /> */}
                <TranserMienGiamModal ref={e => this.transferModal = e} getPage={this.getPage} />
            </div>),
            // onImport: permission.write ? () => this.importModal.show() : null,
            onExport: e => e && e.preventDefault() || this.downloadExcel(),
            buttons: [
                { icon: 'fa fa-link', onClick: permission.write ? () => this.transferModal.show(this.state.filter) : null }
            ],
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcMienGiam: state.finance.tcMienGiam });
const mapActionsToProps = { getPage };
export default connect(mapStateToProps, mapActionsToProps)(DanhSachMienGiam);
