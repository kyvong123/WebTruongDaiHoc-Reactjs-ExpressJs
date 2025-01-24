import React from 'react';
import { connect } from 'react-redux';
import CountUp from 'view/js/countUp';
import { getDataThongKe } from './redux';
import { AdminPage, loadSpinner, FormSelect } from 'view/component/AdminPage';
import { AdminChart, DefaultColors } from 'view/component/Chart';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { getSdhTsProcessingDot } from 'modules/mdSauDaiHoc/sdhTsInfoTime/redux';


class DashboardIcon extends React.Component {
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
                <i className={'icon fa fa-3x ' + this.props.icon} />
                <div className='info'>
                    <h4>
                        {this.props.title}
                    </h4>
                    {isShow && <p style={{ fontWeight: 'bold' }} ref={e => this.valueElement = e} />}
                </div>
            </div>
        );
        return this.props.link ? <a href={this.props.link} style={{ textDecoration: 'none' }}>{content}</a> : content;
    }
}
export class ChartArea extends React.Component {
    state = {}
    render() {
        let { className, title, chartType, data, aspectRatio = null, renderFilter = null, contentStyle, onClick = null, chartId } = this.props;
        return (
            <div className={className} id={chartId}>
                <div className='tile'>
                    <h5 className='tile-title' style={{ position: 'relative' }}>
                        <a href='#' style={contentStyle}
                            onClick={e => e.preventDefault() || onClick(e)}>{title}</a></h5>
                    <span style={{ position: 'absolute', top: '20px', right: '20px' }}>
                        {!this.props.hideMinimize && <Tooltip title={this.state[title] ? 'Hiện' : 'Ẩn'} arrow>
                            <button className='btn btn-white' onClick={e => e.preventDefault() || this.setState({ [title]: !this.state[title] })} ><i className='fa fa-lg fa-minus' /></button>
                        </Tooltip>}
                    </span>
                    {renderFilter}
                    <div style={{ display: this.state[title] ? 'none' : 'block', paddingTop: '50px' }} >
                        <AdminChart type={chartType} data={data} aspectRatio={aspectRatio} />
                    </div>
                </div>
            </div>
        );
    }
}



class Dashboard extends AdminPage {
    defaultSortTerm = 'ten_ASC';
    chartOption = {};
    state = { isLoading: true, data: null, chart: {}, filter: {}, chartOption: [], sortTerm: '', isKeySearch: false, isFixCol: false, isCoDinh: false }
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getSdhTsProcessingDot(data =>
                this.setState({ tenDot: data.ten }, () => {
                    this.initData();
                })
            );

        });
    }
    initData = () => {
        this.props.getDataThongKe(this.state.timeFilter, data => {
            this.setState({
                data,
                chart: this.thongKeGroupBy.map((item, idx) => {
                    let chartData = data[Object.keys(item)[0]],
                        groupBy = Object.values(item)[1],
                        datasKey = Object.keys(chartData.groupBy(groupBy)),
                        chartId = Object.keys(item)[0],
                        colors = Object.values(DefaultColors)[idx % Object.values(DefaultColors).length],
                        chart = '';
                    if (['tkPhanHe', 'tkHinhThuc'].includes(chartId)) {
                        const mapper = datasKey.map(item => ({ [item]: item }));
                        chart = this.circleSetUp(chartData, groupBy, datasKey, mapper);
                    } else
                        chart = this.setUp(chartData, groupBy, colors, datasKey);
                    return { [Object.keys(item)[0]]: chart };
                })
            }, () => {
                this.setState({ isLoading: false });
            });
        });
    }

    renderChart = (item) => {
        let { data, chart } = this.state;
        let chartId = Object.keys(item)[0];
        let [title] = Object.values(item);
        let findChart = chart.find(i => Object.keys(i)[0] == chartId);
        let chartData = Object.values(findChart)[0];
        let groupBy = Object.values(item)[1];
        let options = Object.keys(data[chartId].groupBy(groupBy));
        title = this.chartOption[chartId]?.value()?.length >= 4 ? '' : title;
        return (<ChartArea chartId={chartId} className={chartId == 'tkNganh' ? 'col-lg-12' : 'col-lg-6'} onClick={() => this.props.history.push('/user/sau-dai-hoc/tuyen-sinh/thong-ke', { mucThongKe: chartId, timeFilter: this.state.timeFilter })} title={title}
            chartType={['tkPhanHe', 'tkHinhThuc'].includes(chartId) ?
                'doughnut' : 'bar'}
            aspectRatio={2.5} data={chartData}
            renderFilter={!['tkPhanHe', 'tkHinhThuc'].includes(chartId) ?
                <FormSelect data={options} ref={e => this.chartOption[chartId] = e} multiple style={{ position: 'absolute', top: '20px', right: '80px', width: title ? '250px' : '75%' }} allowClear placeholder='Tùy chọn cột' onChange={() => this.handleChartOption(chartId)} />
                : ''}
        />);
    }

    handleChartOption = (chartId) => {
        const { data } = this.state;
        this.setState({
            chart: this.thongKeGroupBy.map((item, idx) => {
                if (Object.keys(item)[0] != chartId) return { ...item };
                else {
                    let chartData = data[chartId];
                    let groupBy = Object.values(item)[1],
                        colors = Object.values(DefaultColors)[idx],
                        datasKey = this.chartOption[chartId]?.value()?.length ? this.chartOption[chartId]?.value() : Object.keys(data[chartId].groupBy(groupBy));
                    let chart = '';
                    if (!['tkPhanHe', 'tkHinhThuc'].includes(chartId)) {
                        chart = this.setUp(chartData, groupBy, colors, datasKey);
                        return { [Object.keys(item)[0]]: chart };
                    }
                }

            })

        }, () => {
            this.setState({ isLoading: false });
        });
    }
    circleSetUp = (data = [], keyGroup, datasKey, mapper) => {
        let dataGroupBy = data.groupBy(keyGroup);
        let keys = data.map(item => item[keyGroup]).filter(i => datasKey.includes(i)),
            colors = Object.values(DefaultColors).slice(0, Object.keys(keys).length),
            colorsMapper = colors.map((item, idx) => {
                return colors[idx];
            }, {});
        delete dataGroupBy[null];
        const res = {
            labels: keys.map(item => {
                return mapper.find(i => i[item])[item] || 'Chưa xác định';
            }),
            datas: {
                'Số lượng': Object.values(dataGroupBy).map(item => {
                    if (item[0] && item[0].numOfDangKy) return item[0].numOfDangKy;
                    else {
                        return item.length;
                    }
                })
            },
            colors: colorsMapper
        };
        return res;
    }

    setUp = (data = [], keyGroup, colors, datasKey) => {
        let dataSet = [],
            datasMapper = {};

        dataSet = data.map((item) => Object.entries(item).map(entry => entry[1]));
        let dataNeed = datasKey;
        let dataSetFilter = dataNeed.map(i => dataSet.find(item => item.includes(i)));
        datasMapper = datasKey.reduce((accumulator, item, idx) => {
            return { ...accumulator, [item]: dataSetFilter[idx]?.length ? dataSetFilter[idx][0] : [] };
        }, {});
        const labels = Object.keys(datasMapper) || 'Chưa xác định';
        const datas = { 'Số lượng': Object.values(datasMapper) };
        const res = { labels, datas, colors, };
        return res;
    }

    thongKeSum = [
        'Tổng số đăng ký tuyển sinh',
        'Tổng số hồ sơ được duyệt',
        'Tổng số đăng ký thi ngoại ngữ',
        'Tổng số nộp chứng chỉ',
        'Tổng số vắng',
        'Tổng số bị kỷ luật',
        // 'Tổng số đăng ký phúc khảo',
        'Tổng số trúng tuyển'
    ];

    sumIcon = [
        'fa-group',
        'fa-user-plus',
        'fa-globe',
        'fa-certificate',
        'fa-fire',
        'fa-user-times',
        // 'fa-users',
        ' fa-graduation-cap',
    ];


    thongKeGroupBy = [
        { tkPhanHe: 'Đăng ký theo Phân hệ', groupBy: 'TEN_VIET_TAT' },
        { tkHinhThuc: 'Đăng ký theo Hình thức', groupBy: 'TEN_VIET_TAT' },
        { tkNganh: 'Đăng ký theo Ngành', groupBy: 'tenNganh' },
        { tkDknnByMon: 'Thi ngoại ngữ theo môn', groupBy: 'tenMonThi' },
        { tkCcnnByLoai: 'Chứng chỉ theo loại', groupBy: 'loaiChungChi' },
        { tkKyLuatByMucDo: 'Kỷ luật theo mức độ', groupBy: 'tenKyLuat' },
        // { tkKyLuatByMucDo: 'Phúc khảo theo môn', groupBy: 'tenMonThi' }, later
        { tkTrungTuyenByNganh: 'Trúng tuyển theo ngành', groupBy: 'tenNganh' }
    ]

    render() {
        const { data } = this.state || {};



        return this.renderPage({
            icon: 'fa fa-bar-chart',
            title: 'Dashboard',
            subTitle: 'Đợt ' + this.state.tenDot, //Thống kê theo đợt đang kích hoạt xử lý

            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                'Dashboard'
            ],

            content: this.state.isLoading ? loadSpinner() :
                <>
                    <div className='tile'>
                        <h4 className='tile-title'>Tổng quan</h4>
                        <div className='row'>
                            {this.thongKeSum.map((title, index) => {
                                if (index == 0) {
                                    return (<>
                                        <div className='col-md-6 col-lg-4'>
                                            <DashboardIcon type='primary' link={`#${Object.keys(this.thongKeGroupBy[index])[0]}`} icon={this.sumIcon[index]} title={title} value={data[Object.keys(data)[index]].numOfDangKy} />
                                        </div>
                                    </>);

                                } else {
                                    return (<>
                                        <div className='col-md-6 col-lg-4'>
                                            <DashboardIcon type='primary' link={`#${Object.keys(this.thongKeGroupBy[index - 1])[0]}`} icon={this.sumIcon[index]} title={title} value={data[Object.keys(data)[index]][0]?.numOfDangKy} />
                                        </div>
                                    </>);
                                }
                            })}

                        </div>
                    </div>

                    <div className='row'>
                        {this.thongKeGroupBy.map((item) => {
                            return this.renderChart(item);
                        })}
                    </div>

                </>
            ,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh',
        });
    }
}
const mapStateToProps = state => ({ system: state.system, sdhTsThongKe: state.sdh.sdhTsThongKe });
const mapActionsToProps = {
    getDataThongKe, getSdhTsProcessingDot
};
export default connect(mapStateToProps, mapActionsToProps)(Dashboard);