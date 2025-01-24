// import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormTextBox, getValue, FormSelect, FormCheckbox, FormTabs } from 'view/component/AdminPage';
import { createDtNganh, updateDtNganh } from './redux';
import { SelectAdapter_DtDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';

class NganhModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.maNganh.value() ? this.maNganh.focus() : this.tenNganh.focus();
        }));
        this.onHidden(() => {
            this.tenTiengAnh.value('');
        });
    }

    onShow = (item) => {
        let { maNganh = '', tenNganh = '', maLop = '', maKhoa = '', kichHoat, tenTiengAnh = '' } = item ? item : {};
        this.setState({ maNganh, item });
        this.maNganh.value(maNganh);
        this.tenNganh.value(tenNganh);
        this.maLop.value(maLop);
        this.khoa.value(maKhoa);
        this.kichHoat.value(kichHoat ? 1 : 0);
        this.tenTiengAnh.value(tenTiengAnh);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            maNganh: getValue(this.maNganh),
            tenNganh: getValue(this.tenNganh),
            tenTiengAnh: getValue(this.tenTiengAnh),
            maLop: getValue(this.maLop),
            khoa: getValue(this.khoa),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        this.state.maNganh ? this.props.updateDtNganh(this.state.maNganh, changes, this.hide) : this.props.createDtNganh(changes, this.hide);

    };

    changeKichHoat = value => this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.maNganh ? 'Cập nhât ngành đào tạo' : 'Tạo mới ngành đào tạo',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.maNganh = e} label='Mã ngành' readOnly={this.state.maNganh ? true : readOnly} required />
                <FormTabs className='col-12' tabs={[
                    { title: 'Tên ngành', component: <FormTextBox type='text' ref={e => this.tenNganh = e} readOnly={readOnly} required /> },
                    { title: 'Tên ngành tiếng anh', component: <FormTextBox type='text' ref={e => this.tenTiengAnh = e} readOnly={readOnly} required /> }
                ]} />
                <FormTextBox type='text' className='col-12' ref={e => this.maLop = e} label='Mã lớp' readOnly={readOnly} required />
                <FormSelect ref={e => this.khoa = e} className='col-12' label='Khoa' data={SelectAdapter_DtDmDonVi()} readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={(e) => (this.kichHoat = e)} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={(value) => this.changeKichHoat(value ? 1 : 0)} />
            </div>
        }
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dtNganhDaoTao: state.daoTao.dtNganhDaoTao });
const mapActionsToProps = { createDtNganh, updateDtNganh };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(NganhModal);