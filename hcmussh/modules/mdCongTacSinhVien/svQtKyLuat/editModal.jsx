import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { TableCell, renderTable, AdminModal, FormSelect, FormCheckbox, FormDatePicker, FormRichTextBox, getValue, FormTabs, FormFileBox } from 'view/component/AdminPage';
import { createSvQtKyLuatMultiple, updateSvQtKyLuat, checkSinhVien, fetchDsSinhVien, svCheckSoQuyetDinh } from './redux';
import { SelectAdapter_DmHinhThucKyLuat, getAllSvDmHinhThucKyLuat } from 'modules/mdCongTacSinhVien/svDmHinhThucKyLuat/redux';
import { SelectAdapter_FwStudentKyLuat } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_SoDangKyAlternative } from 'modules/mdHanhChinhTongHop/hcthSoDangKy/redux/soDangKy';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_PhoTruong } from 'modules/mdTccb/qtChucVu/redux';
import { SelectAdapter_CtsvDmFormType } from '../svDmFormType/redux';
import CustomParamComponent from 'modules/mdCongTacSinhVien/svManageForm/component/customParam';
import { getScheduleSettings } from 'modules/mdCongTacSinhVien/ctsvDtSetting/redux';
import { Tooltip } from '@mui/material';

function mapArrayToObject(arr, keyString) {
    return arr.reduce((obj, item) => {
        obj[item[keyString]] = item;
        return obj;
    }, {});
}

class EditModal extends AdminModal {
    state = { id: '', kyKhuyetDanh: false, customParam: [], dssv: [], errors: [], canThoiGian: false, dmHinhThucKyLuat: [], dmHinhThucKyLuatSelect: [] };
    multiple = false;

    componentDidMount() {
        this.onHidden(this.onHide);
        this.props.getScheduleSettings(semester => {
            const currentSemester = semester.currentSemester;
            this.setState({ namHocHienTai: currentSemester.namHoc, hocKyHienTai: currentSemester.hocKy });
        });
    }

    onShow = (item, multiple = true) => {
        this.multiple = multiple;
        let { id, lyDoHinhThuc, noiDung, namHoc, hocKy, idSoQuyetDinh, ngayKy, staffSign, staffSignPosition,
            model, dataCustom, formType, canThoiGian, ngayBatDau, ngayKetThuc, dssv, idCauHinh, namHocBieuMau } = item ?? {};
        model = model ? JSON.parse(model) : [];
        dataCustom = dataCustom ? JSON.parse(dataCustom) : {};
        this.setState({
            id, customParam: model, kyKhuyetDanh: staffSign === null ? true : false,
            staffSignPosition, staffSign, canThoiGian, dssv: dssv || [], idCauHinh, namHoc, namHocBieuMau: namHocBieuMau || this.state.namHocHienTai,
        }, () => {
            model.forEach(item => this[item.ma].value(dataCustom[item.ma] ? dataCustom[item.ma] : ''));
            // this.mssv.value(mssv);
            this.hinhThucKyLuat.value(lyDoHinhThuc);
            this.noiDung.value(noiDung || '');
            this.namHocBieuMau?.value(namHocBieuMau || this.state.namHocHienTai);
            this.namHoc?.value(namHoc || this.state.namHocHienTai);
            this.hocKy?.value(hocKy || this.state.hocKyHienTai);
            this.soQuyetDinh.value(idSoQuyetDinh || '');
            this.ngayKy.value(ngayKy || Date.now());
            this.nguoiKy.value(staffSign || '');
            this.formType.value(formType || '');
            this.ngayBatDau?.value(ngayBatDau || '');
            this.ngayKetThuc?.value(ngayKetThuc || '');
            this.props.getAllSvDmHinhThucKyLuat((data) => {
                this.setState({ dmHinhThucKyLuat: data }, () => {
                    this.state.dssv.length && this.getDmHinhThuc(this.state.dssv);
                    if (this.state.id) {
                        this.props.fetchDsSinhVien(id, items => {
                            this.setState(prevState => ({ dssv: items && items.length ? items : (prevState.dssv || []) }),
                                () => {
                                    this.dssvTabs.tabClick(null, this.state.dssv ? 1 : 0);
                                    this.getDmHinhThuc(this.state.dssv);
                                });
                        });
                    } else {
                        // Default on upload tab
                        this.dssvTabs.tabClick(null, 0);
                    }
                });
            });
        });
    };

    onHide = () => {
        this.setState({ errors: [] });
    }

    onUploadSuccess = (res) => {
        if (res.error) {
            T.notify(res.error, 'danger');
        } else {
            this.addSinhVienList(res.items);
            this.setState({ errors: res.errors }, () => {
                this.dssvTabs.tabClick(null, res.errors.length ? 2 : 1);
            });
        }
    }

    changeKyKhuyetDanh = (value) => {
        this.setState({ kyKhuyetDanh: value });
    }

    changeChucVu = (value) => {
        let shcc = value.id,
            content = value.text;
        this.setState({ staffSign: shcc, position: content.split(': ')[0] });
    }

    changeNamHoc = (value) => {
        this.setState({ namHoc: value.id }, () => this.formType.value(null));
    }

    onSubmit = (e) => {
        const { idCauHinh, customParam, kyKhuyetDanh, staffSign, position, canThoiGian, dssv } = this.state;
        e.preventDefault();
        let changes = {
            namHoc: getValue(this.namHoc),
            hocKy: getValue(this.hocKy),
            soQuyetDinh: this.soQuyetDinh.value(),
            formType: getValue(this.formType),
            dataCustom: this.getDataDangKy(),
            // lyDoHinhThuc: Number(getValue(this.hinhThucKyLuat)),
            // chuyenTinhTrang: this.hinhThucKyLuat.data()?.chuyenTinhTrang,
            noiDung: this.noiDung.value(),
            model: JSON.stringify(customParam),
            staffSign: kyKhuyetDanh ? null : staffSign,
            staffSignPosition: kyKhuyetDanh ? 'Hiệu trưởng' : position,
            ngayKy: Number(this.ngayKy.value()),
            ngayBatDau: canThoiGian == true ? Number(this.ngayBatDau.value()) : null,
            ngayKetThuc: canThoiGian == true ? Number(this.ngayKetThuc.value()) : null,
            listMssv: dssv?.map(item => ({ mssv: item.mssv, tinhTrangTruoc: item.tinhTrangTruoc, hinhThucKyLuat: item.hinhThucKyLuat, chuyenTinhTrang: item.chuyenTinhTrang })),
            idCauHinh,
        };
        if (!changes.listMssv || changes.listMssv.length == 0) {
            T.notify('Danh sách sinh viên bị trống', 'danger');
        } else if (!this.soQuyetDinh.value()) {
            T.notify('Số quyết định trống', 'danger');
            this.soQuyetDinh.focus();
        } else if (!this.ngayKy.value()) {
            T.notify('Ngày Ký quyết định trống', 'danger');
            this.ngayKy.focus();
        } else if (!this.hinhThucKyLuat.value()) {
            T.notify('Hình thức kỷ luật trống', 'danger');
            this.hinhThucKyLuat.focus();
        } else {
            const { id } = this.state;
            T.confirm(`${id ? 'Chỉnh sửa' : 'Tạo'} quyết định kỷ luật`, `Vui lòng kiểm tra kỹ thông tin trước khi ${id ? 'chỉnh sửa' : 'tạo'} quyết định`, (isConfirm) => {
                if (isConfirm)
                    id ? this.props.updateSvQtKyLuat(this.state.id, changes, () => {
                        this.hide();
                        this.props.goTo && this.props.goTo('/user/ctsv/qua-trinh/ky-luat');
                    }) : this.props.createSvQtKyLuatMultiple({ ...changes, idCvd: this.state.idCvd }, () => {
                        this.hide();
                        this.props.goTo && this.props.goTo('/user/ctsv/qua-trinh/ky-luat');
                    });
            });
        }
    }

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

    changeKieuQuyetDinh = (value) => {
        this.setState({ customParam: [] });
        this.setState({ customParam: value.customParam.map(item => { item.data = JSON.parse(item.data); return item; }) }, () => {
            this.state.customParam.forEach(item => {
                this[item.ma].value('');
                if (item.type == '1')
                    this[item.ma].value(item.data.text);
            });
        });
    }

    getDataDangKy = () => {
        let data = {};
        this.state.customParam.forEach(item => {
            Object.assign(data, this[item.ma].getDataDangKy());
        });
        return JSON.stringify(data);
    }

    changeHinhThucKyLuat = (value) => {
        this.setState({ canThoiGian: value.canThoiGian });
    }

    changeSoQuyetDinh = (value) => {
        this.props.svCheckSoQuyetDinh(value.id, (data) => {
            if (data.error) {
                this.soQuyetDinh.value('');
            } else {
                this.setState({ idCvd: value.idVanBan });
            }
        });
    }

    componentThongTin = () => {
        const readOnly = this.props.readOnly;
        return <>
            <div className='row'>
                {!this.state.id ? <>
                    <FormCheckbox ref={e => this.vanBanDaPhatHanh = e} label='Văn bản đã tồn tại bên vpdt' className='col-md-12' onChange={value => this.setState({ vanBanDaPhatHanh: value }, () => this.soQuyetDinh.value(''))} />
                </> : ''}
                <FormSelect ref={e => this.soQuyetDinh = e} className='col-md-12' label={(this.state.id ? true : readOnly) ? 'Số quyết định' : <div>Số quyết định <span className='text-danger'>*&nbsp;</span> <Link to='#' onClick={this.onShowRequestModal}>(Nhấn vào đây để thêm)</Link></div>} data={SelectAdapter_SoDangKyAlternative([32], 'TRUONG', ['QĐ'], this.state.vanBanDaPhatHanh ? 1 : 0)} readOnly={this.state.id ? true : readOnly} placeholder='Số quyết định' onChange={value => this.changeSoQuyetDinh(value)} />
                <FormSelect className='col-md-12' ref={e => this.namHocBieuMau = e} label='Nhóm biểu mẫu (năm học)' required data={SelectAdapter_SchoolYear} onChange={(value) => this.changeNamHoc(value)} readOnly={readOnly || this.state.id} />
                <FormSelect minimumResultsForSearch={-1} ref={e => this.formType = e} label='Kiểu quyết định' className='col-md-12' data={SelectAdapter_CtsvDmFormType(this.state.namHocBieuMau, '3')} onChange={value => this.changeKieuQuyetDinh(value)} placeholder='Loại form' readOnly={readOnly} required />
                <p className='col-md-12'>Quyết định vào hiệu lực từ <span className='text-danger'>*</span> </p>
                <FormSelect className='col-md-6' ref={e => this.namHoc = e} placeholder='Năm học' required data={SelectAdapter_SchoolYear} readOnly={readOnly || this.state.id} />
                <FormSelect className='col-md-6' ref={e => this.hocKy = e} placeholder='Học kỳ' required data={[{ id: '1', text: 'HK1' }, { id: '2', text: 'HK2' }, { id: '3', text: 'HK3' }]} readOnly={readOnly || this.state.id} />
            </div>
            <div className='row'>
                {this.state.customParam.length ? this.state.customParam.map((item, index) => {
                    return <CustomParamComponent key={index} ref={e => this[item.ma] = e} param={item} />;
                }) : null}
            </div>
            <div className='row'>
                {/* <FormSelect className='col-md-6' multiple={this.multiple} ref={e => this.mssv = e} label='Sinh viên kỷ luật' data={SelectAdapter_FwStudent} readOnly={!!this.state.id} required /> */}
                <FormSelect className='col-md-12' ref={e => this.hinhThucKyLuat = e} label='Hình thức kỷ luật' data={SelectAdapter_DmHinhThucKyLuat} onChange={(value) => this.changeHinhThucKyLuat(value)} readOnly={true} required multiple={true} />
                {this.state.canThoiGian == true &&
                    <>
                        <FormDatePicker className='col-md-6' type='date-mask' ref={e => this.ngayBatDau = e} label='Ngày bắt đầu' readOnly={readOnly} required />
                        <FormDatePicker className='col-md-6' type='date-mask' ref={e => this.ngayKetThuc = e} label='Ngày kết thúc' readOnly={readOnly} required />
                    </>}
                <FormCheckbox ref={e => this.kyKhuyetDanh = e} label='Ký khuyết danh' className='col-md-12' onChange={value => this.changeKyKhuyetDanh(value)} readOnly={readOnly} />
                <FormSelect ref={e => this.nguoiKy = e} label='Chọn người ký' className='col-md-6' data={SelectAdapter_PhoTruong(68)} onChange={this.changeChucVu} required readOnly={readOnly} disabled={this.state.kyKhuyetDanh ? true : false} />
                <FormDatePicker className='col-md-6' type='date-mask' ref={e => this.ngayKy = e} label='Ngày ký quyết định' readOnly={readOnly} required />
                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={8} readOnly={readOnly} label='Nội dung kỷ luật' placeholder='Nhập nội dung kỷ luật (tối đa 1000 ký tự)' />
            </div>
        </>;
    }

