import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import { getAllDtSettings } from './redux';
import { getAllDtCauHinhDiem } from '../dtCauHinhDiem/redux';
import ScheduleConfigSection from './section/ScheduleConfigSection';
import SemesterConfigSettings from './section/SemesterConfigSection';
// import ThoiGianPhanCongConfigSection from './section/ThoiGianPhanCongConfigSection';
import CauHinhDiemConfigSection from './section/CauHinhDiemConfigSection';
import EmailSection from './section/EmailSection';

class DtSetting extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getAllDtSettings(items => {
                this.configSchedule.setValue(items);
            });
            this.props.getAllDtCauHinhDiem(items => {
                this.configDiem.setValue(items);
            });
        });
    }

    render() {
        const permissionSem = this.getUserPermission('dtSemester');
        return this.renderPage({
            title: 'Cấu hình',
            icon: 'fa fa-sliders',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Cấu hình'
            ],
            backRoute: '/user/dao-tao',
            content: <div className='row'>
                {permissionSem.read && <div className='col-md-12'>
                    <SemesterConfigSettings />
                </div>}
                <div className='col-md-4'>
                    <div className='row'><div className='col'>
                        <ScheduleConfigSection ref={e => this.configSchedule = e} />
                    </div></div>
                </div>
                <div className='col-md-4'>
                    <div className='row'><div className='col'>
                        <CauHinhDiemConfigSection ref={e => this.configDiem = e} />
                    </div></div>
                </div>
                <div className='col-md-12'>
                    <EmailSection />
                </div>
                {/* {permissionPhanCong.read && <div className='col-md-8'>
                    <ThoiGianPhanCongConfigSection />
                </div>} */}
            </div>,
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getAllDtSettings, getAllDtCauHinhDiem };
export default connect(mapStateToProps, mapActionsToProps)(DtSetting);