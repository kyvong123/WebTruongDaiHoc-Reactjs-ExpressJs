import Pagination from 'view/component/Pagination';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdCongTacSinhVien/ctsvDtNganhDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormSelect, FormTextBox, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import { getResultDataPage, updateResultData, createResultData, deleteResultData } from './redux';
import { SelectAdapter_FwStudent } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_DmMonHocFaculty } from '../dmMonHoc/redux';
import T from 'view/js/common';
const dataLoaiDky = [
    { id: 'KH', text: 'Kế hoạch' },
    { id: 'NKH', text: 'Ngoài kế hoạch' },
    { id: 'NCTDT', text: 'Ngoài CTĐT' },
    { id: 'HL', text: 'Học lại' },
    { id: 'CT', text: 'Học cải thiện' },
    { id: 'HV', text: 'Học vượt' },
];
class AdjustModal extends AdminModal {
    onShow = (item) => {
        let { mssv, maHocPhan, maMonHoc, maLoaiDangKy, id } = item || {};
        this.setState({ id });
        this.mssv.value(mssv || '');
        this.maHocPhan.value(maHocPhan);
        this.maMonHoc.value(maMonHoc);
        this.maLoaiDky.value(maLoaiDangKy);
    }

    onSubmit = () => {
        const data = {
            mssv: this.mssv.value(),
            maHocPhan: this.maHocPhan.value(),
            maMonHoc: this.maMonHoc.value(),
            maLoaiDky: this.maLoaiDky.value()
        };
        this.state.id ? this.props.update(this.state.id, data, this.hide) : this.props.create(data, this.hide);
    }
    render = () => {
        return this.renderModal({
            title: 'Điều chỉnh',
            body: <div className='row'>
                <FormSelect ref={e => this.mssv = e} data={SelectAdapter_FwStudent} label='Sinh viên' className='col-md-12' />
                <FormTextBox ref={e => this.maHocPhan = e} label='Mã học phần' className='col-md-6' />
                <FormSelect ref={e => this.maMonHoc = e} label='Mã môn học' data={SelectAdapter_DmMonHocFaculty()} className='col-md-6' />
                <FormSelect ref={e => this.maLoaiDky = e} data={dataLoaiDky} label='Loại đăng ký' className='col-md-12' />
            </div>
        });
    }
}
class AdjustPage extends AdminPage {
    defaultSortTerm = 'mssv_DESC'
    state = { filter: {}, sortTerm: 'mssv_DESC' };

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getResultDataPage(undefined, undefined, searchText || '');
            this.props.getResultDataPage();
        });
    }

    getResultDataPage = (pageNumber, pageSize, pageCondition, done) => this.props.getResultDataPage(pageNumber, pageSize, pageCondition, this.state.filter, this.state?.sortTerm || this.defaultSortTerm, done);

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getResultDataPage(pageNumber, pageSize, pageCondition);
        });
    }

    updateResultData = (id, data, done) => {
        this.props.updateResultData(id, data, this.state.filter, this.state.sortTerm, done);
    }

    createResultData = (data, done) => {
        this.props.createResultData(data, this.state.filter, this.state.sortTerm, done);
    }


    delete = (item) => {
        T.confirm('Xoá học phần', 'Bạn chắc chắn muốn xoá học phần của sinh viên?', 'warning', true, isConfirm => {
            if (isConfirm) {
                this.props.deleteResultData(item.id, this.state.filter, this.state.sortTerm);
            }
        });
    }
    render() {
        let permission = this.getUserPermission('dtModifyHocPhan');
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dataSinhVien && this.props.dataSinhVien.resultPage ?
            this.props.dataSinhVien.resultPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };

        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu sinh viên',
            stickyHead: true,
            header: 'thead-light',
            className: 'table-fix-col',
            loadingStyle: { backgroundColor: 'white' },
            data: list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: 'auto' }} content='MSSV' keyCol='mssv' onSort={sortTerm => this.setState({ sortTerm }, () => this.getResultDataPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead content='Họ và tên lót' keyCol='ho' onSort={sortTerm => this.setState({ sortTerm }, () => this.getResultDataPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead content='Tên' keyCol='ten' onSort={sortTerm => this.setState({ sortTerm }, () => this.getResultDataPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead content='Loại đăng ký' keyCol='loaiDangKy' onSort={sortTerm => this.setState({ sortTerm }, () => this.getResultDataPage(pageNumber, pageSize, pageCondition))} typeSearch='select' data={dataLoaiDky} onKeySearch={this.handleKeySearch} />
                    <TableHead content='Mã học phần' keyCol='maHocPhan' onSort={sortTerm => this.setState({ sortTerm }, () => this.getResultDataPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead content='Mã môn học' keyCol='maMonHoc' onSort={sortTerm => this.setState({ sortTerm }, () => this.getResultDataPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead content='Tên môn học' keyCol='tenMonHoc' onSort={sortTerm => this.setState({ sortTerm }, () => this.getResultDataPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead content='Loại hình' keyCol='loaiHinh' onSort={sortTerm => this.setState({ sortTerm }, () => this.getResultDataPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} typeSearch='select' data={SelectAdapter_DmSvLoaiHinhDaoTao} />
                    <TableHead content='Mã ngành' keyCol='maNganh' onSort={sortTerm => this.setState({ sortTerm }, () => this.getResultDataPage(pageNumber, pageSize, pageCondition))} typeSearch='select' data={SelectAdapter_DtNganhDaoTao} onKeySearch={this.handleKeySearch} />
                    <TableHead content='Khoa' keyCol='khoa' onSort={sortTerm => this.setState({ sortTerm }, () => this.getResultDataPage(pageNumber, pageSize, pageCondition))} typeSearch='select' data={SelectAdapter_DmDonViFaculty_V2} onKeySearch={this.handleKeySearch} />
                    <TableHead content='Khoá sinh viên' keyCol='khoaSinhVien' onSort={sortTerm => this.setState({ sortTerm }, () => this.getResultDataPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />

                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => <tr key={index}>
                <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maLoaiDangKy ? dataLoaiDky.find(loai => loai.id == item.maLoaiDangKy)?.text : ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maMonHoc || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiHinh || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maNganh || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.khoa || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.khoaSinhVien || ''} />
                <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={() => this.delete(item)} />
            </tr>
        });
        return this.renderPage({
            title: 'Điều chỉnh học phần sinh viên',
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getResultDataPage} pageRange={8} />
                <AdjustModal ref={e => this.modal = e} update={this.updateResultData} create={this.createResultData} />
            </>,
            onCreate: e => e.preventDefault() || this.modal.show()
        });
    }
}
const mapStateToProps = (state) => ({ system: state.system, dataSinhVien: state.daoTao.dataSinhVien });
const mapActionsToProps = { getResultDataPage, updateResultData, createResultData, deleteResultData };
export default connect(mapStateToProps, mapActionsToProps)(AdjustPage);