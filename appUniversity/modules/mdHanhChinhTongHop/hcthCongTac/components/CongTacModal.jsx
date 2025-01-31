import { SelectAdapter_FwCanBoWithDonVi } from 'modules/mdTccb/tccbCanBo/redux';
import React from 'react';
import { connect } from 'react-redux';
import { FormCheckbox, FormRichTextBox, FormSelect, FormTextBox } from 'view/component/AdminPage';
import { create, update } from '../redux/congTac';
import { SelectAdapter_DmPhongHop } from '../redux/phongHop';
import { BaseCongTacModal } from './BaseCongTac';
import { EaseDateRangePicker } from './EaseDatePicker';

class HcthCongTacModal extends BaseCongTacModal {

    onSubmit = () => {
        const data = {};
        ['ten', 'noiDung', 'chuTri', 'isOnline', 'duongDan', 'phongHop', 'diaDiem', 'dangKyPhongHop'].forEach(key => {
            const target = this[key];
            if (!target) throw new Error('Invalid keyword');
            // if (target.props.disabled) return;
            else {
                data[key] = target.value();
                if (data[key] === '') {
                    if (target.props.required && !(['duongDan', 'diaDiem'].includes(key))) {
                        throw target;
                    }
                }
                if (['batDau', 'ketThuc'].includes(key)) {
                    data[key] = data[key].getTime();
                }
                if (['isOnline', 'dangKyPhongHop'].includes(key)) {
                    data[key] = Number(data[key]);
                }
                if (data[key] && target.props.validator) {
                    if (!target.props.validator(data[key])) {
                        T.notify(target.props.label + ' không hơp lệ!', 'danger');
                        throw 'validator error';
                    }
                }
            }
        });
        if (this.state.item) {
            const banTheHienThanhPhan = this.banTheHienThanhPhan.value();
            if (banTheHienThanhPhan != this.getThanhPhanSummary(this.getItem()?.thanhPhan)) {
                data.banTheHienThanhPhan = banTheHienThanhPhan;
            } else if (this.state.item.banTheHienThanhPhan) {
                data.banTheHienThanhPhan = null;
            }
        }
        [data.batDau, data.ketThuc] = this.dateRange.value();
        data.batDau = data.batDau?.getTime();
        data.ketThuc = data.ketThuc?.getTime();
        if (data.batDau > data.ketThuc) {
            return T.notify('Thời gian bắt đầu sau thời gian kết thúc', 'danger');
        } else if (!data.isOnline && data.dangKyPhongHop && !data.phongHop) {
            return T.notify('Phòng họp trống', 'danger');
        } else if (!data.isOnline && !data.dangKyPhongHop && !data.diaDiem) {
            return T.notify('Địa điểm trống', 'danger');
        } else if (!data.batDau) {
            return T.notify('Thời gian sự kiện trống', 'danger');
        }
        if (!this.state.item) {
            data.thanhPhan = this.canBoThamGia.value();
            data.dangKyPhongHop = data.isOnline ? 0 : data.dangKyPhongHop;
            const guiPhieu = Number(!this.state.isOnline && this.dangKyPhongHop?.value() && this.guiPhieu?.value());
            const postData = { ...data, congTacTicketId: this.props.congTacTicketId, lichId: this.props.lichId, guiPhieu };
            const create = () => this.props.create(postData, (item) => {
                window.open(`/user/vpdt/cong-tac/${item.id}?backRoute=${this.props.backRoute || window.location.pathname}`, '_blank');
                window.location.reload();
                this.hide();
            });
            if (guiPhieu) {
                T.confirm('Cảnh báo', 'Bạn đã chọn gửi phiếu đăng ký khi tạo phiếu. Hệ thống sẽ gửi phiếu đăng ký phòng họp ngay sau khi tạo thành công', true, isConfirm => isConfirm && create());
            } else {
                create();
            }
        }
        else {
            const update = () => this.props.update(this.state.item.id, data, () => this.props.onSuccess ? this.props.onSuccess() : window.location.reload());
            if (this.state.item.dangKyPhongHop) {
                this.checkValidData(data, update);
            } else
                update();
        }
    }

    checkValidData = (data, done) => {
        if ((data.batDau != this.state.item.batDau || data.ketThuc != this.state.item.ketThuc || this.state.item.phongHopTicket.phongHop != data.phongHop) && [this.trangThaiPhongHopTicketDict.DA_DUYET.id, this.trangThaiPhongHopTicketDict.DA_DANG_KY.id].includes(this.state.item.phongHopTicket.trangThai)) {
            T.confirm3('Cảnh báo', 'Bạn đã thay đổi thông tin đăng ký phòng họp. Hệ thống sẽ hủy đăng ký phòng họp trước đó, bạn có muốn gửi lại phiếu đăng ký phòng họp?', 'warning', 'Không gửi', 'Gửi đăng ký', (confirm) => {
                if (confirm == null) {
                    return;
                }
                else if (confirm) {
                    data.guiPhieu = 1;
                }
                done && done();
            });
        } else {
            done && done();
        }
    }

    onShow = (data) => {
        if (!data) {
            this.setState({ item: null, dangKyPhongHop: 0, isOnline: 0 }, (() => {
                this.dateRange.value(null, null);
                this.ten?.value('');
                this.noiDung?.value('');
                this.chuTri?.value('');
                this.duongDan?.value('');
                this.phongHop?.value('');
                this.isOnline?.value('');
                this.dangKyPhongHop?.value('');
                this.diaDiem?.value('');
            }));
        }
        else {
            this.setState({ item: data, isOnline: data.isOnline, dangKyPhongHop: data.dangKyPhongHop }, () => {
                this.dateRange.value(data.batDau, data.ketThuc);
                this.ten?.value(data.ten);
                this.noiDung?.value(data.noiDung || '');
                this.chuTri?.value(data.chuTri);
                this.duongDan?.value(data.duongDan);
                this.phongHop?.value(data.phongHopTicket?.phongHop);
                this.isOnline?.value(data.isOnline);
                this.dangKyPhongHop?.value(data.dangKyPhongHop);
                this.diaDiem?.value(data.diaDiem);
                if (data.banTheHienThanhPhan) {
                    this.banTheHienThanhPhan?.value(data.banTheHienThanhPhan);
                }
                else {
                    this.banTheHienThanhPhan?.value(this.getThanhPhanSummary(data.thanhPhan));
                }
            });
        }
    }

    onChangeOnline = (value) => {
        this.setState({ isOnline: value }, () => {
            if (value) {
                this.duongDan.value(this.state.duongDan || '');
            } else {
                if (!this.state.dangKyPhongHop) return; // end here
                this.state.dataPhongHop?.phongHop && this.phongHop.value(this.state.dataPhongHop?.phongHop || '');
                this.state.dataPhongHop?.batDau && this.batDau.value(this.state.dataPhongHop?.batDau || '');
                this.state.dataPhongHop?.ketThuc && this.ketThuc.value(this.state.dataPhongHop?.ketThuc || '');
            }
        });
    }

    onChangeDangKyPhongHop = (value) => {
        this.setState({ dangKyPhongHop: value });
    }

    partialShow = () => {
        $(this.modal).modal('show');
    }

    partialHide = () => {
        $(this.modal).modal('hide');
    }

    onChonPhongHop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.partialHide();
        const pageModals = this.props.getPageModals();
        const modal = this;
        pageModals.chonPhongModal.getModalDom().on('hidden.bs.modal', function (e) {
            $(e.currentTarget).unbind();
        });

