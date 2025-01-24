import React from 'react';
import { connect } from 'react-redux';
import T from 'view/js/common.js';
import { getSdhTsHsdkAll, createSdhTsHsdk, updateSdhTsHsdk, deleteSdhTsHsdk, } from './redux';
import { SelectAdapter_DmHocSdhVer2 } from 'modules/mdSauDaiHoc/dmHocSdh/redux';
import { Link } from 'react-router-dom';
import { TableCell, FormFileBox, renderTable, FormSelect, AdminPage, AdminModal, FormTextBox, FormRichTextBox, getValue } from 'view/component/AdminPage';
class EditModal extends AdminModal {

    componentDidMount() {
        this.onShown(() => {
            this.nameDisplay.focus();
        });
    }


    onShow = (item) => {
        console.log(item);
        let { id, nameDisplay, note, active, category } = item ?
            item : { id: null, nameDisplay: '', note: '', active: 1, category: '' };
        this.setState({ id, active });
        this.nameDisplay.value(nameDisplay);
        this.note.value(note);
        this.category.value(category);
        this.fileBox.fileBox.setData('sdhTsHsdkFile:' + (id ? id : 'new'));

    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            nameDisplay: getValue(this.nameDisplay) || '',
            note: getValue(this.note) || '',
            category: getValue(this.category),
        };
        if (this.state.id) {
            if (this.fileBox.fileBox.getFile())
                this.fileBox.fileBox.onUploadFile({ ...changes, active: this.state.active });
            else
                this.props.updateStorage(this.state.id, changes);
        }
        else {
            this.fileBox.fileBox.onUploadFile({ active: 1, ...changes });
        }
        this.hide();
    };

    render = () => {
        return this.renderModal({
            title: this.state.id ? 'Cập nhật bộ hồ sơ' : 'Tạo mới bộ hồ sơ',
            size: 'large',
            body:
                <div className='row'>
                    <FormTextBox className='col-12' ref={e => this.nameDisplay = e} label='Tên hiển thị' required />
                    <FormRichTextBox className='col-12' ref={e => this.note = e} label='Ghi chú' rows='5' />
                    <FormFileBox className='col-12' ref={e => this.fileBox = e} label='Tệp tin tải lên ( .xls, .xlsx, .doc, .docx, .pdf, .png, .jpg, .jpeg, .zip, .rar )' postUrl='/user/upload' uploadType='sdhTsHsdkFile' onSuccess={this.props.onSuccess} required pending userData='sdhTsHsdkFile' />
                    <FormSelect className='col-12' ref={e => this.category = e} label='Phân loại' data={SelectAdapter_DmHocSdhVer2} />
                </div>
        }
        );
    };
}

class StoragePage extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc');
        this.props.getSdhTsHsdkAll();
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    onSuccess = ({ error, item }) => {
        if (item) T.alert('Tải lên tệp tin thành công');
        else if (error) T.alert(error, 'error', false, 2000);
        this.props.getSdhTsHsdkAll();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa tài liệu', 'Bạn có chắc bạn muốn xóa tài liệu này?', true, isConfirm =>
            isConfirm && this.props.deleteSdhTsHsdk(item.id, item.path));
    }
    render() {
        const items = this.props.sdhTsHsdk && this.props.sdhTsHsdk.items ?
            this.props.sdhTsHsdk.items : { items: [] };
        const permissions = this.getUserPermission('sdhTsHsdk', ['read', 'write', 'delete', 'export']);

        const table = renderTable({
            getDataSource: () => items, stickyHead: false,
            emptyTable: 'Chưa có tài liệu nào!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Tên hiển thị</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'left' }}>Người tạo</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap' }}>Tên tệp</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Phân loại</th>
                    <th style={{ width: '5%', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: '25%', whiteSpace: 'nowrap', textAlign: 'left' }}>Ghi chú</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.nameDisplay} />
                    <TableCell content={item.userUpload} />
                    <TableCell content={item.path} />
                    <TableCell content={item.category && item.category.text ? item.category.text : ''} />
                    <TableCell type='checkbox' content={item.active} permission={permissions} onChanged={value => this.props.updateSdhTsHsdk(item.id, { active: Number(value) })} />
                    <TableCell content={item.note} />
                    <TableCell type='buttons' onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} permission={permissions}>
                        {permissions.export ? <a className='btn btn-info' href={`/api/sdh/ts/hsdk/download/${item.path}`} download title='Tải xuống'>
                            <i className='fa fa-lg fa-download' />
                        </a> : null}
                    </TableCell>

                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Mẫu hồ sơ đăng ký',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                'Mẫu hồ sơ đăng ký'
            ],
            content:
                <>
                    <div className='tile'>{table}</div>
                    <EditModal ref={e => this.modal = e} readOnly={!permissions.write} updateStorage={this.props.updateSdhTsHsdk} onSuccess={this.onSuccess} />
                </>
            ,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh',
            onCreate: permissions && permissions.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhTsHsdk: state.sdh.sdhTsHsdk });
const mapActionsToProps = { getSdhTsHsdkAll, createSdhTsHsdk, updateSdhTsHsdk, deleteSdhTsHsdk };
export default connect(mapStateToProps, mapActionsToProps)(StoragePage);
