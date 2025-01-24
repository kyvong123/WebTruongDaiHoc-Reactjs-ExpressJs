import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, FormDatePicker, FormSelect, FormRichTextBox, renderDataTable, TableHead, TableCell } from 'view/component/AdminPage';
import { dtLichEventGetData, deleteDtLichEventItem } from './redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { SelectAdapter_DmCaHoc } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { SelectAdapter_DtDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtLopFilter } from '../dtLop/redux';
import EditModal from './editModal';
import AddModal from './addModal';


class DetailPage extends AdminPage {
    state = { baseEvent: [], dataLich: [] }

    ngayTrongTuan = [
        { id: 'Mon', text: 'Thứ hai' },
        { id: 'Tue', text: 'Thứ ba' },
        { id: 'Wed', text: 'Thứ tư' },
        { id: 'Thu', text: 'Thứ năm' },
        { id: 'Fri', text: 'Thứ sáu' },
        { id: 'Sat', text: 'Thứ bảy' },
        { id: 'Sun', text: 'Chủ nhật' },
    ]

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            const route = T.routeMatcher('/user/dao-tao/lich-event/item/:id'),
                id = route.parse(window.location.pathname).id;
            this.setState({ idEvent: id }, () => this.getData(id));
        });
    }

    getData = (id) => {
        this.props.dtLichEventGetData(id, data => this.setState({ ...data }, () => {
            let { baseEvent } = data,
                { ten, coSo, phong, ngayBatDau, ghiChu, khoa, lop, tietBatDau, soTiet, giangVien, soTuanLap } = baseEvent[0];

            this.setState({ coSo }, () => {
                this.ten.value(ten);
                this.coSo.value(coSo);
                this.ngayBatDau.value(ngayBatDau);
                this.thu.value((new Date(Number(ngayBatDau))).toDateString().slice(0, 3));
                this.tietBatDau.value(tietBatDau);
                this.soTiet.value(soTiet);
                this.soTuanLap.value(soTuanLap);
                this.phong.value(phong);
                this.khoa.value(khoa);
                this.lop.value(lop ? lop.split(', ') : '');
                this.giangVien.value(giangVien);
                this.ghiChu.value(ghiChu);
            });
        }));
    }

    componentInfo = () => {
        return <div className='tile'>
            <div className='row'>
                <FormTextBox ref={e => this.ten = e} className='col-md-12' label='Tên sự kiện' required disabled />
                <FormSelect ref={e => this.coSo = e} className='col-md-3' label='Cơ sở' data={SelectAdapter_DmCoSo} required disabled />
                <FormDatePicker ref={e => this.ngayBatDau = e} className='col-md-3' label='Ngày bắt đầu' type='date' required disabled />
                <FormSelect ref={e => this.thu = e} className='col-md-3' label='Thứ' data={this.ngayTrongTuan} disabled />
                <FormTextBox ref={e => this.phong = e} className='col-md-3' label='Phòng' required disabled />
                <FormSelect ref={e => this.tietBatDau = e} className='col-md-2' label='Tiết bắt đầu' data={SelectAdapter_DmCaHoc(this.state.coSo)} required disabled />
                <FormTextBox type='number' ref={e => this.soTiet = e} className='col-md-2' label='Số tiết' min={1} max={10} required disabled />
                <FormTextBox type='number' ref={e => this.soTuanLap = e} className='col-md-2' label='Số tuần lặp' placeholder='Từ 1 đến 10' required disabled />
                <FormSelect ref={e => (this.khoa = e)} className='col-md-2' label='Khoa' data={SelectAdapter_DtDmDonVi()} allowClear disabled />
                <FormSelect ref={e => (this.lop = e)} className='col-md-4' label='Lớp' data={SelectAdapter_DtLopFilter()} multiple allowClear disabled />
                <FormRichTextBox ref={e => this.giangVien = e} className='col-md-4' label='Cán bộ' readOnly />
                <FormRichTextBox ref={e => this.ghiChu = e} className='col-md-8' label='Ghi chú' readOnly />
            </div>
        </div>;
    }

    delete = (id) => {
        T.confirm('Cảnh báo', 'Bạn có chắc muốn hủy sự kiện không?', true, isConfirm => {
            if (isConfirm) this.props.deleteDtLichEventItem(id, () => this.getData(this.state.idEvent));
        });
    }

    componentDetail = () => {
        const { dataLich } = this.state;
        return <div className='tile'>
            {renderDataTable({
                emptyTable: 'Chưa có dữ liệu sự kiện',
                data: dataLich,
                header: 'thead-light',
                stickyHead: dataLich && dataLich.length > 9,
                divStyle: { height: '70vh' },
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Cơ sở' keyCol='coSo' />
                        <TableHead style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Phòng' keyCol='phong' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thứ' keyCol='phong' />
                        <TableHead style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thời gian bắt đầu' keyCol='thoiGianBatDau' />
                        <TableHead style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thời gian kết thúc' keyCol='thoiGianKetThuc' />
                        <TableHead style={{ width: '60%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ghi chú' keyCol='ghiChu' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thao tác' keyCol='thaoTac' />
                    </tr>),
                renderRow: (item, index) => {
                    let thu = this.ngayTrongTuan.find(i => i.id == (new Date(Number(item.thoiGianBatDau))).toDateString().slice(0, 3)).text;
                    return (
                        <tr key={index}>
                            <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={T.parse(item.tenCoSo, { vi: '' })?.vi} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.phong} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={thu} />
                            <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM:ss' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.thoiGianBatDau} />
                            <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM:ss' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.thoiGianKetThuc} />
                            <TableCell content={item.ghiChu} />
                            <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={{ delete: true, write: true }}
                                onEdit={(e) => e.preventDefault() || this.editModal.show(item)}
                                onDelete={(e) => e.preventDefault() || this.delete(item.id)}
                            />
                        </tr >
                    );
                }
            })}
        </div>;
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-microphone',
            title: 'Chi tiết sự kiện',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/lich-event'>Quản lý sự kiện</Link>,
                'Chi tiết sự kiện'
            ],
            content: <>
                {this.componentInfo()}
                {this.componentDetail()}
                <EditModal ref={e => this.editModal = e} handleUpdate={() => this.getData(this.state.idEvent)} />
                <AddModal ref={e => this.addModal = e} handleUpdate={() => this.getData(this.state.idEvent)} />
            </>,
            backRoute: '/user/dao-tao/lich-event',
            onCreate: e => e && e.preventDefault() || this.addModal.show({ baseEvent: this.state.baseEvent })
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtLichEvent: state.daoTao.dtLichEvent });
const mapActionsToProps = { dtLichEventGetData, deleteDtLichEventItem };
export default connect(mapStateToProps, mapActionsToProps)(DetailPage);
