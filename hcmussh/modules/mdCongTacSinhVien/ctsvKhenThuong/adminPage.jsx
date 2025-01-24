import Pagination from 'view/component/Pagination';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell, FormCheckbox } from 'view/component/AdminPage';
import { getAllCtsvKhenThuong, getCtsvKhenThuong, createCtsvKhenThuong, updateCtsvKhenThuong, deleteCtsvKhenThuong, getPageCtsvKhenThuong, getPageCtsvKhenThuongGroup } from './redux';
import ModalCtsvKhenThuong from './modal/adminModal';
import ImportModal from './modal/importModal';
import { ComponentTableKhenThuong } from './componentKhenThuong';
import CreateRequest from 'modules/mdHanhChinhTongHop/hcthSoDangKy/components/createRequest';

export const MAPPER_DOI_TUONG = {
    CN: 'Cá nhân',
    TT: 'Tập thể'
};


class AdminCtsvKhenThuongPage extends AdminPage {
    isGrouping = false;
    filter = {}

    componentDidMount() {
        T.ready('/user/ctsv', () => {
            this.getPage();
        });
    }

    getPage = (pageNumber, pageSize, pageCondition) => {
        if (this.isGrouping) {
            this.filter = {};
            this.props.getPageCtsvKhenThuongGroup(pageNumber, pageSize, pageCondition, this.filter);
        } else {
            this.props.getPageCtsvKhenThuong(pageNumber, pageSize, pageCondition, this.filter);
        }
    }

    delete = (id) => {
        T.confirm('Xác nhận xóa quyết định khen thưởng?', '', isConfirm => isConfirm && this.props.deleteCtsvKhenThuong(id));
    }

    handleKeySearch = (data) => {
        const [key, value] = data.split(':');
        this.filter[key] = value;
        this.getPage(null, null, '', this.state.filter);
    }

    moRongDoiTuong = (item) => {
        this.filter.ks_hoTen = item.hoTenSv;
        this.filter.ks_lop = item.maLop;
        this.isGrouping = false;
        this.groupCheck.value(false);
        this.getPage();
    }

    render() {
        const permission = this.getUserPermission('ctsvKhenThuong');
        const { pageNumber = 1, pageSize = 50, totalItem = '', pageTotal = '', pageCondition = '', list = [] } = this.props.ctsvKhenThuong && this.props.ctsvKhenThuong.page ? this.props.ctsvKhenThuong.page : {};
        return this.renderPage({
            icon: 'fa fa-gift',
            title: 'Quyết định khen thưởng sinh viên',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>
                    Công tác sinh viên
                </Link>,
                'Quyết định khen thưởng sinh viên',
            ],
            content: (
                <>
                    <div className='tile'>
                        <div>
                            <FormCheckbox ref={e => this.groupCheck = e} label='Hiển thị theo đối tượng' onChange={value => { this.isGrouping = value; this.getPage(); }} />
                        </div>
                        {this.isGrouping ? renderTable({
                            getDataSource: () => list,
                            stickyHead: true, hover: false,
                            renderHead: () => (<tr>
                                <th style={{ whiteSpace: 'nowrap' }}>Loại đối tượng</th>
                                <th style={{ whiteSpace: 'nowrap', width: '20%' }}>Cá nhân</th>
                                <th style={{ whiteSpace: 'nowrap', width: '20%' }}>Tập thể</th>
                                <th style={{ whiteSpace: 'nowrap' }}>Số quyết định</th>
                                <th style={{ whiteSpace: 'nowrap' }}>Năm đạt</th>
                                <th style={{ whiteSpace: 'nowrap', width: '60%' }}>Thành tích</th>
                            </tr>),
                            renderRow: (item, index) => {
                                const dsThanhTich = T.parse(item.dsThanhTich) || [{}];
                                return dsThanhTich.map((thanhTich, subIndex) => <tr key={`${index}.${subIndex}`}>
                                    {!subIndex && <>
                                        <TableCell rowSpan={dsThanhTich.length} style={{ whiteSpace: 'nowrap' }} content={MAPPER_DOI_TUONG[item.loaiDoiTuong]} />
                                        <TableCell rowSpan={dsThanhTich.length} style={{ whiteSpace: 'nowrap' }} content={item.hoTenSv} />
                                        <TableCell rowSpan={dsThanhTich.length} style={{ whiteSpace: 'nowrap' }} content={item.maLop} />
                                    </>}
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={thanhTich.soQuyetDinh} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={thanhTich.namHoc} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`${subIndex + 1}. ${thanhTich.ten}`} />
                                </tr>);
                            },
                        }) :
                            <ComponentTableKhenThuong  {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition, list }} filter={this.filter} permission={permission} handleKeySearch={this.handleKeySearch} onEdit={this.modal?.show} onDelete={this.delete} />
                        }</div>
                    <ModalCtsvKhenThuong ref={e => this.modal = e} readOnly={!permission.write} requestModal={this.requestModal} />
                    <ImportModal ref={e => this.importModal = e} permission={permission} getPage={this.getPage} />
                    <CreateRequest ref={e => this.requestModal = e} onHide={this.onHideRequest} />
                    <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getPageCtsvKhenThuong} />
                </>
            ),
            backRoute: '/user/ctsv/',
            onCreate: () => permission.write && this.modal.show(),
            // onImport: () => permission.read && this.importModal.show()

        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, ctsvKhenThuong: state.ctsv.ctsvKhenThuong });
const mapActionsToProps = {
    getAllCtsvKhenThuong, getCtsvKhenThuong, createCtsvKhenThuong, updateCtsvKhenThuong, deleteCtsvKhenThuong, getPageCtsvKhenThuong, getPageCtsvKhenThuongGroup
};
export default connect(mapStateToProps, mapActionsToProps)(AdminCtsvKhenThuongPage);