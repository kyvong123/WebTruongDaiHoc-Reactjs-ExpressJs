import Pagination from 'view/component/Pagination';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, FormTextBox, getValue, FormSelect, FormCheckbox, renderDataTable, TableHead, FormTabs, renderTable } from 'view/component/AdminPage';
import { getSdhLopHocVienPage, updateSdhLopHocVien, deleteSdhLopHocVien, createSdhLopHocVien, getSdhLopCtdt } from './redux';
import { SelectAdapter_DmNganhSdh } from '../dmNganhSauDaiHoc/redux';
import { SelectAdapter_DmHocSdhVer2 } from 'modules/mdSauDaiHoc/dmHocSdh/redux';
import { SelectAdapter_KhungDaoTaoSdh } from '../sdhCauTrucKhungDaoTao/redux';
// To do
// import { SelectAdapter_DmHocSdhVer2 } from 'modules/mdDanhMuc/dmHocSdh/redux';
// import MultipleCreateModal from './multipleCreateModal';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() =>
            this.onShown(() => {
                !this.maLop.value() ? this.maLop.focus() : this.ten.focus();
            })
        );
    }

    onShow = (item) => {
        let { ma, ten, nienKhoa, maNganh, heDaoTao, kichHoat, khoaSinhVien, namBatDau, maCtdt, idKDT, tenNganhHoc } = item ? item : { ma: '', ten: '', nienKhoa: '', maNganh: '', heDaoTao: '', khoaSinhVien: '', namBatDau: '', maCtdt: '', idKDT: '', tenNganhHoc: '' };
        this.setState({ ma, item, khoaSinhVien, heDaoTao, maNganh, idKDT, tenNganhHoc, maCtdt }, () => {
            this.maCtdt.value(maCtdt || '');
        });
        this.maLop.value(ma || '');
        this.ten.value(ten || '');
        this.nienKhoa.value(nienKhoa || '');
        this.maNganh.value(maNganh || '');
        this.heDaoTao.value(heDaoTao || '');
        this.khoaSinhVien.value(khoaSinhVien || '');
        this.namBatDau.value(namBatDau || '');
        this.kichHoat.value(kichHoat ? 1 : 0);
        if (ma !== '') {
            let filter = { khoaSinhVien, heDaoTao, maLop: ma };
            this.props.getPage(undefined, undefined, '', filter, (data) => {
                this.setState({ dssv: data.dsSv });
            });

            let filterCtdt = { khoaSinhVien, nganh: maNganh, loaiHinhDaoTao: heDaoTao, maCtdt, khungDaoTao: idKDT };
            this.props.getCtdt(filterCtdt, dsCtdt => {
                this.setState({ dsCtdt });
            });
        }
    };

    changeNganh = (value) => {
        this.maLop.value(value.maLop);
        this.maLop.focus();
    }

    onSubmit = (e) => {
        const changes = {
            ma: getValue(this.maLop),
            ten: getValue(this.ten),
            nienKhoa: getValue(this.nienKhoa),
            khoaSinhVien: getValue(this.khoaSinhVien),
            namBatDau: getValue(this.namBatDau),
            nganh: getValue(this.maNganh),
            heDaoTao: getValue(this.heDaoTao),
            maCtdt: getValue(this.maCtdt),
            kichHoat: this.kichHoat.value() ? 1 : 0
        };
        if (this.state.ma) {
            if (changes.kichHoat == 0 && this.state.item.kichHoat == 1) {
                T.confirm('Tắt kích hoạt lớp này', 'Bạn có chắc tắt kích hoạt lớp này? Tất cả các sinh viên thuộc lớp này sẽ bị đẩy ra khỏi lớp', 'warning', true, (isConfirm) => isConfirm && this.props.updatedata(this.state.ma, changes, this.hide));
            } else {
                this.props.updatedata(this.state.ma, changes, this.hide);
            }
        } else {
            this.props.create(changes, this.hide);
        }
        e.preventDefault();
    };

    changeKichHoat = (value) => this.kichHoat.value(Number(value));

    changeActiveModal = (item) => {
        if (this.maLop && getValue(this.maLop)) {
            if (!item) {
                T.confirm('Cảnh báo', 'Thao tác sẽ đẩy các sinh viên hiện tại ra khỏi lớp. Bạn có chắc muốn tiếp tục', 'warning', true, (isConfirm) => isConfirm && this.props.updatedata(getValue(this.maLop), { kichHoat: item ? 1 : 0 }));
            } else this.props.updatedata(getValue(this.maLop), { kichHoat: item ? 1 : 0 });
        }
    };
    changeKhoaSinhVien = () => {
        this.setState({ khoaSinhVien: getValue(this.khoaSinhVien) }, () => {
            this.maCtdt && this.maCtdt.value('');
        });
    }


    copyMaLop = (e) => {
        e.preventDefault();
        const ma = this.maLop.value();
        this.ten.value(ma);
    }

    render = () => {
        const { heDaoTao, khoaSinhVien, maNganh } = this.state;
        const readOnly = this.props.readOnly;
        let lop =
            <div className='row'>
                <FormSelect ref={(e) => (this.maNganh = e)} label='Chọn ngành' data={SelectAdapter_DmNganhSdh()} className='col-md-12' readOnly={this.state.ma ? true : readOnly} onChange={this.changeNganh} required />
                <FormSelect ref={(e) => (this.heDaoTao = e)} data={SelectAdapter_DmHocSdhVer2} label='Hệ đào tạo' className='col-md-6' readOnly={this.state.ma ? true : readOnly} required onChange={value => { this.setState({ heDaoTao: value && value.id }); this.maCtdt.value(null); }} />
                <FormTextBox type='text' ref={(e) => (this.khoaSinhVien = e)} onBlur={this.changeKhoaSinhVien} label='Khóa sinh viên' className='col-md-6' readOnly={this.state.ma ? true : readOnly} required />
                <FormSelect ref={(e) => (this.maCtdt = e)} data={this.state.tenNganhHoc ? SelectAdapter_KhungDaoTaoSdh(heDaoTao, khoaSinhVien, maNganh) : [this.state.maCtdt]} label='Chương trình đào tạo' className='col-md-12' readOnly required />
                <FormTextBox type='scholastic' className='col-md-6' ref={(e) => (this.nienKhoa = e)} label='Niên khóa' readOnly={readOnly} required />
                <FormTextBox type='scholastic' className='col-md-6' ref={(e) => (this.namBatDau = e)} label='Năm học bắt đầu' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.maLop = e} label='Mã lớp' readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={(e) => (this.ten = e)} label={<span>Tên lớp {!readOnly && <a href='#' onClick={this.copyMaLop}>(Giống mã lớp)</a>}</span>} placeholder='Tên lớp' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={(e) => (this.kichHoat = e)} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={(value) => this.changeKichHoat(value)} />
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
                        <TableCell style={{ textAlign: 'left' }} content={item.tenMonHoc} />
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
            title: this.state.ma ? 'Cập nhật dữ liệu lớp' : 'Tạo lớp mới',
            size: 'large',
            body: (
                this.state.ma !== '' ? <FormTabs ref={e => this.tab = e} tabs={[
                    { title: 'Thông tin lớp sinh viên', component: <div className='tile'>{lop}</div> },
                    { title: 'Danh sách sinh viên trong lớp', component: <div className='tile'>{tableSv}</div> },
                    { title: 'Danh sách môn CTĐT của lớp', component: <div className='tile'>{tableCtdt}</div> }
                ]} /> : <div>{lop}</div>
            )
        });
    };
}


class AdminSdhLopPage extends AdminPage {
    state = { page: null, filter: {}, heDaoTao: '', khoaSinhVien: '' };
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.onSearch = (searchText) => this.props.getSdhLopHocVienPage(undefined, undefined, searchText || '');
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
        T.confirm('Xóa lớp sinh viên', 'Bạn có chắc bạn muốn xóa lớp sinh viên này?', 'warning', true, (isConfirm) => isConfirm && this.props.deleteSdhLopHocVien(item.ma));
    };

    changeActive = ({ ma, kichHoat }) => {
        if (kichHoat == 1) {
            T.confirm('Tắt kích hoạt lớp này', 'Bạn có chắc tắt kích hoạt lớp này? Tất cả các sinh viên thuộc lớp này sẽ bị đẩy ra khỏi lớp', 'warning', true, (isConfirm) => isConfirm && this.props.updateSdhLopHocVien(ma, { kichHoat: Number(!kichHoat) }));
        } else this.props.updateSdhLopHocVien(ma, { kichHoat: Number(!kichHoat) });
    };

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getSdhLopHocVienPage(pageN, pageS, pageC, this.state.filter, done);
    };

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    render() {
        const permission = this.getUserPermission('sdhLopHocVien');
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list = [] } = this.props.sdhLopHocVien && this.props.sdhLopHocVien.page ? this.props.sdhLopHocVien.page : { pageNumber: 1, pageSize: 10, pageTotal: 1, totalItem: 0, list: null };
        let table = renderDataTable({
            data: list,
            stickyHead: true,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Mã lớp' keyCol='maLop' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '45%', whiteSpace: 'nowrap' }} content='Tên lớp' keyCol='tenLop' onKeySearch={this.handleKeySearch} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Sĩ số</th>
                    <TableHead style={{ width: '25%', whiteSpace: 'nowrap' }} content='Mã ngành' keyCol='maNganh' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '20%', whiteSpace: 'nowrap' }} content='Tên ngành' keyCol='tenNganh' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap' }} content='Mã CTDT' keyCol='maCtdt' onKeySearch={this.handleKeySearch} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm học bắt đầu</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Niên khóa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khóa sinh viên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ đào tạo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            multipleTbody: true,
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='link' className='text-primary' url={`/user/sau-dai-hoc/lop/detail/${item.ma}`} content={item.ma ? <b>{item.ma}</b> : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' className='text-primary' content={item.ten ? <b>{item.ten}</b> : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' className='text-primary' content={item.siSo ? <b>{item.siSo}</b> : <b>0</b>} />
                    <TableCell type='text' className='text-primary' content={item.maNganh ? <b>{item.maNganh}</b> : ''} />
                    <TableCell type='text' className='text-primary' content={item.tenNganh ? <b>{item.tenNganh}</b> : ''} />
                    {item.maCtdt ? <TableCell type='link' className='text-primary' url={`/user/sau-dai-hoc/chuong-trinh-dao-tao/${item.idKhungDaoTao}`} content={<b>{item.maCtdt}</b>} /> :
                        <TableCell type='text' className='text-primary' content={''} />}
                    <TableCell type='text' className='text-primary' style={{ width: 'auto', whiteSpace: 'nowrap' }} content={item.namBatDau ? <b>{item.namBatDau}</b> : ''} />
                    <TableCell type='text' className='text-primary' style={{ width: 'auto', whiteSpace: 'nowrap' }} content={item.nienKhoa ? <b>{item.nienKhoa}</b> : ''} />
                    <TableCell type='text' className='text-primary' style={{ width: 'auto', whiteSpace: 'nowrap' }} content={item.khoaSinhVien ? <b>{item.khoaSinhVien}</b> : ''} />
                    <TableCell type='text' className='text-primary' style={{ width: 'auto', whiteSpace: 'nowrap' }} content={item.heDaoTao ? <b>{item.heDaoTao}</b> : ''} />
                    <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission} onChanged={() => this.changeActive(item)} />
                    <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr>
            ),
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Quản lý lớp sinh viên',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>
                    Sau đại học
                </Link>,
                'Lớp sinh viên',
            ],
            content: (
                <>
                    <div className='tile'>{table}</div>
                    <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />
                    <EditModal ref={(e) => (this.modal = e)} readOnly={!permission.write} getPage={this.props.getSdhLopHocVienPage} getCtdt={this.props.getSdhLopCtdt} updatedata={this.props.updateSdhLopHocVien} create={this.props.createSdhLopHocVien} />
                    {/* <LopChuyenNganhModal ref={(e) => (this.lopmodal = e)} readOnly={!permission.write} create={this.props.createCtsvLop} update={this.props.updateCtsvLop} /> */}
                    {/* <MultipleCreateModal ref={e => this.multipleCreateModal = e} filter={this.state.filter} dtLop={this.props.dtLop} permission={permission} /> */}
                </>
            ),
            backRoute: '/user/sau-dai-hoc/lop-hoc-vien',
            collapse: [
                { icon: 'fa-plus', permission: permission.write, name: 'Tạo lớp đơn lẻ', onClick: () => this.modal.show(), type: 'primary' },
                // { icon: 'fa-clone', permission: permission.write, name: 'Tạo lớp tự động', onClick: () => this.multipleCreateModal.show(this.props.dtLop.page.list), type: 'danger' },
            ]
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, sdhLopHocVien: state.sdh.sdhLopHocVien });
const mapActionsToProps = {
    getSdhLopHocVienPage, updateSdhLopHocVien, deleteSdhLopHocVien, createSdhLopHocVien, getSdhLopCtdt
};
export default connect(mapStateToProps, mapActionsToProps)(AdminSdhLopPage);
