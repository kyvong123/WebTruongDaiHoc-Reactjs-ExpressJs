import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTabs, FormSelect } from 'view/component/AdminPage';
import ImportPage from './importPage';
import { SelectAdapter_DotXetTotNghiepAll } from 'modules/mdDaoTao/dtCauHinhDotXetTotNghiep/redux';
import { getDtKetQuaTotNghiepPage } from './redux';
import DanhSachPage from './danhSachPage';

class userPage extends AdminPage {
    state = { filter: {} }

    render() {

        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Kết quả xét tốt nghiệp',
            header: <>
                <FormSelect ref={e => this.dot = e} data={SelectAdapter_DotXetTotNghiepAll} label='Đợt xét tốt nghiệp' onChange={e => this.setState({ filter: { idDot: e.id } }, () => this.dspage.getPage(1, 50))} />
            </>,
            content: <>
                <div className='tile'>
                    <FormTabs tabs={[
                        { title: 'Danh sách kết quả', component: <DanhSachPage ref={e => this.dspage = e} filter={this.state.filter} /> },
                        { title: 'Upload danh sách', component: <ImportPage filter={this.state.filter} handleSave={() => this.dspage.getPage()} /> },
                    ]} />
                </div>
            </>,
            breadcrumb: ['Kết quả xét tốt nghiệp'],
            backRoute: '/user/dao-tao',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, kqTotNghiep: state.daoTao.kqTotNghiep });
const mapActionsToProps = { getDtKetQuaTotNghiepPage };
export default connect(mapStateToProps, mapActionsToProps)(userPage);
