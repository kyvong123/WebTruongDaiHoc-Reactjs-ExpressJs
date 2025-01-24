import { Link } from '@mui/material';
import { SelectAdapter_DmDonViFilter } from 'modules/mdDanhMuc/dmDonVi/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, AdminModal, FormTextBox, FormSelect, getValue, FormCheckbox, FormDatePicker, renderTable, TableCell } from 'view/component/AdminPage';
import { getAllAssignRole, getDtAssignRole, createDtAssignRole, updateDtAssignRole, deleteDtAssignRole, SelectAdapter_DtFwCanBoWithDonVi, getRolesList } from './redux';
import { SelectAdapter_DtKhoaDaoTaoFilter } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_LoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';


class AssignRoleModal extends AdminModal {
    state = { updateRolesList: [] }

    componentDidMount() {
        const listDonVi = this.props.user ? [this.props.user.maDonVi] : [];
        SelectAdapter_DtKhoaDaoTaoFilter('quanLyDaoTao:assignRole').fetchAll(dataKhoa => {
            const listKhoaSinhVien = dataKhoa.items;
            SelectAdapter_LoaiHinhDaoTaoFilter('quanLyDaoTao:assignRole').fetchAll(dataHe => {
                const listLoaiHinhDaoTao = dataHe;
                this.setState({ listDonVi, listKhoaSinhVien, listLoaiHinhDaoTao });
            });
        });

        SelectAdapter_DtDmDonVi(1).fetchAll(listKhoa => this.setState({ listKhoa }));

        this.onHidden(() => {
            this.donVi.value('');
            this.group.value('');
            this.ngayKetThuc.value('');
            this.canBo.value('');
            this.khoaSv.value('');
            this.heSv.value('');
            this.role.value('');
            this.listKhoa?.value('');
            this.nguoiGan?.value('');
        });

        const quanLyDaoTao = this.props.getCurrentPermissions().includes('quanLyDaoTao:DaiHoc'),
            nhomRoles = ['daoTao'];
        quanLyDaoTao && nhomRoles.push('quanLyDaoTao');
        getRolesList(nhomRoles, roles => this.setState({ updateRolesList: roles }));
    }

    onShow = (item) => {
        const { group, nhomUser, shccNguoiGan } = item || { group: '', nhomUser: [] }, { listDonVi } = this.state;

        this.setState({ group, nhomUser }, () => {
            this.donVi.value(listDonVi[0]);
            if (group && nhomUser.length) {
                const { khoaSinhVien, loaiHinhDaoTao, khoa, ngayKetThuc } = nhomUser[0];
                this.group.value(group);
                this.khoaSv.value(khoaSinhVien?.split(',') || '');
                this.heSv.value(loaiHinhDaoTao?.split(',') || '');
                this.listKhoa?.value(khoa?.split(',') || '');
                this.nguoiGan?.value([...new Set(shccNguoiGan.split(','))][0]);
                this.ngayKetThuc.value(ngayKetThuc || '');
                this.role.value([...new Set(nhomUser.map(i => i.role))]);
                this.canBo.value([...new Set(nhomUser.map(i => i.shccCanBo))]);
            }
        });
    }

    onSubmit = () => {
        const canBo = getValue(this.canBo),
            listRole = getValue(this.role),
            { updateRolesList } = this.state;
        const data = {
            shccCanBo: canBo,
            khoaSinhVien: getValue(this.khoaSv).sort((a, b) => Number(b) - Number(a)).join(','),
            loaiHinhDaoTao: getValue(this.heSv).join(','),
            ngayKetThuc: getValue(this.ngayKetThuc),
            khoa: this.listKhoa ? getValue(this.listKhoa).join(',') : '',
            nguoiGan: this.nguoiGan ? getValue(this.nguoiGan) : '',
            group: getValue(this.group),
        };
        data.listRole = listRole.map(role => {
            const nhomRole = updateRolesList.find(i => i.id == role)?.nhomRole;
            return { role, nhomRole };
        });

        T.confirm('Xác nhận phân công quyền cho nhóm cán bộ?', '', isConfirm => {
            if (isConfirm) {
                const { group, nhomUser } = this.state;
                group ?
                    this.props.update({ group, nhomUser }, data, this.hide) :
                    this.props.create(data, this.hide);
            }
        });
    }

    selectAll = (value, field, option) => {
        if (value) {
            const data = this.state[option];
            if (option == 'listLoaiHinhDaoTao') {
                field.value(data.map(i => i.id));
            } else field.value(data);
        } else {
            field.value('');
        }
    }

    render = () => {
        const readOnly = this.state.group;

        return this.renderModal({
            title: 'Phân quyền đào tạo',
            size: 'large',
            body: <div className='row'>
                <FormSelect ref={e => this.donVi = e} className='col-md-4' minimumResultsForSearch={-1} readOnly
                    label='Khoa/Bộ môn'
                    data={SelectAdapter_DmDonViFilter([this.props.user.maDonVi])} />
                <FormTextBox ref={e => this.group = e} className='col-md-4' required label='Tên nhóm cán bộ' readOnly={readOnly} />
                <FormDatePicker ref={e => this.ngayKetThuc = e} className='col-md-4' label='Ngày kết thúc' />
                <FormSelect ref={e => this.canBo = e} className='col-md-12' required
                    label='Cán bộ'
                    data={SelectAdapter_DtFwCanBoWithDonVi({})} multiple allowClear closeOnSelect={false} />
                <FormSelect ref={e => this.khoaSv = e} className='col-md-12' multiple required closeOnSelect={false}
                    label={<>Khóa quản lý &nbsp;<FormCheckbox id='khoasv' style={{ display: 'inline' }} label='Chọn tất cả' onChange={value => this.selectAll(value, this.khoaSv, 'listKhoaSinhVien')} /></>}
                    placeholder='Khóa quản lý'
                    data={this.state.listKhoaSinhVien} />
                <FormSelect ref={e => this.heSv = e} className='col-md-12' multiple required closeOnSelect={false}
                    label={<>Hệ quản lý &nbsp;<FormCheckbox id='hequanly' style={{ display: 'inline' }} label='Chọn tất cả' onChange={value => this.selectAll(value, this.heSv, 'listLoaiHinhDaoTao')} /></>}
                    placeholder='Hệ quản lý'
                    data={this.state.listLoaiHinhDaoTao} />
                {
                    !!Number(this.props.user.isPhongDaoTao) && <>
                        <FormSelect ref={e => this.listKhoa = e} className='col-md-12' multiple closeOnSelect={false}
                            label={<>Khoa quản lý &nbsp;<FormCheckbox id='khoaquanly' style={{ display: 'inline' }} label='Chọn tất cả' onChange={value => this.selectAll(value, this.listKhoa, 'listKhoa')} /></>}
                            placeholder='Khoa quản lý'
                            data={SelectAdapter_DtDmDonVi(1)} />

                        <FormSelect ref={e => this.nguoiGan = e} className='col-md-12' label='Người gán' data={SelectAdapter_DtFwCanBoWithDonVi({})} allowClear />
                    </>
                }
                <FormSelect ref={e => this.role = e} className='col-md-12' data={this.state.updateRolesList} label='Quyền gán' placeholder='Lựa chọn quyền' required multiple allowClear closeOnSelect={false} />
            </div>
        });
    }
}


class AssignRolePage extends AdminPage {
    state = { filter: {} }

    componentDidMount() {
        T.ready('user/tccb', () => {
            const { maDonVi: donVi } = this.props.system.user;
            this.setState({ filter: { donVi } }, () => {
                this.props.getAllAssignRole();
            });
        });
    }

    getData = () => this.props.getAllAssignRole();

    delete = (group, nhomUser) => {
        T.confirm('Bạn có chắc chắn muốn xóa quyền của cán bộ không?', 'warning', isConfirm => {
            if (isConfirm) {
                this.props.deleteDtAssignRole(group, nhomUser.map(i => ({ shcc: i.shccCanBo, role: i.role })));
            }
        });
    }

    render() {
        const user = this.props.system.user, { isPhongDaoTao } = user;
        const { items: list, listUser } = this.props.assignRole || { items: [], listUser: [] };

        return this.renderPage({
            icon: 'fa fa-leanpub',
            title: 'Phân quyền cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Phân quyền cán bộ'
            ],
            content: <div className='tile'>
                <AssignRoleModal ref={e => this.modal = e} user={user} filter={this.state.filter}
                    create={this.props.createDtAssignRole} update={this.props.updateDtAssignRole} get={this.props.getDtAssignRole} getCurrentPermissions={this.getCurrentPermissions} />

                <div className='tile-body'>
                    {renderTable({
                        getDataSource: () => list,
                        renderHead: () => <tr>
                            <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>#</th>
                            <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Nhóm cán bộ</th>
                            <th style={{ whiteSpace: 'nowrap', width: '40%' }}>Quyền</th>
                            <th style={{ whiteSpace: 'nowrap', width: '30%' }}>Khóa quản lý</th>
                            <th style={{ whiteSpace: 'nowrap', width: '30%' }}>Hệ đào tạo quản lý</th>
                            <th style={{ whiteSpace: 'nowrap', width: 'auto', display: Number(isPhongDaoTao) ? '' : 'none' }}>Khoa quản lý</th>
                            <th style={{ whiteSpace: 'nowrap', width: 'auto', display: Number(isPhongDaoTao) ? '' : 'none' }}>Người gán</th>
                            <th style={{ whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>,
                        multipleTbody: true,
                        renderRow: (item, index) => {
                            let rows = [], nhomUser = listUser.filter(i => i.nhomUser == item.nhomUser).flatMap(user => item.role.map(role => ({ shccCanBo: user.shccCanBo, role, loaiHinhDaoTao: item.loaiHinhDaoTao, khoaSinhVien: item.khoaSinhVien, ngayKetThuc: item.ngayKetThuc, khoa: item.khoa })));
                            rows.push(
                                <tr key={`group${index}`} data-toggle='collapse' data-target={`#collapse-group-${index}`} aria-expanded='true' aria-controls={`collapse-group-${index}`}>
                                    <TableCell content={index + 1} />
                                    <TableCell style={{ whiteSpace: 'nowrap', fontWeight: 'bolder' }} content={`Nhóm cán bộ: ${item.nhomUser}`} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} contentStyle={{ width: 'calc(100vh/3)', overflow: 'hidden', textOverflow: 'ellipsis' }} content={item.tenRole} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} contentStyle={{ width: 'calc(100vh/3)', overflow: 'hidden', textOverflow: 'ellipsis' }} content={item.khoaSinhVien} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} contentStyle={{ width: 'calc(100vh/3)', overflow: 'hidden', textOverflow: 'ellipsis' }} content={item.loaiHinhDaoTao} />
                                    <TableCell style={{ whiteSpace: 'nowrap', display: Number(isPhongDaoTao) ? '' : 'none' }} contentStyle={{ width: 'calc(100vh/3)', overflow: 'hidden', textOverflow: 'ellipsis' }} content={item.tenKhoa} />
                                    <TableCell style={{ whiteSpace: 'pre-wrap', display: Number(isPhongDaoTao) ? '' : 'none' }} content={[...new Set(item.nguoiGan.split(','))].toString()} />
                                    <TableCell style={{ textAlign: 'right' }} type='buttons' content={item} permission={{ write: true, delete: true }}
                                        onEdit={(e) => e.preventDefault() || this.modal.show({ group: item.nhomUser, nhomUser, shccNguoiGan: item.shccNguoiGan })}
                                        onDelete={(e) => e.preventDefault() || this.delete(item.nhomUser, nhomUser)}>
                                    </TableCell>
                                </tr>
                            );

                            rows.push(<tr className='collapse' id={`collapse-group-${index}`}>
                                <td colSpan={Number(isPhongDaoTao) ? 7 : 6}>
                                    {
                                        renderTable({
                                            getDataSource: () => listUser.filter(i => i.nhomUser == item.nhomUser),
                                            header: 'thead-light',
                                            renderHead: () => <tr>
                                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
                                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SHCC</th>
                                                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Họ tên</th>
                                                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Email</th>
                                                <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Đơn vị</th>
                                                <th style={{ whiteSpace: 'nowrap', width: 'auto', display: Number(isPhongDaoTao) ? '' : 'none' }}>Người gán</th>
                                            </tr>,
                                            renderRow: (iList, idx) => {
                                                return (<tr key={index}>
                                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={idx + 1} />
                                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={iList.shccCanBo} />
                                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={iList.hoTenCanBo} />
                                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={iList.emailCanBo} />
                                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={iList.tenDonVi} />
                                                    <TableCell style={{ whiteSpace: 'nowrap', display: Number(isPhongDaoTao) ? '' : 'none' }} content={iList.nguoiGan} />
                                                </tr>);
                                            }
                                        })
                                    }
                                </td>
                            </tr>);

                            return rows;
                        }
                    })}
                </div>
            </div>,
            backRoute: '/user/dao-tao',
            onCreate: () => this.modal.show(),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, assignRole: state.daoTao.assignRole });
const mapActionsToProps = { getAllAssignRole, getDtAssignRole, createDtAssignRole, updateDtAssignRole, deleteDtAssignRole };
export default connect(mapStateToProps, mapActionsToProps)(AssignRolePage);