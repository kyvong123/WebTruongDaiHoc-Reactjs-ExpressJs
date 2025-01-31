import React from 'react';
import { connect } from 'react-redux';
import { getDtSemesterAll } from 'modules/mdDaoTao/dtSemester/redux';
// import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_DmDonViFaculty_Drl, getDmDonViFaculty } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoDrl, getDmSvLoaiHinhDaoTaoAll } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { AdminModal, FormTextBox, FormSelect, FormDatePicker, FormCheckbox, getValue } from 'view/component/AdminPage';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectApdater_SvManageBoTieuChi } from 'modules/mdCongTacSinhVien/svBoTieuChi/redux';
// import { SelectAdapter_DtKhoaDaoTao } from '../dtKhoaDaoTao/redux';
const moment = require('moment');
class AddModal extends AdminModal {
    state = {
        namHoc: '', hocKy: '',
        readOnly: false, change: false,
        listLHDT: null, listKhoa: null, listKhoaSV: null,
        semester: [], lhdt: [], khoa: [],
        isSvLtDanhGia: false, isLtDanhGia: false, isKhoaDanhGia: false
    }

    // Thời gian đánh giá của các đối tượng
    doiTuongSinhVien = { next: 'doiTuongKhoa', }
    doiTuongKhoa = { prev: 'doiTuongSinhVien' }

    khungThoiGian = {
        doiTuongSinhVien: {
            ngayBatDau: [null, new Date(1970, 11, 1).setHours(0, 0), new Date(1971, 4, 1).setHours(0, 0)],
            ngayKetThucSv: [null, new Date(1970, 11, 31).setHours(23, 59, 59, 999), new Date(1971, 4, 31).setHours(23, 59, 59, 999)],
            ngayKetThucLt: [null, new Date(1971, 1, 6).setHours(23, 59, 59, 999), new Date(1971, 7, 21).setHours(23, 59, 59, 999)],
        },
        doiTuongKhoa: {
            ngayBatDau: [null, new Date(1971, 1, 15).setHours(0, 0), new Date(1971, 7, 21).setHours(0, 0)],
            ngayKetThuc: [null, new Date(1971, 1, 29).setHours(23, 59, 59, 999), new Date(1971, 8, 16).setHours(23, 59, 59, 999)],
        }
    }

    componentDidMount() {
        this.setState({ dataKhoaSinhVien: Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i) }, () => {
            this.khoaSinhVien.value('');
        });

