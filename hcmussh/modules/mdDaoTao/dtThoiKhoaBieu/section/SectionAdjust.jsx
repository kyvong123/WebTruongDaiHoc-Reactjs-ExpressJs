import { Tooltip } from '@mui/material';
import { getDmCaHocAllCondition } from 'modules/mdDanhMuc/dmCaHoc/redux';
// import { getValidOlogy } from 'modules/mdDaoTao/dtDanhSachChuyenNganh/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { getDtThoiKhoaBieuByConfig, updateCheckDtThoiKhoaBieu, updateDtThoiKhoaBieuConfig } from '../redux';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DtDmThu } from 'modules/mdDaoTao/dtDmThu/redux';
import { SelectAdapter_DtLopFilter } from 'modules/mdDaoTao/dtLop/redux';
import { SelectAdapter_DmPhong } from 'modules/mdDanhMuc/dmPhong/redux';

class SectionAdjust extends AdminPage {
    state = {
        dataKhoaSinhVien: Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i),
        nganhMapper: {}
    }

    setVal = (config) => {
        this.setState({ config });
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

    editElement = () => {
        const { tkbSoLuongDuKienMax, tkbSoLuongDuKienMin, tkbSoTietBuoiMax, tkbSoTietBuoiMin } = this.state.scheduleConfig || {};
        return (<>
            <TableCell content={
                <FormSelect ref={e => this.phong = e} style={{ marginBottom: '0', width: '100px' }} data={SelectAdapter_DmPhong} />
            } />
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
                <FormSelect ref={e => this.maLop = e} style={{ marginBottom: '0', width: '100px' }} data={SelectAdapter_DtLopFilter()} multiple placeholder='Lớp' />
            } />
        </>);
    }

    //Step 2: Edit trước thứ, tiêt bắt đầu
    handleEdit = (item) => {
        let currentId = this.state.editId;
        if (currentId) {
            let currentData = {
                thu: this.thu.value() || '',
                phong: this.phong.value() || '',
                tietBatDau: this.tietBatDau.value() || '',
                soTietBuoi: this.soTietBuoi.value() || '',
                soLuongDuKien: this.soLuongDuKien.value() || '',
                maLop: this.maLop.value(),
            };
            this.props.updateDtThoiKhoaBieuConfig({ currentId, currentData, config: this.state.config });
        }
        this.setState({ editId: item.id }, () => {
            this.thu.value(item.thu);
            this.phong.value(item.phong);
            this.tietBatDau.value(item.tietBatDau);
            this.soTietBuoi.value(item.soTietBuoi || '');
            this.soLuongDuKien.value(item.soLuongDuKien);
            this.maLop.value(item.maLop ? [...item.maLop.split(',')] : '');
        });
    }

    updateIsMoAll = (value) => {
        this.props.updateCheckDtThoiKhoaBieu({ id: this.props.dtThoiKhoaBieu.dataCanGen.map(item => item.id), isMo: Number(value) }, this.state.config);
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
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Lớp</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
        </tr>,
        renderRow: (item, index) => {
            return (<tr key={index}>
                <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={item.isMo} onChanged={value => this.handleCheck(value, item)} permission={this.getUserPermission('dtThoiKhoaBieu')} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                {this.state.editId == item.id ? this.editElement() : <>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                    <TableCell type='number' content={item.thu == 8 ? 'CN' : item.thu} />
                    <TableCell type='number' content={item.tietBatDau} />
                    <TableCell type='number' content={item.soTietBuoi} />
                    <TableCell type='number' content={item.soLuongDuKien} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maLop} />
                </>}
                <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} >
                    {this.state.editId == item.id ? <Tooltip title='Lưu' arrow>
                        <button className='btn btn-success' onClick={this.handleUpdate}>
                            <i className='fa fa-lg fa-check' />
                        </button>
                    </Tooltip> : <>
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

    handleCheck = (value, item) => {
        if (!item.soTietBuoi) {
            T.notify(`Học phần ${item.maHocPhan} chưa có số tiết buổi!`, 'danger');
        } else {
            this.props.updateCheckDtThoiKhoaBieu({ id: item.id, isMo: Number(value) }, this.state.config);
        }
    }

    handleUpdate = (e) => {
        e.preventDefault();
        let currentId = this.state.editId;
        let currentData = {
            thu: this.thu.value(),
            phong: this.phong.value(),
            tietBatDau: this.tietBatDau.value(),
            soTietBuoi: this.soTietBuoi.value(),
            soLuongDuKien: this.soLuongDuKien.value(),
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
            this.props.updateDtThoiKhoaBieuConfig({ currentId, currentData, config: this.state.config }, () => {
                this.setState({ editId: null });
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

    handleSubmit = (data) => {
        if (this.props.dtThoiKhoaBieu.dataCanGen.filter(item => item.isMo).length) {
            this.props.handleSubmitAdjustedData(data);
        } else {
            T.notify('Không có học phần nào được chọn!', 'danger');
        }
    }

    render() {
        let dtThoiKhoaBieu = this.props.dtThoiKhoaBieu || {},
            { scheduleConfig, dataTiet } = this.state;
        let hocPhanNotGen = (dtThoiKhoaBieu.dataCanGen || []).filter(item => !item.soTietBuoi).length;
        return (
            <section id='adjustData'>
                <div className='tile'>
                    <div className='tile-title'>
                        <h4>Bước 2: Tuỳ chỉnh.</h4>
                        <div style={{ fontSize: '0.8rem' }}>
                            <i>- Thao tác: tuỳ chỉnh thứ, tiết bắt đầu, số lượng dự kiến và lớp dành cho học phần đó.</i><br />
                            <i>- Ghi chú: những học phần chưa có thứ, tiết bắt đầu sẽ được hệ thống sinh tự động.</i>
                        </div>
                        <h6 className='text-danger' style={{ marginTop: '10px' }}>Hiện đang có {hocPhanNotGen} học phần chưa có số tiết/ buổi</h6>
                        <button className='btn btn-outline-primary' type='button' style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={e => e.preventDefault() || this.handleSubmit({ scheduleConfig, dataTiet })}>
                            Cấu hình thời gian, địa điểm <i className='fa fa-lg fa-arrow-right' />
                        </button>
                    </div>
                    <div className='tile-body'>
                        {this.genData(dtThoiKhoaBieu.dataCanGen)}
                    </div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = {
    getDtThoiKhoaBieuByConfig, updateCheckDtThoiKhoaBieu, updateDtThoiKhoaBieuConfig, getScheduleSettings
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionAdjust);