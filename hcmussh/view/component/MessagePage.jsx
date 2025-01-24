import React from 'react';
export default class MessagePage extends React.Component {
    state = { ready: false };

    componentDidMount() {
        let pathname = window.location.pathname, prefix = this.props.prefix, ignorePrefix = this.props.ignorePrefix;
        if (pathname.startsWith('/active-user/')) {
            T.post(window.location.pathname, res => this.setState({ ready: true, message: res.message }), () => T.notify('Kích hoạt người dùng bị lỗi!', 'danger'));
        } else if (ignorePrefix && Array.isArray(ignorePrefix)) {
            if (ignorePrefix.some(item => pathname.startsWith(item))) {
                location.reload();
            } else {
                this.setState({ ready: true });
            }
        } else if (prefix && !pathname.startsWith(prefix)) {
            location.reload();
        } else if (pathname == '/request-login' && window.location.hostname == 'canbo.hcmussh.edu.vn') {
            window.location.replace('https://hcmussh.edu.vn/user');
        } else {
            this.setState({ ready: true });
        }
    }

    goToHomePage = (e) => e.preventDefault() || window.open('/', '_self');

    render() {
        let pathname = window.location.pathname,
            message = 'Xin vui lòng chờ trong giây lát!';
        if (pathname == '/404.html') {
            message = 'Trang web này không tồn tại!';
        } else if (pathname == '/registered') {
            message = 'Cảm ơn bạn đã đăng ký thành viên!<br/>Xin vui lòng kiểm tra email để kích hoạt tài khoản.';
        } else if (pathname.indexOf('/request-permissions') != -1) {
            message = 'Bạn không có quyền truy cập, <br/> Vui lòng liên hệ quản trị viên để được cấp quyền.';
        } else if (pathname == '/request-login') {
            message = 'Yêu cầu đăng nhập (bằng tài khoản email của trường) trước khi truy cập.';
        } else if (pathname == '/require-browser') {
            message = 'Bạn vui lòng sử dụng Google Chrome!';
        } else if (this.state.message) {
            message = this.state.message;
        } else if (this.props.message) {
            message = this.props.message;
        }

        return !this.state.ready ? <div /> : (
            <div style={{ position: 'absolute', zIndex: '3000', background: '#fff', width: '100%', height: '100%' }}>
                <div className='central-box'>
                    <h3 dangerouslySetInnerHTML={{ __html: message }} />
                    Nhấp vào <a href='#' onClick={this.goToHomePage}>đây</a> để trở về trang chủ.
                </div>
            </div>
        );
    }
}