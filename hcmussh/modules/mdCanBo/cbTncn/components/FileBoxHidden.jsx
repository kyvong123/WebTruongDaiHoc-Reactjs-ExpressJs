import React from 'react';
import FileBox from 'view/component/FileBox';

export default class FileBoxHidden extends React.Component {
    state = { isUploaded: false }
    onUploadFile = (data) => {
        this.formFileBox.onUploadFile(data);
    }
    isValid = () => {
        return !!this.formFileBox.file;
    }
    onFileChange = () => {
        this.setState({ isUploaded: true });
    }
    reset = () => {
        this.formFileBox.file = null;
        this.setState({ isUploaded: false });
    }
    render() {
        return <div style={{ alignItems: 'center', display: 'flex' }}>
            <div className={this.props.className} style={this.props.style} >
                <button className={`btn ${this.state?.isUploaded ? 'btn-success' : 'btn-primary'}`}
                    disabled={this.props.disabled ?? false}
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={(e) => { e.preventDefault() || this.formFileBox.uploadInput.click(); }}><i className='fa fa-lg fa-upload' />{this.state?.isUploaded ? 'Upload thành công' : this.props.label}</button>
            </div>
            <FileBox
                style={{ display: 'none' }} ref={e => this.formFileBox = e} pending
                postUrl='/user/upload' uploadType={this.props.uploadType} userData={this.props.userData}
                success={this.props.onSuccess} onFileChange={this.onFileChange}
            ></FileBox>
        </div>;

    }
}