        this.props.getDtSemesterAll(item => this.setState({ semester: item }));
        SelectAdapter_DmSvLoaiHinhDaoTaoDrl.fetchAll(items => this.setState({ lhdt: items }));
        this.props.getDmDonViFaculty(item => {
            item = item.filter(e => e.ma != 32 && e.ma != 33);
            this.setState({ khoa: item });
        });
    }

    onShow = (item = null) => {
        let semester = this.state.semester;
        semester = semester.filter(e => e.active == 1);
        const { namHoc: namHocHt, hocKy: hocKyHt } = semester[0];
        let timeNamHoc = semester[0].namHoc.substring(0, 4);
        let { ten, namHoc, hocKy, loaiHinhDaoTao, khoa, khoaSinhVien, timeEndSv = '', timeEndLt = '', timeEndFaculty = '', maBoTc, timeStartSv = '', timeStartFaculty = '' } = item ? item :
            {
                ten: `${namHocHt} HK${hocKyHt}`,
                namHoc: namHocHt, hocKy: hocKyHt,
                loaiHinhDaoTao: this.state.lhdt.map(item => item.id),
                khoa: this.state.khoa.map(item => item.ma),
                khoaSinhVien: this.state.dataKhoaSinhVien,
                timeStartSv: this.getDefaultTime('doiTuongSinhVien', timeNamHoc, hocKyHt, 'ngayBatDau'),
                timeEndSv: this.getDefaultTime('doiTuongSinhVien', timeNamHoc, hocKyHt, 'ngayKetThucSv'),
                timeEndLt: this.getDefaultTime('doiTuongSinhVien', timeNamHoc, hocKyHt, 'ngayKetThucLt'),
                timeStartFaculty: this.getDefaultTime('doiTuongKhoa', timeNamHoc, hocKyHt, 'ngayBatDau'),
                timeEndFaculty: this.getDefaultTime('doiTuongKhoa', timeNamHoc, hocKyHt, 'ngayKetThuc'),
            };
        console.log(timeStartSv, timeStartFaculty);
        if (typeof loaiHinhDaoTao == 'string') loaiHinhDaoTao = loaiHinhDaoTao.split(', ');
        if (typeof khoa == 'string') khoa = khoa.split(', ');
        if (typeof khoaSinhVien == 'string') khoaSinhVien = khoaSinhVien.split(', ');
        this.setState({ readOnly: false, listLHDT: loaiHinhDaoTao, listKhoa: khoa, listKhoaSV: khoaSinhVien, isSvLtDanhGia: !!timeEndSv, isLtDanhGia: !!timeEndLt, isKhoaDanhGia: !!timeEndFaculty }, () => {
            this.tenDot.value(ten || '');
            this.isSvLtDanhGia.value(!!timeStartSv);
            // this.isLtDanhGia.value(!!timeStartLt);
            this.isKhoaDanhGia.value(!!timeStartFaculty);
            timeStartSv &&
                (this.doiTuongSinhVien.ngayBatDau?.value(timeStartSv) || this.doiTuongSinhVien.ngayKetThucSv.value(timeEndSv || '') || this.doiTuongSinhVien.ngayKetThucLt?.value(timeEndLt));
            timeStartFaculty && (this.doiTuongKhoa.ngayBatDau?.value(timeStartFaculty) || this.doiTuongKhoa.ngayKetThuc.value(timeEndFaculty || ''));
        });

        this.namHoc.value(namHoc || '');
        this.hocKy.value(hocKy || '');
        this.loaiHinhDaoTao.value(loaiHinhDaoTao || '');
        this.khoa.value(khoa || '');
        this.khoaSinhVien.value(khoaSinhVien || '');
        this.maBoTc.value(maBoTc || '');
        if (!item) {
            this.allKhoa.value(true);
            this.allLHDT.value(true);

        }

        this.setState({ id: item?.id, item });
    };

    validateTimeGraph = (data) => {
        const keys = ['timeStartSv', 'timeEndSv', 'timeEndLt', 'timeStartFaculty', 'timeEndFaculty'];
        let timeline = [];
        keys.forEach(key => data[key] && timeline.push(data[key]));
        for (let i = 1; i < timeline.length; i++) {
            const cur = timeline[i], prev = timeline[i - 1];
            if (prev > cur) {
                return true;
            }
        }
        return false;
    }

    onSubmit = (e) => {
        e.preventDefault();

        let readOnly = this.state.readOnly;
        let multipleLoaiHinhDaoTao = this.getValueMultiple(this.loaiHinhDaoTao),
            multipleKhoa = this.getValueMultiple(this.khoa),
            multipleKhoaSV = this.getValueMultiple(this.khoaSinhVien);

        const { isSvLtDanhGia, isKhoaDanhGia } = this.state;

        if (!isSvLtDanhGia && !isKhoaDanhGia) {
            throw ({ props: { label: 'Đối tượng đánh giá' } });
        }
        let ngayBDSV = isSvLtDanhGia ? getValue(this.doiTuongSinhVien.ngayBatDau).getTime() : null,
            ngayKTSV = isSvLtDanhGia ? getValue(this.doiTuongSinhVien.ngayKetThucSv).getTime() : null,
            ngayKTLT = isSvLtDanhGia ? getValue(this.doiTuongSinhVien.ngayKetThucLt).getTime() : null,
            ngayBDKhoa = isKhoaDanhGia ? getValue(this.doiTuongKhoa.ngayBatDau).getTime() : null,
            ngayKTKhoa = isKhoaDanhGia ? getValue(this.doiTuongKhoa.ngayKetThuc).getTime() : null;

        const changes = {
            ten: getValue(this.tenDot),
            timeStartSv: ngayBDSV,
            timeEndSv: ngayKTSV,
            // timeStartLt: ngayBDLT,
            timeEndLt: ngayKTLT,
            timeStartFaculty: ngayBDKhoa,
            timeEndFaculty: ngayKTKhoa,
            namHoc: this.namHoc.value(),
            hocKy: this.hocKy.value(),
            loaiHinhDaoTao: multipleLoaiHinhDaoTao,
            khoa: multipleKhoa,
            khoaSinhVien: multipleKhoaSV,
            maBoTc: getValue(this.maBoTc)
        };
        let isOverlap = this.validateTimeGraph(changes);
        let done = () => {
            if (!this.state.item) {
                T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                this.props.createDot(changes, () => {
                    this.hide();
                    T.alert('Tạo mới đợt đánh giá điểm rèn luyện thành công', 'success', false, 1000);
                });
            } else {
                if (readOnly == true) {
                    T.confirm('Đang trong thời gian đánh giá!', 'Bạn vẫn muốn cập nhật đợt đánh giá điểm rèn luyện?', true, isConfirm => {
                        if (isConfirm) {
                            let check = this.checkChangeSelect(multipleLoaiHinhDaoTao, multipleKhoa, multipleKhoaSV);
                            changes.check = check;
                            if (check) { //Thay đổi form select
                                T.confirm('Danh sách sinh viên sẽ được đặt lại!', 'Bạn vẫn muốn cập nhật đợt đánh giá điểm rèn luyện?', true, isConfirm => {
                                    if (isConfirm) {
                                        T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                                        this.props.updateDot(this.state.item.id, changes, () => {
                                            this.hide();
                                            T.alert('Cập nhật đợt đánh giá điểm rèn luyện thành công', 'success', false, 1000);
                                        });
                                    }
                                });
                            } else { //Không thay đổi form select
                                T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                                this.props.updateDot(this.state.item.id, changes, () => {
                                    this.hide();
                                    T.alert('Cập nhật đợt đánh giá điểm rèn luyện thành công', 'success', false, 1000);
                                });
                            }
                        }
                    });
                } else {
                    let check = this.checkChangeSelect(multipleLoaiHinhDaoTao, multipleKhoa, multipleKhoaSV);
                    changes.check = check;
                    if (check) { //Thay đổi form select
                        T.confirm('Danh sách sinh viên sẽ được đặt lại!', 'Bạn vẫn muốn cập nhật đợt đánh giá điểm rèn luyện?', true, isConfirm => {
                            if (isConfirm) {
                                T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                                this.props.updateDot(this.state.item.id, changes, () => {
                                    this.hide();
                                    T.alert('Cập nhật đợt đánh giá điểm rèn luyện thành công', 'success', false, 1000);
                                });
                            }
                        });
                    } else { //Không thay đổi form select
                        T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                        this.props.updateDot(this.state.item.id, changes, () => {
                            this.hide();
                            T.alert('Cập nhật đợt đánh giá điểm rèn luyện thành công', 'success', false, 1000);
                        });
                    }
                }
            }
        };
        if (isOverlap) {
            T.confirm('Cảnh báo', 'Thời gian các giai đoạn đang bị trồng với nhau. Bạn có muốn tiếp tục!', 'warning', isConfirm => isConfirm && done());
        } else done();
    }

    getValueMultiple = (input) => {
        const data = input.value().join(', ');
        if (!data) throw input;
        return data;
    }


    checkChangeSelect = (lhdt, khoa, khoaSV) => {//mới chỉnh
        lhdt = lhdt.split(', ');
        khoa = khoa.split(', ');
        khoaSV = khoaSV.split(', ');
        let { listLHDT, listKhoa, listKhoaSV } = this.state;//cũ
        if (listLHDT == '' || listKhoa == '' || listKhoaSV == '') return true;
        if (lhdt.length != listLHDT.length || khoa.length != listKhoa.length || khoaSV.length != listKhoaSV.length) return true;
        for (let item of lhdt) {
            if (!listLHDT.includes(item)) return true;
        }
        for (let item of listLHDT) {
            if (!lhdt.includes(item)) return true;
        }
        for (let item of khoa) {
            if (!listKhoa.includes(item)) return true;
        }
        for (let item of listKhoa) {
            if (!khoa.includes(item)) return true;
        }
        for (let item of khoaSV) {
            if (!listKhoaSV.includes(item)) return true;
        }
        for (let item of listKhoaSV) {
            if (!khoaSV.includes(item)) return true;
        }
        return false;
    }

    checkAll = (value, ma) => {
        if (value == true) {
            if (ma == 'lhdt') {
                let lhdt = this.state.lhdt.map(e => e.id);
                this.loaiHinhDaoTao.value(lhdt);
            } else if (ma == 'khoa') {
                let khoa = this.state.khoa.map(e => e.ma);
                this.khoa.value(khoa);
            } else if (ma == 'khoaSv') {
                let khoaSv = this.state.dataKhoaSinhVien;
                this.khoaSinhVien.value(khoaSv);
            }
        } else {
            if (ma == 'lhdt') {
                this.loaiHinhDaoTao.value(null);
            } else if (ma == 'khoa') {
                this.khoa.value(null);
            } else if (ma == 'khoaSv') {
                this.khoaSinhVien.value(null);
            }
        }
    }


    // checkNBD = () => {
    // 	let ngayBD = getValue(this.ngayBatDau).getTime();
    // 	if (this.chooseNKT != 1) {
    // 		if (ngayBD < Date.now()) {
    // 			T.notify('Ngày bắt đầu trước hôm nay!', 'danger');
    // 			this.ngayBatDau?.focus();
    // 		}
    // 	} else {
    // 		let ngayKT = getValue(this.ngayKetThuc).getTime();
    // 		if (ngayKT - ngayBD < 0) {
    // 			T.notify('Ngày bắt đầu sớm trễ ngày kết thúc!', 'danger');
    // 			this.ngayBatDau?.focus();
    // 		}
    // 	}
    // }

    setThoiGianMacDinh = (doiTuong, namHoc, hocKy) => {
        namHoc = namHoc ?? this.namHoc.value();
        hocKy = hocKy ?? this.hocKy.value();
        const namBatDau = namHoc.split(' - ')[0];
        let thoiGianDoiTuong = this.khungThoiGian[doiTuong];
        for (let mocThoiGian of Object.keys(thoiGianDoiTuong)) {
            let time = thoiGianDoiTuong[mocThoiGian][hocKy];
            if (!time) this[doiTuong][mocThoiGian].value('');
            else {
                const originYear = moment(time).year();
                let thoiGian = moment(time).set('year', Number(namBatDau) + (originYear - 1970));
                this[doiTuong][mocThoiGian].value(moment(thoiGian).valueOf());
            }
        }
    }

    getDefaultTime = (doiTuong, namBatDau, hocKy, mocThoiGian) => {
        console.log(doiTuong, namBatDau, hocKy, mocThoiGian);
        let thoiGianDoiTuong = this.khungThoiGian[doiTuong];
        let time = thoiGianDoiTuong[mocThoiGian][hocKy];
        const originYear = moment(time).year();
        let thoiGian = moment(time).set('year', Number(namBatDau) + (originYear - 1970));
        return moment(thoiGian).valueOf();
    }

    handleChangeNamHocOrHocKy = () => {
        const { isSvLtDanhGia, isKhoaDanhGia } = this.state;
        const namHoc = this.namHoc.value(),
            hocKy = this.hocKy.value();
        if (isSvLtDanhGia) this.setThoiGianMacDinh('doiTuongSinhVien', namHoc, hocKy);
        if (isKhoaDanhGia) this.setThoiGianMacDinh('doiTuongKhoa', namHoc, hocKy);
        if (namHoc && hocKy) {
            this.tenDot.value(`${namHoc} HK${hocKy}`);
        }
    }

    focusNext = (doiTuong) => {
        while (this[doiTuong].next) doiTuong = this[doiTuong].next;
        this[doiTuong].ngayBatDau?.focus();
    }


    render = () => {
        const { item } = this.state, { active } = item ?? {};
        const readOnly = active == 1;
        return this.renderModal({
            title: this.state.item && this.state.item.id ? 'Cập nhật đợt đánh giá điểm rèn luyện' : 'Tạo mới đợt đánh giá điểm rèn luyện',
            size: 'large',
            body:
                <>
                    <div className='row'>
                        <FormTextBox ref={e => this.namHoc = e} className='col-md-6' label='Năm học' type='scholastic' required onChange={() => this.handleChangeNamHocOrHocKy()} readOnly={readOnly} />
                        <FormSelect ref={e => this.hocKy = e} className='col-md-6' label='Học kỳ' data={[
                            { id: 1, text: 'HK1' },
                            { id: 2, text: 'HK2' },
                        ]} required onChange={() => this.handleChangeNamHocOrHocKy()} readOnly={readOnly} />
                        <FormTextBox ref={e => this.tenDot = e} className='col-md-6' label='Tên đợt' required readOnly={readOnly} />
                        <FormSelect ref={e => this.maBoTc = e} className='col-md-6' data={SelectApdater_SvManageBoTieuChi} label='Bộ tiêu chí' required readOnly={readOnly} />
                    </div>
                    <div className='row'>
                        <label className='col-md-12'>Đối tượng đánh giá</label>
                        <FormCheckbox ref={e => this.isSvLtDanhGia = e} className='col-md-4' label='Cá nhân và lớp' onChange={value => this.setState({ isSvLtDanhGia: value }, () => value && this.setThoiGianMacDinh('doiTuongSinhVien'))} readOnly={readOnly} />
                        <FormCheckbox ref={e => this.isKhoaDanhGia = e} className='col-md-4' label='Khoa' onChange={value => this.setState({ isKhoaDanhGia: value }, () => value && this.setThoiGianMacDinh('doiTuongKhoa'))} readOnly={readOnly} />
                    </div>
                    <div className='row'>
                        {this.state.isSvLtDanhGia && <>
                            <h6 className='col-md-12'>Cá nhân và lớp</h6>
                            <FormDatePicker ref={e => this.doiTuongSinhVien.ngayBatDau = e} className='col-md-4' label='Bắt đầu đánh giá' type='time' required onChange={() => this.doiTuongSinhVien.ngayKetThucSv.focus()} readOnly={readOnly} newLine />
                            <FormDatePicker ref={e => this.doiTuongSinhVien.ngayKetThucSv = e} className='col-md-4' label='Hạn chót cá nhân đánh giá' type='time' required onChange={() => this.doiTuongSinhVien.ngayKetThucLt.focus()} readOnly={readOnly} newLine />
                            <FormDatePicker ref={e => this.doiTuongSinhVien.ngayKetThucLt = e} className='col-md-4' label='Hạn chót lớp đánh giá' type='time' required onChange={() => this.focusNext('doiTuongSinhVien')} readOnly={readOnly} newLine />
                        </>}
                        {this.state.isKhoaDanhGia && <>
                            <h6 className='col-md-12'>Khoa</h6>
                            <FormDatePicker ref={e => this.doiTuongKhoa.ngayBatDau = e} className='col-md-6' label='Bắt đầu đánh giá' type='time' required onChange={() => this.doiTuongKhoa.ngayKetThuc.focus()} readOnly={readOnly} newLine />
                            <FormDatePicker ref={e => this.doiTuongKhoa.ngayKetThuc = e} className='col-md-6' label='Hạn chót đánh giá' type='time' required readOnly={readOnly} newLine />
                        </>}

                        <div className='col-md-2' > <label >Loại hình đào tạo</label> </div>
                        <FormCheckbox ref={e => this.allLHDT = e} className='col-md-10' label='Chọn tất cả'
                            style={{ display: readOnly ? 'none' : '' }}
                            onChange={(value) => {
                                this.checkAll(value, 'lhdt');
                            }} />
                        <FormSelect ref={e => this.loaiHinhDaoTao = e} className='col-md-12' data={SelectAdapter_DmSvLoaiHinhDaoTaoDrl} multiple readOnly={readOnly} />

                        <div className='col-md-2' > <label>Khoa</label> </div>
                        <FormCheckbox ref={e => this.allKhoa = e} className='col-md-10' label='Chọn tất cả'
                            style={{ display: readOnly ? 'none' : '' }}
                            onChange={(value) => {
                                this.checkAll(value, 'khoa');
                            }} readOnly={readOnly} />
                        <FormSelect ref={e => this.khoa = e} className='col-md-12' data={SelectAdapter_DmDonViFaculty_Drl} multiple readOnly={readOnly} />
                        <FormSelect ref={e => this.khoaSinhVien = e} className='col-md-12' data={SelectAdapter_DtKhoaDaoTao} multiple label='Khóa sinh viên' required readOnly={readOnly} />
                    </div>
                </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDtSemesterAll, getDmSvLoaiHinhDaoTaoAll, getDmDonViFaculty };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AddModal);