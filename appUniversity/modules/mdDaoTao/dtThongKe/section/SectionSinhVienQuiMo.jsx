import React from 'react';
import { connect } from 'react-redux';
import { renderDataTable, TableHead, TableCell, FormSelect } from 'view/component/AdminPage';

import { getDtThongKeQuiMoAll } from 'modules/mdDaoTao/dtThongKe/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtNganhDaoTaoFilter } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_DtLopFilter } from 'modules/mdDaoTao/dtLop/redux';
class SectionSinhVienQuiMo extends React.Component {
    state = { isHien: true, sortTerm: 'mssv_ASC', ksSearch: {}, data: [], loaiHinhDaoTao: null, khoaSinhVien: null, listTinhTrang: [], khoaDaoTao: null, nganhDaoTao: null }
    defaultSortTerm = 'mssv_ASC'

    componentDidMount() {
        this.setState({ filter: {} }, () => {
            this.khoaDaoTao.value('');
            this.nganhDaoTao.value('');
            this.lopSinhVien.value('');
        });
    }

    getData = () => {
        let filter = this.props.filter,
            { loaiHinhDaoTao, khoaSinhVien } = filter;
        this.setState({ filter, khoaDaoTao: null, nganhDaoTao: null, loaiHinhDaoTao, khoaSinhVien }, () => {
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
        T.handleDownload(`/api/dt/thong-ke/qui-mo/download?filter=${filter}`,
            'Thong_ke_qui_mo.xlsx');
    }

    getPage = () => {
        let filter = this.state.filter;
        this.props.getDtThongKeQuiMoAll(filter, value => {
            this.setState({ data: value.items, listTinhTrang: value.listTinhTrang });
        });
    }

    render() {
        let { data, listTinhTrang } = this.state;

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
                    {listTinhTrang?.map(item => {
                        return <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content={item} key={item} />;
                    })}
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tổng sinh viên' keyCol='tongSL' />
                    {/* <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thao tác' keyCol='thaoTac' /> */}
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
                        {item.sub?.map(e => {
                            return <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={e.soLuong} key={e.tinhTrang} />;
                        })}
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={count} />
                        {/* <TableCell type='buttons' style={{ textAlign: 'center' }} content={item}>
                            <Tooltip title='Chi tiết' arrow>
                                <button className='btn btn-primary' onClick={(e) => e.preventDefault() || this.props.history.push(`/user/dao-tao/thong-ke-dang-ky/edit/${filter.namHoc}/${filter.hocKy}/${filter.donVi}/${item.loaiHinhDaoTao}/${null}/${null}`)} >
                                    <i className='fa fa-lg fa-eye' />
                                </button>
                            </Tooltip>
                        </TableCell> */}
                    </tr>
                );
            },
        });
        return (
            <div className='tile'>
                <div className='row'>
                    <FormSelect className='col-md-5' ref={(e) => (this.khoaDaoTao = e)} data={SelectAdapter_DmDonViFaculty_V2} label='Khoa đào tạo'
                        onChange={value => this.setState({ filter: { ...this.state.filter, khoaDaoTao: value?.id || '', nganhDaoTao: '', lopSinhVien: '' }, khoaDaoTao: value?.id || null }, () => {
                            this.getPage();
                            this.nganhDaoTao.value('');
                            this.lopSinhVien.value('');
                        })} allowClear />
                    <FormSelect className='col-md-4' ref={(e) => (this.nganhDaoTao = e)} data={SelectAdapter_DtNganhDaoTaoFilter(this.state.khoaDaoTao)} label='Ngành đào tạo'
                        onChange={value => this.setState({ filter: { ...this.state.filter, nganhDaoTao: value?.id || '', lopSinhVien: '' }, nganhDaoTao: value?.id || null }, () => {
                            this.getPage();
                            this.lopSinhVien.value('');
                        })} allowClear />
                    <FormSelect className='col-md-3' ref={(e) => (this.lopSinhVien = e)} data={SelectAdapter_DtLopFilter({
                        listKhoaSv: this.state.khoaSinhVien,
                        heDaoTao: this.state.loaiHinhDaoTao,
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
    getDtThongKeQuiMoAll
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionSinhVienQuiMo);