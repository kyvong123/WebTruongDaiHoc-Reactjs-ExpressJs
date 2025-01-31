import React from 'react';
import { AdminPage, loadSpinner, AdminModal } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { RowThueNam } from './components/RowThue';
import { DetailDongThue } from './components/DetailDongThue';
import { getDetailQuyetToan, getAllQuyetToanThue, genQR } from './redux';
class ModalQR extends AdminModal {
    componentDidMount() {
        this.disabledClickOutside();
    }
    onShow = ({ base64 }) => {
        this.setState({ base64 });
    }
    render = () => {
        return this.renderModal({
            title: 'QR Quyết toán thuế',
            size: 'large',
            submitText: 'Tải lên',
            body: <div className='row justify-content-center'>
                {this.state?.base64 && <img style={{ width: '400px', height: 'auto', maxWidth: '90vw' }} src={`data:image/png;base64,${this.state.base64}`} />}
            </div>
        });
    }
}
export class TcQuyetToanThue extends AdminPage {
    state = { indexShow: 0, namShow: (new Date()).getFullYear() - 1 }
    componentDidMount() {
        this.getPage();
        T.socket.on('updateQuyetToan', () => {
            this.getPage(() => {
                this?.modalQr?.hide();
            });
        });
    }
    getPage(done) {
        this.props.getAllQuyetToanThue(res => {
            this.setState({ data: res });
            done && done();
        });
    }
    openQr = ({ nam, soTien, isCustom }) => {
        this.props.genQR(nam, soTien, isCustom, res => {
            this.modalQr.show(res);
            console.log(res);
        });
    }
    render() {
        return this.renderPage({
            title: 'Nộp thuế TNCN',
            icon: 'fa fa-id-card-o',

            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                <Link key={1} to='/user/tncn'>Thu nhập cá nhân</Link>,
                'Nộp thuế TNCN'],
            content: <>
                {this.state.data ? <div className='row gap-2'>
                    <div className='col-12 col-md-4 ' >
                        <div>
                            {this.state.data.length ? this.state?.data.map((item, index) => {
                                return <div key={index} onClick={(e) => {
                                    e.preventDefault();
                                    if (this.state.indexShow != index) {
                                        this.setState({ indexShow: index, namShow: item.nam });
                                    }
                                }}>
                                    <RowThueNam data={item} show={this.state.indexShow == index}></RowThueNam>
                                </div>;
                            }) :
                                <div className='tile'>
                                    <h5>Chưa có thông tin quyết toán thuế</h5>
                                </div>}
                        </div>

                    </div>
                    <div className='col-12 col-md-8'>
                        {this.state.data.length ?
                            <DetailDongThue
                                nam={this.state.namShow}
                                getDetailQuyetToan={this.props.getDetailQuyetToan}
                                data={this.state?.data.find(item => item.nam == this.state.namShow)}
                                onCreateDongThue={({ soTien, nam, isCustom }) => this.openQr({ soTien, nam, isCustom })}
                            ></DetailDongThue> : null}
                    </div>
                </div> : loadSpinner()}
                <ModalQR ref={e => this.modalQr = e}></ModalQR>
            </>,
        });
    }
}




const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDetailQuyetToan, getAllQuyetToanThue, genQR };
export default connect(mapStateToProps, mapActionsToProps)(TcQuyetToanThue);
