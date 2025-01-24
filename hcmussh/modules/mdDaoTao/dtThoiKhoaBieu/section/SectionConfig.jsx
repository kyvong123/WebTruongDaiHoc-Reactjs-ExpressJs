import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { SelectAdapter_DmDonViByMonHoc } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
// import { getValidOlogy } from 'modules/mdDaoTao/dtDanhSachChuyenNganh/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormDatePicker, FormSelect, getValue } from 'view/component/AdminPage';
import { getDtThoiKhoaBieuByConfig } from '../redux';

class SectionConfig extends AdminPage {

    componentDidMount() {
        this.setVal();
    }

    handleSubmitConfig = (e) => {
        e.preventDefault();
        try {
            this.setState({ onSaveConfig: true });
            let config = {
                bacDaoTao: getValue(this.bacDaoTao),
                loaiHinhDaoTao: getValue(this.loaiHinhDaoTao),
                nam: getValue(this.nam),
                hocKy: getValue(this.hocKy),
                khoaSinhVien: getValue(this.khoaSinhVien),
                khoaDangKy: getValue(this.khoaDangKy),
                ngayBatDau: getValue(this.ngayBatDau).getTime(),
                coSo: getValue(this.coSo)
            };
            this.props.getDtThoiKhoaBieuByConfig(config, result => {
                if (result && result.dataCanGen && result.dataCanGen.length) {
                    T.notify(`Tìm thấy ${result.dataCanGen.length} học phần!`, 'success');
                    this.props.submitConfig(e, config);
                    this.setState({ onSaveConfig: false });
                } else {
                    T.notify('Không tìm thấy học phần nào theo cấu hình', 'danger');
                    setTimeout(() => this.setState({ onSaveConfig: false }), 250);
                }
            });
        } catch (input) {
            this.setState({ onSaveConfig: false });
            T.notify(`${input.props.label} không được trống!`, 'danger');
            input.focus();
        }
    }

    setVal = () => {
        const cookie = T.updatePage('pageDtThoiKhoaBieu');
        const { filter } = cookie;
        this.bacDaoTao.value('DH');
        if (filter) {
            let { namFilter, loaiHinhDaoTaoFilter, hocKyFilter, khoaSinhVienFilter } = filter;
            this.loaiHinhDaoTao.value(loaiHinhDaoTaoFilter);
            this.nam.value(namFilter);
            this.hocKy.value(hocKyFilter);
            this.khoaSinhVien.value(khoaSinhVienFilter);
        }
    }

    render() {
        let { onSaveConfig } = this.state;
        return (
            <section id='config'>
                <div className='tile'>
                    <div className='tile-title'>
                        <h4>Bước 1: Cấu hình chung.</h4>
                    </div>
                    <div className='tile-body'>
                        <div className='row'>
                            <FormSelect ref={e => this.bacDaoTao = e} className='col-md-12' label='Bậc' data={SelectAdapter_DmSvBacDaoTao} style={{ marginBottom: '0' }} required readOnly />
                            <FormSelect data={SelectAdapter_SchoolYear} ref={e => this.nam = e} className='col-md-3' label='Năm học' required />
                            <FormSelect ref={e => this.hocKy = e} data={[1, 2, 3]} label='Học kỳ' className='col-md-3' required />
                            <FormSelect ref={e => this.khoaSinhVien = e} data={SelectAdapter_DtKhoaDaoTao} label='Khoá sinh viên' className='col-md-3' required />
                            <FormSelect ref={e => this.loaiHinhDaoTao = e} className='col-md-3' label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} required />
                            <FormSelect ref={e => this.khoaDangKy = e} data={SelectAdapter_DmDonViByMonHoc()} label='Đơn vị' className='col-md-12' required />
                            <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayBatDau = e} label='Ngày bắt đầu' required />
                            <FormSelect ref={e => this.coSo = e} data={SelectAdapter_DmCoSo} label='Chọn cơ sở học' className='col-md-6' onChange={this.handleChooseBuilding} />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-outline-primary' type='button' onClick={this.handleSubmitConfig} disabled={onSaveConfig}>
                                {onSaveConfig ? 'Loading' : 'Tiếp theo'} <i className={onSaveConfig ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-lg fa-arrow-right'} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = {
    getDtThoiKhoaBieuByConfig
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionConfig);