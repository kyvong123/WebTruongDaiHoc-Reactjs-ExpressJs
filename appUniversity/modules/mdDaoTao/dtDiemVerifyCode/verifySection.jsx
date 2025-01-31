import { connect } from 'react-redux';
import React from 'react';
import { AdminPage, FormTextBox, getValue, AdminModal } from 'view/component/AdminPage';
import { dtDiemVerifyCodeGetValue, dtDiemVerifyCodeConfirm, dtDiemVerifyCheck } from './redux';
import { Html5QrcodeScanner } from 'html5-qrcode';

class ScanModal extends AdminModal {
    componentDidMount() {
        this.onHidden(() => {
            let { html5QrcodeScanner } = this.state;
            if (html5QrcodeScanner) {
                html5QrcodeScanner.clear();
            }
        });
    }

    onShow = () => {
        let html5QrcodeScanner = new Html5QrcodeScanner(
            'reader',
            { fps: 10, qrbox: { width: 150, height: 150 } },
            false);
        this.setState({ html5QrcodeScanner }, () => html5QrcodeScanner.render(this.props.onScanSuccess, this.props.onScanFailure));
    }

    render = () => {
        return this.renderModal({
            title: 'Quét mã',
            size: 'large',
            body: <>
                <div id='reader' className='tile'></div>
            </>
        });
    }
}

class dtDiemVeriyCode extends AdminPage {
    state = { listStudent: [], configThanhPhan: [], listCode: [] }

    componentDidMount() {
        this.code.focus();
    }

    handleChange = e => {
        if (e.key == 'Enter') {
            let code = getValue(this.code);
            this.getCode(code);
        }
    }

    getCode = (code) => {
        const { listCode } = this.state;
        if (listCode.includes(code)) {
            this.code.value('');
            return T.notify('Mã code đã được quét!', 'danger');
        }
        this.setState({ listCode: [code, ...listCode] }, () => {
            this.code.value('');
            this.code.focus();
        });
    }

    handleConfirm = () => {
        T.confirm('Kiểm tra mã', 'Bạn có muốn kiểm tra các mã đã quét này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                const { listCode } = this.state;

                if (!listCode.length) return T.notify('Không có mã nào đã được quét!', 'danger');
                T.alert('Đang kiểm tra mã. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.dtDiemVerifyCheck(listCode, this.props.idFolder, () => {
                    this.props.handleVerify();
                    this.setState({ listCode: [] });
                    T.alert('Xác nhận mã thành công!', 'success', false, 5000);
                });
            }
        });
    }

    onScanSuccess = (decodedText) => {
        this.modal.hide();
        this.getCode(decodedText);
    }

    onScanFailure = () => { }

    render() {
        const { listCode } = this.state;

        return <>
            <ScanModal ref={e => this.modal = e} onScanSuccess={this.onScanSuccess} onScanFailure={this.onScanFailure} />
            <div>
                <div className='tile row' style={{ margin: 'auto' }}>
                    <FormTextBox ref={e => this.code = e} className='col-md-8' label='Mã code' onKeyDown={e => this.handleChange(e)} required />
                    <div className='col-md-4' style={{ margin: 'auto', display: 'flex', gap: '10px' }}>
                        <button style={{ height: 'fit-content' }} className='btn btn-primary' type='button' onClick={e => e && e.preventDefault() || this.handleConfirm()}>
                            <i className='fa fa-fw fa-lg fa-check-square-o' /> Xác nhận
                        </button>
                        <button style={{ height: 'fit-content', marginLeft: '10px' }} className='btn btn-info' type='button' onClick={e => e && e.preventDefault() || this.modal.show()}>
                            <i className='fa fa-fw fa-lg fa-code' /> Quét mã
                        </button>
                    </div>

                </div>
                <br />
                <div className='tile' style={{ display: listCode.length ? '' : 'none' }}>
                    <div className='tile-title'>
                        <h5>Danh sách mã</h5>
                        <h6 className='text-info'>Số mã đã quét: {listCode.length}</h6>
                    </div>
                    <div className='tile-body row'>
                        {listCode.map((code, index) => (<div key={index} className='col-md-2' style={{ width: '95%' }}>
                            <div style={{
                                margin: '5px 0px', fontSize: 'medium', fontWeight: '500', textAlign: 'center', width: 'inherit', cursor: 'text',
                                display: 'flex', flexDirection: 'row'
                            }} className='btn btn-secondary disabled'>
                                <div style={{ width: '80%' }} >{code}</div>
                                <div style={{ cursor: 'pointer', color: 'red', width: '20%' }} onClick={e => e && e.preventDefault() || this.setState({ listCode: listCode.filter(i => i != code) })}><i className='fa fa-lg fa-times' /></div>
                            </div>
                        </div>))}
                    </div>
                </div>
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ state: state.system });
const mapActionsToProps = { dtDiemVerifyCodeGetValue, dtDiemVerifyCodeConfirm, dtDiemVerifyCheck };
export default connect(mapStateToProps, mapActionsToProps)(dtDiemVeriyCode);