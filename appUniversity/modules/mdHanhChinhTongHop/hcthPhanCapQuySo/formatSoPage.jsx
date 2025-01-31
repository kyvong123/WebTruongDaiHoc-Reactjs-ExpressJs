import { SelectAdapter_DmMaLoaiVanBan } from 'modules/mdDanhMuc/dmLoaiVanBan/redux/dmLoaiVanBan';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormSelect, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';
import { SelectAdapter_DmDonVi } from '../../mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_HcthCapVanBan } from '../hcthVanBanDiStatusSystem/redux/hcthCapVanBan';
import { createFormatSoVanBan, getAllFormatSoVanBan } from './redux/formatSoVanBan';
class EditModal extends AdminModal {
    state = {}

    onShow = (item = {}) => {
        this.setState({ id: null, ...item, isLoading: false }, () => {
            this.maDonVi.value(item.maDonVi || '');
            this.maLoaiVanBan.value(item.maLoaiVanBan || '');
            this.capVanBan.value(item.capVanBan || '');
            this.formatSoVanBan.value(item.formatSoVanBan || '');
        });
    };

    onSubmit = (e) => {
        try {
            e.preventDefault();
            const data = {};
            ['maDonVi', 'maLoaiVanBan', 'capVanBan', 'formatSoVanBan'].forEach(key => {
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
                if (this.state.id)
                    this.props.update(this.state.id, data, this.hide, () => this.setState({ isLoading: false }));
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
            title: 'Tạo mới quỹ số',
            size: 'large',
            isLoading: this.state.isLoading,
            body: <div className='row'>
                <div className="col-md-12 d-flex justify-content-end align-items-center">
                    <i className='fa fa-question-circle-o text-primary' onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.setState({ guideShown: !this.state.guideShown });
                    }} />
                </div>
                {!!this.state.guideShown && <div className="col-md-12 text-danger mb-2">
                    * Lưu ý: các tham số được sử dụng để xây dựng đuôi số văn bản bao gồm
                    <div class="list-group text-dark">
                        <a href="#" class="list-group-item list-group-item-action">{'Năm : {namHanhChinh}'}</a>
                        <a href="#" class="list-group-item list-group-item-action">{'Tên viết tắt loại văn bản : {loaiVanBan}'}</a>
                        <a href="#" class="list-group-item list-group-item-action">{'Tên viết tắt đơn vị : {donVi}'}</a>
                        <a href="#" class="list-group-item list-group-item-action">{'Tên viết trường : {XHNV}'}</a>
                    </div>
                </div>}
                <FormSelect className='col-md-12' label='Đơn vị' ref={e => this.maDonVi = e} readOnly={!!this.state.id} data={SelectAdapter_DmDonVi} />
                <FormSelect className='col-md-6' label='Cấp văn bản' ref={e => this.capVanBan = e} data={SelectAdapter_HcthCapVanBan} />
                <FormSelect className='col-md-6' label='Loại văn bản' ref={e => this.maLoaiVanBan = e} data={SelectAdapter_DmMaLoaiVanBan} />
                <FormTextBox className='col-md-12' label='Định dạng' ref={e => this.formatSoVanBan = e} />
            </div>
        });
    }
}

class HcthFormatSoVanBan extends AdminPage {
    state = { filter: {} }
    componentDidMount() {
        T.ready('/user/hcth', () => {
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

    render() {
        const currentPermissions = this.getCurrentPermissions(),
            permission = this.getUserPermission('hcthPhanCapQuySo', ['manage', 'write', 'delete']);
        const items = this.props.hcthFormatSoVanBan?.items;

        let table = renderTable({
            getDataSource: () => items, stickyHead: false,
            // header: 'thead-light',
            loadingClassName: 'd-flex justify-content-center align-items-center',
            loadingOverlay: false,
            headerStyle: {},
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', }} >#</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap', }}>Đơn vị</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', }} >Cấp văn bản</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap', }} >Loại văn bản</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap', }} >Định dạng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', }} >Thao tác</th>
                </tr>

            ),
            renderRow: (item, index) => {
                return <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.tenDonVi} />
                    <TableCell content={item.tenCapVanBan} />
                    <TableCell content={item.tenLoaiVanBan} />
                    <TableCell contentStyle={{ whiteSpace: 'no-wrap' }} content={item.formatSoVanBan} />
                    <TableCell type='buttons' permission={{ write: true }} onEdit={() => this.modal.show(item)}>
                    </TableCell>
                </tr>;
            }
        });

        return this.renderPage({
            icon: 'fa fa-file-code-o',
            title: 'Định dạng số văn bản',
            breadcrumb: [
                <Link key={0} to='/user/hcth/cau-hinh-quy-so'>Cấu hình quỹ số</Link>,
                'Định dạng số văn bản'
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

const mapStateToProps = state => ({ system: state.system, hcthFormatSoVanBan: state.hcth.hcthFormatSoVanBan });
const mapActionsToProps = { getAll: getAllFormatSoVanBan, create: createFormatSoVanBan };
export default connect(mapStateToProps, mapActionsToProps)(HcthFormatSoVanBan);