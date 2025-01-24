import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormTextBox, renderTable, TableHead, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { EaseDateRangePicker } from 'view/component/EaseDatePicker';
import { AdminSelect } from 'view/component/AdminSelect';
import { getShcdDiemDanh, downloadExcelShcdDiemDanh, updateShcdDiemDanh, updateShcdDiemDanhDanhSach } from '../redux/shcdDiemDanhRedux';
import FileBox from 'view/component/FileBox';
import T from 'view/js/common';
// import { Tooltip } from '@mui/material';

export class ImportModal extends AdminModal {
    state = { result: null }

    onShow = (lichId, maNganh) => {
        this.setState({ result: null, lichId, maNganh });
        this.fileBox.setData('uploadDsSinhVienDiemDanh:' + lichId);
    }

    render = () => {
        const { lichId, maNganh } = this.state;
        return this.renderModal({
            title: 'Tải lên danh sách điểm danh',
            size: 'large',
            showCloseButton: false,
            body: <div className='row'>
                <>
                    <div className='col-md-12'><p className='pt-3'>Tải lên danh sách điểm danh bằng tệp Excel(.xlsx).Tải tệp tin mẫu tại <a href='' onClick={e => e.preventDefault() || T.download(`/api/ctsv/shcd/diem-danh/download-template?data=${JSON.stringify({ lichId, maNganh })}`)}>đây</a> hoặc danh sách điểm danh hiện tại tại <a href='' onClick={e => e.preventDefault() || this.props.onDownloadDsDiemDanh()}>đây</a>
                    </p> <p className='text-danger mb-3' >Lưu ý: Mọi giá trị trùng lặp sẽ được cập nhật theo dữ liệu mới nhất.</p> </div>
                    <FileBox className='col-md-12' postUrl='/user/upload' ref={e => this.fileBox = e} uploadType='uploadDsSinhVienDiemDanh' userData={'uploadDsSinhVienDiemDanh'} success={(res) => { this.props.onUploadSuccess(res); this.hide(); }} accept='.xlsx' />
                </>
            </div>,
            buttons:
                <button type='button' className='btn btn-secondary' onClick={e => e.preventDefault() || this.hide()}>
                    <i className='fa fa-fw fa-lg fa-times' />Đóng
                </button>
        });
    }
}


class ShcdDanhSachDiemDanhModal extends AdminModal {
    state = { data: [{}], filter: {}, edit: [] }
    onShow = (item) => {
        const { heDaoTao, hoTenGiangVien, lichId, maNganh, phong, soLuong, tenNganh, tenNoiDung, timeEnd, timeStart } = item;
        this.props.getShcdDiemDanh({ lichId, maNganh, filter: this.state.filter }, (data) => {
            this.setState({ data, lichId, maNganh }, () => { this.soLuongVao.value(data.filter(item => (item.thoiGianVao || item.thoiGianRa) ? item : '').length || '0'); });
        });
        this.ten.value(tenNoiDung);
        this.thoiGian.value(timeStart, timeEnd);
        this.heDaoTao.value(heDaoTao.split(','));
        this.phong.value(phong);
        this.soLuong.value(soLuong);
        this.nganh.value(tenNganh);
        this.giangVien.value(hoTenGiangVien);
    }

    onKeySearch = (key) => {
        const { lichId, maNganh } = this.state;
        this.setState({ filter: { ...this.state.filter, [key.split(':')[0]]: key.split(':')[1] } }, () => {
            this.props.getShcdDiemDanh({ lichId, maNganh, filter: this.state.filter }, (data) => this.setState({ data }));
        });
    }

    handleDanhGia = (value, item) => {
        let { data, edit } = this.state;
        let index = data.map(item => item.mssv).indexOf(item.mssv),
            editIndex = edit.map(item => item.mssv).indexOf(item.mssv);
        data[index].danhGia = value ? 1 : null;
        if (editIndex != -1) {
            edit[editIndex] = data[index];
        } else edit.push(data[index]);

        this.setState({ data, edit });
    }

    onSubmit = this.props.permission.write ? () => {
        const { edit } = this.state;
        const { lichId, maNganh } = this.state;
        T.confirm('Xác nhận lưu danh sách?', '', isConfirm =>
            isConfirm && this.props.updateShcdDiemDanhDanhSach(lichId, edit, this.props.system.user.email, () => {
                this.props.getShcdDiemDanh({ lichId, maNganh, filter: this.state.filter }, (data) => this.setState({ data, edit: [] }));
                this.hide();
            })
        );

    } : ''

    table = () => {
        const { data } = this.state;
        return renderTable({
            emptyTable: 'Không có thông tin điểm danh',
            getDataSource: () => data.length ? data : [{}],
            height: '10px',
            stickyHead: true,
            renderHead: () => <tr>
                <th style={{ whiteSpace: 'nowrap' }}>#</th>
                <TableHead style={{ whiteSpace: 'nowrap', width: '30%', minWidth: '150px' }} typeSeach='admin-select' content='Sinh viên' keyCol='tenSinhVien' onKeySearch={this.onKeySearch} />
                <TableHead style={{ whiteSpace: 'nowrap', width: '10%', minWidth: '70px' }} typeSeach='admmin-select' content='MSSV' keyCol='mssv' onKeySearch={this.onKeySearch} />
                <th style={{ whiteSpace: 'nowrap', width: '25%', minWidth: '100px' }}>Thời gian vào</th>
                <th style={{ whiteSpace: 'nowrap', width: '25%', minWidth: '100px' }}>Thời gian ra</th>
                {this.props.permission.write ? <th style={{ whiteSpace: 'nowrap', width: '10%', minWidth: '100px' }}>Đánh giá</th> : ''}
                {/* <th style={{ whiteSpace: 'nowrap', minWidth: '100px' }}>Thao tác</th> */}
            </tr>,
            renderRow:
                data.map((item, index) => <tr key={index}>
                    <td>{index + 1}</td>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy HH:MM' content={item.thoiGianVao} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy HH:MM' content={item.thoiGianRa} />
                    {this.props.permission.write ? <TableCell type='checkbox' content={item.danhGia ? 1 : 0} onChanged={(value) => this.handleDanhGia(value, item)} isCheck={true} permission={this.props.permission} /> : ''}
                </tr>)
        });
    }

    handleDownload = () => {
        const { lichId, maNganh } = this.state;
        this.props.downloadExcelShcdDiemDanh({ lichId, maNganh, ten: this.ten.state.value, nganh: this.nganh.state.value });
    }

    onUploadSuccess = (res) => {
        if (res.error) return T.notify('Xảy ra lỗi khi tải lên danh sách', 'danger');
        T.confirm('Xác nhận tải lên danh sách?', '', isConfirm => {
            if (!isConfirm) return;
            const { lichId, maNganh, data } = this.state;
            let failed = [],
                danhSach = [];
            res.danhSach.forEach(item => {
                if (data.map(d => d.mssv).includes(item.mssv)) {
                    danhSach.push(item);
                } else {
                    if (item.mssv) failed.push(item);
                }
            });
            if (failed.length) {
                T.notify(`Sinh viên ${failed.map(item => item.mssv).concat(' ')} không thuộc buổi SHCD này`, 'danger');
            }
            this.props.updateShcdDiemDanhDanhSach(lichId, danhSach, this.props.system.user.email, () => {
                this.props.getShcdDiemDanh({ lichId, maNganh, filter: this.state.filter }, (data) => this.setState({ data }));
            });
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Danh sách điểm danh',
            size: 'elarge',
            body: <>
                <div style={{ height: '70vh', overflow: 'hidden auto' }}>
                    <div className='row'>
                        <FormTextBox className='col-md-3' ref={e => this.ten = e} label='Tiêu đề' readOnly />
                        <AdminSelect className='col-md-3' ref={e => this.heDaoTao = e} label='Hệ đào tạo' multiple data={SelectAdapter_DmSvLoaiHinhDaoTao} readOnly />
                        <EaseDateRangePicker className='col-md-4' ref={e => this.thoiGian = e} label='Thời gian' readOnly format='DD/MM/YYYY HH:mm' />
                        <FormTextBox className='col-md-2' ref={e => this.phong = e} label='Phòng' readOnly />
                        <FormTextBox className='col-md-3' ref={e => this.soLuong = e} label='Số lượng' readOnly />
                        <FormTextBox className='col-md-3' ref={e => this.soLuongVao = e} label='Số lượng tham gia' readOnly />
                        {/* <FormTextBox className='col-md-2' ref={e => this.soLuongRa = e} label='Số lượng ra' readOnly /> */}
                        <FormTextBox className='col-md-3' ref={e => this.nganh = e} label='Ngành' readOnly />
                        <FormTextBox className='col-md-3' ref={e => this.giangVien = e} label='Giảng viên' readOnly />
                    </div>
                    <div className='row'>
                        <div className="col-md-12">
                            {/* <FormTabs
                                tabs={[
                                    {title: 'Danh sách tham gia', component: this.table()},
                                    {title: 'Danh sách vắng mặt', component: this.table()},
                                ]}
                            /> */}
                            {this.table()}
                        </div>
                    </div>
                </div>
                <ImportModal ref={e => this.importModal = e} onUploadSuccess={this.onUploadSuccess} onDownloadDsDiemDanh={this.handleDownload} />
            </>,
            buttons: this.props.permission.write ?
                <>
                    <button className='btn btn-primary' onClick={this.handleDownload}><i className='fa fa-download'></i>Tải xuống</button>
                    {/* <button className='btn btn-success ' type='button' onClick={() => this.danhSach.uploadInput.click()} ><i className='fa fa-file-excel-o' />Tải lên danh sách</button> */}
                    <button className='btn btn-success ' type='button' onClick={() => this.importModal.show(this.state.lichId, this.state.maNganh)} ><i className='fa fa-file-excel-o' />Tải lên danh sách</button>
                    {/* <FileBox ref={e => this.danhSach = e} className='d-none' postUrl='/user/upload' accept='.xlsx' uploadType='uploadDsSinhVienDiemDanh' success={this.onUploadSuccess} /> */}
                </> : ''
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, ctsvShcd: state.ctsv.ctsvShcd });
const mapActionsToProps = {
    getShcdDiemDanh, downloadExcelShcdDiemDanh, updateShcdDiemDanh, updateShcdDiemDanhDanhSach
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ShcdDanhSachDiemDanhModal);