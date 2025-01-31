import React from 'react';
import { AdminModal } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import PDFObject from 'pdfobject';
import { Link } from 'react-router-dom';
import T from 'view/js/common';

class PreviewPdf extends AdminModal {
    onShow = (inputData) => {
        let inputBuffer;
        if (typeof inputData == 'object') {
            inputBuffer = inputData.buffer;
        } else inputBuffer = inputData;
        this.setState({ data: inputData });
        const type = 'application/pdf';
        const blob = new Blob([inputBuffer], { type });
        const blobUrl = URL.createObjectURL(blob);
        const options = {
            height: '100%',
            width: '100%',
        };
        PDFObject.embed(blobUrl, '#print-container', options);
    }
    onHide = () => {
        this.setState({ buffer: null });
    }
    downloadWordFile = () => {
        const data = this.state.data;
        if (typeof data == 'object') return T.download(`/api/dt/thoi-khoa-bieu/download-export?outputPath=${data.filePath}`, data.fileName);
        else return T.alert('Không hỗ trợ tải xuống file word', 'info', false, 1000);
    }
    render = () => {
        return this.renderModal({
            title: 'In danh sách phòng thi',
            size: 'elarge',
            body: <div className='row' >
                <div className='col-md-3' style={{ marginBottom: '4px' }}><button className='btn btn-primary' onClick={() => this.downloadWordFile()}>Tải xuống file word</button> </div>
                <div className='col-md-9' style={{ marginBottom: '4px', textAlign: 'right' }}><Link to={'/user/sau-dai-hoc/tuyen-sinh/dm-bieu-mau'} ><button className='btn btn-dark'>Chỉnh sửa biểu mẫu</button></Link> </div>
                <div id='print-container' className='col-md-12' style={{ height: '75vh' }}></div>
            </div>
        });
    }
}
const mapStateToProps = state => ({ system: state.system, });
const mapActionsToProps = {

};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(PreviewPdf);
