import React from 'react';
import { AdminModal, renderTable, TableCell } from 'view/component/AdminPage';

export default class LoaiHocPhiModal extends AdminModal {
    state = { isSubmitting: false }

    onShow = () => {
        this.props.getAll(data => {
            this.setState({ data });
        });
    }

    onCheckBox = (ma, value) => {
        let data = this.state.data;
        const idx = data.findIndex(item => item.ma == ma);
        if (idx >= 0) {
            data[idx].main = value;
        }
        this.setState({ data });
    }

    render = () => {
        let table = renderTable({
            emptyTable: 'Không có dữ liệu loại học phí',
            getDataSource: () => this.state.data, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học phí chính</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell content={item?.ma || ''} onClick={() => this.modal.show(item)} />
                    <TableCell type='link' content={item?.ten || ''} onClick={() => this.modal.show(item)} />
                    <TableCell type='checkbox' style={{ textAlign: 'center' }} permission={this.props.permission} content={item.main} onChanged={value => this.onCheckBox(item.ma, value)} />
                </tr >
            )
        });

        return this.renderModal({
            title: 'Danh sách loại học phí',
            size: 'large',
            isLoading: this.state.isSubmitting,
            body: <div className='row'>
                <div className='col-md-12'>{table}</div>
                {/* <div className='col-md-12 row' style={{ marginTop: '20px' }}>
                    <h6 className='col-md-2'>Chọn loại áp dụng</h6>
                    <div className='col-md-10 row'>
                        <FormCheckbox className='col-md-4' ref={e => this.apDung = e} label='Áp dụng cho sinh viên chưa áp dụng' />
                        <FormCheckbox className='col-md-4' ref={e => this.taiApDung = e} label='Tái áp dụng cho sinh viên đã áp dụng' />
                        <FormCheckbox className='col-md-4' ref={e => this.hienThi = e} label='Hiển thị phí cho sinh viên' />
                    </div>
                </div> */}
                {/* <div className='col-md-12 row' style={{ marginTop: '20px' }}>
                    <h6 className='col-md-4'>Hiển thị phí cho sinh viên</h6>
                    <FormCheckbox className='col-md-8' ref={e => this.hienThi = e} />
                </div> */}
                {/* <FormCheckbox className='col-md-12' ref={e => this.hienThi = e} label='Hiển thị phí cho sinh viên' /> */}
            </div>
        }
        );
    }
}