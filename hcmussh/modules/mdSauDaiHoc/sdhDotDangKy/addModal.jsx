import React from 'react';
import { connect } from 'react-redux';
import { getSdhSemesterAll } from 'modules/mdSauDaiHoc/sdhSemester/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { getDmKhoaSdhAll, SelectAdapter_DmKhoaSdh } from 'modules/mdSauDaiHoc/dmKhoaSauDaiHoc/redux';
import { getDmHocSdhAll, SelectAdapter_DmHocSdhVer2 } from 'modules/mdSauDaiHoc/dmHocSdh/redux';
import { AdminModal, FormTextBox, FormSelect, FormDatePicker, FormCheckbox, getValue } from 'view/component/AdminPage';
import { SelectAdapter_SdhKhoaHocVien } from 'modules/mdSauDaiHoc/sdhKhoaDaoTao/redux';
import { createSdhDotDangKy } from './redux';

class AddModal extends AdminModal {
    state = {
        readOnly: false, change: false,
        listLHDT: null, listKhoa: null, listKhoaSV: null,
        semester: [], lhdt: [], khoa: []
    }

    componentDidMount() {

        this.props.getSdhSemesterAll(item => this.setState({ semester: item }));
        this.props.getDmHocSdhAll(item => this.setState({ lhdt: item }));
        this.props.getDmKhoaSdhAll(item => {
            item = item.filter(e => e.ma != 32 && e.ma != 33);
            this.setState({ khoa: item });
        });
    }

