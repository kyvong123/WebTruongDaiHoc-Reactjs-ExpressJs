import React from 'react';
// import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import Calendar from 'view/component/Calendar';
import { connect } from 'react-redux';
import { getThoiKhoaBieu } from 'modules/mdSinhVien/svThoiKhoaBieu/redux';
import T from 'view/js/common';

class UserPage extends AdminPage {

    state = { data: [] }

    componentDidMount() {
        T.ready('/user/lich-hoc', () => {
            this.props.getThoiKhoaBieu({ lichHoc: 1 }, this.init);
        });
    }

    init = (data) => {
        let dataMonHoc = Object.keys(data.dataTuan || []).length ? data.dataTuan : [];
        dataMonHoc = dataMonHoc.map(item => ({
            title: `
                    ${T.parse(item.tenMonHoc, { vi: '' })?.vi} 
                    Phòng: ${item.phong || ''}
                    `,
            start: item.thoiGianBatDau,
            end: item.thoiGianKetThuc,
            dateStart: T.dateToText(item.ngayBatDau, 'yyyy-mm-dd'),
            dateEnd: T.dateToText(item.ngayKetThuc, 'yyyy-mm-dd'),
            thu: item.thu - 1,
            isRepeat: true,
            exceptDates: data.listNgayLe.filter(ngayLe => ngayLe.ngay > item.ngayBatDau && ngayLe.ngay <= item.ngayKetThuc && new Date(ngayLe.ngay).getDay() == item.thu - 1).map(item => T.dateToText(item.ngay, 'yyyy-mm-dd'))
        })) || [];

        let dataNgayLe = data.listNgayLe.map(item => ({
            title: item.moTa,
            start: T.dateToText(item.ngay, 'yyyy-mm-dd'),
            allDay: true
        }));
        this.setState({ data: [...dataMonHoc, ...dataNgayLe] });
    }

    render() {
        return this.renderPage({
            title: 'Lịch học',
            icon: 'fa fa-calendar',
            breadcrumb: ['Lịch học'],
            content: <div className='tile'>
                <Calendar data={this.state.data} isRepeat />
            </div>
        });
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getThoiKhoaBieu };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);