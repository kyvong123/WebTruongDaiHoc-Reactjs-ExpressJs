// import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, FormTextBox, getValue, FormTabs } from 'view/component/AdminPage';
import { createDtChuyenNganh, updateDtChuyenNganh, SelectAdapter_DtNganhDaoTao } from './redux';
// import { SelectAdapter_DtCauTrucKhungDaoTao } from 'modules/mdDaoTao/dtCauTrucKhungDaoTao/redux';
// import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux'; 

class ChuyenNganhModal extends AdminModal {

    componentDidMount() {
        this.onHidden(() => {
            this.tenTiengAnh.value('');
        });
    }

    onShow = (item) => {
        let { ten = '', ma = '', maNganh = '', maLop = '', tenTiengAnh = '' } = item ? item : {};
        this.setState({ ma }, () => {
            this.maNganh.value(maNganh);
            this.nganh.value(maNganh);
            this.ma.value(ma);
            this.ten.value(ten);
            this.maLop.value(maLop);
            this.tenTiengAnh.value(tenTiengAnh);
        });
    }
    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            maNganh: getValue(this.maNganh),
            ten: getValue(this.ten),
            ma: getValue(this.ma),
            maLop: getValue(this.maLop),
            tenTiengAnh: getValue(this.tenTiengAnh),
        };
        this.state.ma ? this.props.updateDtChuyenNganh(this.state.ma, changes, this.hide) : this.props.createDtChuyenNganh(changes, this.hide);
    }
    render = () => {
        let readOnly = this.props.readOnly;
        return this.renderModal({
            readOnly: readOnly,
            title: 'Thông tin chuyên ngành',
            body: <div className='row'>
                <FormTextBox ref={e => this.maNganh = e} className='col-md-6' required label='Mã Ngành' readOnly />
                <FormSelect ref={e => this.nganh = e} className='col-md-6' required label='Ngành' data={SelectAdapter_DtNganhDaoTao} readOnly />
                <FormTextBox ref={e => this.ma = e} className='col-md-12' required label='Mã chuyên ngành' readOnly={this.state.ma ? true : readOnly} />
                <FormTabs className='col-md-12' tabs={[
                    { title: 'Tên chuyên ngành', component: <FormTextBox ref={e => this.ten = e} required readOnly={readOnly} /> },
                    { title: 'Tên chuyên ngành tiếng anh', component: <FormTextBox ref={e => this.tenTiengAnh = e} required readOnly={readOnly} /> }
                ]} />
                <FormTextBox ref={e => this.maLop = e} className='col-md-12' required label='Mã lớp' readOnly={readOnly} />
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDanhSachChuyenNganh: state.daoTao.dtDanhSachChuyenNganh });
const mapActionsToProps = { createDtChuyenNganh, updateDtChuyenNganh };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ChuyenNganhModal);