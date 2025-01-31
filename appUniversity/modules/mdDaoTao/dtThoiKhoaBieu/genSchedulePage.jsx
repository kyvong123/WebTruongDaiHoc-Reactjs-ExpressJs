import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, FormTextBox, TableCell, renderDataTable, TableHead, FormCheckbox, FormTabs } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { SelectAdapter_DtDmThu } from 'modules/mdDaoTao/dtDmThu/redux';
import { SelectAdapter_DmCaHoc } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { SelectAdapter_DmPhongAll } from 'modules/mdDanhMuc/dmPhong/redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { DtTKBGetDataHocPhanMultiple, DtTKBSaveGenData, CustomScheduleGenerated, DtTKBCustomGetNotFree } from './redux';
import SectionXepLich from './section/SectionXepLich';
import SearchRoomModal from './modal/SearchRoomModal';
import { Tooltip } from '@mui/material';


class GenSchedulePage extends AdminPage {

    DATE_UNIX = 24 * 60 * 60 * 1000;

    state = {
        listChosen: [], filter: {}, selected: null, selectedHp: {}, selectedRoom: {},
        dataHocPhan: {}, createdList: [],
    }

    trungPhong = {}
    soTietBuoi = {}
    tietBatDau = {}
    phong = {}
    thu = {}
    soTuan = {}
    coSo = {}
    tuanBatDau = {}

    componentDidMount() {
        if (!$('.app').hasClass('sidenav-toggled')) {
            $('.app').addClass('sidenav-toggled');
        }
        T.ready('/user/dao-tao', () => {
            if (this.props.location.state) {
                let { filter, listChosen } = this.props.location.state, { namFilter: namHoc, hocKyFilter: hocKy } = filter;
                let dataState = [];
                listChosen.forEach(i => {
                    if (!dataState.map(i => i.maHocPhan).includes(i.maHocPhan)) {
                        dataState.push(i);
                    }
                });
                this.tab.tabClick(null, 0);
                dataState.sort((a, b) => a.maHocPhan - b.maHocPhan);

                T.alert('Loading...', 'warning', false, null, true);
                this.props.DtTKBGetDataHocPhanMultiple({ namHoc, hocKy }, dataState.map(i => i.maHocPhan), (data) => {
                    let dataSelectWeek = data.listWeeksOfYear.map(i => ({ id: i.weekNumber, text: `Tuần ${i.week}: ${T.dateToText(i.weekStart, 'dd/mm/yyyy')} - ${T.dateToText(i.weekEnd, 'dd/mm/yyyy')}` }));
                    Object.keys(data.dataHocPhan).forEach(hp => {
                        this.soTietBuoi[hp] = {};
                        this.tietBatDau[hp] = {};
                        this.phong[hp] = {};
                        this.coSo[hp] = {};
                        this.trungPhong[hp] = {};
                        this.tuanBatDau[hp] = {};
                        this.soTuan[hp] = {};
                        this.thu[hp] = {};
                    });
                    this.setState({ filter, listChosen: dataState, selected: dataState[0].maHocPhan, ...data, dataSelectWeek }, () => {
                        T.alert('Load thành công', 'success', false, 500);
                    });
                });
            }
        });
    }

    handleChangeThu = (value, maHocPhan, index) => {
        let { dataHocPhan } = this.state, currData = dataHocPhan[maHocPhan][index];
        currData.thu = value.id;
        this.setState({ dataHocPhan });
    }

    handleChangeTiet = (value, maHocPhan, index) => {
        let { dataHocPhan, dataCaHoc } = this.state, currData = dataHocPhan[maHocPhan][index];
        if (currData.soTietBuoi) {
            if (this.handleCheckTiet({ ...currData, tietBatDau: value.id })) {
                currData.tietBatDau = value.id;
                currData.thoiGianBatDau = dataCaHoc.filter(i => i.maCoSo == currData.coSo).find(item => item.ten == value.id).thoiGianBatDau;
                currData.thoiGianKetThuc = dataCaHoc.filter(i => i.maCoSo == currData.coSo).find(item => item.ten == parseInt(value.id) + parseInt(currData.soTietBuoi) - 1).thoiGianKetThuc;
            } else {
                this.tietBatDau[maHocPhan][index].value('');
                currData.tietBatDau = '';
            }
        } else {
            currData.tietBatDau = value.id;
            currData.thoiGianBatDau = dataCaHoc.filter(i => i.maCoSo == currData.coSo).find(item => item.ten == value.id).thoiGianBatDau;
        }
        this.setState({ dataHocPhan });
    }

    handleChangeSoTiet = (value, maHocPhan, index) => {
        let { dataHocPhan, dataCaHoc } = this.state, currData = dataHocPhan[maHocPhan][index];
        if (currData.tietBatDau && value) {
            if (this.handleCheckTiet({ ...currData, soTietBuoi: value })) {
                currData.soTietBuoi = value;
                currData.thoiGianKetThuc = dataCaHoc.filter(i => i.maCoSo == currData.coSo).find(item => item.ten == parseInt(currData.tietBatDau) + parseInt(value) - 1).thoiGianKetThuc;
            } else {
                this.soTietBuoi[maHocPhan][index].value('');
                currData.soTietBuoi = '';
            }
        } else {
            currData.soTietBuoi = value;
        }
        this.setState({ dataHocPhan });
    }

    handleCheckTiet = (data) => {
        let { dataCaHoc } = this.state;

        let { tietBatDau, soTietBuoi, coSo } = data;
        if (tietBatDau && soTietBuoi) {
            let tietKetThuc = parseInt(tietBatDau) + parseInt(soTietBuoi) - 1;

            let dataKetThuc = dataCaHoc.filter(i => i.maCoSo == coSo).find(item => item.ten == tietKetThuc);
            let dataBatDau = dataCaHoc.filter(i => i.maCoSo == coSo).find(item => item.ten == tietBatDau);

            if (!dataKetThuc) {
                T.alert('Không tồn tại tiết kết thúc', 'error', false);
                return false;
            }

            if (dataBatDau.buoi != dataKetThuc.buoi) {
                T.alert('Bắt đầu và kết thúc ở 2 buổi khác nhau!', 'error', false);
                return false;
            }
        }
        return true;
    }

    handleChangePhong = (value, maHocPhan, index) => {
        let { dataHocPhan } = this.state, currData = dataHocPhan[maHocPhan][index];
        currData.phong = value.id;
        this.setState({ dataHocPhan });
    }

    handleChangeSoTuan = (value, maHocPhan, index) => {
        let { dataHocPhan } = this.state, currData = dataHocPhan[maHocPhan][index];
        currData.soTuan = value;
        this.setState({ dataHocPhan });
    }

    handleChangeTuan = (value, maHocPhan, index) => {
        let { dataHocPhan, listWeeksOfYear } = this.state, currData = dataHocPhan[maHocPhan][index];
        currData.tuanBatDau = value.id;
        currData.weekStart = listWeeksOfYear.find(i => i.weekNumber == value.id).weekStart;
        this.setState({ dataHocPhan });
    }

    handleCheckTrung = (value, maHocPhan, index) => {
        let { dataHocPhan } = this.state, currData = dataHocPhan[maHocPhan][index];
        currData.isTrungTKB = value;
        this.setState({ dataHocPhan });
    }

    handleChangeCoSo = (value, maHocPhan, index) => {
        let { dataHocPhan } = this.state, currData = dataHocPhan[maHocPhan][index];
        currData.coSo = value.id;
        currData.phong = '';
        currData.tietBatDau = '';
        this.setState({ dataHocPhan }, () => {
            this.tietBatDau[maHocPhan][index].value('');
            this.phong[maHocPhan][index].value('');
        });
    }

