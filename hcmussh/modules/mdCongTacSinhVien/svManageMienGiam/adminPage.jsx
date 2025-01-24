import React from 'react';
import { connect } from 'react-redux';
import { updateSvManageMienGiam, getSvManageMienGiamPage, downloadWord, deleteSvManageMienGiam, createSvManageMienGiam, huyQuyetDinhMienGiam, checkDsMienGiam, svCheckSoQuyetDinh } from './redux/reduxManageMg';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, getValue, FormSelect, FormTabs, FormCheckbox, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';
import { SelectAdapter_CtsvDmFormType } from 'modules/mdCongTacSinhVien/svDmFormType/redux';
import { SelectAdapter_FwStudentsMienGiam } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_PhoTruong } from 'modules/mdTccb/qtChucVu/redux';
import { SelectAdapter_DmMienGiam } from 'modules/mdCongTacSinhVien//dmSvDoiTuongMienGiam/redux';
import { SelectAdapter_SoDangKy } from 'modules/mdHanhChinhTongHop/hcthSoDangKy/redux';
import FileBox from 'view/component/FileBox';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { getScheduleSettings } from 'modules/mdCongTacSinhVien/ctsvDtSetting/redux';
import { getActiveSvDsMienGiam } from './redux/reduxDsmg';
import CreateRequest from 'modules/mdHanhChinhTongHop/hcthSoDangKy/components/createRequest';
import ComponentDsmg from './componentDsmg';
import { SelectAdapter_SoDangKyAlternative } from 'modules/mdHanhChinhTongHop/hcthSoDangKy/redux/soDangKy';

export class ExportModal extends AdminModal {
    state = { namHoc: null, hocKy: null }
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.namHoc.focus();
        }));
    }

    onShow = () => {
        this.props.getScheduleSettings(data => {
            this.setState({ namHoc: data.currentSemester.namHoc, hocKy: data.currentSemester.hocKy });
            this.hocKy.value(data.currentSemester.hocKy);
            this.namHoc.value(data.currentSemester.namHoc);
        });
    }

    onSubmit = () => {
        T.notify('Danh sách sẽ được tải xuống sau vài giây', 'info');
        T.download(`/api/ctsv/mien-giam/export-excel?namHoc=${this.state.namHoc}&hocKy=${this.state.hocKy}`);
        this.hide();
    }

    render = () => {
        return this.renderModal({
            title: 'Tải xuống danh sách sinh viên miên giảm',
            body: (
                <div className='row'>
                    <FormSelect className='col-md-6' label='Năm học' ref={e => this.namHoc = e} data={SelectAdapter_SchoolYear} required onChange={value => this.setState({ namHoc: value.id })} />
                    <FormSelect className='col-md-6' label='Học kỳ' ref={e => this.hocKy = e} data={[{ id: '1', text: 'HK1' }, { id: '2', text: 'HK2' }, { id: '3', text: 'HK3' }]} required onChange={value => this.setState({ hocKy: value.id })} />
                </div>),
            submitText: 'Tải xuống'
        }
        );
    }
}

export class AddModal extends AdminModal {
    state = { isSubmit: 0, tenForm: '', customParam: [], kyKhuyetDanh: false, staffSignPosition: '', dsSinhVien: null, namHoc: null, hocKy: null, timeStart: null, timeEnd: null, error: [], isListChange: false, vanBanDaPhatHanh: false }
    componentDidMount() {
        this.disabledClickOutside();
        this.onHidden(this.onHide);
        this.props.getScheduleSettings(data => {
            this.setState({
                currentSemester: data.currentSemester,
                namHocHienTai: data.currentSemester.namHoc, hocKyHienTai: data.currentSemester.hocKy,
            });
        });

        T.socket.on('created-miengiam', data => {
            const user = this.props.user;
            if (data && data.email != user.email) {
                const currentSqd = this.soQuyetDinh?.value() || null;
                if (data.soQuyetDinh == currentSqd) {
                    const { firstName, lastName } = data;
                    T.notify(`Cán bộ ${lastName} ${firstName} đã sử dụng !${data.soQuyetDinh}`, 'warning');
                    this.soQuyetDinh && this.soQuyetDinh.value(null);

                }
                this.props.getPage();
            }
        });
    }

    componentWillUnmount() {
        T.socket.off('created-miengiam');
    }

    onHide = () => {
        if (this.state.id && !this.state.isSubmit) {
            this.props.update(this.state.id, {
                action: null
            });
        }
    }

    onSuccess = (response) => {
        if (response.error) {
            T.notify(response.error, 'danger');
        } else {
            const curDssv = this.state.dsSinhVien;
            this.setState({ dsSinhVien: null }, () => {
                T.confirm('Thêm sinh viên vào danh sách hiện tại', ''
                    , isConfirm => {
                        if (isConfirm) {
                            const { newItems, dups } = this.processImportResponse(response.items, curDssv);
                            const failed = response.failed.concat(dups);
                            this.setState({ dsSinhVien: newItems.concat(curDssv), error: failed, isListChange: true });
                        }
                        else this.setState({ dsSinhVien: curDssv });
                        this.tabs.tabClick(null, 1);
                        if (response.failed.length > 0) this.dssvTabs.tabClick(null, 1);
                    });
            });
        }
    }

    processImportResponse = (items, curDssv) => {
        const newItems = [], dups = [];
        items.forEach(sv1 => {
            if (curDssv.some(sv2 => sv1.mssv == sv2.mssv)) {
                dups.push({ rowNumber: '', color: 'danger', message: `Sinh viên ${sv1.mssv} đã tồn tại trong danh sách!` });
            } else {
                newItems.push(sv1);
            }
        });
        return { newItems, dups };
    }

    onShow = (item) => {
        let { idQuyetDinh, id, formType, nguoiKy, chucVuNguoiKy, ngayKy, namHoc, hocKy } = item ? item : { idQuyetDinh: '', id: null, loaiMienGiam: '', formType: '', nguoiKy: '', chucVuNguoiKy: '', ngayKy: '' };
        this.setState({ id, item, kyKhuyetDanh: nguoiKy === null ? true : false, isSubmit: 0, staffSign: nguoiKy, position: chucVuNguoiKy, isListChange: false, error: [] }, () => {
            namHoc = namHoc || this.state.namHocHienTai;
            hocKy = hocKy || this.state.hocKyHienTai;
            this.hocKy.value(hocKy);
            this.namHoc.value(namHoc);
            this.props.getDsmg && this.props.getDsmg(id, (data) => {
                this.setState({ namHoc, hocKy, dsSinhVien: data.items }, () => this.dssvTabs.tabClick(null, 0));
            });
        });
        this.soQuyetDinh.value(idQuyetDinh || '');
        this.formType.value(formType || '');
        this.kyKhuyetDanh.value(nguoiKy === null ? true : false);
        this.nguoiKy.value(nguoiKy || '');
        this.ngayKy.value(ngayKy ? ngayKy : Date.now());
        this.tabs.tabClick(null, 0);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const action = this.state.id ? 'cập nhật' : 'tạo';
        if (!this.state.id && !this.state.isListChange) {
            T.notify('Không có thay đổi trong danh sách miễn giảm!', 'danger');
            return;
        }

        const svManageMienGiam = {
            soQuyetDinh: getValue(this.soQuyetDinh),
            staffSign: this.state.kyKhuyetDanh ? null : this.state.staffSign,
            staffSignPosition: this.state.kyKhuyetDanh ? 'Hiệu trưởng' : this.state.position,
            formType: getValue(this.formType),
            tenForm: this.state.tenForm,
            ngayKy: Number(getValue(this.ngayKy)),
            namHoc: this.state.namHoc,
            hocKy: this.state.hocKy,
            listStudent: this.state.dsSinhVien.filter(sv => !sv.isDeleted),
            action: null
        };
        const noChange = this.state.dsSinhVien.filter(sv => sv.isDeleted || sv.isNew).length == 0;
        if (noChange) {
            T.notify('Danh sách sinh viên cho không thay đổi!', 'danger');
            return;
        }
        const done = () => {
            this.setState({ isSubmit: 1, id: null }, () => {
                this.hide();
            });
        };

        T.confirm(`Xác nhận ${action} quyết định`, null,
            isConfirm => {
                isConfirm && (
                    noChange ? T.notify('Danh sách sinh viên cho không thay đổi!', 'danger')
                        : this.state.id ? this.props.update(this.state.id, { ...svManageMienGiam, isSubmit: 1 }, done) : this.props.create({ ...svManageMienGiam, idCvd: this.state.idCvd }, done)
                );
            });
    }

    getDataDangKy = () => {
        let data = {};
        this.state.customParam.forEach(item => {
            data[item.ma] = getValue(this[item.ma]);
        });
        return JSON.stringify(data);
    }

    changeFormType = (value) => {
        this.setState({ customParam: [], tenForm: value.ten });
        this.setState({ customParam: value.customParam.map(item => { item.data = JSON.parse(item.data); return item; }) }, () => {
            this.state.customParam.forEach(item => {
                this[item.ma].value('');
                if (item.type == '1')
                    this[item.ma].value(item.data.text);
            });
        });
    }

    changeKyKhuyetDanh = (value) => {
        this.setState({ kyKhuyetDanh: value });
    }

    changeChucVu = (value) => {
        let shcc = value.id,
            content = value.text;
        this.setState({ staffSign: shcc, position: content.split(': ')[0] });
    }

    addSinhVien = (value) => {
        const { id, namHoc, hocKy } = this.state;
        let newDsSinhVien = [...this.state.dsSinhVien];
        const loaiMienGiam = this.state.loaiMienGiam;
        if (!loaiMienGiam) {
            T.notify('Loại miễn giảm bị trống', 'danger');
            this.loaiMienGiam.focus();
        } else if (!value.ngayNhapHoc || value.ngayNhapHoc < 0) T.notify('Sinh viên không nhập học', 'danger');
        else {
            this.props.checkSv(value.id, loaiMienGiam.id, id, namHoc, hocKy, () => {
                // Viet lai ham check trong controller
                if (newDsSinhVien.some(item => item.mssv == value.id && item.loaiMienGiam == loaiMienGiam.id)) {
                    T.notify('Đã tồn tại sinh viên với loại miễn giảm này trong danh sách', 'danger');
                } else {
                    const currentSemester = this.state.currentSemester;
                    const namKetThuc = value.nienKhoa?.split(/\s*-\s*/).map(nam => parseInt(nam))[1] || new Date(value.ngayNhapHoc).getFullYear() + 4;
                    const dateNhapHoc = value.ngayNhapHoc > 10 ? new Date(value.ngayNhapHoc) : new Date(value.namTuyenSinh, 7, 31),
                        endOfYear = new Date(new Date(currentSemester.beginTime).getFullYear(), 11, 31).getTime(),
                        endOfCourse = new Date(namKetThuc, dateNhapHoc.getMonth(), dateNhapHoc.getDate()).getTime();
                    const newItem = {
                        // ...sinhVien,
                        mssv: value.id,
                        hoTen: value.text.split(': ')[1],
                        loaiHinhDaoTao: value.loaiHinhDaoTao,
                        tinhTrang: value.tinhTrangSinhVien,
                        maTinhTrang: value.tinhTrangHienTai,
                        loaiMienGiam: loaiMienGiam.id,
                        doiTuong: loaiMienGiam.text,
                        thoiGianMienGiam: loaiMienGiam.thoiGian,
                        timeStart: currentSemester.beginTime,
                        timeEnd: Math.min(endOfCourse, loaiMienGiam.thoiGian == 'TK' ? endOfCourse : endOfYear),
                        isNew: true
                    };
                    this.setState({ dsSinhVien: [newItem, ...newDsSinhVien], isListChange: true });
                }
            });
        }
        this.listStudent.value(null);
    }

    deleteSinhVienMienGiam = (item) => {
        const { mssv, isNew } = item;
        T.confirm('Xác nhận xóa sinh viên',
            `<p>Bạn có chắc chắn muốn xóa sinh viên mã ${mssv} khỏi danh sách không?</p>`, isConfirm => {
                if (isConfirm) {
                    let newDsSinhVien = [...this.state.dsSinhVien];
                    const index = newDsSinhVien.findIndex(item => item.mssv == mssv);
                    if (isNew) {
                        newDsSinhVien.splice(index, 1);
                    } else {
                        newDsSinhVien[index].isDeleted = true;
                    }
                    this.setState({ dsSinhVien: newDsSinhVien, isListChange: true });
                }
            });
    }

    reAddSinhVien = (item) => {
        const { mssv } = item;
        let newDsSinhVien = [...this.state.dsSinhVien];
        const index = newDsSinhVien.findIndex(item => item.mssv == mssv);
        newDsSinhVien[index].isDeleted = false;
        this.setState({ dsSinhVien: newDsSinhVien, isListChange: true });
    }

    grantSinhVienMienGiam = (mssv) => {
        let newDsSinhVien = [...this.state.dsSinhVien];
        const index = newDsSinhVien.findIndex(item => item.mssv == mssv);
        newDsSinhVien[index].isHoan = 2; //tái kích hoạt miễn giảm sinh viên
        this.setState({ dsSinhVien: newDsSinhVien, isListChange: true });
    }

    changeLoaiMienGiam = (value) => {
        this.setState({
            loaiMienGiam: {
                ...value,
                text: value.text.split(/\s*:\s*/)[0]
            }
        });
    }

    changeFilterDssv = () => {
        this.setState({ error: [] });
        this.dssvTabs.tabClick(null, 0);
    }

