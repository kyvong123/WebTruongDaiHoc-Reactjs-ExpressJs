import { Tooltip } from '@mui/material';
import React from 'react';
import { AdminModal } from 'view/component/AdminPage';

export class HuongDanVcbModal extends AdminModal {
    onShow = () => {
        this.setState({ vcb: true });
    }

    render = () => {
        return this.renderModal({
            title: 'Hướng dẫn đóng học phí VIETCOMBANK',
            size: 'large',
            buttons: this.state.vcb && <button type='btn' className='btn btn-warning' onClick={e => e.preventDefault() || this.setState({ vcb: false }, () => {
                this.props.thanhToanModal();
            })}>
                <i className='fa fa-fw fa-lg fa-undo' />Quay lại
            </button>,
            body: <div className='row'>
                <div className='col-md-12 d-flex justify-content-center' style={{ marginBottom: '30px' }}>
                    <b>{'Vui lòng bấm vào nút "XEM HƯỚNG DẪN" để biết cách đóng tiền qua cổng thanh toán VIETCOMBANK'}</b>
                </div>
                <div className='col-md-12 d-flex justify-content-center'>
                    <Tooltip title='Tải xuống' arrow>
                        <a className='btn btn-success' target='_blank' rel='noopener noreferrer' href={T.url(`${T.cdnDomain}/sample/VCB-2023.pdf`)}>
                            <i className='fa fa-fw fa-lg fa-download' />Xem hướng dẫn
                        </a>
                    </Tooltip>
                </div>
            </div>
        });
    }
}