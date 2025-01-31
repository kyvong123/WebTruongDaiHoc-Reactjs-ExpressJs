import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect } from 'view/component/AdminPage';
// import SectionListAll from './section/SectionListAll';
import SectionFolderScan from './section/SectionFolderScan';
// import { SelectAdapter_SchoolYear } from '../dtSemester/redux';
import { getAllDtDiemSemester, getDtDiemSemesterActive } from './redux';
class DtDiemPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getAllDtDiemSemester(() => {
                this.props.getDtDiemSemesterActive(data => {
                    const { id, namHoc, hocKy } = data;
                    this.idSemester.value(id);
                    this.setState({ filter: { idSemester: id, namHoc, hocKy } },
                        () => this.folderScan.setData(this.state.filter));
                });
            });

        });
    }

    render() {
        const dtDiem = this.props.dtDiem,
            folderList = dtDiem?.folderList || [];
        const data = folderList.map(({ id, namHoc, hocKy }) => ({ id, text: `NH ${namHoc}, HK${hocKy}`, namHoc, hocKy }));

        // const permission = this.getUserPermission('dtDiem', ['read', 'manage', 'write', 'delete']);
        // if (!permission || !permission.write) this.props.history.pushBack.push('/user/dao-tao/grade-manage');
        const listComponent = [
            // {
            //     title: 'Danh sách tổng',
            //     component: <SectionListAll ref={e => this.listAll = e} history={this.props.history} filter={{ namHoc, hocKy, idSemester }} />,
            //     isShow: true
            // },
            // {
            //     title: 'Dashboard - Thống kê',
            //     isShow: false
            // },
            {
                title: 'Quản lý gói scan',
                component: <SectionFolderScan ref={e => this.folderScan = e} history={this.props.history} filter={this.state.filter} />,
                isShow: true
            },
        ];
        return this.renderPage({
            title: 'Quản lý nhập điểm',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/grade-manage'>Quản lý điểm</Link>,
                'Nhập điểm'
            ],
            content: <div>
                {this.state.filter ? listComponent.filter(item => item.isShow).map((item, index) => (<div id={`accordion-${index}`} key={`accordion-${index}`} className='mt-2'>
                    <div className='card'>
                        <div className='card-header collapsed' id={`heading-${index}`} data-toggle='collapse' data-target={`#collapseOne-${index}`} aria-expanded='true' aria-controls={`collapseOne-${index}`} style={{ cursor: 'pointer' }}>
                            <div>
                                <button className='btn btn-link'>
                                    <h4 className='mb-0'>{item.title}</h4>
                                </button>
                            </div>
                        </div>
                        <div id={`collapseOne-${index}`} className={'collapse ' + (index == 0 ? 'show' : '')} aria-labelledby={`heading-${index}`} data-parent={`#accordion-${index}`}>
                            <div className='card-body'>
                                {item.component}
                            </div>
                        </div>
                    </div>
                </div>)) : <b>Vui lòng chọn năm học, học kỳ điểm.</b>}
            </div>,
            backRoute: '/user/dao-tao/grade-manage',
            icon: 'fa fa-leanpub',
            header: data.length ? <FormSelect className='mb-0' style={{ width: '200px' }} ref={e => this.idSemester = e} placeholder='Năm học - học kỳ' data={data} minimumResultsForSearch={-1} onChange={
                ({ id, namHoc, hocKy }) =>
                    this.setState({ filter: { idSemester: id, namHoc, hocKy } },
                        () => this.folderScan.setData(this.state.filter))
            } /> : '',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDiem: state.daoTao.dtDiem });
const mapActionsToProps = { getAllDtDiemSemester, getDtDiemSemesterActive };
export default connect(mapStateToProps, mapActionsToProps)(DtDiemPage);