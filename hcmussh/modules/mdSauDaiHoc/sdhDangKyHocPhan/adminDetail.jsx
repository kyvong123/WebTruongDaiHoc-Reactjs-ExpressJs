import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, FormTabs } from 'view/component/AdminPage';
import FormDangKyTrucTiepSdh from './formDangKyTrucTiep';
import FormDangKyHocVienSdh from './formDangKyHocVien';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DotDangKySdh } from 'modules/mdSauDaiHoc/sdhDotDangKy/redux';
import LichSuDKHPModal from './importDangKyTrucTiep';
import { SelectAdapter_SemesterData, getSdhSemester } from '../sdhSemester/redux';
class SdhDangKyHocPhanPage extends AdminPage {
    state = { isDone: false, isDoneHuy: false, current: 0, currentHuy: 0, currentSemester: {}, idDot: null, index: '0' }

    componentDidMount() {
        this.tab?.tabClick(null, 0);
        this.setState({ index: '1' });
    }


    onChangeSemester = (value) => {
        this.setState({ currentSemester: value });
        this.sinhVienSection.updateHocKy();

    }
    render() {
        let thaoTacTrang = [
            {
                id: 'ngang',
                text: 'Hiển thị theo chiều ngang'
            },
            {
                id: 'doc',
                text: 'Hiển thị theo chiều dọc'
            }
        ];
        return this.renderPage({
            icon: 'fa fa-handshake-o',
            title: 'Đăng ký học phần',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/dang-ky-hoc-phan'>Quản lý học phần</Link>,
                'Đăng kí học phần'
            ],
            header: <>

                <FormSelect ref={e => this.currentSemester = e} data={SelectAdapter_SemesterData}
                    onChange={value => this.onChangeSemester(value)} label='Năm học - học kỳ' className='col-md-4' />
                <FormSelect ref={e => this.listDotDangKy = e} data={SelectAdapter_DotDangKySdh}
                    onChange={value => this.setState({ idDot: value.id, tenDot: value.text })} label='Đợt đăng ký' className='col-md-4' />

                <FormSelect ref={(e) => (this.thaoTacTrang = e)} className={this.state.index == '0' ? 'col-md-4' : ''} label='Thao tác trang' data={thaoTacTrang}
                    onChange={(value) =>
                        this.setState({ thaoTacTrang: value.id })
                    } allowClear
                />
            </>,
            content: (
                <>
                    <div>
                        <FormTabs ref={e => this.tab = e} tabs={[
                            {
                                title: 'Đăng ký theo đợt',
                                component: <FormDangKyTrucTiepSdh ref={e => this.trucTiepSection = e} idDot={this.state.idDot} listDotDangKy={this.listDotDangKy} />
                            }
                            ,
                            {
                                title: 'Đăng ký theo sinh viên',
                                component: <FormDangKyHocVienSdh ref={e => this.sinhVienSection = e} currentSemester={this.state.currentSemester} listDotDangKy={this.listDotDangKy} idDot={this.state.idDot} history={this.props.history} />
                            },
                            {
                                title: `Import Excel ${(!this.state.isDone && this.state.current) ? `(Đang import hàng ${this.state.current})` : ''}`,
                                component: <LichSuDKHPModal ref={e => this.importSection = e} currentSemester={this.state.currentSemester} tenDot={this.state.tenDot} listDotDangKy={this.listDotDangKy} idDot={this.state.idDot} />
                            }

                        ]} />
                    </div>
                </>
            ),
            backRoute: '/user/sau-dai-hoc/dang-ky-hoc-phan',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhDangKyHocPhan: state.sdh.sdhDangKyHocPhan });
const mapActionsToProps = { getScheduleSettings, getSdhSemester };
export default connect(mapStateToProps, mapActionsToProps)(SdhDangKyHocPhanPage);