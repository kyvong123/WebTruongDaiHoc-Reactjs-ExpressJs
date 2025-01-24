import React from 'react';
import { connect } from 'react-redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, renderDataTable, TableCell, TableHead, CirclePageButton } from 'view/component/AdminPage';
import { getStaffPage } from './redux';


class CBTTPage extends AdminPage {
    state = { isCBNTTabs: false, listCanBo: null, filter: {} };

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
        });
        this.getPage();
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getStaffPage(pageN, pageS, pageC, this.state.filter, done);
    }

    render = () => {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtCanBoNgoaiTruong && this.props.dtCanBoNgoaiTruong.pageCB ?
            this.props.dtCanBoNgoaiTruong.pageCB : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        const table = renderDataTable({
            data: list == null ? null : list,
            emptyTable: 'Không có dữ liệu',
            header: 'thead-light',
            stickyHead: true,
            divStyle: { height: '63vh' },
            renderHead: () => (<tr>
                <TableHead style={{ width: 'auto' }} content='#' />
                <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Số hiệu cán bộ' keyCol='shcc' onKeySearch={this.handleKeySearch} />
                <TableHead style={{ width: 'auto' }} content='Họ và tên' keyCol='hoTen' onKeySearch={this.handleKeySearch} />
                <TableHead style={{ width: 'auto' }} content='Ngạch' keyCol='ngach' onKeySearch={this.handleKeySearch} />
                <TableHead style={{ width: 'auto' }} content='Email' keyCol='email' onKeySearch={this.handleKeySearch} />
                <TableHead style={{ width: 'auto' }} content='SDT' keyCol='sdt' onKeySearch={this.handleKeySearch} />
                <TableHead style={{ width: 'auto' }} content='Trình độ' keyCol='trinhDo' onKeySearch={this.handleKeySearch} />
                <TableHead style={{ width: 'auto' }} content='Chức danh' keyCol='hocHam' onKeySearch={this.handleKeySearch} />
                <TableHead style={{ width: '100%' }} content='Đơn vị' keyCol='donVi' onKeySearch={this.handleKeySearch} />
            </tr>
            ),
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.shcc} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={<>
                            <span>{`${item.ho} ${item.ten}`}<br /></span>
                        </>} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenChucDanhNgheNghiep} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.email} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phone} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.trinhDo} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hocHam} />
                        <TableCell content={item.tenDonVi} />
                    </tr>
                );
            }
        });
        return <div>
            <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                <div className='btn-group'>
                    <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                        getPage={this.getPage} pageRange={5} />
                </div>
            </div>
            {table}
            <CirclePageButton type='export' tooltip='Xuất dữ liệu' onClick={e => e.preventDefault() || T.handleDownload('/api/dt/can-bo-ngoai-truong/export-can-bo')} />
        </div>;
    }
}

const mapStateToProps = state => ({ system: state.system, dtCanBoNgoaiTruong: state.daoTao.dtCanBoNgoaiTruong });
const mapActionsToProps = { getStaffPage };
export default connect(mapStateToProps, mapActionsToProps)(CBTTPage);