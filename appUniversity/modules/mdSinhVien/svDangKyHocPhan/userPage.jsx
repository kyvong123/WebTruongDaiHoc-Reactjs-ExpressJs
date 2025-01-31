import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderTable, FormTabs, FormCheckbox, FormSelect, getValue, CirclePageButton } from 'view/component/AdminPage';
import {
    deleteDangKyHocPhan, getFullData, getCauHinh, getDiem
} from 'modules/mdDangKyMonHoc/dkHocPhan/redux';
import HocPhanKeHoachTab from './section/hocPhanKeHoachTab';
import HocPhanNgoaiCTDTTab from './section/hocPhanNgoaiCTDTTab';
import HocPhanNgoaiKeHoachTab from './section/hocPhanNgoaiKeHoachTab';
import HocPhanModal from './hocPhanModal';
import { Tooltip } from '@mui/material';



class UserPage extends AdminPage {
    state = { filter: {}, listHocPhan: [], ketQuaDangKy: [], lichSuDangKy: [], isDangKy: false, isChonCauHinh: false, dataHocKy: [{ id: 1, text: 'Học kỳ 1' }, { id: 2, text: 'Học kỳ 2' }, { id: 3, text: 'Học kỳ 3' }] }
    checkRef = {}

    check = []

    mapperLoaiDangKy = {
        'KH': <span><i className='fa fa-lg fa-sign-in' /> Theo kế hoạch</span>,
        'NKH': <span><i className='fa fa-lg fa-sign-out' /> Ngoài kế hoạch</span>,
        'NCTDT': <span><i className='fa fa-lg fa-info-circle' /> Ngoài CTĐT</span>,
        'CT': <span><i className='fa fa-lg fa-chevron-circle-right' /> Cải thiện</span>,
        'HL': <span><i className='fa fa-lg fa-repeat' /> Học lại</span>,
        'HV': <span><i className='fa fa-lg fa-chevron-circle-up' /> Học vượt</span>,
    }

    genDataNamHoc = (nam, currNam) => {
        const currYear = new Date().getFullYear();
        this.setState({ dataNamHoc: Array.from({ length: currYear - nam + 1 }, (_, i) => `${nam + i} - ${nam + i + 1}`) }, () => {
            this.namHocFilter.value([currNam]);
        });
    }

    componentDidMount() {
        T.ready('/user/dang-ky-hoc-phan', () => {
            this.props.getCauHinh(data => this.setState({
                fullDataCauHinh: data.items,
                listCauHinh: data.items.filter(item => {
                    let { namHoc, hocKy } = data.semester;
                    return item.namHoc == namHoc && item.hocKy === hocKy;
                }),
                timeNow: parseInt(data.timeNowServer),
                namHoc: data.semester.namHoc,
                hocKy: data.semester.hocKy,
                cauHinhDiem: data.settingDiem,
                cauHinhTKB: data.settingTKB,
            }, () => {
                this.genDataNamHoc(data.namTuyenSinh, data.semester.namHoc);
                this.hocKyFilter.value(data.semester.hocKy);
            }));
        });
    }

    chonCauHinh = (item) => {
        // Get from static variable
        if (item.ngayBatDau <= this.state.timeNow && item.ngayKetThuc >= this.state.timeNow) {
            let { theoKeHoach, ngoaiKeHoach, ngoaiCtdt, chuyenLop, ghepLop, ngoaiNgu, namHoc, hocKy, id, kichHoat } = item;
            this.setState({
                cauHinh: item,
                isDangKy: true,
                configDispatch: { theoKeHoach, ngoaiKeHoach, ngoaiCtdt, chuyenLop, ghepLop, ngoaiNgu, namHoc, hocKy, id },
                isChonCauHinh: true,
            }, () => {
                if (kichHoat) {
                    T.alert('Vui lòng chờ trong giây lát!', 'info', false, null, true);
                    this.props.getFullData(this.state.configDispatch, '', () => {
                        T.alert('Tải dữ liệu thành công!', 'success', false, 1000);
                    });
                }
            });
        } else {
            this.setState({ isChonCauHinh: true, isDangKy: false, cauHinh: item });
        }
    }

    xoaHocPhan = (item) => {
        T.confirm('Cảnh báo', `Bạn có chắc muốn hủy đăng ký học phần ${item.maHocPhan}?`, 'warning', true, isConfirm => {
            if (isConfirm) {
                let theoKeHoach = this.props.hocPhan?.listKH?.includes(item.maMonHoc);
                let ngoaiKeHoach = this.props.hocPhan?.listNKH?.includes(item.maMonHoc);
                let ngoaiCtdt = this.props.hocPhan?.listNCTDT?.includes(item.maMonHoc);

                const { cauHinh } = this.state;
                let { id, namHoc, hocKy } = cauHinh;
                let filter = {
                    cauHinh: { id, namHoc, hocKy },
                };

                let dataState = this.props.hocPhan || {},
                    { searchTextKH, searchTextNKH, searchTextNCTDT } = dataState;
                if (theoKeHoach) {
                    filter = {
                        ...filter,
                        searchText: searchTextKH,
                        theoKeHoach: true,
                    };
                } else if (ngoaiKeHoach) {
                    filter = {
                        ...filter,
                        searchText: searchTextNKH,
                        ngoaiKeHoach: true,
                    };
                } else if (ngoaiCtdt) {
                    filter = {
                        ...filter,
                        searchText: searchTextNCTDT,
                        ngoaiCtdt: true,
                    };
                }
                filter.tenMonHoc = T.parse(item.tenMonHoc, { vi: '' })?.vi;
                T.alert('Đang xử lý', 'warning', false, null, true);
                this.props.deleteDangKyHocPhan(item.maHocPhan, filter, this.state.configDispatch, () => T.alert('Huỷ học phần thành công!', 'success', true, 5000));
            }
        });
    }

    chuyenHocPhan = (item) => {
        let theoKeHoach = item.type == 'KH';
        let ngoaiKeHoach = item.type == 'NKH' || item.type == 'HV';
        let ngoaiCtdt = item.type == 'NCTDT';
        if (theoKeHoach) {
            item.theoKeHoach = true;
            item.isUpdate = true;
            this.modalHocPhan.show(item);
        } else if (ngoaiKeHoach) {
            item.ngoaiKeHoach = true;
            item.isUpdate = true;
            this.modalHocPhan.show(item);
        } else if (ngoaiCtdt) {
            item.ngoaiCtdt = true;
            item.isUpdate = true;
            this.modalHocPhan.show(item);
        } else {
            item.isUpdate = true;
            this.modalHocPhan.show(item);
        }
    }

    chonHocPhan = (createFunc) => {
        T.alert('Đang xử lý', 'warning', false, null, true);
        createFunc((data) => {
            if (data.message) {
                T.alert(data.message, 'error', false, 5000);
            } else {
                T.alert('Đăng ký thành công', 'success', true, 5000);
            }
        });
    }

