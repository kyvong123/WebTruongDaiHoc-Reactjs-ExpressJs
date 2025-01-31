import React from 'react';

import { SelectAdapter_DmBank } from 'modules/mdDanhMuc/dmBank/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmLoaiSinhVienV2 } from 'modules/mdDanhMuc/dmLoaiSinhVien/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_TcLoaiPhi } from 'modules/mdKeHoachTaiChinh/tcLoaiPhi/redux';
import { AdminModal, FormSelect, FormDatePicker } from 'view/component/AdminPage';


const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
};

const getTimeFilter = (tuNgay, denNgay) => {
    if (tuNgay) {
        tuNgay = tuNgay.setHours(0, 0, 0, 0);
    }
    if (denNgay) {
        denNgay = denNgay.setHours(23, 59, 59, 999);
    }
    return { tuNgay, denNgay };
};
export default class TachLoaiPhi extends AdminModal {
    onShow = () => {
        this.tuNgay.value('');
        this.namHoc.value('');
        this.denNgay.value('');
        this.hocKy.value('');
        this.bacDaoTao?.value('');
        this.loaiHinhDaoTao?.value('');
        this.khoa?.value('');
        this.listNganh?.value('');
        this.loaiSinhVien?.value('');
        this.tinhTrangHoaDon?.value('');
        this.nhapHoc?.value('');
        this.daDong?.value('');
        this.hoanTra?.value('');
        this.listLoaiPhi?.value('');
        this.bank?.value('');
    }
    onSubmit = (e) => {

        e.preventDefault();
        const data = {
            filter: {
                ...getTimeFilter(this.tuNgay.value() || null, this.denNgay.value() || null),
                namHoc: this.namHoc?.value(),
                hocKy: this.hocKy?.value(),
                listBacDaoTao: this.bacDaoTao?.value().toString(),
                listLoaiHinhDaoTao: this.loaiHinhDaoTao?.value().toString(),
                listKhoa: this.khoa?.value().toString(),
                listNganh: this.listNganh?.value().toString(),
                nhapHoc: this.nhapHoc?.value(),
                daDong: this.daDong?.value().toString(),
                hoanTra: this.hoanTra?.value(),
                loaiSinhVien: this.loaiSinhVien?.value(),
                tinhTrangHoaDon: this.tinhTrangHoaDon?.value(),
                bank: this.bank?.value().toString()
            },
            listLoaiPhi: this.listLoaiPhi?.value(),
        };
        if (data.listLoaiPhi.length == 0) {
            T.notify('Không được để trống loại phí', 'danger');
        } else {
            T.handleDownload(`/api/khtc/tach-loai-phi/download-excel?data=${T.stringify(data)}`, 'Tach_Loai_Phi_Excel.xlsx');
            this.hide();
        }

    }
    render = () => {

        return this.renderModal({
            title: 'Chọn loại phí ưu tiên',
            submitText: 'Tải xuống',
            isLoading: this.state.isLoading,
            size: 'elarge',
            body: <div className='row'>
                <FormSelect className='col-md-6' ref={e => this.namHoc = e} data={yearDatas()} label='Năm học' />
                <FormSelect className='col-md-6' ref={e => this.hocKy = e} data={SelectAdapter_DtDmHocKy} label='Học kỳ' />
                <FormDatePicker className='col-md-6' ref={e => this.tuNgay = e} label='Từ ngày' />
                <FormDatePicker className='col-md-6' ref={e => this.denNgay = e} label='Đến ngày' />
                <FormSelect className='col-md-6' ref={e => this.bacDaoTao = e} data={SelectAdapter_DmSvBacDaoTao} label='Bậc đào tạo' allowClear multiple />
                <FormSelect className='col-md-6' ref={e => this.loaiHinhDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Loại hình đào tạo' allowClear multiple />
                <FormSelect ref={e => this.khoa = e} label='Khoa' data={SelectAdapter_DmDonViFaculty_V2} className='col-md-6' allowClear multiple />
                <FormSelect ref={e => this.listNganh = e} label='Ngành' data={SelectAdapter_DtNganhDaoTao} className='col-md-6' allowClear multiple />
                <FormSelect ref={e => this.daDong = e} label='Tình trạng học phí' data={[{ id: 0, text: 'Đã đóng đủ' }, { id: 1, text: 'Đóng chưa đủ' }, { id: 2, text: 'Chưa đóng' }]} className='col-md-4' allowClear multiple />
                <FormSelect ref={e => this.nhapHoc = e} label='Tình trạng nhập học' data={[{ id: 0, text: 'Đã nhập học' }, { id: 1, text: 'Chưa nhập học' }]} className='col-md-4' allowClear />
                <FormSelect ref={e => this.loaiSinhVien = e} label='Loại Sinh Viên' data={SelectAdapter_DmLoaiSinhVienV2} className='col-md-4' allowClear />
                <FormSelect ref={e => this.tinhTrangHoaDon = e} label='Tình trạng hóa đơn' data={[{ id: 0, text: 'Chưa xuất' }, { id: 1, text: 'Đã xuất' }]} className='col-md-6' allowClear />
                <FormSelect ref={e => this.hoanTra = e} label='Hoàn trả' data={[{ id: 0, text: 'Chưa hoàn trả' }, { id: 1, text: 'Đã hoàn trả' }]} className='col-md-6' allowClear />
                <FormSelect ref={e => this.bank = e} label='Ngân Hàng' data={SelectAdapter_DmBank} className='col-md-6' allowClear multiple />
                <FormSelect className='col-md-12' ref={e => this.listLoaiPhi = e} data={SelectAdapter_TcLoaiPhi} label='Loại phí' allowClear multiple required />
            </div>
        });
    }
}