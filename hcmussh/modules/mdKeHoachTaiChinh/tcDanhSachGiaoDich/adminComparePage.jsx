import { getBankItem, SelectAdapter_DmBank } from 'modules/mdDanhMuc/dmBank/redux';
import { SelectAdapter_tcRegularExpressionSet } from 'modules/mdKeHoachTaiChinh/tcRegularExpression/redux/regularExpressionSet';
import React from 'react';
import { connect } from 'react-redux';
import { FormDatePicker, FormSelect, FormTextBox, AdminPage, FormCheckbox, renderTable, TableCell } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';
import { getCompareData } from './redux';
const colName = (n) => {
    let ordA = 'a'.charCodeAt(0);
    let ordZ = 'z'.charCodeAt(0);
    let len = ordZ - ordA + 1;

    let s = '';
    while (n >= 0) {
        s = String.fromCharCode(n % len + ordA) + s;
        n = Math.floor(n / len) - 1;
    }
    return s.toUpperCase();
};

const columnData = Array.from(Array(100).keys()).map(item => colName(item));
const columnDataWithIndex = Array.from(Array(100).keys()).map(item => ({ id: item, text: colName(item) }));


class SoPhuPage extends AdminPage {
    state = { isSubmit: false }
    componentDidMount() {
        this.fileBox.setData('TachTransaction');
    }

    onShow = () => {
        this.setState({ isSubmit: false });
    }

    getTimeFilter = () => {
        let tuNgay = this.tuNgay.value() || null,
            denNgay = this.denNgay.value() || null;
        if (tuNgay) {
            tuNgay.setHours(0, 0, 0, 0);
            tuNgay = tuNgay.getTime();
        }
        if (denNgay) {
            denNgay.setHours(23, 59, 59, 999);
            denNgay = denNgay.getTime();
        }
        return { tuNgay, denNgay };
    }

    onSubmit = () => {
        if (!this.fileBox.getFile())
            return T.notify('Bạn chưa đính kèm tập tin', 'danger');
        this.setState({ isSubmit: true });
        this.fileBox.onUploadFile({});
    }
    onSuccess = (res) => {
        this.fileBox.setData('TachTransaction');
        this.setState({ isSubmit: false });
        const { tuNgay, denNgay } = this.getTimeFilter();
        const data = {
            tuNgay, denNgay,
            regularExpressionSet: this.regularExpressionSet.value(),
            nganHang: this.nganHang.value(),
            index: this.index.value(),
            dataColumnEndAt: Number(this.dataColumnEndAt.value()),
            dataColumnStartAt: Number(this.dataColumnStartAt.value()),
            soTienColumn: this.soTienColumn.value(),
            contentColumn: this.contentColumn.value(),
        };
        if (!res.fileName) {
            T.notify('Lỗi upload file', 'danger');
        } else {
            if (this.state.download)
                T.handleDownload(`/api/khtc/danh-sach-giao-dich/compare/result/${res.fileName}?download=1&info=${T.stringify(data)}`, 'TachTransaction.xlsx');
            else {
                this.setState({ info: data, isLoading: true }, () => {
                    this.props.getCompareData(res.fileName, T.stringify(data), () => this.setState({ isLoading: false }), () => this.setState({ isLoading: false }));
                });
            }
        }
    }

    onBankChange = (value) => {
        this.props.getBankItem(value.id, (item) => {
            const config = T.parse(item.bankConfig, {});
            Object.keys(config).forEach(key => {
                if (['tuNgay', 'denNgay'].includes(key)) {
                    if (!(this[key].value() instanceof Date) && config[key] != null)
                        this[key]?.value(new Date(config[key]));
                } else if (this[key]?.value && key != 'nganHang') {
                    this[key]?.value(config[key]);
                }
            });
        });
    }

