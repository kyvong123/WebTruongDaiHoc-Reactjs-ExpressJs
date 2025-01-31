import React from 'react';
import { AdminModal, AdminPage, FormCheckbox, FormRichTextBox, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { fwNewsDmAuthorCreate, fwNewsDmAuthorDelete, fwNewsDmAuthorGetAll, fwNewsDmAuthorUpdate } from 'modules/mdTruyenThong/fwNewsAuthor/redux';
import { SelectAdapter_FwStudent } from 'modules/mdCongTacSinhVien/fwStudents/redux';

class AuthorModal extends AdminModal {

    onShow = (item) => {
        this.setState({ update: !!item }, () => {
            ['email', 'hoTen', 'butDanh', 'dienThoai', 'nganHang', 'soTaiKhoan', 'kichHoat', 'ghiChu'].forEach(key => item && this[key].value(item[key]));
        });
    };

    onSubmit = () => {
        let data = {};
        ['email', 'hoTen', 'butDanh', 'dienThoai', 'nganHang', 'soTaiKhoan', 'kichHoat', 'ghiChu'].forEach(key => {
            data[key] = this[key].value();
        });
        data.email = `${data.email}@hcmussh.edu.vn`;
        data.kichHoat = Number(data.kichHoat);
        const done = () => {
            this.hide();
            this.props.getData();
        };
        this.state.update ? this.props.update(data.email, data, done) : this.props.create(data, done);

    };
    render = () => this.renderModal({
        title: 'Tác giả truyền thông',
        size: 'large',
        body: <div className='row'>
            <FormSelect ref={e => this.email = e} className='col-md-12' label='Tác giả' data={SelectAdapter_FwStudent} onChange={item => {
                if (item) {
                    this.hoTen.value(item.hoTen);
                    this.dienThoai.value(item.dienThoai);
                    this.nganHang.value(item.tenNganHang);
                    this.soTaiKhoan.value(item.soTkNh);
                }
            }}/>
            <FormTextBox ref={e => this.hoTen = e} className='col-md-6' label='Họ tên'/>
            <FormTextBox ref={e => this.butDanh = e} className='col-md-6' label='Bút danh'/>
            <FormTextBox ref={e => this.dienThoai = e} className='col-md-4' label='Điện thoại'/>
            <FormTextBox ref={e => this.nganHang = e} className='col-md-4' label='Ngân hàng'/>
            <FormTextBox ref={e => this.soTaiKhoan = e} className='col-md-4' label='Số tài khoản'/>
            <FormCheckbox isSwitch ref={e => this.kichHoat = e} className='col-md-12' label='Kích hoạt'/>
            <FormRichTextBox ref={e => this.ghiChu = e} className='col-md-12' label='Ghi chú'/>
        </div>
    });
}

class AuthorPage extends AdminPage {
    state = { listAuthors: [] };

    componentDidMount() {
        T.ready('/user/truyen-thong', () => {
            this.getData();
        });
    }

    getData = () => {
        this.props.fwNewsDmAuthorGetAll(items => {
            this.setState({ listAuthors: items });
        });
    };

    render() {
        const { listAuthors } = this.state;
        const permission = this.getUserPermission('news-author', ['manage', 'write', 'delete']);
        return this.renderPage({
            icon: 'fa fa-pencil',
            title: 'Quản lý tác giả',
            content: <>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h5 className='tile-title'>Danh sách</h5>
                            {renderTable({
                                getDataSource: () => listAuthors,
                                renderHead: () => <tr>
                                    <th style={{ width: 'auto' }}>#</th>
                                    <th style={{ width: '20%' }}>Bút danh</th>
                                    <th style={{ width: '20%' }}>Họ tên</th>
                                    <th style={{ width: '20%' }}>Email</th>
                                    <th style={{ width: 'auto' }}>Điện thoại</th>
                                    <th style={{ width: '20%' }}>Ngân hàng</th>
                                    <th style={{ width: '20%' }}>Số tài khoản</th>
                                    <th style={{ width: 'auto' }}>Kích hoạt</th>
                                </tr>,
                                renderRow: (item, index) => <tr key={index}>
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1}/>
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.butDanh}/>
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen}/>
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.email}/>
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.dienThoai}/>
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.nganHang}/>
                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soTaiKhoan}/>
                                    <TableCell type='checkbox' permission={permission} content={item.kichHoat} onChanged={value => this.props.fwNewsDmAuthorUpdate(item.email, { kichHoat: Number(value) }, () => this.getData())}/>
                                </tr>
                            })}
                        </div>
                    </div>
                </div>
                <AuthorModal ref={e => this.modal = e} create={this.props.fwNewsDmAuthorCreate} update={this.props.fwNewsDmAuthorUpdate} getData={this.getData}/>
            </>,
            collapse: [
                { type: 'info', name: 'Tạo mới', icon: 'fa-plus', permission: permission.write, onClick: () => this.modal.show() }
            ],
            backRoute: '/user/truyen-thong'
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { fwNewsDmAuthorGetAll, fwNewsDmAuthorCreate, fwNewsDmAuthorUpdate, fwNewsDmAuthorDelete };
export default connect(mapStateToProps, mapActionsToProps)(AuthorPage);