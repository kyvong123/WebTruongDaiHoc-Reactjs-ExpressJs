import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Tooltip } from '@mui/material';
import { AdminPage, FormSelect, TableCell, renderTable, FormTabs, FormCheckbox } from 'view/component/AdminPage';
import { SelectAdapter_DangKyHocPhanStudent } from 'modules/mdDaoTao/dtDangKyHocPhan/redux';
import { getCauHinh, deleteDangKyHocPhan, getFullData, getKetQuaDangKy } from './redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import HocPhanKeHoachTab from './section/hocPhanKeHoachTab';
import HocPhanNgoaiCTDTTab from './section/hocPhanNgoaiCTDTTab';
import HocPhanNgoaiKeHoachTab from './section/hocPhanNgoaiKeHoachTab';
import MoPhongHocPhi from './section/MoPhongHocPhi';
import HocPhanModal from './hocPhanModal';
import StudentInfoSection from './section/StudentInfoSection';
import ThoiKhoaBieuSection from './section/ThoiKhoaBieuSection';
import LichHocSection from './section/LichHocSection';
// import LichNghiBuSection from './section/LichNghiBuSection';
import LichThiSection from './section/LichThiSection';
import BangDiemSection from './section/BangDiemSection';
import LichSuDangKySection from './section/LichSuDangKySection';
import ChungChiSection from './section/ChungChiSection';
import TotNghiepSection from './section/TotNghiepSection';

class MoPhongPage extends AdminPage {
    state = { userData: null, isSV: false, filter: {}, listHocPhan: [], ketQuaDangKy: [], isChonCauHinh: false }
    checkRef = {}

    mapperLoaiDangKy = {
        'KH': <span><i className='fa fa-lg fa-sign-in' /> Theo kế hoạch</span>,
        'NKH': <span><i className='fa fa-lg fa-sign-out' /> Ngoài kế hoạch</span>,
        'NCTDT': <span><i className='fa fa-lg fa-info-circle' /> Ngoài CTĐT</span>,
        'CT': <span><i className='fa fa-lg fa-chevron-circle-right' /> Cải thiện</span>,
        'HL': <span><i className='fa fa-lg fa-repeat' /> Học lại</span>,
        'HV': <span><i className='fa fa-lg fa-chevron-circle-up' /> Học vượt</span>,
    }

    onChangeSV = (e) => {
        this.props.getCauHinh(e.id, data => this.setState({
            fullDataCauHinh: data.items,
            listCauHinh: data.items.filter(item => {
                if (!data.semester) return item;
                let { namHoc, hocKy } = data.semester;
                return item.namHoc == namHoc && item.hocKy === hocKy;
            }),
            timeNow: parseInt(data.timeNowServer),
            namHoc: data.semester?.namHoc,
            hocKy: data.semester?.hocKy,
            cauHinhDiem: data.settingDiem,
            cauHinhTKB: data.settingTKB,
            userData: e.userData,
            isSV: true,
            isChonCauHinh: false,
        }, () => {
            this.tab.tabClick(null, 0);
            this.learningTab.tabClick(null, 0);
            this.studentInfo.setValue(e.userData.mssv);
            this.moPhongHocPhi.setValue(e.userData.mssv);
            this.thoiKhoaBieu.setValue(e.userData.mssv);
            this.lichHoc.setValue(e.userData.mssv);
            // this.lichNghiBu.setValue(e.userData.mssv);
            this.lichThi.setValue(e.userData.mssv);
            this.bangDiem.setValue(e.userData.mssv);
            this.lichSuDangKy.setValue(e.userData.mssv);
            this.chungChi.setValue(e.userData.mssv);
            this.totNghiep.setValue(e.userData.mssv);
            this.namHocFilter.value(data.semester?.namHoc);
            this.hocKyFilter.value(data.semester?.hocKy);
        }));
    }

    chonCauHinh = (item) => {
        // Get from static variable
        if (item.ngayBatDau <= this.state.timeNow && item.ngayKetThuc >= this.state.timeNow) {
            let { theoKeHoach, ngoaiKeHoach, ngoaiCtdt, chuyenLop, namHoc, hocKy, id, kichHoat, ngoaiNgu } = item;
            this.props.getKetQuaDangKy(this.state.userData.mssv, { namHoc, hocKy, id }, data => {
                this.setState({
                    cauHinh: item,
                    configDispatch: { ngoaiNgu, theoKeHoach, ngoaiKeHoach, ngoaiCtdt, chuyenLop, namHoc, hocKy, id },
                    isChonCauHinh: true,
                }, () => {
                    if (kichHoat) {
                        T.alert('Vui lòng chờ trong giây lát!', 'info', false, null, true);
                        let filter = {
                            userData: this.state.userData,
                            cauHinh: this.state.configDispatch,
                            hocPhanDangKy: data,
                        };
                        this.props.getFullData(filter, '', () => {
                            T.alert('Tải dữ liệu thành công!', 'success', false, 1000);
                        });
                    }
                });
            });
        } else {
            this.setState({ isChonCauHinh: true, cauHinh: item });
        }
    }

    xoaHocPhan = (item) => {
        T.confirm('Cảnh báo', `Bạn có chắc muốn hủy đăng ký học phần ${item.maHocPhan}?`, 'warning', true, isConfirm => {
            if (isConfirm) {
                let theoKeHoach = this.props.hocPhan?.listKH?.includes(item.maMonHoc);
                let ngoaiKeHoach = this.props.hocPhan?.listNKH?.includes(item.maMonHoc);
                let ngoaiCtdt = this.props.hocPhan?.listNCTDT?.includes(item.maMonHoc);

                const { cauHinh } = this.state;
                let { id, namHoc, hocKy } = cauHinh;
                let filter = {
                    cauHinh: { id, namHoc, hocKy },
                };

                let dataState = this.props.hocPhan || {},
                    { searchTextKH, searchTextNKH, searchTextNCTDT } = dataState;
                if (theoKeHoach) {
                    filter = {
                        ...filter,
                        searchText: searchTextKH,
                        theoKeHoach: true,
                    };
                } else if (ngoaiKeHoach) {
                    filter = {
                        ...filter,
                        searchText: searchTextNKH,
                        ngoaiKeHoach: true,
                    };
                } else if (ngoaiCtdt) {
                    filter = {
                        ...filter,
                        searchText: searchTextNCTDT,
                        ngoaiCtdt: true,
                    };
                }
                filter.tenMonHoc = T.parse(item.tenMonHoc, { vi: '' })?.vi;
                T.alert('Đang xử lý', 'warning', false, null, true);
                this.props.deleteDangKyHocPhan({
                    userData: this.state.userData, hocPhan: item.maHocPhan, filter
                }, () => {
                    let filter = {
                        userData: this.state.userData,
                        cauHinh: this.state.configDispatch,
                        hocPhanDangKy: this.props.hocPhan?.ketQuaDangKy || [],
                    };
                    this.props.getFullData(filter, '', () => {
                        T.alert('Huỷ học phần thành công!', 'success', true, 5000);
                    });
                });
            }
        });
    }

    chuyenHocPhan = (item) => {
        let theoKeHoach = item.type == 'KH';
        let ngoaiKeHoach = item.type == 'NKH' || item.type == 'HV';
        let ngoaiCtdt = item.type == 'NCTDT';
        if (theoKeHoach) {
            item.theoKeHoach = true;
            item.isUpdate = true;
            this.modalHocPhan.show(item);
        } else if (ngoaiKeHoach) {
            item.ngoaiKeHoach = true;
            item.isUpdate = true;
            this.modalHocPhan.show(item);
        } else if (ngoaiCtdt) {
            item.ngoaiCtdt = true;
            item.isUpdate = true;
            this.modalHocPhan.show(item);
        } else {
            item.isUpdate = true;
            this.modalHocPhan.show(item);
        }
    }

    chonHocPhan = (createFunc) => {
        T.alert('Đang xử lý', 'warning', false, null, true);
        createFunc((data) => {
            if (data.message) {
                T.alert(data.message, 'error', false, 5000);
            } else {
                let filter = {
                    userData: this.state.userData,
                    cauHinh: this.state.configDispatch,
                    hocPhanDangKy: this.props.hocPhan?.dataKetQua || [],
                };
                this.props.getFullData(filter, '', () => {
                    T.alert('Đăng ký thành công', 'success', true, 5000);
                });
            }
        });
    }

    checkTrung = (item) => {
        const { dataKetQua } = this.props.hocPhan || { dataKetQua: [] };
        const { ngayBatDau: iNgayBatDau, ngayKetThuc: iNgayKetThuc, soTietBuoi: iSoTietBuoi, thu: iThu, tietBatDau: iTietBatDau } = item;
        for (let ketQua of dataKetQua) {
            if (ketQua.maHocPhan != item.maHocPhan) {
                const { thu, tietBatDau, soTietBuoi, ngayBatDau, ngayKetThuc } = ketQua;
                if (!(iNgayKetThuc < ngayBatDau || iNgayBatDau > ngayKetThuc)) {
                    let tietKetThuc = tietBatDau + soTietBuoi - 1;
                    let iTietKetThuc = iTietBatDau + iSoTietBuoi - 1;
                    if (thu == iThu && !(iTietKetThuc < tietBatDau || iTietBatDau > tietKetThuc)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    handleCheck = (i, value) => {
        if (value) {
            this.setState({
                listCauHinh: this.state.listCauHinh.map((item, index) => {
                    if (index == i) {
                        this.checkRef[index]?.value(value);
                        return ({ ...item, checked: Number(value) });
                    } else {
                        this.checkRef[index]?.value(!value);
                        return ({ ...item, checked: Number(!value) });
                    }
                })
            });
        } else {
            this.setState({ listCauHinh: this.state.listCauHinh.map(item => ({ ...item, checked: value })) });
        }

    }

    statusDot = (item) => {
        if (parseInt(this.state.timeNow) < parseInt(item.ngayBatDau)) return 'Chưa bắt đầu';
        else if (parseInt(this.state.timeNow) > parseInt(item.ngayKetThuc)) return 'Đã kết thúc';
        else return 'Đang diễn ra';
    }

    handleChangeHinh = () => {
        let namHoc = this.namHocFilter.value(), hocKy = this.hocKyFilter.value();
        let listCauHinh = this.state.fullDataCauHinh?.filter(item =>
            item.namHoc == namHoc
            && item.hocKy == hocKy
        );
        this.setState({ listCauHinh: listCauHinh.map(i => ({ ...i, checked: false })), namHoc, hocKy, isChonCauHinh: false, cauHinh: null });
    }

    render() {

        const { cauHinh, isChonCauHinh, cauHinhDiem, cauHinhTKB, userData } = this.state;
        const { theoKeHoach, ngoaiKeHoach, ngoaiCtdt, huyMon, chuyenLop, ghiChu, kichHoat } = cauHinh || {};
        let dataState = this.props.hocPhan || {},
            { dataKetQua } = dataState;

        let ketQuaDangKy = renderTable({
            getDataSource: () => Object.keys((dataKetQua || []).groupBy('maHocPhan')),
            emptyTable: 'Chưa có đăng ký nào!!',
            header: 'thead-light',
            stickyHead: dataKetQua?.length > 5,
            divStyle: { height: '40vh' },
            renderHead: () => (<tr>
                <th style={{ widht: 'auto' }}>#</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap', }}>Mã học phần</th>
                <th style={{ width: '40%', whiteSpace: 'nowrap', }}>Tên môn học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>TC</th>
                <th style={{ width: 'auto', }}>Tổng tiết</th>
                <th style={{ width: 'auto', }}>Lớp</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Bắt đầu</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Kết thúc</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Phòng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Thứ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Tiết</th>
                <th style={{ width: '15%', whiteSpace: 'nowrap', }}>Giảng viên</th>
                <th style={{ width: '15%', whiteSpace: 'nowrap', }}>Trợ giảng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Loại đăng ký</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', display: (chuyenLop || huyMon) ? '' : 'none' }}>Chuyển/Hủy lớp</th>
            </tr>
            ),
            renderRow: (item, index) => {
                const rows = [];
                let listHocPhan = (dataKetQua || []).groupBy('maHocPhan')[item] || [],
                    rowSpan = listHocPhan.length;
                if (rowSpan) {
                    for (let i = 0; i < rowSpan; i++) {
                        const hocPhan = listHocPhan[i];
                        let isTrung = this.checkTrung(hocPhan);
                        let khoaDky = hocPhan.tinhTrang == 3;
                        if (i == 0) {
                            rows.push(
                                <tr key={rows.length} style={{ backgroundColor: isTrung ? '#f7de97' : '#ffffff' }}>
                                    <TableCell content={index + 1} rowSpan={rowSpan} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.maHocPhan} rowSpan={rowSpan} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi} rowSpan={rowSpan} />
                                    <TableCell type='number' style={{ whiteSpace: 'nowrap' }} content={hocPhan.tongTinChi} rowSpan={rowSpan} />
                                    <TableCell type='number' style={{ whiteSpace: 'nowrap' }} content={hocPhan.tongTiet} rowSpan={rowSpan} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.listMaLop && hocPhan.listMaLop.length ? hocPhan.listMaLop.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} rowSpan={rowSpan} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayBatDau} rowSpan={rowSpan} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayKetThuc} rowSpan={rowSpan} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.thu} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.maLoaiDky && this.mapperLoaiDangKy[hocPhan.maLoaiDky] ? this.mapperLoaiDangKy[hocPhan.maLoaiDky] : ''} rowSpan={rowSpan} />
                                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={hocPhan} permission={{ write: khoaDky || chuyenLop, delete: huyMon }} display={chuyenLop || huyMon} rowSpan={rowSpan}>
                                        <Tooltip title='Chuyển học phần' arrow>
                                            <button className='btn btn-info' onClick={e => e.preventDefault() || this.chuyenHocPhan(hocPhan)} style={{ display: (!khoaDky && chuyenLop) ? '' : 'none' }}>
                                                <i className='fa fa-lg fa-repeat' />
                                            </button>
                                        </Tooltip>
                                        <Tooltip title='Hủy môn' arrow>
                                            <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.xoaHocPhan(hocPhan)} style={{ display: (!khoaDky && huyMon) ? '' : 'none' }}>
                                                <i className='fa fa-lg fa-trash' />
                                            </button>
                                        </Tooltip>
                                        <Tooltip title='Học phần đã bị khóa đăng ký' arrow onClick={(e) => e.preventDefault() || T.alert('Học phần đã được khoá đăng ký. Vui lòng liên hệ Phòng Đào tạo!', 'error', false, 5000)}>
                                            <button className='btn btn-secondary' style={{ display: khoaDky ? '' : 'none' }}>
                                                <i className='fa fa-lg fa-lock' />
                                            </button>
                                        </Tooltip>
                                    </TableCell>
                                </tr>);
                        } else {
                            rows.push(
                                <tr key={rows.length} style={{ backgroundColor: isTrung ? '#f7de97' : '#ffffff' }}>
                                    <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.thu} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                </tr>
                            );
                        }
                    }
                }
                return rows;
            }
        });

        let tabs = [];
        if (theoKeHoach) {
            tabs.push({
                title: 'Theo kế hoạch',
                component: <HocPhanKeHoachTab ref={e => this.keHoachTab = e} userData={userData} cauHinh={cauHinh} loading={this.chonHocPhan} cauHinhDiem={cauHinhDiem} cauHinhTKB={cauHinhTKB} configDispatch={this.state.configDispatch} />,
            });
        }
        if (ngoaiKeHoach) {
            tabs.push({
                title: 'Ngoài kế hoạch',
                component: <HocPhanNgoaiKeHoachTab ref={e => this.ngoaiKeHoachTab = e} userData={userData} cauHinh={cauHinh} loading={this.chonHocPhan} cauHinhDiem={cauHinhDiem} cauHinhTKB={cauHinhTKB} configDispatch={this.state.configDispatch} />,
            });
        }
        if (ngoaiCtdt) {
            tabs.push({
                title: 'Ngoài chương trình đào tạo',
                component: <HocPhanNgoaiCTDTTab ref={e => this.ngoaiCTDTTab = e} userData={userData} cauHinh={cauHinh} loading={this.chonHocPhan} cauHinhDiem={cauHinhDiem} cauHinhTKB={cauHinhTKB} configDispatch={this.state.configDispatch} />,
            });
        }

        return this.renderPage({
            icon: 'fa fa-bug',
            title: 'Mô phỏng sinh viên',
            content: <>
                <div className='tile mb-2'>
                    <h6 className='col-md-12 tile-title'>Chọn sinh viên thao tác</h6>
                    <FormSelect ref={e => this.sinhVien = e} className='col-md-12' placeholder='Sinh viên' data={SelectAdapter_DangKyHocPhanStudent}
                        onChange={(e) => this.onChangeSV(e)} />
                </div>
                {this.state.isSV && <FormTabs ref={e => this.tab = e} tabs={[
                    {
                        title: 'Trang cá nhân',
                        component: <StudentInfoSection ref={e => this.studentInfo = e} mssv={this.state.userData.mssv} />
                    },
                    {
                        title: 'Học phí',
                        component: <MoPhongHocPhi ref={e => this.moPhongHocPhi = e} mssv={this.state.userData.mssv} />
                    },
                    {
                        title: 'Học tập',
                        component: <>
                            <div>
                                <FormTabs ref={e => this.learningTab = e} tabs={[
                                    {
                                        title: 'Thời khóa biểu',
                                        component: <ThoiKhoaBieuSection ref={e => this.thoiKhoaBieu = e} mssv={this.state.userData.mssv} />
                                    },
                                    {
                                        title: 'Lịch học',
                                        component: <LichHocSection ref={e => this.lichHoc = e} mssv={this.state.userData.mssv} />
                                    },
                                    // {
                                    //     title: 'Lịch nghỉ bù',
                                    //     component: <LichNghiBuSection ref={e => this.lichNghiBu = e} mssv={this.state.userData.mssv} />
                                    // },
                                    {
                                        title: 'Lịch thi',
                                        component: <LichThiSection ref={e => this.lichThi = e} mssv={this.state.userData.mssv} />
                                    },
                                    {
                                        title: 'Bảng điểm',
                                        component: <BangDiemSection ref={e => this.bangDiem = e} mssv={this.state.userData.mssv} />
                                    },
                                    {
                                        title: 'Đăng ký học phần',
                                        component: <div className='tile'>
                                            <HocPhanModal ref={e => this.modalHocPhan = e} userData={userData} loading={this.chonHocPhan} cauHinh={cauHinh} cauHinhDiem={cauHinhDiem} cauHinhTKB={cauHinhTKB} configDispatch={this.state.configDispatch} />
                                            <div className='row'>
                                                <FormSelect ref={e => this.namHocFilter = e} className='col-md-6' label='Năm học' data={SelectAdapter_SchoolYear} onChange={this.handleChangeHinh} />
                                                <FormSelect ref={e => this.hocKyFilter = e} className='col-md-6' label='Học kỳ' data={SelectAdapter_DtDmHocKy} onChange={this.handleChangeHinh} />
                                            </div>
                                            <div>
                                                {
                                                    this.state.isSV ? <>
                                                        {isChonCauHinh ? <>
                                                            {
                                                                !kichHoat ? <div className='tile' style={{ textAlign: 'center' }}>
                                                                    <h5 className='tile-title'>Bạn không đủ điều kiện đăng ký</h5>
                                                                    {!!ghiChu && <i>Lý do: {ghiChu}</i>}
                                                                </div> : <>
                                                                    {dataKetQua && <div className='tile'>
                                                                        <h5 className='tile-title'>Kết quả đăng ký</h5>
                                                                        <div className='tile-body'>{ketQuaDangKy}</div>
                                                                    </div>}
                                                                    {(theoKeHoach || ngoaiKeHoach || ngoaiCtdt) ? <FormTabs tabs={tabs} /> : null}
                                                                </>
                                                            }
                                                        </> : <div className='tile' >
                                                            <h2 className='tile-title'>Vui lòng chọn đợt đăng ký</h2>
                                                            {this.state.listCauHinh?.length == 0 && <i>Hiện không có đợt đăng ký nào</i>}
                                                            {(this.state.listCauHinh || []).map((item, index) => <div key={index} style={{ marginBottom: 15 }}>
                                                                <FormCheckbox ref={e => this.checkRef[index] = e} value={item.checked} style={{ fontSize: '1.2rem', marginBottom: 0 }} label={`[HK${item.hocKy}, NH${item.namHoc}] ${item.tenDot}`} onChange={(value) => this.handleCheck(index, value)} />
                                                                <i>Từ {T.dateToText(item.ngayBatDau)} - {T.dateToText(item.ngayKetThuc)} | {this.statusDot(item)}</i>
                                                                <hr />
                                                            </div>)}
                                                            <div className='tile-footer' style={{ display: this.state.listCauHinh?.some(item => item.checked == 1) ? '' : 'none' }}>
                                                                <button className='btn btn-outline-primary' onClick={e => e.preventDefault() || this.chonCauHinh(this.state.listCauHinh.find(item => item.checked == 1))}>
                                                                    Tiếp theo <i className='fa fa-lg fa-arrow-right' />
                                                                </button>
                                                            </div>
                                                        </div>}
                                                    </> : null
                                                }
                                            </div>
                                        </div>
                                    },
                                    {
                                        title: 'Lịch sử đăng ký',
                                        component: <LichSuDangKySection ref={e => this.lichSuDangKy = e} mssv={this.state.userData.mssv} />
                                    },
                                    {
                                        title: 'Chứng chỉ',
                                        component: <ChungChiSection ref={e => this.chungChi = e} mssv={this.state.userData.mssv} />
                                    },
                                    {
                                        title: 'Tra cứu tốt nghiệp',
                                        component: <TotNghiepSection ref={e => this.totNghiep = e} mssv={this.state.userData.mssv} />
                                    }
                                ]} />
                            </div>
                        </>
                    }
                ]} />}
            </>,
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/edu-schedule'>Quản lý học phần</Link>,
                'Mô phỏng sinh viên'
            ],
            backRoute: '/user/dao-tao/edu-schedule'
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hocPhan: state.daoTao.hocPhan });
const mapActionsToProps = { getCauHinh, deleteDangKyHocPhan, getFullData, getKetQuaDangKy };
export default connect(mapStateToProps, mapActionsToProps)(MoPhongPage);