        pageModals.chonPhongModal.onHidden(() => {
            const data = pageModals.chonPhongModal.getValue();
            if (data) {
                this.dateRange.value(data.batDau, data.ketThuc);
                modal.phongHop.value(data.phongHop);
                this.setState({ dataPhongHop: data });
            }
            pageModals.mainModal.partialShow();
        });
        const [batDau, ketThuc] = this.dateRange.value();
        pageModals.chonPhongModal.show({
            batDau: batDau ? batDau?.getTime() : '',
            ketThuc: ketThuc ? ketThuc?.getTime() : '',
        });
    }


    render = () => {
        return this.renderModal({
            title: 'Công tác',
            icon: 'fa fa-calendar-check-o',
            size: 'elarge',
            body:
                <div className='row'>
                    <div className='col-md-12 d-flex justify-content-begin align-items-center' style={{ gap: 10 }}>
                        {/* <FormCheckbox isSwitch ref={e => this.suKienLenLich = e} label='Sự kiện lên lịch' required readOnly={this.state.item} /> */}
                        <FormCheckbox isSwitch ref={e => this.isOnline = e} label='Trực tuyến' onChange={(value) => this.onChangeOnline(value)} readOnly={this.state.item} />
                        <FormCheckbox style={{ flex: 1 }} className={this.state.isOnline ? 'd-none' : ''} isSwitch ref={e => this.dangKyPhongHop = e} label='Đăng ký phòng họp' onChange={(value) => this.onChangeDangKyPhongHop(value)} readOnly={this.state.item} />
                        <FormCheckbox className={(this.state.isOnline || this.state.item || !this.state.dangKyPhongHop) ? 'd-none' : ''} ref={e => this.guiPhieu = e} label='Gửi phiếu đăng ký phòng họp' onChange={value => this.setState({ guiPhieu: Number(value) })} />
                    </div>
                    <FormTextBox label='Nội dung sự kiện' required ref={e => this.ten = e} className='col-md-12' />
                    <FormRichTextBox key={'noi_dung_in_modal'} label='Mô tả' ref={e => this.noiDung = e} className={'col-md-12 ' + ((this.state.dangKyPhongHop && !this.state.isOnline) ? '' : 'd-none')} />
                    <FormSelect data={SelectAdapter_FwCanBoWithDonVi} className='col-md-4' ref={e => this.chuTri = e} label='Chủ trì' />
                    <EaseDateRangePicker ref={e => this.dateRange = e} className='col-md-8' label='Thời gian' withTime format='HH:mm, DD/MM/YYYY' minDate={this.props.minDate} maxDate={this.props.maxDate} />
                    <FormTextBox className={'col-md-12 ' + (this.state.isOnline ? '' : 'd-none')} ref={e => this.duongDan = e} label='Đường dẫn' onChange={() => { this.setState({ duongDan: this.duongDan.value() }); }} validator={(value) => {
                        const pattern = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
                        return pattern.test(value);
                    }} />
                    <FormSelect className={'col-md-12 ' + ((this.state.dangKyPhongHop && !this.state.isOnline) ? '' : 'd-none')} ref={e => this.phongHop = e} placeholder='Phòng họp' label={
                        <div className='d-flex'>Phòng họp <a href='#' onClick={this.onChonPhongHop}>(Nhấn vào đây để thay đổi)</a><span className='text-danger'>*</span></div>
                    } disabled onChange={(item) => { this.setState({ phongHop: item.id }); }} data={SelectAdapter_DmPhongHop} />
                    <FormTextBox required={!this.state.dangKyPhongHop} className={'col-md-12 ' + ((!this.state.isOnline) ? '' : 'd-none')} label='Địa điểm' ref={e => this.diaDiem = e} />
                    {this.state.item && <FormTextBox ref={e => this.banTheHienThanhPhan = e} className='col-md-12' placeholder='Thành phần' label={<span>Thành phần tham gia (tóm tắt) {this.state.item?.banTheHienThanhPhan ? '' : <span className='text-primary'>(*Nội dung này đang được sinh ra tự động từ danh sách cán bộ tham gia)</span>}</span>} />}
                    <FormSelect className={'col-md-12 ' + (this.state.item ? 'd-none' : '')} label='Thành phần tham gia' multiple data={SelectAdapter_FwCanBoWithDonVi} ref={e => this.canBoThamGia = e} />
                </div>
        });
    }
}

const stateToProps = (state) => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const actionsToProps = { create, update };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(HcthCongTacModal);


