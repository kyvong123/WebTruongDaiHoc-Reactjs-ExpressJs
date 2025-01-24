import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderDataTable, TableCell } from 'view/component/AdminPage';

class KetQuaXuLy extends AdminPage {
    state = { list: [], listChosen: [] };

    mapperTinhTrang = { '1': 'Chờ xử lý', '2': 'Đang xử lý', '3': 'Đã xử lý', '4': 'Từ chối' };

    mapperColor = { '1': '#FFCC33', '2': '#FFFACD', '3': 'green', '4': 'red' };

    render() {
        const { listDon } = this.props;
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu đơn phúc tra',
            loadingStyle: { backgroundColor: 'white' },
            header: 'thead-light',
            stickyHead: false,
            data: listDon.filter(i => i.tinhTrang == 3 || i.tinhTrang == 4).sort((a, b) => b.ngayTraKetQua - a.ngayTraKetQua),
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Tên môn thi</th>
                    <th style={{ width: '50%', textAlign: 'center' }}>Nội dung</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tình trạng</th>
                    <th style={{ width: '30%', textAlign: 'center' }}>Ngày trả kết quả</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Điểm ban đầu</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Kết quả</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.monThi} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={'Phúc tra điểm thi tuyển sinh môn ' + item.monThi} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap', color: this.mapperColor[item.tinhTrang], fontWeight: 'bold' }} content={this.mapperTinhTrang[item.tinhTrang]} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ngayTraKetQua} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.diemCu} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.diemMoi} />
                </tr>
            )
        });
        return <>
            <div className='tile' >
                <h5>3. Kết quả đăng ký</h5>
                {table}
            </div>
        </>;
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
};
export default connect(mapStateToProps, mapActionsToProps)(KetQuaXuLy);
