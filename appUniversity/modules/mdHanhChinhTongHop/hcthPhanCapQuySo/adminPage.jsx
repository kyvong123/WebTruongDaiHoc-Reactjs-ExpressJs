import React from 'react';
import { connect } from 'react-redux';
import { getHcthPhanCapQuySoPage, createHcthPhanCapQuySo, updateHcthPhanCapQuySo, deleteHcthPhanCapQuySo } from './redux/phanCapQuySo';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmNhomLoaiVanBan } from 'modules/mdDanhMuc/dmLoaiVanBan/redux/dmNhomLoaiVanBan';
import { SelectAdapter_HcthCapVanBan } from '../hcthVanBanDiStatusSystem/redux/hcthCapVanBan';
import { SelectAdapter_HcthQuySo } from './redux/quySo';


class EditModal extends AdminModal {
    state = {}

    onShow = (item) => {
        let { maDonVi, loaiVanBan, capVanBan = 1, nhom: nhomLoaiVanBan, quySo, } = item || {};
        this.setState({ maDonVi, loaiVanBan, capVanBan, nhomLoaiVanBan, quySo, phanLoai: !!loaiVanBan, isLoading: false }, () => {
            this.maDonVi.value(maDonVi || '');
            this.loaiVanBan.value(loaiVanBan || '');
            this.capVanBan.value(capVanBan || '');
            this.quySo.value(quySo || '');
            this.nhomLoaiVanBan?.value(nhomLoaiVanBan || '');
        });
    };

    onSubmit = (e) => {
        try {
            e.preventDefault();
            const data = {};
            ['maDonVi', 'loaiVanBan', 'capVanBan', 'quySo', 'nhomLoaiVanBan'].forEach(key => {
                const target = this[key];
                if (!target) {
                    if (key == 'nhomLoaiVanBan')
                        return;
                    throw new Error('Invalid keyword');
                }
                if (target.props.disabled) return;
                else {
                    data[key] = target.value();
                    if (!data[key]) {
                        if (target.props.required) {
                            throw target;
                        }
                    } else {
                        if (['loaiVanBan', 'maDonVi'].includes(key))
                            data[key] = Number(data[key]);
                    }
                }
            });
            this.setState({ isLoading: true }, () => {
                if (this.state.maDonVi)
                    this.props.update(this.state.maDonVi, data, this.hide, () => this.setState({ isLoading: false }));
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
            title: this.state.maDonVi ? 'Cấu hình quỹ số' : 'Tạo mới phân cấp quỹ số',
            size: 'large',
            isLoading: this.state.isLoading,
            body: <div className='row'>
                <FormSelect className='col-12' ref={e => this.maDonVi = e} label='Đơn vị' readOnly={true} data={SelectAdapter_DmDonVi} required />
                <FormSelect className='col-6' ref={e => this.capVanBan = e} label='Cấp văn bản' readOnly={true} data={SelectAdapter_HcthCapVanBan} required />
                <FormCheckbox isSwitch className='col-6' ref={e => this.loaiVanBan = e} label='Cấu hình theo nhóm loại văn bản' onChange={(value) => this.setState({ phanLoai: value })} />
                {
                    !!this.state.phanLoai && <FormSelect className='col-12' ref={e => this.nhomLoaiVanBan = e} label='Nhóm loại văn bản' data={SelectAdapter_DmNhomLoaiVanBan} required />
                }
                <FormSelect className='col-12' ref={e => this.quySo = e} label='Quỹ số' data={SelectAdapter_HcthQuySo} required />
            </div>
        });
    }
}

class HcthPhanCapQuySo extends AdminPage {
    state = { filter: {} }
    componentDidMount() {
        T.ready('/user/hcth', () => {
            T.onSearch = (searchText) => this.props.getHcthPhanCapQuySoPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.getPage(0, 50, '');
        });
    }

    getPage = (pageNumber, pageSize, pageCondition, done) => {
        this.props.getHcthPhanCapQuySoPage(pageNumber, pageSize, pageCondition, done);
    };

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
            permission = this.getUserPermission('hcthPhanCapQuySo', ['manage', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.hcthPhanCapQuySo && this.props.hcthPhanCapQuySo.page ?
            this.props.hcthPhanCapQuySo.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        let table = renderTable({
            getDataSource: () => list, stickyHead: false,
            // header: 'thead-light',
            headerStyle: {},
            renderHead: () => (
                <>
                    <tr>
                        <th style={{ width: 'auto', verticalAlign: 'middle', border: '#32383e' }} rowSpan={2}>#</th>
                        <th style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', border: '#32383e' }} rowSpan={2}>Tên đơn vị</th>
                        <th style={{ width: '60%', whiteSpace: 'nowrap', textAlign: 'center', border: '#32383e' }} colSpan={4}>Tiêu chí phân cấp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', border: '#32383e' }} rowSpan={2}>Thao tác</th>
                    </tr>
                    <tr>
                        <th style={{ width: '15%', whiteSpace: 'nowrap', border: '#32383e' }}>Cấp văn bản</th>
                        <th style={{ width: '15%', whiteSpace: 'nowrap', border: '#32383e' }}>Nhóm loại văn bản</th>
                        <th style={{ width: '15%', whiteSpace: 'nowrap', border: '#32383e' }}>Tên nhóm văn bản</th>
                        <th style={{ width: '15%', whiteSpace: 'nowrap', border: '#32383e' }}>Quỹ số</th>
                    </tr>
                </>
            ),
            renderRow: (item, index) => {
                return <tr key={index}>
                    <TableCell content={pageSize * (pageNumber - 1) + index + 1} />
                    <TableCell content={item.tenDonVi} onClick={() => this.modal.show(item)} />
                    <TableCell content={item.tenCapVanBan} />
                    <TableCell type='checkbox' content={item.loaiVanBan} permission={{ write: true }} onChanged={() => { }} />
                    <TableCell content={item.tenNhom} />
                    <TableCell content={item.quySo} />
                    <TableCell type='buttons' permission={permission} onEdit={() => this.modal.show(item)} ></TableCell>
                </tr>;
            }
        });

        return this.renderPage({
            icon: 'fa fa-clone',
            title: 'Cấu hình quỹ số',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                'Cấu hình quỹ số'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} permission={currentPermissions}
                    create={this.props.createHcthPhanCapQuySo} update={this.props.updateHcthPhanCapQuySo} />
            </>,
            backRoute: '/user/hcth',
            buttons: [
                { className: 'btn-secondary', icon: 'fa-cubes', tooltip: 'Cấu hình quỹ số', onClick: e => e.preventDefault() || this.props.history.push('/user/hcth/quy-so') },
                { className: 'btn-warning', icon: 'fa-file-code-o', tooltip: 'Định dạng số văn bản', onClick: e => e.preventDefault() || this.props.history.push('/user/hcth/format') }
            ],
            // onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthPhanCapQuySo: state.hcth.hcthPhanCapQuySo });
const mapActionsToProps = { getHcthPhanCapQuySoPage, createHcthPhanCapQuySo, updateHcthPhanCapQuySo, deleteHcthPhanCapQuySo };
export default connect(mapStateToProps, mapActionsToProps)(HcthPhanCapQuySo);