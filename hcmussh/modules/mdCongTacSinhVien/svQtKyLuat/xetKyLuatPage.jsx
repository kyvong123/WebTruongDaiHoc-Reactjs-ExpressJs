import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import CauHinhXetKyLuat from './component/cauHinhXetKyLuat';
import { getDmDonViFaculty } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmHinhThucKyLuat, getAllSvDmHinhThucKyLuat } from 'modules/mdCongTacSinhVien/svDmHinhThucKyLuat/redux';
import {
    getSvQtKyLuatDssvTheoCauHinh, createSvQtKyLuatCauHinh, getSvQtKyLuatCauHinhPage, getSvQtKyLuatCauHinhDssv,
    getSvQtKyLuatCauHinh, updateSvQtKyLuatCauHinh, deleteSvQtKyLuatCauHinh, congBoKhoaSvQtKyLuatCauHinh, ghiChuSvKyLuatDssvDuKien
} from './redux';
import T from 'view/js/common';
import { Tooltip } from '@mui/material';
import EditModal from './editModal';
import CreateRequest from 'modules/mdHanhChinhTongHop/hcthSoDangKy/components/createRequest';

class DssvKyLuatModal extends AdminModal {
    state = { dssv: [], dssvFilter: [], pageNumber: 1, pageSize: 50, pageTotal: null, list: [] };

    componentDidMount() {
        this.props.getAllSvDmHinhThucKyLuat(items => {
            this.setState({ hinhThucMapper: items.reduce((obj, item) => Object.assign(obj, { [item.id]: item }), {}) });
        });
    }

    onShow = (item) => {
        let { dssv, idCauHinh } = item;
        dssv = dssv.filter(sv => sv.isCuuXet == false);
        this.setState({ dssv: dssv || [], dssvFilter: dssv || [], idCauHinh }, () => {
            this.hinhThucKyLuat.value('');
            this.getPage();
        });
    };

    onHide = () => {
        setTimeout(() => {
            const { hinhThucMapper, idCauHinh } = this.state;
            console.log(this.state.dssvFilter.filter(sv => sv.hinhThucKyLuat == null));
            this.props.quyetDinhModal.show({
                dssv: this.state.dssvFilter.filter(sv => sv.hinhThucKyLuat != null).map(sv => {
                    if (sv.tinhBoSung == 1 && sv.hinhThucKyLuatBoSung) {
                        sv.hinhThucKyLuat = sv.hinhThucKyLuatBoSung;
                        sv.hinhThucKyLuatText = sv.hinhThucKyLuatBoSungText;
                    }
                    sv.chuyenTinhTrang = hinhThucMapper[sv.hinhThucKyLuat].chuyenTinhTrang;
                    return sv;
                }), lyDoHinhThuc: this.hinhThucKyLuat?.value(), idCauHinh
            });
        }, 500);
    }

    getPage = (number, size) => {
        let { pageNumber, pageSize, dssvFilter = [] } = this.state;
        pageNumber = number ?? pageNumber;
        pageSize = size ?? pageSize;
        const pageTotal = Math.ceil(dssvFilter.length / pageSize);
        const list = dssvFilter.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
        this.setState({ pageNumber, pageSize, pageTotal, list });
    }

    changeHinhThucKyLuat = () => {
        const dmHinhThuc = this.hinhThucKyLuat.value();
        let dssvFilter = this.state.dssv ?? [];
        if (dmHinhThuc && dmHinhThuc.length) {
            dssvFilter = dssvFilter.filter(sv => ((
                sv.tinhBoSung == 1 && sv.hinhThucKyLuatBoSung && dmHinhThuc.includes(sv.hinhThucKyLuatBoSung.toString())) ||
                (sv.tinhBoSung == 0 && sv.hinhThucKyLuatBoSung && dmHinhThuc.includes(sv.hinhThucKyLuat.toString())) ||
                (!sv.hinhThucKyLuatBoSung && sv.hinhThucKyLuat && dmHinhThuc.includes(sv.hinhThucKyLuat.toString()))));
        }
        this.setState({ dssvFilter }, () => this.getPage());
    }

    onSubmit = () => {
        // Danh sách phải không rỗng
        if (this.state.dssvFilter.length == 0) {
            T.notify('Danh sách sinh viên rỗng!', 'danger');
            return;
        }
        if (this.state.dssvFilter.some(item => !item.hinhThucKyLuat)) {
            T.confirm('Cảnh báo', '<span class="text-danger">Những sinh viên <b>KHÔNG CÒN PHÙ HỢP</b> với cấu hình xét kỷ luật sẽ bị loại khỏi danh sách. Bạn có muốn tiếp tục?</span>', isConfirm => {
                if (isConfirm) {
                    this.hide();
                }
            });
        } else {
            T.confirm('Tạo quyết định', `Lấy ${this.state.dssvFilter.length} sinh viên để tạo quyết định`, isConfirm => {
                if (isConfirm) {
                    this.hide();
                }
            });
        }
    }

    deleteSvDuKien = (item) => {
        this.setState(prevState => ({ dssvFilter: prevState.dssvFilter.filter(sv => sv.mssv != item.mssv) }));
    };

    resetDssvDuKien = () => {
        // Reset danh sách bằng cách reset bộ lọc
        this.hinhThucKyLuat?.value(null);
        this.changeHinhThucKyLuat(null);
    }

    render = () => {
        const { dssvFilter, list, pageNumber, pageSize, pageTotal } = this.state;
        return this.renderModal({
            title: 'Danh sách sinh viên kỷ luật',
            size: 'elarge',
            submitText: 'Tiếp tục',
            body: <div className='row flex-row-reverse'>
                <FormSelect label='Hình thức kỷ luật' className='col-md-12' ref={(e) => (this.hinhThucKyLuat = e)} data={SelectAdapter_DmHinhThucKyLuat} placeholder='Kỷ luật' allowClear={true} onChange={() => this.changeHinhThucKyLuat()} multiple />
                <div className='col-md-12'>
                    <div className='d-flex justify-content-between align-items-center'>
                        <span>Danh sách này có <b>{dssvFilter.length}</b> sinh viên</span>
                        <div className='d-flex justify-content-end align-items-center'>
                            <div><Pagination style={{ position: '' }} {...{ pageNumber, pageSize, pageTotal }} getPage={this.getPage} /></div>
                            <button className='btn btn-warning' onClick={e => e.preventDefault() || this.resetDssvDuKien()} >
                                <i className='fa fa-repeat' />Phục hồi
                            </button>
                        </div>
                    </div>
                </div>
                <div className='col-md-12'>
                    {renderTable({
                        getDataSource: () => list,
                        header: 'thead-light',
                        className: 'table-fix-col',
                        stickyHead: list?.length > 10,
                        renderHead: () => (
                            <tr>
                                <th style={{ width: 'auto' }}>STT</th>
                                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>MSSV</th>
                                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Họ tên</th>
                                <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>ĐTB</th>
                                <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>ĐTBTL</th>
                                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Kỷ luật</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kỷ luật bổ sung</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú khoa</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú ctsv</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                            </tr>
                        ),
                        renderRow: (item, index) => (<tr key={index} style={{ backgroundColor: (!item.hinhThucKyLuatText || item.ghiChuKhoa) ? '#f7de97' : '' }}>
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.diemTrungBinh} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.diemTrungBinhTichLuy} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hinhThucKyLuatText || ''} />
                            <TableCell style={{ whiteSpace: 'nowrap', background: (!item.tinhBoSung && item.hinhThucKyLuatBoSungText) ? '#f5e97a' : '' }} content={((!item.tinhBoSung && item.hinhThucKyLuatBoSungText) ? <s>{item.hinhThucKyLuatBoSungText}</s> : item.hinhThucKyLuatBoSungText) || ''} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChuKhoa || ''} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChuCtsv || ''} />
                            <TableCell type='buttons' style={{ textAlign: 'center' }}>
                                <Tooltip title='Xóa' arrow>
                                    <button className='btn btn-danger' onClick={e => { e.preventDefault(); this.deleteSvDuKien(item); }}>
                                        <i className='fa fa-lg fa-trash' />
                                    </button>
                                </Tooltip>
                            </TableCell>
                        </tr>)
                    })}
                </div>
            </div>
        });
    }
}

