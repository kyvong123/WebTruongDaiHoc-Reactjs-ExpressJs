import React from 'react';
import { connect } from 'react-redux';
import Pagination from 'view/component/Pagination';
import { renderDataTable, TableHead, TableCell, FormSelect, loadSpinner } from 'view/component/AdminPage';

import { getAllDtCauHinhDiem } from 'modules/mdDaoTao/dtCauHinhDiem/redux';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DtLop } from 'modules/mdDaoTao/dtLop/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DtKhoaDaoTaoFilter } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DtDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtNganhDaoTaoRole } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_LoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { getDtThongKeDiemDatPage } from 'modules/mdDaoTao/dtThongKeDiem/redux';

class SectionThongKeDiemDat extends React.Component {
    state = {
        sortTerm: 'tenMonHoc_ASC', ksSearch: {}, page: {},
        khoaSinhVien: null, loaiHinhDaoTao: null, khoaDaoTao: null, nganhDaoTao: null,
        isLoading: false
    }
    defaultSortTerm = 'tenMonHoc_ASC'

    setData = () => {
        this.props.getAllDtCauHinhDiem(value => {
            let diemRot = value.rotMon;
            this.props.getScheduleSettings(data => {
                let { namHoc, hocKy } = data.currentSemester,
                    { khoa, loaiHinhDaoTao, khoaSinhVien, isPhongDaoTao } = this.props.role;
                if (isPhongDaoTao) {
                    khoa = '';
                    loaiHinhDaoTao = 'CQ';
                    khoaSinhVien = namHoc.split(' - ')[0];
                }

                this.setState({
                    filter: { namHoc, hocKy, loaiHinhDaoTao, khoaSinhVien, khoaDaoTao: khoa, diemRot },
                    loaiHinhDaoTao, khoaSinhVien, khoaDaoTao: khoa, isLoading: true
                }, () => {
                    this.namHoc.value(namHoc);
                    this.hocKy.value(hocKy);
                    this.loaiHinhDaoTao.value(loaiHinhDaoTao);
                    this.khoaSinhVien.value(khoaSinhVien);
                    this.khoaDaoTao.value(khoa);
                    this.nganhDaoTao.value('');
                    this.lopSinhVien.value('');
                    this.getPage(undefined, undefined, '');
                });
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, ...this.state.ksSearch, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getDtThongKeDiemDatPage(pageN, pageS, pageC, filter, (page) => {
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
        T.handleDownload(`/api/dt/thong-ke-diem/dat/download?filter=${filter}`,
            'Thong_ke_diem_dat.xlsx');
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.state.page || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = renderDataTable({
            emptyTable: 'Chưa có sinh viên',
            data: list,
            header: 'thead-light',
            stickyHead: list && list.length > 9 ? true : false,
            divStyle: { height: '50vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn học' keyCol='tenMonHoc' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Khoa' keyCol='tenKhoa' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }} content='SLSV qua môn' keyCol='quaMon' onSort={this.onSort} />
                    <TableHead style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Phần trăm qua môn' keyCol='phanTramQuaMon' onSort={this.onSort} />

                    <TableHead style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }} content='SLSV rớt môn' keyCol='rotMon' onSort={this.onSort} />
                    <TableHead style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Phần trăm rớt môn' keyCol='phanTramRotMon' onSort={this.onSort} />
                    <TableHead style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tổng sinh viên đăng ký' keyCol='soLuongDk' onSort={this.onSort} />

                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={indexOfItem} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maHocPhan} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tenKhoa} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.quaMon || 0} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={(+item.phanTramQuaMon?.toFixed(2) || 0) + '%'} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.rotMon || 0} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={(+item.phanTramRotMon?.toFixed(2) || 0) + '%'} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soLuongDk || 0} />

                    </tr>
                );
            }
        });
        return (<>
            <div className='tile'>
                <div className='row'>
                    <FormSelect className='col-md-3' ref={e => this.namHoc = e} data={SelectAdapter_SchoolYear} label='Năm học'
                        onChange={value => this.setState({ filter: { ...this.state.filter, namHoc: value?.id || '' }, isLoading: true }, () => this.getPage())} />
                    <FormSelect className='col-md-3' ref={e => this.hocKy = e} data={SelectAdapter_DtDmHocKy} label='Học kỳ'
                        onChange={value => this.setState({ filter: { ...this.state.filter, hocKy: value?.id || '' }, isLoading: true }, () => this.getPage())} />

                    <FormSelect className='col-md-4' ref={e => this.loaiHinhDaoTao = e} data={SelectAdapter_LoaiHinhDaoTaoFilter('dtThongKeDiem')} label='Loại hình đào tạo'
                        onChange={value => this.setState({ filter: { ...this.state.filter, loaiHinhDaoTao: value.id, lopSinhVien: '' }, loaiHinhDaoTao: value.id, isLoading: true }, () => {
                            this.lopSinhVien.value('');
                            this.getPage();
                        })} />
                    <FormSelect className='col-md-2' ref={e => this.khoaSinhVien = e} data={SelectAdapter_DtKhoaDaoTaoFilter('dtThongKeDiem')} label='Khóa sinh viên'
                        onChange={value => this.setState({ filter: { ...this.state.filter, khoaSinhVien: value.id, lopSinhVien: '' }, khoaSinhVien: value.id, isLoading: true }, () => {
                            this.lopSinhVien.value('');
                            this.getPage();
                        })} />
                </div>

                <div className='row'>
                    <FormSelect className='col-md-5' ref={(e) => (this.khoaDaoTao = e)} data={SelectAdapter_DtDmDonVi()} label='Khoa đào tạo'
                        onChange={value => this.setState({ filter: { ...this.state.filter, khoaDaoTao: value?.id || '', nganhDaoTao: '', lopSinhVien: '' }, khoaDaoTao: value?.id || null, isLoading: true }, () => {
                            this.nganhDaoTao.value('');
                            this.lopSinhVien.value('');
                            this.getPage();
                        })} allowClear />
                    <FormSelect className='col-md-5' ref={(e) => (this.nganhDaoTao = e)} data={SelectAdapter_DtNganhDaoTaoRole({
                        donVi: this.state.khoaDaoTao,
                        role: 'dtThongKeDiem'
                    })} label='Ngành đào tạo'
                        onChange={value => this.setState({ filter: { ...this.state.filter, nganhDaoTao: value?.id || '', lopSinhVien: '' }, nganhDaoTao: value?.id || null, isLoading: true }, () => {
                            this.lopSinhVien.value('');
                            this.getPage();
                        })} allowClear />

                    <FormSelect className='col-md-2' ref={(e) => (this.lopSinhVien = e)} data={SelectAdapter_DtLop({
                        listKhoaSv: this.state.khoaSinhVien,
                        heDaoTao: this.state.loaiHinhDaoTao,
                        donVi: this.state.khoaDaoTao,
                        nganh: this.state.nganhDaoTao,
                        role: 'dtThongKeDiem'
                    })} label='Lớp sinh viên'
                        onChange={value => this.setState({ filter: { ...this.state.filter, lopSinhVien: value?.id || '' }, isLoading: true }, () => this.getPage())} allowClear />
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
    getScheduleSettings, getDtThongKeDiemDatPage, getAllDtCauHinhDiem
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionThongKeDiemDat);