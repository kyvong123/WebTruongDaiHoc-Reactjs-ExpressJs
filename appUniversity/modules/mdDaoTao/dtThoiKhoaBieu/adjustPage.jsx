import { SelectAdapter_DmCaHocFilter } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { SelectAdapter_DmPhongFilter } from 'modules/mdDanhMuc/dmPhong/redux';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, FormTextBox, FormTabs, getValue, FormDatePicker } from 'view/component/AdminPage';
import AdjustGVModal from './modal/adjustGVModal';
import { SelectAdapter_DtDmThuFilter } from 'modules/mdDaoTao/dtDmThu/redux';
import {
    updateDtThoiKhoaBieu, DtThoiKhoaBieuGiangVienGetById, DtThoiKhoaBieuBaoNghiCreate, DtThoiKhoaBieuBaoNghiDelete,
    DtThoiKhoaBieuGetDataHocPhan, FullScheduleGenerated, DtThoiKhoaBieuBaoBuDelete
} from './redux';
import { getDmNgayLeAll } from 'modules/mdDanhMuc/dmNgayLe/redux';
import BaoNghiModal from './modal/BaoNghiModal';
import BaoBuModal from './modal/BaoBuModal';
import SectionHPStudent from './section/SectionHPStudent';
import SectionTKBTrung from './section/SectionTKBTrung';
import './card.scss';
import { Tooltip } from '@mui/material';
import { SelectAdapter_DtDmTinhTrangHocPhan } from 'modules/mdDaoTao/dtDmTinhTrangHocPhan/redux';
import { SelectAdapter_DtLopFilter } from 'modules/mdDaoTao/dtLop/redux';

class adjustPage extends AdminPage {
    state = {
        isEdit: 0, isSave: 0, filter: {}, fullFilter: {}, tkbItem: {}, dataGiangVien: [], listTuanHoc: [],
        listAddTuanHoc: [], listTiet: [], dataTiet: [], dataNgayLe: [], dataNgayNghi: [], dataNgayBu: []
    }
    phong = {};
    thu = {};
    tietBatDau = {};
    soTiet = {};

    ma = '';

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            const route = T.routeMatcher('/user/dao-tao/thoi-khoa-bieu/edit/:maHocPhan'),
                maHocPhan = route.parse(window.location.pathname).maHocPhan;
            this.ma = maHocPhan;
            this.setState({ maHocPhan });
            this.getData();
            this.preventExit();
        });
    }

    getData = () => {
        T.alert('Loading...', 'warning', false, null, true);
        this.props.DtThoiKhoaBieuGetDataHocPhan(this.ma, items => {
            this.setState({ ...items }, () => {
                this.setUp(items);
                this.sectionStudent.setData(items.fullData, () => T.alert('Load thành công', 'success', false, 500));
            });
        });
    }

    setUp = (items) => {
        let { namHoc, hocKy, coSo, maMonHoc, tenMonHoc, maLop, tenKhoaBoMon, tongTiet, ngayBatDau, maHocPhan, tietLyThuyet, tietThucHanh, soLuongDuKien, siSo, tinhTrang } = items.fullData[0];
        soLuongDuKien = this.state.soLuongDuKien || soLuongDuKien;
        maLop = this.state.maLop || (maLop ? maLop.split(',') : []);
        this.setState({
            filter: { namHoc, hocKy, coSo, ngayBatDau }, soLuongDuKien, maLop
        }, () => {
            let listTuanHoc = [];
            if (ngayBatDau && items.fullData.every(item => item.soTietBuoi != null && item.tietBatDau != null && item.thu != null)) {
                if (items.fullData.every(item => item.thoiGianBatDau != null && item.thoiGianKetThuc != null)) {
                    listTuanHoc = FullScheduleGenerated(items, this.handleDataTuan);
                } else {
                    T.alert('Không tồn tại tiết kết thúc', 'error', false);
                }
            }
            if (!listTuanHoc.length) {
                this.setValueLine(null, items.fullData);
            }

            this.setState({ listTuanHoc }, () => {
                this.tongTiet.value(tongTiet);
                this.monHoc.value(maMonHoc + ': ' + T.parse(tenMonHoc, { vi: '' })?.vi);
                this.lop.value(maLop);
                this.khoa.value(tenKhoaBoMon?.getFirstLetters());
                this.maHocPhan.value(maHocPhan);
                this.tietLyThuyet.value(tietLyThuyet);
                this.tietThucHanh.value(tietThucHanh || '0');
                this.ngayBatDau.value(ngayBatDau);
                this.siSo.value(siSo);
                this.soLuongDuKien.value(soLuongDuKien || '0');
                this.tinhTrang.value(tinhTrang);
            });
        });
    }

    handleDataTuan = (newData, fullData) => {
        let ngayKetThuc = new Date(newData.slice(-1)[0].ngayKetThuc).setHours(0, 0, 0);
        this.ngayKetThuc.value(ngayKetThuc);
        this.setValueLine(newData, fullData);
    }

    setValueLine = (newData, fullData) => {
        const fullFilter = [];
        for (let index = 0; index < fullData.length; index++) {
            let { phong, thu, tietBatDau, soTietBuoi, id } = fullData[index];
            this.phong[index].value(phong || '');
            this.thu[index].value(thu || '');
            this.tietBatDau[index].value(tietBatDau || '');
            this.soTiet[index].value(soTietBuoi || '');
            let ngayBatDauBuoi = '', ngayKetThucBuoi = '';
            if (newData) {
                const dataTime = newData.filter(item => item.thu == thu);
                ngayBatDauBuoi = new Date(dataTime[0].ngayBatDau).setHours(0, 0, 0, 0);
                ngayKetThucBuoi = new Date(dataTime.slice(-1)[0].ngayBatDau).setHours(0, 0, 0, 0);
            }

            fullFilter.push({ ...this.state.filter, id, phong, thu, tietBatDau, soTietBuoi, ngayBatDau: ngayBatDauBuoi, ngayKetThuc: ngayKetThucBuoi });
        }
        this.setState({ fullFilter }, () => {
            for (let index = 0; index < fullData.length; index++) {
                let { phong, thu, tietBatDau, soTietBuoi } = fullData[index];
                this.phong[index].value('');
                this.thu[index].value('');
                this.tietBatDau[index].value('');
                this.soTiet[index].value('');

                this.phong[index].value(phong || '');
                this.thu[index].value(thu || '');
                this.tietBatDau[index].value(tietBatDau || '');
                this.soTiet[index].value(soTietBuoi || '');
            }
        });
    }

    checkTiet = () => {
        this.state.fullData.forEach((item, index) => {
            if (item.tietBatDau && item.soTietBuoi) {
                let tietKetThuc = parseInt(item.tietBatDau) + parseInt(item.soTietBuoi) - 1;
                if (!this.state.dataTiet.find(tiet => parseInt(tiet.ten) == tietKetThuc)) {
                    T.alert('Không tồn tại tiết kết thúc', 'error', false);
                    this.soTiet[index].value('');
                    this.state.fullFilter[index].soTietBuoi = null;
                    this.state.fullData[index].soTietBuoi = null;
                    this.setState({
                        fullfilter: this.state.fullFilter,
                        fulldata: this.state.fullData
                    });
                }
            }
        });
    }

    handleChangeTiet = (value, index) => {
        let currentData = this.state.fullData[index];
        let currentFilter = this.state.fullFilter[index];
        if (currentData.soTietBuoi) {
            this.defineBatDauKetThucBuoi({
                id: currentData.id,
                thu: currentData.thu,
                tietBatDau: value.id,
                soTietBuoi: this.state.fullFilter[index].soTietBuoi
            }, index, isValid => {
                if (isValid) {
                    this.setState({ fullData: this.state.fullData }, () => {
                        this.setUp(this.state);
                    });
                } else {
                    currentFilter.tietBatDau = null;
                    currentData.tietBatDau = null;
                    this.tietBatDau[index].value('');
                }
            });
        } else {
            currentData.tietBatDau = value.id;
            currentFilter.tietBatDau = value.id;
            this.tietBatDau[index]?.value(value.id || '');
        }
        this.setState({
            fullfilter: this.state.fullFilter,
            fulldata: this.state.fullData
        });
    }

    handleChangePhong = (value, index) => {
        let { soLuongDuKien } = this.state;
        let current = this.state.fullData[index];
        if (parseInt(value.sucChua) < parseInt(soLuongDuKien)) {
            T.notify(`Phòng ${value.id} có sức chứa nhỏ hơn số lượng dự kiến của học phần`, 'warning');
        }
        current.phong = value.id;
        this.setState({ fullData: this.state.fullData }, () => {
            this.setUp(this.state);
        });
    }


    renderTiet = (tuan) => {
        let { tietBatDau, soTietBuoi, thoiGianBatDau, thoiGianKetThuc, isBu } = tuan;
        let tietKetThuc = tietBatDau + soTietBuoi - 1;
        const dataTiet = tietBatDau == tietKetThuc ? tietBatDau : `${tietBatDau} - ${tietKetThuc}`;
        return <div className='col-md-6 row'>
            <div className='col-md-6'>Tiết: {dataTiet} </div>
            <div className='col-md-6' style={{ display: isBu ? '' : 'none' }}>Phòng: {tuan.phong}</div>
            <div className='col-md-12'>{thoiGianBatDau} - {thoiGianKetThuc} </div>
        </div>;
    }

    handleChooseTuan = (index) => {
        let list = this.state.listAddTuanHoc;
        if (this.state.listAddTuanHoc.includes(index)) {
            this.setState({ listAddTuanHoc: list.filter(item => item != index) });
        }
        else {
            this.setState({ listAddTuanHoc: [...list, index] });
        }
    }

    onSave = () => {
        let ngayBatDau = this.ngayBatDau.value(), ngayKetThuc = this.ngayKetThuc.value();
        const data = {
            tinhTrang: this.state.tinhTrang,
            soLuongDuKien: getValue(this.soLuongDuKien),
            fullData: this.state.fullData,
            listTuanHoc: this.state.listTuanHoc.filter(item => !item.isNgayLe),
            maHocPhan: this.ma,
            lop: this.lop.value()
        };

        if (ngayBatDau) {
            data.ngayBatDau = getValue(this.ngayBatDau).setHours(0, 0, 0, 0);
        }

        if (ngayKetThuc) {
            data.ngayKetThuc = getValue(this.ngayKetThuc).setHours(0, 0, 0, 0);
        }

        if (this.soLuongDuKien.value() < this.siSo.value()) {
            T.notify('Số lượng dự kiến lớn hơn sĩ số hiện tại', 'warning');
            this.soLuongDuKien.focus();
        } else {
            T.confirm('Lưu ý', 'Bạn có chắc chắn muốn thay đổi thông số thời khóa biểu không? ', 'warning', true, isConfirm => {
                if (isConfirm) {
                    try {
                        this.props.updateDtThoiKhoaBieu('', data, () => {
                            this.setState({ isEdit: 0 }, () => {
                                this.getData();
                            });
                            // location.reload();
                        });
                    } catch (error) {
                        T.notify('Vui lòng kiểm tra dữ liệu các tham số!', 'danger');
                    }
                }
            });
        }
    }

    defineBatDauKetThucBuoi = (data, index, done) => {
        let currentLine = this.state.fullData[index];
        let isValid = false;
        if (data.tietBatDau && data.soTietBuoi) {
            let tietBatDau = data.tietBatDau,
                soTietBuoi = data.soTietBuoi;
            const tietKetThuc = parseInt(tietBatDau) + parseInt(soTietBuoi) - 1;
            let dataKetThuc = this.state.dataTiet.find(item => item.ten == tietKetThuc),
                dataBatDau = this.state.dataTiet.find(item => item.ten == tietBatDau);
            if (dataKetThuc) {
                if (dataBatDau.buoi != dataKetThuc.buoi) {
                    T.notify('Bắt đầu và kết thúc ở 2 buổi khác nhau!', 'warning');
                    this.soTiet[index].focus();
                } else {
                    const checkData = this.state.fullData.map(item => ({
                        id: item.id,
                        thu: item.thu,
                        tietBatDau: parseInt(item.tietBatDau),
                        soTietBuoi: parseInt(item.soTietBuoi),
                        tietKetThuc: parseInt(item.tietBatDau) + parseInt(item.soTietBuoi) - 1
                    })).filter(item => item.id != data.id && item.thu == data.thu && ((tietBatDau >= item.tietBatDau && tietBatDau <= item.tietKetThuc) || (tietKetThuc >= item.tietBatDau && tietKetThuc <= item.tietKetThuc)));

                    if (checkData.length) {
                        T.notify('Trùng với buổi khác của học phần này!', 'danger');
                    } else {
                        isValid = true;
                        currentLine.tietBatDau = data.tietBatDau;
                        currentLine.soTietBuoi = data.soTietBuoi;
                        currentLine.thoiGianKetThuc = dataKetThuc.thoiGianKetThuc;
                        currentLine.thoiGianBatDau = dataBatDau.thoiGianBatDau;
                    }
                }
            } else {
                T.notify('Không tồn tại tiết kết thúc!', 'danger');
            }
        }
        done && done(isValid);
    }

    handleChangeSoTietBuoi = (value, index) => {
        let currentData = this.state.fullData[index];
        let currentFilter = this.state.fullFilter[index];

        if (currentData.tietBatDau) {
            if (value && !isNaN(value) && value != currentData.soTietBuoi) {
                this.defineBatDauKetThucBuoi({
                    id: currentData.id,
                    thu: currentData.thu,
                    tietBatDau: currentData.tietBatDau,
                    soTietBuoi: value
                }, index, (isValid) => {
                    if (isValid) {
                        this.setState({ fullData: this.state.fullData }, () => {
                            this.setUp(this.state);
                        });
                    } else {
                        currentFilter.soTietBuoi = null;
                        currentData.soTietBuoi = null;
                        this.soTiet[index].value('');
                    }
                });
            } else if (!value) {
                currentData.soTietBuoi = null;
                currentFilter.soTietBuoi = null;
                this.soTiet[index]?.value(value || '');
            }
        } else {
            currentData.soTietBuoi = value;
            currentFilter.soTietBuoi = value;
            this.soTiet[index]?.value(value || '');
        }

        this.setState({
            fullfilter: this.state.fullFilter,
            fulldata: this.state.fullData
        });
    }

    handleChangeNgay = (value, index = 0) => {
        if (value instanceof Date && !isNaN(value)) {
            let thu = new Date(value).getDay() + 1;
            if (thu == 1) thu = 8;
            this.checkValidThu(value, index, thu);
        } else {
            T.notify('Ngày bắt đầu không hợp lệ!', 'danger');
            this.ngayBatDau.focus();
        }
    }

    checkValidThu = (value, index, thu) => {
        let currentLine = this.state.fullFilter[index],
            ngayBatDau = value ? new Date(value).setHours(0, 0, 0, 0) : currentLine.ngayBatDau;
        if (currentLine && currentLine.soTietBuoi && currentLine.tietBatDau && currentLine.phong) {
            SelectAdapter_DtDmThuFilter({ ...currentLine, ngayBatDau }).fetchValid(thu, isValid => {
                if (!isValid) {
                    T.notify('Trùng thời gian với học phần khác', 'danger');
                }
                this.handleChangeThu({ id: thu }, index, value ? new Date(value).setHours(0, 0, 0) : '');
            });
        } else {
            this.ngayBatDau.value(value);
            this.state.fullData[index].ngayBatDau = new Date(value).setHours(0, 0, 0, 0);
            currentLine.ngayBatDau = new Date(value).setHours(0, 0, 0, 0);
            this.setState({
                filter: { ...this.state.filter, ngayBatDau: new Date(value).setHours(0, 0, 0, 0) },
            });
            if (this.state.fullData.every(item => item.tietBatDau)) {
                this.handleChangeThu({ id: thu }, index, value ? new Date(value).setHours(0, 0, 0) : '');
            } else {
                this.thu[index].value(thu);
                this.state.fullData[index].thu = thu;
                currentLine.thu = thu;
                this.setState({ fullData: this.state.fullData });
            }
        }

    }

    handleChangeThu = (value, index, newNgayBatDau) => {
        let currentData = this.state.fullData[index],
            { tietBatDau, soTietBuoi } = currentData,
            tietKetThuc = parseInt(tietBatDau) + parseInt(soTietBuoi) - 1;
        const checkData = this.state.fullData.map(item => ({
            ...item,
            tietBatDau: parseInt(item.tietBatDau),
            soTietBuoi: parseInt(item.soTietBuoi),
            tietKetThuc: parseInt(item.tietBatDau) + parseInt(item.soTietBuoi) - 1
        })).filter(item => item.id != currentData.id && item.thu == value.id && ((tietBatDau >= item.tietBatDau && tietBatDau <= item.tietKetThuc) || (tietKetThuc >= item.tietBatDau && tietKetThuc <= item.tietKetThuc)));
        if (checkData.length) {
            T.notify('Trùng với buổi khác của học phần này!', 'danger');
            this.thu[index].value('');
        } else {
            currentData.thu = value.id;
            currentData.ngayBatDau = newNgayBatDau || currentData.ngayBatDau;
            this.state.fullData[index] = currentData;
            this.setState({ fullData: this.state.fullData }, () => {
                this.setUp(this.state);
            });
        }
    }

    preventExit = () => {
        window.addEventListener('beforeunload', e => {
            if (this.state.isEdit) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    huyBaoNghi = (tuan) => {
        T.confirm('Xác nhận', `Bạn có muốn huỷ nghỉ buổi học ngày ${T.dateToText(tuan.ngayHoc, 'dd/mm/yyyy')}, tiết ${tuan.tietBatDau} không`, 'warning', true, isConfirm => {
            if (isConfirm) {
                this.props.DtThoiKhoaBieuBaoNghiDelete(tuan, () => {
                    let { dataNgayNghi } = this.state;
                    dataNgayNghi = dataNgayNghi.filter(i => i.id != tuan.id);
                    this.setState({ dataNgayNghi });
                });
            }
        });
    }

    huyBaoBu = (tuan) => {
        T.confirm('Xác nhận', `Bạn có muốn huỷ lịch bù buổi học ngày ${T.dateToText(tuan.ngayHoc, 'dd/mm/yyyy')}, tiết ${tuan.tietBatDau} không`, 'warning', true, isConfirm => {
            if (isConfirm) {
                this.props.DtThoiKhoaBieuBaoBuDelete(tuan.idBu, () => {
                    let { dataNgayBu, dataTeacher } = this.state;
                    dataNgayBu = dataNgayBu.filter(i => i.idBu != tuan.idBu);
                    dataTeacher = dataTeacher.filter(i => i.idNgayBu != tuan.idBu);
                    this.setState({ dataNgayBu, dataTeacher }, () => {
                        this.setUp(this.state);
                    });
                });
            }
        });
    }

    checkAdjustGV = (e) => {
        e && e.preventDefault();
        if (this.state.isAdjustGV) {
            this.modal.show();
        } else {
            T.alert('Vui lòng cập nhật thông tin thời khóa biểu!', 'error', true);
        }
    }

    handleUpdateGV = () => {
        this.props.DtThoiKhoaBieuGetDataHocPhan(this.ma, items => {
            this.setState({ dataTeacher: items.dataTeacher }, () => {
                this.setUp(this.state);
            });
        });
    }

    handleBaoBu = () => {
        this.props.DtThoiKhoaBieuGetDataHocPhan(this.ma, items => {
            this.setState({ dataNgayBu: items.dataNgayBu, dataTeacher: items.dataTeacher }, () => {
                this.setUp(this.state);
            });
        });
    }

    handleDownloadTuan = () => {
        let { listTuanHoc, dataNgayNghi, fullData } = this.state;
        let data = listTuanHoc.map(i => {
            let { ngayHoc, tuanBatDau, thu, tietBatDau, soTietBuoi, phong, thoiGianBatDau, thoiGianKetThuc, giangVien = [], troGiang = [], ngayLe, isNgayLe, isBu, ngayNghi } = i;
            let isNgayNghi = dataNgayNghi.find(i => i.ngayNghi == ngayHoc && i.tietBatDau == tietBatDau && i.soTietBuoi == soTietBuoi);
            return {
                ngayHoc, tuanBatDau, thu, tietBatDau, soTietBuoi, phong, thoiGianBatDau, thoiGianKetThuc, giangVien: giangVien.join(', '), troGiang: troGiang.join(', '),
                ngayLe, isNgayLe, isBu, ngayNghi, isNgayNghi: !!isNgayNghi, ghiChu: isNgayNghi?.ghiChu || ''
            };
        });
        let { namHoc, hocKy, coSo, maMonHoc, tenMonHoc, maLop, tenKhoaBoMon, tongTiet, maHocPhan, tietLyThuyet, tietThucHanh, soLuongDuKien, siSo } = fullData[0];
        let dataHocPhan = {
            namHoc, hocKy, coSo, maMonHoc, tenMonHoc, maLop, tenKhoaBoMon, tongTiet, maHocPhan, tietLyThuyet, tietThucHanh, soLuongDuKien, siSo
        };
        T.handleDownload(`/api/dt/thoi-khoa-bieu/export-lich-day?dataTuan=${T.stringify(data)}&dataHocPhan=${T.stringify(dataHocPhan)}`);
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', () => { });
    }

    quanLyThoiKhoaBieu = () => {
        let { dataNgayNghi, listAddTuanHoc } = this.state;
        return <div className='my-4'>
            {(!this.state.listAddTuanHoc.length ? <button className='btn btn-warning my-3 mr-2' type='button' style={{ width: 'fit-content', marginLeft: 'auto' }} onClick={e => {
                e.preventDefault();
                this.setState({
                    listAddTuanHoc: this.state.listTuanHoc.map((tuan, index) => {
                        let isNgayNghi = dataNgayNghi.find(i => i.ngayNghi == tuan.ngayHoc && i.tietBatDau == tuan.tietBatDau && i.soTietBuoi == tuan.soTietBuoi);
                        if (!(tuan.isNgayLe || tuan.isBu || isNgayNghi)) return index;
                    }).filter(item => item != null || item != undefined)
                });
            }}>
                <i className='fa fa-lg fa-check' /> Chọn tất cả
            </button> : <button className='btn btn-danger my-3 mr-2' type='button' style={{ width: 'fit-content', marginLeft: 'auto' }} onClick={e => {
                e.preventDefault();
                this.setState({
                    listAddTuanHoc: []
                });
            }}>
                <i className='fa fa-lg fa-times' /> Bỏ chọn tất cả
            </button>)}
            {this.state.listAddTuanHoc.length > 0 && <button className='btn btn-success my-3' type='button' style={{ width: 'fit-content', marginLeft: 'auto' }} onClick={this.checkAdjustGV}>
                <i className='fa fa-lg fa-plus' /> Thêm giảng viên và trợ giảng
            </button>}
            {<button className='btn btn-info my-3' type='button' style={{ width: 'fit-content', marginLeft: 'auto' }} onClick={this.handleDownloadTuan}>
                <i className='fa fa-lg fa-download' /> Export lịch dạy
            </button>}
            <div className='d-flex flex-column'>
                {this.state.listTuanHoc.map((tuan, index) => {
                    let { isNgayLe, ngayHoc, tuanBatDau, thu, tietBatDau, soTietBuoi, isBu, ngayNghi } = tuan;
                    let isNgayNghi = dataNgayNghi.find(i => i.ngayNghi == ngayHoc && i.tietBatDau == tietBatDau && i.soTietBuoi == soTietBuoi);
                    return <div key={index}>
                        <div className='d-flex'>
                            <div style={{ display: 'flex', alignItems: 'center' }}><h5>{index + 1}.</h5> </div>
                            <div className={`btn ${listAddTuanHoc.includes(index) ? 'btn-warning' : (isNgayLe || isNgayNghi ? 'btn-secondary' : 'btn-primary')} subject-card`} onClick={() => (!(isNgayLe || isNgayNghi || isBu) && this.handleChooseTuan(index))} style={{ cursor: !(isNgayLe || isNgayNghi || isBu) ? 'pointer' : 'not-allowed' }}>
                                <section className='row'>
                                    <section className='col-md-6'>
                                        <div className='row'>
                                            <div className='col-md-6'>
                                                <b>Tuần {tuanBatDau} - {thu == 8 ? 'Chủ nhật' : `Thứ ${thu}`}</b><br />
                                                <i>{T.dateToText(ngayHoc, 'dd/mm/yyyy')} {isBu ? `Học bù cho ngày ${T.dateToText(ngayNghi, 'dd/mm/yyyy')}` : ''} </i>
                                            </div>
                                            {tuan.isNgayLe ? <p className='col-md-6'>{'Nghỉ lễ: ' + tuan.ngayLe}</p> : (isNgayNghi ? <p className='col-md-6'>{'Giảng viên báo nghỉ: ' + isNgayNghi.ghiChu}</p> : this.renderTiet(tuan))}
                                        </div>

                                    </section>
                                    <section className='col-md-6' style={{ display: tuan.giangVien && tuan.giangVien.length && tuan.isNgayNghi ? 'none' : '' }}>
                                        <div className='row'>
                                            <div className='col'>
                                                {tuan.giangVien && tuan.giangVien.map((giangVien, i) => <div key={'giangVien ' + i}>{giangVien}</div>)}
                                            </div>
                                            <div className='col'>
                                                {tuan.troGiang && tuan.troGiang.map((troGiang, i) => <div key={'troGiang ' + i}>{troGiang}</div>)}
                                            </div>
                                        </div>
                                    </section>
                                </section>
                            </div>
                            <Tooltip title={isNgayNghi ? 'Hủy nghỉ tuần học' : 'Báo nghỉ tuần học'}>
                                <div className={`btn ${isNgayNghi ? 'btn-primary' : 'btn-danger'}`} style={{ height: 'fit-content', margin: 'auto', cursor: !tuan.isNgayLe ? 'pointer' : 'not-allowed', display: isNgayLe || isBu ? 'none' : '' }} onClick={e => e.preventDefault() || (!tuan.isNgayLe && isNgayNghi ? this.huyBaoNghi(isNgayNghi) : this.baoNghiModal.show(tuan))}>
                                    <i className='fa fa-lg fa-power-off' />
                                </div>
                            </Tooltip>

                            <div style={{ height: 'fit-content', margin: 'auto', display: isBu ? '' : 'none' }}>
                                <Tooltip title={'Cập nhật lịch bù'}>
                                    <div className={'btn btn-success'} style={{ cursor: isBu ? 'pointer' : '' }} onClick={e => e.preventDefault() || this.baoBuModal.show(tuan)}>
                                        <i className='fa fa-lg fa-repeat' />
                                    </div>
                                </Tooltip>

                                <Tooltip title={'Hủy lịch bù'}>
                                    <div className={'btn btn-danger'} style={{ cursor: isBu ? 'pointer' : '', marginLeft: '15px' }} onClick={e => e.preventDefault() || this.huyBaoBu(tuan)}>
                                        <i className='fa fa-lg fa-trash' />
                                    </div>
                                </Tooltip>
                            </div>

                        </div>
                        <hr />
                    </div>;
                })}
            </div>
        </div>;
    }

    thongTinThoiKhoaBieu = () => {
        let { isEdit, fullFilter, fullData } = this.state;
        let icon = isEdit ? 'fa-save' : 'fa-edit',
            textButton = isEdit ? 'Lưu thay đổi' : 'Chỉnh sửa';
        const elementDay = (index = 0) => (
            <div key={index} className='row'>
                <FormSelect ref={e => this.phong[index] = e} className='col-md-3' disabled={!isEdit} label='Phòng' data={SelectAdapter_DmPhongFilter(fullFilter[index])} onChange={value => this.handleChangePhong(value, index)} />
                <FormSelect ref={e => this.thu[index] = e} className='col-md-3' label='Thứ' data={SelectAdapter_DtDmThuFilter(fullFilter[index])} minimumResultsForSearch={-1} disabled={!(isEdit && index)} onChange={value => this.checkValidThu('', index, value.id)} />
                <FormSelect ref={e => this.tietBatDau[index] = e} className='col-md-3' disabled={!isEdit} label='Tiết bắt đầu' data={SelectAdapter_DmCaHocFilter(fullFilter[index])} minimumResultsForSearch={-1} onChange={value => this.handleChangeTiet(value, index)} />
                <FormTextBox type='number' ref={e => this.soTiet[index] = e} className='col-md-3' disabled={!isEdit} label='Số tiết/buổi' min={1} max={5} onChange={e => this.handleChangeSoTietBuoi(e, index)} />
            </div>
        );

        return <>
            <div style={{ margin: '20px auto' }}>
                <div>
                    <div className='row'>
                        <FormSelect ref={e => this.lop = e} className='col-md-12' disabled={!isEdit} label='Lớp' data={SelectAdapter_DtLopFilter()} multiple allowClear onChange={() => this.setState({ maLop: this.lop.value() })} />
                        <FormTextBox type='number' ref={e => this.siSo = e} className='col-md-1' disabled label='Sĩ số' />
                        <FormTextBox type='number' ref={e => this.soLuongDuKien = e} className='col-md-2' disabled={!isEdit} label='Số lượng dự kiến' onChange={value => this.setState({ soLuongDuKien: value })} />
                        <FormDatePicker ref={e => this.ngayBatDau = e} className='col-md-3' disabled={!isEdit} label='Ngày bắt đầu' type='date' required onChange={value => this.handleChangeNgay(value)} />
                        <FormDatePicker ref={e => this.ngayKetThuc = e} className='col-md-3' label='Ngày kết thúc' type='date' disabled={true} />
                        <FormSelect ref={e => this.tinhTrang = e} className='col-md-3' disabled={!isEdit} label='Tình trạng' data={SelectAdapter_DtDmTinhTrangHocPhan} onChange={(value) => T.confirm('Xác nhận', `Bạn có muốn đổi tình trạng học phần sang ${value.text}`, 'warning', true, isConfirm => {
                            if (isConfirm) {
                                this.setState({ tinhTrang: value.id });
                            } else {
                                this.tinhTrang.value(this.state.tinhTrang);
                            }
                        })} />
                        <div className='col-12'>
                            {fullData?.map((_, index) => elementDay(index))}
                        </div>
                    </div>
                </div>
                <div className style={{ textAlign: 'right' }}>
                    <button className='btn btn-secondary' style={{ display: isEdit ? '' : 'none' }} onClick={e => e.preventDefault() || this.setState({ isEdit: 0 })}>
                        <i className='fa fa-lg fa-times' /> Huỷ
                    </button>
                    <button className={isEdit ? 'btn btn-success' : 'btn btn-primary'} style={{ marginLeft: '20px', display: !isEdit ? '' : (this.state?.isTrung ? 'none' : '') }} onClick={e => {
                        e.preventDefault();
                        if (isEdit) this.onSave();
                        else this.setState({ isEdit: 1 }, () => this.checkTiet());
                    }}>
                        <i className={'fa fa-lg ' + icon} />{textButton}
                    </button>
                </div>
            </div>
            <div style={{ display: isEdit ? '' : 'none' }}>
                <h5>Danh sách các học phần liên quan</h5>
                <SectionTKBTrung ref={e => this.sectionTrung = e} filter={fullFilter} dataHP={fullData} setIsTrung={isTrung => this.setState({ isTrung })} />
            </div>
        </>;
    }

    import = (e) => {
        e.preventDefault();
        let { filter } = this.state,
            { namHoc, hocKy } = filter;
        this.props.history.push(`/user/dao-tao/thoi-khoa-bieu/import-diem/${this.state.maHocPhan}`, { namHoc, hocKy, maMonHoc: this.monHoc.value() });
    }

    tabChanged = value => {
        this.setState({ ...value });
    }

    render() {
        let { isEdit, fullData, maHocPhan, listTuanHoc, dataNgayNghi, dataTiet } = this.state;
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Điều chỉnh học phần',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Điều chỉnh học phần'
            ],
            content: <div>
                <AdjustGVModal ref={e => this.modal = e} dataTuan={listTuanHoc} listAddTuanHoc={this.state.listAddTuanHoc} handleUpdate={this.handleUpdateGV} maHocPhan={this.ma} />
                <BaoNghiModal ref={e => this.baoNghiModal = e} baoNghi={(data) => this.setState({ dataNgayNghi: [...dataNgayNghi, data] })} />
                <BaoBuModal ref={e => this.baoBuModal = e} listTuanHoc={listTuanHoc} dataNgayNghi={dataNgayNghi} fullData={fullData} dataTiet={dataTiet} update={this.handleBaoBu} />

                <div className='tile'>
                    <div className='row'>
                        <FormTextBox ref={e => this.maHocPhan = e} className='col-md-4' readOnly label='Mã học phần' />
                        <FormTextBox ref={e => this.khoa = e} className='col-md-2' readOnly label='Khoa, bộ môn' />
                        <FormTextBox ref={e => this.tongTiet = e} className='col-md-2' readOnly label='Tổng số tiết' />
                        <FormTextBox type='number' ref={e => this.tietLyThuyet = e} className='col-md-2' readOnly label='Số tiết lý thuyết' />
                        <FormTextBox type='number' ref={e => this.tietThucHanh = e} className='col-md-2' readOnly label='Số tiết thực hành' />
                        <FormTextBox ref={e => this.monHoc = e} className='col-md-12' label='Môn học' readOnly />
                    </div>
                </div>
                <div className='tile'>
                    {/* <div style={{ diplay: 'flex', gap: 10}}>
                    {this.state.tabIndex == 1 && <div style={{ textAlign: 'right' }}>
                        <button className='btn btn-primary' type='button' onClick={e => this.import(e)}>
                            <i className='fa fa-lg fa-leaf' />Tải lên bảng điểm
                        </button>
                        </div>}
                    </div> */}
                    <FormTabs ref={e => this.tab = e} tabs={[
                        { title: 'Thông tin học phần', component: this.thongTinThoiKhoaBieu() },
                        { title: 'Quản lý học phần', component: this.quanLyThoiKhoaBieu() },
                        { title: 'Danh sách sinh viên', component: this.state.maHocPhan ? <SectionHPStudent ref={e => this.sectionStudent = e} isEdit={isEdit} maHocPhan={maHocPhan} data={fullData} handleImport={this.import} /> : <></> },
                    ]} onChange={this.tabChanged} />
                </div>
            </div>,
            backRoute: '/user/dao-tao/thoi-khoa-bieu',
            buttons: [
                { icon: 'fa-plus-square', tooltip: 'Báo bù học phần', className: 'btn-info', onClick: e => e.preventDefault() || this.baoBuModal.show() },
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtTkbConfig: state.daoTao.dtTkbConfig });
const mapActionsToProps = {
    updateDtThoiKhoaBieu, DtThoiKhoaBieuGiangVienGetById, DtThoiKhoaBieuBaoNghiCreate, DtThoiKhoaBieuBaoBuDelete, getDmNgayLeAll, DtThoiKhoaBieuBaoNghiDelete, DtThoiKhoaBieuGetDataHocPhan
};
export default connect(mapStateToProps, mapActionsToProps)(adjustPage);