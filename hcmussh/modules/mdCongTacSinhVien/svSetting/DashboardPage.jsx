import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell, FormDatePicker, loadSpinner, FormCheckbox } from 'view/component/AdminPage';
import { AdminChart, DefaultColors } from 'view/component/Chart';
import T from 'view/js/common';
import CountUp from 'view/js/countUp';
import { GetDashboard, downloadExcel } from './redux';
import { getDmSvLoaiHinhDaoTaoAll } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
// loadSpinner, DefaultColors

export class DashboardIcon extends React.Component {
    componentDidMount() {
        setTimeout(() => {
            const endValue = this.props.value ? parseInt(this.props.value) : 0;
            new CountUp(this.valueElement, 0, endValue, 0, 2, { separator: '.', decimal: ',' }).start();
        }, 100);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value)
            setTimeout(() => {
                const endValue = this.props.value ? parseInt(this.props.value) : 0;
                new CountUp(this.valueElement, prevProps.value, endValue, 0, 2, { separator: '.', decimal: ',' }).start();
            }, 100);
    }

    render() {
        let isShow = true;
        if (this.props.isShowValue != undefined) {
            if (this.props.isShowValue == false) isShow = false;
        }
        const content = (
            <div className={'widget-small coloured-icon ' + this.props.type}>
                <i className={'icon fa fa-3x ' + this.props.icon} style={{ backgroundColor: this.props.color || '' }} />
                <div className='info'>
                    {isShow && <p style={{ fontWeight: 'bold' }} ref={e => this.valueElement = e} />}
                    <label style={{ color: 'black' }}>{this.props.title} </label>

                </div>
            </div>
        );
        return this.props.link ? <Link to={this.props.link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
    }
}

