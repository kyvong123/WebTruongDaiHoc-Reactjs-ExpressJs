import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import { getSdhDanhSachNganhPage } from 'modules/mdSauDaiHoc/sdhTsInfoNganh/redux';
import ComponentNganh from './section/componentNganh';
class DanhSachNganh extends AdminPage {
    state = { checked: {}, sortTerm: 'phanHe_ASC', isKeySearch: false, isFixCol: true, isCoDinh: false, data: {}, listThiSinh: [] };
    componentNganh = {};
    componentDidMount() {
        this.getPage(undefined, undefined, '');
    }
    getPage = (pageN, pageS, pageC) => {
        let filter = { ...this.state.filter, idDot: this.props.idDot, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhDanhSachNganhPage(pageN, pageS, pageC, filter, page => this.setState({ listNganh: page.list, page }));
    }

    render() {
        let nganhTabs = [];
        const listPhong = this.props.listPhong;
        let dataNganh = this.state.listNganh ? this.state.listNganh : [];
        nganhTabs = listPhong.map((i, index) => ({ id: i.id, title: i.phong, component: <ComponentNganh idDot={this.props.idDot} ref={e => this.componentNganh[index] = e} key={index} phong={i} dataNganh={dataNganh} page={this.state.page || {}} callBackChangeTabs={this.props.callBackChangeTabs} /> }));
        return <>
            <FormTabs ref={this.nganhTabs} tabs={nganhTabs} />
        </>;
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getSdhDanhSachNganhPage };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(DanhSachNganh);
