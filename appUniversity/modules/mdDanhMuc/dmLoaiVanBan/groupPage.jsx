import React from 'react';
import { connect } from 'react-redux';
import { getAll, createNhom } from './redux/dmNhomLoaiVanBan';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';


class EditModal extends AdminModal {
    state = {}

    onShow = (item) => {
        let { ma, tenNhom, items } = item || {};
        items = T.parse(items, [], true);
        this.setState({ ma, tenNhom, items }, () => {
            this.ma.value(ma || '');
            this.tenNhom.value(tenNhom || '');
        });
    };

    onSubmit = (e) => {
        try {
            e.preventDefault();
            const data = {};
            ['ma', 'tenNhom'].forEach(key => {
                const target = this[key];
                if (!target) throw new Error('Invalid keyword');
                if (target.props.disabled) return;
                else {
                    data[key] = target.value();
                    if (!data[key]) {
                        if (target.props.required) {
                            throw target;
                        }
                    }
                }
            });
            this.setState({ isLoading: true }, () => {
                console.log('hehe');
                if (this.state.ma)
                    this.props.update(this.state.ma, data, this.hide, () => this.setState({ isLoading: false }));
                else
                    this.props.create(data, this.hide, () => this.setState({ isLoading: false }));
            });
        } catch (e) {
            if (e.props?.label)
                T.notify(e.props.label + ' trống', 'danger');
            else
                console.error(e);
        }
    };


    render = () => {
        return this.renderModal({
            title: this.state.ma ? 'Nhóm loại văn bản' : 'Tạo nhóm loại văn bản mới',
            size: 'large',
            isLoading: this.state.isLoading,
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.ma = e} label='Mã nhóm' readOnly={this.state.ma} required />
                <FormTextBox className='col-md-12' ref={e => this.tenNhom = e} label='Tên nhóm' readOnly={this.state.ma} required />
            </div>
        });
    }
}

class GroupLoai extends AdminPage {
    state = { filter: {} }
    componentDidMount() {
        T.ready('/user/hcth', () => {
            // T.onSearch = (searchText) => this.props.getHcthPhanCapQuySoPage(undefined, undefined, searchText || '');
            // T.showSearchBox();
            this.props.getAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa phân cấp quỹ số', 'Xác nhận xoá phân cấp quỹ số ?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteHcthPhanCapQuySo(item.maDonVi));
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmNhomLoaiVanBan', ['read', 'write', 'delete']);
        const items = this.props.dmNhomLoaiVanBan && this.props.dmNhomLoaiVanBan.items;

        let table = renderTable({
            getDataSource: () => items, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }} rowSpan={2}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }} rowSpan={2}>Mã nhóm</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }} >Tên nhóm</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }} rowSpan={2}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => {
                return <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell type='link' content={item.ma} onClick={() => this.props.history.push(`/user/category/loai-van-ban/nhom/${item.ma}`)} />
                    <TableCell type='text' content={item.tenNhom} />
                    <TableCell type='buttons'>
                        <Tooltip arrow title='Chỉnh sửa'>
                            <button className="btn btn-primary" onClick={(e) => e.preventDefault() || this.modal.show(item)}>
                                <i className='fa fa-pencil-square-o' />
                            </button>
                        </Tooltip>
                        <Tooltip arrow title='Cấu hình'>
                            <button className="btn btn-primary" onClick={(e) => e.preventDefault() || this.props.history.push(`/user/category/loai-van-ban/nhom/${item.ma}`)}>
                                <i className='fa fa-cog' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr>;
            }
        });

        return this.renderPage({
            icon: 'fa fa-cogs',
            title: 'Nhóm loại văn bản',
            // breadcrumb: [
            //     <Link key={0} to='/user/category/loai-van-ban'>Loại văn bản</Link>,
            //     'Nhóm loại văn bản'
            // ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={currentPermissions} create={this.props.createNhom} />
            </>,
            backRoute: '/user/category/loai-van-ban',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmNhomLoaiVanBan: state.danhMuc.dmNhomLoaiVanBan });
const mapActionsToProps = { getAll, createNhom };
export default connect(mapStateToProps, mapActionsToProps)(GroupLoai);
