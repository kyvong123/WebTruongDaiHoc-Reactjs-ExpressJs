import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormSelect, FormTextBox, FormTabs, renderDataTable, TableHead, TableCell, getValue, renderTable, FormDatePicker } from 'view/component/AdminPage';
import {
    getPageDtExam, getDtExamHocPhan, getDtExamGetSinhVien, updateDtExam, updateDtExamGetSinhVien, updateSinhVienPhongThi,
    updateSinhVienBoSung, SelectAdapter_DtExamPhongThi, SelectAdapter_CanBoGiamThi, dinhChiThiSinhVien
} from './redux';
import { SelectAdapter_DmPhongThi } from 'modules/mdDanhMuc/dmPhong/redux';
import { getDtDmLoaiDiemAll } from 'modules/mdDaoTao/dtDiemDmLoaiDiem/redux';
import SvHoanThiModal from './SvHoanThiModal';
import { Tooltip } from '@mui/material';

class ConfirmModal extends AdminModal {
    componentDidMount() {
    }

    onShow = (listSV, listPhong) => {
        listSV = listSV.sort((a, b) => a.stt - b.stt);
        this.setState({ listSV, listPhong, isSubmitting: false });
    };

    onSubmit = (e) => {
        e.preventDefault();
        let { listSV, listPhong } = this.state,
            { phongChuyen } = listPhong;
        T.confirm('Xác nhận', `<div>Bạn có chắc muốn chuyển ${listSV.length} sinh viên này<br />qua ca ${phongChuyen.caThi}, phòng ${phongChuyen.phong} không?</div>`, 'warning', true, isConfirm => {
            if (isConfirm) {
                this.setState({ isSubmitting: true }, () => {
                    this.props.updateSinhVienPhongThi(listSV, listPhong, () => {
                        this.setState({ isSubmitting: false }, () => this.props.resetChuyen());
                    });
                });
            }
        });
    };

    render = () => {
        let table = renderTable({
            getDataSource: () => this.state.listSV,
            stickyHead: this.state.listSV?.length > 10,
            header: 'thead-light',
            divStyle: { height: '55vh' },
            renderHead: () => <tr>
                <TableHead content='#' />
                <TableHead content='MSSV' />
                <TableHead content='Họ' style={{ width: '70%' }} />
                <TableHead content='Tên' style={{ width: '30%' }} />
                <TableHead content={<div>Ca thi<br />hiện tại</div>} style={{ textAlign: 'center' }} />
                <TableHead content={<div>Ca thi<br />chuyển</div>} style={{ textAlign: 'center' }} />
                <TableHead content={<div>Phòng thi<br />hiện tại</div>} style={{ textAlign: 'center' }} />
                <TableHead content={<div>Phòng thi<br />chuyển</div>} style={{ textAlign: 'center' }} />
            </tr>,
            renderRow: (item) => {
                return <tr key={item.mssv}>
                    <TableCell content={item.stt} />
                    <TableCell content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.caThi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={this.state.listPhong?.phongChuyen?.caThi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={this.state.listPhong?.phongChuyen?.phong} />
                </tr>;
            }
        });
        return this.renderModal({
            title: 'Xác nhận Chuyển sinh viên',
            size: 'large',
            isLoading: this.state.isSubmitting,
            submitText: this.state.isSubmitting ? 'Vui lòng chờ' : 'Lưu',
            body: <div>
                {table}
            </div>
        }
        );
    };
}
class ConfirmGanModal extends AdminModal {
    componentDidMount() {
    }

    onShow = ({ listSV, phongGan }) => {
        this.setState({ listSV, phongGan, isSubmitting: false });
    };

    onSubmit = (e) => {
        e.preventDefault();
        let { listSV, phongGan } = this.state;
        T.confirm('Xác nhận', `<div>Bạn có chắc muốn gán ${listSV.length} sinh viên này<br />vào ca ${phongGan.caThi}, phòng ${phongGan.phong} không?</div>`, 'warning', true, isConfirm => {
            if (isConfirm) {
                this.setState({ isSubmitting: true }, () => {
                    this.props.updateSinhVienBoSung(listSV, phongGan, () => {
                        this.setState({ isSubmitting: false }, () => this.props.resetGan());
                    });
                });
            }
        });
    };

    render = () => {
        let table = renderTable({
            getDataSource: () => this.state.listSV,
            stickyHead: this.state.listSV?.length > 10,
            header: 'thead-light',
            divStyle: { height: '55vh' },
            renderHead: () => <tr>
                <TableHead content='#' />
                <TableHead content='MSSV' />
                <TableHead content='Họ' style={{ width: '70%' }} />
                <TableHead content='Tên' style={{ width: '30%' }} />
                <TableHead content='Ca thi' style={{ textAlign: 'center' }} />
                <TableHead content='Phòng thi' style={{ textAlign: 'center' }} />
            </tr>,
            renderRow: (item, index) => {
                return <tr key={item.mssv}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={this.state.phongGan?.caThi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={this.state.phongGan?.phong} />
                </tr>;
            }
        });
        return this.renderModal({
            title: 'Xác nhận Gán sinh viên',
            size: 'large',
            isLoading: this.state.isSubmitting,
            submitText: this.state.isSubmitting ? 'Vui lòng chờ' : 'Lưu',
            body: <div>
                {table}
            </div>
        }
        );
    };
}
class DtExamAdjustPage extends AdminPage {
    defaultSortTerm = 'maHocPhan_ASC';
    state = {
        dssv: null, isEdit: false, isChuyen: false, listChosen: [], phongChuyen: null,
        isGan: false, listGanChosen: [], phongGan: null,
        batDau: {}, ketThuc: {}
    };
    kyThi = { GK: null, CK: null };
    hinhThuc = { GK: null, CK: null };
    ngayThi = { GK: {}, CK: {} };
    gioThi = { GK: {}, CK: {} };
    batDau = { GK: {}, CK: {} };
    thoiGian = { GK: {}, CK: {} };
    ca = { GK: {}, CK: {} };
    phong = { GK: {}, CK: {} };
    giamThi = { GK: {}, CK: {} };

    componentDidMount() {
        if (!$('.app').hasClass('sidenav-toggled')) {
            $('.app').addClass('sidenav-toggled');
        }
        T.ready('/user/dao-tao', () => {
            this.tab.tabClick(null, 0);
            const route = T.routeMatcher('/user/dao-tao/lich-thi/edit/:maHocPhan');
            this.ma = route.parse(window.location.pathname)?.maHocPhan;
            this.setState({ kyThi: 'GK', newKyThi: 'GK' }, () => {
                this.getData(this.ma);
            });
        });
    }

    getData = (maHocPhan) => {
        this.props.getDtDmLoaiDiemAll(data => {
            let dataKyThi = data.filter(item => item.isThi).map(item => ({ id: item.ma, text: item.ten }));
            this.setState({ dataKyThi, kyThi: 'GK', newKyThi: 'GK' }, () => {
                this.maKyThi.value('GK');
                this.maKyThiGan.value('GK');
            });
        });
        this.props.getDtExamHocPhan(maHocPhan, data => {
            this.setState({ dataLichThi: data, caSelected: data[0].caThi, phongSelected: data[0].phong }, () => {
                this.valueThongTinKyThi(maHocPhan);
                this.getSinhVien(maHocPhan);
                let { batDau, ketThuc } = this.state;
                for (let item of this.state.dataLichThi) {
                    batDau = { ...batDau, [`${item.loaiKyThi}_${item.caThi}`]: item.batDau };
                    ketThuc = { ...ketThuc, [`${item.loaiKyThi}_${item.caThi}`]: item.ketThuc };
                }
                this.setState({ batDau, ketThuc });
            });
        });
    }

    valueThongTinKyThi = (maHocPhan) => {
        let kyThi = this.state.dataLichThi.groupBy('loaiKyThi'),
            GK = kyThi.GK || [], CK = kyThi.CK || [];
        this.maHocPhan.value(maHocPhan || '');
        this.tenMonHoc.value(this.state.dataLichThi[0].tenMonHoc ? T.parse(this.state.dataLichThi[0].tenMonHoc).vi : '');
        if (GK && GK.length) {
            this.kyThi.GK.value(GK[0].tenKyThi || '');
            this.hinhThuc.GK.value(GK[0].tenHinhThuc || '');
            let caThi = 1, index = 0;
            for (let i = 0; i < GK.length; i++) {
                let item = GK[i],
                    thoiGian = (item.ketThuc - item.batDau) / (1000 * 60);
                if (caThi != item.caThi) {
                    caThi = item.caThi;
                    index = 0;
                }
                this.ngayThi.GK[item.caThi]?.value(item.ngayThi || '');
                this.gioThi.GK[item.caThi]?.value(item.gioThi || '');
                this.batDau.GK[item.caThi]?.value(item.batDau || '');
                this.thoiGian.GK[item.caThi]?.value(thoiGian);
                this.ca.GK[item.caThi]?.value(item.caThi || '');
                this.phong.GK[`${caThi}_${index}`]?.value(item.phong || '');
                this.giamThi.GK[`${caThi}_${index}`]?.value(item.listGiamThi.split(',') || '');
                index++;
            }
        }
        if (CK && CK.length) {
            this.kyThi.CK.value(CK[0].tenKyThi || '');
            this.hinhThuc.CK.value(CK[0].tenHinhThuc || '');
            let caThi = 1, index = 0;
            for (let i = 0; i < CK.length; i++) {
                let item = CK[i],
                    thoiGian = (item.ketThuc - item.batDau) / (1000 * 60);
                if (caThi != item.caThi) {
                    caThi = item.caThi;
                    index = 0;
                }
                this.ngayThi.CK[item.caThi]?.value(item.ngayThi || '');
                this.gioThi.CK[item.caThi]?.value(item.gioThi || '');
                this.batDau.CK[item.caThi]?.value(item.batDau || '');
                this.thoiGian.CK[item.caThi]?.value(thoiGian);
                this.ca.CK[item.caThi]?.value(item.caThi || '');
                this.phong.CK[`${caThi}_${index}`]?.value(item.phong || '');
                this.giamThi.CK[`${caThi}_${index}`]?.value(item.listGiamThi.split(',') || '');
                index++;
            }
        }
    }

    getSinhVien = (maHocPhan, done) => {
        let filter = { listMaHocPhan: maHocPhan };
        this.props.getDtExamGetSinhVien(filter, data => this.setState({
            dssv: data.items,
            dssvBoSung: data.newItems
        }, () => {
            let dssvCa = this.state.dssv.filter(item => item.maKyThi == this.state.kyThi && item.caThi == this.state.caSelected && item.phong == this.state.phongSelected);
            this.setState({ dssvCa }, () => done && done());
        }));
    }

    chuyenSinhVien = () => {
        this.setState({ isChuyen: true }, () => {
            let { dataLichThi, kyThi, caSelected, phongSelected } = this.state,
                selected = dataLichThi.find(item => item.loaiKyThi == kyThi && item.caThi == caSelected && item.phong == phongSelected),
                dataPhongChuyen = dataLichThi.filter(item => item.loaiKyThi == kyThi && item != selected);
            dataPhongChuyen = dataPhongChuyen.map(item => ({ id: `${item.caThi}_${item.phong}`, text: `Ca ${item.caThi}_${item.phong}`, item }));
            this.setState({ dataPhongChuyen });
        });
    }

    onSaveChuyenSinhVien = () => {
        let { dataLichThi, caSelected, phongSelected, phongChuyen } = this.state,
            phongCurr = dataLichThi.find(item => item.caThi == caSelected && item.phong == phongSelected);
        this.confirmModal.show(this.state.listChosen, { phongCurr, phongChuyen });
    }

    ganSinhVien = () => {
        this.setState({ isGan: true });
    }

    onSaveGanSinhVien = () => {
        let { phongGan } = this.state;
        this.confirmGanModal.show({ listSV: this.state.listGanChosen, phongGan });
    }

    resetChuyen = () => {
        this.setState({ isChuyen: false, listChosen: [], phongChuyen: null }, () => {
            this.getSinhVien(this.ma);
            this.confirmModal.hide();
        });
    }

    resetGan = () => {
        this.setState({ isGan: false, listGanChosen: [], phongGan: null }, () => {
            this.getSinhVien(this.ma);
            this.confirmGanModal.hide();
        });
    }

    chonSinhVien = (value, sinhVien) => {
        this.setState({
            listChosen: value ? [...this.state.listChosen, { ...sinhVien }]
                : this.state.listChosen.filter(item => item.mssv != sinhVien.mssv)
        });
    }

