import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, TableCell, getValue, renderTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getTccbSvKyLuatCauHinh, getTccbSvKyLuatCauHinhPage, ghiChuTccbSvKyLuatDssv } from './redux';
import { Tooltip } from '@mui/material';

class QtKyLuat extends AdminPage {
    state = { filter: {}, editId: null, dssvDuKien: [], mssvEdit: null }

    componentDidMount() {
        T.ready('/user/ctsv', () => {
            T.clearSearchBox();
            let { pageNumber, pageSize, pageCondition } = this.props && this.props.tccbSvKyLuat && this.props.tccbSvKyLuat.pageCauHinh ? this.props.tccbSvKyLuat.pageCauHinh : { pageNumber: 1, pageSize: 50, pageCondition: {} };
            this.props.getTccbSvKyLuatCauHinhPage(pageNumber, pageSize, pageCondition, this.state.filter);
        });
    }

    setData = (id) => {
        this.props.getTccbSvKyLuatCauHinh(id, (data) => {
            const { dssvDuKien } = data;
            this.setState({ editId: id, dssvDuKien });
        });
    }

    saveGhiChu = (id) => {
        this.props.ghiChuTccbSvKyLuatDssv(id, { ghiChuKhoa: getValue(this.ghiChuKhoa) }, () => {
            this.setState({ mssvEdit: null }, () => {
                this.setData(this.state.editId);
            });
        });
    }

    componentDssvDuKien = () => {
        const { dssvDuKien } = this.state;
        return (<div>
            <div className='d-flex justify-content-between align-items-baseline'>
                <h5>Danh sách sinh viên kỷ luật</h5>
                <div className='d-flex justify-content-end align-items-baseline'>
                    {dssvDuKien.length ? <button className='btn btn-success' type='button' onClick={(e) => {
                        e.preventDefault();
                        T.download(`/api/tccb/sv-ky-luat/dssv/download-excel?id=${JSON.stringify(this.state.editId)}`);
                    }}><i className='fa fa-file-excel-o mr-1' />Xuất Excel</button> : null}
                    <a className='btn btn-link text-secondary' href='#' onClick={(e) => e.preventDefault() || this.setState({ editId: null })}><i className='fa fa-times'></i></a>
                </div>
            </div>
            {renderTable({
                getDataSource: () => (dssvDuKien?.length ? dssvDuKien : []),
                header: 'thead-light',
                className: 'table-fix-col',
                stickyHead: (dssvDuKien || []).length > 10,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>STT</th>
                        <th style={{ width: '10%', whiteSpace: 'nowrap' }}>MSSV</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Họ tên</th>
                        <th style={{ width: '5%', whiteSpace: 'nowrap', textAlign: 'center' }}>ĐTB</th>
                        <th style={{ width: '5%', whiteSpace: 'nowrap', textAlign: 'center' }}>ĐTBTL</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Kỷ luật</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Kỷ luật bổ sung</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Ghi chú</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú CTSV</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (<tr key={index} style={{ backgroundColor: item.hinhThucKyLuatText ? 'white' : '#f7de97' }}>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.diemTrungBinh} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.diemTrungBinhTichLuy} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hinhThucKyLuatText || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hinhThucKyLuatBoSungText || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={
                        this.state.mssvEdit == item.mssv ? <FormTextBox className='mb-0' ref={e => this.ghiChuKhoa = e} /> : (item.ghiChuKhoa || '')
                    } />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChuCtsv || ''} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }}>
                        {this.state.mssvEdit != item.mssv ? <Tooltip title='Edit' arrow>
                            <button className='btn btn-info' onClick={e => { e.preventDefault(); this.setState({ mssvEdit: item.mssv }, () => this.ghiChuKhoa.value(item.ghiChuKhoa || '')); }}>
                                <i className='fa fa-lg fa-pencil' />
                            </button>
                        </Tooltip> : null}
                        {this.state.mssvEdit == item.mssv ? <Tooltip title='Lưu' arrow>
                            <button className='btn btn-success' onClick={e => { e.preventDefault(); this.saveGhiChu(item.id); }}>
                                <i className='fa fa-lg fa-check' />
                            </button>
                        </Tooltip> : null}
                        {this.state.mssvEdit == item.mssv ? <Tooltip title='Hủy' arrow>
                            <button className='btn btn-danger' onClick={e => { e.preventDefault(); this.setState({ mssvEdit: null }); }}>
                                <i className='fa fa-lg fa-close' />
                            </button>
                        </Tooltip> : null}
                    </TableCell>
                </tr>)
            })}
            {/* {dssvDuKien.length ? <h6>Tải xuống danh sách trên tại <span className='text-info' style={{ cursor: 'pointer' }}
                onClick={(e) => {
                    e.preventDefault();
                    T.download(`/api/tccb/sv-ky-luat/dssv/download-excel?id=${JSON.stringify(this.state.editId)}`);
                }}
            >đây</span></h6> : null} */}
        </div>);
    }

    render() {
        const permission = this.getUserPermission('ctsvKyLuat', ['read', 'write', 'delete', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tccbSvKyLuat && this.props.tccbSvKyLuat.pageCauHinh ?
            this.props.tccbSvKyLuat.pageCauHinh : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list,
                stickyHead: list && list.length > 12,
                loadingStyle: { backgroundColor: 'white' },
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'left' }}>#</th>
                        <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Năm học</th>
                        <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Học kỳ</th>
                        <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Khóa sinh viên</th>
                        <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Hệ đào tạo</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Tổng sinh viên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                multipleTbody: true,
                renderRow: (item, index) => (
                    <tbody key={index}>
                        <tr style={{ background: 'white' }}>
                            <TableCell type='text' style={{ textAlign: 'left' }} content={(pageNumber - 1) * pageSize + index + 1} />
                            <TableCell type='text' style={{ textAlign: 'left' }} content={item.namHoc || ''} />
                            <TableCell type='text' style={{ textAlign: 'center' }} content={item.hocKy || ''} />
                            <TableCell type='text' style={{ textAlign: 'left' }} content={item.khoaSinhVien || ''} />
                            <TableCell type='text' style={{ textAlign: 'left' }} content={item.heDaoTao || ''} />
                            <TableCell type='text' style={{ textAlign: 'left' }} content={item.tongSinhVien || ''} />
                            <TableCell type='checkbox' content={item.congBo} permission={permission} onChanged={() => this.changeActive(item)} />
                            <TableCell style={{ textAlign: 'center' }} content={
                                <Tooltip title='Xem chi tiết' arrow>
                                    <button className='btn btn-primary' onClick={e => { e.preventDefault(); this.setData(item.id); }}>
                                        <i className='fa fa-lg fa-pencil' />
                                    </button>
                                </Tooltip>
                            } />
                        </tr>
                        {this.state.editId == item.id ? <tr style={{ background: 'white' }}>
                            <TableCell colSpan={8} content={
                                this.componentDssvDuKien()
                            } />
                        </tr> : null}
                    </tbody>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-ban',
            title: 'Quá trình kỷ luật',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Quá trình kỷ luật'
            ],
            content: <>
                <div className='tile'>
                    <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                        getPage={this.getPage} />
                    {table}
                </div>
            </>,
            backRoute: '/user/ctsv',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbSvKyLuat: state.tccb.tccbSvKyLuat });
const mapActionsToProps = {
    getTccbSvKyLuatCauHinhPage, getTccbSvKyLuatCauHinh, ghiChuTccbSvKyLuatDssv
};
export default connect(mapStateToProps, mapActionsToProps)(QtKyLuat);