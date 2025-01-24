import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, renderTable, TableCell, TableHead } from 'view/component/AdminPage';

import { getThongKeLoaiPhiDashboard, getThongKeHocPhiNganh } from './redux';
import T from 'view/js/common';
import { SelectAdapter_FwNamTuyenSinh } from 'modules/mdCongTacSinhVien/fwStudents/redux';
const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => {
        const nam = i + new Date().getFullYear() - 10;
        return { id: nam, text: `${nam} - ${nam + 1}` };
    });
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];


export class TableCustom extends React.Component {
    state = {}
}
class TcDashboard extends AdminPage {
    componentDidMount() {
        T.ready('/user/finance', () => {
            this.props.getThongKeHocPhiNganh({}, result => {
                this.setState({ ...result, listShow: {} });
                this.namHoc?.value(result.settings.namHoc);
                this.hocKy?.value(result.settings.hocKy);
                this.namTuyenSinh?.value(result.settings.namHoc);
            });
        });
    }
    getDashboard = () => {
        const filter = {
            namHoc: this.namHoc.value(),
            hocKy: this.hocKy.value(),
            namTuyenSinh: this.namTuyenSinh.value()
        };
        this.props.getThongKeHocPhiNganh(filter, result => {
            this.setState({ ...result, listShow: {} });
        });
    }
    downloadDs = () => {
        const filter = {
            namHoc: this.namHoc.value(),
            hocKy: this.hocKy.value(),
            namTuyenSinh: this.namTuyenSinh.value()
        };
        T.handleDownload(`/api/khtc/dashboard/export-detail?filter=${T.stringify(filter)}`, 'HOC_PHI_DASHBOARD.xlsx');
    }

    initRows = ({ data, listDongDu, listChuaDong }) => {
        let returnList = [];
        const listData = data.groupBy('heDaoTao');
        for (const [index, he] of Object.keys(listData).entries()) {
            const dataTheoHe = listData[he];
            returnList.push(
                <tr style={{ fontSize: '16px', fontWeight: 'bold' }} onClick={() => {
                    this.setState({ listShow: { ...this.state.listShow, [he]: !this.state.listShow[he] } });
                }} key={he}>
                    <TableCell style={{ textAlign: 'center' }} content={T.colName(index)} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={he} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={''} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={dataTheoHe.reduce((total, cur) => total + parseInt(cur.soLuongSv), 0)} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} type='number' content={listDongDu.filter(item => item.heDaoTao == he).reduce((total, cur) => total + parseInt(cur.soLuongSv), 0)} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} type='number' content={listChuaDong.filter(item => item.heDaoTao == he).reduce((total, cur) => total + parseInt(cur.soLuongSv), 0)} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} type='number' content={dataTheoHe.reduce((total, cur) => total + parseInt(cur.tongSoTien), 0)} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} type='number' content={dataTheoHe.reduce((total, cur) => total + parseInt(cur.tongMienGiam), 0)} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} type='number' content={dataTheoHe.reduce((total, cur) => total + parseInt(cur.tongDaDong), 0)} />
                </tr>
            );
            // const
            for (const [index, nganh] of dataTheoHe.entries()) {
                const tenNganh = nganh.nganh;
                returnList.push(
                    <tr style={this.state?.listShow?.[`${he}`] ? {} : { display: 'none' }} key={`${he} - ${index}`}>
                        <TableCell style={{ textAlign: 'center' }} content={`${index + 1}.`} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={''} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={tenNganh} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} type='number' content={nganh.soLuongSv} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} type='number' content={listDongDu.filter(item => item.heDaoTao == he && item.nganh == tenNganh).reduce((total, cur) => total + parseInt(cur.soLuongSv), 0)} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} type='number' content={listChuaDong.filter(item => item.heDaoTao == he && item.nganh == tenNganh).reduce((total, cur) => total + parseInt(cur.soLuongSv), 0)} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} type='number' content={nganh.tongSoTien} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} type='number' content={nganh.tongMienGiam} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} type='number' content={nganh.tongDaDong} />

                    </tr>
                );
            }
        }
        return returnList;
    };
    render() {
        const table = () => {
            return renderTable({
                emptyTable: 'Không có dữ lệu của học kỳ này',
                getDataSource: () => this.state.data,
                // style: { fontSize: 14, padding: '8px' },
                stickyHead: true,
                // className: 'table-striped table-borderless',
                header: 'thead-dark',
                loadingText: 'Đang tải',
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <TableHead style={{ width: '70%', whiteSpace: 'nowrap', textAlign: 'left' }} content='Hệ Đào Tạo' />
                        <TableHead style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'left' }} content='Ngành Đào Tạo' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }} content='Số lượng sinh viên được định phí' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }} content='Số sinh viên đã nộp đủ' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }} content='Số sinh viên chưa nộp đủ' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }} content='Số tiền cần nộp' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }} content='Số tiền được miễn giảm' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }} content='Số tiền đã thu' />
                    </tr>
                ),
                renderRow: this.initRows({ data: this.state?.data || [], listDongDu: this.state?.listDongDu, listChuaDong: this.state?.listChuaDong })
            });
        };
        return this.renderPage({
            title: 'Dashboard Tổng',
            icon: 'fa fa-money',
            header: <>
                <FormSelect ref={e => this.namHoc = e} style={{ width: '100px', marginBottom: '0', marginRight: 10 }} placeholder='Năm học' data={yearDatas()} onChange={this.getDashboard} />
                <FormSelect ref={e => this.hocKy = e} style={{ width: '100px', marginBottom: '0' }} placeholder='Học kỳ' data={termDatas} onChange={this.getDashboard} />
            </>,
            content: <>
                <div className='tile'>
                    {/* {table} */}
                    <h5 className='tile-title' style={{ position: 'relative' }}></h5>
                    <div className='row d-flex justify-content-end'>
                        <FormSelect ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' placeholder='Năm tuyển sinh' data={SelectAdapter_FwNamTuyenSinh} className='col-md-3' onChange={this.getDashboard} />
                    </div>

                    {table()}
                </div>
            </>,
            buttons: [{ type: 'primary', icon: 'fa-file-excel-o', className: 'btn-success', tooltip: 'export', onClick: e => e.preventDefault() || this.downloadDs() }]
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getThongKeLoaiPhiDashboard, getThongKeHocPhiNganh };
export default connect(mapStateToProps, mapActionsToProps)(TcDashboard);



