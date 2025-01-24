import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, FormTextBox, FormDatePicker } from 'view/component/AdminPage';
import { SelectAdapter_FwCanBoGiangVien } from '../../../mdTccb/tccbCanBo/redux';
import { updateSdhHocPhanMulti } from '../redux';
import { getDtDmThuAll } from 'modules/mdDaoTao/dtDmThu/redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { SelectAdapter_DmCaHoc } from 'modules/mdDanhMuc/dmCaHoc/redux';

import { getSdhHocPhanByMaHocPhan } from 'modules/mdSauDaiHoc/sdhLopHocVienHocPhan/redux';
import { SelectAdapter_DmPhongByCoSo } from 'modules/mdDanhMuc/dmPhong/redux';

class InfoHocPhan extends AdminPage {
    state = {
        CTDT: null, change: false, dmThu: [], isEdit: true,
        data: null, editGV: null, preSoBuoi: null, coSo: '', dmTiet: []
    };
    thu = []; thucHanh = []; tietBatDau = []; soTietBuoi = []; giangVien = [];
    tongTiet = []; editGV = [];
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getDtDmThuAll(data => this.setState({ dmThu: data.items }));
        });
    }

    reset = () => {
        this.ngayBatDau.value('');
        this.setState({
            data: null, rawData: [],
            isDuyet: false, CTDT: null, isEdit: true,
        }, () => this.ngayBatDau.value(''));
    }

    value = (rawData, CTDT) => {
        const data = [...rawData];
        let isDuyet = false;
        //for first time recieve data from parrent set rawdata for revert change 
        if (!this.state.data) {
            if (data[0].isDuyet) isDuyet = true;
            this.setState({ rawData: data, isDuyet, CTDT: CTDT });
            data[0].maHocPhan ? this.props.getSdhHocPhanByMaHocPhan(data[0].maHocPhan, items => {
                this.setState({ dsLop: items ? items : [] });
            }) : null;
        }
        //set value from parent or after  adding time
        this.ngayBatDau.value(data[0].ngayBatDau || '');
        this.ngayKetThuc.value(data[0].ngayKetThuc ? data[0].ngayKetThuc : null);
        this.soBuoi.value(data.length);
        this.coSo.value(data[0].coSo);
        this.setState({ data: data, preSoBuoi: data.length, coSo: data[0].coSo }, () => {
            this.phong.value(data[0].phong);
            let editGV = this.state.editGV ? [...this.state.editGV] : [];
            this.maHocPhan.value(data[0].maHocPhan);
            this.monHoc.value(data[0].maMonHoc + ': ' + data[0].tenMonHoc);
            this.khoa.value(data[0].tenKhoa);
            let tinChiLyThuyet = data[0].tinChiLyThuyet,
                tinChiThucHanh = data[0].tinChiThucHanh;
            this.tongTiet.value(tinChiLyThuyet * 15 + tinChiThucHanh * 15);
            this.tietLyThuyet.value(tinChiLyThuyet * 15);
            this.tietThucHanh.value(tinChiThucHanh ? tinChiThucHanh * 15 : '0');
            data.forEach((item, index) => {
                this.thu[index].value(item.thu ? item.thu : null);
                this.tietBatDau[index].value(item.tietBatDau ? item.tietBatDau : null);
                this.soTietBuoi[index].value(item.soTietBuoi ? item.soTietBuoi : null);
                editGV[index] = item.thu && item.tietBatDau && item.soTietBuoi;
                this.giangVien[index].value(item.giangVien ? item.giangVien : null);
            });
            this.setState({ editGV });
        });
    }

    enableEditGV = () => {
        let editGV = this.state.editGV ? [...this.state.editGV] : [];
        this.tietBatDau.forEach((i, index) => {
            editGV[index] = ((this.thu[index] && !this.thu[index].value()) ||
                (this.tietBatDau[index] && !this.tietBatDau[index].value()) ||
                (this.soTietBuoi[index] && !this.soTietBuoi[index].value()) ||
                (!this.ngayBatDau.value())) ? false : true;
        });
        this.setState({ editGV });
    }

    addingNew = (number) => {
        let data = [...this.state.data];
        let curItemIndex = data.length - 1;
        for (let i = 0; i <= curItemIndex; i++) {
            data[i].thu = this.thu[i].value();
            data[i].tietBatDau = this.tietBatDau[i].value();
            data[i].soTietBuoi = this.soTietBuoi[i].value();
            data[i].ngayBatDau = this.ngayBatDau.value();
            data[i].ngayKetThuc = this.ngayKetThuc.value();
            data[i].giangVien = this.giangVien[i].value();
            data[i].coSo = this.coSo.value();
            data[i].phong = this.phong.value();
        }
        for (let i = 0; i < number; i++) {
            let newItem = { ...data[0] };
            newItem.id = newItem.thu = newItem.tietBatDau
                = newItem.soTietBuoi = newItem.giangVien = null;
            data.push(newItem);
        }
        this.value(data);
    }

    resetTietBatDau = () => {
        //change coSo => reset time
        this.phong.value('');
        this.tietBatDau.length && this.tietBatDau.forEach(i => i && i.value(''));
        this.enableEditGV();
    }
    revertChange = () => {
        this.value(this.state.rawData);
    }

    checkDupInfo = (list) => {
        const size = list.length,
            listGV = [];
        let error = '';
        for (let i = 0; i < size; i++) {
            !listGV.includes(list[i].giangVien) && listGV.push(list[i].giangVien);
            for (let j = i + 1; j < size; j++) {
                if (list[i].thu != list[j].thu) continue;
                else {
                    const TBD1 = Number(list[i].tietBatDau),
                        STB1 = Number(list[i].soTietBuoi),
                        TBD2 = Number(list[j].tietBatDau),
                        STB2 = Number(list[j].soTietBuoi);
                    if (TBD2 >= TBD1 && TBD2 <= (TBD1 + STB1 - 1)) error = `Thời gian môn học không hợp lệ ở mục ${i + 1} và ${j + 1}`;
                    else if (TBD1 >= TBD2 && TBD1 <= (TBD2 + STB2 - 1)) error = `Thời gian môn học không hợp lệ  ở mục ${i + 1} và ${j + 1}`;
                    else if (TBD2 == (TBD1 + STB1 && (STB1 + STB2 >= 6))) error = `Khoảng nghỉ giữa hai giờ học không đảm bảo ở mục ${i + 1} và ${j + 1}`;
                    else if (TBD1 == (TBD2 + STB2 && (STB1 + STB2 >= 6))) error = `Khoảng nghỉ giữa hai giờ học không đảm bảo ở mục ${i + 1} và ${j + 1}`;
                }
            }
        }
        if (listGV.length >= 3)
            error = 'Học phần có quá nhiều giảng viên phụ trách';
        return error;
    }

    checkChange = () => {
        if (this.state.data && this.state.rawData && (JSON.stringify(this.state.data) != JSON.stringify(this.state.rawData)))
            return true;
        else return false;
    }

    handleSoBuoi = (value) => {
        let data = [...this.state.data],
            { preSoBuoi } = this.state, valueNum = value;
        if (valueNum < preSoBuoi) {
            data.splice(valueNum, preSoBuoi - valueNum);
            //hold current change information
            for (let i = 0; i < data.length; i++) {
                data[i].thu = this.thu[i].value();
                data[i].tietBatDau = this.tietBatDau[i].value();
                data[i].soTietBuoi = this.soTietBuoi[i].value();
                data[i].giangVien = this.giangVien[i].value();
                data[i].coSo = this.coSo.value();
                data[i].phong = this.phong.value();
            }
            T.confirm('Xóa giờ học', 'Bạn có chắc bạn muốn xóa bớt giờ học?', true,
                isConfirm => isConfirm ? this.value(data) : this.soBuoi.value(preSoBuoi));
        }
        else if (valueNum > preSoBuoi) {
            this.addingNew(valueNum - preSoBuoi);
        }
        else null;
        //caldate again when change buoi
        this.autoEndDate();
    }


    autoEndDate = () => {
        if (this.ngayBatDau.value()) {
            let stableThu = parseInt(this.thu[0].value());
            let tongTiet = this.state.data[0].tinChiLyThuyet * 15,
                ngayBatDau = this.ngayBatDau.value(),
                soTiet = 0, tuan = 0;
            this.soTietBuoi.forEach((item, index) => {
                soTiet += item && item.value() ? parseInt(item.value()) : 0;
                tuan += this.thu[index] && this.thu[index].value() && (parseInt(this.thu[index].value()) > stableThu) ? 1 : 0;
            });
            tuan += (tongTiet % soTiet == 0) ? (tongTiet / soTiet) : (tongTiet / soTiet + 1);
            let endDate = tuan && soTiet ? tuan * 7 * 86400000 + Number(new Date(ngayBatDau).getTime()) : null;
            this.ngayKetThuc.value(endDate);
        }
    }

    //pick Thu auto when pick start date
    autoThu = (value) => {
        let date = new Date(value);
        let thu = date.getDay();
        let item = thu == 0 ? this.state.dmThu[6] : this.state.dmThu.find(i => i.ma == thu + 1);
        if (item.kichHoat != 0) {
            this.thu[0].value(item.ma);
        }
        else {
            T.notify('Thứ hiện tại không nằm trong kế hoạch giảng dạy', 'danger');
            this.ngayBatDau.focus();
        }
    }

    checkFullData = () => {
        const data = this.state.data;
        let flag = true;
        data.forEach(item => {
            if (!item.thu || !item.tietBatDau || !item.soTietBuoi || !item.ngayBatDau || !item.giangVien || !item.ngayKetThuc)
                flag = false;
        });
        return flag;
    }
    saveData = (done) => {

        let data = [...this.state.data];
        let begindate = this.ngayBatDau.value() ? Number(this.ngayBatDau.value()) : null,
            enddate = this.ngayKetThuc.value() ? Number(this.ngayKetThuc.value()) : null;
        data.forEach((item, index) => {
            item.ngayBatDau = begindate;
            item.ngayKetThuc = enddate;
            item.coSo = this.coSo.value();
            item.phong = this.phong.value();
            item.thu = this.thu[index].value();
            item.tietBatDau = this.tietBatDau[index].value();
            item.soTietBuoi = this.soTietBuoi[index].value();
            item.giangVien = this.giangVien[index].value();
        });

        const error = this.checkDupInfo(data);
        if (error) {
            T.notify(`${error}`, 'danger');
        }
        else {

            let CTDT = [];
            this.state.CTDT.forEach(item => {
                if (item.maMonHoc != data[0].maMonHoc) CTDT = [...CTDT, ...item.data];

            });
            this.props.updateSdhHocPhanMulti(data, this.state.rawData, this.state.rawData.length, () => {
                this.reset();
                done && done();
            });
        }

    }

    renderElement = (readOnly) => {
        let { isEdit, editGV } = this.state;
        return (
            this.state.data ? this.state.data.map((item, index) => (
                <>
                    <FormSelect label='Thứ' className='col-md-2' ref={e => this.thu[index] = e} style={{ marginBottom: '0' }} data={this.props.dataThu} disabled={isEdit && index ? readOnly : true} onChange={() => { this.enableEditGV(); this.autoEndDate(); }} />
                    <FormSelect label='Tiết bắt đầu' className='col-md-3' ref={e => this.tietBatDau[index] = e} data={SelectAdapter_DmCaHoc(this.state.coSo)} disabled={isEdit ? readOnly : true} onChange={() => this.enableEditGV()} />
                    <FormTextBox label='Số tiết/Buổi' placeHolder='Tối đa 5 tiết' className='col-md-2' type='number' ref={e => this.soTietBuoi[index] = e} style={{ marginBottom: '0' }} min={1} max={5} disabled={isEdit ? readOnly : true} onChange={() => { this.enableEditGV(); this.autoEndDate(); }} />
                    <FormSelect label='Giảng viên' className='col-md-5' ref={e => this.giangVien[index] = e} style={{ marginBottom: '0' }} data={SelectAdapter_FwCanBoGiangVien} disabled={isEdit && editGV && editGV[index] ? readOnly : true} />
                </>
            )) : null
        );

    }

    render() {
        let { isEdit, isDuyet } = this.state;
        let icon = isEdit ? 'fa-plus' : 'fa-edit',
            textButton = isEdit ? 'Thêm giờ học' : 'Chỉnh sửa';
        const permission = this.getUserPermission('sdhChuongTrinhDaoTao', ['read', 'write', 'delete', 'manage']);
        const readOnly = !(permission.manage);
        return (
            <div>
                {/* do not accept adding new time after isDuyet */}
                <div className='row' style={{ margin: '20px auto' }}>
                    {this.state.dsLop && this.state.dsLop.length ?
                        <h6 className='col-md-12'>Lớp học viên: {this.state.dsLop.map((lop, index) => { return (index + 1) == this.state.dsLop.length ? <> <span>{lop.maLopHocVien}</span> </> : <> <span>{lop.maLopHocVien} , </span> </>; })} </h6> : null}
                    <FormTextBox ref={e => this.maHocPhan = e} className='col-md-4' readOnly label='Mã học phần' />
                    <FormTextBox ref={e => this.monHoc = e} className='col-md-8' label='Môn học' readOnly />
                    <FormTextBox type='number' label='Số buổi học trong tuần' className='col-md-3' placeHolder='Số buổi học trong tuần' ref={e => this.soBuoi = e} style={{ marginBottom: '0' }} disabled={isEdit && !isDuyet ? readOnly : true} onChange={value => value && this.handleSoBuoi(value)} />
                    <FormTextBox style={{ marginTop: '35px' }} ref={e => this.khoa = e} className='col-md-3' readOnly label='Khoa, bộ môn' />
                    <FormTextBox style={{ marginTop: '35px' }} ref={e => this.tongTiet = e} className='col-md-2' readOnly label='Tổng số tiết' />
                    <FormTextBox style={{ marginTop: '35px' }} type='number' ref={e => this.tietLyThuyet = e} className='col-md-2' readOnly label='Số tiết lý thuyết' />
                    <FormTextBox style={{ marginTop: '35px' }} type='number' ref={e => this.tietThucHanh = e} className='col-md-2' readOnly label='Số tiết thực hành' />
                </div>
                <div className='row' style={{ margin: '20px auto' }}>
                    <FormSelect label='Cơ sở học' className='col-md-6' ref={e => this.coSo = e} disabled={isEdit ? readOnly : true} data={SelectAdapter_DmCoSo} onChange={value => value && this.setState({ coSo: value.id }, () => { this.resetTietBatDau(); })} />
                    <FormSelect label='Phòng học' className='col-md-6' ref={e => this.phong = e} disabled={isEdit ? readOnly : true} data={SelectAdapter_DmPhongByCoSo(this.state.coSo ? this.state.coSo : null)} />
                    <FormDatePicker label='Ngày bắt đầu' className='col-md-6' type='date' ref={e => this.ngayBatDau = e} style={{ marginBottom: '0' }} disabled={isEdit ? readOnly : true} onChange={value => {
                        this.enableEditGV(); this.autoThu(value); this.autoEndDate();
                    }} />
                    <FormDatePicker label='Ngày kết thúc' className='col-md-6' type='date-mask' ref={e => this.ngayKetThuc = e} style={{ marginBottom: '0', marginTop: '35px' }} readOnly />
                    {this.renderElement(readOnly)}
                </div>
                <div className style={{ textAlign: 'right' }}>
                    <button className={isEdit ? 'btn btn-warning' : 'btn btn-secondary'} style={{ display: isEdit ? '' : 'none' }} onClick={(e) => { e.preventDefault(); this.setState({ isEdit: 0 }); this.props.isEdit(); }}>
                        <i className='fa fa-lg fa-times' /> Huỷ
                    </button>
                    {!isEdit ? <button className={isEdit ? 'btn btn-primary' : 'btn btn-success'} style={{ marginLeft: '20px' }} onClick={e => {
                        e.preventDefault();
                        this.setState({ isEdit: true });
                        this.props.isEdit();
                    }}>
                        <i className={'fa fa-lg ' + icon} />{textButton}
                    </button> : null}

                </div>


            </div>
        );
    }

}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { updateSdhHocPhanMulti, getDtDmThuAll, getSdhHocPhanByMaHocPhan };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(InfoHocPhan);