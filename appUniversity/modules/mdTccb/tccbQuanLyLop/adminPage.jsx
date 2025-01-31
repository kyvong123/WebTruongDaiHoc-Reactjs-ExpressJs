import Pagination from 'view/component/Pagination';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, renderTable, TableCell, FormTextBox, getValue, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import { getTccbLopPage, createTccbLop, deleteTccbLop, updateTccbLop } from './redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_KhungDaoTaoCtsvFilter } from 'modules/mdCongTacSinhVien/ctsvDtChuongTrinhDaoTao/redux';
import { SelectAdapter_DtChuyenNganhDaoTao } from 'modules/mdCongTacSinhVien/ctsvDtChuyenNganh/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdCongTacSinhVien/ctsvDtNganhDaoTao/redux';
// import MultipleCreateModal from './multipleCreateModal';

const POSITION_MAPPER = {
    'CN': 'Giáo viên chủ nhiệm',
    'LT': 'Lớp trưởng',
    'LP': 'Lớp phó',
    'BT': 'Bí thư (Đoàn)',
    'PBT': 'Phó bí thư (Đoàn)',
    'UVBCH': ' Ủy viên BCH (Đoàn)',
    'CHT': 'Chi hội trưởng (Hội sinh viên)',
    'CHP': 'Chi hội phó (Hội sinh viên)',
    'UVBCH-HSV': 'Ủy viên BCH (Hội sinh viên)',
};

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() =>
            this.onShown(() => {
                !this.ma.value() ? this.ma.focus() : this.ten.focus();
            })
        );
    }

    onShow = (item) => {
        let { ma, ten, nienKhoa, maNganh, heDaoTao, kichHoat, khoaSinhVien, namHocBatDau, maCtdt } = item ? item : { ma: '', ten: '', nienKhoa: '', maNganh: '', heDaoTao: '', khoaSinhVien: '', namHocBatDau: '', maCtdt: '' };
        this.setState({ ma, item, khoaSinhVien, heDaoTao, maNganh }, () => {
            this.ctdt.value(maCtdt || '');
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
        this.setState({ maNganh: value.id }, () => this.ctdt.value(null));
        this.ma.value(value.maLop);
        this.ma.focus();
    }

    changeKhoaSinhVien = () => {
        this.setState({ khoaSinhVien: getValue(this.khoaSinhVien) }, () => {
            this.ctdt.value(null);
        });
    }

    changeHeDaoTao = (value) => {
        this.setState({ heDaoTao: value.id }, () => {
            this.ctdt.value(null);
        });
    }

    copyMaLop = (e) => {
        e.preventDefault();
        const ma = this.ma.value();
        this.ten.value(ma);
    }

    render = () => {
        const { heDaoTao, khoaSinhVien, maNganh } = this.state;
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật dữ liệu lớp' : 'Tạo lớp mới',
            body: (
                <div className='row'>
                    <FormSelect ref={(e) => (this.maNganh = e)} label='Chọn ngành' data={SelectAdapter_DtNganhDaoTao} className='col-md-12' readOnly={this.state.ma ? true : readOnly} onChange={this.changeNganh} required />
                    <FormSelect ref={(e) => (this.heDaoTao = e)} onChange={this.changeHeDaoTao} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Hệ đào tạo' className='col-md-6' readOnly={this.state.ma ? true : readOnly} required />
                    <FormTextBox type='text' ref={(e) => (this.khoaSinhVien = e)} onBlur={this.changeKhoaSinhVien} label='Khóa sinh viên' className='col-md-6' readOnly={this.state.ma ? true : readOnly} required />
                    <FormSelect ref={(e) => (this.ctdt = e)} data={khoaSinhVien !== '' ? SelectAdapter_KhungDaoTaoCtsvFilter(heDaoTao, khoaSinhVien, maNganh) : []} label='Chương trình đào tạo' className='col-md-12' readOnly={readOnly} required />
                    <FormTextBox type='scholastic' className='col-md-6' ref={(e) => (this.nienKhoa = e)} label='Niên khóa' readOnly={readOnly} required />
                    <FormTextBox type='scholastic' className='col-md-6' ref={(e) => (this.namHocBatDau = e)} label='Năm học bắt đầu' readOnly={readOnly} required />
                    <FormTextBox type='text' className='col-md-12' ref={(e) => (this.ma = e)} label='Mã lớp' readOnly={this.state.ma ? true : readOnly} required />
                    <FormTextBox type='text' className='col-md-12' ref={(e) => (this.ten = e)} label={<span>Tên lớp {!readOnly && <a href='#' onClick={this.copyMaLop}>(Giống mã lớp)</a>}</span>} placeholder='Tên lớp' readOnly={readOnly} required />
                    <FormCheckbox className='col-md-6' ref={(e) => (this.kichHoat = e)} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={(value) => this.changeKichHoat(value ? 1 : 0)} />
                </div>
            ),
        });
    };
}

class LopChuyenNganhModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() =>
            this.onShown(() => {
                !this.ma.value() ? this.ma.focus() : this.ten.focus();
            })
        );
    }

    onShow = (lopCon, lopCha) => {
        let { ma, ten, maChuyenNganh, kichHoat, namHocBatDau, maCtdt } = lopCon ? lopCon : { ma: '', ten: '', maChuyenNganh: '', namHocBatDau: '' };
        this.setState({ ma, lopCon, lopCha }, () => {
            this.maChuyenNganh.value(maChuyenNganh || '');
            this.ctdt.value(maCtdt || '');
        });
        this.ma.value(ma);
        this.ten.value(ten || '');
        this.namHocBatDau.value(namHocBatDau || '');
        this.maNganhCha.value(lopCha ? lopCha.maNganh : '');
        this.heDaoTao.value(lopCha ? lopCha.heDaoTao : '');
        this.khoaSinhVien.value(lopCha ? lopCha.khoaSinhVien : '');
        this.maChuyenNganh.value(maChuyenNganh);
        this.maLopCha.value(lopCha ? lopCha.ma : '');
        this.kichHoat.value(kichHoat ? 1 : 0);
    };

    onSubmit = (e) => {
        const changes = {
            maLop: getValue(this.ma),
            tenLop: getValue(this.ten),
            nienKhoa: this.state.lopCha.nienKhoa,
            khoaSinhVien: getValue(this.khoaSinhVien),
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
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật dữ liệu lớp chuyên ngành' : 'Tạo lớp chuyên ngành mới',
            body: (
                <div className='row'>
                    <FormTextBox ref={(e) => (this.khoaSinhVien = e)} label='Khóa sinh viên' className='col-md-6' readOnly={true} />
                    <FormSelect ref={(e) => (this.heDaoTao = e)} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Loại hình đào tạo' className='col-md-6' readOnly={true} required />
                    <FormSelect ref={(e) => (this.maNganhCha = e)} label='Ngành lớn' data={SelectAdapter_DtNganhDaoTao} className='col-md-6' readOnly={true} />
                    <FormTextBox ref={(e) => (this.maLopCha = e)} label='Mã lớp ngành' className='col-md-6' readOnly={true} />
                    <FormSelect minimumResultsForSearch={-1} ref={(e) => (this.maChuyenNganh = e)} label='Chọn chuyên ngành' readOnly={this.state.ma ? true : readOnly} data={this.state.lopCha ? SelectAdapter_DtChuyenNganhDaoTao(this.state.lopCha.maNganh) : []} onChange={this.changeChuyenNganh} className='col-md-6' required />
                    <FormTextBox type='text' className='col-md-6' ref={(e) => (this.ma = e)} label='Mã lớp chuyên ngành' readOnly={this.state.ma ? true : readOnly} required />
                    <FormSelect ref={(e) => (this.ctdt = e)} data={this.state.lopCha ? SelectAdapter_KhungDaoTaoCtsvFilter(this.state.lopCha.heDaoTao, this.state.lopCha.khoaSinhVien, this.state.lopCha.maNganh) : []} label='Chương trình đào tạo' className='col-md-6' readOnly={readOnly} required />
                    <FormTextBox type='scholastic' className='col-md-6' ref={(e) => (this.namHocBatDau = e)} label='Năm học bắt đầu' readOnly={readOnly} required />
                    <FormTextBox type='text' className='col-md-12' ref={(e) => (this.ten = e)} label={<span>Tên lớp {!readOnly && <a href='#' onClick={this.copyMaLop}>(Giống mã lớp)</a>}</span>} placeholder='Tên lớp chuyên ngành' readOnly={readOnly} required />
                    <FormCheckbox className='col-md-6' ref={(e) => (this.kichHoat = e)} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={(value) => this.changeKichHoat(value ? 1 : 0)} />
                </div>
            ),
        });
    };
}

class AdminKhoaLopPage extends AdminPage {
    state = { page: null, filter: {}, heDaoTao: '', khoaSinhVien: '' };
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            T.onSearch = (searchText) => this.props.getTccbLopPage(undefined, undefined, searchText || '');
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
        T.confirm('Xóa lớp sinh viên', 'Bạn có chắc bạn muốn xóa lớp sinh viên này?', 'warning', true, (isConfirm) => isConfirm && this.props.deleteTccbLop(item.ma));
    };

    changeActive = (item) => {
        if (item.kichHoat == 1) {
            T.confirm('Tắt kích hoạt lớp này', 'Bạn có chắc tắt kích hoạt lớp này? Tất cả các sinh viên thuộc lớp này sẽ bị đẩy ra khỏi lớp', 'warning', true, (isConfirm) => isConfirm && this.props.updateTccbLop(item.ma, { kichHoat: Number(!item.kichHoat) }));
        } else this.props.updateTccbLop(item.ma, { kichHoat: Number(!item.kichHoat) });
    };

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getTccbLopPage(pageN, pageS, pageC, this.state.filter, done);
    };

    render() {
        const permission = this.getUserPermission('tccbLop');
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list = [] } = this.props.tccbLop && this.props.tccbLop.page ? this.props.tccbLop.page : { pageNumber: 1, pageSize: 10, pageTotal: 1, totalItem: 0, list: null };
        let table = renderTable({
            getDataSource: () => list,
            stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã lớp</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Tên lớp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Sĩ số</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Mã ngành</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Tên ngành</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khóa sinh viên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ đào tạo</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Cán bộ lớp</th>
                </tr>
            ),
            multipleTbody: true,
            renderRow: (item, index) => (
                <tbody key={index} style={{ backgroundColor: 'white' }}>
                    <tr key={index}>
                        <TableCell type='link' className='text-primary' url={`/user/tccb/lop/detail/${item.ma}`} content={item.ma ? <b>{item.ma}</b> : ''} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' className='text-primary' content={item.ten ? <b>{item.ten}</b> : ''} />
                        <TableCell type='text' className='text-primary' content={item.siSo ? <b>{item.siSo}</b> : <b>0</b>} />
                        <TableCell type='text' className='text-primary' content={item.maNganh ? <b>{item.maNganh}</b> : ''} />
                        <TableCell type='text' className='text-primary' content={item.tenNganh ? <b>{item.tenNganh}</b> : ''} />
                        <TableCell type='text' className='text-primary' style={{ width: 'auto', whiteSpace: 'nowrap' }} content={item.khoaSinhVien ? <b>{item.khoaSinhVien}</b> : ''} />
                        <TableCell type='text' className='text-primary' style={{ width: 'auto', whiteSpace: 'nowrap' }} content={item.heDaoTao ? <b>{item.heDaoTao}</b> : ''} />
                        <TableCell type='text' className='text-primary' style={{ width: 'auto', whiteSpace: 'nowrap' }} content={item.dsCanBoLop ? <>
                            {JSON.parse(item.dsCanBoLop).map((item, index) => (
                                <h6 key={index}>{POSITION_MAPPER[item.maChucVu]}: {item.maChucVu == 'CN' ? item.hoTenCanBo : item.hoTenSinhVien}</h6>
                            ))}
                        </> : ''} />
                    </tr>
                    {item.lopChuyenNganh.length > 0 &&
                        item.lopChuyenNganh.map((lopCon, stt) => [
                            <tr key={`${index}-${stt}-1`}>
                                <TableCell url={`/user/tccb/lop/detail/${lopCon.ma}`} content={lopCon.ma} type='link' />
                                <TableCell content={lopCon.ten} />
                                <TableCell type='text' content={lopCon.siSo} />
                                <TableCell content={lopCon.maChuyenNganh} />
                                <TableCell content={lopCon.tenNganh} />
                                <TableCell content={lopCon.maCtdt} />
                                <TableCell content={lopCon.namHocBatDau} style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                                <TableCell content={lopCon.nienKhoa} style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                                <TableCell content={lopCon.khoaSinhVien} style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                                <TableCell content={lopCon.heDaoTao} />
                                <TableCell type='checkbox' style={{ textAlign: 'center' }} content={lopCon.kichHoat} permission={permission} onChanged={() => this.changeActive(lopCon)} />
                                <TableCell style={{ textAlign: 'right' }} type='buttons' content={lopCon} permission={permission} onEdit={() => this.lopmodal.show(lopCon, item)} onDelete={this.delete} />
                            </tr>,
                        ])}
                </tbody>
            ),
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Quản lý lớp sinh viên',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>
                    Công tác sinh viên
                </Link>,
                'Lớp sinh viên',
            ],
            content: (
                <>
                    <div className='tile'>{table}</div>
                    <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />
                    <EditModal ref={(e) => (this.modal = e)} readOnly={!permission.write} create={this.props.createTccbLop} update={this.props.updateTccbLop} />
                    <LopChuyenNganhModal ref={(e) => (this.lopmodal = e)} readOnly={!permission.write} create={this.props.createTccbLop} update={this.props.updateTccbLop} />
                    {/* <MultipleCreateModal ref={e => this.multipleCreateModal = e} filter={this.state.filter} dtLop={this.props.dtLop} permission={permission} /> */}
                </>
            ),
            backRoute: '/user/tccb/lop',
            collapse: [
                { icon: 'fa-plus', permission: permission.write, name: 'Tạo lớp đơn lẻ', onClick: () => this.modal.show(), type: 'primary' },
                // { icon: 'fa-clone', permission: permission.write, name: 'Tạo lớp tự động', onClick: () => this.multipleCreateModal.show(this.props.dtLop.page.list), type: 'danger' },
            ]
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, tccbLop: state.tccb.tccbLop });
const mapActionsToProps = {
    getTccbLopPage, createTccbLop, deleteTccbLop, updateTccbLop,
};
export default connect(mapStateToProps, mapActionsToProps)(AdminKhoaLopPage);
