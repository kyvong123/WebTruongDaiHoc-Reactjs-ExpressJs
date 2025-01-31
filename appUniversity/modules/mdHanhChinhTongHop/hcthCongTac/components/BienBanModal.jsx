import React from 'react';
import { connect } from 'react-redux';
import { FormEditor } from 'view/component/AdminPage';
import { updateBienBan } from '../redux/congTac';
import FileBox from 'view/component/FileBox';
import { BaseCongTacModal } from './BaseCongTac';
class BienBanModal extends BaseCongTacModal {

    onShow = (item) => {
        this.setState({ ...item }, () => {
            this.noiDungHtml?.html(this.state.noiDungHtml || '');
        });
    }

    onSubmit = () => {
        const data = {
            noiDungHtml: this.noiDungHtml.html()
        };

        this.props.updateBienBan(this.state.id, data, this.hide);
    }

    onSuccess = (data) => {
        if (data.item) {
            const item = data.item;
            this.setState({ fileName: item.fileName, filePath: item.filePath });
        }
    }

    render = () => {
        const readOnly = this.getShcc() != this.state.nguoiTao;
        return this.renderModal({
            title: 'Biên bản/Kết luận',
            icon: 'fa fa-calendar-check-o',
            size: 'elarge',
            body:
                <div className='row' key={this.state.id}>
                    {this.state.fileName && <div className='col-md-12 d-flex' style={{ height: 'fit-content', marginBottom: '10px', }}>
                        <a download style={{ flex: 1 }} href={`/api/hcth/cong-tac/bien-ban/${this.state.id}/${this.state.filePath}`} target='_blank' rel='noreferrer noopener' className='link-opacity-100-hover link-underline-primary'><i className='fa fa-file' />&nbsp;{this.state.fileName}</a>
                        {/* <button className='btn btn-circle btn-danger d-flex justify-content-center align-items-center' style={{ width: 25, height: 25, padding: 'unset' }}>
                            <i className='fa fa-times' style={{ marginRight: 0, fontSize: 12 }} />
                        </button> */}

                    </div>}
                    {!readOnly && <FileBox ref={e => this.fileBox = e} className='col-md-12' label='Tải lên tập tin đính kèm' postUrl={`/user/upload?id=${this.state.id}`} uploadType='hcthBienBanKetLuanAttachment' userData='hcthBienBanKetLuanAttachment' success={this.onSuccess} />}
                    {!readOnly && <FormEditor className='col-md-12' ref={e => this.noiDungHtml = e} height={400} label='Nội dung' uploadUrl={`/user/upload?uploadTo=hcthBienBanKetLuanNoiDung&id=${this.state.id}&congTacItemId=${this.state.ma}`} />}
                    {readOnly && <div className='col-md-12' dangerouslySetInnerHTML={{ __html: this.state.noiDungHtml }}></div>}
                </div>
        });
    }
}

const stateToProps = (state) => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const actionsToProps = { updateBienBan };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(BienBanModal);


