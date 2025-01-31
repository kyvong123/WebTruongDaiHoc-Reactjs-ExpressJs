import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, getValue, FormSelect, FormTextBox, FormCheckbox, FormDatePicker, FormRichTextBox, renderDataTable, TableCell, TableHead, AdminModal, FormTabs } from 'view/component/AdminPage';
import { getDtChungChiTinHocSinhVienPage, createDtChungChiTinHocSinhVien, updateDtChungChiTinHocSinhVien, deleteDtChungChiTinHocSinhVien, updateStatusChungChi } from './redux';
import { downloadImage } from 'modules/mdDaoTao/dtChungChiSinhVien/redux';
import { SelectAdapter_DtGetStudentInBangDiem } from 'modules/mdDaoTao/dtDiemInBangDiem/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtLop } from 'modules/mdDaoTao/dtLop/redux';
import { SelectAdapter_DtDmChungChiTinHoc } from 'modules/mdDaoTao/dtDmChungChiTinHoc/redux';
import { SelectAdapter_DtDmLoaiChungChi } from 'modules/mdDaoTao/dtDmLoaiChungChi/redux';
import Pagination from 'view/component/Pagination';
import { Tooltip } from '@mui/material';
import FileBox from 'view/component/FileBox';
import { Img } from 'view/component/HomePage';


class XetDuyetModal extends AdminModal {

    componentDidMount() {
        this.onHidden(() => {
            this.isTotNghiep.value('');
            this.isNotQualified.value('');
        });
    }

    onSubmit = () => {
        const data = {
            isTotNghiep: Number(this.isTotNghiep.value()),
            isNotQualified: Number(this.isNotQualified.value()),
        };

        T.confirm('Cảnh báo', 'Bạn có chắc muốn xét duyệt chứng chỉ không?', true, isConfirm => {
            if (isConfirm) {
                this.props.updateStatusChungChi(this.props.listChosen, data, () => {
                    T.alert('Cập nhật xét duyệt chứng chỉ thành công!', 'success', false, 1000);
                    this.hide();
                    this.props.handleSave();
                });
            }
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Xét duyệt chứng chỉ',
            body: <div className='row'>
                <FormCheckbox className='col-md-6' ref={e => this.isTotNghiep = e} label='Đủ điều kiện tốt nghiệp' onChange={value => value && this.isNotQualified.value(false)} />
                <FormCheckbox className='col-md-6' ref={e => this.isNotQualified = e} label='Không đủ điều kiện' onChange={value => value && this.isTotNghiep.value(false)} />
            </div>
        });
    }
}

class CertImg extends React.Component {
    state = { fileName: '' }
    componentDidMount() {
        let { fileName } = this.props;
        this.setState({ fileName });
    }
    componentDidUpdate(prevProps) {
        if (this.props && prevProps.fileName != this.props.fileName) {
            let { fileName } = this.props;
            this.setState({ fileName });
        }
    }
    render() {
        let { fileName } = this.state;
        let src = T.url(`/api/dt/chung-chi-sinh-vien/cert-image?fileName=${fileName}`);
        return fileName ? <Img id={'certImg'} src={src} style={{ display: 'block', height: 'auto', maxWidth: '95%' }} /> : <></>;
    }
}
class EditModal extends AdminModal {

    componentDidMount() {
        this.onHidden(() => {
            this.setState({ sv: {} }, () => {
                this.mssv.value('');
                this.hoTen.value('');
                this.ngaySinh.value('');
                this.loaiChungChi.value('');
                this.maChungChi.value('');
                this.diem.value('');
                this.trinhDo.value('');
                this.ngayCap.value('');
                this.noiCap.value('');
                this.noiCap.value('');
                this.isTotNghiep.value(false);
                this.isNotQualified.value(false);
                this.ghiChu.value('');
                this.cccd.value('');
                this.soHieuVanBang.value('');
            });
        });
    }