    componentTable = () => {
        const readOnly = this.props.readOnly,
            dsSinhVien = this.state.dsSinhVien;
        return <div className='mt-3'>
            <div className='row'>
                <FormSelect ref={e => this.loaiMienGiam = e} label='Loại miễn giảm' className='col-md-6' data={SelectAdapter_DmMienGiam} required readOnly={readOnly} onChange={this.changeLoaiMienGiam} />
                <FormSelect ref={e => this.listStudent = e} label='Thêm sinh viên' className='col-md-6' data={SelectAdapter_FwStudentsMienGiam} readOnly={readOnly} onChange={this.addSinhVien} />
            </div>
            <div className='mt-3'>{dsSinhVien && dsSinhVien.length != 0 ? <>
                <p>Danh sách này có tổng cộng {dsSinhVien.length} sinh viên.
                    {this.state.id && <a href='#' onClick={e => {
                        e.preventDefault();
                        T.download(`/api/ctsv/mien-giam/download-ds-mien-giam/${this.state.id}?namHoc=${this.state.namHoc}&hocKy=${this.state.hocKy}`);
                    }}>Tải xuống danh sách trên</a>}
                </p>
            </> : null}</div>
            {renderTable({
                getDataSource: () => dsSinhVien,
                // emptyTable: `Không có danh sách sinh viên trong năm học ${this.state.namHoc} và học kỳ ${this.state.hocKy}`,
                renderHead: () => <tr style={{ width: '100%', position: 'sticky' }}>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>MSSV</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Họ tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ đào tạo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SQĐ Miễn giảm</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Đối tượng MG</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày áp dụng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày hết hạn</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>,
                renderRow: (item, index) =>
                    <tr key={index} style={{ backgroundColor: item.isHoan == 1 ? '#f0ad4e' : '' }}>
                        <TableCell content={index + 1} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell content={<>{item.mssv} {item.isNew && <span className='badge badge-secondary'>Mới</span>}</>} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell content={item.hoTen} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell content={item.loaiHinhDaoTao} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell content={item.tinhTrang} style={{ whiteSpace: 'nowrap', backgroundColor: item.maTinhTrang != 1 ? '#f0ad4e' : '' }} />
                        <TableCell content={item.soCongVan || this.state.soQuyetDinhText} />
                        <TableCell content={item.doiTuong} />
                        <TableCell content={item.timeStart} type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap' }} />
                        <TableCell content={item.timeEnd} type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap' }} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<>
                            {!item.isDeleted && <Tooltip title='Xóa' arrow placeholder='bottom'><button className='btn btn-danger btn-sm' onClick={e => {
                                e.preventDefault();
                                this.deleteSinhVienMienGiam(item);
                            }}>
                                <i className='fa fa-sm fa-trash' />
                            </button></Tooltip>}
                            {item.isDeleted && <Tooltip title='Hoàn tác' arrow placeholder='bottom'><button className='btn btn-warning btn-sm' onClick={e => {
                                e.preventDefault();
                                this.reAddSinhVien(item);
                            }}>
                                <i className='fa fa-sm fa-repeat' />
                            </button></Tooltip>}
                        </>} />
                    </tr>
            })}
        </div>;
    }

    componentError = () => (
        <div style={{ height: 'calc(100vh - 200px)' }}>
            <div style={{ overflowY: 'scroll', overflowX: 'hidden', height: '100%' }}>
                {this.state.error?.map((item, index) => (
                    <div key={index} className='row'>
                        <p className={`col-md-3 text-${item.color}`}>{`Hàng ${item.rowNumber}`}:</p>
                        <p className={`col-md-9 text-${item.color}`}>{item.message}</p>
                    </div>
                ))}
            </div>
        </div>
    )

    onShowRequestModal = () => {
        $(this.modal).modal('hide');
        setTimeout(() => {
            this.props.requestModal.show({
                onHide: () => $(this.modal).modal('show'), onCreateCallback: (data, done) => {
                    done && done();
                    data.soVanBan && this.soQuyetDinh.value(data.soVanBan);
                },
                loaiVanBan: 42,
                lyDo: this.formType.data()?.text
            });
        }, 300);
    }

    changeSoQuyetDinh = (value) => {
        this.props.svCheckSoQuyetDinh(value.id, (data) => {
            if (data.error) {
                this.soQuyetDinh.value('');
            } else {
                this.setState({ idCvd: value.idVanBan, soQuyetDinhText: value.text.split(/[:;]/)[1].trim() });
            }
        });
    }

    componentForm = () => {
        const readOnly = this.props.readOnly;
        const namHocHienTai = '2022 - 2023';
        return <div className='row mt-3'>
            {!this.state.id ? <>
                <FormCheckbox ref={e => this.vanBanDaPhatHanh = e} label='Văn bản đã tồn tại bên vpdt' className='col-md-12' onChange={value => this.setState({ vanBanDaPhatHanh: value }, () => this.soQuyetDinh.value(''))} />
            </> : ''}
            <FormSelect ref={e => this.soQuyetDinh = e} className='col-md-12' label={(this.state.id ? true : readOnly) ? 'Số quyết định' : <div>Số quyết định <span className='text-danger'>*&nbsp;</span> <Link to='#' onClick={this.onShowRequestModal}>(Nhấn vào đây để thêm)</Link></div>} data={SelectAdapter_SoDangKyAlternative([32], 'TRUONG', ['QĐ'], this.state.vanBanDaPhatHanh ? 1 : 0)} readOnly={this.state.id ? true : readOnly} placeholder='Số quyết định' onChange={value => this.changeSoQuyetDinh(value)} />
            <FormSelect ref={e => this.formType = e} label='Loại Quyết định' readOnly={this.state.id ? true : readOnly} className='col-md-6' data={SelectAdapter_CtsvDmFormType(namHocHienTai, 3)} onChange={this.changeFormType} required />
            {this.state.customParam.length ? this.state.customParam.map((item, index) => {
                if (item.type == '2') {
                    return (<FormSelect key={index} label={item.tenBien} ref={e => this[item.ma] = e} data={item.data.map(param => ({ id: param.text, text: param.text }))} className='form-group col-md-12' required readOnly={readOnly} />);
                }
                else {
                    return (<FormTextBox key={index} type='text' label={item.tenBien} ref={e => this[item.ma] = e} className='form-group col-md-12' required readOnly={readOnly} />);
                }
            }) : null}
            <div className='col-md-12'>
                Thêm file excel danh sách sinh viên. Tải file mẫu tại <a href='#' onClick={e => e.preventDefault() || T.download('/api/ctsv/mien-giam/download-template')}>đây</a>
            </div>
            <FileBox className='col-md-12' postUrl={`/user/upload?namHoc=${this.state.namHoc}&hocKy=${this.state.hocKy}&qdId=${this.state.id}`} uploadType='DsMienGiamData' userData={'DsMienGiamData'}
                accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' label='Nhấn hoặc kéo thả file excel chứa danh sách sinh viên'
                ajax={true} success={this.onSuccess} />
            {/* <FormSelect multiple ref={e => this.listStudent = e} label='Thêm sinh viên' className='col-md-12' data={SelectAdapter_FwStudentsManageForm} readOnly={readOnly} onChange={this.changeListStudent} /> */}
            <FormCheckbox ref={e => this.kyKhuyetDanh = e} label='Ký khuyết danh' className='col-md-12' onChange={value => this.changeKyKhuyetDanh(value)} readOnly={readOnly} />
            <FormSelect ref={e => this.nguoiKy = e} label='Người ký' className='col-md-6' data={SelectAdapter_PhoTruong(68)} onChange={this.changeChucVu} required readOnly={readOnly} disabled={this.state.kyKhuyetDanh ? true : false} />
            <FormDatePicker type='date-mask' ref={e => this.ngayKy = e} label='Ngày ký' className='col-md-6' readOnly={readOnly} />
        </div>;
    }

    componentDsmg = () => <>
        <FormTabs ref={e => this.dssvTabs = e} tabs={[
            { title: 'DSSV', component: this.componentTable() },
            { title: <>Thông báo {this.state.error.length ? <span className='badge badge-danger'>{this.state.error.length}</span> : null}</>, component: this.componentError(), disabled: this.state.error.length == 0 },
        ]} />
    </>;

    render = () => {
        return this.renderModal({
            title: this.state.id ? (this.state.item.isDeleted ? 'Chi tiết quyết định miễn giảm' : 'Cập nhật quyết định miễn giảm') : 'Tạo quyết định miễn giảm',
            size: 'elarge',
            body: (<div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', overflowX: 'hidden' }}>
                <div className='row'>
                    <FormSelect ref={e => this.namHoc = e} className='col-md-6' label='Năm học' data={SelectAdapter_SchoolYear} required readOnly />
                    <FormSelect ref={e => this.hocKy = e} label='Học kỳ' className='col-md-6' data={[{ id: '1', text: 'HK1' }, { id: '2', text: 'HK2' }, { id: '3', text: 'HK3' }]} required readOnly />
                </div>
                <FormTabs ref={e => this.tabs = e} tabs={[
                    { title: 'Thông tin', component: this.componentForm() },
                    { title: 'Danh sách sinh viên', component: this.componentDsmg(), disabled: !this.props.getDsmg },
                ]} />
            </div>),
            submitText: this.state.id ? 'Cập nhật' : 'Tạo mới'
        }
        );
    }
}

