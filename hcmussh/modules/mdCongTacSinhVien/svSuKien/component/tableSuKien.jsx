import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell, AdminModal } from 'view/component/AdminPage';
import { getPageSuKien, createSuKien, updateSuKien, deleteSuKien, updateDuyetSuKien } from '../redux';
import Pagination from 'view/component/Pagination';
// import { EaseDateRangePicker } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';
import LyDoTuChoiModal from '../modal/lyDoTuChoiModal';

export class ImportDanhSachSuKienModal extends AdminModal {
    state = { result: null }

    onShow = () => {
        this.setState({ result: null });
        this.fileBox.setData('ctsvUploadDanhSachSuKien:');
    }

    onSuccess = (res) => {
        this.setState({ result: res }, this.props.getPage);
    }

    render = () => {
        return this.renderModal({
            title: 'Tải lên danh sách sự kiện',
            size: 'large',
            body: <div className='row'>
                {this.state.result == null ? <>
                    <div className='col-md-12'><p className='pt-3'>Tải lên danh sách sự kiện bằng tệp Excel(.xlsx).Tải tệp tin mẫu tại <a href='' onClick={e => e.preventDefault() || T.download('/api/ctsv/danh-sach-su-kien/import/template')}>đây</a>
                    </p> <p className='text-danger mb-3' >Lưu ý: Mọi giá trị trùng lặp sẽ được cập nhật theo dữ liệu mới nhất.</p> </div>
                    <FileBox className='col-md-12' postUrl='/user/upload' ref={e => this.fileBox = e} uploadType='ctsvUploadDanhSachSuKien' userData={'ctsvUploadDanhSachSuKien'} success={this.onSuccess} />
                </>
                    : <>
                        <p className='col-md-12'>Tải lên thành công <b>{this.state.result.success || 0}</b> dòng.</p>
                        <div className='col-md-12'>
                            {renderTable({
                                getDataSource: () => this.state.result?.failed || [],
                                emptyTable: 'Không có thông báo',
                                renderHead: () => (<tr>
                                    <th style={{ whiteSpace: 'nowrap' }}>Dòng</th>
                                    <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Thông báo</th>
                                </tr>),
                                renderRow: (item, index) => (<tr key={index}>
                                    <td style={{ whiteSpace: 'nowrap' }}>{item.rowNumber}</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>{item.message}</td>
                                </tr>)
                            })}
                        </div>
                    </>
                }
            </div>
        });
    }
}

const APPROVED_MAPPER = {
    1: <span className='text-success'><i className='fa fa-check' /> Đã duyệt</span>,
    0: <span className='text-info'><i className='fa fa-clock-o' /> Chờ duyệt</span>,
    [-1]: <span className='text-danger'><i className='fa fa-times' /> Từ chối</span>,
    2: <span className='text-info'><i className='fa fa-clock-o' /> Đã cập nhật</span>,
};
class TableSuKien extends AdminPage {

    componentDidMount() {
        T.ready('/user/ctsv', () => {
            this.props.getPageSuKien();
        });
    }

    renderSwitch(param) {
        switch (param) {
            case null:
                return APPROVED_MAPPER[0];
            case 'A':
                return APPROVED_MAPPER[1];
            case 'R':
                return APPROVED_MAPPER[-1];
            case 'U':
                return APPROVED_MAPPER[2];
            default:
                return 'Unknown State';
        }
    }

    handleDuyetSuKien = (id, versionNumber) => {
        const data = {
            trangThai: 'A',
            lyDoTuChoi: ''
        };
        T.confirm('Duyệt sự kiện', 'Bạn có chắc muốn duyệt sự kiện này?', isConfirmed => isConfirmed && this.props.updateDuyetSuKien(id, versionNumber, data));
    }

    handleDeleteSuKien = (id) => {
        T.confirm('Xóa sự kiện', 'Bạn có chắc muốn xóa sự kiện này?', isConfirmed => isConfirmed && this.props.deleteSuKien(id));
    }

    isTruongPhongCtsv = (user) => {
        return user.isStaff ? user.staff.listChucVu.some(chucVu => (chucVu.maDonVi == '32' && chucVu.maChucVu == '003')) : false;
    }


    render() {
        const { pageNumber, pageSize, pageCondition, pageTotal } = this.props.svSuKien?.page || {},
            list = this.props.svSuKien?.page?.list || [];

        let { user } = this.props.system ? this.props.system : {};
        if (user == null) user = { email: '', role: '', maDonVi: '', isStaff: false, isStudent: false, staff: { listChucVu: [] } };
        const isTruongPhongCtsv = this.isTruongPhongCtsv(user);
        const isNguoiTao = user.isStudent || (user.isStaff && user.maDonVi == '32');
        // const isNguoiTao = user.isStudent || (user.isStaff && user.maDonVi == '32' && !isTruongPhongCtsv);

        let listTruongDonVi = user.isStaff ? user.staff.listChucVu.filter(chucVu => chucVu.maChucVu == '009') : [];
        if (isTruongPhongCtsv) {
            listTruongDonVi.push({
                maDonVi: '32'
            });
        }
        const permission = this.getUserPermission('ctsvSuKien');
        return (
            <>

                <div className="tile">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', marginBottom: '10px' }}>
                        <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageCondition, pageTotal }} getPage={this.props.getPageSuKien} />
                        {(this.props.canCreate) && !(this.props.isStudent) && (
                            <button style={{ marginRight: '10px' }} className='btn btn-success' type='button' title='Tải lên danh sách sự kiện' onClick={() => this.importDanhSachSuKienModal.show()}>
                                <i className='fa fa-sm fa-upload' /> Tải lên danh sách sự kiện
                            </button>
                        )}
                    </div>

                    {renderTable({
                        getDataSource: () => this.props.isStudent ? list.filter(item => item.trangThai == 'A') :
                            (isNguoiTao && this.props.isFilter) ? list.filter(item => item.nguoiTao == user.email) :
                            (this.props.canDuyet && this.props.isDuyetPage) ? list.filter(item => listTruongDonVi.some(donVi => donVi.maDonVi == item.maDonVi) || user.maDonVi == item.maDonVi) :
                                // (this.props.canDuyet && (this.props.isFilter || this.props.isDuyetPage)) ? list.filter(item => listTruongDonVi.some(donVi => donVi.maDonVi == item.maDonVi) || user.maDonVi == item.maDonVi) :
                                    list,
                        renderHead: () => (<tr>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
                            <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Tên sự kiện</th>
                            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Thời gian diễn ra</th>
                            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Thời gian bắt đầu đăng ký</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số lượng tham gia dự kiến</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số lượng tham gia tối đa</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Địa điểm</th>
                            {this.props.isStudent ? '' : <>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Lý do từ chối</th>
                                {this.props.canCreate && (this.props.isFilter) && (
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                                )}

                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                            </>}
                        </tr>),
                        renderRow: (item, index) =>
                        (<tr key={index}>
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} />
                            <TableCell type='link' url={this.props.isStudent ? `/user/student/su-kien/${item.idSuKien}` : (this.props.canDuyet && this.props.isDuyetPage) ? `/user/ctsv/duyet-su-kien/edit/${item.idSuKien}` : `/user/ctsv/danh-sach-su-kien/edit/${item.idSuKien}`} style={{ whiteSpace: 'nowrap' }} content={item.tenSuKien} />

                            <TableCell style={{ whiteSpace: 'nowrap' }} content={<>
                                <span><b>Từ:  </b>{T.dateToText(item.thoiGianBatDau, 'dd/mm/yyyy HH:MM')}</span><br />
                                <span><b>Đến: </b>{T.dateToText(item.thoiGianKetThuc, 'dd/mm/yyyy HH:MM')}</span>
                            </>} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy HH:MM' content={item.thoiGianBatDauDangKy} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soLuongThamGiaDuKien} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soLuongThamGiaToiDa} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.diaDiem} />
                            {this.props.isStudent ? '' : <>
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={this.renderSwitch(item.trangThai)} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lyDoTuChoi} />
                                {this.props.canCreate && (this.props.isFilter) && (
                                    <TableCell type='checkbox' style={{ textAlign: 'center' }} permission={permission} content={item.kichHoat ? 1 : 0} onChanged={value => this.props.updateDuyetSuKien(item.idSuKien, item.versionNumber, { kichHoat: value })} />
                                )}
                                <TableCell type='buttons' style={{ width: 'auto', whiteSpace: 'nowrap' }}>
                                    {!(this.props.isDuyetPage) && (
                                        <Link to={`/user/ctsv/danh-sach-su-kien/edit/${item.idSuKien}`}>
                                            <button className='btn btn-primary' title='Xem chi tiết' type='button' >
                                                <i className='fa fa-lg fa-eye' />
                                            </button>
                                        </Link>
                                    )}
                                    {this.props.canDuyet && this.props.isDuyetPage && (
                                        <Link to={`/user/ctsv/duyet-su-kien/edit/${item.idSuKien}`}>
                                            <button className='btn btn-primary' title='Xem chi tiết' type='button' >
                                                <i className='fa fa-lg fa-eye' />
                                            </button>
                                        </Link>
                                    )}

                                    {this.props.canCreate && (this.props.isFilter) && (
                                        <button className='btn btn-warning' type='button' title='Xoá' onClick={() => this.handleDeleteSuKien(item.idSuKien)} >
                                            <i className='fa fa-fw fa-lg fa-trash' />
                                        </button>
                                    )}
                                    {this.props.canDuyet && item.trangThai !== 'A' && this.props.isDuyetPage && (
                                        <>
                                            <button className='btn btn-success' type='button' title='Duyệt' onClick={() => this.handleDuyetSuKien(item.idSuKien, item.versionNumber)} >
                                                <i className='fa fa-fw fa-lg fa fa-check' />
                                            </button>
                                        </>
                                    )}
                                    {this.props.canDuyet && item.trangThai !== 'R' && this.props.isDuyetPage && (
                                        <>
                                            <button className='btn btn-danger' type='button' title='Từ Chối' onClick={() => this.lydotuchoiModal.show(item)}>
                                                <i className='fa fa-fw fa-lg fa fa-times' />
                                            </button>
                                        </>
                                    )}

                                </TableCell>
                            </>}

                        </tr>)
                    })}
                    <ImportDanhSachSuKienModal ref={e => this.importDanhSachSuKienModal = e} permission={permission} getPage={this.getPage} />
                    <LyDoTuChoiModal ref={e => this.lydotuchoiModal = e}
                        update={this.props.updateDuyetSuKien}
                        onHide={() => this.props.getPageSuKien()}
                    />
                </div>
            </>
        );
    }
}

const mapStateToProps = (state) => ({ system: state.system, svSuKien: state.ctsv.svSuKien });
const mapActionsToProps = {
    getPageSuKien, createSuKien, updateSuKien, deleteSuKien, updateDuyetSuKien,
};

export default connect(mapStateToProps, mapActionsToProps)(TableSuKien);



