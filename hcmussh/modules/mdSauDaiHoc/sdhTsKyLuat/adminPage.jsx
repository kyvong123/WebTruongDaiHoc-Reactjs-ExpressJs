import React from 'react';
import { connect } from 'react-redux';
import { AdminPage } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import KyLuatSection from './section/kyLuatSection';
import { getSdhDanhSachKyLuatPage } from './redux';
import { getSdhTsProcessingDot } from 'modules/mdSauDaiHoc/sdhTsInfoTime/redux';

class QuanLyKyLuatPage extends AdminPage {
    defaultSortTerm = 'ten_ASC'
    state = { filter: {}, sortTerm: 'ten_ASC', isKeySearch: false };
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getSdhTsProcessingDot(data => {
                if (data && data.id) {
                    this.setState({ idDot: data.id }, () => {
                        this.getPage(undefined, undefined, '');
                    });
                } else {
                    this.props.history.push('/user/sau-dai-hoc/tuyen-sinh/dot-tuyen-sinh');
                }
            });
        });
    }
    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, vang: 1, kyLuat: 1, idDot: this.state.idDot ? this.state.idDot : '', sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhDanhSachKyLuatPage(pageN, pageS, pageC, filter, done);
    }
    render() {
        // const vangSection = {
        //     key: 'vang', title: 'Quản lý vắng', component: <VangSection idDot={this.state.idDot} sdhTsKyLuat={this.props.sdhTsKyLuat} />
        // };
        // const kyLuatSection = {
        //     key: 'kyLuat', title: 'Quản lý kỷ luật', component: <KyLuatSection idDot={this.state.idDot} sdhTsKyLuat={this.props.sdhTsKyLuat} />
        // };
        // const tabs = [vangSection, kyLuatSection];

        return this.renderPage({
            icon: 'fa fa-user-circle-o',
            title: 'Quản lý kỷ luật',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                'Quản lý kỷ luật'
            ],
            content: <>
                {/* <FormTabs tabs={tabs} /> */}
                <KyLuatSection idDot={this.state.idDot} sdhTsKyLuat={this.props.sdhTsKyLuat} />
            </>,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh',
        });
    }
}
const mapStateToProps = state => ({ system: state.system, sdhTsKyLuat: state.sdh.sdhTsKyLuat });
const mapActionsToProps = {
    getSdhTsProcessingDot, getSdhDanhSachKyLuatPage
};
export default connect(mapStateToProps, mapActionsToProps)(QuanLyKyLuatPage);