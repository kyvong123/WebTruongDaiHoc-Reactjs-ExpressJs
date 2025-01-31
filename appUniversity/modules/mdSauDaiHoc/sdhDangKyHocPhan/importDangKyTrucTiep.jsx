import React from 'react';
import { connect } from 'react-redux';
import FileBox from 'view/component/FileBox';
import { createSdhDangKyHocPhanAdvance } from 'modules/mdSauDaiHoc/sdhDangKyHocPhan/redux';
import { FormCheckbox, renderDataTable, TableCell, FormTabs } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import xlsx from 'xlsx';
class ImportDangKyTrucTiepSdh extends React.Component {
    state = { dangKyAll: [], dangKyFalse: [], message: '', displayState: 'import', filterhp: {}, canSave: false };

    componentDidMount() {
        this.tab.tabClick(null, 0);
    }

    getSemester = () => {
        let { namHoc, hocKy } = this.props.currentSemester;
        this.setState({ namHoc, hocKy, filterhp: { ...this.state.filterhp, namHoc, hocKy } });
    }

    setValue = (response, done) => {
        this.setState({
            dangKyAll: response.items,
            dangKyFalse: response.falseItem,
            displayState: 'importing',
            message: `${response.items.length} hàng dự kiến đăng ký thành công`,
        }, () => done && this.notify());
    }

    onSuccess = (response) => {
        if (!this.props.tenDot) {
            T.notify('Chọn đợt đăng ký', 'danger');
            this.props.listDotDangKy.focus();
        }
        else if (response.error) {
            T.notify(response.error, 'danger');
        } else {
            this.setState({ dangKyAll: response.items, dangKyFalse: response.falseItem, displayState: true, reload: true });
            this.notify();
        }
    };

    notify = () => {
        const { dangKyFalse, dangKyAll } = this.state;
        dangKyFalse.length && T.notify(`${dangKyFalse.length} hàng đăng ký thất bại`, 'danger');
        dangKyAll.length && T.notify(`Đăng kí học phần đợt ${this.props.tenDot}`, 'success');
        this.setState({ canSave: !!dangKyAll.length, displayState: 'data' });
    }

    changeCheckAll = (value) => {
        let items = this.state.dangKyAll;
        items.map(item => item.isCheck = value);
        this.setState({ dangKyAll: items });
    }

    changeCheckTPAll = (value) => {
        let items = this.state.dangKyAll;
        items.map(item => item.tinhPhi = value);
        this.setState({ dangKyAll: items });
    }

    colorItem = (item) => {
        if (item.isDangKy == true) {
            if (item.maTinhTrang != 1 && item.maTinhTrang != null) {
                return '#FAF884';
            } else if (item.hocPhi && item.hocPhi == 0) {
                return '#FAF884';
            }
        }
    }

    reLoadPage = () => {
        this.props.reload();
    }

    dangKy = e => {
        e && e.preventDefault();
        let list = this.state.dangKyAll.map(ele => {
            ele.idDotDangKy = this.props.idDot;
            return ele;
        });
        let { filterhp } = this.state;
        let { namHoc, hocKy } = filterhp;
        let filter = { namHoc, hocKy };
        if (list.length == 0) {
            T.notify('Không tìm thấy học phần có thể đăng ký!', 'danger');
        } else {
            T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
            this.props.createSdhDangKyHocPhanAdvance(list, filter, () => {
                T.alert('Đăng ký học phần thành công', 'success', false, 1000);
                this.setState({ dangKyAll: [], dangKyFalse: [], message: '', displayState: 'import', filterhp: {}, canSave: false });
            });
        }
    }

    downloadExcel = () => {
        T.handleDownload('/api/sdh/dang-ky-hoc-phan/download-template', 'Dang_ky_hoc_phan_Template.xlsx');
    }

    downloadErrorExcel = () => {
        xlsx.writeFile(xlsx.utils.table_to_book(document.querySelector('.table.errorTable')), 'Danh sách đăng ký lỗi.xlsx');
    }

    // mapperLoaiDangKy = {
    //     'KH': <span><i className='fa fa-lg fa-sign-in' /> Theo kế hoạch</span>,
    //     'NKH': <span><i className='fa fa-lg fa-sign-out' /> Ngoài kế hoạch</span>,
    //     'NCTDT': <span><i className='fa fa-lg fa-info-circle' /> Ngoài CTĐT</span>,
    //     'CT': <span><i className='fa fa-lg fa-chevron-circle-right' /> Cải thiện</span>,
    //     'HL': <span><i className='fa fa-lg fa-repeat' /> Học lại</span>,
    //     'HV': <span><i className='fa fa-lg fa-chevron-circle-up' /> Học vượt</span>,
    // }

    renderKetQuaImport = (list) => renderDataTable({
        data: list,
        emptyTable: 'Không có dữ liệu!',
        header: 'thead-light',
        stickyHead: true,
        divStyle: { height: '60vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center' }}>Row</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã học phần</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Tên môn học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>MSSV</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TTSV</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Nợ HP</th>
                {/* <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Loại đăng ký</th> */}
                <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Ghi chú</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    Tính phí
                    <FormCheckbox ref={e => this.checkAll = e} onChange={value => this.changeCheckTPAll(value)} readOnly={this.state.displayState == 'importing'} />
                </th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <FormCheckbox ref={e => this.checkAll = e} onChange={value => this.changeCheckAll(value)} readOnly={this.state.displayState == 'importing'} />
                </th>
            </tr>),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                <TableCell style={{ textAlign: 'right' }} content={item.stt} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenTinhTrangSV} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center', backgroundColor: this.colorItem(item) }} contentClassName={item.hocPhi == null ? '' : item.hocPhi == '0' ? 'text-danger' : 'text-success'}
                    content={item.hocPhi == null ? '' : item.hocPhi == '0'
                        ? <Tooltip title='Còn nợ học phí'>
                            <i className='fa fa-lg fa-times-circle' />
                        </Tooltip>
                        : <Tooltip title='Đã đóng đủ'>
                            <i className='fa fa-lg fa-check-circle' />
                        </Tooltip>} />
                {/* <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maLoaiDKy && this.mapperLoaiDangKy[item.maLoaiDKy] ? this.mapperLoaiDangKy[item.maLoaiDKy] : ''} /> */}
                <TableCell style={{ whiteSpace: 'nowrap' }}
                    content={item.isDangKy == true ? (
                        <div style={{ color: 'green' }}>  <i className='fa fa-lg fa-check-circle-o' /> Được phép đăng ký </div>) :
                        (<div style={{ color: 'red' }}>  <i className='fa fa-lg fa-times-circle-o' /> Thất bại </div>)
                    }
                />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
                <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={item.tinhPhi} permission={{ write: this.state.displayState != 'importing' }}
                    onChanged={() => {
                        list[index].tinhPhi = !list[index].tinhPhi;
                        this.setState({ dangKyAll: list }, () => {
                            let dangKyAll = this.state.dangKyAll;
                            this.setState({ dangKyAll });
                        });
                    }}
                />
                <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={item.isCheck} permission={{ write: this.state.displayState != 'importing' }}
                    onChanged={() => {
                        list[index].isCheck = !list[index].isCheck;
                        this.setState({ dangKyAll: list }, () => {
                            let dangKyAll = this.state.dangKyAll;
                            this.setState({ dangKyAll });
                        });
                    }}
                />
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
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã học phần</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Tên môn học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>MSSV</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TTSV</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Nợ HP</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', }}>Loại đăng ký</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Ghi chú</th>
            </tr>),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                <TableCell style={{ textAlign: 'right' }} content={item.stt} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenTinhTrangSV} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center', backgroundColor: this.colorItem(item) }} contentClassName={item.hocPhi == null ? '' : item.hocPhi == '0' ? 'text-danger' : 'text-success'}
                    content={item.hocPhi == null ? '' : item.hocPhi == '0'
                        ? <Tooltip title='Còn nợ học phí'>
                            <i className='fa fa-lg fa-times-circle' />
                        </Tooltip>
                        : <Tooltip title='Đã đóng đủ'>
                            <i className='fa fa-lg fa-check-circle' />
                        </Tooltip>} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maLoaiDKy && this.mapperLoaiDangKy[item.maLoaiDKy] ? this.mapperLoaiDangKy[item.maLoaiDKy] : ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }}
                    content={item.isDangKy == true ? (
                        <div style={{ color: 'green' }}>  <i className='fa fa-lg fa-check-circle-o' /> Được phép đăng ký </div>) :
                        (<div style={{ color: 'red' }}>  <i className='fa fa-lg fa-times-circle-o' /> Thất bại </div>)
                    }
                />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
            </tr>)
    });

    render() {
        let { dangKyAll, displayState, dangKyFalse, filterhp, canSave } = this.state;
        let { namHoc, hocKy } = filterhp;
        return (<>
            <div className='tile'>
                <div className='tile-body'>
                    <div className='rows' style={{ textAlign: 'right' }}>
                        <button className='btn btn-primary mr-2' onClick={() => this.setState({ displayState: 'import', canSave: false, reload: false })} style={{ display: this.state.reload ? '' : 'none' }}>
                            <i className='fa fa-refresh' /> ReLoad
                        </button>
                        <button className='btn btn-warning mr-2' onClick={(e) => e.preventDefault() || this.downloadErrorExcel()} style={{ display: dangKyFalse.length ? '' : 'none' }}>
                            <i className='fa fa-fw fa-lg fa-arrow-circle-down' /> Tải file lỗi
                        </button>
                        <button className='btn btn-success' onClick={(e) => e.preventDefault() || this.dangKy()} style={{ display: (canSave == true) ? '' : 'none' }}>
                            <i className='fa fa-fw fa-lg fa-handshake-o' /> Lưu đăng ký
                        </button>
                    </div>

                    <div className='rows' style={{ textAlign: 'right', display: displayState == 'import' ? 'block' : 'none', }}>
                        <button className='btn btn-warning mb-2' type='button' onClick={this.downloadExcel}>
                            <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file mẫu tại đây
                        </button>
                        <FileBox postUrl={`/user/upload?namHoc=${namHoc}&hocKy=${hocKy}`} uploadType='SdhDangKyHocPhanData' userData={'SdhDangKyHocPhanData'}
                            accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                            style={{ width: '80%', margin: '0 auto' }}
                            ajax={true} success={this.onSuccess} />
                    </div>
                    <div className='rows' style={{ display: displayState != 'import' ? '' : 'none' }}>
                        <FormTabs contentClassName='tile' ref={e => this.tab = e}
                            tabs={[
                                { title: 'Đăng ký thành công ', component: this.renderKetQuaImport(dangKyAll || []) },
                                { title: 'Đăng ký thất bại ', component: this.renderKetQuaImportFalse(dangKyFalse || []) },
                            ]}
                        />

                    </div>
                </div>
            </div>
        </>);
    }
}

const mapStateToProps = (state) => ({ system: state.system });
const mapActionsToProps = { createSdhDangKyHocPhanAdvance };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ImportDangKyTrucTiepSdh);
