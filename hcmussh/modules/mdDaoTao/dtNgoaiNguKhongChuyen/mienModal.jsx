import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, getValue } from 'view/component/AdminPage';
import { SelectAdapter_DtChuyenNganhFilter } from 'modules/mdDaoTao/dtChuyenNganh/redux';
import { SelectAdapter_DtNganhDaoTaoFilterPage } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { createMienDtNgoaiNguKC, updateMienDtNgoaiNguKC } from './redux';

class MienModal extends AdminModal {

    handleNganh = (value) => {
        this.setState({ maNganh: value.id }, () => {
            this.maChuyenNganh.value('');
            this.maChuyenNganh.focus();
        });
    }

    onShow = (item) => {
        const { id, maNganh, maChuyenNganh } = item || { id: null, maNganh: null, maChuyenNganh: null };
        this.setState({ id, maNganh }, () => {
            this.maNganh.value(maNganh);
            this.maChuyenNganh.value(maChuyenNganh);
        });
    }

    onSubmit = () => {
        T.confirm('Cảnh báo', 'Bạn có chắc muốn xét miễn ngoại ngữ không chuyên không?', true, isConfirm => {
            if (isConfirm) {
                const data = {
                    maNganh: getValue(this.maNganh),
                    maChuyenNganh: getValue(this.maChuyenNganh),
                    khoaSinhVien: this.props.khoaSinhVien,
                    loaiHinhDaoTao: this.props.loaiHinhDaoTao,
                };
                T.alert('Đang xét miễn ngoại ngữ. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                if (this.state.id) this.props.updateMienDtNgoaiNguKC(this.state.id, data, () => {
                    this.hide();
                    this.props.getData();
                });
                else this.props.createMienDtNgoaiNguKC(data, () => {
                    this.hide();
                    this.props.getData();
                });
            }
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Xét miễn ngoại ngữ',
            body: <div className='row'>
                <FormSelect ref={e => this.maNganh = e} data={SelectAdapter_DtNganhDaoTaoFilterPage} label='Ngành' className='col-md-12' onChange={this.handleNganh} required />
                <FormSelect ref={e => this.maChuyenNganh = e} data={SelectAdapter_DtChuyenNganhFilter(this.state.maNganh)} label='Chuyên ngành' className='col-md-12' allowClear />
            </div>
        });
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createMienDtNgoaiNguKC, updateMienDtNgoaiNguKC };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(MienModal);