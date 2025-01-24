import React from 'react';
import AddModal from './addModal';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getSoLuongSinhVienSdh, updateSdhDotDangKy, getSdhDotDangKyAdmin } from './redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { AdminPage, FormTextBox, FormCheckbox, FormSelect, FormDatePicker, renderDataTable, TableCell, FormTabs, TableHead } from 'view/component/AdminPage';
import { getSdhDssvTrongDotDkhpPage, updateSdhDssvTrongDotDkhp, createListSVSdh, getStudentSdhInfo, SelectAdapter_DanhSachSinhVienSdh } from 'modules/mdSauDaiHoc/sdhDssvDotDkhp/redux';
import { updateSdhDsvhpDotDangKy } from 'modules/mdSauDaiHoc/sdhDshpDotDkhp/redux';
import { Tooltip } from '@mui/material';
import { getSdhThoiKhoaBieuPage } from 'modules/mdSauDaiHoc/sdhThoiKhoaBieu/redux';
import { getSdhDshpDotDangKyPage, getHpSdhInfo, createListHPSdh } from 'modules/mdSauDaiHoc/sdhDshpDotDkhp/redux';
import { SelectAdapter_DmHocSdhVer2 } from 'modules/mdSauDaiHoc/dmHocSdh/redux';
import { SelectAdapter_DmKhoaSdh } from 'modules/mdSauDaiHoc/dmKhoaSauDaiHoc/redux';
import { SelectAdapter_FwCanBoGiangVien } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_TkbSdh } from 'modules/mdSauDaiHoc/sdhThoiKhoaBieu/redux';
class EditPage extends AdminPage {
    state = {
        item: {}, idDot: null, filter: {}, listSV: [], mssv: null, sortTerm: 'mssv_ASC',
        namHoc: null, hocKy: null, listSinhVienChon: [], listHpChon: []
    }
    defaultSortTerm = 'mssv_ASC'
    hocPhi = [
        { id: '1', text: 'Đã đóng đủ học phí' },
        { id: '0', text: 'Chưa đóng đủ học phí' },
    ]

    componentDidMount() {
        let idDot = this.props.match.params.id;
        this.tab.tabClick(null, 0);

        T.ready('/user/sau-dai-hoc', () => {

            // T.socket.on('dkhp-init-ctdt', (data) => this.setState({ process: `${parseInt((data.count / data.sum) * 100)}%` }));
            T.clearSearchBox();
            this.setData(idDot);
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
        });
    }

    componentWillUnmount() {
        // T.socket.off('dkhp-init-ctdt');
    }

    setData = (idDot) => {
        this.props.getSdhDotDangKyAdmin(idDot, item => {
            const d = Date.now();
            if (item.ngayKetThuc < d) this.setState({ readOnly: true });

            this.setState({ item: item, idDot: idDot });
            this.setUp(item);
        });
        this.getCountSinhVien(idDot);
        this.getPageHp(undefined, undefined, idDot);
    }

    getCountSinhVien = (idDot) => this.props.getSoLuongSinhVienSdh(idDot, value => {
        this.count.value(value);
        if (value === 0) this.count.value('0');
        this.getPage();
    });

    checkPermission = () => {
        let readOnly = this.state.readOnly;
        const permission = this.getUserPermission('sdhDmDotDangKy', ['write', 'delete', 'manage']);
        if (readOnly) {
            permission.write = false;
            permission.delete = false;
        }
        return permission;
    }

    getPage = (pageN, pageS, pageC) => {
        let idDot = this.state.idDot;
        let filter = {
            ...this.state.filter,
            sort: this.state?.sortTerm || this.defaultSortTerm,
            namHoc: this.state.namHoc,
            hocKy: this.state.hocKy
        };
        this.props.getSdhDssvTrongDotDkhpPage(pageN, pageS, pageC, filter, idDot, data => {
            if (data && data.list) {
                this.setState({
                    listSinhVien: data.list.map(element => {
                        if (this.state.listSinhVienChon.find(ele => ele && element.mssv == ele)) {
                            element.isChon = 1;
                        }
                        else {
                            element.isChon = 0;
                        }
                        return element;
                    })
                });
            }
        });
    }

    checkTime = (item) => {
        const d = Date.now();
        const permission = this.getUserPermission('sdhDmDotDangKy', ['write', 'delete', 'manage']);
        if (item.ngayBatDau < d && d < item.ngayKetThuc) permission.delete = false;
        else if (item.ngayKetThuc < d) {
            permission.write = false;
            permission.delete = false;
        }
        return permission;
    }

    getPageHp = (pageNumber, pageSize, idDot) => {
        this.props.getSdhDshpDotDangKyPage(pageNumber, pageSize, { ...this.state.filterHp, dotDangKy: idDot }, listHp => {
            if (listHp && listHp.list) {
                this.setState({
                    listHp: listHp.list.map(element => {
                        if (this.state.listHpChon.find(ele => ele && element.maHocPhan == ele)) {
                            element.isChon = 1;
                        }
                        else {
                            element.isChon = 0;
                        }
                        return element;
                    })
                });

            }

        });
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    handleKeySearchHp = (data, pageNumber, pageSize) => {
        this.setState({ filterHp: { ...this.state.filterHp, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPageHp(pageNumber, pageSize, this.state.idDot);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));


    setUp = (item) => {
        let { tenDot, nam, hocKy, ngayBatDau, ngayKetThuc, khoa, khoaSinhVien, loaiHinhDaoTao, kichHoat, ngoaiKeHoach, ngoaiCtdt, tinChiToiDa, tinChiToiThieu } = item;
        this.setState({ ngayBatDau, ngayKetThuc });
        loaiHinhDaoTao = loaiHinhDaoTao.split(', ');
        khoa = khoa.split(', ');

        ngayBatDau = new Date(ngayBatDau);
        ngayKetThuc = new Date(ngayKetThuc);

        this.tenDot.value(tenDot);
        this.ngayBatDau.value(ngayBatDau);
        this.ngayKetThuc.value(ngayKetThuc);
        this.namHoc.value(nam);
        this.hocKy.value(hocKy);

        this.loaiHinhDaoTao.value(loaiHinhDaoTao);
        this.khoa.value(khoa);
        this.khoaSinhVien.value(khoaSinhVien);
        this.kichHoat.value(kichHoat);
        this.ngoaiKeHoach.value(ngoaiKeHoach);
        this.ngoaiCtdt.value(ngoaiCtdt);
        this.tinChiToiThieu.value(tinChiToiThieu);
        this.tinChiToiDa.value(tinChiToiDa);


        nam = nam.split(' - ');
        this.setState({ item, hocKy, namHoc: nam[0] }, () => {
            this.getPage(undefined, undefined, '');
        });
    };

    backgroundColor = (item) => {
        if (item.isEmpty == true) {
            return '#FFCCCB';
        } else if (item.tinhTrang != 1 || item.tinhPhi == '0') {
            return '#FAF884';
        }
    }



    renderDSSV = () => {
        let permission = this.checkPermission();
        let table = renderDataTable({
            emptyTable: 'Chưa có sinh viên',
            data: this.state.listSinhVien,
            header: 'thead-light',
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>
                        <FormCheckbox ref={e => this.checkSVAll = e}
                            onChange={value => {
                                if (value)
                                    this.setState({
                                        listSinhVien: this.state.listSinhVien.map(ele => {
                                            ele.isChon = 1;
                                            return ele;
                                        }),
                                        listSinhVienChon: [...this.state.listSinhVienChon, ...this.state.listSinhVien.map(ele => { if (ele.isChon) return ele.mssv; })]
                                    });
                                else
                                    this.setState({
                                        listSinhVien: this.state.listSinhVien.map(ele => {
                                            ele.isChon = 0;
                                            return ele;
                                        }),
                                        listSinhVienChon: []
                                    });
                            }}
                        />
                    </th>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Họ tên' keyCol='hoTen' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='LHDT' keyCol='loaiHinhDaoTao' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Khoa' keyCol='khoa' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Khóa SV' keyCol='khoaSinhVien' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Lớp' keyCol='lop' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='CTDT' keyCol='ctdt' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Môn CTDT' keyCol='soLuong' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tình trạng SV' keyCol='tinhTrangSinhVien' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Học phí' keyCol='hocPhi' onKeySearch={this.handleKeySearch} onSort={this.onSort} typeSearch='select' data={this.hocPhi} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Kích hoạt' keyCol='kichHoat' onSort={this.onSort} />
                </tr>),
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={item.isChon} permission={{ write: true }}
                            onChanged={() => {
                                let list = this.state.listSinhVienChon;
                                if (list.includes(item.mssv)) {
                                    list.splice(list.indexOf(item.mssv), 1);

                                } else {
                                    list.push(item.mssv);

                                }
                                this.setState({
                                    listSinhVien: this.state.listSinhVien.map(ele => {
                                        if (ele.mssv == item.mssv) {
                                            ele.isChon = ele.isChon ? 0 : 1;

                                        } if (this.state.listSinhVien.every(ele => ele.isChon == 1)) {
                                            this.checkSVAll.value(1);
                                        } else {
                                            this.checkSVAll.value(0);
                                        }
                                        return ele;
                                    }),
                                    listSinhVienChon: list
                                });
                            }}
                        />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.mssv} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tenLoaiHinhDaoTao} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.khoaSinhVien} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.lop} />
                        <TableCell type='link' style={{ whiteSpace: 'nowrap', textAlign: 'center', backgroundColor: item.soLuong == 0 ? '#FFCCCB' : null }}
                            url={`/user/sau-dai-hoc/chuong-trinh-dao-tao/${item.maCtdt}`}
                            content={item.soLuong == 0
                                ? <Tooltip title='Chương trình đào tạo bị trỗng'>
                                    <div>{item.maCtdt}</div>
                                </Tooltip> : item.maCtdt} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center', backgroundColor: item.soLuong == 0 ? '#FFCCCB' : null }}
                            content={item.soLuong == 0
                                ? <Tooltip title='Chương trình đào tạo bị trỗng'>
                                    <div>{item.soLuong}</div>
                                </Tooltip> : item.soLuong} />
                        <TableCell style={{ whiteSpace: 'nowrap', backgroundColor: item.tinhTrang != 1 ? '#FFCCCB' : null }} content={item.tenTinhTrang} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} contentClassName={item.tinhPhi == '0' ? 'text-danger' : 'text-success'}
                            content={item.tinhPhi == '0'
                                ? <Tooltip title='Còn nợ học phí'>
                                    <i className='fa fa-lg fa-times-circle' />
                                </Tooltip>
                                : <Tooltip title='Đã đóng đủ'>
                                    <i className='fa fa-lg fa-check-circle' />
                                </Tooltip>} />
                        <TableCell style={{ textAlign: 'center' }} content={item.kichHoat} type='checkbox' permission={permission}
                            onChanged={value => {
                                item.kichHoat = value;
                                this.props.updateSdhDssvTrongDotDkhp({ listSinhVien: this.state.listSinhVien, listSinhVienChon: this.state.listSinhVienChon, idDot: this.state.idDot }, item, () => this.getCountSinhVien(item.idDot));
                            }}
                        />
                    </tr>
                );
            }
        });
        return (<>
            <div className='tile'>
                <div>{table}</div>
            </div>
        </>);
    }

    handleChange = (value, item) => {
        this.props.updateSdhDsvhpDotDangKy({ listHp: this.state.listHp, listHpChon: this.state.listHpChon }, item.maHocPhan, () => this.getPageHp(1, 1000, this.state.idDot));
    }

    selectHpAll = (value) => {
        if (value) {
            this.setState({
                listHp: this.state.listHp.map(ele => {
                    ele.isChon = 1;
                    return ele;
                }),
                listHpChon: [...this.state.listHpChon, ...this.state.listHp.map(ele => { if (ele.isChon) return ele.maHocPhan; })]
            });
        }
        else {
            this.setState({
                listHp: this.state.listHp.map(ele => {
                    ele.isChon = 0;
                    return ele;
                }),
                listHpChon: []
            });
        }

    }

    renderDSHP = () => {
        let permission = this.checkPermission();
        let table = renderDataTable({
            emptyTable: 'Chưa có học phần được tạo.',
            data: this.state.listHp, stickyHead: false,
            header: 'thead-light',
            renderHead: () => (<tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <FormCheckbox ref={e => this.checkHPAll = e}
                        onChange={this.selectHpAll}
                    />
                </th>
                <TableHead style={{ width: '25%', textAlign: 'center', whiteSpace: 'nowrap' }} content='Mã môn học' keyCol='maMonHoc' onKeySearch={this.handleKeySearchHp} onSort={this.onSort} />
                <TableHead style={{ width: '25%', textAlign: 'center', whiteSpace: 'nowrap' }} content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearchHp} onSort={this.onSort} />
                <TableHead style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn học' keyCol='tenMonHoc' onKeySearch={this.handleKeySearchHp} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='SLDK' keyCol='sldk' onKeySearch={this.handleKeySearchHp} onSort={this.onSort} />
                <TableHead style={{ width: 'auto' }} content='Loại môn' keyCol='loaiMon' onKeySearch={this.handleKeySearchHp} onSort={this.onSort} />
                <TableHead style={{ width: 'auto' }} content='Phòng' keyCol='phong' onKeySearch={this.handleKeySearchHp} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thứ' keyCol='thu' onKeySearch={this.handleKeySearchHp} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tiết bắt đầu' keyCol='tietBatDau' onKeySearch={this.handleKeySearchHp} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tiết' keyCol='tiet' onKeySearch={this.handleKeySearchHp} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày bắt đầu' keyCol='ngayBatDau' onKeySearch={this.handleKeySearchHp} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày kết thúc' keyCol='ngayKetThuc' onKeySearch={this.handleKeySearchHp} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Giảng viên' keyCol='giangVien' onKeySearch={this.handleKeySearchHp} onSort={this.onSort} type='select' data={SelectAdapter_FwCanBoGiangVien} />
                <TableHead style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content='Phân hệ' keyCol='phanHe' onKeySearch={this.handleKeySearchHp} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }} content='Khoá sinh viên' keyCol='khoaSinhVien' onKeySearch={this.handleKeySearchHp} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content='Năm' keyCol='nam' onKeySearch={this.handleKeySearchHp} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }} content='Học kỳ' keyCol='hocKy' onKeySearch={this.handleKeySearchHp} onSort={this.onSort} />
                <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>Kích hoạt</th>

            </tr>),
            renderRow: (item, index) => {
                const numHP = item.data.length;
                return (
                    <>
                        {numHP > 1 ? [
                            <tr key={index} style={{ backgroundColor: '#fff' }}>
                                <TableCell rowSpan={numHP} style={{ textAlign: 'right' }} content={index + 1} />
                                <TableCell rowSpan={numHP} type='checkbox' isCheck style={{ textAlign: 'center' }} content={item.isChon} permission={{ write: true }}
                                    onChanged={() => {
                                        let listHpChon = this.state.listHpChon;
                                        if (listHpChon.includes(item.maHocPhan)) {
                                            listHpChon.splice(listHpChon.indexOf(item.maHocPhan), 1);
                                        } else {
                                            listHpChon.push(item.maHocPhan);
                                        }
                                        this.setState({
                                            listHp: this.state.listHp.map(ele => {
                                                if (ele.maHocPhan == item.maHocPhan) {
                                                    ele.isChon = ele.isChon ? 0 : 1;

                                                } if (this.state.listHp.every(ele => ele.isChon == 1)) {
                                                    this.checkHPAll.value(1);
                                                } else {
                                                    this.checkHPAll.value(0);
                                                }
                                                return ele;
                                            }),
                                            listHpChon: listHpChon
                                        });
                                    }}
                                />
                                <TableCell rowSpan={numHP} style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.data[0].maMonHoc} />
                                <TableCell rowSpan={numHP} style={{ textAlign: 'left', }} content={item.maHocPhan} />
                                <TableCell rowSpan={numHP} style={{ textAlign: 'left' }} content={item.data[0].tenMonHoc} />
                                <TableCell rowSpan={numHP} style={{ textAlign: 'center' }} content={item.data[0].soLuongDangKy} />
                                <TableCell rowSpan={numHP} style={{ textAlign: 'center' }} content={item.data[0].loaiMonHoc ? <i className='fa fa-check' aria-visible='true'></i> : ''} />
                                <TableCell rowSpan={numHP} type='number' content={item.data[0].phong} />
                                <TableCell type='number' style={{ textAlign: 'center' }} content={item.data[0].thu} />
                                <TableCell type='number' style={{ textAlign: 'center' }} content={item.data[0].tietBatDau} />
                                <TableCell style={{ textAlign: 'center' }} content={item.data[0].soTietBuoi} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={item.data[0].ngayBatDau} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={item.data[0].ngayKetThuc} />
                                <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.data[0].giangVien} />
                                <TableCell rowSpan={numHP} style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.data[0].tenPhanHe} />
                                <TableCell rowSpan={numHP} style={{ textAlign: 'center' }} content={item.data[0].khoaSinhVien} />
                                <TableCell rowSpan={numHP} style={{ textAlign: 'center' }} content={item.data[0].namHoc} />
                                <TableCell rowSpan={numHP} type='number' style={{ textAlign: 'center' }} content={item.data[0].hocKy} />
                                <TableCell rowSpan={numHP} type='checkbox' style={{ textAlign: 'center' }} content={item.data[0].kichHoat ? true : false} onChanged={
                                    value => {
                                        item.data[0].kichHoat = value;
                                        this.props.updateSdhDsvhpDotDangKy({ listHp: this.state.listHp, listHpChon: this.state.listHpChon, idDot: this.state.idDot }, item, () => this.getPageHp(1, 1000, this.state.idDot));
                                    }} permission={permission} />
                            </tr>,
                            item.data.map((hp, idx) => {
                                if (idx > 0) {
                                    return <tr key={idx} style={{ backgroundColor: 'white' }}>
                                        <TableCell type='number' style={{ textAlign: 'center' }} content={hp.thu} />
                                        <TableCell type='number' style={{ textAlign: 'center' }} content={hp.tietBatDau} />
                                        <TableCell style={{ textAlign: 'center' }} content={hp.soTietBuoi} />
                                        <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hp.ngayBatDau} />
                                        <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hp.ngayKetThuc} />
                                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={hp.giangVien} />
                                    </tr>;
                                }
                            }),
                        ]
                            :
                            <tr key={index} style={{ backgroundColor: '#fff' }}>
                                <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                                <TableCell rowSpan={numHP} type='checkbox' isCheck style={{ textAlign: 'center' }} content={item.isChon} permission={{ write: true }}
                                    onChanged={() => {
                                        let listHpChon = this.state.listHpChon;
                                        if (listHpChon.includes(item.maHocPhan)) {
                                            listHpChon.splice(listHpChon.indexOf(item.maHocPhan), 1);
                                        } else {
                                            listHpChon.push(item.maHocPhan);
                                        }
                                        this.setState({
                                            listHp: this.state.listHp.map(ele => {
                                                if (ele.maHocPhan == item.maHocPhan) {
                                                    ele.isChon = ele.isChon ? 0 : 1;

                                                } if (this.state.listHp.every(ele => ele.isChon == 1)) {
                                                    this.checkHPAll.value(1);
                                                } else {
                                                    this.checkHPAll.value(0);
                                                }
                                                return ele;
                                            }),
                                            listHpChon: listHpChon
                                        });
                                    }}
                                />
                                <TableCell style={{ textAlign: 'left' }} content={item.data[0].maMonHoc} />
                                <TableCell style={{ textAlign: 'left', }} content={item.maHocPhan} />
                                <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.data[0].tenMonHoc} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.data[0].soLuongDangKy} />
                                <TableCell style={{ textAlign: 'center' }} content={item.data[0].loaiMonHoc ? <i className='fa fa-check' aria-visible='true'></i> : ''} />
                                <TableCell type='number' content={item.data[0].phong} />
                                <TableCell type='number' style={{ textAlign: 'center' }} content={item.data[0].thu} />
                                <TableCell type='number' style={{ textAlign: 'center' }} content={item.data[0].tietBatDau} />
                                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.data[0].soTietBuoi} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={item.data[0].ngayBatDau} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={item.data[0].ngayKetThuc} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.data[0].giangVien} />
                                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.data[0].tenPhanHe} />
                                <TableCell style={{ textAlign: 'center' }} content={item.data[0].khoaSinhVien} />
                                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.data[0].namHoc} />
                                <TableCell type='number' style={{ textAlign: 'center' }} content={item.data[0].hocKy} />
                                <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.data[0].kichHoat == 1 ? true : false} onChanged={
                                    value => {
                                        item.data[0].kichHoat = value;
                                        this.props.updateSdhDsvhpDotDangKy({ listHp: this.state.listHp, listHpChon: this.state.listHpChon, idDot: this.state.idDot }, item, () => this.getPageHp(1, 1000, this.state.idDot));
                                    }
                                } permission={permission} />
                            </tr>}
                    </>
                );
            }

        });
        return (<>
            <div className='tile'>
                <div>{table}</div>
            </div>

        </>);
    }

    addSinhVien = () => {
        let listSv = this.state.listSV;
        const permission = this.getUserPermission('sdhDmDotDangKy', ['write', 'delete', 'manage']);
        let table = renderDataTable({
            emptyTable: 'Chưa có sinh viên',
            data: listSv,
            header: 'thead-light',
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>MSSV</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Họ tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại hình đào tạo</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Khoa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Khóa sinh viên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Lớp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng sinh viên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Xóa</th>

                </tr>),
            renderRow: (item, index) => {
                return (
                    <tr key={index} style={{ backgroundColor: item.tinhTrang != 1 ? '#f7de97' : '' }}>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.heDaoTao} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.khoaSinhVien} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lop} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenTinhTrang} />
                        <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={permission}
                            onDelete={() => {
                                let listSv = this.state.listSV;
                                listSv = listSv.filter(e => e.mssv != item.mssv);
                                this.setState({ listSV: listSv });
                            }} />
                    </tr>
                );
            }
        });
        return (<>
            <div className='tile'>
                <div className='row'>
                    <div className='col-md-12 my-2'>
                        <h4 className='tile-title'>Tìm kiếm sinh viên</h4>
                        <FormSelect ref={e => this.sinhVien = e} className='col-md-12' placeholder='Sinh viên' data={SelectAdapter_DanhSachSinhVienSdh}
                            onChange={(value) => this.selectSinhVien(value.id)} />
                    </div>
                </div>
                {listSv.length == 0 ? <div />
                    : < div>
                        < div> {table} </div>
                        <div style={{ display: 'flex', justifyContent: 'end' }} >
                            <button className='btn btn-success' onClick={(e) => e.preventDefault() || this.luuSinhVien()}>
                                <i className='fa fa-fw fa-lg fa-handshake-o' /> Thêm sinh viên
                            </button>
                        </div>
                    </div>}
            </div>
        </>);
    }

    luuSinhVien = () => {
        let { listSV, idDot } = this.state;
        listSV = listSV.map(item => item.mssv);
        listSV = listSV.join('; ');
        let data = { listSV, idDot };
        this.props.createListSVSdh(data, data => {
            if (!data.error) {
                this.setState({ listSV: [] });
                this.sinhVien.value('');
            }
            this.getCountSinhVien(idDot);
            this.getPage();
        });
    }

    luuHp = () => {
        let { listHpAdd, idDot } = this.state;
        listHpAdd = listHpAdd.map(item => item.maHocPhan);
        listHpAdd = listHpAdd.join('; ');
        let data = { listHpAdd, idDot };
        this.props.createListHPSdh(data, data => {
            if (!data.error) {
                this.setState({ listHpAdd: [] });
                this.hocPhanAdd.value('');
            }
            this.getPageHp(1, 1000, this.state.idDot);
        });
    }


    selectSinhVien = (mssv) => {
        let { listSV, ngayBatDau, ngayKetThuc } = this.state;
        let check = true;

        for (let sinhVien of listSV) {
            if (sinhVien.mssv == mssv) {
                check = false;
                break;
            }
        }

        if (check) {
            this.props.getStudentSdhInfo(mssv, ngayBatDau, ngayKetThuc, value => {

                if (value.message) {
                    this.sinhVien.focus();
                    T.alert(value.message, 'warning', false, 1500);
                } else {
                    let data = value.dataSinhVien;
                    let item = {
                        mssv: data.mssv,
                        loaiHinhDaoTao: data.heDaoTao,
                        khoaSinhVien: data.namTuyenSinh,
                        lop: data.lop,
                        hoTen: data.hoTen,
                        tenKhoa: data.tenKhoa,
                        tinhTrang: data.tinhTrang,
                        tenTinhTrang: data.tenTinhTrang,
                    };
                    listSV.push(item);
                    this.setState({ listSV });
                }
            });
        } else T.alert('Sinh viên đã chọn!', 'warning', false, 1500);
    }

    selectHp = (hp) => {
        let { listHpAdd, ngayBatDau, ngayKetThuc } = this.state;
        listHpAdd = listHpAdd ? listHpAdd : [];
        let check = true;

        for (let hocPhan of listHpAdd) {
            if (hocPhan.maHocPhan == hp) {
                check = false;
                break;
            }
        }

        if (check) {
            this.props.getHpSdhInfo(hp, ngayBatDau, ngayKetThuc, value => {

                if (value.message) {
                    this.hocPhanAdd.focus();
                    T.alert(value.message, 'warning', false, 1500);
                } else {
                    let data = value.dataHocPhan;
                    let item = {
                        maMonHoc: data.maMonHoc,
                        maHocPhan: data.maHocPhan,
                        tenMonHoc: data.tenTiengViet,
                        bacDaoTao: data.bacDaoTao,
                        tenPhanHe: data.tenPhanHe,
                        giangVien: data.giangVien,
                        nganhDaoTao: data.nganhDaoTao,
                    };
                    listHpAdd.push(item);
                    this.setState({ listHpAdd });
                }
            });
        } else T.alert('Học phần đã chọn!', 'warning', false, 1500);

    }

    showModal = (e) => {
        e.preventDefault();
        let item = this.state.item;
        this.modal.show(item);
    }

    updateDot = (id, changes, done) => this.props.updateSdhDotDangKy(id, changes, (value) => {
        if (value && value.error) {
            done && done(value);
        } else {
            this.setData(id);
            this.getPage(undefined, undefined, '');
            done && done(value);
        }
    });
    addHocPhan = () => {
        let listHp = this.state.listHpAdd;
        const permission = this.getUserPermission('sdhDmDotDangKy', ['write', 'delete', 'manage']);
        let table = renderDataTable({
            emptyTable: 'Chưa có học phần',
            data: listHp,
            header: 'thead-light',
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã môn học</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã học phần</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tên môn học</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Bậc đào tạo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tên phân hệ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngành đào tạo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Giảng viên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Xóa</th>

                </tr>),
            renderRow: (item, index) => {
                return (
                    <tr key={index} style={{ backgroundColor: item.tinhTrang != 1 ? '#f7de97' : '' }}>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maMonHoc} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenMonHoc} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.bacDaoTao} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenPhanHe} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.nganhDaoTao} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.giangVien} />
                        <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={permission}
                            onDelete={() => {
                                let listHp = this.state.listHpAdd;
                                listHp = listHp.filter(e => e.maHocPhan != item.maHocPhan);
                                this.setState({ listHpAdd: listHp });
                            }} />
                    </tr>
                );
            }
        });
        return (<>
            <div className='tile'>
                <div className='row'>
                    <div className='col-md-12 my-2'>
                        <h4 className='tile-title'>Tìm kiếm học phần</h4>
                        <FormSelect ref={e => this.hocPhanAdd = e} className='col-md-12' placeholder='Học phần' data={SelectAdapter_TkbSdh}
                            onChange={(value) => this.selectHp(value.id)} />
                    </div>
                </div>
                {listHp && listHp.length == 0 ? <div />
                    : < div>
                        < div> {table} </div>
                        <div style={{ display: 'flex', justifyContent: 'end' }} >
                            <button className='btn btn-success' onClick={(e) => e.preventDefault() || this.luuHp()}>
                                <i className='fa fa-fw fa-lg fa-handshake-o' /> Thêm học phần
                            </button>
                        </div>
                    </div>}
            </div>
        </>);
    }

    render() {
        let idDot = this.state.idDot;
        let readOnly = this.state.readOnly;

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Chi tiết đợt đăng ký học phần',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/dot-dang-ky'>Đợt đăng ký</Link>,
                'Chi tiết đợt đăng ký học phần'
            ],
            content: <>
                <div className='tile row'>
                    <FormTextBox ref={e => this.tenDot = e} className='col-md-6' label='Tên đợt' required readOnly />
                    <FormTextBox ref={e => this.namHoc = e} className='col-md-2' label='Năm học' type='scholastic' required readOnly />
                    <FormSelect ref={e => this.hocKy = e} className='col-md-2' label='Học kỳ' data={SelectAdapter_DtDmHocKy} required readOnly />
                    <FormCheckbox ref={e => this.kichHoat = e} className='col-md-2' label='Kích hoạt' isSwitch permission={this.checkTime({ ngayBatDau: this.state.ngayBatDau, ngayKetThuc: this.state.ngayKetThuc })} onChange={value => {
                        this.kichHoat.value(0);
                        value ? T.confirm('Xác nhận', 'Kích hoạt hệ thống ĐKHP theo đợt đăng ký này. Lưu ý, để đạt chất lượng tốt nhất, vui lòng kích hoạt trước 30 phút trước khi bắt đầu!', 'warning', true, isConfirm => {
                            if (isConfirm) {
                                this.props.updateSdhDotDangKy(idDot, { kichHoat: !!value }, () => {
                                    value && T.alert('Kích hoạt hệ thống ĐKHP thành công!', 'success', true);
                                    this.kichHoat.value(1);
                                });
                            }
                        }) : this.props.updateSdhDotDangKy(idDot, { kichHoat: !!value });
                    }} />

                    <FormDatePicker ref={e => this.ngayBatDau = e} className='col-md-3' label='Ngày bắt đầu' type='time' required readOnly />
                    <FormDatePicker ref={e => this.ngayKetThuc = e} className='col-md-3' label='Ngày kết thúc' type='time' required readOnly />
                    <FormTextBox ref={e => this.count = e} className='col-md-6' label='Số lượng sinh viên đăng ký' required readOnly />


                    <FormSelect ref={e => this.loaiHinhDaoTao = e} className='col-md-4' label='Loại hình đào tạo' data={SelectAdapter_DmHocSdhVer2} multiple readOnly={true} />
                    <FormSelect ref={e => this.khoa = e} className='col-md-4' label='Khoa' data={SelectAdapter_DmKhoaSdh} multiple readOnly />
                    <FormTextBox ref={e => this.khoaSinhVien = e} className='col-md-4' label='Khóa sinh viên' required readOnly />
                    <FormCheckbox ref={e => this.ngoaiKeHoach = e} className='col-md-3' label='Cho phép đăng ký ngoài kế hoạch' onChange={value => this.ngoaiKeHoach.value(value ? 0 : 1)} />
                    <FormCheckbox ref={e => this.ngoaiCtdt = e} className='col-md-3' label='Cho phép đăng ký ngoài chương trình đào tạo' onChange={value => this.ngoaiCtdt.value(value ? 0 : 1)} />
                    <FormTextBox type='number' ref={e => this.tinChiToiThieu = e} className='col-md-3' label='Tín chỉ tối thiểu' min={1} max={30} readOnly />
                    <FormTextBox type='number' ref={e => this.tinChiToiDa = e} className='col-md-3' label='Tín chỉ tối đa' min={1} max={30} readOnly />


                </div>
                {readOnly ?
                    <div>
                        {this.renderDSSV()}
                    </div>
                    : <div >
                        <FormTabs ref={e => this.tab = e} tabs={[
                            { title: 'Danh sách sinh viên', component: this.renderDSSV() },
                            { title: 'Thêm sinh viên', component: this.addSinhVien() }
                        ]} />
                    </div>}
                {readOnly ?
                    <div>
                        {this.renderDSHP()}
                    </div>
                    : <div >
                        <FormTabs ref={e => this.tab = e} tabs={[
                            { title: 'Danh sách học phần', component: this.renderDSHP() },
                            { title: 'Thêm học phần', component: this.addHocPhan() }
                        ]} />
                    </div>}

                {readOnly ? <div /> : <AddModal ref={e => this.modal = e} updateDot={this.updateDot} />}
            </>,
            backRoute: '/user/sau-dai-hoc/dot-dang-ky',
            buttons: readOnly ? null : { icon: 'fa-edit', tooltip: 'Chỉnh sửa học phần', className: 'btn btn-primary', onClick: e => this.showModal(e) },
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhDssvDotDkhp: state.sdh.sdhDssvDotDkhp });
const mapActionsToProps = { getSoLuongSinhVienSdh, getSdhDotDangKyAdmin, getSdhDssvTrongDotDkhpPage, updateSdhDssvTrongDotDkhp, createListSVSdh, getStudentSdhInfo, updateSdhDotDangKy, getSdhThoiKhoaBieuPage, getSdhDshpDotDangKyPage, updateSdhDsvhpDotDangKy, getHpSdhInfo, createListHPSdh };
export default connect(mapStateToProps, mapActionsToProps)(EditPage);