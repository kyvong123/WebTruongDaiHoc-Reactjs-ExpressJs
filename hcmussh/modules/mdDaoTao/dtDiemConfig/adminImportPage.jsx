import { AdminPage, FormSelect, getValue } from 'view/component/AdminPage';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { SelectAdapter_SchoolYear } from '../dtSemester/redux';
import { SelectAdapter_DtDmHocKy } from '../dtDmHocKy/redux';
import { FolderSection } from '../dtDiem/adminPage';
import { getDtDiemManageImport } from '../dtDiem/redux';


class AdminImportPage extends AdminPage {

    state = { data: [], isSearch: false }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.showAdvanceSearch();
            T.showSearchBox(() => {
                this.showAdvanceSearch();
            });
        });
    }

    render() {
        let { data, isSearch, namHoc, hocKy } = this.state;
        console.log(data);
        return this.renderPage({
            title: 'Quản lý nhập điểm',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/grade-manage'>Điểm</Link>,
                'Quản lý nhập điểm'
            ],
            content: <div style={{ display: isSearch ? '' : 'none' }} className='tile row mr-0 ml-0' >
                {(data && data.length) ? data.map((item, index) => {
                    return <React.Fragment key={index}>
                        <FolderSection title={item.folderName} type='info' onClick={() => this.props.history.push({ pathname: '/user/dao-tao/diem/scan', state: { idSemester: item.idSemester, idFolder: item.id, namHoc, hocKy } })} />
                    </React.Fragment>;
                }) : <>Chưa có gói scan nào</>}
            </div>,
            advanceSearchTitle: '',
            advanceSearch: <div className='row' style={{ paddingBottom: '10px' }}>
                <FormSelect ref={e => this.namHocFilter = e} data={SelectAdapter_SchoolYear} className='col-md-6' label='Năm học' required />
                <FormSelect ref={e => this.hocKyFilter = e} data={SelectAdapter_DtDmHocKy} className='col-md-6' label='Học kỳ' required />
                <div className='col-md-12' style={{ textAlign: 'right' }}>
                    <button className='btn btn-success' type='button' onClick={(e) => {
                        e && e.preventDefault();

                        try {
                            let namHoc = getValue(this.namHocFilter),
                                hocKy = getValue(this.hocKyFilter);

                            let filter = {
                                namHoc, hocKy,
                            };

                            this.props.getDtDiemManageImport(filter, items => this.setState({ data: items, namHoc, hocKy, isSearch: true }));
                        } catch (input) {
                            if (input) {
                                T.notify(`${input.props?.label || input.props?.placeholder} bị trống`, 'danger');
                                input.focus();
                            }
                        }

                    }}>
                        <i className='fa fa-fw fa-lg fa-search' />Tìm kiếm
                    </button>
                </div>
            </div>,
            backRoute: '/user/dao-tao/grade-manage',
            icon: 'fa fa-leaf',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDtDiemManageImport };
export default connect(mapStateToProps, mapActionsToProps)(AdminImportPage);