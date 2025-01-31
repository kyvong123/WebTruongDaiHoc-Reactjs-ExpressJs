import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, CirclePageButton, AdminModal, FormSelect, renderTable, TableCell, getValue } from 'view/component/AdminPage';
import { SelectAdapter_FwCanBoWithDonVi } from 'modules/mdTccb/tccbCanBo/redux';
import { getUyQuyen, createUyQuyen, updateUyQuyen, deleteUyQuyen } from './redux/uyQuyen';


class AddModal extends AdminModal {

    componentDidMount() {
        this.disabledClickOutside();
        this.onHidden(() => {
            this.shcc.value('');
        });
    }

    onShow = (item) => {
        const { id, shcc } = item || { id: '', shcc: '' };
        this.setState({ id, shcc }, () => {
            this.shcc.value(shcc);
        });
    }

    onSubmit = () => {
        const shcc = getValue(this.shcc),
            { id } = this.state;

        if (this.props.listUyQuyen.find(i => i.shcc == shcc)) return T.alert('Cán bộ đã được ủy quyền rồi!', 'error', false, 2000);

        id ? this.props.updateUyQuyen(id, shcc, this.hide) : this.props.createUyQuyen(shcc, this.hide);
    }

    render = () => {
        return this.renderModal({
            title: this.state.id ? 'Cập nhật cán bộ được ủy quyền' : 'Gán cán bộ ủy quyền',
            body: <div className='row'>
                <FormSelect className='col-md-12' required ref={e => this.shcc = e} data={SelectAdapter_FwCanBoWithDonVi} label='Cán bộ được ủy quyền' />
            </div>,
        });
    }
}

class UyQuyenComponent extends AdminPage {

    componentDidMount() {
        this.props.getUyQuyen();
    }

    handleDelete = (item) => {
        T.confirm('Xoá ủy quyền', 'Bạn có chắc chắn muốn xoá cán bộ được ủy quyền không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                this.props.deleteUyQuyen(item.id);
            }
        });
    }

    render() {
        const items = this.props.hcthCongTac?.listUyQuyen || [];

        return <>
            {
                renderTable({
                    emptyTable: 'Chưa có danh sách ủy quyền!',
                    header: 'thead-light',
                    getDataSource: () => items,
                    renderHead: () => {
                        return <tr>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>SHCC</th>
                            <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                            <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Đơn vị</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>;
                    },
                    renderRow: (item, index) => {
                        return <tr key={index}>
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.shcc} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.ho} ${item.ten}`} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenDonVi} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item} type='buttons' permission={{ write: true, delete: true }}
                                onEdit={() => this.modal.show(item)}
                                onDelete={() => this.handleDelete(item)}
                            />
                        </tr>;
                    },
                })
            }
            <AddModal ref={e => this.modal = e} createUyQuyen={this.props.createUyQuyen} updateUyQuyen={this.props.updateUyQuyen} listUyQuyen={this.props.hcthCongTac?.listUyQuyen} />
            <CirclePageButton type='create' onClick={e => e && e.preventDefault() || this.modal.show()} />
        </>;
    }
}


const stateToProps = (state) => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const actionsToProps = { getUyQuyen, createUyQuyen, updateUyQuyen, deleteUyQuyen };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(UyQuyenComponent);