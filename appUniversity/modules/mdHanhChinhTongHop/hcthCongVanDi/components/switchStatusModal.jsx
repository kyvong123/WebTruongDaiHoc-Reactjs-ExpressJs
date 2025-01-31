import React from 'react';
import { SelectAdapter_HcthVanBanDiMaStatusDetail } from 'modules/mdHanhChinhTongHop/hcthVanBanDiStatusSystem/redux/statusSystemDetail';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { connect } from 'react-redux';
import { AdminModal, FormCheckbox, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { getRecipients, getRecipientsInfo, setStatus, getCensors } from '../redux/vanBanDi';

export class SimpleSwitchModal extends AdminModal {
    onShow = (config = {}) => {
        this.setState({ ...config, censors: [] }, () => {
            this.phanHoi.value('');
            getCensors(Array.isArray(this.props.id) ? this.props.id[0] : this.props.id, { back: this.state.back, forward: this.state.forward }, (censor) => {
                this.setState({ censors: censor.map(item => ({ id: item.shcc, text: item.tenCanBo.normalizedName() })) }, () => {
                    this.state.censors.length && this.shccCanBoXuLy?.value(this.state.censors[0].id);
                });
            })();
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        if (this.state.onSubmit) {
            this.setState({ isLoading: true }, () => {
                this.state.onSubmit(this.phanHoi.value(), this.shccCanBoXuLy?.value(), () => {
                    !this.props.done && window.location.reload(false);
                    this.props.done && this.props.done();
                }, () => this.setState({ isLoading: false }));
            });
        }
    }

    render = () => {
        const { showCauHinhKhac = true } = this.props;
        return this.renderModal({
            isShowSubmit: false,
            title: this.state.title,
            className: 'd-flex align-items-center',
            isLoading: this.state.isLoading,
            postButtons: <>
                <button className={(this.props.getMinimalDisplay() || !showCauHinhKhac) ? 'btn btn-info d-none' : 'btn btn-info'} onClick={(e) => e.preventDefault() || this.state.onConfig(this.phanHoi.value())}><i className='fa fa-lg fa-cog' /> Cấu hình khác</button>
                <button className='btn btn-success' onClick={this.onSubmit}><i className={this.state.isLoading ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-fw fa-lg fa-check'} /> OK</button>
            </>,
            body: <div className='row'>
                <div className='form-group col-md-12 text-danger' >{this.state.message}</div>
                <FormSelect className={this.props.getMinimalDisplay() ? 'col-md-12 d-none' : 'col-md-12'} label='Cán bộ xử lý' ref={e => this.shccCanBoXuLy = e} data={this.state.censors || []} disabled={this.state.isLoading} />
                <FormTextBox className='col-md-12' label='Phản hồi' placeholder='Thêm phản hồi' ref={e => this.phanHoi = e} />
            </div>
        });
    }
}
class SwitchStatusModal extends AdminModal {
    itemRef = []

    state = { toggleItem: [] }

    onShow = (data) => {
        this.setState({ modified: false, recipients: null, forward: false, back: false, toggleItem: [] }, () => this.modified?.value(false));
        const status = this.getItem().status;
        if (data.backTo) {
            this.setState({ title: 'Trả lại', back: true });
            this.nextStatus?.value(status.backTo || '');
            this.onChangeStatus(status.backTo);
        } else {
            this.setState({ title: 'Cập nhật trạng thái', forward: true });
            this.nextStatus?.value(status.forwardTo || '');
            this.onChangeStatus(status.forwardTo);
        }
        this.phanHoi.value(data?.phanHoi || '');
    }

    onChangeStatus = (status) => {
        if (!status) {
            status = this.nextStatus.value();
            this.setState({ forward: false, back: false });
        }
        this.setState({ isLoading: true, modified: false }, () => {
            this.props.getRecipients(this.getItem().id, status, (recipients) => {
                this.setState({ recipients, origin: recipients });
                this.getCensors(status);
            }, () => this.setState({ isLoading: false }));
        });
    }

    getCensors = (status) => {
        const { back, forward } = this.state;
        const data = {
            status,
            back: Number(back) || null,
            forward: Number(forward) || null,
        };
        this.props.getCensors(this.getItem().id, data, (censor) => {
            this.setState({ censors: censor.map(item => ({ id: item.shcc, text: item.tenCanBo.normalizedName() })) }, () => {
                this.state.censors.length && this.shccCanBoXuLy.value(this.state.censors[0].id);
            });
        });
    }

    getItem = () => {
        return this.props.hcthCongVanDi?.item || {};
    }

    handleToggleItem = (item, value) => {
        if (value) {
            this.setState({ toggleItem: [...this.state.toggleItem, item.shcc] }, () => {
                if (this.state.toggleItem.length == this.state.recipients.length) {
                    this.allItem?.value(true);
                }
            });
        } else {
            this.setState({ toggleItem: this.state.toggleItem.filter(id => id != item.shcc) }, () => {
                this.allItem?.value(false);
            });
        }
    }

    selectAllItem = (value) => {
        if (value) {
            this.state.recipients.map(item => this.itemRef[item.shcc]?.value(true));
            this.setState({ toggleItem: this.state.recipients.map(item => item.shcc) });
        } else {
            this.state.recipients.map(item => this.itemRef[item.shcc]?.value(false));
            this.setState({ toggleItem: [] });
        }
    }

    renderRecipients = () => renderTable({
        getDataSource: () => this.state.recipients,
        loadingOverlay: true,
        header: 'thead-light',
        emptyTable: 'Không có danh sách dữ liệu cán bộ nhận',
        renderHead: () => <tr>
            {this.state.modified && <th className='d-flex justify-content-center align-self-center'><FormCheckbox ref={e => this.allItem = e} style={{ margin: 'auto', padding: 0 }} onChange={value => this.selectAllItem(value)} /></th>}
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã thẻ</th>
            <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Họ và tên</th>
            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Đơn vị</th>
            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Chức vụ</th>
            {this.state.modified && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>}
        </tr>,
        renderRow: (item, index) => {
            return <tr key={index}>
                {this.state.modified && <TableCell content={<FormCheckbox ref={e => this.itemRef[item.shcc] = e} onChange={value => this.handleToggleItem(item, value)} />} />}
                <TableCell content={index + 1} />
                <TableCell content={item.shcc} />
                <TableCell content={item.tenCanBo} />
                <TableCell content={item.tenDonVi} />
                <TableCell content={item.tenChucVu} />
                {this.state.modified && <TableCell type='buttons' permission={{ delete: this.state.modified }} onDelete={() => this.deleteRecipient(item.shcc)} />}
            </tr>;
        }
    })

    switchModified = (value) => {
        this.setState({ modified: value, recipients: value ? this.state.recipients : this.state.origin });
    }

    deleteRecipient = (shcc) => {
        this.setState({ recipients: this.state.recipients.filter(item => item.shcc != shcc) });
    }

    onAddRecipients = () => {
        const shcc = this.shcc.value();
        this.props.getRecipientsInfo(shcc, (data) => {
            this.shcc.value('');
            this.setState({ recipients: [...this.state.recipients, ...data] }, () => {
                this.allItem?.value(false);
            });
        });
    }

    onDeleteRecipients = () => {
        const newRecipients = this.state.recipients.filter((value) => {
            return this.state.toggleItem.indexOf(value.shcc) == -1;
        });

        this.state.toggleItem.map(item => this.itemRef[item]?.value(false));

        this.setState({ recipients: newRecipients, toggleItem: [] });
    }

    onSubmitStatus = (e) => {
        e.preventDefault();
        const { modified, back, forward } = this.state;
        const status = this.nextStatus.value();
        const data = {
            status,
            modified: Number(modified) || null,
            back: Number(back) || null,
            forward: Number(forward) || null,
            id: this.getItem().id,
            phanHoi: this.phanHoi.value(),
            shccCanBoXuLy: this.shccCanBoXuLy.value()
        };
        if (modified)
            data.recipients = this.state.recipients.map(item => item.shcc);
        this.setState({ isLoading: true }, () => {
            if (this.props.canSave && this.props.canSave() && this.props.save) {
                this.props.save(() => this.props.setStatus(data, () => {
                    this.hide();
                    window.location.reload(false);
                }, () => this.setState({ isLoading: false })), false);
            } else {
                this.props.setStatus(data, () => {
                    this.hide();
                    window.location.reload(false);
                }, () => this.setState({ isLoading: false }));
            }
        });
    }

    render = () => {
        const permissions = this.props.system?.user?.permissions || [];
        return this.renderModal({
            title: this.state.title,
            postButtons: <button className='btn btn-success' disabled={this.state.isLoading} onClick={this.onSubmitStatus}><i className={'fa ' + (this.state.isLoading ? 'fa-spin fa-lg fa-spinner' : 'fa-lg fa-check')} />OK</button>,
            size: 'elarge',
            body: <div className='row'>
                <div className='col-md-12'>
                    <ul className='nav nav-tabs'>
                        <li className='nav-item'>
                            <a className='nav-link active show' data-toggle='tab' href='#statusInfo'>Thông tin</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' data-toggle='tab' href='#notficationRecipients'>Danh sách cán bộ nhận thông báo</a>
                        </li>
                    </ul>

                    <div className='tab-content tile'>
                        <div className='tab-pane fade active show' id='statusInfo'>
                            <div className='tile-body'>
                                <div className='row'>
                                    {this.getItem().status && <FormSelect ref={e => this.nextStatus = e} key={this.getItem().status.systemId} className='col-md-12' label='Trạng thái tiếp theo' data={SelectAdapter_HcthVanBanDiMaStatusDetail(this.getItem().status.systemId)} onChange={() => { this.onChangeStatus(); }} disabled={this.state.isLoading || !permissions.includes('hcthCongVanDi:manage')} />}
                                    <FormSelect ref={e => this.shccCanBoXuLy = e} data={this.state.censors || []} className='col-md-12' label='Cán bộ xử lý' disabled={this.state.isLoading} />
                                    <FormTextBox ref={e => this.phanHoi = e} label='Phản hồi' className='col-md-12' />
                                </div>
                            </div>
                        </div>

                        <div className='tab-pane fade' id='notficationRecipients'>
                            <div className='tile-body'>
                                <div className='row'>
                                    <FormCheckbox isSwitch className='col-md-12' label='Điều chỉnh danh sách cán bộ nhận thông báo' onChange={value => this.switchModified(value)} ref={e => this.modified = e} />
                                    {this.state.modified && <>
                                        <div className="col-md-12 d-flex">
                                            <FormSelect className='mb-0 mr-auto align-self-center' data={SelectAdapter_FwCanBo} style={{ flex: 1 }} placeholder='Thêm cán bộ nhận thông báo' multiple ref={e => this.shcc = e} />
                                            <div className='py-2 pl-2'>
                                                <button className='btn btn-success mr-2' onClick={this.onAddRecipients}><i className='fa fa-lg fa-plus' />Thêm</button>
                                                {this.state.toggleItem.length > 0 && <button className='btn btn-danger mr-2' onClick={this.onDeleteRecipients}><i className='fa fa-lg fa-trash' />Xoá đã chọn</button>}
                                            </div>
                                        </div>
                                    </>}
                                    <div className='col-md-12'>{this.renderRecipients()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthCongVanDi: state.hcth.hcthCongVanDi, phanHoi: state.hcth.hcthPhanHoi });
const mapActionsToProps = { getRecipients, getRecipientsInfo, setStatus, getCensors };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SwitchStatusModal);