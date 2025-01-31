
import React from 'react';
import { AdminModal } from 'view/component/AdminPage';
import T from 'view/js/common';
import { ButtonBank } from './ButtonBank';
import { getAllBank } from 'modules/mdDanhMuc/dmBank/redux';

export class ThanhToanModal extends AdminModal {
    onShow = () => {
        getAllBank((items) => this.setState({ banks: items.reduce((total, current) => ({ ...total, [current.ma]: current }), {}) }))();
    }
    render = () => {
        return this.renderModal({
            title: 'Phương thức thanh toán',
            size: 'large',
            buttons: (this.state.vcb || this.state.agri) && <button type='btn' className='btn btn-warning' onClick={e => e.preventDefault() || this.setState({ vcb: false, agri: false })}>
                <i className='fa fa-fw fa-lg fa-undo' />Quay lại
            </button>,
            body: <div>
                {!!this.state.banks && <section className='row justify-content-center' style={{ display: this.state.vcb || this.state.agri ? 'none' : '' }}>
                    {/* {parseInt(this.props.namTuyenSinh) != 2023 && <ButtonBank title='AGRIBANK' imgSrc='/img/logo/agribank.png' onClick={() => {
                        this.props.huongDanAgri();
                    }} />} */}
                    {/* {!!this.state.banks?.BIDV?.kichHoat && <ButtonBank title='BIDV' imgSrc='/img/logo/logo_bidv.png' onClick={() => {
                        T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                        T.post('/api/sv/hoc-phi/qr-bidv', result => {
                            if (result.error) {
                                T.alert(`${result.error.message} Vui lòng liên hệ Phòng Kế hoạch - Tài chính`, 'error', false, 5000);
                            } else {
                                T.alert('Kết nối thành công! Vui lòng quét mã QR để thanh toán.', 'success', false, 2000, true);
                                this.props.openQrModal(result.base64);
                                // window.open(result.path, '_blank');
                            }
                        });
                    }} />} */}
                    {!!this.state.banks?.VIETCOMBANK?.kichHoat && <ButtonBank title='VCB' imgSrc='/img/logo/vcb.png' onClick={() => {
                        T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                        T.post('/api/sv/hoc-phi/qr-vcb', result => {
                            if (result.error) {
                                T.alert(`${result.error.message} Vui lòng liên hệ Phòng Kế hoạch - Tài chính`, 'error', false, 5000);
                            } else {
                                T.alert('Kết nối thành công! Vui lòng quét mã QR để thanh toán.', 'success', false, 2000, true);
                                this.props.openQrModal(result.base64);
                                // window.open(result.path, '_blank');
                            }
                        });
                    }} />}
                </section>}
                {/* <section className='row' style={{ display: this.state.vcb ? '' : 'none', justifyContent: 'center' }}>
                    <ButtonBank title='Bằng tài khoản VCB' imgSrc='/img/logo/vcb.png' onClick={() => this.props.vnPayGoToTransaction('vnpay-vcb', link => {
                        window.location.href = link;
                    })} />
                    <ButtonBank title='Tài khoản khác VCB' imgSrc='/img/logo/vnpay.png' onClick={() => this.props.vnPayGoToTransaction('vcb', link => {
                        window.location.href = link;
                    })} />
                </section>

                <section className='row' style={{ display: this.state.agri ? '' : 'none', justifyContent: 'center' }}>
                    <ButtonBank title='Bằng tài khoản Agribank' imgSrc='/img/logo/agribank.png' onClick={() => this.props.vnPayGoToTransaction('vnpay-agri', link => {
                        window.location.href = link;
                    })} />
                    <ButtonBank title='Tài khoản khác Agribank' imgSrc='/img/logo/vnpay.png' onClick={() => this.props.vnPayGoToTransaction('agri', link => {
                        window.location.href = link;
                    })} />
                </section> */}
            </div>
        });
    }
}