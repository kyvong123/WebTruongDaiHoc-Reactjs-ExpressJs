import React from 'react';
import { connect } from 'react-redux';
import { getPageSvQuyetDinhStudent } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormTabs, AdminModal, FormTextBox, FormSelect, FormDatePicker, FormCheckbox } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
// import { SelectAdapter_SoQuyetDinhVao } from 'modules/mdCongTacSinhVien/svManageQuyetDinh/redux';
// import { SelectAdapter_PhoTruong } from 'modules/mdTccb/qtChucVu/redux';
// import { SelectAdapter_FwStudentsManageForm } from 'modules/mdCongTacSinhVien/fwStudents/redux';
// import { SelectAdapter_CtsvDmFormType } from 'modules/mdCongTacSinhVien/svDmFormType/redux';
import { SelectAdapter_DmTinhTrangSinhVienV2 } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';
// import { SelectAdapter_DtNganhDaoTao } from 'modules/mdCongTacSinhVien/ctsvDtNganhDaoTao/redux';
import { SelectAdapter_SvDtNganh } from '../svDtNganh/redux';
// import { SelectAdapter_DtChuyenNganhDaoTao } from 'modules/mdCongTacSinhVien/ctsvDtChuyenNganh/redux';
import { SelectAdapter_SvDtChuyenNganhDaoTao } from '../svDtChuyenNganh/redux';
// import { SelectAdapter_KhungDaoTaoCtsv } from 'modules/mdCongTacSinhVien/ctsvDtChuongTrinhDaoTao/redux';
import { SelectAdapter_SvDtKhungDaoTao } from '../svDtKhungDaoTao/redux';
// import { SelectAdapter_DtLopCtdt } from 'modules/mdCongTacSinhVien/ctsvDtLop/redux';
import { SelectAdapter_SvDtLop } from '../svDtLop/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';

const quyetDinhRa = '1',
    quyetDinhVao = '2',
    quyetDinhKhac = '3';

class DetailsModal extends AdminModal {
    state = { kieuQuyetDinh: '', customParam: []}
    onShow = (item) => {
        // Ngay ra quyet dinnh, loai qd, so qd, 
        let { maDangKy, soQuyetDinh, tenFormDangKy, kieuQuyetDinh, dataCustom, model, chuyenTrangThaiRa, ngayHetHan, ngayBatDau, thoiGianNghiDuKien, tinhVaoThoiGianDaoTao, chuyenTrangThaiVao, khoaDtMoi, khoaMoi, lopMoi, maNganhCha, nganhMoi, ctdtMoi, lhdtMoi, ngayKy } = item? item : { maDangKy: '', soQuyetDinh: '', tenFormDangKy: '', dataCustom: '', chuyenTrangThaiRa: '', ngayHetHan: '', ngayBatDau: '', model: null, thoiGianNghiDuKien: '', tinhVaoThoiGianDaoTao: '', chuyenTrangThaiVao: '', khoaDtMoi: '', khoaMoi: '', lopMoi: '', maNganhCha: '', nganhMoi: '', ctdtMoi: '', lhdtMoi: '', soQuyetDinhRaTruoc: '', ngayKy: '' };
        model = model ? JSON.parse(model) : [];
        dataCustom = dataCustom ? JSON.parse(dataCustom) : {};
        this.setState({ maDangKy, kieuQuyetDinh, item, customParam: model }, () => {
            model.forEach(item => this[item.ma].value(dataCustom[item.ma] ? dataCustom[item.ma] : ''));
            if (this.state.kieuQuyetDinh == quyetDinhRa) {
                this.chuyenTinhTrang.value(chuyenTrangThaiRa);
                this.ngayHetHan.value(ngayHetHan);
                this.ngayBatDau.value(ngayBatDau);
                this.thoiGianNghiDuKien.value(thoiGianNghiDuKien);
                this.tinhVaoThoiGianDaoTao.value(tinhVaoThoiGianDaoTao ? 1 : 0);
            }
            else if (this.state.kieuQuyetDinh == quyetDinhVao) {
                this.chuyenTinhTrang.value(chuyenTrangThaiVao);
                this.khoaDtMoi.value(khoaDtMoi);
                this.khoaMoi.value(khoaMoi);
                this.bdtMoi.value('DH');
                this.lopMoi.value(lopMoi);
                this.chuyenNganhMoi.value(maNganhCha ? nganhMoi : '');
                this.nganhMoi.value(maNganhCha ? maNganhCha : nganhMoi);
                this.ctdtMoi.value(ctdtMoi);
                this.lhdtMoi.value(lhdtMoi);
            }
            this.soQuyetDinh.value( soQuyetDinh );
            this.loaiQuyetDinh.value( kieuQuyetDinh );
            this.formType.value( tenFormDangKy );
            this.ngayKy.value(ngayKy? ngayKy : Date.now());
        });
        
    }

