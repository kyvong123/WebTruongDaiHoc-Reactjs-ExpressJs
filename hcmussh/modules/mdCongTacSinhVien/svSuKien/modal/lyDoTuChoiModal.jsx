import React from 'react';
import { FormRichTextBox, AdminModal, getValue } from 'view/component/AdminPage';

class LyDoTuChoiModal extends AdminModal {
    onShow = (item) => {
        const { idSuKien, lyDoTuChoi = '', versionNumber } = item || {};
        this.setState({ idSuKien, lyDoTuChoi, versionNumber });
        this.lyDoTuChoi.value(lyDoTuChoi);
    }

    onSubmit = () => {
        const changes = {
            lyDoTuChoi: getValue(this.lyDoTuChoi),
            trangThai: 'R',
        };
        this.props.update(this.state.idSuKien, this.state.versionNumber, changes, () => {
            this.hide();
        });
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Lý do từ chối sự kiện',
            size: 'large',
            body: <div className="row">
                <FormRichTextBox ref={e => this.lyDoTuChoi = e} className='col-md-12' label='Lý do từ chối' required readOnly={readOnly} />
            </div>
        });
    }
}
export default LyDoTuChoiModal;