import React from 'react';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import SectionBangDiemCaNhan from './section/SectionBangDiemCaNhan';
import SectionImport from './section/SectionImport';
// import SectionInTheoFilter from './section/SectionInTheoFilter';

class ListStudentPage extends AdminPage {
    componentDidMount = () => {
        if (!$('.app').hasClass('sidenav-toggled')) {
            $('.app').addClass('sidenav-toggled');
        }
        this.setState({ tabId: Math.floor(Math.random() * 1000000) });
        this.tab.tabClick(null, 0);
    }

    render() {
        let permission = this.getUserPermission('dtDiemInBangDiem'),
            { tabId } = this.state;
        const tabs = [
            {
                id: 'caNhan', title: 'In phiếu điểm cá nhân', component: <SectionBangDiemCaNhan ref={e => this.caNhan = e} permission={permission} tabId={tabId} />
            },
            {
                id: 'import', title: 'Import danh sách', component: <SectionImport ref={e => this.import = e} tabId={tabId} />
            },
            // {
            //     id: 'inBangDiem', title: 'In phiếu điểm theo filter', component: <SectionInTheoFilter ref={e => this.inTheoFilter = e} />
            // },
        ];
        return this.renderPage({
            title: 'In phiếu điểm',
            icon: 'fa fa-print',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/grade-manage'>Điểm</Link>,
                'In phiếu điểm'
            ],
            content: <>
                <FormTabs ref={e => this.tab = e} tabs={tabs} />
            </>,
            backRoute: '/user/dao-tao/grade-manage',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDiemInBangDiem: state.daoTao.dtDiemInBangDiem });
const mapActionsToProps = {

};
export default connect(mapStateToProps, mapActionsToProps)(ListStudentPage);