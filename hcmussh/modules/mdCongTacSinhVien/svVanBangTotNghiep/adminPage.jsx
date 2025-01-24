import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell, AdminModal, FormTextBox, getValue, FormDatePicker, FormSelect, TableHead, FormTabs, TooltipButton } from 'view/component/AdminPage';
import { getPageSvVbTotNghiep, getSvVbTotNghiep, createSvVbTotNghiep, updateSvVbTotNghiep, bulkCreateSvVbTotNghiep } from './redux';
import Pagination from 'view/component/Pagination';
import FileBox from 'view/component/FileBox';
import { SelectAdapter_FwStudentsTotNghiep } from 'modules/mdCongTacSinhVien/fwStudents/redux';


class VbTotNghiepModal extends AdminModal {
    onShow = (item) => {
        const { mssv = '', hoTenSv = '', ngaySinh = '', tenNganh = '', tenLoaiHinhDaoTao = '', soHieuVanBang = '', soVaoSoGoc = '', ngayCapBang = '', namTotNghiep = '' } = item || {};
        this.setState({ mssv, hoTenSv, ngaySinh, tenNganh, tenLoaiHinhDaoTao, soHieuVanBang, soVaoSoGoc, ngayCapBang, namTotNghiep });
        this.mssv.value(mssv);
        this.hoTenSv.value(hoTenSv);
        this.ngaySinh.value(ngaySinh);
        this.tenNganh.value(tenNganh);
        this.tenLoaiHinhDaoTao.value(tenLoaiHinhDaoTao);
        this.soHieuVanBang.value(soHieuVanBang);
        this.soVaoSoGoc.value(soVaoSoGoc);
        this.ngayCapBang.value(ngayCapBang);
        this.namTotNghiep.value(namTotNghiep);
    }

    onSubmit = () => {
        const data = {
            mssv: getValue(this.mssv),
            soHieuVanBang: getValue(this.soHieuVanBang),
            soVaoSoGoc: getValue(this.soVaoSoGoc),
            ngayCapBang: Number(getValue(this.ngayCapBang)),
            namTotNghiep: getValue(this.namTotNghiep)
        };
        if (this.state.mssv) {
            this.props.update(this.state.mssv, data, this.hide());
        } else if (this.state.studentTinhTrang != 6) {
            T.customConfirm('Cảnh báo', 'Có sinh viên <span class="text-danger">CHƯA TỐT NGHIỆP</span> trong danh sách. Bạn có muốn cập nhật tình trạng của sinh viên?', 'warning', true, {
                no: { text: 'Không', value: 1, className: 'bg-danger' },
                yes: { text: 'Có', value: 2, className: 'bg-success' },
            }, option => {
                if (option) {
                    this.props.create(data, option == 1 ? 0 : 1, this.hide());
                }
            });
        } else {
            this.props.create(data, 0, this.hide());
        }
    }

    changeSinhVien = (value) => {
        const { mssv = '', hoTen = '', ngaySinh = '', tenNganh = '', tenLoaiHinhDaoTao = '', soHieuVanBang = '', soVaoSoGoc = '', ngayCapBang = '', namTotNghiep = '' } = value || {};
        this.mssv.value(mssv);
        this.hoTenSv.value(hoTen);
        this.ngaySinh.value(ngaySinh);
        this.tenNganh.value(tenNganh);
        this.tenLoaiHinhDaoTao.value(tenLoaiHinhDaoTao);
        this.soHieuVanBang.value(soHieuVanBang);
        this.soVaoSoGoc.value(soVaoSoGoc);
        this.ngayCapBang.value(ngayCapBang);
        this.namTotNghiep.value(namTotNghiep);
        this.setState({ studentTinhTrang: value.tinhTrang });
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.mssv ? 'Cập nhật dữ liệu Văn bằng tốt nghiệp' : 'Tạo dữ liệu Văn bằng tốt nghiệp',
            size: 'large',
            body: <div className="row">
                <FormSelect ref={e => this.mssv = e} className='col-md-12' label='MSSV' data={SelectAdapter_FwStudentsTotNghiep} required readOnly={readOnly} onChange={this.changeSinhVien} />
                <FormTextBox ref={e => this.hoTenSv = e} className='col-md-6' label='Họ và Tên' readOnly />
                <FormDatePicker type='date-mask' ref={e => this.ngaySinh = e} className='col-md-6' label='Ngày Sinh' readOnly />
                <FormTextBox ref={e => this.tenNganh = e} className='col-md-6' label='Ngành' readOnly />
                <FormTextBox ref={e => this.tenLoaiHinhDaoTao = e} className='col-md-6' label='Hệ Đào Tạo' readOnly />
                <FormTextBox ref={e => this.soHieuVanBang = e} className='col-md-6' label='Số Hiệu Văn Bằng' required readOnly={readOnly} />
                <FormTextBox ref={e => this.soVaoSoGoc = e} className='col-md-6' label='Số Vào Sổ Gốc' required readOnly={readOnly} />
                <FormDatePicker type='date-mask' ref={e => this.ngayCapBang = e} className='col-md-6' label='Ngày Cấp Bằng' required readOnly={readOnly} />
                <FormTextBox type='year' ref={e => this.namTotNghiep = e} className='col-md-6' label='Năm Tốt Nghiệp' required readOnly={readOnly} />
            </div>
        });

    }
}

export class ImportModal extends AdminModal {
    state = { result: null, isLoading: false }

    componentDidMount = () => {
        this.disabledClickOutside();
    }

    componentDidUpdate = () => {
        if (this.state.result != null) {
            window.onbeforeunload = () => true;
        } else {
            window.onbeforeunload = undefined;
        }
    }

    onHide = () => {
        window.onbeforeunload = undefined;
    }

    onShow = () => {
        this.setState({ result: null, isLoading: false });
    }

    onSuccess = (res) => {
        this.setState({ result: res });
    }

    onSubmit = () => {
        const listData = this.state.result.success;
        if (!listData || !listData.length) return T.notify('Danh sách bị trống!', 'danger');
        if (listData?.some(item => item.tinhTrang != 6)) {
            T.customConfirm('Cảnh báo', 'Có sinh viên <span class="text-danger">CHƯA TỐT NGHIỆP</span> trong danh sách. Bạn có muốn cập nhật tình trạng của sinh viên?', 'warning', true, {
                no: { text: 'Không', value: 1, className: 'bg-danger' },
                yes: { text: 'Có', value: 2, className: 'bg-success' },
            }, option => {
                if (option) {
                    this.props.bulkCreate(listData, option == 1 ? 0 : 1, () => this.props.getPage());
                }
            });
        } else {
            this.props.bulkCreate(listData, 0, () => this.props.getPage());
        }

    }

    componentPreview = (data) => {
        return renderTable({
            getDataSource: () => data,
            renderHead: () => <tr>
                <th style={{ whiteSpace: 'nowrap' }}>#</th>
                <th style={{ whiteSpace: 'nowrap' }}>MSSV</th>
                <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Họ tên</th>
                <th style={{ whiteSpace: 'nowrap' }}>Tình trạng</th>
                <th style={{ whiteSpace: 'nowrap' }}>Năm Tốt Nghiệp</th>
                <th style={{ whiteSpace: 'nowrap' }}>Số Hiệu Văn Bằng</th>
                <th style={{ whiteSpace: 'nowrap' }}>Số Vào Sổ Gốc</th>
                <th style={{ whiteSpace: 'nowrap' }}>Ngày cấp</th>
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <td>{index}</td>
                <TableCell content={item.mssv} />
                <TableCell content={item.hoTen} />
                <TableCell content={item.tenTinhTrang} />
                <TableCell content={item.namTotNghiep} />
                <TableCell content={item.soHieuVanBang} />
                <TableCell content={item.soVaoSoGoc} />
                <TableCell content={item.ngayCapBang} />
            </tr>
        });
    }

    componentFailed = (data) => {
        return renderTable({
            getDataSource: () => data || [],
            emptyTable: 'Không có thông báo',
            renderHead: () => (<tr>
                <th style={{ whiteSpace: 'nowrap' }}>Dòng</th>
                <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Thông báo</th>
            </tr>),
            renderRow: (item, index) => (<tr key={index}>
                <td style={{ whiteSpace: 'nowrap' }}>{item.rowNumber}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{item.message}</td>
            </tr>)
        });
    }

