import React from 'react';
import { connect } from 'react-redux';
import { PageName, getGiangVienHdPage } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, FormSelect, FormCheckbox, TableHead, renderDataTable } from 'view/component/AdminPage';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmDanTocV2 } from 'modules/mdDanhMuc/dmDanToc/redux';
import { SelectAdapter_DmTonGiaoV2 } from 'modules/mdDanhMuc/dmTonGiao/redux';
import Pagination from 'view/component/Pagination';


class GiangVienHdPage extends AdminPage {
    state = { filter: {}, visibleCVDT: false, visibleHDTN: false, data: [], sortTerm: 'ten_ASC' };
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                // listShcc, listDonVi, gender, listNgach, listHocVi, listChucDanh, isBienChe, fromYear, toYear, listDanToc, listTonGiao, loaiHopDong, loaiChuyenVien, listQuocGia, lastModified
                let filterCookie = T.getCookiePage(PageName, 'F'),
                    { listShcc = '', listDonVi = '', gender = '', listDanToc = '', listTonGiao = '', listQuocGia = '' } = filterCookie;
                this.listShcc.value(listShcc);
                this.listDonVi.value(listDonVi);
                this.gender.value(gender);
                this.listDanToc.value(listDanToc);
                this.listTonGiao.value(listTonGiao);
                this.listQuocGia.value(listQuocGia);
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        //listShcc, listDonVi, gender, listNgach, listHocVi, listChucDanh, isBienChe, fromYear, toYear, listDanToc, listTonGiao, loaiHopDong, loaiChuyenVien, lastModified
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.staff && this.props.staff.page ? this.props.staff.page : { pageNumber: 1, pageSize: 50, pageCondition: {} };
        if (pageCondition && (typeof pageCondition == 'string')) T.setTextSearchBox(pageCondition);
        const listDonVi = this.listDonVi.value().toString() || '',
            listShcc = this.listShcc.value().toString() || '',
            gender = this.gender.value() == '' ? null : this.gender.value(),
            listDanToc = this.listDanToc.value().toString() || '',
            listTonGiao = this.listTonGiao.value().toString() || '',
            listQuocGia = this.listQuocGia.value().toString() || '';
        const pageFilter = (isInitial || isReset) ? {} : { listShcc, listDonVi, gender, listDanToc, listTonGiao, listQuocGia };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    const filterCookie = T.getCookiePage(PageName, 'F');
                    let { listShcc, listDonVi, gender, listDanToc, listTonGiao, listQuocGia } = filter;
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.listShcc.value(listShcc || filterCookie.listShcc || '');
                    this.listDonVi.value(listDonVi || filterCookie.listDonVi || '');
                    this.gender.value(gender || filterCookie.gender || '');
                    this.listDanToc.value(listDanToc || filter.listDanToc || '');
                    this.listTonGiao.value(listTonGiao || filter.listTonGiao || '');
                    this.listQuocGia.value(listQuocGia || filter.listQuocGia || '');
                } else if (isReset) {
                    this.listShcc.value('');
                    this.listDonVi.value('');
                    this.gender.value('');
                    this.listDanToc.value('');
                    this.listTonGiao.value('');
                    this.listQuocGia.value('');
                    this.hideAdvanceSearch();
                } else {
                    this.hideAdvanceSearch();
                }
            });
        });
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getGiangVienHdPage(pageN, pageS, pageC, this.state.filter, this.state?.sortTerm || this.defaultSortTerm, done);
    }

    render() {
        const permission = this.getUserPermission('sdhDmGiangVienHd');
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sdhDmGiangVienHd && this.props.sdhDmGiangVienHd.page ?
            this.props.sdhDmGiangVienHd.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        const table = renderDataTable({
            emptyTable: 'Không có dữ liệu giảng viên hướng dẫn',
            stickyHead: true,
            loadingStyle: { backgroundColor: 'white' },
            className: this.state.quickAction ? 'table-fix-col' : '',
            header: 'thead-light',
            data: list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHead content='Mã' keyCol='shcc' style={{ width: 'auto', whiteSpace: 'center', minWidth: '180px' }} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead content='Họ và chữ lót' keyCol='ho' style={{ width: 'auto', whiteSpace: 'nowrap' }} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead content='Tên' keyCol='ten' style={{ width: 'auto', whiteSpace: 'nowrap', minWidth: '180px' }} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead content='Phái' keyCol='phai' typeSearch='select' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', minWidth: '150px' }} data={SelectAdapter_DmGioiTinhV2} onKeySearch={this.handleKeySearch} />
                    <TableHead content='Ngày sinh' keyCol='ngaySinh' typeSearch='date' style={{ width: 'auto', whiteSpace: 'nowrap', minWidth: '200px' }} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead content='Quê quán' keyCol='queQuan' style={{ width: 'auto', whiteSpace: 'nowrap', minWidth: '180px' }} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead content='Dân tộc' keyCol='danToc' typeSearch='select' style={{ width: 'auto', whiteSpace: 'nowrap', minWidth: '180px' }} onKeySearch={this.handleKeySearch} data={SelectAdapter_DmDanTocV2} />
                    <TableHead content='Tôn giáo' keyCol='tonGiao' typeSearch='select' style={{ width: 'auto', whiteSpace: 'nowrap', minWidth: '180px' }} onKeySearch={this.handleKeySearch} data={SelectAdapter_DmTonGiaoV2} />
                    <TableHead content='Đơn vị' keyCol='donVi' typeSearch='select' style={{ width: '50%', whiteSpace: 'nowrap', minWidth: '180px' }} data={SelectAdapter_DmDonVi} onKeySearch={this.handleKeySearch} />
                    <TableHead content='Email' keyCol='email' style={{ width: '50%', whiteSpace: 'nowrap' }} onSort={sortTerm => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.shcc} url={`/user/sau-dai-hoc/giang-vien-huong-dan/${item.shcc}`} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.ho} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.ten} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.phai ? (item.phai == '01' ? 'Nam' : 'Nữ') : ''} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                    <TableCell content={item.ngaySinh ? T.dateToText(item.ngaySinh, 'dd/mm/yyyy') : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.queQuan} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.tenDanToc} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.tenTonGiao} contentClassName='multiple-lines-2' />
                    <TableCell content={<>
                        {item.tenDonVi ? (item.loaiDonVi == 1 ? ['16', '18'].includes(item.maDonVi) ? 'Bộ môn ' : 'Khoa ' : '') + item.tenDonVi.normalizedName() : ''}
                    </>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.email} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={`/user/sau-dai-hoc/giang-vien-huong-dan/${item.shcc}`} onDelete={this.delete}>
                    </TableCell>
                </tr>)
        });

        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Giảng viên hướng dẫn',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                'Giảng viên hướng dẫn'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect ref={e => this.listDonVi = e} className='col-md-4' label='Lọc theo đơn vị' data={SelectAdapter_DmDonVi} minimumResultsForSearch={-1} multiple={true} allowClear={true} />
                    <FormSelect ref={e => this.listShcc = e} className='col-md-4' label='Lọc theo cán bộ' data={SelectAdapter_FwCanBo} minimumResultsForSearch={-1} multiple={true} allowClear={true} />
                    <FormSelect ref={e => this.gender = e} data={SelectAdapter_DmGioiTinhV2} label='Lọc theo giới tính' className='col-md-4' minimumResultsForSearch={-1} allowClear />
                    <FormSelect className='col-md-3' ref={e => this.listQuocGia = e} data={SelectAdapter_DmQuocGia} minimumResultsForSearch={-1} multiple={true} allowClear={true} label='Lọc theo quốc gia tốt nghiệp' />
                    <FormSelect className='col-md-3' ref={e => this.listDanToc = e} data={SelectAdapter_DmDanTocV2} minimumResultsForSearch={-1} multiple={true} allowClear={true} label='Lọc theo dân tộc' />
                    <FormSelect className='col-md-3' ref={e => this.listTonGiao = e} data={SelectAdapter_DmTonGiaoV2} minimumResultsForSearch={-1} multiple={true} allowClear={true} label='Lọc theo tôn giáo' />
                    <div className='form-group col-12' style={{ justifyContent: 'end', display: 'flex' }}>
                        <button className='btn btn-danger' style={{ marginRight: '10px' }} type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch(null, true)}>
                            <i className='fa fa-fw fa-lg fa-times' />Xóa bộ lọc
                        </button>
                        <button className='btn btn-info' type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
                            <i className='fa fa-fw fa-lg fa-search-plus' />Tìm kiếm
                        </button>
                    </div>
                </div>
            </>,
            content: <>
                <div className='tile'>
                    <div style={{ marginBottom: '10px' }}>Kết quả: {<b>{totalItem}</b>} Giảng viên hướng dẫn</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', marginBottom: '10px' }}>
                        <FormCheckbox label='Thao tác nhanh' onChange={value => this.setState({ quickAction: value })} style={{ marginBottom: '0' }} />
                        <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                            getPage={this.props.getGiangVienHdPage} pageRange={3} />
                    </div>
                    {table}
                </div>
            </>,
            backRoute: '/user/sau-dai-hoc',
            // onCreate: permission.write ? e => this.create(e) : null,
            // onExport: !this.state.exported ? e => this.export(e, pageCondition) :

        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhDmGiangVienHd: state.sdh.sdhDmGiangVienHd });
const mapActionsToProps = { getGiangVienHdPage };
export default connect(mapStateToProps, mapActionsToProps)(GiangVienHdPage);