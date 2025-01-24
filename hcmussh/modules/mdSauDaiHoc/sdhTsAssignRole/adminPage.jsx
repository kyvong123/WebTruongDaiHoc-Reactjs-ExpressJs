import { Link } from 'react-router-dom';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, AdminModal, FormTextBox, FormSelect, getValue, FormDatePicker, renderTable, TableCell } from 'view/component/AdminPage';
import { getAllAssignRole, getRolesList, updateSdhTsAssignRole, deleteSdhTsAssignRole, createSdhTsAssignRole } from './redux';
import { getSdhTsProcessingDot } from 'modules/mdSauDaiHoc/sdhTsInfoTime/redux';
import { SelectAdapter_SdhTsCanBo } from './redux';

class AssignRoleModal extends AdminModal {
    state = { updateRolesList: [] }

    componentDidMount() {
        this.disabledClickOutside();
        this.props.get((updateRolesList) => this.setState({ updateRolesList }));
        this.onHidden(() => {
            this.group.value('');
            this.ngayKetThuc.value('');
            this.ngayBatDau.value('');
            this.role.value([]);
            this.canBo.value([]);
        });
    }

    onShow = (item) => {
        const { id, tenNhomRole, nhomUser, ngayKetThuc, ngayBatDau, role } = item || { id: '', tenNhomRole: '', nhomUser: [], ngayKetThuc: '', ngayBatDau: '', role: [] };
        this.setState({ id, nhomUser });
        if (id) {
            this.group.value(tenNhomRole || '');
            this.ngayKetThuc.value(ngayKetThuc || '');
            this.ngayBatDau.value(ngayBatDau || '');
            this.role.value([...new Set(role)]);
            this.canBo.value([...new Set(nhomUser.map(i => i.shcc))]);
        }
    }

    onSubmit = () => {
        const canBo = getValue(this.canBo) || [],
            listRole = getValue(this.role),
            { updateRolesList } = this.state;
        let nhomUser = [];
        for (const i of canBo) {
            nhomUser = nhomUser.concat(listRole.map(role => ({ shcc: i, role })));
        }
        const data = {
            idDot: this.props.idDot,
            tenNhomRole: getValue(this.group),
            shccCanBo: canBo,
            ngayBatDau: getValue(this.ngayBatDau) ? getValue(this.ngayBatDau).getTime() : '',
            ngayKetThuc: getValue(this.ngayKetThuc) ? getValue(this.ngayKetThuc).getTime() : '',
        };
        data.listRole = listRole.map(role => {
            const nhomRole = updateRolesList.find(i => i.id == role)?.nhomRole;
            return { role, nhomRole };
        });

        T.confirm('Xác nhận phân công quyền cho nhóm cán bộ?', '', isConfirm => {
            if (isConfirm) {
                const { id } = this.state;
                id ? this.props.update({ id, nhomUser }, data, this.hide) : this.props.create(nhomUser, data, this.hide);
            }
        });
    }

    render = () => {
        const readOnly = this.state.group;
        return this.renderModal({
            title: 'Phân quyền tuyển sinh sau đại học',
            size: 'large',
            body: <div className='row'>
                <FormTextBox ref={e => this.group = e} className='col-md-4' required label='Tên nhóm cán bộ' readOnly={readOnly} />
                <FormDatePicker ref={e => this.ngayBatDau = e} className='col-md-4' label='Ngày bắt đầu' />
                <FormDatePicker ref={e => this.ngayKetThuc = e} className='col-md-4' label='Ngày kết thúc' />
                <FormSelect ref={e => this.canBo = e} className='col-md-12'
                    label='Cán bộ'
                    data={SelectAdapter_SdhTsCanBo} multiple allowClear closeOnSelect={false} />
                <FormSelect ref={e => this.role = e} className='col-md-12' data={this.state.updateRolesList} label='Quyền gán' placeholder='Lựa chọn quyền' required multiple allowClear closeOnSelect={false} />
            </div>
        });
    }
}


class AssignRolePage extends AdminPage {
    state = { filter: {} }

    componentDidMount() {
        T.ready('user/sau-dai-hoc', () => {
            this.props.getSdhTsProcessingDot(data => {
                if (data && data.id) {
                    const { maDonVi: donVi } = this.props.system.user;
                    this.setState({ filter: { donVi }, idDot: data.id }, () => {
                        this.props.getAllAssignRole();
                    });
                } else {
                    this.props.history.push('/user/sau-dai-hoc/dot-tuyen-sinh');
                }
            });
        });
    }

    delete = (id, nhomUser) => {
        T.confirm('Bạn có chắc chắn muốn xóa quyền của cán bộ không?', 'warning', isConfirm => {
            if (isConfirm) {
                this.props.deleteSdhTsAssignRole(id, nhomUser.map(i => ({ shcc: i.shccCanBo, role: i.role })));
            }
        });
    }

    render() {
        const { items: list, listUser } = this.props.assignRole || { items: [], listUser: [] };

        return this.renderPage({
            icon: 'fa fa-leanpub',
            title: 'Phân quyền cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                'Phân quyền cán bộ'
            ],
            content: <div className='tile'>
                <AssignRoleModal ref={e => this.modal = e} filter={this.state.filter} delete={this.props.deleteSdhTsAssignRole}
                    idDot={this.state.idDot} create={this.props.createSdhTsAssignRole} update={this.props.updateSdhTsAssignRole} get={this.props.getRolesList} />

                <div className='tile-body'>
                    {renderTable({
                        getDataSource: () => list,
                        renderHead: () => <tr>
                            <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>#</th>
                            <th style={{ whiteSpace: 'nowrap', width: '50%' }}>Nhóm cán bộ</th>
                            <th style={{ whiteSpace: 'nowrap', width: '50%' }}>Quyền</th>
                            <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Ngày bắt đầu</th>
                            <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Ngày kết thúc</th>
                            <th style={{ whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>,
                        multipleTbody: true,
                        renderRow: (item, index) => {
                            let rows = [], nhomUser = listUser.filter(i => i.idNhomRole == item.id).flatMap(user => item.role.map(role => ({ shcc: user.shcc, role, ngayKetThuc: item.ngayKetThuc })));
                            rows.push(
                                <tr key={`group${index}`} data-toggle='collapse' data-target={`#collapse-group-${index}`} aria-expanded='true' aria-controls={`collapse-group-${index}`}>
                                    <TableCell content={index + 1} />
                                    <TableCell style={{ whiteSpace: 'nowrap', fontWeight: 'bolder' }} content={item.tenNhomRole} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} contentStyle={{ width: 'calc(100vh/3)', overflow: 'hidden', textOverflow: 'ellipsis' }} content={item.tenRole} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap' }} contentStyle={{ width: 'calc(100vh/3)', overflow: 'hidden', textOverflow: 'ellipsis' }} content={item.ngayBatDau} readOnly={true} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap' }} contentStyle={{ width: 'calc(100vh/3)', overflow: 'hidden', textOverflow: 'ellipsis' }} content={item.ngayKetThuc} readOnly={true} />
                                    <TableCell style={{ textAlign: 'right' }} type='buttons' content={item} permission={{ write: true, delete: true }}
                                        onEdit={(e) => e.preventDefault() || this.modal.show({ ...item, nhomUser })}
                                        onDelete={(e) => e.preventDefault() || this.delete(item.id, nhomUser)}>
                                    </TableCell>
                                </tr>
                            );

                            rows.push(<tr className='collapse' id={`collapse-group-${index}`}>
                                <td colSpan={6}>
                                    {
                                        renderTable({
                                            getDataSource: () => listUser.filter(i => i.idNhomRole == item.id),
                                            header: 'thead-light',
                                            renderHead: () => <tr>
                                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
                                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SHCC</th>
                                                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Họ tên</th>
                                                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Email</th>
                                                <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Đơn vị</th>
                                            </tr>,
                                            renderRow: (iList, idx) => {
                                                return (<tr key={index}>
                                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={idx + 1} />
                                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={iList.shcc} />
                                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={iList.hoTen} />
                                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={iList.email} />
                                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={iList.donVi} />
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
            backRoute: '/user/sau-dai-hoc/tuyen-sinh',
            onCreate: () => this.modal.show(),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, assignRole: state.sdh.sdhTsAssignRole });
const mapActionsToProps = { getAllAssignRole, getSdhTsProcessingDot, getRolesList, updateSdhTsAssignRole, deleteSdhTsAssignRole, createSdhTsAssignRole };
export default connect(mapStateToProps, mapActionsToProps)(AssignRolePage);