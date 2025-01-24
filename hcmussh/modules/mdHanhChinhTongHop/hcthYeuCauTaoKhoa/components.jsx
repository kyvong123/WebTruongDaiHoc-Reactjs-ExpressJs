import React, { useRef, useEffect, useState } from 'react';
import { AdminModal, FormCheckbox } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';

const defaultLineColor = '#000000'; // black
const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 300;

export class DrawSignatureModal extends AdminModal {
    ref = React.createRef();
    contextRef = React.createRef();
    state = { sigUrl: '' };

    onShow = () => {
        this.setState({ isShow: true });
        const canvas = this.ref.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const { shcc } = this.props.system.user;
        this.props.createSignatureImg(shcc, this.state.sigUrl, () => this.hide());
    }

    onHide = () => {
        const canvas = this.ref.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    render = () => {
        return this.renderModal({
            title: 'Vẽ chữ ký',
            size: 'large',
            body: <div>
                <Canvas lineWith={8} style={{ border: '2px dotted #CCCCCC', borderRadius: 15, cursor: 'crosshair' }} sigUrl={this.state.sigUrl} isShow={this.state.isShow} onChangeSigData={(data) => this.setState({ sigUrl: data })} shcc={this.props.shcc} canvasRef={this.ref} contextRef={this.contextRef} />
            </div>
        });
    }
}

const Canvas = ({ width = 570, height = 380, lineWith = 4, lineColor = defaultLineColor, style = {}, onChangeSigData, shcc, canvasRef, contextRef }) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [uploadImage, setUploadImage] = useState(null);
    const [isChecked, setIsChecked] = useState(false);
    const uploadFileRef = useRef(null);
    const isRemoveBg = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.strokeStyle = lineColor;
        context.lineWidth = lineWith;
        contextRef.current = context;
    }, []);

    useEffect(() => {
        if (uploadImage) {
            const resizeCanvas = document.createElement('CANVAS');
            resizeCanvas.width = DEFAULT_WIDTH;
            resizeCanvas.height = DEFAULT_HEIGHT;
            const { width, height } = uploadImage;
            let ctx = resizeCanvas.getContext('2d');
            ctx.drawImage(uploadImage, (DEFAULT_WIDTH - width) / 2, (DEFAULT_HEIGHT - height) / 2, width, height);
            const data = resizeCanvas.toDataURL('image/png', 1.0);
            onChangeSigData(data);
        }
    }, [uploadImage]);

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    };

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
        const canvas = canvasRef.current;
        const resizeCanvas = document.createElement('CANVAS');
        resizeCanvas.width = DEFAULT_WIDTH;
        resizeCanvas.height = DEFAULT_HEIGHT;
        let ctx = resizeCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
        const data = resizeCanvas.toDataURL('image/png', 1.0);
        onChangeSigData(data);
    };

    const clearDraw = () => {
        setUploadImage(null);
        onChangeSigData('');
        // clear canvas 
        const canvas = canvasRef.current;
        contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    };

    const onSuccess = (response) => {
        if (response.error) T.notify(response.error, 'danger');
        else if (response.item) {
            clearDraw();
            let myImage = new Image();
            myImage.src = 'data:image/png;base64,' + response.item.content;
            myImage.onload = function () {
                let { width: imgWidth, height: imgHeight } = myImage;
                // resize upload image for display
                let hRatio = DEFAULT_WIDTH / imgWidth;
                let vRatio = DEFAULT_HEIGHT / imgHeight;
                let ratio = Math.min(hRatio, vRatio);
                imgWidth = imgWidth * ratio;
                imgHeight = imgHeight * ratio;
                // set new size for upload image
                myImage.width = imgWidth;
                myImage.height = imgHeight;

                contextRef.current.drawImage(
                    myImage,
                    (width - imgWidth) / 2,
                    (height - imgHeight) / 2,
                    imgWidth,
                    imgHeight,
                );
                setUploadImage(myImage);
            };
        }
    };

    const onUploadFile = (e) => {
        if (isRemoveBg.current.value() !== isChecked) setIsChecked(isRemoveBg.current.value());
        e.preventDefault();
        uploadFileRef.current.uploadInput.click();
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center' }}>
                    <canvas ref={canvasRef} width={width} height={height} onMouseDown={startDrawing} onMouseUp={finishDrawing} onMouseMove={draw} style={style} />
                </div>
                <div style={{ width: '23%' }}>
                    <button type='button' className='btn btn-danger' onClick={clearDraw} style={{ width: '100%', marginBottom: 10 }}>
                        <i className='fa fa-refresh' style={{ marginRight: 10 }} />Xoá
                    </button>
                    <button type='button' className='btn btn-primary' onClick={onUploadFile} style={{ width: '100%' }}>
                        <i className='fa fa-upload' style={{ marginRight: 10 }} />Tải lên
                    </button>
                    <FormCheckbox ref={isRemoveBg} className='mt-3' label='Xoá phông nền' style={{ width: '100%' }} />
                    <span style={{ color: 'red' }}>* Lưu ý: Tải hình ảnh có tỉ lệ 1:1 để tránh chèn những hình ảnh có kích thước không mong muốn khi ký</span>
                </div>
            </div>
            <FileBox ref={uploadFileRef} postUrl='/user/upload' uploadType='hcthSignatureFile' userData={`hcthSignatureFile:${shcc}:${Number(isChecked)}`} style={{ display: 'none' }} success={onSuccess} ajax={true} />
        </>
    );
};