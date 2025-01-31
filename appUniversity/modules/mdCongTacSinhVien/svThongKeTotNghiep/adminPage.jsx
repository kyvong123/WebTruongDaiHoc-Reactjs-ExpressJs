import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell, FormSelect } from 'view/component/AdminPage';
import {
    getPageSvThongKeTotNghiep, getSvThongKeTotNghiep, createSvThongKeTotNghiep, updateSvThongKeTotNghiep, getDataSoLuongTheoKhoa,
    getDataSoLuongTheoLHDT, getDataSoLuongTheoXepLoai, downloadExcelTheoKhoa, downloadExcelTheoHeDaoTao, downloadExcelTheoXepLoai, downloadExcel
} from './redux';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DotXetTotNghiep } from 'modules/mdDaoTao/dtCauHinhDotXetTotNghiep/redux';



class AdminThongKeTotNghiepPage extends AdminPage {
    state = { filter: {} }
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            this.getAllData();
        });
    }

    renderSoLuongTheoKhoaTable(soLuongTheoKhoaData) {
        if (!soLuongTheoKhoaData || soLuongTheoKhoaData.length === 0) {
            return null;
        }
        let nganhTheoKhoa = [];
        for (let [tenNganh, list] of Object.entries(soLuongTheoKhoaData.groupBy('tenNganh'))) {
            let obj = { tenNganh };
            for (let item of list) {
                obj[item.khoaSinhVien] = item.tongSinhVien;
            }
            nganhTheoKhoa.push(obj);
        }
        const dataByKhoaSinhVien = {};
        soLuongTheoKhoaData.forEach(item => {
            if (!dataByKhoaSinhVien[item.khoaSinhVien]) {
                dataByKhoaSinhVien[item.khoaSinhVien] = [];
            }
            dataByKhoaSinhVien[item.khoaSinhVien].push(item);
        });

        const khoaSinhVienList = Object.keys(dataByKhoaSinhVien);
        const totalSvKhoaList = Object.values(dataByKhoaSinhVien);
        const total = {
            'tenNganh': 'Tổng cộng',
        };
        khoaSinhVienList.forEach((value, index) => {
            const count = totalSvKhoaList[index].reduce((totalValue, item) => item.tongSinhVien + totalValue, 0);
            total[value] = count;
        });
        nganhTheoKhoa.push(total);
        return renderTable({
            getDataSource: () => nganhTheoKhoa,
            renderHead: () => (
                <tr>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Ngành</th>
                    {khoaSinhVienList.map((khoaSinhVien, index) => (
                        <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }} key={index}>{khoaSinhVien}</th>
                    ))}
                </tr>
            ),
            renderRow: (item, index) => (
                <>
                    <tr key={item.tenNganh}>
                        <TableCell style={{ whiteSpace: 'nowrap', fontWeight: 'bold', backgroundColor: index == nganhTheoKhoa.length - 1 ? '#FFEF82' : '#dee2e6' }} content={item.tenNganh} />
                        {khoaSinhVienList.map(khoaSinhVien => (
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center', fontWeight: index == nganhTheoKhoa.length - 1 ? 'bold' : 'normal', backgroundColor: index == nganhTheoKhoa.length - 1 ? '#FFEF82' : '#9AD0EC' }} content={item[khoaSinhVien] || 0} key={item.tenNganh + index} />
                        ))}
                    </tr>

                </>

            ),
        });
    }

    renderSoLuongTheoLoaiHinhDaoTaoTable(soLuongTheoLHDTData) {
        if (!soLuongTheoLHDTData || soLuongTheoLHDTData.length === 0) {
            return null;
        }
        let nganhTheoLHDT = [];
        for (let [tenNganh, list] of Object.entries(soLuongTheoLHDTData.groupBy('tenNganh'))) {
            let obj = { tenNganh };
            for (let item of list) {
                obj[item.tenLoaiHinhDaoTao] = item.tongSinhVien;
            }
            nganhTheoLHDT.push(obj);
        }
        const dataByLHDTSinhVien = {};
        soLuongTheoLHDTData.forEach(item => {
            if (!dataByLHDTSinhVien[item.tenLoaiHinhDaoTao]) {
                dataByLHDTSinhVien[item.tenLoaiHinhDaoTao] = [];
            }
            dataByLHDTSinhVien[item.tenLoaiHinhDaoTao].push(item);
        });
        const tenLoaiHinhDaoTaoList = Object.keys(dataByLHDTSinhVien);
        const totalSvHeDaoTaoList = Object.values(dataByLHDTSinhVien);
        const total = {
            'tenNganh': 'Tổng cộng',
        };
        tenLoaiHinhDaoTaoList.forEach((value, index) => {
            const count = totalSvHeDaoTaoList[index].reduce((totalValue, item) => item.tongSinhVien + totalValue, 0);
            total[value] = count;
        });
        nganhTheoLHDT.push(total);
        return renderTable({
            getDataSource: () => nganhTheoLHDT,
            renderHead: () => (
                <tr>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Ngành</th>
                    {tenLoaiHinhDaoTaoList.map((tenLoaiHinhDaoTao, index) => (
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} key={index}>{tenLoaiHinhDaoTao}</th>
                    ))}
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap', fontWeight: 'bold', backgroundColor: index == nganhTheoLHDT.length - 1 ? '#FFEF82' : '#dee2e6' }} content={item.tenNganh} />
                    {tenLoaiHinhDaoTaoList.map(tenLoaiHinhDaoTao => (
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center', fontWeight: index == nganhTheoLHDT.length - 1 ? 'bold' : 'normal', backgroundColor: index == nganhTheoLHDT.length - 1 ? '#FFEF82' : '#9AD0EC' }} content={item[tenLoaiHinhDaoTao] || 0} key={index} />
                    ))}
                </tr>
            ),
        });
    }

    renderSoLuongTheoXepLoaiTable(soLuongTheoXepLoaiData) {
        if (!soLuongTheoXepLoaiData || soLuongTheoXepLoaiData.length === 0) {
            return null;
        }
        let nganhTheoXepLoai = [];
        for (let [tenNganh, list] of Object.entries(soLuongTheoXepLoaiData.groupBy('tenNganh'))) {
            let obj = { tenNganh };
            for (let item of list) {
                obj[item.xepLoai] = item.tongSinhVien;
            }
            nganhTheoXepLoai.push(obj);
        }
        const dataByXepLoaiTotNghiep = {};
        soLuongTheoXepLoaiData.forEach(item => {
            if (!dataByXepLoaiTotNghiep[item.xepLoai]) {
                dataByXepLoaiTotNghiep[item.xepLoai] = [];
            }
            dataByXepLoaiTotNghiep[item.xepLoai].push(item);
        });
        const xepLoaiTotNghiepList = Object.keys(dataByXepLoaiTotNghiep);
        const totalSvKhoaList = Object.values(dataByXepLoaiTotNghiep);
        const total = {
            'tenNganh': 'Tổng cộng',
        };
        xepLoaiTotNghiepList.forEach((value, index) => {
            const count = totalSvKhoaList[index].reduce((totalValue, item) => item.tongSinhVien + totalValue, 0);
            total[value] = count;
        });
        nganhTheoXepLoai.push(total);
        return renderTable({
            getDataSource: () => nganhTheoXepLoai,
            renderHead: () => (
                <tr>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Ngành</th>
                    {xepLoaiTotNghiepList.map((xepLoai, index) => (
                        <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }} key={index}>{xepLoai}</th>
                    ))}
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap', fontWeight: 'bold', backgroundColor: index == nganhTheoXepLoai.length - 1 ? '#FFEF82' : '#dee2e6' }} content={item.tenNganh} />
                    {xepLoaiTotNghiepList.map(xepLoai => (
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center', fontWeight: index == nganhTheoXepLoai.length - 1 ? 'bold' : 'normal', backgroundColor: index == nganhTheoXepLoai.length - 1 ? '#FFEF82' : '#9AD0EC' }} content={item[xepLoai] || 0} key={index} />
                    ))}
                </tr>
            ),
        });
    }

    getAllData = (pageNumber, pageSize, pageCondition, done) => {
        const { filter } = this.state;
        this.props.getPageSvThongKeTotNghiep(pageNumber, pageSize, pageCondition, filter, done);
        this.props.getDataSoLuongTheoKhoa(filter);
        this.props.getDataSoLuongTheoLHDT(filter);
        this.props.getDataSoLuongTheoXepLoai(filter);
    }

    render() {
        const { pageNumber, pageSize, pageCondition, pageTotal } = this.props.svThongKeTotNghiep?.page || {},
            list = this.props.svThongKeTotNghiep?.page?.list || [];
        const soLuongTheoKhoaData = this.props.svThongKeTotNghiep?.soLuongTheoKhoaData?.rows || [];
        const soLuongTheoLHDTData = this.props.svThongKeTotNghiep?.soLuongTheoLHDTData?.rows || [];
        const soLuongTheoXepLoaiData = this.props.svThongKeTotNghiep?.soLuongTheoXepLoaiData?.rows || [];
        soLuongTheoKhoaData.sort((a, b) => a.tenNganh.localeCompare(b.tenNganh));
        soLuongTheoLHDTData.sort((a, b) => a.tenNganh.localeCompare(b.tenNganh));
        soLuongTheoXepLoaiData.sort((a, b) => a.tenNganh.localeCompare(b.tenNganh));

        return this.renderPage({
            title: 'Thống kê tốt nghiệp',
            icon: 'fa fa-bar-chart-o',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Thống kê tốt nghiệp'
            ],
            header: <>

                <div style={{ display: 'flex' }}>
                    <FormSelect className='mr-3' style={{ width: '170px' }} placeholder='Đợt xét Tốt Nghiệp' data={SelectAdapter_DotXetTotNghiep()} onChange={value => {
                        if (value) {
                            this.setState({ filter: { ...this.state.filter, idDotTotNghiep: value.id } }, () => {
                                this.getAllData();
                            });
                        } else this.setState({ filter: { ...this.state.filter, idDotTotNghiep: null } });
                    }} />
                    <FormSelect className='mr-3' style={{ width: '120px' }} ref={e => this.namHoc = e} placeholder='Năm học' data={SelectAdapter_SchoolYear} onChange={value => {
                        if (value) {
                            this.setState({ filter: { ...this.state.filter, namHoc: value.id } }, () => {
                                this.getAllData();
                            });
                        } else this.setState({ filter: { ...this.state.filter, namHoc: null } });
                    }} />
                    <FormSelect style={{ width: '100px' }} ref={e => this.hocKy = e} placeholder='Học Kỳ' data={[{ id: '1', text: 'HK1' }, { id: '2', text: 'HK2' }, { id: '3', text: 'HK3' }]} onChange={value => {
                        if (value) {
                            this.setState({ filter: { ...this.state.filter, hocKy: value.id } }, () => {
                                this.getAllData();
                            });
                        } else this.setState({ filter: { ...this.state.filter, hocKy: null } });
                    }} />
                </div>
            </>,
            content:
                <div className="tile">
                    <div className='row'>
                        <div className='col-lg-6'>
                            <div className='tile' style={{ height: '60vh', overflow: 'auto' }}>
                                <div className='d-flex justify-content-between align-item-start'>
                                    <h5 className='tile-title'>Số lượng theo khoá</h5>
                                    <button className='btn btn-link btn-lg'
                                        onClick={e => e.preventDefault() || this.props.downloadExcelTheoKhoa('khoaSinhVien', 'tenNganh', 'SO LUONG THEO KHOA', this.state.filter)}>
                                        <i className='fa fa-download mb-3' />
                                    </button>
                                </div>
                                {this.renderSoLuongTheoKhoaTable(soLuongTheoKhoaData)}
                            </div>
                        </div>
                        <div className='col-lg-6'>
                            <div className='tile' style={{ height: '60vh', overflow: 'auto' }}>
                                <div className='d-flex justify-content-between align-item-start'>
                                    <h5 className='tile-title'>Số lượng theo loại hình đào tạo</h5>
                                    <button className='btn btn-link btn-lg'
                                        onClick={e => e.preventDefault() || this.props.downloadExcelTheoHeDaoTao('tenLoaiHinhDaoTao', 'tenNganh', 'SO LUONG THEO LOAI HINH DAO TAO', this.state.filter)}>
                                        <i className='fa fa-download mb-3' />
                                    </button>
                                </div>
                                {this.renderSoLuongTheoLoaiHinhDaoTaoTable(soLuongTheoLHDTData)}
                            </div>
                        </div>
                    </div>
                    <div className='row' style={{ justifyContent: 'center' }}>
                        <div className='col-lg-6'>
                            <div className='tile' style={{ height: '60vh', overflow: 'auto' }}>
                                <div className='d-flex justify-content-between align-item-start'>
                                    <h5 className='tile-title'>Số lượng theo xếp loại tốt nghiệp</h5>
                                    <button className='btn btn-link btn-lg'
                                        onClick={e => e.preventDefault() || this.props.downloadExcelTheoXepLoai('xepLoai', 'tenNganh', 'SO LUONG THEO XEP LOAI', this.state.filter)}>
                                        <i className='fa fa-download mb-3' />
                                    </button>
                                </div>
                                {this.renderSoLuongTheoXepLoaiTable(soLuongTheoXepLoaiData)}
                            </div>
                        </div>
                    </div>

                    <div className='d-flex justify-content-between align-item-start'>
                        <h5 className='tile-title'>Danh Sách Sinh Viên Tốt Nghiệp</h5>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', marginBottom: '10px' }}>
                        <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageCondition, pageTotal }}
                            getPage={this.getPageSvThongKeTotNghiep} />
                        <button className='btn btn-success' onClick={() => this.props.downloadExcel('DS_SV_TOT_NGHIEP', pageCondition, this.state.filter)} >
                            <i className='fa fa-download mb-3' />
                        </button>
                    </div>
                    {renderTable({
                        getDataSource: () => list,
                        renderHead: () => (<tr>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>STT</th>
                            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>MSSV</th>
                            <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày Tốt Nghiệp</th>
                            <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }}>Đợt Tốt Nghiệp</th>
                            <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }}>Niên Khoá</th>
                            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Hệ Đào Tạo</th>

                        </tr>),
                        renderRow: (item, index) =>
                        (<tr key={index}>
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayTotNghiep} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tenDotTotNghiep} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.khoaSinhVien} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiHinhDaoTao} />
                        </tr>)
                    })}
                </div>,
            backRoute: '/user/ctsv',
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, svThongKeTotNghiep: state.ctsv.svThongKeTotNghiep, });
const mapActionsToProps = {
    getPageSvThongKeTotNghiep, getSvThongKeTotNghiep, createSvThongKeTotNghiep, updateSvThongKeTotNghiep,
    getDataSoLuongTheoKhoa, getDataSoLuongTheoLHDT, getDataSoLuongTheoXepLoai,
    downloadExcelTheoKhoa, downloadExcelTheoHeDaoTao, downloadExcelTheoXepLoai, downloadExcel
};

export default connect(mapStateToProps, mapActionsToProps)(AdminThongKeTotNghiepPage);