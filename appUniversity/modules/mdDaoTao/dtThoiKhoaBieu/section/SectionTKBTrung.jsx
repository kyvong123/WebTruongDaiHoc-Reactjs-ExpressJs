import React from 'react';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { DtThoiKhoaBieuGetNotFree } from '../redux';

class SectionTKBTrung extends AdminPage {

    state = { listTrung: [] }

    componentDidUpdate(prev) {
        if (T.stringify(prev.filter) != T.stringify(this.props.filter)) {
            this.props.setIsTrung(0);
            this.setState({ listTrung: [] }, () => this.init());
        }
    }

    init = () => {
        this.props.DtThoiKhoaBieuGetNotFree(this.props.filter, data => this.setState({ data }, () => {
            data.forEach(item => this.checkTrung(item));
        }));
    }

    checkTrung = (item) => {
        const { soTietBuoi: iSoTietBuoi, tietBatDau: iTietBatDau, maHocPhan, phong: iphong, thu: iThu } = item;
        this.props.dataHP.forEach(hocPhan => {
            let { tietBatDau, soTietBuoi, phong, thu } = hocPhan;
            if (phong && (maHocPhan != hocPhan.maHocPhan)) {
                let tietKetThuc = parseInt(tietBatDau) + parseInt(soTietBuoi) - 1;
                let iTietKetThuc = parseInt(iTietBatDau) + parseInt(iSoTietBuoi) - 1;
                if (!(iTietKetThuc < parseInt(tietBatDau) || parseInt(iTietBatDau) > tietKetThuc) && (phong == iphong) && (thu == iThu)) {
                    this.setState({ listTrung: [...this.state.listTrung, maHocPhan] }, () =>
                        this.props.setIsTrung(1));
                }
            }
        });
    }

    table = (data) => renderTable({
        getDataSource: () => data,
        stickyHead: data && data.length > 4,
        emptyTable: 'Không có học phần liên quan với cấu hình này! (Được phép lưu thay đổi)',
        header: 'thead-light',
        divStyle: { height: '25vh' },
        renderHead: () => <tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Mã học phần</th>
            <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Tên</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phòng</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Thứ</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Tiết bắt đầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Tiết/Buổi</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Bắt đầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kết thúc</th>
        </tr>,
        renderRow: (item, index) => {
            let isTrung = this.state.listTrung.includes(item.maHocPhan);
            return (<tr key={item.id} style={{ backgroundColor: isTrung ? '#fa847c' : '' }}>
                <TableCell content={index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                <TableCell type='number' content={item.thu == 8 ? 'CN' : item.thu} />
                <TableCell type='number' content={item.tietBatDau} />
                <TableCell type='number' content={item.soTietBuoi} />
                <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={parseInt(item.ngayBatDau)} />
                <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={parseInt(item.ngayKetThuc)} />
            </tr>);
        }
    })

    render() {
        return <>{this.table(this.state.data || [])}</>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    DtThoiKhoaBieuGetNotFree,
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionTKBTrung);