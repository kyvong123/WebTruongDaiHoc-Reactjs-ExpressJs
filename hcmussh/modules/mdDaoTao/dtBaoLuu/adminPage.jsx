import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, TableCell, TableHead, renderDataTable } from 'view/component/AdminPage';
import { dtBaoLuuGetPage } from './redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DtLop } from 'modules/mdDaoTao/dtLop/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
class DtBaoLuuPage extends AdminPage {
    state = { filter: { khoaSinhVien: '', heDaoTao: '', lopSinhVien: '' } };
    defaultSortTerm = 'mssv_ASC';

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.showAdvanceSearch();
            T.showSearchBox(() => {
                this.showAdvanceSearch();
            });
        });
    }

    getPage = (pageN, pageS, pageC) => {
        let filter = { ...this.state.filter, sortTerm: this.state?.sortTerm || this.defaultSortTerm };
        this.props.dtBaoLuuGetPage(pageN, pageS, pageC, filter);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        let [key, value] = data.split(':');
        this.setState({ filter: { ...this.state.filter, [key]: value } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    handleChange = ({ value, key }) => {
        this.setState({ filter: { ...this.state.filter, [key]: value ? value.id : '' } }, () => {
            if (key != 'lopSinhVien') {
                this.setState({ filter: { ...this.state.filter, lopSinhVien: '' } }, () => this.lopSinhVien.value(''));
            }
        });
    }

    render() {
        const { pageNumber, pageSize, pageCondition, list } = this.props.dtBaoLuu?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, pageCondition: '', list: null };
        const permission = this.getUserPermission('dtBaoLuu', ['manage', 'write', 'export']);
        let { filter, displayState } = this.state;

        let table = renderDataTable({
            emptyTable: 'Không có sinh viên bảo lưu',
            data: list ? list : null,
            header: 'thead-light',
            stickyHead: list && list.length > 12,
            divStyle: { height: list && list.length > 12 ? '60vh' : 'auto' },
            renderHead: () => <tr>
                <TableHead content='MSSV' style={{ minWidth: '100px', whiteSpace: 'nowrap' }} keyCol='mssv' onKeySearch={this.handleKeySearch} />
                <TableHead content='Họ' style={{ minWidth: '200px', whiteSpace: 'nowrap' }} keyCol='ho' onKeySearch={this.handleKeySearch} />
                <TableHead content='Tên' style={{ minWidth: '60px', whiteSpace: 'nowrap' }} keyCol='ten' onKeySearch={this.handleKeySearch} />
                <TableHead content='Ngày sinh' style={{ minWidth: '60px', whiteSpace: 'nowrap' }} keyCol='ngaySinh' typeSearch='date' onKeySearch={this.handleKeySearch} />
                <TableHead content='Khoá SV' style={{ minWidth: '90px', whiteSpace: 'nowrap' }} keyCol='khoaSv' onKeySearch={this.handleKeySearch} />
                <TableHead content='Loại hình đào tạo' style={{ minWidth: '150px', whiteSpace: 'nowrap' }} keyCol='lhdt' onKeySearch={this.handleKeySearch} />
                <TableHead content='Lớp' style={{ minWidth: '90px', whiteSpace: 'nowrap' }} keyCol='lop' onKeySearch={this.handleKeySearch} />
                <TableHead content='Chương trình đào tạo' style={{ minWidth: '170px', whiteSpace: 'nowrap' }} keyCol='maCtdt' onKeySearch={this.handleKeySearch} />
                <TableHead content='Năm học, học kỳ bảo lưu' style={{ width: 'auto', whiteSpace: 'nowrap' }} />
                <TableHead content='Ngày bắt đầu bảo lưu' style={{ width: 'auto', whiteSpace: 'nowrap' }} keyCol='batDauBaoLuu' typeSearch='date' onKeySearch={this.handleKeySearch} />
                <TableHead content='Ngày hết hạn bảo lưu' style={{ width: 'auto', whiteSpace: 'nowrap' }} keyCol='hetHanBaoLuu' typeSearch='date' onKeySearch={this.handleKeySearch} />
                <TableHead content='Thao tác' style={{ width: 'auto', whiteSpace: 'nowrap' }} />
            </tr>,
            renderRow: (item) => <tr key={item.mssv}>
                <TableCell content={item.mssv} style={{ whiteSpace: 'nowrap' }} />
                <TableCell content={item.ho} style={{ whiteSpace: 'nowrap' }} />
                <TableCell content={item.ten} style={{ whiteSpace: 'nowrap' }} />
                <TableCell content={item.ngaySinh ? T.dateToText(item.ngaySinh, 'dd/mm/yyyy') : ''} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                <TableCell content={item.khoaSv} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                <TableCell content={item.loaiHinhDaoTao} style={{ whiteSpace: 'nowrap' }} />
                <TableCell content={item.lop} style={{ whiteSpace: 'nowrap' }} />
                <TableCell content={item.maCtdt} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                <TableCell content={`${item.namHoc}, HK${item.hocKy}`} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                <TableCell content={item.batDauBaoLuu ? T.dateToText(item.batDauBaoLuu, 'dd/mm/yyyy') : ''} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                <TableCell content={item.hetHanBaoLuu ? T.dateToText(item.hetHanBaoLuu, 'dd/mm/yyyy') : ''} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                <TableCell content={item} style={{ whiteSpace: 'nowrap' }} type='buttons' permission={permission} />
            </tr>
        });

        return this.renderPage({
            icon: 'fa fa-hourglass-end',
            title: 'Sinh viên bảo lưu',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/edu-schedule'>Quản lý học phần</Link>,
                'Sinh viên bảo lưu'
            ],
            advanceSearchTitle: '',
            advanceSearch: <div className='row'>
                <FormSelect className='col-md-4' ref={e => this.khoaSV = e} data={SelectAdapter_DtKhoaDaoTao} label='Khoá sinh viên' onChange={value => this.handleChange({ value, key: 'khoaSinhVien' })} allowClear={true} />
                <FormSelect className='col-md-4' ref={e => this.loaiHinh = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Loại hình đào tạo' onChange={value => this.handleChange({ value, key: 'heDaoTao' })} allowClear={true} />
                <FormSelect ref={e => this.lopSinhVien = e} data={SelectAdapter_DtLop(filter)} className='col-md-4' label='Lớp sinh viên' onChange={value => this.handleChange({ value: value?.id || '', key: 'lopSinhVien' })} allowClear={true} />
                <div className='col-md-12' style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button className='btn btn-primary' style={{ height: '34px' }}
                        onClick={e => e.preventDefault() || this.setState({ displayState: true }) || this.getPage(pageNumber, pageSize, pageCondition)} >
                        <i className='fa fa-lg fa-search' /> Tìm kiếm
                    </button>
                </div>
            </div>,
            content: <>
                {displayState && <div className='tile'>
                    {table}
                </div>}
            </>,
            backRoute: '/user/dao-tao/edu-schedule',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtBaoLuu: state.daoTao.dtBaoLuu });
const mapActionsToProps = {
    dtBaoLuuGetPage
};
export default connect(mapStateToProps, mapActionsToProps)(DtBaoLuuPage);
