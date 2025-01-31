import xlsx from 'xlsx';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import FileBox from 'view/component/FileBox';
import { FormCheckbox, renderDataTable, TableCell, FormTabs, AdminPage } from 'view/component/AdminPage';
import { createListDmMonHoc } from './redux';
class SectionImportMonHoc extends AdminPage {
    state = { monHoc: [], monHocLoi: [], message: '', displayState: 'import', canSave: false };

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.tab.tabClick(null, 0);
        });
    }

    onSuccess = (response) => {
        if (response.error) {
            T.notify(response.error, 'danger');
        } else {
            this.setState({
                monHoc: response.successItems,
                monHocLoi: response.falseItem,
                displayState: 'importing',
                message: `${response.successItems.length} hàng dự kiến import thành công`,
            }, () => this.notify());
        }
    };

    notify = () => {
        const { message, monHoc, monHocLoi } = this.state;
        monHocLoi.length && T.notify(`${monHocLoi.length} hàng import thất bại`, 'danger');
        monHoc.length && T.notify(message, 'success');
        this.setState({ canSave: !!monHoc.length, displayState: 'data' });
    }

    reLoadPage = () => {
        this.props.reload();
    }

    downloadExcel = () => {
        T.handleDownload('/api/dt/mon-hoc-template/download', 'Mon_hoc_Template.xlsx');
    }

    downloadErrorExcel = () => {
        xlsx.writeFile(xlsx.utils.table_to_book(document.querySelector('.table.errorTable')), 'Danh sách môn học lỗi.xlsx');
    }

    dangKy = e => {
        e && e.preventDefault();
        let list = this.state.monHoc;
        list = list.filter(item => item.isCheck == true);
        if (list.length == 0) {
            T.notify('Không tìm thấy môn học có thể tạo!', 'danger');
        } else {
            this.props.createListDmMonHoc(list, () => {
                this.setState({ canSave: false });
            });
        }
    }

    changeCheckAll = (value) => {
        let items = this.state.monHoc;
        items.map(item => item.isCheck = value);
        this.setState({ monHoc: items });
    }

    renderKetQuaImport = (list) => renderDataTable({
        data: list,
        emptyTable: 'Không có dữ liệu!',
        header: 'thead-light',
        stickyHead: true,
        divStyle: { height: '60vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <FormCheckbox ref={e => this.checkAll = e} onChange={value => this.changeCheckAll(value)} readOnly={this.state.displayState == 'importing'} />
                </th>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center' }}>Row</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã môn học</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tên môn tiếng Việt</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tên môn tiếng Anh</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Khoa/Bộ môn</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TC lý thuyết</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TC thực hành</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Môn thể chất</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Thành phần điểm</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ghi chú</th>
            </tr>),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={item.isCheck} permission={{ write: this.state.displayState != 'importing' }}
                    onChanged={() => {
                        list[index].isCheck = !list[index].isCheck;
                        this.setState({ monHoc: list }, () => {
                            let monHoc = this.state.monHoc;
                            this.setState({ monHoc });
                        });
                    }}
                />
                <TableCell content={index + 1} />
                <TableCell content={item.stt} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.maMonHoc} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenMonTiengViet} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenMonTiengAnh} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tinChiLyThuyet} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tinChiThucHanh} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.isTheChat} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.thanhPhanDiem} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />

            </tr>)
    });

    renderKetQuaImportFalse = (list) => renderDataTable({
        data: list,
        emptyTable: 'Không có dữ liệu!',
        header: 'thead-light',
        stickyHead: true,
        className: 'errorTable',
        divStyle: { height: '60vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center' }}>Row</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã môn học</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tên môn tiếng Việt</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tên môn tiếng Anh</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Khoa/Bộ môn</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TC lý thuyết</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TC thực hành</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Môn thể chất</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Thành phần điểm</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Ghi chú</th>
            </tr>),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell content={index + 1} />
                <TableCell content={item.stt} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.maMonHoc} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenMonTiengViet} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenMonTiengAnh} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tenKhoa} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tinChiLyThuyet} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tinChiThucHanh} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.isTheChat} />
                <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.thanhPhanDiem} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
            </tr>)
    });

    render() {
        let { monHoc, displayState, monHocLoi, canSave } = this.state;
        return this.renderPage({
            icon: 'fa fa-upload',
            title: 'Import Môn Học',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/mon-hoc'>Danh sách Môn Học</Link>,
                'Import Môn Học'
            ],
            content: <div>
                <div className='tile'>
                    <div className='tile-body'>
                        <div className='rows' style={{ textAlign: 'right', display: displayState.startsWith('import') ? 'none' : '' }}>
                            <button className='btn btn-primary mr-2' onClick={() => this.setState({ displayState: 'import', canSave: false })} >
                                <i className='fa fa-refresh' /> ReLoad
                            </button>
                            <button className='btn btn-warning mr-2' onClick={(e) => e.preventDefault() || this.downloadErrorExcel()} style={{ display: monHocLoi.length ? '' : 'none' }}>
                                <i className='fa fa-fw fa-lg fa-arrow-circle-down' /> Tải file lỗi
                            </button>
                            <button className='btn btn-success mr-2' onClick={(e) => e.preventDefault() || this.dangKy()} style={{ display: (canSave == true) ? '' : 'none' }}>
                                <i className='fa fa-fw fa-lg fa-handshake-o' /> Lưu đăng ký
                            </button>
                        </div>

                        <div className='rows' style={{ textAlign: 'right', display: displayState == 'import' ? 'block' : 'none', }}>
                            <button className='btn btn-warning mb-2' type='button' onClick={(e) => e.preventDefault() || this.downloadExcel()}>
                                <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file mẫu tại đây
                            </button>
                            <FileBox postUrl={'/user/upload'} uploadType='DmMonHocData' userData={'DmMonHocData'}
                                accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                                style={{ width: '80%', margin: '0 auto' }}
                                ajax={true} success={this.onSuccess} />
                        </div>

                        <div className='rows' style={{ display: displayState != 'import' ? '' : 'none' }}>
                            <FormTabs contentClassName='tile' ref={e => this.tab = e}
                                tabs={[
                                    {
                                        title: 'Danh sách môn import thành công ' + (monHoc.length ? `(${monHoc.length})` : ''),
                                        component: <>
                                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Số dòng được chọn lưu {monHoc.filter(item => item.isCheck == true).length}/{monHoc.length}</div>
                                            {this.renderKetQuaImport(monHoc || [])}
                                        </>
                                    },
                                    {
                                        title: 'Danh sách môn import thất bại ' + (monHocLoi.length ? `(${monHocLoi.length})` : ''),
                                        component: <>
                                            {this.renderKetQuaImportFalse(monHocLoi || [])}
                                        </>
                                    },
                                ]}
                            />

                        </div>
                    </div>
                </div>
            </div>,
            backRoute: '/user/dao-tao/mon-hoc',
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    createListDmMonHoc
};
export default connect(mapStateToProps, mapActionsToProps)(SectionImportMonHoc); 