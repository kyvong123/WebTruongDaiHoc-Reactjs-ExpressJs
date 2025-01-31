import React from 'react';
import { AdminModal, FormSelect, FormTextBox } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { DtThoiKhoaBieuGetNotFree, DtThoiKhoaBieuGetDataHocPhan, FullScheduleGenerated } from '../redux';
import { SelectAdapter_FwCanBoGiangVien } from 'modules/mdTccb/tccbCanBo/redux';

class ChangeTKBModal extends AdminModal {

    state = { listTrung: [], dataRet: [] }

    onShow = (item) => {
        this.props.DtThoiKhoaBieuGetDataHocPhan(item.maHocPhan, data => {
            this.init(item, data);
        });
    }

    init = (item, data) => {
        let { maHocPhan, tenMonHoc, tietBatDau, soTietBuoi, soLuongDuKien, phong, maLop, coSo, giangVien, troGiang } = item;

        data.fullData[0] = { ...data.fullData[0], phong, soTietBuoi, tietBatDau, maLop, soLuongDuKien };

        let valid = this.checkValid(data.fullData[0], data.dataTiet);

        this.props.DtThoiKhoaBieuGetNotFree({ idThoiKhoaBieu: data.fullData[0].id }, [...new Set([...giangVien, ...troGiang])], result => {
            let { gvHienTai } = result;

            const setData = (gvHienTai) => {
                this.setState({ gvHienTai, giangVien, troGiang, data: data.fullData[0], valid }, () => {
                    this.maHocPhan.value(maHocPhan);
                    this.tenMonHoc.value(T.parse(tenMonHoc, { vi: '' })?.vi);
                    this.lop.value(maLop.join(','));
                    this.soLuongDuKien.value(soLuongDuKien || 0);
                    this.phong.value(phong || '');
                    this.tietBatDau.value(tietBatDau || '');
                    this.soTiet.value(soTietBuoi || '');
                    this.coSo.value(coSo);
                    this.giangVien.value(giangVien);
                    this.troGiang.value(troGiang);
                });
            };

            if (gvHienTai) {
                SelectAdapter_FwCanBoGiangVien.fetchOne(gvHienTai.giangVien, gv => {
                    gvHienTai = `Trùng lịch dạy của giảng viên ${gv.text} ngày ${T.dateToText(gvHienTai.ngayBatDau, 'dd/mm/yyyy')}`;
                    T.notify(gvHienTai, 'danger');
                    setData();
                });
            } else {
                setData();
            }

        });
    }

    checkValid = (fullData, dataCaHoc) => {
        let { soTietBuoi, tietBatDau, coSo } = fullData;
        if (tietBatDau && soTietBuoi) {
            let tietKetThuc = parseInt(tietBatDau) + parseInt(soTietBuoi) - 1;

            let dataKetThuc = dataCaHoc.filter(i => i.maCoSo == coSo).find(item => item.ten == tietKetThuc);
            let dataBatDau = dataCaHoc.filter(i => i.maCoSo == coSo).find(item => item.ten == tietBatDau);

            if (!dataKetThuc) {
                T.alert('Không tồn tại tiết kết thúc', 'error', false);
                return false;
            }

            if (dataBatDau.buoi != dataKetThuc.buoi) {
                T.alert('Bắt đầu và kết thúc ở 2 buổi khác nhau!', 'error', false);
                return false;
            }
        }
        return true;
    }

    onSubmit = () => {
        let { data, giangVien, troGiang } = this.state;
        let { tietBatDau, soTietBuoi, soLuongDuKien, phong, maLop, ngayBatDau, ngayKetThuc, thu, id, maHocPhan } = data;
        let dataChange = {
            tietBatDau, soTietBuoi, soLuongDuKien, phong, maLop, ngayBatDau, ngayKetThuc, thu, maHocPhan
        };
        T.confirm('Thay đổi thông tin thời khóa biểu', `Bạn có chắc chắn muốn đổi thông tin của học phần ${data.maHocPhan}: ${T.parse(data.tenMonHoc, { vi: '' })?.vi} không?`, 'warning', true, isConfirm => {
            if (isConfirm) {
                giangVien = giangVien.map(i => ({ giangVien: i, type: 'GV' }));
                troGiang = troGiang.map(i => ({ giangVien: i, type: 'TG' }));
                this.props.update(id, { dataChange, dataGV: [...giangVien, ...troGiang] }, () => {
                    this.props.handleUpdate();
                    this.hide();
                });
            }
        });
    }

    render = () => {
        let { gvHienTai, valid } = this.state;
        return this.renderModal({
            title: 'Cập nhật học phần',
            size: 'elarge',
            isShowSubmit: !gvHienTai && valid,
            body: <div>
                <div className='row'>
                    <FormTextBox ref={e => this.maHocPhan = e} className='col-md-4' readOnly label='Mã học phần' />
                    <FormTextBox ref={e => this.tenMonHoc = e} className='col-md-8' readOnly label='Tên học phần' />
                    <FormTextBox ref={e => this.lop = e} className='col-md-2' label='Lớp' readOnly />
                    <FormTextBox ref={e => this.coSo = e} className='col-md-2' label='Cơ sở' readOnly />
                    <FormTextBox ref={e => this.soLuongDuKien = e} className='col-md-2' label='Số lượng dự kiến' readOnly />
                    <FormTextBox ref={e => this.phong = e} className='col-md-2' label='Phòng' readOnly />
                    <FormTextBox ref={e => this.tietBatDau = e} className='col-md-2' label='Tiết bắt đầu' readOnly />
                    <FormTextBox ref={e => this.soTiet = e} className='col-md-2' label='Số tiết/buổi' readOnly />
                    <FormSelect ref={e => this.giangVien = e} data={SelectAdapter_FwCanBoGiangVien} className='col-md-6' label='Giảng viên' readOnly multiple allowClear />
                    <FormSelect ref={e => this.troGiang = e} data={SelectAdapter_FwCanBoGiangVien} className='col-md-6' label='Trợ giảng' readOnly multiple allowClear />
                </div>
                {
                    gvHienTai && <div>
                        <p style={{ color: 'red', fontWeight: 'bold' }}>{gvHienTai}</p>
                    </div>
                }
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    DtThoiKhoaBieuGetNotFree, DtThoiKhoaBieuGetDataHocPhan, FullScheduleGenerated,
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ChangeTKBModal);