import React from 'react';
import { connect } from 'react-redux';
import { Tooltip } from '@mui/material';
import { FormTabs, FormSelect, TableCell, FormCheckbox, TableHead, renderDataTable, AdminModal, FormTextBox, loadSpinner } from 'view/component/AdminPage';

import { SelectAdapter_DtLop } from 'modules/mdDaoTao/dtLop/redux';
import { SelectAdapter_DtKhoaDaoTaoFilter } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DtDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_LoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { createDtDangKyHocPhan, getDtDangKyHocPhanAll, getStudent, getHocPhan, getHocPhanCtdt, checkCondition, SelectAdapter_DangKyHocPhanStudent, getDtDangKyHocPhanByStudent, deleteDtDangKyHocPhan, getHocPhanCheckDiemLichThi } from 'modules/mdDaoTao/dtDangKyHocPhan/redux';

import ThongTinSV from 'modules/mdDaoTao/dtDangKyHocPhan/component/thongTinSV';
import ConfirmDangKy from 'modules/mdDaoTao/dtDangKyHocPhan/component/confirmDangKy';
import DkttHocPhanModal from 'modules/mdDaoTao/dtDangKyHocPhan/component/hocPhanModal';
import LichSuDKHPModal from 'modules/mdDaoTao/dtDangKyHocPhan/component/LichSuDKHPModal';
import ListHocPhanModal from 'modules/mdDaoTao/dtDangKyHocPhan/component/listHocPhanModal';
class GhiChuModal extends AdminModal {

    onShow = (listHocPhan, mssv) => {
        this.setState({ listHocPhan, mssv });
    }

    onSubmit = () => {
        let { listHocPhan, mssv } = this.state;
        if (!this.lyDo.value() || this.lyDo.value().trim() == '') {
            T.notify('Vui lòng nhập lý do!', 'danger');
        } else {
            T.confirm('Cảnh báo', `Bạn có chắc muốn hủy đăng ký ${listHocPhan.length} học phần ?`, 'warning', true, isConfirm => {
                if (isConfirm) {
                    T.alert('Đang xử lý', 'warning', false, null, true);
                    let { namHoc, hocKy, loaiHinhDaoTao, khoaSinhVien } = this.props.filterhp,
                        filter = { namHoc, hocKy, loaiHinhDaoTao, khoaSinhVien, ghiChu: this.lyDo.value() };
                    this.props.deleteDtDangKyHocPhan(listHocPhan, mssv, filter, (value) => {
                        if (value.error) T.alert('Hủy học phần thất bại', 'warning', false, 1000);
                        else {
                            T.alert('Hủy học phần thành công', 'success', false, 1000);
                            this.hide();
                            this.lyDo.value('');
                            this.props.getKetQuaDangKyHocPhan(mssv, filter);
                        }
                    });
                }
            });
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Lý do xoá học phần',
            size: 'large',
            body: <>
                <div className='row'>
                    <FormTextBox ref={e => this.lyDo = e} type='text' className='col-md-12' label='Lý do' />
                </div>
            </>,
            isShowSubmit: false,
            buttons: <button type='submit' className='btn btn-danger'>
                <i className='fa fa-fw fa-lg fa-trash' /> Xoá
            </button>
        });
    }
}

class FormDangKySinhVien extends React.Component {
    state = {
        listSinhVienChon: [], listHocPhanChon: [], hocPhanDangKyChon: [], listHocPhanCtdt: [], listHocPhanKh: [], listHocPhanNkh: [], listHocPhanNCtdt: [], filter: {},
        filterhp: {}, ksSearchHp: {}, sortTermHp: 'maHocPhan_ASC',
        filterSV: {}, ksSearchHpKh: {}, sortTermHpKh: 'maHocPhan_ASC', ksSearchHpNkh: {}, sortTermHpNkh: 'maHocPhan_ASC',
        ksSearchHpSv: {}, sortTermHpSv: 'maHocPhan_ASC',
        isMultiSinhVien: true, listMessengers: {}, isDone: false, isSvLoading: true, isShowStud: false, isHpLoading: true, isShowSubj: false
    };
    listSinhVien = [];
    listHocPhan = [];
    defaultSortTermHp = 'maHocPhan_ASC';
    defaultSortTermHpSv = 'maHocPhan_ASC';
    defaultSortTermKh = 'maHocPhan_ASC';
    defaultSortTermNkh = 'maHocPhan_ASC';

    mapperLoaiDangKy = {
        'KH': <span><i className='fa fa-lg fa-sign-in' /> KH</span>,
        'NKH': <span><i className='fa fa-lg fa-sign-out' /> NKH</span>,
        'NCTDT': <span><i className='fa fa-lg fa-info-circle' /> NCTĐT</span>,
        'CT': <span><i className='fa fa-lg fa-chevron-circle-right' /> CT</span>,
        'HL': <span><i className='fa fa-lg fa-repeat' /> HL</span>,
        'HV': <span><i className='fa fa-lg fa-chevron-circle-up' /> HV</span>,
    }

    loaiDangKy = [
        { id: 'KH', text: 'KH' },
        { id: 'NKH', text: 'NKH' },
        { id: 'NCTDT', text: 'NCTĐT' },
        { id: 'CT', text: 'CT' },
        { id: 'HL', text: 'HL' },
        { id: 'HV', text: 'HV' }
    ]

    getSemester = () => {
        let { namHoc, hocKy } = this.props.currentSemester;
        this.listHocPhan = [];
        this.setState({
            namHoc, hocKy, hocPhanDangKyChon: [],
            filterhp: { ...this.state.filterhp, namHoc, hocKy }
        }, () => this.onChangeNamHocHocKy());
    }

    showModal = (e) => {
        this.modal.show(e);
    }

    getDataHpSv = () => {
        let { namHoc, hocKy, listSinhVienChon } = this.state;
        let sinhVien = listSinhVienChon[0],
            filter = {
                ...this.state.ksSearchHpSv,
                sort: this.state?.sortTermHpSv || this.defaultSortTermHpSv,
                namHoc, hocKy
            };
        this.props.getDtDangKyHocPhanByStudent(sinhVien.mssv, filter, (data) => {
            this.setState({ dataKetQua: data, hocPhanDangKyChon: data.map(item => { return { ...item, isChon: false }; }), isSvLoading: false });
        });
    }

    getKetQuaDangKyHocPhan = () => {
        this.setState({ isSvLoading: true }, () => this.getDataHpSv());
    }

    handleKeySearchHpSv = (data) => {
        this.setState({ ksSearchHpSv: { [data.split(':')[0]]: data.split(':')[1] } }, () => this.getDataHpSv());
    }

    onSortHpSv = (sortTerm) => {
        this.setState({ sortTermHpSv: sortTerm }, () => this.getDataHpSv());
    }

    getDataHp = () => {
        let { listHocPhanCtdt, listHocPhanKh, listHocPhanNkh, isHpLoading } = this.state;
        let filter = {
            ...this.state.filterhp,
            ...this.state.ksSearchHp,
            sort: this.state?.sortTermHp || this.defaultSortTermHp,
        };
        this.props.getHocPhan(filter, (value) => {
            let list = [];
            listHocPhanCtdt.forEach(item => {
                value.filter(e => e.maHocPhan != item.maHocPhan);
            });
            if (isHpLoading) list = [...value, ...listHocPhanCtdt];
            else list = [...listHocPhanKh, ...listHocPhanNkh, ...value];

            this.setState({ listHocPhanNCtdt: value, listHocPhanChon: list, isShowSubj: true, isHpLoading: false }, () => {
                this.checkHPNgoaiCtdtAll.value(false);
            });
        });
    }

    hocPhanFilter = () => {
        this.setState({ isHpLoading: true }, () => this.getDataHp());
    };

    handleKeySearchHp = (data) => {
        this.setState({ ksSearchHp: { [data.split(':')[0]]: data.split(':')[1] } }, () => this.getDataHp());
    }

    onSortHp = (sortTerm) => {
        this.setState({ sortTermHp: sortTerm }, () => this.getDataHp());
    }

    getDataHpKeHoach = () => {
        let { listHocPhanNCtdt, listHocPhanNkh, listHocPhanChon } = this.state,
            { mssvFilter, loaiHinhDaoTao, khoaDaoTao, namHoc, hocKy } = this.state.filterSV,
            filter = {
                loaiHinhDaoTao, khoaDaoTao, namHoc, hocKy,
                ...this.state.ksSearchHpKh,
                sort: this.state?.sortTermHpKh || this.defaultSortTermKh,
            };
        this.props.getHocPhanCtdt(mssvFilter, filter, 'KH', value => {
            listHocPhanChon = [...value, ...listHocPhanNkh, ...listHocPhanNCtdt];
            this.setState({ listHocPhanKh: value, listHocPhanChon, isShowSubj: true, isHpLoading: false }, () => {
                this.checkHPKeHoachAll.value(false);
            });
        });
    }

    handleKeySearchHpKeHoach = (data) => {
        this.setState({ ksSearchHpKh: { [data.split(':')[0]]: data.split(':')[1] } }, () => this.getDataHpKeHoach());
    }

    onSortHpKeHoach = (sortTerm) => {
        this.setState({ sortTermHpKh: sortTerm }, () => this.getDataHpKeHoach());
    }

    getDataHpNgoaiKeHoach = () => {
        let { listHocPhanNCtdt, listHocPhanKh, listHocPhanChon } = this.state,
            { mssvFilter, loaiHinhDaoTao, khoaDaoTao, namHoc, hocKy } = this.state.filterSV,
            filter = {
                loaiHinhDaoTao, khoaDaoTao, namHoc, hocKy,
                ...this.state.ksSearchHpNkh,
                sort: this.state?.sortTermHpNkh || this.defaultSortTermNkh,
            };
        this.props.getHocPhanCtdt(mssvFilter, filter, 'NKH', value => {
            listHocPhanChon = [...value, ...listHocPhanKh, ...listHocPhanNCtdt];
            this.setState({ listHocPhanNkh: value, listHocPhanChon, isShowSubj: true, isHpLoading: false }, () => {
                this.checkHPNgoaiKeHoachAll.value(false);
            });
        });
    }

    handleKeySearchHpNgoaiKeHoach = (data) => {
        this.setState({ ksSearchHpNkh: { [data.split(':')[0]]: data.split(':')[1] } }, () => this.getDataHpNgoaiKeHoach());
    }

    onSortHpNgoaiKeHoach = (sortTerm) => {
        this.setState({ sortTermHpNkh: sortTerm }, () => this.getDataHpNgoaiKeHoach());
    }

    checkTrung = (item) => {
        const { dataKetQua } = this.state || { dataKetQua: [] };
        const { ngayBatDau: iNgayBatDau, ngayKetThuc: iNgayKetThuc, soTietBuoi: iSoTietBuoi, thu: iThu, tietBatDau: iTietBatDau } = item;
        for (let ketQua of dataKetQua) {
            if (ketQua.maHocPhan != item.maHocPhan) {
                const { thu, tietBatDau, soTietBuoi, ngayBatDau, ngayKetThuc } = ketQua;
                if (!(iNgayKetThuc < ngayBatDau || iNgayBatDau > ngayKetThuc)) {
                    let tietKetThuc = tietBatDau + soTietBuoi - 1;
                    let iTietKetThuc = iTietBatDau + iSoTietBuoi - 1;
                    if (thu && thu == iThu && tietBatDau && tietKetThuc && !(iTietKetThuc < tietBatDau || iTietBatDau > tietKetThuc)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    countHocPhan = (item) => {
        let check = false,
            checkDupMonHoc = false;
        if (item.isChon == true) {
            this.listHocPhan.forEach(itemHP => {
                if (item.maMonHoc == itemHP.maMonHoc) {
                    checkDupMonHoc = true;
                }
                if (item.maHocPhan == itemHP.maHocPhan) check = true;
            });
            if (check == false) {
                if (checkDupMonHoc) {
                    let dupIndex = this.listHocPhan.findIndex(hp => hp.maMonHoc == item.maMonHoc);
                    this.listHocPhan.splice(dupIndex, 1);

                }
                this.listHocPhan.push(item);
            }
        } else if (item.isChon == false) {
            for (let i = 0; i < this.listHocPhan.length; i++) {
                if (item.maHocPhan == this.listHocPhan[i].maHocPhan) this.listHocPhan.splice(i, 1);
            }
        }
    }

    chonHocPhan = (item) => {
        let list = this.state.listHocPhanChon;
        if (item.isChon == 1) {
            item.isChon = !item.isChon;
            let hocPhanDup = list.filter(dup => dup.maHocPhan == item.maHocPhan && dup.R != item.R);
            if (hocPhanDup.length > 0) hocPhanDup.forEach(hp => hp.isChon = !hp.isChon);
            this.countHocPhan(item);
            this.setState({ listHocPhanChon: list }, () => {
                if (item.maLoaiDky == 'KH') this.checkHPKeHoachAll.value(false);
                else if (item.maLoaiDky == 'NKH') this.checkHPNgoaiKeHoachAll.value(false);
                else this.checkHPNgoaiCtdtAll.value(false);
            });
        } else {
            let check = this.checkHocPhan(item);
            if (check == true) {
                item.isChon = !item.isChon;
                let hocPhanDup = list.filter(dup => dup.maHocPhan == item.maHocPhan && dup.R != item.R);
                if (hocPhanDup.length > 0) hocPhanDup.forEach(hp => hp.isChon = !hp.isChon);
                this.countHocPhan(item);
                if (item.siSo >= item.soLuongDuKien) {
                    T.notify('Học phần này đã đủ số lượng!!', 'warning');
                }
                this.setState({ listHocPhan: list });
                // if (item.khoaSinhVien != this.listSinhVien[0].namTuyenSinh) {
                //     T.confirm('Xác nhận', 'Học phần này khác khóa sinh viên. Bạn có chắc chắn muốn đăng ký không?', 'warning', true, isConfirm => {
                //         if (isConfirm) {
                //             item.isChon = !item.isChon;
                //             this.countHocPhan(item);
                //             if (item.siSo >= item.soLuongDuKien) {
                //                 T.notify('Học phần này đã đủ số lượng!!', 'danger');
                //             }
                //             this.setState({ listHocPhan: list });
                //         }
                //     });
                // } else {
                //     item.isChon = !item.isChon;
                //     this.countHocPhan(item);
                //     if (item.siSo >= item.soLuongDuKien) {
                //         T.notify('Học phần này đã đủ số lượng!!', 'danger');
                //     }
                //     this.setState({ listHocPhan: list });
                // }
            } else {
                item.isChon = !item.isChon;
                let hocPhanDup = list.filter(dup => dup.maHocPhan == item.maHocPhan && dup.R != item.R);
                if (hocPhanDup.length > 0) hocPhanDup.forEach(hp => hp.isChon = !hp.isChon);
                list.forEach(hp => {
                    if (hp.maHocPhan != item.maHocPhan && hp.maMonHoc == item.maMonHoc) {
                        hp.isChon = false;
                    }
                });
                this.countHocPhan(item);
                if (item.siSo >= item.soLuongDuKien) {
                    T.notify('Học phần này đã đủ số lượng!!', 'warning');
                }
                this.setState({ listHocPhan: list });
                // T.notify('Bạn đã chọn môn học này rồi!!', 'danger');
            }
        }
    }

    backgroundColor = (item) => {
        if (item.isChon == true) {
            return '#cfe2ff';
        } else if (item.tinhTrang == 4) {
            return '#ea868f';
        } else {
            return '#ffffff';
        }
    }

    checkHocPhan = (itemChon) => {
        let list = this.state.listHocPhanChon.filter(e => e.isChon == 1);
        let check = 0;
        if (list.length == 0) return true;
        list.forEach(item => {
            if (item.maMonHoc == itemChon.maMonHoc && item.namHoc == itemChon.namHoc && item.hocKy == itemChon.hocKy && item.loaiHinhDaoTao == itemChon.loaiHinhDaoTao) {
                check = 1;
            }
        });
        return check ? false : true;
    }

    dangKyHocPhan() {
        let listSinhVien = this.listSinhVien;
        let listHocPhan = this.listHocPhan;

        if (listSinhVien.length == 0 || listHocPhan.length == 0) {
            T.notify(listSinhVien.length == 0 ? 'Chưa chọn sinh viên!' : 'Chưa chọn môn học!', 'danger');
        } else {
            this.setState({ isChecking: true }, () => {
                let arrayMSSV = listSinhVien.map(item => item.mssv);
                let listMSSV = arrayMSSV.join('; ');

                let arrayMaHocPhan = listHocPhan.map(item => item.maHocPhan + ', ' + item.siSo);
                let hocPhan = listHocPhan.map(item => item.maHocPhan);

                const update = (index) => {
                    let itemHocPhan = arrayMaHocPhan[index];
                    const list = { listMSSV, itemHocPhan };
                    T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                    this.props.checkCondition(list, (items) => {
                        let { listMess } = items;
                        if (index == 0) {
                            this.setState({ listMessengers: listMess });
                        } else {
                            this.setState({ listMessengers: [...this.state.listMessengers, ...listMess] });
                        }
                        if (index < arrayMaHocPhan.length - 1) {
                            index++;
                            update(index);
                        } else {
                            let items = {
                                listMess: this.state.listMessengers,
                                maHocPhan: hocPhan
                            };
                            T.alert('Đăng ký dự kiến thành công', 'success', false, 1000);
                            this.modal.show({ items, isDone: 3 });
                        }
                    });
                };
                update(0);
            });
        }
    }

    listHpChon = () => {
        this.listHpChonModal.show(this.listHocPhan);
    }

    renderHocPhanDangKyComponent = (listHocPhanDangKy) => {
        let { listSinhVienChon, filterSV } = this.state;
        let sinhVien = listSinhVienChon[0];
        return (
            <div className='row justify-content border-right'>
                <div className='col-md-12'>
                    <div className='row'>
                        <h6 className='col-md-6 tile-title mb-0'>Thông tin sinh viên</h6>

                        <div className='col-md-6'>
                            <div className='rows' style={{ textAlign: 'right' }}>
                                <button className='btn btn-warning'
                                    onClick={(e) => e.preventDefault() || this.lichSuModal.show(sinhVien.mssv)}
                                >
                                    <i className='fa fa-lg fa-history' /> Lịch sử
                                </button>
                                <button className='btn btn-info ml-2'
                                    onClick={e => e.preventDefault() || T.handleDownload(`/api/dt/dang-ky-hoc-phan/export-ket-qua-dang-ky?filter=${T.stringify(filterSV)}`, 'ketQuaDangKyMonHoc.pdf')}
                                >
                                    <i className='fa fa-fw fa-lg fa-download' /> In kết quả đăng ký
                                </button>
                                {this.state.hocPhanDangKyChon.filter(item => item.isChon).length ?
                                    <button className='btn btn-danger ml-2'
                                        onClick={(e) => e.preventDefault() || this.xoaHocPhan(this.state.hocPhanDangKyChon, sinhVien.mssv)}
                                    >
                                        <i className='fa fa-lg fa-trash' /> Huỷ
                                    </button>
                                    : <div />
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-md-12 mt-3'>
                    <ThongTinSV ref={e => this.sinhVienModal = e} />
                </div>
                {this.state.isShowStud ?
                    <div className='col-md-12 mt-2'>
                        {this.state.isSvLoading ? loadSpinner() : this.renderListKetQua(listHocPhanDangKy)}
                    </div>
                    : <div />}
            </div>
        );
    }

    renderListKetQua = (list) => renderDataTable({
        data: list == null ? null : Object.keys(list.groupBy('maHocPhan')),
        emptyTable: 'Không tìm thấy học phần!',
        header: 'thead-light',
        stickyHead: true,
        divStyle: { height: '50vh' },
        className: 'table-pin',
        customClassName: 'table-pin-wrapper',
        renderHead: () => (
            <tr>
                <th className='sticky-col pin-1-col' style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th className='sticky-col pin-2-col' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    Chọn <br />
                    <FormCheckbox ref={e => this.checkHPDKAll = e}
                        onChange={value => {
                            let { hocPhanDangKyChon, dataKetQua } = this.state;
                            dataKetQua = dataKetQua.map(item => { return { ...item, isChon: value }; });
                            hocPhanDangKyChon = hocPhanDangKyChon.map(item => { return { ...item, isChon: value }; });
                            this.setState({ hocPhanDangKyChon, dataKetQua });
                        }}
                    />
                </th>
                <TableHead className='sticky-col pin-3-col' style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhanKQ'
                    onKeySearch={this.handleKeySearchHpSv} onSort={this.onSortHpSv}
                />
                <TableHead className='sticky-col pin-4-col' style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn' keyCol='tenMonHocKQ'
                    onKeySearch={this.handleKeySearchHpSv} onSort={this.onSortHpSv}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Lớp' keyCol='lopKQ'
                    onKeySearch={this.handleKeySearchHpSv} onSort={this.onSortHpSv}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='LĐK' keyCol='maLoaiDkyKQ'
                    onKeySearch={this.handleKeySearchHpSv} onSort={this.onSortHpSv} typeSearch='select' data={this.loaiDangKy || []} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Sĩ số' keyCol='siSoKQ'
                    onKeySearch={this.handleKeySearchHpSv} onSort={this.onSortHpSv}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tín chỉ' keyCol='tinChiKQ'
                    onKeySearch={this.handleKeySearchHpSv} onSort={this.onSortHpSv}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tổng tiết' keyCol='tongTietKQ'
                    onKeySearch={this.handleKeySearchHpSv} onSort={this.onSortHpSv}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Phòng' keyCol='phongKQ'
                    onKeySearch={this.handleKeySearchHpSv} onSort={this.onSortHpSv}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thứ' keyCol='thuKQ'
                    onKeySearch={this.handleKeySearchHpSv} onSort={this.onSortHpSv}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tiết' keyCol='tietKQ'
                    onKeySearch={this.handleKeySearchHpSv} onSort={this.onSortHpSv}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Giảng viên' keyCol='giangVienKQ'
                    onKeySearch={this.handleKeySearchHpSv} onSort={this.onSortHpSv}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Trợ giảng' keyCol='troGiangKQ'
                    onKeySearch={this.handleKeySearchHpSv} onSort={this.onSortHpSv}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày bắt đầu' keyCol='ngayBatDauKQ'
                    onSort={this.onSortHpSv}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày kết thúc' keyCol='ngayKetThucKQ'
                    onSort={this.onSortHpSv}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Đã đóng/Cần đóng' keyCol='tinhPhi' />
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chuyển / Hủy lớp</th>
            </tr>
        ),
        renderRow: (item, index) => {
            const rows = [];
            let listHocPhan = list.groupBy('maHocPhan')[item] || [],
                rowSpan = listHocPhan.length;
            if (rowSpan) {
                for (let i = 0; i < rowSpan; i++) {
                    const hocPhan = listHocPhan[i];
                    let isTrung = this.checkTrung(hocPhan);
                    if (i == 0) {
                        rows.push(
                            <tr key={rows.length} style={{ backgroundColor: isTrung ? '#f7de97' : '#ffffff' }}>
                                <TableCell className='sticky-col pin-1-col' style={{ textAlign: 'right' }} content={(index + 1)} rowSpan={rowSpan} />
                                <TableCell className='sticky-col pin-2-col' type='checkbox' isCheck style={{ textAlign: 'center' }} content={hocPhan.isChon} permission={{ write: true }}
                                    onChanged={() => {
                                        let { hocPhanDangKyChon } = this.state;
                                        list = list.map(item => {
                                            if (item.maHocPhan == hocPhan.maHocPhan) {
                                                item.isChon = !item.isChon;
                                            }
                                            return item;
                                        });
                                        hocPhanDangKyChon = list.filter(item => item.isChon);
                                        this.setState({ hocPhanDangKyChon }, () => {
                                            this.checkHPDKAll.value(!(this.state.hocPhanDangKyChon.length < list.length));
                                        });
                                    }} rowSpan={rowSpan}
                                />
                                <TableCell className='sticky-col pin-3-col' style={{ whiteSpace: 'nowrap' }} content={hocPhan.maHocPhan} rowSpan={rowSpan} />
                                <TableCell className='sticky-col pin-4-col' content={T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.lop?.split(',').map((item, i) => <div key={i}>{item}</div>)} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.maLoaiDky && this.mapperLoaiDangKy[hocPhan.maLoaiDky] ? this.mapperLoaiDangKy[hocPhan.maLoaiDky] : ''} rowSpan={rowSpan} />
                                <TableCell type='number' content={(hocPhan.siSo || 0) + '/' + (hocPhan.soLuongDuKien || 100)} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tongTinChi} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tongTiet} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.thu} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayBatDau} rowSpan={rowSpan} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayKetThuc} rowSpan={rowSpan} />
                                <TableCell type='number' style={{ textAlign: 'center' }} content={(hocPhan.daDong || 0) + '/' + (hocPhan.hocPhi || 0)} rowSpan={rowSpan} />
                                <TableCell type='buttons' style={{ textAlign: 'center' }} content={hocPhan} rowSpan={rowSpan}>
                                    <Tooltip title='Chuyển học phần' arrow>
                                        <button className='btn btn-info' onClick={e => e.preventDefault() || this.chuyenHocPhan(hocPhan, this.state.listSinhVienChon[0].mssv)} >
                                            <i className='fa fa-lg fa-repeat' />
                                        </button>
                                    </Tooltip>
                                    <Tooltip title='Hủy môn' arrow>
                                        <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.xoaHocPhan([hocPhan], this.state.listSinhVienChon[0].mssv)} >
                                            <i className='fa fa-lg fa-trash' />
                                        </button>
                                    </Tooltip>
                                </TableCell>
                            </tr>);
                    }
                    else {
                        rows.push(<tr key={rows.length}>
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.thu} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                        </tr>);
                    }
                }
            }
            return rows;
        },
    });

    renderHocPhanComponent = (listHocPhanChon) => {
        return (
            <div className='row justify-content border-left'>
                <div className='col-md-12'>
                    <div className='row'>
                        <h6 className='col-md-6 tile-title mb-0'>Danh sách học phần</h6>

                        <div className='col-md-6'>
                            <div className='rows' style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' onClick={(e) => {
                                    e.preventDefault() || this.hocPhanFilter();
                                }} >
                                    <i className='fa fa-search' /> Tìm kiếm
                                </button>
                                {this.state.isShowStud && this.listHocPhan.length ?
                                    <button className='btn btn-primary ml-2' onClick={(e) => {
                                        e.preventDefault() || this.dangKyHocPhan();
                                    }} >
                                        <i className='fa fa-fw fa-lg fa-handshake-o' /> Đăng ký
                                    </button>
                                    : <div />
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <FormSelect ref={(e) => (this.loaiHinhDaoTao = e)} className='col-md-3 mb-0' label='Loại hình đào tạo' data={SelectAdapter_LoaiHinhDaoTaoFilter('dtDangKyHocPhan')}
                    onChange={(value) =>
                        this.setState({
                            filterhp: { ...this.state.filterhp, loaiHinhDaoTao: value?.id || '' },
                        })
                    } allowClear
                />
                <FormSelect ref={(e) => (this.khoaDaoTao = e)} className='col-md-3 mb-0' label='Khoa' data={SelectAdapter_DtDmDonVi()}
                    onChange={(value) =>
                        this.setState({
                            filterhp: { ...this.state.filterhp, khoaDaoTao: value?.id || '' },
                        })
                    } allowClear
                />
                <FormSelect ref={(e) => (this.khoaSinhVien = e)} className='col-md-3 mb-0' label='Khoá sinh viên' data={SelectAdapter_DtKhoaDaoTaoFilter('dtDangKyHocPhan')}
                    onChange={(value) =>
                        this.setState({
                            filterhp: { ...this.state.filterhp, khoaSinhVien: value?.id || '' },
                        })
                    } allowClear
                />
                <FormSelect ref={(e) => (this.lopSV = e)} className='col-md-3 mb-0' label='Lớp' data={SelectAdapter_DtLop({
                    role: 'dtDangKyHocPhan',
                    khoaSinhVien: this.state.filterhp?.khoaSinhVien,
                    heDaoTao: this.state.filterhp?.loaiHinhDaoTao,
                    donVi: this.state.filterhp?.khoaDaoTao
                })}
                    onChange={(value) =>
                        this.setState({
                            filterhp: { ...this.state.filterhp, lopSV: value?.id || '' },
                        })
                    } allowClear
                />
                <div className='col-md-12'>
                    <h6>
                        Đã chọn {this.listHocPhan.length} học phần
                        <sub style={{ cursor: 'pointer', color: '#1488db' }} onClick={() => this.listHpChon()}>(Chi tiết)</sub>
                    </h6>
                </div>
                <div className='col-md-12'>
                    {this.state.isHpLoading ? loadSpinner()
                        : <FormTabs ref={e => this.tab = e} tabs={[
                            {
                                title: 'Theo kế hoạch',
                                component: this.renderListHocPhanKeHoach(listHocPhanChon.filter(e => e.maLoaiDky == 'KH'), 0)
                            },
                            {
                                title: 'Ngoài kế hoạch',
                                component: this.renderListHocPhanNgoaiKeHoach(listHocPhanChon.filter(e => e.maLoaiDky == 'NKH'), 1)
                            },
                            {
                                title: 'Ngoài CTĐT',
                                component: this.renderListHocPhanNgoaiCtdt(listHocPhanChon.filter(e => e.maLoaiDky != 'NKH' && e.maLoaiDky != 'KH'), 2)
                            }
                        ]} />}
                </div>
            </div>
        );
    }

    renderListHocPhanKeHoach = (list, ma) => renderDataTable({
        data: Object.keys((list || []).groupBy('maHocPhan')) || [],
        emptyTable: 'Không tìm thấy học phần!',
        header: 'thead-light',
        stickyHead: true,
        divStyle: { height: '50vh' },
        className: 'table-pin',
        customClassName: 'table-pin-wrapper',
        renderHead: () => (
            <tr>
                <th className='sticky-col pin-1-col' style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th className='sticky-col pin-2-col' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    Chọn <br />
                    <FormCheckbox ref={e => this.checkHPKeHoachAll = e}
                        onChange={value => {
                            let { listHocPhanChon } = this.state;
                            if (value == 0) {
                                list.map(item => item.isChon = value);
                                list.forEach(item => this.countHocPhan(item));

                                listHocPhanChon.forEach(item => {
                                    list.forEach(itemHP => {
                                        if (item.maHocPhan == itemHP.maHocPhan) {
                                            item.isChon = itemHP.isChon;
                                        }
                                    });
                                });

                                this.setState({ listHocPhanChon });
                            } else {
                                list.forEach(item => {
                                    if (item.siSo <= item.soLuongDuKien) {
                                        let check = this.checkHocPhan(item);
                                        if (check == true) {
                                            item.isChon = value;
                                            this.countHocPhan(item);
                                        }
                                    }
                                });

                                listHocPhanChon.forEach(item => {
                                    list.forEach(itemHP => {
                                        if (item.maHocPhan == itemHP.maHocPhan) {
                                            item.isChon = itemHP.isChon;
                                        }
                                    });
                                });

                                this.setState({ listHocPhanChon });
                            }
                        }}
                    />
                </th>
                <TableHead className='sticky-col pin-3-col' style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhan'
                    onKeySearch={this.handleKeySearchHpKeHoach} onSort={this.onSortHpKeHoach}
                />
                <TableHead className='sticky-col pin-4-col' style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn' keyCol='tenMonHoc'
                    onKeySearch={this.handleKeySearchHpKeHoach} onSort={this.onSortHpKeHoach}
                />
                <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Lớp' keyCol='lop'
                    onKeySearch={this.handleKeySearchHpKeHoach} onSort={this.onSortHpKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tín chỉ' keyCol='tinChi'
                    onKeySearch={this.handleKeySearchHpKeHoach} onSort={this.onSortHpKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tổng tiết' keyCol='tongTiet'
                    onKeySearch={this.handleKeySearchHpKeHoach} onSort={this.onSortHpKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Phòng' keyCol='phong'
                    onKeySearch={this.handleKeySearchHpKeHoach} onSort={this.onSortHpKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thứ' keyCol='thu'
                    onKeySearch={this.handleKeySearchHpKeHoach} onSort={this.onSortHpKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tiết' keyCol='tiet'
                    onKeySearch={this.handleKeySearchHpKeHoach} onSort={this.onSortHpKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Giảng viên' keyCol='giangVien'
                    onKeySearch={this.handleKeySearchHpKeHoach} onSort={this.onSortHpKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Trợ giảng' keyCol='troGiang'
                    onKeySearch={this.handleKeySearchHpKeHoach} onSort={this.onSortHpKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày bắt đầu' keyCol='ngayBatDau'
                    onSort={this.onSortHpKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày kết thúc' keyCol='ngayKetThuc'
                    onSort={this.onSortHpKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Sĩ số' keyCol='siSo'
                    onKeySearch={this.handleKeySearchHpKeHoach} onSort={this.onSortHpKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tình trạng học phần' keyCol={`tinhTrangHocPhan:${ma}`}
                    onKeySearch={this.handleKeySearchHpKeHoach} onSort={this.onSortHpKeHoach}
                />
            </tr>
        ),
        renderRow: (item, index) => {
            const rows = [];
            let listHocPhan = (list || []).groupBy('maHocPhan')[item] || [],
                rowSpan = listHocPhan.length;
            if (rowSpan) {
                for (let i = 0; i < rowSpan; i++) {
                    const hocPhan = listHocPhan[i];
                    if (i == 0) {
                        rows.push(
                            <tr key={rows.length} style={{ backgroundColor: this.backgroundColor(hocPhan), cursor: 'pointer' }} onClick={() => this.chonHocPhan(hocPhan, list)}>
                                <TableCell className='sticky-col pin-1-col' style={{ textAlign: 'right' }} content={(index + 1)} rowSpan={rowSpan} />
                                <TableCell className='sticky-col pin-2-col' type='checkbox' isCheck style={{ textAlign: 'center' }} content={hocPhan.isChon} permission={{ write: true }}
                                    onChanged={() => this.chonHocPhan(hocPhan, list)} rowSpan={rowSpan}
                                />
                                <TableCell className='sticky-col pin-3-col' style={{ whiteSpace: 'nowrap' }} content={hocPhan.maHocPhan} rowSpan={rowSpan} />
                                <TableCell className='sticky-col pin-4-col' content={T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.maLop} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tongTinChi} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tongTiet} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.phong} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.thu} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.ngayBatDau} rowSpan={rowSpan} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.ngayKetThuc} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={(hocPhan.siSo ? hocPhan.siSo : '0') + '/' + (hocPhan.soLuongDuKien ? hocPhan.soLuongDuKien : '0')} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tenTinhTrang} rowSpan={rowSpan} />
                            </tr>);
                    } else {
                        rows.push(
                            <tr key={rows.length} style={{ backgroundColor: this.backgroundColor(hocPhan), cursor: 'pointer' }} onClick={() => this.chonHocPhan(hocPhan, list)}>
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.thu} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                            </tr>
                        );
                    }
                }
            }
            return rows;
        },
    });

    renderListHocPhanNgoaiKeHoach = (list, ma) => renderDataTable({
        data: Object.keys((list || []).groupBy('maHocPhan')) || [],
        emptyTable: 'Không tìm thấy học phần!',
        header: 'thead-light',
        stickyHead: true,
        divStyle: { height: '50vh' },
        className: 'table-pin',
        customClassName: 'table-pin-wrapper',
        renderHead: () => (
            <tr>
                <th className='sticky-col pin-1-col' style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th className='sticky-col pin-2-col' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    Chọn <br />
                    <FormCheckbox ref={e => this.checkHPNgoaiKeHoachAll = e}
                        onChange={value => {
                            let { listHocPhanChon } = this.state;
                            if (value == 0) {
                                list.map(item => item.isChon = value);
                                list.forEach(item => this.countHocPhan(item));

                                listHocPhanChon.forEach(item => {
                                    list.forEach(itemHP => {
                                        if (item.maHocPhan == itemHP.maHocPhan) {
                                            item.isChon = itemHP.isChon;
                                        }
                                    });
                                });

                                this.setState({ listHocPhanChon });
                            } else {
                                list.forEach(item => {
                                    if (item.siSo <= item.soLuongDuKien) {
                                        let check = this.checkHocPhan(item);
                                        if (check == true) {
                                            item.isChon = value;
                                            this.countHocPhan(item);
                                        }
                                    }
                                });

                                listHocPhanChon.forEach(item => {
                                    list.forEach(itemHP => {
                                        if (item.maHocPhan == itemHP.maHocPhan) {
                                            item.isChon = itemHP.isChon;
                                        }
                                    });
                                });

                                this.setState({ listHocPhanChon });
                            }
                        }}
                    />
                </th>
                <TableHead className='sticky-col pin-3-col' style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhan'
                    onKeySearch={this.handleKeySearchHpNgoaiKeHoach} onSort={this.onSortHpNgoaiKeHoach}
                />
                <TableHead className='sticky-col pin-4-col' style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn' keyCol='tenMonHoc'
                    onKeySearch={this.handleKeySearchHpNgoaiKeHoach} onSort={this.onSortHpNgoaiKeHoach}
                />
                <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Lớp' keyCol='lop'
                    onKeySearch={this.handleKeySearchHpNgoaiKeHoach} onSort={this.onSortHpNgoaiKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tín chỉ' keyCol='tinChi'
                    onKeySearch={this.handleKeySearchHpNgoaiKeHoach} onSort={this.onSortHpNgoaiKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tổng tiết' keyCol='tongTiet'
                    onKeySearch={this.handleKeySearchHpNgoaiKeHoach} onSort={this.onSortHpNgoaiKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Phòng' keyCol='phong'
                    onKeySearch={this.handleKeySearchHpNgoaiKeHoach} onSort={this.onSortHpNgoaiKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thứ' keyCol='thu'
                    onKeySearch={this.handleKeySearchHpNgoaiKeHoach} onSort={this.onSortHpNgoaiKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tiết' keyCol='tiet'
                    onKeySearch={this.handleKeySearchHpNgoaiKeHoach} onSort={this.onSortHpNgoaiKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Giảng viên' keyCol='giangVien'
                    onKeySearch={this.handleKeySearchHpNgoaiKeHoach} onSort={this.onSortHpNgoaiKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Trợ giảng' keyCol='troGiang'
                    onKeySearch={this.handleKeySearchHpNgoaiKeHoach} onSort={this.onSortHpNgoaiKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày bắt đầu' keyCol='ngayBatDau'
                    onSort={this.onSortHpNgoaiKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày kết thúc' keyCol='ngayKetThuc'
                    onSort={this.onSortHpNgoaiKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Sĩ số' keyCol='siSo'
                    onKeySearch={this.handleKeySearchHpNgoaiKeHoach} onSort={this.onSortHpNgoaiKeHoach}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tình trạng học phần' keyCol={`tinhTrangHocPhan:${ma}`}
                    onKeySearch={this.handleKeySearchHpNgoaiKeHoach} onSort={this.onSortHpNgoaiKeHoach}
                />
            </tr>
        ),
        renderRow: (item, index) => {
            const rows = [];
            let listHocPhan = (list || []).groupBy('maHocPhan')[item] || [],
                rowSpan = listHocPhan.length;
            if (rowSpan) {
                for (let i = 0; i < rowSpan; i++) {
                    const hocPhan = listHocPhan[i];
                    if (i == 0) {
                        rows.push(
                            <tr key={rows.length} style={{ backgroundColor: this.backgroundColor(hocPhan), cursor: 'pointer' }} onClick={() => this.chonHocPhan(hocPhan, list)}>
                                <TableCell className='sticky-col pin-1-col' style={{ textAlign: 'right' }} content={(index + 1)} rowSpan={rowSpan} />
                                <TableCell className='sticky-col pin-2-col' type='checkbox' isCheck style={{ textAlign: 'center' }} content={hocPhan.isChon} permission={{ write: true }}
                                    onChanged={() => this.chonHocPhan(hocPhan, list)} rowSpan={rowSpan}
                                />
                                <TableCell className='sticky-col pin-3-col' style={{ whiteSpace: 'nowrap' }} content={hocPhan.maHocPhan} rowSpan={rowSpan} />
                                <TableCell className='sticky-col pin-4-col' content={T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.maLop} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tongTinChi} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tongTiet} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.phong} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.thu} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.ngayBatDau} rowSpan={rowSpan} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.ngayKetThuc} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={(hocPhan.siSo ? hocPhan.siSo : '0') + '/' + (hocPhan.soLuongDuKien ? hocPhan.soLuongDuKien : '0')} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tenTinhTrang} rowSpan={rowSpan} />
                            </tr>);
                    } else {
                        rows.push(
                            <tr key={rows.length} style={{ backgroundColor: this.backgroundColor(hocPhan), cursor: 'pointer' }} onClick={() => this.chonHocPhan(hocPhan, list)}>
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.thu} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                            </tr>
                        );
                    }
                }
            }
            return rows;
        },
    });

    renderListHocPhanNgoaiCtdt = (list, ma) => renderDataTable({
        data: Object.keys((list || []).groupBy('maHocPhan')) || [],
        emptyTable: 'Không tìm thấy học phần!',
        header: 'thead-light',
        stickyHead: true,
        divStyle: { height: '50vh' },
        className: 'table-pin',
        customClassName: 'table-pin-wrapper',
        renderHead: () => (
            <tr>
                <th className='sticky-col pin-1-col' style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th className='sticky-col pin-2-col' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    Chọn <br />
                    <FormCheckbox ref={e => this.checkHPNgoaiCtdtAll = e}
                        onChange={value => {
                            let { listHocPhanChon } = this.state;
                            if (value == 0) {
                                list.map(item => item.isChon = value);
                                list.forEach(item => this.countHocPhan(item));

                                listHocPhanChon.forEach(item => {
                                    list.forEach(itemHP => {
                                        if (item.maHocPhan == itemHP.maHocPhan) {
                                            item.isChon = itemHP.isChon;
                                        }
                                    });
                                });

                                this.setState({ listHocPhanChon });
                            } else {
                                list.forEach(item => {
                                    if (item.siSo <= item.soLuongDuKien) {
                                        let check = this.checkHocPhan(item);
                                        if (check == true) {
                                            item.isChon = value;
                                            this.countHocPhan(item);
                                        }
                                    }
                                });

                                listHocPhanChon.forEach(item => {
                                    list.forEach(itemHP => {
                                        if (item.maHocPhan == itemHP.maHocPhan) {
                                            item.isChon = itemHP.isChon;
                                        }
                                    });
                                });

                                this.setState({ listHocPhanChon });
                            }
                        }}
                    />
                </th>
                <TableHead className='sticky-col pin-3-col' style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhan'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead className='sticky-col pin-4-col' style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn' keyCol='tenMonHoc'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Lớp' keyCol='lop'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tín chỉ' keyCol='tinChi'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tổng tiết' keyCol='tongTiet'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Phòng' keyCol='phong'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thứ' keyCol='thu'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tiết' keyCol='tiet'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Giảng viên' keyCol='giangVien'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Trợ giảng' keyCol='troGiang'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày bắt đầu' keyCol='ngayBatDau'
                    onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày kết thúc' keyCol='ngayKetThuc'
                    onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Sĩ số' keyCol='siSo'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tình trạng học phần' keyCol={`tinhTrangHocPhan:${ma}`}
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
            </tr>
        ),
        renderRow: (item, index) => {
            const rows = [];
            let listHocPhan = (list || []).groupBy('maHocPhan')[item] || [],
                rowSpan = listHocPhan.length;
            if (rowSpan) {
                for (let i = 0; i < rowSpan; i++) {
                    const hocPhan = listHocPhan[i];
                    if (i == 0) {
                        rows.push(
                            <tr key={rows.length} style={{ backgroundColor: this.backgroundColor(hocPhan), cursor: 'pointer' }} onClick={() => this.chonHocPhan(hocPhan, list)}>
                                <TableCell className='sticky-col pin-1-col' style={{ textAlign: 'right' }} content={(index + 1)} rowSpan={rowSpan} />
                                <TableCell className='sticky-col pin-2-col' type='checkbox' isCheck style={{ textAlign: 'center' }} content={hocPhan.isChon} permission={{ write: true }}
                                    onChanged={() => this.chonHocPhan(hocPhan, list)} rowSpan={rowSpan}
                                />
                                <TableCell className='sticky-col pin-3-col' style={{ whiteSpace: 'nowrap' }} content={hocPhan.maHocPhan} rowSpan={rowSpan} />
                                <TableCell className='sticky-col pin-4-col' content={T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.maLop} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tongTinChi} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tongTiet} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.phong} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.thu} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.ngayBatDau} rowSpan={rowSpan} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.ngayKetThuc} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={(hocPhan.siSo ? hocPhan.siSo : '0') + '/' + (hocPhan.soLuongDuKien ? hocPhan.soLuongDuKien : '0')} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tenTinhTrang} rowSpan={rowSpan} />
                            </tr>);
                    } else {
                        rows.push(
                            <tr key={rows.length} style={{ backgroundColor: this.backgroundColor(hocPhan), cursor: 'pointer' }} onClick={() => this.chonHocPhan(hocPhan, list)}>
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.thu} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                            </tr>
                        );
                    }
                }
            }
            return rows;
        },
    });

    chuyenHocPhan = (item, mssv) => {
        let listHocPhan = [item.maHocPhan];
        this.props.getHocPhanCheckDiemLichThi(listHocPhan, mssv, value => {
            let { lichThi, diem, hocPhi } = value;
            if (lichThi.length || diem.length || hocPhi.length) {
                let title = '';
                if (lichThi.length || diem.length) {
                    if (lichThi.length) title = 'Học phần đã có lịch thi ';
                    if (diem.length) title = title ? title + 'và sinh viên đã có điểm' : 'Sinh viên đã có điểm trong học phần';
                    T.alert(title + '. Bạn không thể chuyển đăng ký học phần!', 'warning', false, 2000);
                } else if (hocPhi.length) {
                    T.confirm('Cảnh báo', 'Sinh viên đã đóng học phí cho phần. Bạn có chắc muốn chuyển học phần?', 'warning', true, isConfirm => {
                        if (isConfirm) {
                            item.isUpdate = true;
                            this.modalHocPhan.show({ sinhVien: this.state.listSinhVienChon[0], hocPhan: item });
                        }
                    });
                }
            } else {
                item.isUpdate = true;
                this.modalHocPhan.show({ sinhVien: this.state.listSinhVienChon[0], hocPhan: item });
            }
        });
    }

    chonHocPhanLoading = (createFunc) => {
        T.alert('Đang xử lý', 'warning', false, null, true);
        createFunc((data) => {
            if (data) {
                T.alert(data.error, 'error', false, 1000);
            } else {
                T.alert('Đăng ký thành công', 'success', false, 1000);
            }
        });
    }

    xoaHocPhan = (data, mssv) => {
        let listHocPhan = [...new Set(data.map(e => e.maHocPhan))];
        this.props.getHocPhanCheckDiemLichThi(listHocPhan, mssv, value => {
            let { lichThi, diem, hocPhi } = value;
            if (lichThi.length || diem.length || hocPhi.length) {
                let title = '';
                if (lichThi.length) {
                    let list = lichThi.join(', ');
                    title = `<div>Học phần ${list} đã có lịch thi;<br />`;
                }
                if (diem.length) {
                    let list = diem.join(', ');
                    title = title ? title + `Học phần ${list} đã có điểm;<br />` : `<div>Học phần ${list} đã có điểm;<br />`;
                }
                if (hocPhi.length) {
                    let list = hocPhi.join(', ');
                    title = title ? title + `Học phần ${list} đã đóng học phí;<br />` : `<div>Học phần ${list} đã đóng học phí;<br />`;
                }
                T.confirm('Cảnh báo', title + 'Bạn có chắc muốn hủy đăng ký?</div>', 'warning', true, isConfirm => {
                    if (isConfirm) this.setState({ isDelete: true }, () => this.ghiChuModal.show(listHocPhan, mssv));
                });
            } else this.setState({ isDelete: true }, () => this.ghiChuModal.show(listHocPhan, mssv));
        });
    }

    onChangeNamHocHocKy = () => {
        let value = this.sinhVien.data();
        if (!value) return;
        let { loaiHinhDaoTao, mssv, khoa } = value.item;

        let filterhp = {
            loaiHinhDaoTao,
            khoaDaoTao: khoa,
            namHoc: this.state.filterhp?.namHoc || this.state.namHoc,
            hocKy: this.state.filterhp?.hocKy || this.state.hocKy
        };
        let filterSV = {
            mssvFilter: mssv,
            loaiHinhDaoTao,
            khoaDaoTao: khoa,
            namHoc: this.state.filterhp?.namHoc || this.state.namHoc,
            hocKy: this.state.filterhp?.hocKy || this.state.hocKy
        };
        if (!Object.keys(filterhp).some(key => filterhp[key] == null)) {
            this.listSinhVien = [value.item];
            this.setState({
                filterSV, listSinhVienChon: this.listSinhVien, filterhp, isShowStud: true, isShowSubj: false, isDelete: false,
                ksSearchHp: {}, ksSearchHpSv: {}, sortTermHp: 'maHocPhan_ASC', sortTermHpSv: 'maHocPhan_ASC'
            }, () => {
                this.sinhVienModal.initData(value.item);
                let { mssvFilter, loaiHinhDaoTao, khoaDaoTao, namHoc, hocKy } = filterSV,
                    filter = {
                        loaiHinhDaoTao, khoaDaoTao, namHoc, hocKy,
                        ...this.state.ksSearchHpKh,
                        sort: this.state?.sortTermHpKh || this.defaultSortTermKh,
                    };
                this.props.getHocPhanCtdt(mssvFilter, filter, '', value => {
                    let listHocPhanKh = value.filter(e => e.maLoaiDky == 'KH'),
                        listHocPhanNkh = value.filter(e => e.maLoaiDky == 'NKH');
                    this.setState({ listHocPhanCtdt: value, listHocPhanKh, listHocPhanNkh }, () => this.hocPhanFilter());
                });
                this.getKetQuaDangKyHocPhan();
                this.listHocPhan = [];
                this.loaiHinhDaoTao.value(loaiHinhDaoTao);
                this.khoaDaoTao.value(khoa);
                this.khoaSinhVien.value('');
                this.tab?.tabClick(null, 0);
            });
        }
    }

    luuThanhCong = () => {
        this.onChangeNamHocHocKy();
    }

    render() {
        let { listHocPhanChon, filterhp, dataKetQua } = this.state;

        listHocPhanChon.forEach(item => {
            this.listHocPhan.forEach(itemHP => {
                if (item.maHocPhan == itemHP.maHocPhan) {
                    item.isChon = itemHP.isChon;
                }
            });
        });

        return (
            <>
                <div className='tile'>
                    <div className='tile-body'>
                        <div className='row'>
                            <div className='col-md-12'>
                                {/* <h6 className='col-md-12 tile-title'>Thông tin sinh viên</h6> */}
                                <div className='row justify-content'>
                                    <FormSelect ref={e => this.sinhVien = e} className='col-md-12' label='Chọn sinh viên' data={SelectAdapter_DangKyHocPhanStudent}
                                        onChange={this.onChangeNamHocHocKy} />
                                    {this.state.isShowStud ? <div className='col-md-12'>

                                        <div className='row'>
                                            <div className='col-md-6'>
                                                {this.renderHocPhanDangKyComponent(dataKetQua)}
                                            </div>
                                            <div className='col-md-6'>
                                                {this.renderHocPhanComponent(listHocPhanChon)}
                                            </div>
                                        </div>
                                    </div> : <div />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <ConfirmDangKy ref={(e) => (this.modal = e)} create={this.props.createDtDangKyHocPhan} hocPhanFilter={this.hocPhanFilter}
                    getHocPhanByStudent={this.getKetQuaDangKyHocPhan} filterhp={filterhp} luuThanhCong={this.luuThanhCong} />
                <ListHocPhanModal ref={(e) => (this.listHpChonModal = e)} xoaHocPhan={this.chonHocPhan} listHocPhanChon={listHocPhanChon} />
                <LichSuDKHPModal ref={e => this.lichSuModal = e} currentSemester={this.props.currentSemester} />
                <DkttHocPhanModal ref={e => this.modalHocPhan = e} loading={this.chonHocPhanLoading} dataKetQua={this.state.dataKetQua}
                    getHocPhanByStudent={this.getKetQuaDangKyHocPhan} currentSemester={this.props.currentSemester} />
                <GhiChuModal ref={(e) => (this.ghiChuModal = e)} deleteDtDangKyHocPhan={this.props.deleteDtDangKyHocPhan}
                    hocPhanFilter={this.hocPhanFilter} getKetQuaDangKyHocPhan={this.getKetQuaDangKyHocPhan} filterhp={filterhp} />
            </>
        );
    }
}

const mapStateToProps = (state) => ({ system: state.system, dtDangKyHocPhan: state.daoTao.dtDangKyHocPhan });
const mapActionsToProps = { getStudent, createDtDangKyHocPhan, getDtDangKyHocPhanAll, getHocPhan, getHocPhanCtdt, checkCondition, getDtDangKyHocPhanByStudent, deleteDtDangKyHocPhan, getHocPhanCheckDiemLichThi };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(FormDangKySinhVien);