    checkTrung = (item) => {
        const { dataKetQua, listDataTuanHoc } = this.props.hocPhan || { dataKetQua: [], listDataTuanHoc: [] };

        for (const curTuan of listDataTuanHoc.filter(tuan => tuan.maHocPhan == item.maHocPhan && !tuan.isNgayLe)) {
            const { ngayBatDau, ngayKetThuc } = curTuan;
            for (let ketQua of dataKetQua) {
                if (ketQua.maHocPhan != item.maHocPhan) {
                    if (listDataTuanHoc.find(i => i.maHocPhan == ketQua.maHocPhan && !i.isNgayLe && !(ngayKetThuc < i.ngayBatDau || ngayBatDau > i.ngayKetThuc))) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    handleCheck = (i, value) => {
        if (value) {
            this.setState({
                listCauHinh: this.state.listCauHinh.map((item, index) => {
                    if (index == i) {
                        this.checkRef[index]?.value(value);
                        return ({ ...item, checked: Number(value) });
                    } else {
                        this.checkRef[index]?.value(!value);
                        return ({ ...item, checked: Number(!value) });
                    }
                })
            });
        } else {
            this.setState({ listCauHinh: this.state.listCauHinh.map(item => ({ ...item, checked: value })) });
        }

    }

    handleChangeHinh = () => {
        let namHoc = getValue(this.namHocFilter), hocKy = getValue(this.hocKyFilter);
        let listCauHinh = this.state.fullDataCauHinh?.filter(item =>
            item.namHoc == namHoc
            && item.hocKy == hocKy
        );
        this.setState({ listCauHinh: listCauHinh.map(i => ({ ...i, checked: false })), namHoc, hocKy, isChonCauHinh: false, isDangKy: false, cauHinh: null });
    }

    statusDot = (item) => {
        if (parseInt(this.state.timeNow) < parseInt(item.ngayBatDau)) return 'Chưa bắt đầu';
        else if (parseInt(this.state.timeNow) > parseInt(item.ngayKetThuc)) return 'Đã kết thúc';
        else return 'Đang diễn ra';
    }
    render() {
        const { isDangKy, cauHinh, isChonCauHinh, cauHinhDiem, cauHinhTKB } = this.state;
        const { theoKeHoach, ngoaiKeHoach, ngoaiCtdt, huyMon, chuyenLop, ghiChu, kichHoat } = cauHinh || {};
        let dataState = this.props.hocPhan || {},
            { dataKetQua } = dataState;

        let ketQuaDangKy = renderTable({
            getDataSource: () => Object.keys((dataKetQua || []).groupBy('maHocPhan')),
            emptyTable: 'Chưa có đăng ký nào!!',
            header: 'thead-light',
            stickyHead: dataKetQua?.length > 5,
            divStyle: { height: '40vh' },
            renderHead: () => (<tr>
                <th style={{ widht: 'auto' }}>#</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap', }}>Mã học phần</th>
                <th style={{ width: '40%', whiteSpace: 'nowrap', }}>Tên môn học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>TC</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Tổng tiết</th>
                <th style={{ width: 'auto', }}>Lớp</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Bắt đầu</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Kết thúc</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Phòng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Thứ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Tiết</th>
                <th style={{ width: '15%', whiteSpace: 'nowrap', }}>Giảng viên</th>
                <th style={{ width: '15%', whiteSpace: 'nowrap', }}>Trợ giảng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Loại đăng ký</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', display: (chuyenLop || huyMon) ? '' : 'none' }}>Chuyển/Hủy lớp</th>
            </tr>
            ),
            renderRow: (item, index) => {
                const rows = [];
                let listHocPhan = (dataKetQua || []).groupBy('maHocPhan')[item] || [],
                    rowSpan = listHocPhan.length;
                if (rowSpan) {
                    for (let i = 0; i < rowSpan; i++) {
                        const hocPhan = listHocPhan[i];
                        let isTrung = this.checkTrung(hocPhan);
                        let khoaDky = hocPhan.tinhTrang == 3;
                        if (i == 0) {
                            rows.push(
                                <tr key={rows.length} style={{ backgroundColor: isTrung ? '#f7de97' : '#ffffff' }}>
                                    <TableCell content={index + 1} rowSpan={rowSpan} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.maHocPhan} rowSpan={rowSpan} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi} rowSpan={rowSpan} />
                                    <TableCell type='number' style={{ whiteSpace: 'nowrap' }} content={hocPhan.tongTinChi} rowSpan={rowSpan} />
                                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.tongTiet} rowSpan={rowSpan} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.listMaLop && hocPhan.listMaLop.length ? hocPhan.listMaLop.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} rowSpan={rowSpan} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayBatDau} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayKetThuc} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.thu} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.maLoaiDky && this.mapperLoaiDangKy[hocPhan.maLoaiDky] ? this.mapperLoaiDangKy[hocPhan.maLoaiDky] : ''} rowSpan={rowSpan} />
                                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={hocPhan} permission={{ write: khoaDky || chuyenLop, delete: huyMon }} display={chuyenLop || huyMon} rowSpan={rowSpan}>
                                        <Tooltip title='Chuyển học phần' arrow>
                                            <button className='btn btn-info' onClick={e => e.preventDefault() || this.chuyenHocPhan(hocPhan)} style={{ display: (!khoaDky && chuyenLop) ? '' : 'none' }}>
                                                <i className='fa fa-lg fa-repeat' />
                                            </button>
                                        </Tooltip>
                                        <Tooltip title='Hủy môn' arrow>
                                            <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.xoaHocPhan(hocPhan)} style={{ display: (!khoaDky && huyMon) ? '' : 'none' }}>
                                                <i className='fa fa-lg fa-trash' />
                                            </button>
                                        </Tooltip>
                                        <Tooltip title='Học phần đã bị khóa đăng ký' arrow onClick={(e) => e.preventDefault() || T.alert('Học phần đã được khoá đăng ký. Vui lòng liên hệ Phòng Đào tạo!', 'error', false, 5000)}>
                                            <button className='btn btn-secondary' style={{ display: khoaDky ? '' : 'none' }}>
                                                <i className='fa fa-lg fa-lock' />
                                            </button>
                                        </Tooltip>
                                    </TableCell>
                                </tr>);
                        } else {
                            rows.push(
                                <tr key={rows.length} style={{ backgroundColor: isTrung ? '#f7de97' : '#ffffff' }}>
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayBatDau} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayKetThuc} />
                                    <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={hocPhan.phong} />
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
            }
        });

        let tabs = [];
        if (theoKeHoach) {
            tabs.push({
                title: 'Theo kế hoạch',
                component: <HocPhanKeHoachTab ref={e => this.keHoachTab = e} cauHinh={cauHinh} loading={this.chonHocPhan} cauHinhDiem={cauHinhDiem} cauHinhTKB={cauHinhTKB} configDispatch={this.state.configDispatch} />,
            });
        }
        if (ngoaiKeHoach) {
            tabs.push({
                title: 'Ngoài kế hoạch',
                component: <HocPhanNgoaiKeHoachTab ref={e => this.ngoaiKeHoachTab = e} cauHinh={cauHinh} loading={this.chonHocPhan} cauHinhDiem={cauHinhDiem} cauHinhTKB={cauHinhTKB} configDispatch={this.state.configDispatch} />,
            });
        }
        if (ngoaiCtdt) {
            tabs.push({
                title: 'Ngoài chương trình đào tạo',
                component: <HocPhanNgoaiCTDTTab ref={e => this.ngoaiCTDTTab = e} cauHinh={cauHinh} loading={this.chonHocPhan} cauHinhDiem={cauHinhDiem} cauHinhTKB={cauHinhTKB} configDispatch={this.state.configDispatch} />,
            });
        }

        const kichHoatComponent = () => <>
            {isDangKy ? <>
                {dataKetQua && <div className='tile'>
                    <h5 className='tile-title'>Kết quả đăng ký</h5>
                    <div className='tile-body'>{ketQuaDangKy}</div>
                </div>}
                {(theoKeHoach || ngoaiKeHoach || ngoaiCtdt) ? <FormTabs tabs={tabs} /> : null}
            </> : <div className='tile' style={{ textAlign: 'center' }}>
                {(this.state.timeNow < cauHinh.ngayBatDau) && <>
                    <h5 className='tile-title'>Hiện chưa tới đợt đăng ký</h5>
                    <i>Vui lòng quay lại vào {T.dateToText(cauHinh.ngayBatDau)}</i> </>
                }

                {(this.state.timeNow > cauHinh.ngayKetThuc) &&
                    <h6 className='tile-title'>Đợt đăng ký đã kết thúc vào {T.dateToText(cauHinh.ngayKetThuc)}</h6>
                }
            </div>}
        </>;

        const chonCauHinhComponent = () => <div className='tile' >
            <h2 className='tile-title'>Vui lòng chọn đợt đăng ký</h2>
            <div className='tile-body' style={{ height: '60vh', overflow: 'scroll' }}>
                {this.state.listCauHinh?.length == 0 && <i>Hiện không có đợt đăng ký nào</i>}
                {(this.state.listCauHinh || []).map((item, index) => <div key={index} style={{ marginBottom: 15 }}>
                    <FormCheckbox ref={e => this.checkRef[index] = e} value={item.checked} readOnly={parseInt(this.state.timeNow) > parseInt(item.ngayKetThuc)} style={{ fontSize: '1.2rem', marginBottom: 0 }}
                        label={`[HK${item.hocKy}, NH${item.namHoc}] ${item.tenDot}`} onChange={(value) => this.handleCheck(index, value)} />
                    <i>Từ {T.dateToText(item.ngayBatDau)} - {T.dateToText(item.ngayKetThuc)} | {this.statusDot(item)}</i>
                    <hr />
                </div>)}
            </div>
            <div className='tile-footer' style={{ display: this.state.listCauHinh?.some(item => item.checked == 1) ? '' : 'none' }}>
                <button className='btn btn-outline-primary' onClick={e => e.preventDefault() || this.chonCauHinh(this.state.listCauHinh.find(item => item.checked == 1))}>
                    Tiếp theo <i className='fa fa-lg fa-arrow-right' />
                </button>
            </div>
        </div>;

        return this.renderPage({
            title: `Đăng ký học phần${cauHinh ? (': ' + cauHinh.tenDot) : ''}`,
            icon: 'fa fa-handshake-o',
            subTitle: isChonCauHinh && <i>{T.dateToText(cauHinh?.ngayBatDau)} tới {T.dateToText(cauHinh?.ngayKetThuc)} </i>,
            header: <div className='row'>
                <FormSelect ref={e => this.namHocFilter = e} className={isChonCauHinh ? 'col-md-12' : 'col-md-8'} label='Năm học' data={this.state.dataNamHoc} onChange={this.handleChangeHinh} readOnly={isChonCauHinh} style={{ marginBottom: '0' }} />
                <FormSelect ref={e => this.hocKyFilter = e} className={isChonCauHinh ? 'col-md-12' : 'col-md-4'} label='Học kỳ' data={this.state.dataHocKy} onChange={this.handleChangeHinh} readOnly={isChonCauHinh} style={{ marginBottom: '0' }} />
            </div>,
            content: <><div>
                <HocPhanModal ref={e => this.modalHocPhan = e} loading={this.chonHocPhan} cauHinh={cauHinh} cauHinhDiem={cauHinhDiem} cauHinhTKB={cauHinhTKB} configDispatch={this.state.configDispatch} />
                {isChonCauHinh ? <> {
                    !kichHoat ? <div className='tile' style={{ textAlign: 'center' }}>
                        <h5 className='tile-title'>Bạn không đủ điều kiện đăng ký</h5>
                        {!!ghiChu && <i>Lý do: {ghiChu}</i>}
                    </div> : kichHoatComponent()
                }
                </> : chonCauHinhComponent()}
            </div>
                {cauHinh && (this.state.timeNow > cauHinh.ngayKetThuc || this.state.timeNow < cauHinh.ngayBatDau || !kichHoat) ? <CirclePageButton type='back' to={(e) => e.preventDefault() || window.location.reload()} /> : ''}
            </>,
        });
    }
}


const mapStateToProps = state => ({ system: state.system, hocPhan: state.student.hocPhan });
const mapActionsToProps = { getCauHinh, deleteDangKyHocPhan, getFullData, getDiem };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);