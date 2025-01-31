import React from 'react';
import { connect } from 'react-redux';
import ListChonModal from './ListChonModal';
import Pagination from 'view/component/Pagination';
import { getDmMonHocPage } from 'modules/mdDaoTao/dmMonHoc/redux';
import { getDmDonViFaculty } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDtNganhDaoTaoAll } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { AdminPage, renderDataTable, TableHead, TableCell, FormTextBox, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import { SelectAdapter_DtLopFilter, getDtLopFilter } from 'modules/mdDaoTao/dtLop/redux';

class SectionAddHand extends AdminPage {
    state = { monSortTerm: 'ten_ASC', listNganh: [], listMonHoc: [], listHocPhan: [], filterNganh: {} };
    monDefaultSortTerm = 'ten_ASC';
    listTong = [];
    listNganhChon = [];
    listMonHocChon = [];
    soLop = {};
    lop = {};
    soLuongDuKien = {};
    isChon = {};
    khoaDangKy = {};

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.initData();
        });
    }

    initData = () => {
        const user = this.props.system.user;
        let donVi = '';
        if (!Number(user.isPhongDaoTao)) {
            donVi = Number(user.staff ? user.staff.maDonVi : '');
        }
        this.props.getDtNganhDaoTaoAll(value => {
            if (donVi != '') value = value.filter(e => e.khoa == donVi);
            this.setState({ listNganh: value, donVi });
        });
        this.getMonPage();
    }

    getMonPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, sort: this.state?.monSortTerm || this.monDefaultSortTerm };
        this.props.getDmMonHocPage(pageN, pageS, pageC, filter, monHocPage => {
            this.setState({ monHocPage, listMonHoc: monHocPage.list });
            done && done();
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getMonPage(pageNumber, pageSize, pageCondition));

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getMonPage(pageNumber, pageSize, pageCondition);
        });
    }

    onKeySearchNganh = (data) => {
        this.setState({ filterNganh: { ...this.state.filterNganh, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            let { filterNganh, donVi } = this.state;
            this.props.getDtNganhDaoTaoAll(value => {
                if (donVi != '') value = value.filter(e => e.khoa == donVi);
                let { ks_maNganh, ks_tenNganh } = filterNganh;
                let listNganh = value.filter(i => {
                    return (!ks_maNganh || i.maNganh.toLowerCase().includes(ks_maNganh.toLowerCase())) && (!ks_tenNganh || i.tenNganh.toLowerCase().includes(ks_tenNganh.toLowerCase()));
                });
                this.setState({ listNganh });
            });
        });
    }

    getData = () => {
        const data = {};
        let { listHocPhan } = this.state,
            listMon = this.listMonHocChon.map(e => e.ma);
        for (let item of this.listTong) {
            if (this.isChon[item].value()) {
                let hocPhan = listHocPhan.filter(e => e.ma == item)[0];
                data[item] = {
                    maMonHoc: hocPhan.maMonHoc,
                    tenMonHoc: T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi,
                    khoaDangKy: this.khoaDangKy[item]?.value() || '',
                    tongTiet: hocPhan.tongTiet,
                    soLop: this.soLop[item]?.value() || 1,
                    maLop: this.lop[item]?.value() || [],
                    soLuongDuKien: this.soLuongDuKien[item]?.value() || 100,
                };
            }
        }
        return { data, listMon };
    }

    listChon = () => this.listChonModal.show(this.listNganhChon, this.listMonHocChon);

    renderNganhComponent = () => {
        let { listNganh } = this.state;

        listNganh.forEach(item => {
            this.listNganhChon.forEach(itemNganh => {
                if (item.maNganh == itemNganh.maNganh) {
                    item.isChon = itemNganh.isChon;
                }
            });
        });

        let table = renderDataTable({
            emptyTable: 'Không tìm thấy ngành',
            data: listNganh,
            header: 'thead-light',
            stickyHead: listNganh && listNganh.length > 12 ? true : false,
            divStyle: { height: '40vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Mã ngành' keyCol='maNganh' onKeySearch={this.onKeySearchNganh} />
                    <TableHead style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên ngành' keyCol='tenNganh' onKeySearch={this.onKeySearchNganh} />
                </tr>),
            renderRow: (item, index) => {
                return (
                    <tr key={index + 1} style={{ backgroundColor: item.isChon ? '#cfe2ff' : '', cursor: 'pointer' }} onClick={() => this.chonNganh(item, listNganh)}>
                        <TableCell style={{ textAlign: 'right' }} content={index} />
                        <TableCell style={{ textAlign: 'center' }} content={item.maNganh} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} />
                    </tr >
                );
            }
        });

        return (<>
            <div className='row justify-content border-left'>
                <div className='col-md-12'>
                    <div className='row'>
                        <h6 className='col-md-8 tile-title'>Danh sách ngành</h6>
                    </div>
                </div>

                <div className='col-md-12'>
                    <h6>
                        Đã chọn {this.listNganhChon.length} ngành
                        <sub style={{ cursor: 'pointer', color: '#1488db' }} onClick={() => this.listChon()}>(Chi tiết)</sub>
                    </h6>
                </div>

                <div className='col-md-12'>
                    {table}
                </div>
            </div>
        </>);
    }

    chonNganh = (item, listNganh) => {
        item.isChon = !item.isChon;
        let check = false,
            { listHocPhan } = this.state;
        if (item.isChon == true) {
            this.listNganhChon.forEach(itemNganh => {
                if (item.maNganh == itemNganh.maNganh) check = true;
            });
            if (check == false) {
                this.listNganhChon.push(item);
                this.listMonHocChon.forEach(itemMonHoc => {
                    let ma = itemMonHoc.ma + '-' + item.maNganh,
                        data = {
                            maMonHoc: itemMonHoc.ma,
                            tenMonHoc: itemMonHoc.ten,
                            tongTiet: itemMonHoc.tongTiet,
                            maNganh: item.maNganh,
                            tenNganh: item.tenNganh,
                            ma
                        };
                    listHocPhan.push(data);
                    this.listTong.push(ma);
                    this.props.getDtLopFilter({ ...this.props.filter, nganh: item.maNganh }, (value) => {
                        let maLop = value.map(e => e.ma);
                        this.setState(() => {
                            this.isChon[ma].value(1);
                            this.khoaDangKy[ma].value(item.khoa);
                            this.soLop[ma].value(1);
                            this.soLuongDuKien[ma].value(100);
                            this.lop[ma].value(maLop);
                        });
                    });
                });
            }
        } else if (item.isChon == false) {
            for (let i = 0; i < this.listNganhChon.length; i++) {
                if (item.maNganh == this.listNganhChon[i].maNganh) this.listNganhChon.splice(i, 1);
            }
            listHocPhan = listHocPhan.filter(e => e.maNganh != item.maNganh);

            this.listMonHocChon.forEach(itemMonHoc => {
                let ma = itemMonHoc.ma + '-' + item.maNganh;
                this.listTong = this.listTong.filter(e => e != ma);
            });
        }
        this.setState({ listNganh, listHocPhan });
    }

    renderMonHocComponent = () => {
        let { monHocPage, listMonHoc } = this.state;
        const { pageNumber, pageSize, pageTotal, totalItem } = monHocPage || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };

        listMonHoc.forEach(item => {
            this.listMonHocChon.forEach(itemMon => {
                if (item.ma == itemMon.ma) {
                    item.isChon = itemMon.isChon;
                }
            });
        });

        let table = renderDataTable({
            emptyTable: 'Không tìm thấy môn học',
            data: listMonHoc,
            header: 'thead-light',
            stickyHead: listMonHoc && listMonHoc.length > 12 ? true : false,
            divStyle: { height: '40vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã môn học' keyCol='ma' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn học' keyCol='ten' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng TC</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng tiết</th>
                    <TableHead style={{ width: '60%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Khoa/Bộ môn' keyCol='khoa' onKeySearch={this.handleKeySearch} onSort={this.onSort} />

                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index} style={{ backgroundColor: item.isChon ? '#cfe2ff' : '', cursor: 'pointer' }} onClick={() => this.chonMonHoc(item, listMonHoc)}>
                        <TableCell style={{ textAlign: 'right' }} content={indexOfItem} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ma} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.ten, { vi: '' })?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tongTinChi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tongTiet} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.tenKhoa} />

                    </tr >
                );
            }
        });

        return (<>
            <div className='row justify-content border-left'>
                <div className='col-md-12'>
                    <div className='row' style={{ display: 'flex' }}>
                        <h6 className='col-md-6 tile-title'>Danh sách môn học</h6>
                        <div className='col-md-6'>
                            <Pagination style={{ position: '', marginBottom: '0', justifyContent: 'flex-end' }}
                                {...{ pageNumber, pageSize, pageTotal, totalItem }} getPage={this.getMonPage} pageRange={5} />
                        </div>
                    </div>
                </div>

                <div className='col-md-12'>
                    <h6>
                        Đã chọn {this.listMonHocChon.length} môn học
                        <sub style={{ cursor: 'pointer', color: '#1488db' }} onClick={() => this.listChon()}>(Chi tiết)</sub>
                    </h6>
                </div>

                <div className='col-md-12'>
                    {table}
                </div>
            </div>
        </>);
    }

    chonMonHoc = (item, listMonHoc) => {
        item.isChon = !item.isChon;
        let check = false,
            { listHocPhan } = this.state;
        if (item.isChon == true) {
            this.listMonHocChon.forEach(itemMon => {
                if (item.ma == itemMon.ma) check = true;
            });
            if (check == false) {
                this.listMonHocChon.push(item);
                this.listNganhChon.forEach(itemNganh => {
                    let ma = item.ma + '-' + itemNganh.maNganh,
                        data = {
                            maMonHoc: item.ma,
                            tenMonHoc: item.ten,
                            tongTiet: item.tongTiet,
                            maNganh: itemNganh.maNganh,
                            tenNganh: itemNganh.tenNganh,
                            ma
                        };
                    listHocPhan.push(data);
                    this.listTong.push(ma);
                    this.props.getDtLopFilter({ ...this.props.filter, nganh: itemNganh.maNganh }, (value) => {
                        let maLop = value.map(e => e.ma);
                        this.setState(() => {
                            this.isChon[ma].value(1);
                            this.khoaDangKy[ma].value(itemNganh.khoa);
                            this.soLop[ma].value(1);
                            this.soLuongDuKien[ma].value(100);
                            this.lop[ma].value(maLop);
                        });
                    });
                });
            }
        } else if (item.isChon == false) {
            for (let i = 0; i < this.listMonHocChon.length; i++) {
                if (item.ma == this.listMonHocChon[i].ma) this.listMonHocChon.splice(i, 1);
            }
            listHocPhan = listHocPhan.filter(e => e.maMonHoc != item.ma);

            this.listNganhChon.forEach(itemNganh => {
                let ma = item.ma + '-' + itemNganh.maNganh;
                this.listTong = this.listTong.filter(e => e != ma);
            });
        }
        this.setState({ listMonHoc, listHocPhan });
    }

    renderHocPhanComponent = () => {
        let { listHocPhan } = this.state;
        const { tkbSoLopMax, tkbSoLopMin, tkbSoLuongDuKienMax, tkbSoLuongDuKienMin } = this.props.dtTkbConfig || {};

        let table = renderDataTable({
            emptyTable: 'Không tìm thấy học phần',
            data: listHocPhan,
            header: 'thead-light',
            stickyHead: listHocPhan && listHocPhan.length > 8 ? true : false,
            divStyle: { height: '60vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <FormCheckbox ref={e => this.isChonAll = e} onChange={value => this.chonAll(value)} />
                    </th>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }} content='Mã môn' />
                    <TableHead style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }} content='Tên môn' />
                    <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }} content='Tên ngành' />
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Khoa đăng ký</th>
                    <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Số lớp</th>
                    <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>SLDK</th>
                    <th style={{ width: '20%', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Lớp</th>
                </tr>),
            renderRow: (item, index) => {
                return (
                    <tr key={item.ma} >
                        <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                        <TableCell style={{ textAlign: 'center' }} content={
                            <FormCheckbox style={{ marginBottom: '0' }} ref={e => this.isChon[item.ma] = e}
                                onChange={value => this.isChon[item.ma].value(value)} />
                        } />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maMonHoc} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} />
                        <TableCell content={
                            <FormSelect style={{ marginBottom: '0' }} ref={e => this.khoaDangKy[item.ma] = e}
                                data={SelectAdapter_DtDmDonVi()} placeholder='Khoa đăng ký' required />
                        } />
                        <TableCell style={{ textAlign: 'center' }} content={
                            <FormTextBox type='number' style={{ marginBottom: '0' }} ref={e => this.soLop[item.ma] = e}
                                placeholder='Số lớp' required min={tkbSoLopMin} max={tkbSoLopMax} />
                        } />
                        <TableCell style={{ textAlign: 'center' }} content={
                            <FormTextBox type='number' style={{ marginBottom: '0' }} ref={e => this.soLuongDuKien[item.ma] = e}
                                placeholder='SLDK' required min={tkbSoLuongDuKienMin} max={tkbSoLuongDuKienMax} />
                        } />
                        <TableCell style={{ textAlign: 'center' }} content={
                            <FormSelect style={{ marginBottom: '0' }} ref={e => this.lop[item.ma] = e}
                                data={SelectAdapter_DtLopFilter()} placeholder='Lớp' multiple />
                        } />
                    </tr >
                );
            }
        });

        return (<>
            <div className='row mt-2'>
                <div className='col-md-12'>
                    {table}
                </div>
            </div>
        </>);
    }

    chonAll = (value) => {
        let { listHocPhan } = this.state,
            listMa = listHocPhan.map(e => e.ma);
        for (let ma of listMa) {
            this.isChon[ma].value(value);
        }
    }

    render() {
        return (
            <>
                <div className='row'>
                    <div className='col-md-8'>
                        {this.renderMonHocComponent()}
                    </div>
                    <div className='col-md-4'>
                        {this.renderNganhComponent()}
                    </div>
                </div>

                {this.listMonHocChon.length && this.listNganhChon.length ?
                    <div className='row mt-2'>
                        <div className='col-md-12'>
                            {this.renderHocPhanComponent()}
                        </div>
                    </div> : <div />}


                <ListChonModal ref={(e) => (this.listChonModal = e)} xoaNganh={this.chonNganh} listNganh={this.state.listNganh} xoaMonHoc={this.chonMonHoc} listMonHoc={this.state.listMonHoc} />
            </>
        );
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDmDonViFaculty, getDtNganhDaoTaoAll, getDmMonHocPage, getDtLopFilter };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionAddHand);
