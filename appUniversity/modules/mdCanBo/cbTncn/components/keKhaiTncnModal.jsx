import React from 'react';
import { AdminModal, FormTextBox, getValue } from 'view/component/AdminPage';
import FileBoxHidden from './FileBoxHidden';

export default class KeKhaiModal extends AdminModal {
    onShow = (data) => {
        this.setState(this.props.thongTinCanBo, () => {
            this.hoVaTen && this.hoVaTen.value(`${(this.state.ho || '').trim()} ${(this.state.ten || '').trim()}`.toUpperCase());
            this.cmnd && this.cmnd.value(this.state.cmnd || '');
        });
        this.setState(data);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const data = {
            typeKeKhai: this.state.typeKeKhai,
            hoVaTen: this.hoVaTen ? getValue(this.hoVaTen) : null,
            cmnd: this.cmnd ? getValue(this.cmnd) : null,
            maSoThue: this.maSoThue ? getValue(this.maSoThue) : null,
            checkFile: (this.cmndMatTruoc || this.cmndMatSau || this.phieuDangKy) ? 1 : null
        };

        if (this.cmndMatTruoc && !this.cmndMatTruoc.isValid()) {
            T.notify('Vui lòng tải lên cccd/cmnd mặt trước!', 'danger');
            return;
        }
        if (this.cmndMatSau && !this.cmndMatSau.isValid()) {
            T.notify('Vui lòng tải lên cccd/cmnd mặt sau!', 'danger');
            return;
        }
        if (this.phieuDangKy && !this.phieuDangKy.isValid()) {
            T.notify('Vui lòng tải lên phiếu đăng ký!', 'danger');
            return;
        }
        if (!data.typeKeKhai) {
            T.notify('Dữ liệu không hợp lệ!', 'danger');
            return;
        }
        T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);

        this.props.create(data, res => {
            this.cmndMatTruoc && this.cmndMatTruoc.onUploadFile(res);
            this.cmndMatSau && this.cmndMatSau.onUploadFile(res);
            this.phieuDangKy && this.phieuDangKy.onUploadFile(res);
            T.alert('Gửi phiếu đăng ký thành công!', 'success', false, 800);
            this.props.refresh(() => this.hide());
        });
    }

    renderData = () => {
        if (this.state.typeKeKhai == 1) { // Đăng ký
            return <>
                <div className='row'>
                    <FormTextBox ref={e => this.hoVaTen = e} className='col-md-12 col-lg-8' label='Họ và tên' placeholder='Họ và tên' disabled></FormTextBox>
                    <FormTextBox ref={e => this.cmnd = e} className='col-md-12 col-lg-4' label='CMND/CCCD' placeholder='CMND/CCCD' disabled></FormTextBox>
                    <div className='col-md-12 col-lg-12 mt-3'>
                        <div className='row' style={{ alignItems: 'center' }}>
                            <b className='col-md-4'>Phiếu đăng ký <a href='/api/cb/tncn/tai-bieu-mau/dangKy'>(Tải mẫu)</a></b>
                            <FileBoxHidden uploadType='TcDangKyThue' userData='TcThueDangKyToKhai' className='col-md-4' ref={e => this.phieuDangKy = e} label='Tải lên'></FileBoxHidden>
                        </div>
                    </div>
                    <div className='col-md-12 col-lg-12 mt-3'>
                        <div className='row' style={{ alignItems: 'center' }}>
                            <b className='col-md-4'>CCCD/CMND mặt trước</b>
                            <FileBoxHidden uploadType='TcDangKyThue' userData='TcThueDangKyCmndMatTruoc' className='col-md-4' ref={e => this.cmndMatTruoc = e} label='Tải lên'></FileBoxHidden>
                        </div>
                    </div>
                    <div className='col-md-12 col-lg-12 mt-3'>
                        <div className='row' style={{ alignItems: 'center' }}>
                            <b className='col-md-4'>CCCD/CMND mặt sau</b>
                            <FileBoxHidden uploadType='TcDangKyThue' userData='TcThueDangKyCmndMatSau' className='col-md-4' ref={e => this.cmndMatSau = e} label='Tải lên'></FileBoxHidden>
                        </div>
                    </div>
                </div>
            </>;
        }
        else if (this.state.typeKeKhai == 2) { // Chỉnh sửa
            return <>
                <div className='row'>
                    <FormTextBox ref={e => this.hoVaTen = e} className='col-md-12 col-lg-8' label='Họ và tên' placeholder='Họ và tên' disabled></FormTextBox>
                    <FormTextBox ref={e => this.cmnd = e} className='col-md-12 col-lg-4' label='CMND/CCCD' placeholder='CMND/CCCD' disabled></FormTextBox>
                    <div className='col-md-12 col-lg-12 mt-3'>
                        <div className='row' style={{ alignItems: 'center' }}>
                            <b className='col-md-4'>Phiếu đăng ký <a href='/api/cb/tncn/tai-bieu-mau/capNhat'>(Tải mẫu)</a></b>
                            <FileBoxHidden uploadType='TcDangKyThue' userData='TcThueDangKyToKhai' className='col-md-4' ref={e => this.phieuDangKy = e} label='Tải lên'></FileBoxHidden>
                        </div>
                    </div>
                    <div className='col-md-12 col-lg-12 mt-3'>
                        <div className='row' style={{ alignItems: 'center' }}>
                            <b className='col-md-4'>CCCD/CMND mặt trước</b>
                            <FileBoxHidden uploadType='TcDangKyThue' userData='TcThueDangKyCmndMatTruoc' className='col-md-4' ref={e => this.cmndMatTruoc = e} label='Tải lên'></FileBoxHidden>
                        </div>
                    </div>
                    <div className='col-md-12 col-lg-12 mt-3'>
                        <div className='row' style={{ alignItems: 'center' }}>
                            <b className='col-md-4'>CCCD/CMND mặt sau</b>
                            <FileBoxHidden uploadType='TcDangKyThue' userData='TcThueDangKyCmndMatSau' className='col-md-4' ref={e => this.cmndMatSau = e} label='Tải lên'></FileBoxHidden>
                        </div>
                    </div>
                </div>
            </>;
        }
        else if (this.state.typeKeKhai == 3) { // Kê khai
            return <>
                <div className='row'>
                    <FormTextBox ref={e => this.hoVaTen = e} className='col-md-12 col-lg-8' label='Họ và tên' placeholder='Họ và tên' disabled></FormTextBox>
                    <FormTextBox ref={e => this.cmnd = e} className='col-md-12 col-lg-4' label='CMND/CCCD' placeholder='CMND/CCCD' disabled></FormTextBox>
                    <FormTextBox ref={e => this.maSoThue = e} className='col-md-12' label='Mã số thuế' placeholder='Mã số thuế' required></FormTextBox>
                </div>
            </>;
        }
    }

    render = () => {
        return this.renderModal({
            title: this.state.title || '',
            size: 'large',
            body: <>
                {this.renderData()}
            </>
        });
    }
}