export class HuyMienGiamModal extends AdminModal {
    state = { tenForm: '', customParam: [], kyKhuyetDanh: false, staffSignPosition: '', dsSinhVien: [], namHocHienTai: null, hocKyHienTai: null }

    onShow = (item) => {
        let { idQuyetDinh, id, formType, nguoiKy, ngayKy, idLoaiMienGiam, dsSinhVien, timeStart, timeEnd } = item ? item : { idQuyetDinh: '', id: null, loaiMienGiam: '', formType: '', nguoiKy: '', ngayKy: '', idLoaiMienGiam: '', dsSinhVien: [], timeStart: '', timeEnd: '' };
        this.props.getScheduleSettings((data) => {
            this.setState({ currentSemester: data.currentSemester, namHocHienTai: data.currentSemester.namHoc, hocKyHienTai: data.currentSemester.hocKy }, () => {
                dsSinhVien = dsSinhVien.filter(item => (item.namHoc == this.state.namHocHienTai && item.hocKy == this.state.hocKyHienTai));
                this.setState({ id, item, kyKhuyetDanh: nguoiKy === null ? true : false, position: nguoiKy, dsSinhVien });
            });
        });
        this.soQuyetDinh.value(idQuyetDinh);
        this.loaiMienGiam.value(idLoaiMienGiam);
        this.formType.value(formType);
        this.kyKhuyetDanh.value(nguoiKy === null ? true : false);
        this.nguoiKy.value(nguoiKy);
        this.timeStart.value(timeStart);
        this.timeEnd.value(timeEnd);
        this.ngayKy.value(ngayKy);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const done = () => {
            this.setState({ isSubmit: 1, id: null }, () => {
                this.hide();
            });
        };
        T.confirm('Xác nhận hủy quyết định',
            '<p>Bạn có chắc chắn muốn hủy quyết định này?</p><p style="color: red">Lưu ý: Một khi đã đồng ý, hệ thống sẽ lập tức cập nhật thông tin sinh viên.</p></>'
            , isConfirm => {
                isConfirm && (
                    this.props.huyQuyetDinh(this.state.id, { isDeleted: 1 }, done)
                );
            });
    }

