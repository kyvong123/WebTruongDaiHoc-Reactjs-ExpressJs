import React from 'react';
import { AdminModal, FormSelect, } from 'view/component/AdminPage';
import { SelectAdapter_PhanHeMoDangKy } from 'modules/mdSauDaiHoc/sdhTsInfoPhanHe/redux';
import { SelectAdapter_ChkttsNganh } from 'modules/mdSauDaiHoc/sdhTsThongTinCoBan/redux';
import { SelectAdapter_HinhThuc } from 'modules/mdSauDaiHoc/sdhTsHinhThuc/redux';

export class CopyHsdkModal extends AdminModal {
    state = { phanHeNew: '', id: '', ccnn: false, newData: {} }
    componentDidMount() {
        this.disabledClickOutside();
    }

    onShow = (item) => {
        this.setState({ item });
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
            let { id: idNganh, ma: maNganh } = value?.id ? T.parse(value.id) : {};

            this.setState({ newData: { ...this.state.newData, idNganh, maNganh } });
        }
    }
    onSubmit = (e) => {
        e.preventDefault();
        const { item, newData } = this.state;
        T.confirm('Xác nhận đăng ký', 'Xác nhận đăng ký bổ sung?', true, isConfirm =>
            isConfirm && this.props.copy(item, newData, () => {
                this.props.getData();
                this.hide();
            }));
    }


    mapperStyle = {
        0: 'btn-secondary',
        1: 'btn-success',
        2: 'btn-danger',
    }

    selectXetDuyet = [{ id: 0, text: 'Chờ duyệt' }, { id: 1, text: 'Duyệt' }, { id: 2, text: 'Không duyệt' }]



    render = () => {
        const { readOnly, active, idDot } = this.props;
        const newData = this.state.newData;
        return this.renderModal({
            title: 'Đăng ký bổ sung phân hệ',
            size: 'large',

            body: <div className='row'>
                <FormSelect ref={e => this.phanHe = e} label='Chọn phân hệ' className='col-md-4' readOnly={readOnly} data={SelectAdapter_PhanHeMoDangKy(idDot, active)} onChange={value => this.onChangeSelect('phanHe', value)} />
                <FormSelect ref={e => this.hinhThuc = e} label='Chọn Hình thức' className='col-md-4' data={SelectAdapter_HinhThuc(newData.idPhanHe)} onChange={value => this.onChangeSelect('hinhThuc', value)} readOnly={readOnly} required allowClear />
                <FormSelect ref={e => this.nganh = e} label='Chọn Ngành' className='col-md-4' minimumResultsForSearch={-1} readOnly={readOnly} data={SelectAdapter_ChkttsNganh({ idDot, idPhanHe: newData.idPhanHe, maHinhThuc: newData.hinhThuc })} onChange={value => this.onChangeSelect('nganh', value)} />
            </div>
        });
    }
} 