import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderDataTable, TableHead, TableCell, FormCheckbox } from 'view/component/AdminPage';
import { getCanBoDonViPage } from './redux';
import Pagination from 'view/component/Pagination';

class CanBoDonViPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
        });
        this.getPage();
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getCanBoDonViPage(pageN, pageS, pageC, this.state.filter, done);
    };

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    };

    render() {
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null;
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.canBoDonVi && this.props.canBoDonVi.page ? this.props.canBoDonVi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu',
            data: list,
            divStyle: { height: '80vh' },
            header: 'thead-light',
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (
                <tr>
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='STT' />
                    <TableHead style={{ width: '120px', textAlign: 'center' }} content='Mã cán bộ' keyCol='shcc' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Họ tên' keyCol='hoTen' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: '120px', textAlign: 'center' }} content='Ngày sinh' keyCol='ngaySinh' onKeySearch={onKeySearch} typeSearch='year' />
                    <TableHead style={{ width: '240px', textAlign: 'center' }} content='Số hợp đồng mới nhất' keyCol='soHopDongMoiNhat' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: '360px', textAlign: 'center' }} content='Đơn vị mới nhất' keyCol='donViMoiNhat' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: '120px', textAlign: 'center' }} content='Ngày bắt đầu làm việc' keyCol='ngayBatDau' onKeySearch={onKeySearch} typeSearch='date' />
                    <TableHead style={{ width: '120px', textAlign: 'center' }} content='Ngày kết thúc hợp đồng' keyCol='ngayKetThuc' onKeySearch={onKeySearch} typeSearch='date' />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.shcc} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<> <span> {`${item.ho} ${item.ten}`} <br /></span> </>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ngaySinh ? T.dateToText(item.ngaySinh, 'dd/mm/yyyy') : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soHopDongMoiNhat} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.donViMoiNhat} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ngayBatDau ? T.dateToText(item.ngayBatDau, 'dd/mm/yyyy') : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ngayKetThuc ? T.dateToText(item.ngayKetThuc, 'dd/mm/yyyy') : ''} />
                </tr>
            ),
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Cán bộ đơn vị',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>
                    Tổ chức cán bộ
                </Link>,
                'Cán bộ đơn vị',
            ],
            content: (
                <>
                    <div className='tile'>
                        <div style={{ marginBottom: '10px' }}>Kết quả: {<b>{totalItem}</b>} cán bộ</div>
                        <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                            <div className='title'>
                                <div style={{ gap: 10, display: 'inline-flex' }}>
                                    <FormCheckbox label='Tìm theo cột' onChange={(value) => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }} />
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
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, canBoDonVi: state.tccb.canBoDonVi });
const mapActionsToProps = { getCanBoDonViPage };
export default connect(mapStateToProps, mapActionsToProps)(CanBoDonViPage);