    render = () => {
        const readOnly = true;
        const { dsSinhVien } = this.state;
        return this.renderModal({
            title: 'Hủy quyết định miễn giảm',
            size: 'elarge',
            body: (<div className='row'>
                <div className={'form-group ' + (dsSinhVien.length > 0 ? 'col-md-6' : 'col-md-8')}>
                    <div className='row'>
                        <FormSelect ref={e => this.soQuyetDinh = e} className='col-md-12' label='Số quyết định' data={SelectAdapter_SoDangKy(32, 'TRUONG', 42, null)} required readOnly={this.state.maDangKy ? true : readOnly} />
                        <FormSelect ref={e => this.loaiMienGiam = e} label='Loại miễn giảm' className='col-md-12' data={SelectAdapter_DmMienGiam} required readOnly={readOnly} />
                        <FormDatePicker type='date-mask' ref={e => this.timeStart = e} label='Ngày áp dụng' className='col-md-6' readOnly={readOnly} onChange={this.changeThoiGianBatDau} required />
                        <FormDatePicker type='date-mask' ref={e => this.timeEnd = e} label='Ngày kết thúc' className='col-md-6' readOnly={readOnly} />
                        <FormSelect ref={e => this.formType = e} label='Loại chứng nhận' className='col-md-12' data={SelectAdapter_CtsvDmFormType(3)} onChange={this.changeFormType} readOnly={readOnly} required />
                        {this.state.customParam.length ? this.state.customParam.map((item, index) => {
                            if (item.type == '2') {
                                return (<FormSelect key={index} label={item.tenBien} ref={e => this[item.ma] = e} data={item.data.map(param => ({ id: param.text, text: param.text }))} className='form-group col-md-12' required readOnly={readOnly} />);
                            }
                            else {
                                return (<FormTextBox key={index} type='text' label={item.tenBien} ref={e => this[item.ma] = e} className='form-group col-md-12' required readOnly={readOnly} />);
                            }
                        }) : null}
                        <FormCheckbox ref={e => this.kyKhuyetDanh = e} label='Ký khuyết danh' className='col-md-12' onChange={value => this.changeKyKhuyetDanh(value)} readOnly={readOnly} />
                        <FormSelect ref={e => this.nguoiKy = e} label='Chọn người ký' className='col-md-6' data={SelectAdapter_PhoTruong(68)} onChange={this.changeChucVu} required readOnly={readOnly} disabled={this.state.kyKhuyetDanh ? true : false} />
                        <FormDatePicker type='date-mask' ref={e => this.ngayKy = e} label='Ngày ký' className='col-md-6' readOnly={readOnly} />
                    </div>
                </div>
                <div className={'form-group ' + (dsSinhVien.length > 0 ? 'col-md-6' : 'col-md-8')}>
                    {renderTable({
                        getDataSource: () => dsSinhVien,
                        stickyHead: true,
                        renderHead: () => <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>MSSV</th>
                            <th style={{ width: '80%', whiteSpace: 'nowrap' }}>Họ tên</th>
                            <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Hệ đào tạo</th>
                            <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Tình trạng</th>
                        </tr>,
                        renderRow: (item, index) =>
                            <tr key={index}>
                                <TableCell content={index + 1} />
                                <TableCell content={item.mssv} style={{ whiteSpace: 'nowrap' }} />
                                <TableCell content={item.hoTen} style={{ whiteSpace: 'nowrap' }} />
                                <TableCell content={item.loaiHinhDaoTao} style={{ whiteSpace: 'nowrap' }} />
                                <TableCell content={item.tinhTrang} style={{ whiteSpace: 'nowrap' }} />
                            </tr>
                    })}
                    <div className='mt-3'>Danh sách này có tổng cộng {dsSinhVien.length} sinh viên.</div>
                </div>
            </div>),
            submitText: 'Hủy quyết định'
        }
        );
    }
}

