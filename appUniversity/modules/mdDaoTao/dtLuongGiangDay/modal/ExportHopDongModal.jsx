import React from 'react';

import { AdminModal, FormSelect, FormTextBox, renderTable, TableCell, FormCheckbox } from 'view/component/AdminPage';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { Link } from 'react-router-dom';
import T from 'view/js/common';
import { SelectAdapter_SoDangKyAlternative, createSoTuDong } from 'modules/mdHanhChinhTongHop/hcthSoDangKy/redux/soDangKy';

export class ExportHopDongModal extends AdminModal {
    state = { isSubmitting: false }

    onShow = (item, filter) => {
        const { idGiangVien, ho, ten } = item ? item : { idGiangVien: '', ho: '', ten: '' };
        const { namHocFilter: namHoc, hocKyFilter: hocKy, khoaSinhVienFilter: khoaSinhVien, loaiHinhDaoTaoFilter: loaiHinhDaoTao } = filter;
        let listHopDong = [];

        this.setState({ idGiangVien, namHoc, hocKy, khoaSinhVien, loaiHinhDaoTao, listHopDong }, () => {
            this.idGiangVien.value(idGiangVien);
            this.giangVien.value(`${ho} ${ten}`);
            this.namHoc.value(namHoc);
            this.hocKy.value(hocKy || '');
            this.khoaSinhVien.value(khoaSinhVien || '');
            this.loaiHinhDaoTao.value(loaiHinhDaoTao || '');
            this.soHopDong.value('');
            this.dotThanhToan.value('');
        });

        idGiangVien && namHoc && hocKy && this.props.getListHopDong({ idGiangVien, namHoc, hocKy, khoaSinhVien, loaiHinhDaoTao }, data => {
            this.setState({ listHopDong: data });
        });
    }

    // onShowRequestModal = () => {
    //     $(this.modal).modal('hide');
    //     setTimeout(() => {
    //         this.props.requestModal.show({
    //             onHide: () => $(this.modal).modal('show'), onCreateCallback: (data, done) => {
    //                 done && done();
    //                 data.soVanBan && this.soQuyetDinh.value(data.soVanBan);
    //             },
    //             loaiVanBan: 42,
    //             lyDo: this.formType.data()?.text
    //         });
    //     }, 300);
    // }

    // onCreateRequest = () => {
    //     $(this.props.requestModal.modal).modal;
    // }

    onChangeValue = () => {
        const idGiangVien = this.idGiangVien.value() || '';
        const namHoc = this.namHoc.value() || '';
        const hocKy = this.hocKy.value() || '';
        const khoaSinhVien = this.khoaSinhVien.value() || '';
        const loaiHinhDaoTao = this.loaiHinhDaoTao.value() || '';

        idGiangVien && namHoc && hocKy && this.props.getListHopDong({ idGiangVien, namHoc, hocKy, khoaSinhVien, loaiHinhDaoTao }, data => {
            this.setState({ idGiangVien, namHoc, hocKy, khoaSinhVien, loaiHinhDaoTao, listHopDong: data });
        });
    }

    onCheckBox = (id, value) => {
        const soHopDong = this.soHopDong.value();
        const dotThanhToan = this.dotThanhToan.value();
        if (!soHopDong) {
            T.notify('Vui lòng chọn số hợp đồng!');
            this[`isExport_${id}`]?.value(!value);
            this.soHopDong.focus();
        }
        else if (!dotThanhToan) {
            T.notify('Vui lòng chọn đợt thanh toán!');
            this[`isExport_${id}`]?.value(!value);
            this.dotThanhToan.focus();
        }
        else {
            let listHopDong = this.state.listHopDong;
            const idx = listHopDong.findIndex(item => item.id == id);
            if (idx >= 0) {
                listHopDong[idx] = { ...listHopDong[idx], ...value };
            }
            this.setState({ listHopDong });
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        const { idGiangVien, namHoc, hocKy, khoaSinhVien, loaiHinhDaoTao } = this.state;
        const soHopDong = this.soHopDong.value();
        const dotThanhToan = this.dotThanhToan.value();
        const listHopDong = this.state.listHopDong.filter(item => item?.export == true).map(item => item.id);
        if (!namHoc) {
            T.notify('Vui lòng chọn năm học!');
            this.namHoc.focus();
        }
        else if (!hocKy) {
            T.notify('Vui lòng chọn học kỳ!');
            this.hocKy.focus();
        }
        else if (!loaiHinhDaoTao) {
            T.notify('Vui lòng chọn loại hình đào tạo!');
            this.loaiHinhDaoTao.focus();
        }
        else if (!soHopDong) {
            T.notify('Vui lòng chọn số hợp đồng!');
            this.soHopDong.focus();
        }
        else if (!dotThanhToan) {
            T.notify('Vui lòng chọn đợt thanh toán!');
            this.dotThanhToan.focus();
        }
        else if (!listHopDong || !listHopDong.length || !idGiangVien) {
            T.notify('Giảng viên không có hợp đồng, vui lòng kiểm tra lại');
        }
        else {
            this.props.exportHopDong({ listHopDong: listHopDong.toString(), soHopDong, dotThanhToan }, { idGiangVien, namHoc, hocKy, khoaSinhVien, loaiHinhDaoTao }, data => {
                T.FileSaver(new Blob([new Uint8Array(data.content.data)]), data.filename);
            });
        }
    }

    createSoHopDong = () => {
        this.setState({ isSubmitting: true }, () => {
            createSoTuDong({ capVanBan: 'DON_VI', loaiVanBan: 'HĐMG', donViGui: 30, tuDong: 1, soLuiNgay: 0, ngayLui: null }, (res) => {
                this.soHopDong.value(res.item.id);
            }, () => this.setState({ isSubmitting: false }))();
        });
    }

    handleChotHopDong = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // this.props.chotHopDong(data, info);
        const { idGiangVien, namHoc, hocKy, khoaSinhVien, loaiHinhDaoTao } = this.state;
        const soHopDong = this.soHopDong.value();
        const dotThanhToan = this.dotThanhToan.value();
        const listHopDong = this.state.listHopDong.filter(item => item?.export == true).map(item => item.id);
        if (!namHoc) {
            T.notify('Vui lòng chọn năm học!');
            this.namHoc.focus();
        }
        else if (!hocKy) {
            T.notify('Vui lòng chọn học kỳ!');
            this.hocKy.focus();
        }
        else if (!loaiHinhDaoTao) {
            T.notify('Vui lòng chọn loại hình đào tạo!');
            this.loaiHinhDaoTao.focus();
        }
        else if (!soHopDong) {
            T.notify('Vui lòng chọn số hợp đồng!');
            this.soHopDong.focus();
        }
        else if (!dotThanhToan) {
            T.notify('Vui lòng chọn đợt thanh toán!');
            this.dotThanhToan.focus();
        }
        else if (!listHopDong || !listHopDong.length || !idGiangVien) {
            T.notify('Giảng viên không có hợp đồng, vui lòng kiểm tra lại');
        }
        else {

            // T.FileSaver(new Blob([new Uint8Array(data.content.data)]), data.filename);
            // console.log(data);
            T.confirm('Cảnh báo', 'Bạn có chắc muốn chốt hợp đồng này không', 'warning', true, isConfirm => {
                if (isConfirm) {
                    T.alert('Đang xử lý', 'warning', false, null, true);
                    this.props.chotHopDong({ listHopDong: listHopDong.toString(), soHopDong, dotThanhToan }, { idGiangVien, namHoc, hocKy, khoaSinhVien, loaiHinhDaoTao }, () => {
                        this.hide();
                        T.alert('Chốt hợp đồng thành công', 'success', false, 1000);
                    });
                }
            });

        }
    }
    render = () => {
        const permission = this.props.permission;

        let tableLoaiPhi = renderTable({
            emptyTable: 'Không có dữ liệu danh sách loại phí',
            stickyHead: false,
            header: 'thead-light',
            getDataSource: () => this.state?.listHopDong || [],
            renderHead: () => (<tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Xuất HĐ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã học phần</th>
                <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Môn học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng số tiết</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết được chia</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lượng SV</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Đơn giá</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tính phí</th>
            </tr>),
            renderRow: (item, index) => (
                <tr style={{ background: this[`isExport_${item.id}`]?.value() ? '#FEFFDC' : '' }} key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell permission={permission} style={{ textAlign: 'center', whiteSpace: 'nowrap' }}
                        content={<FormCheckbox ref={e => this[`isExport_${item.id}`] = e} onChange={() => this.onCheckBox(item.id, { export: this[`isExport_${item.id}`]?.value() })} />}
                    />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc)?.vi || ''} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soTiet} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soTietDuocChia} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soLuongSinhVien} />
                    <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.donGia} />
                    <TableCell type='checkbox' style={{ textAlign: 'center', whiteSpace: 'nowrap' }}
                        content={this.state.listHopDong.find(ele => item.id == ele.id)?.tinhPhi == 1 ? true : false} onChanged={value => this.onCheckBox(item.id, { tinhPhi: value })}
                    />
                </tr>
            )
        });

        return this.renderModal({
            title: 'Xuất hợp đồng giảng dạy',
            isLoading: this.state.isSubmitting,
            submitText: 'Export',
            size: 'elarge',
            body: <div className='row'>
                <FormTextBox className='col-md-8' ref={e => this.giangVien = e} label='Giảng viên' readOnly={true} required />
                <FormTextBox className='col-md-4' ref={e => this.idGiangVien = e} label='Mã' readOnly={true} required />
                <FormSelect data={SelectAdapter_SchoolYear} className='col-md-3' ref={e => this.namHoc = e} label='Năm học' onChange={this.onChangeValue} allowClear required />
                <FormSelect data={SelectAdapter_DtDmHocKy} className='col-md-3' ref={e => this.hocKy = e} label='Học kỳ' onChange={this.onChangeValue} allowClear required />
                <FormSelect data={SelectAdapter_DmSvLoaiHinhDaoTao} className='col-md-3' ref={e => this.loaiHinhDaoTao = e} label='Loại hình đào tạo' onChange={this.onChangeValue} allowClear required />
                <FormSelect data={SelectAdapter_DtKhoaDaoTao} className='col-md-3' ref={e => this.khoaSinhVien = e} label='Khóa' onChange={this.onChangeValue} allowClear required />
                <FormSelect className='col-md-6' ref={e => this.soHopDong = e} disabled={this.state.isSubmitting} data={SelectAdapter_SoDangKyAlternative([30], 'DON_VI', ['HĐMG'], 0)}
                    label={<div>Số văn bản <span className='text-danger'>*&nbsp;</span> <Link to='#' onClick={e => e.preventDefault() || this.createSoHopDong()}>(Nhấn vào đây để tạo mới)</Link></div>}
                />
                <FormSelect data={[{ id: 1, text: 'Đợt 1' }, { id: 2, text: 'Đợt 2' }]} className='col-md-6' ref={e => this.dotThanhToan = e} label='Đợt thanh toán' onChange={this.onChangeValue} allowClear required />
                <div className='col-md-12'>
                    <div className='tile'>{tableLoaiPhi}</div>
                </div>


            </div>,
            buttons: <button className='btn btn-warning' onClick={(e) => this.handleChotHopDong(e)}>
                <i className='fa fa-lg fa-gavel' /> Chốt hợp đồng
            </button>
        }
        );
    }
}