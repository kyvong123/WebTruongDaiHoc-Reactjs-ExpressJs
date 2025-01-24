import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { FormSelect, FormTextBox, getValue, AdminPage, renderTable, TableCell, FormCheckbox } from 'view/component/AdminPage';
import { SelectAdapter_DtDmHocKy } from '../dtDmHocKy/redux';
import { SelectAdapter_SchoolYear } from '../dtSemester/redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { getDtChuongTrinhDaoTaoPage, getDtChuongTrinhDaoTao } from '../dtChuongTrinhDaoTao/redux';
import { getScheduleSettings } from '../dtSettings/redux';
import { checkIfExistDtThoiKhoaBieu, createDtThoiKhoaBieuMultiple } from './redux';
import { getDtLopPage, SelectAdapter_DtLopFilter } from '../dtLop/redux';
import { SelectAdapter_DtKhoaDaoTao } from '../dtKhoaDaoTao/redux';
import { getDtNganhDaoTaoByDonVi } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import { SelectAdapter_DtDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import SectionAddHand from './section/SectionAddHand';
import { getDtConfigThanhPhan } from 'modules/mdDaoTao/dtDiemConfig/redux';
import TyLeDiemModal from './TyLeDiemModal';

class AddHocPhanPage extends AdminPage {
    allCtdt = [];
    isChon = {};
    soLop = {};
    soTiet = {};
    soBuoi = {};
    soLuongDuKien = {};
    lop = {};
    lopGhep = {};
    listHocPhan = {};
    listKetQua = [];
    khoaDangKy = {};
    state = { listCtdt: [], startIdx: {}, cheDo: '', configThanhPhan: [], maMonHoc: [] }
    componentDidMount() {
        this.props.getScheduleSettings(data => {
            let currentSemester = this.props.dtTkbConfig?.currentSemester,
                { namHoc, hocKy } = currentSemester || data.currentSemester;
            this.namHoc.value(namHoc);
            this.hocKy.value(hocKy);
        });
        this.listKetQua = [];
        this.bacDaoTao.value('DH');
        this.coSo.value(2);
        this.props.getDtChuongTrinhDaoTaoPage(1, 1000, { searchTerm: '' }, {}, (list) => {
            this.allCtdt = list.map(item => ({
                id: item.id,
                item,
                text: `${item.maCtdt}: ${item.tenNganh.includes('{') ? T.parse(item.tenNganh)?.vi : item.tenNganh}`
            }));
            this.setState({ danhSachCtdt: this.allCtdt, cheDo: '', maMonHoc: [] }, () => {
                this.cheDo.value('');
                this.namHoc.value(this.namHoc.value() || '');
                this.hocKy.value(this.hocKy.value() || '');
                this.loaiHinhDaoTao.value(this.loaiHinhDaoTao.value() || '');
                this.khoaSinhVien.value(this.khoaSinhVien.value() || '');

                let filter = history.state.state.filter;
                if (filter && filter != {}) {
                    let { loaiHinhDaoTaoFilter, khoaSinhVienFilter } = filter;
                    if (loaiHinhDaoTaoFilter) {
                        SelectAdapter_DmSvLoaiHinhDaoTaoFilter.fetchOne(loaiHinhDaoTaoFilter, data => {
                            this.setState({ maLopHeDaoTao: data.maLop });
                        });
                        this.loaiHinhDaoTao.value(loaiHinhDaoTaoFilter);
                        if (khoaSinhVienFilter) {
                            this.khoaSinhVien.value(khoaSinhVienFilter);
                            this.handleKhoaSinhVien(khoaSinhVienFilter, loaiHinhDaoTaoFilter);
                        } else {
                            this.handleLoaiHinh(loaiHinhDaoTaoFilter);
                        }
                    }
                }
                this.ctdt?.value(this.ctdt?.value() || '');
            });
        });
    }

    handleLoaiHinh = (value) => {
        this.setState({
            danhSachCtdt: this.allCtdt.filter(list => {
                if (value) {
                    if (this.khoaSinhVien.value())
                        return list.item.heDaoTao == value && list.item.khoaSinhVien == this.khoaSinhVien.value();
                    else return list.item.heDaoTao == value;
                }
            }),
            maMonHoc: [],
        }, () => {
            this.khoaSinhVien.focus();
            this.ctdt?.value('');
        });
    }

    handleKhoaSinhVien = (value, loaiHinh) => {
        this.setState({
            danhSachCtdt: this.allCtdt.filter(list => {
                if (value) {
                    if (loaiHinh) {
                        return (list.item.heDaoTao == loaiHinh && list.item.khoaSinhVien == value);
                    } else if (this.loaiHinhDaoTao.value()) {
                        return list.item.heDaoTao == this.loaiHinhDaoTao.value() && list.item.khoaSinhVien == value;
                    }
                    else {
                        return list.item.khoaSinhVien == value;
                    }
                }
                return true;
            }),
            maMonHoc: [],
        }, () => {
            this.ctdt?.value('');
        });
    }

    handleCheDo = (value) => {
        if (this.loaiHinhDaoTao.value() == '') {
            T.notify('Chưa chọn hệ đào tạo!', 'danger');
            this.loaiHinhDaoTao.focus();
        } else if (this.khoaSinhVien.value() == '') {
            T.notify('Chưa chọn khóa sinh viên!', 'danger');
            this.khoaSinhVien.focus();
        } else this.setState({ cheDo: value, maMonHoc: [] }, () => {
            if (this.state.cheDo == 'ctdt') {
                this.ctdt.focus();
            }
        });
    }

    handleCtdt = (value) => {
        let maMonHoc = [], stateTongSoTiet = {};
        this.props.getDtConfigThanhPhan({ namHoc: this.namHoc.value(), hocKy: this.hocKy.value() }, configThanhPhan => {
            this.props.getDtChuongTrinhDaoTao(value.id, (data) => {
                data = data.filter(item => item.hocKyDuKien == this.hocKy.value() && item.namHocDuKien == this.namHoc.value());
                data = data.map(i => ({ ...i, tyLeDiem: i.tyLeDiem ? T.parse(i.tyLeDiem).filter(tl => configThanhPhan.map(tp => tp.ma).includes(tl.loaiThanhPhan)) : [] }));

                for (let mon of data) {
                    let { tongSoTiet, tongTiet } = mon;
                    mon.ma = mon.maMonHoc + '-' + value.item.maNganh;
                    maMonHoc.push(mon);
                    stateTongSoTiet[mon.ma] = tongSoTiet || tongTiet;
                }

                this.setState({ lop: value.item.lop, maNganh: value.item.maNganh, configThanhPhan, tongSoTiet: stateTongSoTiet, maMonHoc }, () => {
                    for (let mon of data) {
                        this.isChon[mon.ma].value(1);
                        this.khoaDangKy[mon.ma].value(value.item.maKhoa);
                        this.soLop[mon.ma].value(1);
                        this.soLuongDuKien[mon.ma].value(100);
                        this.lop[mon.ma].value(value.item.lop?.split(',') || []);
                    }
                });
            });
        });
    }

    chonAll = (value) => {
        let listMa = this.state.maMonHoc.map(e => e.ma);
        for (let ma of listMa) {
            this.isChon[ma].value(value);
        }
    }

    saveConfig = (e) => {
        e && e.preventDefault();
        try {
            if (this.state.cheDo == 'ctdt') {
                const data = {};
                let length = 0;
                for (let item of this.state.maMonHoc) {
                    if (this.isChon[item.ma].value()) {
                        data[item.ma] = {
                            bacDaoTao: getValue(this.bacDaoTao),
                            namHoc: getValue(this.namHoc),
                            hocKy: getValue(this.hocKy),
                            coSo: getValue(this.coSo),
                            loaiHinhDaoTao: getValue(this.loaiHinhDaoTao),
                            khoaSinhVien: getValue(this.khoaSinhVien),
                            maMonHoc: item.maMonHoc,
                            tenMonHoc: item.tenMonHoc,
                            tongSoTiet: this.state.tongSoTiet[item.ma],
                            maLopHeDaoTao: this.state.maLopHeDaoTao,
                            khoaDangKy: this.khoaDangKy[item.ma]?.value() || '',
                            soLop: this.soLop[item.ma]?.value() || 1,
                            soLuongDuKien: this.soLuongDuKien[item.ma]?.value() || 100,
                            maLop: this.lop[item.ma]?.value() || [],
                            maLopGhep: this.lopGhep[item.ma]?.value() || [],
                            tyLeDiem: item.tyLeDiem,
                        };
                        length++;
                    }
                }
                this.setState({ isLoading: true });
                const checkExist = (index) => {
                    if (index >= length) return;

                    const ma = Object.keys(data)[index], dataMonHoc = data[ma];

                    this.props.checkIfExistDtThoiKhoaBieu(dataMonHoc, (startIndex) => {
                        this.setState({
                            basicData: data,
                            savedConfig: true,
                            startIdx: { ...this.state.startIdx, [ma]: startIndex, }
                        }, () => {
                            if (startIndex == -1) {
                                this.setState({ isLoading: false });
                            } else {
                                this.save(ma, () => {
                                    if (index == length) {
                                        T.confirm('Xếp lịch học', 'Bạn có muốn xếp lịch học cho các học phần này không?', true, isConfirm => {
                                            if (isConfirm) {
                                                let listChosen = this.listKetQua,
                                                    filter = {
                                                        namFilter: getValue(this.namHoc),
                                                        hocKyFilter: getValue(this.hocKy)
                                                    };
                                                this.props.history.push({ pathname: '/user/dao-tao/thoi-khoa-bieu/gen-schedule', state: { filter, listChosen } });
                                            } else {
                                                this.setState({ isLoading: false });
                                            }
                                        });
                                    }
                                });
                            }
                            index++;
                            checkExist(index);
                        });
                    });
                };
                if (length == 0) T.notify('Chưa chọn học phần cần mở', 'danger');
                else checkExist(0);
            } else if (this.state.cheDo == 'khoa') {
                const { data, listMon } = this.sectionAddHand.getData();
                let length = 0;
                for (let [key, value] of Object.entries(data)) {
                    data[key] = {
                        ...value,
                        bacDaoTao: getValue(this.bacDaoTao),
                        namHoc: getValue(this.namHoc),
                        hocKy: getValue(this.hocKy),
                        coSo: getValue(this.coSo),
                        loaiHinhDaoTao: getValue(this.loaiHinhDaoTao),
                        khoaSinhVien: getValue(this.khoaSinhVien),
                        maLopHeDaoTao: this.state.maLopHeDaoTao,
                    };
                    length++;
                }
                this.setState({ isLoading: true, listMon });
                const checkExist = (index) => {
                    if (index >= length) return;
                    let item = {
                        bacDaoTao: getValue(this.bacDaoTao),
                        namHoc: getValue(this.namHoc),
                        hocKy: getValue(this.hocKy),
                        coSo: getValue(this.coSo),
                        loaiHinhDaoTao: getValue(this.loaiHinhDaoTao),
                        khoaSinhVien: getValue(this.khoaSinhVien),
                        maMonHoc: listMon[index]
                    };
                    this.props.checkIfExistDtThoiKhoaBieu(item, (startIndex) => {
                        if (startIndex == -1) {
                            this.setState({ isLoading: false });
                        }
                        else {
                            for (let [key, value] of Object.entries(data)) {
                                if (value.maMonHoc == listMon[index]) {
                                    this.setState({
                                        basicData: data,
                                        savedConfig: true,
                                        startIdx: { ...this.state.startIdx, [key]: startIndex, }
                                    }, () => {
                                        if (value.soLop != 1) startIndex = startIndex + value.soLop - 1;
                                        this.save(key, () => {
                                            if (index == listMon.length) {
                                                T.confirm('Xếp lịch học', 'Bạn có muốn xếp lịch học cho các học phần này không?', true, isConfirm => {
                                                    if (isConfirm) {
                                                        let listChosen = this.listKetQua,
                                                            filter = {
                                                                namFilter: getValue(this.namHoc),
                                                                hocKyFilter: getValue(this.hocKy)
                                                            };
                                                        this.props.history.push({ pathname: '/user/dao-tao/thoi-khoa-bieu/gen-schedule', state: { filter, listChosen } });
                                                    } else {
                                                        this.setState({ isLoading: false });
                                                    }
                                                });
                                            }
                                        });
                                        startIndex++;
                                    });
                                }
                            }
                        }
                        index++;
                        checkExist(index);
                    });
                };
                if (length == 0) T.notify('Chưa chọn học phần cần mở', 'danger');
                else checkExist(0);
            }
        } catch (input) {
            if (input) {
                T.notify(`${input.props?.label || input.props?.placeholder} bị trống`, 'danger');
                input.focus();
            }
            this.setState({ basicData: null, settings: null }, this.showThongTinChung);
        }
    }

    save = (ma, done) => {
        let { basicData, startIdx } = this.state,
            hocPhan = basicData[ma],
            soLop = hocPhan.soLop,
            dataHocPhan = [];

        for (let i = 0; i < soLop; i++) {
            let item = {
                maLop: hocPhan.maLop,
                maLopGhep: hocPhan.maLopGhep,
                soLuongDuKien: hocPhan.soLuongDuKien
            };
            dataHocPhan.push(item);
        }

        this.props.createDtThoiKhoaBieuMultiple(dataHocPhan, { ...hocPhan, startIndex: startIdx[ma] }, (value) => {
            if (value && value.listHocPhan && value.listHocPhan.length) {
                let list = value.listHocPhan;
                for (let item of list) {
                    this.listKetQua.push(item);
                }
            }
            done && done();
        });
    }

    handleTyLe = ({ tyLeDiem, listMon }) => {
        const { maMonHoc } = this.state;
        this.setState({ maMonHoc: maMonHoc.map(i => listMon.includes(i.ma) ? { ...i, tyLeDiem } : i) }, () => {
            this.tyLeModal.hide();
            T.alert('Cập nhật tỷ lệ điểm thành công!', 'success', false, 2000);
        });
    }

    handleChangeNam = () => {
        if (this.state.cheDo == 'ctdt') {
            this.setState({ maMonHoc: [] });
            this.ctdt.value('');
            this.isChon = {};
            this.soLop = {};
            this.soLuongDuKien = {};
            this.lop = {};
            this.lopGhep = {};
            this.khoaDangKy = {};
        }
    }

    monHocConfigTable = (list) => {
        const { tkbSoLopMax, tkbSoLopMin, tkbSoLuongDuKienMax, tkbSoLuongDuKienMin } = this.props.dtTkbConfig || {};
        return renderTable({
            getDataSource: () => list,
            header: 'thead-light',
            emptyTable: 'Chương trình đào tạo không có môn học trong năm học, học kỳ này',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        Chọn <br />
                        <FormCheckbox ref={e => this.isChonAll = e}
                            onChange={value => this.chonAll(value)}
                        />
                    </th>
                    <th style={{ width: '10%', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Mã môn học</th>
                    <th style={{ width: '36%', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Tên môn học</th>
                    <th style={{ width: '20%', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Khoa đăng ký</th>
                    <th style={{ width: '7%', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Số lớp</th>
                    <th style={{ width: '7%', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>SLDK</th>
                    <th style={{ width: '20%', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Lớp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tỷ lệ điểm</th>
                </tr>
            ),
            renderRow: (item, index) => {
                return <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'center' }} content={
                        <FormCheckbox style={{ marginBottom: '0' }} ref={e => this.isChon[item.ma] = e}
                            onChange={value => this.isChon[item.ma].value(value)} />
                    } />
                    <TableCell content={item.maMonHoc} />
                    <TableCell nowrap content={item.tenMonHoc} />
                    <TableCell content={<FormSelect style={{ marginBottom: '0' }} ref={e => this.khoaDangKy[item.ma] = e} data={SelectAdapter_DtDmDonVi()} placeholder='Khoa đăng ký' required />} />
                    <TableCell style={{ textAlign: 'center' }} content={<FormTextBox type='number' style={{ marginBottom: '0' }} ref={e => this.soLop[item.ma] = e} placeholder='Số lớp' required min={tkbSoLopMin} max={tkbSoLopMax} />} />
                    <TableCell style={{ textAlign: 'center' }} content={<FormTextBox type='number' style={{ marginBottom: '0' }} ref={e => this.soLuongDuKien[item.ma] = e} placeholder='SLDK' required min={tkbSoLuongDuKienMin} max={tkbSoLuongDuKienMax} />} />
                    <TableCell style={{ textAlign: 'center' }} content={<FormSelect style={{ marginBottom: '0' }} ref={e => this.lop[item.ma] = e} data={SelectAdapter_DtLopFilter({})} placeholder='Lớp' multiple />} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{item.tyLeDiem.sort((a, b) => parseInt(a.phanTram) - parseInt(b.phanTram)).map(i => <div key={`${index}${i.loaiThanhPhan}`}><b>{i.loaiThanhPhan}</b>: {i.phanTram}%</div>)}</>} />
                </tr>;
            }
        });
    }

    render = () => {
        const { danhSachCtdt, isLoading, configThanhPhan, maMonHoc } = this.state;
        let filter = {};
        if (this.khoaSinhVien?.value() && this.loaiHinhDaoTao?.value()) {
            filter = {
                khoaSinhVien: getValue(this.khoaSinhVien),
                heDaoTao: getValue(this.loaiHinhDaoTao)
            };
        }
        return this.renderPage({
            title: 'Mở học phần',
            // icon: 'fa fa-',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/edu-schedule'>Quản lý học phần</Link>,
                <Link key={2} to='/user/dao-tao/thoi-khoa-bieu'>Quản lý học phần</Link>,
                'Mở học phần'
            ],
            content:
                <div className='tile'>
                    <TyLeDiemModal ref={e => this.tyLeModal = e} handleTyLe={this.handleTyLe} />
                    <div style={{ marginTop: '10px' }} className='row'>
                        <FormSelect ref={e => this.bacDaoTao = e} className='col-md-8' label='Bậc đào tạo' data={SelectAdapter_DmSvBacDaoTao} readOnly required style={{ marginBottom: '0' }} />

                        <div className='col-md-4' style={{ display: 'flex', gap: 10, justifyContent: 'right' }}>
                            <button type='button' className='btn btn-info' onClick={() => this.tyLeModal.show({ maMonHoc: maMonHoc.map(mh => ({ ...mh, isChon: this.isChon[mh.ma].value() })), configThanhPhan })} style={{ display: maMonHoc.length ? '' : 'none' }}>
                                Điều chỉnh tỷ lệ &nbsp;<i className='fa fa-lg fa-edit' />
                            </button>
                            <button type='button' className='btn btn-success' onClick={this.saveConfig} disabled={isLoading}>
                                Tạo học phần &nbsp;{isLoading ? <i className='fa fa-spin fa-lg fa-spinner' /> : <i className='fa fa-lg fa-save' />}
                            </button>
                        </div>

                        <FormSelect ref={e => this.namHoc = e} className='col-md-2' label='Năm học' data={SelectAdapter_SchoolYear}
                            onChange={() => this.handleChangeNam()} required />
                        <FormSelect ref={e => this.hocKy = e} className='col-md-2' label='Học kỳ' data={SelectAdapter_DtDmHocKy}
                            onChange={() => this.handleChangeNam()} required />
                        <FormSelect ref={e => this.coSo = e} className='col-md-2' label='Cơ sở' data={SelectAdapter_DmCoSo}
                            onChange={() => this.loaiHinhDaoTao.focus()} required />

                        <FormSelect ref={e => this.loaiHinhDaoTao = e} className='col-md-3' label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter}
                            onChange={value => {
                                this.setState({ maLopHeDaoTao: value.maLop });
                                this.handleLoaiHinh(value.id);
                            }} required />
                        <FormSelect ref={e => this.khoaSinhVien = e} className='col-md-3' label='Khoá sinh viên' data={SelectAdapter_DtKhoaDaoTao}
                            onChange={value => this.handleKhoaSinhVien(value.id)} required />

                        <FormSelect ref={e => this.cheDo = e} className='col-md-12' label='Chế độ' data={[{ id: 'ctdt', text: 'Mở học phần theo theo kế hoạch' }, { id: 'khoa', text: 'Mở học phần theo môn' }]}
                            onChange={value => this.handleCheDo(value.id)} />

                        <div className='col-md-12'>
                            {this.state.cheDo == 'khoa' &&
                                <SectionAddHand ref={e => this.sectionAddHand = e} dtTkbConfig={this.props.dtTkbConfig} filter={filter} />
                            }
                        </div>

                        {this.state.cheDo == 'ctdt' &&
                            <FormSelect ref={e => this.ctdt = e} className='col-md-12' label='Chương trình đào tạo' data={danhSachCtdt}
                                onChange={value => this.handleCtdt(value)} required />
                        }

                    </div>
                    {this.state.cheDo == 'ctdt' != 0 &&
                        this.monHocConfigTable(this.state.maMonHoc)}
                </div>,
            backRoute: '/user/dao-tao/thoi-khoa-bieu',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtTkbConfig: state.daoTao.dtTkbConfig });
const mapActionsToProps = {
    getDtChuongTrinhDaoTaoPage, getDtChuongTrinhDaoTao, getScheduleSettings, checkIfExistDtThoiKhoaBieu,
    getDtLopPage, createDtThoiKhoaBieuMultiple, getDtNganhDaoTaoByDonVi, getDtConfigThanhPhan
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AddHocPhanPage);