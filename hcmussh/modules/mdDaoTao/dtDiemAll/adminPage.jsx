import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { AdminPage, renderDataTable, TableCell, TableHead, FormSelect } from 'view/component/AdminPage';
import { dtDiemAllGetPage, dtDiemUpdateFilter } from './redux';
import { getDtDiemThanhPhanAll } from 'modules/mdDaoTao/dtDiemConfigThanhPhan/redux';
// import { Tooltip } from '@mui/material';
import Pagination from 'view/component/Pagination';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_DtKhoaDaoTaoFilter } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_LoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';

class DtDiemAllPage extends AdminPage {
    state = { filter: {}, dataThanhPhan: [] }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.showAdvanceSearch();
            T.showSearchBox(() => {
                this.showAdvanceSearch();
            });
        });

    }

    getPage = (pageN, pageS, pageC, done) => {
        let { namFilter: namHoc, hocKyFilter: hocKy } = this.state.filter;
        this.props.getDtDiemThanhPhanAll({ namHoc, hocKy }, dataThanhPhan => this.setState({ dataThanhPhan }));
        this.props.dtDiemAllGetPage(pageN, pageS, pageC, this.state.filter, done);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        let [key, value] = data.split(':');
        this.setState({ filter: { ...this.state.filter, [key]: value } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    renderToTable = (data) => {
        let { dataThanhPhan } = this.state;
        return renderDataTable({
            data,
            renderHead: () => <tr>
                <TableHead content='#' />
                <TableHead content='MSSV' style={{ width: '100px' }} keyCol='mssv' onKeySearch={this.handleKeySearch} />
                <TableHead content='Họ tên' style={{ width: '250px' }} keyCol='hoTen' onKeySearch={this.handleKeySearch} />
                <TableHead content='Học phần' style={{ width: '30%' }} keyCol='maHocPhan' onKeySearch={this.handleKeySearch} />
                <TableHead content='Tên học phần' style={{ width: '50%' }} keyCol='tenHocPhan' onKeySearch={this.handleKeySearch} />
                <TableHead content='Thành phần điểm' style={{ width: '20%' }} />
                {
                    dataThanhPhan.map(i => (<th style={{ width: 'auto', whiteSpace: 'nowrap' }} key={i.ma}>{i.loaiDiem}</th>))
                }
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tổng kết</th>
            </tr>,
            renderRow: (item, index) => {
                let tp = dataThanhPhan.filter(i => Object.keys(item.phanTramDiem).includes(i.ma));
                return <tr key={index}>
                    <TableCell content={item.R} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<><span className='text-primary'>{item.mssv}</span></>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell content={item.maHocPhan} />
                    <TableCell content={T.parse(item.tenMonHoc)?.vi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{tp.map(i => <div key={i}><b>{i.loaiDiem}</b>: {item.phanTramDiem[i.ma]}%</div>)}</>} />
                    {
                        dataThanhPhan.map(i => (<TableCell style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} key={`diem${i.ma}`} content={item.diemDacBiet[i.ma] || item.diem[i.ma]} />))
                    }
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.diem['TK']} />
                </tr>;
            }
        });
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtDiemAll && this.props.dtDiemAll.page ?
            this.props.dtDiemAll.page : {
                pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null, pageCondition: '',
            },
            { filter, dataThanhPhan, isSearch } = this.state;

        return this.renderPage({
            title: 'Quản lý điểm',
            icon: 'fa fa-leaf',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/grade-manage'>Điểm</Link>,
                'Quản lý'
            ],
            advanceSearchTitle: '',
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.namFilter = e} data={SelectAdapter_SchoolYear} className='col-md-3' label='Năm học' onChange={value => this.setState({ filter: { ...this.state.filter, namFilter: value.id } })} />
                <FormSelect ref={e => this.hocKyFilter = e} className='col-md-3' label='Học kỳ' data={SelectAdapter_DtDmHocKy} onChange={value => this.setState({ filter: { ...this.state.filter, hocKyFilter: value?.id } })} />
                <FormSelect ref={e => this.khoaSinhVienFilter = e} className='col-md-2' label='Khoá' data={SelectAdapter_DtKhoaDaoTaoFilter('dtBangDiem:manage')} onChange={value => this.setState({ filter: { ...this.state.filter, khoaSinhVienFilter: value?.id } })} allowClear />
                <FormSelect ref={e => this.loaiHinhDaoTaoFilter = e} className='col-md-3' label='Loại hình' data={SelectAdapter_LoaiHinhDaoTaoFilter('dtBangDiem:manage')} onChange={value => this.setState({ filter: { ...this.state.filter, loaiHinhDaoTaoFilter: value?.id } })} allowClear />
                <div className='col-md-1' style={{ margin: 'auto ' }}>
                    <button className='btn btn-success' type='button' onClick={() => {
                        const { namFilter, hocKyFilter, loaiHinhDaoTaoFilter } = this.state.filter;
                        if (namFilter && hocKyFilter && loaiHinhDaoTaoFilter) {
                            this.setState({ isSearch: true }, () => this.getPage(pageNumber, pageSize, pageCondition));
                        } else {
                            T.alert('Vui lòng chọn đầy đủ dữ liệu tìm kiếm', 'warning', true, 5000);
                        }
                    }}>
                        <i className='fa fa-fw fa-lg fa-search' />Tìm kiếm
                    </button>
                </div>
            </div>,
            content: <>
                <div className='tile' style={{ display: isSearch ? '' : 'none' }}>
                    {this.renderToTable(list)}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
            </>,
            collapse: [
                { permission: true, type: 'info', icon: 'fa-upload', name: 'Import tổng', onClick: () => window.open('/user/dao-tao/grade-manage/data/import', '_blank') },
                { permission: true, type: 'success', icon: 'fa-file-excel-o', name: 'Export', onClick: () => T.get('/api/dt/grade-manage/diem-all/export', { filter: T.stringify(filter), dataThanhPhan: T.stringify(dataThanhPhan.map(i => ({ ma: i.ma, loaiDiem: i.loaiDiem }))) }) },
            ],
            backRoute: '/user/dao-tao/grade-manage'
        });
    }
}
const mapStateToProps = state => ({ system: state.system, dtDiemAll: state.daoTao.dtDiemAll });
const mapActionsToProps = { dtDiemAllGetPage, dtDiemUpdateFilter, getScheduleSettings, getDtDiemThanhPhanAll };
export default connect(mapStateToProps, mapActionsToProps)(DtDiemAllPage);
