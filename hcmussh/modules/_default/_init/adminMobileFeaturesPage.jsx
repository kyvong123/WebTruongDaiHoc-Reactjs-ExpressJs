import React from 'react';
import { connect } from 'react-redux';
import { getMobileSystemState, saveMobileSystemState } from './reduxMobileSettings';
import { AdminPage, FormTextBox, FormCheckbox, getValue } from 'view/component/AdminPage';

class SettingsPage extends AdminPage {
    state = {};

    componentDidMount() {
        T.ready('/user/settings/mobile', () => {
            this.props.getMobileSystemState(() => {
                let { isBlackbox, isYShop, isQA, latestIOSVersion, latestAndroidVersion, isTtLienHeBeta, isTmdtYShopTestBeta, isMaintainence } = this.props.mobileSystem ? this.props.mobileSystem : { isBlackbox: '0', isYShop: '0', isQA: '0' };
                this.isQA.value(Number(isQA || '0'));
                this.isBlackbox.value(Number(isBlackbox || '0'));
                this.isTtLienHeBeta.value(Number(isTtLienHeBeta || '0'));
                this.isYShop.value(Number(isYShop || '0'));
                this.isTmdtYShopTestBeta.value(Number(isTmdtYShopTestBeta || '0'));
                this.latestIOSVersion.value(latestIOSVersion || '');
                this.latestAndroidVersion.value(latestAndroidVersion || '');
                this.isMaintainence.value(Number(isMaintainence || '0'));
            });
        });
    }

    saveFeatureReleaseInfo = () => {
        this.props.saveMobileSystemState({
            isQA: Number(getValue(this.isQA)),
            isBlackbox: Number(getValue(this.isBlackbox)),
            isYShop: Number(getValue(this.isYShop))
        });
    }

    saveToggleFeatureTesting = () => {
        this.props.saveMobileSystemState({
            isTtLienHeBeta: Number(getValue(this.isTtLienHeBeta)),
            isTmdtYShopTestBeta: Number(getValue(this.isTmdtYShopTestBeta))
        });
    }

    saveLatestVersion = () => {
        this.props.saveMobileSystemState({
            latestIOSVersion: getValue(this.latestIOSVersion),
            latestAndroidVersion: getValue(this.latestAndroidVersion),
        });
    }

    saveMaintainence = () => {
        this.props.saveMobileSystemState({
            isMaintainence: Number(getValue(this.isMaintainence)),
        });
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-cog',
            title: 'Cấu hình Mobile',
            backRoute: '/user/settings/mobile',
            content: <>
                <div className='row'>
                    <div className='col-md-7'>
                        <div className='tile'>
                            <h3 className='tile-title'>Ẩn hiện tính năng</h3>
                            <div className='tile-body'>
                                <FormCheckbox ref={e => this.isQA = e} label='Q&A' />
                                <FormCheckbox ref={e => this.isBlackbox = e} label='Blackbox' />
                                <FormCheckbox ref={e => this.isYShop = e} label='YShop' />
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={this.saveFeatureReleaseInfo}>
                                    <i className='fa fa-fw fa-lg fa-save' />Lưu
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='col-md-5'>
                        <div className='tile'>
                            <h3 className='tile-title'>Phiên bản</h3>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.latestIOSVersion = e} label='Latest IOS' />
                                <FormTextBox ref={e => this.latestAndroidVersion = e} label='Latest Android' />
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={this.saveLatestVersion}>
                                    <i className='fa fa-fw fa-lg fa-save' />Lưu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='row'>
                    <div className='col-md-7'>
                        <div className='tile'>
                            <h3 className='tile-title'>Bật tắt trạng thái Beta cho các tính năng</h3>
                            <div className='tile-body'>
                                <FormCheckbox ref={e => this.isTtLienHeBeta = e} label='Beta Q&A/Blackbox ?' />
                                <FormCheckbox ref={e => this.isTmdtYShopTestBeta = e} label='Beta YShop ?' />
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={this.saveToggleFeatureTesting}>
                                    <i className='fa fa-fw fa-lg fa-save' />Lưu
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='col-md-5'>
                        <div className='tile'>
                            <h3 className='tile-title'>Bật tắt chế độ bảo trì</h3>
                            <div className='tile-body'>
                                <FormCheckbox ref={e => this.isMaintainence = e} label='Chế độ bảo trì ?' />
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={this.saveMaintainence}>
                                    <i className='fa fa-fw fa-lg fa-save' />Lưu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        });
    }
}

const mapStateToProps = state => ({ mobileSystem: state.mobileSystem });
const mapActionsToProps = { getMobileSystemState, saveMobileSystemState };
export default connect(mapStateToProps, mapActionsToProps)(SettingsPage);
