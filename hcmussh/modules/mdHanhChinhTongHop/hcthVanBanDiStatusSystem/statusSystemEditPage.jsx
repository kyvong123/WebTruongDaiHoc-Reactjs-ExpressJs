import React from 'react';
import { connect } from 'react-redux';
import { create, get, update, deleteDetail, SelectAdapter_HcthVanBanDiMaStatusDetail } from './redux/statusSystemDetail';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormCheckbox, FormSelect, FormTextBox, FormEditor } from 'view/component/AdminPage';
import { SelectAdapter_HcthVanBanDiStatus } from './redux/hcthVanBanDiStatus';
import { SelectAdapter_HcthSignType } from './redux/hcthSignType';
import { SelectAdapter_HcthDoiTuongKiemDuyet } from './redux/hcthDoiTuongKiemDuyet';
import { getSystem } from './redux/statusSystem';

class EditModal extends AdminModal {
    state = { active: false, }
    keys = ['verifyFile', 'skipWhenSigned', 'isInitial', 'fileListEditor', 'trangThai', 'canEditFile', 'requireSign', 'signType', 'visibility', 'minimalDisplay', 'minimalSwitchStatusModal', 'censor', 'recipientVisible', 'backTo', 'forwardTo', 'notifyRecipient', 'mailSubject', 'editor', 'isEditable', 'historyContent', 'notificationSubject', 'notificationContent', 'notificationIcon', 'isPartialEditable', 'partialEditors', 'allowSkip', 'isDeletable', 'deletor']
    editors = ['mail']
    onShow = (item) => {
        let { id } = item || {};
        this.setState({ id, isLoading: false }, () => {
            if (id) {
                this.props.get(id, (data) => {
                    this.keys.forEach(key => this[key].value(data[key] || ''));
                    this.editors.forEach(key => {
                        this[key].html(data[key + 'Html'] || '');
                        this[key].text(data[key + 'Text'] || '');
                    });
                });
            } else {
                this.keys.forEach(key => this[key].value(''));
                this.editors.forEach(key => {
                    this[key].html('');
                    this[key].text('');
                });
            }
        });
    };

