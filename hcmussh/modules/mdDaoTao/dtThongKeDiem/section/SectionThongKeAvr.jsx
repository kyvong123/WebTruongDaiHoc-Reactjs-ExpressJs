import React from 'react';
import { connect } from 'react-redux';
import Pagination from 'view/component/Pagination';
import { renderDataTable, TableHead, TableCell, FormSelect, loadSpinner } from 'view/component/AdminPage';

import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DtLop } from 'modules/mdDaoTao/dtLop/redux';
import { SelectAdapter_SemesterData } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DtKhoaDaoTaoFilter } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DtDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtNganhDaoTaoRole } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_LoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_ChuongTrinhDaoTaoRole } from 'modules/mdDaoTao/dtChuongTrinhDaoTao/redux';
import { getDtThongKeDiemTbPage } from 'modules/mdDaoTao/dtThongKeDiem/redux';

class SectionThongKeAvr extends React.Component {
    state = {
        sortTerm: 'mssv_ASC', ksSearch: {}, page: {},
        khoaSinhVien: null, loaiHinhDaoTao: null, khoaDaoTao: null, nganhDaoTao: null, lopSinhVien: null,
        tuSemester: null, denSemester: null,
        isLoading: false
    }
    defaultSortTerm = 'mssv_ASC'

    setData = () => {
        this.props.getScheduleSettings(data => {
            let { ma, namHoc } = data.currentSemester,
                { khoa, loaiHinhDaoTao, khoaSinhVien, isPhongDaoTao } = this.props.role;
            if (isPhongDaoTao) {
                khoa = '';
                loaiHinhDaoTao = 'CQ';
                khoaSinhVien = namHoc.split(' - ')[0];
            }

            this.setState({
                filter: {
                    tuSemester: ma, denSemester: ma,
                    loaiHinhDaoTao, khoaSinhVien, khoaDaoTao: khoa
                },
                loaiHinhDaoTao, khoaSinhVien,
                tuSemester: ma, denSemester: ma, isLoading: true
            }, () => {
                this.tuSemester.value(ma);
                this.denSemester.value(ma);
                this.loaiHinhDaoTao.value(loaiHinhDaoTao);
                this.khoaSinhVien.value(khoaSinhVien);
                this.khoaDaoTao.value(khoa);
                this.nganhDaoTao.value('');
                this.lopSinhVien.value('');
                this.chuongTrinhDt.value('');
                this.getPage(undefined, undefined, '');
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, ...this.state.ksSearch, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getDtThongKeDiemTbPage(pageN, pageS, pageC, filter, (page) => {
            this.setState({ page, isLoading: false });
            done && done();
        });
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ ksSearch: { ...this.state.ksSearch, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    downloadExcel = (e) => {
        e.preventDefault();
        let { filter } = this.state;
        filter = JSON.stringify(filter);
        T.handleDownload(`/api/dt/thong-ke-diem/avr/download?filter=${filter}`,
            'Thong_ke_diem_trung_binh.xlsx');
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.state.page || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let tuSemester = this.state.tuSemester, border = '1px solid #d0d3d6',
            style = { width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'top', border };

        let table = renderDataTable({
            emptyTable: 'Chưa có sinh viên',
            data: list,
            header: 'thead-light',
            stickyHead: list && list.length > 9 ? true : false,
            divStyle: { height: '50vh' },
            renderHead: () => (<>
                <tr>
                    <th rowSpan='2' style={{ width: 'auto', textAlign: 'right', border }}>#</th>
                    <TableHead rowSpan='2' style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center', border }} content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead rowSpan='2' style={{ width: '60%', whiteSpace: 'nowrap', textAlign: 'center', border }} content='Họ tên' keyCol='hoTen' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead rowSpan='2' style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center', border }} content='Ngành' keyCol='nganh' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <th rowSpan='1' colSpan='5' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', border }}>Điểm trung bình học kỳ</th>
                    {/* <th rowSpan='1' colSpan='5' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', border }}>Điểm trung bình chung</th> */}
                </tr>
                <tr>
                    <TableHead style={style} content={<div>Tín chỉ<br />đăng ký</div>} />
                    <TableHead style={style} content={<div>Tín chỉ<br />đạt</div>} />
                    <TableHead style={style} content={<div>Điểm<br />trung bình</div>} />
                    <TableHead style={style} content={<div>Tín chỉ<br />tích lũy</div>} />
                    <TableHead style={style} content={<div>Điểm<br />trung bình<br />tích lũy</div>} />

                    {/* <TableHead style={style} content={<div>Tín chỉ<br />đăng ký<br />quá trình</div>} />
                    <TableHead style={style} content={<div>Tín chỉ<br />đạt<br />quá trình</div>} />
                    <TableHead style={style} content={<div>Điểm<br />trung bình<br />quá trình</div>} />
                    <TableHead style={style} content={<div>Tín chỉ<br />tích lũy<br />quá trình</div>} />
                    <TableHead style={style} content={<div>Điểm trung bình<br />tích lũy<br />quá trình</div>} /> */}
                </tr>
            </>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={indexOfItem} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.mssv} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tinChi || 0} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tcDat || 0} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.avr || '0.00'} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tinChiTlHocKy || 0} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.avrTlHocKy || 0} />

                        {/* <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tinChiQt || 0} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tcDatQt || 0} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.avrQt || '0.00'} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tcTlQt || 0} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.avrTlQt || '0.00'} /> */}
                    </tr>
                );
            }
        });
        return (<>
            <div className='tile'>
                <div className='row'>
                    <FormSelect className='col-md-3' ref={e => this.tuSemester = e} data={SelectAdapter_SemesterData()} label='Từ năm học, học kỳ'
                        onChange={value => this.setState({ filter: { ...this.state.filter, tuSemester: value?.id || '' }, tuSemester: value?.id || '' }, () => {
                            this.denSemester.value('');
                            this.denSemester.focus();
                        })} />
                    <FormSelect className='col-md-3' ref={e => this.denSemester = e} data={SelectAdapter_SemesterData(tuSemester)} label='Đến năm học, học kỳ'
                        onChange={value => this.setState({ filter: { ...this.state.filter, denSemester: value?.id || '' }, isLoading: true }, () => this.getPage())} />

                    <FormSelect className='col-md-4' ref={e => this.loaiHinhDaoTao = e} data={SelectAdapter_LoaiHinhDaoTaoFilter('dtThongKeDiem')} label='Loại hình đào tạo'
                        onChange={value => this.setState({ filter: { ...this.state.filter, loaiHinhDaoTao: value.id }, loaiHinhDaoTao: value.id, isLoading: true }, () => {
                            this.getPage();
                            this.lopSinhVien.value('');
                            this.chuongTrinhDt.value('');
                        })} />
                    <FormSelect className='col-md-2' ref={e => this.khoaSinhVien = e} data={SelectAdapter_DtKhoaDaoTaoFilter('dtThongKeDiem')} label='Khóa sinh viên'
                        onChange={value => this.setState({ filter: { ...this.state.filter, khoaSinhVien: value.id, lopSinhVien: '' }, khoaSinhVien: value.id, isLoading: true }, () => {
                            this.getPage();
                            this.lopSinhVien.value('');
                            this.chuongTrinhDt.value('');
                        })} />

                </div>

                <div className='row'>
                    <FormSelect className='col-md-3' ref={(e) => (this.khoaDaoTao = e)} data={SelectAdapter_DtDmDonVi()} label='Khoa đào tạo'
                        onChange={value => this.setState({ filter: { ...this.state.filter, khoaDaoTao: value?.id || '', nganhDaoTao: '', lopSinhVien: '', chuongTrinhDt: '' }, khoaDaoTao: value?.id || null, isLoading: true }, () => {
                            this.nganhDaoTao.value('');
                            this.lopSinhVien.value('');
                            this.chuongTrinhDt.value('');
                            this.getPage();
                        })} allowClear />
                    <FormSelect className='col-md-3' ref={(e) => (this.nganhDaoTao = e)} data={SelectAdapter_DtNganhDaoTaoRole({
                        donVi: this.state.khoaDaoTao,
                        role: 'dtThongKeDiem'
                    })} label='Ngành đào tạo'
                        onChange={value => this.setState({ filter: { ...this.state.filter, nganhDaoTao: value?.id || '', lopSinhVien: '', chuongTrinhDt: '' }, nganhDaoTao: value?.id || null, isLoading: true }, () => {
                            this.lopSinhVien.value('');
                            this.chuongTrinhDt.value('');
                            this.getPage();
                        })} allowClear />

                    <FormSelect className='col-md-2' ref={(e) => (this.lopSinhVien = e)} data={SelectAdapter_DtLop({
                        khoaSinhVien: this.state.khoaSinhVien,
                        heDaoTao: this.state.loaiHinhDaoTao,
                        donVi: this.state.khoaDaoTao,
                        nganh: this.state.nganhDaoTao,
                        role: 'dtThongKeDiem'
                    })} label='Lớp sinh viên'
                        onChange={value => this.setState({ filter: { ...this.state.filter, lopSinhVien: value?.id || '', chuongTrinhDt: '' }, lopSinhVien: value?.id || null, isLoading: true }, () => {
                            this.chuongTrinhDt.value('');
                            this.getPage();
                        })} allowClear />


                    <FormSelect className='col-md-4' ref={(e) => (this.chuongTrinhDt = e)} data={SelectAdapter_ChuongTrinhDaoTaoRole({
                        khoaSinhVien: this.state.khoaSinhVien,
                        heDaoTao: this.state.loaiHinhDaoTao,
                        donVi: this.state.khoaDaoTao,
                        nganh: this.state.nganhDaoTao,
                        lop: this.state.lopSinhVien,
                        role: 'dtThongKeDiem'
                    })} label='Chương trình đào tạo'
                        onChange={(value) => this.setState({ filter: { ...this.state.filter, chuongTrinhDt: value?.id || '' }, isLoading: true }, () => this.getPage())} allowClear
                    />
                </div>
                {this.state.isLoading ? loadSpinner() : <>
                    {table}
                    <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                        getPage={this.getPage} pageRange={5} />
                </>}


            </div>
        </>);
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getScheduleSettings, getDtThongKeDiemTbPage
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionThongKeAvr);