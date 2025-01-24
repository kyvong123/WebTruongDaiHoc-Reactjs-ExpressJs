import React from 'react';
import { AdminModal, FormDatePicker, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmBank } from 'modules/mdDanhMuc/dmBank/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';

// const yearDatas = () => {
//     return Array.from({ length: 15 }, (_, i) => {
//         const nam = i + new Date().getFullYear() - 10;
//         return { id: nam, text: `${nam} - ${nam + 1}` };
//     });
// };

const yearDatasTuyenSinh = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
};

// const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

export default class ExcelCanTruModal extends AdminModal {
    state = { isSubmitting: false }

    onShow = () => {
        // this.namHoc.value('');
        // this.hocKy.value('');
        this.namTuyenSinh.value('');
        this.bacDaoTao.value('');
        this.heDaoTao.value('');
        this.khoa.value('');
        this.nganh.value('');
        this.nganHang.value('');
        this.tuNgay.value('');
        this.denNgay.value('');
        this.pivot.value(['namPhatSinh']);
    }

    onSubmit = (e) => {
        e.preventDefault();
        let filter = {
            // namHoc: this.namHoc.value().toString(),
            // hocKy: this.hocKy.value().toString(),
            namTuyenSinh: this.namTuyenSinh.value().toString(),
            bacDaoTao: this.bacDaoTao.value().toString(),
            heDaoTao: this.heDaoTao.value().toString(),
            khoa: this.khoa.value().toString(),
            nganh: this.nganh.value().toString(),
            nganHang: this.nganHang.value().toString(),
            tuNgay: this.tuNgay.value(),
            denNgay: this.denNgay.value(),
            pivot: this.pivot.value().toString(),
        };
        if (filter.tuNgay) filter.tuNgay = filter.tuNgay.setHours(0, 0, 0, 0);
        if (filter.denNgay) filter.denNgay = filter.denNgay?.setHours(23, 59, 59, 999);

        if (filter.tuNgay && filter.denNgay && (filter.tuNgay > filter.denNgay)) {
            T.notify('Thời gian bắt đầu phải sớm hơn thời gian kết thúc!', 'danger');
        }
        else {
            this.setState({ isSubmitting: true }, () => {
                this.props.setup(T.stringify(filter), () => {
                    this.setState({ isSubmitting: false });
                    this.hide();
                });
            });
        }
    }

    render = () => {
        let pivotData = [
            { id: 'nganHang', text: 'Ngân hàng' },
            { id: 'namPhatSinh', text: 'Năm học' },
            { id: 'hocKyPhatSinh', text: 'Học kỳ' },
            { id: 'bacDaoTao', text: 'Bậc đào tạo' },
            { id: 'heDaoTao', text: 'Hệ đào tạo' },
            { id: 'nganhDaoTao', text: 'Ngành đào tạo' },
            { id: 'khoaSinhVien', text: 'Khóa sinh viên' },
        ];
        return this.renderModal({
            title: 'Xuất file EXCEL cấn trừ giao dịch',
            isLoading: this.state.isSubmitting,
            size: 'large',
            submitText: 'Tải xuống',
            body: <div className='row'>
                {/* <FormSelect className='col-md-4' data={yearDatas().reverse()} ref={e => this.namHoc = e} label='Năm học' allowClear multiple />
                <FormSelect className='col-md-4' data={termDatas} ref={e => this.hocKy = e} label='Học kỳ' allowClear multiple /> */}
                <FormSelect className='col-md-4' data={yearDatasTuyenSinh().reverse()} ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' allowClear multiple />
                <FormSelect className='col-md-8' ref={e => this.nganHang = e} data={SelectAdapter_DmBank} label='Ngân hàng' allowClear multiple />
                <FormSelect className='col-md-12' ref={e => this.bacDaoTao = e} data={SelectAdapter_DmSvBacDaoTao} label='Bậc đào tạo' allowClear multiple />
                <FormSelect className='col-md-12' ref={e => this.heDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Loại hình đào tạo' allowClear multiple />
                <FormSelect className='col-md-12' ref={e => this.khoa = e} data={SelectAdapter_DmDonViFaculty_V2} label='Khoa' allowClear multiple />
                <FormSelect className='col-md-12' ref={e => this.nganh = e} data={SelectAdapter_DtNganhDaoTao} label='Ngành' allowClear multiple />
                <FormDatePicker className='col-md-6' ref={e => this.tuNgay = e} label='Từ ngày' />
                <FormDatePicker className='col-md-6' ref={e => this.denNgay = e} label='Đến ngày' />
                <FormSelect className='col-md-12' ref={e => this.pivot = e} data={pivotData} label='Phân cấp thống kê' allowClear multiple />
            </div>
        }
        );
    }
}
