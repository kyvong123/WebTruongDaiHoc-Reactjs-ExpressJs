import React from 'react';
import { connect } from 'react-redux';
import { updateSvManageForm, getSvManageFormPage, downloadWord, deleteSvManageForm, createsvManageForm } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, getValue, FormSelect, FormTabs, FormCheckbox, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';
import { SelectAdapter_PhoTruongDonVi } from 'modules/mdTccb/qtChucVu/redux';
import { SelectAdapter_FwStudentsManageForm } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_DmNoiNhanForm } from 'modules/mdCongTacSinhVien/svDmNoiNhanForm/redux';
import RejectModal from './RejectModal';
import { SelectAdapter_CtsvDmFormType } from 'modules/mdCongTacSinhVien/svDmFormType/redux';
import CustomParamComponent from './component/customParam';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';

const APPROVED_MAPPER = {
    3: <span className='text-primary'><i className='fa fa-asterisk' /> Đang xử lý</span>,
    2: <span className='text-success'><i className='fa fa-check' /> Đã nhận</span>,
    1: <span className='text-info'><i className='fa fa-clock-o' /> Chấp nhận</span>,
    0: <span className='text-danger'><i className='fa fa-plus-square' /> Đăng ký mới</span>,
    [-1]: <span className='text-secondary'><i className='fa fa-times' /> Từ chối</span>,
}, TEXT_APPROVED_MAPPER = {
    'C': 'hoàn thành',
    'A': 'xử lý',
};
const filterMapper = {
    0: { tinhTrang: null, isQuaHan: null },
    1: { tinhTrang: 'N', isQuaHan: null },
    2: { tinhTrang: 'A', isQuaHan: null },
    3: { tinhTrang: 'C', isQuaHan: null },
    4: { tinhTrang: null, isQuaHan: 1 },
};

export class AddModal extends AdminModal {
    state = { namHoc: '', register: '', tenForm: '', customParam: [], kyKhuyetDanh: false, staffSignPosition: '', selectValue: {}, host: {} }
    custom = {}
    componentDidMount() {
        this.onHidden(this.onHide);
    }

    onShow = (item) => {
        let { mssv, register } = item ? item : { register: '' };
        this.setState({ register, item });
        this.mssv.value(mssv);
    }

    onSubmit = (e) => {
        e.preventDefault();
        if (!this.state.register) throw this.mssv;
        const svManageForm = {
            register: this.state.register,
            soNgayXuLy: this.state.soNgayXuLy,
            formType: getValue(this.formType),
            staffSign: this.state.kyKhuyetDanh ? null : getValue(this.nguoiKy),
            staffSignPosition: this.state.kyKhuyetDanh ? 'Trưởng phòng' : this.state.staffSignPosition,
            noiNhan: getValue(this.noiNhan),
            action: 'A',
            dataCustom: this.getDataDangKy(),

            model: JSON.stringify(this.state.customParam)
        };
        this.props.create(svManageForm, data => {
            this.hide();
            data.maDangKy = data.id;
            data.maFormDangKy = data.formType;
            data.mssvDangKy = data.register.substr(0, data.register.indexOf('@'));
            this.props.download(e, data);
        });
    }

    getDataDangKy = () => {
        let data = {};
        this.state.customParam.forEach(item => {
            Object.assign(data, this[item.ma].getDataDangKy());
        });
        return JSON.stringify(data);
    }

    changeRegister = item => {
        this.setState({ register: item.email, host: { mssv: item.id, hoTen: item.text.split(': ')[1] } });
    }

    changeFormType = (value) => {
        this.setState({ customParam: [], tenForm: value.ten, selectValue: {}, soNgayXuLy: value.nProcessDay });
        this.setState({ customParam: value.customParam.map(item => { item.data = JSON.parse(item.data); return item; }) }, () => {
            this.state.customParam.forEach(item => {
                this[item.ma]?.value('');
                if (item.type == '1')
                    this[item.ma].value(item.data.text);
            });
        });
    }

    changeKyKhuyetDanh = (value) => {
        this.setState({ kyKhuyetDanh: value });
    }

    changeChucVu = (value) => {
        const content = value.text;
        this.setState({ staffSignPosition: content.split(': ')[0] });
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Đăng ký chứng nhận',
            body: (<div className='row' style={{ maxHeight: '73vh', overflow: 'hidden auto' }}>
                <FormSelect ref={e => this.mssv = e} label='Sinh viên đăng ký' className='col-md-12' data={SelectAdapter_FwStudentsManageForm} required onChange={this.changeRegister} readOnly={readOnly} />
                <FormSelect ref={e => this.namHoc = e} label='Năm học' className='col-md-6' data={Array.from({ length: 4 }, (_, i) => ({ id: `${new Date().getFullYear() - i} - ${new Date().getFullYear() - i + 1}`, text: `${new Date().getFullYear() - i} - ${new Date().getFullYear() - i + 1}` }))} readOnly={readOnly} required onChange={value => {
                    this.setState({ namHoc: value.id });
                    this.formType.value(null);
                }} />
                <FormSelect ref={e => this.formType = e} label='Loại chứng nhận' className='col-md-6' data={SelectAdapter_CtsvDmFormType(this.state.namHoc, 0)} onChange={this.changeFormType} readOnly={readOnly} required />
                {this.state.customParam.length ? this.state.customParam.map((item, index) => {
                    return <CustomParamComponent key={index} ref={e => this[item.ma] = e} param={item} host={this.state.host} />;
                }) : null}
                <FormSelect type='text' className='col-md-12' ref={e => this.noiNhan = e} data={SelectAdapter_DmNoiNhanForm} label='Nơi nhận kết quả' placeholder='Nơi nhận kết quả' readOnly={readOnly} required />
                <FormCheckbox ref={e => this.kyKhuyetDanh = e} label='Ký khuyết danh' className='col-md-12' onChange={value => this.changeKyKhuyetDanh(value)} />
                <FormSelect ref={e => this.nguoiKy = e} disabled={this.state.kyKhuyetDanh ? true : false} label='Chọn cán bộ ký' className='col-md-12' data={SelectAdapter_PhoTruongDonVi(32)} onChange={this.changeChucVu} required readOnly={readOnly} />
            </div>),
            submitText: 'Tạo mới'
        }
        );
    }
}

export class EditModal extends AdminModal {
    state = { isSubmit: false, customParam: [], model: [], staffSignPosition: '', kyKhuyetDanh: false, namHocTruoc: false }
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.nguoiKy?.focus();
        }));
        this.onHidden(this.onHide);
    }

    onHide = () => {
        if (!this.state.isSubmit && this.state.maDangKy) {
            this.props.update(this.state.maDangKy, { pending: 0 });
        }
    }

    onShow = (item) => {
        let { maDangKy, emailDangKy, tenDangKy, hoDangKy, mssvDangKy, tenFormDangKy, staffSign, noiNhan, model, dataCustom, ghiChu } = item ? item : { maDangKy: '', emailDangKy: '', tenDangKy: '', hoDangKy: '', mssvDangKy: '', tenFormDangKy: '', staffSign: '', noiNhan: '', model: '', dataCustom: '', ghiChu: '' };
        this.id.value(maDangKy);
        this.registerName.value(hoDangKy + ' ' + tenDangKy);
        this.registerEmail.value(emailDangKy);
        this.formType.value(tenFormDangKy);
        this.mssv.value(mssvDangKy);
        this.ghiChu.value(ghiChu);
        this.nguoiKy.value(staffSign);
        this.noiNhan.value(noiNhan);
        this.kyKhuyetDanh.value(false);
        this.namHocTruoc.value(false);
        dataCustom = T.parse(dataCustom);
        let customParam = [];
        model && JSON.parse(model).forEach(param => {
            customParam.push({
                ...param,
                'giaTri': dataCustom[param.ma]
            });
        });
        this.setState({ maDangKy, item, customParam, isSubmit: false, kyKhuyetDanh: false, namHocTruoc: false }, () => {
            this.props.update(item.maDangKy, { pending: 1, staffPending: this.props.user.email });
            this.state.customParam.forEach(param => {
                this[param.ma]?.value(param.giaTri);
            });
        });
    };

    onSubmit = (e) => {
        const { soNgayXuLy = 2 } = this.state.item || {};
        e.preventDefault();
        const changes = {
            staffSign: this.state.kyKhuyetDanh ? null : getValue(this.nguoiKy),
            staffSignPosition: this.state.kyKhuyetDanh ? 'Trưởng phòng' : this.state.position,
            lyDoTuChoi: null,
            pending: 0,
            action: 'A', // Accept (Xử lý),
            namHocOffset: this.state.namHocTruoc ? 1 : 0,
            soNgayXuLy,
        };
        this.state.maDangKy ? this.props.update(this.state.maDangKy, changes, () => {
            this.setState({ isSubmit: true });
            T.notify('Xác nhận sẽ được tải sau vài giây!', 'success');
            this.hide();
            this.props.download(e, this.state.item);
        }) : null;
    };

    changeChucVu = (value) => {
        const content = value.text;
        this.setState({ position: content.split(': ')[0] });
    }

    changeKyKhuyetDanh = (value) => {
        this.setState({ kyKhuyetDanh: value });
    }

    render = () => {
        return this.renderModal({
            title: this.state.maDangKy && 'Xử lý form đăng ký mới',
            body: (<div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.id = e} label='Mã form' placeholder='Mã form' required readOnly={true} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.registerName = e} label='Sinh viên đăng ký' placeholder='Sinh viên đăng ký' readOnly={true} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.registerEmail = e} label='Email đăng ký' placeholder='Email đăng ký' readOnly={true} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.mssv = e} label='MSSV đăng ký' placeholder='Mã số sinh viên' readOnly={true} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.formType = e} label='Loại form' placeholder='Loại form' readOnly={true} required />
                {
                    this.state.customParam.length ? this.state.customParam.map((param, index) => (
                        <CustomParamComponent key={index} ref={e => this[param.ma] = e} param={param} readOnly />
                    )) : []
                }
                <FormRichTextBox ref={e => this.ghiChu = e} label='Thông tin bổ sung' className='form-group col-md-12' readOnly />
                <FormTextBox type='text' className='col-md-12' ref={e => this.noiNhan = e} label='Nơi nhận kết quả' placeholder='Nơi nhận kết quả' readOnly={true} required />
                <FormCheckbox ref={e => this.kyKhuyetDanh = e} label='Ký khuyết danh' className='col-md-4' onChange={value => this.changeKyKhuyetDanh(value)} />
                <FormCheckbox ref={e => this.namHocTruoc = e} label='Đăng ký lùi năm học' className='col-md-4' onChange={value => this.setState({ namHocTruoc: value })} />
                <FormSelect ref={e => this.nguoiKy = e} label='Chọn cán bộ ký' disabled={this.state.kyKhuyetDanh ? true : false} className='col-md-12' data={SelectAdapter_PhoTruongDonVi(32)} onChange={this.changeChucVu} required />
            </div>),
            submitText: 'Tải xuống'
        }
        );
    }
}

class svManageFormPage extends AdminPage {
    state = { nQuaHan: 0, filter: {}, isLoading: false }
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.getPage(undefined, undefined, '');
            T.socket.on('updated-data', (data) => {
                if (data && !data.isNew) {
                    const { firstName, lastName, action, maDangKy } = data;
                    TEXT_APPROVED_MAPPER[action] && T.notify(`${data.isStudent ? 'Sinh viên' : 'Cán bộ'} ${firstName} ${lastName} đã ${TEXT_APPROVED_MAPPER[action]} !${maDangKy}`, 'info');
                }
                this.getPage();
            });
        });
    }

    componentWillUnmount() {
        T.socket.off('updated-data');
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    duyetYeuCau = (item) => {
        T.confirm('Xác nhận hoàn thành', 'Bạn có chắc đã hoàn thành yêu cầu ?', 'warning', true, isConfirm => {
            isConfirm && this.props.updateSvManageForm(item.maDangKy, { action: 'C' });
        });
    }

    downloadWord = (e, item) => {
        e.preventDefault();
        this.props.downloadWord(item.maDangKy, data => {
            T.FileSaver(new Blob([new Uint8Array(data.content.data)]), data.filename);
        });
    }

    exportData = (e) => {
        e.preventDefault();
        T.download('/api/ctsv/manage-form/export');
    }

    deleteItem = (item) => {
        T.confirm('Xóa form đăng ký này', 'Bạn có chắc bạn muốn xóa form đăng ký này?', true, isConfirm =>
            isConfirm && this.props.deleteSvManageForm(item.maDangKy));
    }

    renderSwitch(param) {
        switch (param) {
            case null:
                return APPROVED_MAPPER[0];
            case 'A':
                return APPROVED_MAPPER[1];
            case 'C':
                return APPROVED_MAPPER[2];
            case 'P':
                return APPROVED_MAPPER[3];
            case 'R':
                return APPROVED_MAPPER[-1];
            default:
                return 'Unknown State';
        }
    }

    renderTab = ({ permission, user }) => {
        const items = this.props.ctsvManageForm?.page?.list;
        return renderTable({
            getDataSource: () => this.state.isLoading ? null : items,
            className: 'table-fix-col',
            stickyHead: true,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Mã</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Nơi nhận</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>MSSV</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Sinh viên đăng ký</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái sinh viên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại chứng nhận</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thông tin bổ sung</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Ngày đăng ký</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Ngày xử lý</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Người xử lý</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Ngày hoàn thành</th>
                    <th style={{ width: '15%' }}>Tình trạng</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={item.maDangKy} />
                    <TableCell type='text' style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.noiNhan} />
                    <TableCell type='text' content={item.mssvDangKy} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hoDangKy != null && (item.hoDangKy + ' ' + item.tenDangKy)} />
                    <TableCell content={item.tinhTrangSinhVien} />
                    <TableCell type='text' contentClassName='multiple-lines-3' content={item.tenFormDangKy} />
                    <TableCell type='text' style={{ textAlign: 'left' }} content={item.ghiChu} />
                    <TableCell type='date' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.thoiGianDangKy ? item.thoiGianDangKy : ''} dateFormat='dd/mm/yyyy HH:MM:ss' />
                    <TableCell type='date' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.thoiGianXuLy ? item.thoiGianXuLy : ''} dateFormat='dd/mm/yyyy HH:MM:ss' />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.hoNguoiXuLy != null && (item.hoNguoiXuLy + ' ' + item.tenNguoiXuLy)} />
                    <TableCell type='date' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.thoiGianHoanThanh ? item.thoiGianHoanThanh : ''} dateFormat='dd/mm/yyyy HH:MM:ss' />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={this.renderSwitch(item.pending ? 'P' : item.tinhTrang)} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<>
                        {([null, 'R', 'A'].includes(item.tinhTrang) && (item.pending == 0 || user.email == item.staffPending)) && <Tooltip title='Xác nhận xử lý' arrow>
                            <button className='btn btn-info' onClick={e => {
                                e.preventDefault();
                                this.modal.show(item);
                            }}>
                                <i className='fa fa-lg fa-hand-paper-o' />
                            </button>
                        </Tooltip>}
                        {permission.write && (item.tinhTrang != 'C' && (item.pending == 0 || user.email == item.staffPending)) && <Tooltip title='Từ chối' arrow>
                            <button className='btn btn-danger' onClick={e => { e.preventDefault(); this.rejectModal.show(item); }}>
                                <i className={item.tinhTrang === 'R' ? 'fa fa-lg fa-exclamation' : 'fa fa-lg fa-ban'} />
                            </button>

                        </Tooltip>}
                        {(item.tinhTrang == 'C' || item.tinhTrang == 'A') && <Tooltip title='Download' arrow>
                            <button className='btn btn-warning' onClick={e => { e.preventDefault(); this.downloadWord(e, item); }}>
                                <i className='fa fa-lg fa-download' />
                            </button>

                        </Tooltip>}
                        {permission.delete && <Tooltip title='Xóa' arrow>
                            <button className='btn btn-secondary' onClick={e => { e.preventDefault(); this.deleteItem(item); }}>
                                <i className='fa fa-lg fa-trash-o' />
                            </button>

                        </Tooltip>}
                    </>
                    }>
                    </TableCell>
                </tr>
            )
        });
    }

    getPage = (pageNumber, pageSize, pageCondition, done) => {
        this.props.getSvManageFormPage(pageNumber, pageSize, pageCondition, this.state.filter, data => {
            const list = data?.list;
            this.setState({
                isLoading: false,
                nQuaHan: list.filter(item => item.tinhTrang == null && (Date.now() - item.thoiGianDangKy) > item.soNgayXuLy * 86400000).length,
                nNew: list.filter(item => !item.tinhTrang).length,
            }, done);
        });
    }

    render() {
        const permission = this.getUserPermission('manageForm', ['read', 'write', 'delete', 'ctsv']),
            user = this.props.system.user;
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, dsCanBo } = this.props.ctsvManageForm && this.props.ctsvManageForm.page ? this.props.ctsvManageForm.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let { soDangKyMoi, soDangKyQuaHan } = this.props.ctsvManageForm ? this.props.ctsvManageForm : { soDangKyMoi: 0, soDangKyQuaHan: 0 };
        return this.renderPage({
            icon: 'fa fa-snowflake-o',
            title: 'Chứng nhận trực tuyến',
            breadcrumb: [
                <Link key={0} to={'/user/ctsv'}>
                    Công tác sinh viên
                </Link>,
                'Chứng nhân trực tuyến',
            ],
            header: <>
                <div style={{ display: 'flex' }}>
                    <FormSelect className='mr-3' allowClear={true} style={{ width: '120px' }} placeholder='Năm học' ref={e => this.namHoc = e} data={SelectAdapter_SchoolYear} onChange={value => {
                        if (value) {
                            this.setState({ filter: { ...this.state.filter, namHoc: value?.id || null } }, () => {
                                this.getPage(pageNumber, pageSize, pageCondition);
                            });
                        } else {
                            this.setState({ filter: { ...this.state.filter, namHoc: null, hocKy: null } }, () => {
                                this.hocKy.value('');
                                this.getPage(pageNumber, pageSize, pageCondition);
                            });
                        }
                    }} />
                    <FormSelect className='mr-3' allowClear={true} ref={e => this.hocKy = e} style={{ width: '120px' }} placeholder='Học kỳ' data={[{ id: '1', text: 'HK1' }, { id: '2', text: 'HK2' }, { id: '3', text: 'HK3' }]} onChange={value => {
                        if (value) {
                            if (this.state.filter.namHoc && value.id) {
                                this.setState({ filter: { ...this.state.filter, hocKy: value?.id || null } }, () => {
                                    this.getPage(pageNumber, pageSize, pageCondition);
                                });
                            } else {
                                this.hocKy.value('');
                                T.notify('Vui lòng chọn năm học trước', 'danger');
                            }
                        } else {
                            this.setState({ filter: { ...this.state.filter, hocKy: null } }, () => {
                                this.getPage(pageNumber, pageSize, pageCondition);
                            });
                        }
                    }} />
                    <FormSelect ref={e => this.nguoiKy = e} allowClear={true} style={{ width: '180px' }} placeholder='Người ký' data={SelectAdapter_PhoTruongDonVi(32)} onChange={value => {
                        this.setState({ filter: { ...this.state.filter, nguoiKy: value?.id || null } }, () => {
                            this.getPage(pageNumber, pageSize, pageCondition);
                        });
                    }} />
                </div>
            </>,
            content: (
                <>
                    <FormTabs
                        contentClassName='tile'
                        ref={e => this.tabs = e}
                        onChange={({ tabIndex }) => {
                            this.setState(prevState => ({ filter: { ...prevState.filter, ...filterMapper[tabIndex] }, isLoading: true }), () => this.getPage(1, 50));
                        }}
                        tabs={[
                            { title: 'Tất cả', component: this.renderTab({ permission, user }) },
                            { title: <>Chưa xử lý<span className='badge badge-pill badge-primary ml-1'>{soDangKyMoi}</span></>, component: this.renderTab({ permission, user }) },
                            { title: 'Đã chấp nhận', component: this.renderTab({ permission, user }) },
                            { title: 'Sinh viên Đã nhận', component: this.renderTab({ permission, user }) },
                            { title: <span style={{ color: 'red' }}>Quá hạn&nbsp;<span className='badge badge-pill badge-danger'>{soDangKyQuaHan}</span></span>, component: this.renderTab({ permission, user }) },
                        ]} />
                    <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />
                    <EditModal ref={(e) => (this.modal = e)} readOnly={!permission.write} user={user} update={this.props.updateSvManageForm} dataCanBo={dsCanBo} download={this.downloadWord} />
                    <AddModal ref={e => this.addModal = e} readOnly={!permission.write} create={this.props.createsvManageForm} download={this.downloadWord} />
                    <RejectModal ref={e => this.rejectModal = e} update={this.props.updateSvManageForm} user={user} />
                </>
            ),
            backRoute: '/user/ctsv/chung-nhan-truc-tuyen',
            collapse: [
                { icon: 'fa-plus', type: 'success', name: 'Tạo mới', onClick: () => this.addModal.show(), permission: permission.write },
                { icon: 'fa-download', type: 'light', name: 'Xuất dũ liệu', onClick: this.exportData, permission: permission.ctsv }
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, ctsvManageForm: state.ctsv.ctsvManageForm });
const mapActionsToProps = { updateSvManageForm, getSvManageFormPage, downloadWord, deleteSvManageForm, createsvManageForm };
export default connect(mapStateToProps, mapActionsToProps)(svManageFormPage);
