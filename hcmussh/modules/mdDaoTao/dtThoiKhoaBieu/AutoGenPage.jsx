import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import SectionConfig from './section/SectionConfig';
import { getScheduleSettings } from '../dtSettings/redux';
import SectionAdjust from './section/SectionAdjust';
import SectionThuTiet from './section/SectionThuTiet';
import SectionResultTime from './section/SectionResultTime';
import { dtThoiKhoaBieuGenTime, saveDtThoiKhoaBieuData } from './redux';
import SectionRoom from './section/SectionRoom';
import SectionFinal from './section/SectionFinal';
import { Link } from 'react-router-dom';

class AutoGenSchedPage extends AdminPage {
    state = { step: 1 }
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.setState({ step: 1 });
            this.tabAll.tabClick(null, 0);
        });
        T.socket.on('gen-tkb-data', ({ requester, dataReturn, status }) => {
            if (requester == this.props.system.user.email) {
                this.finalRef.setValue({ dataReturn, status }, () => {
                    if (status == 'genDone') T.alert('Sinh dữ liệu thành công!', 'success', false, 1000);
                    this.getResultGenRoom();
                });
            }
        });
        T.socket.on('save-gen-tkb-data', ({ requester, maHocPhan, status }) => {
            if (requester == this.props.system.user.email) {
                if (status == 'saving') {
                    T.alert(`Đang lưu dữ liệu học phần ${maHocPhan}`, 'warning', false, null, true);
                } else if (status == 'saveDone') {
                    T.alert('Lưu dữ liệu thành công', 'success', false, 5000);
                }
            }
        });
    }

    submitConfig = (e, config) => {
        this.setState({ step: 2, config }, () => {
            this.tabAll.tabClick(e, 1);
            this.adjustRef.setVal(config);
        });
    }

    handleSubmitAdjustedData = (data) => {
        this.thuTietRef.setVal(data);
        this.setState({ ...data, step: 3 }, () => {
            this.tabAll.tabClick(null, 2);
        });
    }

    handleGenThuTiet = (data, done) => {
        this.props.dtThoiKhoaBieuGenTime({
            listData: this.props.dtThoiKhoaBieu.dataCanGen,
            config: { ...this.state.config, fullDataTiet: data.fullDataTiet },
            timeConfig: data.timeConfig
        }, () => {
            done && done();
        }, () => {
            done && done();
            if (this.props.dtThoiKhoaBieu.dataCanGen.some(item => item.isDuplicate == 1)) T.notify('Có môn học của ngành bị trùng thời gian môn khác!', 'warning');
            else T.notify('Sinh tự động thứ, tiết thành công!', 'success');
            this.setState({ step: 4 }, () => {
                this.tabAll.tabClick(null, 3);
                this.resultRef.setVal(this.state.config);
            });
        });
    }

    handleRoom = (dataCanGen, nganhMapper) => {
        this.props.saveDtThoiKhoaBieuData({ dataCanGen: dataCanGen.filter(item => item.xepPhong == 1), config: this.state.config, nganhMapper }, () => {
            this.setState({ step: 5 }, () => {
                this.tabAll.tabClick(null, 4);
                this.roomRef.setVal();
            });
        });
    }

    getResultGenRoom = () => {
        this.setState({ step: 6 }, () => {
            this.tabAll.tabClick(null, 5);
            // this.roomRef.setVal();
        });
    }

    render() {
        const listSections = [
            { title: <b>1. CẤU HÌNH</b>, component: <SectionConfig ref={e => this.configRef = e} submitConfig={this.submitConfig} /> },
            { title: <b>2. ĐIỀU CHỈNH HỌC PHẦN</b>, component: <SectionAdjust ref={e => this.adjustRef = e} handleSubmitAdjustedData={this.handleSubmitAdjustedData} />, disabled: this.state.step < 2 },
            { title: <b>3. PHÂN BỐ THỨ, TIẾT</b>, component: <SectionThuTiet ref={e => this.thuTietRef = e} handleGenThuTiet={this.handleGenThuTiet} />, disabled: this.state.step < 3 },
            { title: <b>4. SINH THỨ, TIẾT</b>, component: <SectionResultTime ref={e => this.resultRef = e} handleRoom={this.handleRoom} />, disabled: this.state.step < 4 },
            { title: <b>5. PHÂN BỐ PHÒNG</b>, component: <SectionRoom ref={e => this.roomRef = e} getResultGenRoom={this.getResultGenRoom} />, disabled: this.state.step < 5 },
            { title: <b>6. XẾP PHÒNG</b>, component: <SectionFinal ref={e => this.finalRef = e} history={this.props.history} />, disabled: this.state.step < 6 },

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