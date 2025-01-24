import React from 'react';
import { AdminPage, renderDataTable, TableCell } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';


export class ComponentTableKhenThuong extends AdminPage {

    render() {
        const { permission = {}, pageNumber, pageSize, list = null } = this.props;
        return renderDataTable({
            data: list,
            stickyHead: true,
            renderHead: () => (<tr>
                {/* <TableHead ref={e => this.ks_loaiDoiTuong = e} style={{ whiteSpace: 'nowrap' }} content='Loại đối tượng' typeSearch='select' data={[{ id: 'CN', text: 'Cá nhân' }, { id: 'TT', text: 'Tập thể' }]} onKeySearch={(ks) => this.props.handleKeySearch(ks)} keyCol='loaiDoiTuong' /> */}
                {/* <TableHead ref={e => this.ks_hoTen = e} style={{ whiteSpace: 'nowrap' }} content='Cá nhân' onKeySearch={(ks) => this.props.handleKeySearch(ks)} keyCol='hoTen' /> */}
                {/* <TableHead ref={e => this.ks_lop = e} style={{ whiteSpace: 'nowrap' }} content='Tập thể' onKeySearch={(ks) => this.props.handleKeySearch(ks)} keyCol='lop' /> */}
                <th style={{ whiteSpace: 'nowrap' }}>#</th>
                <th style={{ whiteSpace: 'nowrap', width: '20%' }}>Số quyêt định</th>
                {/* <th style={{ whiteSpace: 'nowrap', width: '50%' }}>Thành tích</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Năm đạt được</th> */}
                <th style={{ whiteSpace: 'nowrap', width: '30%' }}>Cán bộ xử lý</th>
                <th style={{ whiteSpace: 'nowrap' }}>Thời gian xử lý</th>
                <th style={{ whiteSpace: 'nowrap', width: '50%' }}>Ghi chú</th>
                <th style={{ whiteSpace: 'nowrap' }}>Ngày ký</th>
                <th style={{ whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>),
            renderRow: (item, index) => (<tr key={index}>
                {/* <TableCell style={{ whiteSpace: 'nowrap' }} content={MAPPER_DOI_TUONG[item.loaiDoiTuong]} /> */}
                {/* <TableCell style={{ whiteSpace: 'nowrap' }} content={<a href='#' onClick={(e) => e.preventDefault() || this.props.onEdit(item)}><span>{item.hoTenSv}</span><br />{item.mssv}</a>} /> */}
                {/* <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maLop} /> */}
                <td>{(pageNumber - 1) * pageSize + index + 1}</td>
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soCongVan} />
                {/* <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenThanhTich} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namHoc} /> */}
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNguoiXuLy} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.thoiGianXuLy} type='date' dateFormat='dd/mm/yyyy HH:MM:ss' />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ngayKy} type='date' dateFormat='dd/mm/yyyy' />
                <TableCell style={{ whiteSpace: 'nowrap' }} type='buttons' onDelete={() => this.props.onDelete(item.id)} permission={permission}>
                    <Tooltip title='Xem xét' arrow>
                        <button className='btn btn-info' onClick={(e) => e.preventDefault() || this.props.onEdit(item)}>
                            <i className='fa fa-lg fa-pencil-square-o' />
                        </button>
                    </Tooltip>
                </TableCell>
            </tr>),
        });
    }
}