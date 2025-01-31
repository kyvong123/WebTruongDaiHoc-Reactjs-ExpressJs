import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { loadSpinner, AdminPage, FormSelect, TableCell, TableHead, renderDataTable, FormCheckbox } from 'view/component/AdminPage';
import { getDataHocPhanCu, deleteDataHocPhanCu } from './redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_DangKyHocPhanStudent, getDtDangKyHocPhanByStudent } from 'modules/mdDaoTao/dtDangKyHocPhan/redux';
import ModalDangKy from './Modal/modalDangKy';
import ModalChinhSuaDiem from './Modal/modalChinhSuaDiem';
class DtDangKyHocPhanCuPage extends AdminPage {
    state = {
        ksSearchHP: {}, sortTermHP: 'maHocPhan_ASC',
        ksSearchSV: {}, sortTermSV: 'maHocPhan_ASC',
        isSvLoading: true, isShow: false, isHpLoading: true,
        listHocPhan: [], dataKetQua: []
    };
    sinhVienChon = {};
    listHocPhanChon = [];
    listKetQuaChon = [];
    defaultSortTermSV = 'maHocPhan_ASC';
    defaultSortTermHP = 'maHocPhan_ASC';

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

    componentDidMount() {
        const namMax = 2021,
            namMin = 2018;
        this.setState({ namHoc: '2021 - 2022', hocKy: 1, dataNamHoc: Array.from({ length: namMax - namMin + 1 }, (_, i) => `${namMin + i} - ${namMin + i + 1}`) }, () => {
            this.namHoc.value('2021 - 2022');
            this.hocKy.value(1);
        });

    }

    onChangeSinhVien = () => {
        let value = this.sinhVien.data();
        if (!value) return;
        this.sinhVienChon = value.item;
        this.setState({ isShow: true, ksSearchSV: {}, sortTermSV: 'maHocPhan_ASC', ksSearchHP: {}, sortTermHP: 'maHocPhan_ASC', }, () => {
            this.listHocPhanChon = [];
            this.listKetQuaChon = [];
            this.getKetQuaDangKyHocPhan();
            this.getData();
        });
    }

    getData = () => {
        this.setState({ isHpLoading: true }, () => this.getDataHP());
    }

    getDataHP = () => {
        let { namHoc, hocKy } = this.state,
            filter = {
                ...this.state.ksSearchHP,
                sort: this.state?.sortTermHP || this.defaultSortTermHP,
                namHoc, hocKy
            };
        this.props.getDataHocPhanCu(filter, (data) => {
            this.setState({ listHocPhan: data.map(item => { return { ...item, isChon: false }; }), isHpLoading: false });
        });
    }

    handleKeySearchHP = (data) => {
        this.setState({ ksSearchHP: { [data.split(':')[0]]: data.split(':')[1] } }, () => this.getDataHP());
    }

    onSortHP = (sortTerm) => {
        this.setState({ sortTermHP: sortTerm }, () => this.getDataHP());
    }


    getKetQuaDangKyHocPhan = () => {
        this.setState({ isSvLoading: true }, () => this.getDataSV());
    }

    getDataSV = () => {
        let { namHoc, hocKy } = this.state;
        let sinhVien = this.sinhVienChon,
            filter = {
                ...this.state.ksSearchSV,
                sort: this.state?.sortTermSV || this.defaultSortTermSV,
                namHoc, hocKy
            };
        this.props.getDtDangKyHocPhanByStudent(sinhVien.mssv, filter, (data) => {
            this.setState({ dataKetQua: data.map(item => { return { ...item, isChon: false }; }), isSvLoading: false });
        });
    }

    handleKeySearchSV = (data) => {
        this.setState({ ksSearchSV: { [data.split(':')[0]]: data.split(':')[1] } }, () => this.getDataSV());
    }

    onSortSV = (sortTerm) => {
        this.setState({ sortTermSV: sortTerm }, () => this.getDataSV());
    }

    renderListKetQua = (list) => renderDataTable({
        data: list == null ? null : Object.keys(list.groupBy('maHocPhan')),
        emptyTable: 'Không tìm thấy học phần!',
        header: 'thead-light',
        stickyHead: true,
        divStyle: { height: '50vh' },
        // className: 'table-fix-col',
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    Chọn <br />
                    <FormCheckbox ref={e => this.checkKQAll = e}
                        onChange={value => {
                            let { dataKetQua } = this.state;
                            dataKetQua.forEach(e => e.isChon = value);
                            if (value) this.listKetQuaChon = dataKetQua;
                            else this.listKetQuaChon = [];
                            this.setState({ dataKetQua });
                        }}
                    />
                </th>
                <TableHead style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhanKQ'
                    onKeySearch={this.handleKeySearchSV} onSort={this.onSortSV}
                />
                <TableHead style={{ width: '70%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn' keyCol='tenMonHocKQ'
                    onKeySearch={this.handleKeySearchSV} onSort={this.onSortSV}
                />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='LĐK' keyCol='maLoaiDkyKQ'
                    onKeySearch={this.handleKeySearchSV} onSort={this.onSortSV} typeSearch='select' data={this.loaiDangKy || []} />
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hủy lớp</th>
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
                                <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={hocPhan.isChon} permission={{ write: true }}
                                    onChanged={() => {
                                        let { dataKetQua } = this.state;
                                        list = list.map(item => {
                                            if (item.maHocPhan == hocPhan.maHocPhan) item.isChon = !item.isChon;
                                            return item;
                                        });
                                        this.listKetQuaChon = list.filter(e => e.isChon);
                                        dataKetQua = list;
                                        this.setState({ dataKetQua }, () => this.checkKQAll.value(!(this.listHocPhanChon.length < list.length)));
                                    }} rowSpan={rowSpan}
                                />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.maHocPhan} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.maLoaiDky && this.mapperLoaiDangKy[hocPhan.maLoaiDky] ? this.mapperLoaiDangKy[hocPhan.maLoaiDky] : ''} rowSpan={rowSpan} />
                                <TableCell type='buttons' style={{ textAlign: 'center' }} content={hocPhan} rowSpan={rowSpan}>
                                    <Tooltip title='Chỉnh sửa điểm' arrow>
                                        <button className='btn btn-primary' onClick={e => e.preventDefault() || this.modalDiem.show(hocPhan)} >
                                            <i className='fa fa-lg fa-eye' />
                                        </button>
                                    </Tooltip>
                                    <Tooltip title='Hủy môn' arrow>
                                        <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.xoaHocPhan(hocPhan)} >
                                            <i className='fa fa-lg fa-trash' />
                                        </button>
                                    </Tooltip>
                                </TableCell>
                            </tr>);
                    }
                }
            }
            return rows;
        },
    });

    renderListHocPhan = (list) => renderDataTable({
        data: list,
        emptyTable: 'Không tìm thấy học phần!',
        header: 'thead-light',
        stickyHead: true,
        divStyle: { height: '50vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    Chọn <br />
                    <FormCheckbox ref={e => this.checkHPAll = e}
                        onChange={value => {
                            let { listHocPhan, dataKetQua } = this.state,
                                listMaMon = [];
                            dataKetQua = dataKetQua.map(e => e.maMonHoc);
                            listHocPhan.forEach(e => {
                                if (value) {
                                    if (!listMaMon.includes(e.maMonHoc) && !dataKetQua.includes(e.maMonHoc)) {
                                        e.isChon = value;
                                        listMaMon.push(e.maMonHoc);
                                    }
                                } else e.isChon = value;
                            });
                            this.listHocPhanChon = listHocPhan.filter(e => e.isChon);
                            this.setState({ listHocPhan });
                        }}
                    />
                </th>
                <TableHead style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhan'
                    onKeySearch={this.handleKeySearchHP} onSort={this.onSortHP}
                />
                <TableHead style={{ width: '70%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn' keyCol='tenMonHoc'
                    onKeySearch={this.handleKeySearchHP} onSort={this.onSortHP}
                />
            </tr>
        ),
        renderRow: (item, index) => {
            return (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={(index + 1)} />
                    <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={item.isChon} permission={{ write: true }}
                        onChanged={value => {
                            let { listHocPhan, dataKetQua } = this.state;
                            dataKetQua = dataKetQua.map(e => e.maMonHoc);
                            if (!dataKetQua.includes(item.maMonHoc)) {
                                listHocPhan.forEach(e => {
                                    if (e.maHocPhan == item.maHocPhan) e.isChon = !e.isChon;
                                });
                                if (value) {
                                    let isTrung = this.listHocPhanChon.filter(e => e.maMonHoc == item.maMonHoc);
                                    if (isTrung.length) {
                                        isTrung = isTrung[0];
                                        listHocPhan.forEach(e => {
                                            if (e.maHocPhan == isTrung.maHocPhan) e.isChon = !e.isChon;
                                        });
                                    }
                                }
                                this.listHocPhanChon = listHocPhan.filter(e => e.isChon);
                                this.setState({ listHocPhan }, () => this.checkHPAll.value(!(this.listHocPhanChon.length < list.length)));
                            } else T.notify('Sinh viên đã đăng ký môn này!', 'danger');
                        }}
                    />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                </tr>
            );
        },
    });

    xoaHocPhan = (hocPhan) => {
        let { dataKetQua } = this.state,
            list = dataKetQua.filter(e => e.maHocPhan == hocPhan.maHocPhan);
        this.props.deleteDataHocPhanCu(this.sinhVienChon.mssv, list);
    }

    xoaListHocPhan = () => {
        let { dataKetQua } = this.state,
            list = dataKetQua.filter(e => e.isChon);
        this.props.deleteDataHocPhanCu(this.sinhVienChon.mssv, list);
    }

    render() {
        let { dataKetQua, listHocPhan, namHoc, hocKy } = this.state,
            filter = { namHoc, hocKy };
        dataKetQua.forEach(item => {
            this.listKetQuaChon.forEach(e => {
                if (item.maHocPhan == e.maHocPhan) item.isChon = e.isChon;
            });
        });
        listHocPhan.forEach(item => {
            this.listHocPhanChon.forEach(e => {
                if (item.maHocPhan == e.maHocPhan) item.isChon = e.isChon;
            });
        });

        return this.renderPage({
            icon: 'fa fa-eraser',
            title: 'Đăng ký học phần cũ',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/edu-schedule'>Quản lý học phần</Link>,
                'Đăng ký học phần cũ'
            ],
            header: <div className='row'>
                <FormSelect ref={e => this.namHoc = e} style={{ width: '150px', marginBottom: '0', marginRight: '10px' }} data={this.state.dataNamHoc} placeholder='Năm học'
                    onChange={value => this.setState({ namHoc: value.id }, () => {
                        if (this.sinhVien.value()) {
                            this.getKetQuaDangKyHocPhan();
                            this.getData();
                        }
                    })} />
                <FormSelect ref={e => this.hocKy = e} style={{ width: '150px', marginBottom: '0', marginRight: '10px' }} data={SelectAdapter_DtDmHocKy} placeholder='Học kỳ'
                    onChange={value => this.setState({ hocKy: value.id }, () => {
                        if (this.sinhVien.value()) {
                            this.getKetQuaDangKyHocPhan();
                            this.getData();
                        }
                    })} />
            </div>,
            content: <>
                <div className='tile'>
                    <div className='tile-body'>
                        <div className='row'>
                            <div className='col-md-12'>
                                <div className='row justify-content'>
                                    <FormSelect ref={e => this.sinhVien = e} className='col-md-12' label='Chọn sinh viên' data={SelectAdapter_DangKyHocPhanStudent}
                                        onChange={() => this.onChangeSinhVien()} />

                                    {this.state.isShow ? <div className='col-md-12'>
                                        <div className='row'>
                                            <div className='col-md-6'>
                                                <div className='row justify-content border-right'>
                                                    <div className='col-md-12'>
                                                        <div className='row'>
                                                            <h6 className='col-md-6 tile-title mb-0'>Kết quả đăng ký học phần</h6>
                                                            <div className='col-md-6'>
                                                                <div className='rows' style={{ textAlign: 'right' }}>
                                                                    {this.state.isShow && this.listKetQuaChon.length ?
                                                                        <div>
                                                                            <button className='btn btn-primary' onClick={(e) => {
                                                                                e.preventDefault() || this.modalDiem.show();
                                                                            }} >
                                                                                <i className='fa fa-eye' /> Chỉnh sửa điểm
                                                                            </button>
                                                                            <button className='btn btn-danger ml-2' onClick={(e) => {
                                                                                e.preventDefault() || this.xoaListHocPhan();
                                                                            }} >
                                                                                <i className='fa fa-fw fa-lg fa-trash' /> Hủy học phần
                                                                            </button>
                                                                        </div>
                                                                        : <div />
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='col-md-12'>
                                                        <h6>Đã chọn {this.listKetQuaChon.length} học phần</h6>
                                                    </div>
                                                    {this.state.isShow ?
                                                        <div className='col-md-12 mt-3'>
                                                            {this.state.isSvLoading ? loadSpinner() : this.renderListKetQua(dataKetQua)}
                                                        </div>
                                                        : <div />}
                                                </div>
                                            </div>
                                            <div className='col-md-6'>
                                                <div className='row justify-content border-left'>
                                                    <div className='col-md-12'>
                                                        <div className='row'>
                                                            <h6 className='col-md-6 tile-title mb-0'>Danh sách học phần</h6>
                                                            <div className='col-md-6'>
                                                                <div className='rows' style={{ textAlign: 'right' }}>
                                                                    {this.state.isShow && this.listHocPhanChon.length ?
                                                                        <div>
                                                                            <button className='btn btn-success ml-2' onClick={(e) => {
                                                                                e.preventDefault() || this.modal.show();
                                                                            }} >
                                                                                <i className='fa fa-fw fa-lg fa-handshake-o' /> Đăng ký
                                                                            </button>
                                                                        </div >
                                                                        : <div />
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='col-md-12'>
                                                        <h6>Đã chọn {this.listHocPhanChon.length} học phần</h6>
                                                    </div>
                                                    {this.state.isShow ?
                                                        <div className='col-md-12 mt-3'>
                                                            {this.state.isHpLoading ? loadSpinner() : this.renderListHocPhan(listHocPhan)}
                                                        </div>
                                                        : <div />}
                                                </div>
                                            </div>
                                        </div>
                                    </div> : <div />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <ModalDangKy ref={(e) => (this.modal = e)} sinhVien={this.sinhVienChon} listHocPhan={this.listHocPhanChon} filter={filter} onChangeSinhVien={this.onChangeSinhVien} />
                <ModalChinhSuaDiem ref={(e) => (this.modalDiem = e)} sinhVien={this.sinhVienChon} listHocPhan={this.listKetQuaChon} />
            </>,
            backRoute: '/user/dao-tao/edu-schedule',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDangKyHocPhanCu: state.daoTao.dtDangKyHocPhanCu });
const mapActionsToProps = { getDtDangKyHocPhanByStudent, getDataHocPhanCu, deleteDataHocPhanCu };
export default connect(mapStateToProps, mapActionsToProps)(DtDangKyHocPhanCuPage);