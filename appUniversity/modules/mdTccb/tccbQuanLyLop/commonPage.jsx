import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getTccbLopCommonPage } from './redux';
// import MultipleCreateModal from './multipleCreateModal';

class CommonPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            this.props.getTccbLopCommonPage(1, 50);
        });
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getTccbLopCommonPage(pageN, pageS, pageC, filter, done);
    }


    render() {
        const permission = this.getUserPermission('tccbLop');
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list = [] } = this.props.tccbLop && this.props.tccbLop.commonPage ? this.props.tccbLop.commonPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        const table = renderDataTable({
            emptyTable: 'Không có dữ liệu',
            stickyHead: list && list.length > 10,
            header: 'thead-light',
            // getDataSource: () => list.length ? list : [{}],
            data: list,
            renderHead: () => <tr>
                <th style={{ width: 'auto' }}>STT</th>
                <TableHead style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Khoá sinh viên' keyCol='khoaSinhVien' onKeySearch={this.handleKeySearch} />
                <TableHead style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Hệ đào tạo' keyCol='tenHe' onKeySearch={this.handleKeySearch} />
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell content={(pageNumber - 1) * pageSize + index + 1} />
                <TableCell content={item.khoaSinhVien} />
                <TableCell content={item.heDaoTao} />
                <TableCell permission={permission} type='buttons' onEdit={`/user/tccb/lop/item?khoa=${item.khoaSinhVien}&heDaoTao=${item.heDaoTao.replace('+', '%2b')}`} />
            </tr>
        });
        return this.renderPage({
            subTitle: 'Danh sách các khoá theo hệ',
            title: 'Lớp sinh viên',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>
                    Công tác sinh viên
                </Link>,
                'Lớp sinh viên',
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getTccbLopCommonPage} />
                {/* <MultipleCreateModal ref={e => this.modal = e} /> */}
            </>,
            backRoute: '/user/ctsv',
            collapse: [
                // { icon: 'fa-plus', permission: permission.write, type: 'warning', name: 'Tạo mới', onClick: () => this.modal.show() },
                { icon: 'fa-upload', permission: permission.write, type: 'light', name: 'Tải lên', onClick: () => this.importModal.show() },
                // { icon: 'fa-arrow-left', type: 'secondary', permission: permission.write, name: 'Quay lại', onClick: () => this.props.history.push('/user/dao-tao') }
            ]
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, tccbLop: state.tccb.tccbLop });
const mapActionsToProps = {
    getTccbLopCommonPage
};
export default connect(mapStateToProps, mapActionsToProps)(CommonPage);