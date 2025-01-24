import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormCheckbox, FormSelect, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import { getDtChungChiSinhVienPage, deleteDtChungChiSinhVien, downloadImage, updateStatusChungChi } from './redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtLop } from 'modules/mdDaoTao/dtLop/redux';
import Pagination from 'view/component/Pagination';
import AddModal from './addModal';
import { Tooltip } from '@mui/material';

class XetDuyetModal extends AdminModal {

    componentDidMount() {
        this.onHidden(() => {
            this.isDangKy.value('');
            this.isJuniorStudent.value('');
            this.isTotNghiep.value('');
            this.isNotQualified.value('');
        });
    }

    onSubmit = () => {
        const data = {
            isDangKy: Number(this.isDangKy.value()),
            isTotNghiep: Number(this.isTotNghiep.value()),
            isJuniorStudent: Number(this.isJuniorStudent.value()),
            isNotQualified: Number(this.isNotQualified.value()),
        };
        if (data.isTotNghiep) data.isJuniorStudent = 1;
        if (data.isJuniorStudent) data.isDangKy = 1;

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
                <FormCheckbox className='col-md-6' ref={e => this.isDangKy = e} label='Đủ điều kiện đăng ký' onChange={value => value && (this.isNotQualified.value(false))} />
                <FormCheckbox className='col-md-6' ref={e => this.isJuniorStudent = e} label='Đủ điều kiện sv năm 3' onChange={value => value && (this.isNotQualified.value(false) || this.isDangKy.value(true))} />
                <FormCheckbox className='col-md-6' ref={e => this.isTotNghiep = e} label='Đủ điều kiện tốt nghiệp' onChange={value => value && (this.isJuniorStudent.value(true) || this.isDangKy.value(true) || this.isNotQualified.value(false))} />
                <FormCheckbox className='col-md-6' ref={e => this.isNotQualified = e} label='Không đủ điều kiện' onChange={value => value && (this.isJuniorStudent.value(false) || this.isTotNghiep.value(false) || this.isDangKy.value(false))} />
            </div>
        });
    }
}

