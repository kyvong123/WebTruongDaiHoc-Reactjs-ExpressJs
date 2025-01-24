import React from 'react';
import { connect } from 'react-redux';
import { getAllTccbDrlRole, getTccbDrlRole, createDrlRole, updateDrlRole, deleteDrlRole } from './redux/drlRoleRedux';
import { AdminModal, AdminPage, FormSelect, renderTable, TableCell, getValue, FormCheckbox } from 'view/component/AdminPage';
import { SelectAdapter_DmDonViFilter } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_CtsvFwCanBoByDonVi } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_CtsvDtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoDrl } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { Link } from 'react-router-dom';

const getListDonViQuanLy = (user) => {
    let listDonViQuanLy = [...user.staff.donViQuanLy];
    (!listDonViQuanLy || listDonViQuanLy.length == 0) && (listDonViQuanLy = [{ maDonVi: user.maDonVi }]);
    // Có chúc vụ trong trung tâm đào tạo quốc tế
    if (user.staff.listChucVu && user.staff.listChucVu.length) {
        let chucVuTrungTamQuocTe = user.staff.listChucVu.find(item => item.maDonVi == 42);
        chucVuTrungTamQuocTe && listDonViQuanLy.push(chucVuTrungTamQuocTe);
    }
    return listDonViQuanLy;
};

class DrlAssignRoleModal extends AdminModal {

    componentDidMount() {
        const listDonVi = (this.props.user ? this.props.user.staff.donViQuanLy : []).map(dv => dv.maDonVi);
        SelectAdapter_CtsvDtKhoaDaoTao.fetchAll(dataKhoa => {
            const listKhoaSinhVien = dataKhoa.items;
            SelectAdapter_DmSvLoaiHinhDaoTaoDrl.fetchAll(dataHe => {
                const listLoaiHinhDaoTao = dataHe;
                this.setState({ listDonVi, listKhoaSinhVien, listLoaiHinhDaoTao });
            });
        });
    }

    onShow = (item) => {
        const { emailCanBo = '', idCanBo = '', khoaSv = '', heSv = '', maDonVi } = item || {};
        const listDonVi = this.state.listDonVi || [];

        this.setState({ idCanBo, emailCanBo, item, donVi: maDonVi || listDonVi[0] }, () => {
            this.donVi.value(maDonVi || listDonVi[0] || '');
            this.canBo.value(idCanBo);
            this.khoaSv.value(khoaSv?.split(',') || '');
            this.heSv.value(heSv?.split(',') || null);
        });
    }


    onSubmit = () => {
        const canBo = getValue(this.canBo);
        const data = {
            idCanBo: canBo,
            emailCanBo: this.state.emailCanBo,
            khoaSv: getValue(this.khoaSv).sort((a, b) => Number(b) - Number(a)).join(','),
            heSv: getValue(this.heSv).join(',')
        };

        T.confirm('Xác nhận phân công công tác điểm rèn luyện cho cán bộ?', '', isConfirm => {
            if (isConfirm) {
                this.state.idCanBo ?
                    this.props.update(this.state.emailCanBo, data, () => this.hide()) :
                    this.props.create(data, () => this.hide());
            }
        });
    }

    checkCanBo = (canBo) => {
        this.props.get(canBo.email, item => {
            if (item) {
                T.notify('Cán bộ này đã được phân công!', 'danger');
                this.canBo.value('');
            } else {
                this.setState({ emailCanBo: canBo.email });
            }
        });
    }

    selectAll = (value, field, option) => {
        if (value) {
            const data = this.state[option];
            field.value(data.map(item => item.id ? item.id : item));
        } else {
            field.value('');
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        // const listDonVi = (this.props.user ? this.props.user.staff.donViQuanLy : []).map(dv => dv.maDonVi);

        return this.renderModal({
            title: 'Phân quyền quản lý điểm rèn luyện',
            size: 'large',
            body: <div className='row'>
                <FormSelect ref={e => this.donVi = e} className='col-md-6' minimumResultsForSearch={-1} readOnly={readOnly || this.state.idCanBo}
                    label='Đơn vị'
                    data={SelectAdapter_DmDonViFilter(this.props.listDonVi)}
                    onChange={value => this.setState({ donVi: value.id }, () => this.canBo.value(''))} />
                <FormSelect ref={e => this.canBo = e} className='col-md-6' required readOnly={readOnly || this.state.idCanBo}
                    label='Cán bộ quản lý'
                    disabled={!this.state.donVi}
                    data={SelectAdapter_CtsvFwCanBoByDonVi(this.state.donVi)}
                    onChange={value => this.checkCanBo(value)} />
                <FormSelect ref={e => this.khoaSv = e} className='col-md-12' multiple required readOnly={readOnly} closeOnSelect={false}
                    label={<>Khóa quản lý &nbsp;<FormCheckbox style={{ display: 'inline' }} label='Chọn tất cả' onChange={value => this.selectAll(value, this.khoaSv, 'listKhoaSinhVien')} /></>}
                    placeholder='Khóa quản lý'
                    data={this.state.listKhoaSinhVien} />
                <FormSelect ref={e => this.heSv = e} className='col-md-12' multiple required readOnly={readOnly} closeOnSelect={false}
                    label={<>Hệ quản lý &nbsp;<FormCheckbox style={{ display: 'inline' }} label='Chọn tất cả' onChange={value => this.selectAll(value, this.heSv, 'listLoaiHinhDaoTao')} /></>}
                    placeholder='Hệ quản lý'
                    data={this.state.listLoaiHinhDaoTao} />
            </div>
        });
    }
}

class DrlAssignRolePage extends AdminPage {
    state = { filter: {} }

