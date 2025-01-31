import React from 'react';
import { createDtDiemMultiple } from './redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';

class DtThoiKhoaBieuImportPage extends AdminPage {
    state = { indexRow: null, dataDiem: [], message: '', displayState: 'import', isDisplay: true };

    componentDidMount() {
        T.ready('/user/dao-tao');
    }

    delete = (e, index) => {
        e.preventDefault();
        T.confirm('Xóa dữ liệu', 'Bạn có muốn xóa dữ liệu học phí này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                const dataDiem = this.state.dataDiem;
                dataDiem.splice(index, 1);
                this.setState({ dataDiem }, () => T.notify('Xóa dữ liệu thành công', 'success'));
            }
            if (this.state.dataDiem.length == 0) {
                this.setState({ displayState: 'import' });
            }
        });
    };

    onSuccess = (response) => {
        if (response.error) {
            T.notify(response.error, 'danger');
        } else if (response.items) {
            this.setState({
                dataDiem: response.items,
                message: `${response.items.length} hàng được tải lên thành công`,
                isDisplay: false,
                displayState: 'data'
            }, () => {
                const { message } = this.state;
                T.notify(message, 'success');
            });
        }
    };

    save = (e) => {
        const doSave = () => {
            const data = this.state.dataDiem;
            this.props.createDtDiemMultiple(data, (result) => {
                this.setState({ displayState: 'import', dataDiem: result.duplicateData });
                T.notify('Lưu thành công!', 'success');
            });
        };
        e.preventDefault();
        T.confirm('Cập nhật dữ liệu', 'Bạn có muốn thêm những dữ liệu này không?', 'warning', true, isConfirm => {
            isConfirm && doSave();
        });
    };


    saveRow = (e) => {
        e.preventDefault();
        this.setState({ indexRow: null });
    }
    render() {
        const { dataDiem, displayState } = this.state;
        let table = 'Không có dữ liệu!';
        if (dataDiem && dataDiem.length > 0) {
            table = renderTable({
                getDataSource: () => dataDiem, stickyHead: true,
                renderHead: () => <tr>
                    <th style={{ width: 'auto' }}>STT</th>
                    <th style={{ width: 'auto' }}>MSSV</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoá</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Mã học phần</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Tên môn học</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tín chỉ</th>
                    {/* <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại điểm</th> */}
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Điểm GK</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Điểm CK</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>% GK</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>% CK</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng kết</th>
                    {/* <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th> */}
                </tr>,
                renderRow: (item, index) => <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell content={item.mssv} />
                    <TableCell content={item.hoTen} />
                    <TableCell content={item.khoaSinhVien} />
                    <TableCell content={item.maHocPhan} />
                    <TableCell content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                    <TableCell content={item.tongTinChi} />
                    <TableCell style={{ textAlign: 'center' }} content={item.diemGk ? Number(item.diemGk).toFixed(2) : 0} />
                    <TableCell style={{ textAlign: 'center' }} content={item.diemCk ? Number(item.diemCk).toFixed(2) : 0} />
                    <TableCell style={{ textAlign: 'center' }} content={item.phanTramDiemGk} />
                    <TableCell style={{ textAlign: 'center' }} content={item.phanTramDiemCk || (100 - parseInt(item.phanTramDiemGk))} />
                    <TableCell style={{ textAlign: 'center' }} content={Number(item.diemTk).toFixed(2)} />


                </tr>
            });
        }
        return this.renderPage(
            {
                icon: 'fa fa-tags',
                title: 'Import data Điểm',
                breadcrumb: [<Link key={0} to='/user/dao-tao'>Đào tạo</Link>, <Link key={1} to='/user/dao-tao/diem'>Điểm</Link>, 'Import'],
                content:
                    <>
                        <div className='tile rows' style={{ textAlign: 'right', display: displayState == 'import' ? 'block' : 'none' }}>
                            <FileBox postUrl='/user/upload' uploadType='DtDiemData' userData='DtDiemData'
                                accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                                style={{ width: '90%', margin: '0 auto' }}
                                ajax={true} success={this.onSuccess} />
                        </div>
                        <div className='tile' style={{ display: displayState == 'import' ? 'none' : 'block' }}>
                            {table}
                        </div>
                    </>,
                onSave: displayState == 'data' ? (e) => this.save(e) : null,
            }
        );
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createDtDiemMultiple };
export default connect(mapStateToProps, mapActionsToProps)(DtThoiKhoaBieuImportPage);
