import React from 'react';
import { getSvThongKeQuyetDinh } from './redux.jsx';
import { AdminPage, loadSpinner, renderTable, TableCell, FormDatePicker, FormCheckbox } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import CountUp from 'view/js/countUp';
import { DefaultColors } from 'view/component/Chart.jsx';

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

class svThongKeQuyetDinhPage extends AdminPage {
    state = {
        isLoading: true,
        isChange: false,
        filter: {
            thoiGianBatDau: null,
            thoiGianKetThuc: new Date().setHours(23, 59, 59, 0)
        },
        loaiQuyetDinh: 'Tất cả'
    };
    loaiQuyetDinhMAPPER = {
        'Tất cả': [1, 2],
        'Quyết định vào': [2],
        'Quyết định ra': [1]
    }

    componentDidMount() {
        T.ready('/user/ctsv', () => {
            this.getData('Tất cả');
        });
    }

    getData = (loaiQuyetDinh) => {
        const { thoiGianBatDau, thoiGianKetThuc } = this.state.filter;
        if (!thoiGianBatDau && !thoiGianKetThuc) {
            T.notify('Khoảng thời gian trống', 'danger');
            return;
        } else if (thoiGianBatDau >= thoiGianKetThuc) {
            T.notify('Khoảng thời gian không hợp lệ', 'danger');
            return;
        }
        this.props.getSvThongKeQuyetDinh(JSON.stringify(this.state.filter), this.loaiQuyetDinhMAPPER[loaiQuyetDinh], (result) => {
            let { data, tongQDRa, tongQDVao } = result;
            this.setState({
                tongQDRa,
                tongQDVao,
                data,
                loaiQuyetDinh,
                isLoading: false,
                isChange: false
            });
        });
    }

    table = (list) => {
        let listDataHead = Object.keys(list[0]);
        return renderTable({
            emptyTable: 'Không có dữ liệu quyết định',
            stickyHead: true,
            header: 'thead-light',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    {listDataHead.map((item, index) => (
                        <th style={{ width: index == 0 ? '50%' : 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} key={index}>{item}</th>
                    ))}
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    {listDataHead.map(header => (
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item[header]} key={index} />

                    ))}
                </tr>
            )
        });
    }

    render() {
        let permission = this.getUserPermission('thongKeQuyetDinh', ['manage', 'export']);
        return this.renderPage({
            icon: 'fa fa-table',
            title: 'Thống kê quản lý quyết định',
            breadcrumb: [
                <Link key={0} to={'/user/ctsv'}>
                    Công tác sinh viên
                </Link>,
                'Thống kê quản lý quyết định',
            ],
            header: <>
                <div className='d-flex justify-content-right align-items-center'>
                    <FormDatePicker type='date' className='mr-3' label='Từ ngày' onChange={value => { this.state.filter.thoiGianBatDau = value ? value.getTime() : ''; this.setState({ isLoading: true }, () => this.getData(this.state.loaiQuyetDinh)); }} onKeyDown={e => e.code === 'Enter' && (e.preventDefault() || this.getData(this.state.loaiQuyetDinh))} />
                    <FormDatePicker type='date' className='mr-3' label='Đến ngày' value={new Date().setHours(23, 59, 59, 0)} onChange={value => { this.state.filter.thoiGianKetThuc = value ? value.getTime() : ''; this.setState({ isLoading: true }, () => this.getData(this.state.loaiQuyetDinh)); }} onKeyDown={e => e.code === 'Enter' && (e.preventDefault() || this.getData(this.state.loaiQuyetDinh))} />
                </div>
            </>,
            content: (this.state.isLoading ? loadSpinner() :
                <div className='row'>
                    <div className='col-md-3'>
                        <DashboardIcon type='info' icon='fa-users' color={Object.values(DefaultColors)[0]} title={'Tổng số quyết định'} value={this.state.tongQDRa + this.state.tongQDVao} />
                    </div>
                    <div className='col-md-3'>
                        <DashboardIcon type='info' icon='fa-users' color={Object.values(DefaultColors)[1]} title={'Số quyết định vào'} value={this.state.tongQDVao} />
                    </div>
                    <div className='col-md-3'>
                        <DashboardIcon type='info' icon='fa-users' color={Object.values(DefaultColors)[2]} title={'Số quyết định ra'} value={this.state.tongQDRa} />
                    </div>

                    <div className='col-md-12'>
                        {this.state.isChange ? loadSpinner() :
                            <div className='tile'>
                                <div className='row'>
                                    <div className='col-md-8'>
                                        <h5 className='tile-title'>Thống kê quản lý quyết định</h5>
                                    </div>
                                    <div className='d-flex justify-content-between flex-wrap col-md-4'>
                                        <FormCheckbox className='m-1' label={'Tất cả'} value={this.state.loaiQuyetDinh == 'Tất cả'} onChange={() => { this.setState({ isChange: true }, () => { this.getData('Tất cả'); }); }} />
                                        <FormCheckbox className='m-1' label={'Quyết định vào'} value={this.state.loaiQuyetDinh == 'Quyết định vào'} onChange={() => { this.setState({ isChange: true }, () => { this.getData('Quyết định vào'); }); }} />
                                        <FormCheckbox className='m-1' label={'Quyết định ra'} value={this.state.loaiQuyetDinh == 'Quyết định ra'} onChange={() => { this.setState({ isChange: true }, () => { this.getData('Quyết định ra'); }); }} />
                                    </div>
                                </div>
                                {this.table(this.state.data || [])}
                            </div>
                        }
                    </div>
                </div>
            ),
            backRoute: '/user/ctsv/quyet-dinh',
            buttons: [
                permission.export && { className: 'btn btn-info', icon: 'fa-file-excel-o', tooltip: 'Thống kê quản lý quyết định', onClick: e => e.preventDefault() || T.download(`/api/ctsv/thong-ke-quyet-dinh/download-excel?filter=${T.stringify(this.state.filter)}`, 'Thống kê quản lý quyết định.xlsx') }
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, ctsvThongKeQuyetDinh: state.ctsv.ctsvThongKeQuyetDinh });
const mapActionsToProps = { getSvThongKeQuyetDinh };
export default connect(mapStateToProps, mapActionsToProps)(svThongKeQuyetDinhPage);