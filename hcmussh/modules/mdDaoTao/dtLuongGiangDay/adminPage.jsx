import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { FormSelect, AdminPage, TableCell, TableHead, renderDataTable } from 'view/component/AdminPage';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import Pagination from 'view/component/Pagination';
import { ShareTietModal } from './modal/ShareTietModal';
import { DetailModal } from './modal/DetailModal';
import { ExportHopDongModal } from './modal/ExportHopDongModal';
import CreateRequest from 'modules/mdHanhChinhTongHop/hcthSoDangKy/components/createRequest';
import { chotHopDong, getDtThuLaoGiangDayPage, updateThuLaoGiangDay, getInfoDetailPage, getListHopDong, exportHopDong, genThuLao, updateChiaTiet } from './redux';
import { Tooltip } from '@mui/material';

class DtLuongGiangDay extends AdminPage {
    defaultSortTerm = 'idGiangVien_ASC'
    state = { filter: {}, sortTerm: this.defaultSortTerm };

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.getPage(undefined, undefined, '');
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            this.changeAdvancedSearch(true);
            T.showSearchBox(() => {
                this.showAdvanceSearch();
            });
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.dtThuLaoGiangDay && this.props.dtThuLaoGiangDay.page ? this.props.dtThuLaoGiangDay.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
        if (pageCondition && (typeof pageCondition == 'string')) {
            T.setTextSearchBox(pageCondition);
        }
        if (isInitial) {
            this.showAdvanceSearch();
            this.props.getScheduleSettings(data => {
                let { namHoc, hocKy } = data.currentSemester;
                this.namHocFilter.value(namHoc);
                this.hocKyFilter.value(hocKy);
                this.setState({
                    filter: { ...this.state.filter, namHocFilter: namHoc, hocKyFilter: hocKy }
                }, () => this.getPage(pageNumber, pageSize, pageCondition));
            });
        }
        else {
            this.getPage(pageNumber, pageSize, pageCondition);
        }
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getDtThuLaoGiangDayPage(pageN, pageS, pageC, this.state.filter, this.state.sortTerm || this.defaultSortTerm, done);
    }

    handleKeySearch = (data) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(undefined, undefined, '');
        });
    }

    handleSortTerm = (sortTerm) => {
        this.setState({ sortTerm }, () => this.getPage(undefined, undefined, ''));
    }
    genThuLao = () => {
        T.confirm('Tạo mới danh sách thù lao giảng dạy', 'Bạn có chắc muốn TẠO MỚI danh sách thù lao giảng dạy cho học kỳ này?', 'info', true, isConfirm => {
            if (isConfirm) {
                T.alert('Vui lòng chờ giây lát', 'info', false, null, true);
                this.props.genThuLao(this.namHocFilter.value(), this.hocKyFilter.value(), () => {
                    T.alert('Tạo thành công', 'success', false, 1000);
                });
            }
        });
    }

    render() {
        const permission = this.getUserPermission('dtThuLaoGiangDay', ['manage', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtThuLaoGiangDay && this.props.dtThuLaoGiangDay.page ?
            this.props.dtThuLaoGiangDay.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };

        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu sinh viên',
            stickyHead: true,
            header: 'thead-light',
            data: list,
            className: 'table-fix-col',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Mã số giảng viên' keyCol='idGiangVien' onSort={this.handleSortTerm} onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Họ và tên lót' keyCol='ho' onSort={this.handleSortTerm} onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Tên' keyCol='ten' onSort={this.handleSortTerm} onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Khoa' keyCol='khoa' onSort={this.handleSortTerm} onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Học hàm' keyCol='hocHam' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Học vị' keyCol='hocVi' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Tên môn học' keyCol='tenMonHoc' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Số lượng sinh viên' />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Tổng số tiết' keyCol='soTiet' />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Số tiết được chia' keyCol='soTietDuocChia' />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Đơn giá' keyCol='donGia' onSort={this.handleSortTerm} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thao tác'></TableHead>
                </tr>
            ),
            renderRow: (item, index) => {
                const permission = this.getUserPermission('dtThuLaoGiangDay', ['manage', 'write', 'delete']);

                return (
                    <tr key={index} >
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} type='link' content={item.idGiangVien} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho || ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten || ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.khoa || ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hocHam || ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hocVi || ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan || ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc)?.vi || ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soLuongSinhVien || ''} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soTiet || ''} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soTietDuocChia || ''} />
                        <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.donGia || ''} />
                        <TableCell type='buttons' content={item} permission={permission}>
                            <Tooltip title='Chỉnh sửa thông tin' arrow>
                                <button className='btn btn-primary' onClick={e => e.preventDefault() || this.detailModal.show(item)}>
                                    <i className='fa fa-pencil-square-o' />
                                </button>
                            </Tooltip>
                            <Tooltip title='Chia lại tiết giảng viên' arrow>
                                <button className='btn btn-warning' onClick={e => e.preventDefault() || this.shareTietModal.show(item, { namHoc: this.namHocFilter.value(), hocKy: this.hocKyFilter.value() })}>
                                    <i className='fa fa-pie-chart' />
                                </button>
                            </Tooltip>
                            <Tooltip title='Xuất hợp đồng' arrow>
                                <button className='btn btn-success' onClick={e => e.preventDefault() || this.exportHopDongModal.show(item, this.state.filter)}>
                                    <i className='fa fa-lg fa-file-text' />
                                </button>
                            </Tooltip>
                        </TableCell>

                    </tr>);

            }
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Thù lao giảng dạy',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/luong-giang-day'>Lương giảng dạy</Link>,
                'Thù lao giảng dạy'
            ],
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.namHocFilter = e} data={SelectAdapter_SchoolYear} className='col-md-3' label='Năm học' onChange={value => this.setState({ filter: { ...this.state.filter, namHocFilter: value.id } }, () => this.getPage(pageNumber, pageSize, pageCondition))} />
                <FormSelect ref={e => this.hocKyFilter = e} className='col-md-3' label='Học kỳ' data={SelectAdapter_DtDmHocKy} onChange={value => this.setState({ filter: { ...this.state.filter, hocKyFilter: value?.id } }, () => this.getPage(pageNumber, pageSize, pageCondition))} allowClear />
                <FormSelect ref={e => this.khoaSinhVienFilter = e} className='col-md-3' label='Khoá' data={SelectAdapter_DtKhoaDaoTao} onChange={value => this.setState({ filter: { ...this.state.filter, khoaSinhVienFilter: value?.id } }, () => this.getPage(pageNumber, pageSize, pageCondition))} allowClear />
                <FormSelect ref={e => this.loaiHinhDaoTaoFilter = e} className='col-md-3' label='Loại hình đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} onChange={value => this.setState({ filter: { ...this.state.filter, loaiHinhDaoTaoFilter: value?.id } }, () => this.getPage(pageNumber, pageSize, pageCondition))} allowClear />
            </div>,
            content: <>
                <div className='tile'>
                    {table}
                    <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                        getPage={this.getPage} pageRange={5} />
                    <ShareTietModal ref={e => this.shareTietModal = e} updateChiaTiet={this.props.updateChiaTiet} />
                    <ExportHopDongModal ref={e => this.exportHopDongModal = e}
                        getListHopDong={this.props.getListHopDong}
                        exportHopDong={this.props.exportHopDong}
                        requestModal={this.requestModal}
                        chotHopDong={this.props.chotHopDong}
                        permission={permission} />
                    <DetailModal ref={e => this.detailModal = e} updateThuLaoGiangDay={this.props.updateThuLaoGiangDay} getInfoDetailPage={this.props.getInfoDetailPage} />
                    <CreateRequest ref={e => this.requestModal = e} onHide={this.onHideRequest} />
                </div >

            </>,
            backRoute: '/user/dao-tao/luong-giang-day',
            onCreate: (e) => e.preventDefault() || this.genThuLao(),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtThuLaoGiangDay: state.daoTao.dtThuLaoGiangDay });
const mapActionsToProps = { chotHopDong, getDtThuLaoGiangDayPage, getScheduleSettings, updateThuLaoGiangDay, getInfoDetailPage, getListHopDong, exportHopDong, genThuLao, updateChiaTiet };
export default connect(mapStateToProps, mapActionsToProps)(DtLuongGiangDay);
