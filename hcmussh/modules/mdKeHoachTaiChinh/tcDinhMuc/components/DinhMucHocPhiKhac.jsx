import React from 'react';
import { AdminModal, FormTabs, renderTable, TableCell } from 'view/component/AdminPage';

export default class CauHinhHocPhiKhac extends AdminModal {
    state = { isSubmitting: false }

    onShow = (item) => {
        this.props.getDinhMuc(item, res => {
            this.setState({ listDinhPhi: res.listDinhPhi, listLoaiPhi: res.listLoaiPhi });
        });
    }

    getData = (loaiPhi) => this.state.listDinhPhi?.[loaiPhi] || [];

    onSubmit = (e) => {
        let filter = this.state.filter;
        filter.apDung = this.apDung.value() ? 1 : 0;
        filter.taiApDung = this.taiApDung.value() ? 1 : 0;
        filter.hienThi = this.hienThi.value() ? 1 : 0;

        if (!filter.apDung && !filter.taiApDung) {
            T.notify('Vui lòng chọn loại sinh viên được áp dụng', 'danger');
        }
        else {
            this.setState({ isSubmitting: true }, () => {
                this.props.apDung(filter, res => {
                    T.notify(`Đã áp dụng đợt đóng thành công (Số lượng áp dụng: ${res})`, 'success');
                    this.setState({ isSubmitting: false });
                    this.hide();
                });
            });
        }
        e.preventDefault();
    }

    createTable = (loaiPhi) => renderTable({
        emptyTable: 'Không có dữ liệu sinh viên áp dụng',
        getDataSource: () => this.state.listDinhPhi?.[loaiPhi] || [],
        stickyHead: false,
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Năm học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Học kỳ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã môn học</th>
                <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tên môn học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiền (VNĐ)</th>
            </tr>
        ),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={index + 1} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`${item.namHoc} - ${item.namHoc + 1}`} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`HK${item.hocKy}`} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.maMonHoc} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc)?.vi || ''} />
                <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soTien} />
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
        this.state.listLoaiPhi && this.state.listLoaiPhi.forEach(item => {
            listFormTabs.push({ title: item.ten, component: this.componentLoaiPhi(item.ma) });
        });

        return this.renderModal({
            title: 'Định mức loại học phí khác',
            size: 'large',
            isLoading: this.state.isSubmitting,
            submitText: 'Áp dụng',
            body: <div className='row'>
                <div className='col-md-12'>
                    <FormTabs contentClassName='tile-body' tabs={listFormTabs} />
                </div>
            </div>
        }
        );
    }
}