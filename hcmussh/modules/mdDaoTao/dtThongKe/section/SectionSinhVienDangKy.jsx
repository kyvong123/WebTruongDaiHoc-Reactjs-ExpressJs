import React from 'react';
import { connect } from 'react-redux';
import { Tooltip } from '@mui/material';
import { renderDataTable, TableHead, TableCell, FormSelect } from 'view/component/AdminPage';

import { getDtThongKeDangKyAll } from 'modules/mdDaoTao/dtThongKe/redux';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtNganhDaoTaoFilter } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_DtLopFilter } from 'modules/mdDaoTao/dtLop/redux';
class SectionSinhVienDangKy extends React.Component {
    state = { isHien: true, sortTerm: 'mssv_ASC', ksSearch: {}, data: [], khoaSinhVien: [], khoaDaoTao: null, nganhDaoTao: null }
    defaultSortTerm = 'mssv_ASC'

    componentDidMount() {
        this.props.getScheduleSettings(data => {
            let { namHoc, hocKy } = data.currentSemester;

            this.setState({ filter: { ...this.state.filter, namHoc, hocKy } }, () => {
                this.namHoc.value(namHoc);
                this.hocKy.value(hocKy);
                this.khoaDaoTao.value('');
                this.nganhDaoTao.value('');
                this.lopSinhVien.value('');
            });
        });
    }

    getData = () => {
        let { namHoc, hocKy } = this.state.filter,
            filter = { ...this.props.filter, namHoc, hocKy };
        this.setState({ filter, khoaDaoTao: null, nganhDaoTao: null }, () => {
            this.getPage();
            this.khoaDaoTao.value('');
            this.nganhDaoTao.value('');
            this.lopSinhVien.value('');
        });
    }

    downloadExcel = (e) => {
        e.preventDefault();
        let { filter } = this.state;
        filter = JSON.stringify(filter);
        T.handleDownload(`/api/dt/thong-ke/dang-ky-hoc-phan/download?filter=${filter}`,
            'Thong_ke_dang_ky_hoc_phan.xlsx');
    }

    getPage = () => {
        let filter = this.state.filter;
        this.props.getDtThongKeDangKyAll(filter, value => {
            this.setState({ data: value.items, khoaSinhVien: value.listKhoaSV });
        });
    }

    render() {
        let { data, khoaSinhVien, filter } = this.state;

        let table = renderDataTable({
            emptyTable: 'Chưa có sinh viên',
            data: data,
            header: 'thead-light',
            stickyHead: true,
            divStyle: { height: '55vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã ngành' keyCol='maNganh' />
                    <TableHead style={{ width: '35%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên ngành' keyCol='maNganh' />
                    <TableHead style={{ width: '35%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên khoa' keyCol='tenKhoa' />
                    {khoaSinhVien?.map(item => {
                        return <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} key={'khoa' + item}>{item}</th>;
                    })}
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tổng sinh viên' keyCol='tongSL' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thao tác' keyCol='thaoTac' />
                </tr>),
            renderRow: (item, index) => {
                let count = 0;
                item.sub.forEach(e => count = count + e.soLuong);
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={(index + 1)} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maNganh} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                        {item.sub?.map(e =>
                            <React.Fragment key={'khoa' + e.khoaSinhVien} >
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={e.soLuong} />
                            </React.Fragment>
                        )}
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={count} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item}>
                            <Tooltip title='Chi tiết' arrow>
                                <button className='btn btn-primary' onClick={(e) => e.preventDefault() ||
                                    this.props.history.push('/user/dao-tao/thong-ke-dang-ky/detail', { filter: { ...filter, nganhDaoTao: item.maNganh } })} >
                                    <i className='fa fa-lg fa-eye' />
                                </button>
                            </Tooltip>
                        </TableCell>
                    </tr>
                );
            },
        });

        return (
            <div className='tile'>
                <div className='row'>
                    <FormSelect className='col-md-2' ref={e => this.namHoc = e} data={SelectAdapter_SchoolYear} label='Năm học'
                        onChange={value => this.setState({ filter: { ...this.state.filter, namHoc: value.id } }, () => this.getPage())} />
                    <FormSelect className='col-md-2' ref={e => this.hocKy = e} data={SelectAdapter_DtDmHocKy} label='Học kỳ'
                        onChange={value => this.setState({ filter: { ...this.state.filter, hocKy: value?.id } }, () => this.getPage())} />
                    <FormSelect className='col-md-3' ref={(e) => (this.khoaDaoTao = e)} data={SelectAdapter_DmDonViFaculty_V2} label='Khoa đào tạo'
                        onChange={value => this.setState({ filter: { ...this.state.filter, khoaDaoTao: value?.id || '', nganhDaoTao: '', lopSinhVien: '' }, khoaDaoTao: value?.id || null }, () => {
                            this.getPage();
                            this.nganhDaoTao.value('');
                            this.lopSinhVien.value('');
                        })} allowClear />
                    <FormSelect className='col-md-3' ref={(e) => (this.nganhDaoTao = e)} data={SelectAdapter_DtNganhDaoTaoFilter(this.state.khoaDaoTao)} label='Ngành đào tạo'
                        onChange={value => this.setState({ filter: { ...this.state.filter, nganhDaoTao: value?.id || '', lopSinhVien: '' }, nganhDaoTao: value?.id || null }, () => {
                            this.getPage();
                            this.lopSinhVien.value('');
                        })} allowClear />
                    <FormSelect className='col-md-2' ref={(e) => (this.lopSinhVien = e)} data={SelectAdapter_DtLopFilter({
                        listKhoaSv: this.state.filter?.khoaSinhVien,
                        heDaoTao: this.state.filter?.loaiHinhDaoTao,
                        donVi: this.state.khoaDaoTao,
                        nganh: this.state.nganhDaoTao
                    })} label='Lớp sinh viên'
                        onChange={(value) => this.setState({ filter: { ...this.state.filter, lopSinhVien: value?.id || '' } }, () => this.getPage())} allowClear
                    />
                </div>
                {table}
            </div>
        );
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getDtThongKeDangKyAll, getScheduleSettings
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionSinhVienDangKy);