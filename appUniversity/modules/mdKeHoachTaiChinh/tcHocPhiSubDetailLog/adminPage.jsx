import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { getPage, getSubDetailLogSinhVien, syncPreview, syncData } from './redux';
import { SubDetailLogModal } from './modal/SubDetailLogModal';
import SyncPreviewModal from './modal/SyncPreviewModal';
import { Tooltip } from '@mui/material';


class SubDetailLog extends AdminPage {
    componentDidMount() {
        T.ready('/user/finance', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(true);
        });
        this.changeAdvancedSearch(true);
    }
    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.tcSubDetailLog && this.props.tcSubDetailLog.page ? this.props.tcSubDetailLog.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
        if (pageCondition && (typeof pageCondition == 'string')) {
            T.setTextSearchBox(pageCondition);
        }
        let
            listBacDaoTao = this.bacDaoTao.value().toString(),
            listLoaiHinhDaoTao = this.loaiHinhDaoTao.value().toString();

        const pageFilter = (isInitial || isReset) ? {} : { listBacDaoTao, listLoaiHinhDaoTao };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getPage(pageN, pageS, pageC, this.state.filter, done);
    }

    onClearSearch = (e) => {
        e.preventDefault();
        ['bacDaoTao', 'loaiHinhDaoTao'].forEach(key => this[key]?.value(''));
        this.changeAdvancedSearch();
    }

    syncPreview = (item) => {
        T.alert('Đang xử lý', 'warning', false, null, true);
        // this.props.syncPreview(item, (res) => {
        //     T.alert('Lấy dữ liệu đồng bộ thành công', 'success', false, 1000);
        //     this.syncPreviewModal.show(res, item);
        // });
        this.props.syncData(item, () => {
            T.alert('Đã đồng bộ thành công', 'success', false, 800);
        });
    }

    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tcSubDetailLog && this.props.tcSubDetailLog.page ? this.props.tcSubDetailLog.page : {
            pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null
        };

        let buttons = [];
        buttons.push({ type: 'primary', icon: 'fa fa-lg fa-forward', className: 'btn-success', tooltip: 'Sync toàn bộ', onClick: e => e.preventDefault() || this.syncPreview() });

        let table = renderTable({
            getDataSource: () => list || [],
            stickyHead: true,
            header: 'thead-light',
            emptyTable: 'Chưa có dữ liệu giao dịch học kỳ hiện tại',
            renderHead: () => (<tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>MSSV</th>
                <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khóa sinh viên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm tuyển sinh</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Bậc đào tạo</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ đào tạo</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoa</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngành</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Lớp</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chỉnh sửa lần cuối</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Người chỉnh sửa cuối</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>),
            renderRow: (item, index) => (<tr key={index}>
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.R} />
                <TableCell type='link' onClick={(e) => {
                    e.preventDefault();
                    this.subDetailLogModal.show(item.mssv);
                }} style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.mssv} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.ho || ''} ${item.ten || ''}`.trim().normalizedName()} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.khoaSinhVien} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namTuyenSinh} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenBacDaoTao} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiHinhDaoTao} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lop} />
                <TableCell style={{ whiteSpace: 'nowrap' }} type='date' content={item.timeModified} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.modifier} />
                <TableCell type='buttons' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item}>
                    <Tooltip title='Đồng bộ' arrow >
                        <button className='btn btn-success' onClick={e => e.preventDefault() || this.syncPreview(item)}>
                            <i className='fa fa-lg fa-forward' />
                        </button>
                    </Tooltip>
                </TableCell>
            </tr>),

        });

        return this.renderPage({
            title: 'Danh sách thay đổi học phần',
            icon: 'fa fa-money',
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.bacDaoTao = e} label='Bậc đào tạo' data={SelectAdapter_DmSvBacDaoTao} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} className='col-md-4' allowClear multiple />
                <div className='col-md-12 d-flex justify-content-end' style={{ gap: 10 }}>
                    <button className='btn btn-danger' onClick={this.onClearSearch}><i className='fa fa-lg fa-times' />Xóa tìm kiếm</button>
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}><i className='fa fa-lg fa-search' />Tìm kiếm</button>
                </div>
            </div>,
            breadcrumb: ['Danh sách thay đổi học phần'],
            content: (<div className='tile'>
                <div className="tile-body row">
                    <div className='col-md-12'>
                        {table}
                        <Pagination {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                            getPage={this.getPage} />
                    </div>
                </div>
                <SubDetailLogModal ref={e => this.subDetailLogModal = e} getSubDetailLogSinhVien={this.props.getSubDetailLogSinhVien} />
                <SyncPreviewModal ref={e => this.syncPreviewModal = e} sync={this.props.syncData} />
            </div>

            ),
            buttons
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcSubDetailLog: state.finance.tcSubDetailLog });
const mapActionsToProps = { getPage, getSubDetailLogSinhVien, syncPreview, syncData };
export default connect(mapStateToProps, mapActionsToProps)(SubDetailLog);
