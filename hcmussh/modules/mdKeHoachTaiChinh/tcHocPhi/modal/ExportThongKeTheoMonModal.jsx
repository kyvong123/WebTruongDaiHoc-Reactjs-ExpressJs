import React from 'react';
import { AdminModal, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DmMonHocAll } from 'modules/mdDaoTao/dmMonHoc/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';

const yearDatasNamHoc = () => {
    return Array.from({ length: 15 }, (_, i) => {
        const nam = i + new Date().getFullYear() - 10;
        return { id: nam, text: `${nam} - ${nam + 1}` };
    });
};

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

export default class ExportThongKeTongHopModal extends AdminModal {
    state = { isSubmitting: false }

    onShow = () => {
        this.namHoc.value('');
        this.hocKy.value('');
        this.khoaSinhVien.value('');
        this.bacDaoTao.value('');
        this.loaiHinhDaoTao.value('');
        this.khoa.value('');
        this.nganh.value('');
        this.monHoc.value('');
    }

    onSubmit = (e) => {
        e.preventDefault();

        const filter = {
            namHoc: this.namHoc?.value(),
            hocKy: this.hocKy?.value(),
            khoaSinhVien: this.khoaSinhVien?.value(),
            listBacDaoTao: this.bacDaoTao?.value().toString(),
            listLoaiHinhDaoTao: this.loaiHinhDaoTao?.value().toString(),
            listKhoa: this.khoa?.value().toString(),
            listNganh: this.nganh?.value().toString(),
            listMonHoc: this.monHoc?.value().toString(),
        };

        filter && T.handleDownload(`/api/khtc/thong-ke-theo-mon?filter=${T.stringify(filter)}`, 'TEST_FAIL.xlsx');
    }

    render = () => {
        return this.renderModal({
            title: 'Xuất thống kê theo môn học',
            size: 'elarge',
            isLoading: this.state.isSubmitting,
            submitText: 'Tải xuống',
            body: <div className='row'>
                <FormSelect className='col-md-4' ref={e => this.namHoc = e} data={yearDatasNamHoc()?.reverse()} label='Năm học' allowClear />
                <FormSelect className='col-md-4' ref={e => this.hocKy = e} data={termDatas} label='Học kỳ' allowClear />
                <FormSelect className='col-md-4' ref={e => this.khoaSinhVien = e} data={yearDatas()?.reverse()} label='Khóa sinh viên' allowClear />
                <FormSelect className='col-md-4' ref={e => this.bacDaoTao = e} data={SelectAdapter_DmSvBacDaoTao} label='Bậc đào tạo' allowClear multiple />
                <FormSelect className='col-md-8' ref={e => this.loaiHinhDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Loại hình đào tạo' allowClear multiple />
                <FormSelect className='col-md-12' ref={e => this.khoa = e} label='Khoa' data={SelectAdapter_DmDonViFaculty_V2} allowClear multiple />
                <FormSelect className='col-md-12' ref={e => this.nganh = e} label='Ngành' data={SelectAdapter_DtNganhDaoTao} allowClear multiple />
                <FormSelect className='col-md-12' ref={e => this.monHoc = e} label='Môn học' data={SelectAdapter_DmMonHocAll()} allowClear multiple />
            </div>
        });
    }
}


