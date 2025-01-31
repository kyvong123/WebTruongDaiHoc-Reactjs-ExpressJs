import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import { FormSelect, FormTabs } from 'view/component/AdminPage';
import { getSdhTsLichThiNgoaiNguPage, getSdhTsLichThiNgoaiNguDstsPage, getSdhTsDsdkNgoaiNguPage } from './redux';

import { SelectAdapter_BmdkMonThiNgoaiNgu } from 'modules/mdSauDaiHoc/sdhTsThongTinCoBan/redux';

import { getSdhTsProcessingDot } from 'modules/mdSauDaiHoc/sdhTsInfoTime/redux';
import LichThiNgoaiNguTab from './tab/LichThiNgoaiNguTab';
import LichThiNgoaiNguDstsTab from './tab/LichThiNgoaiNguDstsTab';


class LichThiNgoaiNguPage extends AdminPage {

    state = { idDot: '', updated: '', maMonThi: '' };
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getSdhTsProcessingDot(data => {
                if (data && data.id) {
                    this.setState({ idDot: data.id });
                } else {
                    this.props.history.push('/user/sau-dai-hoc/dot-tuyen-sinh');
                }
            });
        });

    }

    onUpdated = (tab) => {
        this.setState({ updated: tab }, () => {
            this.getPageLichThiNN();
            this.getPageDsdk();
            this.getPageDsts();

        });
    }

    getPageLichThiNN = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, idDot: this.state.idDot, maMonThi: this.state.maMonThi, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhTsLichThiNgoaiNguPage(pageN, pageS, pageC, filter, done);
    }


    getPageDsts = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, idDot: this.state.idDot, maMonThi: this.state.maMonThi, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhTsLichThiNgoaiNguDstsPage(pageN, pageS, pageC, filter, done);
    }

    getPageDsdk = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, idDot: this.state.idDot, maMonThi: this.state.maMonThi, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhTsDsdkNgoaiNguPage(pageN, pageS, pageC, filter, done);
    }

    changeAdvancedSearch = () => {
        this.setState({ maMonThi: this.monThi?.value() }, this.onUpdated);
    }

    render() {
        const { idDot, maMonThi, updated } = this.state;
        const permission = this.getUserPermission('sdhTuyenSinhLichThi', ['read', 'write', 'delete']);
        const lichThiNgoaiNguTab = {
            id: 'lichThi', key: 'lichThi', title: 'Lịch thi', component: <LichThiNgoaiNguTab onUpdated={this.onUpdated} updatedTab={updated} idDot={idDot} maMonThi={maMonThi} permission={permission} />
        };
        const dstsTab = {
            id: 'dsts', key: 'dsts', title: 'Danh sách thí sinh', component: <LichThiNgoaiNguDstsTab onUpdated={this.onUpdated} idDot={idDot} maMonThi={maMonThi} updatedTab={updated} permission={permission} />
        };
        const tabs = [dstsTab, lichThiNgoaiNguTab];
        return this.renderPage({
            icon: 'fa fa-language',
            title: 'Ngoại ngữ',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                'Lịch thi ngoại ngữ'
            ],
            header: <FormSelect style={{ marginRight: '40', width: '300px', marginBottom: '0' }} ref={e => this.monThi = e} placeholder='Môn thi'
                data={SelectAdapter_BmdkMonThiNgoaiNgu({ idDot })} onChange={() => this.changeAdvancedSearch()} allowClear />,
            content: maMonThi ? <>
                <FormTabs tabs={tabs} />
            </> : null,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh',
        });


    }
}



const mapStateToProps = state => ({ system: state.system, sdhTsLichThiNgoaiNgu: state.sdh.sdhTsLichThiNgoaiNgu });
const mapActionsToProps = {
    getSdhTsProcessingDot, getSdhTsLichThiNgoaiNguPage, getSdhTsLichThiNgoaiNguDstsPage, getSdhTsDsdkNgoaiNguPage
};
export default connect(mapStateToProps, mapActionsToProps)(LichThiNgoaiNguPage);
