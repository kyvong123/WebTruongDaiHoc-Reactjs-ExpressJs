import React from 'react';
import { AdminModal, FormCheckbox, FormDatePicker, FormSelect, FormTextBox, TableCell, TableHead, getValue, renderDataTable } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { SelectAdapter_SemesterData } from 'modules/mdDaoTao/dtSemester/redux';
import { DtDiemInBangDiemCaNhan, SelectAdapter_DtGetStudentInBangDiem } from 'modules/mdDaoTao/dtDiemInBangDiem/redux';
import { ProcessModal } from 'modules/mdDaoTao/dtCauHinhDotDkhp/adjustPage';
import { Tooltip } from '@mui/material';
export class PrintBangDiemModal extends AdminModal {
    state = { tiengViet: 1, quaTrinh: 1, diemDat: 0 };

    componentDidMount() {
        this.disabledClickOutside();
        T.socket.on('bang-diem-ca-nhan-done', ({ mergedPath, userPrint, tabId, typePrint }) => {
            if (userPrint == this.props.system.user.email && this.props.tabId == tabId && this.state.typePrint == typePrint) {
                let printTime = Date.now();
                printTime = new Date(printTime).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
                let fileName = this.state.cheDoIn == '1' ? `bdcn_${printTime}` : `bdcntn_${printTime}`;
                T.download(`/api/dt/diem/in-bang-diem/download-export?outputPath=${mergedPath}`, fileName);
                this.setState({ cheDoIn: '' }, () => {
                    this.props.hideProcessModal();
                });
            }
        });

        T.socket.on('bang-diem-ca-nhan-error', ({ userPrint, error }) => {
            if (userPrint == this.props.system.user.email) {
                this.props.hideProcessModal();
                T.alert(error ? 'Xuất file bị lỗi hệ thống' : 'Xử lý bị gián đoạn. Vui lòng liên hệ với người phát triển', error ? 'error' : 'warning', false, 2000);
            }
        });
    }