class QtKyLuat extends AdminPage {
    state = { filter: {}, selectedIndex: null }
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            T.clearSearchBox();
            this.props.getDmDonViFaculty(item => {
                item = item.filter(e => e.ma != 32 && e.ma != 33);
                this.setState({ khoa: item });
            });
            let { pageNumber, pageSize, pageCondition } = this.props && this.props.svQtKyLuat && this.props.svQtKyLuat.pageCauHinh ? this.props.svQtKyLuat.pageCauHinh : { pageNumber: 1, pageSize: 50, pageCondition: {} };
            this.props.getSvQtKyLuatCauHinhPage(pageNumber, pageSize, pageCondition, this.state.filter);
        });
    }

    delete = (e, item) => {
        T.confirm('Xóa kỷ luật', 'Bạn có chắc bạn muốn xóa kỷ luật này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteSvQtKyLuat(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá kỷ luật bị lỗi!', 'danger');
                else T.alert('Xoá kỷ luật thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    saveCauHinh = () => {
        this.cauHinhXetKyLuatComponent.saveCauHinh();
    }

    editCauHinh = (id) => {
        this.cauHinhXetKyLuatComponent.setData(id);
    }

    delete = (id) => {
        T.confirm('Xóa cấu hình', 'Bạn có chắc muốn xóa cấu hình này không ?', isConfirm => {
            if (isConfirm)
                this.props.deleteSvQtKyLuatCauHinh(id);
        });
    }

    changeActive = item => this.props.congBoKhoaSvQtKyLuatCauHinh(item.id, { congBo: Number(!item.congBo) });

    createQuyetDinh = (id) => {
        this.props.getSvQtKyLuatCauHinhDssv(id, ({ dssvDuKien }) => {
            this.dsKyLuatModal.show({ dssv: dssvDuKien, idCauHinh: id });
        });
    }

    render() {
        const permission = this.getUserPermission('ctsvKyLuat', ['read', 'write', 'delete', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.svQtKyLuat && this.props.svQtKyLuat.pageCauHinh ?
            this.props.svQtKyLuat.pageCauHinh : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list,
                stickyHead: list && list.length > 12,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'left' }}>#</th>
                        <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Năm học</th>
                        <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Học kỳ</th>
                        <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Khóa sinh viên</th>
                        <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Hệ đào tạo</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Tổng sinh viên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoa phản hồi</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index} style={{ backgroundColor: this.state.selectedIndex == index ? '#D3D3D3' : '' }}>
                        <TableCell type='text' style={{ textAlign: 'left' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{ textAlign: 'left' }} content={item.namHoc || ''} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.hocKy || ''} />
                        <TableCell type='text' style={{ textAlign: 'left' }} content={item.khoaSinhVien || ''} />
                        <TableCell type='text' style={{ textAlign: 'left' }} content={item.heDaoTao || ''} />
                        <TableCell type='text' style={{ textAlign: 'left' }} content={item.tongSinhVien || ''} />
                        <TableCell type='checkbox' content={item.congBo} permission={permission} onChanged={() => this.changeActive(item)} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.setState({ selectedIndex: index }) || this.editCauHinh(item.id)} onDelete={() => this.delete(item.id)} >
                            <Tooltip title='Tạo quyết định'><button onClick={e => e.preventDefault() || this.createQuyetDinh(item.id)} className='btn btn-warning'>
                                <i className='fa fa-legal' />
                            </button></Tooltip>
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-ban',
            title: 'Quá trình kỷ luật',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Quá trình kỷ luật'
            ],
            content: <>
                <div className='tile'>
                    <div className='d-flex justify-content-between'>
                        <h5>Danh sách kỷ luật đã lưu</h5>
                        <div><Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} /></div>
                    </div>
                    {table}
                </div>
                <CauHinhXetKyLuat khoa={this.state.khoa}
                    ref={e => this.cauHinhXetKyLuatComponent = e}
                    getSvQtKyLuatDssvTheoCauHinh={this.props.getSvQtKyLuatDssvTheoCauHinh}
                    createSvQtKyLuatCauHinh={this.props.createSvQtKyLuatCauHinh}
                    getSvQtKyLuatCauHinhDssv={this.props.getSvQtKyLuatCauHinhDssv}
                    getUserPermission={this.getUserPermission}
                    updateSvQtKyLuatCauHinh={this.props.updateSvQtKyLuatCauHinh}
                    ghiChuSvKyLuatDssvDuKien={this.props.ghiChuSvKyLuatDssvDuKien}
                />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    requestModal={this.requestModal}
                    goTo={this.props.history.push}
                />
                <CreateRequest ref={e => this.requestModal = e} onHide={this.onHideRequest} />
                <DssvKyLuatModal ref={e => this.dsKyLuatModal = e} readOnly={!permission.write} quyetDinhModal={this.modal} getAllSvDmHinhThucKyLuat={this.props.getAllSvDmHinhThucKyLuat} />
            </>,
            backRoute: '/user/ctsv/qua-trinh/ky-luat',
            buttons: [
                {
                    icon: 'fa-save', className: 'btn-success', onClick: () => this.saveCauHinh(), tooltip: 'Lưu thay đổi thông tin của bạn'
                },
                {
                    icon: 'fa-plus', className: 'btn-info', tooltip: 'Tạo mới cấu hình', onClick: () => this.setState({ selectedIndex: null }) || this.cauHinhXetKyLuatComponent.resetData()
                }
            ],
        });
    }
}

const mapStateToProps = state => ({ system: state.system, svQtKyLuat: state.ctsv.svQtKyLuat });
const mapActionsToProps = {
    getDmDonViFaculty, getSvQtKyLuatDssvTheoCauHinh, createSvQtKyLuatCauHinh, getSvQtKyLuatCauHinhPage, getSvQtKyLuatCauHinh,
    getSvQtKyLuatCauHinhDssv, updateSvQtKyLuatCauHinh, deleteSvQtKyLuatCauHinh, congBoKhoaSvQtKyLuatCauHinh, ghiChuSvKyLuatDssvDuKien,
    getAllSvDmHinhThucKyLuat
};
export default connect(mapStateToProps, mapActionsToProps)(QtKyLuat);