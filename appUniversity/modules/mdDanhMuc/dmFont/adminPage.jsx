import React from 'react';
import { connect } from 'react-redux';
import { createDmFont, getDmFontPage, updateDmFont, deleteDmFont } from './redux';
import { getDmLoaiDonViAll } from 'modules/mdDanhMuc/dmLoaiDonVi/redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';

export class EditModal extends AdminModal {
    state = { active: true };


    onShow = (item) => {
        const { id, ten, kichHoat } = item ? item : { id: null, ten: '', kichHoat: true };
        this.setState({ id, item }, () => {
            this.fileBox.setData('dmFontFile', this.state.id ? false : true);
            this.ten.value(ten);
            this.kichHoat.value(kichHoat);
        });
    }

    onSubmit = (e) => {
        if (this.ten.value() == '') {
            T.notify('Tên font chữ trống!', 'danger');
            this.ten.focus();
        } else {
            if (this.state.id && !this.fileBox.getFile()) {
                const changes = {
                    ten: this.ten.value(),
                    kichHoat: this.kichHoat.value() ? 1 : 0,
                };
                this.props.update(this.state.id, changes, this.hide);
            }
            else {
                this.fileBox.onUploadFile({ id: this.state.id });
            }
        }
        e.preventDefault();
    }

    changeKichHoat = value => this.kichHoat.value(value);

    onSuccess = (data) => {
        try {
            if (data.error) {
                return T.notify(data.error, 'danger');
            }
            const changes = {
                ten: this.ten.value(),
                tenFile: data.originalFilename,
                kichHoat: this.kichHoat.value() ? 1 : 0,
                filePath: data.path
            };
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
        catch (error) {
            console.error(error);
            T.notify(error.message, 'danger');
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật font chữ' : 'Thêm font chữ',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên font'
                    readOnly={readOnly} required />
                <FormCheckbox className='col-md-12 mb-2' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                <FileBox ref={e => this.fileBox = e} className='col-md-12' label='Tải lên tập tin font chữ' postUrl='/user/upload' uploadType='dmFontFile' userData='dmFontFile' pending={true} success={this.onSuccess} />
            </div>
        });
    }
}

class DmFontPage extends AdminPage {
    state = { searching: false, loaiDonVi: [] };

    componentDidMount() {
        T.ready('/user/category', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.props.getDmFontPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmFontPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmFont(item.id, { kichHoat: item.kichHoat ? 0 : 1 });


    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục font', 'Bạn có chắc bạn muốn xóa font này không?', true, isConfirm =>
            isConfirm && this.props.deleteDmFont(item.id));
    }

    render() {
        const permission = this.getUserPermission('manager', ['write']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmFont && this.props.dmFont.page ?
            this.props.dmFont.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có danh sách font!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list.reverse(),
                stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '80%', textAlign: 'left', whiteSpace: 'nowrap' }}>Tên</th>
                        <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên file</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                        {
                            permission.write &&
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        }

                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={item.ten} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.tenFile} />
                        <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission}
                            onChanged={() => this.changeActive(item)} />
                        {
                            permission.write &&
                            <TableCell type='buttons' style={{ textAlign: 'center' }} content={item}
                                onEdit={() => this.modal.show(item)}
                                onDelete={e => this.delete(e, item)}
                                permission={{ ...permission, delete: permission.write }}
                            />
                        }

                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục font chữ',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục font chữ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmDonViGuiCongVanPage} />
                <EditModal ref={e => this.modal = e}
                    create={this.props.createDmFont}
                    update={this.props.updateDmFont}
                />
            </>,
            backRoute: '/user/category',
            onCreate: (e) => this.showModal(e)
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmFont: state.danhMuc.dmFont });
const mapActionsToProps = { getDmFontPage, createDmFont, updateDmFont, deleteDmFont, getDmLoaiDonViAll };
export default connect(mapStateToProps, mapActionsToProps)(DmFontPage);