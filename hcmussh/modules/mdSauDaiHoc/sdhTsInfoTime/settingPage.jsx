import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, loadSpinner, FormCheckbox } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import SdhPhanHeConfig from './section/phanHeConfig';
import SdhToHopConfig from './section/toHopConfig';
import SdhNganhConfig from './section/nganhConfig';
import { getSdhTsProcessingDot } from './redux';
import { getSdhChktts } from 'modules/mdSauDaiHoc/sdhTsInfo/redux';

class SdhSettingConfig extends AdminPage {
    state = { maInfoTs: '', setUp: true, lock: true, isProcessing: false };
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            const route = T.routeMatcher('/user/sau-dai-hoc/tuyen-sinh/dot-tuyen-sinh/setting/:maKyThi/:maDotTs'),
                maInfoTs = route.parse(window.location.pathname).maKyThi,
                maDotTs = route.parse(window.location.pathname).maDotTs;
            this.setState({ maInfoTs, maDotTs });
            this.props.getSdhChktts({ maDotTs, maInfoTs }, data => {
                if (data) this.setState({ data }, () => this.setUp());
                else this.props.history.push('/user/sau-dai-hoc/tuyen-sinh');
            });
            this.props.getSdhTsProcessingDot(data => {
                if (data && data.id) {
                    this.setState({ isProcessing: data.id == maDotTs, lock: data.id == maDotTs }); //TODO:lock:check time
                }
            });
        });
    }
    setUp = () => {
        const { dmPhanHe = [], dmHinhThuc = [], dmToHopThi = [], dmNganh = [], tsPhanHe = [], tsHinhThuc = [], tsToHopThi = [], tsNganh = [], tsMonThi = [] } = this.state.data;
        let phByDot = tsPhanHe.length && tsPhanHe.groupBy('ID_DOT'),
            htByDot = tsHinhThuc.length && tsHinhThuc.groupBy('ID_DOT'),
            toHopByDot = tsToHopThi.length && tsToHopThi.groupBy('ID_DOT'),
            nganhByDot = tsNganh.length && tsNganh.groupBy('ID_DOT'),
            monByDot = tsMonThi.length && tsMonThi.groupBy('ID_DOT');
        this.setState({ phanHe: { dmPhanHe, phByDot }, hinhThuc: { dmHinhThuc, htByDot }, toHopThi: { dmToHopThi, toHopByDot }, nganh: { dmNganh, nganhByDot }, monThi: { monByDot } }, () => this.setState({ setUp: false }, () => this.nganhConfig && this.nganhConfig.initData()));
    }
    onChange = () => {
        const { maInfoTs, maDotTs } = this.state;
        this.props.getSdhChktts({ maInfoTs, maDotTs }, data => {
            this.setState({ data }, () => this.setUp());
        });
    }
    render() {
        const { maDotTs, maInfoTs, phanHe, hinhThuc, nganh, toHopThi, monThi, lock, isProcessing } = this.state;
        const permission = this.getUserPermission('sdhTsInfoTime', ['manage', 'read', 'write', 'delete']);

        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Cấu hình chi tiết đợt tuyển sinh',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                <Link key={2} to='/user/sau-dai-hoc/tuyen-sinh/dot-tuyen-sinh'>Đợt tuyển sinh</Link>,
                'Cấu hình'
            ],
            content: this.state.setUp ? loadSpinner() : <>
                {isProcessing ? <div className='tile'>
                    <strong className='text-danger'>Lưu ý*: Đợt đang thao tác là đợt đang kích hoạt xử lý dữ liệu, các thao tác thay đổi có thể ảnh hưởng đến dữ liệu đợt đang xử lý như thông tin đăng ký, lịch thi,...  </strong>
                    <FormCheckbox className='col-md-3' key='lock' isSwitch ref={e => this.lock = e} label={'Khoá chỉnh sửa'} value={this.state.lock} onChange={value => this.setState({ lock: value })} readOnly={!permission} />
                </div> : null}
                <div className='tile'>
                    <h4> 1. Phân hệ và hình thức tuyển sinh </h4>
                    <div className='tile-body'>
                        {maDotTs ? <SdhPhanHeConfig lock={lock} maDotTs={maDotTs} maInfoTs={maInfoTs} phanHe={phanHe} hinhThuc={hinhThuc} onChange={this.onChange} permission={permission} /> : null}
                    </div>
                </div>
                <div className='tile'>
                    <h4> 2. Tổ hợp thi theo hình thức</h4>
                    <div className='tile-body'>
                        {maDotTs ? <SdhToHopConfig lock={lock} maDotTs={maDotTs} maInfoTs={maInfoTs} phanHe={phanHe} hinhThuc={hinhThuc} toHopThi={toHopThi} onChange={this.onChange} permission={permission} /> : null}
                    </div>
                </div>
                <div className='tile'>
                    <h4> 3. Ngành tuyển sinh</h4>
                    <div className='tile-body'>
                        {maDotTs ? <SdhNganhConfig lock={lock} ref={e => this.nganhConfig = e} maDotTs={maDotTs} maInfoTs={maInfoTs} phanHe={phanHe} hinhThuc={hinhThuc} nganh={nganh} onChange={this.onChange} toHopThi={toHopThi} monThi={monThi} permission={permission} /> : null}
                    </div>
                </div>
            </>,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh/dot-tuyen-sinh',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getSdhChktts, getSdhTsProcessingDot };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SdhSettingConfig);