    tableRoom = (list, ma) => renderDataTable({
        emptyTable: 'Không có dữ liệu phòng trống',
        data: list, stickyHead: list.length > 10,
        header: 'thead-light',
        divStyle: { height: '40vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>#</th>
                <TableHead style={{ width: '50%', textAlign: 'right', whiteSpace: 'nowrap' }} content='Phòng' keyCol='phong'
                    onKeySearch={data => {
                        let dataRoom = this.state.dataRoomAll.filter(room => room.ten.toLowerCase().includes((data.split(':')[1] || '').toLowerCase()));
                        this.setState({ dataRoomHocPhan: { ...this.state.dataRoomHocPhan, [ma]: dataRoom } });
                    }} />
                <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Sức chứa</th>
            </tr>
        ),
        renderRow: (item, index) => {
            let selected = this.state.selectedRoom[ma] == item.ten;
            return (
                <tr key={index} style={{ backgroundColor: selected ? '#ffe599' : 'white' }}>
                    <TableCell style={{ textAlign: 'right', }} type='checkbox' isCheck permission={{ write: true }} content={selected} onChanged={value => this.setState({ selectedRoom: { ...this.state.selectedRoom, [ma]: value ? item.ten : null } })} />
                    <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell style={{ textAlign: 'right' }} content={item.sucChua} />
                </tr>
            );
        }
    });

    addNewBuoi = (fullData, ma) => {
        T.confirm('Cảnh báo', 'Bạn có muốn thêm buổi học mới hay không?', 'warning', true, confirm => {
            if (confirm) {
                let item = fullData[0];
                fullData.push({
                    ...item, phong: '', thu: '', tietBatDau: '', soTietBuoi: '', buoi: fullData.length + 1, isNew: 1, soTuan: '', tuanBatDau: '', coSo: '',
                });
                this.setState({ dataHocPhan: { ...this.state.dataHocPhan, [ma]: fullData } });
            }
        });
    }

    deleteBuoi = (index, fullData, ma) => {
        T.confirm('Cảnh báo', 'Bạn có muốn xóa buổi học hay không?', 'warning', true, confirm => {
            if (confirm) {
                let { dataHocPhan } = this.state;
                if (fullData.length == 1) {
                    fullData = fullData.map(i => ({ ...i, soTietBuoi: '', tietBatDau: '', phong: '', soTuan: '', isTrungTKB: '', tuanBatDau: '', thu: '', coSo: '' }));
                    this.soTietBuoi[ma][index].value('');
                    this.tietBatDau[ma][index].value('');
                    this.phong[ma][index].value('');
                    this.coSo[ma][index].value('');
                    this.trungPhong[ma][index].value('');
                    this.tuanBatDau[ma][index].value('');
                    this.soTuan[ma][index].value('');
                    this.thu[ma][index].value('');
                } else {
                    fullData.splice(index, 1);
                }
                this.setState({
                    dataHocPhan: { ...dataHocPhan, [ma]: fullData }
                });
            }
        });
    }

    addCreated = (maHocPhan) => {
        let { createdList } = this.state;
        if (!createdList.includes(maHocPhan)) {
            createdList.push(maHocPhan);
        }
        this.setState({ createdList });
    }

