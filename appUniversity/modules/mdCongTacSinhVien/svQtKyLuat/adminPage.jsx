import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getSvQtKyLuatPage, getSvQtKyLuatGroupPage, createSvQtKyLuatMultiple, deleteSvQtKyLuat, updateSvQtKyLuat, downloadWord, checkSinhVien, fetchDsSinhVien, svCheckSoQuyetDinh } from './redux';
import { SelectAdapter_DmHinhThucKyLuat } from 'modules/mdCongTacSinhVien/svDmHinhThucKyLuat/redux';
import { SelectAdapter_FwStudent } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { getScheduleSettings } from 'modules/mdCongTacSinhVien/ctsvDtSetting/redux';
import CreateRequest from 'modules/mdHanhChinhTongHop/hcthSoDangKy/components/createRequest';
import { Tooltip } from '@mui/material';
import EditModal from './editModal';

class QtKyLuat extends AdminPage {
    checked = parseInt(T.cookie('hienThiTheoSinhVien')) == 1;
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.setState({ searchText }, () => this.getPage(undefined, undefined));
            T.showSearchBox(() => this.changeAdvancedSearch());
            if (this.checked) {
                this.hienThiTheoSinhVien.value(true);
            }
            this.changeAdvancedSearch(true);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    onHideRequest = () => {
        this.addModal?.modal && $(this.addModal.modal)?.modal('show');
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.svQtKyLuat && this.props.svQtKyLuat.page ? this.props.svQtKyLuat.page : { pageNumber: 1, pageSize: 50, pageCondition: {} };
        if (pageCondition && (typeof pageCondition == 'string')) T.setTextSearchBox(pageCondition);
        const listHinhThucKyLuat = this.listHinhThucKyLuat.value().toString() || '';
        const listMssv = this.listMssv.value().toString() || '';
        const pageFilter = (isInitial || isReset) ? {} : { listMssv, listHinhThucKyLuat };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize);
        });
    }

    getPage = (pageN, pageS, done) => {
        if (this.checked) this.props.getSvQtKyLuatGroupPage(pageN, pageS, this.state.searchText, this.state.filter, done);
        else this.props.getSvQtKyLuatPage(pageN, pageS, this.state.searchText, this.state.filter, done);
    }

    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoSinhVien', this.checked ? 1 : 0);
        this.getPage();
    }

    list = (danhSachKyLuat) => {
        danhSachKyLuat = T.parse(danhSachKyLuat);
        const result = danhSachKyLuat.map((item, index) => <div key={index}> <span>
            {index + 1}. {item.kyLuat + ' (' + (item.ngayXuLy ? T.dateToText(Number(item.ngayXuLy), 'dd/mm/yyyy') : '') + ')'}
        </span></div>);

        return result;
    }

    delete = (e, item) => {
        T.confirm('Xóa kỷ luật', 'Bạn có chắc bạn muốn xóa kỷ luật này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteSvQtKyLuat(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá kỷ luật bị lỗi!', 'danger');
                else T.alert('Xoá kỷ luật thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    downloadWord = (e, item) => {
        e.preventDefault();
        this.props.downloadWord(item.id, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data.data)]), item.soQuyetDinh + '_' + item.formType + '.docx');
            // data.hasManyStudent && this.downloadExcel(e, item);
        });
    }

    downloadExcel = (e, item) => {
        e.preventDefault();
        T.notify('Danh sách sinh viên sẽ được tải xuống sau vài giây', 'success');
        T.download(`/api/ctsv/qua-trinh/ky-luat/download-excel/dssv/${item.id}`);
    }

    render() {
        const permission = this.getUserPermission('ctsvKyLuat', ['read', 'write', 'delete', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.svQtKyLuat && this.props.svQtKyLuat.pageGr ?
                this.props.svQtKyLuat.pageGr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.svQtKyLuat && this.props.svQtKyLuat.page ? this.props.svQtKyLuat.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        {!this.checked && <>
                            <th style={{ width: 'auto', textAlign: 'right' }}>Mã</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quyết định</th>
                            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Nội dung kỷ luật</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày ra quyết định</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ xử lý</th>
                        </>}
                        {this.checked && <>
                            <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                            <th style={{ width: 'auto', textAlign: 'left' }}>MSSV</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Họ và tên</th>
                            <th style={{ width: !this.checked ? 'auto' : '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số lần bị kỷ luật</th>
                            <th style={{ width: '80%', whiteSpace: 'nowrap' }}>Danh sách hình thức kỷ luật</th>
                        </>}
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        {!this.checked && <>
                            <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(<b> {item.id || ''} </b>)} />
                            <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(<b> {item.soQuyetDinh || ''} </b>)} />
                            <TableCell type='text' contentClassName='multiple-lines-5' content={(item.noiDung || '')} />
                            <TableCell type='date' style={{ color: 'blue' }} dateFormat='dd/mm/yyyy' content={item.ngayKy} />
                            <TableCell type='text' style={{ color: 'blue', whiteSpace: 'nowrap' }} content={item.canBoXuLy} />
                            <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
                                <Tooltip title='Xuất Excel' arrow>
                                    <button className='btn btn-success' onClick={e => { e.preventDefault(); T.download(`/api/ctsv/qua-trinh/ky-luat/download-excel/dssv/${item.id}`); }}>
                                        <i className='fa fa-lg fa-file-excel-o' />
                                    </button>
                                </Tooltip>
                                <Tooltip title='Xuất công văn' arrow>
                                    <button className='btn btn-warning' onClick={e => { e.preventDefault(); this.downloadWord(e, item); }}>
                                        <i className='fa fa-lg fa-file-word-o' />
                                    </button>
                                </Tooltip>
                            </TableCell>
                        </>}
                        {this.checked && <>
                            <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                            <TableCell type='text' style={{ textAlign: 'right' }} content={item.mssv || ''} />
                            <TableCell type='link' url={`/user/ctsv/qua-trinh/ky-luat/group/${item.mssv}`} style={{ whiteSpace: 'nowrap' }} content={(
                                <>
                                    <span>{item.hoTen ? item.hoTen.normalizedName() : ' '}</span><br />
                                </>
                            )} />
                            <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tenTinhTrang || ''} />
                            <TableCell type='text' style={{ textAlign: 'center' }} content={item.soKyLuat} />
                            <TableCell type='text' content={item.soKyLuat != 0 ? this.list(item.danhSachKyLuat) : ''} />
                            <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/ctsv/qua-trinh/ky-luat/group/${item.mssv}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        </>}
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-ban',
            title: 'Quá trình kỷ luật',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Quá trình kỷ luật'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.listHinhThucKyLuat = e} label='Hình thức kỷ luật' data={SelectAdapter_DmHinhThucKyLuat} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.listMssv = e} label='Sinh viên' data={SelectAdapter_FwStudent} allowClear={true} />
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                        <div>
                            <FormCheckbox label='Hiển thị theo sinh viên' ref={e => this.hienThiTheoSinhVien = e} onChange={this.groupPage} />
                            <div style={{ marginBottom: '10px' }}>Tìm thấy: <b>{totalItem}</b> kết quả.</div>
                        </div>
                        <div>
                            <button className='btn btn-warning mb-2' onClick={() => {
                                this.props.history.push('/user/ctsv/qua-trinh/cau-hinh-ky-luat');
                            }}><i className='fa fa-arrow-right' /> Xét tự động</button>
                        </div>
                    </div>

                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    requestModal={this.requestModal}
                />
                <CreateRequest ref={e => this.requestModal = e} onHide={this.onHideRequest} />
            </>,
            backRoute: '/user/ctsv/ky-luat',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
            onImport: permission && permission.write ? (e) => this.showModal(e) : null,
            // onExport: !this.checked && permission.export ? (e) => {
            //     e.preventDefault();
            //     const filter = T.stringify(this.state.filter);

            //     T.download(T.url(`/api/tccb/qua-trinh/ky-luat/download-excel/${filter}`), 'kyluat.xlsx');
            // } : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, svQtKyLuat: state.ctsv.svQtKyLuat });
const mapActionsToProps = {
    getSvQtKyLuatPage, getSvQtKyLuatGroupPage, createSvQtKyLuatMultiple, deleteSvQtKyLuat, updateSvQtKyLuat, downloadWord, getScheduleSettings, checkSinhVien, fetchDsSinhVien, svCheckSoQuyetDinh
};
export default connect(mapStateToProps, mapActionsToProps)(QtKyLuat);