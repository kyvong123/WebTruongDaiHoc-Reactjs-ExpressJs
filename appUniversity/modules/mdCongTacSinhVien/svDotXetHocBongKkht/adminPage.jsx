import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import { getSvDotXetHocBongKkhtPage, createSvDotXetHocBongKkht, deleteSvDotXetHocBongKkht } from './redux/redux';

class SvDotXetHocBongKkhtPage extends AdminPage {
    state = { length: 0, dssv: [], sortTerm: 'timeModified_DESC' }
    defaultSortTerm = 'timeModified_DESC'

    componentDidMount() {
        T.ready('/user/ctsv', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.getPage(undefined, undefined, '');
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSvDotXetHocBongKkhtPage(pageN, pageS, pageC, filter, done);
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.dotModal.show();
    }

    createDot = (item, done) => this.props.createSvDotXetHocBongKkht(item, (value) => {
        this.props.history.push({ pathname: `/user/ctsv/hoc-bong-khuyen-khich/edit/${value.id}` });
        done && done();
    });

    deleteDot = (e, item, done) => {
        e.preventDefault();
        T.confirm('Xóa đợt', 'Bạn có chắc bạn muốn xóa đợt xét học bổng khuyến khích này?', true, isConfirm =>
            isConfirm && this.props.deleteSvDotXetHocBongKkht(item.id));
        done && done();
    }

    render() {
        const permission = this.getUserPermission('ctsvDotXetHocBongKkht', ['write', 'delete', 'manage']);
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.svDotXetHocBongKkht?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, list: null };
        let table = renderDataTable({
            emptyTable: 'Không tìm thấy đợt xét học bổng khuyến khích',
            data: list,
            header: 'thead-light',
            stickyHead: list && list.length > 12 ? true : false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHead style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên đợt' keyCol='tenDot' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Năm học' keyCol='namHoc' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Học kỳ' keyCol='hocKy' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thao tác' keyCol='thaoTac' />
                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'center' }} content={indexOfItem} />
                        <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.tenDot} onClick={(e) => e.preventDefault() || this.props.history.push({ pathname: `/user/ctsv/hoc-bong-khuyen-khich/edit/${item.id}` })} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namHoc} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.hocKy} />
                        <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={permission}
                            onEdit={(e) => e.preventDefault() || this.props.history.push({ pathname: `/user/ctsv/hoc-bong-khuyen-khich/edit/${item.id}` })}
                            onDelete={this.deleteDot} >
                        </TableCell>
                    </tr >
                );
            }
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Đợt xét học bổng khuyến khích',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Đợt xét học bổng'
            ],
            content: (<>
                <div className='tile'>
                    <div className='row'>
                        <div className='col-md-12'>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h4 className='tile-title'>Danh sách cấu hình đợt đánh giá</h4>
                            </div>
                        </div>
                    </div>
                    <div>{table}</div>
                </div>

                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                    getPage={this.getPage} pageRange={5} />
            </>),
            backRoute: '/user/ctsv',
            onCreate: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/ctsv/hoc-bong-khuyen-khich/edit/new') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, svDotXetHocBongKkht: state.ctsv.svDotXetHocBongKkht });
const mapActionsToProps = { getSvDotXetHocBongKkhtPage, createSvDotXetHocBongKkht, deleteSvDotXetHocBongKkht };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SvDotXetHocBongKkhtPage);