    changeTab = (e) => {
        e && e.preventDefault();
        const xepLich = (data, done) => {
            this.xepLich.setValue(data, done);
            this.tab.tabClick(null, 1);
        };
        let { dataHocPhan, selected, dataCaHoc, dataNgayLe } = this.state;
        let fullData = [...dataHocPhan[selected]];
        if (fullData.some(i => !(i.coSo && i.thu && i.tietBatDau && i.soTietBuoi && i.tuanBatDau))) {
            T.alert('Vui lòng nhập thông tin về cơ sở, thứ, tiết và tuần bắt đầu', 'warning');
            return;
        }
        T.alert('Đang xếp lịch. Vui lòng đợi!', 'warning', false, null, true);
        this.props.DtTKBCustomGetNotFree(fullData.map(i => ({ maHocPhan: i.maHocPhan, phong: i.phong, weekStart: i.weekStart })), (data) => {
            let listTuanHoc = CustomScheduleGenerated({ fullData, dataTiet: dataCaHoc, listNgayLe: dataNgayLe, isGenTrung: true, listTKB: data.listTKB, listThi: data.listThi, listEvent: data.listEvent, listTKBGv: data.listTKBGv });
            if (listTuanHoc.length) {
                let trung = listTuanHoc.filter(i => !i.isTrungTKB && i.ghiChu).length;
                if (trung) {
                    T.confirm('Cảnh báo', `Hiện có ${trung} buổi bị trùng. Bạn có muốn xếp lịch lại thời khóa biểu hay không?`, 'warning', true, confirm => {
                        if (confirm) {
                            let listTuanHoc = CustomScheduleGenerated({ fullData, dataTiet: dataCaHoc, listNgayLe: dataNgayLe, isGenTrung: false, listTKB: data.listTKB, listThi: data.listThi, listEvent: data.listEvent });
                            if (listTuanHoc.length) {
                                xepLich({ fullData, dataCaHoc, listTuanHoc, dataNgayLe }, () => T.alert('Xếp lịch thành công!', 'success', true, 1000));
                            } else {
                                T.alert('Trùng thời gian học giữa các lịch học của học phần', 'error', true);
                            }
                        } else {
                            xepLich({ fullData, dataCaHoc, listTuanHoc, dataNgayLe }, () => T.alert('Xếp lịch thành công!', 'success', true, 1000));
                        }
                    });
                } else {
                    xepLich({ fullData, dataCaHoc, listTuanHoc, dataNgayLe }, () => T.alert('Xếp lịch thành công!', 'success', true, 1000));
                }
            } else {
                T.alert('Trùng thời gian học giữa các lịch học của học phần', 'error', true);
            }
        });
    }

