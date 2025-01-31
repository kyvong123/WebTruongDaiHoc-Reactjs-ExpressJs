import React from 'react';
import { connect } from 'react-redux';
import { getAllSdhTinhTrangHocPhan, getSdhTinhTrangHocPhan, updateSdhTinhTrangHocPhan, deleteSdhTinhTrangHocPhan, createSdhTinhTrangHocPhan } from './redux';
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
            title: this.state.ma ? 'Cập nhật tình trạng học phần' : 'Tạo mới tình trạng học phần',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã' readOnly={this.state.ma} required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên tình trạng học phần' readOnly={readOnly} required />
                <div style={{ position: 'absolute', top: '2px', right: '8px' }}>
                    <FormCheckbox style={{ width: '100%', margin: 0, }} ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly}
                        onChange={value => this.kichHoat.value(value ? 1 : 0)} />
                </div>
            </div>
        }
        );
    };
}

class SdhTinhTrangHocPhanPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.showSearchBox();
            this.props.getAllSdhTinhTrangHocPhan();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa tình trạng học phần', `Bạn có chắc bạn muốn xóa tình trạng ${item.ten ? `<b>${item.ten}</b>` : 'này'} ?`, true, isConfirm => {
            isConfirm && this.props.deleteSdhTinhTrangHocPhan(item.ma);
        });
    }

    render() {
        const permission = this.getUserPermission('sdhTinhTrangHocPhan');
        let list = this.props.sdhTinhTrangHocPhan && this.props.sdhTinhTrangHocPhan.items ? this.props.sdhTinhTrangHocPhan.items : [];
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Chưa có dữ liệu!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>Mã</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên tình trạng học phần</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={item.ma} />
                    <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={() => this.props.updateSdhTinhTrangHocPhan(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Tình trạng học phần',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/data-dictionary'>Từ điển dữ liệu</Link>,
                'Tình trạng học phần'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createSdhTinhTrangHocPhan} update={this.props.updateSdhTinhTrangHocPhan} />
            </>,
            backRoute: '/user/sau-dai-hoc/data-dictionary',
            onCreate: e => permission.write ? e.preventDefault() || this.modal.show() : null,
        });
    }


}

const mapStateToProps = state => ({ system: state.system, sdhTinhTrangHocPhan: state.sdh.sdhTinhTrangHocPhan });
const mapActionsToProps = { getAllSdhTinhTrangHocPhan, getSdhTinhTrangHocPhan, updateSdhTinhTrangHocPhan, deleteSdhTinhTrangHocPhan, createSdhTinhTrangHocPhan };
export default connect(mapStateToProps, mapActionsToProps)(SdhTinhTrangHocPhanPage);