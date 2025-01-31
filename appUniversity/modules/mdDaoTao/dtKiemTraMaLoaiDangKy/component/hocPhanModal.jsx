import React from 'react';
import { connect } from 'react-redux';
import { renderDataTable, TableCell, TableHead, AdminModal, FormTextBox, FormSelect, loadSpinner } from 'view/component/AdminPage';

import { getDetailMonHoc, updateMaLoaiDangKy } from 'modules/mdDaoTao/dtKiemTraMaLoaiDangKy/redux';

class HocPhanModal extends AdminModal {
    state = { hocPhan: null, listHocPhan: [], isLoading: false }
    loaiDangKy = [
        { id: 'KH', text: 'Trong kế hoạch' },
        { id: 'NKH', text: 'Ngoài kế hoạch' },
        { id: 'NCTDT', text: 'Ngoài chương trình đào tạo' },
        { id: 'CT', text: 'Cải thiện' },
        { id: 'HL', text: 'Học lại' },
        { id: 'HV', text: 'Học vượt' }
    ]
    mapperLoaiDangKy = {
        'KH': <span><i className='fa fa-lg fa-sign-in' /> KH</span>,
        'NKH': <span><i className='fa fa-lg fa-sign-out' /> NKH</span>,
        'NCTDT': <span><i className='fa fa-lg fa-info-circle' /> NCTĐT</span>,
        'CT': <span><i className='fa fa-lg fa-chevron-circle-right' /> CT</span>,
        'HL': <span><i className='fa fa-lg fa-repeat' /> HL</span>,
        'HV': <span><i className='fa fa-lg fa-chevron-circle-up' /> HV</span>,
    }

    componentDidMount() {
        this.disabledClickOutside();
    }

    onShow = (hocPhan) => {
        this.setState({ hocPhan, isLoading: true }, () => {
            this.maLoaiDkyCu.value(hocPhan.maLoaiDky);
            this.maLoaiDkyMoi.value('');
            this.ghiChu.value('');
            this.props.getDetailMonHoc({ maSoSv: this.props.mssv, maMon: hocPhan.maMonHoc }, (data) =>
                this.setState({ listHocPhan: data, isLoading: false }));
        });
    }

    onSave = () => {
        let maLoaiDkyCu = this.maLoaiDkyCu.value(),
            maLoaiDkyMoi = this.maLoaiDkyMoi.value(),
            ghiChu = this.ghiChu.value();
        if (!maLoaiDkyMoi) {
            T.notify('Chưa chọn mã loại đăng ký mới!', 'danger');
            this.maLoaiDkyMoi.focus();
        } else if (maLoaiDkyCu == maLoaiDkyMoi) {
            T.notify('Mã loại đăng ký mới trùng với mã loại đăng ký cũ!', 'danger');
            this.maLoaiDkyMoi.focus();
        } else if (!ghiChu) {
            T.notify('Chưa nhập ghi chú!', 'danger');
            this.ghiChu.focus();
        } else {
            T.confirm('Cảnh báo', 'Bạn có chắc muốn chỉnh sửa mã loại đăng ký của học phần?', 'warning', true, isConfirm => {
                if (isConfirm) {
                    let { hocPhan } = this.state,
                        mssv = this.props.mssv,
                        filter = { maHocPhan: hocPhan.maHocPhan, mssv, maLoaiDky: maLoaiDkyMoi, ghiChu };
                    this.props.updateMaLoaiDangKy(filter, (data) => {
                        if (!data.error) {
                            T.alert('Cập nhật mã loại đăng ký học phần thành công', 'success', false, 1000);
                            this.props.getKetQuaDangKyHocPhan();
                            this.hide();
                            this.setState({ hocPhan: null, listHocPhan: [] });
                        }
                    });
                }
            });
        }
    }

    renderHocPhan = (list) => renderDataTable({
        data: list,
        emptyTable: 'Không tìm thấy học phần!',
        header: 'thead-light',
        stickyHead: true,
        divStyle: { height: '40vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhan' />
                <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã môn học' keyCol='maMonHoc' />
                <TableHead style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn học' keyCol='tenMonHoc' />
                <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã loại đăng ký' keyCol='maLoaiDky' />
                <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Điểm tổng kết' keyCol='diemTongKet' />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Năm học' keyCol='namHoc' />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Học kỳ' keyCol='hocKy' />
            </tr>
        ),
        renderRow: (item, index) => {
            return (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maHocPhan} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maMonHoc} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maLoaiDky && this.mapperLoaiDangKy[item.maLoaiDky] ? this.mapperLoaiDangKy[item.maLoaiDky] : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.diemTongKet} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namHoc} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.hocKy} />
                </tr >
            );
        }
    });

    render = () => {
        let { hocPhan, listHocPhan, isLoading } = this.state;
        return this.renderModal({
            title: `Đổi mã loại đăng ký học phần: ${hocPhan?.maHocPhan}`,
            size: 'elarge',
            body: <>
                <div className='row'>
                    <FormSelect ref={e => this.maLoaiDkyCu = e} className='col-md-6' label='Mã loại đăng ký cũ' data={this.loaiDangKy} required readOnly />
                    <FormSelect ref={e => this.maLoaiDkyMoi = e} className='col-md-6' label='Mã loại đăng ký mới' data={this.loaiDangKy} required
                        onChange={value => this.setState({ maLoaiDkyMoi: value.id })} />
                    <FormTextBox ref={e => this.ghiChu = e} type='text' className='col-md-12' label='Ghi chú' required />
                </div>
                <div className='row'>
                    <h5 className='col-md-12 tile-title'>Danh sách học phần đã đăng ký cho môn {hocPhan?.maMonHoc}</h5>
                    <div className='col-md-12'>
                        {isLoading ? loadSpinner() : this.renderHocPhan(listHocPhan)}
                    </div>
                </div>
            </>,
            buttons: <button type='button' className='btn btn-primary' onClick={e => e.preventDefault() || this.onSave()}>
                <i className='fa fa-fw fa-lg fa-save' />Lưu
            </button>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDetailMonHoc, updateMaLoaiDangKy };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(HocPhanModal);
