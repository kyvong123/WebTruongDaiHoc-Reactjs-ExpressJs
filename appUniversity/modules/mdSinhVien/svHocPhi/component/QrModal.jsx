import React from 'react';
import { AdminModal } from 'view/component/AdminPage';

export default class QR_Modal extends AdminModal {
    state = { image: '' }
    componentDidMount() {
        this.onHidden(() => {
            this.setState({ image: '' });
        });

        T.socket.on('updateThanhToanBhyt', () => {
            T.alert('Đã thanh toán BHYT thành công', 'success', false, 3000);
            this.hide();
        });
    }

    componentWillUnmount() {
        T.socket.off('updateThanhToanBhyt');
    }

    onShow = (base64, checkBh = null) => {
        this.setState({ base64, checkBh });
    }

    render = () => {
        return this.renderModal({
            title: this.props.title || 'Thanh toán qua QR - BIDV',
            body: <div className='row justify-content-center'>
                {this.state.base64 && <img style={{ width: '400px', height: 'auto', maxWidth: '90vw' }} src={`data:image/png;base64,${this.state.base64}`} />}
                {/* <div>hoặc chuyển khoản trực tiếp theo <a href={this.state.checkBh ? T.url(`${T.cdnDomain}/sample/Huong-dan-dong-BHYT-2023.pdf`) : T.url(`${T.cdnDomain}/sample/BIDV-2023-new.pdf`)} target='_blank' rel='noopener noreferrer'>HƯỚNG DẪN</a></div> */}
                {/* TODO */}
            </div>
        });
    }
}