class DashboardCtsv extends AdminPage {
    state = { isLoading: true };
    filter = { listHeDaoTao: [] };
    loaiHinhCheckbox = {};
    listAllHeDaoTao = [];
    advanceSearch = {};
    listTenNganh = {};
    listLoaiHinh = {};
    loaiHinhColors = {};
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            this.showAdvanceSearch();
            this.filter = {
                fromNhapHoc: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime(),
                toNhapHoc: new Date().setHours(23, 59, 59, 0)
            };
            this.advanceSearch.fromNhapHoc.value(this.filter.fromNhapHoc);
            this.advanceSearch.toNhapHoc.value(this.filter.toNhapHoc);
            this.props.getDmSvLoaiHinhDaoTaoAll(listHeDaoTao => {
                this.listAllHeDaoTao = listHeDaoTao;
                this.filter.listHeDaoTao = listHeDaoTao.map(item => item.ma);
                this.GetDashboard();
            });
        });
    }

    changeAdvancedSearch = (isReset = false) => {
        this.GetDashboard();
        this.hideAdvanceSearch();
        const { filter } = T.updatePage('pageDashboardNhapHoc');
        Object.keys(filter).forEach(key => {
            if (['toNhapHoc', 'fromNhapHoc'].includes(key)) this.advanceSearch[key].value(filter[key]);
            else this.advanceSearch[key].value(filter[key].toString().split(','));
        });
        if (isReset) {
            Object.keys(this.advanceSearch).forEach(key => {
                if (this.advanceSearch[key].value && this.advanceSearch[key].value()) this.advanceSearch[key].value('');
            });
        }
    }

    getFilter = () => {
        const { fromNhapHoc, toNhapHoc, listHeDaoTao = [] } = this.filter;
        return {
            fromNhapHoc, toNhapHoc, listHeDaoTao: listHeDaoTao.join(',')
        };
    }

    GetDashboard = () => {
        this.props.GetDashboard(this.getFilter(), result => {
            let { data, dataFee, listThaoTac } = result,
                // Loc ra nhung sinh vien da nhap hoc
                dataFilter = data.filter(item => item.ngayNhapHoc != null && item.ngayNhapHoc >= 1640995200000);
            //listLoaiHinh: LHDT có trong danh sách
            this.listLoaiHinh = [...(new Set(dataFilter.map(item => item.tenLoaiHinh)))];
            this.listLoaiHinh.forEach((tenLoaiHinh, index) => {
                this.loaiHinhColors[tenLoaiHinh] = Object.values(DefaultColors)[index];
            });
            //listHeDaoTao: tất cả LHDT
            this.setState({
                data, listThaoTac,
                dataFee,
                isLoading: false,
                sumNewStud: data.length,
                dataTong: this.setUpGraph(dataFilter, 'ngayNhapHocText'),
            }, () => {
            });
        });
    }

    setUpGraph = (data = []) => {
        let dataGroupBy = data.groupBy('ngayNhapHocText');
        delete dataGroupBy[null];
        delete dataGroupBy[undefined];
        return {
            labels: Object.keys(dataGroupBy),
            datas: Object.assign({}, ...this.listLoaiHinh.map(loaiHinh => ({ [loaiHinh]: Object.values(dataGroupBy).map(item => item.filter(item => item.tenLoaiHinh == loaiHinh).length) }))),
            // datas: this.listLoaiHinh.reduce((obj, loaiHinh) => {
            //     obj[loaiHinh] = Object.values(dataGroupBy).map(item => item.filter(item => item.tenLoaiHinh == loaiHinh).length);
            //     return obj;
            // }, {}),
            colors: this.loaiHinhColors,
        };
    }

    setUpData = (data, xKey, yKey) => {
        const filtered = data.filter(item => !!item[xKey] && !item[yKey]);
        return filtered.reduce((res, item) => {
            const xVal = item[xKey];
            const yVal = item[yKey];
            res[yVal] = res[yVal] ? res[yVal] : {};
            res[xVal][yVal] = Number(res[xVal][yVal]) + 1;
        }, {});
    }

    relationalTableGenerator = (xKey, yKey) => {
        let xSet = new Set(), //Ten cot
            ySet = new Set(),  //Ten hang
            data = this.state.data || [];
        data.forEach(item => {
            xSet.add(item[xKey]); ySet.add(item[yKey]);
        });
        xSet = [...xSet].sort();
        ySet = [...ySet].sort();
    }

    relationalTableRenderer = (xKey, yKey) => {
        let xSet = new Set(), //Ten cot
            ySet = new Set(),  //Ten hang
            data = (this.state.data || []).filter(item => !!item[xKey] && !!item[yKey]);
        data.forEach(item => {
            xSet.add(item[xKey]); ySet.add(item[yKey]);
        });
        xSet = [...xSet].sort();
        ySet = [...ySet].sort();

        const stickyFirstCol = { position: 'sticky', left: 0, top: 'auto', zIndex: 300 };
        return <div className='position-relative'>{renderTable({
            emptyTable: 'Chưa có dữ liệu',
            getDataSource: () => [...ySet],
            // className: 'table-pin',
            stickyHead: true,
            divStyle: { height: 'calc(60vh - 100px)' },
            renderHead: () => <tr>
                <th style={{ whiteSpace: 'nowrap', ...stickyFirstCol }}></th>
                {xSet.map(xVal => <th key={xVal} style={{ whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 'bold' }}>{xVal}</th>)}
            </tr>,
            renderRow: <>
                {ySet.map((yVal, index) => <tr key={index}>
                    <td style={{ whiteSpace: 'nowrap', fontWeight: 'bold', backgroundColor: '#dee2e6', ...stickyFirstCol }}>{yVal}</td>
                    {xSet.map((xVal, xIndex) => <td key={`${xIndex}-${xVal}`} style={{ whiteSpace: 'nowrap', textAlign: 'center', backgroundColor: '#9AD0EC' }}>{
                        data.filter(item => item[xKey] == xVal && item[yKey] == yVal).length
                    }</td>)}
                </tr>)}
                <tr>
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#ced2d6', ...stickyFirstCol }} rowSpan={2}>Tổng cộng</td>
                    {xSet.map((xVal, xIndex) => <td key={`${xIndex}-${xVal}`} style={{ whiteSpace: 'nowrap', textAlign: 'center', backgroundColor: '#1572A1' }}>{
                        data.filter(item => item[xKey] == xVal).length
                    }</td>)}
                </tr>
                <tr><td style={{ whiteSpace: 'nowrap', textAlign: 'center', backgroundColor: '#FFEF82', fontWeight: 'bold' }} colSpan={xSet.length}>{data.length}</td></tr>
            </>

        })}</div>;
    }

    onCheckLoaiHinh = (value, loaiHinh) => {
        this.filter.listHeDaoTao = this.filter.listHeDaoTao.filter(item => item != loaiHinh);
        value && this.filter.listHeDaoTao.push(loaiHinh);
    }
    onCheckLoaiHinhAll = (value) => {
        if (value) {
            this.filter.listHeDaoTao = this.listAllHeDaoTao.map(item => this.loaiHinhCheckbox[item.ma].value(1) || item.ma);
        } else {
            this.filter.listHeDaoTao = [];
            this.listAllHeDaoTao.forEach(item => this.loaiHinhCheckbox[item.ma].value(0));
        }
    }


    table = (list) => renderTable({
        emptyTable: 'Không có dữ liệu sinh viên',
        stickyHead: true,
        header: 'thead-light',
        getDataSource: () => list,
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>MSSV</th>
                <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Họ và tên lót</th>
                <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên</th>
                <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tình trạng</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giới tính</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày sinh</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã ngành</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoá</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Email cá nhân</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Email sinh viên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SĐT cá nhân</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian nhập học</th>
            </tr>
        ),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell type='number' content={index + 1} />
                <TableCell type='link' url={`/user/ctsv/profile/${item.mssv}`} style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={
                    <>
                        {item.isUpToDate ? <b className='text-success'>Đã lưu trực tuyến</b> : <b className='text-secondary'>Chưa lưu trực tuyến</b>}
                        < br />
                        {this.state.dataFee.find(fee => fee.mssv == item.mssv) ? <b>{this.state.dataFee.find(fee => fee.mssv == item.mssv).trangThai == 1 ? <span className='text-primary'>Đã thanh toán phí nhập học</span> : <span className='text-warning'>Đã gia hạn thanh toán</span>}</b> : <b className='text-danger'>Chưa thanh toán phí nhập học</b>}
                    </>
                } />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.gioiTinh ? (item.gioiTinh == 1 ? 'Nam' : 'Nữ') : ''} />
                <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngaySinh} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maNganh || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namTuyenSinh || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiHinhDaoTao || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.emailCaNhan || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.emailTruong || ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.dienThoaiCaNhan || ''} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<>{T.dateToText(item.ngayNhapHoc, 'HH:MM:ss dd/mm/yyyy')}<br /><i>{this.state.listThaoTac.find(thaoTac => thaoTac.mssv == item.mssv)?.email || ''}</i></>} />
            </tr>
        )
    });

    render() {
        let permission = this.getUserPermission('student', ['read', 'write', 'delete', 'export']);
        const { fromNhapHoc, toNhapHoc } = this.filter;
        const filterTanSinhVien = {
            // listLoaiHinhDaoTao: this.listLoaiHinh.toString(),
            fromNhapHoc, toNhapHoc
        }, filterInDate = {
            // listLoaiHinhDaoTao: this.listLoaiHinh.toString(),
            fromNhapHoc: new Date().setHours(0, 0, 0, 0),
            toNhapHoc: new Date().setHours(23, 59, 59, 0)
        };
        return this.renderPage({
            title: 'Dashboard nhập học USSH',
            icon: 'fa fa-tachometer',
            backRoute: '/user/ctsv',
            breadcrumb: [
                <Link key={1} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Dashboard'
            ],
            advanceSearchTitle: '',
            advanceSearch: <>
                <div className='d-flex justify-content-between flex-wrap'>
                    <FormCheckbox className='m-1' ref={e => this.loaiHinhCheckbox['all'] = e} label={'Tất cả'} value='1' onChange={value => this.onCheckLoaiHinhAll(value)} />
                    {this.listAllHeDaoTao.map((item, index) => <FormCheckbox key={index} ref={e => this.loaiHinhCheckbox[item.ma] = e} value='1' className='m-1' label={item.ten} onChange={value => this.onCheckLoaiHinh(value, item.ma)} />)}
                </div>
            </>,
            header: <>
                <div className='d-flex justify-content-right align-items-center'>
                    <FormDatePicker type='time' ref={e => this.advanceSearch.fromNhapHoc = e} className='mr-3' label='Từ ngày' onChange={value => { this.filter.fromNhapHoc = value ? value.getTime() : ''; }} onKeyDown={e => e.code === 'Enter' && (e.preventDefault() || this.GetDashboard())} />
                    <FormDatePicker type='time' ref={e => this.advanceSearch.toNhapHoc = e} className='mr-3' label='Đến ngày' onChange={value => { this.filter.toNhapHoc = value ? value.getTime() : ''; }} onKeyDown={e => (e.preventDefault() || this.GetDashboard())} />
                    <button className='btn btn-info ' onClick={e => {
                        const { fromNhapHoc, toNhapHoc } = this.filter;
                        e.preventDefault();
                        if (!fromNhapHoc || !toNhapHoc) {
                            T.notify('Khoảng thời gian trống', 'danger');
                        }
                        else if (toNhapHoc <= fromNhapHoc) {
                            T.notify('Khoảng thời gian không hợp lệ', 'danger');
                        } else if ((toNhapHoc - fromNhapHoc) > 31536000000) {
                            T.notify('Vượt khoảng thời gian cho phép: 365 ngày', 'danger');
                        }
                        else {
                            this.setState({ isLoading: true }, this.GetDashboard);
                        }
                    }}><i className='fa fa-filter'></i></button>
                </div>
            </>,
            content: (this.state.isLoading ? loadSpinner()
                : this.state.dataTong ? <div className='row'>
                    <div className='col-md-3'>
                        <DashboardIcon type='info' icon='fa-users' title='Tổng tân sinh viên' value={this.state.sumNewStud || 0} link='/user/ctsv/list' />
                    </div>
                    {this.listLoaiHinh.map((loaiHinh, index) => (
                        <div key={index} className='col-md-3'>
                            <DashboardIcon type='info' color={this.loaiHinhColors[loaiHinh]} icon='fa-users' title={loaiHinh} value={this.state.data.filter(item => item.tenLoaiHinh == loaiHinh).length || 0} />
                        </div>
                    ))}
                    <div className='col-md-3'>
                        <DashboardIcon type='warning' icon='fa-money' title='Đã đóng học phí' value={this.state.dataFee?.filter(fee => this.state.data.map(item => item.mssv).includes(fee.mssv)).length || 0} />
                    </div>
                    <div className='col-12'></div>
                    <div className='col-lg-12'>
                        <div className='tile' style={{ height: '60vh', overflow: 'auto' }}>
                            <h5 className='tile-title'>Số lượng nhập học theo ngày</h5>
                            <AdminChart type='bar' data={this.state.dataTong} aspectRatio={3} />
                            {/* <div className='row'>
                                <div className='col-md-2'>
                                    {this.listHeDaoTao.map((item, index) => <FormCheckbox key={index} className='m-1' label={item.ten} value='1' onChange={value => this.onCheckLoaiHinh(value, item.ma)} />)}
                                </div>
                                <div className='col-md-10'>
                                    <AdminChart type='bar' data={this.state.dataTong} aspectRatio={3} />
                                </div>
                            </div> */}
                        </div>
                    </div>
                    <div className='col-lg-6'>
                        <div className='tile' style={{ height: '60vh', overflow: 'auto' }}>
                            <div className='d-flex justify-content-between align-item-start'>
                                <h5 className='tile-title'>Số lượng theo hệ</h5>
                                <button className='btn btn-link btn-lg'
                                    onClick={e => e.preventDefault() || this.props.downloadExcel('ngayNhapHocText', 'tenLoaiHinh', this.getFilter(), 'SO LUONG THEO HE')}>
                                    <i className='fa fa-download mb-3' /></button>
                            </div>
                            {this.relationalTableRenderer('ngayNhapHocText', 'tenLoaiHinh')}
                        </div>
                    </div>
                    <div className='col-lg-6'>
                        <div className='tile' style={{ height: '60vh', overflow: 'auto' }}>
                            <div className='d-flex justify-content-between align-item-start'>
                                <h5 className='tile-title'>Số lượng theo ngành</h5>
                                <button className='btn btn-link btn-lg'
                                    onClick={e => e.preventDefault() || this.props.downloadExcel('ngayNhapHocText', 'tenNganh', this.getFilter(), 'SO LUONG THEO NGANH')}>
                                    <i className='fa fa-download mb-3' /></button>
                            </div>
                            {/* {this.nganhRender(this.state.dataTableNganh)} */}
                            {this.relationalTableRenderer('ngayNhapHocText', 'tenNganh')}
                        </div>
                    </div>
                    <div className='col-lg-12'>
                        <div className='tile' style={{ height: '60vh', overflow: 'auto' }}>
                            <div className='d-flex justify-content-between align-item-start'>
                                <h5 className='tile-title'>Ngành theo hệ</h5>
                                <button className='btn btn-link btn-lg'
                                    onClick={e => e.preventDefault() || this.props.downloadExcel('tenLoaiHinh', 'tenNganh', this.getFilter(), 'NGANH THEO HE')}>
                                    <i className='fa fa-download mb-3' /></button>
                            </div>
                            {/* {this.nganhHeRender(this.state.dataTableNganhHe)} */}
                            {this.relationalTableRenderer('tenLoaiHinh', 'tenNganh')}
                        </div>
                    </div>
                    <div className='col-md-12'>
                        <div className='tile'>
                            <h5 className='tile-title'>Danh sách đã xác nhận nhập học</h5>
                            {this.table((this.state.data || []).filter(item => item.ngayNhapHoc != null && item.ngayNhapHoc != -1))}
                        </div>
                    </div>
                </div>
                    : <div className='tile'>
                        <p>Vui lòng chọn khoảng thời gian nhập học</p>
                    </div>),
            buttons: [
                permission.export && {
                    className: 'btn btn-danger', icon: 'fa-users', tooltip: 'Danh sách TSV đã nhập học', onClick: e => {
                        e.preventDefault();
                        if (!this.state.dataTong) {
                            T.notify('Vui lòng chọn khoảng thời gian nhập học', 'danger');
                        } else {
                            T.download(`/api/ctsv/download-excel?filter=${T.stringify(filterTanSinhVien)}`, 'ALL_STUDENTS.xlsx');
                        }
                    }
                },
                permission.export && { className: 'btn btn-info', icon: 'fa-file-excel-o', tooltip: `Danh sách ngày ${T.dateToText(new Date().getTime(), 'dd/mm/yyyy')}`, onClick: e => e.preventDefault() || T.download(`/api/ctsv/download-excel?filter=${T.stringify(filterInDate)}`, `STUDENTS_${T.dateToText(new Date().getTime(), 'dd/mm/yyyy')}.xlsx`) }
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    GetDashboard, downloadExcel, getDmSvLoaiHinhDaoTaoAll
};
export default connect(mapStateToProps, mapActionsToProps)(DashboardCtsv);