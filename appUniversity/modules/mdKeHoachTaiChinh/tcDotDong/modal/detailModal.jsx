import React from 'react';
import { SelectAdapter_TcLoaiPhi, SelectAdapter_TcLoaiHocPhi } from 'modules/mdKeHoachTaiChinh/tcLoaiPhi/redux';
import { AdminModal, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';

export default class DetailModal extends AdminModal {
    state = { isSubmitting: false, isChanged: false }

    onShow = (item) => {
        let { id, ten, namHoc, hocKy } = item;
        this.props.loaiPhi({ id }, result => {
            this.setState({ listLoaiPhi: result || [], idDotDong: id, tenDotDong: ten, namHoc, hocKy });
        });
        this.namHoc.value(namHoc);
        this.hocKy.value(hocKy);
        this.loaiPhi.value('');
        this.tamThu.value('');
        this.loaiHocPhi.value('');
    }

    onDelete = (item) => {
        let listLoaiPhi = this.state.listLoaiPhi;
        T.confirm('Xóa loại phí', `Bạn có muốn xóa loại phí ${item.tenLoaiPhi} không?`, 'warning', true, isConfirm => {
            if (isConfirm) {
                for (let i = 0; i < listLoaiPhi.length; i++) {
                    if (listLoaiPhi[i].loaiPhi == item.loaiPhi) {
                        listLoaiPhi.splice(i, 1);
                        break;
                    }
                }
                for (let i = 0; i < listLoaiPhi.length; i++) {
                    listLoaiPhi[i].uuTien = i + 1;
                }
                this.setState({ listLoaiPhi, isChanged: true });
            }
        });
    }

    onAdd = (e) => {
        e.preventDefault();
        let listLoaiPhi = this.state.listLoaiPhi;
        let data = {
            idDotDong: this.state.idDotDong,
            loaiPhi: Number(this.loaiPhi.value()),
            tamThu: this.tamThu.value(),
            loaiHocPhi: this.loaiHocPhi.value(),
            tenLoaiPhi: this.loaiPhi.data()?.text || '',
            tenTamThu: this.tamThu.data()?.text || '',
            tenLoaiHocPhi: this.loaiHocPhi.data()?.text || '',
            uuTien: listLoaiPhi.length + 1,
        };

        if (!data.loaiPhi) {
            T.notify('Chưa chọn loại phí', 'danger');
            this.loaiPhi.focus();
        }
        // else if (!data.isHocPhi && data.isQuanSu) {
        //     T.notify('Tùy chọn quân sự chỉ được áp dụng cho loại phí học phí', 'danger');
        // }
        else {
            if (listLoaiPhi.some(item => item.loaiPhi == data.loaiPhi)) {
                T.notify('Đã tồn tại loại phí này. Nếu có chỉnh sửa, vui lòng xóa loại phí hiện tại', 'danger');
            }
            else {
                this.setState({ listLoaiPhi: [...listLoaiPhi, data], isChanged: true }, () => {
                    this.loaiPhi.value('');
                    this.tamThu.value('');
                    this.loaiHocPhi.value('');
                });
            }
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        if (!this.state.isChanged) {
            T.notify('Không có sự thay đổi nào', 'danger');
        }
        else {
            this.setState({ isSubmitting: true }, () => {
                this.props.updateLoaiPhi(this.state.idDotDong, this.state.namHoc, this.state.hocKy, this.state.listLoaiPhi, () => this.hide());
                this.setState({ isSubmitting: false });
            });
        }
    }

    onUpLevel = (item) => {
        const idx = item.uuTien - 1;
        let listLoaiPhi = this.state.listLoaiPhi;
        if (idx != 0) {
            [listLoaiPhi[idx - 1], listLoaiPhi[idx]] = [listLoaiPhi[idx], listLoaiPhi[idx - 1]];
            listLoaiPhi[idx - 1].uuTien = idx;
            listLoaiPhi[idx].uuTien = idx + 1;
            this.setState({ listLoaiPhi, isChanged: true });
        }
    }

    render = () => {
        let table = renderTable({
            emptyTable: 'Không có dữ liệu loại phí',
            getDataSource: () => this.state.listLoaiPhi, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại phí</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Học phí</th>
                    {/* <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Quân sự</th> */}
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Xóa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ưu tiên</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tenLoaiPhi + (item.tenTamThu ? `  (Loại phí đã tạm thu: ${item.tenTamThu})` : '')} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item?.tenLoaiHocPhi || ''} />
                    {/* <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.isHocPhi ? <i className='fa fa-lg fa-check' /> : ''} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.isQuanSu ? <i className='fa fa-lg fa-check' /> : ''} /> */}
                    <TableCell type='buttons' content={item}>
                        <button className='btn btn-danger' onClick={e => e.preventDefault() || this.onDelete(item)}>
                            <i className='fa fa-lg fa-times' />
                        </button>
                    </TableCell>
                    <TableCell type='buttons' content={item}>
                        <button className='btn btn-warning' onClick={e => e.preventDefault() || this.onUpLevel(item)}>
                            <i className='fa fa-lg fa-arrow-up' />
                        </button>
                    </TableCell>
                </tr>
            )
        });

        return this.renderModal({
            title: `${this.state.tenDotDong}`,
            isLoading: this.state.isSubmitting,
            size: 'elarge',
            body: <div className='row'>
                <FormTextBox className='col-md-4' type='text' ref={e => this.namHoc = e} label='Năm học' readOnly />
                <FormTextBox className='col-md-4' type='text' ref={e => this.hocKy = e} label='Học kỳ' readOnly />
                <div className='form-group col-md-12' style={{ marginBottom: '30px' }}>{table}</div>
                <div className='col-md-12'>
                    <div className='tile' style={{ marginBottom: '0' }}>
                        <div className='row'>
                            <FormSelect disabled={this.state.isSubmitting} className='col-md-4' data={SelectAdapter_TcLoaiPhi} ref={e => this.loaiPhi = e} label='Loại phí' required allowClear />
                            <FormSelect disabled={this.state.isSubmitting} className='col-md-4' data={SelectAdapter_TcLoaiPhi} ref={e => this.tamThu = e} label='Loại phí tạm thu' allowClear />
                            <FormSelect disabled={this.state.isSubmitting} className='col-md-4' data={SelectAdapter_TcLoaiHocPhi} ref={e => this.loaiHocPhi = e} label='Loại học phí' allowClear />
                            {/* <div className='form-group col-md-2 d-flex align-items-end justify-content-center' >
                                <FormCheckbox disabled={this.state.isSubmitting} ref={e => this.isHocPhi = e} label='Học phí' />
                            </div>
                            <div className='form-group col-md-2 d-flex align-items-end justify-content-center' >
                                <FormCheckbox disabled={this.state.isSubmitting} ref={e => this.isQuanSu = e} label='Quân sự' />
                            </div> */}
                            <div className='col-md-12' style={{ textAlign: 'right' }}>
                                <Tooltip title='Thêm' arrow disableHoverListener={!!this.state.isSubmitting}>
                                    <span><button disabled={this.state.isSubmitting} className='btn btn-success' onClick={e => this.onAdd(e)}>
                                        Thêm loại phí
                                    </button></span>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        }
        );
    }
}