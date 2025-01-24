import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getDtLopCommonPage } from './redux';
import AddModal from './addModal';

class CommonPage extends AdminPage {
    state = { sortTerm: 'khoaSinhVien_DESC', filter: {} }
    defaultSortTerm = 'khoaSinhVien_DESC'

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.getPage(undefined, undefined, '');
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getDtLopCommonPage(pageN, pageS, pageC, filter, done);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    render() {
        const permission = this.getUserPermission('dtLop');
        const { pageNumber, pageSize, pageTotal, totalItem, list = [] } = this.props.dtLop && this.props.dtLop.commonPage ? this.props.dtLop.commonPage : { pageNumber: 1, pageSize: 25, pageTotal: 1, totalItem: 0, list: null };
        const table = renderDataTable({
            emptyTable: 'Không có dữ liệu',
            stickyHead: list && list.length > 10,
            header: 'thead-light',
            data: list,
            renderHead: () => <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}>STT</th>
                <TableHead style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Khoá sinh viên' keyCol='khoaSinhVien' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Hệ đào tạo' keyCol='tenHe' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell content={(pageNumber - 1) * pageSize + index + 1} />
                <TableCell content={item.khoaSinhVien} />
                <TableCell content={item.tenHe} />
                <TableCell permission={permission} type='buttons' onEdit={`/user/dao-tao/lop/item?khoa=${item.khoaSinhVien}&heDaoTao=${item.heDaoTao.replace('+', '%2b')}`} />
            </tr>
        });
        return this.renderPage({
            subTitle: 'Danh sách các khoá theo hệ',
            title: 'Lớp sinh viên',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>
                    Đào tạo
                </Link>,
                'Lớp sinh viên',
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                    getPage={this.getPage} pageRange={5} />

                {/* <MultipleCreateModal ref={e => this.modal = e} /> */}
                <AddModal ref={(e) => (this.modal = e)} readOnly={!permission.write} history={this.props.history} />
            </>,
            backRoute: '/user/dao-tao',
            collapse: [
                { icon: 'fa-plus', permission: permission.write, type: 'warning', name: 'Tạo mới', onClick: () => this.modal.show() },
                // { icon: 'fa-plus', permission: permission.write, type: 'warning', name: 'Tạo mới', onClick: () => this.modal.show() },
                // { icon: 'fa-arrow-left', type: 'secondary', permission: permission.write, name: 'Quay lại', onClick: () => this.props.history.push('/user/dao-tao') }
            ]
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, dtLop: state.daoTao.dtLop });
const mapActionsToProps = {
    getDtLopCommonPage
};
export default connect(mapStateToProps, mapActionsToProps)(CommonPage);