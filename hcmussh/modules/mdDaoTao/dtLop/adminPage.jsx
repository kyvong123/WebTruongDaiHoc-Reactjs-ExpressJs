import Pagination from 'view/component/Pagination';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, renderTable, TableCell, FormTextBox, getValue, FormSelect, FormCheckbox, FormTabs, TableHead, renderDataTable } from 'view/component/AdminPage';
import { getDtLopPage, createDtLop, deleteDtLop, updateDtLop, getDtLopCtdt, SelectAdapter_KhungDaoTaoCtsv } from './redux';
import { Tooltip } from '@mui/material';
import { SelectAdapter_DtNganhDaoTaoStudent } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtDsChuyenNganhTheoLop } from 'modules/mdDaoTao/dtLop/redux';
// import MultipleCreateModal from './multipleCreateModal';

class EditModal extends AdminModal {
    componentDidMount() {
        this.tab?.tabClick(null, 0);
        $(document).ready(() =>
            this.onShown(() => {
                !this.ma.value() ? this.ma.focus() : this.ten.focus();
            })
        );
    }

    onShow = (item) => {
        this.tab?.tabClick(null, 0);
        let { filter } = this.props;
        let { ma, ten, nienKhoa, maNganh, heDaoTao, kichHoat, khoaSinhVien, namHocBatDau, maCtdt } = item ? item : { ma: '', ten: '', nienKhoa: '', maNganh: '', heDaoTao: filter.heDaoTao, khoaSinhVien: filter.khoaSinhVien, namHocBatDau: '', maCtdt: '' };
        this.setState({ ma, item, heDaoTao, khoaSinhVien }, () => {
            this.ctdt.value(maCtdt || '');
            this.ma.value(ma);
            this.ten.value(ten || '');
            this.nienKhoa.value(nienKhoa || '');
            this.maNganh.value(maNganh || '');
            this.heDaoTao.value(heDaoTao || '');
            this.khoaSinhVien.value(khoaSinhVien || '');
            this.namHocBatDau.value(namHocBatDau || '');
            this.kichHoat.value(kichHoat ? 1 : 0);
        });
        if (ma !== '') {
            let filter = { khoaSinhVien, heDaoTao, maLop: ma };
            this.props.getPage(undefined, undefined, '', filter, (data) => {
                this.setState({ dssv: data.dsSv });
            });

            let filterCtdt = { khoaSinhVien, nganh: maNganh, loaiHinhDaoTao: heDaoTao, maCtdt };
            this.props.getCtdt(filterCtdt, dsCtdt => {
                this.setState({ dsCtdt });
            });
        }
    };

    onSubmit = (e) => {
        const changes = {
            maLop: getValue(this.ma),
            tenLop: getValue(this.ten),
            nienKhoa: getValue(this.nienKhoa),
            khoaSinhVien: getValue(this.khoaSinhVien),
            namHocBatDau: getValue(this.namHocBatDau),
            maNganh: getValue(this.maNganh),
            heDaoTao: getValue(this.heDaoTao),
            maCtdt: getValue(this.ctdt),
            kichHoat: this.kichHoat.value() ? 1 : 0,
            loaiLop: 'N',
        };
        if (this.state.ma) {
            if (changes.kichHoat == 0 && this.state.item.kichHoat == 1) {
                T.confirm('Tắt kích hoạt lớp này', 'Bạn có chắc tắt kích hoạt lớp này? Tất cả các sinh viên thuộc lớp này sẽ bị đẩy ra khỏi lớp', 'warning', true, (isConfirm) => isConfirm && this.props.update(this.state.ma, changes, this.hide));
            } else {
                this.props.update(this.state.ma, changes, this.hide);
            }
        } else {
            this.props.create(changes, this.hide);
        }
        e.preventDefault();
    };

    changeKichHoat = (value) => this.kichHoat.value(Number(value));

    changeNganh = (value) => {
        this.ma.value(value.maLop);
        this.ma.focus();
    }

    changeKhoaSinhVien = () => {
        this.setState({ khoaSinhVien: getValue(this.khoaSinhVien) }, () => {
            this.ctdt.value(null);
        });
    }

    copyMaLop = (e) => {
        e.preventDefault();
        const ma = this.ma.value();
        this.ten.value(ma);
    }

    render = () => {
        const { khoaSinhVien, heDaoTao, ma } = this.state;
        const readOnly = this.props.readOnly;
        let lop =
            <div className='row'>
                <FormSelect ref={(e) => (this.maNganh = e)} label='Chọn ngành' data={SelectAdapter_DtNganhDaoTaoStudent} className='col-md-12' readOnly={this.state.ma ? true : readOnly} onChange={this.changeNganh} required />
                <FormSelect ref={(e) => (this.heDaoTao = e)} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Hệ đào tạo' className='col-md-6' readOnly={this.state.ma ? true : readOnly} required onChange={value => { this.setState({ heDaoTao: value.id }); this.ctdt.value(null); }} />
                <FormTextBox type='text' ref={(e) => (this.khoaSinhVien = e)} onBlur={this.changeKhoaSinhVien} label='Khóa sinh viên' className='col-md-6' readOnly={this.state.ma ? true : readOnly} required />
                <FormSelect ref={(e) => (this.ctdt = e)} data={(khoaSinhVien !== '') ? SelectAdapter_KhungDaoTaoCtsv(heDaoTao, khoaSinhVien) : []} label='Chương trình đào tạo' className='col-md-12' readOnly={readOnly} required />
                <FormTextBox type='scholastic' className='col-md-6' ref={(e) => (this.nienKhoa = e)} label='Niên khóa' readOnly={readOnly} required />
                <FormTextBox type='scholastic' className='col-md-6' ref={(e) => (this.namHocBatDau = e)} label='Năm học bắt đầu' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={(e) => (this.ma = e)} label='Mã lớp' readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={(e) => (this.ten = e)} label={<span>Tên lớp {!readOnly && <a href='#' onClick={this.copyMaLop}>(Giống mã lớp)</a>}</span>} placeholder='Tên lớp' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={(e) => (this.kichHoat = e)} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={(value) => this.changeKichHoat(value ? 1 : 0)} />
            </div>,
            tableSv = renderTable({
                getDataSource: () => this.state.dssv,
                header: 'thead-light',
                emptyTable: 'Không có sinh viên',
                stickyHead: this.state.dssv?.length > 12,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap' }}>MSSV</th>
                        <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index} style={{ backgroundColor: 'white' }}>
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                        <TableCell type='text' content={item.mssv} />
                        <TableCell type='text' content={`${item.ho} ${item.ten}`} />
                    </tr>
                ),
            }),
            tableCtdt = renderTable({
                getDataSource: () => this.state.dsCtdt,
                header: 'thead-light',
                emptyTable: 'Không có môn trong chương trình đào tạo',
                stickyHead: this.state.dsCtdt?.length > 12,
                renderHead: () => (
                    <>
                        <tr>
                            <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle' }}>#</th>
                            <th rowSpan='2' style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Mã môn học</th>
                            <th rowSpan='2' style={{ width: '70%', textAlign: 'center', verticalAlign: 'middle' }}>Tên môn học</th>
                            <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle', textAlign: 'center' }}>Tín chỉ</th>
                            <th rowSpan='1' colSpan='3' style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center' }}>Số tiết</th>
                            <th rowSpan='2' style={{ width: '10%', whiteSpace: 'nowrap', verticalAlign: 'middle', textAlign: 'center' }}>Học kỳ dự kiến</th>
                            <th rowSpan='2' style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Năm học dự kiến</th>
                        </tr>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>LH</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>TH</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>Tổng</th>
                        </tr>
                    </>
                ),
                renderRow: (item, index) => (
                    <tr key={index} style={{ backgroundColor: 'white' }}>
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.maMonHoc} />
                        <TableCell style={{ textAlign: 'left' }} content={T.parse(item.tenMonHoc)?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soTinChi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tietLH} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tietTH} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tongTiet} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.hocKyDuKien} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namHocDuKien} />
                    </tr>
                ),
            });
        return this.renderModal({
            title: ma !== '' ? 'Cập nhật dữ liệu lớp' : 'Tạo lớp mới',
            size: 'elarge',
            body: (
                ma !== '' ? <FormTabs ref={e => this.tab = e} tabs={[
                    { title: 'Thông tin lớp sinh viên', component: <div className='tile'>{lop}</div> },
                    { title: 'Danh sách sinh viên trong lớp', component: <div className='tile'>{tableSv}</div> },
                    { title: 'Danh sách môn CTĐT của lớp', component: <div className='tile'>{tableCtdt}</div> }
                ]} /> : <div>{lop}</div>
            ),
            postButtons: ma !== '' && <>
                <button className='btn btn-warning' onClick={e => e && e.preventDefault() || T.handleDownload(`/api/dt/lop/download-dssv-lop?filter=${T.stringify({ khoaSinhVien, heDaoTao, ma })}`)}>
                    <i className='fa fa-cogs' /> Xuất danh sách sinh viên
                </button>
            </>,
        });
    };
}

class LopChuyenNganhModal extends AdminModal {
    componentDidMount() {
        this.tab?.tabClick(null, 0);
        $(document).ready(() =>
            this.onShown(() => {
                !this.ma.value() ? this.ma.focus() : this.ten.focus();
            })
        );
    }

    onShow = (lopCon, lopCha) => {
        this.tab?.tabClick(null, 0);
        let { ma, ten, maChuyenNganh, kichHoat, namHocBatDau, maCtdt } = lopCon ? lopCon : { ma: '', ten: '', maChuyenNganh: '', namHocBatDau: '' };
        this.setState({ ma, lopCon, lopCha }, () => {
            this.maChuyenNganh.value(maChuyenNganh || '');
            this.ctdt.value(maCtdt || '');
            this.ma.value(ma);
            this.ten.value(ten || '');
            this.namHocBatDau.value(namHocBatDau || '');
            this.maNganhCha.value(lopCha ? lopCha.maNganh : '');
            this.heDaoTao.value(lopCha ? lopCha.heDaoTao : '');
            this.khoaSinhVien.value(lopCha ? lopCha.khoaSinhVien : '');
            this.maLopCha.value(lopCha ? lopCha.ma : '');
            this.kichHoat.value(kichHoat ? 1 : 0);
        });
        if (ma !== '') {
            let filterSv = { khoaSinhVien: lopCha.khoaSinhVien, heDaoTao: lopCha.heDaoTao, maLop: ma };
            this.props.getPage(undefined, undefined, '', filterSv, (data) => {
                this.setState({ dssv: data.dsSv });
            });

            let filterCtdt = { khoaSinhVien: lopCha.khoaSinhVien, nganh: maChuyenNganh, loaiHinhDaoTao: lopCha.heDaoTao, maCtdt };
            this.props.getCtdt(filterCtdt, dsCtdt => {
                this.setState({ dsCtdt });
            });
        }
    };

    onSubmit = (e) => {
        const changes = {
            maLop: getValue(this.ma),
            tenLop: getValue(this.ten),
            nienKhoa: this.state.lopCha.nienKhoa,
            khoaSinhVien: getValue(this.khoaSinhVien),
            maNganh: getValue(this.maNganhCha),
            maChuyenNganh: getValue(this.maChuyenNganh),
            heDaoTao: getValue(this.heDaoTao),
            maLopCha: this.state.lopCha.ma,
            maCtdt: getValue(this.ctdt),
            namHocBatDau: getValue(this.namHocBatDau),
            kichHoat: this.kichHoat.value() ? 1 : 0,
            loaiLop: 'CN',
        };
        if (this.state.ma) {
            if (changes.kichHoat == 0 && this.state.lopCon.kichHoat == 1) {
                T.confirm('Tắt kích hoạt lớp này', 'Bạn có chắc tắt kích hoạt lớp này? Tất cả các sinh viên thuộc lớp này sẽ bị đẩy ra khỏi lớp', 'warning', true, (isConfirm) => isConfirm && this.props.update(this.state.ma, changes, this.hide));
            } else {
                this.props.update(this.state.ma, changes, this.hide);
            }
        } else {
            this.props.create(changes, this.hide);
        }
        e.preventDefault();
    };

    changeKichHoat = (value) => this.kichHoat.value(Number(value));

    changeChuyenNganh = (value) => {
        this.ma.value(value.maLop);
        this.ma.focus();
    }

    copyMaLop = (e) => {
        e.preventDefault();
        const ma = this.ma.value();
        this.ten.value(ma);
    }

    render = () => {
        const readOnly = this.props.readOnly;
        let lop =
            <div className='row'>
                <FormTextBox ref={(e) => (this.khoaSinhVien = e)} label='Khóa sinh viên' className='col-md-6' readOnly={true} />
                <FormSelect ref={(e) => (this.heDaoTao = e)} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Loại hình đào tạo' className='col-md-6' readOnly={true} required />
                <FormSelect ref={(e) => (this.maNganhCha = e)} label='Ngành lớn' data={SelectAdapter_DtNganhDaoTaoStudent} className='col-md-6' readOnly={true} />
                <FormTextBox ref={(e) => (this.maLopCha = e)} label='Mã lớp ngành' className='col-md-6' readOnly={true} />
                <FormSelect minimumResultsForSearch={-1} ref={(e) => (this.maChuyenNganh = e)} label='Chọn chuyên ngành' readOnly={this.state.ma ? true : readOnly} data={this.state.lopCha ? SelectAdapter_DtDsChuyenNganhTheoLop(this.state.lopCha.maNganh, this.state.lopCha.ma) : []} onChange={this.changeChuyenNganh} className='col-md-6' required />
                <FormTextBox type='text' className='col-md-6' ref={(e) => (this.ma = e)} label='Mã lớp chuyên ngành' readOnly={this.state.ma ? true : readOnly} required />
                <FormSelect ref={(e) => (this.ctdt = e)} data={this.state.lopCha ? SelectAdapter_KhungDaoTaoCtsv(this.state.lopCha.heDaoTao, this.state.lopCha.khoaSinhVien) : []} label='Chương trình đào tạo' className='col-md-6' readOnly={readOnly} required />
                <FormTextBox type='scholastic' className='col-md-6' ref={(e) => (this.namHocBatDau = e)} label='Năm học bắt đầu' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={(e) => (this.ten = e)} label={<span>Tên lớp {!readOnly && <a href='#' onClick={this.copyMaLop}>(Giống mã lớp)</a>}</span>} placeholder='Tên lớp chuyên ngành' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={(e) => (this.kichHoat = e)} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={(value) => this.changeKichHoat(value ? 1 : 0)} />
            </div>,
            tableSv = renderTable({
                getDataSource: () => this.state.dssv,
                header: 'thead-light',
                emptyTable: 'Không có sinh viên',
                stickyHead: this.state.dssv?.length > 12,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap' }}>MSSV</th>
                        <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index} style={{ backgroundColor: 'white' }}>
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                        <TableCell type='text' content={item.mssv} />
                        <TableCell type='text' content={`${item.ho} ${item.ten}`} />
                    </tr>
                ),
            }),
            tableCtdt = renderTable({
                getDataSource: () => this.state.dsCtdt,
                header: 'thead-light',
                emptyTable: 'Không có môn trong chương trình đào tạo',
                stickyHead: this.state.dsCtdt?.length > 12,
                renderHead: () => (
                    <>
                        <tr>
                            <th rowSpan={2} style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                            <th rowSpan={2} style={{ width: '30%', textAlign: 'center' }}>Mã môn học</th>
                            <th rowSpan={2} style={{ width: '70%', textAlign: 'center' }}>Tên môn học</th>
                            <th rowSpan={2} style={{ width: 'auto', textAlign: 'center' }}>Tín chỉ</th>
                            <th rowSpan={1} colSpan={3} style={{ width: 'auto', textAlign: 'center' }}>Số tiết</th>
                            <th rowSpan={2} style={{ width: 'auto', textAlign: 'center' }}>Học kỳ dự kiến</th>
                            <th rowSpan={2} style={{ width: 'auto', textAlign: 'center' }}>Năm học dự kiến</th>
                        </tr>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>LH</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>TH</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>Tổng</th>
                        </tr>
                    </>
                ),
                renderRow: (item, index) => (
                    <tr key={index} style={{ backgroundColor: 'white' }}>
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.maMonHoc} />
                        <TableCell style={{ textAlign: 'left' }} content={T.parse(item.tenMonHoc)?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soTinChi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tietLH} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tietTH} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tongTiet} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.hocKyDuKien} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namHocDuKien} />
                    </tr>
                ),
            });
        return this.renderModal({
            title: this.state.ma !== '' ? 'Cập nhật dữ liệu lớp chuyên ngành' : 'Tạo lớp chuyên ngành mới',
            size: 'large',
            body: (
                this.state.ma !== '' ? <FormTabs ref={e => this.tab = e} tabs={[
                    { title: 'Thông tin lớp sinh viên', component: <div className='tile'>{lop}</div> },
                    { title: 'Danh sách sinh viên trong lớp', component: <div className='tile'>{tableSv}</div> },
                    { title: 'Danh sách môn CTĐT của lớp', component: <div className='tile'>{tableCtdt}</div> }
                ]} /> : <div>{lop}</div>
            ),
        });
    };
}

class AdminDtLopPage extends AdminPage {
    state = { page: null, filter: {}, heDaoTao: '', khoaSinhVien: '' };
    componentDidMount() {
        T.ready('/user/students', () => {
            T.onSearch = (searchText) => this.props.getDtLopPage(undefined, undefined, searchText || '');
            // T.showSearchBox(true);
            const query = new URLSearchParams(this.props.location.search);
            let khoaSinhVien = query.get('khoa'),
                heDaoTao = query.get('heDaoTao');
            this.setState({ filter: { khoaSinhVien, heDaoTao } }, () => {
                this.getPage();
            });
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    showLopModal = (e) => {
        e.preventDefault();
        this.lopmodal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa lớp sinh viên', 'Bạn có chắc bạn muốn xóa lớp sinh viên này?', 'warning', true, (isConfirm) => isConfirm && this.props.deleteDtLop(item.ma));
    };

    changeActive = (item) => {
        if (item.kichHoat == 1) {
            T.confirm('Tắt kích hoạt lớp này', 'Bạn có chắc tắt kích hoạt lớp này? Tất cả các sinh viên thuộc lớp này sẽ bị đẩy ra khỏi lớp', 'warning', true, (isConfirm) => isConfirm && this.props.updateDtLop(item.ma, { kichHoat: Number(!item.kichHoat) }));
        } else this.props.updateDtLop(item.ma, { kichHoat: Number(!item.kichHoat) });
    };

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getDtLopPage(pageN, pageS, pageC, this.state.filter, done);
    };

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    render() {
        const permission = this.getUserPermission('dtLop');
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list = [] } = this.props.dtLop && this.props.dtLop.page ? this.props.dtLop.page : { pageNumber: 1, pageSize: 10, pageTotal: 1, totalItem: 0, list: null };
        let table = renderDataTable({
            data: list,
            stickyHead: true,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã lớp' keyCol='maLop' onKeySearch={this.handleKeySearch} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tên lớp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Sĩ số</th>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Mã ngành' keyCol='maNganh' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '100%', whiteSpace: 'nowrap' }} content='Tên ngành' keyCol='tenNganh' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Mã CTDT' keyCol='maCTDT' onKeySearch={this.handleKeySearch} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Năm học<br />bắt đầu</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Niên khóa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khóa SV</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            multipleTbody: true,
            renderRow: (item, index) => {
                let rows = [];
                rows.push(
                    <tr key={index} style={{ backgroundColor: !item.idKDT ? '#ffd966' : 'white' }}>
                        <TableCell type='link' className='text-dark' url={`/user/dao-tao/lop/detail/${item.ma}`} content={item.ma ? <b>{item.ma}</b> : ''} nowrap />
                        <TableCell type='text' className='text-dark' content={item.ten ? <b>{item.ten}</b> : ''} nowrap />
                        <TableCell type='text' className='text-dark' content={item.siSo ? <b>{item.siSo}</b> : <b>0</b>} />
                        <TableCell type='text' className='text-dark' content={item.maChuyenNganh ? item.maChuyenNganh : item.maNganh} />
                        <TableCell type='text' className='text-dark' content={item.tenNganh ? <b>{item.tenNganh}</b> : ''} nowrap />
                        <TableCell type={item.idKDT ? 'link' : 'text'} content={item.maCtdt ? <b>{item.maCtdt}</b> : ''} url={`/user/dao-tao/chuong-trinh-dao-tao/${item.idKDT}`} />
                        <TableCell type='text' className='text-dark' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namHocBatDau ? <b>{item.namHocBatDau}</b> : ''} />
                        <TableCell type='text' className='text-dark' style={{ width: 'auto', whiteSpace: 'nowrap' }} content={item.nienKhoa ? <b>{item.nienKhoa}</b> : ''} />
                        <TableCell type='text' className='text-dark' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content={item.khoaSinhVien ? <b>{item.khoaSinhVien}</b> : ''} />
                        <TableCell type='text' className='text-dark' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content={item.heDaoTao ? <b>{item.heDaoTao}</b> : ''} />
                        <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission} onChanged={() => this.changeActive(item)} />
                        <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={this.delete}>
                            <Tooltip title='Thêm' arrow>
                                <button className='btn btn-success' onClick={() => this.lopmodal.show(null, item)}>
                                    <i className='fa fa-lg fa-plus' />
                                </button>
                            </Tooltip>
                        </TableCell>
                    </tr>);
                if (item.lopChuyenNganh && item.lopChuyenNganh.length) {
                    item.lopChuyenNganh.forEach((lopCon, stt) => rows.push(
                        <tr key={`${index}-${stt}-1`} style={{ backgroundColor: !item.idKDT ? '#ffd966' : 'white' }} >
                            <TableCell url={`/user/dao-tao/lop/detail/${lopCon.ma}`} content={lopCon.ma} type='link' style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                            <TableCell content={lopCon.ten} style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                            <TableCell type='text' content={lopCon.siSo} style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                            <TableCell content={lopCon.maChuyenNganh} style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                            <TableCell content={lopCon.tenNganh} style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                            <TableCell type={item.idKDT ? 'link' : 'text'} content={lopCon.maCtdt} url={`/user/dao-tao/chuong-trinh-dao-tao/${item.idKDT}`} style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                            <TableCell content={lopCon.namHocBatDau} style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                            <TableCell content={lopCon.nienKhoa} style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                            <TableCell content={lopCon.khoaSinhVien} style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                            <TableCell content={lopCon.heDaoTao} />
                            <TableCell type='checkbox' style={{ textAlign: 'center' }} content={lopCon.kichHoat} permission={permission} onChanged={() => this.changeActive(lopCon)} />
                            <TableCell style={{ textAlign: 'right' }} type='buttons' content={lopCon} permission={permission} onEdit={() => this.lopmodal.show(lopCon, item)} onDelete={this.delete} />
                        </tr>,
                    ));
                }
                return rows;
            },
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Quản lý lớp sinh viên',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>
                    Đào tạo
                </Link>,
                'Lớp sinh viên',
            ],
            content: (
                <>
                    <div className='tile'>{table}</div>
                    <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />
                    <EditModal ref={(e) => (this.modal = e)} readOnly={!permission.write} getPage={this.props.getDtLopPage} getCtdt={this.props.getDtLopCtdt} create={this.props.createDtLop} update={this.props.updateDtLop} filter={this.state.filter} />
                    <LopChuyenNganhModal ref={(e) => (this.lopmodal = e)} readOnly={!permission.write} getPage={this.props.getDtLopPage} getCtdt={this.props.getDtLopCtdt} create={this.props.createDtLop} update={this.props.updateDtLop} filter={this.state.filter} />
                    {/* <MultipleCreateModal ref={e => this.multipleCreateModal = e} filter={this.state.filter} dtLop={this.props.dtLop} permission={permission} /> */}
                </>
            ),
            backRoute: '/user/dao-tao/lop',
            collapse: [
                { icon: 'fa-plus', permission: permission.write, name: 'Tạo lớp đơn lẻ', onClick: () => this.modal.show(), type: 'primary' },
                // { icon: 'fa-clone', permission: permission.write, name: 'Tạo lớp tự động', onClick: () => this.multipleCreateModal.show(this.props.dtLop.page.list), type: 'danger' },
            ]
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, dtLop: state.daoTao.dtLop });
const mapActionsToProps = {
    getDtLopPage, createDtLop, deleteDtLop, updateDtLop, getDtLopCtdt
};
export default connect(mapStateToProps, mapActionsToProps)(AdminDtLopPage);
