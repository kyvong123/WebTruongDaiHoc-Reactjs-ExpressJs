import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, FormTabs } from 'view/component/AdminPage';

import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { executeTaskGetItem } from '../../_default/fwExecuteTask/redux';
import HuyChuyenHocPhan from './section/HuyChuyenHocPhan';
import FormDangKyTrucTiep from './section/FormDangKyTrucTiep';
import FormDangKySinhVien from './section/FormDangKySinhVien';
import ImportDangKyTrucTiep from './section/ImportDangKyTrucTiep';
import ImportHuyDangKyTrucTiep from './section/ImportHuyDangKyTrucTiep';
class DtDangKyHocPhanPage extends AdminPage {
    state = { isDone: false, isDoneHuy: false, current: 0, currentHuy: 0, currentSemester: {} }

    componentDidMount() {
        if (!$('.app').hasClass('sidenav-toggled')) {
            $('.app').addClass('sidenav-toggled');
        }
        this.tab.tabClick(null, 0);
        this.props.getScheduleSettings(data => {
            let { namHoc, hocKy } = data.currentSemester;
            this.namHoc.value(namHoc);
            this.hocKy.value(hocKy);
            this.setState({ currentSemester: { namHoc, hocKy } }, () => this.getPage());
        });
        T.ready('/user/dao-tao', () => {
            let params = T.getUrlParams(window.location.href);
            if (Object.keys(params).length) {
                let { taskId, tabIndex } = params;
                this.props.executeTaskGetItem(taskId, data => {
                    const { items, falseItem } = data;
                    this.tab.tabClick(null, tabIndex);
                    this.importSection?.setValue({ items, falseItem, value: 2, taskId }, true);
                });
            }
            T.socket.on('import-start-done', ({ requester, items, falseItem }) => {
                if (requester == this.props.system.user.email) {
                    this.setState({ current: -1, isDone: false });
                    this.importSection?.setValue({ items, falseItem, value: -1 });
                }
            });
            T.socket.on('import-get-data-done', ({ requester, items, falseItem }) => {
                if (requester == this.props.system.user.email) {
                    this.setState({ current: -1, isDone: false });
                    this.importSection?.setValue({ items, falseItem, value: 0 });
                }
            });

            T.socket.on('import-huy-single-done', ({ requester, items, falseItem, index }) => {
                if (requester == this.props.system.user.email) {
                    this.setState({ currentHuy: index, isDoneHuy: false });
                    this.importHuySection?.setValue({ items, falseItem });
                }
            });
            T.socket.on('import-huy-all-done', ({ requester, items, falseItem }) => {
                if (requester == this.props.system.user.email) {
                    this.setState({ currentHuy: 0, isDoneHuy: true });
                    this.importHuySection?.setValue({ items, falseItem }, true);
                }
            });
            T.socket.on('save-dkhp', ({ requester, isDone, maHocPhan }) => {
                if (requester == this.props.system.user.email) {
                    if (isDone) {
                        T.alert('Lưu dữ liệu đăng ký học phần thành công', 'success', false, 1000);
                    } else {
                        T.alert(`Đang lưu dữ liệu đăng ký học phần ${maHocPhan}`, 'warning', false, null, true);
                    }
                }
            });
        });
    }

    componentWillUnmount() {
        T.socket.off('import-huy-single-done');
        T.socket.off('import-huy-all-done');
        T.socket.off('save-dkhp');
    }

    getPage = () => {
        this.huyChuyenSection?.getSemester();
        this.sinhVienSection?.getSemester();
        this.trucTiepSection?.getSemester();
        this.importHuySection?.getSemester();
    }

    render() {
        const perm = this.getUserPermission('dtDangKyHocPhan', ['lop', 'sinhVien', 'import', 'huyImport', 'huyChuyen', 'manage']);
        const tabs = [];

        if (perm.manage || perm.lop) tabs.push({
            title: 'Đăng ký theo lớp',
            component: <FormDangKyTrucTiep ref={e => this.trucTiepSection = e} currentSemester={this.state.currentSemester} />
        });

        if (perm.manage || perm.sinhVien) tabs.push({
            title: 'Đăng ký theo sinh viên',
            component: <FormDangKySinhVien ref={e => this.sinhVienSection = e} currentSemester={this.state.currentSemester} />
        });

        if (perm.manage || perm.import) tabs.push({
            title: `Import Excel ${(!this.state.isDone && this.state.current && this.state.current != -1) ? `(Đang import hàng ${this.state.current})` : ''}`,
            component: <ImportDangKyTrucTiep ref={e => this.importSection = e} currentSemester={this.state.currentSemester} />
        });

        if (perm.manage || perm.huyImport) tabs.push({
            title: `Import Excel hủy đăng ký ${(!this.state.isDoneHuy && this.state.currentHuy) ? `(Đang import hàng ${this.state.currentHuy})` : ''}`,
            component: <ImportHuyDangKyTrucTiep ref={e => this.importHuySection = e} currentSemester={this.state.currentSemester} />
        });

        if (perm.manage || perm.huyChuyen) tabs.push({
            title: 'Huỷ/ Chuyển học phần',
            component: <HuyChuyenHocPhan ref={e => this.huyChuyenSection = e} currentSemester={this.state.currentSemester} />
        });

        return this.renderPage({
            icon: 'fa fa-handshake-o',
            title: 'Đăng ký học phần',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/edu-schedule'>Quản lý học phần</Link>,
                'Đăng ký học phần'
            ],
            header: <div className='row'>
                <FormSelect ref={e => this.namHoc = e} style={{ width: '150px', marginBottom: '0', marginRight: '10px' }} data={SelectAdapter_SchoolYear} placeholder='Năm học'
                    onChange={value => this.setState({ currentSemester: { ...this.state.currentSemester, namHoc: value.id } }, () => this.getPage())} />
                <FormSelect ref={e => this.hocKy = e} style={{ width: '150px', marginBottom: '0', marginRight: '10px' }} data={SelectAdapter_DtDmHocKy} placeholder='Học kỳ'
                    onChange={value => this.setState({ currentSemester: { ...this.state.currentSemester, hocKy: value?.id } }, () => this.getPage())} />
            </div>,
            content: (
                <>
                    <div>
                        <FormTabs ref={e => this.tab = e} tabs={tabs} />
                    </div>
                </>
            ),
            backRoute: '/user/dao-tao/edu-schedule',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDangKyHocPhan: state.daoTao.dtDangKyHocPhan });
const mapActionsToProps = { getScheduleSettings, executeTaskGetItem };
export default connect(mapStateToProps, mapActionsToProps)(DtDangKyHocPhanPage);