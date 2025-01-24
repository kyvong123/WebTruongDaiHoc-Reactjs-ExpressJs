import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormRichTextBox } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';
import { addReport, getReport, updateReport } from '../redux';
// const tienDoSelector = [...Array(11).keys()].map(i => ({ id: i * 10, text: `${i * 10}%` }));

class BaoCaoModal extends AdminModal {

    onShow = (item) => {
        this.setState({ id: null, file: null, isLoading: false }, () => {
            if (item) {
                this.setState({ ...item, item });
                this.noiDungBaoCao.value(item.noiDungBaoCao || '');
            } else {
                this.noiDungBaoCao.value('');
            }
        });
    }

    onSubmit = () => {
        const data = {
            nhiemVuId: this.props.hcthNhiemVu?.item?.id,
            noiDungBaoCao: this.noiDungBaoCao.value()
        };
        if (!this.state.id && this.state.file) {
            data.attachment = this.state.attachment;
            data.file = this.state.file;
        }
        if (!data.noiDungBaoCao) {
            T.notify('Nội dung báo cáo trống', 'danger');
        } else {
            if (!this.state.id) {
                this.setState({ isLoading: true }, () => {
                    this.props.addReport(data, () => this.hide() || this.props.getReport(data.nhiemVuId), () => this.setState({ isLoading: false }));
                });
            } else {
                this.setState({ isLoading: true }, () => {
                    this.props.updateReport(this.state.id, data, () => this.hide() || this.props.getReport(data.nhiemVuId), () => this.setState({ isLoading: false }));
                });
            }
        }
    }

    onSuccess = (res) => {
        this.setState({ uploadingFile: false });
        if (!res.error) {
            this.setState({ attachment: res.originalFilename, file: res.attachment });
        }
    }

    onFileChange = () => {
        this.setState({ uploadingFile: true }, () => {
            this.fileBox.onUploadFile({ id: this.state.id });
        });
    }

    render = () => {
        return this.renderModal({
            isLoading: this.state.isLoading,
            title: this.state.id ? 'Chỉnh sửa báo cáo' : 'Soạn báo cáo',
            size: 'large',
            body: <div className='row'>
                <FormRichTextBox required ref={e => this.noiDungBaoCao = e} label='Nội dung báo cáo' className='col-md-12' />
                <div className='d-flex justify-content-between align-items-center col-md-12'>
                    <a href={this.state.id ? `/api/hcth/nhiem-vu/bao-cao/download/${this.state.id}` : ''} >{this.state.attachment}</a>
                    <button className='btn btn-success' style={{ whiteSpace: 'nowrap' }} onClick={(e) => { e.preventDefault() || this.fileBox.uploadInput.click(); }}><i className='fa fa-lg fa-upload' />Tải lên tập tin báo cáo</button>
                </div>
                <FileBox style={{ display: 'none' }} pending ref={e => this.fileBox = e} className='col-md-12' label='Tải lên tập tin' postUrl='/user/upload' uploadType='hcthBaoCaoNhiemVuFile' userData='hcthBaoCaoNhiemVuFile' success={this.onSuccess} onFileChange={this.onFileChange} />
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthNhiemVu: state.hcth.hcthNhiemVu });
const mapActionsToProps = { addReport, getReport, updateReport };
export default connect(mapStateToProps, mapActionsToProps, false, { forwardRef: true })(BaoCaoModal);