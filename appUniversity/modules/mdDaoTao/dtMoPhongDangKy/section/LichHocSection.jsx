import React from 'react';
import T from 'view/js/common';
import { connect } from 'react-redux';
import Calendar from 'view/component/Calendar';
import { AdminPage } from 'view/component/AdminPage';
import { getThoiKhoaBieu } from 'modules/mdDaoTao/dtMoPhongDangKy/redux';
export class LichHocSection extends AdminPage {
    state = { data: [] }

    setValue = (mssv) => {
        getThoiKhoaBieu(mssv, { lichHoc: 1 }, data => this.init(data));
    }

    init = (data) => {
        let dataMonHoc = (data.dataTuan || []).map(item => ({
            title: `
                    ${T.parse(item.tenMonHoc, { vi: '' })?.vi} 
                    Phòng: ${item.phong}
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
        return (
            <div className='tile'>
                <Calendar data={this.state.data} isRepeat />
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(LichHocSection);
