import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import ImportSection from './importSection';
import Pagination from 'view/component/Pagination';
import { dtDiemMienGetPage, deleteDtDiemMien } from './redux';
import AddModal from './addModal';

class dtDiemMien extends AdminPage {
    defaultSortTerm = 'mssv_ASC'
    state = {
        page: null, filter: {}, sortTerm: 'mssv_ASC'
    }

    componentDidMount() {
        this.getPage(1, 50, '');
    }

    getPage = (pageN, pageS, pageC) => {
        let sort = this.state?.sortTerm || this.defaultSortTerm;
        let filter = { ...this.state.filter, sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] };
        this.props.dtDiemMienGetPage(pageN, pageS, pageC, filter);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => {
        this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        const { mssv, maMonHoc, namHoc, hocKy } = item;
        T.confirm('Hủy miễn môn học', `Bạn có chắc bạn muốn hủy miễn môn học ${maMonHoc} cho sinh viên ${mssv} không?`, true, isConfirm => {
            if (isConfirm) {
                this.props.deleteDtDiemMien({ mssv, maMonHoc, namHoc, hocKy }, () => {
                    T.alert('Hủy miễn môn học thành công', 'success', false, 1000);
                    this.getPage(1, 50, '');
                });
            }
        });
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.diemMien?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, pageCondition: '', list: null };

        let table = renderDataTable({
            data: list,
            stickyHead: list && list.length > 15,
            renderHead: () => <tr>
                <TableHead content='#' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} />
                <TableHead content='MSSV' style={{ width: '15%', textAlign: 'center', whiteSpace: 'nowrap' }} keyCol='mssv' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead content='Họ tên' style={{ width: '25%', textAlign: 'center', whiteSpace: 'nowrap' }} keyCol='hoTen' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead content='Môn học' style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }} keyCol='monHoc' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead content='Tên môn học' style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }} keyCol='tenMonHoc' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead content='Năm học' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} keyCol='namHoc' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead content='Học kỳ' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} keyCol='hocKy' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell content={index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.mssv} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maHocPhan} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' }).vi} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namHoc} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.hocKy} />
                <TableCell type='buttons' content={item} permission={{ delete: true }} onDelete={this.delete} />
            </tr>
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Quản lý điểm miễn',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/grade-manage'>Quản lý điểm</Link>,
                'Điểm miễn'
            ],
            content: <>

                <FormTabs tabs={[
                    {
                        title: 'Danh sách điểm miễn', component: <div className='tile'>
                            <div>{table}</div>
                            <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                                getPage={this.getPage} />
                        </div>
                    },
                    { title: 'Import excel', component: <ImportSection getPage={this.getPage} /> },
                ]} />
                <AddModal ref={e => this.modal = e} />
            </>,
            backRoute: '/user/dao-tao/grade-manage',
            buttons: { icon: 'fa-edit', tooltip: 'Cập nhật điểm miễn', className: 'btn btn-primary', onClick: e => this.showModal(e) },

        });
    }
}

const mapStateToProps = state => ({ system: state.system, diemMien: state.daoTao.diemMien });
const mapActionsToProps = { dtDiemMienGetPage, deleteDtDiemMien };
export default connect(mapStateToProps, mapActionsToProps)(dtDiemMien);