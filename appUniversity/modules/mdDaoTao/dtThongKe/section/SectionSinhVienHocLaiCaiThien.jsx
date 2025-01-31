import React from 'react';
import { connect } from 'react-redux';
import { Tooltip } from '@mui/material';
import { renderDataTable, TableHead, TableCell, FormSelect } from 'view/component/AdminPage';

import { getDtThongKeHocLaiCaiThienAll } from 'modules/mdDaoTao/dtThongKe/redux';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtNganhDaoTaoFilter } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_DtLopFilter } from 'modules/mdDaoTao/dtLop/redux';
class SectionSinhVienHocLaiCaiThien extends React.Component {
    state = { sortTerm: 'mssv_ASC', ksSearch: {}, data: [], khoaSinhVien: [], khoaDaoTao: null, nganhDaoTao: null }
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
        T.handleDownload(`/api/dt/thong-ke/hoc-lai-hoc-cai-thien/download?filter=${filter}`,
            'Thong_ke_hoc_lai_hoc_cai_thien.xlsx');
    }


    getPage = () => {
        let filter = this.state.filter;
        this.props.getDtThongKeHocLaiCaiThienAll(filter, value => {
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
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} colSpan={khoaSinhVien.length + 1} content='Học lại' keyCol='hocLai' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} colSpan={khoaSinhVien.length + 1} content='Cải thiện' keyCol='caiThien' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} rowSpan={2} content='Thao tác' keyCol='thaoTac' />
                </tr>
                <tr>
                    {khoaSinhVien?.map(item => {
                        return <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content={item} key={'hl' + item} />;
                    })}
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tổng sinh viên' keyCol='tongHocLai' />
                    {khoaSinhVien?.map(item => {
                        return <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content={item} key={'ct' + item} />;
                    })}
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tổng sinh viên' keyCol='tongCaiThien' />
                </tr>
            </>),
            renderRow: (item, index) => {
                let countHL = 0, countCT = 0;
                item.sub.forEach(e => {
                    countHL = countHL + e.isHocLai;
                    countCT = countCT + e.isCaiThien;
                });
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={(index + 1)} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maNganh} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                        {item.sub?.map(e => {
                            return <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={e.isHocLai} key={'hl' + e.khoaSinhVien} />;
                        })}
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={countHL} />
                        {item.sub?.map(e => {
                            return <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={e.isCaiThien} key={'hl' + e.khoaSinhVien} />;
                        })}
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={countCT} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item}>
                            <Tooltip title='Chi tiết' arrow>
                                <button className='btn btn-primary' onClick={(e) => e.preventDefault() ||
                                    this.props.history.push('/user/dao-tao/thong-ke-hoc-lai-cai-thien/detail', { filter: { ...filter, nganhDaoTao: item.maNganh } })} >
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
    getDtThongKeHocLaiCaiThienAll, getScheduleSettings
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionSinhVienHocLaiCaiThien);