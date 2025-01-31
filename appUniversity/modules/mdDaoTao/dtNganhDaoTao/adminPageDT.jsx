import React from 'react';
import { connect } from 'react-redux';
import { getDtNganhPage, deleteDtNganh, updateDtNganh, createDtChuyenNganh, updateDtChuyenNganh, deleteDtChuyenNganh } from '../dtNganhDaoTao/redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormSelect } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DtDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import ChuyenNganhModal from './ChuyenNganhModel';
import NganhModal from './NganhModal';

class DtNganhPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            const user = this.props.system.user;
            if (!Number(user?.isPhongDaoTao)) {
                const maDonVi = user.maDonVi || '';
                this.donVi.value(Number(maDonVi));
                this.khoaFilter.value(Number(maDonVi));
            }
            this.props.getDtNganhPage();
        });
    }

    handleKichHoatNganh = (maNganh, value) => {
        if (value == 0) {
            T.confirm('Xác nhận hủy kích hoạt ngành', 'Bạn có chắc muôn hủy kích hoạt ngành này?<br><small class="text-danger">Tất cả các chuyên ngành liên quan cũng sẽ bị hủy kích hoạt.</small>', isConfirmed => isConfirmed && this.props.updateDtNganh(maNganh, { kichHoat: Number(value) }));
        } else {
            this.props.updateDtNganh(maNganh, { kichHoat: Number(value) });
        }


    }

    handleDeleteNganh = (e, maNganh) => {
        e.preventDefault();
        T.confirm('Xác nhận xóa ngành', 'Bạn có chắc muôn xóa ngành này?<br><small class="text-danger">Tất cả các chuyên ngành liên quan cũng sẽ bị xóa.</small>', isConfirmed => isConfirmed && this.props.deleteDtNganh(maNganh));
    }

    handleDeleteChuyenNganh = (e, maChuyenNganh) => {
        e.preventDefault();
        T.confirm('Xác nhận xóa chuyên ngành', 'Bạn có chắc muôn xóa chuyên ngành này?', isConfirmed => isConfirmed && this.props.deleteDtChuyenNganh(maChuyenNganh));
    }

    filterKhoa = (value) => {
        console.log(value);
        this.props.getDtNganhPage(undefined, undefined, '', { maKhoa: value ? value.id : null }, T.cookie('dtNganhDaoTao:filter', value.id));
    }


    render() {
        const permissionNganhDaoTao = this.getUserPermission('dtNganhDaoTao'),
            permissionDaoTao = this.getUserPermission('dtChuongTrinhDaoTao', ['manage']),
            permission = {
                write: permissionNganhDaoTao.write || permissionDaoTao.manage,
                delete: permissionNganhDaoTao.delete || permissionDaoTao.manage
            };


        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtNganhDaoTao && this.props.dtNganhDaoTao.page ?
            this.props.dtNganhDaoTao.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null, pageCondition: null };
        const table = !(list && list.length > 0) ? 'Không có dữ liệu ngành đào tạo' :
            renderTable({
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '35%' }}>Tên</th>
                        <th style={{ width: '35%' }}>Tên tiếng anh</th>
                        <th style={{ width: '30%' }}>Khoa</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã lớp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                multipleTbody: true,
                renderRow: (item, index) => (
                    <tbody key={index}>
                        <tr key={`${index}-1`}>
                            <TableCell type='text' className='text-primary' style={{ textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                            <TableCell type='text' className='text-primary' content={item.maNganh} onClick={() => this.modal.show(item)} />
                            <TableCell type='text' className='text-primary' content={item.tenNganh} />
                            <TableCell type='text' className='text-primary' content={item.tenTiengAnh} />
                            <TableCell type='text' className='text-primary' content={item.tenKhoa} />
                            <TableCell type='text' className='text-primary' content={item.maLop} />
                            <TableCell type='checkbox' content={item.kichHoat} permission={permission} onChanged={value => this.handleKichHoatNganh(item.maNganh, value)} />
                            <TableCell type='buttons' style={{ textAlign: 'right' }} content={item} permission={permission} onEdit={(e) => { e.preventDefault(); this.nganhModal.show(item); }} onDelete={e => this.handleDeleteNganh(e, item.maNganh)}>
                                {permission.write && <Tooltip title='Thêm chuyên ngành' arrow>
                                    <button className='btn btn-success' onClick={(e) => { e.preventDefault(); this.chuyenNganhModal.show({ maNganh: item.maNganh }); }}>
                                        <i className='fa fa-lg fa-plus' />
                                    </button>
                                </Tooltip>}
                            </TableCell>
                        </tr>
                        {
                            (this.props.dtNganhDaoTao?.dsChuyenNganh || []).filter(subItem => subItem.maNganh ? subItem.maNganh == item.maNganh : false).map((subItem, subindex) => (
                                <tr key={`${index}-2-${subindex}`}>
                                    <TableCell />
                                    <TableCell type='text' style={{ textAlign: 'left' }} content={subItem.ma} />
                                    <TableCell type='text' content={subItem.ten} />
                                    <TableCell type='text' content={subItem.tenTiengAnh} />
                                    <TableCell type='text' content={item.tenKhoa} />
                                    <TableCell type='text' content={subItem.maLop} />
                                    <TableCell type='checkbox' content={subItem.kichHoat} permission={permission} onChanged={value => this.props.updateDtChuyenNganh(subItem.ma, { kichHoat: Number(value) })} />
                                    <TableCell type='buttons' style={{ textAlign: 'right' }} content={subItem} permission={permission} onEdit={() => this.chuyenNganhModal.show(subItem)} onDelete={(e) => this.handleDeleteChuyenNganh(e, subItem.ma)} />
                                </tr >
                            ))
                        }
                    </tbody>

                )
            });


        return this.renderPage({
            icon: 'fa fa-cube',
            title: 'Danh sách Ngành đào tạo',
            header: permissionNganhDaoTao.read && <FormSelect ref={e => this.khoaFilter = e} data={SelectAdapter_DtDmDonVi()} style={{ width: '400px', marginBottom: '0' }} placeholder='Chọn khoa/bộ môn' onChange={this.filterKhoa} allowClear />,
            subTitle: <FormSelect ref={e => this.donVi = e} data={SelectAdapter_DtDmDonVi()} readOnly />,
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Danh sách Ngành đào tạo'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDtNganhPage} />
                <ChuyenNganhModal ref={e => this.chuyenNganhModal = e} permission={permission} readOnly={!permission.write} />
                <NganhModal ref={e => this.nganhModal = e} permission={permission} readOnly={!permission.write} />
            </>,
            backRoute: '/user/dao-tao',
            onCreate: permission && permission.write ? (e) => { e.preventDefault(); this.nganhModal.show(); } : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtNganhDaoTao: state.daoTao.dtNganhDaoTao });
const mapActionsToProps = { getDtNganhPage, deleteDtNganh, updateDtNganh, createDtChuyenNganh, updateDtChuyenNganh, deleteDtChuyenNganh };
export default connect(mapStateToProps, mapActionsToProps)(DtNganhPage);