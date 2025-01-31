import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createDtDiemAllMultiple } from './redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';

class DtDiemAllImportPage extends AdminPage {
    state = { indexRow: null, dataDiem: [], message: '', displayState: 'import', isDisplay: true, status };

    componentDidMount() {
        T.ready('/user/dao-tao');
        T.socket.on('dt-diem-import', ({ type, items, email }) => {
            this.props.system.user.email === email && this.setState({
                dataDiem: items,
                status: type == 'Import done!' ? '' : `Tải ${items.length} hàng thành công!`,
                isDisplay: false,
                displayState: 'data'
            });
        });
    }

    willUnmount() {
        T.socket.off('dt-diem-import');
    }

    delete = (e, index) => {
        e.preventDefault();
        T.confirm('Xóa dữ liệu', 'Bạn có muốn xóa dữ liệu này không?', 'warning', true, isConfirm => {
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
                message: `${response.items.length} hàng được Tải thành công`,
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
            this.props.createDtDiemAllMultiple(data, (result) => {
                this.setState({ displayState: result.duplicateData.length ? 'data' : 'import', dataDiem: result.duplicateData, status: result.duplicateData.length ? `Có ${result.duplicateData.length} dòng bị trùng.` : '' });
                T.notify('Lưu thành công!', 'success');
            });
        };
        e.preventDefault();
        T.confirm('Cập nhật dữ liệu', 'Bạn có muốn thêm/ghi đè những dữ liệu này không?', 'warning', true, isConfirm => {
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
                    <th style={{ width: 'auto' }}>Năm học</th>
                    <th style={{ width: 'auto' }}>Học kỳ</th>
                    <th style={{ width: 'auto' }}>MSSV</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Mã học phần</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Tên môn học</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại điểm</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>%</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Điểm</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Điểm đặc biệt</th>
                </tr>,
                renderRow: (item, index) => <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.namHoc} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.hocKy} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tenLoaiDiem} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.phanTramDiem} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.diem} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tenDiemDacBiet} />

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
                            <span className='text-primary'>{this.state.status}</span>
                            {table}
                        </div>
                    </>,
                onSave: displayState == 'data' ? (e) => this.save(e) : null,
            }
        );
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createDtDiemAllMultiple };
export default connect(mapStateToProps, mapActionsToProps)(DtDiemAllImportPage);