    componentDidMount() {
        T.ready('user/tccb', () => {
            this.props.getAllTccbDrlRole(this.filter);
        });
    }

    // Fetch data
    getData = () => this.props.getAllTccbDrlRole(this.state.filter);

    // CRUD
    delete = (emailCanBo) => {
        T.confirm('Xác nhận hủy quyền cán bộ?', '', isConfirm => isConfirm && this.props.deleteDrlRole(emailCanBo));
    }

    render() {
        const user = this.props.system.user;
        const list = this.props.tccbDrlRole && this.props.tccbDrlRole.items ? this.props.tccbDrlRole.items : [];
        const permission = this.getCurrentPermissions('manager').includes('manager:login') ? { write: true, delete: true } : {};
        // const listDonVi = (this.props.system.user ? this.props.system.user.staff.donViQuanLy : []).map(dv => dv.maDonVi);
        const listDonVi = this.state.filter && this.state.filter.donVi ?
            // [this.state.filter.donVi] : (this.props.system.user ? this.props.system.user.staff.donViQuanLy : []).map(dv => dv.maDonVi);
            [this.state.filter.donVi] : getListDonViQuanLy(user).map(dv => dv.maDonVi);
        return this.renderPage({
            title: 'Quản lý phân cấp nhân sự',
            header: <FormSelect ref={e => this.donVi = e} minimumResultsForSearch={-1}
                style={{ width: '300px', marginBottom: '0' }}
                placeholder='Danh sách đơn vị quản lý'
                data={SelectAdapter_DmDonViFilter(listDonVi)}
                onChange={value => this.setState({ filter: { ...this.state.filter, donVi: value.id } }, this.getData)} />,
            content: <div className='tile'>
                <div className='tile-body'>
                    {renderTable({
                        getDataSource: () => list,
                        renderHead: () => <tr>
                            <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>#</th>
                            <th style={{ whiteSpace: 'nowrap', width: '30%' }}>Họ tên</th>
                            <th style={{ whiteSpace: 'nowrap', width: '30%' }}>Email</th>
                            <th style={{ whiteSpace: 'nowrap', width: '40%' }}>Đơn vị</th>
                            <th style={{ whiteSpace: 'nowrap' }}>Khóa quản lý</th>
                            <th style={{ whiteSpace: 'nowrap' }}>Hệ đào tạo quản lý</th>
                            <th style={{ whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>,
                        renderRow: (item, index) => <tr key={index}>
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTenCanBo} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.emailCanBo} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenDonVi} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} contentStyle={{ width: 'calc(100vh/3)', overflow: 'hidden', textOverflow: 'ellipsis' }} content={item.khoaSv} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} contentStyle={{ width: 'calc(100vh/3)', overflow: 'hidden', textOverflow: 'ellipsis' }} content={item.heSv} />
                            <TableCell type='buttons' permission={permission}
                                onEdit={() => this.drlRoleModal.show(item)}
                                onDelete={() => this.delete(item.emailCanBo)} />
                        </tr>
                    })}
                </div>

                <DrlAssignRoleModal ref={e => this.drlRoleModal = e} listDonVi={listDonVi}
                    create={this.props.createDrlRole} update={this.props.updateDrlRole} get={this.props.getTccbDrlRole} />
            </div>,
            icon: 'fa fa-user-circle-o',
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                <Link key={1} to='/user/tccb/diem-ren-luyen'>Điểm rèn luyện</Link>,
                'Quản lý phân cấp nhân sự'
            ],
            backRoute: '/user/tccb/diem-ren-luyen',
            onCreate: () => this.drlRoleModal.show()
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbDrlRole: state.tccb.tccbDrlRole });
const mapActionsToProps = { getAllTccbDrlRole, getTccbDrlRole, createDrlRole, updateDrlRole, deleteDrlRole };
export default connect(mapStateToProps, mapActionsToProps)(DrlAssignRolePage);