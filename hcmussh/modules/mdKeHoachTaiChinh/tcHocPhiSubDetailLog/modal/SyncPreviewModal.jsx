import React from 'react';
import { AdminModal, FormTabs, renderTable, TableCell } from 'view/component/AdminPage';

export default class SyncPreviewModal extends AdminModal {
    state = { isSubmitting: false }

    onShow = (item, filter) => {
        this.setState({ listSinhVienAll: item.listSinhVienAll, listHocPhi: item.listHocPhi, filter });
    }

    onSubmit = (e) => {
        let filter = this.state.filter;

        this.setState({ isSubmitting: true }, () => {
            this.props.sync(filter, () => {
                T.notify('Đã đồng bộ thành công', 'success');
                this.setState({ isSubmitting: false });
                this.hide();
                this.props.reload();
            });
        });
        e.preventDefault();
    }

    createTable = (loaiPhi) => renderTable({
        emptyTable: 'Không có dữ liệu sinh viên áp dụng',
        getDataSource: () => this.state?.listSinhVienAll?.[loaiPhi]?.data || [],
        stickyHead: this.state?.listSinhVienAll?.[loaiPhi]?.length > 20,
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>MSSV</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Họ và tên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại phí</th>
                <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Danh sách mã môn học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiền (VNĐ)</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiền đã áp dụng (VNĐ)</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Trạng thái</th>
            </tr>
        ),
        renderRow: (item, index) => (
            // <tr key={index}>
            <tr style={{ background: (item.daApDung && item.soTienCanDong != item.soTienDaApDung) ? '#FEFFDC' : '' }} key={index}>
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={index + 1} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.mssv} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.hoVaTen} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tenLoaiPhi} />
                <TableCell style={{ textAlign: 'left' }} content={item?.listHocPhan || ''} />
                <TableCell type='number' style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={item.soTienCanDong} />
                <TableCell type='number' style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={item.soTienDaApDung} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={
                    item.daApDung ? <div style={{ color: 'blue' }}><i className='fa fa-lg fa-times-circle-o' /> Đã áp dụng</div> : <div style={{ color: 'green' }}><i className='fa fa-lg fa-check-circle-o' /> Chưa áp dụng</div>
                } />
            </tr >
        )
    });

    componentLoaiPhi = (loaiPhi) => {
        return (
            <div className='row'>
                <div className='col-md-12'>{this.createTable(loaiPhi)}</div>
                {/* <div className='col-md-4' style={{ marginTop: '10px' }}>Tổng số sinh viên: <b>{this.getData(loaiPhi)?.length?.toString() || ''}</b></div>
                <div className='col-md-4' style={{ marginTop: '10px' }}>Số sinh viên đã áp dụng: <b>{this.getData(loaiPhi)?.daApDungLength?.toString() || ''}</b></div>
                <div className='col-md-4' style={{ marginTop: '10px' }}>Số sinh viên chưa áp dụng: <b>{this.getData(loaiPhi)?.chuaApDungLength?.toString() || ''}</b></div> */}
            </div>
        );
    }

    render = () => {
        let listFormTabs = [];
        this.state.listHocPhi && this.state.listHocPhi.forEach(item => {
            if (this.state.listSinhVienAll[item.loaiPhi]?.length > 0) listFormTabs.push({ title: item.tenLoaiPhi, component: this.componentLoaiPhi(item.loaiPhi) });
        });

        return this.renderModal({
            title: 'Xem trước dữ liệu đồng bộ',
            size: 'elarge',
            isLoading: this.state.isSubmitting,
            submitText: 'Áp dụng',
            body: <div className='row'>
                <div className='col-md-12'>
                    <FormTabs contentClassName='tile-body' tabs={listFormTabs} />
                </div>


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