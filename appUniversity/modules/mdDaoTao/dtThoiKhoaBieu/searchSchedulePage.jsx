import React from 'react';
import { connect } from 'react-redux';
import { dtTKBTraCuuSchedule, DtTKBCustomDeleteTuan, DtThoiKhoaBieuTreSomCreate } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, TableCell, renderDataTable, FormDatePicker, getValue, TableHead, FormCheckbox, AdminModal, FormRichTextBox } from 'view/component/AdminPage';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import './card.scss';
import { Tooltip } from '@mui/material';
import BaoNghiModal from './modal/BaoNghiModal';
import BaoNghiMultiModal from './modal/BaoNghiMultiModal';


class TreSomModal extends AdminModal {

    onShow = (item) => {
        this.setState({ item, isWait: null });
    }

    onSubmit = () => {
        let { item } = this.state,
            { idTuan } = item;

        const isLate = Number(this.isLate.value()),
            isSoon = Number(this.isSoon.value()),
            ghiChu = this.ghiChu.value();

        if (!isLate && !isSoon)

            this.setState({ isWait: 1 });
        this.props.DtThoiKhoaBieuTreSomCreate({
            idTuan, isLate, isSoon, ghiChu,
        }, () => {
            this.props.refreshData();
            this.ghiChu.value('');
            this.hide();
        });
    }

