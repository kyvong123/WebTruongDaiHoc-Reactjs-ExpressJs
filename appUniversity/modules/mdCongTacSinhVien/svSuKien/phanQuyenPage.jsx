import React from 'react';
import { AdminPage, renderTable, TableHead, TableCell, AdminModal, FormSelect, getValue } from 'view/component/AdminPage';
import { getPagePhanQuyenDuyetSuKien, createNguoiDuyet, deleteNguoiDuyet } from './redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_CanBoDonVi } from 'modules/mdTruyenThong/fwQuestionAnswer/redux/qa/redux';


class AddNguoiDuyetModal extends AdminModal {
    onShow = (item) => {
        const { tenCanBo = '' } = item || {};
        this.setState({ tenCanBo });
        this.canBo.value(tenCanBo ? tenCanBo.split(',') : []);
    }

    onSubmit = () => {
        const data = {
            email: getValue(this.canBo),
            maDonVi: this.props.maDonVi,
        };
        this.props.create(data, this.hide());
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Tạo thêm người duyệt',
            size: 'large',
            body: <div className="row">
                <FormSelect ref={e => this.canBo = e} className='col-md-12' label='Tên cán bộ'
                    data={SelectAdapter_CanBoDonVi(this.props.maDonVi)} required readOnly={readOnly} />
            </div>
        });
    }
}

class PhanQuyenPage extends AdminPage {

    state = {
        maDonVi: ''
    }
    componentDidMount() {
        T.ready('/user/ctsv/phan-quyen-su-kien', () => {
            this.props.getPagePhanQuyenDuyetSuKien(null, null, null, null);
            let { user } = this.props.system ? this.props.system : {};
            let maDonVi = null;
            if (user.isStaff) {
                const filtered = user.staff.listChucVu.filter(chucVu => chucVu.maChucVu === '009');
                const isCtsv = user.staff.listChucVu.some(chucVu => chucVu.maDonVi == '32' && chucVu.maChucVu == '003');
                maDonVi = filtered.length > 0 ? filtered[0].maDonVi : isCtsv ? '32' : null;
            }
            this.setState({
                maDonVi: maDonVi
            });

        });
    }

    getPagePhanQuyenDuyetSuKien = (pageNumber, pageSize, pageCondition, done) => {
        let filter = { ...this.state.filter };
        this.props.getPagePhanQuyenDuyetSuKien(pageNumber, pageSize, pageCondition, filter, done);
    };

    handleKeySearch = (data) => {
        const [keyOfNewData, value] = data.split(':');
        this.setState({ filter: { ...this.state.filter, [keyOfNewData]: value } }, () => {
            this.getPagePhanQuyenDuyetSuKien();
        });
    }
    handleDeleteNguoiDuyet = (id) => {
        T.confirm('Xóa người duyệt', 'Bạn có chắc muốn xóa người duyệt này?', isConfirmed => isConfirmed && this.props.deleteNguoiDuyet(id));
    }

    render() {
        const { pageNumber, pageSize, pageCondition, pageTotal } = this.props.svSuKien?.suKienQuyenDuyet || {},
            list = this.props.svSuKien?.suKienQuyenDuyet?.list || [],
            permission = this.getUserPermission('ctsvSuKien', ['duyet', 'write']);
            console.log('maDonVi: ',this.state.maDonVi);
            console.log('list: ',list);
            const data = list.filter(item => item.maDonVi.toString().trim() == this.state.maDonVi.toString().trim());
        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Phân Quyền Duyệt Sự Kiện',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Sự Kiện'
            ],
            content:
                <div className="tile">
                    {renderTable({
                        getDataSource: () => data,
                        renderHead: () => (<tr>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
                            <TableHead style={{ width: '40%', whiteSpace: 'nowrap' }} content='Tên cán bộ' keyCol='tenCanBo' onKeySearch={this.handleKeySearch} />
                            <TableHead style={{ width: '30%', whiteSpace: 'nowrap' }} content='Email' keyCol='email' onKeySearch={this.handleKeySearch} />
                            <TableHead style={{ width: '30%', whiteSpace: 'nowrap' }} content='Đơn vị duyệt' keyCol='donViDuyet' />
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>

                        </tr>),
                        renderRow: <>{data?.map((item, index) =>
                        (<tr key={index}>
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenCanBo} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.email} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.donViDuyet} />
                            <TableCell type='buttons' style={{ width: 'auto', whiteSpace: 'nowrap' }}>
                                <button className='btn btn-warning' type='button' title='Xoá' onClick={() => this.handleDeleteNguoiDuyet(item.id)} >
                                    <i className='fa fa-fw fa-lg fa-trash' />
                                </button>
                            </TableCell>
                        </tr>))}</>
                    })}
                    <AddNguoiDuyetModal ref={e => this.modal = e} create={this.props.createNguoiDuyet} readOnly={!permission.duyet} maDonVi={this.state.maDonVi} />
                    <Pagination style={{ position: '', bottom: '', width: '' }} {...{ pageNumber, pageSize, pageCondition, pageTotal }}
                        getPage={this.getPagePhanQuyenDuyetSuKien} />
                </div>,


            backRoute: '/user/ctsv/su-kien',
            onCreate: () => permission.duyet && this.modal.show(),
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, svSuKien: state.ctsv.svSuKien });
const mapActionsToProps = { getPagePhanQuyenDuyetSuKien, createNguoiDuyet, deleteNguoiDuyet };
export default connect(mapStateToProps, mapActionsToProps)(PhanQuyenPage);
