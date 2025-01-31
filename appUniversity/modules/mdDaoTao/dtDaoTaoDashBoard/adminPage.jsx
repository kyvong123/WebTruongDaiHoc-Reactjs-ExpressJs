import React from 'react';
import { connect } from 'react-redux';
import CountUp from 'view/js/countUp';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect } from 'view/component/AdminPage';
import { getDashboardData } from './redux';
import { AdminChart, DefaultColors } from 'view/component/Chart';
import { Tooltip } from '@mui/material';
const getListThoiGian = (thisDate, thisMonthIndex, thisYear) => {
    const listThoiGian = [
        { id: new Date(thisYear, thisMonthIndex - 1, thisDate).getTime(), text: 'Trong 1 tháng' },
        { id: new Date(thisYear, thisMonthIndex - 3, thisDate).getTime(), text: 'Trong 3 tháng' },
        { id: new Date(thisYear, thisMonthIndex - 6, thisDate).getTime(), text: 'Trong 6 tháng' },
        { id: new Date(thisYear, thisMonthIndex - 9, thisDate).getTime(), text: 'Trong 9 tháng' },
        { id: new Date(thisYear - 1, thisMonthIndex, thisDate).getTime(), text: 'Trong 1 năm' },
    ];
    return listThoiGian;
};
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
        return this.props.link ? <Link to={this.props.link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
    }
}
export class ChartArea extends React.Component {
    state = {}
    render() {
        let { className, title, chartType, data, aspectRatio = null, renderFilter = null } = this.props;
        return (
            <div className={className}>
                <div className='tile'>
                    <h5 className='tile-title' style={{ position: 'relative' }}>{title}</h5>
                    <span style={{ position: 'absolute', top: '20px', right: '20px' }}>
                        {!this.props.hideMinimize && <Tooltip title={this.state[title] ? 'Hiện' : 'Ẩn'} arrow>
                            <button className='btn btn-white' onClick={e => e.preventDefault() || this.setState({ [title]: !this.state[title] })} ><i className='fa fa-lg fa-minus' /></button>
                        </Tooltip>}
                    </span>
                    {renderFilter}
                    <div style={{ display: this.state[title] ? 'none' : 'block' }} >
                        <AdminChart type={chartType} data={data} aspectRatio={aspectRatio} />
                    </div>
                </div>
            </div>
        );
    }
}
class DashboardDt extends AdminPage {
    state = { filter: {}, filterhp: {}, sortTerm: 'thoiGianDangKy_DESC' }
    check = [];

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            const thisDate = new Date().getDate(),
                thisMonthIndex = new Date().getMonth(),
                thisYear = new Date().getFullYear();
            let ngayKetThuc = new Date().setHours(23, 59, 59, 0),
                ngayBatDau = new Date(thisYear, thisMonthIndex - 1, thisDate).getTime();
            this.giaiDoan.value(ngayBatDau);
            this.setState({
                filter: { ngayBatDau, ngayKetThuc }
            }, () => this.GetDashboard());
        });
    }

    GetDashboard = () => {
        let filter = this.state.filter;
        this.props.getDashboardData(filter, (data) => {
            let { dangKyTheoHe, dangKyTheoKhoaSv, countSvTheoKhoaSv, soLuotDangKyTong, thaoTacDangKy, soHocPhan } = data,
                soLuotThaoTacTong = 0, soSinhVienDangKy = 0;

            thaoTacDangKy.map(e => soLuotThaoTacTong = soLuotThaoTacTong + e.soLuong);
            dangKyTheoHe.map(e => soSinhVienDangKy = soSinhVienDangKy + e.soLuong);

            this.setState({
                dangKyTheoHe: this.setUp(dangKyTheoHe, 'loaiHinhDaoTao', DefaultColors.navy),
                soHocPhan: this.setUp(soHocPhan, 'namHocHocKy', DefaultColors.orange),
                soLuotDangKyTong,
                soLuotThaoTacTong,
                soSinhVienDangKy
            }, () => {
                this.setUpThaoTac(thaoTacDangKy);
                this.setUpTheoKhoa(countSvTheoKhoaSv, dangKyTheoKhoaSv);
            });
        });
    }

    setUp = (data = [], keyGroup, colors, mapper) => {
        let dataGroupBy = data.groupBy(keyGroup);
        delete dataGroupBy[null];
        return {
            labels: Object.keys(dataGroupBy).map(item => {
                if (mapper) return mapper[item] || 'Chưa xác định';
                else return item;
            }),
            datas: {
                'Số lượng': Object.values(dataGroupBy).map(item => {
                    return item[0].soLuong;
                })
            },
            colors: colors
        };
    }

    setUpTheoKhoa = (tongSinhVien, sinhVienDangKy) => {
        let listYear = sinhVienDangKy.map(e => e.khoaSinhVien);
        listYear = listYear.filter(e => e != null);

        let listDangKy = listYear.map(nam => {
            let itemDangKy = sinhVienDangKy.filter(item => item.khoaSinhVien == nam);
            if (itemDangKy.length) return itemDangKy[0].soLuong;
        });

        let listChuaDangKy = listYear.map(nam => {
            let itemTong = tongSinhVien.filter(item => item.khoaSinhVien == nam),
                itemDangKy = sinhVienDangKy.filter(item => item.khoaSinhVien == nam);

            if (itemTong.length && itemDangKy.length) {
                let tong = itemTong[0].soLuong,
                    dangKy = itemDangKy[0].soLuong,
                    length = tong - dangKy;
                return length;
            }
        });

        this.setState({
            dangKyTheoKhoaSv: {
                labels: listYear,
                datas: {
                    'Chưa đăng ký môn': listChuaDangKy,
                    'Đã đăng ký môn': listDangKy,
                },
                colors: {
                    'Chưa đăng ký môn': DefaultColors.red,
                    'Đã đăng ký môn': DefaultColors.yellow,
                }
            }
        });
    }

    setUpThaoTac = (thaoTacDangKy) => {
        let list = [''];

        let listDangKyMoi = list.map(() => {
            let item = thaoTacDangKy.filter(e => e.thaoTac == 'A');
            if (item.length) return item[0].soLuong;
            else return 0;
        });

        let listHuyDangKy = list.map(() => {
            let item = thaoTacDangKy.filter(e => e.thaoTac == 'D');
            if (item.length) return item[0].soLuong;
            else return 0;
        });

        let listChuyenHocPhan = list.map(() => {
            let item = thaoTacDangKy.filter(e => e.thaoTac == 'C');
            if (item.length) return item[0].soLuong;
            else return 0;
        });

        let listCapNhatMaLoai = list.map(() => {
            let item = thaoTacDangKy.filter(e => e.thaoTac == 'U');
            if (item.length) return item[0].soLuong;
            else return 0;
        });

        let listHoanTac = list.map(() => {
            let item = thaoTacDangKy.filter(e => e.thaoTac == 'H');
            if (item.length) return item[0].soLuong;
            else return 0;
        });

        this.setState({
            thaoTacDangKy: {
                labels: list,
                datas: {
                    'Đăng ký mới': listDangKyMoi,
                    'Hủy đăng ký': listHuyDangKy,
                    'Chuyển lớp': listChuyenHocPhan,
                    'Cập nhật mã loại đăng ký': listCapNhatMaLoai,
                    'Hoàn tác': listHoanTac,
                },
                colors: {
                    'Đăng ký mới': DefaultColors.green,
                    'Hủy đăng ký': DefaultColors.red,
                    'Chuyển lớp': DefaultColors.blue,
                    'Cập nhật mã loại đăng ký': DefaultColors.purple,
                    'Hoàn tác': DefaultColors.yellow,
                }
            }
        });
    }

    render() {
        const thisDate = new Date().getDate(),
            thisMonthIndex = new Date().getMonth(),
            thisYear = new Date().getFullYear();
        const { dangKyTheoHe = {}, thaoTacDangKy = {}, dangKyTheoKhoaSv = {}, soHocPhan = {},
            soLuotDangKyTong = 0, soLuotThaoTacTong = 0, soSinhVienDangKy = 0 } = this.state;

        return this.renderPage({
            title: 'Dashboard tổng',
            icon: 'fa fa-bar-chart',
            backRoute: '/user/dao-tao',
            header: <FormSelect ref={e => this.giaiDoan = e} placeholder='Giai đoạn' data={getListThoiGian(thisDate, thisMonthIndex, thisYear)}
                style={{ marginRight: '40', width: '300px', marginBottom: '0' }} allowClear
                onChange={value => this.setState({ filter: { ...this.state.filter, ngayBatDau: value.id } }, () => this.GetDashboard())}
            />,
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Dashboard'
            ],
            content:
                <>
                    <div className='row'>
                        <div className='col-md-6 col-lg-4'>
                            <DashboardIcon type='primary' icon='fa-users' title='Tổng số sinh viên đăng ký' value={soSinhVienDangKy} />
                        </div>
                        <div className='col-md-6 col-lg-4'>
                            <DashboardIcon type='primary' icon='fa-check-square-o' title='Tổng số lượt đăng ký' value={soLuotDangKyTong} />
                        </div>
                        <div className='col-md-6 col-lg-4'>
                            <DashboardIcon type='primary' icon='fa-history' title='Tổng số lượt thao tác' value={soLuotThaoTacTong} />
                        </div>

                        <ChartArea className='col-lg-3' title='Thao tác đăng ký' chartType='bar' data={thaoTacDangKy} aspectRatio={0.75} />
                        <ChartArea className='col-lg-3' title='Sinh viên đăng ký theo hệ' chartType='bar' data={dangKyTheoHe} aspectRatio={0.75} />
                        <ChartArea className='col-lg-6' title='Sinh viên đăng ký theo khóa' chartType='bar' data={dangKyTheoKhoaSv} aspectRatio={1.62} />
                        <ChartArea className='col-lg-12' title='Số học phần qua các học kỳ' chartType='line' data={soHocPhan} aspectRatio={3} />

                    </div>
                </>
            ,
            buttons: []
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDaoTaoDashBoard: state.daoTao.dtDaoTaoDashBoard });
const mapActionsToProps = {
    getDashboardData
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(DashboardDt);
