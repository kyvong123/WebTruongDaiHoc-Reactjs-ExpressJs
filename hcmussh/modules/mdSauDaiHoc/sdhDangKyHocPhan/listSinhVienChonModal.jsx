import React from 'react';
import { renderTable, TableCell, TableHead, AdminModal } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { Tooltip } from '@mui/material';

class ListSinhVienModal extends AdminModal {
    state = { listSv: [], listSvChon: [] };

    componentDidMount = () => {
        this.disabledClickOutside();
    }

    onShow = (listSv) => {
        this.setState({ listSv });
    }

    table = (list) => renderTable({
        emptyTable: 'Chưa có sinh viên nào được chọn',
        getDataSource: () => list,
        stickyHead: list.length > 14,
        header: 'thead-light',
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center' }} >#</th>
                <TableHead style={{ width: '30%' }} content='MSSV' />
                <TableHead style={{ width: '40%' }} content='Họ tên' />
                <TableHead style={{ width: '30%' }} content='Ngành' />
                <TableHead style={{ width: 'auto' }} content='Năm tuyển sinh' />
                <TableHead style={{ width: 'auto' }} content='Lớp' />
                <TableHead style={{ width: 'auto' }} content='Loại hình đào tạo' />
                <TableHead style={{ width: 'auto' }} content='TTSV' />
                <TableHead style={{ width: 'auto' }} content='Thao tác' />
            </tr>
        ),
        renderRow: (item, index) => {
            return (
                <tr key={index} >
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} ></TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} ></TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} ></TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} ></TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namTuyenSinh} ></TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lop} ></TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.heDaoTao} ></TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenTinhTrangSV} ></TableCell>
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item}>
                        <Tooltip title='Xóa sinh viên' arrow>
                            <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.props.xoaSinhVien(item, this.props.listSinhVienChon)}>
                                <i className='fa fa-lg fa-trash' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr>
            );
        }
    })

    render = () => {
        return this.renderModal({
            title: 'Danh sách sinh viên đã chọn',
            size: 'elarge',
            body: <div>
                {this.table(this.state.listSv)}
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDangKyHocPhan: state.student.dtDangKyHocPhan });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ListSinhVienModal);