class svManageMienGiamPage extends AdminPage {
    state = { namHocHienTai: null, hocKyHienTai: null }
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            T.onSearch = (searchText) => this.props.getSvManageMienGiamPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getSvManageMienGiamPage();
            this.props.getScheduleSettings((data) => {
                this.setState({ currentSemester: data.currentSemester, namHocHienTai: data.currentSemester.namHoc, hocKyHienTai: data.currentSemester.hocKy });
            });
            T.socket.on('updated-miengiam', (data) => {
                const user = this.props.system.user;
                if (data && data.email != user.email && !data.isNew) {
                    const { firstName, lastName, id } = data;
                    data.isSubmit && T.notify(`Cán bộ ${lastName} ${firstName} đã chỉnh sửa !${id}`, 'info');
                }
                this.props.getSvManageMienGiamPage();
            });
        });
    }

    componentWillUnmount() {
        T.socket.off('updated-miengiam');
    }

    showModal = (e) => {
        e.preventDefault();
        this.addModal.show();
    };


    downloadWord = (e, item) => {
        e.preventDefault();
        const { namHocHienTai, hocKyHienTai } = this.state;
        this.props.downloadWord(item.id, namHocHienTai, hocKyHienTai, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), item.soQuyetDinh + '_' + item.formType + '.docx');
        });
    }

    deleteItem = (item) => {
        T.confirm('Xóa form đăng ký này', 'Bạn có chắc bạn muốn xóa quyết định này?', true, isConfirm =>
            isConfirm && this.props.deleteSvManageMienGiam(item.id, item.idQuyetDinh));
    }



    componentMienGiam = (isDeleted) => {
        const permission = this.getUserPermission('manageMienGiam', ['read', 'write', 'cancel', 'delete', 'ctsv', 'edit']);
        let { list, pageNumber, pageSize, pageTotal, totalItem, pageCondition } = this.props.svManageMienGiam && this.props.svManageMienGiam.page ? this.props.svManageMienGiam.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        return <>
            {renderTable({
                getDataSource: () => list.filter(item => (item.isDeleted == isDeleted)),
                className: 'table-fix-col',
                stickyHead: true,
                header: 'thead-light',
                renderHead: () => (
                    <tr>
                        {/* <th style={{ width: 'auto', textAlign: 'center' }}>#</th> */}
                        <th style={{ width: 'auto', textAlign: 'center' }}>Mã</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quyết định</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Loại quyết định</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Trạng thái</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Người ký</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày ký</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Người xử lý</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        {/* <TableCell type='number' content={pageSize * pageNumber + index + 1 - pageSize} /> */}
                        <TableCell content={item.id} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soQuyetDinh} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenForm} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', color: item.trangThaiColor }} content={<div><i className={`fa fa-lg ${item.statusIcon}`} />&nbsp; &nbsp;{item.tenTrangThai}</div>}></TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.nguoiKy ? <>{item.chucVuNguoiKy}<br />{item.hoTenNguoiKy}</> : ''} />
                        <TableCell type='date' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayKy != null && (item.ngayKy)} dateFormat='dd/mm/yyyy' />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.nguoiXuLy} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<>
                            {(permission.edit && isDeleted == 0 && item.action == null) && <Tooltip title='Xem chi tiết' arrow>
                                <button className='btn btn-info' onClick={e => {
                                    e.preventDefault();
                                    this.props.updateSvManageMienGiam(item.id, { action: 'P' });
                                    this.addModal.show(item);
                                }}>
                                    <i className='fa fa-lg fa-edit' />
                                </button>
                            </Tooltip>}
                            {(permission.cancel && isDeleted == 0) && <Tooltip title='Hủy' arrow>
                                <button className='btn btn-danger' onClick={e => { e.preventDefault(); this.huyModal.show(item); }}>
                                    <i className='fa fa-lg fa-ban' />
                                </button>
                            </Tooltip>}
                            {isDeleted == 1 ? <Tooltip title='Xem chi tiết' arrow>
                                <button className='btn btn-info' onClick={e => {
                                    e.preventDefault();
                                    // this.props.updateSvManageMienGiam(item.maDangKy, { action: 'P' });
                                    this.detailModal.show(item);
                                }}>
                                    <i className='fa fa-lg fa-info-circle' />
                                </button>
                            </Tooltip> : < Tooltip title='Download' arrow>
                                <button className='btn btn-primary' onClick={e => { e.preventDefault(); this.downloadWord(e, item); }}>
                                    <i className='fa fa-lg fa-file-word-o' />
                                </button>
                            </Tooltip>}
                            {permission.delete && <Tooltip title='Xóa' arrow>
                                <button className='btn btn-danger' onClick={e => { e.preventDefault(); this.deleteItem(item); }}>
                                    <i className='fa fa-lg fa-trash-o' />
                                </button>
                            </Tooltip>}
                        </>
                        }>
                        </TableCell>
                    </tr>
                ),
            })}
            <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getSvManageFormPage} />
        </>;
    }

    componentTabs = () => <FormTabs
        tabs={[
            { id: 1, title: 'Quyết định miễn giảm', component: this.componentMienGiam(0) },
            { id: 2, title: 'Quyết định hủy', component: this.componentMienGiam(1) },
        ]}
    />


    render() {
        // user = this.props.system.user;
        const permission = this.getUserPermission('manageMienGiam', ['read', 'write', 'delete', 'ctsv']);


        return this.renderPage({
            icon: 'fa fa-address-book',
            title: 'Quản lý miễn giảm',
            breadcrumb: [
                <Link key={0} to={'/user/ctsv'}>
                    Công tác sinh viên
                </Link>,
                'Quản lý miễn giảm',
            ],
            content: (
                <>
                    <FormTabs
                        contentClassName='tile'
                        tabs={[
                            { id: 1, title: 'Quyết định miễn giảm', component: this.componentTabs() },
                            { id: 2, title: 'Danh sách sinh viên miễn giảm', component: <ComponentDsmg permission={permission} currentSemester={this.state.currentSemester} /> },
                        ]}
                    />
                    {/* <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getSvManageFormPage} /> */}
                    <AddModal ref={e => this.addModal = e} requestModal={this.requestModal} readOnly={!permission.write} download={this.downloadWord} create={this.props.createSvManageMienGiam} update={this.props.updateSvManageMienGiam} getDsmg={this.props.getActiveSvDsMienGiam} getScheduleSettings={this.props.getScheduleSettings} checkSv={this.props.checkDsMienGiam} user={this.props.system.user} getPage={this.props.getSvManageMienGiamPage} svCheckSoQuyetDinh={this.props.svCheckSoQuyetDinh} />
                    <AddModal ref={e => this.detailModal = e} requestModal={this.requestModal} readOnly={true} update={this.props.updateSvManageMienGiam} checkSv={this.props.checkDsMienGiam} user={this.props.system.user} getScheduleSettings={this.props.getScheduleSettings} />
                    <HuyMienGiamModal ref={e => this.huyModal = e} readOnly={!permission.write} huyQuyetDinh={this.props.huyQuyetDinhMienGiam} update={this.props.updateSvManageMienGiam} getScheduleSettings={this.props.getScheduleSettings} />
                    <ExportModal ref={e => this.exportModal = e} getScheduleSettings={this.props.getScheduleSettings} />
                    <CreateRequest ref={e => this.requestModal = e} onHide={this.onHideRequest} />
                </>
            ),
            backRoute: '/user/ctsv',
            collapse: [
                { icon: 'fa-plus', type: 'info', name: 'Tạo mới', onClick: () => this.addModal.show(), permission: permission.write },
                { icon: 'fa-file-excel-o', type: 'success', name: 'Export', onClick: () => this.exportModal.show(), permission: permission.write }
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, svManageMienGiam: state.ctsv.svManageMienGiam });
const mapActionsToProps = { updateSvManageMienGiam, getSvManageMienGiamPage, downloadWord, deleteSvManageMienGiam, createSvManageMienGiam, huyQuyetDinhMienGiam, getScheduleSettings, checkDsMienGiam, getActiveSvDsMienGiam, svCheckSoQuyetDinh };
export default connect(mapStateToProps, mapActionsToProps)(svManageMienGiamPage);