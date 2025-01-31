import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormRichTextBox, FormTextBox, getValue, FormCheckbox } from 'view/component/AdminPage';
import { updateShcdNoiDung, createShcdNoiDung } from 'modules/mdCongTacSinhVien/ctsvShcd/redux/shcdNoiDungRedux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmPhong } from 'modules/mdDanhMuc/dmPhong/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { AdminSelect } from 'view/component/AdminSelect';
import '../style.scss';

class ShcdNoiDungModal extends AdminModal {
    state = { isOnline: false }
    onShow = (item) => {
        const { id = '', ten = '', thoiLuong = '', color, phong = '', heDaoTao, giangVien = '', moTa = '' } = item || {};
        this.setState({ id, item, isOnline: phong === '#Online', color }, () => {
            this.state.isOnline || this.phong.value(phong || '');
            this.isOnline.value(this.state.isOnline);
        });
        this.ten.value(ten || '');
        this.thoiLuong.value(thoiLuong / 3600000);
        this.heDaoTao.value(heDaoTao?.split(',') || '');
        this.giangVien.value(giangVien || '');
        this.moTa.value(moTa || '');
    }

    // https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex
    hslToHex = (h, s, l) => {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    onSubmit = () => {
        const data = {
            isSubmit: 1,
            ten: getValue(this.ten),
            thoiLuong: getValue(this.thoiLuong) * 3600000,
            phong: this.state.isOnline ? '#Online' : getValue(this.phong),
            heDaoTao: getValue(this.heDaoTao).toString(),
            giangVien: getValue(this.giangVien),
            moTa: getValue(this.moTa),
            shcdId: this.props.shcdId,
            color: this.state.color || this.hslToHex(Math.floor(Math.random() * 360), 100, 40), //Chọn màu ngẫu nhiênrs
        };
        if (data.thoiLuong <= 0) {
            T.notify('Thời lượng nên ít nhất 1 tiếng!', 'danger');
            return;
        }
        const done = () => {
            this.hide();
            this.props.getData && this.props.getData();
        };
        T.confirm(`Xác nhận ${this.state.id ? 'cập nhật' : 'tạo'} nội dung?`, '', isConfirm => {
            if (!isConfirm) return;
            this.state.id ? this.props.updateShcdNoiDung(this.state.id, data, done) : this.props.createShcdNoiDung(data, done);
        });
    }

    render = () => {
        const { isOnline } = this.state || {};
        return this.renderModal({
            title: `${this.state.id ? 'Cập nhật' : 'Tạo'}  nội dung`,
            body: <div className='row'>
                <FormTextBox className='col-md-8' ref={e => this.ten = e} label='Tiêu đề' required />
                <FormTextBox className='col-md-4' ref={e => this.thoiLuong = e} type='number' label='Thời lượng (giờ)' required />
                <AdminSelect className='col-md-12' ref={e => this.heDaoTao = e} multiple label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} required />
                <FormCheckbox className='col-md-3' ref={e => this.isOnline = e} label='Trực tuyến' required onChange={(value) => this.setState({ isOnline: value })} />
                {isOnline || <AdminSelect className='col-md-9' ref={e => this.phong = e} label='Phòng' data={SelectAdapter_DmPhong} required />}
                <AdminSelect className='col-md-12' ref={e => this.giangVien = e} label='Giảng viên' data={SelectAdapter_FwCanBo} required />
                <FormRichTextBox className='col-md-12' ref={e => this.moTa = e} label='Mô tả' />
            </div>
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, ctsvShcd: state.ctsv.ctsvShcd });
const mapActionsToProps = {
    updateShcdNoiDung, createShcdNoiDung
};

export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ShcdNoiDungModal);