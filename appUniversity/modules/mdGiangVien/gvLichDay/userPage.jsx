import React from 'react';
import { AdminPage } from 'view/component/AdminPage';
import Calendar from 'view/component/Calendar';
import { connect } from 'react-redux';
import { getLichGiangDay } from './redux';
import { DefaultColors } from 'view/component/Chart';
import BaoNghiModal from 'modules/mdGiangVien/gvLichGiangDay/BaoNghiModal';
const DATE_UNIX = 24 * 60 * 60 * 1000;

class UserPage extends AdminPage {

    state = { data: [] }

    componentDidMount() {
        T.ready('/user/lich-day', () => {
            this.props.getLichGiangDay(this.init);
        });
    }

    init = (data) => {
        let dataMonHoc = Object.keys(data.items || []).length ? data.items : [];
        dataMonHoc = dataMonHoc.map(item => ({
            title: `
                    ${(item.isNghi == 1) ? '(GV báo nghỉ) ' : (item.isNgayLe) ? 'Nghỉ Lễ ' : ''}${T.parse(item.tenMonHoc, { vi: '' })?.vi} 
                    Phòng: ${item.phong || ''}
                    `,
            start: item.thoiGianBatDau,
            end: item.thoiGianKetThuc,
            dateStart: T.dateToText(item.ngayBatDau, 'yyyy-mm-dd'),
            dateEnd: T.dateToText(parseInt(item.ngayKetThuc) + DATE_UNIX * 7, 'yyyy-mm-dd'),
            thu: item.thu - 1,
            isRepeat: true,
            backgroundColor: (item.isNghi == 1 || item.isNgayLe == 1) ? DefaultColors.red : DefaultColors.blue,
            exceptDates: data.listNgayLe.filter(ngayLe => ngayLe.ngay > item.ngayBatDau && ngayLe.ngay <= item.ngayKetThuc && new Date(ngayLe.ngay).getDay() == item.thu - 1).map(item => T.dateToText(item.ngay, 'yyyy-mm-dd')),
            item,
        })) || [];
        let dataNgayLe = data.listNgayLe.map(item => ({
            title: item.moTa,
            start: T.dateToText(item.ngay, 'yyyy-mm-dd'),
            allDay: true
        }));
        this.setState({ data: [...dataMonHoc, ...dataNgayLe] });
    }

    render() {
        const isTest = this.props.system.user.isStaffTest || this.props.system.user.permissions.includes('quanLyDaoTao:Test');
        return this.renderPage({
            title: 'Lịch dạy',
            icon: 'fa fa-calendar',
            breadcrumb: ['Lịch dạy'],
            content: <div className='tile'>
                <BaoNghiModal ref={e => this.modal = e} baoNghi={() => this.props.getLichGiangDay(this.init)} />
                <Calendar data={this.state.data} isRepeat defaultView='agendaDay'
                    onEventClick={e => isTest && this.modal.show(e.data.item)} />
            </div>,
            backRoute: '/user/affair/',
        });
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getLichGiangDay };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);