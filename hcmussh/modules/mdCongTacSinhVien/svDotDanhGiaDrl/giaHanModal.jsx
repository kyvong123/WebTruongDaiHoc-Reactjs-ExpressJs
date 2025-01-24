import React from 'react';
import { connect } from 'react-redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { AdminModal, FormTextBox, FormSelect, FormDatePicker, TableCell, renderTable, FormRichTextBox, getValue } from 'view/component/AdminPage';
// import { Tooltip } from '@mui/material';
import { getDrlGiaHanKhoaDssv } from 'modules/mdTccb/tccbDanhGiaDrl/redux/danhGiaDrlRedux';
import { updateDrlGiaHanKhoa } from './redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import T from 'view/js/common';

export class LyDoModal extends AdminModal {
    onShow = (item) => {
        item && item.onHide && this.onHidden(item.onHide);
        const { id, dsSinhVien } = item ? item : { id: null, dsSinhVien: [] };
        this.setState({ id, dsSinhVien, item });
    }

    onSubmit = () => {
        const { id, dsSinhVien } = this.state;
        const changes = {
            lyDo: getValue(this.lyDo),
            dsSinhVien: dsSinhVien,
            tinhTrang: 'R'
        };
        T.confirm('Từ chối', 'Bạn có chắc muốn từ chối gia hạn cho đăng ký này', isConfirm => {
            if (isConfirm) {
                this.props.updateDrlGiaHanKhoa(id, changes, () => {
                    // this.onHidden(() => $(this.props.giaHanModal).modal('hide'));
                    // setTimeout(() => this.hide(), 1000);
                    this.modal.removeEventListener('hide.bs.modal', this.state.item.onHide);
                    // $(this.modal).addEventListener('hide.bs.modal', function (ev) {
                    //     // do something
                    // }, { once: true });
                    // this.hide();
                    setTimeout(() => this.hide(), 1300);
                    // setTimeout(() => this.props.GiaHanModal.hide(), 300);
                });
            }
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Lý do từ chối',
            size: 'small',
            body:
                <>
                    <div className='row'>
                        <FormRichTextBox ref={e => this.lyDo = e} className='col-md-12' label='Lý do từ chối (không bắt buộc)' />
                    </div>
                </>,
        });
    }
}


class GiaHanModal extends AdminModal {
    state = { dsSinhVien: [], id: null, thongTinDot: null, tinhTrang: null, isTuChoi: false }
    onShow = (item) => {
        const { id, namHoc, hocKy, thongTinDot, thoiGianGiaHan, maKhoa, tinhTrang } = item ? item : { id: null, thongTinDot: null, namHoc: '', hocKy: '', tenDot: '', thoiGianGiaHan: '', maKhoa: '', tinhTrang: '' };
        this.props.getDrlGiaHanKhoaDssv(id, (data) => {
            this.setState({ id, thongTinDot, dsSinhVien: data, tinhTrang });
        });
        this.namHoc.value(namHoc || '');
        this.thoiGianGiaHan.value(thoiGianGiaHan ? new Date(thoiGianGiaHan) : null);
        this.hocKy.value(hocKy || '');
        this.tenDot.value(thongTinDot.ten || '');
        this.khoaDangKy.value(maKhoa || '');
    };

    chapNhanGiaHan = () => {
        try {
            const { id } = this.state,
                data = {
                    tinhTrang: 'A',
                    timeEnd: getValue(this.thoiGianGiaHan)?.setHours(23, 59, 59)
                };
            T.confirm('Chấp nhận', 'Bạn có chắc muốn chấp nhận gia hạn cho đăng ký này', isConfirm => {
                if (isConfirm) {
                    this.props.updateDrlGiaHanKhoa(id, data, () => {
                        this.props.onSubmit && this.props.onSubmit();
                        this.hide();
                    });
                }
            });
        } catch (error) {
            T.notify('Vui lòng chọn hạn chót gia hạn!', 'danger');
            error.props && error.focus();
        }
    }

    tuChoiGiaHan = () => {
        const { id } = this.state;
        T.confirm('Từ chối', 'Bạn có chắc muốn từ chối gia hạn cho đăng ký này', isConfirm => {
            if (isConfirm) {
                this.props.updateDrlGiaHanKhoa(id, {
                    tinhTrang: 'R',
                    lyDo: getValue(this.lyDo)
                }, () => {
                    this.props.onSubmit && this.props.onSubmit();
                    this.hide();
                    // this.props.setDataGiaHan(thongTinDot.id, () => {
                    //     this.hide();
                    // });
                });
            }
        });
    }

    render = () => {
        // const readOnly = this.props.readOnly;
        const { isTuChoi, tinhTrang } = this.state;
        let table = renderTable({
            emptyTable: '',
            stickyHead: false,
            header: 'thead-light',
            loadingStyle: { backgroundColor: 'white' },
            className: this.state.quickAction ? 'table-fix-col' : '',
            getDataSource: () => this.state.dsSinhVien,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '10%' }}>MSSV</th>
                    <th style={{ width: '40%' }}>Họ và tên</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Khoa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Lớp</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Hệ đào tạo</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>
                    {/* <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th> */}
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.lop || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.heDaoTao || ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tinhTrang || ''} />
                    {/* <TableCell type='buttons' style={{}} content={item}>
                        {!readOnly &&<Tooltip title={'Xem chi tiết'}>
                            <button className='btn btn-danger' type='button' onClick={() => this.deleteStudent(item.mssv)}>
                                <i className='fa fa-lg fa-trash' />
                            </button>
                        </Tooltip>}
                    </TableCell> */}
                </tr>
            )
        });
        return this.renderModal({
            title: (this.state.id) ? 'Chỉnh sửa đăng ký gia hạn đánh giá điểm rèn luyện' : 'Tạo mới đăng ký gia hạn đánh giá điểm rèn luyện',
            size: 'elarge',
            body:
                <>
                    <div className='row'>
                        <FormTextBox ref={e => this.namHoc = e} className='col-md-4' label='Năm học' type='scholastic' required readOnly={true} />
                        <FormSelect ref={e => this.hocKy = e} className='col-md-4' label='Học kỳ' data={SelectAdapter_DtDmHocKy} required readOnly={true} />
                        <FormTextBox ref={e => this.tenDot = e} className='col-md-4' label='Tên đợt' required readOnly={true} />
                        <FormDatePicker ref={e => this.thoiGianGiaHan = e} className='col-md-6' label='Hạn chót gia hạn' required readOnly={tinhTrang != 'N' || this.state.isTuChoi} />
                        <FormSelect ref={e => this.khoaDangKy = e} className='col-md-4' label='Khoa đăng ký' data={SelectAdapter_DmDonViFaculty_V2} required readOnly={true} />
                        {this.state.isTuChoi && <FormRichTextBox ref={e => this.lyDo = e} className='col-md-12' label='Lý do (không bắt buộc)' />}
                    </div>
                    <div>{table}</div>
                </>,
            postButtons: tinhTrang == 'N' && [
                !isTuChoi && <>
                    <button className='btn btn-success' type='button' onClick={() => this.chapNhanGiaHan()}>
                        Chấp nhận
                    </button>
                </>,
                !isTuChoi && <>
                    <button className='btn btn-danger' type='button' onClick={() => this.setState({ isTuChoi: true })}>
                        Từ chối
                    </button>
                </>,
                isTuChoi && <>
                    <button className='btn btn-primary' type='button' onClick={() => this.tuChoiGiaHan()}>
                        Lưu
                    </button>
                </>,
                isTuChoi && <>
                    <button className='btn btn-info' type='button' onClick={() => this.setState({ isTuChoi: false })}>
                        Trở lại
                    </button>
                </>,
            ]
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDrlGiaHanKhoaDssv, updateDrlGiaHanKhoa };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(GiaHanModal);