    render = () => {
        const { result } = this.state;
        return this.renderModal({
            title: 'Tải lên dữ liệu văn bằng tốt nghiệp',
            size: 'large',
            body: <div className='row'>
                {result == null ? <>
                    <div className='col-md-12'><p className='pt-3'>Tải lên dữ liệu văn bằng tốt nghiệp bằng tệp Excel(.xlsx).Tải tệp tin mẫu tại <a href='' onClick={e => e.preventDefault() || T.download('/api/ctsv/van-bang-tot-nghiep/import/template')}>đây</a>
                    </p> <p className='text-danger mb-3' >Lưu ý: Mọi giá trị trùng lặp sẽ được cập nhật theo dữ liệu mới nhất.</p> </div>
                    <FileBox className='col-md-12' postUrl='/user/upload' ref={e => this.fileBox = e} uploadType='ctsvUploadVbTotNghiep' userData={'ctsvUploadVbTotNghiep'} success={this.onSuccess} />
                </>
                    : <>
                        <p className='col-md-12'>Tải lên thành công <b>{result.success?.length || 0}</b> dòng.</p>
                        <FormTabs className='col-md-12'
                            header={<div style={{ position: 'absolute', right: 0, top: '-2.75em' }}><TooltipButton tooltip='Tải lại' icon='fa-repeat' color='info' style={{ position: 'absolute', right: 0, top: '-2.75em' }} onClick={() => this.setState({ result: null })} /></div>}
                            tabs={[
                                { title: 'Kết quả', component: this.componentPreview(result.success) },
                                { title: <span className='text-danger'>Thông báo</span>, component: this.componentFailed(result.failed) },
                            ]} />
                    </>
                }
            </div>,
            isShowSubmit: result != null,
            isLoading: this.state.isLoading,
        });
    }
}

class AdminVanBangTotNghiepPage extends AdminPage {
    state = { isDetailView: false, hideActions: false, filter: {}, sortTerm: {} }

    componentDidMount() {
        T.ready('/user/ctsv', () => {
            this.props.getPageSvVbTotNghiep(undefined, undefined, '');
            T.clearSearchBox();
            T.onSearch = this.onSearchBar;
            T.showSearchBox(() => this.changeAdvancedSearch());
            this.changeAdvancedSearch();
        });
    }

    onSearchBar = (searchText) => {
        this.getPageSvVbTotNghiep(undefined, undefined, searchText || '');
    }

    changeAdvancedSearch = (isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props.svVanBangTotNghiep && this.props.svVanBangTotNghiep.page ? this.props.svVanBangTotNghiep.page : { pageNumber: 1, pageSize: 50, pageCondition: '' };
        this.getPageSvVbTotNghiep(pageNumber, pageSize, pageCondition, page => page && this.hideAdvanceSearch());
        if (isReset) {
            Object.keys(this).forEach(key => {
                if (this[key].value && this[key].value()) this[key].value('');
            });
        }
    }

    getPageSvVbTotNghiep = (pageNumber, pageSize, pageCondition, done) => {
        this.props.getPageSvVbTotNghiep(pageNumber, pageSize, pageCondition, this.state.filter, this.state?.sortTerm, done);
    };

    uploadExcel = () => {
        T.notify('Danh sách sẽ được tải lên sau vài giây', 'info');
        T.uploadExcel('/api/ctsv/van-bang-tot-nghiep/import-excel');
    }

    handleViewDetail = (studentInfo) => {

        this.modal.show(studentInfo);
    }

    handleKeySearch = (data) => {
        const [keyOfNewData, value] = data.split(':');
        this.setState({ filter: { ...this.state.filter, [keyOfNewData]: value } }, () => {
            this.getPageSvVbTotNghiep();
        });
    }

    render() {
        const { pageNumber, pageSize, pageCondition, pageTotal } = this.props.svVanBangTotNghiep?.page || {},
            list = this.props.svVanBangTotNghiep?.page?.list || [],
            permission = this.getUserPermission('ctsvVbTotNghiep');
        list.forEach(item => {
            item.ngayCapBang = new Date(item.ngayCapBang);
        });
        list.sort((a, b) => a.ngayCapBang - b.ngayCapBang);
        return this.renderPage({
            title: 'Văn bằng tốt nghiệp',
            icon: 'fa fa-graduation-cap',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Văn bằng tốt nghiệp'
            ],
            content:
                <div className="tile">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', marginBottom: '10px' }}>
                        <button id='xem-chi-tiet' className='btn btn-warning btn-toggle' onClick={this.toggleDetailView}>
                            <i className={this.state.isDetailView ? 'fa fa-eye-slash' : 'fa fa-eye'} style={{ marginBottom: '3px' }}></i>
                            {this.state.isDetailView ? 'Xem thông tin cơ bản' : 'Xem chi tiết'}
                        </button>
                        <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageCondition, pageTotal }}
                            getPage={this.getPageSvVbTotNghiep} />
                    </div>

                    {renderTable({
                        getDataSource: () => list?.length ? list : [{}],
                        renderHead: () => (<tr>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
                            <TableHead style={{ width: 'auto' }} content='MSSV' keyCol='mssv' onSort={sortTerm => this.setState({ sortTerm }, () => this.props.getPageSvVbTotNghiep(pageNumber, pageSize, pageCondition, this.state.filter))} onKeySearch={this.handleKeySearch} />
                            <TableHead style={{ width: '100%' }} content='Họ và Tên' keyCol='hoTenSv' onSort={sortTerm => this.setState({ sortTerm }, () => this.props.getPageSvVbTotNghiep(pageNumber, pageSize, pageCondition, this.state.filter))} onKeySearch={this.handleKeySearch} />
                            <TableHead style={{ width: 'auto' }} content='Khoa' keyCol='tenKhoa' onSort={sortTerm => this.setState({ sortTerm }, () => this.props.getPageSvVbTotNghiep(pageNumber, pageSize, pageCondition, this.state.filter))} onKeySearch={this.handleKeySearch} />
                            <TableHead style={{ width: 'auto' }} content='Ngành' keyCol='tenNganh' onSort={sortTerm => this.setState({ sortTerm }, () => this.props.getPageSvVbTotNghiep(pageNumber, pageSize, pageCondition, this.state.filter))} onKeySearch={this.handleKeySearch} />
                            <TableHead style={{ width: 'auto' }} content='Số Hiệu Văn Bằng' keyCol='soHieuVanBang' onSort={sortTerm => this.setState({ sortTerm }, () => this.props.getPageSvVbTotNghiep(pageNumber, pageSize, pageCondition, this.state.filter))} onKeySearch={this.handleKeySearch} />
                            <TableHead style={{ width: 'auto' }} content='Số Vào Sổ Gốc' keyCol='soVaoSoGoc' onSort={sortTerm => this.setState({ sortTerm }, () => this.props.getPageSvVbTotNghiep(pageNumber, pageSize, pageCondition, this.state.filter))} onKeySearch={this.handleKeySearch} />
                            <TableHead style={{ width: 'auto' }} content='Ngày Cấp Bằng' keyCol='ngayCapBang' onSort={sortTerm => this.setState({ sortTerm }, () => this.props.getPageSvVbTotNghiep(pageNumber, pageSize, pageCondition, this.state.filter))} onKeySearch={this.handleKeySearch} typeSearch='date' />
                            <TableHead style={{ width: 'auto' }} content='Năm Tốt Nghiệp' keyCol='namTotNghiep' onSort={sortTerm => this.setState({ sortTerm }, () => this.props.getPageSvVbTotNghiep(pageNumber, pageSize, pageCondition, this.state.filter))} onKeySearch={this.handleKeySearch} />
                            {this.state.isDetailView && (
                                <>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ Đào Tạo</th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Nơi Sinh</th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Dân Tộc</th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giới Tính</th>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày Sinh</th>
                                </>
                            )}
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao Tác</th>
                        </tr>),
                        renderRow: <>{list?.map((item, index) =>
                        (<tr key={index}>
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTenSv} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soHieuVanBang} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soVaoSoGoc} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayCapBang} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='year' content={item.namTotNghiep} />
                            {this.state.isDetailView && (
                                <>
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiHinhDaoTao} />
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.noiSinh} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.danToc} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.gioiTinh == 1 ? 'Nam' : 'Nữ'} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngaySinh} />
                                </>
                            )}
                            <TableCell type='buttons' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} permission={permission} onEdit={() => this.handleViewDetail(item)} />
                        </tr>))}</>
                    })}

                    <ImportModal ref={e => this.importModal = e} permission={permission} bulkCreate={this.props.bulkCreateSvVbTotNghiep} />
                    <VbTotNghiepModal ref={e => this.modal = e} create={this.props.createSvVbTotNghiep} update={this.props.updateSvVbTotNghiep} readOnly={!permission.write} />
                </div>,
            backRoute: '/user/ctsv',
            onCreate: () => permission.write && this.modal.show(),
            onImport: () => permission.write && this.importModal.show()
        });
    }
    toggleDetailView = () => {
        this.setState((prevState) => ({
            isDetailView: !prevState.isDetailView,
            hideActions: !prevState.hideActions,
        }));
    }
}

const mapStateToProps = (state) => ({ system: state.system, svVanBangTotNghiep: state.ctsv.svVanBangTotNghiep });
const mapActionsToProps = {
    getPageSvVbTotNghiep, getSvVbTotNghiep, createSvVbTotNghiep, updateSvVbTotNghiep, bulkCreateSvVbTotNghiep
};

export default connect(mapStateToProps, mapActionsToProps)(AdminVanBangTotNghiepPage);