    render = () => {
        let { isWait } = this.state;

        return this.renderModal({
            title: 'Ghi chú thêm',
            isShowSubmit: false,
            body: <div className='row'>
                <FormCheckbox ref={e => this.isLate = e} className='col-md-6' label='Đi trễ' value={false} onChange={e => e && this.isSoon.value() && this.isSoon.value(false)} />
                <FormCheckbox ref={e => this.isSoon = e} className='col-md-6' label='Về sớm' value={false} onChange={e => e && this.isLate.value() && this.isLate.value(false)} />
                <FormRichTextBox ref={e => this.ghiChu = e} type='text' className='col-md-12' label={'Ghi chú'} />
            </div>,
            postButtons: <button type='submit' className='btn btn-info' disabled={isWait}>
                <i className={isWait ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-fw fa-lg fa-save'} /> Ghi chú
            </button>
        });
    }
}

class SearchScheduleRoom extends AdminPage {
    state = ({ dataTKB: [], dataThi: [], dataEvent: [], dataSearch: [], isSearch: false })
    defaultSortTerm = 'ngayHoc_ASC'

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            this.showAdvanceSearch();
            T.showSearchBox(() => {
                this.showAdvanceSearch();
            });
        });
    }

    getSchedule = (filter, done) => {
        this.props.dtTKBTraCuuSchedule({ ...filter, sort: this.state.sortTerm || this.defaultSortTerm }, result => {
            const { dataTKB, dataThi, dataEvent } = result,
                { ks_type } = filter;
            let dataSearch = [];

            if (ks_type && ['Lịch thi', 'Lịch dạy', 'Sự kiện'].includes(ks_type)) {
                switch (ks_type) {
                    case 'Lịch thi':
                        dataSearch = [...dataThi];
                        break;
                    case 'Lịch dạy':
                        dataSearch = [...dataTKB];
                        break;
                    case 'Sự kiện':
                        dataSearch = [...dataEvent];
                        break;
                }
            } else {
                dataSearch = [...dataTKB, ...dataThi, ...dataEvent];
            }
            this.setState({ ...result, dataSearch, isSearch: true }, () => {
                done && done();
            });
        });
    }

    handleDeleteTuan = (item) => {
        let { idTuan, idThoiKhoaBieu, ngayBatDau, ngayKetThuc, maHocPhan } = item;
        T.confirm('Cảnh báo', `Bạn có chắc chắn muốn xóa buổi học của học phần ${maHocPhan} không?`, 'warning', true, isConfirm => {
            if (isConfirm) {
                this.props.DtTKBCustomDeleteTuan({ idTuan, idThoiKhoaBieu, ngayBatDau, ngayKetThuc, maHocPhan }, () => {
                    this.getSchedule(this.state.filter);
                });
            }
        });
    }

    handleKeySearch = (data) => {
        let { filter } = this.state;
        this.setState({ filter: { ...filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            let { ks_type } = this.state.filter;
            if (ks_type && ['Lịch thi', 'Lịch dạy', 'Sự kiện'].includes(ks_type)) {
                switch (ks_type) {
                    case 'Lịch thi':
                        this.setState({ dataSearch: this.state.dataThi });
                        break;
                    case 'Lịch dạy':
                        this.setState({ dataSearch: this.state.dataTKB });
                        break;
                    case 'Sự kiện':
                        this.setState({ dataSearch: this.state.dataEvent });
                        break;
                }
            } else {
                this.getSchedule(this.state.filter);
            }
        });
    }

    onSort = (sortTerm) => {
        this.setState({ sortTerm }, () => this.getSchedule(this.state.filter));
    }

    handleCheck = (item, list) => {
        item.isCheck = !item.isCheck;
        this.setState({ dataTKB: list.filter(i => i.isTKB) }, () => {
            this.checkAll.value(list.filter(i => i.isTKB).every(i => i.isCheck));
        });
    }

    handleBaoNghi = () => {
        const { dataTKB } = this.state,
            listChosen = dataTKB.filter(i => i.isTKB && i.isCheck);

        if (!listChosen.length) {
            T.alert('Chưa có lịch học được chọn!', 'error', null, 1000);
        } else {
            this.baoNghiMulti.show({ listChosen });
        }
    }

    tableTKB = (list) => renderDataTable({
        emptyTable: 'Không có dữ liệu',
        data: list,
        stickyHead: list.length > 15,
        className: 'dataTable',
        header: 'thead-light',
        divStyle: { height: '60vh' },
        renderHead: () => (
            <tr>
                <th style={{ widht: 'auto', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', display: Number(this.props.system.user?.isPhongDaoTao) ? '' : 'none' }}>
                    <FormCheckbox ref={e => this.checkAll = e} onChange={(value) => {
                        this.setState({ dataTKB: list.filter(i => i.isTKB).map(i => ({ ...i, isCheck: value })) });
                    }} />
                </th>
                <TableHead style={{ width: '30%', whiteSpace: 'nowrap' }} content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: '70%', minWidth: '200px', maxWidth: '200px', whiteSpace: 'nowrap' }} content='Tên môn học' keyCol='tenMon' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Lớp' keyCol='lop' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Ngày học' keyCol='ngayHoc' onKeySearch={this.handleKeySearch} typeSearch='date' onSort={this.onSort} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Thứ' keyCol='thu' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Thời gian' keyCol='time' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Phòng' keyCol='phong' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Cơ sở' keyCol='tenCoSo' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Khoa' keyCol='khoa' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Giảng viên' keyCol='giangVien' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Trợ giảng' keyCol='troGiang' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Tính chất' keyCol='type' onKeySearch={this.handleKeySearch} />
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>
        ),
        renderRow: (item, index) => {
            let thu = '', tiet = '', ghiChu = '', ngay = '';
            if (item.isThi) {
                thu = new Date(item.batDau).getDay() + 1;
                tiet = `${T.dateToText(item.batDau, 'HH:MM')} - ${T.dateToText(item.ketThuc, 'HH:MM')}`;
                ngay = `${T.dateToText(item.batDau, 'dd/mm/yyyy')}`;
                ghiChu = 'Lịch thi';
            }
            if (item.isTKB) {
                thu = item.thu;
                tiet = `${item.tietBatDau} - ${(item.tietBatDau + item.soTietBuoi - 1)}`;
                ngay = `${T.dateToText(item.ngayHoc, 'dd/mm/yyyy')}`;
                ghiChu = 'Lịch dạy';
            }
            if (item.isEvent) {
                thu = new Date(item.batDau).getDay() + 1;
                tiet = `${T.dateToText(item.batDau, 'HH:MM')} - ${T.dateToText(item.ketThuc, 'HH:MM')}`;
                ngay = `${T.dateToText(item.batDau, 'dd/mm/yyyy')}`;
                ghiChu = 'Sự kiện';
            }
            if (thu == 8) thu = 'CN';

            return (
                <Tooltip title={item.isNghi ? 'Buổi học nghỉ' : (item.isVang ? 'Buổi học vắng' : '')} arrow>
                    <tr key={index} style={{ backgroundColor: item.isNghi ? '#ffcccb' : (item.isVang ? '#f7de97' : '#ffffff') }}>
                        <TableCell content={index + 1} />
                        <TableCell type='checkbox' isCheck style={{ textAlign: 'center', display: Number(this.props.system.user?.isPhongDaoTao) ? '' : 'none' }} content={item.isCheck} permission={{ write: item.isTKB }} onChanged={() => this.handleCheck(item, list)} />
                        <TableCell content={item.isEvent ? '' : item.maHocPhan} />
                        <TableCell content={item.isEvent ? item.ten : T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                        <TableCell style={{ whiteSpace: 'pre-wrap' }} content={item.lop} />
                        <TableCell content={ngay} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={thu} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={tiet} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                        <TableCell content={T.parse(item.tenCoSo, { vi: '' })?.vi} />
                        <TableCell content={item.tenKhoaDangKy} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.dataTenGiangVien && item.dataTenGiangVien.length ? item.dataTenGiangVien.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.dataTenTroGiang && item.dataTenTroGiang.length ? item.dataTenTroGiang.split(',').map((item, i) => <div key={i}>{item}</div>) : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={ghiChu} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.isLate ? `Đi trễ: ${item.ghiChu}` : (item.isSoon ? `Về sớm: ${item.ghiChu}` : item.ghiChu)} />
                        <TableCell type='buttons' style={{ textAlign: 'center', display: item.isVang || item.isNghi ? 'none' : '' }} content={item}>
                            <Tooltip title='Báo nghỉ tuần học' arrow>
                                <button className='btn btn-danger' style={{ display: Number(this.props.system.user?.isPhongDaoTao) && item.isTKB ? '' : 'none' }} onClick={e => e.preventDefault() || T.confirm('Cảnh báo', `Bạn có muốn báo nghỉ học phần ${item.maHocPhan} không?`, 'warning', true, isConfirm => {
                                    if (isConfirm) {
                                        this.baoNghiModal.show(item);
                                    }
                                })}>
                                    <i className='fa fa-lg fa-power-off' />
                                </button>
                            </Tooltip>
                            <Tooltip title='Báo vắng' arrow>
                                <button className='btn btn-warning' style={{ display: item.isTKB ? '' : 'none' }} onClick={e => e.preventDefault() || T.confirm('Cảnh báo', `Bạn có muốn báo vắng buổi học của học phần ${item.maHocPhan} không?`, 'warning', true, isConfirm => {
                                    isConfirm && this.baoNghiModal.show({ ...item, isVang: 1 });
                                })}>
                                    <i className='fa fa-lg fa-minus-square' />
                                </button>
                            </Tooltip>
                            <Tooltip title='Ghi chú thêm' arrow>
                                <button className='btn btn-info' style={{ display: item.isTKB ? '' : 'none' }} onClick={e => e.preventDefault() || T.confirm('Cảnh báo', `Bạn có muốn ghi chú thêm về buổi học của học phần ${item.maHocPhan} không?`, 'warning', true, isConfirm => {
                                    isConfirm && this.treSomModal.show({ ...item });
                                })}>
                                    <i className='fa fa-lg fa-info-circle' />
                                </button>
                            </Tooltip>
                            {/* <Tooltip title='Xóa tuần học' arrow>
                            <button className='btn btn-warning' onClick={(e) => e.preventDefault() || this.handleDeleteTuan(item)}>
                                <i className='fa fa-lg fa-trash' />
                            </button>
                        </Tooltip> */}
                        </TableCell>
                    </tr>
                </Tooltip>
            );
        }
    });

    downloadExcel = () => {
        const sort = this.state.sortTerm || this.defaultSortTerm;
        T.handleDownload(`/api/dt/thoi-khoa-bieu/download-schedule-ngay?filter=${T.stringify({ ...this.state.filter, sortKey: sort.split('_')[0], sortMode: sort.split('_')[1] })}`);
    }

    render() {
        let { isSearch, dataSearch } = this.state,
            user = this.props.system.user,
            readOnly = !Number(user.isPhongDaoTao);

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Tra cứu thời khóa biểu',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao/thoi-khoa-bieu'>Thời khóa biểu</Link>,
                'Tra cứu thời khóa biểu'
            ],
            advanceSearchTitle: '',
            advanceSearch: <div className='row'>
                <FormSelect className='col-md-4' ref={e => this.maCoSo = e} label='Cơ sở' data={SelectAdapter_DmCoSo} />
                <FormDatePicker type='date' ref={e => this.fromTime = e} label='Từ thời điểm' className='col-md-4' required />
                <FormDatePicker type='date' ref={e => this.toTime = e} label='Đến thời điểm' className='col-md-4' required />
                <div className='col-md-12' style={{ textAlign: 'right' }}>
                    <button style={{ display: readOnly ? 'none' : '' }} className='btn btn-danger mr-2' type='button' onClick={e => e && e.preventDefault() || this.handleBaoNghi()}>
                        <i className='fa fa-fw fa-lg fa-power-off' />Báo nghỉ
                    </button>
                    <button className='btn btn-success' type='button' onClick={() => {
                        if (!this.fromTime.value()) {
                            T.notify('Vui lòng nhập thời điểm bắt đầu!', 'danger');
                        } else if (!this.toTime.value()) {
                            T.notify('Vui lòng nhập thời điểm kết thúc!', 'danger');
                        } else {
                            let filter = {
                                coSo: getValue(this.maCoSo),
                                ngayBatDau: getValue(this.fromTime).setHours(0, 0, 0, 0),
                                ngayKetThuc: getValue(this.toTime).setHours(0, 0, 0, 0),
                                batDau: getValue(this.fromTime).setHours(0, 0, 0, 0),
                                ketThuc: getValue(this.toTime).setHours(23, 59, 59, 999)
                            };
                            this.setState({ filter }, () => {
                                T.alert('Đang xử lý', 'warning', false, null, true);
                                this.getSchedule(filter, () => T.alert('Xử lý thành công', 'success', true, 5000));
                            });
                        }
                    }}>
                        <i className='fa fa-fw fa-lg fa-search' />Tìm kiếm
                    </button>
                </div>
            </div>,
            content: <div className='tile' style={{ display: isSearch ? '' : 'none' }}>
                <TreSomModal ref={e => this.treSomModal = e} DtThoiKhoaBieuTreSomCreate={this.props.DtThoiKhoaBieuTreSomCreate} refreshData={() => this.getSchedule(this.state.filter)} />
                <BaoNghiModal ref={e => this.baoNghiModal = e} baoNghi={() => this.getSchedule(this.state.filter)} />
                <BaoNghiMultiModal ref={e => this.baoNghiMulti = e} baoNghi={() => this.getSchedule(this.state.filter)} />
                {this.tableTKB(dataSearch)}
            </div>,
            backRoute: '/user/dao-tao/thoi-khoa-bieu/tra-cuu-in',
            onExport: e => e && e.preventDefault() || this.downloadExcel(),
        });
    }
}


const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = { dtTKBTraCuuSchedule, DtTKBCustomDeleteTuan, DtThoiKhoaBieuTreSomCreate };
export default connect(mapStateToProps, mapActionsToProps)(SearchScheduleRoom);