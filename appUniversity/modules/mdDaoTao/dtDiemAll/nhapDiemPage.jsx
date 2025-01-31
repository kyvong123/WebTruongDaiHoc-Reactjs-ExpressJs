import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { AdminPage, FormTabs, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { getCurrSemester } from 'modules/mdDaoTao/dtSemester/redux';
import { getDtDmLoaiDiemAll } from 'modules/mdDaoTao/dtDiemDmLoaiDiem/redux';
import NhapDiemExcelSection from './section/nhapDiemExcelSection';
import NhapDiemHocPhanSection from './section/nhapDiemHocPhanSection';
import NhapDiemSvSection from './section/nhapDiemSvSection';
import { executeTaskGetItem } from '../../_default/fwExecuteTask/redux';


class ManageInputDiemPage extends AdminPage {
    state = { filter: {} }
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getCurrSemester(data => {
                let { namHoc, hocKy } = data;
                this.namHoc.value(namHoc);
                this.hocKy.value(hocKy);
                this.setState({
                    filter: { ...this.state.filter, namHoc, hocKy }
                }, () => {
                    this.nhapDiemSection.setValue({ namHoc, hocKy });
                });
            });
            this.props.getDtDmLoaiDiemAll(data => {
                this.setState({ loaiDiem: data });
            });
            let params = T.getUrlParams(window.location.href);
            if (Object.keys(params).length) {
                let { taskId, tabIndex } = params;
                this.props.executeTaskGetItem(taskId, data => {
                    this.tab.tabClick(null, tabIndex);
                    this.nhapDiemExcel.setValue({ ...data, taskId }, true);
                });
            }
        });
    }

    changeData = () => {
        const { filter } = this.state;
        this.nhapDiemSection.setValue(filter);
        this.nhapDiemSv.setValue(filter);
    }

    render() {
        let { filter } = this.state;
        return this.renderPage({
            title: 'Quản lý nhập điểm',
            icon: 'fa fa-pencil-square',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/grade-manage'>Điểm</Link>,
                'Nhập điểm'
            ],
            header: <div className='row'>
                <FormSelect ref={e => this.namHoc = e} className='col-md-6' label='Năm học' data={SelectAdapter_SchoolYear} onChange={value => this.setState({ filter: { ...filter, namHoc: value.id } }, () => this.changeData())} />
                <FormSelect ref={e => this.hocKy = e} className='col-md-6' label='Học kỳ' data={SelectAdapter_DtDmHocKy} onChange={value => this.setState({ filter: { ...filter, hocKy: value.id } }, () => this.changeData())} />
            </div>,
            content: <>
                <FormTabs ref={e => this.tab = e} className='tile' tabs={[
                    {
                        title: 'Nhập điểm sinh viên', component: <NhapDiemSvSection ref={e => this.nhapDiemSv = e} filter={filter} loaiDiem={this.state.loaiDiem} />
                    },
                    {
                        title: 'Nhập điểm lớp học phần', component: <NhapDiemHocPhanSection ref={e => this.nhapDiemSection = e} filter={filter} />
                    },
                    {
                        title: 'Nhập điểm Excel', component: <NhapDiemExcelSection ref={e => this.nhapDiemExcel = e} filter={filter} />
                    }
                ]} />
            </>,
            backRoute: '/user/dao-tao/grade-manage'
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getCurrSemester, getDtDmLoaiDiemAll, executeTaskGetItem };
export default connect(mapStateToProps, mapActionsToProps)(ManageInputDiemPage);
