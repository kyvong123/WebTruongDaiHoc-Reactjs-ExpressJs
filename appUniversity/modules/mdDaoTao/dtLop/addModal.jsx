import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, FormTextBox, getValue, FormCheckbox } from 'view/component/AdminPage';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_KhungDaoTaoCtsv, createDtLop } from './redux';
import { SelectAdapter_DtNganhDaoTaoStudent } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';

class AddModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() =>
            this.onHidden(this.onHide)
        );
    }

    onHide = () => {
        this.ma?.value('');
        this.ten?.value('');
        this.nienKhoa?.value('');
        this.maNganh?.value('');
        this.heDaoTao?.value('');
        this.khoaSinhVien?.value('');
        this.namHocBatDau?.value('');
        this.kichHoat?.value('');
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            maLop: getValue(this.ma),
            tenLop: getValue(this.ten),
            nienKhoa: getValue(this.nienKhoa),
            khoaSinhVien: getValue(this.khoaSinhVien),
            namHocBatDau: getValue(this.namHocBatDau),
            maNganh: getValue(this.maNganh),
            heDaoTao: getValue(this.heDaoTao),
            maCtdt: getValue(this.ctdt),
            kichHoat: this.kichHoat.value() ? 1 : 0,
            loaiLop: 'N',
        };
        this.props.createDtLop(changes, () => {
            this.hide();
            this.props.history.push(`/user/dao-tao/lop/item?khoa=${changes.khoaSinhVien}&heDaoTao=${changes.heDaoTao}`);
        });
    };

    changeKichHoat = (value) => this.kichHoat.value(Number(value));

    changeNganh = (value) => {
        this.setState({ maNganh: value.id }, () => this.ctdt.value(null));
        this.ma.value(value.maLop || '');
        this.ma.focus();
    }

    changeKhoaSinhVien = () => {
        this.setState({ khoaSinhVien: getValue(this.khoaSinhVien) }, () => {
            this.ctdt.value(null);
        });
    }

    changeHeDaoTao = (value) => {
        this.setState({ heDaoTao: value.id }, () => {
            this.ctdt.value(null);
        });
    }

    copyMaLop = (e) => {
        e.preventDefault();
        const ma = this.ma.value();
        this.ten.value(ma);
    }

    changeCtdt = (value) => {
        const khoaSinhVien = getValue(this.khoaSinhVien);
        this.nienKhoa.value(`${khoaSinhVien} - ${Number(khoaSinhVien) + ((value.thoiGianDaoTao == null || value.thoiGianDaoTao == '-1') ? 4 : Number(value.thoiGianDaoTao))}`);
    }

    render = () => {
        const { heDaoTao, khoaSinhVien, maNganh } = this.state;
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Tạo lớp mới',
            body: (
                <div className='row'>
                    <FormSelect ref={(e) => (this.maNganh = e)} label='Chọn ngành' data={SelectAdapter_DtNganhDaoTaoStudent} className='col-md-12' readOnly={this.state.ma ? true : readOnly} onChange={(value) => this.changeNganh(value)} required />
                    <FormSelect ref={(e) => (this.heDaoTao = e)} onChange={this.changeHeDaoTao} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Hệ đào tạo' className='col-md-6' readOnly={this.state.ma ? true : readOnly} required />
                    <FormSelect type='text' ref={(e) => (this.khoaSinhVien = e)} data={SelectAdapter_DtKhoaDaoTao} label='Khóa sinh viên' className='col-md-6' readOnly={this.state.ma ? true : readOnly} onChange={() => this.changeKhoaSinhVien()} required />
                    <FormSelect ref={(e) => (this.ctdt = e)} data={khoaSinhVien !== '' ? SelectAdapter_KhungDaoTaoCtsv(heDaoTao, khoaSinhVien, maNganh) : []} label='Chương trình đào tạo' className='col-md-12' onChange={(value) => this.changeCtdt(value)} readOnly={readOnly} required />
                    <FormTextBox type='scholastic' className='col-md-6' ref={(e) => (this.nienKhoa = e)} label='Niên khóa' readOnly={readOnly} required />
                    <FormTextBox type='scholastic' className='col-md-6' ref={(e) => (this.namHocBatDau = e)} label='Năm học bắt đầu' readOnly={readOnly} required />
                    <FormTextBox type='text' className='col-md-12' ref={(e) => (this.ma = e)} label='Mã lớp' readOnly={this.state.ma ? true : readOnly} required />
                    <FormTextBox type='text' className='col-md-12' ref={(e) => (this.ten = e)} label={<span>Tên lớp {!readOnly && <a href='#' onClick={this.copyMaLop}>(Giống mã lớp)</a>}</span>} placeholder='Tên lớp' readOnly={readOnly} required />
                    <FormCheckbox className='col-md-6' ref={(e) => (this.kichHoat = e)} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={(value) => this.changeKichHoat(value ? 1 : 0)} />
                </div>
            ),
        });
    };
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createDtLop };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AddModal);