    onSubmit = (e) => {
        try {
            e.preventDefault();
            const data = {};
            [...this.keys, ...this.editors].forEach(key => {
                const target = this[key];
                if (this.editors.includes(key)) {
                    data[key + 'Html'] = target.html();
                    data[key + 'Text'] = target.text();
                    return;
                }
                if (!target) throw new Error('Invalid keyword');
                if (target.props?.disabled) return;
                data[key] = target.value();
                if (data[key] == null || (Array.isArray(data[key]) && !data[key].length)) {
                    if (target.props.required) {
                        throw target;
                    }
                }
                if (['skipWhenSigned', 'isInitial', 'allowSkip', 'requireSign', 'recipientVisible', 'isFileListEditable', 'isEditable', 'canEditFile', 'isPartialEditable', 'isDeletable', 'verifyFile'].includes(key)) {
                    data[key] = Number(data[key]) || 0;
                }
            });
            this.setState({ isLoading: true }, () => {

                if (this.state.id) {
                    this.props.update(this.state.id, data, () => this.props.reload(this.hide), () => this.setState({ isLoading: false }));
                }
                else {
                    this.props.create({ ...data, systemId: this.props.systemId }, () => this.props.reload(this.hide), () => this.setState({ isLoading: false }));
                }
            });
        } catch (e) {
            if (e.props?.label)
                T.notify(e.props.label + 'trống', 'danger');
            else
                console.error(e);
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            isLoading: this.state.isLoading,
            size: 'elarge',
            title: this.state.id ? 'Cập nhật trạng thái' : 'Tạo mới trạng thái',
            body: <div className='row'>
                <div className='col-md-12'>
                    <ul className='nav nav-tabs'>
                        <li className='nav-item'>
                            <a className='nav-link active show' data-toggle='tab' href='#statusInfo'>Thông tin</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' data-toggle='tab' href='#hocPhiEmailDong'>Email thông báo</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' data-toggle='tab' href='#notification'>Thông báo hệ thống</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' data-toggle='tab' href='#history'>Lịch sử</a>
                        </li>
                    </ul>

                    <div className='tab-content tile'>
                        <div className='tab-pane fade active show' id='statusInfo'>
                            <div className='tile-body row'>
                                <FormSelect className='col-md-4' ref={e => this.trangThai = e} label='Trạng thái' data={SelectAdapter_HcthVanBanDiStatus} readOnly={readOnly} disabled={this.state.isLoading} required />
                                <FormSelect className='col-md-4' ref={e => this.forwardTo = e} label='Trạng thái tiếp theo' data={SelectAdapter_HcthVanBanDiMaStatusDetail(this.props.systemId)} readOnly={readOnly} allowClear disabled={this.state.isLoading} />
                                <FormSelect className='col-md-4' ref={e => this.backTo = e} label='Trạng thái trả lại' data={SelectAdapter_HcthVanBanDiMaStatusDetail(this.props.systemId)} readOnly={readOnly} allowClear disabled={this.state.isLoading} />
                                <FormCheckbox isSwitch className='col-md-12' ref={e => this.isInitial = e} label='Trạng thái khởi tạo' disabled={this.state.isLoading} />
                                <FormCheckbox isSwitch className='col-md-12' ref={e => this.allowSkip = e} label='Duyệt tự động (tự động chuyển văn bản đến trạng thái tiếp theo)' disabled={this.state.isLoading} />

                                <FormCheckbox isSwitch className='col-md-4' ref={e => this.requireSign = e} label='Ký văn bản' />
                                <FormCheckbox isSwitch className='col-md-4' ref={e => this.skipWhenSigned = e} label='Chuyển trạng thái khi hoàn thành ký' />
                                <FormSelect className='col-md-4' ref={e => this.signType = e} label='Loại ký' data={SelectAdapter_HcthSignType} readOnly={readOnly} disabled={this.state.isLoading} allowClear />
                                <FormCheckbox isSwitch className='col-md-12' ref={e => this.verifyFile = e} label='Xác thực văn bản khi chuyển trạng thái' disabled={this.state.isLoading} />
                                <FormSelect className='col-md-12' ref={e => this.notifyRecipient = e} label='Đối tượng nhận thông báo' data={SelectAdapter_HcthDoiTuongKiemDuyet} readOnly={readOnly} multiple disabled={this.state.isLoading} />
                                <FormSelect className='col-md-12' ref={e => this.censor = e} label='Đối tượng kiểm duyệt' data={SelectAdapter_HcthDoiTuongKiemDuyet} readOnly={readOnly} multiple disabled={this.state.isLoading} />
                                <FormCheckbox isSwitch className='col-md-12' ref={e => this.recipientVisible = e} label='Cho phép người/đơn vị nhận thấy văn bản' disabled={this.state.isLoading} />
                                <FormSelect className='col-md-12' ref={e => this.visibility = e} label='Đối tượng được phép thấy văn bản' data={SelectAdapter_HcthDoiTuongKiemDuyet} readOnly={readOnly} multiple disabled={this.state.isLoading} />
                                <FormSelect className='col-md-12' ref={e => this.minimalDisplay = e} label='Đối tượng nhìn thấy giao diện tối giản' data={SelectAdapter_HcthDoiTuongKiemDuyet} readOnly={readOnly} multiple disabled={this.state.isLoading} />
                                <FormSelect className='col-md-12' ref={e => this.minimalSwitchStatusModal = e} label='Đối tượng nhìn thấy cửa sổ chuyển trạng thái tối giản' data={SelectAdapter_HcthDoiTuongKiemDuyet} readOnly={readOnly} multiple disabled={this.state.isLoading} />
                                <FormCheckbox isSwitch className='col-md-12' ref={e => this.isEditable = e} label='Cho phép chỉnh sửa' disabled={this.state.isLoading} />
                                <FormSelect className='col-md-12' ref={e => this.editor = e} label='Đối tượng được phép chỉnh sửa' data={SelectAdapter_HcthDoiTuongKiemDuyet} readOnly={readOnly} multiple disabled={this.state.isLoading} />
                                <FormCheckbox isSwitch className='col-md-12' ref={e => this.canEditFile = e} label='Cho phép cập nhật danh sách file văn bản' disabled={this.state.isLoading} />
                                <FormSelect className='col-md-12' ref={e => this.fileListEditor = e} label='Đối tượng được cập nhật danh sách file văn bản' data={SelectAdapter_HcthDoiTuongKiemDuyet} readOnly={readOnly} multiple disabled={this.state.isLoading} />
                                <FormCheckbox isSwitch className='col-md-12' ref={e => this.isPartialEditable = e} label='Cho phép cập nhật số văn bản, ngày đi, ngày kí' disabled={this.state.isLoading} />
                                <FormSelect className='col-md-12' ref={e => this.partialEditors = e} label='Đối tượng được cập nhật số văn bản, ngày đi, ngày kí' data={SelectAdapter_HcthDoiTuongKiemDuyet} readOnly={readOnly} multiple disabled={this.state.isLoading} />
                                <FormCheckbox isSwitch className='col-md-12' ref={e => this.isDeletable = e} label='Cho phép xóa' disabled={this.state.isLoading} />
                                <FormSelect className='col-md-12' ref={e => this.deletor = e} label='Xóa bởi' data={SelectAdapter_HcthDoiTuongKiemDuyet} readOnly={readOnly} multiple disabled={this.state.isLoading} />
                            </div>
                        </div>

                        <div className='tab-pane fade' id='hocPhiEmailDong'>
                            <div className='tile-body'>
                                <span className='text-danger'>* Lưu ý email sẽ được gửi nếu nội dung email được cấu hình và trạng thái văn bản chuyển từ trạng thái trước đó thành trạng thái này</span>
                                <FormTextBox ref={e => this.mailSubject = e} label='Tiêu đề' readOnly={readOnly} />
                                <FormEditor smallText='Parameter: link_van_ban, trich_yeu, don_vi_gui, so_van_ban' ref={e => this.mail = e} label='Nội dung email' height={400} />
                            </div>
                        </div>

                        <div className='tab-pane fade' id='notification'>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.notificationSubject = e} label='Tiêu đề' readOnly={readOnly} />
                                <FormTextBox ref={e => this.notificationContent = e} label='Nội dung' readOnly={readOnly} />
                                <FormTextBox ref={e => this.notificationIcon = e} label='Icon' readOnly={readOnly} />
                            </div>
                        </div>
                        <div className='tab-pane fade' id='history'>
                            <div className='tile-body'>
                                <FormEditor ref={e => this.historyContent = e} label='Thông điệp' readOnly={readOnly} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        });
    }
}

class HcthVanBanDiStatusSystemDetail extends AdminPage {
    state = { filter: {} }
    componentDidMount() {
        T.ready('/user/hcth', () => {
            const params = T.routeMatcher('/user/hcth/trang-thai-van-ban-di/:id').parse(window.location.pathname);
            this.setState({ id: params.id }, this.getSystem);
            T.showSearchBox(false);

        });
    }

    getSystem = (done) => {
        this.props.getSystem(this.state.id, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa trạng thái', 'Xác nhận xóa trạng thái?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDetail(item.id, this.getSystem));
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('hcthVanBanDiStatusSystemDetail', ['manage', 'write', 'delete']);
        const { details } = this.props.statusSystem && this.props.statusSystem.item ?
            this.props.statusSystem.item : { details: null };

        let table = renderTable({
            getDataSource: () => details, stickyHead: false,
            loadingOverlay: false,
            loadingClassName: 'd-flex justify-content-center align-items-center',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>STT</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Tên trạng thái</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Trạng thái tiếp theo</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Trạng thái trả lại</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell type="link" content={item.tenTrangThai} onClick={() => this.modal.show(item)} />
                    <TableCell content={item.toTenTrangThai} />
                    <TableCell content={item.backTenTrangThai} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} >
                    </TableCell>
                </tr>
            )
        });


        return this.renderPage({
            icon: 'fa fa-cogs',
            title: 'Trạng thái văn bản đi',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                <Link key={1} to='/user/hcth/trang-thai-van-ban-di'>Trạng thái văn bản đi</Link>,
                'Chi tiết hệ thống trạng thái văn bản đi'
            ],
            content: <>
                <div className='tile'>
                    <h3 className='tile-header'>Thông tin chung</h3>
                    <div className='tile-body row'>
                    </div>
                </div>
                <div className='tile'>
                    <h3 className='tile-header'>Danh sách trạng thái</h3>
                    <div className='tile-body row'>
                        <div className='col-md-12'>{table}</div>
                    </div>
                </div>
                <EditModal ref={e => this.modal = e} permission={permission} reload={this.getSystem} systemId={this.state.id} create={this.props.create} update={this.props.update} get={this.props.get} permissions={currentPermissions} />
            </>,
            backRoute: '/user/hcth',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, statusSystem: state.hcth.hcthVanBanDiStatusSystem });
const mapActionsToProps = { create, getSystem, get, update, deleteDetail };
export default connect(mapStateToProps, mapActionsToProps)(HcthVanBanDiStatusSystemDetail);