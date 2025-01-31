import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox, FormSelect, loadSpinner, renderDataTable, renderTable, TableCell, TableHead } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import { SelectAdapter_DmKhoaSdh } from 'modules/mdSauDaiHoc/dmKhoaSauDaiHoc/redux';
import { getSdhDangKyHocPhanPage, sdhDanhSachHocPhanDotDangKy, createSdhDangKyHocPhanMultiple, deleteSdhDangKyHocPhanMultiple, getSvSdhDangKyHocPhanPage, getStudentsFilter, getHocPhan, checkCondition, createSdhDangKyHocPhanAdvance } from './redux';
import { getSvSdhPage } from '../fwSinhVienSdh/redux';
import { getSdhThoiKhoaBieuPage } from '../sdhThoiKhoaBieu/redux';
import { SelectAdapter_DmHocSdh } from 'modules/mdSauDaiHoc/dmHocSdh/redux';
import { SelectAdapter_SdhKhoaHocVien } from '../sdhKhoaDaoTao/redux';
import { SelectAdapter_SdhLopHocVienFilter } from '../sdhLopHocVien/redux';
import { getSdhDotDangKyAdmin } from 'modules/mdSauDaiHoc/sdhDotDangKy/redux';
import ListSinhVienChonModal from './listSinhVienChonModal';
import ListHocPhanModal from './listHocPhanModal';
import ConfirmDangKy from './confirmDangKy';

class FormDangKyTrucTiepSdh extends AdminPage {
    state = {
        freeList: [],
        selected: [],
        filter: {},
        dotDangKy: null,
        selectedMon: {},
        maHocPhan: null,
        listSinhVienChon: [], listHocPhanChon: [], filterhp: {}, thaoTacTrang: 'ngang', isMultiSinhVien: true, isChecking: false, isSvLoading: true, isShowStud: false, isHpLoading: true, isShowSubj: false, listTinhTrang: '1,2,3'
    };
    listSinhVien = [];
    listHocPhan = [];
    defaultSortTerm = 'maMonHoc_ASC';
    hocPhi = [
        { id: '1', text: 'Đã đóng đủ học phí' },
        { id: '0', text: 'Chưa đóng đủ học phí' },
    ]


    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.khoa?.value('Chưa có thông tin');
            this.khoaSinhVien?.value();
            this.lop?.value('Chưa có thông tin');
            this.loaiHinhDaoTao?.value();
            this.nganh?.value('Chưa có thông tin');
            this.khung?.value('Chưa có thông tin');

            T.showSearchBox(() => {
                this.listFaculty?.value('');
                this.listNganh?.value('');
                this.listKhungDaoTao?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);

            });
            this.showAdvanceSearch();
            this.props.getSdhDangKyHocPhanPage();
            this.setState({ filter: { ...this.state.filter, listDotDangKy: this.props.idDot } });
        });

    }


    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.sdhHocPhan && this.props.sdhHocPhan.pageHocVien ? this.props.sdhHocPhan.pageHocVien : { pageNumber: 1, pageSize: 50 };
        this.getStudentsPage(pageNumber, pageSize, pageCondition, page => page);
        const listFaculty = this.listFaculty.value()?.toString() || '';
        const listNganh = this.listNganh.value()?.toString() || '';
        const pageFilter = isInitial ? null : { listFaculty, listNganh };
        this.setState({ filter: pageFilter }, () => {
            this.getStudentsPage(pageNumber, pageSize, this.state.filter, (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.listFaculty?.value(filter.listFaculty || '');
                    this.listNganh?.value(filter.listNganh || '');
                    this.setState({ freeList: [] });
                }
                const rs = [];
                page.list.forEach(item => {
                    rs.push(item.mssv);
                });
                this.setState({ freeList: rs });

            });
        });
    }

    getHocPhanDangKyPage = (pageNumber, pageSize, done) => this.props.getSdhDangKyHocPhanPage(pageNumber, pageSize, this.state.filter, done);
    handleKeySearch = (data, pageNumber, pageSize) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getHocPhanDangKyPage(pageNumber, pageSize);
        });
    }

    getStudentsPage = (pageNumber, pageSize, condition, done) => this.props.getSvSdhDangKyHocPhanPage(pageNumber, pageSize, this.state.filter, done);

    handleSelected = (item, flag) => {
        let currSelected = this.state.selected;
        if (!item) {
            if (!flag) {
                $(':checkbox').prop('checked', false);
                currSelected = [];
                this.setState({ selected: currSelected });
            }
            else {
                $('.monselected').prop('checked', true);
                this.state.freeList.forEach(item => {
                    const index = currSelected.indexOf(item);
                    index == -1 && currSelected.push(item);
                });
                this.setState({ selected: currSelected });
            }
        }
        else {
            const id = item.mssv;
            const index = currSelected.indexOf(id);
            flag ? (index == -1 && currSelected.push(id)) : (index != -1 && currSelected.splice(index, 1));
            this.setState({ selected: currSelected });
            if (currSelected.length == this.state.freeList.length)
                $('#checkall').prop('checked', true);
            else
                $('#checkall').prop('checked', false);
        }
    }

    handleSelectedHp = (item, flag, list) => {
        let currSelected = this.state.selectedMon;
        if (!this.state.selectedMon[list.maHocPhan]) {
            this.state.selectedMon[list.maHocPhan] = [];
        }
        if (!item) {
            if (!flag) {
                $(':checkbox').prop('checked', false);
                currSelected[list.maHocPhan] = [];
                this.setState({ selectedMon: currSelected });
            }
            else {
                $(`.monselectedHp-${list.maHocPhan}`).prop('checked', true);
                list.data.forEach(item => {
                    const index = currSelected[list.maHocPhan].indexOf(item.mssv);
                    index == -1 && currSelected[list.maHocPhan].push(item.mssv);
                });
                this.setState({ selectedMon: currSelected });
            }
        }
        else {
            const id = item.mssv;
            const index = currSelected[list.maHocPhan].indexOf(id);
            flag ? (index == -1 && currSelected[list.maHocPhan].push(id)) : (index != -1 && currSelected[list.maHocPhan].splice(index, 1));
            this.setState({ selectedMon: currSelected });
            if (currSelected[list.maHocPhan].length == list.data.length) {
                $(`#selectallHp-${list.maHocPhan}`).prop('checked', true);
            }
            else {
                $(`#selectallHp-${list.maHocPhan}`).prop('checked', false);
            }
        }
    }

    functionGan(e, item) {
        e.preventDefault();
        if (this.state.dotDangKy) {
            const mul = { mon: this.props.sdhHocPhan.subjectddk, dot: this.state.dotDangKy };
            this.hocPhanModal.show([item.mssv, ...this.state.selected], mul);
        }
        else {
            T.notify('Chọn đợt đăng ký trước khi gán', 'warning');
        }
    }
    handleDelete(e, item, list) {
        let danhSachHocVien = [item.mssv, ...this.state.selectedMon[list.maHocPhan]];
        danhSachHocVien = [...new Set(danhSachHocVien)];
        const changes = { idDotDangKy: this.props.idDot, maHocPhan: list.maHocPhan, mssv: danhSachHocVien };
        T.confirm('Xoá học viên', 'Bạn có chắc chắn muốn sinh viên trong học phần ?', true, isConfirm =>
            isConfirm && this.props.deleteSdhDangKyHocPhanMultiple(changes, () => {
                let rs = this.state.selectedMon;
                rs[list.maHocPhan] = [];
                this.setState({ selectedMon: rs });
            }));
    }
    chooseHocPhan(e, item, pageNumber, pageSize) {
        e.preventDefault();
        $('.collapse').collapse('hide');
        let currentFilter = Object.assign({}, this.state.filter);
        const filter = { ...currentFilter, maHocPhan: item.toString(), dotDangKy: this.state.dotDangKy.toString() };
        this.props.getSvSdhDangKyHocPhanPage(pageNumber, pageSize, filter, () => {
            this.setState({ filter });
        });

    }

    renderTable = (list) => {
        const permission = this.getUserPermission('sdhDangKyHocPhan', ['write', 'delete', 'manage']);
        return renderTable({
            getDataSource: () => list ? list : [],
            stickyHead: true,
            header: 'thead-light',
            emptyTable: 'Danh sách học viên đã được sắp xếp',
            renderHead: () => (
                <>
                    <tr>
                        <th style={{ width: 'auto', verticalAlign: 'middle', alignItems: 'center', whiteSpace: 'nowrap' }}><input className='selectall' id='checkall' type='checkbox' onChange={e => this.handleSelected(null, e.target.checked)} /> </th>
                        <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>#</th>
                        <th style={{ width: 'auto', verticalAlign: 'left', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã sinh viên</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'left' }}>Họ và chữ lót</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'left' }}>Tên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Khoa</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Năm tuyển sinh</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle', alignItems: 'center', whiteSpace: 'nowrap' }}>Gán </th>
                    </tr>
                </>),
            multipleTbody: true,
            renderRow: (item, index) => {
                return (
                    <tbody key={index} style={{ backgroundColor: 'white' }}>
                        <tr>
                            <TableCell type='buttons' style={{ justifyContent: 'space-between', alignItems: 'center' }} content=''>
                                <input className='monselected' id={`${item.mssv}`} type='checkbox' onChange={e => this.handleSelected(item, e.target.checked, list)} />
                            </TableCell>
                            <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={index + 1} />
                            <TableCell type='text' style={{ fontWeight: '400', textAlign: 'center', whiteSpace: 'nowrap' }} content={item.mssv} />
                            <TableCell type='text' style={{ textAlign: 'center', fontWeight: '400', whiteSpace: 'nowrap' }} content={item.ho} />
                            <TableCell type='text' style={{ textAlign: 'center', fontWeight: '400', whiteSpace: 'nowrap' }} content={item.ten} />
                            <TableCell type='text' style={{ textAlign: 'center', fontWeight: '400', whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                            <TableCell type='text' style={{ textAlign: 'center', fontWeight: '400', whiteSpace: 'nowrap' }} content={item.namTuyenSinh} />
                            <TableCell type='buttons' style={{ justifyContent: 'space-between', alignItems: 'center' }} content='' permission={permission.write}>
                                <a href='#' onClick={(e) => this.functionGan(e, item)}> <i className='fa fa-arrow-right' style={{ marginLeft: '50%' }} /></a>
                            </TableCell>
                        </tr></tbody>
                );
            },
        });


    };

    renderTable2(list) {
        const permission = this.getUserPermission('sdhDangKyHocPhan', ['write', 'delete', 'manage']);
        const className = this.state.quickAction ? 'table-fix-col' : '';
        const style = { overflow: 'auto', height: 'fit-content' };
        const renderHead = () => (
            <tr >
                <th style={{ width: 'auto', verticalAlign: 'middle', alignItems: 'center', whiteSpace: 'nowrap' }}><input className={`selectallHp-${list.maHocPhan}`} id={`selectallHp-${list.maHocPhan}`} type='checkbox' onChange={e => this.handleSelectedHp(null, e.target.checked, list)} /> </th>
                <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Mã học viên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giờ học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số tiết</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giảng viên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Môn</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>

            </tr>);
        const temp = list && Object.values(list.data.reduce((acc, curr) => {
            acc[curr.mssv] = acc[curr.mssv] || { mssv: curr.mssv, data: [] };
            acc[curr.mssv].data.push(curr);
            return acc;
        }, {}));

        const tbodies = temp.map((state, index) => {
            const data = state.data;
            const hocPhanRows = data.map((ele, i) => {
                if (ele.mssv) {
                    const select = i === 0 ? <TableCell rowSpan={data.length + 1} type='buttons' style={{ justifyContent: 'space-between', alignItems: 'center' }} content=''>
                        <input className={`monselectedHp-${list.maHocPhan}`} id={`${ele.mssv}`} type='checkbox' onChange={e => this.handleSelectedHp(ele, e.target.checked, list)} />
                    </TableCell> : null;
                    const tenHocVien = i === 0 ? <TableCell rowSpan={data.length + 1} content={ele.hoSinhVien + ' ' + ele.tenSinhVien} /> : null;
                    const maHocVien = i === 0 ? <TableCell rowSpan={data.length + 1} content={ele.mssv} /> : null;
                    const button = i === 0 ? <TableCell rowSpan={data.length + 1} type='button' style={{ textAlign: 'center' }} content={
                        <Tooltip title={'Huỷ môn học'} arrow placeholder='bottom'>
                            <a className='btn btn-danger' href='#' onClick={(e) => this.handleDelete(e, ele, list)}><i className='fa fa-minus' /></a>
                        </Tooltip>
                    } permission={permission.delete} /> : null;
                    return (
                        <tr key={i} style={{ backgroundColor: 'white' }}>
                            {select}
                            {maHocVien}
                            {tenHocVien}
                            <TableCell content={<>
                                <p style={{ margin: 0, padding: 0 }}>
                                    Thứ: {ele.thu}
                                </p><p style={{ margin: 0, padding: 0 }}>
                                    Từ: {ele.tietBatDau}
                                </p>
                            </>} style={{ color: 'red', minWidth: '120px' }} />
                            <TableCell content={ele.isThucHanh == 1 ? ele.tinChiLyThuyet : ele.tinChiThucHanh} />
                            <TableCell content={ele.giangVien} />
                            <TableCell style={{
                                position: 'unset',
                                right: 'auto',
                                zIndex: 0,
                            }} content={ele.isThucHanh == 1 ? 'Thực hành' : 'Lý thuyết'} />
                            {button}
                        </tr>
                    );
                } else {
                    return null;
                }
            });
            return (
                <tbody key={index} className={state.name}>
                    {hocPhanRows}
                </tbody>
            );
        });
        return (
            temp && temp.length > 0 ? <>
                <table className={'table table-hover table-bordered table-responsive ' + className} style={{ margin: 0, ...style }}>
                    <thead className='thead-light'>{renderHead()}</thead>
                    {tbodies}
                </table>
            </> : <p style={{ margin: '0', padding: '0', fontWeight: '700' }}>
                Chưa có dữ liệu !
            </p>);
    }

    renderDssvDotDangKy = (value, pageNumber, pageSize) => {
        try {
            this.getValue(this.props.idDot);
            this.props.sdhDanhSachHocPhanDotDangKy(value);
            const filter = { dotDangKy: value.toString() };
            this.props.getSvSdhDangKyHocPhanPage(pageNumber, pageSize, filter, () => {
                this.setState({ filter });
            });
        } catch (selector) {
            selector && selector.focus();
            T.notify('<b>' + (selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }

    }

    renderDsHocPhanDotDangKy = (pageNumber, pageSize) => {
        const filter = this.state.filter;
        this.props.sdhDanhSachHocPhanDotDangKy(filter);
        this.props.getSvSdhDangKyHocPhanPage(pageNumber, pageSize, filter, () => {
            this.setState({ filter, isRender: true });
        });
    }
    getValue = (selector, type = null) => {
        const data = selector.value();
        if (data || data === 0) {
            if (type && type === 'date') return data.getTime();
            else if (type && type === 'number') return Number(data);
            return selector;
        }
        else throw selector;
    }

    sinhVienFilter = () => {
        if (!this.props.idDot) {
            T.notify('Đợt bị trống!', 'danger');
            this.props.listDotDangKy.focus();
        } else {
            this.setState({ isSvLoading: true, filter: { ...this.state.filter, listDotDangKy: this.props.idDot } });
            this.props.getStudentsFilter({ ...this.state.filter, listDotDangKy: this.props.idDot }, (value) => {
                this.setState({ listSinhVienChon: value, isShowStud: true, isSvLoading: false }, () => {
                    this.checkSVAll.value(false);
                });
            });
        }
    };
    hocPhanFilter = () => {
        if (!this.props.idDot) {
            T.notify('Đợt bị trống!', 'danger');
            this.listDotDangKy.focus();
        } else {
            this.setState({ isHpLoading: true, filterhp: { ...this.state.filterhp, listDotDangKy: this.props.idDot } });
            this.props.getHocPhan({ ...this.state.filterhp, listDotDangKy: this.props.idDot }, (value) => {
                this.setState({ listHocPhanChon: value, isShowSubj: true, isHpLoading: false }, () => {
                    this.checkHPAll.value(false);
                });
            });
        }
    };

    renderSinhVienComponent = (listSinhVienChon) => {
        return (
            <div className='row justify-content border rounded'>
                <div className='col-md-12'>
                    <div className='row'>
                        <h6 className='col-md-11 tile-title'>Danh sách sinh viên</h6>
                        <div className='col-md-1 tile-title-w-btn' style={{ display: 'flex', justifyContent: 'center', padding: '0' }}>
                            <button className='btn btn-success btn-group' onClick={(e) => {
                                e.preventDefault() || this.sinhVienFilter();
                            }} >
                                <i className='fa fa-lg fa-search' />
                            </button>
                        </div>
                    </div>
                </div>
                <FormSelect ref={(e) => (this.loaiHinhDaoTao = e)} className='col-md-3' label='Loại hình đào tạo' data={SelectAdapter_DmHocSdh} required
                    onChange={(value) =>
                        this.setState({
                            filter: { ...this.state.filter, listDotDangKy: this.props.idDot, loaiHinhDaoTao: value?.id || '' },
                        }, () => this.lopSV.value(''))
                    }
                />
                <FormSelect ref={(e) => (this.khoaDaoTao = e)} className='col-md-3' label='Khoa' data={SelectAdapter_DmKhoaSdh} required
                    onChange={(value) =>
                        this.setState({
                            filter: { ...this.state.filter, listDotDangKy: this.props.idDot, khoaDaoTao: value?.id || '' },
                        }, () => this.lopSV.value(''))
                    }
                />
                <FormSelect ref={(e) => (this.khoaSinhVien = e)} className='col-md-3' label='Khoá sinh viên' data={SelectAdapter_SdhKhoaHocVien}
                    onChange={(value) =>
                        this.setState({
                            filter: { ...this.state.filter, listDotDangKy: this.props.idDot, khoaSinhVien: value?.id || '' },
                        }, () => this.lopSV.value(''))
                    } allowClear
                />
                <FormSelect ref={(e) => (this.lopSV = e)} className='col-md-3' label='Lớp' data={SelectAdapter_SdhLopHocVienFilter({
                    khoaSinhVien: this.state.filter?.khoaSinhVien,
                    heDaoTao: this.state.filter?.loaiHinhDaoTao,
                    khoa: this.state.filter?.khoaDaoTao
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
                            Đã chọn {this.listSinhVien && this.listSinhVien.length} sinh viên
                            <sub style={{ cursor: 'pointer', color: '#1488db' }} onClick={() => this.listSvChon()}>(Chi tiết)</sub>
                        </h6>
                    </div>
                    <div className='col-md-12'>
                        {this.state.isSvLoading ? loadSpinner() : this.renderListSinhVien(listSinhVienChon)}
                    </div>
                </> : <div />}
            </div>
        );
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
                    const list = { listMSSV, itemHocPhan, idDotDangKy: this.props.idDot };

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

    handleKeySearchSV = (data) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.props.getStudentsFilter(this.state.filter, (value) => {
                this.setState({ listSinhVienChon: value, isSvLoading: false }, () => {
                    this.checkSVAll.value(false);
                });
            });
        });
    }

    renderListSinhVien = (list) => renderDataTable({
        data: list,
        emptyTable: 'Không tìm thấy sinh viên!',
        header: 'thead-light',
        stickyHead: list && list.length > 12 ? true : false,
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <FormCheckbox ref={e => this.checkSVAll = e}
                        onChange={value => {
                            list.map(item => item.isChon = value);
                            list.forEach(item => this.countSinhVien(item));
                            this.setState({ listSinhVienChon: list });
                        }}
                    />
                </th>
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='MSSV' keyCol='mssv'
                    onKeySearch={this.handleKeySearchSV}
                />
                <TableHead style={{ width: '70%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Họ và tên' keyCol='hoTen'
                    onKeySearch={this.handleKeySearchSV}
                />
                <TableHead style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Lớp' keyCol='lop'
                    onKeySearch={this.handleKeySearchSV}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='TTSV' keyCol='tenTinhTrang'
                    onKeySearch={this.handleKeySearchSV}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Học phí' keyCol='hocPhi'
                    onKeySearch={this.handleKeySearchSV} typeSearch='select' data={this.hocPhi}
                />
            </tr>
        ),
        renderRow: (item, index) => {
            return (
                <tr key={index} style={{ backgroundColor: this.backgroundColor(item), cursor: 'pointer' }} onClick={() => this.chonSinhVien(item, list)}>
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

    listHpChon = () => {
        this.listHpChonModal.show(this.listHocPhan);
    }

    listSvChon = () => {
        this.listSvChonModal.show(this.listSinhVien);
    }

    renderHocPhanComponent = (listHocPhanChon) => {
        return (
            <div className='row justify-content border rounded'>
                <div className='col-md-12'>
                    <div className='row'>
                        <h6 className='col-md-11 tile-title'>Danh sách học phần</h6>
                        <div className='col-md-1 tile-title-w-btn' style={{ display: 'flex', justifyContent: 'center', padding: '0' }}>
                            <button className='btn btn-success btn-group' onClick={(e) => {
                                e.preventDefault() || this.hocPhanFilter();
                            }} >
                                <i className='fa fa-lg fa-search' />
                            </button>
                        </div>
                    </div>
                </div>
                <FormSelect ref={(e) => (this.loaiHinhDaoTaoHp = e)} className='col-md-3' label='Loại hình đào tạo' data={SelectAdapter_DmHocSdh} required
                    onChange={(value) =>
                        this.setState({
                            filterhp: { ...this.state.filterhp, listDotDangKy: this.props.idDot, loaiHinhDaoTao: value?.id || '' },
                        }, () => this.lopSVHp.value(''))
                    }
                />
                <FormSelect ref={(e) => (this.khoaDaoTaoHp = e)} className='col-md-3' label='Khoa' data={SelectAdapter_DmKhoaSdh} required
                    onChange={(value) =>
                        this.setState({
                            filterhp: { ...this.state.filterhp, listDotDangKy: this.props.idDot, khoaDaoTao: value?.id || '' },
                        }, () => this.lopSVHp.value(''))
                    }
                />
                <FormSelect ref={(e) => (this.khoaSinhVienHp = e)} className='col-md-3' label='Khoá sinh viên' data={SelectAdapter_SdhKhoaHocVien}
                    onChange={(value) =>
                        this.setState({
                            filterhp: { ...this.state.filterhp, listDotDangKy: this.props.idDot, khoaSinhVien: value?.id || '' },
                        }, () => this.lopSVHp.value(''))
                    } allowClear
                />
                <FormSelect ref={(e) => (this.lopSVHp = e)} className='col-md-3' label='Lớp' data={SelectAdapter_SdhLopHocVienFilter({
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
                </> : <div />}
            </div>
        );
    }
    backgroundColor = (item) => {
        if (item.isChon == true) {
            return '#cfe2ff';
        } else if (item.tinhTrang == 4 || item.tinhPhi == 0) {
            return '#FAF884';
        }
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
    renderListHocPhan = (list) => renderDataTable({
        data: list == null ? null : Object.keys(list.groupBy('maHocPhan')),
        emptyTable: 'Không tìm thấy học phần!',
        header: 'thead-light',
        stickyHead: list.length > 12 ? true : false,
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
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
                <TableHead style={{ width: '30%' }} content='Mã học phần' keyCol='maHocPhan'
                    onKeySearch={this.handleKeySearchHP}
                />
                <TableHead style={{ width: '50%' }} content='Tên môn' keyCol='tenMonHoc'
                    onKeySearch={this.handleKeySearchHP}
                />
                <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Lớp</th>
                <th style={{ width: 'auto' }}>TC</th>
                <th style={{ width: 'auto' }}>Tổng tiết</th>
                <th style={{ width: 'auto' }}>Phòng</th>
                <th style={{ width: 'auto' }}>Thứ</th>
                <th style={{ width: 'auto' }}>Tiết</th>
                <th style={{ width: 'auto' }}>Giảng viên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trợ giảng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày bắt đầu</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày kết thúc</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Sĩ số</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TTHP</th>
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
                                <TableCell style={{ textAlign: 'right' }} content={(index + 1)} rowSpan={rowSpan} />
                                <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={hocPhan.isChon} permission={{ write: true }}
                                    onChanged={() => this.chonHocPhan(hocPhan, list)} rowSpan={rowSpan}
                                />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.maHocPhan} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.maLop} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tongTinChi} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tongTiet} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.thu} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tietBatDau ? `${hocPhan.tietBatDau} - ${hocPhan.tietBatDau + hocPhan.soTietBuoi - 1}` : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.giangVien && hocPhan.giangVien.length ? hocPhan.giangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.troGiang && hocPhan.troGiang.length ? hocPhan.troGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayBatDau} rowSpan={rowSpan} />
                                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hocPhan.ngayKetThuc} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={(hocPhan.siSo ? hocPhan.siSo : '0') + '/' + (hocPhan.soLuongDuKien ? hocPhan.soLuongDuKien : '0')} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.tenTinhTrang} rowSpan={rowSpan} />
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

        return (<>
            <div className='tile'>
                <div className='tile-body'>
                    <div className='row'>
                        <div className={this.state.thaoTacTrang == 'ngang' ? 'col-md-6' : 'col-md-12'}>
                            {this.renderSinhVienComponent(listSinhVienChon)}
                        </div>
                        <div className={this.state.thaoTacTrang == 'ngang' ? 'col-md-6' : 'col-md-12'}
                        >
                            {this.renderHocPhanComponent(listHocPhanChon)}
                        </div>
                    </div>
                </div>
                {this.state.isShowStud && this.state.isShowSubj ?
                    <div className='tile-footer'>
                        <div style={{ display: 'flex', justifyContent: 'end' }} >
                            <button className='btn btn-success' onClick={(e) => e.preventDefault() || this.dangKyHocPhan()}>
                                <i className='fa fa-fw fa-lg fa-handshake-o' /> Đăng ký
                            </button>
                        </div>
                    </div>
                    : <div />
                }
            </div>

            <ListSinhVienChonModal ref={(e) => (this.listSvChonModal = e)} xoaSinhVien={this.chonSinhVien} listSinhVienChon={listSinhVienChon} />
            <ListHocPhanModal ref={(e) => (this.listHpChonModal = e)} xoaHocPhan={this.chonHocPhan} listHocPhanChon={listHocPhanChon} />
            <ConfirmDangKy ref={(e) => (this.modal = e)} create={this.props.createSdhDangKyHocPhanAdvance} hocPhanFilter={this.hocPhanFilter} filterhp={filterhp} luuThanhCong={this.luuThanhCong} idDot={this.props.idDot} />
        </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, sdhHocPhan: state.sdh.sdhDangKyHocPhan, sdhThoiKhoaBieu: state.sdh.sdhThoiKhoaBieu });
const mapActionsToProps = { getSdhDangKyHocPhanPage, getSvSdhPage, getSdhThoiKhoaBieuPage, sdhDanhSachHocPhanDotDangKy, createSdhDangKyHocPhanMultiple, deleteSdhDangKyHocPhanMultiple, getSvSdhDangKyHocPhanPage, getSdhDotDangKyAdmin, getStudentsFilter, getHocPhan, checkCondition, createSdhDangKyHocPhanAdvance };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(FormDangKyTrucTiepSdh);