    onShow = (item) => {
        let { id, mssv, hoTen, ngaySinh, loaiChungChi, maChungChi, diem, trinhDo, ngayCap, noiCap, isTotNghiep, ghiChu, fileName, cccd, soHieuVanBang, isNotQualified } = item ? item :
            { id: null, mssv: '', hoTen: '', ngaySinh: '', loaiChungChi: '', maChungChi: '', diem: '', trinhDo: '', ngayCap: null, noiCap: '', isTotNghiep: 0, isNotQualified: 0, ghiChu: '', fileName, cccd: '', soHieuVanBang: '' };

        if (ngayCap != '' && ngayCap != null) ngayCap = new Date(ngayCap);

        this.setState({ id, sv: item, loaiChungChi, maChungChi, fileName, edit: id || mssv }, () => {
            this.tab.tabClick(null, 0);
            this.mssv.value(mssv);
            this.hoTen.value(hoTen);
            this.ngaySinh.value(ngaySinh);
            this.loaiChungChi.value(loaiChungChi);
            this.maChungChi.value(maChungChi);
            this.diem.value(diem || '');
            this.trinhDo.value(trinhDo || '');
            this.ngayCap.value(ngayCap);
            this.noiCap.value(noiCap || '');
            this.isTotNghiep.value(isTotNghiep || 0);
            this.isNotQualified.value(isNotQualified || 0);
            this.ghiChu.value(ghiChu || '');
            this.cccd.value(cccd);
            this.soHieuVanBang.value(soHieuVanBang);
        });
    };

    handleUploadSuccess = (result) => {
        if (result.message) {
            T.alert(result.message || 'Xảy ra lỗi trong quá trình import', 'error', true);
        } else {
            this.setState({ fileName: result.fileName }, () => T.notify('Upload ảnh thành công', 'success'));
        }
    }

    onSubmit = (e) => {
        e.preventDefault();

        const changes = {
            mssv: getValue(this.mssv),
            loaiChungChi: getValue(this.loaiChungChi),
            chungChi: this.loaiChungChi.data().text,
            maChungChi: getValue(this.maChungChi),
            diem: this.diem.value(),
            trinhDo: this.trinhDo.value(),
            ngayCap: this.ngayCap.value() ? getValue(this.ngayCap).getTime() : '',
            noiCap: this.noiCap.value(),
            ghiChu: this.ghiChu.value(),
            isTotNghiep: Number(getValue(this.isTotNghiep)),
            isNotQualified: Number(this.isNotQualified.value()),
            status: this.state.sv?.status || 1,
            fileName: this.state.fileName || '',
            cccd: this.cccd.value(),
            soHieuVanBang: this.soHieuVanBang.value(),
        };

        this.state.id ? this.props.update(this.state.id, changes, () => {
            this.props.getPage(1, 50, '');
            this.hide();
        }) : this.props.create(changes, () => {
            this.props.getPage(1, 50, '');
            this.hide();
        });
    };

    render = () => {
        const { sv, edit, loaiChungChi, maChungChi, fileName } = this.state;

        let tabs = [
            {
                id: 'info', title: 'Thông tin chứng chỉ', component: <div className='row'>
                    <FormSelect className={`col-md-${edit ? '4' : '5'}`} ref={e => this.mssv = e} data={SelectAdapter_DtGetStudentInBangDiem({ cheDoIn: '' })} label='Mssv' readOnly={edit} required
                        onChange={value => {
                            this.hoTen.value(`${value.item?.ho} ${value.item?.ten}`);
                            this.ngaySinh.value(value.item?.ngaySinh);
                            this.setState({ sv: { ...sv, ...value.item } });
                        }} />
                    <FormTextBox className='col-md-4' ref={e => this.hoTen = e} label='Họ tên' readOnly />
                    <FormDatePicker type='date-mask' className={`col-md-${edit ? '4' : '3'}`} ref={e => this.ngaySinh = e} label='Ngày sinh' readOnly />

                    <FormSelect className='col-md-6' ref={e => this.loaiChungChi = e} data={SelectAdapter_DtDmLoaiChungChi} label='Loại chứng chỉ' required
                        onChange={value => this.setState({ loaiChungChi: value.id }, () => this.maChungChi.value(''))} />
                    <FormSelect className='col-md-6' ref={e => this.maChungChi = e} data={SelectAdapter_DtDmChungChiTinHoc(loaiChungChi)} label='Chứng chỉ' required
                        onChange={value => this.setState({ maChungChi: value.id })} />

                    <FormTextBox className='col-md-6' ref={e => this.diem = e} label='Điểm' />
                    <FormTextBox className='col-md-6' ref={e => this.trinhDo = e} label='Trình độ' />

                    <FormDatePicker className='col-md-6' ref={e => this.ngayCap = e} label='Ngày cấp' type='date' />
                    <FormTextBox className='col-md-6' ref={e => this.noiCap = e} label='Nơi cấp' />

                    <FormTextBox className='col-md-6' ref={e => this.cccd = e} label='CCCD' />
                    <FormTextBox className='col-md-6' ref={e => this.soHieuVanBang = e} label='Số hiệu văn bằng' />

                    <FormCheckbox className='col-md-6' ref={e => this.isTotNghiep = e} label='Đủ điều kiện tốt nghiệp' onChange={value => value && this.isNotQualified.value(false)} />
                    <FormCheckbox className='col-md-6' ref={e => this.isNotQualified = e} label='Không đủ điều kiện' onChange={value => value && this.isTotNghiep.value(false)} />

                    <FormRichTextBox className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' />

                </div>
            },
            {
                id: 'upload', title: 'Ảnh minh chứng', disabled: !(loaiChungChi && maChungChi), component: <div className='row'>
                    <div className='col-md-12'>
                        <div style={{ margin: 'auto', width: '70%' }}>
                            <FileBox uploadType='CertFile' accept='image' userData='CertFile' success={this.handleUploadSuccess} ref={e => this.uploadForm = e} postUrl={`/user/upload?mssv=${sv?.mssv}&loaiChungChi=${loaiChungChi}&chungChi=${maChungChi}`} ajax={true} />
                        </div>
                    </div>
                    <hr style={{ width: '95%' }} />
                    <div className='col-md-12'>
                        <div className='row' style={{ maxHeight: '55vh', margin: 'auto', width: '95%' }}>
                            <div className='d-inline-block col-md-12' style={{ maxHeight: 'inherit', overflow: 'auto' }}>
                                <div style={{ border: 'solid' }}>
                                    <CertImg fileName={fileName} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        ];
        return this.renderModal({
            title: this.state.id ? 'Cập nhật chứng chỉ tin học cho sinh viên' : 'Tạo mới chứng chỉ tin học cho sinh viên',
            size: 'large',
            body: <FormTabs ref={e => this.tab = e} tabs={tabs} />
        }
        );
    };
}


class DtChungChiTinHocSinhVienPage extends AdminPage {
    defaultSortTerm = 'mssv_ASC';
    state = {
        displayState: false, filter: { khoaSinhVien: '', heDaoTao: '', donVi: '' }, listChosen: []
    };
    mapperStatus = {
        0: { icon: 'fa fa-lg fa-file-o', text: 'Đang xử lý', color: 'orange' },
        1: { icon: 'fa fa-lg fa-check-circle', text: 'Hoàn tất', color: 'green' },
        null: { icon: '', text: '', color: '' },
    }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.showAdvanceSearch();
            T.showSearchBox(() => {
                this.showAdvanceSearch();
            });
            this.getPage(1, 50, '');
        });
    }

    getPage = (pageN, pageS, pageC) => {
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getDtChungChiTinHocSinhVienPage(pageN, pageS, pageC, filter);
    }

    handleChange = ({ value, key }) => {
        this.setState({ filter: { ...this.state.filter, [key]: value } }, () => {
            if (key != 'lopSinhVien') {
                this.setState({ filter: { ...this.state.filter, lopSinhVien: '' } }, () => this.lopSinhVien.value(''));
            }
        });
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        let [key, value] = data.split(':');
        this.setState({ filter: { ...this.state.filter, [key]: value } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    chonChungChi = (value, cert) => {
        let { listChosen } = this.state;
        if (value) {
            listChosen.push(cert.id);
        } else {
            let index = listChosen.findIndex(id => id == cert.id);
            listChosen.splice(index, 1);
        }
        this.setState({ listChosen });
    }

    downloadImage = (e) => {
        e.preventDefault();
        T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
        this.props.downloadImage(this.state.listChosen.join(';'), (data) => {
            T.download(T.url(`/api/dt/chung-chi-sinh-vien/download-image?fileName=${data.fileName}`), data.fileName);
            this.setState({ listChosen: [] }, () => {
                T.alert('Download file minh chứng thành công', 'success', false, 1000);
            });
        });
    }

    delete = (item) => {
        T.confirm('Xóa chứng chỉ tin học', 'Bạn có chắc bạn muốn xóa chứng chỉ tin học của sinh viên?', true, isConfirm =>
            isConfirm && this.props.deleteDtChungChiTinHocSinhVien(item, () => this.getPage(1, 50, '')));
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtChungChiTinHocSinhVien?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, pageCondition: '', list: null };
        const permission = this.getUserPermission('dtChungChiTinHocSinhVien', ['manage', 'write', 'export']);
        let { filter, displayState } = this.state;
        let table = renderDataTable({
            data: list ? Object.keys(list.groupBy('mssv')) : null,
            stickyHead: list && list.length > 7,
            className: 'table-fix-col',
            divStyle: { height: '57vh' },
            renderHead: () => <tr>
                <TableHead content='#' />
                <TableHead content={
                    <span className='animated-checkbox d-flex flex-column'>
                        <label>Chọn</label>
                        <label style={{ marginBottom: '0' }}>
                            <input type='checkbox' disabled={!permission.write} ref={e => this.checkAll = e} onChange={(e) => this.setState({ listChosen: e.target.checked ? list.filter(i => i.id).map(i => i.id) : [] })} checked={this.state.checked} />
                            <s className='label-text' />
                        </label>
                    </span>
                } style={{ textAlign: 'center' }} />
                <TableHead style={{ minWidth: '100px', textAlign: 'center', whiteSpace: 'nowrap' }} content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead style={{ minWidth: '200px', textAlign: 'center', whiteSpace: 'nowrap' }} content='Họ tên' keyCol='hoTen' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead style={{ minWidth: '100px' }} content='Ngày sinh' keyCol='ngaySinh' onKeySearch={this.handleKeySearch} typeSearch='date' />
                <TableHead style={{ minWidth: '80px' }} content='Khoá SV' keyCol='khoaSv' onKeySearch={!filter.khoaSinhVien && this.handleKeySearch} />
                <TableHead style={{ minWidth: '80px' }} content='LHĐT' keyCol='lhdt' onKeySearch={!filter.loaiHinhDaoTao && this.handleKeySearch} />
                <TableHead style={{ minWidth: '90px' }} content='Lớp' keyCol='lop' onKeySearch={!filter.lopSinhVien && this.handleKeySearch} />
                <TableHead style={{ minWidth: '100px', textAlign: 'center', whiteSpace: 'nowrap' }} content='Chứng chỉ' keyCol='maChungChi' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead style={{ minWidth: '200px', textAlign: 'center', whiteSpace: 'nowrap' }} content='Tên chứng chỉ' keyCol='tenChungChi' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead style={{ minWidth: '100px', textAlign: 'center', whiteSpace: 'nowrap' }} content='Trình độ' keyCol='trinhDo' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead style={{ minWidth: '80px', textAlign: 'center', whiteSpace: 'nowrap' }} content='Điểm' keyCol='diem' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead style={{ minWidth: '100px', textAlign: 'center', whiteSpace: 'nowrap' }} content='Ngày cấp' keyCol='ngayCap' onSort={this.onSort} />
                <TableHead style={{ minWidth: '120px', textAlign: 'center', whiteSpace: 'nowrap' }} content='Nơi cấp' keyCol='noiCap' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead content={<>Không đủ<br />điều kiện</>} style={{ width: 'auto', textAlign: 'center' }} />
                <TableHead style={{ minWidth: '120px', textAlign: 'center', whiteSpace: 'nowrap' }} content={<>Đủ điều kiện <br /> tốt nghiệp</>} keyCol='isTotNghiep' onSort={this.onSort} />
                <TableHead style={{ minWidth: '120px', textAlign: 'center', whiteSpace: 'nowrap' }} content='Ghi chú' keyCol='ghiChu' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content='Người thao tác cuối' />
                <TableHead style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content='Thời gian thao tác cuối' />
                <TableHead style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content='Thời gian đăng ký' />
                <TableHead style={{ minWidth: '150px', textAlign: 'center', whiteSpace: 'nowrap' }} content='Tình trạng' keyCol='status' typeSearch='admin-select'
                    data={[{ id: 0, text: 'Đang xử lý' }, { id: 1, text: 'Hoàn tất' }]} onKeySearch={this.handleKeySearch} />
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>,
            renderRow: (item, index) => {
                const rows = [];
                let chungChi = list?.groupBy('mssv')[item], rowSpan = chungChi.length;
                if (rowSpan) {
                    for (let i = 0; i < rowSpan; i++) {
                        let cert = chungChi[i];
                        const icon = this.mapperStatus[cert.status].icon,
                            text = this.mapperStatus[cert.status].text,
                            color = this.mapperStatus[cert.status].color;

                        if (i == 0) {
                            rows.push(<tr key={rows.length}>
                                <TableCell content={(pageNumber - 1) * pageSize + index + 1} rowSpan={rowSpan} />
                                {cert.id ? <TableCell style={{ textAlign: 'center' }} type='checkbox' permission={permission} isCheck
                                    content={this.state.listChosen.includes(cert.id)} onChanged={value => this.chonChungChi(value, cert)} /> : <td />}
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<><span className='text-primary'>{cert.mssv}</span></>} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={cert.hoTen} rowSpan={rowSpan} />
                                <TableCell content={cert.ngaySinh ? T.dateToText(cert.ngaySinh, 'dd/mm/yyyy') : ''} rowSpan={rowSpan} style={{ textAlign: 'center' }} />
                                <TableCell content={cert.khoaSinhVien} rowSpan={rowSpan} nowrap />
                                <TableCell content={cert.loaiHinhDaoTao} rowSpan={rowSpan} nowrap />
                                <TableCell content={cert.lop} rowSpan={rowSpan} nowrap />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={cert.maChungChi} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={cert.tenChungChi} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={cert.trinhDo} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={cert.diem} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={cert.ngayCap ? T.dateToText(cert.ngayCap, 'dd/mm/yyyy') : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={cert.noiCap} />
                                <TableCell style={{ textAlign: 'center' }} content={cert.isNotQualified ? <i className='fa fa-fw fa-lg fa-times text-danger' /> : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={cert.isTotNghiep ? <i className='fa fa-fw fa-lg fa-check text-success' /> : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={cert.ghiChu} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={cert.modifier} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={cert.timeModified ? T.dateToText(cert.timeModified, 'HH:MM:ss dd/mm/yyyy') : ''} />
                                <TableCell style={{ alignItems: 'center', whiteSpace: 'nowrap' }} content={cert.timeCreated ? T.dateToText(cert.timeCreated, 'HH:MM:ss dd/mm/yyyy') : ''} />
                                <TableCell style={{ alignItems: 'center', whiteSpace: 'nowrap', color, fontWeight: 'bolder' }} content={<><i className={icon} />&nbsp; &nbsp;{text}</>} />
                                <TableCell style={{ textAlign: 'right' }} content={item} type='buttons' >
                                    {cert.id ? <>
                                        {/* {cert.fileName && <Tooltip title='Xem file minh chứng' arrow placeholder='bottom'>
                                            <a className='btn btn-warning' href='#'
                                                onClick={e => e.preventDefault() || this.certModal.show({ fileName: cert.fileName })}>
                                                <i className='fa fa-lg fa-eye' />
                                            </a>
                                        </Tooltip>} */}
                                        <Tooltip title='Chỉnh sửa' arrow placeholder='bottom'>
                                            <a className='btn btn-primary' href='#'
                                                onClick={e => e.preventDefault() || this.modal.show(cert)}>
                                                <i className='fa fa-lg fa-edit' />
                                            </a>
                                        </Tooltip>
                                        <Tooltip title='Xoá chứng chỉ' arrow placeholder='bottom'>
                                            <a className='btn btn-danger' href='#'
                                                onClick={e => e.preventDefault() || this.delete(cert)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a>
                                        </Tooltip>
                                        {cert.fileName && <Tooltip title='Download file minh chứng' arrow placement='bottom'>
                                            <a className='btn btn-secondary' href='#' onClick={e => e.preventDefault() ||
                                                T.download(T.url(`/api/dt/chung-chi-sinh-vien/download-image?fileName=${cert.fileName}`), cert.fileName)}>
                                                <i className={'fa fa-lg fa-cloud-download'} />
                                            </a>
                                        </Tooltip>}
                                    </> : <Tooltip title='Tạo mới' arrow placeholder='bottom'>
                                        <a className='btn btn-info' href='#'
                                            onClick={e => e.preventDefault() || this.modal.show(cert)}>
                                            <i className='fa fa-lg fa-plus' />
                                        </a>
                                    </Tooltip>}
                                </TableCell>
                            </tr>);
                        } else {
                            rows.push(<tr key={rows.length}>
                                {cert.fileName ? <TableCell style={{ textAlign: 'center' }} type='checkbox' permission={permission} isCheck
                                    content={this.state.listChosen.includes(cert.fileName)} onChanged={value => this.chonChungChi(value, cert)} /> : <td />}
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={cert.maChungChi} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={cert.tenChungChi} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={cert.trinhDo} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={cert.diem} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={cert.ngayCap ? T.dateToText(cert.ngayCap, 'dd/mm/yyyy') : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={cert.noiCap} />
                                <TableCell style={{ textAlign: 'center' }} content={cert.isNotQualified ? <i className='fa fa-fw fa-lg fa-times text-danger' /> : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={cert.isTotNghiep ? <i className='fa fa-fw fa-lg fa-check text-success' /> : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={cert.ghiChu} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={cert.modifier} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={cert.timeModified ? T.dateToText(cert.timeModified, 'HH:MM:ss dd/mm/yyyy') : ''} />
                                <TableCell style={{ alignItems: 'center', whiteSpace: 'nowrap' }} content={cert.timeCreated ? T.dateToText(cert.timeCreated, 'HH:MM:ss dd/mm/yyyy') : ''} />
                                <TableCell style={{ alignItems: 'center', whiteSpace: 'nowrap', color, fontWeight: 'bolder' }} content={<><i className={icon} />&nbsp; &nbsp;{text}</>} />
                                <TableCell style={{ textAlign: 'right' }} content={item} type='buttons' >
                                    {cert.id ? <>
                                        {/* {cert.fileName && <Tooltip title='Xem file minh chứng' arrow placeholder='bottom'>
                                            <a className='btn btn-warning' href='#'
                                                onClick={e => e.preventDefault() || this.certModal.show({ fileName: cert.fileName })}>
                                                <i className='fa fa-lg fa-eye' />
                                            </a>
                                        </Tooltip>} */}
                                        <Tooltip title='Chỉnh sửa' arrow placeholder='bottom'>
                                            <a className='btn btn-primary' href='#'
                                                onClick={e => e.preventDefault() || this.modal.show(cert)}>
                                                <i className='fa fa-lg fa-edit' />
                                            </a>
                                        </Tooltip>
                                        <Tooltip title='Xoá chứng chỉ' arrow placeholder='bottom'>
                                            <a className='btn btn-danger' href='#'
                                                onClick={e => e.preventDefault() || this.delete(cert)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a>
                                        </Tooltip>
                                        {cert.fileName && <Tooltip title='Download file minh chứng' arrow placement='bottom'>
                                            <a className='btn btn-secondary' href='#' onClick={e => e.preventDefault() ||
                                                T.download(T.url(`/api/dt/chung-chi-sinh-vien/download-image?fileName=${cert.fileName}`), cert.fileName)}>
                                                <i className={'fa fa-lg fa-cloud-download'} />
                                            </a>
                                        </Tooltip>}
                                    </> : <Tooltip title='Tạo mới' arrow placeholder='bottom'>
                                        <a className='btn btn-info' href='#'
                                            onClick={e => e.preventDefault() || this.modal.show(cert)}>
                                            <i className='fa fa-lg fa-plus' />
                                        </a>
                                    </Tooltip>}
                                </TableCell>
                            </tr>);
                        }
                    }
                }
                return rows;
            }
        });

        return this.renderPage({
            icon: 'fa fa-file-excel-o',
            title: 'Chứng chỉ khác',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/certificate-management'>Quản lý chứng chỉ</Link>,
                'Chứng chỉ khác'
            ],
            advanceSearchTitle: '',
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.khoaSinhVien = e} data={SelectAdapter_DtKhoaDaoTao} className='col-md-4' label='Khóa sinh viên' onChange={value => this.handleChange({ value: value?.id || '', key: 'khoaSinhVien' })} allowClear={true} />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} className='col-md-4' label='Loại hình đào tạo' onChange={value => this.handleChange({ value: value?.id || '', key: 'heDaoTao' })} allowClear={true} />
                <FormSelect ref={e => this.lopSinhVien = e} data={SelectAdapter_DtLop(filter)} className='col-md-4' label='Lớp sinh viên' onChange={value => this.handleChange({ value: value?.id || '', key: 'lopSinhVien' })} allowClear={true} />
                <div className='col-md-12' style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    {!!this.state.listChosen.length && <>
                        <Tooltip title='Download file minh chứng (.zip)' arrow>
                            <button className='btn btn-warning' style={{ height: '34px' }}
                                onClick={this.downloadImage}>
                                <i className='fa fa-lg fa-download' />
                            </button>
                        </Tooltip>
                        <Tooltip title='Xét duyệt chứng chỉ' arrow>
                            <button className='btn btn-success' style={{ height: '34px' }}
                                onClick={() => this.xetDuyetModal.show()}>
                                <i className='fa fa-lg fa-check' />
                            </button>
                        </Tooltip>
                    </>}
                    <button className='btn btn-primary' style={{ height: '34px' }}
                        onClick={e => e.preventDefault() || this.setState({ displayState: true }) || this.getPage(pageNumber, pageSize, pageCondition)} >
                        <i className='fa fa-lg fa-search' /> Tìm kiếm
                    </button>
                </div>
            </div>,
            content: <>
                {displayState && <>
                    <XetDuyetModal ref={e => this.xetDuyetModal = e} listChosen={this.state.listChosen} updateStatusChungChi={this.props.updateStatusChungChi} handleSave={this.getPage} />
                    <EditModal ref={e => this.modal = e} getPage={this.getPage} create={this.props.createDtChungChiTinHocSinhVien} update={this.props.updateDtChungChiTinHocSinhVien} />
                    {/* <CertModal ref={e => this.certModal = e} /> */}
                    <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                        getPage={this.getPage} pageRange={5} />
                    <div className='tile'>
                        {table}
                    </div>
                </>}
            </>,
            backRoute: '/user/dao-tao/certificate-management',
            collapse: displayState && [
                { icon: 'fa-print', name: 'Export', permission: permission.export, type: 'warning', onClick: e => e.preventDefault() || T.handleDownload(`/api/dt/chung-chi-tin-hoc-sinh-vien/export-excel?filter=${T.stringify(filter)}`) },
                { icon: 'fa-plus', name: 'Tạo mới', permission: permission.write, type: 'info', onClick: e => e.preventDefault() || this.modal.show() },
                { icon: 'fa-upload', name: 'Import chứng chỉ', permission: permission.write, type: 'success', onClick: e => e.preventDefault() || this.props.history.push('/user/dao-tao/student-others-certificate/import') },
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtChungChiTinHocSinhVien: state.daoTao.dtChungChiTinHocSinhVien });
const mapActionsToProps = { getDtChungChiTinHocSinhVienPage, createDtChungChiTinHocSinhVien, updateDtChungChiTinHocSinhVien, deleteDtChungChiTinHocSinhVien, downloadImage, updateStatusChungChi };
export default connect(mapStateToProps, mapActionsToProps)(DtChungChiTinHocSinhVienPage);