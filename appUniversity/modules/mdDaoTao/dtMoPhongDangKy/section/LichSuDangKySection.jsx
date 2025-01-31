import React from 'react';
import { connect } from 'react-redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderDataTable, FormSelect, TableHead } from 'view/component/AdminPage';
import { getDtLichSuDkhpPage } from 'modules/mdDaoTao/dtMoPhongDangKy/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
export class LichSuDangKySection extends AdminPage {
    colorMain = '#0139a6';
    state = { filter: {}, sortTerm: 'thoiGianThacTac_DESC', isShowSubmit: false }
    defaultSortTerm = 'thoiGianThacTac_DESC'
    thaoTac = [
        { id: 'A', text: 'Đăng ký mới' },
        { id: 'D', text: 'Hủy đăng ký' },
        { id: 'C', text: 'Chuyển lớp' },
        { id: 'H', text: 'Hoàn tác' }
    ]
    setValue = (mssv) => {
        this.setState({ filter: { userMssv: mssv } });
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getDtLichSuDkhpPage(pageN, pageS, pageC, filter, page => {
            this.setState({ page });
            done && done();
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    render() {
        const { namHoc, hocKy } = this.state.filter;
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.state.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, list: null };

        let table = renderDataTable({
            data: list,
            emptyTable: (namHoc && hocKy) ? `Không có dữ liệu lịch sử đăng ký học phần cho HK${hocKy}, năm học ${namHoc}` : '',
            header: 'thead-light',
            stickyHead: list && list.length > 9 ? true : false,
            divStyle: { height: '69vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn học' keyCol='tenMon' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Người thao tác' keyCol='nguoiThaoTac' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thời gian thao tác' keyCol='thoiGianThaoTac' />
                    <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thao tác' keyCol='thaoTac' onKeySearch={this.handleKeySearch} onSort={this.onSort} data={this.thaoTac} typeSearch='select' />
                    <TableHead style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ghi chú' keyCol='ghiChu' />
                </tr>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={indexOfItem} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.userModified} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM:ss' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.timeModified} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                            item.thaoTac == 'A' ? (
                                <div style={{ color: 'green' }}>
                                    <i className='fa fa-lg fa-check-circle-o' /> Đăng ký mới </div>
                            ) : (
                                item.thaoTac == 'D' ? (
                                    <div style={{ color: 'red' }}>
                                        <i className='fa fa-lg fa-times-circle-o' /> Hủy đăng ký </div>
                                ) : (
                                    item.thaoTac == 'H' ? (
                                        <div style={{ color: 'orange' }}>
                                            <i className='fa fa-lg fa-undo' /> Hoàn tác </div>
                                    ) : (
                                        <div style={{ color: 'blue' }}>
                                            <i className='fa fa-lg fa-repeat' /> Chuyển lớp </div>
                                    )
                                )

                            )
                        } />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={
                            item.thaoTac == 'C' ? `Sinh viên được chuyển từ lớp học phần ${item.ghiChu}`
                                : (item.thaoTac != 'A' && item.thaoTac != 'D' && item.thaoTac != 'H' ? item.thaoTac : item.ghiChu)
                        } />
                    </tr>
                );
            }
        });
        return (
            <div className='tile'>
                <div className='row'>
                    <FormSelect ref={(e) => (this.namHoc = e)} className='col-md-6' label='Năm học' data={SelectAdapter_SchoolYear}
                        onChange={(value) => this.setState({ filter: { ...this.state.filter, namHoc: value?.id || '' } })} allowClear
                    />
                    <FormSelect ref={(e) => (this.hocKy = e)} className='col-md-6' label='Học kỳ' data={SelectAdapter_DtDmHocKy}
                        onChange={(value) => this.setState({ filter: { ...this.state.filter, hocKy: value?.id || '' } })} allowClear
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'end' }} className='form-group col-md-12' >
                    <button className='btn btn-success' onClick={(e) => {
                        this.state.isShowSubmit = true;
                        e.preventDefault() || this.getPage();
                    }} >
                        <i className='fa fa-lg fa-search-plus' /> Tìm kiếm
                    </button>
                </div>
                {this.state.isShowSubmit ? <div>
                    <div className='row'>
                        <div className='col-md-12 my-2'>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h4 className='tile-title'>Danh sách lịch sử đăng ký học phần</h4>
                                <div><Pagination style={{ marginLeft: '70px', position: 'initial' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                                    getPage={this.getPage} pageRange={5} /></div>
                            </div>
                        </div>
                    </div>
                    <div>{table}</div>
                </div>
                    : <h5>Chọn năm học, học kỳ</h5>}
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDtLichSuDkhpPage };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(LichSuDangKySection);
