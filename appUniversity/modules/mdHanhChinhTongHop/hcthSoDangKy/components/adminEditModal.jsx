import { SelectAdapter_DmLoaiVanBan } from 'modules/mdDanhMuc/dmLoaiVanBan/redux/dmLoaiVanBan';
import React from 'react';
import { connect } from 'react-redux';
import { updateSoVanBan } from '../redux/soDangKy';
import { AdminModal, FormSelect, FormTextBox } from 'view/component/AdminPage';

class HcthEditSoDangKyModal extends AdminModal {
    onSubmit = () => {
        this.setState({ isLoading: true }, () => {
            this.props.updateSoVanBan(this.state.id, this.soVanBan.value(), this.loaiVanBan.value(), this.hide, () => this.setState({ isLoading: false }));
        });
    }

    onShow = (data) => {
        this.setState({ ...data, isLoading: false }, () => {
            this.soVanBan.value(data.soCongVan || '');
            this.loaiVanBan.value(data.loaiVanBan || '');
        });
    }

    onChangeLoaiVanBan = (value) => {
        let so = this.state.soCongVan.match(/[0-9a-z-]*\//);
        if (!so) {
            return T.notify('Không thể cập nhật số', 'danger');
        }
        so = so[0];

        if (value.tenVietTat) {
            so += `${value.tenVietTat}-`;
        }
        so += 'XHNV';
        if (this.state.tenVietTat) {
            so += `-${this.state.tenVietTat}`;
        }
        this.soVanBan.value(so);
    }

    render = () => {
        return this.renderModal({
            title: '',
            icon: 'fa fa-calendar-check-o',
            isLoading: this.state.isLoading,
            body:
                <div className='row'>
                    <FormTextBox disabled label='Số văn bản' required ref={e => this.soVanBan = e} className='col-md-6' />
                    <FormSelect onChange={this.onChangeLoaiVanBan} required data={SelectAdapter_DmLoaiVanBan} className='col-md-6' ref={e => this.loaiVanBan = e} label='Loại văn bản' />
                </div>
        });
    }
}

const stateToProps = (state) => ({ system: state.system });
const actionsToProps = { updateSoVanBan };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(HcthEditSoDangKyModal);