    onShow = ({ cheDoIn, typePrint }) => {
        const listKhoa = this.props.listSvChosen.map(i => i.khoaSinhVien).filter(i => i);
        this.setState({
            listSv: this.props.listSvChosen, cheDoIn, typePrint, isShowFilter: typePrint == 'caNhan',
            minSem: listKhoa.length ? `${Math.min(...listKhoa)}`.substring(2, 4) + '1' : '',
        }, () => {
            this.fromSem?.value('');
            this.toSem?.value('');
            this.loaiFile.value('pdf');
            this.ngayKy.value(Date.now());
            this.thuaLenh.value('TL. HIỆU TRƯỞNG');
            this.chucVu.value('TRƯỞNG PHÒNG QUẢN LÝ ĐÀO TẠO');
            this.tiengViet.value(this.state.tiengViet);
            this.tiengAnh.value(!this.state.tiengViet);
            this.quaTrinh?.value(this.state.quaTrinh);
            this.keHoach?.value(!this.state.quaTrinh);
            this.diemDat?.value(this.state.diemDat);
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        let { listSv, tiengViet, quaTrinh, diemDat, typePrint, isShowFilter } = this.state,
            fromSem = this.state.cheDoIn == '1' && isShowFilter ? getValue(this.fromSem) : '',
            toSem = this.state.cheDoIn == '1' && isShowFilter ? getValue(this.toSem) : '',
            loaiFile = getValue(this.loaiFile),
            data = {
                listSv: listSv.map(item => ({ mssv: item.mssv, fromSem: item.fromSem || fromSem, toSem: item.toSem || toSem })),
                cheDoIn: this.state.cheDoIn,
                ngayKy: getValue(this.ngayKy),
                thuaLenh: getValue(this.thuaLenh),
                chucVu: getValue(this.chucVu),
                tiengViet, quaTrinh, diemDat,
                tabId: this.props.tabId, typePrint,
            };
        if (loaiFile == 'pdf') {
            this.props.DtDiemInBangDiemCaNhan(data, () => {
                this.props.showProcessModal();
                this.setState({ fromSem: '', tiengViet: 1, tiengAnh: 0, quaTrinh: 1, keHoach: 0, diemDat: 0 }, () => {
                    this.loaiFile.value('');
                    this.fromSem?.value('');
                    this.toSem?.value('');
                    this.tiengViet.value(1);
                    this.tiengAnh.value(0);
                    this.quaTrinh?.value(1);
                    this.keHoach?.value(0);
                    this.diemDat?.value(0);
                });
                this.hide();
                this.props.resetListChosen();
            });
        } else {
            T.handleDownload(`/api/dt/diem/bang-diem-ca-nhan/excel?data=${JSON.stringify(data)}`);
            this.setState({ cheDoIn: '', fromSem: '', tiengViet: 1, quaTrinh: 1, diemDat: 0 }, () => {
                this.loaiFile.value('');
                this.fromSem?.value('');
                this.toSem?.value('');
                this.tiengViet.value(1);
                this.tiengAnh.value(0);
                this.quaTrinh?.value(1);
                this.keHoach?.value(0);
                this.diemDat?.value(0);
            });
            this.hide();
            this.props.resetListChosen();
        }
    };

    changeTiengViet = () => {
        this.setState({ tiengViet: 1 }, () => {
            this.tiengViet.value(1);
            this.tiengAnh.value(0);
            this.thuaLenh.value('TL. HIỆU TRƯỞNG');
            this.chucVu.value('TRƯỞNG PHÒNG QUẢN LÝ ĐÀO TẠO');
        });
    }
    changeTiengAnh = () => {
        this.setState({ tiengViet: 0 }, () => {
            this.tiengViet.value(0);
            this.tiengAnh.value(1);
            this.thuaLenh.value('P.P.President of the University');
            this.chucVu.value('Head, Office of Academic Affairs');
        });
    }
    changeQuaTrinh = () => {
        this.setState({ quaTrinh: 1 }, () => {
            this.quaTrinh.value(1);
            this.keHoach.value(0);
        });
    }
    changeKeHoach = () => {
        this.setState({ quaTrinh: 0 }, () => {
            this.quaTrinh.value(0);
            this.keHoach.value(1);
        });
    }
    changeDiemDat = (value) => {
        this.setState({ diemDat: value ? 1 : 0 }, () => this.diemDat.value(value ? 1 : 0));
    }

    render = () => {
        const { cheDoIn, isShowFilter, minSem } = this.state;

        let table = renderDataTable({
            data: this.state.listSv,
            emptyTable: 'Chưa chọn sinh viên',
            stickyHead: true,
            header: 'thead-light',
            divStyle: { height: '35vh' },
            renderHead: () => <tr>
                <TableHead content='#' />
                <TableHead content='MSSV' />
                <TableHead content='Họ và tên' style={{ width: '70%' }} />
                <TableHead content='Ngành' style={{ width: '15%' }} />
                <TableHead content='Lớp' />
                <TableHead content='Khoá' />
                <TableHead content='Loại hình' style={{ width: '15%' }} />
                <TableHead content='Tình trạng' />
            </tr>,
            renderRow: (item, index) => <tr key={item.mssv}>
                <TableCell content={index + 1} />
                <TableCell content={item.mssv} />
                <TableCell content={`${item.ho} ${item.ten}`} nowrap />
                <TableCell content={item.tenNganh} nowrap />
                <TableCell content={item.lop} nowrap />
                <TableCell content={item.namTuyenSinh} />
                <TableCell content={item.heDaoTao} nowrap />
                <TableCell content={item.tenTinhTrangSV} nowrap />
            </tr>
        });
        return this.renderModal({
            title: 'In phiếu điểm cá nhân',
            size: 'large',
            submitText: 'In phiếu điểm',
            body: <div>
                <div className='row'>
                    {cheDoIn == '1' && isShowFilter && <>
                        <FormSelect ref={e => this.fromSem = e} className='col-md-6' data={SelectAdapter_SemesterData(minSem)} label='Từ học kỳ' required
                            onChange={value => this.setState({ fromSem: value.id }, () => this.toSem.value(''))} />
                        <FormSelect ref={e => this.toSem = e} className='col-md-6' data={SelectAdapter_SemesterData(this.state.fromSem)} label='Đến học kỳ' required
                            disabled={!this.state.fromSem} />
                    </>}
                </div>
                {table}
                <div className='row'>
                    <FormSelect className='col-md-2' ref={e => this.loaiFile = e} data={[
                        { id: 'pdf', text: 'File PDF' },
                        { id: 'excel', text: 'File Excel' },
                    ]} label='Loại file in' required />
                    <FormDatePicker className='col-md-2' ref={e => this.ngayKy = e} label='Ngày ký' type='date-mask' required />
                    <FormTextBox className='col-md-3' ref={e => this.thuaLenh = e} label='Thừa lệnh' required />
                    <FormTextBox className='col-md-5' ref={e => this.chucVu = e} label='Chức vụ người ký' required />

                    <FormCheckbox className='col-md-6' ref={e => this.tiengViet = e} label='Phiếu điểm tiếng Việt' onChange={this.changeTiengViet} />
                    <FormCheckbox className='col-md-6' ref={e => this.tiengAnh = e} label='Phiếu điểm tiếng Anh' onChange={this.changeTiengAnh} />
                    {this.state.cheDoIn == '1' &&
                        <>
                            <FormCheckbox className='col-md-6' ref={e => this.quaTrinh = e} label='Điểm theo quá trình' onChange={this.changeQuaTrinh} />
                            <FormCheckbox className='col-md-6' ref={e => this.keHoach = e} label='Điểm theo kế hoạch' onChange={this.changeKeHoach} />

                            <FormCheckbox className='col-md-6' ref={e => this.diemDat = e} label='Chỉ in điểm đạt' onChange={this.changeDiemDat} />
                        </>
                    }
                </div>
            </div>
        }
        );
    };
}

class SectionBangDiemCaNhan extends React.Component {
    state = { filter: {}, listSvChosen: [], bangDiem: {}, bangDiemFilter: null, heDiem: {}, dataThangDiem: {} };
    mapperGhiChu = {
        'M': 'Miễn điểm',
        'I': 'Hoãn thi',
        'VT': 'Vắng thi'
    };

    chonSinhVien = value => {
        let index = this.state.listSvChosen.findIndex(item => item.mssv == value.id);
        if (index > -1) {
            this.state.listSvChosen.splice(index, 1);
            this.setState({
                bangDiem: { ...this.state.bangDiem, [value.id]: [] }
            });
        } else {
            this.setState({ isLoading: true }, () => {
                T.get('/api/dt/diem/get-diem-sinh-vien', { sv: [value.id] }, data => {
                    let { dataDiem, heDiem, dataThangDiem } = data;
                    let tinChiTl = 0, diemTrungBinh = 0, tongTinChi = 0;
                    dataDiem.forEach(item => {
                        item.diem = item.diem ? T.parse(item.diem) : { TK: '' };

                        if (item.R != 1 && item.tinhPhi && item.noHocPhi < 0 && item.isAnDiem) {
                            item.diem = { TK: '' };
                        }

                        item.diemTk = item.diem.TK;
                        item.diemTk = item.diemTk ? (isNaN(item.diemTk) ? item.diemTk : Number(item.diemTk).toFixed(1)) : '';
                        let diemHe = heDiem.map(he => {
                            let diem = isNaN(item.diemTk) ? '' : Number(item.diemTk);
                            let thangDiem = dataThangDiem.find(i => (Number(i.min) <= diem && Number(i.max) > diem) || (diem == 10 && Number(i.max) == 10));
                            return { he: he.id, diem: isNaN(item.diemTk) ? '' : (thangDiem ? thangDiem.loaiHe[he.id.toString()] : '') };
                        });
                        item.diemBon = diemHe.find(item => !isNaN(item.diem));
                        item.diemChu = diemHe.find(item => isNaN(item.diem));
                        item.monKhongTinhTB = item.monKhongTinhTB.map(item => item.maMonHoc);
                        const configQC = item.configQC ? T.parse(item.configQC) : [],
                            diemDacBiet = configQC.find(i => i.ma == item.diemTk);
                        if (diemDacBiet) {
                            let { tinhTinChi, tinhTrungBinh } = item.diemDacBiet;
                            tinhTinChi = Number(tinhTinChi);
                            tinhTrungBinh = Number(tinhTrungBinh);
                            if (tinhTinChi) {
                                tinChiTl += Number(item.tinChi);
                            }
                            if (tinhTrungBinh) diemTrungBinh += 5;
                        } else {
                            if (Number(item.diemTk) >= item.diemDat) {
                                tinChiTl += Number(item.tinChi);
                            }
                        }
                        if (!item.monKhongTinhTB.includes(item.maMonHoc) && !diemDacBiet && Number(item.diemTk || 0) >= item.diemDat) {
                            tongTinChi += Number(item.tinChi);
                            diemTrungBinh = diemTrungBinh + Number(item.tinChi) * Number(item.diemTk || 0);
                        }
                        item.ghiChu = this.mapperGhiChu[item.diemTk] || '';
                    });
                    value.item = { ...value.item, tinChiTl, diemTrungBinh: tongTinChi == 0 ? '' : diemTrungBinh / tongTinChi, khoaSinhVien: value.khoaSinhVien };
                    this.state.listSvChosen.push(value.item);
                    this.setState({
                        bangDiem: { ...this.state.bangDiem, [value.id]: dataDiem }, isLoading: false,
                    });
                });
            });
        }
        this.setState({ listSvChosen: this.state.listSvChosen }, () => {
            this.sinhVien.value('');
            this.sinhVien.focus();
        });
    }

    delete = (e, value) => {
        e.preventDefault();
        this.setState({
            listSvChosen: this.state.listSvChosen.filter(i => i.mssv != value.mssv),
            isCheckDiem: this.state.isCheckDiem == value.mssv ? null : this.state.isCheckDiem,
            bangDiem: { ...this.state.bangDiem, [value.id]: [] }
        });
    }

    resetListChosen = () => {
        this.setState({ listSvChosen: [], bangDiem: {}, isCheckDiem: null });
    }

    onKeySearch = (data) => {
        let { bangDiem, isCheckDiem } = this.state,
            bangDiemFilter = bangDiem[isCheckDiem], [ks, value] = data.split(':');
        if (ks == 'ks_maMonHoc') {
            bangDiemFilter = bangDiemFilter.filter(mon => mon.maMonHoc.toLowerCase().includes(value.toLowerCase()));
        } else if (ks == 'ks_tenMonHoc') {
            bangDiemFilter = bangDiemFilter.filter(mon => {
                let tenMonHoc = T.parse(mon.tenMonHoc)?.vi;
                return value == '' || tenMonHoc.toLowerCase().includes(value.toLowerCase());
            });
        } else if (ks == 'ks_hkNh') {
            if (value.includes(',')) {
                let [namHoc, hocKy] = value.split(',');
                hocKy = Number(hocKy);
                bangDiemFilter = bangDiemFilter.filter(mon => value == '' || (mon.namHoc == namHoc && (hocKy == '' || mon.hocKy == hocKy)));
            } else {
                bangDiemFilter = bangDiemFilter.filter(mon => value == '' || mon.namHoc == value);
            }
        } else if (ks == 'ks_tuChon') {
            bangDiemFilter = bangDiemFilter.filter(mon => value == '' || mon.loaiMonHoc == Number(value));
        } else if (ks == 'ks_tinChi') {
            bangDiemFilter = bangDiemFilter.filter(mon => value == '' || mon.tinChi == Number(value));
        } else if (ks == 'ks_lop') {
            bangDiemFilter = bangDiemFilter.filter(mon => {
                let lop = mon.maHocPhan.substr(-2);
                return lop.includes(value);
            });
        } else if (ks == 'ks_diem') {
            bangDiemFilter = bangDiemFilter.filter(mon => mon.diemTk.toLowerCase().includes(value.toLowerCase()));
        } else if (ks == 'ks_diemBon') {
            bangDiemFilter = bangDiemFilter.filter(mon => mon.diemBon.diem.toLowerCase().includes(value.toLowerCase()));
        } else if (ks == 'ks_diemChu') {
            bangDiemFilter = bangDiemFilter.filter(mon => mon.diemChu.diem.toLowerCase().includes(value.toLowerCase()));
        } else if (ks == 'ks_ghiChu') {
            bangDiemFilter = bangDiemFilter.filter(mon => mon.ghiChu.toLowerCase().includes(value.toLowerCase()));
        }
        this.setState({ bangDiemFilter });
    }

    render() {
        let { isCheckDiem, bangDiemFilter, isLoading } = this.state;
        let table = renderDataTable({
            data: this.state.listSvChosen,
            emptyTable: 'Chưa chọn sinh viên',
            stickyHead: this.state.listSvChosen.length > 8,
            header: 'thead-light',
            divStyle: { height: '60vh' },
            renderHead: () => <tr>
                <TableHead content='#' />
                <TableHead content='MSSV' />
                <TableHead content='Họ và tên' style={{ width: '60%' }} />
                <TableHead content='Ngày sinh' />
                <TableHead content='Nơi sinh' />
                <TableHead content='Ngành' style={{ width: '25%' }} />
                <TableHead content='Lớp' />
                <TableHead content='Khoá' />
                <TableHead content='Loại hình' style={{ width: '15%' }} />
                <TableHead content='Tình trạng' />
                <TableHead content='Tín chỉ tích luỹ' />
                <TableHead content='Điểm trung bình' />
                <TableHead content='Thao tác' />
            </tr>,
            renderRow: (item, index) => {
                const rows = [];
                rows.push(<tr key={item.mssv}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.mssv} />
                    <TableCell content={`${item.ho} ${item.ten}`} nowrap />
                    <TableCell content={item.ngaySinh ? new Date(item.ngaySinh).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : ''} nowrap />
                    <TableCell content={item.noiSinh || ''} nowrap />
                    <TableCell content={item.tenNganh} nowrap />
                    <TableCell content={item.lop} nowrap />
                    <TableCell content={item.namTuyenSinh} />
                    <TableCell content={item.heDaoTao} nowrap />
                    <TableCell content={item.tenTinhTrangSV} nowrap />
                    <TableCell content={item.tinChiTl} style={{ textAlign: 'center' }} nowrap />
                    <TableCell content={item.diemTrungBinh ? item.diemTrungBinh.toFixed(2) : ''} style={{ textAlign: 'center' }} nowrap />
                    <TableCell type='buttons' permission={this.props.permission} content={item} style={{ textAlign: 'center' }} onDelete={this.delete} >
                        <Tooltip title='Xem chi tiết điểm' arrow>
                            <button className='btn btn-info' onClick={e => {
                                e && e.preventDefault();
                                if (isCheckDiem == item.mssv) this.setState({ isCheckDiem: null });
                                else this.setState({ isCheckDiem: item.mssv, bangDiemFilter: this.state.bangDiem[item.mssv] });
                            }}  >
                                <i className='fa fa-lg fa-search' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr>);
                rows.push(<tr style={{ display: isCheckDiem == item.mssv ? '' : 'none' }}>
                    <td colSpan={13}>
                        {
                            renderDataTable({
                                data: bangDiemFilter ? bangDiemFilter : null,
                                emptyTable: 'Chưa có thông tin điểm!',
                                header: 'thead-light',
                                stickyHead: bangDiemFilter?.length > 5,
                                divStyle: { height: '40vh' },
                                renderHead: () => <tr>
                                    <TableHead style={{ minWidth: '90px', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã MH' keyCol='maMonHoc' onKeySearch={this.onKeySearch} />
                                    <TableHead style={{ minWidth: '600px', whiteSpace: 'nowrap' }} content='Tên môn học' keyCol='tenMonHoc' onKeySearch={this.onKeySearch} />
                                    <TableHead style={{ minWidth: '150px', whiteSpace: 'nowrap', textAlign: 'center' }} content='Năm học, học kỳ' keyCol='hkNh' onKeySearch={this.onKeySearch} />
                                    <TableHead style={{ minWidth: '100px', whiteSpace: 'nowrap', textAlign: 'center' }} content='Số tín chỉ' keyCol='tinChi' onKeySearch={this.onKeySearch} />
                                    <TableHead style={{ minWidth: '90px', whiteSpace: 'nowrap', textAlign: 'center' }} content='Lớp' keyCol='lop' onKeySearch={this.onKeySearch} />
                                    <TableHead style={{ minWidth: '90px', whiteSpace: 'nowrap', textAlign: 'center' }} content='Điểm 10' keyCol='diem' onKeySearch={this.onKeySearch} />
                                    <TableHead style={{ minWidth: '90px', whiteSpace: 'nowrap', textAlign: 'center' }} content='Điểm 4' keyCol='diemBon' onKeySearch={this.onKeySearch} />
                                    <TableHead style={{ minWidth: '90px', whiteSpace: 'nowrap', textAlign: 'center' }} content='Điểm chữ' keyCol='diemChu' onKeySearch={this.onKeySearch} />
                                    <TableHead style={{ minWidth: '90px', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ghi chú' keyCol='ghiChu' onKeySearch={this.onKeySearch} />
                                </tr>,
                                renderRow: (item) => {
                                    return (<tr key={`${item.mssv}_${item.maMonHoc}_${item.namHoc}_${item.hocKy}`}>
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maMonHoc} />
                                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc)?.vi} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={`${item.namHoc}, HK${item.hocKy || ''}`} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tinChi} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maHocPhan.substr(-2)} />
                                        <TableCell style={{ textAlign: 'center' }} content={item.diemTk} />
                                        <TableCell style={{ textAlign: 'center' }} content={item.diemTk && item.diemBon ? item.diemBon.diem : ''} />
                                        <TableCell style={{ textAlign: 'center' }} content={item.diemTk && item.diemChu ? item.diemChu.diem : ''} />
                                        <TableCell content={item.ghiChu} />
                                    </tr>);
                                }
                            })
                        }
                    </td>
                </tr>);
                return rows;
            }
        });
        return <div className='tile'>
            <div className='tile-title-w-btn row mb-2'>
                <div className='col-md-12 row'>
                    <FormSelect className='col-md-3 mb-0' ref={e => this.cheDoIn = e} data={[
                        { id: '1', text: 'Phiếu điểm cá nhân học kỳ' },
                        { id: '2', text: 'Phiếu điểm cá nhân tốt nghiệp' },
                    ]} label='Loại phiếu điểm' required onChange={value => this.setState({ cheDoIn: value.id, listSvChosen: [], isCheckDiem: null, fromSem: '' }, () => {
                        this.sinhVien.value('');
                    })} />
                    <FormSelect ref={e => this.sinhVien = e} className='col-md-3 mb-0' data={SelectAdapter_DtGetStudentInBangDiem({ cheDoIn: this.state.cheDoIn })} label='Chọn sinh viên'
                        placeholder='Sinh viên' onChange={this.chonSinhVien} disabled={isLoading} />
                    <div className='col-md-2' style={{ display: 'flex', gap: 10, visibility: this.state.listSvChosen.length ? 'visible' : 'hidden' }}>
                        <button type='button' className='btn btn-success' style={{ height: '34px', alignSelf: 'flex-end' }}
                            onClick={e => e.preventDefault() || this.modal.show({ cheDoIn: this.state.cheDoIn, typePrint: 'caNhan' })} >In phiếu điểm</button>
                    </div>
                </div>
            </div>
            {isLoading ? <div className='overlay' style={{ minHeight: '120px' }}>
                <div className='m-loader mr-4'>
                    <svg className='m-circular' viewBox='25 25 50 50'>
                        <circle className='path' cx='50' cy='50' r='20' fill='none' strokeWidth='4' strokeMiterlimit='10' />
                    </svg>
                </div>
                <h3 className='l-text'>Đang tải ...</h3>
            </div> : (this.state.listSvChosen.length ? table : null)}
            <ProcessModal ref={e => this.processModal = e} caption='Vui lòng đừng rời khỏi trang cho tới khi file tải về' />
            <PrintBangDiemModal ref={e => this.modal = e} listSvChosen={this.state.listSvChosen} DtDiemInBangDiemCaNhan={this.props.DtDiemInBangDiemCaNhan}
                showProcessModal={() => this.processModal.show()} hideProcessModal={() => this.processModal.hide()} system={this.props.system}
                resetListChosen={this.resetListChosen} tabId={this.props.tabId} />
        </div>;
    }
}

const mapStateToProps = state => ({ system: state.system, dtDiemInBangDiem: state.daoTao.dtDiemInBangDiem });
const mapActionsToProps = {
    DtDiemInBangDiemCaNhan
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionBangDiemCaNhan);