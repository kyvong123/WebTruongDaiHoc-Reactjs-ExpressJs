import React from 'react';
import { connect } from 'react-redux';
import { getDtSemesterAll } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_DmDonViFaculty_V3, getDmDonViFaculty } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao, getDmSvLoaiHinhDaoTaoAll } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { AdminModal, FormTextBox, FormSelect, FormDatePicker, FormCheckbox, getValue } from 'view/component/AdminPage';
import { SelectAdapter_DtKhoaDaoTao } from '../dtKhoaDaoTao/redux';
import { createDtCauHinhDotDkhp } from './redux';

class AddModal extends AdminModal {
    state = {
        readOnly: false, change: false,
        listLHDT: null, listKhoa: null, listKhoaSV: null,
        semester: [], lhdt: [], khoa: [],
        congNo: null,
    }

    componentDidMount() {
        this.setState({ dataKhoaSinhVien: Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i) }, () => {
            this.khoaSinhVien.value('');
        });
        this.disabledClickOutside();

        this.props.getDtSemesterAll(item => this.setState({ semester: item }));
        this.props.getDmSvLoaiHinhDaoTaoAll(item => this.setState({ lhdt: item }));
        this.props.getDmDonViFaculty(item => {
            item = item.filter(e => e.ma != 32 && e.ma != 33);
            this.setState({ khoa: item });
        });
    }

    onShow = (item) => {
        this.setState({ readOnly: false });

        let { tenDot, ngayBatDau, ngayKetThuc, theoKeHoach, ngoaiKeHoach, ngoaiCtdt, hocLai, huyMon, chuyenLop, ghepLop, namHoc, hocKy, loaiHinhDaoTao, khoa, khoaSinhVien, caiThien, congNo, ngoaiNgu } = item ? item :
            { tenDot: '', ngayBatDau: null, ngayKetThuc: null, theoKeHoach: 0, ngoaiKeHoach: 0, ngoaiCtdt: 0, hocLai: 0, huyMon: 0, chuyenLop: 0, ghepLop: 0, namHoc: '', hocKy: null, loaiHinhDaoTao: '', khoa: '', khoaSinhVien: '', caiThien: 0, congNo: 0, chuanSinhVien: 0, ngoaiNgu: 0 };

        if (!item) {
            let semester = this.state.semester;
            semester = semester.filter(e => e.active == 1);
            namHoc = semester[0].namHoc;
            hocKy = semester[0].hocKy;
        }

        if (loaiHinhDaoTao != '' && loaiHinhDaoTao != null) loaiHinhDaoTao = loaiHinhDaoTao.split(', ');
        if (khoa != '' && khoa != null) khoa = khoa.split(', ');
        if (khoaSinhVien != '' && khoaSinhVien != null) khoaSinhVien = khoaSinhVien.split(', ');
        this.setState({ listLHDT: loaiHinhDaoTao, listKhoa: khoa, listKhoaSV: khoaSinhVien, congNo });

        if (ngayBatDau != '' && ngayBatDau != null) ngayBatDau = new Date(ngayBatDau);
        if (ngayKetThuc != '' && ngayKetThuc != null) ngayKetThuc = new Date(ngayKetThuc);

        this.tenDot.value(tenDot);
        this.ngayBatDau.value(ngayBatDau);
        this.ngayKetThuc.value(ngayKetThuc);
        this.namHoc.value(namHoc);
        this.hocKy.value(hocKy);
        this.loaiHinhDaoTao.value(loaiHinhDaoTao);
        this.khoa.value(khoa);
        this.khoaSinhVien.value(khoaSinhVien);

        this.theoKeHoach.value(theoKeHoach);
        this.ngoaiKeHoach.value(ngoaiKeHoach);
        this.ngoaiCtdt.value(ngoaiCtdt);
        this.hocLai.value(hocLai);
        this.huyMon.value(huyMon);
        this.chuyenLop.value(chuyenLop);
        this.caiThien.value(caiThien);
        this.congNo.value(congNo);
        this.ghepLop.value(ghepLop);
        this.ngoaiNgu.value(ngoaiNgu);

        this.setState({ item });

        const d = Date.now();
        if (item && item.id) if (item.ngayBatDau < d && item.ngayKetThuc > d) this.setState({ readOnly: true });
    };

    onSubmit = (e) => {
        e.preventDefault();

        let readOnly = this.state.readOnly;
        let multipleLoaiHinhDaoTao = this.loaiHinhDaoTao.value(),
            multipleKhoa = this.khoa.value(),
            multipleKhoaSV = this.khoaSinhVien.value();

        multipleLoaiHinhDaoTao = multipleLoaiHinhDaoTao.join(', ');
        multipleKhoa = multipleKhoa.join(', ');
        multipleKhoaSV = multipleKhoaSV.join(', ');

        let ngayBD = getValue(this.ngayBatDau).getTime();
        let ngayKT = getValue(this.ngayKetThuc).getTime();

        const changes = {
            tenDot: this.tenDot.value(),
            ngayBatDau: ngayBD,
            ngayKetThuc: ngayKT,

            namHoc: this.namHoc.value(),
            hocKy: this.hocKy.value(),
            loaiHinhDaoTao: multipleLoaiHinhDaoTao,
            khoa: multipleKhoa,
            khoaSinhVien: multipleKhoaSV,

            theoKeHoach: Number(this.theoKeHoach.value()),
            ngoaiKeHoach: Number(this.ngoaiKeHoach.value()),
            ngoaiCtdt: Number(this.ngoaiCtdt.value()),
            hocLai: Number(this.hocLai.value()),
            huyMon: Number(this.huyMon.value()),
            chuyenLop: Number(this.chuyenLop.value()),
            caiThien: Number(this.caiThien.value()),
            congNo: Number(this.congNo.value()),
            ghepLop: Number(this.ghepLop.value()),
            ngoaiNgu: Number(this.ngoaiNgu.value()),
            chuanSinhVien: 0,
            // chuanSinhVien: Number(this.chuanSinhVien.value())
        };

        if (changes.tenDot == '') {
            T.notify('Tên cấu hình đợt đăng ký học phần bị trống!', 'danger');
            this.ten.focus();
        } else if (changes.loaiHinhDaoTao == '') {
            T.notify('Loại hình đào tạo bị trống!', 'danger');
            this.loaiHinhDaoTao.focus();
        } else if (changes.khoa == '') {
            T.notify('Khoa bị trống!', 'danger');
            this.khoa.focus();
        } else if (changes.khoaSinhVien == '') {
            T.notify('Khóa sinh viên bị trống!', 'danger');
            this.khoaSinhVien.focus();
        } else if (changes.ngayBatDau == '') {
            T.notify('Ngày bắt đầu bị trống!', 'danger');
            this.ngayBatDau.focus();
        } else if (changes.ngayKetThuc == '') {
            T.notify('Ngày kết thúc bị trống!', 'danger');
            this.ngayKetThuc.focus();
        } else if (!this.state.item && changes.ngayBatDau < Date.now()) {
            T.notify('Ngày bắt đầu trước hôm nay!', 'danger');
            this.ngayBatDau.focus();
        } else if (changes.ngayKetThuc < Date.now()) {
            T.notify('Ngày kết thúc trước hôm nay!', 'danger');
            this.ngayKetThuc.focus();
        } else if (changes.ngayKetThuc < changes.ngayBatDau) {
            T.notify('Ngày kết thúc sớm hơn ngày bắt đầu!', 'danger');
            this.ngayKetThuc.focus();
        } else {
            if (!this.state.item) {
                T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                this.props.createDtCauHinhDotDkhp(changes, (value) => {
                    if (value.error) T.alert('Tạo mới đợt đăng ký học phần thất bại', 'error', false, 1000);
                    else {
                        this.hide();
                        T.alert('Tạo mới đợt đăng ký học phần thành công', 'success', false, 1000);
                        this.props.history.push({ pathname: `/user/dao-tao/edu-schedule/cau-hinh-dkhp/edit/${value.item.id}` });
                    }
                });
            } else {
                if (readOnly == true) {
                    T.confirm('Đang trong thời gian đăng ký môn học!', 'Bạn vẫn muốn cập nhật đợt đăng ký học phần?', true, isConfirm => {
                        if (isConfirm) {
                            let check = this.checkChangeSelect(multipleLoaiHinhDaoTao, multipleKhoa, multipleKhoaSV);
                            changes.check = check;
                            if (check) { //Thay đổi form select
                                T.confirm('Danh sách sinh viên sẽ được đặt lại!', 'Bạn vẫn muốn cập nhật đợt đăng ký học phần?', true, isConfirm => {
                                    if (isConfirm) this.update(this.state.item.id, changes);

                                });
                            } else this.update(this.state.item.id, changes); //Không thay đổi form select


                        }
                    });
                } else {
                    let check = this.checkChangeSelect(multipleLoaiHinhDaoTao, multipleKhoa, multipleKhoaSV);
                    changes.check = check;
                    if (check) { //Thay đổi form select
                        T.confirm('Danh sách sinh viên sẽ được đặt lại!', 'Bạn vẫn muốn cập nhật đợt đăng ký học phần?', true, isConfirm => {
                            if (isConfirm) this.update(this.state.item.id, changes);

                        });
                    } else this.update(this.state.item.id, changes);//Không thay đổi form select

                }
            }
        }
    }

    update = (id, data) => {
        T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
        this.props.updateDot(id, data, (value) => {
            if (value.error) T.alert('Cập nhật đợt đăng ký học phần thất bại', 'error', false, 1000);
            else {
                this.hide();
                T.alert('Cập nhật đợt đăng ký học phần thành công', 'success', false, 1000);
            }
        });
    }

    // createDot = (item, done) => this.props.createDtCauHinhDotDkhp(item, (value) => {
    //
    //     done && done(value);
    // });

    checkChangeSelect = (lhdt, khoa, khoaSV) => {//mới chỉnh
        lhdt = lhdt.split(', ');
        khoa = khoa.split(', ');
        khoaSV = khoaSV.split(', ');
        let { listLHDT, listKhoa, listKhoaSV, congNo } = this.state;//cũ
        if (listLHDT == '' || listKhoa == '' || listKhoaSV == '') return true;
        if (lhdt.length != listLHDT.length || khoa.length != listKhoa.length || khoaSV.length != listKhoaSV.length) return true;
        if (congNo != Number(this.congNo.value())) return true;
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
                let lhdt = this.state.lhdt.map(e => e.ma);
                this.loaiHinhDaoTao.value(lhdt);
            } else if (ma == 'khoa') {
                let khoa = this.state.khoa.map(e => e.ma);
                this.khoa.value(khoa);
            } else if (ma == 'khoaSv') {
                let khoaSv = this.state.dataKhoaSinhVien;
                this.khoaSinhVien.value(khoaSv);
            }
        }
    }

    changeTheoKeHoach = value => this.theoKeHoach.value(value);
    changeNgoaiKeHoach = value => this.ngoaiKeHoach.value(value);
    changeNgoaiCtdt = value => this.ngoaiCtdt.value(value);
    changeHocLai = value => this.hocLai.value(value);
    changeHuyMon = value => this.huyMon.value(value);
    changeChuyenLop = value => this.chuyenLop.value(value);
    changeCaiThien = value => this.caiThien.value(value);
    changeCongNo = value => this.congNo.value(value);
    changeGhepLop = value => this.ghepLop.value(value);
    changeChuanSinhVien = value => this.chuanSinhVien.value(value);
    changeNgoaiNgu = value => this.ngoaiNgu.value(value);


    render = () => {
        return this.renderModal({
            title: this.state.item && this.state.item.id ? 'Cập nhật đợt đăng ký học phần' : 'Tạo mới đợt đăng ký học phần',
            size: 'large',
            body:
                <>
                    <div className='row'>
                        <FormTextBox ref={e => this.tenDot = e} className='col-md-12' label='Tên đợt' required />
                        <FormDatePicker ref={e => this.ngayBatDau = e} className='col-md-6' label='Ngày bắt đầu' type='time' required readOnly={this.state.item && this.state.item.id ? true : false} />
                        <FormDatePicker ref={e => this.ngayKetThuc = e} className='col-md-6' label='Ngày kết thúc' type='time' required />
                        <FormTextBox ref={e => this.namHoc = e} className='col-md-6' label='Năm học' type='scholastic' required />
                        <FormSelect ref={e => this.hocKy = e} className='col-md-6' label='Học kỳ' data={SelectAdapter_DtDmHocKy} required />

                        <div className='col-md-2' > <label >Loại hình đào tạo</label> </div>
                        <FormCheckbox ref={e => this.allLHDT = e} className='col-md-10' label='Chọn tất cả'
                            onChange={(value) => {
                                this.checkAll(value, 'lhdt');
                            }} />
                        <FormSelect ref={e => this.loaiHinhDaoTao = e} className='col-md-12' data={SelectAdapter_DmSvLoaiHinhDaoTao} multiple />

                        <div className='col-md-2' > <label>Khoa</label> </div>
                        <FormCheckbox ref={e => this.allKhoa = e} className='col-md-10' label='Chọn tất cả'
                            onChange={(value) => {
                                this.checkAll(value, 'khoa');
                            }} />
                        <FormSelect ref={e => this.khoa = e} className='col-md-12' data={SelectAdapter_DmDonViFaculty_V3} multiple />

                        {/* <div className='col-md-2' > <label>Khóa sinh viên</label> </div> */}
                        {/* <FormCheckbox ref={e => this.allKhoaSV = e} className='col-md-10' label='Chọn tất cả'
                            onChange={(value) => {
                                this.checkAll(value, 'khoaSv');
                            }} /> */}
                        <FormSelect ref={e => this.khoaSinhVien = e} className='col-md-12' data={SelectAdapter_DtKhoaDaoTao} multiple label='Khóa sinh viên' />
                    </div>

                    <div className='row'>
                        <FormCheckbox ref={e => this.theoKeHoach = e} className='col-md-4' label='Cho phép đăng ký theo kế hoạch' onChange={value => this.changeTheoKeHoach(value ? 1 : 0)} />
                        <FormCheckbox ref={e => this.ngoaiKeHoach = e} className='col-md-4' label='Cho phép đăng ký ngoài kế hoạch' onChange={value => this.changeNgoaiKeHoach(value ? 1 : 0)} />
                        <FormCheckbox ref={e => this.ngoaiCtdt = e} className='col-md-4' label='Cho phép đăng ký ngoài CTDT' onChange={value => this.changeNgoaiCtdt(value ? 1 : 0)} />

                        <FormCheckbox ref={e => this.hocLai = e} className='col-md-4' label='Cho phép đăng ký học lại' onChange={value => this.changeHocLai(value ? 1 : 0)} />
                        <FormCheckbox ref={e => this.caiThien = e} className='col-md-8' label='Cho phép đăng ký cải thiện' onChange={value => this.changeCaiThien(value ? 1 : 0)} />
                    </div>

                    <div className='row mt-1'>
                        <FormCheckbox ref={e => this.huyMon = e} className='col-md-4' label='Cho phép hủy môn' onChange={value => this.changeHuyMon(value ? 1 : 0)} />
                        <FormCheckbox ref={e => this.chuyenLop = e} className='col-md-4' label='Cho phép chuyển lớp' onChange={value => this.changeChuyenLop(value ? 1 : 0)} />
                        <FormCheckbox ref={e => this.ghepLop = e} className='col-md-4' label='Cho phép ghép lớp' onChange={value => this.changeGhepLop(value ? 1 : 0)} />
                    </div>

                    <div className='row mt-1'>
                        <FormCheckbox ref={e => this.congNo = e} className='col-md-4' label='Xét học phí' onChange={value => this.changeCongNo(value ? 1 : 0)} />
                        <FormCheckbox ref={e => this.ngoaiNgu = e} className='col-md-4' label='Xét ngoại ngữ không chuyên' onChange={value => this.changeNgoaiNgu(value ? 1 : 0)} />
                        {/* <FormCheckbox ref={e => this.chuanSinhVien = e} className='col-md-8' label='Xét chuẩn anh văn năm 3' onChange={value => this.changeChuanSinhVien(value ? 1 : 0)} /> */}
                    </div>
                </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDtSemesterAll, getDmSvLoaiHinhDaoTaoAll, getDmDonViFaculty, createDtCauHinhDotDkhp };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AddModal);