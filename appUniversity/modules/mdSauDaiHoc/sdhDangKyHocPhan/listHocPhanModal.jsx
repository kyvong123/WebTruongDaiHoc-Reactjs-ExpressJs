import React from 'react';
import { renderTable, TableCell, TableHead, AdminModal } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { Tooltip } from '@mui/material';

class ListHocPhanModal extends AdminModal {
    state = { listHp: [], listHpChon: [] };

    componentDidMount = () => {
        this.disabledClickOutside();
    }

    onShow = (listHp) => {
        this.setState({ listHp });
    }

    table = (list) => renderTable({
        emptyTable: 'Chưa có học phần nào được chọn',
        getDataSource: () => list,
        stickyHead: list.length > 14,
        header: 'thead-light',
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <TableHead style={{ width: '30%' }} content='Mã học phần' />
                <TableHead style={{ width: '50%' }} content='Tên môn' />
                <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Lớp</th>
                <th style={{ width: 'auto' }}>TC</th>
                <th style={{ width: 'auto' }}>Tổng tiết</th>
                <th style={{ width: 'auto' }}>Phòng</th>
                <th style={{ width: 'auto' }}>Thứ</th>
                <th style={{ width: 'auto' }}>Tiết</th>
                <th style={{ width: 'auto' }}>Giảng viên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trợ giảng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày bắt đầu</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày kết thúc</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Sĩ số</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TTHP</th>
                <TableHead style={{ width: 'auto' }} content='Thao tác' />
            </tr>
        ),
        renderRow: (item, index) => {
            return (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maLop} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tongTinChi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tongTiet} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.thu} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tietBatDau ? `${item.tietBatDau} - ${item.tietBatDau + item.soTietBuoi - 1}` : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.giangVien && item.giangVien.length ? item.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.troGiang && item.troGiang.length ? item.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={item.ngayBatDau} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={item.ngayKetThuc} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={(item.siSo ? item.siSo : '0') + '/' + (item.soLuongDuKien ? item.soLuongDuKien : '0')} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenTinhTrang} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item}>
                        <Tooltip title='Xóa sinh viên' arrow>
                            <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.props.xoaHocPhan(item, this.props.listHocPhanChon)}>
                                <i className='fa fa-lg fa-trash' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr>
            );
        },
    })

    render = () => {
        return this.renderModal({
            title: 'Danh sách học phần đã chọn',
            size: 'elarge',
            body: <>
                {this.table(this.state.listHp)}
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDangKyHocPhan: state.student.dtDangKyHocPhan });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ListHocPhanModal);
