import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormTabs, FormFileBox, renderTable, TableCell } from 'view/component/AdminPage';
// import {  } from './redux';
// import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';

// const STATUS_MAPPER = {
//     1: 'Còn học',
//     2: 'Nghỉ học tạm thời',
//     3: 'Buộc thôi học',
//     4: 'Thôi học',
//     6: 'Tốt nghiệp',
//     7: 'Chuyển trường',
//     9: 'Kỷ luật',
// };

class ImportSinhVienModal extends AdminModal {
    state = { items: null, failed: null }

    componentDidMount() {
        this.disabledClickOutside();
    }

    // Handle Event ===============================================================================================
    onShow = () => {
        const { maLop = '', maLopCha = '' } = this.props.ctsvLop?.currentDataLop || {};
        this.setState({ maLop, maLopCha, items: null, failed: null }, () => this.tabs.tabClick(null, 0));
    }

    onImportSuccess = (res) => {
        if (res.error) {
            T.notify('Tải lên danh sách bị lỗi!', 'danger');
        } else {
            const { items, failed } = res;
            this.setState({ items, failed }, () => {
                this.tabs.tabClick(null, 1);
                failed.length ? T.notify('Một vài dữ liệu bị lỗi!', 'warning') : T.notify('Tải lên danh sách thành công!', 'success');
            });
        }
    }

    onSubmit = () => {
        T.confirm('Xác nhận thêm sinh viên', `Bạn có chắc muốn thêm những sinh viên này vào lớp ${this.state.maLop}?`, isConfirm => {
            if (isConfirm) {
                this.props.update(this.state.items);
                this.hide();
            }
        });
    }

    // Tab Component ==============================================================================================

    componentUpload = () => <div className='row'>
        <div className="col-md-12"><p className='pt-3'>Thêm sinh viên vào lớp bằng tệp Excel(.xlsx). Tải tệp tin mẫu tại <a href='' onClick={e => e.preventDefault() || T.download('/api/ctsv/lop-sinh-vien/template')}>đây</a></p></div>
        <FormFileBox className='col-md-12' ref={e => this.file = e} uploadType='ctsvDtLopImportSinhVien' onSuccess={this.onImportSuccess} postUrl={`/user/upload?maLop=${this.state.maLop}&maLopCha=${this.state.maLopCha || ''}`} />
    </div>

    componentPreview = () => renderTable({
        getDataSource: () => this.state.items || [],
        renderHead: () => <tr>
            <th style={{ whiteSpace: 'nowrap' }}>#</th>
            <th style={{ whiteSpace: 'nowrap' }}>MSSV</th>
            <th style={{ whiteSpace: 'nowrap' }}>Họ</th>
            <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Tên</th>
            <th style={{ whiteSpace: 'nowrap' }}>Tình trạng</th>
        </tr>,
        renderRow: (item, index) => (<tr key={index}>
            <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv || ''} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho || ''} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten || ''} />
            {/* <TableCell style={{ whiteSpace: 'nowrap' }} content={STATUS_MAPPER[item.tinhTrang] || ''} /> */}
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenTinhTrang || ''} />
        </tr>)
    })

    componentError = () => this.state.failed?.map((item, index) => (
        <div key={index} className='row'>
            <p className={`col-md-2 text-${item.color}`}>{`Hàng ${item.rowNumber}`}:</p>
            <p className={`col-md-10 text-${item.color}`}>{item.message}</p>
        </div>
    ))

    render = () => {
        return this.renderModal({
            title: 'Tải lên danh sách sinh viên',
            body: (
                <FormTabs ref={e => this.tabs = e}
                    tabs={[
                        { title: 'Tải lên danh sách lớp', component: this.componentUpload() },
                        { title: 'Xem trước kết quả', component: this.componentPreview(), disabled: !this.state.items },
                        { title: <>Thông báo {this.state.failed && <span className="badge badge-danger">{this.state.failed.length}</span>}</>, component: this.componentError(), disabled: !this.state.failed },
                    ]}
                />),
            isShowSubmit: this.state.items && this.state.items.length,
            submitText: 'Thêm vào'
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, ctsvLop: state.ctsv.ctsvLop });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ImportSinhVienModal);