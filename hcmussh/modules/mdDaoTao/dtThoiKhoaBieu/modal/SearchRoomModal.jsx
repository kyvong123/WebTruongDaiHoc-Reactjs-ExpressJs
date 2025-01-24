import React from 'react';
import { AdminModal, FormSelect, FormTextBox, TableCell, renderDataTable, renderTable, FormDatePicker, FormTabs, TableHead, getValue } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { dtTKBTraCuuPhongTrong } from 'modules/mdDaoTao/dtThoiKhoaBieu/redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { getDmCaHocAllCondition } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { SelectAdapter_DtDmThu } from 'modules/mdDaoTao/dtDmThu/redux';
import { SelectAdapter_DmCaHoc } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { SelectAdapter_DmPhongAll } from 'modules/mdDanhMuc/dmPhong/redux';

class SearchRoomModal extends AdminModal {
    state = ({ dataRoom: {}, listTietHoc: [], loaiHinh: '', filter: {}, dataRet: [], caHoc: [], isLoading: false })

    getListRoom = (filter) => {
        T.alert('Đang xử lý', 'warning', false, null, true);
        this.props.dtTKBTraCuuPhongTrong(filter, result => {
            this.setState({ dataRet: result.dataRet, caHoc: result.caHoc }, () => {
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

    render = () => {

        let { coSo } = this.state.filter;

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
            divStyle: { height: '50vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>Ngày</th>
                    <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>Thứ</th>
                    {this.state.caHoc.map((item, index) => (<th key={index} style={{ width: '150px', textAlign: 'center' }}>Tiết {item}</th>))}
                </tr>
            ),
            renderRow: (item, index) => {
                return (
                    <tr key={index} style={{ backgroundColor: 'white' }}>
                        <TableCell style={{ textAlign: 'right', }} content={index + 1} />
                        <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={T.dateToText(new Date(item.ngay), 'dd/mm/yyyy')} />
                        <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={(item.thu == 8) ? 'Chủ nhật' : item.thu} />
                        {this.state.caHoc.map((tiet, tietIndex) => {
                            let checkTiet = item.dataTietHienTai.includes(tiet);
                            return <TableCell key={tietIndex} style={{ backgroundColor: checkTiet ? '#dd8484' : '' }} colSpan={1} content={''} />;
                        })}
                    </tr>
                );
            }
        });

        return this.renderModal({
            title: 'Tìm kiếm phòng trống',
            size: 'elarge',
            body: <div>
                <div className='row'>
                    <FormSelect className='col-md-1' ref={e => this.maCoSo = e} label='Cơ sở' data={SelectAdapter_DmCoSo} required onChange={(value) => {
                        this.setState({ filter: { ...this.state.filter, coSo: value.id } });
                        this.tietBatDau?.value('');
                    }} />
                    <FormDatePicker type='date' ref={e => this.fromTime = e} label='Từ thời điểm' className='col-md-2' required />
                    <FormDatePicker type='date' ref={e => this.toTime = e} label='Đến thời điểm' className='col-md-2' required />
                    <FormSelect className='col-md-1' ref={e => this.thu = e} label='Thứ' data={SelectAdapter_DtDmThu} allowClear />
                    <FormSelect ref={e => this.tietBatDau = e} className='col-md-3' label='Tiết bắt đầu' data={SelectAdapter_DmCaHoc(coSo)} allowClear minimumResultsForSearch={-1} />
                    <FormTextBox type='number' ref={e => this.soTiet = e} className='col-md-1' label='Số tiết' min={1} max={5} />
                    <FormSelect className='col-md-2' ref={e => this.phong = e} label='Phòng' data={SelectAdapter_DmPhongAll(coSo)} allowClear onChange={(value) => {
                        this.setState({ filter: { ...this.state.filter, phong: value ? value.id : value } });
                    }} />
                    <div className='col-md-12' style={{ textAlign: 'right' }}>
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
                                    tietBatDau: getValue(this.tietBatDau),
                                    soTietBuoi: getValue(this.soTiet),
                                    phong: getValue(this.phong),
                                };
                                this.getListRoom(filter);
                            }
                        }}>
                            <i className='fa fa-fw fa-lg fa-search' />Tìm kiếm
                        </button>
                    </div>
                </div>
                <div style={{ display: this.state.dataRet.length ? '' : 'none' }}>
                    {
                        !this.state.caHoc.length ? renderFull() : renderPhong(this.state.dataRet)
                    }
                </div>
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { dtTKBTraCuuPhongTrong };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SearchRoomModal);