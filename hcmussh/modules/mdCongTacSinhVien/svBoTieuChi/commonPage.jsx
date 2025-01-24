import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell, FormTextBox, AdminModal, FormRichTextBox, getValue } from 'view/component/AdminPage';
import { getAllManageBoTieuChi, createManageBoTieuChi, updateManageBoTieuChi, deleteManageBoTieuChi, cloneManageBoTieuChi } from './redux';
import { Tooltip } from '@mui/material';

class BoTieuChiModal extends AdminModal {
    state = { oldDiemMax: 0 }

    onShow = (item) => {
        const { id, ten, ghiChu } = item || {};
        this.setState({ id, item });
        this.ten.value(ten || '');
        this.ghiChu.value(ghiChu || '');
    }

    onSubmit = () => {
        const changes = {
            ten: getValue(this.ten),
            ghiChu: getValue(this.ghiChu),
        };
        T.confirm(`Xác nhận ${this.state.ma ? 'cập nhật' : 'tạo'} bộ tiêu chí?`, '', isConfirm => {
            if (isConfirm) {
                if (this.state.id) {
                    this.props.update(this.state.id, changes, this.hide);
                } else {
                    this.props.create(changes, item => this.props.goTo(`/user/ctsv/bo-tieu-chi/${item.id}`));
                }
            }
        });
    }

    render = () => {
        return this.renderModal({
            title: (this.state.id ? 'Cập nhật' : 'Tạo') + ' bộ tiêu chí',
            body: <div className="row">
                <FormTextBox className='col-md-12' ref={e => this.ten = e} label='Tên' required />
                <FormRichTextBox className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' />
            </div>,
            submitText: this.state.id ? 'Cập nhật' : 'Tạo'
        });
    }
}

class BoTieuChiCommonPage extends AdminPage {
    state = { editId: null, maCha: null, isSorting: false, isExpand: true };

    componentDidMount() {
        this.props.getAllManageBoTieuChi();
    }

    // Function
    goTo = (url) => {
        this.props.history.push(url);
    }

    deleteBoTieuChi = (id) => {
        T.confirm('Xác nhận xóa bộ tiêu chí?', '', isConfirm => isConfirm && this.props.deleteManageBoTieuChi(id));
    }

    cloneBoTieuChi = (id) => {
        T.confirm('Xác nhận sao chép bộ tiêu chí?', '', isConfirm => isConfirm && this.props.cloneManageBoTieuChi(id));
    }

    // Component

    componentTable = () => {
        const permission = this.getUserPermission('ctsvBoTieuChi', ['manage', 'write', 'delete']);
        const list = this.props.ctsvBoTieuChi?.items;
        return renderTable({
            getDataSource: () => list,
            renderHead: () => (<tr>
                <th style={{ whiteSpace: 'nowrap' }}>#</th>
                <th style={{ whiteSpace: 'nowrap', width: '50%' }}>Tên</th>
                <th style={{ whiteSpace: 'nowrap', width: '50%' }}>Ghi nhú</th>
                <th style={{ whiteSpace: 'nowrap' }}>Thao tác</th>

            </tr>),
            renderRow: (item, index) => (<tr key={index}>
                <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={<Link to={`/user/ctsv/bo-tieu-chi/${item.id}`}>{item.ten}</Link>} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} type='buttons'
                    onEdit={() => this.modal.show(item)}
                    onDelete={() => this.deleteBoTieuChi(item.id)}
                    permission={permission}
                >
                    <Tooltip title='Sao chép'><button className='btn btn-warning' onClick={e => e.preventDefault() || this.cloneBoTieuChi(item.id)}><i className='fa fa-clone'></i></button></Tooltip>
                </TableCell>
            </tr>)
        });
    }

    render() {
        return this.renderPage({
            title: 'Bộ tiêu chí',
            icon: 'fa fa-book',
            content: <div className="tile">
                {this.componentTable()}
                <BoTieuChiModal ref={e => this.modal = e} update={this.props.updateManageBoTieuChi} create={this.props.createManageBoTieuChi} goTo={this.goTo} />
            </div>,
            backRoute: '/user/ctsv/diem-ren-luyen',
            breadcrumb: [
                <Link key={1} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Danh sách bộ'
            ],
            onCreate: () => this.modal.show()
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, ctsvBoTieuChi: state.ctsv.ctsvBoTieuChi });
const mapActionsToProps = { getAllManageBoTieuChi, createManageBoTieuChi, updateManageBoTieuChi, deleteManageBoTieuChi, cloneManageBoTieuChi };
export default connect(mapStateToProps, mapActionsToProps)(BoTieuChiCommonPage);