import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, FormTabs } from 'view/component/AdminPage';
import { SelectAdapter_ThiSinh } from 'modules/mdSauDaiHoc/sdhTsKetQuaThi/redux';
import { Link } from 'react-router-dom';
import { getSdhTsProcessingDot } from 'modules/mdSauDaiHoc/sdhTsInfoTime/redux';
import ComponentLichThi from './component/ComponentLichThi';
import ComponentDiemThi from './component/ComponentDiemThi';
import ComponentTrungTuyen from './component/ComponentKetQuaTuyenSinh';
import ComponentPhucTra from './component/ComponentPhucTra';
import ComponentHoSo from './component/ComponentHoSo';
class MoPhongThiSinhPage extends AdminPage {
    defaultSortTerm = 'ten_ASC'
    state = { infoDot: {}, listDon: [], listMon: [] };
    componentDidMount() {
        this.props.getSdhTsProcessingDot(data => {
            console.log(data);
            if (data && data.id) {
                this.setState({ idDot: data.id, dot: data });
            }
        });
    }
    getData = () => {
    }

    render() {
        const dataThiSinh = this.state.dataThiSinh;
        const hoSo = {
            key: 'hoSo', title: 'Hồ sơ thí sinh', component: <ComponentHoSo dot={this.state.dot} user={dataThiSinh || {}} />
        }, lichThi = {
            key: 'lichThi', title: 'Lịch thi', component: <ComponentLichThi dot={this.state.dot} user={dataThiSinh || {}} />
        }, ketQuaThi = {
            key: 'diemThi', title: 'Kết quả thi', component: <ComponentDiemThi dot={this.state.dot} user={dataThiSinh || {}} />
        }, ketQuaTuyenSinh = {
            key: 'ketQuaTuyenSinh', title: 'Kết quả tuyển sinh', component: <ComponentTrungTuyen dot={this.state.dot} user={dataThiSinh || {}} />
        }, phucTra = {
            key: 'phucTra', title: 'Đăng ký phúc tra', component: <ComponentPhucTra dot={this.state.dot} user={dataThiSinh || {}} />
        };
        const tabs = [hoSo, lichThi, ketQuaThi, ketQuaTuyenSinh, phucTra];
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Mô phỏng thí sinh',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                'Mô phỏng thí sinh'
            ],
            content: <>
                <div className='tile'>
                    <div className='col-md-6 m-0 p-0'>
                        <FormSelect ref={e => this.mssv = e} label='Mã số thí sinh' data={SelectAdapter_ThiSinh(this.state.idDot)} onChange={(value) => this.setState({ dataThiSinh: value })} />
                    </div>
                    {/* {table} */}
                    {dataThiSinh ? <FormTabs key={dataThiSinh.id} tabs={tabs} /> : ''}
                </div>
            </>,
            backRoute: '/user',
        });

    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getSdhTsProcessingDot
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(MoPhongThiSinhPage);