    onShow = (item) => {
        this.setState({ readOnly: false });

        let { tenDot, ngayBatDau, ngayKetThuc, nam, hocKy, loaiHinhDaoTao, khoa, khoaSinhVien, ngoaiCtdt, ngoaiKeHoach, tinChiToiThieu, tinChiToiDa } = item ? item :
            { tenDot: '', ngayBatDau: null, ngayKetThuc: null, nam: '', hocKy: null, loaiHinhDaoTao: '', khoa: '', khoaSinhVien: '' };

        if (!item) {
            let semester = this.state.semester;
            semester = semester.filter(e => e.active == 1);
            nam = semester[0].namHoc;
            hocKy = semester[0].hocKy;
        }

        if (loaiHinhDaoTao != '' && loaiHinhDaoTao != null) loaiHinhDaoTao = loaiHinhDaoTao.split(', ');
        if (khoa != '' && khoa != null) khoa = khoa.split(', ');
        if (khoaSinhVien != '' && khoaSinhVien != null) khoaSinhVien = khoaSinhVien.split(', ');
        this.setState({ listLHDT: loaiHinhDaoTao, listKhoa: khoa, listKhoaSV: khoaSinhVien });

        if (ngayBatDau != '' && ngayBatDau != null) ngayBatDau = new Date(ngayBatDau);
        if (ngayKetThuc != '' && ngayKetThuc != null) ngayKetThuc = new Date(ngayKetThuc);

        this.tenDot.value(tenDot);
        this.ngayBatDau.value(ngayBatDau);
        this.ngayKetThuc.value(ngayKetThuc);
        this.namHoc.value(nam);
        this.hocKy.value(hocKy);
        this.loaiHinhDaoTao.value(loaiHinhDaoTao);
        this.khoa.value(khoa);
        this.khoaSinhVien.value(khoaSinhVien);

        this.ngoaiKeHoach.value(ngoaiKeHoach);
        this.tinChiToiThieu.value(tinChiToiThieu);
        this.tinChiToiDa.value(tinChiToiDa);

        this.ngoaiCtdt.value(ngoaiCtdt);

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

            nam: this.namHoc.value(),
            hocKy: this.hocKy.value(),
            loaiHinhDaoTao: multipleLoaiHinhDaoTao,
            khoa: multipleKhoa,
            khoaSinhVien: multipleKhoaSV,

            ngoaiKeHoach: Number(this.ngoaiKeHoach.value()),
            tinChiToiThieu: this.tinChiToiThieu.value(),
            tinChiToiDa: this.tinChiToiDa.value(),
            ngoaiCtdt: Number(this.ngoaiCtdt.value()),

        };
        if (changes.tinChiToiThieu >= changes.tinChiToiDa) {
            T.notify('Tín chỉ tối thiểu nhỏ hơn tín chỉ tối đa', 'danger');
            this.tinChiToiThieu.focus();
        }
        else if (changes.tenDot == '') {
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
        } else if (changes.ngayKetThuc < changes.ngayBatDau) {
            T.notify('Ngày kết thúc trước ngày bắt đầu!', 'danger');
            this.ngayKetThuc.focus();
        } else {
            if (!this.state.item) {
                T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                this.props.createSdhDotDangKy(changes, (value) => {
                    if (value.error) T.alert('Tạo mới đợt đăng ký học phần thất bại', 'error', false, 1000);
                    else {
                        this.hide();
                        T.alert('Tạo mới đợt đăng ký học phần thành công', 'success', false, 1000);
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
            if (value && value.error) T.alert('Tạo mới đợt đăng ký học phần thất bại', 'error', false, 1000);
            else {
                this.hide();
                T.alert('Cập nhật đợt đăng ký học phần thành công', 'success', false, 1000);
            }
        });
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

    changeNgoaiKeHoach = value => this.ngoaiKeHoach.value(value);
    changeNgoaiCtdt = value => this.ngoaiCtdt.value(value);

    checkNgay = () => {
        let ngayKT = null;
        let ngayBD = null;
        if (this.ngayBatDau.value()) ngayBD = getValue(this.ngayBatDau).getTime();
        if (this.ngayKetThuc.value()) ngayKT = getValue(this.ngayKetThuc).getTime();

        if (ngayBD && ngayKT) {
            if (ngayKT - ngayBD < 0) {
                T.notify('Ngày kết thúc sớm hơn ngày bắt đầu!', 'danger');
                this.ngayKetThuc.focus();
            }
        } else if (ngayBD) {
            if (Date.now() - ngayBD > 86400000) {
                T.notify('Ngày bắt đầu trước hôm nay!', 'danger');
                this.ngayBatDau.focus();
            }
        } else if (ngayKT) {
            if (ngayKT < Date.now()) {
                T.notify('Ngày kết thúc trước hôm nay!', 'danger');
                this.ngayKetThuc.focus();
            }
        }
    }

    render = () => {
        return this.renderModal({
            title: this.state.item && this.state.item.id ? 'Cập nhật đợt đăng ký học phần' : 'Tạo mới đợt đăng ký học phần',
            size: 'large',
            body:
                <>
                    <div className='row'>
                        <FormTextBox ref={e => this.tenDot = e} className='col-md-12' label='Tên đợt' required />
                        <FormDatePicker ref={e => this.ngayBatDau = e} className='col-md-6' label='Ngày bắt đầu' type='time' required readOnly={this.state.item && this.state.item.id ? true : false} onChange={() => { this.checkNgay(); }} />
                        <FormDatePicker ref={e => this.ngayKetThuc = e} className='col-md-6' label='Ngày kết thúc' type='time' required onChange={() => { this.checkNgay(); }} />
                        <FormTextBox ref={e => this.namHoc = e} className='col-md-6' label='Năm học' type='scholastic' required />
                        <FormSelect ref={e => this.hocKy = e} className='col-md-6' label='Học kỳ' data={SelectAdapter_DtDmHocKy} required />

                        <div className='col-md-2' > <label >Loại hình đào tạo</label> </div>
                        <FormCheckbox ref={e => this.allLHDT = e} className='col-md-10' label='Chọn tất cả'
                            onChange={(value) => {
                                this.checkAll(value, 'lhdt');
                            }} />
                        <FormSelect ref={e => this.loaiHinhDaoTao = e} className='col-md-12' data={SelectAdapter_DmHocSdhVer2} multiple />

                        <div className='col-md-2' > <label>Khoa</label> </div>
                        <FormCheckbox ref={e => this.allKhoa = e} className='col-md-10' label='Chọn tất cả'
                            onChange={(value) => {
                                this.checkAll(value, 'khoa');
                            }} />
                        <FormSelect ref={e => this.khoa = e} className='col-md-12' data={SelectAdapter_DmKhoaSdh} multiple />

                        <FormSelect ref={e => this.khoaSinhVien = e} className='col-md-12' data={SelectAdapter_SdhKhoaHocVien} multiple label='Khóa sinh viên' />
                        <FormCheckbox ref={e => this.ngoaiKeHoach = e} className='col-md-6' label='Cho phép đăng ký ngoài kế hoạch' onChange={value => this.changeNgoaiKeHoach(value ? 1 : 0)} />
                        <FormCheckbox ref={e => this.ngoaiCtdt = e} className='col-md-6' label='Cho phép đăng ký ngoài chương trình đào tạo' onChange={value => this.changeNgoaiCtdt(value ? 1 : 0)} />

                        <FormTextBox type='number' ref={e => this.tinChiToiThieu = e} className='col-md-3' label='Tín chỉ tối thiểu' min={1} max={30} required />
                        <FormTextBox type='number' ref={e => this.tinChiToiDa = e} className='col-md-3' label='Tín chỉ tối đa' min={1} max={30} required />


                    </div>
                </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getSdhSemesterAll, getDmHocSdhAll, getDmKhoaSdhAll, createSdhDotDangKy };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AddModal);