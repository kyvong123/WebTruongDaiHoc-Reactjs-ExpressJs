import React from 'react';
import { connect } from 'react-redux';
import { getSdhChuongTrinhDaoTaoPage, getSdhChuongTrinhDaoTao, getSdhKhungDaoTao, updateKhungDaoTao } from './redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { AdminModal, AdminPage, FormSelect, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_SdhCauTrucKhungDaoTao } from '../sdhCauTrucKhungDaoTao/redux';
import { Tooltip } from '@mui/material';
import T from 'view/js/common';
import { Link } from 'react-router-dom';
import { SelectAdapter_DmKhoaSdh } from 'modules/mdSauDaiHoc/dmKhoaSauDaiHoc/redux';
import { SelectAdapter_DmHocSdh } from 'modules/mdSauDaiHoc/dmHocSdh/redux';
import { SelectAdapter_SdhKhoaHocVien } from '../sdhKhoaDaoTao/redux';

class TreeModal extends AdminModal {
    state = { chuongTrinhDaoTaoCha: {}, chuongTrinhDaoTaoCon: {}, monHoc: [], isFullMode: false, mucConSwitch: {}, hocKySwitch: {} }
    hocKyDuKien = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    onShow = (item) => {
        const { maKhung, tenNganh, id, khoaHocVien, tenNganhTuyenSinh } = item;
        this.khoaHocVien = khoaHocVien;
        this.tenNganh = tenNganh ? T.parse(tenNganh).vi : tenNganhTuyenSinh;
        this.props.getSdhChuongTrinhDaoTao(id, (ctsdh) => {
            const uniqueCTSDH = [...new Map(ctsdh.slice().reverse().map(v => [v.maMonHoc, v])).values()].reverse();
            SelectAdapter_SdhCauTrucKhungDaoTao.fetchOne(maKhung, (rs) => {
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
                this.setState({ monHoc: uniqueCTSDH, chuongTrinhDaoTaoCha: chuongTrinhDaoTaoCha, chuongTrinhDaoTaoCon: chuongTrinhDaoTaoCon, mucConSwitch: mucConSwitch, hocKySwitch: hocKySwitch });
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

    initLevelMucCha = (ctsdh, idCha, mucCon = {}) => {
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
                <p style={{ cursor: 'pointer' }} className={`${mucConSwitch[idCha] && mucConLength > 0 ? 'level-2' : 'level-2-no-level-3'} rectangle`} onClick={() => this.onChangeMucConSwitch(idCha)}>{ctsdh}</p>
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
                    const { text: ctsdh, id } = itemCha[key];
                    const mucCon = chuongTrinhDaoTaoCon[key];
                    return (<React.Fragment key={idx}>
                        {this.initLevelMucCha(ctsdh, id, mucCon)}
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
                    const { text: ctsdh, id } = itemCha[key];
                    const monHocByKey = monHoc.filter(mh => {
                        return parseInt(mh.hocKyDuKien) === parseInt(id);
                    }) || [];
                    return (<React.Fragment key={id}>
                        <li>
                            <p style={{ cursor: 'pointer' }} className='level-2-no-level-3 rectangle' onClick={() => this.onChangeHocKySwitch(id)}>{ctsdh}</p>
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
        return this.renderModal({
            title: `Chương trình năm học - ${this.khoaHocVien}`,
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
                    <p className="level-1 rectangle">{this.tenNganh}</p>
                    {this.initChuongTrinhDaoTao()}
                </div>
            </div>

        });
    }
}

class CloneModal extends AdminModal {

    onShow = (item) => {
        this.id = item.id;
    };

    onSubmit = (e) => {
        e.preventDefault();
        const id = this.id;
        const khoaSdh = this.namDaoTao.value();
        this.props.history.push(`/user/sau-dai-hoc/chuong-trinh-dao-tao/new?id=${id}&khoaSdh=${khoaSdh}`);
    };


    render = () => {
        return this.renderModal({
            title: 'Lựa chọn khoá đào tạo mới',
            submitText: 'Xác nhận',
            body: <div>
                <FormSelect ref={e => this.namDaoTao = e} label='Khóa đào tạo' data={SelectAdapter_SdhCauTrucKhungDaoTao} required />
            </div>
        });
    }
}
class HocKyModal extends AdminModal {

    onShow = (item) => {
        this.id = item.id;
        this.data = item;
    };

    onSubmit = (e) => {
        e.preventDefault();
        if (!this.data.thoiGianDaoTao) {
            T.notify('Hãy cấu hình chi tiết chương trình đào tạo trước', 'danger');
            this.props.history.push(`/user/sau-dai-hoc/chuong-trinh-dao-tao/${this.data.id}`);
        }
        else {
            const id = this.id;
            const soHocKy = this.soHocKy.value();
            if (!soHocKy) {
                T.notify('Hãy chọn số học kì', 'danger');
            }
            else {
                let changes = { soHocKy: parseInt(soHocKy) };
                this.props.updateKhungDaoTao(id, changes, () => this.props.history.push(`/user/sau-dai-hoc/ke-hoach-dao-tao/${id}`));
            }
        }

    };

    render = () => {
        return this.renderModal({
            title: 'Chọn số học kì đào tạo',
            submitText: 'Xác nhận',
            body: <>
                <div>
                    <FormSelect ref={e => this.soHocKy = e} label='Số học kỳ' data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} required allowClear />
                </div>
            </>
        });
    }
}
class SdhChuongTrinhDaoTaoPage extends AdminPage {
    state = { khoaDTFilter: '', idNamDaoTao: '', phanHeFilter: '', filter: {} }
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.clearSearchBox();
            let permission = this.getUserPermission('sdhChuongTrinhDaoTao'),
                user = this.props.system.user,
                khoaDTFilter = user.staff?.maDonVi;
            if (permission.read) khoaDTFilter = '';
            this.setState({ khoaDTFilter, idNamDaoTao: '', phanHeFilter: '' });
            T.onSearch = (searchText) => this.props.getSdhChuongTrinhDaoTaoPage(undefined, undefined, { searchTerm: searchText || '', }, this.state.filter);
            T.showSearchBox();
            this.showAdvanceSearch();
            this.initData();
            this.props.getSdhChuongTrinhDaoTaoPage(undefined, undefined, { searchTerm: '' }, this.state.filter);
        });
    }


    initData = () => {
        let khoaDTFilter = T.cookie('khoaDTFilter'),
            phanHeFilter = T.cookie('phanHeFilter'),
            khoaHocVien = T.cookie('khoaHocVien');
        this.donVi.value(khoaDTFilter || '');
        this.heDaoTao.value(phanHeFilter || '');
        this.khoaHocVien.value(khoaHocVien || '');
        this.setState({ filter: { khoaDTFilter, phanHeFilter, khoaHocVien } }, () => {
            this.props.getSdhChuongTrinhDaoTaoPage(undefined, undefined, { searchTerm: '' }, this.state.filter);

        });
    }


    getPage = (pageN, pageS, pageC, done) => {
        this.props.getSdhChuongTrinhDaoTaoPage(pageN, pageS, pageC, this.state.filter, done);
    }
    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa chương trình đào tạo', 'Bạn có chắc bạn muốn xóa chương trình đào tạo này?', true, isConfirm =>
            isConfirm && this.props.deleteSdhChuongTrinhDaoTao(item.id));
    }
    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    showTreeModal = (item) => {
        item.maKhung ? this.treeModal.show(item) : T.notify('Hãy cấu hình cho chương trình đào tạo trước tiên', 'danger', () => {
        });
    }

    render() {
        const onKeySearch = this.handleKeySearch;
        const permissionDaoTao = this.getUserPermission('sdhChuongTrinhDaoTao', ['write', 'delete', 'manage']);
        let permission = {
            write: permissionDaoTao.write || permissionDaoTao.manage,
            delete: permissionDaoTao.delete || permissionDaoTao.manage
        };
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sdhChuongTrinhDaoTao && this.props.sdhChuongTrinhDaoTao.page ?
            this.props.sdhChuongTrinhDaoTao.page : {
                pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [], pageCondition: {
                    searchTerm: '', khoaDTFilter: this.state.khoaDTFilter, idNamDaoTao: this.state.idNamDaoTao, phanHeFilter: this.state.phanHeFilter
                }
            };
        let table2 = renderDataTable({
            emptyTable: 'Không có dữ liệu chương trình đào tạo',
            data: list,
            divStyle: { height: '63vh' },
            className: 'table-fix-col',
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'top' }}>#</th>
                    <TableHead content='Mã CTĐT' keyCol='maCTDT' onKeySearch={onKeySearch} />
                    <TableHead content='Mã ngành' keyCol='maNganh' onKeySearch={onKeySearch} />
                    <TableHead content='Lớp' keyCol='lopHocVien' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: '100%' }} content='Tên ngành' keyCol='tenNganh' onKeySearch={onKeySearch} />
                    <TableHead style={{ verticalAlign: 'top' }} content='Khóa' />
                    <TableHead style={{ verticalAlign: 'top' }} content='Phân hệ' keyCol='phanHe' />
                    <TableHead style={{ textAlign: 'center' }} content='Đợt trúng tuyển' keyCol='dotTrungTuyen' onKeySearch={onKeySearch} />
                    <TableHead style={{ textAlign: 'center' }} content='Thời gian' keyCol='thoiGianDT' onKeySearch={onKeySearch} />
                    <TableHead style={{ verticalAlign: 'top' }} content='Khoa' />
                    <TableHead style={{ textAlign: 'center', verticalAlign: 'top' }} content='Tình trạng' />
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'top' }}>Thao tác</th>
                </tr >
            ),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={indexOfItem} />
                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.maCtdt} />
                        <TableCell style={{ textAlign: 'left' }} content={item.maNganh} />
                        <TableCell style={{ textAlign: 'left' }} content={item.maLop} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh ? T.parse(item.tenNganh).vi : item.tenNganhTuyenSinh ? item.tenNganhTuyenSinh : ''} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.khoaHocVien} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiHinhDaoTao} />
                        <TableCell content={item.tenDotTuyenSinh || <div className='text-danger'> Không có đợt trúng tuyển </div>} />
                        <TableCell style={{ textAlign: 'center' }} content={item.thoiGianDaoTao ? (item.thoiGianDaoTao + ' năm') : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoaBoMon} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<>
                            <div className='text-danger'> {!item.monHoc && 'Không có môn học'} </div>
                            <div className='text-danger'> {!item.maLop && 'Không có lớp'} </div>
                            <div className='text-success'> {(item.monHoc && item.maLop) && <i className='fa fa-lg fa-check-circle' />}</div>
                        </>} />
                        <TableCell style={{ textAlign: 'left' }} type='buttons' content={item} permission={permission}
                            onEdit={permissionDaoTao.manage ? (e) => e.preventDefault() || this.props.history.push(`/user/sau-dai-hoc/chuong-trinh-dao-tao/${item.id}`) : null}>
                            <Tooltip title='Xem cây chương trình' arrow placeholder='bottom' >
                                <a className='btn btn-secondary' href='#' onClick={e => e.preventDefault() || this.showTreeModal(item)}><i className='fa fa-lg fa-eye' /></a>
                            </Tooltip>
                            {
                                permission.write && <Tooltip title='Chỉnh sửa kế hoạch' arrow placeholder='bottom' >
                                    <a className='btn btn-info' href='#'
                                        onClick={e => e.preventDefault() ||
                                            this.props.getSdhKhungDaoTao(item.id, result => !result.item.soHocKy ?
                                                this.hockyModal.show(item) : this.props.history.push(`/user/sau-dai-hoc/ke-hoach-dao-tao/${item.id}`))}>
                                        <i className='fa fa-lg fa-list' /></a>
                                </Tooltip >
                            }
                            {/* {
                                permissionDaoTao.manage && <Tooltip title='Sao chép' arrow>
                                    <a className='btn btn-success' href='#' onClick={e => e.preventDefault() || this.cloneModal.show(item)}>
                                        <i className='fa fa-lg fa-clone ' />
                                    </a>
                                </Tooltip>
                            } */}
                        </TableCell >
                    </tr >
                );
            }

        });
        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Chương trình đào tạo',
            breadcrumb: [
                <Link key={1} to='/user/sau-dai-hoc/'>Sau đại học</Link>,
                'Chương trình đào tạo',
            ],
            advanceSearchTitle: '',
            advanceSearch: <div className='row'>
                <FormSelect className='col-md-4' label='Khoá học viên' placeholder='Khoá học viên' onChange={value => {
                    T.clearSearchBox();
                    this.setState({ filter: { ...this.state.filter, khoaHocVien: value ? value.id : '' } }, () => {
                        value ? T.cookie('khoaHocVien', value.id) : T.cookie('khoaHocVien', '');
                    });
                    this.props.getSdhChuongTrinhDaoTaoPage(undefined, undefined, {
                        searchTerm: '',
                    }, {
                        khoaDTFilter: this.state.filter.khoaDTFilter,
                        phanHeFilter: this.state.filter.phanHeFilter,
                        khoaHocVien: value && value.id
                    });
                }} data={SelectAdapter_SdhKhoaHocVien} allowClear={true} ref={e => this.khoaHocVien = e} />
                <FormSelect className='col-md-4' label='Khoa đào tạo' placeholder='Khoa đào tạo' ref={e => this.donVi = e} onChange={value => {
                    T.clearSearchBox();
                    this.setState({ filter: { ...this.state.filter, khoaDTFilter: value ? value.id : '' } }, () => {
                        value ? T.cookie('khoaDTFilter', value.id) : T.cookie('khoaDTFilter', '');
                    });
                    this.props.getSdhChuongTrinhDaoTaoPage(undefined, undefined, {
                        searchTerm: '',
                    }, {
                        khoaDTFilter: value && value.id,
                        khoaHocVien: this.state.filter.khoaHocVien,
                        phanHeFilter: this.state.filter.phanHeFilter
                    });
                }} data={SelectAdapter_DmKhoaSdh} allowClear={true} />
                <FormSelect className='col-md-4' label='Phân hệ' placeholder='Phân hệ' ref={e => this.heDaoTao = e} onChange={value => {
                    T.clearSearchBox();
                    this.setState({ filter: { ...this.state.filter, phanHeFilter: value ? value.id : '' } }, () => {
                        value ? T.cookie('phanHeFilter', value.id) : T.cookie('phanHeFilter', '');
                    });
                    this.props.getSdhChuongTrinhDaoTaoPage(undefined, undefined, {
                        searchTerm: '',
                    }, {
                        khoaDTFilter: this.state.filter.khoaDTFilter,
                        khoaHocVien: this.state.filter.khoaHocVien,
                        phanHeFilter: value && value.id,
                    });
                }} data={SelectAdapter_DmHocSdh} allowClear={true} />
            </div>,
            content: <>
                <div className='tile'>
                    {table2}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getSdhChuongTrinhDaoTaoPage} pageRange={3} />
                <TreeModal ref={e => this.treeModal = e} permission={permissionDaoTao} readOnly={!permission.write} getSdhChuongTrinhDaoTao={this.props.getSdhChuongTrinhDaoTao} />
                <CloneModal ref={e => this.cloneModal = e} permission={permissionDaoTao} readOnly={!permission.write} history={this.props.history} />
                {permission.write && <HocKyModal ref={e => this.hockyModal = e} permission={permissionDaoTao} history={this.props.history} updateKhungDaoTao={this.props.updateKhungDaoTao} />}
            </>,
            backRoute: '/user/sau-dai-hoc',
            collapse: [
                { icon: 'fa-plus', permission: permissionDaoTao.manage, type: 'success', name: 'Tạo mới', onClick: () => this.props.history.push('/user/sau-dai-hoc/chuong-trinh-dao-tao/new') },
            ],
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhChuongTrinhDaoTao: state.sdh.sdhChuongTrinhDaoTao });
const mapActionsToProps = { getSdhChuongTrinhDaoTaoPage, getSdhChuongTrinhDaoTao, getDmDonViAll, getSdhKhungDaoTao, updateKhungDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(SdhChuongTrinhDaoTaoPage);   