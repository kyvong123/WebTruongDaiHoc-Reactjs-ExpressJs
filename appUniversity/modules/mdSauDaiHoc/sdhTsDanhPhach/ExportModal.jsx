import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_MonThiDanhPhach } from './redux';
// Print preview 
class ExportModal extends AdminModal {
    state = { maMonThi: '', isNgoaiNgu: '', kyNang: '', idDot: '' };
    componentDidMount() {
        T.socket.on('export-doi-chieu-done', ({ buffer, requester }) => {
            if (requester == this.props.user) {
                this.props.processModal.hide();
                this.props.previewPdf.show(buffer);
            }
        });
        T.socket.on('export-bieu-mau-cham-done', ({ buffer, requester }) => {
            if (requester == this.props.user) {
                this.props.processModal.hide();
                this.props.previewPdf.show(buffer);
            }
        });
    }
    componentWillUnmount() {
        T.socket.off('export-doi-chieu-done');
        T.socket.off('export-bieu-mau-cham-done');
        this.setState({ maMonThi: '' });
    }
    onShow = () => {
        const { idDot, maMonThi, kyNang, isNgoaiNgu } = this.props;
        this.setState({ idDot, maMonThi, kyNang, isNgoaiNgu }, () => {
            this.maMonThi?.value(maMonThi || '');
            this.kyNang?.value(kyNang || '');
            this.loaiBieuMau?.value('');
        });

    }
    onSubmit = () => {
        const { type, maMonThi, kyNang } = this.state;
        if (!maMonThi) return T.notify('Vui lòng chọn môn thi có đánh phách', 'danger');
        if (!type) return T.notify('Vui lòng chọn loại biểu mẫu', 'danger');
        const data = { type, maMonThi, kyNang };
        this.props.exportPdf(data, () => {
            this.hide();
            this.props.processModal.show();
        });

    }
    selectLoaiBieuMau = [{ id: 'doi-chieu', text: 'Đối chiếu số báo danh - mã phách' }, { id: 'bieu-mau-cham', text: 'Biểu mẫu chấm điểm' }];
    defaultSkill = [{ id: 'Listening', text: 'Nghe' }, { id: 'Speaking', text: 'Nói' }, { id: 'Reading', text: 'Đọc' }, { id: 'Writing', text: 'Viết' }]

    render = () => {
        const { isNgoaiNgu, idDot } = this.state;
        return this.renderModal({
            title: 'Xuất biểu mẫu',
            size: 'elarge',
            isShowSubmit: this.state.type,
            submitText: 'In biểu mẫu',
            body: <div className='row' >
                <FormSelect className='col-md-4' ref={e => this.maMonThi = e} data={SelectAdapter_MonThiDanhPhach(idDot)} label='Môn thi' required onChange={value => this.setState({ maMonThi: value.id, isNgoaiNgu: value.isNgoaiNgu })} />
                {isNgoaiNgu ? <FormSelect className='col-md-4' ref={e => this.kyNang = e} label='Kỹ năng'
                    data={this.defaultSkill} onChange={(value) => this.setState({ kyNang: value.id })} /> : null}
                <FormSelect className='col-md-4' ref={e => this.loaiBieuMau = e} data={this.selectLoaiBieuMau} label='Loại biểu mẫu' required onChange={value => this.setState({ type: value.id })} />
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ExportModal);
