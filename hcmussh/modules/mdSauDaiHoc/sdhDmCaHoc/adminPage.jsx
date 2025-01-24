import React from 'react';
import { connect } from 'react-redux';
import { createSdhDmCaHoc, getSdhDmCaHocAll, updateSdhDmCaHoc, deleteSdhDmCaHoc, getSdhDmCaHocAllCondition } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox, FormSelect, getValue } from 'view/component/AdminPage';
import { SelectAdapter_DmCoSo } from '../../mdDanhMuc/dmCoSo/redux';
import { SelectAdapter_DtDmBuoiHoc, getDtDmBuoiHocAll } from '../../mdDaoTao/dtDmBuoiHoc/redux';

class EditModal extends AdminModal {
    state = ({ dataCaHoc: [], maCoSo: null, buoiHoc: [] });
    componentDidMount() {
        this.onShown(() => {
            this.ten.focus();
        });
        let buoiHoc = [];
        this.props.getDtDmBuoiHocAll(res => { buoiHoc = res.items.forEach(item => buoiHoc.push(item.id)); });
        this.setState({ buoiHoc: buoiHoc });
    }

    onShow = (item) => {
        let { ma, ten, kichHoat, thoiGianBatDau, thoiGianKetThuc, maCoSo, buoi } = item ? item : { ma: '', ten: '', thoiGianBatDau: '', thoiGianKetThuc: '', kichHoat: true, maCoSo: '', buoi: '' };
        item ? this.getData(maCoSo) : null;
        this.setState({ dataCaHoc: [], maCoSo: maCoSo, ma: ma, ten: ten, item: item });
        this.ten.value(ten);
        this.maCoSo.value(maCoSo);
        this.buoi.value(buoi);
        this.kichHoat.value(kichHoat ? 1 : 0);
        this.gioBatDau.value(thoiGianBatDau.split(':')[0]);
        this.phutBatDau.value(thoiGianBatDau.split(':')[1]);
        this.gioKetThuc.value(thoiGianKetThuc.split(':')[0]);
        this.phutKetThuc.value(thoiGianKetThuc.split(':')[1]);
        this.thoiLuong.value(50);
    }
    getData = (maCoSo) => {
        this.props.getSdhDmCaHocAllCondition(maCoSo, result => {
            let dataCaHoc = [];
            dataCaHoc = result ? result.map(item => {
                let batDau = item.thoiGianBatDau.split(':')[0] + item.thoiGianBatDau.split(':')[1],
                    ketThuc = item.thoiGianKetThuc.split(':')[0] + item.thoiGianKetThuc.split(':')[1];
                return { ...item, batDau: parseInt(batDau), ketThuc: parseInt(ketThuc) };

            }) : [];
            this.setState({ dataCaHoc: dataCaHoc, maCoSo: maCoSo });
        });
    }

    autoEndTime = (gioBatDau, phutBatDau) => {
        const thoiLuong = this.thoiLuong.value() ? parseInt(this.thoiLuong.value()) : 50;
        if (gioBatDau && phutBatDau) {
            const gio = parseInt(gioBatDau),
                phut = parseInt(phutBatDau);
            if (parseInt(phutBatDau) + thoiLuong > 60) {
                this.gioKetThuc.value((gio + 1) / 10 < 1 ? `0${gio + 1}` : gio + 1);
                const newPhut = thoiLuong + phut - 60;
                this.phutKetThuc.value((newPhut) / 10 < 1 ? `0${newPhut}` : newPhut);
            }
            else if (parseInt(phutBatDau) + thoiLuong == 60) {
                this.gioKetThuc.value((gio + 1) / 10 < 1 ? `0${gio + 1}` : gio + 1);
                this.phutKetThuc.value('00');
            }
            else {
                this.gioKetThuc.value(gioBatDau);
                this.phutKetThuc.value(parseInt(phutBatDau) + thoiLuong);
            }
            
            if (0 < gio && gio <= 11)
                this.buoi.value(this.state.buoiHoc[0]);
            else if (gio > 11 && gio < 18)
                this.buoi.value(this.state.buoiHoc[1]);
            else
                this.buoi.value(this.state.buoiHoc[2]);
        }
    }
    onSubmit = (e) => {
        e.preventDefault();
        const batDau = parseInt(this.gioBatDau.value() + this.phutBatDau.value()),
            ketThuc = parseInt(this.gioKetThuc.value() + this.phutKetThuc.value());
        let exist = [];
        let flag = true, tietTrung = [];
        // no extra time between 
        this.state.dataCaHoc?.forEach(item => {
            !this.state.ten && exist.push(item.ten);
            if ((item.ten != this.state.ten) && batDau > item.batDau && batDau < item.ketThuc) {
                flag = false;
                tietTrung.push(item.ten);
            }
            else if ((item.ten != this.state.ten) && (batDau == item.batDau || (ketThuc > item.batDau && ketThuc < item.ketThuc))) {
                flag = false;
                (item.ten != this.state.ten) && tietTrung.push(item.ten);
            }
            else null;
        });
        const changes = {
            ten: getValue(this.ten),
            maCoSo: getValue(this.maCoSo),
            buoi: this.buoi.value(),
            thoiGianBatDau: `${getValue(this.gioBatDau)}:${getValue(this.phutBatDau)}`,
            thoiGianKetThuc: `${getValue(this.gioKetThuc)}:${getValue(this.phutKetThuc)}`,
            kichHoat: Number(this.kichHoat.value()),
        };
        if (!flag) { T.notify(`Tiết học không hợp lệ, trùng thời gian tiết ${tietTrung.map(item => { return item; })} `, 'danger'); this.gioKetThuc.focus(); }
        else {
            if (this.state.ten)
                this.props.update(this.state.ma, changes, this.hide);
            else if (exist.includes(String(changes.ten)))
                T.notify('Tiết học đã tồn tại', 'danger');
            else {
                this.props.create(changes, () => this.getData(this.maCoSo.value()));
                this.ten.value('');
                this.gioBatDau.value('');
                this.phutBatDau.value('');
                this.gioKetThuc.value('');
                this.phutKetThuc.value('');
                this.buoi.value('');
            }
        }
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    generateOption = limitList => {
        const array = Array(limitList);
        const result = [];
        for (let i = 0; i < array.length; i++) {
            result.push(i / 10 < 1 ? `0${i}` : i);
        }
        return result;
    }

    render = () => {
        const readOnly = this.props.readOnly;
        const hours = this.generateOption(24),
            minutes = this.generateOption(60);
        let table = 'Chưa có dữ liệu ca học!',
            items = this.state.dataCaHoc;
        if (items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                header: 'thead-light',
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '30%' }}>Tên</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Cơ sở</th>
                        <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Thời gian</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} style={{ textAlign: 'left' }} />
                        <TableCell type='text' content={item.ten} style={{ color: 'blue' }} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.maCoSo} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={`${item.thoiGianBatDau} - ${item.thoiGianKetThuc}`} />
                    </tr>
                )
            });
        }
        return this.renderModal({
            title: this.state.ten ? 'Cập nhật Giờ học' : 'Tạo mới Giờ học',
            size: 'elarge',
            body:
                <>
                    {!this.state.ten && this.state.maCoSo && <div  > {table}</div>}
                    <div className='row' style={{ position: 'relative' }} >
                        <FormTextBox className='col-md-6' type='number' ref={e => this.ten = e} label='Tiết' readOnly={readOnly} required />
                        <FormSelect className='col-md-6' ref={e => this.thoiLuong = e} data={[40, 45, 50, 55, 60]} readOnly={readOnly} label='Thời lượng mỗi tiết' onChange={() => this.autoEndTime(this.gioBatDau.value(), this.phutBatDau.value())} />
                        <div style={{ position: 'absolute', top: '2px', right: '8px' }}>
                            <FormCheckbox style={{ width: '100%', margin: 0, }} ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly}
                                onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                        </div>
                        <FormSelect className='col-md-6' ref={e => this.maCoSo = e} data={SelectAdapter_DmCoSo} readOnly={readOnly} label='Cơ sở' required onChange={() => this.getData(this.maCoSo.value())} />
                        <FormSelect className='col-md-6' style={{ top: 40 }} ref={e => this.buoi = e} data={SelectAdapter_DtDmBuoiHoc} readOnly={true} label='Buổi' />

                        <div className='col-md-6'>
                            <label className='control-label'>Thời gian bắt đầu</label>
                            <div className='row'>
                                <FormSelect className='col-md-3' ref={e => this.gioBatDau = e} data={hours} readOnly={readOnly} onChange={() => this.autoEndTime(this.gioBatDau.value(), this.phutBatDau.value())} required />
                                <div className='col-md-1'>:</div>
                                <FormSelect className='col-md-3' ref={e => this.phutBatDau = e} data={minutes} readOnly={readOnly} onChange={() => this.autoEndTime(this.gioBatDau.value(), this.phutBatDau.value())} required />
                            </div>
                        </div>
                        <div className='col-md-6'>
                            <label className='control-label'>Thời gian kết thúc</label>
                            <div className='row'>
                                <FormSelect className='col-md-3' ref={e => this.gioKetThuc = e} readOnly={true} data={hours} required />
                                <div className='col-md-1'>:</div>
                                <FormSelect className='col-md-3' ref={e => this.phutKetThuc = e} readOnly={true} data={minutes} required />
                            </div>
                        </div>
                    </div>
                </>
        });
    }
}

class SdhDmCaHocAdminPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/sau-dai-hoc');
        this.props.getSdhDmCaHocAll();
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa giờ học', `Bạn có chắc bạn muốn xóa giờ học ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteSdhDmCaHoc(item.ma, error => {
                if (error) T.notify(error.message ? error.message : `Xoá giờ học ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá giờ học ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('sdhDmCaHoc', ['read', 'write', 'delete']);
        let table = 'Không có dữ liệu ca học!',
            items = this.props.sdhDmCaHoc && this.props.sdhDmCaHoc.items ? this.props.sdhDmCaHoc.items : [];
        if (items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '20%' }}>Tiết</th>
                        <th style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }}>Cơ sở</th>
                        <th style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Kích hoạt</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} style={{ textAlign: 'right' }} />
                        <TableCell type='link' onClick={() => this.modal.show(item)} content={item.ten} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.maCoSo} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={`${item.thoiGianBatDau} - ${item.thoiGianKetThuc}`} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateSdhDmCaHoc(item.ma, { kichHoat: value ? 1 : 0, })} readOnly={!permission.write} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} readOnly={!permission.write} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Giờ học',
            breadcrumb: [
                <Link key={0} to={'/user/sau-dai-hoc'}>Sau đại học</Link>,
                'Giờ học'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createSdhDmCaHoc} update={this.props.updateSdhDmCaHoc} getSdhDmCaHocAllCondition={this.props.getSdhDmCaHocAllCondition} getDtDmBuoiHocAll={this.props.getDtDmBuoiHocAll} />
            </>,
            backRoute: '/user/sau-dai-hoc',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhDmCaHoc: state.sdh.sdhDmCaHoc });
const mapActionsToProps = { getSdhDmCaHocAll, createSdhDmCaHoc, updateSdhDmCaHoc, deleteSdhDmCaHoc, getSdhDmCaHocAllCondition, getDtDmBuoiHocAll };
export default connect(mapStateToProps, mapActionsToProps)(SdhDmCaHocAdminPage);
