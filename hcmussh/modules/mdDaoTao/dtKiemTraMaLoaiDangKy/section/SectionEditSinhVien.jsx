import React from 'react';
import { connect } from 'react-redux';
import { FormSelect, renderDataTable, TableHead, TableCell, loadSpinner } from 'view/component/AdminPage';

import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DangKyHocPhanStudent, getDtDangKyHocPhanByStudent } from 'modules/mdDaoTao/dtDangKyHocPhan/redux';

import ThongTinSV from 'modules/mdDaoTao/dtDangKyHocPhan/component/thongTinSV';
import HocPhanModal from 'modules/mdDaoTao/dtKiemTraMaLoaiDangKy/component/hocPhanModal';
class SectionEditSinhVien extends React.Component {
    state = {
        selectedStu: false, isSvLoading: false, mssv: '',
        filter: {}, ksSearch: {}, sortTerm: 'maHocPhan_ASC',
    }
    defaultSortTerm = 'maHocPhan_ASC';
    mapperLoaiDangKy = {
        'KH': <span><i className='fa fa-lg fa-sign-in' /> KH</span>,
        'NKH': <span><i className='fa fa-lg fa-sign-out' /> NKH</span>,
        'NCTDT': <span><i className='fa fa-lg fa-info-circle' /> NCTĐT</span>,
        'CT': <span><i className='fa fa-lg fa-chevron-circle-right' /> CT</span>,
        'HL': <span><i className='fa fa-lg fa-repeat' /> HL</span>,
        'HV': <span><i className='fa fa-lg fa-chevron-circle-up' /> HV</span>,
    }

    loaiDangKy = [
        { id: 'KH', text: 'KH' },
        { id: 'NKH', text: 'NKH' },
        { id: 'NCTDT', text: 'NCTĐT' },
        { id: 'CT', text: 'CT' },
        { id: 'HL', text: 'HL' },
        { id: 'HV', text: 'HV' }
    ]

    componentDidMount() {
        this.props.getScheduleSettings(data => {
            let { namHoc, hocKy } = data.currentSemester;
            this.namHoc.value(namHoc);
            this.hocKy.value(hocKy);
            this.sinhVien.value('');
            this.setState({ namHoc, hocKy, selectedStu: false });
        });
    }

    getData = () => {
        let { namHoc, hocKy, mssv } = this.state;
        let filter = {
            ...this.state.ksSearch,
            sort: this.state?.sortTerm || this.defaultSortTerm,
            namHoc, hocKy
        };
        this.props.getDtDangKyHocPhanByStudent(mssv, filter, (data) => {
            this.setState({ listHocPhanDangKy: data, isSvLoading: false });
        });
    }

    getKetQuaDangKyHocPhan = () => {
        this.setState({ isSvLoading: true }, () => this.getData());
    }

    handleKeySearch = (data) => {
        this.setState({ ksSearch: { [data.split(':')[0]]: data.split(':')[1] } }, () => this.getData());
    }

    onSort = (sortTerm) => {
        this.setState({ sortTerm }, () => this.getData());
    }

    getKetQua = () => {
        if (this.sinhVien.value()) {
            let value = this.sinhVien.data();
            this.setState({ mssv: value.item.mssv }, () => {
                this.sinhVienModal.initData(value.item);
                this.getKetQuaDangKyHocPhan();
            });
        }
    }

    renderListKetQua = (list) => renderDataTable({
        data: list == null ? null : Object.keys(list.groupBy('maHocPhan')),
        emptyTable: 'Không tìm thấy học phần!',
        header: 'thead-light',
        stickyHead: true,
        divStyle: { height: '50vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <TableHead style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhanKQ'
                    onKeySearch={this.handleKeySearch} onSort={this.onSort}
                />
                <TableHead style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn' keyCol='tenMonHocKQ'
                    onKeySearch={this.handleKeySearch} onSort={this.onSort}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Lớp' keyCol='lopKQ'
                    onKeySearch={this.handleKeySearch} onSort={this.onSort}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='LĐK' keyCol='maLoaiDkyKQ'
                    onKeySearch={this.handleKeySearch} onSort={this.onSort} typeSearch='select' data={this.loaiDangKy || []} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Sĩ số' keyCol='siSoKQ'
                    onKeySearch={this.handleKeySearch} onSort={this.onSort}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tín chỉ' keyCol='tinChiKQ'
                    onKeySearch={this.handleKeySearch} onSort={this.onSort}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tổng tiết' keyCol='tongTietKQ'
                    onKeySearch={this.handleKeySearch} onSort={this.onSort}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Phòng' keyCol='phongKQ'
                    onKeySearch={this.handleKeySearch} onSort={this.onSort}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thứ' keyCol='thuKQ'
                    onKeySearch={this.handleKeySearch} onSort={this.onSort}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tiết' keyCol='tietKQ'
                    onKeySearch={this.handleKeySearch} onSort={this.onSort}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Giảng viên' keyCol='giangVienKQ'
                    onKeySearch={this.handleKeySearch} onSort={this.onSort}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Trợ giảng' keyCol='troGiangKQ'
                    onKeySearch={this.handleKeySearch} onSort={this.onSort}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày bắt đầu' keyCol='ngayBatDauKQ'
                    onSort={this.onSort}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày kết thúc' keyCol='ngayKetThucKQ'
                    onSort={this.onSort}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Đã đóng/Cần đóng' keyCol='tinhPhi' />
            </tr>
        ),
        renderRow: (item, index) => {
            const rows = [];
            let listHocPhan = list.groupBy('maHocPhan')[item] || [],
                rowSpan = listHocPhan.length;
            if (rowSpan) {
                for (let i = 0; i < rowSpan; i++) {
                    const hocPhan = listHocPhan[i];
                    if (i == 0) {
                        rows.push(
                            <tr key={rows.length} style={{ cursor: 'pointer' }} onClick={() => this.hocPhanModal.show(hocPhan)}>
                                <TableCell style={{ textAlign: 'right' }} content={(index + 1)} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.maHocPhan} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.lop?.split(',').map((item, i) => <div key={i}>{item}</div>)} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.maLoaiDky && this.mapperLoaiDangKy[hocPhan.maLoaiDky] ? this.mapperLoaiDangKy[hocPhan.maLoaiDky] : ''} rowSpan={rowSpan} />
                                <TableCell type='number' content={(hocPhan.siSo || 0) + '/' + (hocPhan.soLuongDuKien || 100)} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tongTinChi} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tongTiet} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.thu} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayBatDau} rowSpan={rowSpan} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayKetThuc} rowSpan={rowSpan} />
                                <TableCell type='number' style={{ textAlign: 'center' }} content={(hocPhan.daDong || 0) + '/' + (hocPhan.hocPhi || 0)} rowSpan={rowSpan} />
                            </tr>);
                    }
                    else {
                        rows.push(<tr key={rows.length}>
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.thu} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                        </tr>);
                    }
                }
            }
            return rows;
        },
    });


    render() {
        let { selectedStu, isSvLoading, listHocPhanDangKy, mssv } = this.state;
        return (<>
            <div className='tile'>
                <div className='tile-body'>
                    <div className='row'>
                        <FormSelect ref={e => this.namHoc = e} className='col-md-3' label='Năm học' data={SelectAdapter_SchoolYear} required
                            onChange={value => this.setState({ namHoc: value.id }, () => this.getKetQua())} />
                        <FormSelect ref={e => this.hocKy = e} className='col-md-3' label='Học kỳ' data={SelectAdapter_DtDmHocKy} required
                            onChange={value => this.setState({ hocKy: value.id }, () => this.getKetQua())} />

                        <FormSelect ref={e => this.sinhVien = e} className='col-md-6' label='Chọn sinh viên' data={SelectAdapter_DangKyHocPhanStudent} required
                            onChange={value => this.setState({ sinhVien: value.id, selectedStu: true }, () => this.getKetQua())} />
                    </div>
                    {selectedStu ?
                        <div className='row'>
                            <div className='col-md-12'>
                                <ThongTinSV ref={e => this.sinhVienModal = e} />
                            </div>
                            <div className='col-md-12 mt-2'>
                                {isSvLoading ? loadSpinner() : this.renderListKetQua(listHocPhanDangKy)}
                            </div>
                        </div>
                        : <div />}
                </div>
            </div>
            <HocPhanModal ref={e => this.hocPhanModal = e} mssv={mssv} getKetQuaDangKyHocPhan={this.getKetQuaDangKyHocPhan} />
        </>);
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getScheduleSettings, getDtDangKyHocPhanByStudent };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionEditSinhVien);