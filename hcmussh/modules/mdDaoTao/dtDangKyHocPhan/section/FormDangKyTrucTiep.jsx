import React from 'react';
import { connect } from 'react-redux';
import { Tooltip } from '@mui/material';
import { FormSelect, TableCell, FormCheckbox, TableHead, renderDataTable, loadSpinner } from 'view/component/AdminPage';

import { SelectAdapter_DtLop } from 'modules/mdDaoTao/dtLop/redux';
import { SelectAdapter_DtKhoaDaoTaoFilter } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DtDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_LoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { createDtDangKyHocPhan, getStudent, getHocPhan, getDtDangKyHocPhanAll, getDtDangKyHocPhanStudentPage, checkCondition, getDtDangKyHocPhanByStudent } from 'modules/mdDaoTao/dtDangKyHocPhan/redux';

import ConfirmDangKy from 'modules/mdDaoTao/dtDangKyHocPhan/component/confirmDangKy';
import ListHocPhanModal from 'modules/mdDaoTao/dtDangKyHocPhan/component/listHocPhanModal';
import ListSinhVienModal from 'modules/mdDaoTao/dtDangKyHocPhan/component/listSinhVienModal';
class FormDangKyTrucTiep extends React.Component {
    state = { listSinhVienChon: [], listHocPhanChon: [], filter: {}, filterhp: {}, ksSearchSv: {}, ksSearchHp: {}, sortTermSv: 'mssv_ASC', sortTermHp: 'maHocPhan_ASC', isMultiSinhVien: true, isChecking: false, isSvLoading: false, isShowStud: false, isHpLoading: false, isShowSubj: false };
    listSinhVien = [];
    listHocPhan = [];
    defaultSortTermHp = 'maHocPhan_ASC';
    defaultSortTermSv = 'mssv_ASC';
    hocPhi = [
        { id: '1', text: 'Đã đóng đủ học phí' },
        { id: '0', text: 'Chưa đóng đủ học phí' },
    ]

    getSemester = () => {
        let { namHoc, hocKy } = this.props.currentSemester;
        this.listHocPhan = [];
        this.setState({
            namHoc, hocKy,
            filterhp: { ...this.state.filterhp, namHoc, hocKy }
        }, () => {
            if (this.state.isShowSubj) this.hocPhanFilter();
        });
    }

    luuThanhCong = () => {
        this.setState({ isShowStud: false, isShowSubj: false }, () => {
            this.listSinhVien = [];
            this.loaiHinhDaoTao.value('');
            this.khoaDaoTao.value('');
            this.khoaSinhVien.value('');
            this.lopSV.value('');
            this.listHocPhan = [];
            this.loaiHinhDaoTaoHp.value('');
            this.khoaDaoTaoHp.value('');
            this.khoaSinhVienHp.value('');
        });
    }

    getDataSv = () => {
        let filter = {
            ...this.state.filter,
            ...this.state.ksSearchSv,
            sort: this.state?.sortTermSv || this.defaultSortTermSv,
        };
        this.setState({ isSvLoading: true }, () => {
            this.props.getStudent(filter, (value) => {
                this.setState({ listSinhVienChon: value, isShowStud: true, isSvLoading: false }, () => {
                    this.checkSVAll.value(false);
                });
            });
        });
    }

    sinhVienFilter = () => {
        let { khoaDaoTao, loaiHinhDaoTao } = this.state.filter;
        if (!loaiHinhDaoTao) {
            T.notify('Loại hình đào tạo bị trống!', 'danger');
            this.loaiHinhDaoTao.focus();
        } else if (!khoaDaoTao) {
            T.notify('Khoa bị trống!', 'danger');
            this.khoaDaoTao.focus();
        } else {
            this.getDataSv();
        }
    };

    handleKeySearchSv = (data) => {
        this.setState({ ksSearchSv: { [data.split(':')[0]]: data.split(':')[1] } }, () => this.getDataSv());
    }

    onSortSv = (sortTerm) => {
        this.setState({ sortTermSv: sortTerm }, () => this.getDataSv());
    }

    getDataHp = () => {
        let filter = {
            ...this.state.filterhp,
            ...this.state.ksSearchHp,
            sort: this.state?.sortTermHp || this.defaultSortTermHp,
        };
        this.props.getHocPhan(filter, (value) => {
            this.setState({ listHocPhanChon: value, isShowSubj: true, isHpLoading: false }, () => {
                this.checkHPAll.value(false);
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

    countSinhVien = (item) => {
        let check = false;
        if (item.isChon == true) {
            this.listSinhVien.forEach(itemSV => {
                if (item.mssv == itemSV.mssv) check = true;
            });
            if (check == false) this.listSinhVien.push(item);
        } else if (item.isChon == false) {
            for (let i = 0; i < this.listSinhVien.length; i++) {
                if (item.mssv == this.listSinhVien[i].mssv) this.listSinhVien.splice(i, 1);
            }
        }
    }

    chonSinhVien = (item, list) => {
        if (item.tinhTrang != '1' && item.isChon == false) {
            T.notify('Sinh viên ' + item.hoTen + ' đã ' + item.tenTinhTrangSV, 'warning');
        } if (item.tinhPhi == '0' && item.isChon == false) {
            T.notify('Sinh viên ' + item.hoTen + ' còn nợ học phí!', 'warning');
        }

        item.isChon = !item.isChon;
        this.countSinhVien(item);
        this.setState({ listSinhVienChon: list }, () => {
            if (!item.isChon) {
                this.checkSVAll.value(false);
            }
        });
    }

    renderListSinhVien = (list) => renderDataTable({
        data: list,
        emptyTable: 'Không tìm thấy sinh viên!',
        header: 'thead-light',
        stickyHead: list?.length > 12 ? true : false,
        divStyle: { height: '55vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    Chọn <br />
                    <FormCheckbox ref={e => this.checkSVAll = e}
                        onChange={value => {
                            list.map(item => item.isChon = value);
                            list.forEach(item => this.countSinhVien(item));
                            this.setState({ listSinhVienChon: list });
                        }}
                    />
                </th>
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='MSSV' keyCol='mssv'
                    onKeySearch={this.handleKeySearchSv} onSort={this.onSortSv}
                />
                <TableHead style={{ width: '70%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Họ và tên' keyCol='hoTen'
                    onKeySearch={this.handleKeySearchSv} onSort={this.onSortSv}
                />
                <TableHead style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Lớp' keyCol='lop'
                    onKeySearch={this.handleKeySearchSv} onSort={this.onSortSv}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='TTSV' keyCol='tenTinhTrang'
                    onKeySearch={this.handleKeySearchSv} onSort={this.onSortSv}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Học phí' keyCol='hocPhi'
                    onKeySearch={this.handleKeySearchSv} onSort={this.onSortSv} typeSearch='select' data={this.hocPhi}
                />
            </tr>
        ),
        renderRow: (item, index) => {
            return (
                <tr key={index} style={{ cursor: 'pointer' }} onClick={() => this.chonSinhVien(item, list)}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={item.isChon} permission={{ write: true }}
                        onChanged={() => this.chonSinhVien(item, list)}
                    />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lop} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenTinhTrangSV} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} contentClassName={item.tinhPhi == '0' ? 'text-danger' : 'text-success'}
                        content={item.tinhPhi == '0'
                            ? <Tooltip title='Còn nợ học phí'>
                                <i className='fa fa-lg fa-times-circle' />
                            </Tooltip>
                            : <Tooltip title='Đã đóng đủ'>
                                <i className='fa fa-lg fa-check-circle' />
                            </Tooltip>} />
                </tr>
            );
        },
    });

    countHocPhan = (item) => {
        let check = false,
            checkDupMonHoc = false;
        if (item.isChon == true) {
            this.listHocPhan.forEach(itemHP => {
                if (item.maMonHoc == itemHP.maMonHoc && item.loaiHinhDaoTao == itemHP.loaiHinhDaoTao) {
                    checkDupMonHoc = true;
                }
                if (item.maHocPhan == itemHP.maHocPhan) check = true;
            });
            if (!check) {
                if (checkDupMonHoc) {
                    let dupIndex = this.listHocPhan.findIndex(hp => hp.maMonHoc == item.maMonHoc && hp.loaiHinhDaoTao == item.loaiHinhDaoTao);
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

    chonHocPhan = (item, list) => {
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

    renderListHocPhan = (list) => renderDataTable({
        data: list == null ? null : Object.keys(list.groupBy('maHocPhan')),
        emptyTable: 'Không tìm thấy học phần!',
        header: 'thead-light',
        stickyHead: list.length > 12 ? true : false,
        divStyle: { height: '55vh' },
        className: 'table-pin',
        customClassName: 'table-pin-wrapper',
        renderHead: () => (
            <tr>
                <th className='sticky-col pin-1-col' style={{ textAlign: 'center' }}>#</th>
                <th className='sticky-col pin-2-col' style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    Chọn <br />
                    <FormCheckbox ref={e => this.checkHPAll = e}
                        onChange={value => {
                            if (value == 0) {
                                list.map(item => item.isChon = value);
                                list.forEach(item => this.countHocPhan(item));
                                this.setState({ listHocPhanChon: list });
                            } else {
                                list.forEach(item => {
                                    if (item.siSo <= item.soLuongDuKien) {
                                        let check = this.checkHocPhan(item);
                                        if (check == true) {
                                            item.isChon = value;
                                            this.countHocPhan(item);
                                            this.setState({ listHocPhanChon: list });
                                        }
                                    }
                                });
                            }
                        }}
                    />
                </th>
                <TableHead className='sticky-col pin-3-col' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhan'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead className='sticky-col pin-4-col' style={{ width: '100px', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn' keyCol='tenMonHoc'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: '100px', whiteSpace: 'nowrap', textAlign: 'center' }} content='Lớp' keyCol='lop'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tín chỉ' keyCol='tinChi'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tổng tiết' keyCol='tongTiet'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }} content='Phòng' keyCol='phong'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thứ' keyCol='thu'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tiết' keyCol='tiet'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }} content='Giảng viên' keyCol='giangVien'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }} content='Trợ giảng' keyCol='troGiang'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: '100px', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày bắt đầu' keyCol='ngayBatDau'
                    onSort={this.onSortHp}
                />
                <TableHead style={{ width: '100px', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày kết thúc' keyCol='ngayKetThuc'
                    onSort={this.onSortHp}
                />
                <TableHead style={{ width: '50px', whiteSpace: 'nowrap', textAlign: 'center' }} content='Sĩ số' keyCol='siSo'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: '100px', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tình trạng học phần' keyCol='tinhTrangHocPhan'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
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
                            <tr key={rows.length} style={{ backgroundColor: this.backgroundColor(hocPhan), cursor: 'pointer' }} onClick={() => this.chonHocPhan(hocPhan, list)}>
                                <TableCell className='sticky-col pin-1-col' style={{ textAlign: 'right' }} content={(index + 1)} rowSpan={rowSpan} />
                                <TableCell className='sticky-col pin-2-col' type='checkbox' isCheck style={{ textAlign: 'center' }} content={hocPhan.isChon} permission={{ write: true }}
                                    onChanged={() => this.chonHocPhan(hocPhan, list)} rowSpan={rowSpan}
                                />
                                <TableCell className='sticky-col pin-3-col' style={{ width: '50px', whiteSpace: 'nowrap' }} content={hocPhan.maHocPhan} rowSpan={rowSpan} />
                                <TableCell className='sticky-col pin-4-col' content={T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi} rowSpan={rowSpan} />
                                <TableCell style={{ textAlign: 'center' }} content={hocPhan.maLop} rowSpan={rowSpan} />
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
                    }
                    else {
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

    backgroundColor = (item) => {
        if (item.isChon == true) {
            return '#cfe2ff';
        } else if (item.tinhTrang == 4) {
            return '#FAF884';
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

                let arrayMaHocPhan = listHocPhan.map(item => item.maHocPhan + ', ' + item.siSo);
                let i = arrayMSSV.length / 100;

                const update = (lengthHP, lengthSV) => {
                    let itemHocPhan = arrayMaHocPhan[lengthHP];
                    let a = lengthSV * 100;
                    let b = lengthSV * 100 + 99;
                    let listMSSV = null;
                    if (b > arrayMSSV.length) listMSSV = arrayMSSV.slice(a, arrayMSSV.length);
                    else listMSSV = arrayMSSV.slice(a, (b + 1));
                    listMSSV = listMSSV.join('; ');
                    const list = { listMSSV, itemHocPhan };

                    T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                    this.props.checkCondition(list, (items) => {
                        if (lengthHP == 0 && lengthSV == 0) this.modal.show({ items, isDone: 0 });
                        else this.modal.addData({ items, isDone: 0 });

                        if (lengthSV < i - 1) {
                            lengthSV++;
                            update(lengthHP, lengthSV);
                        } else if (lengthHP < arrayMaHocPhan.length - 1) {
                            lengthHP++;
                            update(lengthHP, 0);
                        } else T.alert('Đăng ký dự kiến thành công', 'success', false, 1000);
                    });
                };
                update(0, 0);
            });

        }
    }

    listSvChon = () => {
        this.listSvChonModal.show(this.listSinhVien);
    }

    renderSinhVienComponent = (listSinhVienChon) => {
        return (
            <div className='row justify-content border-right'>
                <div className='col-md-12'>
                    <div className='row'>
                        <h6 className='col-md-8 tile-title mb-0'>Danh sách sinh viên</h6>
                        <div className='col-md-4'>
                            <div className='rows' style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' onClick={(e) => {
                                    e.preventDefault() || this.sinhVienFilter();
                                }} >
                                    <i className='fa fa-search' /> Tìm kiếm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <FormSelect ref={(e) => (this.loaiHinhDaoTao = e)} className='col-md-3 mb-0' label='Loại hình đào tạo' data={SelectAdapter_LoaiHinhDaoTaoFilter('dtDangKyHocPhan')} required
                    onChange={(value) =>
                        this.setState({
                            filter: { ...this.state.filter, loaiHinhDaoTao: value?.id || '' },
                        }, () => this.lopSV.value(''))
                    }
                />
                <FormSelect ref={(e) => (this.khoaDaoTao = e)} className='col-md-3 mb-0' label='Khoa' data={SelectAdapter_DtDmDonVi()} required
                    onChange={(value) =>
                        this.setState({
                            filter: { ...this.state.filter, khoaDaoTao: value?.id || '' },
                        }, () => this.lopSV.value(''))
                    }
                />
                <FormSelect ref={(e) => (this.khoaSinhVien = e)} className='col-md-3 mb-0' label='Khoá sinh viên' data={SelectAdapter_DtKhoaDaoTaoFilter('dtDangKyHocPhan')}
                    onChange={(value) =>
                        this.setState({
                            filter: { ...this.state.filter, khoaSinhVien: value?.id || '' },
                        }, () => this.lopSV.value(''))
                    } allowClear
                />
                <FormSelect ref={(e) => (this.lopSV = e)} className='col-md-3 mb-0' label='Lớp' data={SelectAdapter_DtLop({
                    role: 'dtDangKyHocPhan',
                    khoaSinhVien: this.state.filter?.khoaSinhVien,
                    heDaoTao: this.state.filter?.loaiHinhDaoTao,
                    donVi: this.state.filter?.khoaDaoTao
                })}
                    onChange={(value) =>
                        this.setState({
                            filter: { ...this.state.filter, lopSV: value?.id || '' },
                        })
                    } allowClear
                />
                {this.state.isShowStud ? <>
                    <div className='col-md-12'>
                        <h6>
                            Đã chọn {this.listSinhVien.length} sinh viên
                            <sub style={{ cursor: 'pointer', color: '#1488db' }} onClick={() => this.listSvChon()}>(Chi tiết)</sub>
                        </h6>
                    </div>
                    <div className='col-md-12'>
                        {this.state.isSvLoading ? this.renderListSinhVien(null) : this.renderListSinhVien(listSinhVienChon)}
                    </div>
                </> : <div className='col-md-12'>{this.state.isSvLoading ? loadSpinner() : null}</div>}
            </div>
        );
    }

    listHpChon = () => {
        this.listHpChonModal.show(this.listHocPhan);
    }

    renderHocPhanComponent = (listHocPhanChon) => {
        return (
            <div className='row justify-content border-left'>
                <div className='col-md-12'>
                    <div className='row'>
                        <h6 className='col-md-8 tile-title mb-0'>Danh sách học phần</h6>

                        <div className='col-md-4'>
                            <div className='rows' style={{ textAlign: 'right', gap: '10' }}>
                                <button className='btn btn-success' onClick={(e) => {
                                    e.preventDefault() || this.hocPhanFilter();
                                }} >
                                    <i className='fa fa-search' /> Tìm kiếm
                                </button>
                                {this.listHocPhan.length && this.listSinhVien.length ?
                                    <button className='btn btn-primary ml-2' onClick={(e) => e.preventDefault() || this.dangKyHocPhan()}>
                                        <i className='fa fa-fw fa-lg fa-handshake-o' /> Đăng ký
                                    </button>
                                    : <div />
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <FormSelect ref={(e) => (this.loaiHinhDaoTaoHp = e)} className='col-md-3 mb-0' label='Loại hình đào tạo' data={SelectAdapter_LoaiHinhDaoTaoFilter('dtDangKyHocPhan')}
                    onChange={(value) =>
                        this.setState({
                            filterhp: { ...this.state.filterhp, loaiHinhDaoTao: value?.id || '' },
                        }, () => this.lopSVHp.value(''))
                    } allowClear
                />
                <FormSelect ref={(e) => (this.khoaDaoTaoHp = e)} className='col-md-3 mb-0' label='Khoa' data={SelectAdapter_DtDmDonVi()}
                    onChange={(value) =>
                        this.setState({
                            filterhp: { ...this.state.filterhp, khoaDaoTao: value?.id || '' },
                        }, () => this.lopSVHp.value(''))
                    } allowClear
                />
                <FormSelect ref={(e) => (this.khoaSinhVienHp = e)} className='col-md-3 mb-0' label='Khoá sinh viên' data={SelectAdapter_DtKhoaDaoTaoFilter('dtDangKyHocPhan')}
                    onChange={(value) =>
                        this.setState({
                            filterhp: { ...this.state.filterhp, khoaSinhVien: value?.id || '' },
                        }, () => this.lopSVHp.value(''))
                    } allowClear
                />
                <FormSelect ref={(e) => (this.lopSVHp = e)} className='col-md-3 mb-0' label='Lớp' data={SelectAdapter_DtLop({
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
                {this.state.isShowSubj ? <>
                    <div className='col-md-12'>
                        <h6>
                            Đã chọn {this.listHocPhan.length} học phần
                            <sub style={{ cursor: 'pointer', color: '#1488db' }} onClick={() => this.listHpChon()}>(Chi tiết)</sub>
                        </h6>
                    </div>
                    <div className='col-md-12'>
                        {this.state.isHpLoading ? loadSpinner() : this.renderListHocPhan(listHocPhanChon)}
                    </div>
                </> : <div className='col-md-12'> {this.state.isHpLoading ? loadSpinner() : null} </div>}
            </div>
        );
    }

    render() {
        let { listSinhVienChon, listHocPhanChon, filterhp } = this.state;
        listSinhVienChon.forEach(item => {
            this.listSinhVien.forEach(itemSV => {
                if (item.mssv == itemSV.mssv) {
                    item.isChon = itemSV.isChon;
                }
            });
        });
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
                            <div className='col-md-6'>
                                {this.renderSinhVienComponent(listSinhVienChon)}
                            </div>
                            <div className='col-md-6'>
                                {this.renderHocPhanComponent(listHocPhanChon)}
                            </div>
                        </div>
                    </div>
                </div>
                <ConfirmDangKy ref={(e) => (this.modal = e)} create={this.props.createDtDangKyHocPhan} hocPhanFilter={this.hocPhanFilter} filterhp={filterhp} luuThanhCong={this.luuThanhCong} />
                <ListSinhVienModal ref={(e) => (this.listSvChonModal = e)} xoaSinhVien={this.chonSinhVien} listSinhVienChon={listSinhVienChon} />
                <ListHocPhanModal ref={(e) => (this.listHpChonModal = e)} xoaHocPhan={this.chonHocPhan} listHocPhanChon={listHocPhanChon} />
            </>
        );
    }
}

const mapStateToProps = (state) => ({ system: state.system, dtDangKyHocPhan: state.daoTao.dtDangKyHocPhan });
const mapActionsToProps = { getDtDangKyHocPhanStudentPage, getStudent, getHocPhan, createDtDangKyHocPhan, getDtDangKyHocPhanAll, checkCondition, getDtDangKyHocPhanByStudent };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(FormDangKyTrucTiep);