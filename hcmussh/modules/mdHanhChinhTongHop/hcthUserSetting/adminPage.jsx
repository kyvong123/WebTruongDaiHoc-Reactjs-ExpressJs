import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox } from 'view/component/AdminPage';
import { getSetting, updateSetting } from './redux';

class UserSettingPage extends AdminPage {

    componentDidMount() {
        this.setState({ isLoading: true }, () => {
            this.props.getSetting((setting = {}) => {
                Object.keys(setting || {}).forEach(key => {
                    this[key] && this[key].value(!!setting[key]);
                });
            }, () => this.setState({ isLoading: false }));
        });
    }

    onSave = () => {
        const data = ['vanBanDenSms', 'vanBanDiSms', 'vanBanDenEmail', 'vanBanDiEmail'].reduce((data, key) => {
            data[key] = Number(this[key]?.value()) || 0;
            return data;
        }, {});
        this.setState({ isLoading: true }, () => {
            this.props.updateSetting(data, null, () => this.setState({ isLoading: false }));
        });
    }

    render() {
        return this.renderPage({
            title: 'Cài đặt của bạn',
            onSave: this.onSave,
            content: <div className='row'>
                <div className='col-md-12'>
                    <div className='tile'><p className='text-danger'>*Lưu ý: các thông báo sẽ được gửi 1 mỗi 4 tiếng từ 8-16h hằng ngày</p></div>
                </div>
                <div className='col-md-12'>
                    <div className='tile '>
                        <h3 className='tile-header'>Thông báo văn phòng điện tử</h3>
                        <div className='tile-body row'>
                            <FormCheckbox ref={e => this.vanBanDenSms = e} isSwitch className='col-md-12' label='Nhận thông báo về văn bản qua sms' />
                            <FormCheckbox ref={e => this.vanBanDenEmail = e} isSwitch className='col-md-12' label='Nhận thông báo về văn bản qua email' />
                        </div>
                    </div>
                </div>
            </div>
        });
    }
}

const stateToProps = (state) => ({ system: state.system });
export default connect(stateToProps, { getSetting, updateSetting })(UserSettingPage);