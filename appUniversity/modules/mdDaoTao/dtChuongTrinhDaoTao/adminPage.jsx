import React from 'react';
import { connect } from 'react-redux';
import { getDtChuongTrinhDaoTaoAll, getDtChuongTrinhDaoTaoPage, getDtChuongTrinhDaoTao, SelectAdapter_KhungDaoTaoCtsv, deleteDtChuongTrinhDaoTao } from './redux';
import { getDmDonViAll, SelectAdapter_DtDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormSelect, getValue, renderDataTable, TableHead, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DtCauTrucKhungDaoTao } from '../dtCauTrucKhungDaoTao/redux';
import { Tooltip } from '@mui/material';
import { SelectAdapter_LoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtKhoaDaoTaoFilter } from '../dtKhoaDaoTao/redux';

class TreeModal extends AdminModal {
    state = { chuongTrinhDaoTaoCha: {}, chuongTrinhDaoTaoCon: {}, monHoc: [], isFullMode: false, mucConSwitch: {}, hocKySwitch: {} }
    hocKyDuKien = [1, 2, 3, 4, 5, 6, 7, 8];
    onShow = (item) => {
        const { tenNganh, tenChuyenNganh, maKhung, khoaSinhVien } = item;
        this.khoaSinhVien = khoaSinhVien;
        this.tenNganh = tenNganh;
        this.tenChuyenNganh = tenChuyenNganh;
        this.props.getDtChuongTrinhDaoTao(maKhung, (ctdt) => {
            SelectAdapter_DtCauTrucKhungDaoTao.fetchOne(maKhung, (rs) => {
                const { data } = rs;
                const mucCha = T.parse(data.mucCha, { mucTieuDaoTao: {}, chuongTrinhDaoTao: {} });
                const mucCon = T.parse(data.mucCon, { mucTieuDaoTao: {}, chuongTrinhDaoTao: {} });
                const { chuongTrinhDaoTao: chuongTrinhDaoTaoCha } = mucCha;
                const { chuongTrinhDaoTao: chuongTrinhDaoTaoCon } = mucCon;

                const mucConSwitch = {};
                Object.values(chuongTrinhDaoTaoCha).forEach(value => {
                    const { id } = value;
                    mucConSwitch[id] = false;
                });

                const hocKySwitch = {};
                this.hocKyDuKien.map(index => {
                    hocKySwitch[index] = false;
                });
                this.setState({ monHoc: ctdt, chuongTrinhDaoTaoCha: chuongTrinhDaoTaoCha, chuongTrinhDaoTaoCon: chuongTrinhDaoTaoCon, mucConSwitch: mucConSwitch, hocKySwitch: hocKySwitch });
            });
        });
    };

    showAllMucCon = (flag = false) => {
        const mucConSwitchState = { ...this.state.mucConSwitch };
        Object.keys(mucConSwitchState).forEach(key => {
            mucConSwitchState[key] = flag;
        });
        this.setState({ mucConSwitch: mucConSwitchState });
    }

    onChangeMucConSwitch = (id) => {
        const mucConSwitchState = { ...this.state.mucConSwitch };
        mucConSwitchState[id] = !mucConSwitchState[id];
        this.setState({ mucConSwitch: mucConSwitchState });
    }

    onChangeHocKySwitch = (index) => {
        const hocKySwitchState = { ...this.state.hocKySwitch };
        hocKySwitchState[index] = !hocKySwitchState[index];
        this.setState({ hocKySwitch: hocKySwitchState });
    }

    initLevelMonHoc = (tenMonHoc, hasLevel3 = true) => {
        return (
            <li>
                <p className={`${hasLevel3 ? 'level-4' : 'level-4-no-level-3'} rectangle`}>{tenMonHoc}</p>
            </li>
        );
    }

