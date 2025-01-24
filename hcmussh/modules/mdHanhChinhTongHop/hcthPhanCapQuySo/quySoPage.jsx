import React from 'react';
import { connect } from 'react-redux';
import { getAllQuySo, createQuySo, applyQuySo } from './redux/quySo';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';

class EditModal extends AdminModal {
    state = {}

    onShow = () => {
        this.setState({ isLoading: false }, () => {
            this.ma.value('');
            this.namHanhChinh.value('');
        });
    };

    onSubmit = (e) => {
        try {
            e.preventDefault();
            const data = {};
            ['ma', 'namHanhChinh'].forEach(key => {
                const target = this[key];
                if (!target) throw new Error('Invalid keyword');
                if (target.props.disabled) return;
                else {
                    data[key] = target.value();
                    if (!data[key]) {
                        if (target.props.required) {
                            throw target;
                        }
                    } else {
                        if (['namHanhChinh'].includes(key))
                            data[key] = Number(data[key]);
                    }
                }
            });
            this.setState({ isLoading: true }, () => {
                T.confirm('Cảnh báo', `Bạn sẽ tạo quỹ số mới với mã ${data.ma} sử dụng cho năm ${data.namHanhChinh}. Thông tin này không thể được sửa hoặc xóa sau khi tạo`, 'warning', true, isConfirm => {
                    isConfirm && this.props.create(data, this.hide, () => this.setState({ isLoading: false }));
                });
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
            title: 'Tạo mới quỹ số',
            size: 'large',
            isLoading: this.state.isLoading,
            body: <div className='row'>
                <FormTextBox className='col-md-12' label='Mã quý số' ref={e => this.ma = e} />
                <FormTextBox className='col-md-12' label='Năm hành chính' ref={e => this.namHanhChinh = e} type='number' />
            </div>
        });
    }
}

class HcthQuySo extends AdminPage {
    state = { filter: {} }
    componentDidMount() {
        T.ready('/user/hcth', () => {
            // T.onSearch = (searchText) => this.props.getHcthPhanCapQuySoPage(undefined, undefined, searchText || '');
            // T.showSearchBox();
            this.getData();
        });
    }

    getData = () => {
        this.props.getAll();
    };

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };


    applyQuySo = (item) => {
        T.confirm('Áp dụng quỹ số', 'Lưu ý: thao tác áp dụng quỹ số sẽ có tác dụng lên tất cả đơn vị hiện tại, chức năng này chỉ nên dùng khi bắt đầu năm hành chính mới', 'warning', true, isConfirm =>
            isConfirm && this.props.apply(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('hcthPhanCapQuySo', ['manage', 'write', 'delete']);
        const items = this.props.hcthQuySo?.items;

        let table = renderTable({
            getDataSource: () => items, stickyHead: false,
            // header: 'thead-light',
            loadingClassName: 'd-flex justify-content-center align-items-center',
            loadingOverlay: false,
            headerStyle: {},
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', }} >#</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap', }}>Mã</th>
                    <th style={{ width: '60%', whiteSpace: 'nowrap', }} >Năm hành chính</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', }} >Mặc định</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', }} >Thao tác</th>
                </tr>

            ),
            renderRow: (item, index) => {
                return <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.ma} />
                    <TableCell content={item.namHanhChinh} />
                    <TableCell content={item.macDinh} type='checkbox' />
                    <TableCell type='buttons' >
                        <Tooltip arrow title='Áp dụng quỹ số'>
                            <button className="btn btn-success" onClick={(e) => e.preventDefault() || this.applyQuySo(item)}>
                                <i className='fa fa-lg fa-check' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr>;
            }
        });

        return this.renderPage({
            icon: 'fa fa-clone',
            title: 'Cấu hình quỹ số',
            breadcrumb: [
                <Link key={0} to='/user/hcth/cau-hinh-quy-so'>Cấu hình quỹ số</Link>,
                'Quản lý quỹ số'
            ],
            content: <>
                <div className='tile'>
                    <div className="tile-body row">
                        <div className="col-12">
                            {table}
                        </div>
                    </div>
                </div>
                <EditModal ref={e => this.modal = e} permission={currentPermissions}
                    create={this.props.create} />
            </>,
            backRoute: '/user/hcth/cau-hinh-quy-so',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthQuySo: state.hcth.hcthQuySo });
const mapActionsToProps = { getAll: getAllQuySo, create: createQuySo, apply: applyQuySo };
export default connect(mapStateToProps, mapActionsToProps)(HcthQuySo);