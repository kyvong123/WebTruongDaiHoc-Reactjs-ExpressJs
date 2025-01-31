
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, renderTable, TableCell, FormSelect, FormTextBox, FormCheckbox, getValue } from 'view/component/AdminPage';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';

const yearDatas = () => {
    return Array.from({ length: 13 }, (_, i) => i + new Date().getFullYear() - 10);
};

class CauHinhThongTinModal extends AdminModal {
    state = { isLoading: true, isSubmitting: false };

    onShow = (mssv) => {
        const dataSinhVien = this.props?.tcDanhSachSinhVien?.infoSinhVien;
        this.setState({ mssv, cauHinh: dataSinhVien?.cauHinhThongTin, baoLuu: dataSinhVien?.thongTinBaoLuu, infoSv: dataSinhVien?.infoSinhVien }, () => {
            this.parseData();
        });
    }

    parseData = () => {
        this.setState({ isLoading: false }, () => {
            this.state.cauHinh.map(item => {
                this[`baoLuu_${item.namHoc}_${item.hocKy}`].value(false);
                ['bacDaoTao', 'heDaoTao', 'nganhDaoTao', 'khoaSinhVien'].map(key => this[`${key}_${item.namHoc}_${item.hocKy}`].value(item[key] || ''));
            });
            this.state.baoLuu.map(item => this[`baoLuu_${item.namHoc}_${item.hocKy}`].value(!!item.mssv || false));
            this.mssv.value(this.state.infoSv.mssv);
            this.hoVaTen.value(`${this.state.infoSv.ho} ${this.state.infoSv.ten}`.trim());
            this.namTuyenSinh.value(this.state.infoSv.namTuyenSinh);
            this.bacDaoTao.value(this.state.infoSv.bacDaoTao);
            this.heDaoTao.value(this.state.infoSv.loaiHinhDaoTao);
            this.nganhDaoTao.value(this.state.infoSv.maNganh);
            this.khoaSinhVien.value(this.state.infoSv.khoaSinhVien);
        });
    }

    onSubmit = () => {
        let cauHinh = this.state.cauHinh.map(item => ({
            namHoc: item.namHoc,
            hocKy: item.hocKy,
            bacDaoTao: getValue(this[`bacDaoTao_${item.namHoc}_${item.hocKy}`]),
            heDaoTao: getValue(this[`heDaoTao_${item.namHoc}_${item.hocKy}`]),
            nganhDaoTao: getValue(this[`nganhDaoTao_${item.namHoc}_${item.hocKy}`]),
            khoaSinhVien: getValue(this[`khoaSinhVien_${item.namHoc}_${item.hocKy}`]),
            baoLuu: Number(getValue(this[`baoLuu_${item.namHoc}_${item.hocKy}`]) || 0),
        }));

        this.setState({ isSubmitting: true }, () => {
            this.props.updateCauHinh(this.state.mssv, cauHinh, getValue(this.khoaSinhVien), () => {
                this.props.reload(() => {
                    this.setState({ isSubmitting: false });
                    T.notify('Cập nhật cấu hình thông tin sinh viên thành công!', 'success');
                    this.hide();
                });
            });
        });
    }

    render = () => {
        const cauHinh = renderTable({
            header: 'thead-light',
            emptyTable: 'Không có dữ liệu đợt đóng học phí',
            getDataSource: () => this.state.cauHinh?.sort((a, b) => b.namHoc - a.namHoc || b.hocKy - a.hocKy) || [],
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Năm học</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Học kỳ</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Bậc đào tạo</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Hệ đào tạo</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngành đào tạo</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Khóa sinh viên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Bảo lưu</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`${item.namHoc}\n-\n${item.namHoc + 1}`} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`HK${item.hocKy}`} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={
                        <FormSelect ref={e => this[`bacDaoTao_${item.namHoc}_${item.hocKy}`] = e} data={SelectAdapter_DmSvBacDaoTao} className='col-md-12' style={{ margin: 0, padding: 0 }} required />
                    } />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={
                        <FormSelect ref={e => this[`heDaoTao_${item.namHoc}_${item.hocKy}`] = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} className='col-md-12' style={{ margin: 0, padding: 0 }} required />
                    } />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={
                        <FormSelect ref={e => this[`nganhDaoTao_${item.namHoc}_${item.hocKy}`] = e} data={SelectAdapter_DtNganhDaoTao} className='col-md-12' style={{ margin: 0, padding: 0 }} required />
                    } />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={
                        <FormSelect ref={e => this[`khoaSinhVien_${item.namHoc}_${item.hocKy}`] = e} data={yearDatas()?.reverse() || []} className='col-md-12' style={{ margin: 0, padding: 0 }} required />
                    } />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={
                        <FormCheckbox ref={e => this[`baoLuu_${item.namHoc}_${item.hocKy}`] = e} className='col-md-12' style={{ margin: 0, padding: 0 }} isSwitch required />
                    } />
                </tr>
            )
        });

        return this.renderModal({
            title: 'Cập nhật cấu hình thông tin định phí',
            size: 'elarge',
            isLoading: this.state.isSubmitting,
            body: <div className='row'>
                {this.state.isLoading ?
                    (<div className='overlay' style={{ minHeight: '120px' }}>
                        <div className='m-loader mr-4'>
                            <svg className='m-circular' viewBox='25 25 50 50'>
                                <circle className='path' cx='50' cy='50' r='20' fill='none' strokeWidth='4' strokeMiterlimit='10' />
                            </svg>
                        </div>
                        <h3 className='l-text'>Đang tải</h3>
                    </div>)
                    :
                    <>
                        <div className='col-md-12'>
                            <div className='row'>
                                <FormTextBox ref={e => this.mssv = e} label='MSSV' className='col-md-3' readOnly />
                                <FormTextBox ref={e => this.hoVaTen = e} label='Họ và tên' className='col-md-3' readOnly />
                                <FormTextBox ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' className='col-md-3' readOnly />
                                <div className='col-md-3 d-flex'>
                                    <span className="">{'Khóa sinh viên: '}</span>
                                    <FormSelect className="flex-grow-1" ref={e => this.khoaSinhVien = e} data={yearDatas()?.reverse() || []} placeholder='Khóa sinh viên' style={{ margin: '0 20px', padding: 0 }} required />
                                </div>
                                <FormSelect ref={e => this.bacDaoTao = e} data={SelectAdapter_DmSvBacDaoTao} className='col-md-3' label='Bậc đào tạo' readOnly />
                                <FormSelect ref={e => this.heDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} className='col-md-3' label='Hệ đào tạo' readOnly />
                                <FormSelect ref={e => this.nganhDaoTao = e} data={SelectAdapter_DtNganhDaoTao} className='col-md-6' label='Ngành đào tạo' readOnly />
                            </div>
                        </div>
                        <h4 className='col-md-12' style={{ marginTop: '20px' }}>Thông tin định phí theo học kỳ</h4>
                        <div className='col-md-12'> {cauHinh} </div>
                    </>
                }
            </div >
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tcDanhSachSinhVien: state.finance.tcDanhSachSinhVien });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(CauHinhThongTinModal);