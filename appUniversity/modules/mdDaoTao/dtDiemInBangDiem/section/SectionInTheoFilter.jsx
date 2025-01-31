import React from 'react';
import { FormSelect } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';

class SectionInTheoFilter extends React.Component {
    render() {
        return <div className='tile row'>
            <FormSelect ref={e => this.khoaSV = e} className='col-md-4' data={SelectAdapter_DtKhoaDaoTao} label='Khoá SV' />
            <FormSelect ref={e => this.loaiHinh = e} className='col-md-4' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} label='Loại hình đào tạo' />
            <FormSelect ref={e => this.donVi = e} className='col-md-4' data={[]} label='Khoa/ Bộ môn' />
        </div>;
    }
}

const mapStateToProps = state => ({ system: state.system, dtDiemInBangDiem: state.daoTao.dtDiemInBangDiem });
const mapActionsToProps = {

};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionInTheoFilter);