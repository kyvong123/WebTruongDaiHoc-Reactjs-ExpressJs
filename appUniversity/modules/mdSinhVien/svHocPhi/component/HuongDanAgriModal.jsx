import { Tooltip } from '@mui/material';
import React from 'react';
import { AdminModal } from 'view/component/AdminPage';

export class HuongDanAgriModal extends AdminModal {
    onShow = () => {
        this.setState({ agri: true });
    }

    render = () => {
        return this.renderModal({
            title: 'Hướng dẫn đóng học phí AGRIBANK',
            size: 'large',
            buttons: this.state.agri && <button type='btn' className='btn btn-warning' onClick={e => e.preventDefault() || this.setState({ agri: false }, () => {
                this.props.thanhToanModal();
            })}>
                <i className='fa fa-fw fa-lg fa-undo' />Quay lại
            </button>,
            body: <div className='row'>
                <div className='col-md-12 d-flex justify-content-center' style={{ marginBottom: '30px' }}>
                    <b>{'Vui lòng bấm vào nút "XEM HƯỚNG DẪN" để biết cách đóng tiền qua cổng thanh toán AGRIBANK'}</b>
                </div>
                <div className='col-md-12 d-flex justify-content-center'>
                    <Tooltip title='Tải xuống' arrow>
                        <a className='btn btn-success' target='_blank' rel='noopener noreferrer' href={T.url(`${T.cdnDomain}/sample/AGRI-2023.pdf`)}>
                            <i className='fa fa-fw fa-lg fa-download' />Xem hướng dẫn
                        </a>
                    </Tooltip>
                </div>
            </div>
        });
    }
}