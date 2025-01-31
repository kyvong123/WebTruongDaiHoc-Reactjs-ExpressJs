import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { SelectAdapter_DtDmNgoaiNgu } from 'modules/mdDaoTao/dtDmNgoaiNgu/redux';
import { SelectAdapter_DmDonViFaculty_V3, getDmDonViFaculty } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao, getDmSvLoaiHinhDaoTaoAll } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtKhoaDaoTao, getAllKhoaSinhVien } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { getDtDmChungChiNgoaiNguAll, createDtDmChungChiNgoaiNgu, updateDtDmChungChiNgoaiNgu } from './redux';
import { AdminPage, AdminModal, TableCell, renderDataTable, FormTextBox, FormCheckbox, FormSelect, getValue } from 'view/component/AdminPage';
class EditModal extends AdminModal {
    componentDidMount() {
        this.onShown(() => {
            this.ten.focus();
        });

        this.props.getAllKhoaSinhVien(items => this.setState({ khoaSinhVien: items.map(item => item.namTuyenSinh) }));
        this.props.getDmSvLoaiHinhDaoTaoAll(item => this.setState({ lhdt: item }));
        this.props.getDmDonViFaculty(item => {
            item = item.filter(e => e.ma != 32 && e.ma != 33);
            this.setState({ khoa: item });
        });
    }
    onShow = (item) => {
        let { id, ten, maNgoaiNgu, khoa, khoaSinhVien, loaiHinhDaoTao, kichHoat } = item ? item : { id: null, ten: '', khoa: '', khoaSinhVien: '', loaiHinhDaoTao: '', maNgoaiNgu: '', kichHoat: 1 };
        this.setState({ id, ten, item, }, () => {
            this.ten.value(ten);
            this.maNgoaiNgu.value(maNgoaiNgu);
            this.khoaSinhVien.value(khoaSinhVien ? khoaSinhVien.split(', ') : '');
            this.khoa.value(khoa ? khoa.split(', ') : '');
            this.loaiHinhDaoTao.value(loaiHinhDaoTao ? loaiHinhDaoTao.split(', ') : '');
            this.kichHoat.value(kichHoat);
        });
    };

    checkAll = (value, ma) => {
        if (value == true) {
            if (ma == 'lhdt') {
                let lhdt = this.state.lhdt.map(e => e.ma);
                this.loaiHinhDaoTao.value(lhdt);
            } else if (ma == 'khoa') {
                let khoa = this.state.khoa.map(e => e.ma);
                this.khoa.value(khoa);
            } else if (ma == 'khoaSinhVien') {
                let khoaSv = this.state.khoaSinhVien;
                this.khoaSinhVien.value(khoaSv);
            }
        } else {
            if (ma == 'lhdt') {
                this.loaiHinhDaoTao.value([]);
            } else if (ma == 'khoa') {
                this.khoa.value([]);
            } else if (ma == 'khoaSinhVien') {
                this.khoaSinhVien.value([]);
            }
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: getValue(this.ten),
            maNgoaiNgu: getValue(this.maNgoaiNgu),
            multipleLoaiHinhDaoTao: getValue(this.loaiHinhDaoTao).join(', '),
            multipleKhoa: getValue(this.khoa).join(', '),
            multipleKhoaSV: getValue(this.khoaSinhVien).join(', '),
            kichHoat: Number(getValue(this.kichHoat))
        };

        this.state.ten ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
    };

    render = () => {
        const readOnly = this.props.readOnly;
        // let { kyNang } = this.state;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật chứng chỉ ngoại ngữ' : 'Tạo mới chứng chỉ ngoại ngữ',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-6' ref={e => this.ten = e} label='Tên chứng chỉ ngoại ngữ' readOnly={readOnly} placeholder='Tên chứng chỉ ngoại ngữ' required />
                <FormSelect className='col-6' ref={e => this.maNgoaiNgu = e} label='Ngoại ngữ' readOnly={readOnly} data={SelectAdapter_DtDmNgoaiNgu} required />

                <div className='col-md-3' > <label >Loại hình đào tạo áp dụng</label>  <span className='text-danger' >*</span> </div>
                <FormCheckbox ref={e => this.allLHDT = e} className='col-md-9' label='Chọn tất cả'
                    onChange={(value) => {
                        this.checkAll(value, 'lhdt');
                    }} />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} className='col-md-12' data={SelectAdapter_DmSvLoaiHinhDaoTao} multiple placeholder='Loại hình đào tạo' required />

                <div className='col-md-3' > <label>Khoa áp dụng</label>  <span className='text-danger' >*</span> </div>
                <FormCheckbox ref={e => this.allKhoa = e} className='col-md-9' label='Chọn tất cả'
                    onChange={(value) => {
                        this.checkAll(value, 'khoa');
                    }} />
                <FormSelect ref={e => this.khoa = e} className='col-md-12' data={SelectAdapter_DmDonViFaculty_V3} multiple placeholder='Khoa' required />

                <div className='col-md-3' > <label>Khoá sinh viên áp dụng</label>  <span className='text-danger' >*</span> </div>
                <FormCheckbox ref={e => this.allKhoaSinhVien = e} className='col-md-9' label='Chọn tất cả'
                    onChange={(value) => {
                        this.checkAll(value, 'khoaSinhVien');
                    }} />
                <FormSelect ref={e => this.khoaSinhVien = e} className='col-md-12' data={SelectAdapter_DtKhoaDaoTao} multiple placeholder='Khóa sinh viên' required />

                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }} required />
            </div>
        }
        );
    };
}

class DtDmChungChiNgoaiNguPage extends AdminPage {
    componentDidMount() {
        T.showSearchBox();
        this.props.getDtDmChungChiNgoaiNguAll();
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    render() {
        const permission = this.getUserPermission('dtDmChungChiNgoaiNgu', ['manage', 'write', 'delete']);
        let items = this.props.dtDmChungChiNgoaiNgu ? this.props.dtDmChungChiNgoaiNgu.items : [];
        const table = renderDataTable({
            data: items,
            header: 'thead-light',
            stickyHead: items && items.length > 10,
            emptyTable: 'Không có chứng chỉ ngoại ngữ',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên chứng chỉ</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngoại ngữ</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Khoa áp dụng</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Khoá SV áp dụng</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Hệ đào tạo áp dụng</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell type='link' style={{ textAlign: 'center' }} content={item.ten} onClick={(e) => e.preventDefault() || this.modal.show(item)} />
                    <TableCell content={item.tenNgoaiNgu} />
                    <TableCell contentClassName='multiple-lines-3' contentStyle={{ width: 'auto' }} content={item.tenKhoa} />
                    <TableCell contentClassName='multiple-lines-2' contentStyle={{ width: 'auto' }} content={item.khoaSinhVien} />
                    <TableCell contentClassName='multiple-lines-3' contentStyle={{ width: 'auto' }} content={item.loaiHinhDaoTao} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={value => this.props.updateDtDmChungChiNgoaiNgu(item.ma, { kichHoat: value ? 1 : 0 })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} />
                </tr>
            )
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách chứng chỉ ngoại ngữ',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/certificate-management'>Quản lý chứng chỉ</Link>,
                'Chứng chỉ ngoại ngữ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createDtDmChungChiNgoaiNgu} update={this.props.updateDtDmChungChiNgoaiNgu}
                    getAllKhoaSinhVien={this.props.getAllKhoaSinhVien}
                    getDmSvLoaiHinhDaoTaoAll={this.props.getDmSvLoaiHinhDaoTaoAll}
                    getDmDonViFaculty={this.props.getDmDonViFaculty}
                />
            </>,
            backRoute: '/user/dao-tao/certificate-management',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDmChungChiNgoaiNgu: state.daoTao.dtDmChungChiNgoaiNgu });
const mapActionsToProps = {
    getDtDmChungChiNgoaiNguAll, createDtDmChungChiNgoaiNgu, updateDtDmChungChiNgoaiNgu, getAllKhoaSinhVien, getDmSvLoaiHinhDaoTaoAll, getDmDonViFaculty
};
export default connect(mapStateToProps, mapActionsToProps)(DtDmChungChiNgoaiNguPage);