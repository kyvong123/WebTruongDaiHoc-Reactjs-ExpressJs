import React from 'react';
import { connect } from 'react-redux';
import { getDmSvDashboardChungNhan } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormDatePicker, loadSpinner, renderTable, TableCell } from 'view/component/AdminPage';
import { AdminChart, DefaultColors } from 'view/component/Chart';

class svDashboardChungNhanPage extends AdminPage {
    state = { nQuaHan: 0, isLoading: true }
    filter = { thoiGianBatDau: null, thoiGianKetThuc: new Date().setHours(23, 59, 59, 0) }
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            this.getChartData();
        });
    }
    // lấy data cho chart
    getChartData = () => {
        const { thoiGianBatDau, thoiGianKetThuc } = this.filter;
        if (!thoiGianBatDau && !thoiGianKetThuc) {
            T.notify('Khoảng thời gian trống', 'danger');
            return;
        } else if (thoiGianBatDau >= thoiGianKetThuc) {
            T.notify('Khoảng thời gian không hợp lệ', 'danger');
            return;
        }
        this.props.getDmSvDashboardChungNhan(JSON.stringify(this.filter), (data) => {
            let listDataHead = [];
            let listLable = [];
            let listColor = {};
            let datas = {};
            if (data.length > 0) {
                listDataHead = Object.keys(data[0]).slice(1);
                listLable = Object.keys(data.groupBy(Object.keys(data[0])[0].toString()));
                listDataHead.forEach((item, index) => { listColor[item] = Object.values(DefaultColors)[index]; });
                datas = Object.assign({}, ...listDataHead.map((dataHead) => ({ [dataHead]: listLable.map((lable, index) => data[index][dataHead]), })));
            }
            this.setState({
                dataTong: {
                    labels: listLable,
                    datas: datas,
                    colors: listColor,
                },
                data,
                isLoading: false,
            });
        });
    }
    // hàm download excel
    exportExcel = () => {
        T.download(`/api/ctsv/dashboard-chung-nhan/download-excel?filter=${JSON.stringify(this.filter)}`);
    }
    //hàm tạo table
    table = () => {
        let listHeader = this.state.data.length ? Object.keys(this.state.data[0]) : [];
        return renderTable({
            emptyTable: 'Không có chứng nhận',
            stickyHead: true,
            header: 'thead-light',
            getDataSource: () => this.state.data,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>STT</th>
                    {listHeader.map((head, index) => <th style={{ width: index == 0 ? '60%' : '10%', textAlign: 'center' }} key={index}>{head}</th>)}
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    {listHeader.map((head, index) => <TableCell content={item[head]} key={index} />)}
                </tr>
            )
        });
    }

    render() {
        const permission = this.getUserPermission('dashboardChungNhan', ['export', 'manage']);
        return this.renderPage({
            icon: 'fa fa-bar-chart-o',
            title: 'Thống kê chứng nhận',
            breadcrumb: [
                <Link key={0} to={'/user/ctsv'}>
                    Công tác sinh viên
                </Link>,
                'Thống kê chứng nhận',
            ],
            header: <>
                <div className='d-flex justify-content-right align-items-center'>
                    <FormDatePicker type='date' className='mr-3' label='Từ ngày' onChange={value => { this.filter.thoiGianBatDau = value ? value.getTime() : ''; this.setState({ isLoading: true }, this.getChartData); }} onKeyDown={e => e.code === 'Enter' && (e.preventDefault() || this.getChartData())} />
                    <FormDatePicker type='date' className='mr-3' label='Đến ngày' value={new Date().setHours(23, 59, 59, 0)} onChange={value => { this.filter.thoiGianKetThuc = value ? value.getTime() : ''; this.setState({ isLoading: true }, this.getChartData); }} onKeyDown={e => e.code === 'Enter' && (e.preventDefault() || this.getChartData())} />
                </div>
            </>,
            content: (
                this.state.isLoading ? loadSpinner() :
                    <>
                        <div className='col-lg-12'>
                            <div className='tile' style={{ minheight: '60vh' }}>
                                <h5 className='tile-title'>Số lượng chứng nhận</h5>
                                {this.state.dataTong ? <AdminChart type='bar' data={this.state.dataTong} aspectRatio={3} /> : ''}
                            </div>
                        </div>
                        <div className='col-md-12'>
                            <div className='tile'>
                                <h5 className='tile-title'>Danh sách chứng nhận</h5>
                                {this.table((this.state.data || []))}
                            </div>
                        </div>
                    </>
            ),
            backRoute: '/user/ctsv/chung-nhan-truc-tuyen',
            onExport: permission.export && this.state.data?.length && (() => this.exportExcel())
        });
    }
}

const mapStateToProps = state => ({ system: state.system, ctsvDashboardChungNhan: state.ctsv.ctsvDashboardChungNhan });
const mapActionsToProps = { getDmSvDashboardChungNhan };
export default connect(mapStateToProps, mapActionsToProps)(svDashboardChungNhanPage);
