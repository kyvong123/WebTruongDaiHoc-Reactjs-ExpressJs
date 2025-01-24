import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderDataTable, FormSelect, FormTabs, TableHead } from 'view/component/AdminPage';
import { getLichNghiBu } from 'modules/mdDaoTao/dtMoPhongDangKy/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
export class LichNghiBuSection extends AdminPage {
    state = { listTKB: [], isSearch: false }

    setValue = (mssv) => {
        getLichNghiBu(mssv, null, data => {
            let { namHoc, hocKy } = data.semester;
            this.setState({
                mssv, filter: { namHoc, hocKy }, itemsBu: data.itemsBu, itemsNghi: data.itemsNghi,
            }, () => {
                this.namHocFilter.value(data.semester.namHoc);
                this.hocKyFilter.value(data.semester.hocKy);
            });
        });
    }

    getData = () => {
        let { mssv, filter } = this.state;
        getLichNghiBu(mssv, filter, data => {
            this.setState({ itemsBu: data.itemsBu, itemsNghi: data.itemsNghi });
        });
    }

    render() {
        let { itemsBu = [], itemsNghi = [] } = this.state;
        let tableBu = (list) => renderDataTable({
            emptyTable: 'Không có dữ liệu',
            data: list, stickyHead: list?.length > 15,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhan' />
                    <TableHead style={{ width: '70%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn học' keyCol='tenMonHoc' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày bù' typeSearch='date' keyCol='ngayBu' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Phòng' keyCol='phong' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thứ' keyCol='thu' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tiết' keyCol='tiet' />
                    <th style={{ width: '15%', whiteSpace: 'nowrap', }}>Giảng viên</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap', }}>Trợ giảng</th>
                </tr>),
            renderRow: (item, index) => {
                return (
                    <tr key={index} style={{ backgroundColor: '#fff' }}>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayBu} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.thu} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.tietBatDau} - ${item.tietBatDau + item.soTietBuoi - 1}`} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.giangVien && item.giangVien.length ? item.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.troGiang && item.troGiang.length ? item.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                    </tr >
                );
            }
        });

        let tableNghi = (list) => renderDataTable({
            emptyTable: 'Không có dữ liệu',
            data: list, stickyHead: list?.length > 15,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhan' />
                    <TableHead style={{ width: '70%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn học' keyCol='tenMonHoc' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày nghỉ' keyCol='ngayNghi' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Phòng' keyCol='phong' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thứ' keyCol='thu' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tiết' keyCol='tiet' />
                    <th style={{ width: '15%', whiteSpace: 'nowrap', }}>Giảng viên</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap', }}>Trợ giảng</th>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Lý do' />
                </tr>),
            renderRow: (item, index) => {
                return (
                    <tr key={index} style={{ backgroundColor: '#fff' }}>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayNghi} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.thu} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.tietBatDau} - ${item.tietBatDau + item.soTietBuoi - 1}`} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.giangVien && item.giangVien.length ? item.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.troGiang && item.troGiang.length ? item.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
                    </tr >
                );
            }
        });
        return (
            <>
                <div className='row'>
                    <FormSelect ref={e => this.namHocFilter = e} className='col-md-6' label='Năm học' data={SelectAdapter_SchoolYear} onChange={value => this.setState({ filter: { ...this.state.filter, namHoc: value.id } }, () => this.getData())} />
                    <FormSelect ref={e => this.hocKyFilter = e} className='col-md-6' label='Học kỳ' data={SelectAdapter_DtDmHocKy} onChange={value => this.setState({ filter: { ...this.state.filter, hocKy: value.id } }, () => this.getData())} />
                </div>
                <FormTabs tabs={[
                    { title: 'Lịch bù', component: <>{tableBu(itemsBu)}</> },
                    { title: 'Lịch nghỉ', component: <>{tableNghi(itemsNghi)}</> }
                ]} />
            </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(LichNghiBuSection);