    renderWorkSheetData = (data) => renderTable({
        getDataSource: () => data,
        stickyHead: true,
        renderHead: () => {
            const header = [];
            header.push(<th key={'stt'} style={{ whiteSpace: 'nowrap', width: 'auto' }}>STT</th>);
            for (let colIndex = this.state.info.dataColumnStartAt; colIndex <= this.state.info.dataColumnEndAt; colIndex++) {
                if (colName(colIndex) == this.state.info.contentColumn) {
                    header.push(<th key={colIndex} style={{ whiteSpace: 'nowrap', width: '80%', textAlign: 'center' }}>{colName(colIndex)}</th>);
                } else if (colName(colIndex) == this.state.info.soTienColumn) {
                    header.push(<th key={colIndex} style={{ whiteSpace: 'nowrap', width: '20%', textAlign: 'center' }}>{colName(colIndex)}</th>);
                } else {
                    header.push(<th key={colIndex} style={{ whiteSpace: 'nowrap', width: 'auto', textAlign: 'center' }}>{colName(colIndex)}</th>);
                }
            }
            return <tr>
                {header}
            </tr>;
        },
        renderRow: (item) => {
            const cells = [];
            cells.push(<TableCell key={'stt'} content={item.index} />);
            for (let colIndex = this.state.info.dataColumnStartAt; colIndex <= this.state.info.dataColumnEndAt; colIndex++) {
                if (colName(colIndex) == this.state.info.contentColumn) {
                    cells.push(<TableCell key={colIndex} content={item[colName(colIndex)]} />);
                } else {
                    cells.push(<TableCell style={{ whiteSpace: 'nowrap' }} key={colIndex} content={item[colName(colIndex)]} />);
                }
            }
            return <tr key={item.index}>
                {cells}
            </tr>;
        }
    })

    renderSystemDataRows = () => renderTable({
        getDataSource: () => Object.values(this.props.soPhu.systemDataRows),
        stickyHead: true,
        renderHead: () => <>
            <tr>
                <th style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }} rowSpan={2}>STT</th>
                <th style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }} rowSpan={2}>Học kỳ</th>
                <th style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }} rowSpan={2}>MSSV</th>
                <th style={{ whiteSpace: 'nowrap', verticalAlign: 'middle', width: '30%' }} rowSpan={2}>Họ và Tên</th>
                <th style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }} rowSpan={2}>Số tiền</th>
                <th style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }} rowSpan={2}>Phương thức thanh toán</th>
                <th style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }} rowSpan={2}>Thời gian giao dịch</th>
                <th style={{ whiteSpace: 'nowrap', verticalAlign: 'middle', width: '30%' }} rowSpan={2}>Ghi chú</th>
                <th style={{ whiteSpace: 'nowrap', verticalAlign: 'middle', width: '40%' }} colSpan={2}>Khoản thu</th>
            </tr>
            <tr>
                <th style={{ whiteSpace: 'nowrap', width: '20%' }}>Loại phí</th>
                <th style={{ whiteSpace: 'nowrap', width: '20%' }}>Số tiền</th>
            </tr>
        </>,
        renderRow: (item, index) => {

            // mssv(pin):"12345"
            // ngayGiaoDich(pin):1669870800000
            // originMssv(pin):"12345"
            // soTien(pin):1000
            // serviceId(pin):"347002"
            // transId(pin):"12345-1678270552172"
            // billId(pin):null
            // namHoc(pin):2022
            // status(pin):1
            // bank(pin):null
            // transDate(pin):"2022-12-01T05:00:00.000Z"
            // ghiChu(pin):"test sai tien"
            // checkSum(pin):null
            // invoiceID(pin):null
            // khoanThu(pin):"{"181":{"soTien":1000,"ten":"Học phí HK2 năm học 2022-2023"}}"
            // hoVaTen(pin):"STUDENT TEST"
            // khoaSinhVien(pin):2021
            // tenKhoa(pin):"Ngữ văn Anh"
            // heDaoTao(pin):"Văn bằng 2 - Chính quy"
            // nganHang(pin):"BIDV"
            const khoanThu = T.parse(item.khoanThu, {});
            const khoanThuList = Object.values(khoanThu);
            const length = Object.values(khoanThu).length;
            return <>
                <tr key={item.transId}>
                    <TableCell rowSpan={length} content={index + 1} style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }} />
                    <TableCell rowSpan={length} content={item.namHoc + '-' + (item.namHoc + 1) + '_' + 'HK0' + item.hocKy} style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }} />
                    <TableCell rowSpan={length} content={item.mssv} style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }} />
                    <TableCell rowSpan={length} content={item.hoVaTen} style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }} />
                    <TableCell rowSpan={length} content={item.soTien} style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }} />
                    <TableCell rowSpan={length} content={item.serviceId} style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }} />
                    <TableCell rowSpan={length} content={item.transDate} style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }} />
                    <TableCell rowSpan={length} content={item.ghiChu} style={{ verticalAlign: 'middle' }} />
                    <TableCell content={length ? khoanThuList[0].ten : ''} style={{}} />
                    <TableCell content={length ? khoanThuList[0].soTien : ''} style={{ whiteSpace: 'nowrap' }} />
                </tr>
                {length > 1 && Array.from(Array(length - 1).keys()).map(i => {
                    return <tr key={i}>
                        <TableCell content={khoanThuList[i + 1].ten} style={{}} />
                        <TableCell content={khoanThuList[i + 1].soTien} style={{ whiteSpace: 'nowrap' }} />
                    </tr>;
                })}
            </>;
        }
    })

    renderSoSanh = (data) => renderTable({
        getDataSource: () => data,
        stickyHead: true,
        renderHead: () => <>
            <tr>
                <th style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }} rowSpan={2}>STT</th>
                <th style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }} rowSpan={2}>MSSV</th>
                <th style={{ whiteSpace: 'nowrap', verticalAlign: 'middle', textAlign: 'center' }} colSpan={2}>Thông tin hệ thống</th>
                <th style={{ whiteSpace: 'nowrap', verticalAlign: 'middle', textAlign: 'center' }} colSpan={3}>Thông tin sổ phụ</th>
            </tr>
            <tr>
                <th style={{ whiteSpace: 'nowrap', width: '20%' }}>Số tiền</th>
                <th style={{ whiteSpace: 'nowrap', width: '20%' }}>Thời gian</th>
                <th style={{ whiteSpace: 'nowrap', width: '20%' }}>Số tiền</th>
                <th style={{ whiteSpace: 'nowrap', width: '20%' }}>Thời gian</th>
                <th style={{ whiteSpace: 'nowrap', width: '20%' }}>Số thư tự dòng</th>
            </tr>
        </>,
        renderRow: (item, index) => {
            /*item = {mssv, workSheetInfo: [
                {
                  soTien: 10000,
                  index: 15,
                  rowData: {
                    index: 15,
                    B: '01/12/2022 12:40:06',
                    C: '01/12/2022 12:40:06',
                    D: '0',
                    E: '10,000',
                    G: 'REM Tfr Ac: 13510000782771 O@L_347002_212501_0_0_736857289_9623412345_USSH STUDENT TEST 10000_TT hoc phi:12345_USSH STUDENT TEST 10000_HD:20221201000042_'
                }
                },], systemInfo: [
            ]} */
            const maxLength = Math.max(item.workSheetInfo?.length, item.systemInfo?.length);
            return <React.Fragment key={index}> {
                Array.from(Array(maxLength).keys()).map(i => {
                    return <tr key={i}>
                        {i == 0 ? <>
                            <TableCell rowSpan={maxLength} content={index + 1} />
                            <TableCell rowSpan={maxLength} content={item.mssv} style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }} />
                        </> : null}
                        <TableCell content={item.systemInfo[i] ? item.systemInfo[i].soTien : ''} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell content={item.systemInfo[i] ? item.systemInfo[i].transDate : ''} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell content={item.workSheetInfo[i] ? item.workSheetInfo[i].rowData.B : ''} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell content={item.workSheetInfo[i] ? item.workSheetInfo[i].rowData.E : ''} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell content={item.workSheetInfo[i] ? item.workSheetInfo[i].index : ''} style={{ whiteSpace: 'nowrap' }} />
                    </tr>;
                })
            }
            </React.Fragment>;
        }
    })

    render() {
        return this.renderPage({
            title: 'Công cụ kiểm tra sổ phụ',
            isLoading: this.state.isSubmit,
            content: <div>
                <div className='tile'>
                    <div className='tile-body row'>
                        <FileBox className='col-md-12' pending={true} ref={e => this.fileBox = e} postUrl='/user/upload' uploadType='TachTransaction' userData='TachTransaction' success={this.onSuccess} />
                        <FormCheckbox className='col-md-12' label='Sử dụng thời gian giao dịch' ref={e => this.thoiGianSoPhu = e} />
                        <FormSelect data={SelectAdapter_DmBank} label='Ngân hàng' ref={e => this.nganHang = e} className='col-md-4' onChange={this.onBankChange} />
                        <FormSelect data={SelectAdapter_tcRegularExpressionSet} label='Bộ biểu thức chính quy' ref={e => this.regularExpressionSet = e} className='col-md-4' />
                        <FormTextBox type='number' label='Dòng dữ liệu bắt đầu' ref={e => this.index = e} className='col-md-4' />
                        <FormDatePicker type='date' label='Từ ngày' ref={e => this.tuNgay = e} className='col-md-6' />
                        <FormDatePicker type='date' label='Đến ngày' ref={e => this.denNgay = e} className='col-md-6' />
                        <FormSelect data={columnDataWithIndex} label='Cột dữ liệu bắt đầu' ref={e => this.dataColumnStartAt = e} className='col-md-6' />
                        <FormSelect data={columnDataWithIndex} label='Cột dữ liệu kết thúc' ref={e => this.dataColumnEndAt = e} className='col-md-6' />
                        <FormSelect data={columnData} label='Cột số tiền' ref={e => this.soTienColumn = e} className='col-md-6' />
                        <FormSelect data={columnData} label='Cột nội dung' ref={e => this.contentColumn = e} className='col-md-6' />
                        <div className='col-md-12 d-flex justify-content-end align-items-center' style={{ gap: 10 }}>
                            <button className='btn btn-warning' >
                                <i className={this.state.isLoading ? 'fa fa-spin fa-spinner' : 'fa fa-lg fa-cog'} />
                                <a href={'/user/finance/regular-expression'} target='_blank' rel='noreferrer' style={{ color: '#000' }}>Điều chỉnh biểu thức chính quy</a>
                            </button>
                            <button className='btn btn-success' onClick={(e) => e.preventDefault() || this.setState({ download: true }, this.onSubmit)}>
                                <i className='fa fa-lg fa-download' /> Tải xuống
                            </button>
                            <button className='btn btn-primary' onClick={(e) => e.preventDefault() || this.setState({ download: false }, this.onSubmit)}>
                                <i className={this.state.isLoading ? 'fa fa-spin fa-spinner' : 'fa fa-lg fa-cog'} /> Kiểm tra
                            </button>
                        </div>
                    </div>
                </div>
                {
                    this.props.soPhu && <div className='tile'>
                        <div className='tile-body row'>
                            <div className='col-md-12'>
                                <ul className='nav nav-tabs'>
                                    <li className='nav-item'>
                                        <a className='nav-link active show' data-toggle='tab' href='#workSheetRawData'>Sổ phụ</a>
                                    </li>
                                    <li className='nav-item'>
                                        <a className='nav-link' data-toggle='tab' href='#systemDataRows'>Giao dịch hệ thống</a>
                                    </li>
                                    <li className='nav-item'>
                                        <a className='nav-link' data-toggle='tab' href='#comparing'>So sánh</a>
                                    </li>

                                    <li className='nav-item'>
                                        <a className='nav-link' data-toggle='tab' href='#workSheetUnidentifyData'>Giao dịch không xác định mssv</a>
                                    </li>

                                </ul>
                            </div>
                            <div className='col-md-12'>
                                <div className='tab-content'>
                                    <div className='tab-pane fade active show' id='workSheetRawData'>
                                        <div className=''>
                                            {this.renderWorkSheetData(Object.values(this.props.soPhu.workSheetRawData))}
                                        </div>
                                    </div>

                                    <div className='tab-pane fade' id='systemDataRows'>
                                        {this.renderSystemDataRows()}
                                    </div>

                                    <div className='tab-pane fade' id='comparing'>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <h4>Sổ phụ so với hệ thống</h4>
                                                {this.renderSoSanh(this.props.soPhu.soPhuVsSystem)}

                                            </div>
                                            <div className="col-md-6">
                                                <h4>Hệ thống so với sổ phụ</h4>
                                                {this.renderSoSanh(this.props.soPhu.systemVsSoPhu)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className='tab-pane fade' id='workSheetUnidentifyData'>
                                        {this.renderWorkSheetData(this.props.soPhu.workSheetUnidentifyData)}
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div >
        });
    }
}

const stateToProps = state => ({ soPhu: state.finance.tcGiaoDich?.soPhu });
const actionsToProps = { getCompareData, getBankItem };
export default connect(stateToProps, actionsToProps)(SoPhuPage);
