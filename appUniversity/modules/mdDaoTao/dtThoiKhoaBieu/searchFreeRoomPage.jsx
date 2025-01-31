import React from 'react';
import { connect } from 'react-redux';
import { dtTKBTraCuuPhongTrong, } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormSelect, TableCell, renderDataTable, renderTable, FormDatePicker, FormTabs, TableHead, getValue, FormTextBox } from 'view/component/AdminPage';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { SelectAdapter_DmCaHoc, getDmCaHocAllCondition } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { SelectAdapter_DtDmThu } from '../dtDmThu/redux';
import { SelectAdapter_DmPhongAll } from 'modules/mdDanhMuc/dmPhong/redux';
import { Tooltip } from '@mui/material';


const timeLine = ['5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

class ChiTietModal extends AdminModal {
    state = { data: [] }

    onShow = (item) => {
        const { dataTkbHienTai, dataThiHienTai, dataEventHienTai } = item || { dataTkbHienTai: [], dataThiHienTai: [], dataEventHienTai: [] };
        this.setState({ data: [...dataTkbHienTai, ...dataThiHienTai, ...dataEventHienTai].sort((a, b) => a.batDau - b.batDau) });
    };

    table = (list) => renderDataTable({
        emptyTable: 'Không có dữ liệu',
        data: list,
        stickyHead: list.length > 15,
        header: 'thead-light',
        divStyle: { height: '60vh' },
        renderHead: () => (
            <tr>
                <th style={{ widht: 'auto', whiteSpace: 'nowrap' }}>#</th>
                <TableHead style={{ width: '30%', whiteSpace: 'nowrap' }} content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearch} />
                <TableHead style={{ width: '70%', whiteSpace: 'nowrap' }} content='Tên môn học' keyCol='tenMon' onKeySearch={this.handleKeySearch} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Ngày học' keyCol='ngayHoc' onKeySearch={this.handleKeySearch} typeSearch='date' />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Thứ' keyCol='thu' onKeySearch={this.handleKeySearch} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Thời gian' keyCol='time' onKeySearch={this.handleKeySearch} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Phòng' keyCol='phong' onKeySearch={this.handleKeySearch} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Cơ sở' keyCol='coSo' onKeySearch={this.handleKeySearch} />
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú</th>
            </tr>
        ),
        renderRow: (item, index) => {
            let thu = '', tiet = '', ghiChu = '', ngay = '';
            if (item.isThi) {
                thu = new Date(item.batDau).getDay() + 1;
                tiet = `${T.dateToText(item.batDau, 'HH:MM')} - ${T.dateToText(item.ketThuc, 'HH:MM')}`;
                ngay = T.dateToText(item.batDau, 'dd/mm/yyyy');
                ghiChu = 'Lịch thi';
            }
            if (item.isTKB) {
                thu = item.thu;
                tiet = `${item.thoiGianBatDau} - ${item.thoiGianKetThuc}`;
                ngay = T.dateToText(item.ngayHoc, 'dd/mm/yyyy');
                ghiChu = 'Lịch dạy';
            }
            if (item.isEvent) {
                thu = new Date(item.batDau).getDay() + 1;
                tiet = `${T.dateToText(item.batDau, 'HH:MM')} - ${T.dateToText(item.ketThuc, 'HH:MM')}`;
                ngay = T.dateToText(item.batDau, 'dd/mm/yyyy');
                ghiChu = 'Sự kiện';
            }
            if (thu == 8) thu = 'CN';

            return (
                <tr key={index} style={{ backgroundColor: '#ffffff' }}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.isEvent ? '' : item.maHocPhan} />
                    <TableCell content={item.isEvent ? item.ten : T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                    <TableCell content={ngay} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={thu} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={tiet} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                    <TableCell content={item.coSo} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={ghiChu} />
                </tr>
            );
        }
    });

    render = () => {
        return this.renderModal({
            title: 'Chi tiết lịch phòng',
            size: 'large',
            body: <div>
                {this.table(this.state.data)}
            </div>
        });
    }
}

class SearchFreeRoom extends AdminPage {
    state = ({ dataRoom: {}, listTietHoc: [], loaiHinh: '', filter: {}, dataRet: [], caHoc: [], isLoading: false })

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            this.showAdvanceSearch();
            T.showSearchBox(() => {
                this.showAdvanceSearch();
            });
        });
    }

    getListRoom = (filter) => {
        T.alert('Đang xử lý', 'warning', false, null, true);
        this.props.dtTKBTraCuuPhongTrong(filter, result => {
            this.setState({ dataRet: result.dataRet, isSearchPhong: result.isSearchPhong }, () => {
                T.alert('Xử lý thành công', 'success', true, 5000);
            });
        });
    }

    getlistTietHoc = (maCoSo) => {
        getDmCaHocAllCondition(maCoSo, items => {
            let caHoc = items.map(item => parseInt(item.ten));
            caHoc.sort(function (a, b) { return a - b; });
            this.setState({ listTietHoc: caHoc });
        });
    }

    render() {
        let { coSo } = this.state.filter, { dataRet, isSearchPhong } = this.state;

        const table = (list, index) => renderDataTable({
            emptyTable: 'Không có dữ liệu phòng trống',
            data: list, stickyHead: true,
            header: 'thead-light',
            divStyle: { height: '70vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>#</th>
                    <TableHead style={{ width: '50%', textAlign: 'right', whiteSpace: 'nowrap' }} content='Phòng' keyCol='phong' onKeySearch={data => {
                        let dataCurrent = this.state.dataRet[index];
                        let listPhong = dataCurrent.listFull.filter(item => item.ten.toLowerCase().includes(data.split(':')[1].toLowerCase()));
                        dataCurrent.listPhong = listPhong;
                        this.setState({ dataRet: [...this.state.dataRet] });
                    }} />
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Sức chứa</th>
                </tr>
            ),
            renderRow: (item, index) => {
                return (
                    <tr key={index} style={{ backgroundColor: 'white' }}>
                        <TableCell style={{ textAlign: 'right', }} content={index + 1} />
                        <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={item.ten} />
                        <TableCell style={{ textAlign: 'right' }} content={item.sucChua} />
                    </tr>
                );
            }
        });

        const renderFull = () => {
            let tabs = [];
            this.state.dataRet.map((item, index) => {
                tabs.push({
                    title: `Thứ ${(item.thu == 8) ? 'Chủ nhật' : item.thu}`,
                    component: <>{table(item.listPhong, index)}</>,
                });
            });
            return <FormTabs tabs={tabs} />;
        };

        const renderPhong = (list) => renderTable({
            emptyTable: 'Không có dữ liệu phòng trống',
            getDataSource: () => list, stickyHead: true,
            header: 'thead-light',
            divStyle: { height: '70vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', border: '1px solid #d0d3d6' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', border: '1px solid #d0d3d6' }}>Ngày</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', border: '1px solid #d0d3d6' }}>Thứ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', border: '1px solid #d0d3d6' }}>Chi tiết</th>
                    {timeLine.map((item, index) => (<th key={index} style={{ minWidth: '75px', textAlign: 'center', border: '1px solid #d0d3d6' }}>{item}</th>))}
                </tr>
            ),
            renderRow: (item, index) => {
                return (
                    <tr key={index} style={{ backgroundColor: 'white' }}>
                        <TableCell content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.ngay, 'dd/mm/yyyy')} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={(item.thu == 8) ? 'Chủ nhật' : item.thu} />
                        <TableCell type='buttons' content={item} onEdit={() => this.chiTiet.show(item)} />
                        {timeLine.map((time, index) => {
                            return <TableCell key={`tiet-${index}`} style={{ backgroundColor: item.dataTime.includes(parseInt(time)) ? '#dd8484' : '' }} colSpan={1} content={''} />;
                        })}
                    </tr>
                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Tra cứu dữ liệu',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao/thoi-khoa-bieu'>Thời khóa biểu</Link>,
                'Tra cứu dữ liệu'
            ],
            advanceSearchTitle: '',
            advanceSearch: <div className='row'>
                <FormSelect className='col-md-1' ref={e => this.maCoSo = e} label='Cơ sở' data={SelectAdapter_DmCoSo} required onChange={(value) => {
                    this.setState({ filter: { ...this.state.filter, coSo: value.id } });
                    this.tietBatDau.value('');
                    this.phong.value('');
                }} />
                <FormDatePicker type='date' ref={e => this.fromTime = e} label='Từ thời điểm' className='col-md-2' required />
                <FormDatePicker type='date' ref={e => this.toTime = e} label='Đến thời điểm' className='col-md-2' required />
                <FormSelect className='col-md-1' ref={e => this.thu = e} label='Thứ' data={SelectAdapter_DtDmThu} allowClear />
                <FormSelect ref={e => this.tietBatDau = e} className='col-md-2' label='Tiết bắt đầu' data={SelectAdapter_DmCaHoc(coSo)} minimumResultsForSearch={-1} allowClear />
                <FormTextBox type='number' ref={e => this.soTiet = e} className='col-md-1' label='Số tiết' />
                <FormSelect className='col-md-2' ref={e => this.phong = e} label='Phòng' data={SelectAdapter_DmPhongAll(coSo)} allowClear onChange={(value) => {
                    this.setState({ filter: { ...this.state.filter, phong: value ? value.id : value } });
                }} />
                <div className='col-md-1' style={{ margin: 'auto' }}>
                    <Tooltip title='Tìm kiếm'>
                        <button className='btn btn-success' type='button' onClick={() => {
                            if (!this.maCoSo.value()) {
                                T.notify('Vui lòng nhập cơ sở!', 'danger');
                            } else if (!this.fromTime.value()) {
                                T.notify('Vui lòng nhập thời điểm bắt đầu!', 'danger');
                            } else if (!this.toTime.value()) {
                                T.notify('Vui lòng nhập thời điểm kết thúc!', 'danger');
                            } else {
                                let filter = {
                                    coSo: getValue(this.maCoSo),
                                    ngayBatDau: getValue(this.fromTime).setHours(0, 0, 0, 0),
                                    ngayKetThuc: getValue(this.toTime).setHours(0, 0, 0, 0),
                                    thu: getValue(this.thu),
                                    phong: getValue(this.phong),
                                    tietBatDau: getValue(this.tietBatDau),
                                    soTiet: getValue(this.soTiet),
                                };
                                this.getListRoom(filter);
                            }
                        }}>
                            <i className='fa fa-fw fa-lg fa-search' />
                        </button>
                    </Tooltip>
                </div>
            </div>,
            content: <>
                <ChiTietModal ref={e => this.chiTiet = e} />
                <div className='tile' style={{ display: dataRet.length ? '' : 'none' }}>
                    {
                        !isSearchPhong ? renderFull() : renderPhong(dataRet)
                    }
                </div>
            </>,
            backRoute: '/user/dao-tao/thoi-khoa-bieu/tra-cuu-in',
        });
    }
}


const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = { dtTKBTraCuuPhongTrong, };
export default connect(mapStateToProps, mapActionsToProps)(SearchFreeRoom);