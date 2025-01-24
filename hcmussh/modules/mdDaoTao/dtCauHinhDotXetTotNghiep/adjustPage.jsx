import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { getDtCauHinhDotXetTotNghiep, setUpDtDotXetTotNghiep, getListSinhVien } from './redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { getDtDanhSachXetTotNghiepPage } from 'modules/mdDaoTao/dtDanhSachXetTotNghiep/redux';
import { AdminPage, AdminModal, FormTextBox, FormSelect, renderDataTable, TableCell, TableHead, renderTable } from 'view/component/AdminPage';
import { SelectAdapter_DtLopFilter } from 'modules/mdDaoTao/dtLop/redux';
import { SelectAdapter_FwStudent } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_KhungDaoTaoFilter } from 'modules/mdDaoTao/dtChuongTrinhDaoTao/redux';
import { Tooltip } from '@mui/material';

class SetUpModal extends AdminModal {
    state = { type: null, isSelected: false, data: [], listSV: [] }

    listMaCtdt = {}

    componentDidMount() {
        this.disabledClickOutside();
        this.onHidden(() => {
            this.listMaCtdt = {};
            this.setState({ type: null, isSelected: false, data: [], listSV: [] }, () => this.selector.value(''));
        });
    }

    mapperTitle = {
        'sinhVien': 'Xét theo từng sinh viên',
        'lop': 'Xét theo lớp sinh viên',
        null: ''
    }

    mapperSelectorData = {
        'sinhVien': SelectAdapter_FwStudent,
        'lop': SelectAdapter_DtLopFilter(),
        null: ''
    }

    mapperLabel = {
        'sinhVien': 'Chọn sinh viên',
        'lop': 'Chọn lớp sinh viên',
        null: ''
    }

    onShow = (item) => {
        let { type } = item || { type: null };
        this.setState({ type }, () => this.selector.value(''));
    }

    onSubmit = () => {
        const { data } = this.state;
        if (!data.length) return T.alert('Chưa có sinh viên chọn!', 'info', true, 5000);
        if (data.some(i => !i.maCtdt)) return T.alert('Sinh viên chọn chưa có chương trình đào tạo xét tốt nghiệp!', 'info', true, 5000);

        T.alert('Đang cấu hình sinh viên xét tốt nghiệp. Vui lòng chờ trong giây lát!', 'info', false, null, true);
        this.props.setUpDtDotXetTotNghiep({ listSv: data, idDot: this.props.idDot }, () => {
            T.alert('Cấu hình sinh viên xét tốt nghiệp thành công!', 'info', true, 5000);
            this.hide();
            this.props.handleSave();
        });
    }

    onChangeSelect = (value) => {
        const { type } = this.state;
        if (type == 'sinhVien') {
            const { id, maCtdt } = value;
            this.setState({ data: [{ mssv: id, maCtdt }], selectedValue: id, isSelected: true }, () => this.ctdt.value(maCtdt));
        } else if (type == 'lop') {
            this.setState({ listSV: null, isSelected: true });
            this.props.getListSinhVien(value.id, items => {
                items = items.map(i => ({ ...i, maCtdt: value.maCtdt }));
                this.setState({ listSV: items }, () => {
                    items.forEach(i => this.listMaCtdt[i.mssv]?.value(value.maCtdt));
                });
            });
        }
    }

    renderListChosen = (data) => renderTable({
        getDataSource: () => data,
        divStyle: { height: '50vh' },
        emptyTable: 'Không có sinh viên chọn',
        stickyHead: data && data.length > 10,
        renderHead: () => {
            return <tr>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>#</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>MSSV</th>
                <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Họ và tên</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Mã chương trình đào tạo</th>
            </tr>;
        },
        renderRow: (item, index) => {
            const { data } = this.state;
            return <tr key={`listChon_${index}`}>
                <TableCell type='checkbox' isCheck content={data.find(i => i.mssv == item.mssv)} permission={{ write: true }} onChanged={value => this.setState({ data: value ? [...data, item] : data.filter(i => i.mssv != item.mssv) })} />
                <TableCell content={item.mssv} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.ho} ${item.ten}`} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={<FormSelect ref={e => this.listMaCtdt[item.mssv] = e} data={SelectAdapter_KhungDaoTaoFilter()} onChange={value => this.setState({ data: data.map(i => i.mssv == item.mssv ? { ...i, maCtdt: value.maCtdt } : { ...i }) })} />} />
            </tr>;
        }
    });

    render = () => {
        const { type, isSelected, data, listSV } = this.state;
        return this.renderModal({
            title: this.mapperTitle[type],
            size: 'large',
            isShowSubmit: isSelected,
            body: <>
                <div className='row'>
                    <FormSelect ref={e => this.selector = e} className='col-md-12' label={this.mapperLabel[type]} data={this.mapperSelectorData[type]} required
                        onChange={value => this.onChangeSelect(value)} />
                    <FormSelect className='col-md-12' style={{ display: isSelected && type == 'sinhVien' ? '' : 'none' }} ref={e => this.ctdt = e} data={SelectAdapter_KhungDaoTaoFilter()} onChange={value => this.setState({ data: [{ ...data[0], maCtdt: value.maCtdt }] })} />
                    {
                        type == 'lop' && isSelected && <div className='col-md-12'>{this.renderListChosen(listSV)}</div>
                    }
                </div>
            </>,
        });
    }
}


class DetailModal extends AdminModal {

    componentDidMount() {
        this.disabledClickOutside();
    }

    state = { dataCTDT: [] }

    onShow = (item) => {
        let { mucCha, mucCon, monTotNghiep, cauTrucTinChi } = item,
            dataCTDT = [];
        cauTrucTinChi = cauTrucTinChi ? JSON.parse(cauTrucTinChi) : [];
        mucCha = mucCha ? JSON.parse(mucCha).chuongTrinhDaoTao : {};
        mucCon = mucCon ? JSON.parse(mucCon).chuongTrinhDaoTao : {};
        monTotNghiep = monTotNghiep ? JSON.parse(monTotNghiep) : [];

        if (monTotNghiep.length) {
            dataCTDT = Object.keys(mucCha).flatMap(key => {
                let listMucCon = mucCon[key];
                if (listMucCon && listMucCon.length) {
                    return listMucCon.flatMap(child => {
                        return cauTrucTinChi.filter(i => i.maKhoiKienThuc == mucCha[key].id && i.maKhoiKienThucCon == child.id && i.parentId == null).map(i => {
                            if (Number(i.isDinhHuong) || Number(i.isNhom)) {
                                let childTuChon = cauTrucTinChi.filter(tc => tc.parentId == i.idKhung);
                                childTuChon = childTuChon.map(chd => {
                                    const listMon = monTotNghiep.filter(i => i.idKhungTinChi == chd.idKhung),
                                        tinChiDat = listMon.reduce((total, cur) => total + Number(cur.tongTinChi), 0);
                                    return { ...chd, listMon, tinChiDat };
                                });
                                return { ...i, tinChiDat: childTuChon.map(chd => chd.tinChiDat).reduce((acc, cur) => acc + cur, 0), childTuChon, childText: mucCha[key].text, text: child.value.text };
                            } else {
                                const listMon = monTotNghiep.filter(mon => mon.idKhungTinChi == i.idKhung),
                                    tinChiDat = listMon.reduce((total, cur) => total + Number(cur.tongTinChi), 0);
                                return { ...i, childText: mucCha[key].text, text: child.value.text, listMon, tinChiDat };
                            }
                        });
                    });
                } else {
                    return cauTrucTinChi.filter(i => i.maKhoiKienThuc == mucCha[key].id && i.maKhoiKienThucCon == null && i.parentId == null).map(i => {
                        if (Number(i.isDinhHuong) || Number(i.isNhom)) {
                            let childTuChon = cauTrucTinChi.filter(tc => tc.parentId == i.idKhung);
                            childTuChon = childTuChon.map(chd => {
                                const listMon = monTotNghiep.filter(i => i.idKhungTinChi == chd.idKhung),
                                    tinChiDat = listMon.reduce((total, cur) => total + Number(cur.tongTinChi), 0);
                                return { ...chd, listMon, tinChiDat };
                            });
                            return { ...i, tinChiDat: childTuChon.map(chd => chd.tinChiDat).reduce((acc, cur) => acc + cur, 0), childTuChon, text: mucCha[key].text };
                        } else {
                            const listMon = monTotNghiep.filter(mon => mon.idKhungTinChi == i.idKhung),
                                tinChiDat = listMon.reduce((total, cur) => total + Number(cur.tongTinChi), 0);
                            return { ...i, text: mucCha[key].text, listMon, tinChiDat };
                        }
                    });
                }
            });
        }
        this.setState({ dataCTDT });
    }

    renderContent = list => renderTable({
        emptyTable: 'Không tìm thấy đợt xét tốt nghiệp',
        getDataSource: () => list,
        header: 'thead-light',
        stickyHead: list && list.length > 9 ? true : false,
        divStyle: { height: '65vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>#</th>
                <th style={{ width: '80%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Khối kiến thức</th>
                <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Số tín chỉ quy định</th>
                <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Số tín chỉ đạt</th>
            </tr>),
        renderRow: (item, index) => {
            const rows = [];
            rows.push(<tr style={{ backgroundColor: item.tongSoTinChi > item.tinChiDat ? '#ffc6c4' : '' }} key={`listDetail_${index}`} data-toggle='collapse' data-target={`#collapse-group-${item.idKhung}`} aria-expanded='true' aria-controls={`collapse-group-${item.idKhung}`}>
                <TableCell content={index + 1} />
                <TableCell content={<>
                    <i style={{ display: item.childText ? '' : 'none' }}>{item.childText}</i>
                    <br style={{ display: item.childText ? '' : 'none' }}></br>
                    <b>{item.text}</b>
                    <br />
                    <p>{Number(item.isDinhHuong) ? 'Nhóm tự chọn định hướng' : (item.loaiKhung == 'BB' ? 'Nhóm môn bắt buộc' : 'Nhóm môn tự chọn')}</p>
                </>} />
                <TableCell style={{ textAlign: 'center' }} content={item.tongSoTinChi} />
                <TableCell style={{ textAlign: 'center' }} content={item.tinChiDat} />
            </tr>);

            if (item.listMon) {
                rows.push(<tr className='collapse' id={`collapse-group-${item.idKhung}`}>
                    <td colSpan={4}>
                        {
                            renderTable({
                                getDataSource: () => item.listMon || [],
                                emptyTable: 'Chưa có thông tin môn học!',
                                header: 'thead-light',
                                stickyHead: (item.listMon || []).length > 5,
                                divStyle: { height: '35vh' },
                                renderHead: () => <tr>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Mã môn học</th>
                                    <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Tên môn học</th>
                                    <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tín chỉ</th>
                                    <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Điểm</th>
                                </tr>,
                                renderRow: (item, index) => {
                                    return (<tr key={item.maMonHoc + index}>
                                        <TableCell content={index + 1} />
                                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maMonHoc} />
                                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { 'vi': '' }).vi} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tongTinChi} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.diem} />
                                    </tr>);
                                }
                            })
                        }
                    </td>
                </tr>
                );
            }
            if (item.childTuChon) {
                item.childTuChon.forEach(child => {
                    rows.push(<tr key={child.idKhung} data-toggle='collapse' data-target={`#collapse-group-${child.idKhung}`} aria-expanded='true' aria-controls={`collapse-group-${child.idKhung}`}>
                        <TableCell content={''} />
                        <TableCell content={<>
                            <p>{(Number(child.isDinhHuong) ? 'Tự chọn định hướng: ' : 'Tự chọn nhóm: ') + child.tenNhomDinhHuong}</p>
                        </>} />
                        <TableCell style={{ textAlign: 'center' }} content={child.tongSoTinChi} />
                        <TableCell style={{ textAlign: 'center' }} content={child.tinChiDat} />
                    </tr>);

                    if (child.listMon) {
                        rows.push(<tr className='collapse' id={`collapse-group-${child.idKhung}`}>
                            <td colSpan={4}>
                                {
                                    renderTable({
                                        getDataSource: () => child.listMon || [],
                                        emptyTable: 'Chưa có thông tin môn học!',
                                        header: 'thead-light',
                                        stickyHead: (child.listMon || []).length > 5,
                                        divStyle: { height: '35vh' },
                                        renderHead: () => <tr>
                                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                                            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Mã môn học</th>
                                            <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Tên môn học</th>
                                            <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tín chỉ</th>
                                            <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Điểm</th>
                                        </tr>,
                                        renderRow: (item, index) => {
                                            return (<tr key={item.maMonHoc + index}>
                                                <TableCell content={index + 1} />
                                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maMonHoc} />
                                                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { 'vi': '' }).vi} />
                                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tongTinChi} />
                                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.diem} />
                                            </tr>);
                                        }
                                    })
                                }
                            </td>
                        </tr>
                        );
                    }
                });
            }
            return rows;
        }
    })

    render = () => {
        return this.renderModal({
            title: 'Chi tiết tổng quan kết quả xét chương trình',
            size: 'elarge',
            body: <>
                {this.renderContent(this.state.dataCTDT)}
            </>
        });
    }
}