    chonSinhVienGan = (value, sinhVien) => {
        this.setState({
            listGanChosen: value ? [...this.state.listGanChosen, { ...sinhVien }]
                : this.state.listGanChosen.filter(item => item.mssv != sinhVien.mssv)
        });
    }

    thongTinLichThi = () => {
        const permission = this.getUserPermission('dtExam', ['manage', 'write', 'delete', 'import']);
        let { isEdit, onSaveLichThi } = this.state;
        let icon = isEdit ? (onSaveLichThi ? 'fa-spin fa-spinner' : 'fa-save') : 'fa-edit',
            textButton = isEdit ? (onSaveLichThi ? 'Loading' : 'Lưu thay đổi') : 'Chỉnh sửa',
            className = isEdit ? 'btn btn-success' : 'btn btn-primary';
        const elementPhongThi = (item, index, ma) => {
            let { caThi, phong } = item,
                { batDau, ketThuc } = this.state,
                filter = { batDau: batDau[`${ma}_${caThi}`], ketThuc: ketThuc[`${ma}_${caThi}`], phong };

            return <div key={`${ma}_${index}`} className='col-md-12 row mx-0 px-0' >
                <FormSelect ref={e => this.phong[ma][`${caThi}_${index}`] = e} className='col-md-4 mb-2' label='Phòng' data={SelectAdapter_DmPhongThi(filter)} disabled={!this.state.isEdit} />
                <FormSelect ref={e => this.giamThi[ma][`${caThi}_${index}`] = e} className='col-md-8 mb-2' label='Giám thị' data={SelectAdapter_CanBoGiamThi(filter)} multiple disabled={!this.state.isEdit} />
            </div>;
        };
        let data = this.state.dataLichThi?.groupBy('loaiKyThi');
        return <div className='tile'>
            <div className='row'>
                <div className='col-md-12 mb-0' style={{ display: permission.write ? '' : 'none' }}>
                    <button className={className} onClick={e => {
                        e.preventDefault();
                        if (isEdit) this.onSave();
                        else this.setState({ isEdit: 1 }, () => this.valueThongTinKyThi(this.state.dataLichThi[0].maHocPhan));
                    }}>
                        <i className={'fa fa-lg ' + icon} />{textButton}
                    </button>
                    <button className='btn btn-secondary' style={{ display: isEdit ? '' : 'none', marginLeft: '20px' }} onClick={e => e.preventDefault() || this.setState({ isEdit: 0 }, () => this.getData(this.ma))}>
                        <i className='fa fa-lg fa-times' /> Huỷ
                    </button>
                </div>
                {data && Object.keys(data).sort((a, b) => a > b ? -1 : 1).map((item) => {
                    let phongThi = data[item],
                        caPhongThi = phongThi.groupBy('caThi');
                    return <div key={item} className='col-md-6' style={{ borderLeft: '1px solid #dee2e6' }}>
                        <div className='row'>
                            <FormTextBox ref={e => this.kyThi[item] = e} className='col-md-3 mb-0 pr-0' label='Kỳ thi' readOnly />
                            <FormTextBox ref={e => this.hinhThuc[item] = e} className='col-md-6 mb-0 pr-0' label='Hình thức' readOnly />
                            <button className='col-md-3 btn btn-warning' onClick={e => e.preventDefault() || T.handleDownload(`/api/dt/exam/export-data/dssv?maHocPhan=${this.ma}&kyThi=${item}`, `DANH_SACH_THI_${this.ma}.xlsx`)}>
                                <i className='fa fa-lg fa-download' /> Xuất danh sách thi {item}
                            </button>
                        </div>
                        {Object.keys(caPhongThi).map((ca) => {
                            return <div key={ca} className='row'>
                                <FormTextBox ref={e => this.ca[item][ca] = e} className='col-md-2 mb-2' label='Ca thi' readOnly />
                                {!this.state.isEdit ? <>
                                    <FormTextBox ref={e => this.ngayThi[item][ca] = e} className='col-md-4 mb-2' label='Ngày thi' readOnly />
                                    <FormTextBox ref={e => this.gioThi[item][ca] = e} className='col-md-6 mb-2' label='Giờ thi' readOnly />
                                </> : <>
                                    <FormDatePicker ref={e => this.batDau[item][ca] = e} className='col-md-6 mb-2' type='time' label='Bắt đầu' required
                                        onChange={value => {
                                            this.setState({
                                                batDau: { ...this.state.batDau, [`${item}_${ca}`]: value.getTime() },
                                                ketThuc: { ...this.state.ketThuc, [`${item}_${ca}`]: value.getTime() + Number(getValue(this.thoiGian[item][ca])) * 60 * 1000 }
                                            }, () => {
                                                for (let i = 0; i < caPhongThi[ca].length; i++) {
                                                    this.phong[item][`${ca}_${i}`].value(caPhongThi[ca][i].phong);
                                                    this.giamThi[item][`${ca}_${i}`].value(caPhongThi[ca][i].listGiamThi.split(','));
                                                }
                                            });
                                        }} />
                                    <FormTextBox ref={e => this.thoiGian[item][ca] = e} className='col-md-4 mb-2' type='number' label='Thời gian thi' required
                                        onChange={value => {
                                            this.setState({
                                                ketThuc: { ...this.state.ketThuc, [`${item}_${ca}`]: getValue(this.batDau[item][ca]).getTime() + value * 60 * 1000 }
                                            }, () => {
                                                for (let i = 0; i < caPhongThi[ca].length; i++) {
                                                    this.phong[item][`${ca}_${i}`].value(caPhongThi[ca][i].phong);
                                                    this.giamThi[item][`${ca}_${i}`].value(caPhongThi[ca][i].listGiamThi.split(','));
                                                }
                                            });
                                        }} />
                                </>}
                                {caPhongThi[ca].map((phong, index) => elementPhongThi(phong, index, item))}
                            </div>;
                        })}
                    </div>;
                })}
            </div>
        </div>;
    }