    componentQuyetDinhRa = () => {
        return (
            <>
                <FormSelect ref={e => this.chuyenTinhTrang = e} label='Chuyển tình trạng' className='col-md-6' data={SelectAdapter_DmTinhTrangSinhVienV2} readOnly />
                <FormTextBox type='number' ref={e => this.thoiGianNghiDuKien = e} label='Thời gian nghỉ dự kiến (hoc kỳ)' className='col-md-6' readOnly required/>
                <FormDatePicker ref={e => this.ngayBatDau = e} label='Ngày bắt đầu nghỉ' className='col-md-4' readOnly required/>
                <FormDatePicker ref={e => this.ngayHetHan = e} label='Ngày hết hạn' className='col-md-4' readOnly required/>
                <FormCheckbox className='col-md-4' ref={e => this.tinhVaoThoiGianDaoTao = e} label='Tính vào thời gian đào tạo' isSwitch={true} readOnly/>
            </>
        );
    }

    componentQuyetDinhVao = () => {
        return (
            <>
                <FormTextBox ref={e => this.bdtMoi = e} label='Bậc đào tạo mới' className='col-md-4' readOnly={true} />
                <FormSelect minimumResultsForSearch={-1} ref={e => this.lhdtMoi = e} label='Hệ đào tạo mới' className='col-md-4' data={SelectAdapter_DmSvLoaiHinhDaoTao} readOnly onChange={this.changeLhdt} />
                <FormSelect minimumResultsForSearch={-1} type='year' ref={e => this.khoaDtMoi = e} label='Khóa đào tạo mới' className='col-md-4' data={Array.from({ length : 4 }, (_,i) => new Date().getFullYear() - i)} readOnly required onChange={this.changeKhoaDaoTao}/>
                <FormSelect ref={e => this.chuyenTinhTrang = e} label='Chuyển tình trạng' className='col-md-4' data={SelectAdapter_DmTinhTrangSinhVienV2} readOnly />
                <FormSelect ref={e => this.ctdtMoi = e} label='Chương trình đào tạo mới' data={SelectAdapter_SvDtKhungDaoTao} onChange={this.changeCtdtMoi} className='col-md-4' readOnly required/>
                <FormSelect minimumResultsForSearch={-1} ref={e => this.lopMoi = e} data={SelectAdapter_SvDtLop} label='Lớp mới' className='col-md-4' readOnly required />                
                <FormSelect ref={e => this.khoaMoi = e} label='Khoa đào tạo mới' className='col-md-12' data={SelectAdapter_DmDonViFaculty_V2} readOnly />
                <FormSelect ref={e => this.nganhMoi = e} label='Ngành mới' data={SelectAdapter_SvDtNganh} className='col-md-4' onChange={this.changeNganhMoi}  readOnly/>
                <FormSelect ref={e => this.chuyenNganhMoi = e} label='Chuyên ngành mới' data={SelectAdapter_SvDtChuyenNganhDaoTao} className='col-md-4' readOnly />
            </>
        );
    }

    render = () => {
        const { kieuQuyetDinh = '' } = this.state;
        return this.renderModal({
            title: 'Chi tiết quyết định',
            size: 'large',
            body: <>
                <div className='row'>
                    <FormTextBox ref={e => this.soQuyetDinh = e} className='col-md-12' label='Số quyết định'  required readOnly/>
                    <FormSelect ref={e => this.loaiQuyetDinh = e} label='Loại quyết định' className='col-md-6' data={[{ id: 1, text: 'Quyết định ra' }, { id: 2, text: 'Quyết định vào' }, { id: 3, text: 'Quyết định khác' }]} readOnly />
                    <FormTextBox ref={e => this.formType = e} label='Kiểu quyết định' className='col-md-6' readOnly required />
                </div>
                <div className='row'>
                        {this.state.customParam.length ? this.state.customParam.map((item, index) => {
                            if (item.type == '2') {
                                return (<FormSelect key={index} label={item.tenBien} ref={e => this[item.ma] = e} data={item.data.map(param => ({ id: param.text, text: param.text }))} className='form-group col-md-3' required readOnly />);
                            }
                            else {
                                return (<FormTextBox key={index} type='text' label={item.tenBien} ref={e => this[item.ma] = e} className='form-group col-md-3' required readOnly />);
                            }
                        }) : null}
                    </div>
                <div className='row'>
                    {kieuQuyetDinh == quyetDinhRa && this.componentQuyetDinhRa()}
                    {kieuQuyetDinh == quyetDinhVao && this.componentQuyetDinhVao()}
                </div>
                <div className='row'>
                    <FormDatePicker type='date-mask' ref={e => this.ngayKy = e} label='Ngày ký' className='col-md-6' readOnly />
                </div>
            </>,
            isShowSubmit: false
        });
    }
}

class SinhVienManageFormPage extends AdminPage {
    state = { customParam: [] }
    componentDidMount() {
        T.ready('user/lich-su-quyet-dinh', () => {
            this.props.getPageSvQuyetDinhStudent(1, 50, () => {
            });
        });
    }

    componentQuyetDinhTab = (kieuQuyetDinh) => {
        let list = (this.props.svQuyetDinh?.page?.list || []);
        if (kieuQuyetDinh != 0){
            list = list.filter( item => item.kieuQuyetDinh == kieuQuyetDinh);
        }
        return renderTable({
            getDataSource: () => list,
            style: { display: list ? '' : 'none' },
            stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quyết định</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Loại quyết định</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Ngày ký</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.maDangKy ? item.maDangKy : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.soQuyetDinh} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenFormDangKy}/>
                    <TableCell type='date' style={{ whiteSpace: 'nowrap' }} content={item.ngayKy} dateFormat='dd/mm/yyyy' />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                        <Tooltip title='Chi tiết' arrow>
                            <button className='btn btn-info' onClick={ e => {e.preventDefault(); this.detailsModal.show(item); }}>
                                <i className='fa fa-lg fa-info-circle' />
                            </button>
                        </Tooltip>
                    } />


                </tr>
            )
        });
    }

    componentKhenThuong = () => {
        let list = this.props.svQuyetDinh?.khenThuongPage?.list || [];
        return renderTable({
            getDataSource: () => list,
            stickyHead: true,
            renderHead: () => (
                <tr>
                    {/* <th style={{ width: 'auto', textAlign: 'center' }}>#</th> */}
                    <th style={{ width: 'auto', textAlign: 'center' }}>STT</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quyết định</th>
                    <th style={{ width: '80%', whiteSpace: 'nowrap' }}>Thành tích</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Năm đạt được</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày ký</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    {/* <TableCell type='number' content={pageSize * pageNumber + index + 1 - pageSize} /> */}
                    <TableCell type='text' content={index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.soQuyetDinh} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenThanhTich} />
                    <TableCell type='text' contentClassName='multiple-lines-3' content={item.namHoc} />
                    <TableCell type='date' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayKy != null && (item.ngayKy)} dateFormat='dd/mm/yyyy' />
                </tr>
            ),
        }) ;
    }
    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition } = this.props.svManageForm && this.props.svManageForm.page ? this.props.svManageForm.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {} };
        return this.renderPage({
            title: 'Lịch sử quyết định',
            icon: 'fa fa-file-text-o',
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Lịch sử quyết định'
            ],
            content: <>
                <FormTabs
                contentClassName='tile'
                tabs={[
                    {id: 0, title: 'Tất cả', component: this.componentQuyetDinhTab(0)},
                    {id: 1, title: 'Quyết định ra', component: this.componentQuyetDinhTab(quyetDinhRa)},
                    {id: 2, title: 'Quyết định vào', component: this.componentQuyetDinhTab(quyetDinhVao)},
                    {id: 3, title: 'Quyết định khen thưởng', component: this.componentKhenThuong()},
                    {id: 4, title: 'Quyết định khác', component: this.componentQuyetDinhTab(quyetDinhKhac)},
                ]}
                />
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getPageSvQuyetDinhStudent}/>
                <DetailsModal ref={ e => this.detailsModal = e }/>
                {/* <div className='tile'>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', marginBottom: '10px' }}>
                        <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getSvManageFormPage} pageRange={3} />
                        <ReasonModal ref={e => this.reasonModal = e} readOnly />
                    </div>
                    {table}
                </div> */}
            </>,
            backRoute: '/user'
        });
    }
}

const mapStateToProps = state => ({ system: state.system, svQuyetDinh: state.student.svQuyetDinh });
const mapActionsToProps = { getPageSvQuyetDinhStudent };
export default connect(mapStateToProps, mapActionsToProps)(SinhVienManageFormPage);