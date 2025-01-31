import React from 'react';
import { connect } from 'react-redux';
import { AdminPage } from 'view/component/AdminPage';
import './home.scss';
import { Link } from 'react-router-dom';
import { getSdhTsInfoPhanHeData } from 'modules/mdSauDaiHoc/sdhTsInfoPhanHe/redux';
import { getSdhTsInfoHinhThucData } from 'modules/mdSauDaiHoc/sdhTsInfoHinhThuc/redux';
import { getSdhTsThongTinBieuMau } from 'modules/mdSauDaiHoc/sdhTsThongTinBieuMau/redux';
import { getSdhKyThiTsAll, getSdhKyThiTsCurrent } from 'modules/mdSauDaiHoc/sdhTsInfo/redux';
import { getSdhTsInfoTimeData, getSdhTsDotCurrent } from 'modules/mdSauDaiHoc/sdhTsInfoTime/redux';
class DashboardIcon extends React.Component {
    render() {
        let isShow = true;
        if (this.props.isShowValue != undefined) {
            if (this.props.isShowValue == false) isShow = false;
        }
        const content = (
            <div className={'widget-small coloured-icon ' + this.props.type} onClick={this.props.onClick} style={{ cursor: 'pointer' }}>
                {this.props.icon == 'fa-check' ?
                    <i className={'icon fa fa-3x ' + this.props.icon} style={{ backgroundColor: 'red' }} /> :
                    <i className={'icon fa fa-3x ' + this.props.icon} />}
                <div className='info'>
                    <h4>
                        {this.props.title}
                    </h4>
                    {isShow && <h4 style={{ fontWeight: 'bold' }} ref={e => this.valueElement = e}>{this.props.value}</h4>}
                </div>
            </div>
        );
        return this.props.link ? <Link to={this.props.link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
    }
}
class SdhDangKyTuyenSinhPage extends AdminPage {
    state = { init: true, step: '1', lstDot: [], lstPhanHe: [], lstHinhThuc: [], idDot: '', tenDot: '', phanHe: {}, hinhThuc: {} };
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getSdhKyThiTsCurrent(item => {
                item && this.props.getSdhTsDotCurrent(item.ma, items => this.setState({ lstDot: items }));
            });
        });
    }
    validation = (selector) => {
        const rs = selector != null && typeof selector !== 'undefined' && selector != '' ? true : false;
        !rs && T.notify('Lỗi lấy dữ liệu!', 'danger');
        return rs;
    }
    getDataPhanHe = () => {
        this.props.getSdhTsInfoPhanHeData(this.state.idDot, (items) => {
            const filter = items.filter(item => item.id != null && item.isOpen == 1);
            const rs = filter.map(item => ({ id: item.id, maPhanHe: item.ma, tenPhanHe: item.ten }));
            this.setState({ lstPhanHe: rs });
        });
    }
    getDataHinhThuc = (maPhanHe) => {
        this.props.getSdhTsInfoHinhThucData(maPhanHe, items => {
            const filter = items.filter(item => item.id != null);
            const rs = filter.map(item => ({ maHinhThuc: item.ma, tenHinhThuc: item.ten }));
            this.setState({ lstHinhThuc: rs });
        });
    }
    handleNext = (e) => {
        e.preventDefault();
        const selectedData = this.validation(this.state.idDot) && this.validation(this.state.hinhThuc.maHinhThuc) && this.validation(this.state.phanHe.maPhanHe);
        if (selectedData) {
            T.confirm('Đăng ký tuyển sinh', `Bạn có muốn đăng ký tuyển sinh ${this.state.phanHe.tenPhanHe} theo hình thức ${this.state.hinhThuc.tenHinhThuc} của đợt tuyển sinh ${this.state.tenDot} ?`, true,
                isConfirm => isConfirm && this.props.getSdhTsThongTinBieuMau(this.state.phanHe.maPhanHe, data => {
                    if (!data) {
                        T.notify('Lấy thông tin biểu mẫu bị lỗi', 'danger');
                    } else {
                        this.props.history.push('/sdh/bieu-mau-dang-ky', { idDot: this.state.idDot, idPhanHe: this.state.phanHe.id, maPhanHe: this.state.phanHe.maPhanHe, maHinhThuc: this.state.hinhThuc.maHinhThuc });
                    }
                }));
        }
        else {
            T.notify('Lấy thông tin đăng ký bị lỗi!', 'danger');
        }
    }
    handleDashboard = (e, item, type) => {
        e.preventDefault();
        if (type == 'dotTs') {
            this.setState({ idDot: item.id, tenDot: item.ten, step: '2' }, () => {
                this.getDataPhanHe();
            });
        }
        if (type == 'phanHe') {
            this.setState({ phanHe: item, step: '3' }, () => {
                this.getDataHinhThuc(item.id);

            });
        }
        if (type == 'hinhThuc') {
            this.setState({ hinhThuc: item, step: '4' }, () => {
                this.handleNext(e);
            });
        }
    }
    render() {
        return (
            <div className='mt-5 sdh-bieu-mau'>
                <div className='pa'>
                    <h1 className='text-primary text-center pa'>Đăng ký tuyển sinh</h1>
                </div> <hr />
                <div className='tile'>
                    {['1', '2', '3', '4'].includes(this.state.step) ?
                        <>
                            <h4>Chọn đợt tuyển sinh</h4>
                            <div className='row'>
                                {this.state.lstDot && this.state.lstDot.length ? this.state.lstDot.map((item, index) =>
                                    <>
                                        <div className='col-md-6 col-lg-4'>
                                            <DashboardIcon key={'dotTs ' + index} type='primary' icon={item.id == this.state.idDot ? 'fa-check' : 'fa-pencil'} title='' value={item.ten} onClick={e => e.preventDefault() || this.handleDashboard(e, item, 'dotTs')} />
                                        </div>
                                    </>
                                ) : <p>Hiện tại không có thông tin. Truy cập trang tin tức để biết thêm thông tin</p>}
                                <hr />
                            </div>
                        </> : null}
                    {['2', '3', '4'].includes(this.state.step) ?
                        <>
                            <h4>Chọn phân hệ dự tuyển</h4><div className='row'>
                                {this.state.lstPhanHe && this.state.lstPhanHe.length ? this.state.lstPhanHe.map((item, index) =>
                                    <>
                                        <div className='col-md-6 col-lg-4'>
                                            <DashboardIcon key={'phanHe ' + index} type='primary' icon={item.maPhanHe == this.state.phanHe.maPhanHe && (this.state.step == '3' || this.state.step == '4') ? 'fa-check' : 'fa-pencil'} title='' value={item.tenPhanHe} onClick={e => e.preventDefault() || this.handleDashboard(e, item, 'phanHe')} />
                                        </div>
                                    </>
                                ) : <p>Hiện tại chưa cấu hình phân hệ dự tuyển cho đợt tuyển sinh. Truy cập trang tin tức để biết thêm thông tin</p>}
                                <hr />
                            </div>
                        </> : null}
                    {['3', '4'].includes(this.state.step) ?
                        <>
                            <h4>Chọn hình thức dự tuyển</h4>
                            <div className='row'>
                                {this.state.lstHinhThuc && this.state.lstHinhThuc.length ? this.state.lstHinhThuc.map((item, index) =>
                                    <>
                                        <div className='col-md-6 col-lg-4'>
                                            <DashboardIcon key={'hinhThuc ' + index} type='primary' icon={item.maHinhThuc == this.state.hinhThuc.maHinhThuc && this.state.step == '4' ? 'fa-check' : 'fa-pencil'} title='' value={item.tenHinhThuc} onClick={e => e.preventDefault() || this.handleDashboard(e, item, 'hinhThuc')} />
                                        </div>
                                    </>
                                ) : <p>Hiện tại chưa cấu hình hình thức dự tuyển cho đợt tuyển sinh. Truy cập trang tin tức để biết thêm thông tin</p>}
                            </div>
                        </> : null}
                </div>
            </div >
        );
    }
}

const mapStateToProps = state => ({ system: state.system, svTsSdh: state.sdh.svTsSdh });
const mapActionsToProps = {
    getSdhTsThongTinBieuMau, getSdhKyThiTsAll, getSdhKyThiTsCurrent, getSdhTsDotCurrent, getSdhTsInfoTimeData, getSdhTsInfoPhanHeData, getSdhTsInfoHinhThucData
};
export default connect(mapStateToProps, mapActionsToProps)(SdhDangKyTuyenSinhPage);
