import React from 'react';
import { connect } from 'react-redux';
import { DtThoiKhoaBieuTraCuuPhong } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, FormDatePicker, renderDataTable, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import './card.scss';
import { Tooltip } from '@mui/material';


class SearchScheduleRoom extends AdminPage {
    state = ({ listTime: [], results: [], isSearch: false })
    defaultSortTerm = 'ngayHoc_ASC'

    typeSearchList = [
        { id: 1, text: 'Theo từng tuần' },
        { id: 2, text: 'Theo ngày' },
        { id: 3, text: 'Theo nhiều tuần' },
    ]

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.showAdvanceSearch();
            const namHoc = new Date(Date.now()).getFullYear(),
                listWeek = Date.prototype.getListWeeksOfYear(parseInt(namHoc)),
                dataSelectWeek = listWeek.map(i => ({ id: i.weekNumber, text: `Tuần ${i.week}: ${T.dateToText(i.weekStart, 'dd/mm/yyyy')} - ${T.dateToText(i.weekEnd, 'dd/mm/yyyy')}` }));

            this.setState({ dataSelectWeek, listWeek });
        });
    }

    handleSearch = () => {
        const { listWeek } = this.state;
        const data = {
            typeSearch: this.typeSearch.value(),
            coSo: this.coSo.value(),
        };

        if (!data.typeSearch) return T.alert('Vui lòng chọn loại tra cứu!', 'error', false, 2000);
        if (!data.coSo) return T.alert('Vui lòng chọn cơ sở!', 'error', false, 2000);

        if (data.typeSearch == 1) {
            data.tuan = this.tuanHoc.value();
            if (!data.tuan) return T.alert('Vui lòng chọn tuần tra cứu!', 'error', false, 2000);

            let week = listWeek.find(i => i.weekNumber == data.tuan);
            data.ngayBatDau = week.weekStart;
            data.ngayKetThuc = week.weekEnd;
        } else if (data.typeSearch == 2) {
            data.fromTime = this.fromTime.value();
            data.toTime = this.toTime.value();
            if (!data.fromTime || !data.toTime) return T.alert('Vui lòng chọn khoảng thời gian tra cứu!', 'error', false, 2000);

            data.fromTime = new Date(data.fromTime).getTime();
            data.toTime = new Date(data.toTime).getTime();
            if (data.toTime < data.fromTime) return T.alert('Khoảng thời điểm không hợp lệ!', 'error', false, 2000);

            let thuCheck = new Date(data.fromTime).getDay() + 1;
            if (thuCheck == 1) thuCheck = 8;

            if ((data.toTime - data.fromTime) / (24 * 60 * 60 * 1000) >= 7) return T.alert('Chỉ được chọn khoảng 7 ngày!', 'error', false, 2000);
            data.numOfDays = (data.toTime - data.fromTime) / (24 * 60 * 60 * 1000) + 1;
            data.ngayBatDau = data.fromTime;
            data.ngayKetThuc = data.toTime;
        } else if (data.typeSearch == 3) {
            data.tuanHocFrom = this.tuanHocFrom.value();
            data.tuanHocEnd = this.tuanHocEnd.value();

            if (!data.tuanHocFrom || !data.tuanHocEnd) return T.alert('Vui lòng chọn khoảng thời gian tra cứu!', 'error', false, 2000);
            data.ngayBatDau = listWeek.find(i => i.weekNumber == data.tuanHocFrom).weekStart;
            data.ngayKetThuc = listWeek.find(i => i.weekNumber == data.tuanHocEnd).weekEnd;

            if (data.toTime < data.fromTime) return T.alert('Khoảng thời điểm không hợp lệ!', 'error', false, 2000);
        }

        T.alert('Đang xử lý', 'warning', false, null, true);
        this.props.DtThoiKhoaBieuTraCuuPhong(data, (items) => {
            this.setState({ ...items, isSearch: true }, () => T.alert('Xử lý thành công', 'success', true, 5000));
        });
    }

    displayContent = (it, idx) => {
        let clsName = it.isThi ? 'warning' : (it.isTKB ? 'badge-primary' : (it.isEvent ? 'badge-info' : 'badge-secondary'));
        return <span key={`S${idx}`} class={`badge ${clsName} d-flex flex-column text-left`} style={{ gap: 5 }}>
            <h6>{it.ten}</h6>
            {it.lop && <div>{it.lop}</div>}
            {it.gv && <div>{it.gv}</div>}
            {it.time && <div>{it.time}</div>}
        </span>;
    }

    tablePhong = (list) => renderDataTable({
        data: list,
        header: 'thead-light',
        stickyHead: list.length > 10,
        divStyle: { height: '65vh' },
        className: 'table-pin',
        customClassName: 'table-pin-wrapper',
        renderHead: () => {
            const { listTime } = this.state;
            return <>
                <tr>
                    <th className='sticky-col pin-1-col' rowSpan='2' style={{ minWidth: '150px', textAlign: 'center' }}>Phòng</th>
                    {listTime.map(i => <th colSpan={2} key={i.text} style={{ minWidth: '150px', textAlign: 'center' }}>{i.text}</th>)}
                </tr>
                <tr>
                    {Array.from({ length: listTime.length * 2 }, (_, i) => <th key={i} style={{ minWidth: '150px', textAlign: 'center' }}>{i % 2 == 0 ? 'Sáng' : 'Chiều'}</th>)}
                </tr>
            </>;
        },
        renderRow: (item, index) => {
            const { dataPhong, dataTime } = item;
            return <tr key={index}>
                <TableCell className='sticky-col pin-1-col' style={{ textAlign: 'center' }} content={<>
                    <div>{dataPhong.ten}</div>
                    <div>SC: {dataPhong.sucChua}</div>
                </>} />
                {dataTime.map(i => {
                    const itemsSang = i.items.filter(i => parseInt(i.timeStart) < 12),
                        itemsChieu = i.items.filter(i => parseInt(i.timeStart) >= 12);
                    return <>
                        <TableCell content={itemsSang.length ? <div className='d-flex flex-column' style={{ gap: 5 }}> {itemsSang.map((it, idx) => this.displayContent(it, idx))} </div> : ''} />
                        <TableCell content={itemsChieu.length ? <div className='d-flex flex-column' style={{ gap: 5 }}>{itemsChieu.map((it, idx) => this.displayContent(it, idx))}</div> : ''} />
                    </>;
                })}
            </tr>;
        }
    });

    render() {
        const { typeSearch, isSearch } = this.state;

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Lịch phòng',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao/thoi-khoa-bieu'>Thời khóa biểu</Link>,
                'Lịch phòng'
            ],
            header: <>
                <Tooltip title='Tìm kiếm' arrow>
                    <button className='btn btn-info ' onClick={this.handleSearch}>
                        <i className='fa fa-filter'></i>
                    </button>
                </Tooltip>
            </>,
            advanceSearchTitle: '',
            advanceSearch: <div className='row'>
                <FormSelect className='col-md-2' ref={e => this.coSo = e} label='Cơ sở' data={SelectAdapter_DmCoSo} required />
                <FormSelect ref={e => this.typeSearch = e} className='col-md-2' label='Loại tra cứu' data={this.typeSearchList} onChange={e => this.setState({ typeSearch: e.id })} required />
                <FormSelect ref={e => this.tuanHoc = e} style={{ display: typeSearch == 1 ? '' : 'none' }} className='col-md-4' label='Tuần học' data={this.state.dataSelectWeek} required />
                <FormDatePicker type='date' ref={e => this.fromTime = e} style={{ display: typeSearch == 2 ? '' : 'none' }} label='Từ thời điểm' className='col-md-4' required />
                <FormDatePicker type='date' ref={e => this.toTime = e} style={{ display: typeSearch == 2 ? '' : 'none' }} label='Đến thời điểm' className='col-md-4' required />
                <FormSelect ref={e => this.tuanHocFrom = e} style={{ display: typeSearch == 3 ? '' : 'none' }} className='col-md-4' label='Từ tuần' data={this.state.dataSelectWeek} required />
                <FormSelect ref={e => this.tuanHocEnd = e} style={{ display: typeSearch == 3 ? '' : 'none' }} className='col-md-4' label='Đến tuần' data={this.state.dataSelectWeek} required />
            </div>,
            content: <div className='tile' style={{ display: isSearch ? '' : 'none' }}>
                {this.tablePhong(this.state.results)}
            </div>,
        });
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { DtThoiKhoaBieuTraCuuPhong };
export default connect(mapStateToProps, mapActionsToProps)(SearchScheduleRoom);