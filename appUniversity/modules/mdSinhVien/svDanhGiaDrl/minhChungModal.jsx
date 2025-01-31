import React from 'react';
import { AdminModal } from 'view/component/AdminPage';
import { MinhChungContent } from './minhChungContent';
// import FileBox from 'view/component/FileBox';
// import { Img } from 'view/component/HomePage';

// const formatDate = (numDate) => {
//     const date = new Date(numDate);
//     let day = date.getDate().toString().padStart(2, '0');
//     let month = (date.getMonth() + 1).toString().padStart(2, '0');
//     let year = date.getFullYear().toString();
//     return `${day}/${month}/${year}`;
// };

export default class UploadModal extends AdminModal {
    state = { dsMinhChung: [], editItem: null }
    isLoading = false

    componentDidMount() {
        this.disabledClickOutside();
        this.onHidden(this.onHide);
    }

    onShow = (item, dataMinhChung) => {
        this.setState({ index: dataMinhChung?.index ?? '', isSuKien: dataMinhChung?.isSuKien ?? false });
        this.minhChungContent.onShow(item, dataMinhChung);
    };

    onHide = () => {
        this.minhChungContent.onHide();
        this.props.onHidden && this.props.onHidden();
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }

    render = () => {
        const { readOnly } = this.props,
            { isSuKien } = this.state;
        return this.renderModal({
            title: this.state.dsMinhChung.length ? `Chỉnh sửa ${isSuKien ? 'hoạt động' : 'minh chứng'} cho tiêu chí ${this.state.index ?? ''}` : `Thêm ${isSuKien ? 'hoạt động' : 'minh chứng'} cho tiêu chí ${this.state.index ?? ''}`,
            size: readOnly ? 'large' : 'elarge',
            body: (
                <div style={{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }} className='row'>
                    <MinhChungContent ref={e => this.minhChungContent = e} readOnly={readOnly} isSuKien={isSuKien}
                        updateLsMinhChung={this.props.updateLsMinhChung} deleteMinhChung={this.props.deleteMinhChung}
                        updateLsHoatDong={this.props.updateLsHoatDong} deleteHoatDong={this.props.deleteHoatDong}
                    />
                </div>
            ),
        });
    };
}