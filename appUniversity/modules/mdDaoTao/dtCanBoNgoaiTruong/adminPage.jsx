import React from 'react';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { getDtCBNgoaiTruong, createDtCBNgoaiTruong, updateDtCBNgoaiTruong, deleteDtCBNgoaiTruong } from './redux';
import CBNTPage from './CBNTPage';
import CBTTPage from './CBTTPage';
class DtCanBoPage extends AdminPage {
    componentDidMount() {
        this.tab.tabClick(null, 0);
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-user',
            title: 'Cán bộ',
            content: <FormTabs ref={e => this.tab = e} id='tabsCanBo' contentClassName='tile' tabs={[
                { title: 'Cán bộ trong trường', component: <CBTTPage /> },
                { title: 'Cán bộ ngoài trường', component: <CBNTPage /> },
            ]} />,
            backRoute: '/user/dao-tao',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtCanBoNgoaiTruong: state.daoTao.dtCanBoNgoaiTruong });
const mapActionsToProps = { getDtCBNgoaiTruong, createDtCBNgoaiTruong, updateDtCBNgoaiTruong, deleteDtCBNgoaiTruong };
export default connect(mapStateToProps, mapActionsToProps)(DtCanBoPage);