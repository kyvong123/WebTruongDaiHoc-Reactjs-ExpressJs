import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderDataTable, TableCell } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';

class PhieuDangChoXuLy extends AdminPage {
    state = { listChosen: [] };

    onDelete(item) {
        this.props.delete(item, () => this.props.getData());
    }

    mapperTinhTrang = { '1': 'Chờ xử lý', '2': 'Đang xử lý', '3': 'Đã xử lý', '4': 'Từ chối' };

    mapperColor = { '1': '#FFCC33', '2': 'orange', '3': 'green', '4': 'red' };

    render() {
        const { listDon } = this.props;
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu đơn phúc tra',
            loadingStyle: { backgroundColor: 'white' },
            header: 'thead-light',
            stickyHead: false,
            data: listDon.filter(i => i.tinhTrang == 1 || i.tinhTrang == 2).sort((a, b) => a.ngayPhucTra - b.ngayPhucTra),
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Môn thi</th>
                    <th style={{ width: '50%', textAlign: 'center' }}>Nội dung</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tình trạng</th>
                    <th style={{ width: '30%', textAlign: 'center' }}>Ngày đăng ký</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.monThi} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={'Phúc tra điểm thi tuyển sinh môn ' + item.monThi} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap', color: this.mapperColor[item.tinhTrang], fontWeight: 'bold' }} content={this.mapperTinhTrang[item.tinhTrang]} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ngayPhucTra} />
                    <TableCell style={{ textAlign: 'center' }} content={
                        item.tinhTrang == 1 ?
                            <Tooltip title='Xoá' arrow placeholder='bottom'>
                                <button type='button' className='btn btn-danger' onClick={(e) => e.preventDefault() || this.onDelete(item)} disabled={this.props.readOnly}>
                                    <i className='fa fa-lg fa-trash' />
                                </button>
                            </Tooltip> : ''
                    } />
                </tr>
            )
        });
        return <>
            <div className='tile' >
                <h5>2. Phiếu đang chờ xử lý</h5>
                {table}
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
};
export default connect(mapStateToProps, mapActionsToProps)(PhieuDangChoXuLy);
