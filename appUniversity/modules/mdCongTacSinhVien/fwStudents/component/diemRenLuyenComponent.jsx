import React from 'react';
import { renderTable, TableCell } from 'view/component/AdminPage';
import { getDrlInfo } from '../redux';
import { Tooltip } from '@mui/material';

class BangDiemRenLuyen extends React.Component {
    state = { listDrlInfo: [] }
    colorMain = '#0139a6';
    componentDidMount() {
        let route = T.routeMatcher('/user/ctsv/profile/:mssv'),
            mssv = route.parse(window.location.pathname).mssv;
        getDrlInfo(mssv, (data) => {
            this.setState({ listDrlInfo: data.items });
        });
    }

    drlMapper(diem) {
        if (diem >= 90) {
            return <span className='font-weight-bold' style={{ color: '#019445' }}>Xuất sắc</span>;
        } else if (diem >= 80 && diem < 90) {
            return <span className='font-weight-bold' style={{ color: '#91cb63' }}>Tốt</span>;
        } else if (diem >= 65 && diem < 80) {
            return <span className='font-weight-bold' style={{ color: '#fdb041' }}>Khá</span>;
        } else if (diem >= 50 && diem < 65) {
            return <span className='font-weight-bold' style={{ color: '#f25b2a' }}>Trung bình</span>;
        } else {
            return diem != 0 ? <span className='font-weight-bold' style={{ color: '#e22024' }}>Yếu</span> : '';
        }
    }

    kyLuatMapper = (danhSachKyLuat, danhSachNgayXuLy, danhSachDrlMax, soKyLuat) => {
        if (soKyLuat == 0) return [];
        let danhSachKyLuats = danhSachKyLuat?.split('??') || [];
        let danhSachNgayXuLys = danhSachNgayXuLy?.split('??') || [];
        let danhSachDrlMaxs = danhSachDrlMax?.split('??') || [];
        let results = [];
        for (let i = 0; i < soKyLuat; i++) {
            danhSachKyLuats[i] = danhSachKyLuats[i]?.trim();
            danhSachNgayXuLys[i] = danhSachNgayXuLys[i]?.trim();
            danhSachDrlMaxs[i] = danhSachDrlMaxs[i]?.trim();
        }
        for (let i = 0; i < soKyLuat; i++) {
            let s = danhSachKyLuats[i];
            let drlMax = danhSachDrlMaxs[i];
            results.push(<div key={results.length}> <span>
                {i + 1}. {s} {drlMax ? `(Điểm rèn luyện tối đa ${drlMax})` : null}
            </span></div>);
        }
        return results;
    }


    render() {

        let table = (list) => renderTable({
            getDataSource: () => list,
            emptyTable: 'Không có dữ liệu điểm rèn luyện',
            header: 'thead-light',
            stickyHead: false,
            renderHead: () => (
                <>
                    <tr>
                        <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }}>Năm học</th>
                        <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Học kỳ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Điểm sinh viên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Điểm lớp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Điểm khoa</th>
                        <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }}>Điểm trung bình</th>
                        <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }}>Điểm tổng kết</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Xếp loại</th>
                        <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'left' }}>Kỷ luật</th>
                        <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian</th>
                    </tr>
                </>),
            renderRow: (item, index) => {
                return (
                    <tr key={index} >
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namHoc} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.hocKy} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.svSubmit} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ltSubmit} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.fSubmit} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<b>{item.diemTb}</b> || ''} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<>
                            {<div className='position-relative'>
                                {(<b>{item.tkSubmit}</b> || '')}
                                {item.lyDoTk && <Tooltip className='ml-2 text-primary' title={item.lyDoTk} arrow placeholder='right'><span style={{ position: 'absolute' }}><i className="pr-2 fa fa-lg fa-info-circle"></i></span></Tooltip>}
                            </div>}
                        </>} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={this.drlMapper(Number(item.tkSubmit || 0))} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.soKyLuat ? this.kyLuatMapper(item.danhSachKyLuat, item.danhSachNgayXuLy, item.danhSachDrlMax, item.soKyLuat) : ''} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM:ss' content={item.timeModified} />
                    </tr>
                );
            }
        });

        return (
            <React.Fragment>
                <div className='mt-2'>
                    {table(this.state.listDrlInfo)}
                </div>
            </React.Fragment>
        );
    }
}

export default BangDiemRenLuyen;