import React from 'react';
import { FormSelect, FormTextBox } from 'view/component/AdminPage';
import { ajaxSelectTinhThanhPho } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
import { ajaxSelectQuanHuyen } from 'modules/mdDanhMuc/dmDiaDiem/reduxQuanHuyen';
import { ajaxSelectPhuongXa } from 'modules/mdDanhMuc/dmDiaDiem/reduxPhuongXa';

export class ComponentDiaDiem extends React.Component {
    state = { maTinhThanhPho: '', maQuanHuyen: '', maPhuongXa: '' };

    componentDidMount() {
    }

    value = function (maTinhThanhPho, maQuanHuyen, maPhuongXa, soNhaDuong) {
        if (arguments.length) { // set value
            if (maTinhThanhPho) {
                this.setState({ maTinhThanhPho }, () => {
                    this.dmTinhThanhPho.value(maTinhThanhPho);
                    if (maQuanHuyen) {
                        this.setState({ maQuanHuyen }, () => {
                            this.dmQuanHuyen.value(maQuanHuyen);
                            if (maPhuongXa) {
                                this.dmPhuongXa.value(maPhuongXa);
                            } else {
                                this.dmPhuongXa.value(null);
                                maPhuongXa = '';
                            }
                        });
                    } else {
                        this.dmQuanHuyen.value(null);
                        this.dmPhuongXa.value(null);
                        maQuanHuyen = maPhuongXa = '';
                    }
                });
            } else {
                this.dmTinhThanhPho.value(null);
                this.dmQuanHuyen.value(null);
                this.dmPhuongXa.value(null);
                maTinhThanhPho = maQuanHuyen = maPhuongXa = '';
            }
            if (this.props.requiredSoNhaDuong) this.soNhaDuong.value(soNhaDuong || '');
            this.setState({ maTinhThanhPho, maQuanHuyen, maPhuongXa });
        } else { // get value
            return ({
                maTinhThanhPho: this.dmTinhThanhPho.value(),
                maQuanHuyen: this.dmQuanHuyen.value(),
                maPhuongXa: this.dmPhuongXa.value(),
                soNhaDuong: this.props.requiredSoNhaDuong ? this.soNhaDuong.value() : null
            });
        }
    };

    valid = (isValid) => {
        this.dmTinhThanhPho.valid(isValid);
        this.dmQuanHuyen.valid(isValid);
        this.dmPhuongXa.valid(isValid);
        this.soNhaDuong.valid(isValid);
    }

    changeTinhThanhPho = (value) => {
        if (this.state.maTinhThanhPho != value.id) {
            this.setState({ maTinhThanhPho: value.id, tenTinhThanhPho: value.text }, () => {
                this.dmQuanHuyen.value(null);
                this.dmPhuongXa.value(null);
                this.dmQuanHuyen.focus();
            });
        }
    };

    changeQuanHuyen = (value) => {
        if (this.state.maQuanHuyen != value.id) {
            this.setState({ maQuanHuyen: value.id, tenQuanHuyen: value.text }, () => {
                this.dmPhuongXa.value(null);
                this.dmPhuongXa.focus();
            });
        }
    };

    changePhuongXa = (value) => {
        if (this.state.maPhuongXa != value.id) {
            this.setState({ maPhuongXa: value.id, tenPhuongXa: value.text }, () => {
                this.soNhaDuong && this.soNhaDuong.focus();
            });
        }
    };

    getText = () => {
        let { tenPhuongXa = '', tenQuanHuyen = '', tenTinhThanhPho = '' } = this.state;
        return ({
            tenPhuongXa: this.dmPhuongXa.data()?.text || tenPhuongXa,
            tenQuanHuyen: this.dmQuanHuyen.data()?.text || tenQuanHuyen,
            tenTinhThanhPho: this.dmTinhThanhPho.data()?.text || tenTinhThanhPho
        });
    };

    render = () => {
        const { label, className, style, readOnly = false, requiredSoNhaDuong = false, fullDisplay = false, noLabel = false, required = false, maxLengthSoNha } = this.props;
        const { maTinhThanhPho = '', maQuanHuyen = '' } = this.state;
        let defaultClassName = 'input-group col-md-4';
        if (fullDisplay) defaultClassName = 'col-12';
        return (
            <div className={(className || '')} style={style}>
                <span>
                    <label style={{ display: noLabel ? 'none' : '' }}>{label || 'Địa chỉ'}{!readOnly && required ? <span style={{ color: 'red' }}> *</span> : ''}:</label>
                    <div className='row'>
                        <FormSelect ref={e => this.dmTinhThanhPho = e} data={ajaxSelectTinhThanhPho} onChange={value => this.changeTinhThanhPho(value)} readOnly={readOnly} className={defaultClassName}
                            label={readOnly ? 'Thành phố, tỉnh' : null} placeholder='Thành phố, tỉnh' />
                        <FormSelect ref={e => this.dmQuanHuyen = e} data={maTinhThanhPho ? ajaxSelectQuanHuyen(maTinhThanhPho) : []} onChange={value => this.changeQuanHuyen(value)} readOnly={readOnly}
                            className={defaultClassName} label={readOnly ? 'Quận, huyện' : null} placeholder='Quận, huyện' />
                        <FormSelect ref={e => this.dmPhuongXa = e} data={maQuanHuyen ? ajaxSelectPhuongXa(maQuanHuyen) : []} onChange={value => this.changePhuongXa(value)} readOnly={readOnly}
                            className={defaultClassName} label={readOnly ? 'Phường, xã' : null} placeholder='Phường, xã' />
                        <FormTextBox ref={e => this.soNhaDuong = e} type='text' style={{ display: requiredSoNhaDuong ? 'block' : 'none' }} label={readOnly ? 'Số nhà, đường' : null} maxLength={maxLengthSoNha}
                            placeholder='Số nhà, đường' readOnly={readOnly} className='col-md-6' />
                    </div>
                </span>
            </div>);
    };
}