import React from 'react';
import T from 'view/js/common';

const UploadBoxStyle = {
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    width: 'auto',
    height: '124px',
    lineHeight: '124px',
    fontSize: '64px',
    color: 'black',
    textAlign: 'center',
    border: '1px dashed #333',
    cursor: 'pointer'
};

const UploadProfileStyle = {
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    width: '100%',
    paddingBottom: '80%',
    fontSize: '64px',
    color: 'black',
    textAlign: 'center',
    border: '1px dashed #333',
    cursor: 'pointer',
    borderRadius: '20%'
};

export default class ImageBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isUploading: false, userData: null, image: null };
        this.box = React.createRef();
        this.uploadInput = React.createRef();
    }

    setData = (userData, image) => this.setState({ userData, image });

    getImage = () => {
        return this.state.image;
    };

    onDrop = (event) => {
        event.preventDefault();
        const readOnly = this.props.readOnly ? this.props.readOnly : false;
        if (!readOnly) {
            $(this.box.current).css('background-color', '#FFF');

            if (event.dataTransfer.items) {
                if (event.dataTransfer.items.length > 0) {
                    const item = event.dataTransfer.items[0];
                    if (item.kind == 'file') {
                        this.onUploadFile(event.dataTransfer.items[0].getAsFile());
                    }
                }
                event.dataTransfer.items.clear();
            } else {
                if (event.dataTransfer.files.length > 0) {
                    this.onUploadFile(event.dataTransfer.files[0]);
                }
                event.dataTransfer.clearData();
            }
        }
    };

    onClick = (event) => {
        event.preventDefault();
        const readOnly = this.props.readOnly ? this.props.readOnly : false;
        if (!readOnly) {
            $(this.uploadInput.current).click();
        }
    };

    onDragOver = (event) => {
        event.preventDefault();
    };
    onDragEnter = (event) => {
        event.preventDefault();
        const readOnly = this.props.readOnly ? this.props.readOnly : false;
        if (!readOnly) {
            $(this.box.current).css({ 'background-color': '#009688', 'background-image': '' });
        }
    };

    onDragLeave = (event) => {
        event.preventDefault();
        const readOnly = this.props.readOnly ? this.props.readOnly : false;
        if (!readOnly) {
            const backgroundImage = 'url(' + (this.state.image ? this.state.image : this.props.image) + ')';
            $(this.box.current).css({ 'background-color': '#FFF', 'background-image': backgroundImage });
        }
    };

    onSelectFileChanged = (event) => {
        if (event.target.files.length > 0) {
            this.onUploadFile(event.target.files[0]);
            event.target.value = '';
        }
    };

    onUploadFile = (file) => {
        const sizeFiles = file.size ? file.size / 1024 / 1024 : 0;
        if (sizeFiles && sizeFiles > 10) {
            T.alert(` Thao tác không thành công, Tệp hình ảnh có kích thước ${Math.round(sizeFiles * 100) / 100} MB, yêu cầu ảnh dưới 10MB`, 'warning', false, 2000);
            return;
        }
        this.setState({ isUploading: true });

        const box = $(this.box.current),
            userData = this.state.userData ? this.state.userData : this.props.userData,
            updateUploadPercent = percent => {
                if (this.props.onPercent) this.props.onPercent(percent);
                box.html(percent + '%');
            };

        const formData = new FormData();
        formData.append(this.props.uploadType, file);
        if (userData) formData.append('userData', userData);

        $.ajax({
            method: 'POST',
            url: this.props.postUrl,
            dataType: 'json',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            xhr: () => {
                const xhr = new window.XMLHttpRequest();

                xhr.upload.addEventListener('progress', evt => {
                    if (evt.lengthComputable) {
                        updateUploadPercent((100 * evt.loaded / evt.total).toFixed(2));
                    }
                }, false);

                xhr.addEventListener('progress', evt => {
                    if (evt.lengthComputable) {
                        updateUploadPercent((100 * evt.loaded / evt.total).toFixed(2));
                    }
                }, false);

                return xhr;
            },
            complete: () => {
                box.html('');
                this.setState({ isUploading: false });
                if (this.props.complete) this.props.complete();
            },
            success: data => {
                if (data.image) {
                    this.setState({ image: data.image });
                } else if (data.url) {
                    this.setState({ image: data.url });
                }
                if (this.props.success)
                    this.props.success(data);

            },
            error: error => {
                if (this.props.error) this.props.error(error);
            }
        });
    };

    render() {
        const backgroundImage = `url('${(this.state.image ? this.state.image : this.props.image)}')`,
            boxStyle = this.props.isProfile ? Object.assign({}, UploadProfileStyle, { backgroundImage }) : Object.assign({}, UploadBoxStyle, { ...this.props.style }, { backgroundImage });
        if (this.props.height) boxStyle.height = this.props.height;
        return (
            <div style={this.props.style} className={this.props.className}>
                <div ref={this.box} id={this.props.uploadType} style={boxStyle}
                    onDrop={this.onDrop} onClick={this.onClick}
                    onDragOver={this.onDragOver} onDragEnter={this.onDragEnter} onDragLeave={this.onDragLeave} />
                <small className='form-text text-primary' style={{ textAlign: 'center' }}>
                    {this.props.description ? this.props.description : 'Nhấp hoặc kéo hình ảnh thả vào ô phía trên!'}
                </small>
                <input type='file' name={this.props.uploadType} accept='image/*' onChange={this.onSelectFileChanged} style={{ display: 'none' }} ref={this.uploadInput} />
            </div>
        );
    }
}
