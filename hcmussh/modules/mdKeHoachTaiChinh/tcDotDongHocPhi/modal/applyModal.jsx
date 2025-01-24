import React from 'react';
import { AdminModal, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_FwStudent } from 'modules/mdCongTacSinhVien/fwStudents/redux';

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
};

export default class ApplyModal extends AdminModal {
    state = { isSubmitting: false }

    onShow = (item) => {
        let { id, ten, namHoc, hocKy } = item;
        this.props.loaiPhi({ id }, result => {
            this.setState({ listLoaiPhi: result || [], idDotDong: id, tenDotDong: ten, namHoc, hocKy, dsSinhVienLength: '', dsSinhVienHocPhiLength: '' }, () => {
                if (!this.state.listLoaiPhi.length) {
                    T.notify('Vui lòng chọn ít nhất 1 loại phí để áp dụng', 'danger');
                }
            });
        });
        this.namHoc.value(namHoc);
        this.hocKy.value(hocKy);
        this.namTuyenSinh.value('');
        this.mssv.value('');
        this.bacDaoTao.value('');
        this.heDaoTao.value('');
        this.nganhDaoTao.value('');
        this.dsSinhVienLength.value('');
        this.dsSinhVienHocPhiLength.value('');
    }

    onChangeValue = () => {
        const filter = {
            namHoc: this.state.namHoc,
            hocKy: this.state.hocKy,
            namTuyenSinh: this.namTuyenSinh.value(),
            mssv: this.mssv.value(),
            bacDaoTao: this.bacDaoTao.value(),
            heDaoTao: this.heDaoTao.value(),
            nganhDaoTao: this.nganhDaoTao.value().toString()
        };

        if (filter.namHoc && filter.hocKy && filter.namTuyenSinh && this.state.listLoaiPhi?.length) {
            this.setState({ isSubmitting: true }, () => {
                this.props.getLength(filter, dsSinhVienLength => {
                    this.setState({ dsSinhVienLength }, () => {
                        this.dsSinhVienLength?.value(dsSinhVienLength.toString());
                    });
                });
                this.props.getLengthHocPhi(this.state.listLoaiPhi, filter, dsSinhVienHocPhiLength => {
                    this.setState({ dsSinhVienHocPhiLength }, () => {
                        this.dsSinhVienHocPhiLength?.value(dsSinhVienHocPhiLength.toString());
                        this.setState({ isSubmitting: false });
                    });
                });
            });
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        let listLoaiPhi = this.state.listLoaiPhi;
        listLoaiPhi.forEach(item => item['soTien'] = this[`soTien_${item.loaiPhi}`].value() || '');

        const filter = {
            namHoc: this.state.namHoc,
            hocKy: this.state.hocKy,
            namTuyenSinh: this.namTuyenSinh.value(),
            mssv: this.mssv.value(),
            bacDaoTao: this.bacDaoTao.value(),
            heDaoTao: this.heDaoTao.value(),
            nganhDaoTao: this.nganhDaoTao.value().toString()
        };

        if (!filter.namTuyenSinh) {
            T.notify('Năm tuyển sinh không được trống!', 'danger');
        }
        else if (listLoaiPhi.length <= 0) {
            T.notify('Vui lòng chọn ít nhất 1 loại phí để áp dụng', 'danger');
        }
        else {
            for (let item of listLoaiPhi) {
                if (item.isHocPhi == 1 && item.soTien) {
                    T.notify('Không thể cài đặt số tiền cho học phí!', 'danger');
                    return;
                }
                if (item.isHocPhi == 0 && !item.soTien) {
                    T.notify('Thiếu dữ liệu số tiền!', 'danger');
                    return;
                }
            }
            if (Number.isInteger(this.state.dsSinhVienHocPhiLength) && this.state.dsSinhVienHocPhiLength == 0) {
                T.notify('Không có sinh viên nào được áp dụng!', 'danger');
            }
            else {
                this.setState({ isSubmitting: true }, () => {
                    this.props.applyDotDong(listLoaiPhi, filter, () => {
                        listLoaiPhi.forEach(item => {
                            this[`soTien_${item.loaiPhi}`].value('');
                        });
                        this.setState({ isSubmitting: false });
                        this.hide();
                    });

                });
            }
        }

    }

    render = () => {
        let table = renderTable({
            emptyTable: 'Không có dữ liệu đợt đóng học phí',
            getDataSource: () => this.state.listLoaiPhi, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>#</th>
                    <th style={{ width: '80%', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại phí</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Học phí</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiền (VNĐ)</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tenLoaiPhi + (item.tenTamThu ? `  (Loại phí đã tạm thu: ${item.tenTamThu})` : '')} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.isHocPhi ? <i className='fa fa-lg fa-check' /> : ''} />
                    <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }}
                        content={<FormTextBox disabled={this.state.isSubmitting} style={{ margin: 0, textAlign: 'center', whiteSpace: 'nowrap' }} type='number' ref={e => this[`soTien_${item.loaiPhi}`] = e} />}
                    />
                </tr>
            )
        });

        return this.renderModal({
            title: `Áp dụng loại phí cho ${this.state.tenDotDong}`,
            isLoading: this.state.isSubmitting,
            size: 'elarge',
            body: <div className='row'>
                <FormTextBox className='col-md-4' type='text' ref={e => this.namHoc = e} label='Năm học' readOnly />
                <FormTextBox className='col-md-4' type='text' ref={e => this.hocKy = e} label='Học kỳ' readOnly />
                <div className='form-group col-md-12' style={{ marginBottom: '30px' }}>{table}</div>
                <FormSelect disabled={this.state.isSubmitting} ref={e => this.mssv = e} data={SelectAdapter_FwStudent} label='Sinh viên' className='col-md-12' required onChange={this.onChangeValue} />
                <FormSelect disabled={this.state.isSubmitting} ref={e => this.namTuyenSinh = e} data={yearDatas().reverse()} label='Năm tuyển sinh' className='col-md-4' required onChange={this.onChangeValue} />
                <FormSelect disabled={this.state.isSubmitting} ref={e => this.bacDaoTao = e} data={SelectAdapter_DmSvBacDaoTao} label='Bậc đào tạo' className='col-md-4' allowClear onChange={this.onChangeValue} />
                <FormSelect disabled={this.state.isSubmitting} ref={e => this.heDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Loại hình đào tạo' className='col-md-4' allowClear onChange={this.onChangeValue} />
                <FormSelect disabled={this.state.isSubmitting} ref={e => this.nganhDaoTao = e} data={SelectAdapter_DtNganhDaoTao} label='Ngành đào tạo' className='col-md-12' allowClear multiple onChange={this.onChangeValue} />
                <FormTextBox readOnly className='col-md-12' style={Number.isInteger(this.state.dsSinhVienLength) ? {} : { display: 'none' }} label='Số sinh viên được áp dụng' ref={e => this.dsSinhVienLength = e} />
                <FormTextBox readOnly className='col-md-12' style={Number.isInteger(this.state.dsSinhVienHocPhiLength) ? {} : { display: 'none' }} label='Số sinh viên được áp dụng học phí' ref={e => this.dsSinhVienHocPhiLength = e} />
            </div>
        }
        );
    }
}