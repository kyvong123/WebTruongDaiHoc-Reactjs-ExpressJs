


import React from 'react';
import { AdminModal, renderTable, TableCell } from 'view/component/AdminPage';

export class SubDetailLogModal extends AdminModal {
    state = { mssv: '', namHoc: '', hocKy: '', hocPhi: '' };

    onShow = (mssv) => {
        this.props.getSubDetailLogSinhVien(mssv, result => {
            this.setState({ list: result, mssv });
        });
    };

    render = () => {
        const thaoTac = {
            'I': {
                color: 'green',
                name: 'Thêm học phần',
                classIcon: 'fa fa-check-circle-o'
            },
            'D': {
                color: 'red',
                name: 'Xóa học phần',
                classIcon: 'fa fa-check-circle'
            },
            'C': {
                color: '#9336B4',
                name: 'Chuyển mã loại đăng ký',
                classIcon: 'fa fa-exchange'
            }
        };
        let table = renderTable({
            getDataSource: () => this.state.list || [],
            stickyHead: this.state?.list?.length > 15,
            header: 'thead-light',
            divStyle: { height: '70vh' },
            emptyTable: 'Dữ liệu trống',
            renderHead: () => (<tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'right' }}>Thao tác</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã học phần</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã môn học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tên môn học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số tín chỉ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tổng số tiết</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại đăng ký</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học kỳ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian thay đổi</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Người thay đổi</th>
            </tr>),
            renderRow: (item, index) => (<tr key={index}>
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content=
                    {
                        <div style={{ color: thaoTac[item.thaoTac].color }}>
                            <i className={thaoTac[item.thaoTac].classIcon} /> {thaoTac[item.thaoTac].name}
                        </div>
                    } />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.maHocPhan} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.maMonHoc} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.soTinChi} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.tongSoTiet} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.loaiDangKy} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.namHoc} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.hocKy} />
                <TableCell type='date' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.timeModified} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.modifier} />
            </tr>)
        });
        return this.renderModal({
            size: 'elarge',
            title: `Chi tiết học phần thay đổi chưa được đồng bộ - ${this.state.mssv}`,
            body: <>
                {table}
            </>
        });
    }
}