import React from 'react';
import T from 'view/js/common';
import { PhotoProvider, PhotoView } from 'react-photo-view';

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

export default class ImageMultiBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isUploading: false, userData: null, imgList: [], maxImgNum: this.props.maxImgNum ?? 20 };
        this.box = React.createRef();
        this.uploadInput = React.createRef();
    }

    componentWillUnmount() {
        // TODO: dùng this.state.imageList để thực hiện xóa hình mà không được submit cùng dữ liệu (ví dụ fwQaMessage)
    }

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

    onDrop = (event) => {
        event.preventDefault();
        const readOnly = this.props.readOnly ? this.props.readOnly : false;
        if (!readOnly) {
            $(this.box.current).css('background-color', '#FFF');
            if (event.dataTransfer.items) {
                if (event.dataTransfer.items.length > 0) {
                    const eventDataTransferItemFiles = [];
                    for (let i = 0; i < event.dataTransfer.items.length; i += 1) {
                        eventDataTransferItemFiles.push(event.dataTransfer.items[i].getAsFile());
                    }
                    this.onUploadFiles(eventDataTransferItemFiles);
                    event.dataTransfer.items.clear();
                }
            } else {
                if (event.dataTransfer.files.length > 0) {
                    this.onUploadFiles(event.dataTransfer.files);
                    event.dataTransfer.dataTransfer();
                }
            }
        }
    }

    onSelectFileChanged = (event) => {
        if (event.target.files.length > 0) {
            this.onUploadFiles(event.target.files);
            event.target.value = '';
        }
    };

    onUploadFiles = (files) => {
        console.log('onUploadFiles files', files);
        if (this.state.isUploading) {
            T.notify('Đang upload file vui lòng chờ!', 'danger');
            return;
        }

        if (this.state.imgList.length >= this.state.maxImgNum) {
            T.notify('Đã đạt số tệp tối đa cho tin nhắn này, vui lòng gửi kèm thêm hình ở tin nhắn sau!', 'danger');
            return;
        }

        if (this.state.imgList.length + files.length > this.state.maxImgNum) {
            T.notify(`Không được phép upload quá ${this.state.maxImgNum} tệp hình trong 1 tin nhắn, bạn được phép đính kèm ${this.state.maxImgNum - this.state.imgList.length} cho tin nhắn này!`, 'danger');
            return;
        }

        for (let file of files) {
            const sizeFile = file.size ? file.size / 1024 / 1024 : 0;
            if (sizeFile && sizeFile > 2) {
                T.alert(` Thao tác không thành công, Tệp hình ảnh có kích thước ${Math.round(sizeFile * 100) / 100} MB, yêu cầu ảnh dưới 2MB`, 'warning', false, 2000);
                return;
            }
        }

        this.setState({ isUploading: true });

        const userData = this.state.userData ? this.state.userData : this.props.userData,
            updateUploadPercent = percent => {
                if (this.props.onPercent) this.props.onPercent(percent);
            };

        const formData = new FormData();
        for (let file of files) {
            formData.append(this.props.uploadType, file);
        }
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
                // box.html('');
                this.setState({ isUploading: false });
                if (this.props.complete) this.props.complete();
            },
            success: data => {
                const cnt = data.images ? data.images.length : 0 + data.urls ? data.urls.length : 0;
                if (cnt > 0) {
                    T.notify(`Đã đính kèm thành công ${cnt} hình.`, 'info');
                }
                if (data.images) {
                    this.setState({ imgList: [...data.images, ...this.state.imgList] });
                } else if (data.urls) {
                    this.setState({ imgList: [...data.urls, ...this.state.imgList] });
                }
                if (data.errImg && data.errImg.length > 0) {
                    T.notify(`Lỗi hệ thống không nhận được ${data.errImg.length} hình!`, 'danger');
                }
                if (data.error) {
                    T.notify(`${data.error}`, 'danger');
                }
                if (this.props.success) this.props.success(data);
            }
        });
    }

    clear = () => {
        this.setState({
            imgList: []
        });
    }

    render() {
        const backgroundImage = 'url("")';
        const boxStyle = this.props.isProfile ? Object.assign({}, UploadProfileStyle, { backgroundImage }) : Object.assign({}, UploadBoxStyle, { ...this.props.style }, { backgroundImage });
        if (this.props.height) boxStyle.height = this.props.height;
        return (
            <div style={this.props.style} className={this.props.className}>
                {this.state.imgList.length > 0 && <div className="d-flex flex-wrap justify-content-start align-items-center my-3">
                    <div>Hình đã upload:</div>
                    <PhotoProvider>
                        {
                            this.state.imgList.map((item, index) => (
                                <PhotoView key={index} src={`${item}`}>
                                    <img width='100px' className='m-2' src={`${item}`} alt={`${item}`} />
                                </PhotoView>
                            ))
                        }
                    </PhotoProvider>
                </div>}
                <div ref={this.box} style={boxStyle} onClick={this.onClick} onDrop={this.onDrop} onDragOver={this.onDragOver} onDragEnter={this.onDragEnter} onDragLeave={this.onDragLeave} id={this.props.uploadType} >
                    {this.state.isUploading ? <i className='fa fa-spin fa-lg fa-spinner' /> : ''}
                </div>
                <small className='form-text text-primary' style={{ textAlign: 'center' }}>
                    {this.props.description ? this.props.description : `Nhấp hoặc kéo hình ảnh thả vào ô phía trên! ${this.props.maxImgNum != null ? `(Tối đa ${this.props.maxImgNum} hình)` : ''}`}
                </small>
                <input multiple type='file' name={this.props.uploadType} accept='image/*' onChange={this.onSelectFileChanged} style={{ display: 'none' }} ref={this.uploadInput} />
            </div>
        );
    }
}