    content = (item) => {
        let ma = item.maHocPhan;
        let { dataHocPhan, selectedHp, dataSelectWeek } = this.state, fullData = dataHocPhan[ma];

        return <div className='row'>
            <div className='col-md-12' style={{ marginBottom: '20px' }}>
                <button style={{ height: 'fit-content', margin: 'auto', marginRight: '10px' }} className='btn btn-success' type='button' onClick={e => e && e.preventDefault() || this.addNewBuoi(fullData, ma)}>
                    <i className='fa fa-fw fa-lg fa-plus' />Thêm buổi
                </button>

                <button type='button' className='btn btn-success' style={{ height: 'fit-content', margin: 'auto', marginRight: '10px' }}
                    onClick={this.changeTab}> <i className='fa fa-fw fa-lg fa-wrench' /> Rải lịch </button>

                {/* <button type='button' className='btn btn-info' style={{ height: 'fit-content', margin: 'auto', marginRight: '10px' }} onClick={e => e && e.preventDefault() || this.searchRoomModal.show()}
                > <i className='fa fa-fw fa-lg fa-search' /> Tìm kiếm phòng trống </button> */}
            </div>

            <div className='col-md-12'>
                {fullData.map((hocPhan, index) => (
                    <div key={index} className='row' style={{ backgroundColor: (selectedHp[ma] == index) ? '#bbeeff' : '' }}>
                        <div className='col-md-1' style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ whiteSpace: 'nowrap' }}>Trùng phòng</label>
                            <FormCheckbox ref={e => this.trungPhong[ma][index] = e} style={{ margin: 'auto' }} onChange={value => this.handleCheckTrung(value, ma, index)} />
                        </div>
                        <FormSelect ref={e => this.coSo[ma][index] = e} className='col-md-1' label='Cơ sở' data={SelectAdapter_DmCoSo} onChange={value => this.handleChangeCoSo(value, ma, index)} />
                        <FormSelect ref={e => this.thu[ma][index] = e} className='col-md-1' label='Thứ' data={SelectAdapter_DtDmThu} onChange={value => this.handleChangeThu(value, ma, index)} />
                        <FormSelect ref={e => this.tietBatDau[ma][index] = e} className='col-md-2' label='Tiết bắt đầu' data={SelectAdapter_DmCaHoc(hocPhan.coSo)} onChange={value => this.handleChangeTiet(value, ma, index)} />
                        <FormTextBox ref={e => this.soTietBuoi[ma][index] = e} type='number' className='col-md-1' label='Số tiết' onChange={value => this.handleChangeSoTiet(value, ma, index)} />
                        <FormSelect ref={e => this.phong[ma][index] = e} className='col-md-2' label='Phòng' data={SelectAdapter_DmPhongAll(hocPhan.coSo)} onChange={value => this.handleChangePhong(value, ma, index)} />
                        <FormSelect ref={e => this.tuanBatDau[ma][index] = e} className='col-md-2' label='Tuần bắt đầu' data={dataSelectWeek} onChange={value => this.handleChangeTuan(value, ma, index)} />
                        <FormTextBox ref={e => this.soTuan[ma][index] = e} type='number' className='col-md-1' label='Số tuần' allowNegative={false} min={1} onChange={value => this.handleChangeSoTuan(value, ma, index)} />
                        <div className='col-md-1' style={{ margin: 'auto', marginBottom: '1rem' }}>
                            <Tooltip title='Xoá buổi' arrow placement='right-end'>
                                <button style={{ height: 'fit-content', margin: 'auto' }} type='button' className='btn btn-danger' onClick={e => e && e.preventDefault() || this.deleteBuoi(index, fullData, ma)}><i className='fa fa-lg fa-trash' /></button>
                            </Tooltip>
                        </div>
                    </div>
                ))}
            </div>
        </div>;
    }

    render() {
        let { listChosen, selected, createdList } = this.state;
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Xếp thời khóa biểu',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/edu-schedule'>Quản lý học phần</Link>,
                'Xếp thời khóa biểu'
            ],
            content: <>
                <SearchRoomModal ref={e => this.searchRoomModal = e} />
                <FormTabs ref={e => this.tab = e} tabs={[
                    {
                        id: 'xepLich', title: 'Xếp lịch', component: <div className='tile'>
                            <div className='tile-body'>
                                <div className='row border-right show-scrollbar' style={{ marginTop: '5px' }} >
                                    <div className='col-md-2 nav flex-column nav-pills pl-4' aria-orientation='vertical'>
                                        {
                                            listChosen.map((item, index) => {
                                                let isCreated = createdList.includes(item.maHocPhan);
                                                return <a key={index} style={{ cursor: 'pointer' }} aria-selected='true' className={'nav-link ' + (item.maHocPhan == selected ? 'active bg-info' : '')} id={item.maHocPhan} data-toggle='pill' role='tab' aria-controls={item.maHocPhan}
                                                    onClick={e => e && e.preventDefault() || this.setState({ selected: item.maHocPhan })}>
                                                    <div><strong className='text-black'>{item.maHocPhan}</strong></div>
                                                    <div style={{ display: isCreated ? '' : 'none' }}><strong className='text-black'>Đã rải lịch</strong></div>
                                                </a >;
                                            })
                                        }
                                    </div>
                                    <div className='col-md-10 tab-content'>
                                        {
                                            listChosen.map((item, index) => {
                                                return <div className='tab-pane fade show active' id={item.maHocPhan} role='tabpanel' aria-labelledby={item.maHocPhan} key={index} style={{ height: '75vh', display: item.maHocPhan == selected ? '' : 'none' }}>
                                                    {this.content(item)}
                                                </div>;
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    },
                    {
                        id: 'raiLich', title: 'Rải lịch', component: <SectionXepLich ref={e => this.xepLich = e} created={this.addCreated} />
                    }
                ]} />
            </>,
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system });
const mapActionsToProps = { DtTKBGetDataHocPhanMultiple, DtTKBSaveGenData, DtTKBCustomGetNotFree };
export default connect(mapStateToProps, mapActionsToProps)(GenSchedulePage);
