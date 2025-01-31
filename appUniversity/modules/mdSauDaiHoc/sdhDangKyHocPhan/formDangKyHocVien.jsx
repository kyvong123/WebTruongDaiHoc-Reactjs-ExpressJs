import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormCheckbox, renderTable, FormSelect, FormTabs, FormTextBox, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import { SelectAdapter_DangKyHocPhanStudentSdh, getSdhDangKyHocPhanByStudent, checkCondition, getHocPhanSdhCtdt, getHocPhan, createSdhDangKyHocPhanAdvance, deleteSdhDangKyHocPhan, getCtdtByLop, getHocPhanByLop, getHocPhanByHocVien } from './redux';
import ThongTinHocVienSdh from './initData';
import SdhDkttHocPhanModal from './hocPhanModal';
import { Tooltip } from '@mui/material';
import { SelectAdapter_DmHocSdhVer2 } from 'modules/mdSauDaiHoc/dmHocSdh/redux';
import { SelectAdapter_DmKhoaSdh } from 'modules/mdSauDaiHoc/dmKhoaSauDaiHoc/redux';
import { SelectAdapter_SdhKhoaHocVien } from '../sdhKhoaDaoTao/redux';
import { SelectAdapter_SdhLopHocVien } from '../sdhLopHocVien/redux';
import ConfirmDangKy from './confirmDangKy';
import LichSuDKHPModal from './lichSuDkhpModal';
import ListHocPhanModal from './listHocPhanModal';


class CtdtModal extends AdminModal {
    onShow = (data) => {
        const ctdt = data && data[0].ctdt;
        this.setState({ ctdt, dataCtdt: data });
    }
    render = () => {
        const table = renderTable({
            getDataSource: () => this.state.dataCtdt || [],
            header: 'thead-light',
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã môn học</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tên môn học</th>
                    <th style={{ width: '20', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tín chỉ</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Năm học</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Học kỳ</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>TTMH</th>
                </tr>

            ),
            renderRow: (item, index) => (
                <tr>
                    <TableCell style={{ textAlign: 'center' }} content={(index + 1)} />
                    <TableCell style={{ textAlign: 'center' }} content={item.maMonHoc} />
                    <TableCell style={{ textAlign: 'center' }} content={item.tenMonHoc} />
                    <TableCell style={{ textAlign: 'center' }} content={<>
                        <p>
                            {`TC lí thuyết: ${item.liThuyet} `}
                        </p>
                        {item.thucHanh ? <p>
                            {`TC thực hành: ${item.thucHanh} `}
                        </p> : null}
                    </>} />
                    <TableCell style={{ textAlign: 'center' }} content={item.namHoc} />
                    <TableCell style={{ textAlign: 'center' }} content={item.hocKy} />
                    <TableCell style={{ textAlign: 'center' }} content={item.tenTinhTrang} />
                </tr>)

        });
        return this.renderModal({
            title: `Chương trình đào tạo ${this.state.ctdt}`,
            size: 'large',
            body: <>
                {table}
            </>,

        });
    }
}

class GhiChuModal extends AdminModal {

    onShow = (hocPhan, mssv) => {
        this.setState({ hocPhan, mssv });
    }

    onSubmit = () => {
        let { hocPhan } = this.state;
        let tenHP = T.parse(hocPhan?.tenMonHoc, { vi: '' })?.vi;
        if (!this.lyDo.value() || this.lyDo.value() == '') {
            T.notify('Vui lòng nhập lý do!', 'danger');
        } else {
            T.confirm('Cảnh báo', `Bạn có chắc muốn hủy đăng ký học phần ${hocPhan.maHocPhan}?`, 'warning', true, isConfirm => {
                if (isConfirm) {
                    let mssv = this.state.mssv;
                    T.alert('Đang xử lý', 'warning', false, null, true);
                    let { namHoc, hocKy, loaiHinhDaoTao, khoaSinhVien } = this.props.filterhp,
                        filter = { namHoc, hocKy, loaiHinhDaoTao, khoaSinhVien, tenMonHoc: tenHP, ghiChu: this.lyDo.value() };
                    this.props.deleteSdhDangKyHocPhan(hocPhan.maHocPhan, mssv, filter, (value) => {
                        if (value && value.message) T.alert('Xóa học phần thất bại', 'warning', false, 1000);
                        else T.alert('Huỷ học phần thành công', 'success', false, 1000);
                        this.lyDo.value('');
                        this.props.luuThanhCong();
                    });
                    this.hide();
                }
            });
        }

    }

    render = () => {
        let { hocPhan } = this.state, tenHP = '';
        if (hocPhan) {
            tenHP = T.parse(hocPhan?.tenMonHoc, { vi: '' })?.vi;
        }
        return this.renderModal({
            title: `Lý do xoá học phần ${hocPhan?.maHocPhan}: ${tenHP}`,
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


class FormDangKyHocVienSdh extends AdminPage {
    state = { listSinhVienChon: [], listHocPhanChon: [], listHocPhanCtdt: [], filter: {}, filterhp: {}, ksSearch: {}, isMultiSinhVien: true, listMessengers: {}, isDone: false, isSvLoading: true, isShowStud: false, isHpLoading: true, isShowSubj: false, searchCtdt: false };
    listSinhVien = [];
    listHocPhan = [];
    defaultSortTerm = 'maMonHoc_ASC';

    chuyenHocPhan = (item) => {
        item.isUpdate = true;
        this.modalHocPhan.show({ sinhVien: this.state.listSinhVienChon[0], hocPhan: item });
    }

    xoaHocPhan = (item) => {
        this.setState({ isDelete: true }, () => {
            this.ghiChuModal.show(item, this.state.listSinhVienChon[0].mssv);
        });
        this.hocPhanFilter();
        this.onChangeNamHocHocKy();
    }

    renderListKetQua = (list) => renderDataTable({
        data: list == null ? null : Object.keys(list.groupBy('maHocPhan')),
        emptyTable: 'Không tìm thấy học phần!',
        header: 'thead-light',
        stickyHead: list && list.length > 8 ? true : false,
        divStyle: { height: '60vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <FormCheckbox ref={e => this.checkHPAll = e}
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
                <TableHead style={{ width: '30%' }} content='Mã môn học' keyCol='maHocPhan'
                    onKeySearch={this.handleKeySearchHP}
                />
                <TableHead style={{ width: '50%' }} content='Tên môn' keyCol='tenMonHoc'
                    onKeySearch={this.handleKeySearchHP}
                />
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại đăng ký</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Sĩ số</th>
                <th style={{ width: 'auto' }}>TC</th>
                <th style={{ width: 'auto' }}>Tổng tiết</th>
                <th style={{ width: 'auto' }}>Phòng</th>
                <th style={{ width: 'auto' }}>Thứ</th>
                <th style={{ width: 'auto' }}>Tiết</th>
                <th style={{ width: 'auto' }}>Giảng viên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trợ giảng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày bắt đầu</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày kết thúc</th>
            </tr>
        ),
        renderRow: (item, index) => {
            const rows = [];
            let listHocPhan = list.groupBy('maHocPhan')[item] || [],
                rowSpan = listHocPhan.length;
            if (rowSpan) {
                for (let i = 0; i < rowSpan; i++) {
                    const hocPhan = listHocPhan[i];
                    if (i == 0) {
                        rows.push(
                            <tr key={rows.length}>
                                <TableCell style={{ textAlign: 'right' }} content={(index + 1)} rowSpan={rowSpan} />
                                <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={hocPhan.isChon} permission={{ write: true }} rowSpan={rowSpan}
                                    onChanged={() => this.chonHocPhan(hocPhan, list)}
                                />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.maMonHoc} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tenMonHoc} rowSpan={rowSpan} />
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
                    const list = { listMSSV, itemHocPhan, idDotDangKy: this.props.idDot && this.props.idDot };
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

    showCtdt = () => {
        let value = this.sinhVien.data();
        if (!value) return;
        let { lop } = value.userData;
        this.props.getCtdtByLop({ maLop: lop, maHv: value.item.mssv, idNamHoc: this.props.currentSemester && this.props.currentSemester.id || null }, (data) => {
            this.ctdtModal.show(data.rows);
        });
    }

    renderHocPhanDangKyComponent = (listHocPhanDangKy) => {
        return (
            <div className='row justify-content border-right'>
                <div className='col-md-12'>
                    <div className='row'>
                        <h6 className='col-md-6 tile-title'>Thông tin sinh viên</h6>
                        <div className='col-md-6'>
                            <div className='rows' style={{ textAlign: 'right' }}>
                                {this.state.isShowStud ?
                                    <>
                                        <Tooltip title='Tìm kiếm' arrow>
                                            <button className='btn btn-primary'
                                                onClick={(e) => e.preventDefault()
                                                    || this.showCtdt(e)
                                                }
                                            >
                                                <i className='fa fa-search' /> Xem ctdt
                                            </button>
                                        </Tooltip>
                                    </>
                                    : <div />
                                }

                            </div>
                        </div>

                    </div>
                </div>
                <div className='col-md-12'>
                    <ThongTinHocVienSdh ref={e => this.sinhVienModal = e} />
                </div>
                <div className='col-md-12'>
                    <FormTabs ref={e => this.tabDkHp = e} tabs={[
                        { title: 'Theo CTDT', component: this.renderListHocPhan(listHocPhanDangKy) },
                        { title: 'Ngoài CTDT', component: this.renderListHocPhan(listHocPhanDangKy) },
                    ]} onChange={() => this.onChangeNamHocHocKy()} />


                </div>
            </div>
        );
    }

    getKetQuaDangKyHocPhan = (filter) => {
        this.setState({ isSvLoading: true });
        this.props.getHocPhanByLop({ maCtdt: filter.maCtdt, maLop: filter.lopSV, maHv: filter.mssvFilter, idNamHoc: this.props.currentSemester && this.props.currentSemester.id || null, indexTab: this.tabDkHp && this.tabDkHp.state && this.tabDkHp.state.tabIndex.toString(), idDot: this.props.idDot && this.props.idDot }, (data) => {
            this.setState({ dataKetQua: data.rows, isSvLoading: false });
        });
    }

    onChangeNamHocHocKy = () => {
        let value = this.sinhVien.data();
        if (!value) return;
        let { loaiHinhDaoTao, lop, maCtdt } = value.userData;
        if (!lop) {
            T.notify('Học viên phải có lớp trước khi đăng kí học phần', 'info');
            this.props.history.push('/user/sau-dai-hoc/lop-hoc-vien');
        } else if (!this.props.currentSemester.id) {
            T.notify('Chọn năm học, học kỳ', 'info');
            this.sinhVien.value(null);
        }
        else {
            let { namTuyenSinh, mssv, khoa, tenKhoa } = value.item;
            let filterhp = {
                loaiHinhDaoTao,
                khoaSinhVien: namTuyenSinh,
                namHoc: this.state.filterhp?.namHoc || this.state.namHoc,
                hocKy: this.state.filterhp?.hocKy || this.state.hocKy,
                idNamHoc: this.props.currentSemester.id,
                maHocVien: mssv,
                lopHocVien: lop,
                currentTime: new Date().getTime()
            };
            let filterSV = {
                mssvFilter: mssv,
                loaiHinhDaoTao,
                khoaSinhVien: namTuyenSinh,
                khoaDaoTao: khoa,
                lopSV: lop,
                namHoc: this.state.filterhp?.namHoc || this.state.namHoc,
                hocKy: this.state.filterhp?.hocKy || this.state.hocKy,
                maCtdt
            };
            if (Object.keys(filterhp).some(key => filterhp[key] == null)) {
                this.listSinhVien = [value.item];
                this.setState({ listSinhVienChon: this.listSinhVien, isShowStud: true, isShowSubj: false, isDelete: false }, () => {
                    this.sinhVienModal.initData({ ...value.item, tenKhoa });
                    this.setState({ filterhp: { ...this.state.filterhp, ...filterhp, loaiHinhDaoTao: loaiHinhDaoTao || '', khoaDaoTao: khoa } });
                    this.getKetQuaDangKyHocPhan(filterSV, filterhp);
                    this.listHocPhan = [];

                });
            }
        }

    }

    listHpChon = () => {
        this.listHpChonModal.show(this.listHocPhan);
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

    changeTabDkHp = () => {
        let value = this.sinhVien.data();

        if (!value) return;
        let { maCtdt } = value.userData;
        let { filterhp } = this.state,
            filter = { ...filterhp, sort: 'maHocPhan_ASC', isCheck: '1' };
        if (this.tabHpDk && this.tabHpDk.state && this.tabHpDk.state.tabIndex == '2') {
            filter = { ...filter, maCtdt, isTheoCtdt: '0', idDot: this.props.idDot && this.props.idDot };
        } else {
            filter = { ...filter, maCtdt, isTheoCtdt: '1' };
        }
        this.setState({ filterhp: filter });

        this.props.getHocPhanByHocVien(filter, (value) => {

            this.setState({ listHocPhanChon: value, isShowSubj: true, isHpLoading: false, idDot: value && value[0] && value[0].idDot }, () => {
                this.checkHPAll && this.checkHPAll.value(false);
            });
        });
    }

    hocPhanFilter = () => {
        let value = this.sinhVien.data();
        if (!value) return;
        let { filterhp, listHocPhanCtdt } = this.state,
            { khoaDaoTao, loaiHinhDaoTao } = filterhp,
            filter = { ...filterhp, sort: 'maHocPhan_ASC', isCheck: '1', };
        if (!loaiHinhDaoTao) {
            T.notify('Loại hình đào tạo bị trống!', 'danger');
            this.loaiHinhDaoTao.focus();
        } else if (!khoaDaoTao) {
            T.notify('Khoa bị trống!', 'danger');
            this.khoaDaoTao.focus();
        } else {
            this.props.getHocPhanByHocVien(filter, (value) => {
                listHocPhanCtdt.forEach(item => {
                    value.filter(e => e.maHocPhan != item.maHocPhan);
                });
                this.setState({ listHocPhanChon: value, isShowSubj: true, isHpLoading: false, idDot: value && value[0] && value[0].idDot }, () => {
                    this.checkHPAll && this.checkHPAll.value(false);
                });
            });
        }
    };

    handleKeySearchHP = (data) => {
        this.setState({ ksSearch: { [data.split(':')[0]]: data.split(':')[1] } }, () => {
            let filter = {
                ...this.state.filterhp,
                ...this.state.ksSearch,
                sort: 'maHocPhan_ASC'
            };
            this.props.getHocPhanByHocVien(filter, (value) => {
                let { listHocPhanCtdt } = this.state;
                listHocPhanCtdt.forEach(item => {
                    value.filter(e => e.maHocPhan != item.maHocPhan);
                });
                let list = [...value, ...listHocPhanCtdt];
                this.setState({ listHocPhanChon: list, isShowSubj: true, isHpLoading: false, idDot: list && list[0] && list[0].idDot });
            });
        });
    }


    chonHocPhan = (item) => {
        let list = this.state.listHocPhanChon;
        if (item.isChon == 1) {
            item.isChon = !item.isChon;
            let hocPhanDup = list.filter(dup => dup.maHocPhan == item.maHocPhan && dup.R != item.R);
            if (hocPhanDup.length > 0) hocPhanDup.forEach(hp => hp.isChon = !hp.isChon);
            this.countHocPhan(item);
            this.setState({ listHocPhanChon: list }, () => {
                this.checkHPAll.value(false);
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
            }
        }
    }

    luuThanhCong = () => {
        this.onChangeNamHocHocKy();
        this.changeTabDkHp();
    }

    updateHocKy = () => {
        this.onChangeNamHocHocKy();
        this.hocPhanFilter();
    }

    backgroundColor = (item) => {
        if (item.tenTinhTrang == '1') {
            return '#44ac4f';
        } else if (item.tenTinhTrang == '0') {
            return '#bcc0c6';
        }
        else if (item.isChon == true) {
            return '#cfe2ff';
        } else if (item.tinhTrang == 4) {
            return '#ea868f';
        } else {
            return '#ffffff';
        }
    }

    renderListHocPhan = (list) => renderDataTable({
        data: list ? Object.keys((list || []).groupBy('maMonHoc')) || [] : [],
        emptyTable: 'Không tìm thấy học phần!',
        header: 'thead-light',
        stickyHead: list && list.length > 8,
        divStyle: { height: '60vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: '30%' }}>Mã môn học</th>
                <th style={{ width: '50%' }}>Tên môn</th>
                <th style={{ width: 'auto' }}>TC lý thuyết</th>
                <th style={{ width: 'auto' }}>TC thực hành</th>
                <th style={{ width: 'auto' }}>Cơ sở</th>
                <th style={{ width: 'auto' }}>Học kỳ</th>
                <th style={{ width: 'auto' }}>Năm học</th>
                <th style={{ width: 'auto' }}>Số tiết buổi</th>
                <th style={{ width: 'auto' }}>Giảng viên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày bắt đầu</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày kết thúc</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>

            </tr>
        ),
        renderRow: (item, index) => {
            const rows = [];
            let listHocPhan = (list || []).groupBy('maMonHoc')[item] || [],
                rowSpan = listHocPhan.length;
            if (rowSpan) {
                for (let i = 0; i < rowSpan; i++) {
                    const hocPhan = listHocPhan[i];
                    if (i == 0) {
                        rows.push(
                            <tr key={rows.length} style={{ fontWeight: hocPhan.tenTinhTrang == 1 ? 500 : null, color: hocPhan.tenTinhTrang == 1 ? 'white' : null, cursor: 'pointer' }}
                            >
                                <TableCell content={index + 1} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.maMonHoc} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tenMonHoc} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tinChiThucHanh} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tinChiLyThuyet} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.coSo} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.hocKy} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.nam} />

                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tietBatDau && hocPhan.soTietBuoi ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayBatDau} rowSpan={rowSpan} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayKetThuc} rowSpan={rowSpan} />
                                <TableCell type='buttons' style={{ textAlign: 'center' }} content={hocPhan} rowSpan={rowSpan}>
                                    <Tooltip title='Hủy môn' arrow>
                                        <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.xoaHocPhan(hocPhan)} >
                                            <i className='fa fa-lg fa-trash' />
                                        </button>
                                    </Tooltip>
                                </TableCell>
                            </tr>);
                    } else {
                        rows.push(
                            <tr key={rows.length} style={{ backgroundColor: this.backgroundColor(hocPhan), cursor: 'pointer' }} onClick={() => this.chonHocPhan(hocPhan, list)}>
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tinChiThucHanh} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tinChiLyThuyet} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.coSo} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.hocKy} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.nam} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tietBatDau && hocPhan.soTietBuoi ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                            </tr>
                        );
                    }
                }
            }
            return rows;
        },
    });

    renderHocPhanComponent = (listHocPhanDangKy) => {
        return (
            <div className='row justify-content border-left'>
                <div className='col-md-12'>
                    <div className='row'>
                        <h6 className='col-md-8 tile-title'>Danh sách học phần</h6>

                        <div className='col-md-4'>
                            <div className='rows' style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' onClick={(e) => {
                                    e.preventDefault() || this.hocPhanFilter();
                                }} >
                                    <i className='fa fa-search' /> Tìm kiếm
                                </button>
                            </div>
                        </div>
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
                <FormSelect ref={(e) => (this.loaiHinhDaoTao = e)} className='col-md-3' label='Loại hình đào tạo' data={SelectAdapter_DmHocSdhVer2} required
                    onChange={(value) => {
                        this.setState({
                            filterhp: { ...this.state.filterhp, loaiHinhDaoTao: value?.id || '' },
                        });
                    }}
                />
                <FormSelect ref={(e) => (this.khoaDaoTao = e)} className='col-md-3' label='Khoa' data={SelectAdapter_DmKhoaSdh} required
                    onChange={(value) =>
                        this.setState({
                            filterhp: { ...this.state.filterhp, khoaDaoTao: value?.id || '' },
                        })
                    }
                />
                <FormSelect ref={(e) => (this.khoaSinhVien = e)} className='col-md-3' label='Khoá sinh viên' data={SelectAdapter_SdhKhoaHocVien}
                    onChange={(value) =>
                        this.setState({
                            filterhp: { ...this.state.filterhp, khoaSinhVien: value?.id || '' },
                        })
                    } allowClear
                />
                <FormSelect ref={(e) => (this.lopSV = e)} className='col-md-3' label='Lớp' data={SelectAdapter_SdhLopHocVien}
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
                    <FormTabs ref={e => this.tabHpDk = e} tabs={[
                        {
                            title: 'Theo kế hoạch', component: this.renderListKetQua(listHocPhanDangKy && listHocPhanDangKy.filter((ele) => {
                                if (ele.namDuKien == ele.nam && ele.hocKyDuKien != ele.hocKy) {
                                    return ele;
                                }
                            }))
                        },
                        {
                            title: 'Ngoài kế hoạch', component: this.renderListKetQua(listHocPhanDangKy && listHocPhanDangKy.filter((ele) => {
                                if (ele.namDuKien != ele.nam || ele.hocKyDuKien != ele.hocKy) {
                                    return ele;
                                }
                            }))
                        },
                        { title: 'Ngoài ctdt', component: this.renderListKetQua(listHocPhanDangKy) },
                    ]} onChange={() => this.changeTabDkHp()} />
                </div>
            </div>
        );
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
        return <>
            <div className='tile'>
                <div className='tile-body'>
                    <div className='row'>
                        <div className='col-md-12'>
                            <h6 className='col-md-12 tile-title'>Thông tin sinh viên</h6>
                            <div className='row justify-content'>
                                <FormSelect ref={e => this.sinhVien = e} className='col-md-12' label='Chọn sinh viên' data={SelectAdapter_DangKyHocPhanStudentSdh}
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

            <ConfirmDangKy ref={(e) => (this.modal = e)} create={this.props.createSdhDangKyHocPhanAdvance} hocPhanFilter={this.hocPhanFilter}
                getHocPhanByStudent={this.getKetQuaDangKyHocPhan} filterhp={filterhp} luuThanhCong={this.luuThanhCong} idDot={this.state.idDot} changeTab={this.changeTabDkHp} />
            <ListHocPhanModal ref={(e) => (this.listHpChonModal = e)} xoaHocPhan={this.chonHocPhan} listHocPhanChon={listHocPhanChon} />
            <LichSuDKHPModal ref={e => this.lichSuModal = e} currentSemester={this.props.currentSemester} />
            <SdhDkttHocPhanModal ref={e => this.modalHocPhan = e} loading={this.chonHocPhanLoading} dataKetQua={this.state.dataKetQua}
                getHocPhanByStudent={this.getKetQuaDangKyHocPhan} currentSemester={this.props.currentSemester} />
            <GhiChuModal ref={(e) => (this.ghiChuModal = e)} deleteSdhDangKyHocPhan={this.props.deleteSdhDangKyHocPhan}
                hocPhanFilter={this.hocPhanFilter} getKetQuaDangKyHocPhan={this.getKetQuaDangKyHocPhan} filterhp={filterhp} luuThanhCong={this.luuThanhCong} />
            <CtdtModal ref={(e) => this.ctdtModal = e} data={this.state.ctdtModal} />
        </>;
    }

}

const mapStateToProps = state => ({ system: state.system, sdhDangKyHocPhan: state.sdh.sdhDangKyHocPhan });
const mapActionsToProps = { getSdhDangKyHocPhanByStudent, checkCondition, getHocPhanSdhCtdt, getHocPhan, createSdhDangKyHocPhanAdvance, deleteSdhDangKyHocPhan, getCtdtByLop, getHocPhanByLop, getHocPhanByHocVien };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(FormDangKyHocVienSdh);

