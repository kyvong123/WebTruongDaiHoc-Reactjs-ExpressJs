import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, TableCell, TableHead, renderDataTable } from 'view/component/AdminPage';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmDonViByFilter } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtNganhDaoTaoFilterPage } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { getDtNgoaiNguKhongChuyenPage } from './redux';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DmKhoiKienThucAll } from 'modules/mdDaoTao/dmKhoiKienThuc/redux';

class TinhTrangPage extends AdminPage {
    state = { dataKhoa: [], listKhoaSemester: {}, displayState: 0 }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.showAdvanceSearch();
        });
    }

    getPage = (pageN, pageS, pageC) => {
        let filter = { ...this.state.filter, sortTerm: this.state?.sortTerm || this.defaultSortTerm, semester: Number(`${this.state.filter.namHoc.substring(2, 4)}${this.state.filter.hocKy}`) };
        this.props.getDtNgoaiNguKhongChuyenPage(pageN, pageS, pageC, filter, () => {
            const dataKhoa = [0, 1, 2].flatMap(nh => [1, 2].map(hk => ({ id: Number(`${(Number(filter.khoaSinhVien) + nh).toString().substring(2, 4)}${hk}`), namHoc: `${Number(filter.khoaSinhVien) + nh} - ${Number(filter.khoaSinhVien) + 1 + nh}`, hocKy: hk }))),
                listKhoaSemester = dataKhoa.reduce((acc, cur) => {
                    const { id, namHoc, hocKy } = cur;
                    acc[id] = { id, namHoc, hocKy, text: `NH${namHoc} HK${hocKy}` };
                    return acc;
                }, {});
            this.setState({ dataKhoa, listKhoaSemester, displayState: 1 });
        });
    }

    handleChange = ({ value, key }) => {
        this.setState({ filter: { ...this.state.filter, [key]: value } });
    }

    onKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtNgoaiNguKC?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, pageCondition: '', list: null },
            { listKhoaSemester, displayState } = this.state,
            mapperStatus = {
                1: 'Miễn ngoại ngữ',
                2: 'Đủ điều kiện chứng chỉ',
                3: 'Đủ điều kiện môn học',
            };

        let table = renderDataTable({
            data: list,
            header: 'thead-light',
            stickyHead: list?.length > 10,
            divStyle: { height: '55vh' },
            multipleTbody: true,
            renderHead: () => (
                <tr>
                    <TableHead content='#' style={{ width: 'auto' }} />
                    <TableHead content='MSSV' style={{ width: '10%' }} keyCol='mssv' onKeySearch={this.onKeySearch} />
                    <TableHead content='Họ tên' style={{ width: '15%' }} keyCol='hoTen' onKeySearch={this.onKeySearch} />
                    <TableHead content='Khoa' style={{ width: '15%' }} />
                    <TableHead content='Ngành' style={{ width: '15%' }} />
                    <TableHead content='Tình trạng ngoại ngữ' style={{ width: '10%' }} typeSearch='admin-select' keyCol='tinhTrangNgoaiNgu' onKeySearch={this.onKeySearch}
                        data={[{ id: 0, text: 'Không đủ điều kiện ngoại ngữ' }, { id: 1, text: 'Miễn ngoại ngữ' }, { id: 2, text: 'Đủ điều kiện chứng chỉ' }, { id: 3, text: 'Đủ điều kiện môn học' }]} />
                    <TableHead content='Tổng số tín chỉ đăng ký' style={{ width: 'auto' }} />
                    <TableHead content='Khối kiến thức' style={{ width: '20%' }} />
                    <TableHead content='Năm học, học kỳ CTDT' style={{ width: '15%' }} />
                </tr>
            ),
            renderRow: (item, index) => {
                const ctdtDangKy = item.ctdtDangKy ? T.parse(item.ctdtDangKy) : [],
                    text = ctdtDangKy.map(nh => {
                        const textNH = listKhoaSemester[nh.semester]?.text;
                        return nh.soTinChi != null ? `${textNH}: ${nh.soTinChi}` : textNH;
                    });
                return (
                    <tr key={`condition${index}`} style={{ backgroundColor: '#fff' }}>
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.ho} ${item.ten}`} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenDonVi} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{item.tenChuyenNganh ? <span className='text-primary'>{item.tenChuyenNganh} < br /> </span> : ''} {item.tenNganh}</>} />
                        <TableCell style={{ whiteSpace: 'nowrap', color: item.status ? 'green' : 'red' }} content={item.status ? mapperStatus[item.status] : 'Không đủ điều kiện ngoại ngữ'} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={!item.status ? item.tongSoTinChi : ''} />
                        <TableCell content={item.khoiKienThuc && !item.status ? <FormSelect label='' key={`KKT${index}`} data={SelectAdapter_DmKhoiKienThucAll()} multiple readOnly value={item.khoiKienThuc ? item.khoiKienThuc.split(',') : []} /> : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={!item.status ? text.map((i, index) => <div key={`text${index}`}>{i}</div>) : ''} />
                    </tr>
                );
            },
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Tình trạng ngoại ngữ sinh viên',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/ngoai-ngu-khong-chuyen'>Ngoại ngữ không chuyên</Link>,
                'Tình trạng ngoại ngữ'
            ],
            advanceSearchTitle: '',
            advanceSearch: <div className='row'>
                <FormSelect className='col-md-2' ref={e => this.namHoc = e} label='Năm học' data={SelectAdapter_SchoolYear} required onChange={value => this.handleChange({ value: value?.id || '', key: 'namHoc' })} />
                <FormSelect className='col-md-1' ref={e => this.hocKy = e} label='Học kỳ' data={SelectAdapter_DtDmHocKy} required onChange={value => this.handleChange({ value: value?.id || '', key: 'hocKy' })} />
                <FormSelect className='col-md-3' ref={e => this.loaiHinh = e} label='Loại hình' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} required onChange={value => this.handleChange({ value: value?.id || '', key: 'loaiHinh' })} />
                <FormSelect className='col-md-1' ref={e => this.khoaSinhVien = e} label='Khóa' data={SelectAdapter_DtKhoaDaoTao} required onChange={value => this.handleChange({ value: value?.id || '', key: 'khoaSinhVien' })} />
                <FormSelect className='col-md-2' ref={e => this.khoa = e} label='Khoa' data={SelectAdapter_DmDonViByFilter()} allowClear onChange={value => this.handleChange({ value: value?.id || '', key: 'khoa' })} />
                <FormSelect className='col-md-3' ref={e => this.nganh = e} label='Ngành' data={SelectAdapter_DtNganhDaoTaoFilterPage} allowClear onChange={value => this.handleChange({ value: value?.id || '', key: 'nganh' })} />
                <div className='col-md-12' style={{ textAlign: 'right' }}>
                    <button className='btn btn-success' type='button' onClick={() => {
                        if (!this.namHoc.value()) {
                            T.notify('Vui lòng chọn năm học!', 'danger');
                            this.namHoc.focus();
                        } else if (!this.hocKy.value()) {
                            T.notify('Vui lòng chọn học kỳ!', 'danger');
                            this.hocKy.focus();
                        } else if (!this.loaiHinh.value()) {
                            T.notify('Vui lòng chọn loại hình!', 'danger');
                            this.loaiHinh.focus();
                        } else if (!this.khoaSinhVien.value()) {
                            T.notify('Vui lòng chọn khóa!', 'danger');
                            this.khoaSinhVien.focus();
                        } else this.getPage(1, 50, null);
                    }}>
                        <i className='fa fa-fw fa-lg fa-search' />Tìm kiếm
                    </button>
                </div>
            </div>,
            content: <div className='tile' style={{ display: displayState ? '' : 'none' }} >
                {table}
                < Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} pageRange={6} />
            </div>,
            onExport: displayState ? e => e && e.preventDefault() || T.handleDownload(`/api/dt/ngoai-ngu-khong-chuyen/download-excel?filter=${T.stringify({ ...this.state.filter, semester: Number(`${this.state.filter.namHoc.substring(2, 4)}${this.state.filter.hocKy}`) })}`, 'TINH_TRANG_NGOAI_NGU.xlsx') : null,
        });
    }
}


const mapStateToProps = state => ({ system: state.system, dtNgoaiNguKC: state.daoTao.dtNgoaiNguKC });
const mapActionsToProps = { getDtNgoaiNguKhongChuyenPage };
export default connect(mapStateToProps, mapActionsToProps)(TinhTrangPage);