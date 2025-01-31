import React from 'react';
import { connect } from 'react-redux';
import HcthLichHopModal from './components/lichHopModal';
import HcthLichHopNgayModal from './components/lichHopNgay';
import { getLichHopRange } from './redux/congTac';
import BaseLichHop from './components/BaseLichHop';
import ChonPhongHopModal from './components/chonPhongHopModal';

const dateInWeek = ['THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY', 'CHỦ NHẬT'];
// const dateInWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const monthInYear = ['Thg.1', 'Thg.2', 'Thg.3', 'Thg.4', 'Thg.5', 'Thg.6', 'Thg.7', 'Thg.8', 'Thg.9', 'Thg.10', 'Thg.11', 'Thg. 12',];

class LichHopPage extends BaseLichHop {
    state = { month: 5, year: 2023, startAt: 0, endAt: 0, data: {} }

    componentDidMount() {
        const toDay = new Date();
        this.setState({ month: toDay.getMonth() + 1, year: toDay.getFullYear() }, this.calculateConfig);
    }

    calculateConfig = () => {
        const lastDay = new Date(this.state.year, this.state.month, 0);
        const firstDay = new Date(this.state.year, this.state.month - 1, 1);
        const startAt = 1 - ((firstDay.getDay() + 6) % 7);
        const endAt = lastDay.getDate() + (7 - lastDay.getDay()) % 7;
        this.setState({ startAt, endAt, lastDay, firstDay }, this.getRange);
    }

    getRange = () => {
        const startAt = new Date(this.state.year, this.state.month - 1, this.state.startAt).getTime();
        const endAt = new Date(this.state.year, this.state.month - 1, this.state.endAt, 23, 59, 59, 999).getTime();
        this.props.getLichHopRange({ startAt, endAt }, data => this.setState({ data }));
    }

    renderWeek = (week) => {
        return <tr key={week.toString()} style={{ textAlign: 'center', fontSize: '15px', height: '125px' }}>
            {week.map(i => this.renderDate(i))}
        </tr>;
    }

    renderDate = (_date) => {
        const date = new Date(this.state.year, this.state.month - 1, _date);
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        const items = this.state.data[key] || [];
        const toDay = new Date();
        const isToDay = new Date(toDay.getFullYear(), toDay.getMonth(), toDay.getDate()).getTime() == date.getTime();
        const isThisMonth = date.getMonth() + 1 == this.state.month;
        return <td key={_date} style={{ fontWeight: '1000' }} className={`text-bold date-item ${isToDay ? 'selected-date' : ''} ${isThisMonth ? '' : 'bg-light'}`}>
            <div className='d-flex flex-column gap-10' onClick={(e) => e.preventDefault() || (items.length > 0 && this.lichHopNgayModal.show({ items, date: _date, month: this.state.month, year: this.state.year }))}>
                <span className={`${isThisMonth ? '' : 'text-muted'}`}>{T.get2(date.getDate())}</span>
                {items.slice(0, 3).map(meeting => {
                    const className = 'badge badge-pill text-truncate m-1 text-left badge-' + (this.trangThaiXacNhanDict[meeting.trangThai]?.level || 'secondary');
                    return <span key={meeting.id} className={className}>{meeting.chuDe}</span>;
                })}
                {items.length > 3 ? <span>...</span> : null}
            </div>
        </td>;
    }

    updateMonth = (month) => {
        this.setState({ month }, this.calculateConfig);
    }

    updateYear = (year) => {
        this.setState({ year }, this.calculateConfig);
    }

    renderMonnth = () => {
        return <div className='d-flex justify-content-between text-muted' style={{ paddingBottom: 10 }}>
            {monthInYear.map((i, month) => <span key={month} onClick={() => this.updateMonth(month + 1)} className={`month-item ${month + 1 == this.state.month ? 'badge badge-pill badge-primary' : ''}`}>{i}</span>)}
        </div>;
    }


    getModals = () => {
        return { mainModal: this.modal, chonPhongModal: this.chonPhongModal };
    }


    render() {
        return this.renderPage({
            title: 'Lịch họp',
            icon: 'fa fa-calendar-check-o',
            content: <div>
                <div className='d-flex calendar-container' style={{ overflowX: 'auto', background: '#FFFFFF', borderRadius: '25px', border: 1, }}>

                    <div className='d-flex flex-column' style={{ flex: 2, padding: 30, minWidth: '900px' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <span style={{ fontSize: '30px', fontWeight: 'bold' }}>Lịch họp tháng {this.state.month} năm {this.state.year}</span>

                            <div className='d-flex justify-content-end align-items-center' style={{ gap: 10 }}>
                                <i className='fa fa-lg fa-chevron-left' onClick={() => { this.updateYear(this.state.year - 1); }} />
                                <span style={{ fontSize: '30px', fontWeight: 'bold' }}>{this.state.year}</span>
                                <i className='fa fa-lg fa-chevron-right' onClick={() => { this.updateYear(this.state.year + 1); }} />
                            </div>
                        </div>
                        {this.renderMonnth()}
                        <div className='month-container d-flex justify-content-center' style={{ width: '100%' }}>
                            <table style={{ width: '100%', tableLayout: 'fixed' }} className='table table-bordered'>
                                <thead>
                                    <tr className='text-bold' style={{ paddingTop: '30px', paddingBottom: '30px', whiteSpace: 'nowrap', fontSize: '20px', textAlign: 'center' }}>
                                        {dateInWeek.map(i => <th key={i} scope='col'>{i}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {T.arrayRange(this.state.startAt, this.state.endAt).chunk(7).map(week => this.renderWeek(week))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <ChonPhongHopModal ref={e => this.chonPhongModal = e} getPageModals={this.getModals} />
                <HcthLichHopModal history={this.props.history} ref={e => this.modal = e} getPageModals={this.getModals} />
                <HcthLichHopNgayModal history={this.props.history} ref={e => this.lichHopNgayModal = e} />
            </div>,
            onCreate: () => { this.modal.show(); }
        });
    }
}

const stateToProps = (state) => ({ system: state.system });
const actionToProps = { getLichHopRange };
export default connect(stateToProps, actionToProps)(LichHopPage);
