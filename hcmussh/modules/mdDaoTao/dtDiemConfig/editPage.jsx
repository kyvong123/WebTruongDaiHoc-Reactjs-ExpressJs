import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import DtDiemThanhPhanPage from 'modules/mdDaoTao/dtDiemConfigThanhPhan/adminPage';
import DtDiemQuyChePage from 'modules/mdDaoTao/dtDiemConfigQuyChe/adminPage';
import ConfigDiemSection from './ConfigDiemSection';
import DtDiemDatPage from 'modules/mdDaoTao/dtDiemConfigDiemDat/adminPage';

class EditPage extends AdminPage {
    idSemester = '';

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            const route = T.routeMatcher('/user/dao-tao/grade-manage/setting/:idSemester'),
                idSemester = route.parse(window.location.pathname).idSemester;
            if (!this.props.location.state) {
                this.props.history.push('/user/dao-tao/grade-manage/setting');
            }
            this.idSemester = idSemester;
            this.setState({ idSemester });
        });
    }



    render() {
        let dataState = this.props.location.state || {},
            { namHoc, hocKy } = dataState;
        return this.renderPage({
            icon: 'fa fa-leaf',
            title: `Cấu hình điểm:  NH${namHoc} - HK${hocKy}`,
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/grade-manage'>Điểm</Link>,
                'Cấu hình điểm'
            ],
            content:
                <div>
                    <FormTabs tabs={[
                        {
                            title: 'Thông số cấu hình điểm',
                            component: <ConfigDiemSection semester={dataState} />
                        },
                        {
                            title: 'Điểm thành phần',
                            component: <DtDiemThanhPhanPage semester={dataState} />
                        },
                        {
                            title: 'Điểm đặc biệt',
                            component: <DtDiemQuyChePage semester={dataState} />
                        },
                        {
                            title: 'Điểm đạt',
                            component: <DtDiemDatPage semester={dataState} />
                        }
                    ]} />
                </div>,
            backRoute: '/user/dao-tao/grade-manage/setting',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
};
export default connect(mapStateToProps, mapActionsToProps)(EditPage);