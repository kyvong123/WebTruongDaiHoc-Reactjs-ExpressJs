
import { SelectAdapter_TcDotDong } from 'modules/mdKeHoachTaiChinh/tcDotDong/redux';
import { SelectAdapter_TcLoaiPhi } from 'modules/mdKeHoachTaiChinh/tcLoaiPhi/redux';
import React from 'react';
import { AdminModal, FormSelect, renderTable, TableCell } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';


const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 13).reverse();
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];
export default class UpLoadNoModal extends AdminModal {

    onShow = () => {
        this.year?.value('');
        this.term?.value('');
        this.dotDong?.value('');
        this.loaiPhi?.value('');
    }
    componentDidMount() {
        this.setState({ isLoading: false });
        this.fileBox.setData('TcHocPhiNoCu');
    }
    onSubmit = () => {
        this.setState({ isLoading: true });
        const data = {
            namHoc: this.year.value(),
            hocKy: this.term.value(),
            loaiPhi: this.loaiPhi.value(),
            dotDong: this.dotDong.value()
        };

        this.fileBox.onUploadFile(data);
    }
    onSuccess = (data) => {
        if (data.typeReturn == 1) {
            T.notify('Loại phí không tồn tại trong đợt đóng', 'danger');
            this.setState({ isLoading: false });
            this.hide();
        }
        else if (data.error) {
            T.notify('Cập nhật dữ liệu nợ thất bại', 'danger');
            this.setState({ isLoading: false });
            this.hide();
        } else if (data.typeReturn == 2) {
            this.setState({ isLoading: false, listSuccess: data.listSuccess, listError: data.listError });
        }
        else if (data.typeReturn == 0) {
            this.setState({ isLoading: false, listSuccess: data.listSuccess });
        }
    }
    render = () => {

        let tableSuccess = renderTable({
            emptyTable: 'Không có dữ liệu nợ được import',
            getDataSource: () => this.state.listSuccess || [], stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã số sinh viên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'left' }}>Họ và tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiền nợ đã thêm (VNĐ)</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.fullName} />
                    <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soTien} />
                </tr>
            )
        });

        let tableError = renderTable({
            emptyTable: 'Không có dữ liệu lỗi',
            getDataSource: () => this.state.listError || [], stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã số sinh viên</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'left' }}>Họ và tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiền nợ cầm thêm (VNĐ)</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.fullName} />
                    <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soTien} />
                </tr>
            )
        });
        return this.renderModal({

            title: 'Tải lên danh sách nợ',
            size: 'large',
            isLoading: this.state.isLoading,
            submitText: 'Tải lên',
            body: <div className='row'>
                <FormSelect className='col-md-4' ref={e => this.year = e} placeholder='Năm học' data={yearDatas()} disabled={this.state.isLoading} />
                <FormSelect className='col-md-4' ref={e => this.term = e} placeholder='Học kỳ' data={termDatas} disabled={this.state.isLoading} />
                <FormSelect className='col-md-4' ref={e => this.loaiPhi = e} placeholder='Loại Phí' data={SelectAdapter_TcLoaiPhi} disabled={this.state.isLoading} />
                <FormSelect className='col-md-12' ref={e => this.dotDong = e} placeholder='Đợt thu học phí' data={SelectAdapter_TcDotDong} disabled={this.state.isLoading} />
                <div className='col-md-12'>
                    <FileBox pending={true} ref={e => this.fileBox = e} postUrl='/user/upload' uploadType='TcHocPhiNoCu' userData='TcHocPhiNoCu' success={this.onSuccess} />

                </div>
                <div className="col-md-12" style={{ marginTop: 8 }}>
                    {
                        this.state.listSuccess?.length > 0 ? <h4> Danh sách sinh viên được gán nợ thành công</h4> : <></>
                    }
                    {
                        this.state.listSuccess?.length > 0 ?
                            tableSuccess
                            :
                            <></>
                    }
                </div>

                <div className="col-md-12" style={{ marginTop: 8 }}>
                    {
                        this.state.listError?.length > 0 ? <h4> Danh sách sinh viên bị trùng lặp khoản nợ khi gán</h4> : <></>
                    }
                    {
                        this.state.listError?.length ?
                            tableError
                            :
                            <></>
                    }
                </div>
                {/* <ResultModal ref={e => this.ResultModal = e} /> */}

            </div>
        });
    }
}


