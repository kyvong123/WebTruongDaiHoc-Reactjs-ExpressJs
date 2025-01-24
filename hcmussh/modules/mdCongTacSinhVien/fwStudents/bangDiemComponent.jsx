import React from 'react';
import { renderTable, TableCell } from 'view/component/AdminPage';
import { getCtdtInfo } from './redux';

class BangDiem extends React.Component {
    state = { listCtdt: [] }
    colorMain = '#0139a6';
    componentDidMount() {
        let route = T.routeMatcher('/user/ctsv/profile/:mssv'),
            mssv = route.parse(window.location.pathname).mssv;
        getCtdtInfo(mssv, (data) => {
            this.setState({ listCtdt: data.items.map(monHoc => this.diemConvert(monHoc)), diemRotMon: data.diemRotMon.rotMon });
        });
    }

    diemConvert = (item) => {
        let diemThangChu = null, diemThangBon = null;
        if (parseFloat(item.maxDiemTK) >= 9) {
            diemThangChu = 'A+';
            diemThangBon = 4;
        } else if (parseFloat(item.maxDiemTK) >= 8.5) {
            diemThangChu = 'A';
            diemThangBon = 3.7;
        } else if (parseFloat(item.maxDiemTK) >= 8) {
            diemThangChu = 'B+';
            diemThangBon = 3.5;
        } else if (parseFloat(item.maxDiemTK) >= 7) {
            diemThangChu = 'B';
            diemThangBon = 3;
        } else if (parseFloat(item.maxDiemTK) >= 6) {
            diemThangChu = 'C+';
            diemThangBon = 2.5;
        } else if (parseFloat(item.maxDiemTK) >= 5.5) {
            diemThangChu = 'C';
            diemThangBon = 2;
        } else if (parseFloat(item.maxDiemTK) >= 5) {
            diemThangChu = 'D+';
            diemThangBon = 1.5;
        } else if (parseFloat(item.maxDiemTK) >= 4) {
            diemThangChu = 'D';
            diemThangBon = 1;
        } else {
            diemThangChu = item.maxDiemTK ? 'F' : null;
            diemThangBon = item.maxDiemTK ? 0 : null;
        }
        return { ...item, diemThangBon, diemThangChu };
    }

    render() {
        const dataNamHoc = (this.state.listCtdt || []).groupBy('namHocDuKien');
        const namHocKeys = Object.keys(dataNamHoc);

        let table = (list) => renderTable({
            getDataSource: () => list,
            emptyTable: 'Không có thông tin điểm trong năm học và học kỳ này',
            header: 'thead-light',
            stickyHead: false,
            renderHead: () => (
                <>
                    <tr>
                        <th rowSpan='2' style={{ widht: 'auto', whiteSpace: 'nowrap' }}>#</th>
                        <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã môn học</th>
                        <th rowSpan='2' style={{ width: '60%', whiteSpace: 'nowrap' }}>Tên môn học</th>
                        <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap' }}>TC</th>
                        <th colSpan='3' rowSpan='1' style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }}>Điểm tổng kết</th>
                        <th rowSpan='2' style={{ widht: 'auto', whiteSpace: 'nowrap' }}>Đạt</th>
                    </tr>
                    <tr>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thang điểm 10</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thang điểm chữ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thang điểm 4</th>
                    </tr>
                </>),
            renderRow: (item, index) => {
                let isPass = parseFloat(item.maxDiemTK) >= parseFloat(this.state.diemRotMon),
                    color = isPass ? this.colorMain : '#d3242c';
                return (
                    <tr key={index} >
                        <TableCell content={index + 1} />
                        <TableCell content={item.maMonHoc} />
                        <TableCell content={item.tenMonHoc ? JSON.parse(item.tenMonHoc).vi + (JSON.parse(item.tenMonHoc).en != '' ? ` (${JSON.parse(item.tenMonHoc).en})` : '') : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tongTinChi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 'bold', color }} content={item.maxDiemTK} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 'bold', color }} content={item.diemThangChu} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 'bold', color }} content={item.diemThangBon} />
                        <TableCell content={isPass ? <i className='fa fa-lg fa-check-circle text-success' /> : <i className='fa fa-lg fa-times-circle text-danger' />} />
                    </tr>
                );
            }
        });

        return (
            <React.Fragment>
                <div>
                    {
                        namHocKeys.map(key => {
                            const dataHocKy = dataNamHoc[key].groupBy('hocKyDuKien');
                            return Object.keys(dataHocKy).sort((a, b) => a - b ? - 1 : 0).map((hocKy, i) => {
                                return (
                                    <div className='tile' key={i}>
                                        <h4 style={{ margin: '10px', color: '#0139a6' }}>{(key == 'null' || hocKy == 'null') ? 'Ngoài kế hoạch' : `Năm học ${key} - Học kỳ ${hocKy}`} </h4>
                                        {table(dataHocKy[hocKy])}
                                    </div>
                                );
                            });
                        })
                    }
                </div>
            </React.Fragment>
        );
    }
}

export default BangDiem;