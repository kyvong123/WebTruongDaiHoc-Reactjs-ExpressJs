import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderDataTable, FormSelect, FormTabs, TableHead } from 'view/component/AdminPage';
import { SelectAdapter_HocKy } from '../svThoiKhoaBieu/redux';
import { getLichNghiBu } from './redux';

class UserPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/lich-nghi-bu', () => {
            getLichNghiBu(null, data => {
                let { namHoc, hocKy } = data.semester;
                this.setState({
                    filter: { namHoc, hocKy }, itemsBu: data.itemsBu, itemsNghi: data.itemsNghi,
                }, () => {
                    this.genDataNamHoc(data.semester);
                });
            });
        });
    }

    genDataNamHoc = (curSemester) => {
        try {
            let nam = parseInt(this.props.system.user.data.khoaSV);
            const currYear = new Date().getFullYear();
            this.setState({ dataNamHoc: Array.from({ length: currYear - nam + 1 }, (_, i) => `${nam + i} - ${nam + i + 1}`) }, () => {
                this.namHocFilter.value(curSemester.namHoc);
                this.hocKyFilter.value(curSemester.hocKy);
            });
        } catch (error) {
            T.notify('Không tìm thấy khoá của sinh viên', 'danger');
            console.error(error);
        }
    }

    getData = () => {
        getLichNghiBu(this.state.filter, data => {
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

        return this.renderPage({
            title: 'Lịch nghỉ bù học phần',
            icon: 'fa fa-calendar-check-o',
            breadcrumb: ['Lịch nghỉ bù học phần'],
            header: <>
                <FormSelect ref={e => this.namHocFilter = e} className='col-md-6' label='Năm học' data={this.state.dataNamHoc || []} onChange={value => this.setState({ filter: { ...this.state.filter, namHoc: value.id } }, () => this.getData())} />
                <FormSelect ref={e => this.hocKyFilter = e} className='col-md-6' label='Học kỳ' data={SelectAdapter_HocKy} onChange={value => this.setState({ filter: { ...this.state.filter, hocKy: value.id } }, () => this.getData())} />
            </>,
            content: <div className='tile'>
                <FormTabs tabs={[
                    { title: 'Lịch bù', component: <>{tableBu(itemsBu)}</> },
                    { title: 'Lịch nghỉ', component: <>{tableNghi(itemsNghi)}</> }
                ]} />
            </div>
        });
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(UserPage);