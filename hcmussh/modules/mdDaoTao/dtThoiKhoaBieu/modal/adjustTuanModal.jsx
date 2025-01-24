import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, FormCheckbox, getValue, renderTable, TableCell, FormTextBox } from 'view/component/AdminPage';
import { DtTKBCustomMultiUpdate } from 'modules/mdDaoTao/dtThoiKhoaBieu/redux';
import { SelectAdapter_DmPhongAll } from 'modules/mdDanhMuc/dmPhong/redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { SelectAdapter_DmCaHoc } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { SelectAdapter_DtDmThu } from 'modules/mdDaoTao/dtDmThu/redux';


class AdjustTuanModal extends AdminModal {
    state = { listTime: [] }

    componentDidMount() {
        this.disabledClickOutside();
        $(document).ready(() => {
            this.onHidden(() => {
                this.trungPhong.value('');
                this.phong.value('');
                this.coSo.value('');
                this.changeLich.value('');
                this.tietBatDau?.value('');
                this.soTietBuoi?.value('');
                this.thu?.value('');
                this.setState({ dataError: [] });
            });
        });
    }

    onShow = () => {
        let { listAddTuanHoc, dataTuan } = this.props;
        let listTime = [...new Set(dataTuan.filter((_, index) => listAddTuanHoc.includes(index)))];
        this.setState({ listTime });
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        let isTrung = getValue(this.trungPhong),
            changeLich = getValue(this.changeLich),
            phong = getValue(this.phong),
            coSo = getValue(this.coSo),
            { dataTiet } = this.props,
            listTime = this.state.listTime.map(i => Object.assign({}, i));

        if (changeLich) {
            let tietBatDau = getValue(this.tietBatDau),
                soTietBuoi = getValue(this.soTietBuoi),
                newThu = getValue(this.thu);

            let tietKetThuc = parseInt(tietBatDau) + parseInt(soTietBuoi) - 1,
                thoiGianBatDau = dataTiet.filter(i => i.maCoSo == coSo).find(i => i.ten == tietBatDau).thoiGianBatDau,
                thoiGianKetThuc = dataTiet.filter(i => i.maCoSo == coSo).find(i => i.ten == tietKetThuc)?.thoiGianKetThuc;

            if (thoiGianKetThuc) {
                const [gioBatDau, phutBatDau] = thoiGianBatDau.split(':'),
                    [gioKetThuc, phutKetThuc] = thoiGianKetThuc.split(':');

                listTime = listTime.map(i => {
                    if (newThu) {
                        i.ngayHoc = (newThu - i.thu) * 24 * 60 * 60 * 1000 + i.ngayHoc;
                        i.newThu = newThu;
                    }

                    return {
                        ...i, tietBatDau, soTietBuoi, thoiGianBatDau, thoiGianKetThuc,
                        ngayBatDauCu: i.ngayBatDau, ngayKetThucCu: i.ngayKetThuc,
                        ngayBatDau: new Date(i.ngayHoc).setHours(parseInt(gioBatDau), parseInt(phutBatDau)),
                        ngayKetThuc: new Date(i.ngayHoc).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc)),
                    };
                });
            } else {
                T.notify('Không tồn tại tiết kết thúc', 'danger');
                return;
            }
        }
        T.confirm('Lưu ý', 'Bạn có chắc chắn cập nhật thông tin của các tuần học không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                this.props.DtTKBCustomMultiUpdate({
                    phong, isTrung: Number(isTrung), changeLich: Number(changeLich), coSo, maHocPhan: this.props.maHocPhan,
                    editPhong: 0, tietBatDau: this.tietBatDau?.value(), soTietBuoi: this.soTietBuoi?.value(), newThu: this.thu?.value()
                }, listTime, dataError => {
                    if (!dataError.length) {
                        this.props.update();
                        this.props.getData();
                        this.hide();
                    } else {
                        this.setState({ dataError });
                    }
                });
            }
        });
    };

    table = (list) => renderTable({
        getDataSource: () => list,
        header: 'thead-light',
        renderHead: () => <tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tuần</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày học</th>
            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Ghi chú</th>
        </tr>,
        renderRow: (item, index) => {
            return (<tr key={index}>
                <TableCell content={index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={new Date(parseInt(item.ngayHoc)).getWeek()} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={T.dateToText(parseInt(item.ngayHoc), 'dd/mm/yyyy')} />
                <TableCell style={{ whiteSpace: 'nowrap', color: 'red' }} content={item.ghiChu} />
            </tr>);
        }
    })

    render = () => {
        let { coSo, changeLich, dataError } = this.state;
        return this.renderModal({
            title: 'Chỉnh sửa thông tin tuần học',
            size: 'large',
            body: <div className='row'>
                <FormCheckbox ref={e => this.trungPhong = e} className='col-md-6' label='Cho phép trùng phòng' />
                <FormCheckbox ref={e => this.changeLich = e} className='col-md-6' label='Thay đổi lịch' onChange={value => this.setState({ changeLich: value })} />
                <FormSelect className='col-md-6' ref={e => this.coSo = e} label='Cơ sở' required data={SelectAdapter_DmCoSo} onChange={value => this.setState({ coSo: value.id }, () => {
                    this.phong.value('');
                    this.tietBatDau?.value('');
                })} />
                {/* {listAddTuanHoc.length == 1 && <FormDatePicker ref={e => this.ngayHoc = e} className='col-md-12' label='Ngày học' type='date' required />} */}
                <FormSelect ref={e => this.phong = e} className='col-md-6' label='Phòng' data={SelectAdapter_DmPhongAll(coSo)} required />
                {
                    changeLich && <>
                        <FormSelect ref={e => this.thu = e} className='col-md-3' label='Thứ' data={SelectAdapter_DtDmThu} allowClear />
                        <FormSelect ref={e => this.tietBatDau = e} className='col-md-6' label='Tiết bắt đầu' data={SelectAdapter_DmCaHoc(coSo)} minimumResultsForSearch={-1} required />
                        <FormTextBox type='number' ref={e => this.soTietBuoi = e} className='col-md-3' label='Số tiết' min={1} max={5} required />
                    </>
                }
                <div className='col-md-12' style={{ display: dataError && dataError.length ? '' : 'none' }}>
                    {dataError && dataError.length && this.table(dataError)}
                </div>
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { DtTKBCustomMultiUpdate };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AdjustTuanModal);