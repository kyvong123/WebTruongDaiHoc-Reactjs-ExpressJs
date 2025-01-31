import React from 'react';
import { FormSelect, FormTextBox } from 'view/component/AdminPage';
import { ajaxSelectTinhThanhPho } from 'modules/mdCongTacSinhVien/ctsvDmDiaDiem/reduxTinhThanhPho';
import { ajaxSelectQuanHuyen } from 'modules/mdCongTacSinhVien/ctsvDmDiaDiem/reduxQuanHuyen';
import { ajaxSelectPhuongXa } from 'modules/mdCongTacSinhVien/ctsvDmDiaDiem/reduxPhuongXa';

export function getValueDiaChi(input) {
    const data = input.value();
    if (!input.props || !input.props.required) return data;
    if (!data || typeof (data) != 'object') throw input;
    for (let key in data) {
        if (!input.props.soNha && key == 'soNha') continue;
        if (!data[key]) throw input;
    }
    return data;
}
export class ComponentDiaChi extends React.Component {
    state = { tinhThanh: '', quanHuyen: '', phuongXa: '' };

    focus = () => {
        if (!this.tinhThanh.value()) this.tinhThanh.focus();
        else if (!this.quanHuyen.value()) this.quanHuyen.focus();
        else if (!this.phuongXa.value()) this.phuongXa.focus();
        else if (this.soNha && !this.soNha.value()) this.soNha.focus();
    };

    value = function (tinhThanh, quanHuyen, phuongXa, soNha) {
        if (arguments.length) {
            if (tinhThanh) {
                ajaxSelectTinhThanhPho.fetchOne(tinhThanh, resTinhThanh => this.setState({ tinhThanh: resTinhThanh.id, tenTinhThanh: resTinhThanh.text }, () => {
                    if (quanHuyen) {
                        ajaxSelectQuanHuyen(tinhThanh).fetchOne(quanHuyen, resQuanHuyen => this.setState({ quanHuyen: resQuanHuyen.id, tenQuanHuyen: resQuanHuyen.text }, () => {
                            if (phuongXa) {
                                ajaxSelectPhuongXa(quanHuyen).fetchOne(phuongXa, resPhuongXa => this.setState({ phuongXa: resPhuongXa.id, tenPhuongXa: resPhuongXa.text }));
                                this.phuongXa.value(phuongXa);
                            }
                            else {
                                this.phuongXa.value('');
                            }
                        }));
                        this.quanHuyen.value(quanHuyen);
                    }
                    else {
                        this.quanHuyen.value('');
                        this.phuongXa.value('');
                    }
                }));
                this.tinhThanh.value(tinhThanh);
            }
            else {
                this.tinhThanh.value('');
                this.quanHuyen.value('');
                this.phuongXa.value('');
            }
            if (this.props.soNha) {
                this.soNha.value(soNha || '');
                this.setState({ soNha });
            }
        } else {
            return ({
                tinhThanh: this.tinhThanh.value(),
                quanHuyen: this.quanHuyen.value(),
                phuongXa: this.phuongXa.value(),
                soNha: this.props.soNha ? this.soNha.value() : null,
            });
        }
    }

    changeTinhThanhPho = (value) => {
        if (this.state.tinhThanh != value.id) {
            this.setState({ tinhThanh: value.id }, () => {
                this.quanHuyen.value('');
                this.phuongXa.value('');
                this.quanHuyen.focus();
            });
        }
    }

    changeQuanHuyen = (value) => {
        if (this.state.quanHuyen != value.id) {
            this.setState({ quanHuyen: value.id }, () => {
                this.phuongXa.value('');
                this.phuongXa.focus();
            });
        }
    }

    changePhuongXa = (value) => {
        if (this.state.phuongXa != value.id) {
            this.setState({ phuongXa: value.id }, () => {
                this.props.soNha && this.soNha.focus();
            });
        }
    }

    getFullText = () => {
        return ((this.props.soNha && this.state.soNha) ? (this.state.soNha + ', ') : '') + (this.state.tenPhuongXa ? (this.state.tenPhuongXa + ', ') : '')
            + (this.state.tenQuanHuyen ? (this.state.tenQuanHuyen + ', ') : '') + (this.state.tenTinhThanh || '');
    }

    render() {
        let { soNha = false, smallText = '', label = '', className = '', readOnly = false, required = false, disabled = false } = this.props;
        let readOnlyText = ((soNha && this.state.soNha) ? (this.state.soNha + ', ') : '') + (this.state.tenPhuongXa ? (this.state.tenPhuongXa + ', ') : '')
            + (this.state.tenQuanHuyen ? (this.state.tenQuanHuyen + ', ') : '') + (this.state.tenTinhThanh || '');

        let displayElement = '';
        if (label) {
            displayElement = <><label>{label}{!readOnly && required ? <span style={{ color: 'red' }}> *</span> : ''}</label>{readOnly ? <>: <b>{readOnlyText}</b></> : ''}</>;
        } else {
            displayElement = readOnly ? <b>{readOnlyText}</b> : '';
        }

        return (
            <div className={'form-group ' + (className || '')} style={{ margin: !readOnly ? 0 : '' }} >
                {displayElement}
                <div className='row' style={{ display: readOnly ? 'none' : '' }}>
                    <FormSelect className='col-md-4' data={ajaxSelectTinhThanhPho} onChange={value => this.changeTinhThanhPho(value)} placeholder='Tỉnh/Thành phố' ref={e => this.tinhThanh = e} required={required} disabled={disabled} />
                    <FormSelect className='col-md-4' data={this.state.tinhThanh ? ajaxSelectQuanHuyen(this.state.tinhThanh) : []} onChange={value => this.changeQuanHuyen(value)} placeholder='Quận/huyện' ref={e => this.quanHuyen = e} required={required} disabled={disabled} />
                    <FormSelect className='col-md-4' data={this.state.quanHuyen ? ajaxSelectPhuongXa(this.state.quanHuyen) : []} onChange={value => this.changePhuongXa(value)} placeholder='Phường/xã' ref={e => this.phuongXa = e} required={required} disabled={disabled} />
                    {soNha && <FormTextBox className='col-md-12' placeholder='Số nhà, tên đường' ref={e => this.soNha = e} disabled={disabled} />}
                </div>
                {smallText ? <small>{smallText}</small> : null}
            </div>
        );
    }
}