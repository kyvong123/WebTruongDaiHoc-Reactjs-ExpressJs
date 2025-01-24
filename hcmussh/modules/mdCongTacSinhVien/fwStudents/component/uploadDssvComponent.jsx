import React from 'react';
import { FormTabs, TableCell, renderTable, FormTextBox, FormSelect, FormDatePicker, getValue } from 'view/component/AdminPage';
import { ComponentDiaDiem } from 'modules/mdCongTacSinhVien/ctsvDmDiaDiem/componentDiaDiem';
import FileBox from 'view/component/FileBox';
import { SelectAdapter_CtsvDmGioiTinh } from 'modules/mdCongTacSinhVien/ctsvDmGioiTinh/redux';
import { SelectAdapter_CtsvDmTinhThanhPho } from 'modules/mdCongTacSinhVien/ctsvDmDiaDiem/reduxTinhThanhPho';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdCongTacSinhVien/ctsvDtNganhDaoTao/redux';
import { SelectAdapter_DtLopFilter } from 'modules/mdCongTacSinhVien/ctsvDtLop/redux';
import { SelectAdapter_DmTinhTrangSinhVienV2 } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';
import { Tooltip } from '@mui/material';


class UploadDssv extends React.Component {
    state = { dssvUpload: [], dssvFailed: [], saveNumber: 0, isSaving: true, editIndex: null }

    onUploadSuccess = (res) => {
        if (res.error) {
            T.notify(res.error, 'danger');
        } else {
            this.setState({
                // listMssv: this.parseData(res.items),
                dssvUpload: res.items || [],
                dssvFailed: res.failed || [], isSaving: false,
                editIndex: null
            });
        }
    }

    parseData = (items) => {
        return items.map(item => {
            this.fields.forEach(field => this[field].value[item.mssv] = item[field]);
            return item.mssv;
        });
    }

    delete = (mssv) => {
        const { dssvUpload } = this.state;
        T.confirm('Xóa sinh viên', 'Bạn có chắc muốn xóa sinh viên ra khỏi danh sách', isConfirm => {
            if (isConfirm)
                this.setState({ dssvUpload: dssvUpload.filter(sv => sv.mssv != mssv) });
        });
    }

    saveDssv = () => {
        T.confirm('Lưu danh sách', 'Bạn có chắc muốn lưu những sinh viên mới này?', isConfirm => {
            if (isConfirm) {
                const { dssvUpload } = this.state,
                    chunkSize = 500;
                if (dssvUpload.length) {
                    this.setState({ isSaving: true });
                    const fetchChunk = (i) => {
                        if (i < dssvUpload.length) {
                            const chunk = dssvUpload.slice(i, i + chunkSize);
                            this.props.multiAddDssvAdmin(chunk, () => {
                                this.setState({ saveNumber: this.state.saveNumber + chunk.length });
                                fetchChunk(i + chunkSize);
                            });
                        } else {
                            T.notify('Lưu tất cả thành công', 'success');
                        }
                    };
                    fetchChunk(0);
                } else {
                    T.notify('Danh sách sinh viên hợp lệ rỗng', 'danger');
                }
            }
        });
    }
    // Helper =================================================================
    setFormData = (item) => {
        const { loaiHinhDaoTao, namTuyenSinh } = item;
        this.setState({ loaiHinhDaoTao, namTuyenSinh }, () => {
            this.mssv.value(item.mssv || '');
            this.ho.value(item.ho || '');
            this.ten.value(item.ten || '');
            this.gioiTinh.value(item.gioiTinh || '');
            this.ngaySinh.value(item.ngaySinh || '');
            this.noiSinhMaTinh.value(item.noiSinhMaTinh || '');
            this.thuongTru.value(item.thuongTruMaTinh || '', item.thuongTruMaHuyen || '', item.thuongTruMaXa || '', item.thuongTruSoNha || '');
            this.namTuyenSinh.value(item.namTuyenSinh || '');
            this.loaiHinhDaoTao.value(item.loaiHinhDaoTao || '');
            this.maNganh.value(item.maNganh || '');
            this.lop.value(item.lop || '');
            this.tinhTrang.value(item.tinhTrang || '');
            this.ngayNhapHoc.value(item.ngayNhapHoc || '');
            this.emailCaNhan.value(item.emailCaNhan || '');
            this.dienThoaiCaNhan.value(item.dienThoaiCaNhan || '');
            this.tenCha.value(item.tenCha || '');
            this.sdtCha.value(item.sdtCha || '');
            this.tenMe.value(item.tenMe || '');
            this.sdtMe.value(item.sdtMe || '');
            this.hoTenNguoiLienLac.value(item.hoTenNguoiLienLac || '');
            this.sdtNguoiLienLac.value(item.sdtNguoiLienLac || '');
        });
    }

    getFormData = () => {
        const { maTinhThanhPho: thuongTruMaTinh, maQuanHuyen: thuongTruMaHuyen, maPhuongXa: thuongTruMaXa, soNhaDuong: thuongTruSoNha } = this.thuongTru.value();
        const data = {
            mssv: getValue(this.mssv),
            ho: getValue(this.ho),
            ten: getValue(this.ten),
            gioiTinh: getValue(this.gioiTinh),
            gioiTinhText: this.gioiTinh.data().text,
            ngaySinh: getValue(this.ngaySinh),
            noiSinhMaTinh: getValue(this.noiSinhMaTinh),
            noiSinhMaTinhText: this.noiSinhMaTinh.data().text,
            namTuyenSinh: getValue(this.namTuyenSinh),
            loaiHinhDaoTao: getValue(this.loaiHinhDaoTao),
            loaiHinhDaoTaoText: this.loaiHinhDaoTao.data().text,
            maNganh: getValue(this.maNganh),
            maNganhText: this.maNganh.data().text,
            lop: getValue(this.lop),
            tinhTrang: getValue(this.tinhTrang),
            tinhTrangText: this.tinhTrang.data().text,
            ngayNhapHoc: getValue(this.ngayNhapHoc),
            emailCaNhan: getValue(this.emailCaNhan),
            dienThoaiCaNhan: getValue(this.dienThoaiCaNhan),
            tenCha: getValue(this.tenCha),
            sdtCha: getValue(this.sdtCha),
            tenMe: getValue(this.tenMe),
            sdtMe: getValue(this.sdtMe),
            hoTenNguoiLienLac: getValue(this.hoTenNguoiLienLac),
            sdtNguoiLienLac: getValue(this.sdtNguoiLienLac),
            thuongTruMaTinh,
            thuongTruMaTinhText: this.thuongTru.dmTinhThanhPho.data().text,
            thuongTruMaHuyen,
            thuongTruMaHuyenText: this.thuongTru.dmQuanHuyen.data().text,
            thuongTruMaXa,
            thuongTruMaXaText: this.thuongTru.dmPhuongXa.data().text,
            thuongTruSoNha,
        };
        return data;
    }

    resetFormData = () => {
        this.mssv.value('');
        this.ho.value('');
        this.ten.value('');
        this.gioiTinh.value('');
        this.ngaySinh.value('');
        this.noiSinhMaTinh.value('');
        this.thuongTru.value('', '', '');
        this.namTuyenSinh.value('');
        this.loaiHinhDaoTao.value('');
        this.maNganh.value('');
        this.lop.value('');
        this.tinhTrang.value('');
        this.ngayNhapHoc.value('');
        this.emailCaNhan.value('');
        this.dienThoaiCaNhan.value('');
        this.tenCha.value('');
        this.sdtCha.value('');
        this.tenMe.value('');
        this.sdtMe.value('');
        this.hoTenNguoiLienLac.value('');
        this.sdtNguoiLienLac.value('');
    }

    // Row methods ============================================================
    saveRow = (index) => {
        const { dssvUpload } = this.state,
            data = this.getFormData();
        dssvUpload[index] = { ...dssvUpload[index], ...data };
        this.setState({ dssvUpload: [...dssvUpload] }, () => this.setState({ editIndex: null }));
        this.resetFormData();
    }

    initEditRow = (item, index) => {
        this.setState({ editIndex: index }, () => this.setFormData(item));
    }

    cancelEditRow = () => {
        this.setState({ editIndex: null });
    }

    buildRow = (item, index) => {
        return this.state.editIndex == index ? this.editRow(index) : <tr key={index}>
            <TableCell type='number' content={index + 1} />
            <TableCell content={item.mssv} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho} />
            <TableCell content={item.ten} />
            <TableCell content={item.gioiTinhText} />
            <TableCell type='date' content={item.ngaySinh} dateFormat='dd/mm/yyyy' />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.noiSinhMaTinhText} />
            <TableCell contentClassName='multiple-lines-5' content={item.thuongTruMaTinhText + ', ' + item.thuongTruMaHuyenText + ', ' + item.thuongTruMaXaText + ', ' + item.thuongTruSoNha} />
            <TableCell content={item.namTuyenSinh} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiHinhDaoTaoText} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maNganhText} />
            <TableCell content={item.lop} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tinhTrangText} />
            <TableCell type='date' content={item.ngayNhapHoc} dateFormat='dd/mm/yyyy' />
            <TableCell content={item.emailCaNhan} />
            <TableCell content={item.dienThoaiCaNhan} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenCha} />
            <TableCell content={item.sdtCha} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenMe} />
            <TableCell content={item.sdtMe} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTenNguoiLienLac} />
            <TableCell content={item.sdtNguoiLienLac} />
            <TableCell type='buttons' style={{ textAlign: 'left' }} permission={{ delete: this.state.editIndex == null }} onDelete={() => this.delete(item.mssv)} content={item} >
                <Tooltip title='Chỉnh sửa'>
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.initEditRow(item, index)}><i className='fa fa-pencil' /></button>
                </Tooltip>
            </TableCell>
        </tr>;
    }

    editRow = (index) => {
        return <tr key={index}>
            <TableCell type='number' content={index + 1} />
            <TableCell content={<FormTextBox style={{ minWidth: '100px' }} ref={e => this.mssv = e} placeholder='MSSV' />} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={<FormTextBox style={{ minWidth: '100px' }} ref={e => this.ho = e} placeholder='Họ' />} />
            <TableCell content={<FormTextBox style={{ minWidth: '100px' }} ref={e => this.ten = e} placeholder='Tên' />} />
            <TableCell content={<FormSelect style={{ minWidth: '100px' }} ref={e => this.gioiTinh = e} data={SelectAdapter_CtsvDmGioiTinh} placeholder='Giới tính' />} />
            <TableCell content={<FormDatePicker style={{ minWidth: '100px' }} ref={e => this.ngaySinh = e} type='date-mask' placeholder='Ngày sinh' />} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={<FormSelect style={{ minWidth: '100px' }} ref={e => this.noiSinhMaTinh = e} data={SelectAdapter_CtsvDmTinhThanhPho} placeholder='Nơi sinh' />} />
            <TableCell content={<ComponentDiaDiem style={{ minWidth: '100px' }} fullDisplay requiredSoNhaDuong ref={e => this.thuongTru = e} placeholder='Thường trú' />} />
            <TableCell content={<FormTextBox style={{ minWidth: '100px' }} ref={e => this.namTuyenSinh = e} type='year' placeholder='Năm tuyển sinh' />} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={<FormSelect style={{ minWidth: '100px' }} ref={e => this.loaiHinhDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} placeholder='Hệ đào tạo' />} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={<FormSelect style={{ minWidth: '100px' }} ref={e => this.maNganh = e} data={SelectAdapter_DtNganhDaoTao} placeholder='Mã ngành' />} />
            <TableCell content={<FormSelect style={{ minWidth: '200px' }} ref={e => this.lop = e} data={SelectAdapter_DtLopFilter(this.state.loaiHinhDaoTao, this.state.namTuyenSinh)} placeholder='Mã lớp' />} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={<FormSelect style={{ minWidth: '100px' }} ref={e => this.tinhTrang = e} data={SelectAdapter_DmTinhTrangSinhVienV2} placeholder='Tình trạng' />} />
            <TableCell content={<FormDatePicker style={{ minWidth: '100px' }} ref={e => this.ngayNhapHoc = e} type='date-mask' placeholder='Ngày nhập học' />} />
            <TableCell content={<FormTextBox style={{ minWidth: '100px' }} ref={e => this.emailCaNhan = e} type='email' placeholder='Email cá nhân' />} />
            <TableCell content={<FormTextBox style={{ minWidth: '100px' }} ref={e => this.dienThoaiCaNhan = e} type='email' placeholder='SĐT cá nhân' />} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={<FormTextBox style={{ minWidth: '100px' }} ref={e => this.tenCha = e} placeholder='Tên cha' />} />
            <TableCell content={<FormTextBox style={{ minWidth: '100px' }} ref={e => this.sdtCha = e} type='phone' placeholder='SĐT cha' />} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={<FormTextBox style={{ minWidth: '100px' }} ref={e => this.tenMe = e} placeholder='Tên mẹ' />} />
            <TableCell content={<FormTextBox style={{ minWidth: '100px' }} ref={e => this.sdtMe = e} type='phone' placeholder='SĐT mẹ' />} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={<FormTextBox style={{ minWidth: '100px' }} ref={e => this.hoTenNguoiLienLac = e} placeholder='Tên người liên lạc' />} />
            <TableCell content={<FormTextBox style={{ minWidth: '100px' }} ref={e => this.sdtNguoiLienLac = e} type='phone' placeholder='SĐT người liên lạc' />} />
            <TableCell type='buttons' style={{ textAlign: 'left' }} >
                <Tooltip title='Lưu'>
                    <button className='btn btn-success' onClick={e => e.preventDefault() || this.saveRow(index)}><i className='fa fa-check' /></button>
                </Tooltip>
                <Tooltip title='Hủy'>
                    <button className='btn btn-danger' onClick={e => e.preventDefault() || this.cancelEditRow()}><i className='fa fa-times' /></button>
                </Tooltip>
            </TableCell>
        </tr>;
    }


    render = () => {
        const { dssvUpload = [], dssvFailed = [], editIndex } = this.state;
        const table = renderTable({
            getDataSource: () => dssvUpload,
            className: 'table-fix-col',
            emptyTable: '',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '35%' }}>MSSV</th>
                    <th style={{ width: '35%' }}>Họ</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giới tính</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày sinh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Nơi sinh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thường trú</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm tuyển sinh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ đào tạo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã ngành</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã lớp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày nhập học</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Email cá nhân</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SĐT cá nhân</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tên cha</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SĐT cha</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tên mẹ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SĐT mẹ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tên người liên lạc</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SĐT người liên lạc</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ), renderRow: (item, index) => {
                return this.buildRow(item, index);
            }
        });

        const failedTable = renderTable({
            getDataSource: () => dssvFailed,
            emptyTable: '',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '10%' }}>MSSV</th>
                    <th style={{ width: '25%' }}>Vị trí</th>
                    <th style={{ width: '65%' }}>Thông tin</th>
                </tr>
            ), renderRow: (item, index) => {
                return <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`Dòng số ${item.rowIndex} trong file`} />
                    <TableCell className='text-danger' style={{ whiteSpace: 'nowrap' }} content={item.message} />
                </tr>;
            }
        });
        return (
            <div className='tile'>
                <h6>Thêm file excel danh sách sinh viên. Tải file mẫu tại <a href='#' onClick={e => e.preventDefault() || T.download('/api/ctsv/upload-dssv/template')}>đây</a></h6>
                <FileBox className='col-md-12 mb-3' postUrl={'/user/upload'} uploadType='DssvImportData' userData={'DssvImportData'}
                    accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' label={''}
                    ajax={true} success={this.onUploadSuccess} />
                {(dssvUpload.length || dssvFailed.length) ? <FormTabs
                    tabs={[
                        {
                            title: `Danh sách hợp lệ (${dssvUpload.length})`, component: <>
                                {table}
                                {dssvUpload.length && editIndex == null ? <button className='btn btn-success' disabled={this.state.isSaving} onClick={(e) => { e.preventDefault; this.saveDssv(); }}>{this.state.isSaving ? <>
                                    Đã lưu ({this.state.saveNumber} / {dssvUpload.length})
                                </> : 'Lưu danh sách'}</button> : ''}
                            </>
                        },
                        {
                            title: `Danh sách lỗi (${dssvFailed.length})`, component: <>
                                {failedTable}
                            </>
                        },
                    ]}
                /> : ''}
            </div >
        );
    }
}

export default UploadDssv;