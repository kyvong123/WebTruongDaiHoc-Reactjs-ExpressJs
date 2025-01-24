import React from 'react';
import { connect } from 'react-redux';
import { getAllDtDiemDmTinhTrang, createDtDiemDmTinhTrang, updateDtDiemDmTinhTrang } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox, getValue } from 'view/component/AdminPage';
class EditModal extends AdminModal {
    componentDidMount() {
        this.onShown(() => {
            this.ma.focus();
        });

    }
    onShow = (item) => {
        let { ma = '', ten = '', kichHoat } = item ? item : { ma: '', ten: '', kichHoat: 1 };
        this.setState({ ma });
        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: getValue(this.ma),
            ten: getValue(this.ten),
            kichHoat: Number(getValue(this.kichHoat))
        };
        this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật' : 'Tạo mới',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma} required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }} required />
            </div>
        }
        );
    };
}

class DiemDmTinhTrangPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getAllDtDiemDmTinhTrang();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    render() {
        const permission = this.getUserPermission('dtDiemDmTinhTrang');
        let list = this.props.dtDiemDmTinhTrang && this.props.dtDiemDmTinhTrang.items ? this.props.dtDiemDmTinhTrang.items : null;
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Chưa có dữ liệu!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>Mã</th>
                    <th style={{ width: '100%' }}>Tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={item.ma} />
                    <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={() => this.props.updateDtDmTinhTrangHocPhan(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Tình trạng điểm',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/grade-manage'>Cấu hình điểm</Link>,
                'Tình trạng điểm'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createDtDiemDmTinhTrang} update={this.props.updateDtDiemDmTinhTrang} />
            </>,
            backRoute: '/user/dao-tao/grade-manage',
            onCreate: e => permission.write ? e.preventDefault() || this.modal.show() : null,
        });
    }


}

const mapStateToProps = state => ({ system: state.system, dtDiemDmTinhTrang: state.daoTao.dtDiemDmTinhTrang });
const mapActionsToProps = { getAllDtDiemDmTinhTrang, createDtDiemDmTinhTrang, updateDtDiemDmTinhTrang };
export default connect(mapStateToProps, mapActionsToProps)(DiemDmTinhTrangPage);