    danhSachSinhVien = () => {
        const permission = this.getUserPermission('dtExam', ['manage', 'write', 'delete', 'import']);
        let table = renderDataTable({
            data: this.state.dssvCa ? this.state.dssvCa : null,
            stickyHead: true,
            divStyle: { height: '60vh' },
            renderHead: () => <tr>
                <TableHead content='#' />
                {this.state.isChuyen && <TableHead content='Chọn' />}
                <TableHead content='MSSV' />
                <TableHead content='Họ' style={{ width: '70%' }} />
                <TableHead content='Tên' style={{ width: '30%' }} />
                <TableHead content='Lớp' />
                <TableHead content='Ngành' />
                <TableHead content='Loại hình' />
                <TableHead content='Tình trạng' />
                <TableHead content='Học phí' />
                <TableHead content='Ghi chú' />
            </tr>,
            renderRow: (item) => {
                return <tr key={item.mssv}>
                    <TableCell content={item.stt} />
                    {this.state.isChuyen && <TableCell type='checkbox' isCheck content={this.state.listChosen.map(item => item.mssv).includes(item.mssv)}
                        onChanged={value => this.chonSinhVien(value, item)}
                        permission={permission} />}
                    <TableCell content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell content={item.lop} />
                    <TableCell content={item.tenNganh} nowrap />
                    <TableCell content={item.loaiHinhDaoTao} />
                    <TableCell content={item.tenTinhTrangSV} nowrap />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} contentClassName={item.tinhPhi == '0' ? 'text-danger' : 'text-success'}
                        content={item.tinhPhi == '0' ? <Tooltip title='Còn nợ học phí'>
                            <i className='fa fa-lg fa-times-circle' />
                        </Tooltip>
                            : <Tooltip title='Đã đóng đủ'>
                                <i className='fa fa-lg fa-check-circle' />
                            </Tooltip>} />
                    <TableCell content={item.ghiChuDinhChi || item.ghiChu || ''} nowrap />
                </tr>;
            }
        });
        let { dataLichThi, caSelected, phongSelected, dssv, kyThi, isChuyen } = this.state,
            className = isChuyen ? 'btn btn-success' : 'btn btn-primary',
            icon = isChuyen ? 'fa-save' : 'fa-repeat',
            textButton = isChuyen ? 'Lưu thay đổi' : 'Chuyển SV',
            display = !permission.write ? 'none' : (!isChuyen ? 'flex' : (this.state.listChosen.length && this.state.phongChuyen ? 'flex' : 'none'));
        dataLichThi = dataLichThi?.filter(item => item.loaiKyThi == kyThi);
        let selected = dataLichThi?.find(item => item.caThi == caSelected && item.phong == phongSelected),
            filter = { idExam: selected?.id, maMonHoc: selected?.maMonHoc, kyThi: this.state.kyThi };
        return <div className='tile'>
            <div className='row mb-2'>
                <FormSelect ref={e => this.maKyThi = e} className='col-md-3 mb-0' data={this.state.dataKyThi || []} label='Kỳ thi'
                    onChange={value => this.setState({
                        kyThi: value.id, isChuyen: false, listChosen: [], phongChuyen: null
                    }, () => this.setState({ dssvCa: this.state.dssv.filter(sv => sv.maKyThi == this.state.kyThi) })
                    )} />
                {this.state.isChuyen && <FormSelect ref={e => this.phongChuyen = e} className='col-md-3 mb-0' label='Chọn phòng' data={SelectAdapter_DtExamPhongThi(filter)}
                    onChange={value => this.setState({ phongChuyen: value.item })} />}
                <div className='col-md-1' style={{ display: 'flex', gap: 10 }}>
                    <button className='btn btn-secondary' style={{ display: isChuyen ? '' : 'none', marginLeft: '10px', height: '34px', alignSelf: 'flex-end' }}
                        onClick={e => e.preventDefault() || this.setState({ isChuyen: false, listChosen: [], phongChuyen: null })}>
                        <i className='fa fa-lg fa-times' /> Huỷ
                    </button>
                </div>
                <div className='col-md-1 pl-0' style={{ display, gap: 10 }}>
                    <button className={className} style={{ height: '34px', alignSelf: 'flex-end' }} onClick={e => {
                        e.preventDefault();
                        if (isChuyen) this.onSaveChuyenSinhVien();
                        else this.chuyenSinhVien();
                    }}>
                        <i className={'fa fa-lg ' + icon} />{textButton}
                    </button>
                </div>
                {selected && <div className='col-md-1 pl-0' style={{ display: !permission.write ? 'none' : 'flex', gap: 10 }}>
                    <button className='btn btn-warning' style={{ height: '34px', alignSelf: 'flex-end' }} onClick={e => e.preventDefault() || this.svHoanThiModal.show(selected)}>
                        Thêm sinh viên hoãn thi
                    </button>
                </div>}
            </div>
            <div className='row'>
                <div className='col-md-3 nav flex-column nav-pills' aria-orientation='vertical' style={{ paddingLeft: '15px' }} >
                    {dataLichThi && dataLichThi.map((item, index) => {
                        let { batDau, ketThuc } = item,
                            ngayThi = new Date(batDau).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                            soLuong = dssv?.filter(sv => sv.maKyThi == this.state.kyThi && sv.caThi == item.caThi && sv.phong == item.phong).length;
                        batDau = new Date(batDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                        ketThuc = new Date(ketThuc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                        return <a key={index} style={{ cursor: 'pointer' }} aria-selected='true'
                            className={'nav-link ' + (item.caThi == caSelected && item.phong == phongSelected ? 'active bg-info' : '')}
                            id={`${item.maHocPhan}-${item.caThi}-${item.phong}`} data-toggle='pill' role='tab' aria-controls={`${item.maHocPhan}-${item.caThi}-${item.phong}`}
                            onClick={e => e && e.preventDefault() || this.setState({
                                caSelected: item.caThi, phongSelected: item.phong,
                                dssvCa: dssv?.filter(sv => sv.maKyThi == item.loaiKyThi && sv.caThi == item.caThi && sv.phong == item.phong),
                                isChuyen: false, listChosen: [], phongChuyen: null
                            })}>
                            <div>Ca {item.caThi}_{item.phong}_{ngayThi}_{batDau}-{ketThuc}: {soLuong}</div>
                        </a>;
                    })}
                </div>
                <div className='col-md-9 pl-0 tab-content'>
                    {table}
                </div>
            </div>
            <ConfirmModal ref={e => this.confirmModal = e} updateSinhVienPhongThi={this.props.updateSinhVienPhongThi} resetChuyen={this.resetChuyen} />
            <SvHoanThiModal ref={e => this.svHoanThiModal = e} permission={permission} getSinhVien={this.getSinhVien} />
        </div >;
    }

    newSinhVien = () => {
        const permission = this.getUserPermission('dtExam', ['manage', 'write', 'delete', 'import']);
        let table = renderDataTable({
            data: this.state.dssvBoSung ? this.state.dssvBoSung : null,
            stickyHead: true,
            divStyle: { height: '60vh' },
            renderHead: () => <tr>
                <TableHead content='#' />
                {this.state.isGan && <TableHead content='Chọn' />}
                <TableHead content='MSSV' />
                <TableHead content='Họ' style={{ width: '70%' }} />
                <TableHead content='Tên' style={{ width: '30%' }} />
                <TableHead content='Lớp' />
                <TableHead content='Ngành' />
                <TableHead content='Loại hình' />
                <TableHead content='Tình trạng' />
                <TableHead content='Học phí' />
            </tr>,
            renderRow: (item, index) => {
                return <tr key={item.mssv}>
                    <TableCell content={index + 1} />
                    {this.state.isGan && <TableCell type='checkbox' isCheck content={this.state.listGanChosen.map(item => item.mssv).includes(item.mssv)}
                        onChanged={value => this.chonSinhVienGan(value, item)}
                        permission={permission} />}
                    <TableCell content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell content={item.lop} />
                    <TableCell content={item.tenNganh} nowrap />
                    <TableCell content={item.loaiHinhDaoTao} />
                    <TableCell content={item.tenTinhTrangSV} nowrap />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} contentClassName={item.tinhPhi == '0' ? 'text-danger' : 'text-success'}
                        content={item.tinhPhi == '0' ? <Tooltip title='Còn nợ học phí'>
                            <i className='fa fa-lg fa-times-circle' />
                        </Tooltip>
                            : <Tooltip title='Đã đóng đủ'>
                                <i className='fa fa-lg fa-check-circle' />
                            </Tooltip>} />
                </tr>;
            }
        });
        let { isGan, dataLichThi } = this.state,
            className = isGan ? 'btn btn-success' : 'btn btn-primary',
            icon = isGan ? 'fa-save' : 'fa-plus',
            textButton = isGan ? 'Lưu thay đổi' : 'Gán sinh viên',
            display = !permission.write ? 'none' : (!isGan ? 'flex' : (this.state.listGanChosen.length && this.state.phongGan ? 'flex' : 'none')),
            filter = { maMonHoc: dataLichThi ? dataLichThi[0].maMonHoc : '', idExam: '', kyThi: this.state.newKyThi };
        return <div className='tile'>
            <div className='row mb-2'>
                <FormSelect ref={e => this.maKyThiGan = e} className='col-md-3 mb-0' data={this.state.dataKyThi || []} label='Kỳ thi'
                    onChange={value => this.setState({
                        newKyThi: value.id, isGan: false, listGanChosen: [], phongGan: null
                    })} />
                {this.state.isGan && <FormSelect ref={e => this.phongGan = e} className='col-md-3 mb-0' label='Chọn phòng' data={SelectAdapter_DtExamPhongThi(filter)}
                    onChange={value => this.setState({ phongGan: value.item })} />}
                <div className='col-md-1' style={{ display: 'flex', gap: 10 }}>
                    <button className='btn btn-secondary' style={{ display: isGan ? '' : 'none', marginLeft: '10px', height: '34px', alignSelf: 'flex-end' }}
                        onClick={e => e.preventDefault() || this.setState({ isGan: false, listGanChosen: [], phongGan: null })}>
                        <i className='fa fa-lg fa-times' /> Huỷ
                    </button>
                </div>
                <div className='col-md-1 pl-0' style={{ display, gap: 10 }}>
                    <button className={className} style={{ height: '34px', alignSelf: 'flex-end' }} onClick={e => {
                        e.preventDefault();
                        if (isGan) this.onSaveGanSinhVien();
                        else this.ganSinhVien();
                    }}>
                        <i className={'fa fa-lg ' + icon} />{textButton}
                    </button>
                </div>
            </div>
            {table}
            <ConfirmGanModal ref={e => this.confirmGanModal = e} updateSinhVienBoSung={this.props.updateSinhVienBoSung} resetGan={this.resetGan} />
        </div>;
    }

    onSave = () => {
        this.setState({ onSaveLichThi: true });
        try {
            let kyThi = 'GK', caThi = 1, index = 0;
            this.state.dataLichThi.forEach((item) => {
                if (kyThi != item.loaiKyThi || caThi != item.caThi) {
                    kyThi = item.loaiKyThi;
                    caThi = item.caThi;
                    index = 0;
                }
                item.phong = getValue(this.phong[item.loaiKyThi][`${caThi}_${index}`]);
                item.batDau = this.state.batDau[`${item.loaiKyThi}_${item.caThi}`];
                item.ketThuc = this.state.ketThuc[`${item.loaiKyThi}_${item.caThi}`];
                item.listGiamThi = this.giamThi[item.loaiKyThi][`${caThi}_${index}`].value().join(',');
                index++;
            });
        }
        catch (selector) {
            this.setState({ onSaveLichThi: false });
            selector.focus();
            selector.props.id ? T.notify('<b>' + (selector.props.placeholder || selector.props.label || 'Dữ liệu') + '</b> không hợp lệ!', 'danger')
                : T.notify('<b>' + (selector.props.placeholder || selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
        // let isTrung = false;
        const checkTrungLich = (index) => {
            if (index == this.state.dataLichThi.length) {
                setTimeout(() => {
                    // if (!isTrung) {
                    T.confirm('Xác nhận', 'Bạn có chắc muốn điều chỉnh thông tin lịch thi không?', 'warning', true, isConfirm => {
                        if (isConfirm) {
                            T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                            this.props.updateDtExam(this.state.dataLichThi, () => {
                                T.alert('Điều chỉnh thông tin thành công', 'success', false, 1000);
                                this.setState({ isEdit: 0 }, () => this.getData(this.ma));
                            });
                        }
                        this.setState({ onSaveLichThi: false });
                    });
                    // }
                }, 10);
            } else {
                let lichThi = this.state.dataLichThi[index],
                    { maHocPhan, loaiKyThi, caThi, batDau, ketThuc } = lichThi;
                T.post('/api/dt/exam/check-if-trung-lich-thi', { maHocPhan, batDau, ketThuc }, (result) => {
                    if (result.error) {
                        T.notify('Kiểm tra thông tin bị lỗi!', 'danger');
                        this.setState({ onSaveLichThi: false });
                        console.error(result.error);
                    } else {
                        if (result.isTrung) {
                            T.notify('Thời gian thi bị trùng!', 'warning');
                            this.setState({ onSaveLichThi: false }, () => {
                                this.batDau[loaiKyThi][caThi].focus();
                            });
                            return;
                        } else {
                            index++;
                            checkTrungLich(index);
                        }
                    }
                });
            }
        };
        checkTrungLich(0);
    }

    render() {
        const tabs = [
            {
                title: 'Thông tin lịch thi', component: this.thongTinLichThi()
            },
            {
                title: 'Danh sách sinh viên', component: this.danhSachSinhVien()
            },
            {
                title: 'Sinh viên đăng ký mới', component: this.newSinhVien()
            },
        ];
        return this.renderPage({
            advanceSearchTitle: '',
            icon: 'fa fa-pencil',
            title: 'Điều chỉnh Lịch thi',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/edu-schedule'>Quản lý học phần</Link>,
                <Link key={2} to='/user/dao-tao/lich-thi'>Quản lý Lịch thi</Link>,
                'Điều chỉnh Lịch thi'
            ],
            backRoute: '/user/dao-tao/lich-thi',
            content: <>
                <div className='tile'>
                    <div className='row'>
                        <FormTextBox ref={e => this.maHocPhan = e} className='col-md-2 mb-0' label='Mã học phần' readOnly />
                        <FormTextBox ref={e => this.tenMonHoc = e} className='col-md-10 mb-0' label='Tên môn học' readOnly />
                    </div>
                </div>
                <FormTabs ref={e => this.tab = e} tabs={tabs} />
            </>
        });
    }
}
const mapStateToProps = state => ({ system: state.system, dtExam: state.daoTao.dtExam });
const mapActionsToProps = {
    getPageDtExam, getDtExamHocPhan, getDtExamGetSinhVien, updateDtExam, updateDtExamGetSinhVien,
    updateSinhVienPhongThi, updateSinhVienBoSung, getDtDmLoaiDiemAll, dinhChiThiSinhVien
};
export default connect(mapStateToProps, mapActionsToProps)(DtExamAdjustPage);