class DtChungChiSinhVienPage extends AdminPage {
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
        });
    }

    getPage = (pageN, pageS, pageC) => {
        let filter = { ...this.state.filter, sortTerm: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getDtChungChiSinhVienPage(pageN, pageS, pageC, filter);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        let [key, value] = data.split(':');
        this.setState({ filter: { ...this.state.filter, [key]: value } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    handleChange = ({ value, key }) => {
        this.setState({ filter: { ...this.state.filter, [key]: value } }, () => {
            if (key != 'lopSinhVien') {
                this.setState({ filter: { ...this.state.filter, lopSinhVien: '' } }, () => {
                    this.lopSinhVien.value('');
                    if (this.state.displayState) this.getPage();
                });
            } else if (this.state.displayState) this.getPage();
        });
    }

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
        T.confirm('Xoá chứng chỉ ngoại ngữ', 'Bạn có chắc bạn muốn xoá chứng chỉ ngoại ngữ của sinh viên?', true, isConfirm =>
            isConfirm && this.props.deleteDtChungChiSinhVien(item, () => this.getPage(1, 50, '')));
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtChungChiSinhVien?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, pageCondition: '', list: null };
        const permission = this.getUserPermission('dtChungChiSinhVien', ['manage', 'write', 'export']);
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
                <TableHead content='MSSV' style={{ minWidth: '100px' }} keyCol='mssv' onKeySearch={this.handleKeySearch} />
                <TableHead content='Họ tên' style={{ minWidth: '200px' }} keyCol='hoTen' onKeySearch={this.handleKeySearch} />
                <TableHead content='Ngày sinh' style={{ minWidth: '100px' }} keyCol='ngaySinh' onKeySearch={this.handleKeySearch} typeSearch='date' />
                <TableHead content='Khoá SV' style={{ minWidth: '80px' }} keyCol='khoaSv' onKeySearch={!filter.khoaSinhVien && this.handleKeySearch} />
                <TableHead content='LHĐT' style={{ minWidth: '80px' }} keyCol='lhdt' onKeySearch={!filter.heDaoTao && this.handleKeySearch} />
                <TableHead content='Lớp' style={{ minWidth: '90px' }} keyCol='lop' onKeySearch={!filter.lopSinhVien && this.handleKeySearch} />
                <TableHead content='Ngoại ngữ' style={{ minWidth: '150px' }} keyCol='ngoaiNgu' onKeySearch={this.handleKeySearch} />
                <TableHead content='Chứng chỉ' style={{ minWidth: '100px' }} keyCol='chungChi' onKeySearch={this.handleKeySearch} />
                <TableHead content='Trình độ' style={{ minWidth: '150px' }} keyCol='trinhDo' onKeySearch={this.handleKeySearch} />
                <TableHead content='Nghe' style={{ minWidth: '60px', textAlign: 'center' }} />
                <TableHead content='Đọc' style={{ minWidth: '60px', textAlign: 'center' }} />
                <TableHead content='Nói' style={{ minWidth: '60px', textAlign: 'center' }} />
                <TableHead content='Viết' style={{ minWidth: '60px', textAlign: 'center' }} />
                <TableHead content='Điểm' style={{ minWidth: '60px', textAlign: 'center' }} />
                <TableHead content='Ngày cấp' style={{ minWidth: '100px', textAlign: 'center' }} keyCol='ngayCap' onKeySearch={this.handleKeySearch} typeSearch='date' />
                <TableHead content='Nơi cấp' style={{ minWidth: '150px', textAlign: 'center' }} keyCol='noiCap' onKeySearch={this.handleKeySearch} />
                <TableHead content={<>Đủ điều kiện<br />đăng ký</>} style={{ whiteSpace: 'nowrap', width: 'auto', textAlign: 'center' }} />
                <TableHead content={<>Đủ điều kiện<br />sv năm 3</>} style={{ whiteSpace: 'nowrap', width: 'auto', textAlign: 'center' }} />
                <TableHead content={<>Đủ điều kiện<br />tốt nghiệp</>} style={{ width: 'auto', textAlign: 'center' }} />
                <TableHead content={<>Không đủ<br />điều kiện</>} style={{ width: 'auto', textAlign: 'center' }} />
                <TableHead content='Ghi chú' style={{ minWidth: '100px', textAlign: 'center' }} keyCol='ghiChu' onKeySearch={this.handleKeySearch} />
                <TableHead content='Người thao tác cuối' style={{ width: 'auto', textAlign: 'center' }} />
                <TableHead content='Thời gian thao tác cuối' style={{ width: 'auto', textAlign: 'center' }} />
                <TableHead style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content='Thời gian đăng ký' />
                <TableHead style={{ minWidth: '150px', textAlign: 'center', whiteSpace: 'nowrap' }} content='Tình trạng' keyCol='status' typeSearch='select'
                    data={[{ id: 0, text: 'Đang xử lý' }, { id: 1, text: 'Hoàn tất' }]} onKeySearch={this.handleKeySearch} />
                <TableHead content='Thao tác' style={{ width: 'auto', textAlign: 'center' }} />
            </tr>,
            renderRow: (item, index) => {
                const rows = [];
                let chungChi = list?.groupBy('mssv')[item], rowSpan = chungChi.length;
                if (rowSpan) {
                    for (let i = 0; i < rowSpan; i++) {
                        let cert = chungChi[i],
                            score = cert.score ? JSON.parse(cert.score) : { L: '', R: '', S: '', W: '', score: '' };

                        const icon = this.mapperStatus[cert.status].icon,
                            text = this.mapperStatus[cert.status].text,
                            color = this.mapperStatus[cert.status].color;

                        if (i == 0) {
                            rows.push(<tr key={`${cert.mssv}_${rows.length}`}>
                                <TableCell style={{ textAlign: 'right' }} rowSpan={rowSpan} content={(pageNumber - 1) * pageSize + index + 1} />
                                {cert.id ? <TableCell style={{ textAlign: 'center' }} type='checkbox' permission={permission} isCheck
                                    content={this.state.listChosen.includes(cert.id)} onChanged={value => this.chonChungChi(value, cert)} /> : <td />}
                                <TableCell content={<span className='text-primary'>{cert.mssv}</span>} rowSpan={rowSpan} nowrap />
                                <TableCell content={cert.hoTen} rowSpan={rowSpan} nowrap />
                                <TableCell content={cert.ngaySinh ? T.dateToText(cert.ngaySinh, 'dd/mm/yyyy') : ''} rowSpan={rowSpan} style={{ textAlign: 'center' }} />
                                <TableCell content={cert.khoaSinhVien} rowSpan={rowSpan} nowrap />
                                <TableCell content={cert.loaiHinhDaoTao} rowSpan={rowSpan} nowrap />
                                <TableCell content={cert.lop} rowSpan={rowSpan} nowrap />
                                <TableCell content={cert.tenNgoaiNgu} nowrap />
                                <TableCell content={cert.tenChungChi} nowrap />
                                <TableCell content={cert.trinhDo ? cert.trinhDo + ': ' + cert.tenTrinhDo : ''} nowrap />
                                <TableCell content={score.L} style={{ textAlign: 'center' }} />
                                <TableCell content={score.R} style={{ textAlign: 'center' }} />
                                <TableCell content={score.S} style={{ textAlign: 'center' }} />
                                <TableCell content={score.W} style={{ textAlign: 'center' }} />
                                <TableCell content={score.score} style={{ textAlign: 'center' }} />
                                <TableCell content={cert.ngayCap ? T.dateToText(cert.ngayCap, 'dd/mm/yyyy') : ''} style={{ textAlign: 'center' }} />
                                <TableCell content={cert.noiCap} nowrap />
                                <TableCell content={cert.isDangKy ? <i className='fa fa-fw fa-lg fa-check text-success' /> : ''} style={{ textAlign: 'center' }} />
                                <TableCell content={cert.isJuniorStudent ? <i className='fa fa-fw fa-lg fa-check text-success' /> : ''} style={{ textAlign: 'center' }} />
                                <TableCell content={cert.isTotNghiep ? <i className='fa fa-fw fa-lg fa-check text-success' /> : ''} style={{ textAlign: 'center' }} />
                                <TableCell content={cert.isNotQualified ? <i className='fa fa-fw fa-lg fa-times text-danger' /> : ''} style={{ textAlign: 'center' }} />
                                <TableCell content={cert.ghiChu} style={{ whiteSpace: 'nowrap', color: cert.isNotQualified ? 'red' : '' }} />
                                <TableCell content={cert.userModified} style={{ textAlign: 'center', whiteSpace: 'nowrap' }} />
                                <TableCell content={cert.timeModified ? T.dateToText(cert.timeModified, 'HH:MM:ss dd/mm/yyyy') : ''} style={{ textAlign: 'center', whiteSpace: 'nowrap' }} />
                                <TableCell style={{ alignItems: 'center', whiteSpace: 'nowrap' }} content={cert.timeCreated ? T.dateToText(cert.timeCreated, 'HH:MM:ss dd/mm/yyyy') : ''} />
                                <TableCell style={{ alignItems: 'center', whiteSpace: 'nowrap', color, fontWeight: 'bolder' }} content={<><i className={icon} />&nbsp; &nbsp;{text}</>} />
                                <TableCell content={cert} type='buttons' style={{ textAlign: 'right' }}  >
                                    {cert.id ? <>
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
                            rows.push(<tr key={`${cert.mssv}_${rows.length}`}>
                                {cert.id ? <TableCell style={{ textAlign: 'center' }} type='checkbox' permission={permission} isCheck
                                    content={this.state.listChosen.includes(cert.id)} onChanged={value => this.chonChungChi(value, cert)} /> : <td />}
                                <TableCell content={cert.tenNgoaiNgu} nowrap />
                                <TableCell content={cert.tenChungChi} nowrap />
                                <TableCell content={cert.trinhDo ? cert.trinhDo + ': ' + cert.tenTrinhDo : ''} nowrap />
                                <TableCell content={score.L} style={{ textAlign: 'center' }} />
                                <TableCell content={score.R} style={{ textAlign: 'center' }} />
                                <TableCell content={score.S} style={{ textAlign: 'center' }} />
                                <TableCell content={score.W} style={{ textAlign: 'center' }} />
                                <TableCell content={score.score} style={{ textAlign: 'center' }} />
                                <TableCell content={cert.ngayCap ? T.dateToText(cert.ngayCap, 'dd/mm/yyyy') : ''} style={{ textAlign: 'center' }} />
                                <TableCell content={cert.noiCap} nowrap />
                                <TableCell content={cert.isDangKy ? <i className='fa fa-fw fa-lg fa-check text-success' /> : ''} style={{ textAlign: 'center' }} />
                                <TableCell content={cert.isJuniorStudent ? <i className='fa fa-fw fa-lg fa-check text-success' /> : ''} style={{ textAlign: 'center' }} />
                                <TableCell content={cert.isTotNghiep ? <i className='fa fa-fw fa-lg fa-check text-success' /> : ''} style={{ textAlign: 'center' }} />
                                <TableCell content={cert.isNotQualified ? <i className='fa fa-fw fa-lg fa-times text-danger' /> : ''} style={{ textAlign: 'center' }} />
                                <TableCell content={cert.ghiChu} style={{ whiteSpace: 'nowrap', color: cert.isNotQualified ? 'red' : '' }} />
                                <TableCell content={cert.userModified} style={{ textAlign: 'center', whiteSpace: 'nowrap' }} />
                                <TableCell content={cert.timeModified ? T.dateToText(cert.timeModified, 'HH:MM:ss dd/mm/yyyy') : ''} style={{ textAlign: 'center', whiteSpace: 'nowrap' }} />
                                <TableCell style={{ alignItems: 'center', whiteSpace: 'nowrap' }} content={cert.timeCreated ? T.dateToText(cert.timeCreated, 'HH:MM:ss dd/mm/yyyy') : ''} />
                                <TableCell style={{ alignItems: 'center', whiteSpace: 'nowrap', color, fontWeight: 'bolder' }} content={<><i className={icon} />&nbsp; &nbsp;{text}</>} />
                                <TableCell content={cert} type='buttons' style={{ textAlign: 'right' }}  >
                                    {cert.id ? <>
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
            icon: 'fa fa-certificate',
            title: 'Chứng chỉ ngoại ngữ',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/certificate-management'>Quản lý chứng chỉ</Link>,
                'Chứng chỉ ngoại ngữ'
            ],
            advanceSearchTitle: '',
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.khoaSinhVien = e} data={SelectAdapter_DtKhoaDaoTao} className='col-md-3' label='Khóa sinh viên' onChange={value => this.handleChange({ value: value?.id || '', key: 'khoaSinhVien' })} allowClear={true} />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} className='col-md-3' label='Loại hình đào tạo' onChange={value => this.handleChange({ value: value?.id || '', key: 'heDaoTao' })} allowClear={true} />
                <FormSelect ref={e => this.lopSinhVien = e} data={SelectAdapter_DtLop(filter)} className='col-md-3' label='Lớp sinh viên' onChange={value => this.handleChange({ value: value?.id || '', key: 'lopSinhVien' })} allowClear={true} />
                <FormSelect ref={e => this.tinhTrang = e} data={[{ id: 0, text: 'Đang xử lý' }, { id: 1, text: 'Hoàn tất' }]} className='col-md-3' label='Tình trạng' onChange={value => this.handleChange({ value: value?.id || '', key: 'tinhTrang' })} allowClear={true} />

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
                    <AddModal ref={e => this.modal = e} getPage={this.getPage} />
                    <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                        getPage={this.getPage} pageRange={5} />
                    <div className='tile'>
                        {table}
                    </div>
                </>}
            </>,
            backRoute: '/user/dao-tao/certificate-management',
            collapse: displayState && [
                { icon: 'fa-print', name: 'Export', permission: permission.export, type: 'warning', onClick: e => e.preventDefault() || T.handleDownload(`/api/dt/chung-chi-sinh-vien/export-excel?filter=${T.stringify(filter)}`) },
                { icon: 'fa-plus', name: 'Tạo mới', permission: permission.write, type: 'info', onClick: e => e.preventDefault() || this.modal.show() },
                { icon: 'fa-upload', name: 'Import chứng chỉ', permission: permission.write, type: 'success', onClick: e => e.preventDefault() || this.props.history.push('/user/dao-tao/student-certificate-management/import') },
                { icon: 'fa-cloud-download', name: 'Export tình trạng xét duyệt chứng chỉ', permission: permission.export, type: 'secondary', onClick: e => e.preventDefault() || T.handleDownload(`/api/dt/chung-chi-sinh-vien/export/xet-duyet?filter=${T.stringify(filter)}`) },
                { icon: 'fa-cloud-upload', name: 'Import tình trạng xét duyệt chứng chỉ', permission: permission.export, type: 'primary', onClick: e => e.preventDefault() || this.props.history.push('/user/dao-tao/student-certificate-management/import/status') },
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtChungChiSinhVien: state.daoTao.dtChungChiSinhVien });
const mapActionsToProps = { getDtChungChiSinhVienPage, deleteDtChungChiSinhVien, downloadImage, updateStatusChungChi };
export default connect(mapStateToProps, mapActionsToProps)(DtChungChiSinhVienPage);