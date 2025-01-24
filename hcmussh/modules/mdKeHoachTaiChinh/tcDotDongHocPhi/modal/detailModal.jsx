import React from 'react';
import { SelectAdapter_TcLoaiPhi } from 'modules/mdKeHoachTaiChinh/tcLoaiPhi/redux';
import { AdminModal, FormCheckbox, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
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
        this.isHocPhi.value(false);
    }

    onDelete = (item) => {
        let listLoaiPhi = this.state.listLoaiPhi;
        T.confirm('Xóa loại phí', `Bạn có muốn xóa loại phí ${item.tenLoaiPhi} không?`, 'warning', true, isConfirm => {
            if (isConfirm) {
                T.notify('Xóa loại phí thành công!', 'success');
                for (let i = 0; i < listLoaiPhi.length; i++) {
                    if (listLoaiPhi[i].loaiPhi == item.loaiPhi) {
                        listLoaiPhi.splice(i, 1);
                        break;
                    }
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
            isHocPhi: this.isHocPhi.value() ? 1 : 0,
            tenLoaiPhi: this.loaiPhi.data()?.text || '',
            tenTamThu: this.tamThu.data()?.text || '',
        };

        if (!data.loaiPhi) {
            T.notify('Chưa chọn loại phí', 'danger');
            this.loaiPhi.focus();
        }
        else {
            if (listLoaiPhi.some(item => item.loaiPhi == data.loaiPhi)) {
                T.notify('Đã tồn tại loại phí này. Nếu có chỉnh sửa, vui lòng xóa loại phí hiện tại', 'danger');
            }
            else {
                this.setState({ listLoaiPhi: [...listLoaiPhi, data], isChanged: true }, () => {
                    this.loaiPhi.value('');
                    this.tamThu.value('');
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

    render = () => {
        let table = renderTable({
            emptyTable: 'Không có dữ liệu đợt đóng học phí',
            getDataSource: () => this.state.listLoaiPhi, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại phí</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Xóa</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tenLoaiPhi + (item.tenTamThu ? `  (Loại phí đã tạm thu: ${item.tenTamThu})` : '')} />
                    <TableCell type='buttons' content={item}>
                        <Tooltip title='Chi tiết' arrow >
                            <button className='btn btn-danger' onClick={e => e.preventDefault() || this.onDelete(item)}>
                                <i className='fa fa-lg fa-times' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr>
            )
        });

        return this.renderModal({
            title: `${this.state.tenDotDong}`,
            isLoading: this.state.isSubmitting,
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-md-4' type='text' ref={e => this.namHoc = e} label='Năm học' readOnly />
                <FormTextBox className='col-md-4' type='text' ref={e => this.hocKy = e} label='Học kỳ' readOnly />
                <div className='form-group col-md-12' style={{ marginBottom: '30px' }}>{table}</div>
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' data={SelectAdapter_TcLoaiPhi} ref={e => this.loaiPhi = e} label='Loại phí' required allowClear />
                <FormSelect disabled={this.state.isSubmitting} className='col-md-4' data={SelectAdapter_TcLoaiPhi} ref={e => this.tamThu = e} label='Loại phí tạm thu' allowClear />
                <div className='form-group col-md-2 d-flex align-items-end justify-content-center' >
                    <FormCheckbox disabled={this.state.isSubmitting} ref={e => this.isHocPhi = e} label='Học phí' />
                </div>
                <div className='form-group col-md-2 d-flex align-items-end justify-content-end' >
                    <Tooltip title='Thêm' arrow disableHoverListener={!!this.state.isSubmitting}>
                        <span><button disabled={this.state.isSubmitting} className='btn btn-success' onClick={e => this.onAdd(e)}>
                            {/* <i className='fa fa-lg fa-plus' /> */}
                            Thêm loại phí
                        </button></span>
                    </Tooltip>
                </div>
            </div>
        }
        );
    }
}