class adjustPage extends AdminPage {
    state = {
        item: {}, idDot: null, filter: {}, listSV: [], mssv: null, sortTerm: 'mssv_ASC',
        namHoc: null, hocKy: null
    }
    defaultSortTerm = 'mssv_ASC'

    mapperStatus = {
        0: { icon: 'fa fa-lg fa-times', text: 'Không đủ điều kiện tốt nghiệp', color: 'red' },
        1: { icon: 'fa fa-lg fa-check-circle', text: 'Đủ điều kiện tốt nghiệp', color: 'green' },
    }

    componentDidMount() {
        let idDot = this.props.match.params.id;

        T.ready('/user/dao-tao', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.setData(idDot);
        });
        T.socket.on('setup-xet-tot-nghiep', (email) => {
            if (this.props.system.user && this.props.system.user.email == email) {
                //
            }
        });
    }

    componentWillUnmount() {
        T.socket.off('setup-xet-tot-nghiep');
    }

    setData = (idDot) => {
        this.props.getDtCauHinhDotXetTotNghiep(idDot, item => {
            this.setState({ item: item, idDot: idDot });
            this.setUp(item);
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        let { filter, idDot, sortTerm } = this.state;
        this.props.getDtDanhSachXetTotNghiepPage(pageN, pageS, pageC, { ...filter, idDot, sort: sortTerm || this.defaultSortTerm }, done);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));


    setUp = (item) => {
        let { ten, namHoc, hocKy, ngayBatDau, ngayKetThuc } = item;

        this.ten.value(ten);
        this.namHoc.value(namHoc);
        this.hocKy.value(hocKy);
        this.ngayBatDau.value(T.dateToText(ngayBatDau));
        this.ngayKetThuc.value(T.dateToText(ngayKetThuc));

        this.setState({ item, hocKy, namHoc }, () => {
            this.getPage(undefined, undefined, '');
        });
    };

    renderDSSV = () => {
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dtDanhSachXetTotNghiep?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, list: null };

        let table = renderDataTable({
            emptyTable: 'Chưa có sinh viên',
            data: list,
            header: 'thead-light',
            stickyHead: list && list.length > 11 ? true : false,
            divStyle: { height: '59vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Họ và tên' keyCol='hoTen' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Lớp' keyCol='lop' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='CTDT xét tốt nghiệp' keyCol='ctdt' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tình trạng' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Chi tiết' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Điểm tốt nghiệp' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tín chỉ tốt nghiệp' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Xếp loại' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Người xét tốt nghiệp' keyCol='modifier' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thời gian xét tốt nghiệp' keyCol='timeModified' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thao tác' />
                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                const icon = this.mapperStatus[item.isTotNghiep].icon,
                    text = this.mapperStatus[item.isTotNghiep].text,
                    color = this.mapperStatus[item.isTotNghiep].color;

                return <tr key={index} style={{ backgroundColor: '#fff' }}>
                    <TableCell style={{ textAlign: 'center' }} content={indexOfItem} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='link' content={item.mssv} url={`${window.location.origin}/user/dao-tao/graduation/setting/detail?idDot=${this.state.idDot}&&mssv=${item.mssv}`} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.lop} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maCtdt} />
                    <TableCell style={{ alignItems: 'center', whiteSpace: 'nowrap', color, fontWeight: 'bolder' }} content={<><i className={icon} />&nbsp; &nbsp;{text}</>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.detail} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.diemTotNghiep} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tinChiTotNghiep} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tenXepLoai} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.modifier} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM:ss' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.timeModified} />
                    <TableCell type='buttons' content={item}>
                        <Tooltip title='Xem tổng quan kết quả xét chương trình đào tạo'>
                            <button className='btn btn-info' onClick={e => e.preventDefault() || this.detailModal.show(item)}><i className='fa fa-search' /></button>
                        </Tooltip>
                    </TableCell>
                </tr>;
            }
        });
        return (<>
            <div className='tile'>
                <div>{table}</div>
            </div>
            <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                getPage={this.getPage} pageRange={5} />
        </>);
    }


    render() {
        const permission = this.getUserPermission('dtDanhSachXetTotNghiep', ['manage']);

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Chi tiết đợt xét tốt nghiệp',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/graduation'>Xét tốt nghiệp</Link>,
                <Link key={2} to='/user/dao-tao/graduation/setting'>Cấu hình đợt xét tốt nghiệp</Link>,
                'Chi tiết đợt xét tốt nghiệp'
            ],
            content: <>
                <SetUpModal ref={e => this.modal = e} idDot={this.state.idDot} setUpDtDotXetTotNghiep={this.props.setUpDtDotXetTotNghiep} getListSinhVien={this.props.getListSinhVien} handleSave={() => this.getPage(undefined, undefined, '')} />
                <DetailModal ref={e => this.detailModal = e} />
                <div className='tile'>
                    <div className='row'>
                        <FormTextBox ref={e => this.ten = e} className='col-md-4' label='Tên đợt' required readOnly />
                        <FormTextBox ref={e => this.namHoc = e} className='col-md-2' label='Năm học' type='scholastic' required readOnly />
                        <FormSelect ref={e => this.hocKy = e} className='col-md-2' label='Học kỳ' data={SelectAdapter_DtDmHocKy} required readOnly />
                        <FormTextBox ref={e => this.ngayBatDau = e} className='col-md-2' label='Ngày bắt đầu' readOnly />
                        <FormTextBox ref={e => this.ngayKetThuc = e} className='col-md-2' label='Ngày kết thúc' readOnly />
                    </div>
                </div>
                <div>
                    {this.renderDSSV()}
                </div>
            </>,
            backRoute: '/user/dao-tao/graduation/setting',
            collapse: [
                { icon: 'fa-plus', name: 'Xét từng sinh viên', permission: permission.manage, type: 'info', onClick: e => e.preventDefault() || this.modal.show({ type: 'sinhVien' }) },
                { icon: 'fa-plus-square', name: 'Xét lớp học phần', permission: permission.manage, type: 'purple', onClick: e => e.preventDefault() || this.modal.show({ type: 'lop' }) },
            ],
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDanhSachXetTotNghiep: state.daoTao.dtDanhSachXetTotNghiep });
const mapActionsToProps = { getDtCauHinhDotXetTotNghiep, getDtDanhSachXetTotNghiepPage, setUpDtDotXetTotNghiep, getListSinhVien };
export default connect(mapStateToProps, mapActionsToProps)(adjustPage);