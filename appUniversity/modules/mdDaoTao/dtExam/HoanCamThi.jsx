import React from 'react';
import { AdminPage, FormSelect, renderDataTable, TableCell, TableHead, CirclePageButton } from 'view/component/AdminPage';
import { getPageDinhChiThi, hoanTacdinhChiThi } from './redux';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import Pagination from 'view/component/Pagination';
import { connect } from 'react-redux';
import { Tooltip } from '@mui/material';


class HoanCamThi extends AdminPage {
    mapperDinhChi = { 'HT': 'Hoãn thi', 'CT': 'Cấm thi' };
    defaultSortTerm = 'maHocPhan_ASC'
    state = { filter: {} }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getScheduleSettings(data => {
                let { namHoc, hocKy } = data.currentSemester;
                this.namHoc.value(namHoc);
                this.hocKy.value(hocKy);
                this.setState({
                    filter: { ...this.state.filter, namHoc, hocKy }
                }, () => {
                    this.getPage(undefined, undefined, '',);
                });
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, sort: this.state?.filter.sort || this.defaultSortTerm };
        this.props.getPageDinhChiThi(pageN, pageS, pageC, filter, done);
    }

    hoanTac = (item) => {
        if (item.isHoanThi) {
            T.notify('Học phần này đã được nhập điểm hoãn cho sinh viên!', 'danger');
        } else {
            T.confirm('Hoàn tác hoãn/cấm thi', `Bạn có muốn hoàn tác ${this.mapperDinhChi[item.loaiDinhChi]} của sinh viên ${item.mssv} - ${item.ho} ${item.ten} không`, true, isConfirm => {
                if (isConfirm) {
                    this.props.hoanTacdinhChiThi(item.id, this.getPage);
                }
            });
        }
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    render() {
        const { pageNumber, pageSize, pageCondition, pageTotal, list, totalItem } = this.props.dtExam && this.props.dtExam.pageDinhChi
            ? this.props.dtExam.pageDinhChi : { pageNumber: 1, pageSize: 50, pageCondition: '', pageTotal: 1, list: null, totalItem: 1 };

        const table = renderDataTable({
            emptyTable: 'Không có dữ liệu',
            data: list,
            stickyHead: true,
            divStyle: { height: '65vh' },
            header: 'thead-light',
            renderHead: () => (<>
                <tr>
                    <TableHead content='#' />
                    <TableHead content='MSSV' keyCol='mssv' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ whiteSpace: 'nowrap' }} content='Họ và tên' keyCol='hoTen' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ whiteSpace: 'nowrap' }} content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '100%', whiteSpace: 'nowrap' }} content='Tên học phần' keyCol='tenHocPhan' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Kỳ thi' keyCol='kyThi' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Hình thức' keyCol='loaiDinhChi' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Ghi chú' keyCol='ghiChu' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Người thao tác' keyCol='user' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Thời gian' keyCol='time' />
                    <th>Thao tác</th>
                </tr>
            </>),
            renderRow: (item, index) => {
                return (<tr key={index}>
                    <TableCell content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.ho} ${item.ten}`} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { 'vi': '' })?.vi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenKyThi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={this.mapperDinhChi[item.loaiDinhChi]} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.userMod} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.timeMod)} />
                    <TableCell type='buttons' style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={item}>
                        {item.loaiDinhChi != 'HT' && <Tooltip title='Hoàn tác' arrow>
                            <button className='btn btn-warning' onClick={e => e.preventDefault() || this.hoanTac(item)}>
                                <i className='fa fa-lg fa-refresh' />
                            </button>
                        </Tooltip>}
                    </TableCell>
                </tr>);
            }
        });

        return (
            <div className='tile'>
                <Pagination style={{ marginLeft: '10px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} pageRange={5} />
                <CirclePageButton type='import' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '25px', bottom: '10px', color: 'white' }} tooltip='Import dssv cấm/hoãn thi' onClick={e => e.preventDefault() || this.props.history.push('/user/dao-tao/lich-thi/hoan-cam-import')} />
                <CirclePageButton type='export' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '90px', bottom: '10px', color: 'white' }} tooltip='Export dssv cấm/hoãn thi' onClick={() => T.handleDownload(`/api/dt/exam/hoan-cam-thi/download?filter=${T.stringify(this.state.filter)}`)} />
                <div className='row'>
                    <FormSelect ref={e => this.namHoc = e} className='col-md-6' data={SelectAdapter_SchoolYear} label='Năm học'
                        onChange={value => this.setState({ filter: { ...this.state.filter, namHoc: value.id } },
                            () => this.getPage(undefined, undefined, '')
                        )} />
                    <FormSelect ref={e => this.hocKy = e} className='col-md-6' data={SelectAdapter_DtDmHocKy} label='Học kỳ'
                        onChange={value => this.setState({ filter: { ...this.state.filter, hocKy: value.id } },
                            () => this.getPage(undefined, undefined, '')
                        )} />
                </div>
                <div className='tile-body'>
                    {table}
                </div>
            </div>
        );
    }
}


const mapStateToProps = state => ({ system: state.system, dtExam: state.daoTao.dtExam });
const mapActionsToProps = { getPageDinhChiThi, getScheduleSettings, hoanTacdinhChiThi };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(HoanCamThi);
