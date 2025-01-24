import React from 'react';
import { AdminPage } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { getLastStepInfo } from '../redux';
import { getAllCtsvQuanHeNhapHocByKhoaHe } from 'modules/mdCongTacSinhVien/ctsvQuanHeHoSoNhapHoc/redux';
import '../style.scss';
class ComponentNhapHoc extends AdminPage {
    state = {
        timeLine: []
    };

    HE_CO_BHYT = ['CQ', 'CLC'];

    statusMapper = {
        1: <span className='badge-pill badge-success'><b className='d-inline-block'>Hoàn thành</b></span>,
        0: <span className='badge-pill badge-secondary'><b className='d-inline-block'>Chưa hoàn thành</b></span>
    };

    coSoMapper = {
        'CLC': 'Cơ sở 1: 10-12 Đinh Tiên Hoàng, Phường Bến Nghé, Quận 1, TP.HCM',
        'CQ': 'Cơ sở 2: Khu phố 6, Phường Linh Trung, Thành phố Thủ Đức, TP.HCM'
    };

    phongMapper = {
        'CLC': 'D303, D304, D305, D306',
        'CQ': 'C2-11, C2-13, C2-14, C2-15'
    }

    thoiGianMapper = {
        'CLC': '25/8/2023',
        'CQ': 'Từ ngày 28 đến ngày 30/8/2023'
    }

    componentDidMount() {
        const { khoaSV, loaiHinhDaoTao } = this.props.system?.user.data ?? {};

        this.props.getAllCtsvQuanHeNhapHocByKhoaHe(loaiHinhDaoTao, khoaSV);

        this.props.getLastStepInfo(({ phongThuTuc, thoiGian, coSoNhapHoc }) => {
            this.setState({ phongThuTuc, thoiGian, coSoNhapHoc });
        });
        this.setState({
            timeLine: this.props.getTimeline()
        });

    }

    componentDidUpdate(prevProps) {
        if (T.stringify(prevProps?.getTimeline() || '') != T.stringify(this.props.getTimeline())) {
            this.setState({
                timeLine: this.props.getTimeline()
            });
        }
    }

    render() {
        const { timeLine, phongThuTuc, thoiGian, coSoNhapHoc } = this.state;
        const heDaoTao = this.props.system?.user.data?.loaiHinhDaoTao;
        const quanHeNhapHoc = this.props.quanHeNhapHoc?.items ?? [];
        return <div className='row'>
            <div className='col-md-6'>
                <b className='tile-title text-primary font-weight-bold'>
                    Thời gian, địa điểm
                </b>
                <ul className='ml-0 list-ho-so'>
                    <li>Cơ sở: <b>{this.coSoMapper[heDaoTao] ?? coSoNhapHoc}</b></li>
                    <li>Phòng: <b>{this.phongMapper[heDaoTao] ?? phongThuTuc}</b></li>
                    <li>Thời gian: <b>{this.thoiGianMapper[heDaoTao] ?? thoiGian}</b></li>
                </ul>
            </div>
            <div className='col-md-6'>

                <b className='tile-title text-primary font-weight-bold'>
                    Quy trình nhập học
                </b>
                <ul className='ml-0 list-ho-so'>
                    <li>Kê khai lý lịch cá nhân: {this.statusMapper[timeLine[0]?.done]}</li>
                    {this.HE_CO_BHYT.includes(heDaoTao) ?
                        <>
                            <li>Đăng ký bảo hiểm y tế: {this.statusMapper[timeLine[1]?.done]}</li>
                            <li>Kê khai thông tin bảo hiểm y tế: {this.statusMapper[timeLine[1]?.doneInfo]}</li>
                            <li>Thanh toán học phí nhập học: {this.statusMapper[timeLine[2]?.done]}</li>
                        </> : <>
                            <li>Thanh toán học phí nhập học: {this.statusMapper[timeLine[1]?.done]}</li>
                        </>}
                </ul>
            </div>
            <hr className='col-12' />
            <div className='col-md-12'>
                <b className='tile-title text-primary font-weight-bold'>
                    Hồ sơ nhập học
                </b>
                {timeLine[0]?.done ? <span style={{ cursor: 'pointer' }} className='ml-2 badge-pill badge-warning'
                    onClick={e => e.preventDefault() || T.handleDownload('/api/sv/student-enroll/download-syll')}><b className='d-inline-block'><i className='fa fa-download fa-lg' /> Tải lý lịch</b></span> : null}
                <ol className='ml-0 list-ho-so'>
                    {quanHeNhapHoc.map(hoSo => <li key={hoSo.id}>{hoSo.ten}</li>)}
                    {/* <li>Giấy báo trúng tuyển và gọi nhập học (bản chính)</li>
                    <li>Lý lịch sinh viên</li>
                    <li>Giấy chứng nhận tốt nghiệp tạm thời (bản chính) / Bản sao Bằng tốt nghiệp</li>
                    <li>Giấy khai sinh (bản sao)</li>
                    <li>Thẻ căn cước công dân/ Giấy Chứng minh nhân dân (bản sao)</li>
                    <li>Học bạ Trung học phổ thông (bản sao)</li>
                    <li>2 ảnh thẻ 3x4</li> */}
                </ol>
            </div>

        </div>;
    }


}


const mapStateToProps = state => ({ system: state.system, dataSinhVien: state.student.dataSinhVien, quanHeNhapHoc: state.ctsv.quanHeNhapHoc });
const mapActionsToProps = { getLastStepInfo, getAllCtsvQuanHeNhapHocByKhoaHe };
export default connect(mapStateToProps, mapActionsToProps)(ComponentNhapHoc);