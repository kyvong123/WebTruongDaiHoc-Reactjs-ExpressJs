import React from 'react';
import { AdminModal, FormSelect, FormTextBox, } from 'view/component/AdminPage';
import { SelectAdapter_PhanHe, SelectAdapter_PhanHeDangKyThem } from 'modules/mdSauDaiHoc/sdhTsInfoPhanHe/redux';
import { SelectAdapter_ChkttsNganh } from 'modules/mdSauDaiHoc/sdhTsThongTinCoBan/redux';
import { SelectAdapter_HinhThuc } from 'modules/mdSauDaiHoc/sdhTsHinhThuc/redux';
import T from 'view/js/common';

export class ModalNewHoSo extends AdminModal {
    state = { item: '', id: '', ccnn: false, newData: {} }
    componentDidMount() {
        this.disabledClickOutside();
    }
    onHidden() {
        this.setState({ item: '' }, () => {
            this.phanHe.value('');
            this.hinhThuc.value('');
            this.nganh.value('');

        });
    }

    onShow = (item) => {
        item && this.setState({ item }, () => {
            this.phanHe.value('');
        });
    }
    onChangeSelect = (type, value) => {
        if (type == 'phanHe')
            this.setState({ newData: { phanHe: value?.id, idPhanHe: value?.idPhanHe } }, () => {
                this.hinhThuc.value('');
                this.nganh.value('');
            });
        else if (type == 'hinhThuc') {
            this.setState({ newData: { ...this.state.newData, hinhThuc: value?.id } }, () => {
                this.nganh.value('');
            });
        }
        else {
            console.log(value);
            let { id: idNganh, ma: maNganh } = value?.id ? T.parse(value.id) : {};

            this.setState({ newData: { ...this.state.newData, idNganh, maNganh } });
        }
    }
    onSubmit = (e) => {
        e.preventDefault();
        const { item, newData } = this.state;
        if (!this.phanHe.value()) return T.notify('Xin vui lòng chọn phân hệ dự tuyển', 'danger');
        else if (!this.hinhThuc.value()) return T.notify('Xin vui lòng chọn hình thức dự tuyển', 'danger');
        else if (!this.email.value()) return T.notify('Xin vui lòng nhập email thí sinh', 'danger');
        if (!item) T.confirm('Xác nhận tạo mới hồ sơ', '', true, isConfirm =>
            isConfirm && this.props.create({ ...newData, email: this.email.value() }, (newItem) => {
                this.hide();
                this.props.history.push(`/user/sau-dai-hoc/thi-sinh/item/${newItem.id}`, { idDot: newItem.idDot, maPhanHe: newItem.maPhanHe, maHinhThuc: newItem.maHinhThuc });
            }));
        else T.confirm('Xác nhận tạo bản sao hồ sơ', '', true, isConfirm =>
            isConfirm && this.props.copy({ id: item.id }, newData, (newItem) => {
                this.hide();
                newItem && newItem.id && this.props.history.push(`/user/sau-dai-hoc/thi-sinh/item/${newItem.id}`, { idDot: newItem.idDot, maPhanHe: newItem.maPhanHe, maHinhThuc: newItem.maHinhThuc });
            }));
    }


    mapperStyle = {
        0: 'btn-secondary',
        1: 'btn-success',
        2: 'btn-danger',
    }

    selectXetDuyet = [{ id: 0, text: 'Chờ duyệt' }, { id: 1, text: 'Duyệt' }, { id: 2, text: 'Không duyệt' }]


    render = () => {
        const { readOnly, idDot } = this.props;
        const newData = this.state.newData;
        const item = this.state.item;
        return this.renderModal({
            title: item ? 'Sao chép hồ sơ' : 'Tạo hồ sơ',
            size: 'large',

            body: <div className='row'>
                {item ?
                    <FormSelect ref={e => this.phanHe = e} label='Chọn phân hệ' className='col-md-4' readOnly={readOnly} data={SelectAdapter_PhanHeDangKyThem(item.email, idDot)} onChange={value => this.onChangeSelect('phanHe', value)} required allowClear /> :
                    <FormSelect key='newPhanHe' ref={e => this.phanHe = e} label='Chọn phân hệ' className='col-md-4' readOnly={readOnly} data={SelectAdapter_PhanHe(idDot)} onChange={value => this.onChangeSelect('phanHe', value)} required allowClear />
                }
                <FormSelect key='newHinhThuc' ref={e => this.hinhThuc = e} label='Chọn Hình thức' className='col-md-4' data={SelectAdapter_HinhThuc(newData.idPhanHe)} onChange={value => this.onChangeSelect('hinhThuc', value)} readOnly={readOnly} required allowClear />
                <FormSelect key='newNganh' ref={e => this.nganh = e} label='Chọn Ngành' className='col-md-4' minimumResultsForSearch={-1} readOnly={readOnly} data={SelectAdapter_ChkttsNganh({ idDot, idPhanHe: newData.idPhanHe, maHinhThuc: newData.hinhThuc })} onChange={value => this.onChangeSelect('nganh', value)} />
                <FormTextBox key='newEmail' ref={e => this.email = e} label='Email thí sinh' className='col-md-12' readOnly={readOnly} required />
            </div>
        });
    }
} 