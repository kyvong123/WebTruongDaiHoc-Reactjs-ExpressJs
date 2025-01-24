import { SelectAdapter_DmDonViFilter } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmLoaiVanBan } from 'modules/mdDanhMuc/dmLoaiVanBan/redux/dmLoaiVanBan';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormCheckbox, FormDatePicker, FormSelect, FormTextBox, AdminPage } from 'view/component/AdminPage';
import { SelectAdapter_HcthVanBanDiStatusSystem } from '../hcthVanBanDiStatusSystem/redux/statusSystem';

export class _CreateRequest extends AdminModal {
    state = { soLuiNgay: false }

    onShow = (item = {}) => {
        item && item.onHide && this.onHidden(item.onHide);
        this.setState({ onCreateCallback: item.onCreateCallback });
        this.setState({ ...item, isLoading: false }, () => {
            item.donVi ? this.donVi.value(item.donVi) : this.donVi.value(this.getListDonVi()[0]);
            item.loaiVanBan && this.loaiVanBan.value(item.loaiVanBan);
            item.lyDo && this.lyDo.value(item.lyDo);
            this.ngayLui.value('');
        });
    }

    onHide = () => {
        this.props.onHide && this.props.onHide();
    }

    onSubmit = () => {
        try {
            const keyword = ['donVi', 'lyDo', 'loaiVanBan', 'soLuiNgay', 'ngayLui', 'quantity', 'systemId'];
            const data = {};
            keyword.forEach(key => {
                data[key] = this[key]?.value();
                if (!data[key] && this[key].props.required) {
                    T.notify(this[key].props.label + ' trống', 'danger');
                    throw new Error('Dữ liệu không hợp lệ');
                }
                if (data[key] instanceof Date) {
                    data[key] = data[key].getTime();
                }
                if (['soLuiNgay'].includes(key)) {
                    data[key] = Number(data[key]);
                }
                if (['ngayLui'].includes(key) && data[key]) {
                    data[key] = new Date(data[key]).setHours(23, 59, 59, 999);
                    const toDay = new Date().setHours(0, 0, 0, 0);
                    if (data[key] >= toDay) {
                        T.notify('Ngày lùi không hợp lệ', 'danger');
                        throw new Error('Dữ liệu không hợp lệ');
                    }
                }


            });
            if (data.soLuiNgay && !data.ngayLui) {
                T.notify('Ngày lùi không hợp lệ', 'danger');
                throw 'Ngày lùi không hợp lệ';
            }
            if (!data.soLuiNgay) {
                data.ngayLui = null;
            }
            if (this.props.inVanBan) {
                this.props.create(data, this.hide());
            } else if (this.state.onCreateCallback) {
                this.setState({ isLoading: true }, () => {
                    this.create(data, (res) => this.state.onCreateCallback(res, this.hide), this.setState(({ isLoading: false })));
                });
            } else {
                this.setState({ isLoading: true }, () => {
                    this.create(data, () => this.props.getPage ? this.props.getPage(null, null, null, () => this.hide()) : this.hide(), this.setState(({ isLoading: false })));
                });
            }
        } catch (error) {
            // T.notify(error, 'danger');
            console.error(error);
            return;
        }
    }

    create = (data, done, onFinish) => {
        T.post('/api/hcth/cong-van-di/admin/bulk', data, (res) => {
            this.hide();
            done && done(res);
        }, (error) => {
            onFinish && onFinish();
            T.alert(T.stringify(error), 'danger');
        });
    }
    getDonViQuanLy = () => {
        return this.props.system?.user?.staff?.donViQuanLy || [];
    }

    getDonVi = () => this.props.system?.user?.staff?.maDonVi;
    getListDonVi = () => {
        const donVi = this.getDonViQuanLy().map(item => item.maDonVi);
        if (this.getDonVi()) donVi.push(this.getDonVi());
        return [...new Set(donVi)];
    }

    render = () => {
        return this.renderModal({
            title: 'Tạo mới yêu cầu cấp số văn bản',
            body: <div className='row'>
                <FormSelect ref={e => this.donVi = e} label='Đơn vị' className='col-md-6' data={SelectAdapter_DmDonViFilter(this.getListDonVi())} required onChange={value => this.setState({ donViGui: value?.id || '' })} />
                <FormSelect ref={e => this.loaiVanBan = e} label='Loại văn bản' className='col-md-6' data={SelectAdapter_DmLoaiVanBan} />
                <FormCheckbox ref={e => this.soLuiNgay = e} isSwitch label={'Số lùi ngày'} className={'col-md-12'} onChange={(value) => this.setState({ soLuiNgay: value })} />
                <FormDatePicker ref={e => this.ngayLui = e} label={'Ngày lấy số'} className={'col-md-12'} style={this.state.soLuiNgay ? {} : { display: 'none' }} />
                <FormDatePicker ref={e => this.ngayPhatHanh = e} label={'Ngày phát hành'} className={'col-md-12'} style={this.state.soLuiNgay ? { display: 'none' } : {}} />
                <FormTextBox ref={e => this.lyDo = e} label='Nội dung văn bản' className='col-md-12' required />
                <FormTextBox ref={e => this.quantity = e} type='number' label='Số lượng' className='col-md-12' required />
                <FormSelect key={`TRUONG-${this.state.donViGui}-1`} ref={e => this.systemId = e} className='col-md-12' label='Quy trình phát hành' data={SelectAdapter_HcthVanBanDiStatusSystem([this.state.donViGui], 'TRUONG', 1)} required />
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, });
const mapActionsToProps = {};
const CreateRequest = connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(_CreateRequest);


class BulkPage extends AdminPage {
    render() {
        return this.renderPage({
            title: 'Bulk create',
            content: <>
                <div className='tile'>
                    <div className='tile-body row'>
                        <div className="col-md-12 d-flex justify-content-end align-items-center">
                            <button className='btn btn-success' type='button' onClick={() => this.createModal.show({ onCreateCallback: (res) => this.setState({ data: JSON.stringify(res, null, '\t') }) })}>
                                <i className='fa fa-plus' /> Tạo mới
                            </button>
                        </div>
                        <div className='col-md-12' style={{ whiteSpace: 'break-spaces' }}>{this.state.data}</div>
                    </div>
                </div>
                <CreateRequest ref={e => this.createModal = e} />
            </>
        });
    }
}

export default BulkPage;