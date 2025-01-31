import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { updateFormTypeConfig } from './redux';
import { getDmTinhTrangSinhVienAll } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';

export class CtsvFormConfigPage extends AdminPage {
    state = { isEdit: false }
    hienThiBieuMau = {}
    hienThiBieuMauInput = {}

    componentDidMount() {
        T.ready('/user/ctsv', () => {
            console.log('alkajsdf;lasdf');
            this.load();
        });
    }

    load = () => {
        this.props.getDmTinhTrangSinhVienAll({}, items => {
            items?.forEach(item => this.hienThiBieuMau[item.ma] = item.hienThiBieuMau);
        });
    }

    setUpTinhTrang = () => {
        Object.entries(this.hienThiBieuMau).forEach(([ma, text]) => this.hienThiBieuMauInput[ma].value(text));
    }

    saveTinhTrang = () => {
        const listTinhTrang = Object.entries(this.hienThiBieuMauInput).map(([ma, input]) => ({ ma, hienThiBieuMau: input.value() }));
        this.props.updateFormTypeConfig({ listTinhTrang }, () => {
            this.setState({ isEdit: false });
            this.load();
        });
    }

    render() {
        const { items } = this.props.dmTinhTrangSinhVien || {};
        const { isEdit } = this.state;
        return this.renderPage({
            title: 'Cấu hình biến', icon: 'fa fa-cogs',
            backRoute: '/user/ctsv/category-forms',
            breadcrumb: [
                <Link key={0} to={'/user/ctsv'}>Công tác sinh viên</Link>,
                <Link key={1} to={'/user/ctsv/category-forms'}>Loại biểu mẫu</Link>,
                'Cấu hình biểu mẫu',
            ],
            content:
                <div className='row'><div className='col-md-6'>
                    <div className='tile'>
                        <div className='d-flex justify-content-between align-items-baseline'>
                            <h5 className='tile-title'>Cấu hình biến tình trạng sinh viên</h5>
                            {isEdit ?
                                <button className='btn btn-success' type='button' onClick={() => this.saveTinhTrang()}><i className='fa fa-save' />Lưu</button>
                                :
                                <button className='btn btn-primary' type='button' onClick={() => this.setState({ isEdit: true }, this.setUpTinhTrang)}><i className='fa fa-pencil' />Chỉnh sửa</button>}
                        </div>
                        <div className='tile-body'>
                            {renderTable({
                                getDataSource: () => items,
                                renderHead: () => <tr>
                                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Tình trạng</th>
                                    <th style={{ width: '80%%', }}>Hiển thị biểu mẫu</th>
                                </tr>,
                                renderRow: (item, index) => <tr key={index}>
                                    <TableCell content={item.ten} />
                                    {isEdit ?
                                        <TableCell content={<FormTextBox ref={e => this.hienThiBieuMauInput[item.ma] = e} />} /> :
                                        <TableCell content={this.hienThiBieuMau[item.ma]} />}
                                </tr>
                            })}
                        </div>
                    </div>
                </div></div>
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, dmTinhTrangSinhVien: state.danhMuc.dmTinhTrangSinhVien });

const mapDispatchToProps = { getDmTinhTrangSinhVienAll, updateFormTypeConfig };

export default connect(mapStateToProps, mapDispatchToProps)(CtsvFormConfigPage);