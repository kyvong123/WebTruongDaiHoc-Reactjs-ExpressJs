import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, FormTextBox } from 'view/component/AdminPage';

class CachXepModal extends AdminModal {
    state = { dataXep: [] }

    onShow = (data) => {
        let { fullData } = data;
        let dataSelect = fullData.map(i => ({ id: i.id, text: `Thứ ${i.thu}, tiết ${i.tietBatDau} - ${i.tietBatDau + i.soTietBuoi - 1}` })),
            cachXep = [{ id: 1, text: 'Theo tuần' }, { id: 2, text: 'Đủ tiết' }];
        this.setState({ dataSelect, cachXep, ...data, dataXep: [], soGiaiDoan: null });
    }

    scheduleGenByTuan = ({ dataHocPhan, soTuan, listNgayLe, dataTiet, sumTiet, ngayHoc }) => {
        let { tongTiet, soTietBuoi, thoiGianBatDau, thoiGianKetThuc, thu } = dataHocPhan, dataTuan = [];
        let thuBatDau = new Date(ngayHoc).getDay() + 1;
        if (thuBatDau == 1) thuBatDau = 8;
        let deviant = parseInt(thu) - thuBatDau;
        if ((sumTiet && deviant == 0) || deviant < 0) deviant += 7;
        ngayHoc = ngayHoc + deviant * 24 * 60 * 60 * 1000;

        let currentWeek = new Date(ngayHoc).getWeek(), lastWeek = currentWeek + soTuan;

        if (sumTiet < tongTiet) {
            while (currentWeek < lastWeek) {
                const checkNgayLe = listNgayLe.find(item => new Date(item.ngay).setHours(0, 0, 0) == new Date(ngayHoc).setHours(0, 0, 0));

                const [gioBatDau, phutBatDau] = thoiGianBatDau?.split(':'),
                    [gioKetThuc, phutKetThuc] = thoiGianKetThuc?.split(':');
                let ngayBatDau = new Date(ngayHoc).setHours(parseInt(gioBatDau), parseInt(phutBatDau));
                let ngayKetThuc = new Date(ngayHoc).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));

                dataTuan.push({ ...dataHocPhan, tuanBatDau: currentWeek, ngayHoc, ngayBatDau, ngayKetThuc, isNgayLe: checkNgayLe ? true : '', ngayLe: checkNgayLe ? checkNgayLe.moTa : '', });

                ngayHoc += 7 * 24 * 60 * 60 * 1000;
                if (!checkNgayLe) sumTiet += soTietBuoi;
                currentWeek++;

                if (sumTiet >= tongTiet) {
                    let deviant = sumTiet - tongTiet;
                    if (deviant != 0) {
                        const lastHocPhan = dataTuan.pop();
                        lastHocPhan.soTietBuoi = parseInt(lastHocPhan.soTietBuoi) - deviant;
                        const thoiGianKetThuc = dataTiet.find(item => item.ten == parseInt(lastHocPhan.soTietBuoi) + parseInt(lastHocPhan.tietBatDau) - 1).thoiGianKetThuc,
                            [gioKetThuc, phutKetThuc] = thoiGianKetThuc.split(':');
                        lastHocPhan.thoiGianKetThuc = thoiGianKetThuc;
                        lastHocPhan.ngayKetThuc = new Date(lastHocPhan.ngayBatDau).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));

                        dataTuan.push(lastHocPhan);
                    }
                    break;
                }
            }
        }
        return { dataTuan, sumTiet };
    }

    scheduleGenByTiet = ({ fullData, listNgayLe, dataTiet, sumTiet, ngayHoc }) => {
        let dataFull = [...fullData];
        let dataTuan = [];
        const ngayBatDauChung = ngayHoc, tongTiet = parseInt(dataFull[0].tongTiet);

        if (sumTiet > tongTiet) return dataTuan, sumTiet;
        let thuBatDau = new Date(ngayBatDauChung).getDay() + 1;
        if (thuBatDau == 1) thuBatDau = 8;
        dataFull = dataFull.map(item => {
            let deviant = parseInt(item.thu) - thuBatDau;
            if ((sumTiet && deviant == 0) || deviant < 0) deviant += 7;
            item.ngayBatDau = ngayBatDauChung + deviant * 24 * 60 * 60 * 1000;
            item.tuanBatDau = new Date(item.ngayBatDau).getWeek();
            return item;
        });
        dataFull.sort((a, b) => a.ngayBatDau - b.ngayBatDau);
        let currentWeek = dataFull[0].tuanBatDau;
        const cloneData = [];
        dataFull.forEach(item => cloneData.push(Object.assign({}, item)));
        while (sumTiet < tongTiet) {
            for (let i = 0; i < cloneData.length; i++) {
                const hocPhan = Object.assign({}, cloneData[i]);
                if (cloneData[i].tuanBatDau == currentWeek) {
                    const checkNgayLe = listNgayLe.find(item => new Date(item.ngay).setHours(0, 0, 0) == new Date(hocPhan.ngayBatDau).setHours(0, 0, 0));
                    const [gioBatDau, phutBatDau] = cloneData[i].thoiGianBatDau?.split(':'),
                        [gioKetThuc, phutKetThuc] = cloneData[i].thoiGianKetThuc?.split(':');
                    hocPhan.ngayBatDau = new Date(hocPhan.ngayBatDau).setHours(parseInt(gioBatDau), parseInt(phutBatDau));
                    hocPhan.ngayKetThuc = new Date(hocPhan.ngayBatDau).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));
                    hocPhan.ngayHoc = new Date(hocPhan.ngayBatDau).setHours(0, 0, 0);
                    if (!checkNgayLe) {
                        sumTiet += parseInt(cloneData[i].soTietBuoi);
                        dataTuan = [...dataTuan, hocPhan];
                    } else {
                        dataTuan = [...dataTuan, { ...hocPhan, isNgayLe: true, ngayLe: checkNgayLe.moTa, ngayHoc: new Date(hocPhan.ngayBatDau).setHours(0, 0, 0) }];
                    }
                    cloneData[i].tuanBatDau++;
                    cloneData[i].ngayBatDau += 7 * 24 * 60 * 60 * 1000;
                }

                if (sumTiet >= tongTiet) {
                    let deviant = sumTiet - tongTiet;
                    if (deviant != 0) {
                        const lastHocPhan = dataTuan.pop();
                        lastHocPhan.soTietBuoi = parseInt(lastHocPhan.soTietBuoi) - deviant;
                        const thoiGianKetThuc = dataTiet.find(item => item.ten == parseInt(lastHocPhan.soTietBuoi) + parseInt(lastHocPhan.tietBatDau) - 1).thoiGianKetThuc,
                            [gioKetThuc, phutKetThuc] = thoiGianKetThuc.split(':');
                        lastHocPhan.thoiGianKetThuc = thoiGianKetThuc;
                        lastHocPhan.ngayKetThuc = new Date(lastHocPhan.ngayBatDau).setHours(parseInt(gioKetThuc), parseInt(phutKetThuc));

                        dataTuan.push(lastHocPhan);
                    }
                    break;
                }

            }
            cloneData.sort((a, b) => parseInt(a.ngayBatDau) - parseInt(b.ngayBatDau));
            currentWeek++;
        }
        return { dataTuan, sumTiet };
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        let { dataXep, dataTiet, listNgayLe, fullData } = this.state, listTuanHoc = [], tongSoTiet = 0;
        for (let step of dataXep) {
            let ngayHoc = listTuanHoc.length ? listTuanHoc.slice(-1)[0].ngayHoc : fullData[0].ngayBatDau;
            if (step.cachXep == 1) {
                let { dataTuan, sumTiet } = this.scheduleGenByTuan({
                    dataHocPhan: fullData.find(i => i.id == step.buoi),
                    soTuan: step.soTuan, dataTiet, listNgayLe, sumTiet: tongSoTiet, ngayHoc
                });
                listTuanHoc.push(...dataTuan);
                tongSoTiet = sumTiet;
            } else if (step.cachXep == 2) {
                let { dataTuan, sumTiet } = this.scheduleGenByTiet({ fullData, dataTiet, sumTiet: tongSoTiet, listNgayLe, ngayHoc });
                listTuanHoc.push(...dataTuan);
                tongSoTiet = sumTiet;
            }
        }
        this.hide();
        this.props.setValue({ fullData, dataTiet, listNgayLe, listTuanHoc });
    };

    render = () => {
        let { soGiaiDoan, cachXep, dataXep, dataSelect } = this.state;
        return this.renderModal({
            title: 'Chọn cách xếp',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-md-12' label='Chọn số giai đoạn' type='number' allowNegative={false} onChange={value => this.setState({ soGiaiDoan: value, dataXep: [] })} />
                {
                    soGiaiDoan && Array.from({ length: soGiaiDoan }, (_, i) => i).map(i => {
                        return (<div key={i} className='col-md-12 row'>
                            <label className='col-md-2' style={{ margin: 'auto 0', paddingLeft: '40px', fontWeight: 'bold' }}>Giai đoạn {i + 1}: </label>
                            <FormSelect className='col-md-3' label='Cách xếp' data={cachXep} onChange={value => {
                                dataXep[i] = { ...dataXep[i], cachXep: value.id };
                                this.setState({ dataXep });
                            }} />
                            {dataXep[i] && dataXep[i].cachXep == 1 && <>
                                <FormSelect className='col-md-3' label='Buổi' data={dataSelect} onChange={value => {
                                    dataXep[i] = { ...dataXep[i], buoi: value.id };
                                    this.setState({ dataXep });
                                }} />
                                <FormTextBox className='col-md-3' type='number' min={1} label='Số tuần' allowNegative={false} onChange={value => {
                                    dataXep[i] = { ...dataXep[i], soTuan: value };
                                    this.setState({ dataXep });
                                }} />
                            </>}
                        </div>);
                    })
                }
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(CachXepModal);