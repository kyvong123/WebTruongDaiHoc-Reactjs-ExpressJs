import React from 'react';
import { AdminModal, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_FwStudent } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_TcDotDongHocPhi } from 'modules/mdKeHoachTaiChinh/tcDotDongHocPhi/redux';

const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 10);
};

export default class RollBackModal extends AdminModal {
    state = { isSubmitting: false }

    onShow = () => {
    }

    updateDotDong = () => {
        const id = this.dotDong.value() || '';
        id && this.props.getDotDong(id, item => {
            this.setState({ namHoc: item.namHoc, hocKy: item.hocKy }, () => {
                this.namHoc.value(this.state.namHoc || '');
                this.hocKy.value(this.state.hocKy);
            });
        });

        id && this.props.loaiPhi({ id: this.dotDong.value() }, result => {
            this.setState({ listLoaiPhi: result || [], idDotDong: id }, () => {
                if (!this.state.listLoaiPhi.length) {
                    T.notify('Vui lòng chọn ít nhất 1 loại phí để áp dụng', 'danger');
                }
            });
        });
    }

    onChangeValue = () => {
        const filter = {
            idDotDong: this.state.idDotDong,
            namHoc: this.state.namHoc,
            hocKy: this.state.hocKy,
            namTuyenSinh: this.namTuyenSinh.value(),
            bacDaoTao: this.bacDaoTao.value(),
            heDaoTao: this.heDaoTao.value(),
            mssv: this.sinhVien.value()
        };

        filter.idDotDong && this.setState({ isSubmitting: true }, () => {
            this.props.rollBackLength(filter, dsSinhVienLength => {
                this.setState({ dsSinhVienLength }, () => {
                    this.dsSinhVienLength?.value(dsSinhVienLength.toString());
                });
            });
            this.setState({ isSubmitting: false });
        });
    }

    onSubmit = (e) => {
        e.preventDefault();

        const filter = {
            idDotDong: this.state.idDotDong,
            namHoc: this.state.namHoc,
            hocKy: this.state.hocKy,
            namTuyenSinh: this.namTuyenSinh.value(),
            bacDaoTao: this.bacDaoTao.value(),
            heDaoTao: this.heDaoTao.value(),
            mssv: this.sinhVien.value()
        };

        if (!filter.idDotDong) {
            T.notify('Năm tuyển sinh không được trống!', 'danger');
            this.namTuyenSinh.focus();
        }
        if (!filter.namTuyenSinh) {
            T.notify('Năm tuyển sinh không được trống!', 'danger');
            this.namTuyenSinh.focus();
        }
        else {
            this.props.rollBack(filter, () => {
                this.hide();
            });
        }
    }

    render = () => {
        let table = renderTable({
            emptyTable: 'Không có dữ liệu đợt đóng học phí',
            getDataSource: () => this.state.listLoaiPhi || [], stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại phí</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Học phí</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tenLoaiPhi + (item.tenTamThu ? `  (Loại phí đã tạm thu: ${item.tenTamThu})` : '')} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.isHocPhi ? <i className='fa fa-lg fa-check' /> : ''} />
                </tr>
            )
        });

        return this.renderModal({
            title: 'Hoàn tác áp dụng đợt đóng',
            isLoading: this.state.isSubmitting,
            size: 'elarge',
            body: <div className='row'>
                <FormSelect disabled={this.state.isSubmitting} ref={e => this.dotDong = e} data={SelectAdapter_TcDotDongHocPhi} label='Đợt đóng' className='col-md-12' onChange={this.updateDotDong} />
                <FormTextBox className='col-md-4' type='text' ref={e => this.namHoc = e} label='Năm học' readOnly />
                <FormTextBox className='col-md-4' type='text' ref={e => this.hocKy = e} label='Học kỳ' readOnly />
                <div className='form-group col-md-12' style={{ marginBottom: '30px' }}>{table}</div>
                <FormSelect disabled={this.state.isSubmitting} ref={e => this.sinhVien = e} data={SelectAdapter_FwStudent} label='Sinh viên' className='col-md-12' required onChange={this.onChangeValue} />
                <FormSelect disabled={this.state.isSubmitting} ref={e => this.namTuyenSinh = e} data={yearDatas().reverse()} label='Năm tuyển sinh' className='col-md-4' required onChange={this.onChangeValue} />
                <FormSelect disabled={this.state.isSubmitting} ref={e => this.bacDaoTao = e} data={SelectAdapter_DmSvBacDaoTao} label='Bậc đào tạo' className='col-md-4' allowClear onChange={this.onChangeValue} />
                <FormSelect disabled={this.state.isSubmitting} ref={e => this.heDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Loại hình đào tạo' className='col-md-4' allowClear onChange={this.onChangeValue} />
                <FormTextBox readOnly className='col-md-12' style={Number.isInteger(this.state.dsSinhVienLength) ? {} : { display: 'none' }} label='Số sinh viên được áp dụng' ref={e => this.dsSinhVienLength = e} />
            </div>
        }
        );
    }
}