    initLevelMucCon = (text, idCha, idCon) => {
        const { monHoc } = this.state;
        const monHocByKey = monHoc.filter(mh => {
            return mh.maKhoiKienThucCon >= 0
                ? parseInt(mh.maKhoiKienThuc) === parseInt(idCha) && parseInt(mh.maKhoiKienThucCon) === parseInt(idCon)
                : parseInt(mh.maKhoiKienThuc) === parseInt(idCha);
        }) || [];
        return (
            <li>
                <p className={`${monHocByKey.length > 0 ? 'level-3' : 'level-3-no-level-4'} rectangle`}>{text}</p>
                <ol className={`${monHocByKey.length > 0 ? 'level-4-wrapper' : 'level-4-wrapper-no-child'}`}>
                    {monHocByKey.map((monHoc, idx) => {
                        const { tenMonHoc } = monHoc;
                        return (<React.Fragment key={idx}>
                            {this.initLevelMonHoc(tenMonHoc)}
                        </React.Fragment>);
                    })
                    }
                </ol>
            </li>
        );
    }

    initLevelMucCha = (ctdt, idCha, mucCon = {}) => {
        const { mucConSwitch } = this.state;
        const mucConLength = Object.keys(mucCon).length;
        const { monHoc } = this.state;
        const styleLevel3Wrapper = {
            gridTemplateColumns: `repeat(${mucConLength}, 1fr)`,
            '--level-3-wrapper-left': `${(100 - 2 * (mucConLength - 1)) / (mucConLength * 2)}%`,
            '--level-3-wrapper-width': `${100 - ((100 - 2 * (mucConLength - 1)) / mucConLength)}%`,
        };
        let monHocByKey = [];
        if (mucConLength <= 0) {
            monHocByKey = monHoc.filter(mh => {
                return parseInt(mh.maKhoiKienThuc) === parseInt(idCha);
            }) || [];
        }

        return (
            <li>
                <p style={{ cursor: 'pointer' }} className={`${mucConSwitch[idCha] && mucConLength > 0 ? 'level-2' : 'level-2-no-level-3'} rectangle`} onClick={() => this.onChangeMucConSwitch(idCha)}>{ctdt}</p>
                {mucConSwitch[idCha] &&
                    (mucConLength > 0 ?
                        (<ol className="level-3-wrapper" style={styleLevel3Wrapper}>
                            {
                                mucCon && Object.keys(mucCon).map((key, idx) => {
                                    const { value: { text }, id: idCon } = mucCon[key];
                                    return (<React.Fragment key={idx}>
                                        {this.initLevelMucCon(text, idCha, idCon)}
                                    </React.Fragment>
                                    );
                                })
                            }

                        </ol>) : (
                            <ol className={`${monHocByKey.length > 0 ? 'level-4-wrapper-no-level-3' : null}`}>
                                {monHocByKey.map((monHoc, idx) => {
                                    const { tenMonHoc } = monHoc;
                                    return (<React.Fragment key={idx}>
                                        {this.initLevelMonHoc(tenMonHoc, false)}
                                    </React.Fragment>);
                                })
                                }
                            </ol>
                        ))
                }

            </li>
        );
    }


    initLevel2 = (itemCha, key, hasNextRow = false) => {
        const { chuongTrinhDaoTaoCon } = this.state;
        const mucChaLength = Object.keys(itemCha).length;
        const left = (parseInt(key) - 1) > 0 ? 0 : (100 - 1 * (mucChaLength - 1)) / (2 * mucChaLength);
        const width = !hasNextRow ? (parseInt(key) - 1) > 0 ? 100 - 100 / (mucChaLength * 2) + (mucChaLength - 1) / (2 * mucChaLength) : 100 - ((100 - 1 * (mucChaLength - 1)) / mucChaLength) : 100 - left;
        const styleLevel2Wrapper = {
            gridTemplateColumns: `repeat(${mucChaLength}, 1fr)`,
            '--level-2-wrapper-left': `${left}%`,
            '--level-2-wrapper-width': `${width}%`,
            marginTop: `${(parseInt(key) - 1) === 0 ? 0 : 50}px`,
        };
        return (
            <ol className="level-2-wrapper" style={styleLevel2Wrapper} key={key}>
                {itemCha && Object.keys(itemCha).map((key, idx) => {
                    const { text: ctdt, id } = itemCha[key];
                    const mucCon = chuongTrinhDaoTaoCon[key];
                    return (<React.Fragment key={idx}>
                        {this.initLevelMucCha(ctdt, id, mucCon)}
                    </React.Fragment>
                    );
                })
                }
            </ol>
        );
    }

    initChuongTrinhDaoTao = () => {
        const { chuongTrinhDaoTaoCha } = this.state;
        let item = {};
        let row = 0;
        return (
            chuongTrinhDaoTaoCha && Object.keys(chuongTrinhDaoTaoCha).map((key, idx) => {
                item[key] = chuongTrinhDaoTaoCha[key];
                const isLast = idx === Object.keys(chuongTrinhDaoTaoCha).length - 1;
                if (Object.keys(item).length >= 3 || (Object.keys(item).length > 0 && isLast)) {
                    const temp = { ...item };
                    item = {};
                    row++;
                    return (this.initLevel2(temp, row, !isLast));
                }
            })
        );
    }

    initLevel2HocKy = (itemCha, key, hasNextRow = false) => {
        const { hocKySwitch } = this.state;
        const mucChaLength = Object.keys(itemCha).length;
        const left = (parseInt(key) - 1) > 0 ? 0 : (100 - 1 * (mucChaLength - 1)) / (2 * mucChaLength);
        const width = !hasNextRow ? (parseInt(key) - 1) > 0 ? 100 - 100 / (mucChaLength * 2) + (mucChaLength - 1) / (2 * mucChaLength) : 100 - ((100 - 1 * (mucChaLength - 1)) / mucChaLength) : 100 - left;
        const styleLevel2Wrapper = {
            gridTemplateColumns: `repeat(${mucChaLength}, 1fr)`,
            '--level-2-wrapper-left': `${left}%`,
            '--level-2-wrapper-width': `${width}%`,
            marginTop: `${(parseInt(key) - 1) === 0 ? 0 : 50}px`,
        };
        const { monHoc } = this.state;
        return (
            <ol className="level-2-wrapper" style={styleLevel2Wrapper} key={key}>
                {itemCha && Object.keys(itemCha).map((key) => {
                    const { text: ctdt, id } = itemCha[key];
                    const monHocByKey = monHoc.filter(mh => {
                        return parseInt(mh.hocKyDuKien) === parseInt(id);
                    }) || [];
                    return (<React.Fragment key={id}>
                        <li>
                            <p style={{ cursor: 'pointer' }} className='level-2-no-level-3 rectangle' onClick={() => this.onChangeHocKySwitch(id)}>{ctdt}</p>
                            {hocKySwitch[id] && (<ol className={`${monHocByKey.length > 0 ? 'level-4-wrapper-no-level-3' : null}`}>
                                {monHocByKey.map((monHoc, idx) => {
                                    const { tenMonHoc } = monHoc;
                                    return (<React.Fragment key={idx}>
                                        {this.initLevelMonHoc(tenMonHoc, false)}
                                    </React.Fragment>);
                                })
                                }
                            </ol>)
                            }
                        </li>
                    </React.Fragment>
                    );
                })
                }
            </ol>
        );
    }

    initHocKyDuKien = () => {
        let item = {};
        let row = 0;
        // const { monHoc } = this.state;

        return (
            this.hocKyDuKien.map((hk, idx) => {
                item[hk] = { text: `Học kỳ ${hk}`, id: hk };
                const isLast = idx === Object.keys(this.hocKyDuKien).length - 1;
                if (Object.keys(item).length >= 3 || (Object.keys(item).length > 0 && isLast)) {
                    const temp = { ...item };
                    item = {};
                    row++;
                    return (this.initLevel2HocKy(temp, row, !isLast));
                }
            })
        );
    }


    render = () => {
        // const readOnly = this.props.readOnly;
        // const isDaoTao = this.props.permission.write;
        return this.renderModal({
            title: `Chương trình năm học - ${this.khoaSinhVien}`,
            size: 'elarge',
            buttons:
                <div style={{ textAlign: 'center' }} className='toggle'>
                    <label style={{ marginRight: 10 }}>Xem đầy đủ</label>
                    <label>
                        <input type='checkbox' checked={this.state.isFullMode} onChange={() => {
                            this.setState({ isFullMode: !this.state.isFullMode }, () => {
                                this.showAllMucCon(this.state.isFullMode);
                            });
                        }} />
                        <span className='button-indecator' />
                    </label>
                </div>,
            body: <div className='row'>
                <div className="container organization-tree">
                    <p className="level-1 rectangle">{this.tenChuyenNganh ?? (this.tenNganh ? T.parse(this.tenNganh)?.vi : '')}</p>
                    {this.initChuongTrinhDaoTao()}
                </div>
            </div>

        });
    }
}

class CloneModal extends AdminModal {

    onShow = (item, filter) => {
        this.setState({ id: item.id, khoaSinhVien: item.khoaSinhVien, ...filter }, () => {
            this.cloneFrom.value('');
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const id = this.state.id;
        const cloneId = getValue(this.cloneFrom);
        this.props.history.push(`/user/dao-tao/chuong-trinh-dao-tao/${id}?clone-from=${cloneId}`);
    };

    render = () => {
        return this.renderModal({
            title: 'Sao chép dữ liệu chương trình đào tạo',
            submitText: 'Xác nhận',
            body: <div>
                {/* <FormSelect ref={e => this.khoaSinhVien = e} label='Khóa đào tạo' data={Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i)} required /> */}
                <FormSelect ref={e => this.cloneFrom = e} label='Chọn chương trình đào tạo nguồn' data={SelectAdapter_KhungDaoTaoCtsv(this.state.donViFilter, this.state.heDaoTaoFilter)} required />

            </div>
        });
    }
}
class DtChuongTrinhDaoTaoPage extends AdminPage {
    state = { donViFilter: '', idNamDaoTao: '', heDaoTaoFilter: '', filter: {} }
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.clearSearchBox();
            let permission = this.getUserPermission('dtChuongTrinhDaoTao'),
                user = this.props.system.user,
                donViFilter = user.staff?.maDonVi;
            if (!permission.manage) donViFilter = user.staff?.maDonVi;
            else donViFilter = '';

            this.setState({ donViFilter, idNamDaoTao: '', heDaoTaoFilter: '' });
            this.showAdvanceSearch();
            this.initData();
        });
    }

    initData = () => {
        this.setState({ filter: {} }, () => {
            this.props.getDtChuongTrinhDaoTaoPage(undefined, undefined, { searchTerm: '' }, this.state.filter);
            this.props.getDtChuongTrinhDaoTaoAll({ maKhoa: null, loaiHinhDaoTao: null, khoaSinhVien: null }, listItems => {
                this.setState({ listNotEmpty: listItems });
            });
        });
    }

    delete = (item) => {
        T.confirm('Xóa chương trình đào tạo', 'Bạn có chắc bạn muốn xóa chương trình đào tạo này?', true, isConfirm => {
            if (isConfirm) {
                this.props.deleteDtChuongTrinhDaoTao(item.id, () => {
                    this.props.getDtChuongTrinhDaoTaoPage(undefined, undefined, {
                        searchTerm: '',
                    }, {
                        donViFilter: this.state.filter.donViFilter,
                        heDaoTaoFilter: this.state.filter.heDaoTaoFilter,
                        khoaSinhVien: this.state.filter.khoaSinhVien
                    });
                });
            }
        });
    }

    clone = (item) => {
        this.cloneModal.show(item, this.state.filter);
    }

    getPage = (pageN, pageS, pageC) => {
        this.props.getDtChuongTrinhDaoTaoPage(pageN, pageS, pageC, this.state.filter);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    render() {
        const permissionDaoTao = this.getUserPermission('dtChuongTrinhDaoTao', ['read', 'write', 'delete', 'manage']);
        let { donViFilter, khoaSinhVien, heDaoTaoFilter } = this.state.filter;
        let permission = {
            write: permissionDaoTao.write || permissionDaoTao.manage,
            delete: permissionDaoTao.delete || permissionDaoTao.manage
        };
        // const permissionQuanLyDaoTao = this.getUserPermission('quanLyDaoTao', ['manager']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtChuongTrinhDaoTao && this.props.dtChuongTrinhDaoTao.page ?
            this.props.dtChuongTrinhDaoTao.page : {
                pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [], pageCondition: {
                    searchTerm: ''
                }
            };
        if (list.length && this.state.listNotEmpty) {
            for (let item of list) {
                item.isEmpty = true;
                if (this.state.listNotEmpty.includes(item.id)) {
                    item.isEmpty = false;
                }
            }
        }

        let table = renderDataTable({
            stickyHead: list && list.length > 10,
            data: list,
            divStyle: { height: '63vh' },
            className: 'table-fix-col',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'bottom' }}>#</th>
                    <TableHead style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'bottom' }} content='Mã CTĐT' keyCol='maCtdt' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'bottom' }} content={<div>Mã CN<br />Mã ngành</div>} keyCol='nganh' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '100%', whiteSpace: 'nowrap', verticalAlign: 'bottom' }} content={<div>Tên CN<br />Tên ngành</div>} keyCol='tenNganh' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ minWidth: '70px', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'bottom' }} content='Lớp' keyCol='maLop' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ minWidth: '70px', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: khoaSinhVien ? 'middle' : 'bottom' }} content='Khoá' keyCol='khoaSv' onKeySearch={khoaSinhVien ? null : this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }} content='Trình độ' />
                    <TableHead style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: heDaoTaoFilter ? 'middle' : 'bottom' }} content='Loại hình' keyCol='loaiHinh' onKeySearch={heDaoTaoFilter ? null : this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }} content='Đợt trúng tuyển' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }} content='Thời gian' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: donViFilter ? 'middle' : 'bottom' }} content='Khoa/Bộ môn' keyCol='khoa' onKeySearch={donViFilter ? null : this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }} content='Tình trạng' />
                    <TableHead style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }} content='Thao tác' />
                </tr>
            ),
            renderRow: (item, index) => {
                let { isEmpty, lop } = item;

                return <tr key={index} >
                    <TableCell style={{ textAlign: 'center' }} content={pageSize * (pageNumber - 1) + index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='link' content={item.maCtdt} onClick={e => e.preventDefault() || window.open(`/user/dao-tao/chuong-trinh-dao-tao/${item.id}`, '_blank')} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{item.chuyenNganh ?? item.maNganh}</>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{item.tenChuyenNganh ? <span className='text-primary'>{item.tenChuyenNganh} < br /> </span> : ''} {item.tenNganh.includes('{') ? T.parse(item.tenNganh)?.vi : item.tenNganh}</>} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.lop && item.lop.length ? item.lop.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                    <TableCell style={{ textAlign: 'center' }} content={item.khoaSinhVien} />
                    <TableCell style={{ textAlign: 'center' }} content={item.trinhDoDaoTao} />
                    <TableCell style={{ textAlign: 'center' }} content={item.heDaoTao} />
                    <TableCell style={{ textAlign: 'center' }} content={item.dotTrungTuyen || <div className='text-danger'> Không có đợt trúng tuyển </div>} />
                    <TableCell style={{ textAlign: 'center' }} content={item.thoiGianDaoTao + ' năm'} />
                    <TableCell content={item.tenKhoaBoMon} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<>
                        <div className='text-danger'> {isEmpty && 'Không có môn học'} </div>
                        <div className='text-danger'> {!lop && 'Không có lớp'} </div>
                        <div className='text-success'> {(!isEmpty && lop) && <i className='fa fa-lg fa-check-circle' />}</div>
                    </>} />
                    <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={permission}
                        onEdit={permission.write ? (e) => e.preventDefault() || window.open(`/user/dao-tao/chuong-trinh-dao-tao/${item.id}`, '_blank') : null}>
                        <Tooltip title='Xem cây chương trình' arrow placeholder='bottom' >
                            <a className='btn btn-info' href='#' onClick={e => e.preventDefault() || this.modal.show(item)}><i className='fa fa-lg fa-eye' /></a>
                        </Tooltip>
                        {permission.write && <Tooltip title='Sao chép' arrow>
                            <a className='btn btn-success' href='#' onClick={e => e.preventDefault() || this.clone(item)}>
                                <i className='fa fa-lg fa-clone ' />
                            </a>
                        </Tooltip>}
                        {permission.delete && <Tooltip title='Xoá' arrow>
                            <a className='btn btn-danger' href='#' onClick={e => e.preventDefault() || this.delete(item)}>
                                <i className='fa fa-lg fa-trash ' />
                            </a>
                        </Tooltip>}
                    </TableCell>
                </tr>;
            }
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Chương trình đào tạo',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Chương trình đào tạo'
            ],
            advanceSearchTitle: '',
            advanceSearch: permissionDaoTao.read && <div className='row'>
                <FormSelect className='col-md-4' label='Khoá sinh viên' placeholder='Khoá sinh viên' onChange={value => {
                    T.clearSearchBox();
                    this.setState({ filter: { ...this.state.filter, khoaSinhVien: value ? value.id : '' } }, () => {
                        value ? T.cookie('khoaSinhVien', value.id) : T.cookie('khoaSinhVien', '');
                    });
                    this.props.getDtChuongTrinhDaoTaoPage(undefined, undefined, {
                        searchTerm: '',
                    }, {
                        donViFilter: this.state.filter.donViFilter,
                        heDaoTaoFilter: this.state.filter.heDaoTaoFilter,
                        khoaSinhVien: value ? value.id : ''
                    });
                }} data={SelectAdapter_DtKhoaDaoTaoFilter('dtEduProgram')} allowClear={true} ref={e => this.khoaSinhVien = e} />
                <FormSelect className='col-md-4' label='Danh sách khoa/bộ môn' placeholder='Danh sách khoa/bộ môn' ref={e => this.donVi = e} onChange={value => {
                    T.clearSearchBox();
                    this.setState({ filter: { ...this.state.filter, donViFilter: value ? value.id : '' } }, () => {
                        value ? T.cookie('donViFilter', value.id) : T.cookie('donViFilter', '');
                    });
                    this.props.getDtChuongTrinhDaoTaoPage(undefined, undefined, {
                        searchTerm: '',
                    }, {
                        donViFilter: value ? value.id : '',
                        khoaSinhVien: this.state.filter.khoaSinhVien,
                        heDaoTaoFilter: this.state.filter.heDaoTaoFilter
                    });
                }} data={SelectAdapter_DtDmDonVi(1)} allowClear={true} />
                <FormSelect className='col-md-4' label='Loại hình đào tạo' placeholder='Loại hình đào tạo' ref={e => this.heDaoTao = e} onChange={value => {
                    T.clearSearchBox();
                    this.setState({ filter: { ...this.state.filter, heDaoTaoFilter: value ? value.id : '' } }, () => {
                        value ? T.cookie('heDaoTaoFilter', value.id) : T.cookie('heDaoTaoFilter', '');
                    });
                    this.props.getDtChuongTrinhDaoTaoPage(undefined, undefined, {
                        searchTerm: '',
                    }, {
                        donViFilter: this.state.filter.donViFilter,
                        khoaSinhVien: this.state.filter.khoaSinhVien,
                        heDaoTaoFilter: value ? value.id : '',
                    });
                }} data={SelectAdapter_LoaiHinhDaoTaoFilter('dtEduProgram')} allowClear={true} />
            </div>,
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <TreeModal ref={e => this.modal = e} permission={permissionDaoTao} readOnly={!permission.write} getDtChuongTrinhDaoTao={this.props.getDtChuongTrinhDaoTao} />
                <CloneModal ref={e => this.cloneModal = e} permission={permissionDaoTao} readOnly={!permission.write} history={this.props.history} />
            </>,
            backRoute: '/user/dao-tao/edu-program',
            onCreate: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/dao-tao/chuong-trinh-dao-tao/new') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtChuongTrinhDaoTao: state.daoTao.dtChuongTrinhDaoTao });
const mapActionsToProps = { getDtChuongTrinhDaoTaoAll, getDtChuongTrinhDaoTaoPage, getDtChuongTrinhDaoTao, deleteDtChuongTrinhDaoTao, getDmDonViAll };
export default connect(mapStateToProps, mapActionsToProps)(DtChuongTrinhDaoTaoPage);