import { getDmDonViFaculty } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, FormTextBox, getValue, FormTabs, TableHead, TableCell, renderDataTable } from 'view/component/AdminPage';
import NhomDieuKien from './component/nhomCauHinhComponent';
import {
    createSvDotXetHocBongKkht, getSvDotXetHocBongKkht, getSvDsHocBongByNhom,
    updateSvCauHinhHocBong, autoPhanTienSvHocBongKkht, updateSvDotHocBong
} from './redux/redux';
import { getSvDssvHocBongKkhtPageConLai } from './redux/dssvHocBongRedux';
import { getStudentsPage } from '../svDrlDanhGia/redux';
import Pagination from 'view/component/Pagination';
import { getAllDtNganh } from 'modules/mdCongTacSinhVien/ctsvDtNganhDaoTao/redux';
import { SelectAdapter_DmHinhThucKyLuat } from '../svDmHinhThucKyLuat/redux';
import DanhSachHocBongDuKien from './component/tabDanhSachSinhVien';

export const xepLoaiHocBongMapper = {
    'Xuất sắc': <span className='font-weight-bold' style={{ color: '#019445' }}>Xuất sắc</span>,
    'Giỏi': <span className='font-weight-bold' style={{ color: '#91cb63' }}>Giỏi</span>,
    'Khá': <span className='font-weight-bold' style={{ color: '#fdb041' }}>Khá</span>,
};


class HocBongDetailPage extends AdminPage {
    state = { lsKhoaSelect: [], dsDieuKienXet: [], isEdit: false, editItem: null, filterDssvDieuKien: {}, filter: {}, filterDssvDatDieuKien: {}, idLichSuEdit: null, dssvLichSuHbkk: [], filterLichSuHbkk: {}, dssvDatDieuKien: [], isLoading: false }
    tabDieuKien = {}
    cauHinh = {}
    danhSachHocBong = {}

    componentDidMount() {
        T.ready('/user/ctsv/hoc-bong-khuyen-khich', () => {
            const route = T.routeMatcher('/user/ctsv/hoc-bong-khuyen-khich/edit/:ma');
            this.ma = route.parse(window.location.pathname)?.ma;
            this.props.getDmDonViFaculty(item => {
                item = item.filter(e => e.ma != 32 && e.ma != 33);
                this.setState({ khoa: item });
            });
            this.props.getAllDtNganh(item => {
                this.setState({ nganh: item });
            });
            if (this.ma !== 'new') {
                this.getData(this.ma, () => {
                    let { pageNumber, pageSize, pageCondition } = this.props.sinhVien && this.props.sinhVien.page ? this.props.sinhVien.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
                    this.getStudentsPage(pageNumber, pageSize, pageCondition);
                });
            }
            this.thongTinDotTab.tabClick(null, 0);
        });
    }

    getStudentsPage = (pageNumber, pageSize, pageCondition, done) => {
        this.props.getStudentsPage(pageNumber, pageSize, pageCondition, this.state.filter, this.state?.sortTerm || this.defaultSortTerm, done);
    };

    getData = (ma, done) => {
        this.setState({ isLoading: true });
        this.props.getSvDotXetHocBongKkht(ma, (data) => {
            const { tenDot, namHoc, hocKy, dtbHocKyMin, drlHocKyMin, soTinChiHocKy, dsDieuKien, kyLuatKhongChoPhep } = data;
            this.tenDot.value(tenDot || '');
            this.namHoc.value(namHoc || '');
            this.hocKy.value(hocKy || '');
            this.diemTrungBinhMin.value(dtbHocKyMin || '');
            this.diemRenLuyenMin.value(drlHocKyMin || '');
            this.soTinChiHocKy.value(soTinChiHocKy || '');
            this.kyLuatKhongChoPhep.value(kyLuatKhongChoPhep?.split(',') || '');
            const dsDieuKienXet = dsDieuKien || [];
            this.setState({ filter: { namHoc, hocKy }, isLoading: false, dsDieuKienXet: dsDieuKienXet.map((dk, index) => ({ ...dk, idDieuKien: index, dsNhom: dk.dsNhom.map((nhom, index) => ({ ...nhom, idNhom: index })) })) }, () => {
                done && done();
            });
        });
    }

    addNewDieuKien = (dieuKien, done) => {
        const { dsDieuKienXet } = this.state;
        const index = dsDieuKienXet.findIndex((element) => element.idDieuKien === dieuKien.idDieuKien);
        if (index === -1) {
            dsDieuKienXet.push({
                ...dieuKien,
                idDieuKien: dsDieuKienXet.length
            });
        } else {
            dsDieuKienXet[index] = {
                ...dsDieuKienXet[index],
                ...dieuKien,
            };
        }
        this.setState({ dsDieuKienXet }, () => {
            this.tabs.tabClick(null, index == -1 ? dsDieuKienXet.length - 1 : index);
            done && done();
        });
    }

    deleteDieuKien = (idDieuKien) => {
        const { dsDieuKienXet } = this.state;
        this.setState({ dsDieuKienXet: dsDieuKienXet.filter(dieuKien => dieuKien.idDieuKien != idDieuKien).map((dieuKien, index) => ({ ...dieuKien, idDieuKien: index })) });
    }

    handleKeySearch = (data) => {
        const { dssvDieuKien } = this.state;
        this.setState({ filterDssvDieuKien: { ...this.state.filterDssvDieuKien, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            const { ks_mssv, ks_hoTen, ks_tenKhoa, ks_tenNganh } = this.state.filterDssvDieuKien;
            this.setState({
                dssvFilterDieuKien: dssvDieuKien.filter(sv => (
                    sv.mssv.toLowerCase().includes(ks_mssv !== undefined ? ks_mssv.toLowerCase() : '')
                    && sv.hoTen.toLowerCase().includes(ks_hoTen !== undefined ? ks_hoTen.toLowerCase() : '')
                    && sv.tenKhoa.toLowerCase().includes(ks_tenKhoa !== undefined ? ks_tenKhoa.toLowerCase() : '')
                    && sv.tenNganh.toLowerCase().includes(ks_tenNganh !== undefined ? ks_tenNganh.toLowerCase() : '')
                ))
            });
        });
    }


    componentDieuKien = (dieuKien, index) => {
        const { khoa, nganh, editItem, isLoading } = this.state;
        return (<FormTabs id={`cauHinhDetail-${index}`} ref={e => this.tabDieuKien[index] = e}
            contentClassName='mt-3'
            tabs={[
                {
                    id: 0, title: 'Thông tin cấu hình', component: <>
                        <NhomDieuKien isLoading={isLoading} key={index} idDot={this.ma} index={index} khoa={khoa} nganh={nganh} ref={e => this.cauHinh[index] = e}
                            onSave={() => { this.setState({ editItem: null }); this.getData(this.ma); }}
                            setEditItem={() => this.setState({ editItem: dieuKien.idDieuKien })}
                            deleteDieuKien={this.deleteDieuKien} cloneCauHinh={this.cloneCauHinh}
                            addNewDieuKien={this.addNewDieuKien} readOnly={editItem == dieuKien.idDieuKien ? false : true}
                            dieuKien={dieuKien} huyEditDieuKien={() => this.setState({ editItem: null })}
                            getSvDsHocBongByNhom={this.props.getSvDsHocBongByNhom} validateKinhPhi={this.validateKinhPhi}
                            autoPhanTienSvHocBongKkht={this.props.autoPhanTienSvHocBongKkht} />
                    </>
                },
                {
                    id: 1, title: 'Danh sách sinh viên', component: <DanhSachHocBongDuKien ref={e => this.danhSachHocBong[index] = e} dieuKien={dieuKien}
                        permission={this.getUserPermission('ctsvDotXetHocBongKkht', ['manage', 'write', 'delete'])}
                        onChange={() => {
                            this.thongTinDotTab.tabClick(null, 1);
                            this.getData(this.ma);
                        }} />
                }
            ]}
            onChange={({ tabIndex }) => tabIndex == 1 && this.danhSachHocBong[index].getDssvTheoDieuKien()} />);
    }

    cloneCauHinh = (cauHinhIndex) => {
        const data = this.cauHinh[cauHinhIndex].cloneDieuKien();
        this.addNewDieuKien(data);
    }

    onChangeTabDieuKien = (e) => {
        this.tabDieuKien[e.tabIndex]?.tabClick(null, 0);
    }

    handleKeySearchDsTongHop = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getStudentsPage(pageNumber, pageSize, pageCondition);
        });
    }

    kyLuatMapper = (danhSachKyLuat, danhSachNgayXuLy, soKyLuat) => {
        if (soKyLuat == 0) return [];
        let danhSachKyLuats = danhSachKyLuat.split('??');
        let danhSachNgayXuLys = danhSachNgayXuLy.split('??');
        let results = [];
        for (let i = 0; i < soKyLuat; i++) {
            danhSachKyLuats[i] = danhSachKyLuats[i]?.trim();
            danhSachNgayXuLys[i] = danhSachNgayXuLys[i]?.trim();
        }
        for (let i = 0; i < soKyLuat; i++) {
            let s = danhSachKyLuats[i],
                t = danhSachNgayXuLys[i] ? T.dateToText(Number(danhSachNgayXuLys[i]), 'dd/mm/yyyy HH:MM') : '';
            results.push(<div key={results.length}> <span>
                {i + 1}. {s} {t ? `(${t})` : ''}
            </span></div>);
        }
        return results;
    }

    lichSuDtbMapper = (lichSuDtb) => {
        let danhSachLichSuDtb = lichSuDtb ? lichSuDtb.split('??') : [];
        let results = [];
        for (let i = 0; i < danhSachLichSuDtb.length; i++) {
            let [dtb, ngayCapNhat] = danhSachLichSuDtb[i]?.trim().split(':');
            results.push(<div key={results.length}> <span>
                {i + 1}. {dtb} : {ngayCapNhat ? T.dateToText(Number(ngayCapNhat), 'dd/mm/yyyy HH:MM') : ''}
            </span></div>);
        }
        return results;
    }

    dssvTongHop = () => {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sinhVien && this.props.sinhVien.page ?
            this.props.sinhVien.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu sinh viên',
            stickyHead: true,
            header: 'thead-light',
            loadingStyle: { backgroundColor: 'white' },
            className: this.state.quickAction ? 'table-fix-col' : '',
            data: list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: '10%' }} content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearchDsTongHop} />
                    <TableHead style={{ width: '20%' }} content='Họ và tên lót' keyCol='ho' onKeySearch={this.handleKeySearchDsTongHop} />
                    <TableHead style={{ width: '10%' }} content='Tên' keyCol='ten' onKeySearch={this.handleKeySearchDsTongHop} />
                    <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Khoa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngành</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>ĐTB</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>ĐRL</th>
                    <th style={{ width: '5%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tín chỉ</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Kỷ luật</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' url={`/user/ctsv/danh-gia-drl/${item.mssv}`} style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tinhTrangSinhVien || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                        <>
                            <b>{item.diemTbHocKy}</b> <br />
                            {this.lichSuDtbMapper(item.lichSuDtb)}
                        </>
                    } />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<b>{item.diemTk}</b> || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<b>{item.tinChiDangKy}</b> || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.soKyLuat ? this.kyLuatMapper(item.danhSachKyLuat, item.danhSachNgayXuLy, item.soKyLuat) : ''} />
                </tr>
            )
        });
        return (<div>
            <div className='mb-2'>
                <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getStudentsPage} pageRange={5} />
            </div>
            {table}
        </div>);
    }

    componentDanhSachDieuKien = () => {
        const { isEdit, dsDieuKienXet, khoa, nganh, editItem, isLoading } = this.state;
        const dsTabDieuKien = dsDieuKienXet.length ? dsDieuKienXet.map((dieuKien, index) => (
            { id: index, title: dieuKien.ten || `Cấu hình ${index + 1}`, component: this.componentDieuKien(dieuKien, index) }
        )) : [];
        return (
            <div className='tile'>
                <div className='d-flex justify-content-between align-items-baseline'>
                    <h2>Điều kiện xét học bổng</h2>
                    {(!isEdit && editItem == null) ? <button className='btn btn-info' type='button' onClick={e => {
                        e.preventDefault(); this.setState({ isEdit: true }, () => this.tabs.tabClick(null, dsDieuKienXet.length));
                    }}>
                        <i className='fa fa-sm fa-plus' /> Thêm điều kiện
                    </button> : null}
                </div>
                {<div>
                    <FormTabs id='dsDieuKIen'
                        ref={e => this.tabs = e}
                        onChange={(e) => this.onChangeTabDieuKien(e)}
                        tabs={[
                            ...(dsDieuKienXet.length ? dsTabDieuKien : []),
                            ...isEdit ? [{
                                title: `Cấu hình ${dsDieuKienXet.length + 1}`,
                                component: <NhomDieuKien key={0} isLoading={isLoading} idDot={this.ma}
                                    onSave={() => { this.setState({ isEdit: null }); this.getData(this.ma); }}
                                    index={dsDieuKienXet.length} khoa={khoa} nganh={nganh}
                                    addNewDieuKien={this.addNewDieuKien}
                                    huyAddNew={() => this.setState({ isEdit: false })}
                                    getSvDsHocBongByNhom={this.props.getSvDsHocBongByNhom}
                                    validateKinhPhi={this.validateKinhPhi} autoPhanTienSvHocBongKkht={this.props.autoPhanTienSvHocBongKkht} />
                            }] : [],
                            ...(this.ma != 'new' ? [{ title: 'Lịch sử điểm', component: this.dssvTongHop() }] : []),
                        ]} />
                </div>}
            </div>
        );
    }

    buildDataDotHocBong = () => {
        try {
            return {
                ten: getValue(this.tenDot),
                namHoc: getValue(this.namHoc),
                hocKy: getValue(this.hocKy),
                dtbHocKyMin: getValue(this.diemTrungBinhMin),
                drlHocKyMin: getValue(this.diemRenLuyenMin),
                soTinChiHocKy: getValue(this.soTinChiHocKy),
                kyLuatKhongChoPhep: getValue(this.kyLuatKhongChoPhep) ? getValue(this.kyLuatKhongChoPhep).toString() : '',
            };
        } catch (error) {
            error.props && T.alert(`${error.props.label || 'Dữ liệu'} bị trống!`);
            return '';
        }
    }

    saveCauHinh = () => {
        const changes = this.buildDataDotHocBong();
        if (!changes) return;
        const { dsDieuKienXet } = this.state;
        changes.dsDieuKienXet = dsDieuKienXet;
        if (this.ma == 'new') {
            T.confirm('Lưu thông tin', 'Bạn có chắc muốn lưu thông tin cấu hình đợt xét học bổng này?', isConfirm => {
                if (isConfirm)
                    this.props.createSvDotXetHocBongKkht(changes, (data) => {
                        this.props.history.push(`/user/ctsv/hoc-bong-khuyen-khich/edit/${data.id}`);
                        window.location.reload(false);
                    });
            });
        } else {
            T.confirm('Lưu thông tin', 'Bạn có chắc muốn lưu thông tin cấu hình đợt xét học bổng này?', isConfirm => {
                if (isConfirm)
                    this.props.updateSvCauHinhHocBong(this.ma, changes);
            });
        }
    }

    saveDotHocBong = () => {
        const changes = this.buildDataDotHocBong();
        if (!changes) return;
        this.props.updateSvDotHocBong(this.ma, changes, () => this.getData(this.ma));
    }

    validateKinhPhi = (ref) => {
        const kinhPhiTong = this.tongKinhPhi.value();
        if (kinhPhiTong == null) {
            T.notify('Vui lòng nhập tổng kinh phí cho đợt xét học bổng', 'warning');
            this.tongKinhPhi.focus();
            ref.value('');
        } else {
            const kinhPhiCheck = ref.value();
            const totalUse = Number(this.state.dsDieuKienXet.reduce((init, item) => init + Number(item.tongKinhPhi), 0));
            if (kinhPhiCheck > (Number(kinhPhiTong) - totalUse)) {
                T.notify('Kinh phí cho nhóm phải nhỏ hơn kinh phí tổng', 'danger');
                ref.value('');
                ref.focus();
            }
        }
    }

    checkChangeTongKinhPhi = () => {
        const kinhPhiTong = this.tongKinhPhi.value() || 0;
        const totalUse = Number(this.state.dsDieuKienXet.reduce((init, item) => init + Number(item.tongKinhPhi), 0));
        if (kinhPhiTong < totalUse) {
            T.notify('Kinh phí tổng phải lớn hơn kinh phí cấp cho các cấu hình');
            this.tongKinhPhi.value('');
        }
    }

    onChangeTabDieuKienThongTinDot = (e) => {
        if (e.tabIndex == 1) {
            this.getThongTinThongKeHocBongKkht();
        }
    }

    componentThongKeHocBongKkht = () => {
        const { dsDieuKienXet } = this.state;
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu cấu hình',
            stickyHead: false,
            header: 'thead-light',
            loadingStyle: { backgroundColor: 'white' },
            className: this.state.quickAction ? 'table-fix-col' : '',
            data: dsDieuKienXet,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'left' }}>Tên cấu hình</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'left' }}>Hệ đào tạo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'left' }}>Khóa sinh viên</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng kinh phí</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Đã sử dụng</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Còn lại</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Phát sinh</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Sinh viên được nhận</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.heDaoTao || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.khoaSinhVien || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='number' content={item.tongKinhPhi || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center', background: (Number(item.daSuDung || 0) > Number(item.tongKinhPhi || 0)) ? '#f7de97' : '' }} type='number' content={item.daSuDung || 0} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='number' content={item.kinhPhiConLai || 0} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='number' content={item.kinhPhiPhatSinh || 0} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='number' content={item.tongSinhVien || '0'} />
                </tr>
            )
        });
        return <>
            {/* <div className='d-flex justify-content-end'>
                <Tooltip title='Tải lại'><button className='btn btn-primary' type='button' onClick={() => this.getThongTinThongKeHocBongKkht()}><i className='fa fa-refresh' /></button></Tooltip>
            </div> */}
            {table}
        </>;
    }


    render = () => {
        return this.renderPage({
            title: 'Tạo mới đợt xét học bổng khuyến khích học tâp',
            icon: 'fa fa-university',
            content: <>
                <FormTabs id='dotHocBongInfo'
                    ref={e => this.thongTinDotTab = e}
                    // onChange={(e) => this.onChangeTabDieuKienThongTinDot(e)}
                    contentClassName='tile'
                    tabs={[
                        {
                            id: 0, title: 'Thông tin chung', component: <>
                                <h2>Thông tin chung</h2>
                                <div className='row'>
                                    <FormTextBox ref={e => this.tenDot = e} className='col-md-4' label='Tên đợt' required />
                                    <FormTextBox ref={e => this.namHoc = e} className='col-md-4' label='Năm học' type='scholastic' required />
                                    <FormSelect ref={e => this.hocKy = e} className='col-md-4' label='Học kỳ' data={SelectAdapter_DtDmHocKy} required />
                                    <FormTextBox ref={e => this.diemTrungBinhMin = e} className='col-md-4' label='Điểm trung bình học kỳ từ' type='number' step={0.1} decimalScale={1} allowNegative={false} required />
                                    <FormTextBox ref={e => this.diemRenLuyenMin = e} className='col-md-4' label='Điểm rèn luyện học kỳ từ' type='number' allowNegative={false} required />
                                    <FormTextBox ref={e => this.soTinChiHocKy = e} className='col-md-4' label='Số tín chỉ học kỳ đăng ký từ' type='number' required />
                                    <FormSelect ref={e => this.kyLuatKhongChoPhep = e} className='col-md-12' label='Kỷ luật không cho phép' data={SelectAdapter_DmHinhThucKyLuat} multiple={true} required />
                                </div>
                            </>,
                        }, ...(this.ma != 'new' ? [{ id: 1, title: 'Thống kê', component: this.componentThongKeHocBongKkht() }] : [])
                    ]} />
                {this.componentDanhSachDieuKien()}
            </>,
            backRoute: '/user/ctsv/hoc-bong-khuyen-khich',
            onSave: () => this.ma == 'new' ? this.saveCauHinh() : this.saveDotHocBong()
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtChuongTrinhDaoTao: state.daoTao.dtChuongTrinhDaoTao, sinhVien: state.ctsv.ctsvDanhGiaDrl });
const mapActionsToProps = {
    getDmDonViFaculty, createSvDotXetHocBongKkht, getSvDotXetHocBongKkht,
    getSvDsHocBongByNhom, updateSvCauHinhHocBong, autoPhanTienSvHocBongKkht,
    getStudentsPage, getAllDtNganh,
    getSvDssvHocBongKkhtPageConLai,
    updateSvDotHocBong
};
export default connect(mapStateToProps, mapActionsToProps)(HocBongDetailPage);