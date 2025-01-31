import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTabs, FormSelect, FormEditor } from 'view/component/AdminPage';
import { initDataRedis, getDotActive, getDataRedis } from './redux';
import { SelectAdapter_DangKyHocPhanStudent } from 'modules/mdDaoTao/dtDangKyHocPhan/redux';
import { SelectAdapter_HocPhan } from 'modules/mdDaoTao/dtThoiKhoaBieu/redux';

class UserPage extends AdminPage {

    state = { dataDot: [], filter: { sort: 'maHocPhan_ASC' } }

    componentDidMount() {
        this.props.getDotActive(items => this.setState({ dataDot: items }));
    }

    mapperKey = [
        { id: 'CTDT', text: 'Chương trình đào tạo' }, // CTDT:${mssv}|${id}
        { id: 'settingTKB', text: 'Cấu hình TKB' },
        { id: 'settingDiem', text: 'Cấu hình điểm' },
        { id: 'semester', text: 'Cấu hình semester' },
        { id: 'listMonHoc', text: 'Danh sách môn học' },
        { id: 'listMonKhongPhi', text: 'Danh sách môn học không tính phí' },
        { id: 'DIEM', text: 'Điểm' }, // DIEM:${mssv}
        { id: 'NGOAI_NGU', text: 'Ngoại ngữ không chuyên' }, //NGOAI_NGU:${mssv}
        { id: 'SiSo', text: 'Sĩ số học phần' }, // SiSo:${maHocPhan}|${idDot}
        { id: 'SLDK', text: 'Số lượng dự kiến học phần' }, // SLDK:${maHocPhan}|${idDot}
        { id: 'infoHocPhan', text: 'Thông tin học phần' }, // infoHocPhan:${maHocPhan}|${idDot}
        { id: 'dataMaHocPhan', text: 'Danh sách mã học phần' }, // dataMaHocPhan|${idDot}
        { id: 'listDataTuanHoc', text: 'Danh sách tuần học' }, // listDataTuanHoc|${namHoc}|${hocKy}
    ]

    clickControl = (thaoTac, callFunc) => {
        T.confirm('Xác nhận thao tác', `Bạn có muốn thao tác ${thaoTac} không?`, 'warning', true, isConfirm => {
            if (isConfirm) {
                this.props.initDataRedis(callFunc);
            }
        });
    }

    handleSearch = () => {
        this.textbox.value('');
        if (!this.keyRedis.value()) {
            T.notify('Vui lòng chọn key redis!', 'danger');
            this.keyRedis.focus();
        } else if (!this.idDot.value()) {
            T.notify('Vui lòng chọn đợt đăng ký!', 'danger');
            this.idDot.focus();
        } else {
            const data = {
                keyRedis: this.keyRedis.value(),
                idDot: this.idDot.value(),
                mssv: this.mssv.value(),
                maHocPhan: this.maHocPhan.value(),
            };

            this.props.getDataRedis(data, item => this.textbox.value(item));
        }
    }

    componentControl = () => {
        return <div className='row'>
            <div className='col-md-12 mt-2'>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button style={{ height: 'fit-content' }} className='btn btn-info' type='button' onClick={() => this.clickControl('HOT INIT', 'hotInit')} >
                        HOT INIT
                    </button>
                    <button style={{ height: 'fit-content' }} className='btn btn-info' type='button' onClick={() => this.clickControl('DELETE KEY', 'deleteAllKey')}>
                        DELETE KEY
                    </button>
                    <button style={{ height: 'fit-content' }} className='btn btn-info' type='button' onClick={() => this.clickControl('INIT CONFIG', 'initConfig')}>
                        INIT CONFIG
                    </button>
                    <button style={{ height: 'fit-content' }} className='btn btn-info' type='button' onClick={() => this.clickControl('INIT INFO HOC PHAN', 'initInfoHocPhan')}>
                        INIT INFO HOC PHAN
                    </button>
                    <button style={{ height: 'fit-content' }} className='btn btn-info' type='button' onClick={() => this.clickControl('INIT SI SO HOC PHAN', 'initSiSoHocPhan')}>
                        INIT SI SO HOC PHAN
                    </button>
                    <button style={{ height: 'fit-content' }} className='btn btn-info' type='button' onClick={() => this.clickControl('INIT MON HOC', 'initMonHoc')}>
                        INIT MON HOC
                    </button>
                    <button style={{ height: 'fit-content' }} className='btn btn-info' type='button' onClick={() => this.clickControl('INIT MON HOC KHONG TINH PHI', 'initMonHocKhongTinhPhi')}>
                        INIT MON HOC KHONG TINH PHI
                    </button>
                    <button style={{ height: 'fit-content' }} className='btn btn-info' type='button' onClick={() => this.clickControl('INIT TUAN HOC', 'initDataTuanHoc')}>
                        INIT TUAN HOC
                    </button>
                    <button style={{ height: 'fit-content' }} className='btn btn-info' type='button' onClick={() => this.clickControl('INIT CTDT', 'initCtdtStudentAll')}>
                        INIT CTDT
                    </button>
                    <button style={{ height: 'fit-content' }} className='btn btn-info' type='button' onClick={() => this.clickControl('INIT DIEM', 'initDiemStudentAll')}>
                        INIT DIEM
                    </button>
                    <button style={{ height: 'fit-content' }} className='btn btn-info' type='button' onClick={() => this.clickControl('INIT NGOAI NGU KHONG CHUYEN', 'initNgoaiNguAll')}>
                        INIT NGOAI NGU KHONG CHUYEN
                    </button>
                </div>
            </div>
            <div className='col-md-12'>

            </div>
        </div>;
    }

    componentData = () => {
        return <div className='row'>
            <FormSelect ref={e => this.keyRedis = e} label='Key redis' className='col-md-3' data={this.mapperKey} />
            <FormSelect ref={e => this.idDot = e} label='Đợt đăng ký' className='col-md-3' data={this.state.dataDot} onChange={e => this.setState({ filter: { namFilter: e.namHoc, hocKyFilter: e.hocKy, sort: 'maHocPhan_ASC' } }, () => this.maHocPhan.value(''))} />
            <FormSelect ref={e => this.mssv = e} label='MSSV' className='col-md-3' data={SelectAdapter_DangKyHocPhanStudent} allowClear />
            <FormSelect ref={e => this.maHocPhan = e} label='Mã học phần' className='col-md-3' data={SelectAdapter_HocPhan(this.state.filter)} allowClear />
            <div className='col-md-12' style={{ textAlign: 'right' }}>
                <button className='btn btn-success' type='button' onClick={() => this.handleSearch()}>
                    <i className='fa fa-fw fa-lg fa-search' />Tìm kiếm
                </button>
            </div>
            <FormEditor ref={e => this.textbox = e} className='col-md-12 mt-4' />
        </div>;
    }

    render() {

        return this.renderPage({
            title: 'Redis Manage',
            icon: 'fa fa-database',
            content: <>
                <div className='tile'>
                    <FormTabs tabs={[
                        { title: 'Dữ liệu', component: this.componentData() },
                        { title: 'Thao tác', component: this.componentControl() }
                    ]} />
                </div>
            </>,
            backRoute: '/user/settings',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { initDataRedis, getDotActive, getDataRedis };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);
