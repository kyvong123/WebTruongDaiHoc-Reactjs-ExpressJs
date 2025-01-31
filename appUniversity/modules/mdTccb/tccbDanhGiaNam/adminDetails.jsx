import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import ComponentDiemThuong from '../tccbDanhGiaDiemThuong/componentDiemThuong';
import ComponentDiemTru from '../tccbDanhGiaDiemTru/componentDiemTru';
import ComponentDGCB from './componentDGCB';
import ComponentDGDV from './componentDGDV';
import ComponentTLD from '../tccbDanhGiaTyLeDiem/componentTLD';
import ComponentDMCV from '../tccbDanhGiaDinhMucCongViecGvVaNcv/componentDMCV';
import ComponentHDDonVi from '../tccbDanhGiaHoiDongCapDonVi/componentHDDonVi';
import ComponentHDTruong from '../tccbDanhGiaHoiDongCapTruong/componentHDTruong';
import ComponentFormChuyenVien from 'modules/mdTccb/tccbDanhGiaFormChuyenVienParent/componentFormChuyenVien';
import { getTccbDanhGiaNamAll } from './redux';

class TccbKhungDanhGiaCanBoDetails extends AdminPage {
    state = { nam: '', haveData: false }

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/danh-gia/:nam');
            let nam = parseInt(route.parse(window.location.pathname)?.nam);
            this.props.getTccbDanhGiaNamAll({ nam }, (items) => {
                this.setState({ nam, haveData: items.length > 0 });
            });
        });
    }

    render() {
        const nam = this.state?.nam || '';
        const listComponent = nam && this.state.haveData ? [
            {
                title: 'Mức đánh giá cán bộ',
                component: <ComponentDGCB nam={nam} />
            },
            {
                title: 'Điểm thưởng',
                component: <ComponentDiemThuong nam={nam} />
            },
            {
                title: 'Điểm trừ',
                component: <ComponentDiemTru nam={nam} />
            },
            {
                title: 'Tỷ lệ điểm',
                component: <ComponentTLD nam={nam} />
            },
            {
                title: 'Định mức công việc cho giảng viên và nghiên cứu viên',
                component: <ComponentDMCV nam={nam} />
            },
            {
                title: 'Khung đánh giá đơn vị',
                component: <ComponentDGDV nam={nam} />
            },
            {
                title: 'Hội đồng đánh giá cấp đơn vị',
                component: <ComponentHDDonVi nam={nam} />
            },
            {
                title: 'Hội đồng đánh giá cấp trường',
                component: <ComponentHDTruong nam={nam} />
            },
            {
                title: 'Form chuyên viên',
                component: <ComponentFormChuyenVien nam={nam} />
            }
        ] : [];
        return this.renderPage({
            icon: 'fa fa-university',
            title: `Đánh giá năm: ${nam}`,
            breadcrumb: [
                <Link key={0} to='/user/tccb/danh-gia'>Đánh giá</Link>,
                'Thông tin đánh giá năm'
            ],
            content: <>
                {this.state.haveData ? <div>
                        {listComponent.map((item, index) => (<div id={`accordion-${index}`} key={`accordion-${index}`} className='mt-2'>
                            <div className='card'>
                                <div className='card-header' id={`heading-${index}`}>
                                    <h5 className='mb-0'>
                                        <button className='btn btn-link collapsed' data-toggle='collapse' data-target={`#collapseOne-${index}`} aria-expanded='true' aria-controls={`collapseOne-${index}`}>
                                            {item.title}
                                        </button>
                                    </h5>
                                </div>
                                <div id={`collapseOne-${index}`} className='collapse' aria-labelledby={`heading-${index}`} data-parent={`#accordion-${index}`}>
                                    <div className='card-body'>
                                        {item.component}
                                    </div>
                                </div>
                            </div>
                        </div>))}
                    </div>
                    : <div className='tile'><b>Không có dữ liệu đánh giá</b></div>
                }
            </>,
            backRoute: '/user/tccb/danh-gia'
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbDanhGiaNam: state.tccb.tccbDanhGiaNam });
const mapActionsToProps = { getTccbDanhGiaNamAll };
export default connect(mapStateToProps, mapActionsToProps)(TccbKhungDanhGiaCanBoDetails);