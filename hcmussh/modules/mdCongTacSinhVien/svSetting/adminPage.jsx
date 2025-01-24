import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox, FormEditor, FormTextBox, FormSelect } from 'view/component/AdminPage';
import { getSvSettingKeys, updatSvSettingKeys } from './redux';
import { SelectAdapter_HcthVanBanDiStatusSystem } from 'modules/mdHanhChinhTongHop/hcthVanBanDiStatusSystem/redux/statusSystem';
import { SelectAdapter_FwCanBoDrl } from 'modules/mdTccb/tccbCanBo/redux';

const listKeys = ['choPhepEdit', 'ctsvEmailXacNhanNhapHocTitle', 'ctsvEmailXacNhanNhapHocEditorText', 'ctsvEmailXacNhanNhapHocEditorHtml', 'ctsvEmailGuiLyLichTitle', 'ctsvEmailGuiLyLichEditorText', 'ctsvEmailGuiLyLichEditorHtml', 'defaultEmail', 'systemId', 'emailDrl'];
class SvSetting extends AdminPage {

    componentDidMount() {
        T.ready('/user/ctsv', () => {
            this.props.getSvSettingKeys(...listKeys, items => {
                (items ? Object.keys(items) : []).forEach(key => {
                    let item = { key, value: items[key] };
                    if (item.key == 'ctsvEmailGuiLyLichEditorHtml') {
                        this.ctsvEmailGuiLyLichEditor.html(item.value);
                    } else if (item.key == 'ctsvEmailXacNhanNhapHocEditorHtml') {
                        this.ctsvEmailXacNhanNhapHocEditor.html(item.value);
                    } else if (item.key == 'choPhepEdit') {
                        let value = item.value == 'true' ? 1 : 0;
                        this.choPhepEdit.value(value);
                    } else {
                        const component = this[item.key];
                        component && component.value && component.value(item.value || '');
                    }
                });
            });
        });
    }

    saveEmailTempate = (titleKey, editorKey) => {
        const changes = {};
        changes[titleKey] = this[titleKey].value();
        changes[editorKey + 'Text'] = this[editorKey].text();
        changes[editorKey + 'Html'] = this[editorKey].html();
        this.props.updatSvSettingKeys(changes);
    }

    save = function () {
        const changes = {};
        for (let i = 0; i < arguments.length; i++) {
            const key = arguments[i];
            changes[key] = this[key].value();
        }
        console.log(changes);
        arguments.length && this.props.updatSvSettingKeys(changes);
    }

    render() {
        return this.renderPage({
            title: 'Cấu hình Phòng Công tác Sinh viên',
            icon: 'fa fa-sliders',
            breadcrumb: ['Cấu hình'],
            content: <div className='row'>
                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Cấu hình</h3>
                        <FormTextBox ref={e => this.defaultEmail = e} label='Email mặc định' />
                        <FormCheckbox ref={e => this.choPhepEdit = e} label='Cho phép edit' />
                        <FormSelect ref={e => this.systemId = e} label='Quy trình phát hành' data={SelectAdapter_HcthVanBanDiStatusSystem([32], 'TRUONG', 1)} required />
                        <FormSelect ref={e => this.emailDrl = e} label='Cán bộ quản lý điểm rèn luyện' data={SelectAdapter_FwCanBoDrl} required />
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={() => this.save('choPhepEdit', 'defaultEmail', 'systemId', 'emailDrl')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>
                    </div>
                </div>

                <div className='col-md-12'>
                    <ul className='nav nav-tabs'>
                        <li className='nav-item'>
                            <a className='nav-link active show' data-toggle='tab' href='#ctsvEmailGuiLyLich'>Email gửi lý lịch</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' data-toggle='tab' href='#ctsvEmailXacNhanNhapHoc'>Email xác nhận nhập học</a>
                        </li>
                    </ul>
                    <div className='tab-content tile'>
                        <div className='tab-pane fade active show' id='ctsvEmailGuiLyLich'>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.ctsvEmailGuiLyLichTitle = e} label='Tiêu đề' />
                                <FormEditor ref={e => this.ctsvEmailGuiLyLichEditor = e} label='Nội dung email' height={400} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('ctsvEmailGuiLyLichTitle', 'ctsvEmailGuiLyLichEditor')}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>

                        <div className='tab-pane fade' id='ctsvEmailXacNhanNhapHoc'>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.ctsvEmailXacNhanNhapHocTitle = e} label='Tiêu đề' />
                                <FormEditor ref={e => this.ctsvEmailXacNhanNhapHocEditor = e} label='Nội dung email' height={400} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('ctsvEmailXacNhanNhapHocTitle', 'ctsvEmailXacNhanNhapHocEditor')}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getSvSettingKeys, updatSvSettingKeys
};
export default connect(mapStateToProps, mapActionsToProps)(SvSetting);