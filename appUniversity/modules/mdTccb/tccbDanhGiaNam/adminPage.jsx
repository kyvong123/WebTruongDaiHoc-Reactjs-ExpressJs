import React from 'react';
import { connect } from 'react-redux';
import { getTccbDanhGiaNamPage, deleteTccbDanhGiaNam, createTccbDanhGiaNam, updateTccbDanhGiaNam, createTccbDanhGiaNamClone } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell, AdminModal, FormTextBox, FormDatePicker, getValue } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() =>
            this.nam.focus()
        ));
    }

    onShow = (item) => {
        let { nam, donViBatDauDangKy, donViKetThucDangKy, nldBatDauDangKy, nldKetThucDangKy, donViBatDauPheDuyet, donViKetThucPheDuyet, truongBatDauPheDuyet, truongKetThucPheDuyet, caNhanBatDauTuDanhGia, caNhanKetThucTuDanhGia, donViBatDauTuDanhGia, donViKetThucTuDanhGia, donViBatDauPhanCongChuyenVien, donViKetThucPhanCongChuyenVien, donViBatDauDanhGia, donViKetThucDanhGia } = item ? item : { nam: 0, donViBatDauDangKy: 0, donViKetThucDangKy: 0, nldBatDauDangKy: 0, nldKetThucDangKy: 0, donViBatDauPheDuyet: 0, donViKetThucPheDuyet: 0, truongBatDauPheDuyet: 0, truongKetThucPheDuyet: 0, caNhanBatDauTuDanhGia: 0, caNhanKetThucTuDanhGia: 0, donViBatDauTuDanhGia: 0, donViKetThucTuDanhGia: 0, donViBatDauPhanCongChuyenVien: 0, donViKetThucPhanCongChuyenVien: 0, donViBatDauDanhGia: 0, donViKetThucDanhGia: 0 };
        this.setState({ item });
        this.nam.value(nam ? Number(nam) : '');
        this.donViBatDauDangKy.value(donViBatDauDangKy ? Number(donViBatDauDangKy) : '');
        this.donViKetThucDangKy.value(donViKetThucDangKy ? Number(donViKetThucDangKy) : '');
        this.nldBatDauDangKy.value(nldBatDauDangKy ? Number(nldBatDauDangKy) : '');
        this.nldKetThucDangKy.value(nldKetThucDangKy ? Number(nldKetThucDangKy) : '');
        this.donViBatDauPheDuyet.value(donViBatDauPheDuyet ? Number(donViBatDauPheDuyet) : '');
        this.donViKetThucPheDuyet.value(donViKetThucPheDuyet ? Number(donViKetThucPheDuyet) : '');
        this.truongBatDauPheDuyet.value(truongBatDauPheDuyet ? Number(truongBatDauPheDuyet) : '');
        this.truongKetThucPheDuyet.value(truongKetThucPheDuyet ? Number(truongKetThucPheDuyet) : '');
        this.caNhanBatDauTuDanhGia.value(caNhanBatDauTuDanhGia ? Number(caNhanBatDauTuDanhGia) : '');
        this.caNhanKetThucTuDanhGia.value(caNhanKetThucTuDanhGia ? Number(caNhanKetThucTuDanhGia) : '');
        this.donViBatDauTuDanhGia.value(donViBatDauTuDanhGia ? Number(donViBatDauTuDanhGia) : '');
        this.donViKetThucTuDanhGia.value(donViKetThucTuDanhGia ? Number(donViKetThucTuDanhGia) : '');
        this.donViBatDauPhanCongChuyenVien.value(donViBatDauPhanCongChuyenVien ? Number(donViBatDauPhanCongChuyenVien) : '');
        this.donViKetThucPhanCongChuyenVien.value(donViKetThucPhanCongChuyenVien ? Number(donViKetThucPhanCongChuyenVien) : '');
        this.donViBatDauDanhGia.value(donViBatDauDanhGia ? Number(donViBatDauDanhGia) : '');
        this.donViKetThucDanhGia.value(donViKetThucDanhGia ? Number(donViKetThucDanhGia) : '');
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            nam: getValue(this.nam),
            donViBatDauDangKy: Number(getValue(this.donViBatDauDangKy)),
            donViKetThucDangKy: Number(getValue(this.donViKetThucDangKy)),
            nldBatDauDangKy: Number(getValue(this.nldBatDauDangKy)),
            nldKetThucDangKy: Number(getValue(this.nldKetThucDangKy)),
            donViBatDauPheDuyet: Number(getValue(this.donViBatDauPheDuyet)),
            donViKetThucPheDuyet: Number(getValue(this.donViKetThucPheDuyet)),
            truongBatDauPheDuyet: Number(getValue(this.truongBatDauPheDuyet)),
            truongKetThucPheDuyet: Number(getValue(this.truongKetThucPheDuyet)),
            caNhanBatDauTuDanhGia: Number(getValue(this.caNhanBatDauTuDanhGia)),
            caNhanKetThucTuDanhGia: Number(getValue(this.caNhanKetThucTuDanhGia)),
            donViBatDauTuDanhGia: Number(getValue(this.donViBatDauTuDanhGia)),
            donViKetThucTuDanhGia: Number(getValue(this.donViKetThucTuDanhGia)),
            donViBatDauPhanCongChuyenVien: Number(getValue(this.donViBatDauPhanCongChuyenVien)),
            donViKetThucPhanCongChuyenVien: Number(getValue(this.donViKetThucPhanCongChuyenVien)),
            donViBatDauDanhGia: Number(getValue(this.donViBatDauDanhGia)),
            donViKetThucDanhGia: Number(getValue(this.donViKetThucDanhGia)),
        };
        if (changes.donViBatDauDangKy >= changes.donViKetThucDangKy) {
            T.notify('Thời hạn đăng ký của đơn vị không phù hợp', 'danger');
            this.donViBatDauDangKy.focus();
        } else if (changes.nldBatDauDangKy >= changes.nldKetThucDangKy) {
            T.notify('Thời hạn đăng ký của người lao động không phù hợp', 'danger');
            this.nldBatDauDangKy.focus();
        } else if (changes.donViBatDauPheDuyet >= changes.donViKetThucPheDuyet) {
            T.notify('Thời hạn phê duyệt của đơn vị không phù hợp', 'danger');
            this.donViBatDauPheDuyet.focus();
        } else if (changes.truongBatDauPheDuyet >= changes.truongKetThucPheDuyet) {
            T.notify('Thời hạn phê duyệt của trường không phù hợp', 'danger');
            this.truongBatDauPheDuyet.focus();
        } else if (changes.caNhanBatDauTuDanhGia >= changes.caNhanKetThucTuDanhGia) {
            T.notify('Thời gian cá nhân tự đánh giá không phù hợp', 'danger');
            this.caNhanBatDauTuDanhGia.focus();
        } else if (changes.donViBatDauTuDanhGia >= changes.donViKetThucTuDanhGia) {
            T.notify('Thời gian đơn vị tự đánh giá không phù hợp', 'danger');
            this.donViBatDauTuDanhGia.focus();
        } else if (changes.donViBatDauPhanCongChuyenVien >= changes.donViKetThucPhanCongChuyenVien) {
            T.notify('Thời gian đơn vị phân công chuyên viên không phù hợp', 'danger');
            this.donViBatDauPhanCongChuyenVien.focus();
        } else if (changes.donViBatDauDanhGia >= changes.donViKetThucDanhGia) {
            T.notify('Thời gian đơn vị đánh giá không phù hợp', 'danger');
            this.donViBatDauDanhGia.focus();
        } else {
            if (!this.state.item || this.state.item.clone) {
                if (!this.state.item) {
                    this.props.createTccbDanhGiaNam(changes, () => {
                        this.hide();
                        this.props?.history.push(`/user/tccb/danh-gia/${changes.nam}`);
                    });
                } else {
                    this.props.createTccbDanhGiaNamClone(this.state.item.id, changes, () => {
                        this.hide();
                        this.props?.history.push(`/user/tccb/danh-gia/${changes.nam}`);
                    });
                }
            }
            else {
                this.props.updateTccbDanhGiaNam(this.state.item.id, changes, () => this.hide());
            }
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.item ? (this.state.item.clone ? 'Sao chép đánh giá năm' : 'Cập nhật đánh giá năm') : 'Tạo mới đánh giá năm',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='year' ref={e => this.nam = e} label='Năm' className='col-12' required readOnly={readOnly || (this.state.item && !this.state.item.clone)} />
                <FormDatePicker type='time-mask' ref={e => this.donViBatDauDangKy = e} className='col-12 col-md-6' label='Đơn vị bắt đầu đăng ký' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.donViKetThucDangKy = e} className='col-12 col-md-6' label='Đơn vị kết thúc đăng ký' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.nldBatDauDangKy = e} className='col-12 col-md-6' label='Người lao động bắt đầu đăng ký' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.nldKetThucDangKy = e} className='col-12 col-md-6' label='Người lao động kết thúc đăng ký' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.donViBatDauPheDuyet = e} className='col-12 col-md-6' label='Đơn vị bắt đầu phê duyệt' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.donViKetThucPheDuyet = e} className='col-12 col-md-6' label='Đơn vị kết thúc phê duyệt' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.truongBatDauPheDuyet = e} className='col-12 col-md-6' label='Trường bắt đầu phê duyệt' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.truongKetThucPheDuyet = e} className='col-12 col-md-6' label='Trường kết thúc phê duyệt' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.caNhanBatDauTuDanhGia = e} className='col-12 col-md-6' label='Cá nhân bắt đầu tự đánh giá' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.caNhanKetThucTuDanhGia = e} className='col-12 col-md-6' label='Cá nhân kết thúc tự đánh giá' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.donViBatDauTuDanhGia = e} className='col-12 col-md-6' label='Đơn vị bắt đầu tự đánh giá' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.donViKetThucTuDanhGia = e} className='col-12 col-md-6' label='Đơn vị kết thúc tự đánh giá' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.donViBatDauPhanCongChuyenVien = e} className='col-12 col-md-6' label='Đơn vị bắt đầu phân công chuyên viên' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.donViKetThucPhanCongChuyenVien = e} className='col-12 col-md-6' label='Đơn vị kết thúc phân công chuyên viên' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.donViBatDauDanhGia = e} className='col-12 col-md-6' label='Hội đồng đơn vị bắt đầu đánh giá' required readOnly={readOnly} />
                <FormDatePicker type='time-mask' ref={e => this.donViKetThucDanhGia = e} className='col-12 col-md-6' label='Hội đồng đơn vị kết thúc đánh giá' required readOnly={readOnly} />
            </div>
        });
    }
}

class TccbDanhGiaNamPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.showSearchBox();
            this.props.getTccbDanhGiaNamPage(undefined, undefined, { searchTerm: '' });
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa đánh giá năm', 'Bạn có chắc bạn muốn xóa đánh giá năm này?', true, isConfirm =>
            isConfirm && this.props.deleteTccbDanhGiaNam(item.id));
    }

    render() {
        const permission = this.getUserPermission('tccbDanhGiaNam');
        const { list } = this.props.tccbDanhGiaNam && this.props.tccbDanhGiaNam.page ?
            this.props.tccbDanhGiaNam.page : {
                list: []
            };
        let table = renderTable({
            emptyTable: 'Không có dữ liệu đánh giá năm',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm</th>
                    <th style={{ width: '80%', textAlign: 'center', whiteSpace: 'nowrap' }} colSpan={2}>Thông tin</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <>
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'center' }} rowSpan={8} content={index + 1} />
                        <TableCell type='link' url={`/user/tccb/danh-gia/${item.nam}`} rowSpan={8} style={{ textAlign: 'center' }} content={item.nam} />
                        <TableCell style={{ textAlign: 'left' }} content={'Thời hạn đăng kí của đơn vị'} />
                        <TableCell type='link' url={`/user/tccb/danh-gia/${item.nam}/don-vi`} style={{ textAlign: 'center', whiteSpace: 'pre-wrap' }} content={item.donViBatDauDangKy ? `${T.dateToText(item.donViBatDauDangKy, 'dd/mm/yyyy HH:MM')} - ${T.dateToText(item.donViKetThucDangKy, 'dd/mm/yyyy HH:MM')}` : 'Chưa có thời hạn đánh giá'} />
                        <TableCell style={{ textAlign: 'center' }} rowSpan={8} type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete}
                        >
                            <Tooltip title='Sao chép' arrow>
                                <a className='btn btn-info' href='#' onClick={e => e.preventDefault() || permission.write ? this.modal.show({ ...item, nam: '', clone: true }) : T.notify('Vui lòng liên hệ người quản lý!', 'danger')}>
                                    <i className='fa fa-lg fa-clone' />
                                </a>
                            </Tooltip>
                            <Tooltip title='Xem thông tin' arrow>
                                <a className='btn btn-success' href='#' onClick={e => e.preventDefault() || permission.write ? this.props.history.push(`/user/tccb/danh-gia/${item.nam}`) : T.notify('Vui lòng liên hệ người quản lý!', 'danger')}>
                                    <i className='fa fa-lg fa-info' />
                                </a>
                            </Tooltip>
                            <Tooltip title='Thông tin đăng ký đơn vị' arrow>
                                <a className='btn btn-primary' href='#' onClick={() => this.props.history.push(`/user/tccb/danh-gia/${item.nam}/don-vi`)}>
                                    <i className='fa fa-lg fa-users' />
                                </a>
                            </Tooltip>
                            <Tooltip title='Thông tin đăng ký cá nhân' arrow>
                                <a className='btn btn-warning' href='#' onClick={() => this.props.history.push(`/user/tccb/danh-gia-ca-nhan/${item.nam}`)}>
                                    <i className='fa fa-lg fa-user' />
                                </a>
                            </Tooltip>
                        </TableCell>
                    </tr>
                    <tr>
                        <TableCell style={{ textAlign: 'left' }} content={'Thời hạn đăng kí của người lao động'} />
                        <TableCell type='link' url={`/user/tccb/danh-gia-ca-nhan/${item.nam}`} style={{ textAlign: 'center', whiteSpace: 'pre-wrap' }} content={item.nldBatDauDangKy ? `${T.dateToText(item.nldBatDauDangKy, 'dd/mm/yyyy HH:MM')} - ${T.dateToText(item.nldKetThucDangKy, 'dd/mm/yyyy HH:MM')}` : 'Chưa có thời hạn'} />
                    </tr>
                    <tr>
                        <TableCell style={{ textAlign: 'left' }} content={'Thời hạn đơn vị phê duyệt'} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'pre-wrap' }} content={item.donViBatDauPheDuyet ? `${T.dateToText(item.donViBatDauPheDuyet, 'dd/mm/yyyy HH:MM')} - ${T.dateToText(item.donViKetThucPheDuyet, 'dd/mm/yyyy HH:MM')}` : 'Chưa có thời hạn'} />
                    </tr>
                    <tr>
                        <TableCell style={{ textAlign: 'left' }} content={'Thời hạn trường phê duyệt'} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'pre-wrap' }} content={item.truongBatDauPheDuyet ? `${T.dateToText(item.truongBatDauPheDuyet, 'dd/mm/yyyy HH:MM')} - ${T.dateToText(item.truongKetThucPheDuyet, 'dd/mm/yyyy HH:MM')}` : 'Chưa có thời hạn'} />
                    </tr>
                    <tr>
                        <TableCell style={{ textAlign: 'left' }} content={'Thời hạn cá nhân tự đánh giá'} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'pre-wrap' }} content={item.caNhanBatDauTuDanhGia ? `${T.dateToText(item.caNhanBatDauTuDanhGia, 'dd/mm/yyyy HH:MM')} - ${T.dateToText(item.caNhanKetThucTuDanhGia, 'dd/mm/yyyy HH:MM')}` : 'Chưa có thời hạn'} />
                    </tr>
                    <tr>
                        <TableCell style={{ textAlign: 'left' }} content={'Thời hạn đơn vị tự đánh giá'} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'pre-wrap' }} content={item.donViBatDauTuDanhGia ? `${T.dateToText(item.donViBatDauTuDanhGia, 'dd/mm/yyyy HH:MM')} - ${T.dateToText(item.donViKetThucTuDanhGia, 'dd/mm/yyyy HH:MM')}` : 'Chưa có thời hạn'} />
                    </tr>
                    <tr>
                        <TableCell style={{ textAlign: 'left' }} content={'Thời hạn đơn vị phân công chuyên viên'} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'pre-wrap' }} content={item.donViBatDauPhanCongChuyenVien ? `${T.dateToText(item.donViBatDauPhanCongChuyenVien, 'dd/mm/yyyy HH:MM')} - ${T.dateToText(item.donViKetThucPhanCongChuyenVien, 'dd/mm/yyyy HH:MM')}` : 'Chưa có thời hạn'} />
                    </tr>
                    <tr>
                        <TableCell style={{ textAlign: 'left' }} content={'Thời hạn hội đồng đơn vị đánh giá'} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'pre-wrap' }} content={item.donViBatDauDanhGia ? `${T.dateToText(item.donViBatDauDanhGia, 'dd/mm/yyyy HH:MM')} - ${T.dateToText(item.donViKetThucDanhGia, 'dd/mm/yyyy HH:MM')}` : 'Chưa có thời hạn'} />
                    </tr>
                </>
            )
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Đánh giá năm',
            breadcrumb: [
                <Link key={0} to='/user/tccb/'>Tổ chức cán bộ</Link>,
                'Đánh giá năm'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    createTccbDanhGiaNam={this.props.createTccbDanhGiaNam}
                    updateTccbDanhGiaNam={this.props.updateTccbDanhGiaNam}
                    createTccbDanhGiaNamClone={this.props.createTccbDanhGiaNamClone}
                    history={this.props.history}
                    readOnly={!permission.write} />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write ? () => this.modal.show(null) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbDanhGiaNam: state.tccb.tccbDanhGiaNam });
const mapActionsToProps = { getTccbDanhGiaNamPage, deleteTccbDanhGiaNam, createTccbDanhGiaNam, updateTccbDanhGiaNam, createTccbDanhGiaNamClone };
export default connect(mapStateToProps, mapActionsToProps)(TccbDanhGiaNamPage);