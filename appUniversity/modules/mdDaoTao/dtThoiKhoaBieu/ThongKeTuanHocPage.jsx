import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { AdminPage, renderDataTable, TableCell, TableHead, FormSelect } from 'view/component/AdminPage';
import { getDtThoiKhoaBieuThongKePage } from './redux';
import Pagination from 'view/component/Pagination';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';

class ThongKeTuanHocPage extends AdminPage {
    defaultSortTerm = 'maHocPhan_ASC'
    state = { filter: {}, dataThanhPhan: [] }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.showAdvanceSearch();
            T.showSearchBox(() => {
                this.showAdvanceSearch();
            });
            this.props.getScheduleSettings(data => {
                let { namHoc, hocKy } = data.currentSemester;
                this.namFilter.value(namHoc);
                this.hocKyFilter.value(hocKy);
                this.setState({
                    filter: { ...this.state.filter, namFilter: namHoc, hocKyFilter: hocKy }
                }, () => this.getPage(1, 50, ''));
            });
        });

    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getDtThoiKhoaBieuThongKePage(pageN, pageS, pageC, filter, done);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        let [key, value] = data.split(':');
        this.setState({ filter: { ...this.state.filter, [key]: value } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => {
        this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));
    }

    renderToTable = (data) => {
        return renderDataTable({
            data,
            renderHead: () => <tr>
                <TableHead content='#' />
                <TableHead content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead content='Tên môn học' style={{ width: '100%', minWidth: '200px', maxWidth: '200px' }} keyCol='tenMonHoc' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead content='Tổng tiết' style={{ minWidth: '30px' }} keyCol='tongTiet' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead content='Tổng tiết rải' style={{ minWidth: '30px' }} keyCol='soTietRai' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead content='Số tiết bù' style={{ minWidth: '30px' }} keyCol='buoiBu' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead content='Số tiết nghỉ' style={{ minWidth: '30px' }} keyCol='buoiNghi' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
            </tr>,
            renderRow: (item, index) => {
                return <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell className='sticky-col pin-3-col' style={{ width: 'auto' }} type='link' content={item.maHocPhan} url={`${window.location.origin}/user/dao-tao/thoi-khoa-bieu/view/${item.maHocPhan}`} />
                    <TableCell className='sticky-col pin-4-col' content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 'normal' }} content={item.tongTiet} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 'normal' }} content={item.soTietRai} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 'normal' }} content={item.soTietBu} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 'normal' }} content={item.soTietNghi} />
                </tr>;
            }
        });
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtThoiKhoaBieu && this.props.dtThoiKhoaBieu.pageThongKe ?
            this.props.dtThoiKhoaBieu.pageThongKe : {
                pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null, pageCondition: '',
            };

        return this.renderPage({
            title: 'Thống kê thời khóa biểu',
            icon: 'fa fa-leaf',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/edu-schedule'>Quản lý học phần</Link>,
                'Thống kê thời khóa biểu'
            ],
            advanceSearchTitle: '',
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.namFilter = e} data={SelectAdapter_SchoolYear} className='col-md-3' label='Năm học' onChange={value => this.setState({ filter: { ...this.state.filter, namFilter: value.id } }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                <FormSelect ref={e => this.hocKyFilter = e} className='col-md-3' label='Học kỳ' data={SelectAdapter_DtDmHocKy} onChange={value => this.setState({ filter: { ...this.state.filter, hocKyFilter: value?.id } }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                <FormSelect ref={e => this.khoaSinhVienFilter = e} className='col-md-2' label='Khoá' data={SelectAdapter_DtKhoaDaoTao} onChange={value => this.setState({ filter: { ...this.state.filter, khoaSinhVienFilter: value?.id } }, () => this.getPage(pageNumber, pageSize, pageCondition))} allowClear />
                <FormSelect ref={e => this.loaiHinhDaoTaoFilter = e} className='col-md-3' label='Loại hình' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} onChange={value => this.setState({ filter: { ...this.state.filter, loaiHinhDaoTaoFilter: value?.id } }, () => this.getPage(pageNumber, pageSize, pageCondition))} allowClear />
            </div>,
            content: <>
                <div className='tile'>
                    {this.renderToTable(list)}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </>,
            backRoute: '/user/dao-tao/edu-schedule'
        });
    }
}
const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = { getScheduleSettings, getDtThoiKhoaBieuThongKePage };
export default connect(mapStateToProps, mapActionsToProps)(ThongKeTuanHocPage);
