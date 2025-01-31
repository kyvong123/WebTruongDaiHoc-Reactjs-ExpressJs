import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormEditor, FormTabs, FormTextBox } from 'view/component/AdminPage';
import { getTcSettingKeys, updateTcSetting } from 'modules/mdKeHoachTaiChinh/tcSetting/redux';


const listKeys = ['baoNghiTitle', 'baoNghiEditorText', 'baoNghiEditorHtml', 'baoBuTitle', 'baoBuEditorText', 'baoBuEditorHtml'];
class EmailSection extends AdminPage {

    componentDidMount() {
        T.ready('/user/finance', () => {
            this.props.getTcSettingKeys(listKeys,
                items => {
                    (items || []).forEach(item => {
                        if (item.key == 'baoNghiEditorHtml') {
                            this.baoNghiEditor.html(item.value);
                        } else if (item.key == 'baoBuEditorHtml') {
                            this.baoBuEditor.html(item.value);
                        } else {
                            const component = this[item.key];
                            component && component.value && component.value(item.value);
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
        this.props.updateTcSetting(changes);
    }

    render() {
        return <FormTabs tabs={[
            {
                title: 'Email báo nghỉ', component: <div className='tile'>
                    <div className='tile-body'>
                        <FormTextBox ref={e => this.baoNghiTitle = e} label='Tiêu đề' />
                        <FormEditor ref={e => this.baoNghiEditor = e} label='Nội dung email' height={400} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('baoNghiTitle', 'baoNghiEditor')}>
                            <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                        </button>
                    </div>
                </div>
            },
            {
                title: 'Email báo bù', component: <div className='tile'>
                    <div className='tile-body'>
                        <FormTextBox ref={e => this.baoBuTitle = e} label='Tiêu đề' />
                        <FormEditor ref={e => this.baoBuEditor = e} label='Nội dung email' height={400} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('baoBuTitle', 'baoBuEditor')}>
                            <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                        </button>
                    </div>
                </div>
            },
        ]} />;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTcSettingKeys, updateTcSetting };
export default connect(mapStateToProps, mapActionsToProps)(EmailSection);