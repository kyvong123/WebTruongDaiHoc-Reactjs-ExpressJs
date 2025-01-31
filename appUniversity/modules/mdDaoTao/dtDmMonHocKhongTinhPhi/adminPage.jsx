import React from 'react';
import { AdminPage, AdminModal, FormSelect, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { SelectAdapter_DmMonHocAll } from 'modules/mdDaoTao/dmMonHoc/redux';
import { getDtDmMonHocKhongTinhPhiPage, createMonHocKhongTinhPhi, deleteMonHocKhongTinhPhi } from './redux';
import Pagination from 'view/component/Pagination';


class ModalMonHoc extends AdminModal {
    onShow = () => {
        this.maMonHoc.value('');
    }

    onSubmit = () => {
        let list = this.maMonHoc.value();
        list = list.join(', ');
        if (list == '') {
            T.notify('Chưa chọn môn học!', 'danger');
            this.maMonHoc.focus();
        } else {
            this.props.create(list, this.hide);
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Thêm môn học',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect ref={e => this.maMonHoc = e} className='col-md-12' label='Môn học' data={SelectAdapter_DmMonHocAll()} required multiple />
            </div>
        }
        );
    };
}

class DtDmMonHocKhongTinhPhi extends AdminPage {
    state = { sortTerm: 'maMonHoc_ASC', filter: {} }
    defaultSortTerm = 'maMonHoc_ASC'

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
        this.props.getDtDmMonHocKhongTinhPhiPage(pageN, pageS, pageC, filter, done);
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    delete = (item) => {
        T.confirm('Xác nhận', `Bạn có muốn xóa môn học ${T.parse(item.tenMonHoc, { vi: '' })?.vi}`, 'warning', true, isConfirm => {
            if (isConfirm) {
                this.props.deleteMonHocKhongTinhPhi(item.id);
            }
        });
    }

    render() {
        const permission = this.getUserPermission('dtDmMonHocKhongTinhPhi', ['write', 'delete', 'manage']);
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dtDmMonHocKhongTinhPhi?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, list: null };
        let table = renderDataTable({
            emptyTable: 'Chưa có dữ liệu',
            header: 'thead-light',
            data: list,
            stickyHead: list && list.length > 9 ? true : false,
            divStyle: { height: '69vh' },
            renderHead: () => (
                <>
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã' keyCol='maMonHoc' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                        <TableHead style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn học' keyCol='tenMonHoc' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                        <TableHead style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Khoa/Bộ môn' keyCol='khoa' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Xóa</th>
                    </tr>
                </>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index} >
                        <TableCell style={{ textAlign: 'right' }} content={indexOfItem} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maMonHoc} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.tenKhoa} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onDelete={() => this.delete(item)} />
                    </tr >
                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Môn học không tính phí',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/data-dictionary'>Từ điển dữ liệu</Link>,
                'Môn học không tính phí'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                    getPage={this.getPage} pageRange={5} />

                <ModalMonHoc ref={e => this.modal = e} create={this.props.createMonHocKhongTinhPhi}
                />
            </>,
            backRoute: '/user/dao-tao/data-dictionary',
            onCreate: (e) => e.preventDefault() || this.modal.show(),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDmMonHocKhongTinhPhi: state.daoTao.dtDmMonHocKhongTinhPhi });
const mapActionsToProps = { getDtDmMonHocKhongTinhPhiPage, createMonHocKhongTinhPhi, deleteMonHocKhongTinhPhi };
export default connect(mapStateToProps, mapActionsToProps)(DtDmMonHocKhongTinhPhi);
