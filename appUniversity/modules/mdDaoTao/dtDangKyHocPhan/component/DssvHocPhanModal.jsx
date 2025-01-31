import React from 'react';
import { connect } from 'react-redux';
import { renderDataTable, renderTable, TableCell, TableHead, AdminModal, loadSpinner, FormTabs, FormCheckbox, FormTextBox, FormSelect, FormRichTextBox } from 'view/component/AdminPage';
import { SelectAdapter_DtLopFilter } from 'modules/mdDaoTao/dtLop/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import {
    getDtDangKyHocPhanStudent, deleteDtDangKyHocPhanMultiple, getDtDangKyHocPhanByStudent, getDtDangKyHocPhan,
    getHocPhan, updateDtDangKyHocPhan, getHocPhanCheckListSv, getHocPhanCheckDiemLichThi, checkHocPhanTrungLich,
} from 'modules/mdDaoTao/dtDangKyHocPhan/redux';

class DssvHocPhanModal extends AdminModal {
    defaultSortTermSv = 'mssv_ASC';
    defaultSortTermHp = 'maHocPhan_ASC';
    listSinhVien = [];
    buttonClick = 0;
    state = { hocPhanChon: null, filter: {}, filterhp: {}, ksSearchHp: {}, sortTermHp: 'maHocPhan_ASC', ksSearchSv: {}, sortTermSv: 'mssv_ASC', listStudent: [], listHocPhan: [] }
    mapperLoaiDangKy = {
        'KH': <span className='text-primary'><i className='fa fa-lg fa-sign-in' /> Theo kế hoạch</span>,
        'NKH': <span className='text-success'><i className='fa fa-lg fa-sign-out' /> Ngoài kế hoạch</span>,
        'NCTDT': <span><i className='fa fa-lg fa-info-circle' /> Ngoài CTĐT</span>,
        'CT': <span className='text-warning'><i className='fa fa-lg fa-chevron-circle-right' /> Cải thiện</span>,
        'HL': <span className='text-danger'><i className='fa fa-lg fa-repeat' /> Học lại</span>,
    }

    componentDidMount() {
        this.disabledClickOutside();
        this.onHidden(this.onHide);
    }

    onShow = (item) => {

        this.tab.tabClick(null, 0);
        this.setState({ hocPhan: item, maHocPhan: item.maHocPhan }, () => {
            let filterhp = this.props.filterhp;

            this.loaiHinhDaoTao.value(filterhp && filterhp.loaiHinhDaoTao ? filterhp.loaiHinhDaoTao : '');
            this.khoaDaoTao.value(filterhp && filterhp.khoaDaoTao ? filterhp.khoaDaoTao : '');
            this.khoaSinhVien.value(filterhp && filterhp.khoaSinhVien ? filterhp.khoaSinhVien : '');
            this.lopSV.value(filterhp && filterhp.lopSV ? filterhp.lopSV : '');

            this.setState({ filterhp }, () => {
                this.getListStudent();
                this.hocPhanFilter();
            });
        });
    }

    onHide = () => {
        this.listSinhVien = [];
        this.setState({ isTrung: null, hocPhanChon: null, listHocPhan: [] }, () => {
            this.ghiChu?.value('');
        });
    }

    getListStudent = () => {
        let filter = {
            ...this.state.filter,
            ...this.state.ksSearchSv,
        },
            sort = this.state?.sortTermSv || this.defaultSortTermSv;

        getDtDangKyHocPhanStudent(this.state.maHocPhan, filter, sort, (items) => {
            items.map(item => {
                item.isChon = 0;
                return item;
            });
            this.setState({ listStudent: items });
        });
    }

    handleKeySearchSv = (data) => {
        this.setState({ ksSearchSv: { [data.split(':')[0]]: data.split(':')[1] } }, () => this.getListStudent());
    }

    onSortSv = (sortTerm) => {
        this.setState({ sortTermSv: sortTerm }, () => this.getListStudent());
    }

    getDataHp = () => {
        let filter = {
            ...this.state.filterhp,
            ...this.state.ksSearchHp,
            sort: this.state?.sortTermHp || this.defaultSortTermHp,
        };
        this.props.getHocPhan(filter, (value) => {
            let listHocPhan = value.filter(hocPhan => hocPhan.maHocPhan != this.state.maHocPhan);
            this.setState({ listHocPhan });
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

    tabChuyenHocPhan = (e) => {
        this.tab.tabClick(e, 1);
    }

    xoaSinhVien = (e) => {
        this.tab.tabClick(e, 2);
    }

    chonSinhVien = (item, list) => {
        if (item.tinhTrang != '1' && item.isChon == false) {
            T.notify('Sinh viên ' + item.hoTen + ' bị ' + item.tenTinhTrangSV, 'danger');
        }
        item.isChon = !item.isChon;
        this.countSinhVien(item);
        this.setState({ listSinhVienChon: list }, () => {
            if (!item.isChon) {
                this.checkSVAll.value(false);
            }
        });
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

    checkTrung = (item) => {
        if (this.listSinhVien.length) {
            let filter = this.props.filterhp;
            T.alert('Đang kiểm tra trùng lịch sinh viên. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
            this.props.checkHocPhanTrungLich({ listSV: this.listSinhVien.map(i => i.mssv), maHocPhan: this.state.maHocPhan, newMaHocPhan: item.maHocPhan, filter }, listTrung => {
                T.alert('Kiểm tra trùng lịch thành công!', 'success', false, 1000);
                this.setState({ hocPhanChon: item.maHocPhan, isTrung: listTrung.length ? item.maHocPhan : null }, () => {
                    listTrung.forEach(trung => T.notify(`Học phần này bị trùng lịch với ${trung.maHocPhan} của sinh viên ${trung.mssv} rồi!`, 'danger'));
                });
            });
        }
    }

    chuyenHocPhanSv = (item) => {
        let { hocPhanChon, listHocPhan } = this.state,
            isCheck = hocPhanChon == item.maHocPhan,
            soLuongDuKien = item.soLuongDuKien || 100;
        if (!isCheck && item.siSo > soLuongDuKien) {
            T.notify('Học phần đã quá số lượng dự kiến', 'warning');
        }
        if (!hocPhanChon) {
            item.siSo = item.siSo + this.listSinhVien.length;
            hocPhanChon = item.maHocPhan;
            this.checkTrung(item);
        } else if (isCheck) {
            hocPhanChon = null;
            item.siSo = item.siSo - this.listSinhVien.length;
        } else {
            item.siSo = item.siSo + this.listSinhVien.length;
            let index = listHocPhan.findIndex(hp => hp.maHocPhan == hocPhanChon);
            listHocPhan[index].siSo = listHocPhan[index].siSo - this.listSinhVien.length;
            hocPhanChon = item.maHocPhan;
            this.checkTrung(item);
        }
        this.setState({ hocPhanChon, listHocPhan, isCheck });
    }

    backgroundColor = (item) => {
        if (item.isChon == true) {
            return '#cfe2ff';
        } else if (item.tinhTrang == 4) {
            return '#ea868f';
        }
    }

    listStudentTable = (list) => renderTable({
        emptyTable: 'Không có sinh viên trong lớp học phần!',
        getDataSource: () => list || null,
        header: 'thead-light',
        stickyHead: list.length > 10,
        divStyle: { height: '60vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <FormCheckbox ref={e => this.checkSVAll = e}
                        onChange={value => {
                            list.map(item => {
                                item.isChon = value;
                                return item;
                            });
                            list.forEach(item => this.countSinhVien(item));
                            this.setState({ listSinhVienChon: list });
                        }}
                    />
                </th>
                <TableHead style={{ width: '30%', minWidth: 'auto', maxWidth: 'auto' }} content='MSSV' keyCol='mssv'
                    onKeySearch={this.handleKeySearchSv} onSort={this.onSortSv}
                />
                <TableHead style={{ width: '70%', minWidth: 'auto', maxWidth: 'auto' }} content='Họ và tên lót' keyCol='ho'
                    onKeySearch={this.handleKeySearchSv} onSort={this.onSortSv}
                />
                <TableHead style={{ width: 'auto', minWidth: 'auto', maxWidth: 'auto' }} content='Tên' keyCol='ten'
                    onKeySearch={this.handleKeySearchSv} onSort={this.onSortSv}
                />
                <TableHead style={{ width: 'auto', minWidth: 'auto', maxWidth: 'auto' }} content='Lớp' keyCol='lop'
                    onKeySearch={this.handleKeySearchSv} onSort={this.onSortSv}
                />
                <TableHead style={{ width: 'auto', minWidth: 'auto', maxWidth: 'auto' }} content='Ngành' keyCol='nganh'
                    onKeySearch={this.handleKeySearchSv} onSort={this.onSortSv}
                />
                <TableHead style={{ width: 'auto', minWidth: 'auto', maxWidth: 'auto' }} content='Loại đăng ký' keyCol='maLoaiDky'
                    onKeySearch={this.handleKeySearchSv} onSort={this.onSortSv}
                />
                <TableHead style={{ width: 'auto', minWidth: 'auto', maxWidth: 'auto' }} content='Tình trạng' keyCol='tinhTrang'
                    onKeySearch={this.handleKeySearchSv} onSort={this.onSortSv}
                />
            </tr>),
        renderRow: (item, index) => {
            return (
                <tr key={index} style={{ backgroundColor: this.backgroundColor(item), cursor: 'pointer' }} onClick={e => e.preventDefault() || this.chonSinhVien(item, list)}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={item.isChon} permission={{ write: true }}
                        onChanged={() => this.chonSinhVien(item, list)}
                    />
                    <TableCell content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lop} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maLoaiDky && this.mapperLoaiDangKy[item.maLoaiDky] ? this.mapperLoaiDangKy[item.maLoaiDky] : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenTinhTrangSV} />
                </tr >
            );
        }
    });

    chuyenHocPhan = () => {
        return (
            <div className='row'>
                <FormSelect ref={(e) => (this.loaiHinhDaoTao = e)} className='col-md-3' label='Loại hình đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao}
                    onChange={(value) =>
                        this.setState({
                            filterhp: { ...this.state.filterhp, loaiHinhDaoTao: value?.id || '' },
                        }, () => this.lopSV.value(''))
                    } allowClear
                />
                <FormSelect ref={(e) => (this.khoaDaoTao = e)} className='col-md-3' label='Khoa' data={SelectAdapter_DmDonViFaculty_V2}
                    onChange={(value) =>
                        this.setState({
                            filterhp: { ...this.state.filterhp, khoaDaoTao: value?.id || '' },
                        }, () => this.lopSV.value(''))
                    } allowClear
                />
                <FormSelect ref={(e) => (this.khoaSinhVien = e)} className='col-md-2' label='Khoá sinh viên' data={SelectAdapter_DtKhoaDaoTao}
                    onChange={(value) =>
                        this.setState({
                            filterhp: { ...this.state.filterhp, khoaSinhVien: value?.id || '' },
                        }, () => this.lopSV.value(''))
                    } allowClear
                />
                <FormSelect ref={(e) => (this.lopSV = e)} className='col-md-2' label='Lớp' data={SelectAdapter_DtLopFilter({
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
                <div className='col-md-2'>
                    <div className='rows' style={{ textAlign: 'right', marginTop: '25px' }}>
                        <button className='btn btn-success' onClick={(e) => {
                            e.preventDefault() || this.hocPhanFilter();
                        }} >
                            <i className='fa fa-search' /> Tìm kiếm
                        </button>
                    </div>
                </div>
                <div className='col-md-12'>
                    {this.state.listHocPhan ? <>
                        {this.listHocPhanTable(this.state.listHocPhan)}
                        <FormRichTextBox ref={e => this.ghiChu = e} className='col-md-12' label='Ghi chú' />
                    </> : loadSpinner()}
                </div>

            </div>
        );
    }

    listHocPhanTable = (list) => renderDataTable({
        data: list == null ? null : Object.keys(list.groupBy('maHocPhan')),
        emptyTable: 'Không tìm thấy học phần!',
        header: 'thead-light',
        stickyHead: list.length > 12 ? true : false,
        divStyle: { height: '55vh' },
        className: 'table-pin',
        customClassName: 'table-pin-wrapper',
        renderHead: () => (
            <tr>
                <th className='sticky-col pin-1-col' style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th className='sticky-col pin-2-col' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Chọn</th>
                <TableHead className='sticky-col pin-3-col' style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhan'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn' keyCol='tenMonHoc'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Lớp' keyCol='lop'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Sĩ số' keyCol='siSo'
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
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tình trạng học phần' keyCol='tinhTrangHocPhan'
                    onKeySearch={this.handleKeySearchHp} onSort={this.onSortHp}
                />
            </tr>
        ),
        renderRow: (item, index) => {
            const rows = [];
            let listHocPhan = list.groupBy('maHocPhan')[item] || [],
                rowSpan = listHocPhan.length;
            let isCheck = this.state.hocPhanChon == item,
                isTrung = this.state.isTrung == item;
            if (rowSpan) {
                for (let i = 0; i < rowSpan; i++) {
                    const hocPhan = listHocPhan[i];
                    if (i == 0) {
                        rows.push(
                            <tr key={rows.length} style={{ backgroundColor: item.tinhTrang == 4 ? '#ffcccb' : (isCheck ? (isTrung ? '#f7de97' : '#90EE90') : '') }}>
                                <TableCell className='sticky-col pin-1-col' style={{ textAlign: 'right' }} content={(index + 1)} rowSpan={rowSpan} />
                                <TableCell className='sticky-col pin-2-col' type='checkbox' isCheck content={isCheck} permission={{ write: true }} onChanged={() => this.chuyenHocPhanSv(hocPhan)} rowSpan={rowSpan} />
                                <TableCell className='sticky-col pin-3-col' style={{ whiteSpace: 'nowrap' }} content={hocPhan.maHocPhan} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.maLop} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={(hocPhan.siSo ? hocPhan.siSo : '0') + '/' + (hocPhan.soLuongDuKien ? hocPhan.soLuongDuKien : '0')} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tongTinChi} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tongTiet} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.phong} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.thu} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.ngayBatDau} rowSpan={rowSpan} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.ngayKetThuc} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tenTinhTrang} rowSpan={rowSpan} />
                                {/* <TableCell style={{ whiteSpace: 'nowrap' }} rowSpan={rowSpan}>
                                    <Tooltip title={'Chỉnh sửa'} arrow>
                                        <button className='btn btn-primary' onClick={(e) => e && e.preventDefault() || this.showModal(e, hocPhan)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </button>
                                    </Tooltip>
                                </TableCell> */}
                            </tr>);
                    }
                    else {
                        rows.push(<tr key={rows.length} style={{ backgroundColor: this.backgroundColor(hocPhan), cursor: 'pointer' }} onClick={() => this.chonHocPhan(hocPhan, list)}>
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

    onSave = () => {
        let { hocPhanChon, maHocPhan } = this.state,
            listSv = this.listSinhVien.map(e => e.mssv);
        if (hocPhanChon) {
            this.props.getHocPhanCheckDiemLichThi([hocPhanChon], '1', value => {
                let { lichThi } = value;
                if (lichThi.length) T.alert(`Học phần ${hocPhanChon} đã có lịch thi . Bạn không thể chuyển vào học phần này!`, 'warning', false, 2000);
                else {
                    T.alert('Đang kiểm tra dữ liệu đăng ký. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                    this.props.getHocPhanCheckListSv(maHocPhan, listSv, value => {
                        let { listFalse, listHocPhi, checkLichThi } = value;
                        if (listFalse.length || listHocPhi.length || checkLichThi) {
                            let title = '';
                            if (checkLichThi || listFalse.length) {
                                if (checkLichThi) title = 'Học phần đã có lịch thi ';
                                if (listFalse.length) title = title ? title + `và ${listFalse.length} sinh viên đã có điểm` : `${listFalse.length} sinh viên đã có điểm trong học phần`;
                                T.alert(title + `. Bạn không thể chuyển sinh viên ra học phần ${maHocPhan}!`, 'warning', false, 2000);
                            } else if (listHocPhi.length) {
                                T.confirm('Cảnh báo', `${listHocPhi.length}Sinh viên đã đóng học phí cho phần. Bạn có chắc muốn chuyển sinh viên ra học phần ${maHocPhan}?`, 'warning', true, isConfirm => {
                                    if (isConfirm) this.chuyenHP();
                                });
                            }
                        } else this.chuyenHP();
                    });
                }
            });
        } else {
            T.notify('Bạn chưa chọn học phần mới nào!!', 'warning');
        }

    }

    chuyenHP = () => {
        let { hocPhanChon, maHocPhan } = this.state,
            listSv = this.listSinhVien.map(e => e.mssv),
            condition = { currMaHocPhan: maHocPhan, newMaHocPhan: hocPhanChon, ghiChu: this.ghiChu.value() };

        T.confirm('Xác nhận', `Bạn sẽ đăng ký học phần ${hocPhanChon} thay cho ${maHocPhan}?`, 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang xử lý', 'warning', false, null, true);
                this.props.updateDtDangKyHocPhan(condition, listSv, (data) => {
                    if (data.listSuccess.length) T.alert('Chuyển lớp thành công', 'success', false, 1000);
                    else T.alert('Chuyển lớp thất bại', 'warning', false, 500);
                    this.listSinhVien = [];
                    this.setState({ isTrung: null, hocPhanChon: null, listHocPhan: [] }, () => {
                        this.getListStudent();
                        this.hide();
                    });
                });
            }
        });

    }

    onDelete = () => {
        if (!this.lyDo.value() || this.lyDo.value() == '') {
            T.notify('Vui lòng nhập lý do!', 'danger');
        } else {
            let { maHocPhan } = this.state,
                listSv = this.listSinhVien.map(e => e.mssv);
            T.alert('Đang kiểm tra dữ liệu đăng ký. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
            this.props.getHocPhanCheckListSv(maHocPhan, listSv, value => {
                let { checkLichThi, listFalse, listHocPhi } = value;
                if (checkLichThi || listFalse.length || listHocPhi.length) {
                    let title = '';
                    if (checkLichThi) title = '<div>Học phần đã có lịch thi;<br />';
                    if (listFalse.length) title = title ? title + `${listFalse.length} sinh viên đã có điểm;<br />` : `<div>${listFalse.length} sinh viên đã có điểm;<br />`;
                    if (listHocPhi.length) title = title ? title + `${listHocPhi.length} sinh viên đã đóng học phí;<br />` : `<div>${listHocPhi.length} sinh viên đã đóng học phí;<br />`;

                    T.confirm('Cảnh báo', title + 'Bạn có chắc muốn hủy đăng ký?</div>', 'warning', true, isConfirm => {
                        if (isConfirm) this.huyHocPhan();
                    });
                } else {
                    T.confirm('Cảnh báo', `Bạn có chắc muốn huỷ đăng ký học phần ${maHocPhan} của ${this.listSinhVien.length} sinh viên này không?`, 'warning', true, isConfirm => {
                        if (isConfirm) this.huyHocPhan();
                    });
                }
            });
        }
    }

    huyHocPhan = () => {
        T.alert('Đang xử lý', 'warning', false, null, true);
        let { hocPhan, maHocPhan } = this.state,
            listSv = this.listSinhVien.map(e => e.mssv),
            { namHoc, hocKy, loaiHinhDaoTao, khoaSinhVien } = hocPhan,
            filter = { namHoc, hocKy, loaiHinhDaoTao, khoaSinhVien, ghiChu: this.lyDo.value() };
        this.props.deleteDtDangKyHocPhanMultiple(maHocPhan, listSv, filter, (value) => {
            if (value.error) T.alert('Hủy học phần thất bại', 'warning', false, 1000);
            else {
                T.alert('Huỷ đăng ký thành công', 'success', false, 1000);
                this.lyDo.value('');
                this.props.luuThanhCong();
                this.getListStudent();
                this.hide();
            }
        });
    }

    render = () => {
        let { savedConfig, maHocPhan, hocPhan, listStudent } = this.state,
            tenMonHoc = null, isEdit = this.listSinhVien?.length;

        if (hocPhan) tenMonHoc = T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi;

        listStudent.forEach(item => {
            this.listSinhVien.forEach(itemSV => {
                if (item.mssv == itemSV.mssv) {
                    item.isChon = itemSV.isChon;
                }
            });
        });

        const tabDssv = {
            id: 'dssv', title: 'Danh sách sinh viên', component: <div>
                <div style={{ textAlign: 'left', margin: '10px', visibility: isEdit ? 'visible' : 'hidden' }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className='btn btn-primary' type='button' onClick={e => e.preventDefault() || this.tabChuyenHocPhan(e)}>
                            <i className='fa fa-lg fa-repeat' />Chuyển học phần
                        </button>
                        <button className='btn btn-danger' type='button' onClick={(e) => e.preventDefault() || this.xoaSinhVien()} >
                            <i className='fa fa-lg fa-trash' />Huỷ đăng ký
                        </button>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid #e9ecef' }}>
                    {this.state.listStudent ? this.listStudentTable(listStudent) : loadSpinner()}
                </div>
            </div>
        },
            tabChuyen = {
                id: 'chuyen', title: 'Chuyển học phần',
                // disabled: this.buttonClick == 1 ? false : true,
                component: <div style={{ display: isEdit ? '' : 'none' }}>
                    {this.chuyenHocPhan()}
                </div>
            },
            tabHuy = {
                id: 'huy', title: 'Huỷ đăng ký',
                // disabled: this.buttonClick == 2 ? false : true,
                component: <div style={{ display: isEdit ? '' : 'none' }}>
                    <div className='row'>
                        <FormTextBox ref={e => this.lyDo = e} type='text' className='col-md-12' label='Lý do' />
                    </div>
                </div>
            };
        return this.renderModal({
            title: `Danh sách sinh viên trong học phần ${maHocPhan}: ${tenMonHoc}`,
            size: 'elarge',
            body: <div>
                <FormTabs ref={e => this.tab = e} tabs={[tabDssv, tabChuyen, tabHuy]}
                    onChange={tab => this.setState({ savedConfig: !!tab.tabIndex, isTrung: null, hocPhanChon: null })} />
            </div>,
            buttons: <div>
                {(this.tab?.state.tabIndex == 1 && savedConfig) &&
                    <button style={{ display: isEdit ? '' : 'none' }} type='button' className='btn btn-primary'
                        onClick={e => {
                            this.buttonClick = 1;
                            e.preventDefault() || this.onSave();
                        }}>
                        <i className='fa fa-fw fa-lg fa-save' />Lưu
                    </button>}
                {(this.tab?.state.tabIndex == 2 && savedConfig) &&
                    <button style={{ display: isEdit ? '' : 'none' }} type='button' className='btn btn-danger'
                        onClick={e => {
                            this.buttonClick = 2;
                            e.preventDefault() || this.onDelete();
                        }}>
                        <i className='fa fa-fw fa-lg fa-trash' />Huỷ
                    </button>}
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDangKyHocPhan: state.daoTao.dtDangKyHocPhan });
const mapActionsToProps = {
    getDtDangKyHocPhan, updateDtDangKyHocPhan, getHocPhan, deleteDtDangKyHocPhanMultiple, getDtDangKyHocPhanByStudent,
    getHocPhanCheckListSv, getHocPhanCheckDiemLichThi, checkHocPhanTrungLich,
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(DssvHocPhanModal);
