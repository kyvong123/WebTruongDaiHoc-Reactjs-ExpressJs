import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class ComponentHopDong extends AdminPage {
    render() {
        let mapper = {
            'HDLD': {
                permission: this.getUserPermission('qtHopDongLaoDong', ['read', 'write', 'delete']),
                url: '/user/tccb/qua-trinh/hop-dong-lao-dong/',
                name: 'Hợp đồng lao động'
            },
            'HDTN': {
                permission: this.getUserPermission('qtHopDongTrachNhiem', ['read', 'write', 'delete']),
                url: '/user/tccb/qua-trinh/hop-dong-trach-nhiem/',
                name: 'Hợp đồng trách nhiệm'
            },
            'HDVC': {
                permission: this.getUserPermission('qtHopDongVienChuc', ['read', 'write', 'delete']),
                url: '/user/tccb/qua-trinh/hop-dong-lam-viec/',
                name: 'Hợp đồng viên chức'
            },
            'HDDVTL': {
                permission: this.getUserPermission('qtHopDongDvtl', ['read', 'write', 'delete']),
                url: '/user/tccb/qua-trinh/hop-dong-dvtl/',
                name: 'Hợp đồng đơn vị trả lương'
            },
        };
        let danhSachHopDong = this.props.staff?.dataStaff?.danhSachHopDong ? this.props.staff?.dataStaff?.danhSachHopDong : [];
        const renderTableHopDong = (items) => renderTable({
            getDataSource: () => items, stickyHead: false,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Loại hợp đồng</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Số hợp đồng</th>
                    <th style={{ width: '15%', textAlign: 'center', whiteSpace: 'nowrap' }}>Bắt đầu hợp đồng</th>
                    <th style={{ width: '15%', textAlign: 'center', whiteSpace: 'nowrap' }}>Kết thúc hợp đồng</th>
                    <th style={{ width: '15%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày ký hợp đồng</th>
                    <th style={{ width: '15%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày tái ký HĐ</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell type='text' content={<b style={{ whiteSpace: 'nowrap' }}>{mapper[item.loaiHopDong].name}</b>} />
                    <TableCell type='text' content={<span>
                        Số: {mapper[item.loaiHopDong].permission.read ? <Link to={mapper[item.loaiHopDong].url + item.id} >{item.soHopDong}</Link> : item.soHopDong}
                    </span>} />
                    <TableCell style={{ whiteSpace: 'nowrap', color: 'blue', textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayBatDau} ></TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap', color: 'red', textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayKetThuc} ></TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap', color: 'blue', textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayKy} ></TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap', color: 'red', textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayKyTiepTheo} ></TableCell>
                </tr >)
        });

        return (
            <div className='tile' >
                <h3 className='tile-title'>Hợp đồng cán bộ</h3>
                <div className='tile-body row'>
                    <div className='col-md-12 form-group'>
                        {renderTableHopDong(danhSachHopDong)}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ staff: state.tccb.staff, system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentHopDong);