import { SelectAdapter_DmCaHoc } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { SelectAdapter_DmPhongAll } from 'modules/mdDanhMuc/dmPhong/redux';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, FormTextBox, FormTabs, FormDatePicker, FormCheckbox, getValue } from 'view/component/AdminPage';
import { SelectAdapter_DtDmThu } from 'modules/mdDaoTao/dtDmThu/redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import {
    updateDtThoiKhoaBieu, DtThoiKhoaBieuGiangVienGetById, DtThoiKhoaBieuBaoNghiCreate, DtThoiKhoaBieuBaoNghiDelete,
    DtThoiKhoaBieuGetDataHocPhan, DtThoiKhoaBieuBaoBuDelete, CustomScheduleGenerated, DtTKBCustomGetNotFree, DtTKBDeleteInfoHocPhan, DtTKBCustomMultiUpdate
} from './redux';
import { getDmNgayLeAll } from 'modules/mdDanhMuc/dmNgayLe/redux';
import SectionHPStudent from './section/SectionHPStudent';
import SectionTuanHoc from './section/SectionTuanHoc';
import DuKienTuanHocModal from './modal/duKienTuanHocModal';
import './card.scss';
import { SelectAdapter_DtDmTinhTrangHocPhan } from 'modules/mdDaoTao/dtDmTinhTrangHocPhan/redux';
import { SelectAdapter_DtLopFilter } from 'modules/mdDaoTao/dtLop/redux';
import { SelectAdapter_FwCanBoGiangVien } from 'modules/mdTccb/tccbCanBo/redux';
import { Tooltip } from '@mui/material';

class adjustPage extends AdminPage {
    state = {
        isEdit: 0, isSave: 0, filter: {}, fullFilter: {}, tkbItem: {}, dataGiangVien: [], listTuanHoc: [],
        dataTiet: [], dataNgayLe: [], isShowEdit: 1, dataTeacher: [], dataNamBatDau: [], dataSelectWeek: {},
    }

    trungPhong = {}
    soTietBuoi = {}
    tietBatDau = {}
    phong = {}
    thu = {}
    soTuan = {}
    coSo = {}
    tuanBatDau = {}
    giangVien = {}
    namTuanBatDau = {}

    ma = '';

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            const route = T.routeMatcher('/user/dao-tao/thoi-khoa-bieu/:perm/:maHocPhan').parse(window.location.pathname),
                maHocPhan = route.maHocPhan,
                viewing = route.perm == 'view';
            this.ma = maHocPhan;
            this.setState({ maHocPhan, viewing });
            this.getData();
            this.preventExit();
        });
    }

    getData = () => {
        T.alert('Loading...', 'warning', false, null, true);
        this.props.DtThoiKhoaBieuGetDataHocPhan(this.ma, items => {
            let dataSelectWeek = Object.keys(items.listWeeksOfYear).reduce((acc, cur) => {
                acc[cur] = items.listWeeksOfYear[cur].map(i => ({ id: i.weekNumber, text: `Tuần ${i.week}: ${T.dateToText(i.weekStart, 'dd/mm/yyyy')} - ${T.dateToText(i.weekEnd, 'dd/mm/yyyy')}` }));
                return acc;
            }, {});

            items.fullData = items.fullData.map((item, index) => ({ ...item, weekStart: items.listWeeksOfYear[index].find(i => i.weekNumber == item.tuanBatDau)?.weekStart || '' }));
            this.setState({ ...items, dataSelectWeek }, () => {
                this.setUp(items);
                this.sectionTuan.setValue(items.listTuanHoc);
                this.sectionStudent.setData(items.fullData, () => T.alert('Load thành công', 'success', false, 500));
            });
        });
    }

    handleReloadData = () => {
        this.props.DtThoiKhoaBieuGetDataHocPhan(this.ma, items => {
            items.fullData = items.fullData.map((item, index) => ({ ...item, weekStart: items.listWeeksOfYear[index].find(i => i.weekNumber == item.tuanBatDau)?.weekStart || '' }));

            this.setState({ ...items }, () => {
                this.setUp(items);
            });
        });
    }

    setUp = (items) => {
        let { namHoc, hocKy, coSo, maMonHoc, tenMonHoc, maLop, tenKhoaBoMon, tongTiet, ngayBatDau, ngayKetThuc, maHocPhan, tietLyThuyet, tietThucHanh, soLuongDuKien, siSo, tinhTrang, tenNganh, listNienKhoa, tenHe } = items.fullData[0];
        soLuongDuKien = this.state.soLuongDuKien || soLuongDuKien;
        maLop = this.state.maLop || (maLop ? maLop.split(',') : []);
        this.setState({
            filter: { namHoc, hocKy, coSo, ngayBatDau }, soLuongDuKien, maLop
        }, () => {
            this.setValueLine(items.fullData);
            this.tongTiet.value(tongTiet);
            this.monHoc.value(maMonHoc + ': ' + T.parse(tenMonHoc, { vi: '' })?.vi);
            this.lop.value(maLop);
            this.khoa.value(tenKhoaBoMon);
            this.maHocPhan.value(maHocPhan);
            this.tietLyThuyet.value(tietLyThuyet);
            this.tietThucHanh.value(tietThucHanh || '0');
            this.ngayBatDau.value(ngayBatDau);
            this.ngayKetThuc.value(ngayKetThuc);
            this.siSo.value(siSo || '0');
            this.soLuongDuKien.value(soLuongDuKien || '0');
            this.tinhTrang.value(tinhTrang);
            this.namHoc.value(namHoc);
            this.hocKy.value(hocKy);
            this.listNienKhoa.value(listNienKhoa);
            this.tenHe.value(tenHe);
            this.tenNganh.value(tenNganh);
        });
    }

    setValueLine = (fullData) => {
        for (let index = 0; index < fullData.length; index++) {
            let { phong, thu, tietBatDau, soTietBuoi, coSo, tuanBatDau, soTuan, isTrungTKB, shccGV } = fullData[index];
            this.coSo[index].value(coSo || '');
            this.phong[index].value(phong || '');
            this.thu[index].value(thu || '');
            this.tietBatDau[index].value(tietBatDau || '');
            this.soTietBuoi[index].value(soTietBuoi || '');
            this.namTuanBatDau[index].value(tuanBatDau ? Number(tuanBatDau.toString().substring(tuanBatDau.toString().length - 4)) : new Date(Date.now()).getFullYear());
            this.tuanBatDau[index].value(tuanBatDau || '');
            this.soTuan[index].value(soTuan || '');
            this.trungPhong[index].value(isTrungTKB || '');
            this.giangVien[index].value(shccGV ? shccGV.split(',') : '');
        }
    }

    setNgayHocPhan = ({ ngayBatDau = '', ngayKetThuc = '' }) => {
        this.ngayBatDau?.value(ngayBatDau);
        this.ngayKetThuc?.value(ngayKetThuc);
    }


    onSave = () => {
        const updateThoiKhoaBieu = (listTuanHoc, isUpdateThongTin) => {
            const data = {
                tinhTrang: this.state.tinhTrang || 1,
                soLuongDuKien: this.soLuongDuKien.value(),
                fullData: T.stringify(this.state.fullData),
                listTuanHoc: T.stringify(listTuanHoc),
                maHocPhan: this.ma,
                lop: this.lop.value(),
                isUpdateThongTin
            };

            T.alert('Đang cập nhật thông tin thời khóa biểu!', 'warning', false, null, true);
            this.props.updateDtThoiKhoaBieu('', data, () => {
                this.setState({ isEdit: 0 }, () => {
                    this.getData();
                });
            });
        };

        T.customConfirm('Cảnh báo', 'Thao tác này sẽ thay đổi thông tin học phần và thông tin tuần học. Vui lòng xác nhận hình thức thay đổi?', 'warning', true, { thongTin: 'Thông tin học phần', xepLich: 'Xếp lại lịch học' }, isConfirm => {
            if (isConfirm == 'thongTin') {
                updateThoiKhoaBieu(this.state.listTuanHoc, true);
            } else if (isConfirm == 'xepLich') {
                let { fullData, dataTiet, listNgayLe, listWeeksOfYear } = this.state;
                if (fullData.some(i => !(i.coSo && i.thu && i.tietBatDau && i.soTietBuoi && i.tuanBatDau))) {
                    return T.alert('Vui lòng nhập thông tin về cơ sở, thứ, tiết và tuần bắt đầu', 'warning');
                }

                if (fullData.find((it, index) => !listWeeksOfYear[index].find(i => i.weekNumber == it.tuanBatDau))) return T.alert('Vui lòng nhập thông tin về tuần bắt đầu', 'warning');

                this.props.DtTKBCustomGetNotFree(fullData.map(i => ({ maHocPhan: i.maHocPhan, phong: i.phong, shccGV: i.shccGV, weekStart: i.weekStart })), (data) => {
                    let listTuanHoc = CustomScheduleGenerated({ fullData, dataTiet, listNgayLe, isGenTrung: true, listTKB: data.listTKB, listThi: data.listThi, listEvent: data.listEvent, listTKBGv: data.listTKBGv });
                    if (listTuanHoc.length) {
                        let trung = listTuanHoc.filter(i => (!i.isTrungTKB && i.ghiChu) || i.isGiangVien).length;
                        if (trung) {
                            T.notify(`Hiện có ${trung} buổi bị trùng`, 'warning');
                            this.duKienModal.show({
                                listTuanHoc, updateThoiKhoaBieu,
                                againGenTkb: () => {
                                    return CustomScheduleGenerated({ fullData, dataTiet, listNgayLe, isGenTrung: false, listTKB: data.listTKB, listThi: data.listThi, listEvent: data.listEvent });
                                }
                            });
                        } else {
                            updateThoiKhoaBieu(listTuanHoc);
                        }
                    } else {
                        T.alert('Trùng thời gian học giữa các lịch học của học phần', 'error', true);
                    }
                });
            }
        });
    }

    editPhong = () => {
        let { listTuanHoc, fullData, maHocPhan } = this.state;

        if (listTuanHoc.length) {
            T.notify('Học phần chưa được rải lịch!', 'warning');
        } else {
            T.confirm('Lưu ý', 'Bạn có chắc chắn cập nhật thông tin phòng học không?', 'warning', true, isConfirm => {
                if (isConfirm) {
                    fullData.forEach((buoi, index) => {
                        let listTime = listTuanHoc.filter(e => e.idThoiKhoaBieu == buoi.id),
                            phong = getValue(this.phong[index]),
                            coSo = getValue(this.coSo[index]);

                        if (phong == '' || phong == null) T.notify('Phòng bị trống!', 'warning');
                        else {
                            this.props.DtTKBCustomMultiUpdate({ phong, isTrung: 1, coSo, maHocPhan, editPhong: 1 }, listTime, dataError => {
                                if (!dataError.length) {
                                    this.sectionTuan.getDataTuan();
                                }
                            });
                        }

                    });
                    this.setState({ isEdit: 0 });
                }
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

    handleUpdateGV = () => {
        this.props.DtThoiKhoaBieuGetDataHocPhan(this.ma, items => {
            this.sectionTuan.setValue(items.listTuanHoc);
        });
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', () => { });
    }

    addNewBuoi = (fullData) => {
        let item = fullData[0];
        T.confirm('Cảnh báo', 'Bạn có muốn thêm buổi học mới hay không?', 'warning', true, confirm => {
            if (confirm) {
                fullData.push({
                    ...item, phong: '', thu: '', tietBatDau: '', soTietBuoi: '', buoi: fullData.length + 1, isNew: 1, soTuan: '', tuanBatDau: '', coSo: '',
                });
                const year = new Date(Date.now()).getFullYear();
                const listWeek = Date.prototype.getListWeeksOfYear(year);
                const { dataSelectWeek, listWeeksOfYear } = this.state;
                listWeeksOfYear[fullData.length - 1] = listWeek;
                dataSelectWeek[fullData.length - 1] = listWeek.map(i => ({ id: i.weekNumber, text: `Tuần ${i.week}: ${T.dateToText(i.weekStart, 'dd/mm/yyyy')} - ${T.dateToText(i.weekEnd, 'dd/mm/yyyy')}` }));
                this.setState({ dataSelectWeek, listWeeksOfYear, fullData }, () => {
                    this.namTuanBatDau[fullData.length - 1].value(year);
                });
            }
        });
    }

    deleteBuoi = (index, fullData) => {
        T.confirm('Cảnh báo', 'Bạn có muốn xóa buổi học hay không?', 'warning', true, confirm => {
            if (confirm) {
                if (fullData.length == 1) {
                    fullData = fullData.map(i => ({ ...i, soTietBuoi: '', tietBatDau: '', phong: '', soTuan: '', isTrungTKB: '', tuanBatDau: '', thu: '', coSo: '' }));
                    this.soTietBuoi[index].value('');
                    this.tietBatDau[index].value('');
                    this.phong[index].value('');
                    this.coSo[index].value('');
                    this.trungPhong[index].value('');
                    this.tuanBatDau[index].value('');
                    this.soTuan[index].value('');
                    this.thu[index].value('');
                    this.namTuanBatDau[index].value('');
                } else {
                    fullData.splice(index, 1);
                }
                this.setState({ fullData }, () => {
                    this.setValueLine(this.state.fullData);
                });
            }
        });
    }

    handleChangeThu = (value, fullData, index) => {
        fullData[index].thu = value.id;
        this.setState({ fullData });
    }

    handleChangeTiet = (value, fullData, index) => {
        let { dataTiet } = this.state;
        if (fullData[index].soTietBuoi) {
            if (this.handleCheckTiet({ ...fullData[index], tietBatDau: value.id })) {
                fullData[index].tietBatDau = value.id;
                fullData[index].thoiGianBatDau = dataTiet.filter(i => i.maCoSo == fullData[index].coSo).find(item => item.ten == value.id).thoiGianBatDau;
                fullData[index].thoiGianKetThuc = dataTiet.filter(i => i.maCoSo == fullData[index].coSo).find(item => item.ten == parseInt(value.id) + parseInt(fullData[index].soTietBuoi) - 1).thoiGianKetThuc;
            } else {
                this.tietBatDau[index].value('');
                fullData[index].tietBatDau = '';
            }
        } else {
            fullData[index].tietBatDau = value.id;
            fullData[index].thoiGianBatDau = dataTiet.filter(i => i.maCoSo == fullData[index].coSo).find(item => item.ten == value.id).thoiGianBatDau;
        }
        this.setState({ fullData });
    }

    handleChangeSoTiet = (value, fullData, index) => {
        let { dataTiet } = this.state;
        if (fullData[index].tietBatDau && value) {
            if (this.handleCheckTiet({ ...fullData[index], soTietBuoi: value })) {
                fullData[index].soTietBuoi = value;
                fullData[index].thoiGianKetThuc = dataTiet.filter(i => i.maCoSo == fullData[index].coSo).find(item => item.ten == parseInt(fullData[index].tietBatDau) + parseInt(value) - 1).thoiGianKetThuc;
            } else {
                this.soTietBuoi[index].value('');
                fullData[index].soTietBuoi = '';
            }
        } else {
            fullData[index].soTietBuoi = value;
        }
        this.setState({ fullData });
    }

    handleCheckTiet = (data) => {
        let { dataTiet } = this.state;

        let { tietBatDau, soTietBuoi, coSo } = data;
        if (tietBatDau && soTietBuoi) {
            let tietKetThuc = parseInt(tietBatDau) + parseInt(soTietBuoi) - 1;

            let dataKetThuc = dataTiet.filter(i => i.maCoSo == coSo).find(item => item.ten == tietKetThuc);
            let dataBatDau = dataTiet.filter(i => i.maCoSo == coSo).find(item => item.ten == tietBatDau);

            if (!dataKetThuc) {
                T.alert('Không tồn tại tiết kết thúc', 'error', false);
                return false;
            }

            if (dataBatDau.buoi != dataKetThuc.buoi) {
                T.alert('Bắt đầu và kết thúc ở 2 buổi khác nhau!', 'error', false);
                return false;
            }
        }
        return true;
    }

    handleChangePhong = (value, fullData, index) => {
        fullData[index].phong = value.id;
        if (value.sucChua && this.state.soLuongDuKien > value.sucChua) T.notify('Phòng không đủ sức chứa', 'warning');
        this.setState({ fullData });
    }

    handleChangeSoTuan = (value, fullData, index) => {
        fullData[index].soTuan = value;
        this.setState({ fullData });
    }

    handleChangeTuan = (value, fullData, index) => {
        let { listWeeksOfYear } = this.state;
        fullData[index].tuanBatDau = value.id;
        fullData[index].weekStart = listWeeksOfYear[index].find(i => i.weekNumber == value.id).weekStart;
        this.setState({ fullData });
    }

    handleCheckTrung = (value, fullData, index) => {
        fullData[index].isTrungTKB = value;
        this.setState({ fullData });
    }

    handleChangeCoSo = (value, fullData, index) => {
        fullData[index].coSo = value.id;
        fullData[index].phong = '';
        fullData[index].tietBatDau = '';
        this.setState({ fullData }, () => {
            this.tietBatDau[index].value('');
            this.phong[index].value('');
        });
    }

    handleChangeNam = (value, fullData, index) => {
        const listWeek = Date.prototype.getListWeeksOfYear(Number(value.id));
        const { dataSelectWeek, listWeeksOfYear } = this.state;
        fullData[index].tuanBatDau = null;
        fullData[index].weekStart = null;
        listWeeksOfYear[index] = listWeek;
        dataSelectWeek[index] = listWeek.map(i => ({ id: i.weekNumber, text: `Tuần ${i.week}: ${T.dateToText(i.weekStart, 'dd/mm/yyyy')} - ${T.dateToText(i.weekEnd, 'dd/mm/yyyy')}` }));
        this.setState({ dataSelectWeek, listWeeksOfYear, fullData }, () => {
            this.tuanBatDau[index].value('');
        });
    }

    handleChangeGiangVien = (value, fullData, index) => {
        fullData[index].shccGV = this.giangVien[index].value().toString();
        this.setState({ fullData });
    }

    deleteThongTin = () => {
        T.confirm('Cảnh báo', 'Bạn có chắc chắn muốn xóa thông tin học phần hay không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                this.props.DtTKBDeleteInfoHocPhan(this.ma, this.getData);
            }
        });
    }

    checkTiet = () => {
        let { fullData, dataTiet } = this.state;
        fullData.forEach((item, index) => {
            if (item.tietBatDau && item.soTietBuoi && item.coSo) {
                let tietKetThuc = parseInt(item.tietBatDau) + parseInt(item.soTietBuoi) - 1;
                if (!dataTiet.filter(i => i.maCoSo == item.coSo).find(tiet => parseInt(tiet.ten) == tietKetThuc)) {
                    T.alert('Không tồn tại tiết kết thúc', 'error', false);
                    this.soTietBuoi[index].value('');
                    fullData[index].soTietBuoi = '';
                }
            }
        });
        this.setState({ fullData });
    }

    thongTinThoiKhoaBieu = () => {
        let { isEdit, fullData, dataSelectWeek, dataNamBatDau } = this.state;
        let icon = isEdit ? 'fa-save' : 'fa-edit',
            textButton = isEdit ? 'Lưu thay đổi' : 'Chỉnh sửa';
        const permissions = this.getUserPermission('dtThoiKhoaBieu', ['read', 'write', 'delete', 'manage', 'export', 'import']);
        const elementDay = (hocPhan, index = 0) => (
            <section key={index} style={{ margin: '10px 0' }}>
                <hr style={{ border: '1.5px solid #a2a6a3' }} />

                <div className='row' style={{ margin: '30px 0' }}>
                    <div className='col-md-1' style={{ flexDirection: 'column', display: isEdit ? 'flex' : 'none' }}>
                        <label style={{ whiteSpace: 'nowrap' }}>Trùng phòng</label>
                        <FormCheckbox ref={e => this.trungPhong[index] = e} style={{ margin: 'auto' }} onChange={value => this.handleCheckTrung(value, fullData, index)} />
                    </div>
                    <FormSelect ref={e => this.coSo[index] = e} className='col-md-1' disabled={!isEdit} label='Cơ sở' data={SelectAdapter_DmCoSo} onChange={value => this.handleChangeCoSo(value, fullData, index)} />
                    <FormSelect ref={e => this.phong[index] = e} className='col-md-3' disabled={!isEdit} label='Phòng' data={SelectAdapter_DmPhongAll(hocPhan.coSo)} onChange={value => this.handleChangePhong(value, fullData, index)} />
                    <FormSelect ref={e => this.thu[index] = e} className='col-md-1' disabled={!isEdit} label='Thứ' data={SelectAdapter_DtDmThu} minimumResultsForSearch={-1} onChange={value => this.handleChangeThu(value, fullData, index)} />
                    <FormSelect ref={e => this.tietBatDau[index] = e} className='col-md-3' disabled={!isEdit} label='Tiết bắt đầu' data={SelectAdapter_DmCaHoc(hocPhan.coSo)} minimumResultsForSearch={-1} onChange={value => this.handleChangeTiet(value, fullData, index)} />
                    <FormTextBox type='number' ref={e => this.soTietBuoi[index] = e} className='col-md-1' disabled={!isEdit} label='Số tiết/buổi' min={1} max={5} onChange={value => this.handleChangeSoTiet(value, fullData, index)} />
                    <div className='col-md-1' style={{ margin: 'auto', marginBottom: '1rem', display: isEdit ? '' : 'none' }}>
                        <Tooltip title='Xoá buổi' arrow placement='right-end'>
                            <button style={{ height: 'fit-content', margin: 'auto' }} type='button' className='btn btn-danger' onClick={e => e && e.preventDefault() || this.deleteBuoi(index, fullData)}><i className='fa fa-lg fa-trash' /></button>
                        </Tooltip>
                    </div>
                    <FormSelect ref={e => this.namTuanBatDau[index] = e} className='col-md-2' disabled={!isEdit} label='Năm bắt đầu' data={dataNamBatDau} onChange={value => this.handleChangeNam(value, fullData, index)} />
                    <FormSelect ref={e => this.tuanBatDau[index] = e} className='col-md-4' disabled={!isEdit} label='Tuần bắt đầu' data={dataSelectWeek[index] || []} onChange={value => this.handleChangeTuan(value, fullData, index)} />
                    <FormTextBox ref={e => this.soTuan[index] = e} type='number' className='col-md-2' disabled={!isEdit} label='Số tuần' allowNegative={false} min={1} onChange={value => this.handleChangeSoTuan(value, fullData, index)} />
                    <FormSelect ref={e => this.giangVien[index] = e} className='col-md-4' disabled={!isEdit} label='Giảng viên' data={SelectAdapter_FwCanBoGiangVien} multiple onChange={value => this.handleChangeGiangVien(value, fullData, index)} />
                </div>
            </section>
        );

        return <>
            <div style={{ margin: '20px auto' }}>
                <div>
                    <div className='row'>
                        <FormSelect ref={e => this.lop = e} className='col-md-12' disabled={!isEdit} label='Lớp' data={SelectAdapter_DtLopFilter()} multiple allowClear onChange={() => this.setState({ maLop: this.lop.value() })} />
                        <FormTextBox type='number' ref={e => this.siSo = e} className='col-md-1' disabled label='Sĩ số' />
                        <FormTextBox type='number' ref={e => this.soLuongDuKien = e} className='col-md-2' disabled={!isEdit} label='Số lượng dự kiến' onChange={value => this.setState({ soLuongDuKien: value })} />
                        <FormDatePicker ref={e => this.ngayBatDau = e} className='col-md-3' disabled={true} label='Ngày bắt đầu' type='date' />
                        <FormDatePicker ref={e => this.ngayKetThuc = e} className='col-md-3' label='Ngày kết thúc' type='date' disabled={true} />
                        <FormSelect ref={e => this.tinhTrang = e} className='col-md-3' disabled={!isEdit} label='Tình trạng' data={SelectAdapter_DtDmTinhTrangHocPhan} onChange={(value) => T.confirm('Xác nhận', `Bạn có muốn đổi tình trạng học phần sang ${value.text}`, 'warning', true, isConfirm => {
                            if (isConfirm) {
                                this.setState({ tinhTrang: value.id });
                            } else {
                                this.tinhTrang.value(this.state.tinhTrang);
                            }
                        })} />
                        <div className='col-md-12'>
                            {fullData?.map((hocPhan, index) => elementDay(hocPhan, index))}
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: 'right', display: permissions.write && !this.state.viewing ? '' : 'none' }}>
                    <button style={{ height: 'fit-content', margin: 'auto', marginRight: '10px' }} className='btn btn-danger' type='button' onClick={e => e && e.preventDefault() || this.deleteThongTin()}>
                        <i className='fa fa-fw fa-lg fa-trash' />Xóa thông tin học phần
                    </button>
                    <button style={{ height: 'fit-content', margin: 'auto', marginRight: '10px', display: isEdit ? '' : 'none' }} className='btn btn-warning' type='button' onClick={e => e && e.preventDefault() || this.addNewBuoi(fullData)}>
                        <i className='fa fa-fw fa-lg fa-plus' />Thêm buổi
                    </button>
                    <button className='btn btn-secondary' style={{ display: isEdit ? '' : 'none', marginRight: '10px' }} onClick={e => e.preventDefault() || this.setState({ isEdit: 0 })}>
                        <i className='fa fa-lg fa-times' /> Huỷ
                    </button>
                    {/* <button className='btn btn-info' style={{ display: isEdit ? '' : 'none', marginRight: '10px' }} onClick={e => e.preventDefault() || this.editPhong()}>
                        <i className='fa fa-lg fa-edit' /> Cập nhật phòng
                    </button> */}
                    <button className={isEdit ? 'btn btn-success' : 'btn btn-primary'} style={{ display: !isEdit ? '' : (this.state?.isTrung ? 'none' : '') }} onClick={e => {
                        e.preventDefault();
                        if (isEdit) this.onSave();
                        else this.setState({ isEdit: 1 }, () => this.checkTiet());
                    }}>
                        <i className={'fa fa-lg ' + icon} />{textButton}
                    </button>
                </div>
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
        let { isEdit, fullData, maHocPhan, isAdjust, dataTiet, listNgayLe, dataTeacher, viewing } = this.state;
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Điều chỉnh học phần',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Điều chỉnh học phần'
            ],
            content: <div>
                <DuKienTuanHocModal ref={e => this.duKienModal = e} />
                <div className='tile'>
                    <div className='row'>
                        <FormTextBox ref={e => this.namHoc = e} className='col-md-4' readOnly label='Năm học' />
                        <FormTextBox ref={e => this.hocKy = e} className='col-md-4' readOnly label='Học kỳ' />
                        <FormTextBox ref={e => this.listNienKhoa = e} className='col-md-4' readOnly label='Khóa' />
                        <FormTextBox ref={e => this.tenHe = e} className='col-md-4' readOnly label='Hệ' />
                        <FormTextBox ref={e => this.tenNganh = e} className='col-md-4' readOnly label='Ngành/Chuyên ngành' />
                        <FormTextBox ref={e => this.tongTiet = e} className='col-md-4' readOnly label='Tổng số tiết' />
                        <FormTextBox ref={e => this.maHocPhan = e} className='col-md-4' readOnly label='Mã học phần' />
                        <FormTextBox type='number' ref={e => this.tietLyThuyet = e} className='col-md-4' readOnly label='Số tiết lý thuyết' />
                        <FormTextBox type='number' ref={e => this.tietThucHanh = e} className='col-md-4' readOnly label='Số tiết thực hành' />
                        <FormTextBox ref={e => this.monHoc = e} className='col-md-12' label='Môn học' readOnly />
                        <FormTextBox ref={e => this.khoa = e} className='col-md-12' readOnly label='Khoa, bộ môn' />
                    </div>
                </div>
                <div className='tile'>
                    <FormTabs ref={e => this.tab = e} tabs={[
                        { title: 'Thông tin học phần', component: this.thongTinThoiKhoaBieu() },
                        {
                            title: 'Quản lý học phần', component: <SectionTuanHoc ref={e => this.sectionTuan = e} viewing={viewing} maHocPhan={this.ma} fullData={fullData} isAdjust={isAdjust} handleUpdateGV={this.handleUpdateGV} setNgayHocPhan={this.setNgayHocPhan}
                                dataTiet={dataTiet} listNgayLe={listNgayLe} getData={this.getData} handleReloadData={this.handleReloadData} dataTeacher={dataTeacher.filter(gv => !(gv.ngayBatDau && gv.ngayKetThuc))} />
                        },
                        { title: 'Danh sách sinh viên', component: this.state.maHocPhan ? <SectionHPStudent ref={e => this.sectionStudent = e} viewing={viewing} isEdit={isEdit} maHocPhan={maHocPhan} data={fullData} handleImport={this.import} /> : <></> },
                    ]} onChange={this.tabChanged} />
                </div>
            </div>,
            // backRoute: '/user/dao-tao/thoi-khoa-bieu',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtTkbConfig: state.daoTao.dtTkbConfig });
const mapActionsToProps = {
    updateDtThoiKhoaBieu, DtThoiKhoaBieuGiangVienGetById, DtThoiKhoaBieuBaoNghiCreate, DtThoiKhoaBieuBaoBuDelete,
    getDmNgayLeAll, DtThoiKhoaBieuBaoNghiDelete, DtThoiKhoaBieuGetDataHocPhan, DtTKBCustomGetNotFree, DtTKBDeleteInfoHocPhan, DtTKBCustomMultiUpdate
};
export default connect(mapStateToProps, mapActionsToProps)(adjustPage);