import React from 'react';
import { connect } from 'react-redux';
import { getSdhDiemConfigAll, getSdhDiemConfigBySemester } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import SdhDiemConfigTime from './configTimeSection';
import SdhDiemConfigQuyChe from '../sdhDiemConfigQuyChe/adminPage';
import SdhDiemConfigThanhPhan from '../sdhDiemConfigThanhPhan/adminPage';
class EditPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            const route = T.routeMatcher('/user/sau-dai-hoc/grade-manage/semester/:ma'),
                maHocKy = route.parse(window.location.pathname).ma;
            if (!this.props.location.state) {
                this.props.history.push('/user/sau-dai-hoc/grade-manage/setting');
            }
            this.maHocKy = maHocKy;
        });
    }
    updateSelector = () => {
        this.configQuyChe?.getData();
    }

    render() {
        let dataState = this.props.location.state || {},
            { namHoc, hocKy } = dataState;
        dataState.maHocKy = this.maHocKy;

        return this.renderPage({

            icon: 'fa fa-list-alt',
            title: `Cấu hình điểm NH: ${namHoc} HK: ${hocKy}`,
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/quan-ly-diem'>Điểm</Link>,
                'Cấu hình điểm'
            ],
            content: <>
                <div>
                    <FormTabs tabs={[
                        {
                            title: 'Thông số cấu hình điểm',
                            component: <SdhDiemConfigTime semester={dataState} />
                        },
                        {
                            title: 'Điểm thành phần',
                            component: <SdhDiemConfigThanhPhan semester={dataState} updateSelector={this.updateSelector} />
                        },
                        {
                            title: 'Điểm đặc biệt',
                            component: <SdhDiemConfigQuyChe semester={dataState} ref={e => this.configQuyChe = e} />
                        },
                    ]} ref={e => this.editTab = e} />
                </div>,
            </>,
            backRoute: '/user/sau-dai-hoc/quan-ly-diem ',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getSdhDiemConfigAll, getSdhDiemConfigBySemester };
export default connect(mapStateToProps, mapActionsToProps)(EditPage);