import React from 'react';
import { BaseVanBanDiModal } from './BaseComponent';
import { connect } from 'react-redux';
import { FormSelect } from 'view/component/AdminPage';
import { CreateModal as QtDiNuocNgoaiModal } from 'modules/mdTccb/qtDiNuocNgoai/adminPage';
import { createMultipleQtDiNuocNgoai } from 'modules/mdTccb/qtDiNuocNgoai/redux';

class LinkModal extends BaseVanBanDiModal {
    onShow = () => {
        this.setState({ loai: null }, () => {
            if (this.getFormLinkData().length) {
                this.loai.value(this.getFormLinkData()[0].id);
            }
        });
    }

    getComponentMapper = (loai) => {
        const mapper = {
            QT_DI_NUOC_NGOAI: () => <QtDiNuocNgoaiModal ref={e => this.subModal = e} create={this.props.createMultipleQtDiNuocNgoai} />
        };
        return mapper[loai]();
    }

    formHandler = (loai) => {
        const item = this.getItem();
        const mapper = {
            QT_DI_NUOC_NGOAI: () => {
                this.subModal.show({ idSoVanBan: item.soVanBan.id, idVanBan: this.state.id, noiDung: item.trichYeu, shcc: item.canBoNhan, ngayQuyetDinh: item.ngayGui });
            }
        };
        mapper[loai] && mapper[loai]();
    }

    onSubmit = () => {
        this.hide();
        this.setState({ loai: this.loai.value() }, () => this.formHandler(this.state.loai));
    }

    render = () => {
        if (!this.state.loai)
            return this.renderModal({
                title: 'Liên kết',
                icon: 'fa fa-calendar-check-o',
                size: 'elarge',
                submitText: ' ',
                body:
                    <div className='row' key={this.state.id}>
                        <FormSelect className='col-md-12' label='Loại liên kết' data={this.getFormLinkData()} ref={e => this.loai = e} />
                    </div>
            });
        else return this.getComponentMapper(this.state.loai);
    }
}

const stateToProps = (state) => ({ system: state.system, hcthCongVanDi: state.hcth.hcthCongVanDi });
const actionsToProps = { createMultipleQtDiNuocNgoai };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(LinkModal);


