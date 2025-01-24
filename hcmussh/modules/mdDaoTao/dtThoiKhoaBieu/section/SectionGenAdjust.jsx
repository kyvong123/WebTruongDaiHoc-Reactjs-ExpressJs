import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox, FormSelect, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';
import { getDmCaHocAllCondition } from 'modules/mdDanhMuc/dmCaHoc/redux';
import { Tooltip } from '@mui/material';
import { SelectAdapter_DtLopFilter } from 'modules/mdDaoTao/dtLop/redux';
import { SelectAdapter_DtDmThu } from 'modules/mdDaoTao/dtDmThu/redux';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { updateGenDtThoiKhoaBieuConfig, resultGenDtThoiKhoaBieu } from 'modules/mdDaoTao/dtThoiKhoaBieu/redux';


class SectionAdjust extends AdminPage {
    state = { dataCanGen: [], config: {} }

    setVal = (config, dataCanGen) => {
        dataCanGen = dataCanGen.map(i => ({
            ...i, tuanBatDau: config.tuanBatDau, weekStart: config.weekStart,
            textTuanBatDau: config.dataSelectWeek.find(cg => cg.id == config.tuanBatDau)?.text,
        }));
        this.setState({ config, dataCanGen });
        this.props.getScheduleSettings(items => {
            this.setState({
                scheduleConfig: items
            });
        });
        getDmCaHocAllCondition(config.coSo, data => {
            let dataTiet = data.map(item => parseInt(item.ten)).sort((a, b) => (a - b));
            this.setState({ dataTiet, fullDataTiet: data });
        });
    }

    updateIsMoAll = (value) => {
        this.setState({
            dataCanGen: this.state.dataCanGen.map(item => {
                item.isMo = !item.soTietBuoi ? 0 : Number(value);
                return item;
            })
        });
    }

    genData = (data) => renderTable({
        getDataSource: () => data,
        stickyHead: true,
        header: 'thead-light',
        className: 'table-fix-col',
        renderHead: () => <tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>
                <FormCheckbox onChange={this.updateIsMoAll} />
            </th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Mã học phần</th>
            <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Tên môn học</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phòng</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Thứ</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Tiết bắt đầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Tiết/Buổi</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Dự kiến</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tuần bắt đầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Số tuần</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Lớp</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
        </tr>,
        renderRow: (item, index) => {
            return (<tr key={index}>
                <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={item.isMo} onChanged={value => this.handleCheck(value, item)} permission={this.getUserPermission('dtThoiKhoaBieu')} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                {this.state.editId == item.id ? this.editElement() : <>
                    <TableCell type='number' content={item.thu == 8 ? 'CN' : item.thu} />
                    <TableCell type='number' content={item.tietBatDau} />
                    <TableCell type='number' content={item.soTietBuoi} />
                    <TableCell type='number' content={item.soLuongDuKien} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.textTuanBatDau} />
                    <TableCell content={item.soTuan} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maLop} />
                </>}
                <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} >
                    {this.state.editId == item.id ? <>
                        <Tooltip title='Lưu' arrow>
                            <button className='btn btn-success' onClick={this.handleUpdate}>
                                <i className='fa fa-lg fa-check' />
                            </button>
                        </Tooltip>
                        <Tooltip title='Hủy' arrow>
                            <button className='btn btn-secondary' onClick={e => e.preventDefault() || this.setState({ editId: null })}>
                                <i className='fa fa-lg fa-ban' />
                            </button>
                        </Tooltip>
                    </> : <>
                        <Tooltip title='Điều chỉnh' arrow>
                            <button className='btn btn-primary' onClick={e => e.preventDefault() || this.handleEdit(item)}>
                                <i className='fa fa-lg fa-edit' />
                            </button>
                        </Tooltip>
                    </>}
                </TableCell>
            </tr>);
        }
    })

    handleUpdate = (e) => {
        e.preventDefault();
        let currentId = this.state.editId;
        let currentData = {
            thu: this.thu.value(),
            tietBatDau: this.tietBatDau.value(),
            soTietBuoi: this.soTietBuoi.value(),
            soLuongDuKien: this.soLuongDuKien.value(),
            tuanBatDau: this.tuanBatDau.value(),
            soTuan: this.soTuan.value(),
            maLop: this.maLop.value()
        };
        if (!currentData.soTietBuoi) {
            T.notify('Số tiết bị trống!', 'danger');
            this.soTietBuoi.focus();
        } else if (!currentData.soLuongDuKien) {
            T.notify('Số lượng dự kiến bị trống!', 'danger');
            this.soLuongDuKien.focus();
        } else if (!currentData.maLop.length) {
            T.notify('Học phần không có lớp', 'danger');
        } else {
            if (currentData.tietBatDau) {
                let { soTietBuoi, tietBatDau } = currentData;
                tietBatDau = parseInt(tietBatDau);
                soTietBuoi = parseInt(soTietBuoi);
                let buoiHocBatDau = this.state.fullDataTiet.find(item => item.ten == tietBatDau).buoi;
                let dataKetThuc = this.state.fullDataTiet.find(item => item.ten == (tietBatDau + soTietBuoi - 1));
                if (!dataKetThuc) {
                    return T.notify('Không có tiết kết thúc phù hợp', 'danger');
                } else if (buoiHocBatDau != dataKetThuc.buoi) {
                    return T.notify('Bắt đầu và kết thúc ở 2 buổi khác nhau!', 'danger');
                }
            }
            this.props.updateGenDtThoiKhoaBieuConfig({ currentId, currentData }, () => {
                const { dataCanGen, config } = this.state;
                let weekStart = config.listWeeksOfYear.find(i => i.weekNumber == currentData.tuanBatDau).weekStart,
                    textTuanBatDau = config.dataSelectWeek.find(i => i.id == currentData.tuanBatDau)?.text;

                this.setState({ editId: null, dataCanGen: dataCanGen.map(i => i.id == currentId ? ({ ...i, ...currentData, weekStart, textTuanBatDau, maLop: i.maLop.toString() }) : i) });
            });
        }
    }

    handleValidPeriod = (value) => {
        let tietBatDau = value.id,
            soTietBuoi = this.soTietBuoi.value();

        tietBatDau = parseInt(tietBatDau);
        soTietBuoi = parseInt(soTietBuoi);

        let buoiHocBatDau = this.state.fullDataTiet.find(item => item.ten == tietBatDau)?.buoi;
        let dataKetThuc = this.state.fullDataTiet.find(item => item.ten == (tietBatDau + soTietBuoi - 1));
        if (!dataKetThuc) {
            this.tietBatDau.focus();
            return T.notify('Không có tiết kết thúc phù hợp', 'danger');
        } else if (buoiHocBatDau != dataKetThuc.buoi) {
            this.tietBatDau.focus();
            return T.notify('Bắt đầu và kết thúc ở 2 buổi khác nhau!', 'danger');
        }
    }

    handleCheck = (value, item) => {
        if (!item.soTietBuoi) {
            T.notify(`Học phần ${item.maHocPhan} chưa có số tiết buổi!`, 'danger');
        } else {
            this.setState({
                dataCanGen: this.state.dataCanGen.map(it => {
                    if (item.id == it.id) it.isMo = !it.soTietBuoi || !it.maLop ? 0 : Number(value);
                    return it;
                })
            });
        }
    }

    editElement = () => {
        const { tkbSoLuongDuKienMax, tkbSoLuongDuKienMin, tkbSoTietBuoiMax, tkbSoTietBuoiMin } = this.state.scheduleConfig || {},
            { dataSelectWeek = [] } = this.state.config;

        return (<>
            <TableCell content={
                <FormSelect ref={e => this.thu = e} style={{ marginBottom: '0', width: '50px' }} data={SelectAdapter_DtDmThu} />
            } />
            <TableCell content={
                <FormSelect ref={e => this.tietBatDau = e} style={{ marginBottom: '0', width: '70px' }} data={this.state.dataTiet} onChange={this.handleValidPeriod} />
            } />
            <TableCell content={
                <FormTextBox type='number' ref={e => this.soTietBuoi = e} style={{ width: '50px', marginBottom: '0' }} min={tkbSoTietBuoiMin} max={tkbSoTietBuoiMax} />
            } />
            <TableCell content={
                <FormTextBox type='number' ref={e => this.soLuongDuKien = e} style={{ width: '70px', marginBottom: '0' }} min={tkbSoLuongDuKienMin} max={tkbSoLuongDuKienMax} />
            } />
            <TableCell content={
                <FormSelect ref={e => this.tuanBatDau = e} style={{ marginBottom: '0', minWidth: '150px' }} data={dataSelectWeek} />
            } />
            <TableCell content={
                <FormTextBox ref={e => this.soTuan = e} type='number' style={{ marginBottom: '0', width: '50px' }} allowNegative={false} min={1} />
            } />
            <TableCell content={
                <FormSelect ref={e => this.maLop = e} style={{ marginBottom: '0', width: '100px' }} data={SelectAdapter_DtLopFilter()} multiple placeholder='Lớp' />
            } />
        </>);
    }

    //Step 2: Edit trước thứ, tiêt bắt đầu
    handleEdit = (item) => {
        this.setState({ editId: item.id }, () => {
            this.thu.value(item.thu);
            this.tietBatDau.value(item.tietBatDau);
            this.soTietBuoi.value(item.soTietBuoi || '');
            this.soLuongDuKien.value(item.soLuongDuKien);
            this.tuanBatDau.value(item.tuanBatDau);
            this.soTuan.value(item.soTuan);
            this.maLop.value(item.maLop ? [...item.maLop.split(',')] : '');
        });
    }

    handleSubmit = () => {
        const { coSo, hocKy, khoaDangKy, khoaSinhVine, loaiHinhDaoTao, namHoc, tuanBatDau, weekStart } = this.state.config,
            listHocPhan = this.state.dataCanGen.filter(item => item.isMo);

        T.confirm('Sinh thời khóa biểu', 'Bạn chắc chắn muốn sinh thời khóa biểu không?', isConfirm => {
            if (isConfirm) {
                if (!listHocPhan.length) return T.alert('Không có học phần ', 'error', false, 2000);
                this.setState({ isWaiting: true }, () => {
                    this.props.resultGenDtThoiKhoaBieu({ coSo, hocKy, khoaDangKy, khoaSinhVine, loaiHinhDaoTao, namHoc, tuanBatDau, weekStart }, listHocPhan, () => {
                        this.setState({ isWaiting: false });
                        this.props.handleSubmitAdjustedData();
                    });
                });
            }
        });
    }

    render() {
        let { dataCanGen, isWaiting } = this.state;
        let hocPhanNotGen = (dataCanGen || []).filter(item => !item.soTietBuoi || !item.maLop).length;

        return (
            <section id='config'>
                <div className='tile'>
                    <div className='tile-title'>
                        <h4>Bước 2: ĐIỀU CHỈNH HỌC PHẦN.</h4>
                        <h6 className='text-danger' style={{ marginTop: '10px' }}>Hiện đang có {hocPhanNotGen} học phần chưa có số tiết/buổi và lớp</h6>
                        <button className='btn btn-outline-primary' type='button' style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={e => e.preventDefault() || this.handleSubmit()} disabled={isWaiting}>
                            {isWaiting ? 'Loading' : 'Sinh kết quả'} <i className={isWaiting ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-lg fa-arrow-right'} />
                        </button>
                    </div>
                    <div className='tile-body'>
                        {this.genData(dataCanGen)}
                    </div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = { getScheduleSettings, updateGenDtThoiKhoaBieuConfig, resultGenDtThoiKhoaBieu };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionAdjust);