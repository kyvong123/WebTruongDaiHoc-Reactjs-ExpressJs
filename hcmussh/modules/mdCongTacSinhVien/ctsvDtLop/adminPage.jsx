import Pagination from 'view/component/Pagination';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, FormTextBox, getValue, FormSelect, FormCheckbox, TableHead, renderDataTable } from 'view/component/AdminPage';
import { getCtsvLopPage, createCtsvLop, deleteCtsvLop, updateCtsvLop } from './redux';
import { Tooltip } from '@mui/material';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_KhungDaoTaoCtsvFilter } from '../ctsvDtChuongTrinhDaoTao/redux';
import { SelectAdapter_DtChuyenNganhDaoTao } from '../ctsvDtChuyenNganh/redux';
import { SelectAdapter_DtNganhDaoTao } from '../ctsvDtNganhDaoTao/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
// import MultipleCreateModal from './multipleCreateModal';

export class EditModal extends AdminModal {
    state = { isMienGiam: false }
    componentDidMount() {
        $(document).ready(() =>
            this.onShown(() => {
                !this.ma.value() ? this.ma.focus() : this.ten.focus();
            })
        );
    }

    onShow = (item) => {
        let { ma, ten, nienKhoa, maNganh, heDaoTao, kichHoat, khoaSinhVien, namHocBatDau, maCtdt, namHocApDung, hocKyApDung } = item ? item : { ma: '', ten: '', nienKhoa: '', maNganh: '', heDaoTao: '', khoaSinhVien: '', namHocBatDau: '', maCtdt: '', namHocApDung: '', hocKyApDung: '' };
        this.setState({ ma, item, khoaSinhVien, heDaoTao, maNganh, isMienGiam: (namHocApDung && hocKyApDung) ? true : false }, () => {
            this.ctdt.value(maCtdt || '');
            this.isMienGiam.value(this.state.isMienGiam ? 1 : 0);
            this.namHocApDung?.value(namHocApDung || '');
            this.hocKyApDung?.value(hocKyApDung || '');
        });
        this.ma.value(ma);
        this.ten.value(ten || '');
        this.nienKhoa.value(nienKhoa || '');
        this.maNganh.value(maNganh || '');
        this.heDaoTao.value(heDaoTao || '');
        this.khoaSinhVien.value(khoaSinhVien || '');
        this.namHocBatDau.value(namHocBatDau || '');
        this.kichHoat.value(kichHoat ? 1 : 0);

    };

    onSubmit = (e) => {
        e.preventDefault();
        const { isMienGiam } = this.state;
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
            namHocApDung: isMienGiam ? getValue(this.namHocApDung) : null,
            hocKyApDung: isMienGiam ? getValue(this.hocKyApDung) : null
        };
        if (this.state.ma) {
            if (changes.kichHoat == 0 && this.state.item.kichHoat == 1) {
                T.confirm('Tắt kích hoạt lớp này', 'Bạn có chắc tắt kích hoạt lớp này? Tất cả các sinh viên thuộc lớp này sẽ bị đẩy ra khỏi lớp', 'warning', true, (isConfirm) => isConfirm && this.props.update(this.state.ma, changes, () => {
                    this.hide();
                    this.props.changeUrl(`/user/ctsv/lop/item?khoa=${changes.khoaSinhVien}&heDaoTao=${changes.heDaoTao}`);
                }));
            } else {
                this.props.update(this.state.ma, changes, () => {
                    this.hide();
                    this.props.changeUrl(`/user/ctsv/lop/item?khoa=${changes.khoaSinhVien}&heDaoTao=${changes.heDaoTao}`);
                });
            }
        } else {
            this.props.create(changes, () => {
                this.hide();
                this.props.changeUrl(`/user/ctsv/lop/item?khoa=${changes.khoaSinhVien}&heDaoTao=${changes.heDaoTao}`);
            });
        }
    };

    changeKichHoat = (value) => this.kichHoat.value(Number(value));

    changeNganh = (value) => {
        this.setState({ maNganh: value.id, maLop: value.maLop }, () => this.ctdt.value(''));
        this.ma.focus();
    }

    changeKhoaSinhVien = () => {
        this.setState({ khoaSinhVien: getValue(this.khoaSinhVien) }, () => {
            this.ctdt.value(null);
        });
    }

    changeHeDaoTao = (value) => {
        this.setState({ heDaoTao: value.id, maLopHdt: value.maLopTuDong }, () => {
            this.ctdt.value(null);
        });
    }

    copyMaLop = (e) => {
        e.preventDefault();
        const ma = this.ma.value();
        this.ten.value(ma);
    }

    changeCtdt = (value) => {
        const khoaSinhVien = getValue(this.khoaSinhVien);
        this.nienKhoa.value(`${khoaSinhVien} - ${Math.ceil(Number(khoaSinhVien) + ((value.thoiGianDaoTao == null || value.thoiGianDaoTao == '-1') ? 4 : Number(value.thoiGianDaoTao)))}`);
        if (khoaSinhVien && this.state.maLop) {
            let maLop = `${khoaSinhVien?.toString().substr(-2) ?? ''}${this.state.maLopHdt ?? ''}${this.state.maLop ?? ''}`;
            this.ma.value(maLop);
        }
    }

    render = () => {
        const { heDaoTao, khoaSinhVien, maNganh } = this.state;
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật dữ liệu lớp' : 'Tạo lớp mới',
            body: (
                <div className='row'>
                    <FormSelect ref={(e) => (this.maNganh = e)} label='Chọn ngành' data={SelectAdapter_DtNganhDaoTao} className='col-md-12' readOnly={this.state.ma ? true : readOnly} onChange={(value) => this.changeNganh(value)} required />
                    <FormSelect ref={(e) => (this.heDaoTao = e)} onChange={this.changeHeDaoTao} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Hệ đào tạo' className='col-md-6' readOnly={this.state.ma ? true : readOnly} required />
                    <FormSelect type='text' ref={(e) => (this.khoaSinhVien = e)} data={SelectAdapter_DtKhoaDaoTao} label='Khóa sinh viên' className='col-md-6' readOnly={this.state.ma ? true : readOnly} onChange={() => this.changeKhoaSinhVien()} required />
                    <FormSelect ref={(e) => (this.ctdt = e)} data={khoaSinhVien !== '' ? SelectAdapter_KhungDaoTaoCtsvFilter(heDaoTao, khoaSinhVien, maNganh) : []} label='Chương trình đào tạo' className='col-md-12' onChange={(value) => this.changeCtdt(value)} readOnly={readOnly} required />
                    <FormTextBox type='scholastic' className='col-md-12' ref={(e) => (this.nienKhoa = e)} label='Niên khóa' readOnly required />
                    <FormTextBox type='scholastic' className='col-md-12' ref={(e) => (this.namHocBatDau = e)} label='Năm học bắt đầu' readOnly={readOnly} required />
                    <FormTextBox type='text' className='col-md-12' ref={(e) => (this.ma = e)} label='Mã lớp' readOnly={this.state.ma ? true : readOnly} required />
                    <FormTextBox type='text' className='col-md-12' ref={(e) => (this.ten = e)} label={<span>Tên lớp {!readOnly && <a href='#' onClick={this.copyMaLop}>(Giống mã lớp)</a>}</span>} placeholder='Tên lớp' readOnly={readOnly} required />
                    <FormCheckbox className='col-md-12' ref={(e) => (this.isMienGiam = e)} label='Được miễn giảm' readOnly={readOnly} onChange={(value) => (this.setState({ isMienGiam: value ? true : false }))} />
                    {this.state.isMienGiam ? <>
                        <FormTextBox type='scholastic' className='col-md-6' ref={(e) => (this.namHocApDung = e)} label='Năm học áp dụng miễn giảm' readOnly={readOnly} required />
                        <FormSelect allowClear={true} className='col-md-6' ref={e => this.hocKyApDung = e} data={[{ id: '1', text: 'HK1' }, { id: '2', text: 'HK2' }, { id: '3', text: 'HK3' }]} label='Học kỳ áp dụng miễn giảm' readOnly={readOnly} required />
                    </> : null}
                    <FormCheckbox className='col-md-6' ref={(e) => (this.kichHoat = e)} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={(value) => this.changeKichHoat(value ? 1 : 0)} />
                </div>
            ),
        });
    };
}

class LopChuyenNganhModal extends AdminModal {
    state = { isMienGiam: false }
    componentDidMount() {
        $(document).ready(() =>
            this.onShown(() => {
                !this.ma.value() ? this.ma.focus() : this.ten.focus();
            })
        );
    }

    onShow = (lopCon, lopCha) => {
        let { ma, ten, maChuyenNganh, kichHoat, namHocBatDau, maCtdt, namHocApDung, hocKyApDung } = lopCon ? lopCon : { ma: '', ten: '', maChuyenNganh: '', namHocBatDau: '', namHocApDung: '', hocKyApDung: '' };
        this.setState({ ma, lopCon, lopCha, isMienGiam: (namHocApDung && hocKyApDung) ? true : false }, () => {
            this.maChuyenNganh.value(maChuyenNganh || '');
            this.ctdt.value(maCtdt || '');
            this.isMienGiam.value(this.state.isMienGiam ? 1 : 0);
            this.namHocApDung?.value(namHocApDung || '');
            this.hocKyApDung?.value(hocKyApDung || '');
        });
        this.ma.value(ma);
        this.ten.value(ten || '');
        this.namHocBatDau.value(namHocBatDau || '');
        this.maNganhCha.value(lopCha ? lopCha.maNganh : '');
        this.heDaoTao.value(lopCha ? lopCha.heDaoTao : '', value => this.setState({ maLopHdt: value.maLopTuDong }));
        this.khoaSinhVien.value(lopCha ? lopCha.khoaSinhVien : '');
        this.maChuyenNganh.value(maChuyenNganh);
        this.maLopCha.value(lopCha ? lopCha.ma : '');
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    onSubmit = (e) => {
        const { isMienGiam } = this.state;
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
            namHocApDung: isMienGiam ? getValue(this.namHocApDung) : null,
            hocKyApDung: isMienGiam ? getValue(this.hocKyApDung) : null
        };
        if (this.state.ma) {
            if (changes.kichHoat == 0 && this.state.lopCon.kichHoat == 1) {
                T.confirm('Tắt kích hoạt lớp này', 'Bạn có chắc tắt kích hoạt lớp này? Tất cả các sinh viên thuộc lớp này sẽ bị đẩy ra khỏi lớp', 'warning', true, (isConfirm) => isConfirm && this.props.update(this.state.ma, changes, () => {
                    this.hide();
                    this.props.changeUrl(`/user/ctsv/lop/item?khoa=${changes.khoaSinhVien}&heDaoTao=${changes.heDaoTao}`);
                }));
            } else {
                this.props.update(this.state.ma, changes, () => {
                    this.hide();
                    this.props.changeUrl(`/user/ctsv/lop/item?khoa=${changes.khoaSinhVien}&heDaoTao=${changes.heDaoTao}`);
                });
            }
        } else {
            this.props.create(changes, () => {
                this.hide();
                this.props.changeUrl(`/user/ctsv/lop/item?khoa=${changes.khoaSinhVien}&heDaoTao=${changes.heDaoTao}`);
            });
        }
        e.preventDefault();
    };

    changeKichHoat = (value) => this.kichHoat.value(Number(value));

    changeChuyenNganh = (value) => {
        this.setState({ maNganh: value.id, maLop: value.maLop }, () => this.ctdt.value(''));
        // this.ma.value(value.maLop);
        // this.ma.focus();
    }

    changeCtdt = () => {
        const khoaSinhVien = getValue(this.khoaSinhVien);
        if (khoaSinhVien && this.state.maLop) {
            let maLop = `${khoaSinhVien?.toString().substr(-2) ?? ''}${this.state.maLopHdt ?? ''}${this.state.maLop ?? ''}`;
            this.ma.value(maLop);
        }
    }

    copyMaLop = (e) => {
        e.preventDefault();
        const ma = this.ma.value();
        this.ten.value(ma);
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật dữ liệu lớp chuyên ngành' : 'Tạo lớp chuyên ngành mới',
            size: 'large',
            body: (
                <div className='row'>
                    <FormTextBox ref={(e) => (this.khoaSinhVien = e)} label='Khóa sinh viên' className='col-md-6' readOnly={true} />
                    <FormSelect ref={(e) => (this.heDaoTao = e)} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Loại hình đào tạo' className='col-md-6' readOnly={true} required />
                    <FormSelect ref={(e) => (this.maNganhCha = e)} label='Ngành lớn' data={SelectAdapter_DtNganhDaoTao} className='col-md-6' readOnly={true} />
                    <FormTextBox ref={(e) => (this.maLopCha = e)} label='Mã lớp ngành' className='col-md-6' readOnly={true} />
                    <FormSelect minimumResultsForSearch={-1} ref={(e) => (this.maChuyenNganh = e)} label='Chọn chuyên ngành' readOnly={this.state.ma ? true : readOnly} data={this.state.lopCha ? SelectAdapter_DtChuyenNganhDaoTao(this.state.lopCha.maNganh) : []} onChange={this.changeChuyenNganh} className='col-md-6' required />
                    <FormSelect ref={(e) => (this.ctdt = e)} data={this.state.lopCha ? SelectAdapter_KhungDaoTaoCtsvFilter(this.state.lopCha.heDaoTao, this.state.lopCha.khoaSinhVien, this.state.lopCha.maNganh) : []} label='Chương trình đào tạo' className='col-md-6' readOnly={readOnly} required onChange={(value) => this.changeCtdt(value)} />
                    <FormTextBox type='text' className='col-md-6' ref={(e) => (this.ma = e)} label='Mã lớp chuyên ngành' readOnly={this.state.ma ? true : readOnly} required />
                    <FormTextBox type='scholastic' className='col-md-6' ref={(e) => (this.namHocBatDau = e)} label='Năm học bắt đầu' readOnly={readOnly} required />
                    <FormTextBox type='text' className='col-md-12' ref={(e) => (this.ten = e)} label={<span>Tên lớp {!readOnly && <a href='#' onClick={this.copyMaLop}>(Giống mã lớp)</a>}</span>} placeholder='Tên lớp chuyên ngành' readOnly={readOnly} required />
                    <FormCheckbox className='col-md-12' ref={(e) => (this.isMienGiam = e)} label='Được miễn giảm' readOnly={readOnly} onChange={(value) => (this.setState({ isMienGiam: value ? true : false }))} />
                    {this.state.isMienGiam ? <>
                        <FormTextBox type='scholastic' className='col-md-6' ref={(e) => (this.namHocApDung = e)} label='Năm học áp dụng miễn giảm' readOnly={readOnly} required />
                        <FormSelect allowClear={true} className='col-md-6' ref={e => this.hocKyApDung = e} data={[{ id: '1', text: 'HK1' }, { id: '2', text: 'HK2' }, { id: '3', text: 'HK3' }]} label='Học kỳ áp dụng miễn giảm' readOnly={readOnly} required />
                    </> : null}
                    <FormCheckbox className='col-md-6' ref={(e) => (this.kichHoat = e)} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={(value) => this.changeKichHoat(value ? 1 : 0)} />
                </div>
            ),
        });
    };
}

class AdminCtsvLopPage extends AdminPage {
    state = { page: null, filter: {}, heDaoTao: '', khoaSinhVien: '' };
    componentDidMount() {
        T.ready('/user/students', this.onDomReady);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.location.pathname != this.props.location.pathname) {
            this.onDomReady();
        }
    }

    onDomReady = () => {
        T.onSearch = (searchText) => this.props.getCtsvLopPage(undefined, undefined, searchText || '');
        // T.showSearchBox(true);
        const query = new URLSearchParams(this.props.location.search);
        let khoaSinhVien = query.get('khoa'),
            heDaoTao = query.get('heDaoTao');
        this.setState({ filter: { khoaSinhVien, heDaoTao } }, () => {
            this.getPage();
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
        T.confirm('Xóa lớp sinh viên', 'Bạn có chắc bạn muốn xóa lớp sinh viên này?', 'warning', true, (isConfirm) => isConfirm && this.props.deleteCtsvLop(item.ma));
    };

    changeActive = (item) => {
        if (item.kichHoat == 1) {
            T.confirm('Tắt kích hoạt lớp này', 'Bạn có chắc tắt kích hoạt lớp này? Tất cả các sinh viên thuộc lớp này sẽ bị đẩy ra khỏi lớp', 'warning', true, (isConfirm) => isConfirm && this.props.updateCtsvLop(item.ma, { kichHoat: Number(!item.kichHoat) }));
        } else this.props.updateCtsvLop(item.ma, { kichHoat: Number(!item.kichHoat) });
    };

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getCtsvLopPage(pageN, pageS, pageC, this.state.filter, done);
    };

    exportExcel = () => {
        T.download(`/api/ctsv/lop-sinh-vien/page/download-excel?filter=${JSON.stringify(this.state.filter)}`);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    changeUrl = (url) => {
        this.props.history.push(url);
    };

    render() {
        const permission = this.getUserPermission('ctsvLop');
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list = [] } = this.props.ctsvLop && this.props.ctsvLop.page ? this.props.ctsvLop.page : { pageNumber: 1, pageSize: 10, pageTotal: 1, totalItem: 0, list: null };
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
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Người tạo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Miễn giảm</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            multipleTbody: true,
            renderRow: (item, index) => {
                let rows = [];
                rows.push(
                    <tr key={index} style={{ backgroundColor: !item.idKDT ? '#ffd966' : 'white' }}>
                        <TableCell type='link' className='text-dark' url={`/user/ctsv/lop/detail/${item.ma}`} content={item.ma ? <b>{item.ma}</b> : ''} nowrap />
                        <TableCell type='text' className='text-dark' content={item.ten ? <b>{item.ten}</b> : ''} nowrap />
                        <TableCell type='text' className='text-dark' content={item.siSo ? <b>{item.siSo}</b> : <b>0</b>} />
                        <TableCell type='text' className='text-dark' content={item.maChuyenNganh ? item.maChuyenNganh : item.maNganh} />
                        <TableCell type='text' className='text-dark' content={item.tenNganh ? <b>{item.tenNganh}</b> : ''} nowrap />
                        <TableCell type={item.idKDT ? 'link' : 'text'} content={item.maCtdt ? <b>{item.maCtdt}</b> : ''} url={`/user/dao-tao/chuong-trinh-dao-tao/${item.idKDT}`} />
                        <TableCell type='text' className='text-dark' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namHocBatDau ? <b>{item.namHocBatDau}</b> : ''} />
                        <TableCell type='text' className='text-dark' style={{ width: 'auto', whiteSpace: 'nowrap' }} content={item.nienKhoa ? <b>{item.nienKhoa}</b> : ''} />
                        <TableCell type='text' className='text-dark' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content={item.khoaSinhVien ? <b>{item.khoaSinhVien}</b> : ''} />
                        <TableCell type='text' className='text-dark' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content={item.heDaoTao ? <b>{item.heDaoTao}</b> : ''} />
                        <TableCell type='text' className='text-dark' style={{ width: 'auto', whiteSpace: 'nowrap' }} content={item.userCreatorName ? <>
                            <b>{item.userCreatorName}</b><br />
                            <i className='fa fa-clock'></i><smal>{T.dateToText(item.createTime)}</smal>
                        </> : ''} />
                        <TableCell type='text' className='text-dark' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content={(item.namHocApDung && item.hocKyApDung) ? <b className='text-success'>Được miễn giảm</b> : ''} />
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
                            <TableCell url={`/user/ctsv/lop/detail/${lopCon.ma}`} content={lopCon.ma} type='link' style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                            <TableCell content={lopCon.ten} style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                            <TableCell type='text' content={lopCon.siSo} style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                            <TableCell content={lopCon.maChuyenNganh} style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                            <TableCell content={lopCon.tenNganh} style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                            <TableCell type={item.idKDT ? 'link' : 'text'} content={lopCon.maCtdt} url={`/user/dao-tao/chuong-trinh-dao-tao/${item.idKDT}`} style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                            <TableCell content={lopCon.namHocBatDau} style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                            <TableCell content={lopCon.nienKhoa} style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                            <TableCell content={lopCon.khoaSinhVien} style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                            <TableCell content={lopCon.heDaoTao} />
                            <TableCell type='text' className='text-dark' style={{ width: 'auto', whiteSpace: 'nowrap' }} content={item.userCreatorName ? <>
                                <b>{item.userCreatorName}</b><br />
                                <i className='fa fa-clock'></i><smal>{T.dateToText(item.createTime)}</smal>
                            </> : ''} />
                            <TableCell type='text' className='text-dark' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content={(lopCon.namHocApDung && lopCon.hocKyApDung) ? <b className='text-success'>Được miễn giảm</b> : ''} />
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
                <Link key={0} to='/user/ctsv'>
                    Công tác sinh viên
                </Link>,
                <Link key={1} to='/user/ctsv/lop'>
                    Năm học và Hệ
                </Link>,
                'Lớp sinh viên',
            ],
            content: (
                <>
                    <div className='tile'>{table}</div>
                    <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />
                    <EditModal ref={(e) => (this.modal = e)} readOnly={!permission.write} create={this.props.createCtsvLop} update={this.props.updateCtsvLop} changeUrl={this.changeUrl} />
                    <LopChuyenNganhModal ref={(e) => (this.lopmodal = e)} readOnly={!permission.write} create={this.props.createCtsvLop} update={this.props.updateCtsvLop} changeUrl={this.changeUrl} />
                    {/* <MultipleCreateModal ref={e => this.multipleCreateModal = e} filter={this.state.filter} dtLop={this.props.dtLop} permission={permission} /> */}
                </>
            ),
            backRoute: '/user/ctsv/lop',
            collapse: [
                { icon: 'fa-plus', permission: permission.write, name: 'Tạo lớp đơn lẻ', onClick: () => this.modal.show(), type: 'primary' },
                { icon: 'fa-download', permission: permission.write, name: 'Xuất danh sách lớp', onClick: () => this.exportExcel(), type: 'secondary' },
                // { icon: 'fa-clone', permission: permission.write, name: 'Tạo lớp tự động', onClick: () => this.multipleCreateModal.show(this.props.dtLop.page.list), type: 'danger' },
            ]
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, ctsvLop: state.ctsv.ctsvLop });
const mapActionsToProps = {
    getCtsvLopPage, createCtsvLop, deleteCtsvLop, updateCtsvLop
};
export default connect(mapStateToProps, mapActionsToProps)(AdminCtsvLopPage);