    componentDssvTheoHinhThuc = (maHinhThuc) => {
        const readOnly = this.props.readOnly;
        const dssv = (this.state.dssv || []).filter(item => item.hinhThucKyLuat == maHinhThuc);
        return (
            <div className='mt-3'>
                <div className='d-flex justify-content-between align-items-baseline'>
                    <p>Danh sách này có {dssv?.length || 0} sinh viên.</p>
                    {!!this.state.id && <button className='btn btn-success' type='button' onClick={(e) => {
                        e.preventDefault();
                        T.notify('Danh sách sinh viên sẽ được tải xuống sau vài giây', 'success');
                        T.download(`/api/ctsv/qua-trinh/ky-luat/download-excel/dssv/${this.state.id}`);
                    }}><i className='fa fa-file-excel-o mr-1' />Xuất Excel</button>}
                </div>
                {renderTable({
                    getDataSource: () => dssv || [],
                    stickyHead: (dssv || []).length > 10,
                    renderHead: () => (<tr>
                        <th style={{ whiteSpace: 'nowrap' }}>#</th>
                        <th style={{ whiteSpace: 'nowrap' }}>MSSV</th>
                        <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Họ tên</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Tình trạng</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Kỷ luật</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>),
                    renderRow: (item, index) => (<tr key={index}>
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenTinhTrangTruoc} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hinhThucKyLuatText} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} type='buttons' permission={{ delete: !readOnly }} onDelete={() => this.deleteSinhVien(item.mssv)} />
                    </tr>)
                })}

            </div>
        );
    }

    getDmHinhThuc(dssv) {
        const { dmHinhThucKyLuat } = this.state;
        const dmHinhThucKyLuatObject = mapArrayToObject((dmHinhThucKyLuat || []), 'id');
        const dmHinhThuc = new Set();
        (dssv || []).forEach(student => {
            const { hinhThucKyLuat } = student;
            const hinhThucObj = { hinhThucKyLuat };
            dmHinhThuc.add(JSON.stringify(hinhThucObj));
        });
        const arrayReturn = Array.from(dmHinhThuc, JSON.parse).map(dm => ({ ...dm, hinhThucKyLuatText: dmHinhThucKyLuatObject[dm.hinhThucKyLuat]?.ten }));
        this.setState({ dmHinhThucKyLuatSelect: arrayReturn }, () => {
            arrayReturn.length && this.hinhThucKyLuat.value(arrayReturn.map(dm => dm.hinhThucKyLuat));
        });
    }
    // =====DSSV===============================================================================================
    componentDssv = () => {
        const { dmHinhThucKyLuatSelect, id } = this.state;
        return <>
            <FormTabs
                ref={e => this.dssvTabs = e}
                id='tab-dssv'
                className='col-md-12'
                tabs={[
                    {
                        title: 'Tải lên', disabled: this.state.id, component: (<>
                            <FormFileBox label={<>Thêm file excel danh sách sinh viên. Tải file mẫu tại <a href='#' onClick={e => e.preventDefault() || T.download('/api/ctsv/qua-trinh/ky-luat/template')}>đây</a></>} uploadType='DsKyLuatData' onSuccess={this.onUploadSuccess} />
                        </>)
                    },
                    {
                        title: 'DSSV', component: <>
                            {!id && <div className='d-flex mt-2'>
                                <FormSelect style={{ width: '45%' }} className='mr-2' ref={e => this.studentAdd = e} placeholder='Sinh viên' data={SelectAdapter_FwStudentKyLuat} multiples
                                />
                                <FormSelect style={{ width: '45%' }} className='mr-2' ref={e => this.hinhThucAdd = e} placeholder='Hình thức' data={SelectAdapter_DmHinhThucKyLuat}
                                />
                                <Tooltip title='Thêm sinh viên'>
                                    <button className='btn btn-success' style={{ marginBottom: '1em' }} type='button' onClick={() => this.addSinhVien()}>
                                        <i className='fa fa-sm fa-plus' />
                                    </button>
                                </Tooltip>
                            </div>}
                            {/* <FormTextBox className='col-md-12 pt-3' placeholder='Thêm sinh viên' readOnly={!!this.state.id}
                                onKeyDown={e => e.code == 'Enter' && (e.preventDefault() || this.addSinhVien(e.target.value))} /> */}
                            {this.state.dssv.length ? <FormTabs
                                id='tab-hinh-thuc'
                                className='col-md-12'
                                tabs={[
                                    ...dmHinhThucKyLuatSelect.map(hinhThuc => ({
                                        title: hinhThuc.hinhThucKyLuatText, component: <>
                                            {this.componentDssvTheoHinhThuc(hinhThuc.hinhThucKyLuat)}
                                        </>
                                    }))
                                ]} /> : null}
                        </>
                    },
                    {
                        title: <>Thông báo {this.state.errors.length ? <span className='badge badge-danger'>{this.state.errors.length}</span> : null}</>, disabled: !this.state.errors || this.state.errors.length == 0, component: <>
                            {renderTable({
                                getDataSource: () => this.state.errors,
                                renderHead: () => <tr>
                                    <th></th>
                                    <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Thông báo</th>
                                </tr>,
                                renderRow: (item, index) => <tr key={index} className='text-danger'>
                                    <td style={{ whiteSpace: 'nowrap' }}>Dòng {item.index}</td>
                                    <td style={{ whiteSpace: 'pre-line' }}>{item.error}</td>
                                </tr>
                            })}
                        </>
                    }
                ]} />
        </>;
    }

    addSinhVienList = (data) => {
        if (!Array.isArray(data)) {
            data = [data];
        }
        const curDssv = this.state.dssv || [],
            newDssv = data.filter(item1 => curDssv.every(item2 => item1.mssv != item2.mssv));
        this.setState({ dssv: [...curDssv, ...newDssv,] }, () => {
            this.getDmHinhThuc(this.state.dssv);
        });
    }

    addSinhVien = () => {
        const studentAdd = this.studentAdd.data(),
            hinhThucAdd = this.hinhThucAdd.data();
        if (studentAdd && hinhThucAdd) {
            const { id: mssv, hoTen, tenTinhTrang: tenTinhTrangTruoc, tinhTrang: tinhTrangTruoc } = studentAdd;
            const { id: hinhThucKyLuat, text: hinhThucKyLuatText, chuyenTinhTrang } = hinhThucAdd;
            const curDssv = this.state.dssv || [];
            if (curDssv.some(item => item.mssv == mssv)) {
                T.notify(`Danh sách đã có sinh viên ${mssv}`);
            } else {
                this.setState({ dssv: [...curDssv, { mssv, hoTen, tinhTrangTruoc, tenTinhTrangTruoc, hinhThucKyLuat, hinhThucKyLuatText, chuyenTinhTrang }] }, () => {
                    this.getDmHinhThuc(this.state.dssv);
                });
            }
            this.studentAdd.clear();
            this.hinhThucAdd.clear();
        } else {
            T.notify('Vui lòng chọn hình thức và sinh viên thêm vào danh sách', 'danger');
        }

    }

    deleteSinhVien = (mssv) => {
        T.confirm('Xác nhận xóa sinh viên khỏi danh sách?', '', isConfirm => {
            if (isConfirm) {
                this.setState(prevState => ({ dssv: prevState.dssv.filter(item => item.mssv != mssv) }));
            }
        });
    }

    render = () => {
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình kỷ luật' : 'Tạo mới quá trình kỷ luật',
            size: 'elarge',
            body: <div className='row'>
                <div className='col-md-4'>
                    {this.componentThongTin()}
                </div>
                <div className='col-md-8'>
                    {this.componentDssv()}
                </div>
            </div>
        });
    }
}
const mapStateToProps = state => ({ system: state.system, svQtKyLuat: state.ctsv.svQtKyLuat });
const mapActionsToProps = {
    createSvQtKyLuatMultiple, updateSvQtKyLuat, getScheduleSettings, checkSinhVien, fetchDsSinhVien, svCheckSoQuyetDinh, getAllSvDmHinhThucKyLuat
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(EditModal);