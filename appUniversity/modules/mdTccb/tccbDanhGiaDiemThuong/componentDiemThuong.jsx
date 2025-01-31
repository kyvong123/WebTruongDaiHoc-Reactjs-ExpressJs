import React from 'react';
import { connect } from 'react-redux';
import { getTccbDiemThuongAll, createTccbDiemThuong, updateTccbDiemThuong, deleteTccbDiemThuong } from './redux';
import { SelectAdapter_DmKhenThuongKyHieuV2 } from 'modules/mdDanhMuc/dmKhenThuongKyHieu/redux';
import { AdminModal, AdminPage, FormSelect, FormTextBox, getValue, renderTable, TableCell } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { id: null };

    onShow = (item) => {
        this.setState({ id: item ? item.id : null }, () => {
            let { ma, diemQuyDinh } = item ? item : { ma: '', diemQuyDinh: 0 };
            this.ma.value(ma || '');
            this.diemQuyDinh.value(diemQuyDinh);
        });
    };

    onSubmit = (e) => {
        const changes = {
            ma: getValue(this.ma),
            diemQuyDinh: getValue(this.diemQuyDinh)
        };
        if (!this.state.id) {
            this.props.create({ ...changes, nam: this.props.nam }, () => this.hide());
        } else {
            this.props.update(this.state.id, changes, () => this.hide());
        }
        e.preventDefault();
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật' : 'Tạo mới',
            body: <div>
                <FormSelect ref={e => this.ma = e} label='Mục điểm thưởng' data={SelectAdapter_DmKhenThuongKyHieuV2} readOnly={readOnly} required />
                <FormTextBox ref={e => this.diemQuyDinh = e} type='number' min='0' label='Điểm quy định' readOnly={readOnly} required />
            </div>
        });
    }
}

class ComponentDiemThuong extends AdminPage {
    state = { isLoading: true, length: 0 }

    componentDidMount() {
        this.load();
    }

    load = (done) => this.props.nam && this.props.getTccbDiemThuongAll({ nam: Number(this.props.nam) }, items => {
        this.setState({ items });
        done && done();
    });

    create = (item, done) => this.props.createTccbDiemThuong(item, () => this.load(done));

    update = (id, changes, done) => this.props.updateTccbDiemThuong(id, changes, () => this.load(done));

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa điểm thưởng', 'Bạn có chắc bạn muốn xóa điểm thưởng này?', true, isConfirm =>
            isConfirm && this.props.deleteTccbDiemThuong(item.ma, this.load));
    }

    render() {
        const permission = this.getUserPermission('tccbDanhGiaNam');
        const list = this.state.items || [];
        let table = renderTable({
            emptyTable: 'Không có dữ liệu điểm thưởng',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: '35%', whiteSpace: 'nowrap' }}>Nội dung</th>
                    <th style={{ width: '35%', whiteSpace: 'nowrap' }}>Nội dung</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Điểm quy định</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'left' }} type='link' content={item.noiDung} onClick={() => this.modal.show(item)} />
                    <TableCell style={{ textAlign: 'left' }} type='link' content={item.tenKhenThuong} onClick={() => this.modal.show(item)} />
                    <TableCell style={{ textAlign: 'center' }} content={item.diemQuyDinh} />
                    <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr>
            )
        });
        return (<div>
            <div>{table}</div>
            {
                permission.write && (<div style={{ textAlign: 'right' }}>
                    <button className='btn btn-info' type='button' onClick={() => this.modal.show(null)}>
                        <i className='fa fa-fw fa-lg fa-plus' />Thêm điểm thưởng
                    </button>
                </div>)
            }
            <EditModal ref={e => this.modal = e}
                create={this.create} update={this.update} readOnly={!permission.write}
                nam={this.props.nam}
            />
        </div>);
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTccbDiemThuongAll, createTccbDiemThuong, updateTccbDiemThuong, deleteTccbDiemThuong };
export default connect(mapStateToProps, mapActionsToProps)(ComponentDiemThuong);