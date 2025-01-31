import React from 'react';
import { connect } from 'react-redux';
import {AdminPage} from 'view/component/AdminPage';
import {ComponentDiaDiem} from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import {updateSystemState} from 'modules/_default/_init/reduxSystem';

class ComponentCuTru extends AdminPage {
    copyAddress = e => {
        e.preventDefault();
        const dataThuongTru = this.thuongTru.value();
        this.hienTai.value(dataThuongTru.maTinhThanhPho, dataThuongTru.maQuanHuyen, dataThuongTru.maPhuongXa, dataThuongTru.soNhaDuong);
    }

    value = (item) => {
        this.thuongTru.value(item.thuongTruMaTinh, item.thuongTruMaHuyen, item.thuongTruMaXa, item.thuongTruSoNha);
        this.hienTai.value(item.hienTaiMaTinh, item.hienTaiMaHuyen, item.hienTaiMaXa, item.hienTaiSoNha);
    }

    getAndValidate = () => {
        try {
            const { maTinhThanhPho: hienTaiMaTinh, maQuanHuyen: hienTaiMaHuyen, maPhuongXa: hienTaiMaXa, soNhaDuong: hienTaiSoNha } = this.hienTai.value();
            const { maTinhThanhPho: thuongTruMaTinh, maQuanHuyen: thuongTruMaHuyen, maPhuongXa: thuongTruMaXa, soNhaDuong: thuongTruSoNha } = this.thuongTru.value();

            const data = {
                thuongTruMaTinh, thuongTruMaHuyen, thuongTruMaXa, thuongTruSoNha,
                hienTaiMaTinh, hienTaiMaHuyen, hienTaiMaXa, hienTaiSoNha
            };
            return data;
        } catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }

    render() {
        let readOnly = this.props.readOnly;

        return <>
            <div className='tile'>
                <h3 className='tile-title'>Thông tin cư trú</h3>
                    <div className='tile-body row'>
                        <ComponentDiaDiem ref={e => this.thuongTru = e} label='Địa chỉ thường trú' className='form-group col-12' requiredSoNhaDuong={true} readOnly={readOnly} />
                        <ComponentDiaDiem ref={e => this.hienTai = e} label={<span>Nơi ở hiện tại (<a href='#' onClick={e => !readOnly && this.copyAddress(e)}>Nhấn vào đây nếu giống <b>thường trú</b></a>)</span>} className='form-group col-12' requiredSoNhaDuong={true} readOnly={readOnly} />
                    </div>
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ staff: state.tccb.staff, system: state.system });
const mapActionsToProps = { updateSystemState };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentCuTru);