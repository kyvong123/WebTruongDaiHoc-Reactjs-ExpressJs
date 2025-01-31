import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getSvQtKyLuatPage, getSvQtKyLuatGroupPage, createSvQtKyLuatMultiple, deleteSvQtKyLuat, updateSvQtKyLuat, downloadWord, deleteQtKyLuatGroupPageMa, checkSinhVien, fetchDsSinhVien } from './redux';
import { SelectAdapter_DmHinhThucKyLuat } from '../svDmHinhThucKyLuat/redux';
import { getScheduleSettings } from 'modules/mdCongTacSinhVien/ctsvDtSetting/redux';
import EditModal from './editModal';
import { Tooltip } from '@mui/material';

class QtKyLuatGroupPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            T.clearSearchBox();
            const route = T.routeMatcher('/user/ctsv/qua-trinh/ky-luat/group/:mssv'),
                params = route.parse(window.location.pathname);
            this.mssv = params.mssv;
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => this.changeAdvancedSearch());
            this.setState({ filter: { listMssv: params.mssv, listHinhThucKyLuat: '' } }, () => {
                this.changeAdvancedSearch();
            });
        });
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props.svQtKyLuat && this.props.svQtKyLuat.page ? this.props.svQtKyLuat.page : { pageNumber: 1, pageSize: 50, pageCondition: {} };
        if (pageCondition && (typeof pageCondition == 'string')) T.setTextSearchBox(pageCondition);
        const listHinhThucKyLuat = this.listHinhThucKyLuat.value().toString() || '';
        const listMssv = this.state.filter.listMssv;
        const pageFilter = (isInitial || isReset) ? {} : { listMssv, listHinhThucKyLuat };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getSvQtKyLuatPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    downloadWord = (e, item) => {
        e.preventDefault();
        this.props.downloadWord(item.id, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), item.soQuyetDinh + '_' + item.formType + '.docx');
        });
    }

    delete = (e, item) => {
        T.confirm('Xóa kỷ luật', 'Bạn có chắc bạn muốn xóa kỷ luật này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtKyLuatGroupPageMa(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá kỷ luật bị lỗi!', 'danger');
                else T.alert('Xoá kỷ luật thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('ctsvKyLuat', ['read', 'write', 'delete', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.svQtKyLuat && this.props.svQtKyLuat.page ? this.props.svQtKyLuat.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quyết định</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hình thức</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Nội dung kỷ luật</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày ra quyết định</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ xử lý</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(<b> {item.soQuyetDinh || ''} </b>)} />
                        <TableCell type='text' style={{ color: 'red' }} content={(<span><b>{item.tenKyLuat || ''}</b></span>)} />
                        <TableCell type='text' contentClassName='multiple-lines-5' content={(item.noiDung || '')} />
                        <TableCell type='date' style={{ color: 'blue' }} dateFormat='dd/mm/yyyy' content={item.ngayKy} />
                        <TableCell type='text' style={{ color: 'blue', whiteSpace: 'nowrap' }} content={item.canBoXuLy} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
                            <Tooltip title='Download' arrow>
                                <button className='btn btn-warning' onClick={e => { e.preventDefault(); this.downloadWord(e, item); }}>
                                    <i className='fa fa-lg fa-file-word-o' />
                                </button>
                            </Tooltip>
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-ban',
            title: 'Quá trình kỷ luật',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                <Link key={0} to='/user/ctsv/qua-trinh/ky-luat'>Quá trình kỷ luật</Link>,
                'Chi tiết'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.listHinhThucKyLuat = e} label='Hình thức kỷ luật' data={SelectAdapter_DmHinhThucKyLuat} allowClear={true} minimumResultsForSearch={-1} />
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
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ marginBottom: '10px' }}>Tìm thấy: <b>{totalItem}</b> kết quả.</div>
                    </div>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createSvQtKyLuatMultiple} update={this.props.updateSvQtKyLuat}
                    getSemester={this.props.getScheduleSettings}
                    checkSinhVien={this.props.checkSinhVien}
                    fetchDsSinhVien={this.props.fetchDsSinhVien}
                />
            </>,
            backRoute: '/user/ctsv/ky-luat',
            onCreate: permission.write ? (e) => this.showModal(e) : null,
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
    getSvQtKyLuatPage, getSvQtKyLuatGroupPage, createSvQtKyLuatMultiple, deleteSvQtKyLuat, updateSvQtKyLuat, downloadWord, deleteQtKyLuatGroupPageMa, checkSinhVien, fetchDsSinhVien, getScheduleSettings
};
export default connect(mapStateToProps, mapActionsToProps)(QtKyLuatGroupPage);