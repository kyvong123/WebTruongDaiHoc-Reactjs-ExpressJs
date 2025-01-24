import React from 'react';
import { connect } from 'react-redux';
import { Tooltip } from '@mui/material';
import { renderDataTable, TableHead, TableCell, FormSelect } from 'view/component/AdminPage';

import { getDtThongKeHocPhiAll } from 'modules/mdDaoTao/dtThongKe/redux';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtNganhDaoTaoFilter } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_DtLopFilter } from 'modules/mdDaoTao/dtLop/redux';
class SectionSinhVienDongHocPhi extends React.Component {
    state = { sortTerm: 'mssv_ASC', ksSearch: {}, data: [], khoaSinhVien: [], khoaDaoTao: null, nganhDaoTao: null }
    defaultSortTerm = 'mssv_ASC'

    componentDidMount() {
        this.props.getScheduleSettings(data => {
            let { namHoc, hocKy } = data.currentSemester;

            this.setState({ filter: { ...this.state.filter, namHoc: namHoc.split(' - ')[0], hocKy } }, () => {
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
        T.handleDownload(`/api/dt/thong-ke/hoc-phi/download?filter=${filter}`,
            'Thong_ke_hoc_phi.xlsx');
    }

    getPage = () => {
        let filter = this.state.filter;
        this.props.getDtThongKeHocPhiAll(filter, value => {
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
            renderHead: () => (<>
                <tr>
                    <TableHead style={{ width: 'auto', textAlign: 'right' }} rowSpan={2} content='#' />
                    <TableHead style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} rowSpan={2} content='Mã ngành' keyCol='maNganh' />
                    <TableHead style={{ width: '35%', whiteSpace: 'nowrap', textAlign: 'center' }} rowSpan={2} content='Tên ngành' keyCol='maNganh' />
                    <TableHead style={{ width: '35%', whiteSpace: 'nowrap', textAlign: 'center' }} rowSpan={2} content='Tên khoa' keyCol='tenKhoa' />
                    {khoaSinhVien?.map(item => {
                        return <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} colSpan={2} content={item} key={'khoa' + item} />;
                    })}
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} rowSpan={2} content='Thao tác' keyCol='thaoTac' />
                </tr>
                <tr>
                    {khoaSinhVien?.map(item => {
                        return <>
                            <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Học phí' key={'hp' + item} />
                            <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Đã đóng' key={'dd' + item} />
                        </>;
                    })}
                </tr>
            </>),
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={(index + 1)} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maNganh} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                        {item.sub?.map(e => {
                            return <>
                                <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={e.hocPhi} key={'hp' + e.khoaSinhVien} />
                                <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={e.daDong} key={'dd' + e.khoaSinhVien} />
                            </>;
                        })}
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item}>
                            <Tooltip title='Chi tiết' arrow>
                                <button className='btn btn-primary' onClick={(e) => e.preventDefault() ||
                                    this.props.history.push('/user/dao-tao/thong-ke-hoc-phi/detail', { filter: { ...filter, nganhDaoTao: item.maNganh } })} >
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
                        onChange={value => this.setState({ filter: { ...this.state.filter, namHoc: value.id.split(' - ')[0] } }, () => this.getPage())} />
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
    getDtThongKeHocPhiAll, getScheduleSettings
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionSinhVienDongHocPhi);