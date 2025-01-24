import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import BaoNghiModal from 'modules/mdGiangVien/gvLichGiangDay/BaoNghiModal';
import BaoBuModal from 'modules/mdGiangVien/gvLichGiangDay/BaoBuModal';


class SectionTuanHoc extends AdminPage {
    state = { listTuanHoc: [], listAddTuanHoc: [] }

    setValue = (data) => {
        this.setState({ listTuanHoc: data, listAddTuanHoc: [] });
    }

    getValue = () => {
        return this.state.listTuanHoc;
    }

    getDataTuan = () => {
        this.props.getData(() => T.alert('Xử lý thành công', 'success', false, 500));
    }

    renderTiet = (tuan) => {
        let { tietBatDau, soTietBuoi, thoiGianBatDau, thoiGianKetThuc } = tuan;
        let tietKetThuc = tietBatDau + soTietBuoi - 1;
        const dataTiet = tietBatDau == tietKetThuc ? tietBatDau : `${tietBatDau} - ${tietKetThuc}`;
        return <>
            {`Tiết: ${dataTiet} (${thoiGianBatDau} - ${thoiGianKetThuc})`}
            <br />
            {tuan.isLate ? `Đi trễ: ${tuan.ghiChu}` : (tuan.isSoon ? `Về sớm: ${tuan.ghiChu}` : tuan.ghiChu)}
        </>;
    }

    mapperTiet = (item) => {
        if (item.isNgayLe) return `Nghỉ lễ: ${item.tenNgayLe}`;
        else if (item.isNghi) return `Giảng viên báo nghỉ: ${item.ghiChu || ''}`;
        else if (item.isVang) return `Lịch học vắng: ${item.ghiChu || ''}`;
        else return this.renderTiet(item);
    }

    handleDownloadTuan = () => {
        let { listTuanHoc = [] } = this.state, { fullData } = this.props,
            { namHoc, hocKy, coSo, maMonHoc, tenMonHoc, maLop, tenKhoaBoMon, tongTiet, maHocPhan, tietLyThuyet, tietThucHanh, soLuongDuKien, siSo } = fullData[0],
            dataHocPhan = {
                namHoc, hocKy, coSo, maMonHoc, tenMonHoc, maLop, tenKhoaBoMon, tongTiet, maHocPhan, tietLyThuyet, tietThucHanh, soLuongDuKien, siSo
            };
        if (!listTuanHoc.length) return T.notify('Học phần chưa có tuần học nào!', 'danger');
        T.handleDownload(`/api/dt/gv/lich-giang-day/download-lich-day?dataHocPhan=${T.stringify(dataHocPhan)}`);
    }

    tableTuan = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Chưa có tuần học nào!',
        header: 'thead-light',
        stickyHead: list && list.length > 10,
        renderHead: () => <tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>STT</th>
            <th style={{ width: '5%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tuần</th>
            <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày học</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Cơ sở</th>
            <th style={{ width: '5%', whiteSpace: 'nowrap', textAlign: 'center' }}>Thứ</th>
            <th style={{ width: '5%', whiteSpace: 'nowrap', textAlign: 'center' }}>Phòng</th>
            <th style={{ width: '35%', whiteSpace: 'nowrap' }}>Tiết học</th>
            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Giảng viên</th>
            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Trợ giảng</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', display: this.props.system.user.isStaffTest || this.props.system.user.permissions.includes('quanLyDaoTao:Test') ? '' : 'none' }}>Thao tác</th>
        </tr>,
        renderRow: (item, index) => {
            const { shcc } = this.props.system.user;
            return (<tr key={index} style={{ backgroundColor: item.isNgayLe || item.isNghi ? '#e9e9e9' : '' }}>
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={new Date(item.ngayHoc).getWeek()} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={T.convertDate(item.ngayHoc, 'DD/MM/YYYY')} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.coSoPhong || item.coSo} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.thu == 8 ? 'CN' : item.thu} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.phong} />
                <TableCell content={this.mapperTiet(item)} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.giangVien && item.giangVien.length ? item.giangVien.map((gv, i) => <div key={i}>{gv}</div>) : ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.troGiang && item.troGiang.length ? item.troGiang.map((tg, i) => <div key={i}>{tg}</div>) : ''} />
                <TableCell type='buttons' style={{ textAlign: 'center', display: (item.shccGiangVien.includes(shcc) || item.shccTroGiang.includes(shcc)) && (this.props.system.user.isStaffTest || this.props.system.user.permissions.includes('quanLyDaoTao:Test')) ? '' : 'none' }} content={item}>
                    <Tooltip title='Báo nghỉ tuần học' arrow>
                        <button className='btn btn-danger' style={{ display: !(item.isNgayLe || item.isNghi || item.isVang) ? '' : 'none' }} onClick={e => e.preventDefault() || this.baoNghiModal.show(item)}>
                            <i className='fa fa-lg fa-power-off' />
                        </button>
                    </Tooltip>
                    <Tooltip title='Báo bù tuần học' arrow>
                        <button className='btn btn-info' style={{ display: item.isNghi || item.isVang ? '' : 'none' }} onClick={e => e.preventDefault() || this.baoBuModal.show({ ...item, isEdit: false })}>
                            <i className='fa fa-lg fa-retweet' />
                        </button>
                    </Tooltip>
                </TableCell>
            </tr>);
        }
    })

    render() {
        let { listTuanHoc = [] } = this.state, { fullData = [] } = this.props, { tongTiet } = fullData[0] || { tongTiet: 0 };
        let tongTietRai = listTuanHoc.filter(i => !(i.isNgayLe || i.isNghi)).reduce((total, curr) => total + parseInt(curr.soTietBuoi), 0);

        return <>
            <BaoBuModal ref={e => this.baoBuModal = e} dataTuan={listTuanHoc} baoBu={this.getDataTuan} />
            <BaoNghiModal ref={e => this.baoNghiModal = e} baoNghi={this.getDataTuan} />
            <div className='d-flex'>
                {<button className='btn btn-info' type='button' style={{ width: 'fit-content', margin: '10px' }} onClick={this.handleDownloadTuan}>
                    <i className='fa fa-lg fa-download' /> Export lịch dạy
                </button>}
            </div>
            <div style={{ fontWeight: 'bold', margin: '10px 0' }}> Tổng số tiết rải/Tổng số tiết: {tongTietRai}/{tongTiet} </div>
            <div>
                {this.tableTuan(listTuanHoc)}
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionTuanHoc);