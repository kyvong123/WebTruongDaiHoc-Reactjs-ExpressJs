import { SelectAdapter_DmDanTocV2 } from 'modules/mdDanhMuc/dmDanToc/redux';
import { ajaxSelectTinhThanhPho } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao, getDmSvLoaiHinhDaoTaoAll } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
// import { SelectAdapter_DmLoaiSinhVienV2 } from 'modules/mdDanhMuc/dmLoaiSinhVien/redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmTinhTrangSinhVienV2 } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';
import { SelectAdapter_DmTonGiaoV2 } from 'modules/mdDanhMuc/dmTonGiao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, EaseDateRangePicker, FormCheckbox, FormDatePicker, FormSelect, FormTabs, FormTextBox, getValue, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getStudentsPage, adminDownloadSyll, updateStudentAdmin, massUpdateStudentAdmin, getStudentDotChinhSuaPage, createStudentDotChinhSuaPage, updateStudentDotChinhSuaPage, deleteStudentDotChinhSuaPage, addStudentAdmin, multiAddDssvAdmin, downloadImage } from './redux';
import { Tooltip } from '@mui/material';
import { getMssvBaoHiemYTe, createMssvBaoHiemYTe } from 'modules/mdBaoHiemYTe/svBaoHiemYTe/redux';
import { SelectAdapter_DtLopFilter } from 'modules/mdCongTacSinhVien/ctsvDtLop/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdCongTacSinhVien/ctsvDtNganhDaoTao/redux.jsx';
import AddStudentModal from './AddStudentModal';
import UploadDssv from './component/uploadDssvComponent';
import FileBox from 'view/component/FileBox';

const editSection = {
    'all': 'Tất cả',
    'noiTruTamTru': 'Thông tin nội trú tạm trú',
    'lienLac': 'Thông tin liên lạc',
    'nganHang': 'Thông tin ngân hàng',
    'thongTinKhac': 'Thông tin khác'
};

const STATUS_MAPPER = {
    0: <span className='text-warning'><i className='fa fa-plus-square' /> Sắp diễn ra</span>,
    1: <span className='text-success'><i className='fa fa-check' /> Đang diễn ra</span>,
    2: <span className='text-danger'><i className='fa fa-times' /> Hết hạn</span>,
};

export class LoginToTestModal extends AdminModal {
    onSubmit = (e) => {
        e && e.preventDefault();
        const data = {
            email: getValue(this.email),
            pass: getValue(this.password)
        };
        this.props.loginStudentForTest(data);
    }
    render = () => {
        return this.renderModal({
            title: 'Đăng nhập tài khoản Test',
            body: <div className='row'>
                <FormTextBox type='email' ref={e => this.email = e} label='Email test' className='col-md-12' />
                <FormTextBox type='password' ref={e => this.password = e} label='Mật khẩu' className='col-md-12' />
            </div>
        });
    }
}

export class DownloadAnhTheModal extends AdminModal {
    nowYear = new Date().getFullYear();
    state = { isUploadDs: false }
    onShow = () => {
        this.fileBox?.setData('DssvDownloadImage');
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        if (this.state.isUploadDs) {
            if (this.fileBox.getFile()) {
                this.fileBox.onUploadFile({});
            } else {
                T.notify('Chưa upload file', 'danger');
            }
        } else {
            let [nhapHocStart, nhapHocEnd] = this.thoiGianNhapHoc.value();
            const data = {
                khoaSinhVien: getValue(this.khoaSinhVien),
                heDaoTao: getValue(this.heDaoTao),
                tinhTrang: getValue(this.tinhTrang),
                nhapHocStart: nhapHocStart?.getTime(),
                nhapHocEnd: nhapHocEnd?.getTime()
            };
            this.props.downloadImage(data, () => this.hide());
        }
    }

    onSuccess = (data) => {
        if (data) {
            T.notify('Ảnh thẻ sinh viên sẽ được tải xuống sau vài giây', 'success');
            T.download(`/api/ctsv/image-card/tai-anh/check-file?fileName=${data.fileName.toString()}`);
            this.hide();
        }
    }

    render = () => {

        return this.renderModal({
            title: 'Tải xuống ảnh thẻ',
            body: <div className='row'>
                <FormCheckbox label='Tải bằng danh sách excel' ref={e => this.isUploadDs = e} onChange={value => this.setState({ isUploadDs: value ? true : false }, () => this.fileBox?.setData('DssvDownloadImage'))} className='col-md-12' />
                {!this.state.isUploadDs ? <>
                    <FormSelect ref={e => this.khoaSinhVien = e} data={Array.from({ length: this.nowYear - 2017 }, (_, i) => this.nowYear - i)} label='Khóa sinh viên' className='col-md-12' required />
                    <FormSelect ref={e => this.heDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} multiple label='Hệ đào tạo' className='col-md-12' required />
                    <FormSelect ref={e => this.tinhTrang = e} data={SelectAdapter_DmTinhTrangSinhVienV2} label='Tình trạng sinh viên' className='col-md-12' required multiple />
                    <EaseDateRangePicker ref={e => this.thoiGianNhapHoc = e} label='Thời gian nhập học' className='col-md-12' />
                </> : <>
                    <p className='col-md-12'>Thêm file excel danh sách sinh viên. Tải file mẫu tại <a href='#' onClick={e => e.preventDefault() || T.download('/api/ctsv/upload-dssv/search/template')}>đây</a></p>
                    <FileBox pending={true} ref={e => this.fileBox = e} postUrl={'/api/ctsv/image-card/download'} uploadType='DssvDownloadImage' userData='DssvDownloadImage' className='col-md-12'
                        success={this.onSuccess} ajax={true} />
                </>}
            </div>
        });
    }
}

const dsColumn = [
    { id: 'mssv', text: 'mssv' },
    { id: 'hoTen', text: 'Họ tên' },
    { id: 'tenKhoa', text: 'Khoa' },
    { id: 'tenTinhTrang', text: 'Tình trạng' },
    { id: 'gioiTinh', text: 'Giới tính' },
    { id: 'noiSinh', text: 'Nơi sinh' },
    { id: 'ngaySinhText', text: 'Ngày sinh' },
    { id: 'ngayNhapHocText', text: 'Ngày nhập học' },
    { id: 'tenNganh', text: 'Tên ngành' },
    { id: 'maNganh', text: 'Mã ngành' },
    { id: 'heDaoTao', text: 'Hệ đào tạo' },
    { id: 'lop', text: 'Lớp' },
    { id: 'nienKhoa', text: 'Niên khóa' },
    { id: 'khoaSinhVien', text: 'Khóa sinh viên' },
    { id: 'tinhThuongTru', text: 'Tỉnh thường trú' },
    { id: 'huyenThuongTru', text: 'Huyện thường trú' },
    { id: 'xaThuongTru', text: 'Xã thường trú' },
    { id: 'soNhaThuongTru', text: 'Số nhà thường trú' },
    { id: 'sdt', text: 'Số điện thoại cá nhân' },
    { id: 'emailTruong', text: 'Email trường' },
    { id: 'cmnd', text: 'Cmnd' },
    { id: 'soTkNganHang', text: 'Số tài khoản ngân hàng' },
    { id: 'chiNhanhNganHang', text: 'Chi nhánh ngân hàng' }
];

export class ExportByUploadModal extends AdminModal {
    state = { columnSelect: [] }
    onShow = () => {
        const data = dsColumn.map(item => item.id);
        this.setState({ columnSelect: data }, () => {
            this.allColumn.value(1);
            this.columns.value(data);
            this.fileBox.setData('DssvUploadSearch');
        });
    }

    onSuccess = (data) => {
        if (data) {
            T.notify('Danh sách sinh viên sẽ được tải xuống sau vài giây', 'success');
            T.FileSaver(new Blob([new Uint8Array(data.content.data)]), data.fileName);
            this.hide();
        }
    }

    checkAll = (value, ma) => {
        if (value == true) {
            if (ma == 'column') {
                let columns = dsColumn.map(e => e.id);
                this.columns.value(columns);
                this.setState({ columnSelect: columns });
            }
        } else {
            if (ma == 'column') {
                this.columns.value('');
                this.setState({ columnSelect: [] });
            }
        }
    }

    changeColumnSelect = () => {
        const lsColumnSelect = this.columns.value();
        this.setState({ columnSelect: dsColumn.filter(item => lsColumnSelect.includes(item.id.toString()) == true).map(item => item.id) });
    }

    downloadExcel = (e) => {
        e.preventDefault();
        if (this.fileBox.getFile()) {
            this.fileBox.onUploadFile({ columnSelect: this.state.columnSelect });
        }
    }

    onSubmit = (e) => {
        const lsColumnSelect = this.columns.value();
        if (lsColumnSelect.length) {
            this.downloadExcel(e);
        } else {
            T.notify('Vui lòng chọn các trường thông tin cần xuất !', 'danger');
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Download danh sách được upload',
            submitText: 'Tải xuống',
            body: <div className='row'>
                <div className='d-flex justifyBetween col-md-12'>
                    <label>Chọn các trường export</label>
                    <FormCheckbox ref={e => this.allColumn = e} className='col-md-4' label='Chọn tất cả'
                        onChange={(value) => {
                            this.checkAll(value, 'column');
                        }} />
                </div>
                <FormSelect closeOnSelect={false} ref={e => this.columns = e} data={dsColumn} multiple onChange={(value) => this.changeColumnSelect(value)} className='col-md-12' />
                <p className='col-md-12'>Thêm file excel danh sách sinh viên. Tải file mẫu tại <a href='#' onClick={e => e.preventDefault() || T.download('/api/ctsv/upload-dssv/search/template')}>đây</a></p>
                <FileBox pending={true} ref={e => this.fileBox = e} postUrl={'/api/ctsv/dssv-upload/search'} uploadType='DssvUploadSearch' userData='DssvUploadSearch' className='col-md-12'
                    success={this.onSuccess} ajax={true} />
            </div>
        });
    }
}

class DotChinhSuaModal extends AdminModal {
    state = { id: null }
    componentDidMount() {
        this.props.getDmSvLoaiHinhDaoTaoAll(item => this.setState({ lhdt: item }));
    }

    onShow = (item) => {
        const { id, tenDot, timeStart, timeEnd, heDaoTao, khoaSinhVien, sectionEdit } = item ? item : { id: null, tenDot: '', timeStart: '', timeEnd: '', khoaSinhVien: '', heDaoTao: '', sectionEdit: '' };
        this.setState({ id }, () => {
            this.tenDot.value(tenDot);
            this.khoaSinhVien.value(khoaSinhVien != '' ? khoaSinhVien.split(', ') : '');
            this.loaiHinhDaoTao.value(heDaoTao != '' ? heDaoTao.split(', ') : '');
            this.timeStart.value(timeStart != '' ? new Date(timeStart) : '');
            this.timeEnd.value(timeEnd != '' ? new Date(timeEnd) : '');
            this.sectionEdit.value(sectionEdit != '' ? sectionEdit.split(', ') : '');
        });
    }

    onSubmit = () => {
        const dsKhoaSinhVien = getValue(this.khoaSinhVien),
            dsHeDaoTao = getValue(this.loaiHinhDaoTao),
            dsSection = getValue(this.sectionEdit);
        const changes = {
            tenDot: getValue(this.tenDot),
            khoaSinhVien: dsKhoaSinhVien.join(', '),
            heDaoTao: dsHeDaoTao.join(', '),
            sectionEdit: dsSection.join(', '),
            timeStart: Number(getValue(this.timeStart)),
            timeEnd: Number(getValue(this.timeEnd))
        };
        if (this.state.id) {
            T.confirm('Cập nhật mới', 'Bạn có chắc muốn cập nhật đợt chỉnh sửa', isConfirm => isConfirm && this.props.updateStudentDotChinhSuaPage(this.state.id, changes, () => this.hide()));
        } else {
            T.confirm('Tạo mới', 'Bạn có chắc muốn tạo mới đợt chỉnh sửa', isConfirm => isConfirm && this.props.createStudentDotChinhSuaPage(changes, () => this.hide()));
        }
    }

    checkAll = (value) => {
        if (value == true) {
            let lhdt = this.state.lhdt.map(e => e.ma);
            this.loaiHinhDaoTao.value(lhdt);
        } else {
            this.loaiHinhDaoTao.value(null);
        }
    }

    changeSectionEdit = (value) => {
        const sectionEdit = getValue(this.secTionEdit);
        if (value.id == 'all' || sectionEdit.includes('all')) {
            this.secTionEdit.value(['all']);
        }
    }

    changeTimeStart = () => {
        const timeEnd = this.timeEnd.value() != '' ? Number(this.timeEnd.value()) : '',
            timeStart = Number(this.timeStart.value());
        if (timeEnd != '' && (timeStart >= timeEnd)) {
            T.notify('Thời gian bắt đầu phải sớm hơn thời gian kết thúc');
            this.timeStart.value('');
        }
    }

    changeTimeEnd = () => {
        const timeEnd = Number(this.timeEnd.value()),
            timeStart = this.timeStart.value() != '' ? Number(this.timeStart.value()) : '';
        if (timeStart != '' && (timeEnd <= timeStart)) {
            T.notify('Thời gian kết thúc phải sau thời gian bắt đầu');
            this.timeEnd.value('');
        }
    }

    render = () => {
        const { id } = this.state;
        return this.renderModal({
            title: id ? 'Cập nhật đợt chỉnh sửa thông tin của sinh viên' : 'Tạo mới đợt chỉnh sửa thông tin của sinh viên ',
            size: 'large',
            body: <div className='row'>
                <FormTextBox ref={e => this.tenDot = e} label='Tên đợt' className='col-md-6' required />
                <FormSelect ref={e => this.khoaSinhVien = e} className='col-md-6' closeOnSelect={false} data={SelectAdapter_DtKhoaDaoTao} multiple label='Khóa sinh viên' required />
                <div className='col-md-4' > <label>Hệ đào tạo <span className='text-danger'>*</span></label> </div>
                <FormCheckbox ref={e => this.allLHDT = e} className='col-md-8' label='Chọn tất cả'
                    onChange={(value) => {
                        this.checkAll(value);
                    }} />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} placeholder='Hệ đào tạo' className='col-md-12' data={SelectAdapter_DmSvLoaiHinhDaoTao} multiple required />
                <FormDatePicker type='time' ref={e => this.timeStart = e} className='col-md-6' label='Thời gian bắt đầu' required onChange={value => this.changeTimeStart(value)} />
                <FormDatePicker type='time' ref={e => this.timeEnd = e} className='col-md-6' label='Thời gian kết thúc' required onChange={value => this.changeTimeEnd(value)} />
                <FormSelect ref={e => this.sectionEdit = e} className='col-md-12' label='Các loại cho phép chỉnh sửa' multiple required data={Object.keys(editSection).map(item => ({ id: item, text: editSection[item] }))} onChange={value => this.changeSectionEdit(value)} />
            </div>
        });
    }
}

class AdminStudentsPage extends AdminPage {
    defaultSortTerm = 'ten_ASC'
    state = { filter: {}, sortTerm: 'ten_ASC', selected: [], filterDotChinhSua: {} };
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            T.clearSearchBox();
            T.onSearch = this.onSearchBar;
            T.showSearchBox(() => this.changeAdvancedSearch());
            this.changeAdvancedSearch();
            this.props.getStudentDotChinhSuaPage(undefined, undefined, '', this.state.filterDotChinhSua);
        });
    }

    onSearchBar = (searchText) => {
        this.getStudentsPage(undefined, undefined, searchText || '', page => {
            const { list } = page || {};
            if (list && list.length == 1) {
                const studentDetailView = this.generateComponentStudentDetail(list[0]);
                this.setState({ studentDetailView });
            } else {
                this.setState({ studentDetailView: null });
            }
        });
    }

    changeAdvancedSearch = (isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props.sinhVien && this.props.sinhVien.page ? this.props.sinhVien.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
        this.getStudentsPage(pageNumber, pageSize, pageCondition, page => page && this.hideAdvanceSearch());
        const filter = T.updatePage('pageStudentsAdmin').filter;
        Object.keys(this).forEach(key => {
            if (filter[key]) {
                if (['toNhapHoc', 'fromNhapHoc'].includes(key)) this[key].value(filter[key]);
                else this[key].value(filter[key].toString().split(','));
            }

        });
        if (isReset) {
            Object.keys(this).forEach(key => {
                if (this[key].value && this[key].value()) this[key].value('');
            });
        }
    }

    getStudentsPage = (pageNumber, pageSize, pageCondition, done) => {
        this.setState({ selected: [] }, () => {
            this.selecteAll.value(0);
            this.props.getStudentsPage(pageNumber, pageSize, pageCondition, this.state.filter, this.state?.sortTerm || this.defaultSortTerm, done);
        });
    };

    // delete = (item) => {
    //     T.confirm('Xóa sinh viên', 'Xóa sinh viên này?', 'warning', true, isConfirm => {
    //         isConfirm && this.props.deleteSinhVienAdmin(item.mssv, false, null, error => {
    //             if (error) T.notify(error.message ? error.message : 'Xoá sinh viên lỗi!', 'danger');
    //             else T.alert('Xoá sinh viên thành công!', 'success', false, 800);
    //         });
    //     });
    // }

    createStudent = (data, done) => {
        this.props.addStudentAdmin(data, () => {
            done && done();
            this.props.history.push({ pathname: `/user/ctsv/profile/${data.mssv}` });
        });
    }

    downloadExcel = (e) => {
        e.preventDefault();
        T.customConfirm('Bạn muốn có muốn liên kết dữ liệu với hệ thống PSC?', '', 'warning', false, {
            disagree: 'Không đồng ý',
            agree: 'Đồng ý',
        }, reply => {
            if (reply) {
                let url = `/api/ctsv/download-excel?filter=${T.stringify(this.state.filter)}`;
                if (reply == 'agree') {
                    url += '&usePsc=1';
                }
                T.handleDownload(url, 'STUDENTS_DATA.xlsx');
            }
        });
    }

    downloadImage = (changes, done) => {
        this.props.downloadImage(changes, (data) => {
            T.notify('Ảnh thẻ sinh viên sẽ được tải xuống sau vài giây', 'success');
            T.download(`/api/ctsv/image-card/tai-anh/check-file?fileName=${data.fileName.toString()}`);
            done && done();
        });
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getStudentsPage(pageNumber, pageSize, pageCondition);
        });
    }

    handleCheck = (mssv, value) => {
        const selected = this.state.selected;
        if (value) {
            selected.push(mssv);
        } else {
            const idx = selected.indexOf(mssv);
            selected.splice(idx, 1);
            this.selecteAll.value(0);
        }
        this.setState({ selected });
    }

    deleteDotChinhSua = (id) => {
        T.confirm('Xóa đợt chỉnh sửa', 'Bạn có chắc muốn xóa đợt chỉnh sửa này không', isConfirm => {
            if (isConfirm) {
                this.props.deleteStudentDotChinhSuaPage(id);
            }
        });
    }

    componentDotChinhSua = () => {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sinhVien && this.props.sinhVien.dotChinhSuaPage ?
            this.props.sinhVien.dotChinhSuaPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };
        const now = Number(new Date().getTime());
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
                    <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Tên đợt</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Khóa sinh viên</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Hệ đào tạo</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Mục cho phép</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Ngày bắt đầu</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Ngày hết hạn</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={item.tenDot || ''} />
                    <TableCell content={item.khoaSinhVien || ''} />
                    <TableCell content={item.heDaoTao || ''} />
                    <TableCell content={item.sectionEdit ? item.sectionEdit.split(', ').map(item => (<p className='mb-0' key={item}>- {editSection[item]}</p>)) : ''} />
                    <TableCell type='date' content={item.timeStart || ''} dateFormat='dd/mm/yyyy HH:MM:ss' />
                    <TableCell type='date' content={item.timeEnd || ''} dateFormat='dd/mm/yyyy HH:MM:ss' />
                    <TableCell content={item.canBo || ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={(now < Number(item.timeStart) ? STATUS_MAPPER[0] : (now > Number(item.timeEnd) ? STATUS_MAPPER[2] : STATUS_MAPPER[1]))} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='buttons' onEdit={() => this.dotChinhSuaModal.show(item)} onDelete={() => this.deleteDotChinhSua(item.id)} permission={{ write: true, delete: true }} />
                </tr>
            )
        });
        return (
            <div className='tile'>
                <div className='mb-2' style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center' }}>
                    <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                        getPage={this.props.getStudentDotChinhSuaPage} pageRange={5} />
                    <button className='btn btn-primary' type='button' onClick={() => this.dotChinhSuaModal.show()}>
                        Thêm đợt
                    </button>
                </div>
                {table}
            </div>
        );
    }

    generateComponentStudentDetail = (student) => {
        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin cơ bản</h3>
                <div className='tile-body'>
                    <div className='row'>
                        <div className='form-group col-md-12'>
                            <div className='row'>
                                <FormTextBox label='Họ và tên' className='form-group col-md-4' value={`${student.ho} ${student.ten} `} readOnly={true} />
                                <FormTextBox label='MSSV' className='form-group col-md-4' value={student.mssv} readOnly={true} />
                                <FormTextBox label='Giới tính' className='form-group col-md-4' value={student.gioiTinh ? (student.gioiTinh == 1 ? 'Nam' : 'Nữ') : ''} readOnly={true} />
                                <FormTextBox label='Email' className='form-group col-md-4' value={student.emailTruong} readOnly={true} />
                                <FormTextBox label='Số điện thoại' className='form-group col-md-4' value={student.dienThoaiCaNhan} readOnly={true} />
                                <FormTextBox label='Tình trạng sinh viên' className='form-group col-md-4' value={student.tinhTrangSinhVien} readOnly={true} />
                                <FormTextBox label='Khoa' className='form-group col-md-4' value={student.tenKhoa} readOnly={true} />
                                <FormTextBox label='Ngành' className='form-group col-md-4' value={student.tenNganh} readOnly={true} />
                                <FormTextBox label='Lớp SV' className='form-group col-md-4' value={student.lop} readOnly={true} />
                                <FormTextBox label='Quốc tịch' className='form-group col-md-4' value={student.noiSinhQuocGia} readOnly={true} />
                                <FormTextBox label='Dân tộc' className='form-group col-md-4' value={student.danToc} readOnly={true} />
                                <FormTextBox label='Tôn giáo' className='form-group col-md-4' value={student.tonGiao} readOnly={true} />
                                <FormTextBox label='Tỉnh/thành thường trú' className='form-group col-md-4' value={student.tinhThuongTru} readOnly={true} />
                                <FormTextBox label='Loại hình đào tạo' className='form-group col-md-4' value={student.tenLoaiHinhDaoTao} readOnly={true} />
                                <FormTextBox label='Khoá SV' className='form-group col-md-4' value={student.namTuyenSinh} readOnly={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }



    componentStudentPage = () => {
        let permission = this.getUserPermission('student', ['read', 'write', 'export']);
        let developer = this.getUserPermission('developer', ['login']);
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
                    <th><FormCheckbox ref={e => this.selecteAll = e} content={this.state.selected.length ? 0 : 1} onChange={value => {
                        if (value) {
                            let { list } = (this.props.sinhVien && this.props.sinhVien.page ? this.props.sinhVien.page : []);
                            list = list.map(item => item.mssv);
                            this.setState({ selected: list });
                        } else {
                            this.setState({ selected: [] });
                        }

                    }} style={{ marginBottom: '0' }} /></th>
                    <TableHead style={{ minWidth: '125px' }} content='MSSV' keyCol='mssv' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ minWidth: '125px' }} content='Họ và tên lót' keyCol='ho' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ minWidth: '100px' }} content='Tên' keyCol='ten' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ minWidth: '120px' }} content='Giới tính' keyCol='gioiTinh' onKeySearch={this.handleKeySearch} typeSearch='select' data={[{ id: 1, text: 'Nam' }, { id: 2, text: 'Nữ' }]} />
                    <TableHead style={{ minWidth: '75px' }} content='Ngày sinh' keyCol='ngaySinh' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} onKeySearch={this.handleKeySearch} typeSearch='date' />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Nơi sinh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã ngành</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tên ngành</th>
                    <TableHead style={{ minWidth: '100px' }} content='Năm tuyển sinh' keyCol='namTuyenSinh' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} />
                    <TableHead style={{ minWidth: '100px' }} content='Khoá sinh viên' keyCol='khoaSinhVien' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Lớp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Email cá nhân</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Email sinh viên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SĐT cá nhân</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Dân tộc</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tôn giáo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Quốc tịch</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thường trú</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tạm trú</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Họ tên liên lạc</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Địa chỉ liên lạc</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SĐT liên lạc</th>
                    <TableHead style={{ minWidth: '100px' }} content='Ngày nhập học' keyCol='ngayNhapHoc' onSort={sortTerm => this.setState({ sortTerm }, () => this.getStudentsPage(pageNumber, pageSize, pageCondition))} />
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tình trạng</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Cập nhật lần cuối</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='checkbox' isCheck content={this.state.selected.some(mssv => mssv == item.mssv)} onChanged={value => { this.handleCheck(item.mssv, value); }} permission={permission} />
                    <TableCell type='link' url={`/user/ctsv/profile/${item.mssv}`} style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.gioiTinh ? (item.gioiTinh == 1 ? 'Nam' : 'Nữ') : ''} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngaySinh} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.noiSinhQuocGia ? (item.noiSinhQuocGia + (item.noiSinh ? `, ${item.noiSinh}` : '')) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maNganh || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namTuyenSinh || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.khoaSinhVien || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiHinhDaoTao || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lop || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.emailCaNhan || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.emailTruong || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.dienThoaiCaNhan || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.danToc || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tonGiao || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.quocTich || ''} />
                    <TableCell type='text' contentClassName='multiple-lines-5' content={(item.soNhaThuongTru ? item.soNhaThuongTru + ', ' : '')
                        + (item.xaThuongTru ? item.xaThuongTru + ', ' : '')
                        + (item.huyenThuongTru ? item.huyenThuongTru + ', ' : '')
                        + (item.tinhThuongTru ? item.tinhThuongTru : '')} />
                    <TableCell type='text' contentClassName='multiple-lines-5' content={(item.soNhaTamTru ? item.soNhaTamTru + ', ' : '')
                        + (item.xaTamTru ? item.xaTamTru + ', ' : '')
                        + (item.huyenTamTru ? item.huyenTamTru + ', ' : '')
                        + (item.tinhTamTru ? item.tinhTamTru : '')} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hoTenNguoiLienLac || ''} />
                    <TableCell type='text' contentClassName='multiple-lines-5' content={(item.soNhaLienLac ? item.soNhaLienLac + ', ' : '')
                        + (item.xaLienLac ? item.xaLienLac + ', ' : '')
                        + (item.huyenLienLac ? item.huyenLienLac + ', ' : '')
                        + (item.tinhLienLac ? item.tinhLienLac : '')} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.sdtNguoiLienLac || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayNhapHoc ? (item.ngayNhapHoc == -1 ? 'Đang chờ nhập học'
                        : (item.ngayNhapHoc.toString().length > 10 ? T.dateToText(new Date(item.ngayNhapHoc), 'dd/mm/yyyy') : '')) : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tinhTrangSinhVien || ''} />
                    <TableCell type='date' style={{ whiteSpace: 'nowrap' }} content={item.lastModified || ''} dateFormat='dd/mm/yyyy HH:MM:ss' />
                    <TableCell type='buttons' style={{ textAlign: 'right' }} content={item} permission={permission}
                        onDelete={this.delete}>
                        <Tooltip title='Tải SYLL'>
                            <button style={{ display: parseInt(item.namTuyenSinh) >= new Date().getFullYear() ? '' : 'none' }} className='btn btn-warning' type='button' onClick={e => e.preventDefault() ||
                                this.props.adminDownloadSyll(item.mssv, item.namTuyenSinh)
                            }>
                                <i className='fa fa-lg fa-arrow-down' />
                            </button>
                        </Tooltip>
                        <Tooltip title={item.canEdit ? 'Khoá edit' : 'Cho phép edit'}>
                            <button className={item.canEdit ? 'btn btn-secondary' : 'btn btn-success'} type='button' onClick={e => e.preventDefault() ||
                                this.props.updateStudentAdmin(item.mssv, { canEdit: Number(!item.canEdit) })
                            }>
                                <i className={item.canEdit ? 'fa fa-lg fa-times' : 'fa fa-lg fa-check'} />
                            </button>
                        </Tooltip>
                        {developer.login && <Tooltip title='BHYT'>
                            <button className='btn btn-secondary' type='button' onClick={e => {
                                e.preventDefault();
                                this.props.getMssvBaoHiemYTe({ mssv: item.mssv }, (bhyt) => {
                                    if (!bhyt) return T.notify('Sinh viên chưa đăng ký bảo hiểm y tế');
                                    this.bhytModal.initBhyt(bhyt.dienDong);
                                    this.bhytModal.show(item.mssv);
                                });
                            }}>
                                <i className='fa fa-lg fa-cog' />
                            </button>
                        </Tooltip>}
                    </TableCell>
                </tr>
            )
        });
        return (
            <div className='tile'>
                {this.state.studentDetailView}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex' }}>
                        <FormCheckbox label='Thao tác nhanh' onChange={value => this.setState({ quickAction: value })} style={{ marginBottom: '0' }} />
                        <div className='btn-group ml-3' role='group'>
                            <button id='thao-tac-nhieu' className='btn btn-warning btn-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>Thao tác nhiều</button>
                            <div className='dropdown-menu' aria-labelledby='thao-tac-nhieu'>
                                <button className='dropdown-item text-white bg-success  mb-0' onClick={e => {
                                    e.preventDefault();
                                    T.confirm('Cho quyền chỉnh sửa', 'Bạn có chắc muốn trao quyền chỉnh sửa cho các sinh viên được chọn?', confirmed => confirmed && this.props.massUpdateStudentAdmin(this.state.selected, { canEdit: 1 }));
                                }}>Cho quyền chỉnh sửa</button>
                                <button className='dropdown-item text-white bg-secondary mb-0' onClick={e => {
                                    e.preventDefault();
                                    T.confirm('Hủy quyền chỉnh sửa', 'Bạn có chắc muốn hủy quyền chỉnh sửa các sinh viên được chọn?', confirmed => confirmed && this.props.massUpdateStudentAdmin(this.state.selected, { canEdit: 0 }));
                                }}>Khóa quyền chỉnh sửa</button>
                            </div>

                        </div>
                    </div>
                    <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                        getPage={this.getStudentsPage} pageRange={3} />
                </div>
                {table}
            </div>
        );
    }

    render() {
        let permission = this.getUserPermission('student', ['read', 'write', 'export']);
        let developer = this.getUserPermission('developer', ['login']);
        return this.renderPage({
            title: 'Danh sách sinh viên',
            icon: 'fa fa-users',
            breadcrumb: [<Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Danh sách sinh viên'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect multiple ref={e => this.listFaculty = e} data={SelectAdapter_DmDonViFaculty_V2} label='Khoa' className='col-md-4' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListFaculty = currentFilter.listFaculty?.split(',') || [];
                        if (value.selected) {
                            currentListFaculty.push(value.id);
                        } else currentListFaculty = currentListFaculty.filter(item => item != value.id);
                        this.setState({ filter: { ...currentFilter, listFaculty: currentListFaculty.toString() } });
                    }} />
                    <FormSelect multiple ref={e => this.listNganh = e} data={SelectAdapter_DtNganhDaoTao} label='Ngành' className='col-md-4' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListNganh = currentFilter.listNganh?.split(',') || [];
                        if (value.selected) {
                            currentListNganh.push(value.id);
                        } else currentListNganh = currentListNganh.filter(item => item != value.id);
                        this.setState({ filter: { ...currentFilter, listNganh: currentListNganh.toString() } });
                    }} />
                    {/* <FormSelect multiple ref={e => this.listLoaiSinhVien = e} data={SelectAdapter_DmLoaiSinhVienV2} label='loại SV' className='col-md-4' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListLoaiSinhVien = currentFilter.listLoaiSinhVien?.split(',') || [];
                        if (value.selected) {
                            currentListLoaiSinhVien.push(value.id);
                        } else currentListLoaiSinhVien = currentListLoaiSinhVien.filter(item => item != value.id);
                        this.setState({ filter: { ...currentFilter, listLoaiSinhVien: currentListLoaiSinhVien.toString() } });
                    }} /> */}
                    <FormSelect multiple ref={e => this.listTinhTrangSinhVien = e} data={SelectAdapter_DmTinhTrangSinhVienV2} label='Tình trạng SV' closeOnSelect={false} className='col-md-4' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListTinhTrangSinhVien = currentFilter.listTinhTrangSinhVien?.split(',') || [];
                        if (value.selected) {
                            currentListTinhTrangSinhVien.push(value.id);
                        } else currentListTinhTrangSinhVien = currentListTinhTrangSinhVien.filter(item => item != value.id);
                        this.setState({ filter: { ...currentFilter, listTinhTrangSinhVien: currentListTinhTrangSinhVien.toString() } });
                    }} />
                    <FormSelect ref={e => this.gender = e} data={SelectAdapter_DmGioiTinhV2} label='Giới tính' className='col-md-4' allowClear onChange={value => {
                        if (value) {
                            this.setState({ filter: { ...this.state.filter, gender: value.id } });
                        } else this.setState({ filter: { ...this.state.filter, gender: null } });
                    }} />
                    <FormSelect multiple ref={e => this.listNationality = e} data={SelectAdapter_DmQuocGia} label='Quốc tịch' className='col-md-4' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListNationality = currentFilter.listNationality?.split(',') || [];
                        if (value.selected) {
                            currentListNationality.push(value.id);
                        } else currentListNationality = currentListNationality.filter(item => item != value.id);
                        this.setState({
                            filter: { ...currentFilter, listNationality: currentListNationality.toString() }
                        });
                    }} />
                    <FormSelect multiple ref={e => this.listEthnic = e} data={SelectAdapter_DmDanTocV2} label='Dân tộc' className='col-md-4' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListEthnic = currentFilter.listEthnic?.split(',') || [];
                        if (value.selected) {
                            currentListEthnic.push(value.id);
                        } else currentListEthnic = currentListEthnic.filter(item => item != value.id);
                        this.setState({
                            filter: { ...currentFilter, listEthnic: currentListEthnic.toString() }
                        });
                    }} />
                    <FormSelect multiple ref={e => this.listReligion = e} data={SelectAdapter_DmTonGiaoV2} label='Tôn giáo' className='col-md-4' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListReligion = currentFilter.listReligion?.split(',') || [];
                        if (value.selected) {
                            currentListReligion.push(value.id);
                        } else currentListReligion = currentListReligion.filter(item => item != value.id);
                        this.setState({
                            filter: { ...currentFilter, listReligion: currentListReligion.toString() }
                        });
                    }} />
                    <FormSelect multiple ref={e => this.listFromCity = e} data={ajaxSelectTinhThanhPho} label='Tỉnh/thành thường trú' className='col-md-4' allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListFromCity = currentFilter.listFromCity?.split(',') || [];
                        if (value.selected) {
                            currentListFromCity.push(value.id);
                        } else currentListFromCity = currentListFromCity.filter(item => item != value.id);
                        this.setState({
                            filter: { ...currentFilter, listFromCity: currentListFromCity.toString() }
                        });
                    }} />
                    <FormSelect multiple ref={e => this.listLoaiHinhDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Loại hình đào tạo' className='col-md-4' allowClear closeOnSelect={false} onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListLoaiHinhDaoTao = currentFilter.listLoaiHinhDaoTao?.split(',') || [];
                        if (value.selected) {
                            currentListLoaiHinhDaoTao.push(value.id);
                        } else currentListLoaiHinhDaoTao = currentListLoaiHinhDaoTao.filter(item => item != value.id);
                        this.setState({
                            filter: { ...currentFilter, listLoaiHinhDaoTao: currentListLoaiHinhDaoTao.toString() }
                        }, () => this.listLop.value(null));
                    }} />

                    <FormSelect multiple ref={e => this.listKhoaSinhVien = e} data={[2023, 2022, 2021, 2020, 2019, 2018]} label='Khoá SV' className='col-md-4' closeOnSelect={false} allowClear onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            current = currentFilter.listKhoaSinhVien?.split(',') || [];
                        if (value.selected) {
                            current.push(value.id);
                        } else current = current.filter(item => item != value.id);
                        this.setState({
                            filter: { ...currentFilter, listKhoaSinhVien: current.toString() }
                        }, () => this.listLop.value(null));
                    }} />
                    <FormSelect multiple ref={e => this.listLop = e} data={SelectAdapter_DtLopFilter(this.state.filter.listLoaiHinhDaoTao, this.state.filter.listKhoaSinhVien)} label='Lớp sinh viên' className='col-md-4' allowClear closeOnSelect={false} onChange={value => {
                        let currentFilter = Object.assign({}, this.state.filter),
                            currentListLop = currentFilter.listLop?.split(',') || [];
                        if (value.selected) {
                            currentListLop.push(value.id);
                        } else currentListLop = currentListLop.filter(item => item != value.id);
                        this.setState({
                            filter: { ...currentFilter, listLop: currentListLop.toString() }
                        });
                    }} />
                    <FormCheckbox className='col-md-4' label='Chỉ hiện SV chờ nhập học' onChange={() => this.setState(prevState => ({ filter: { ...prevState.filter, choNhapHoc: prevState.filter.choNhapHoc ? 0 : 1 } }))} />
                    <FormDatePicker type='date-mask' ref={e => this.fromNhapHoc = e} label='Ngày nhập học (từ)' onChange={fromNhapHoc => {
                        if (fromNhapHoc && !isNaN(fromNhapHoc.getTime())) this.setState({
                            filter: { ...this.state.filter, fromNhapHoc: fromNhapHoc.setHours(0, 0, 0, 0) }
                        }); else this.setState({
                            filter: { ...this.state.filter, fromNhapHoc: '' }
                        });
                    }} className='col-md-4' />
                    <FormDatePicker type='date-mask' ref={e => this.toNhapHoc = e} label='Ngày nhập học (đến)' className='col-md-4' onChange={toNhapHoc => {
                        if (toNhapHoc && !isNaN(toNhapHoc.getTime())) this.setState({
                            filter: { ...this.state.filter, toNhapHoc: toNhapHoc.setHours(23, 59, 59, 99) }
                        }); else this.setState({
                            filter: { ...this.state.filter, toNhapHoc: '' }
                        });
                    }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                    <button className='btn btn-secondary' onClick={e => e.preventDefault() || this.setState({ filter: {} }, () => this.changeAdvancedSearch(true))} style={{ marginRight: '15px' }}>
                        <i className='fa fa-lg fa-times' />Reset
                    </button>
                    <button className='btn btn-info' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
                        <i className='fa fa-lg fa-search-plus' />Tìm kiếm
                    </button>
                </div>
            </>,
            content: <>
                <FormTabs
                    tabs={[
                        { title: 'Quản lý sinh viên', component: this.componentStudentPage() },
                        { title: 'Quản lý đợt chỉnh sửa', component: this.componentDotChinhSua() },
                        {
                            title: 'Upload sinh viên', component: <>
                                <UploadDssv multiAddDssvAdmin={this.props.multiAddDssvAdmin} />
                            </>
                        }
                    ]}
                />
                <DotChinhSuaModal ref={e => this.dotChinhSuaModal = e} getDmSvLoaiHinhDaoTaoAll={this.props.getDmSvLoaiHinhDaoTaoAll} createStudentDotChinhSuaPage={this.props.createStudentDotChinhSuaPage} updateStudentDotChinhSuaPage={this.props.updateStudentDotChinhSuaPage} />
                <AddStudentModal ref={e => this.addModal = e} create={this.createStudent} />
                <ExportByUploadModal ref={e => this.exportByUploadModal = e} />
                <DownloadAnhTheModal ref={e => this.downloadAnhTheModal = e} downloadImage={this.downloadImage} />

                {/* <AdminBhytModal ref={e => this.bhytModal = e} createSvBaoHiemYTe={this.props.createMssvBaoHiemYTe} /> */}
                {/* <LoginToTestModal ref={e => this.loginModal = e} loginStudentForTest={this.props.loginStudentForTest} /> */}
            </>
            ,
            backRoute: '/user/ctsv',
            collapse: [
                { icon: 'fa-plus', name: 'Thêm', permission: permission.export, onClick: () => this.addModal.show(), type: 'success' },
                { icon: 'fa-print', name: 'Export', permission: permission.export, onClick: this.downloadExcel, type: 'warning' },
                { icon: 'fa-print', name: 'Export by upload', permission: permission.export, onClick: () => this.exportByUploadModal.show(), type: 'primary' },
                { icon: 'fa-upload', name: 'Import', permission: developer.login, onClick: () => this.props.history.push('/user/ctsv/import'), type: 'danger' },
                { icon: 'fa-picture-o', name: 'Tải ảnh thẻ', permission: permission.export, onClick: () => this.downloadAnhTheModal.show(), type: 'info' }
            ]
        });
    }
}
const mapStateToProps = state => ({ system: state.system, sinhVien: state.ctsv.dataSinhVien });
const mapActionsToProps = {
    getStudentsPage, adminDownloadSyll, updateStudentAdmin, getMssvBaoHiemYTe, createMssvBaoHiemYTe, massUpdateStudentAdmin, getDmSvLoaiHinhDaoTaoAll,
    getStudentDotChinhSuaPage, createStudentDotChinhSuaPage, updateStudentDotChinhSuaPage, deleteStudentDotChinhSuaPage,
    addStudentAdmin, multiAddDssvAdmin, downloadImage
};
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentsPage);