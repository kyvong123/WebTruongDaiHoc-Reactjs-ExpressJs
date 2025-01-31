import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTextBox, AdminModal, FormDatePicker, FormSelect, getValue, TableCell, TableHead, renderDataTable } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { getFwCoursesDetail, createFwCoursesClass, updateFwCoursesClass } from './redux';
import { getDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { FormMultipleLanguage } from 'view/component/MultipleLanguageForm';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { SelectAdapter_DmPhongAll } from 'modules/mdDanhMuc/dmPhong/redux';
import { SelectAdapter_DtDmThu } from 'modules/mdDaoTao/dtDmThu/redux';

class AddModal extends AdminModal {
    state = { caHoc: [] }

    DATE_UNIX = 24 * 60 * 60 * 1000

    componentDidMount() {
        this.disabledClickOutside();
    }

    onShow = (item) => {
        const course = this.props.course,
            { id, ghiChu, soTuan, maLop, siSo, hocPhi, thoiGianBatDau, thoiGianKetThuc, coSo, phong, caHoc } = item || { soTuan: Number(course.soTuan), maLop: T.parse(course.tieuDe, { 'vi': '' }).vi, caHoc: [], id: null, ghiChu: '', siSo: '', hocPhi: '', thoiGianBatDau: '', thoiGianKetThuc: '', coSo: '', phong: '' };

        this.setState({ soTuan, coSo, id, caHoc: typeof caHoc == 'string' ? T.parse(caHoc) : caHoc }, () => {
            this.soTuan.value(soTuan);
            this.maLop.value(maLop);
            this.ghiChu.value(ghiChu);
            this.coSo.value(coSo);
            this.siSo.value(siSo);
            this.hocPhi.value(hocPhi);
            this.thoiGianBatDau.value(thoiGianBatDau);
            this.thoiGianKetThuc.value(thoiGianKetThuc);
            this.phong.value(phong);
        });
    }

    checkTime = (item) => {
        const [gio, phut] = item.split(':');
        return !isNaN(Number(gio)) && !isNaN(Number(phut));
    }

    onSubmit = () => {
        const data = {
            maLop: getValue(this.maLop),
            ghiChu: getValue(this.ghiChu),
            soTuan: getValue(this.soTuan),
            siSo: getValue(this.siSo),
            hocPhi: getValue(this.hocPhi),
            thoiGianBatDau: getValue(this.thoiGianBatDau),
            thoiGianKetThuc: getValue(this.thoiGianKetThuc),
            coSo: getValue(this.coSo),
            phong: getValue(this.phong),
        };

        data.thoiGianBatDau = data.thoiGianBatDau.getTime();
        data.thoiGianKetThuc = data.thoiGianKetThuc.getTime();

        const { caHoc } = this.state;

        if (!caHoc.length && !caHoc.every(i => i.thu && i.batDau && i.ketThuc && this.checkTime(i.batDau) && this.checkTime(i.ketThuc))) return T.notify('Vui lòng nhập đầy đủ thông tin thứ, giờ học bắt đầu và giờ học kết thúc', 'danger');

        data.caHoc = JSON.stringify(caHoc.map(i => ({ thu: i.thu, batDau: i.batDau, ketThuc: i.ketThuc })));

        T.confirm('Lưu thao tác', 'Bạn có chắc bạn muốn lưu thao tác không?', true, isConfirm => {
            if (isConfirm) this.state.id ? this.props.update(this.state.id, this.props.idCourse, data, this.hide) : this.props.create(this.props.idCourse, data, this.hide);
        });
    }

    handleChangeNgayBatDau = (e) => {
        this.setState({ thoiGianBatDau: e.getTime() }, () => this.thoiGianKetThuc.value(e.getTime() + this.state.soTuan * 7 * this.DATE_UNIX));
    }

    handleChangeSoTuan = (e) => {
        const { thoiGianBatDau } = this.state;
        this.setState({ soTuan: e }, () => {
            thoiGianBatDau && this.thoiGianKetThuc.value(thoiGianBatDau + this.state.soTuan * 7 * this.DATE_UNIX);
        });
    }

    handleChangeThu = (e, index) => {
        const { caHoc } = this.state;
        if (caHoc.find(i => i.thu == e.id)) {
            return T.notify('Thứ bị trùng!', 'danger');
        } else if (index == null) {
            caHoc.push({ thu: e.id });
        } else {
            caHoc[index].thu = e.id;
        }
        this.setState({ caHoc }, this.reinitNewData);
    }

    handleGioHoc = (e, type, index) => {
        const { caHoc } = this.state;
        if (e != '__:__') {
            if (index == null) {
                caHoc.push({ [type]: e });
            } else {
                caHoc[index][type] = e;
            }
            this.setState({ caHoc }, this.reinitNewData);
        }
    }

    deleteCaHoc = (index) => {
        const { caHoc } = this.state;
        this.setState({ caHoc: caHoc.filter((_, idx) => idx != index) });
    }

    reinitNewData = () => {
        ['thuNew', 'timeStartNew', 'timeEndNew'].forEach(key => {
            this[key].value('');
        });
    }

    render = () => {
        const { coSo, caHoc, id } = this.state;
        return this.renderModal({
            title: id ? 'Cập nhật lớp học' : 'Tạo mới lớp học',
            size: 'elarge',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.maLop = e} label='Mã lớp' required />
                <FormTextBox className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' />
                <FormTextBox className='col-md-4' ref={e => this.soTuan = e} label='Số tuần' type='number' allowNegative={false} required onChange={e => this.handleChangeSoTuan(e)} />
                <FormTextBox className='col-md-4' ref={e => this.siSo = e} label='Sĩ số' type='number' allowNegative={false} required />
                <FormTextBox className='col-md-4' ref={e => this.hocPhi = e} label='Học phí' type='number' allowNegative={false} suffix=' VND' required />

                <FormDatePicker className='col-md-6' ref={e => this.thoiGianBatDau = e} type='date' label='Thời gian bắt đầu' onChange={e => this.handleChangeNgayBatDau(e)} />
                <FormDatePicker className='col-md-6' ref={e => this.thoiGianKetThuc = e} type='date' label='Thời gian kết thúc' disabled />

                <FormSelect className='col-md-6' ref={e => this.coSo = e} label='Cơ sở' data={SelectAdapter_DmCoSo} onChange={e => this.setState({ coSo: e.id }, () => this.phong.value(''))} required />
                <FormSelect className='col-md-6' ref={e => this.phong = e} label='Phòng' data={SelectAdapter_DmPhongAll(coSo)} required />

                {
                    caHoc.map((i, index) => <>
                        <FormSelect className='col-md-3' key={`thu_${index}`} value={i.thu} label='Thứ' data={SelectAdapter_DtDmThu} onChange={e => this.handleChangeThu(e, index)} />
                        <FormDatePicker className='col-md-4' key={`batDau_${index}`} value={i.batDau} type='hour-mask' label='Giờ học bắt đầu' onChange={e => this.handleGioHoc(e, 'batDau', index)} />
                        <FormDatePicker className='col-md-4' key={`ketThuc_${index}`} value={i.ketThuc} type='hour-mask' label='Giờ học kết thúc' onChange={e => this.handleGioHoc(e, 'ketThuc', index)} />
                        <div className='col-md-1' style={{ margin: 'auto' }}>
                            <button className='btn btn-danger' onClick={() => this.deleteCaHoc(index)}> <i className='fa fa-trash' /></button>
                        </div>
                    </>)
                }

                <FormSelect className='col-md-4' ref={e => this.thuNew = e} label='Thứ' data={SelectAdapter_DtDmThu} onChange={e => this.handleChangeThu(e)} />
                <FormDatePicker className='col-md-4' ref={e => this.timeStartNew = e} type='hour-mask' label='Giờ học bắt đầu' onChange={e => this.handleGioHoc(e, 'batDau')} />
                <FormDatePicker className='col-md-4' ref={e => this.timeEndNew = e} type='hour-mask' label='Giờ học kết thúc' onChange={e => this.handleGioHoc(e, 'ketThuc')} />
            </div>
        });
    }
}

class AdminClass extends AdminPage {
    state = { homeLanguages: ['vi', 'en'] }

    componentDidMount() {
        T.ready('/user/courses', () => {
            const route = T.routeMatcher('/user/courses/item/:id'),
                id = route.parse(window.location.pathname).id;

            this.id = id;
            this.props.getFwCoursesDetail(id, data => {
                this.props.getDmDonVi(data.course.donVi, item => {
                    const homeLanguages = item && item.homeLanguage ? item.homeLanguage.split(',') : ['vi', 'en'];
                    this.setState({ homeLanguages }, () => {
                        this.title.value(data.course.tieuDe);
                        this.ghiChu.value(data.course.ghiChu);
                    });
                });
            });
        });
    }

    render() {
        const { course, classItems } = this.props.course || { course: {}, classItems: [] },
            { homeLanguages } = this.state;

        const table = renderDataTable({
            data: classItems,
            renderHead: () => {
                return <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap' }} content='Mã lớp' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Số tuần' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Sĩ số' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Học phí' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Thời gian bắt đầu' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Thời gian kết thúc' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Cơ sở' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Phòng' />
                    <TableHead style={{ width: '40%', whiteSpace: 'nowrap' }} content='Ca học' />
                    <TableHead style={{ width: '50%', whiteSpace: 'nowrap' }} content='Ghi chú' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Kích hoạt' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Thao tác' />
                </tr>;
            },
            renderRow: (item, index) => {
                return <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maLop} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soTuan} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.siSo} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.hocPhi} VND`} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap' }} content={item.thoiGianBatDau} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap' }} content={item.thoiGianKetThuc} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.coSo} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.caHoc).map((i, idx) => <div key={`caHoc_${idx}`}>Thứ {i.thu}: {i.batDau} - {i.ketThuc}</div>)} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
                    <TableCell type='checkbox' permission={{ write: true }} content={item.kichHoat} onChanged={value => this.props.updateFwCoursesClass(item.id, this.id, { kichHoat: Number(value) })} />
                    <TableCell type='buttons' content={item} permission={{ write: true }} onEdit={() => this.modal.show(item)} />
                </tr>;
            }
        });

        return this.renderPage({
            title: 'Quản lý lớp học',
            icon: 'fa fa-book',
            breadcrumb: [
                <Link key={0} to='/user/courses'>Khóa học ngắn hạn</Link>,
                'Quản lý lớp học'
            ],
            content: <div>
                <div className='tile'>
                    <h3>Thông tin khóa học</h3>
                    <FormMultipleLanguage tabRender ref={e => this.title = e} title='Tiêu đề' languages={homeLanguages} FormElement={FormTextBox} readOnly />
                    <FormMultipleLanguage tabRender ref={e => this.ghiChu = e} title='Ghi chú' languages={homeLanguages} FormElement={FormTextBox} readOnly />
                </div>
                <div className='tile'>
                    {table}
                </div>
                <AddModal ref={e => this.modal = e} course={course} homeLanguages={homeLanguages} create={this.props.createFwCoursesClass} update={this.props.updateFwCoursesClass} idCourse={this.id} />
            </div>,
            onCreate: e => e && e.preventDefault() || this.modal.show(),
            backroute: '/user/courses'
        });
    }
}


const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { getFwCoursesDetail, getDmDonVi, createFwCoursesClass, updateFwCoursesClass };
export default connect(mapStateToProps, mapActionsToProps)(AdminClass);