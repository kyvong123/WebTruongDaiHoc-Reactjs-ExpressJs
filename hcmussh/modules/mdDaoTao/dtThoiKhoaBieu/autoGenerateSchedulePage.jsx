import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import { getScheduleSettings } from '../dtSettings/redux';
import { dtThoiKhoaBieuGenTime, saveDtThoiKhoaBieuData } from './redux';
import { Link } from 'react-router-dom';
import SectionGenConfig from './section/SectionGenConfig';
import SectionGenAdjust from './section/SectionGenAdjust';
import SectionGenResult from './section/SectionGenResult';


class AutoGenSchedPage extends AdminPage {
    state = { step: 1 }
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.setState({ step: 1 });
            this.tabAll.tabClick(null, 0);
            this.configRef.setVal();
        });
    }

    submitConfig = (e, config, dataCanGen) => {
        this.setState({ step: 2, config }, () => {
            this.tabAll.tabClick(e, 1);
            this.adjustRef.setVal(config, dataCanGen);
        });
    }

    handleSubmitAdjustedData = (data) => {
        this.setState({ ...data, step: 3 }, () => {
            this.tabAll.tabClick(null, 2);
        });
    }

    handleSubmitResult = () => {
        this.setState({ step: 1 }, () => {
            this.tabAll.tabClick(null, 0);
            this.configRef.setVal();
        });
    }

    render() {
        const listSections = [
            { title: <b>1. CẤU HÌNH</b>, component: <SectionGenConfig ref={e => this.configRef = e} submitConfig={this.submitConfig} /> },
            { title: <b>2. ĐIỀU CHỈNH HỌC PHẦN</b>, component: <SectionGenAdjust ref={e => this.adjustRef = e} handleSubmitAdjustedData={this.handleSubmitAdjustedData} />, disabled: this.state.step < 2 },
            { title: <b>3. KẾT QUẢ SINH</b>, component: <SectionGenResult ref={e => this.finalRef = e} handleSubmitResult={this.handleSubmitResult} />, disabled: this.state.step < 3 },
        ];
        return this.renderPage({
            title: 'Tự động sinh thời khoá biểu',
            icon: 'fa fa-cogs',
            backRoute: '/user/dao-tao/thoi-khoa-bieu',
            breadcrumb: [
                <Link key={0} to={'/user/dao-tao'}>Đào tạo</Link>,
                <Link key={1} to={'/user/dao-tao/thoi-khoa-bieu'}>Thời khoá biểu</Link>,
                'Tự động sinh'
            ],
            content:
                <FormTabs ref={e => this.tabAll = e} tabs={listSections} tabClassName='nav-fill' />
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = {
    getScheduleSettings, dtThoiKhoaBieuGenTime, saveDtThoiKhoaBieuData
};
export default connect(mapStateToProps, mapActionsToProps)(AutoGenSchedPage);