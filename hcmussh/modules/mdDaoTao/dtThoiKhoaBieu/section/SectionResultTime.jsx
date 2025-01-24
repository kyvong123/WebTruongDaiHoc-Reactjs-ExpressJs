import { Tooltip } from '@mui/material';
import { getDmCaHocAllCondition } from 'modules/mdDanhMuc/dmCaHoc/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox, FormSelect, renderTable, TableCell } from 'view/component/AdminPage';
import { getDtThoiKhoaBieuByConfig, updateCheckDtThoiKhoaBieu, updateDtThoiKhoaBieuConfig } from '../redux';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DtDmThu } from 'modules/mdDaoTao/dtDmThu/redux';

class SectionResult extends AdminPage {
    state = {
        dataKhoaSinhVien: Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i),
        nganhMapper: {}
    }

    setVal = (config) => {
        this.setState({ dataCanGen: this.props.dtThoiKhoaBieu.dataCanGen.map(item => ({ ...item, xepPhong: !item.tietBatDau ? 0 : 1 })) });
        // getValidOlogy({
        //     namHoc: config.nam,
        //     khoaSinhVien: config.khoaSinhVien,
        //     heDaoTao: config.loaiHinhDaoTao,
        // }, items => {
        //     const nganhMapper = {};
        //     items.forEach(item => nganhMapper[item.id] = item.text);
        //     this.setState({ dataNganh: items, nganhMapper, config });
        // });
        this.props.getScheduleSettings(items => {
            this.setState({
                scheduleConfig: items
            });
        });
        getDmCaHocAllCondition(config.coSo, data => {
            const dataTiet = data.map(item => parseInt(item.ten)).sort((a, b) => (a - b));
            this.setState({ dataTiet, fullDataTiet: data });
        });
    }

    editElement = (soTietBuoi) => {
        return (<>
            <TableCell content={
                <FormSelect ref={e => this.thu = e} style={{ marginBottom: '0', width: '50px' }} data={SelectAdapter_DtDmThu} />
            } />
            <TableCell content={
                <FormSelect ref={e => this.tietBatDau = e} style={{ marginBottom: '0', width: '70px' }} data={this.state.dataTiet} onChange={value => this.handleValidPeriod(value, soTietBuoi)} />
            } />
        </>);
    }

    handleEdit = (item) => {
        let currentId = this.state.editId;
        if (currentId) {
            let currentData = {
                thu: this.thu.value() || '',
                tietBatDau: this.tietBatDau.value() || '',
            };
            this.onUpdate(currentId, currentData);
        }
        this.setState({ editId: item.id }, () => {
            this.thu.value(item.thu);
            this.tietBatDau.value(item.tietBatDau);
        });
    }

    genData = (data) => renderTable({
        getDataSource: () => data,
        stickyHead: true,
        header: 'thead-light',
        className: 'table-fix-col',
        renderHead: () => <tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>
                <FormCheckbox onChange={this.updateAll} />
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
            return (<tr key={index} style={{ backgroundColor: item.isDuplicated ? '#f5c77d' : (!item.thoiGianPhuHop ? '#fa8383' : '') }}>
                <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={item.xepPhong} onChanged={value => this.handleCheck(value, item)} permission={this.getUserPermission('dtThoiKhoaBieu')} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                {this.state.editId == item.id ? this.editElement(item.soTietBuoi) : <>
                    <TableCell type='number' content={item.thu == 8 ? 'CN' : item.thu} />
                    <TableCell type='number' content={item.tietBatDau} />
                </>}
                <TableCell type='number' content={item.soTietBuoi} />
                <TableCell type='number' content={item.soLuongDuKien} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maLop} />

                <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} >
                    {this.state.editId == item.id ? <Tooltip title='Lưu' arrow>
                        <button className='btn btn-success' onClick={e => this.handleUpdate(e, item.soTietBuoi)}>
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

    onUpdate = (id, changes) => {
        let dataCanGen = this.state.dataCanGen;
        dataCanGen = dataCanGen.map(data => data.id == id ? ({ ...data, ...changes }) : data);
        this.setState({ dataCanGen });
    }

    updateAll = (value) => {
        let dataCanGen = this.state.dataCanGen;
        dataCanGen = dataCanGen.map(data => ({ ...data, xepPhong: Number(value) }));
        this.setState({ dataCanGen });
    }

    handleCheck = (value, item) => {
        if (!item.tietBatDau) {
            T.notify(`Học phần ${item.maHocPhan} chưa có tiết bắt đầu!`, 'danger');
        } else {
            this.onUpdate(item.id, { xepPhong: Number(value) });
        }
    }

    handleUpdate = (e, soTietBuoi) => {
        e.preventDefault();
        let currentId = this.state.editId;
        let currentData = {
            thu: this.thu.value(),
            tietBatDau: this.tietBatDau.value(),
        };
        if (currentData.tietBatDau) {
            let { tietBatDau } = currentData;
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
        this.setState({ editId: null }, () => {
            this.onUpdate(currentId, currentData);
        });
    }

    handleValidPeriod = (value, soTietBuoi) => {
        let tietBatDau = value.id;

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

    handleSubmit = (dataCanGen, nganhMapper) => {
        if (dataCanGen.filter(item => item.xepPhong == 1).length) {
            this.props.handleRoom(dataCanGen, nganhMapper);
        } else {
            T.notify('Không có học phần nào được chọn!', 'danger');
        }
    }

    render() {
        let length = this.state?.dataCanGen?.length;
        let num = (this.state.dataCanGen || []).filter(item => !item.thoiGianPhuHop).length;
        return (
            <section id='resultData'>
                <div className='tile'>
                    <div className='tile-title'>
                        <h4>Bước 4: Kết quả sinh thứ, tiết.</h4>
                        <h6 className='text-danger' style={{ margin: '10px' }}>Hiện đang có {num} học phần không tìm được thời gian thích hợp</h6>
                        <button className='btn btn-outline-primary' type='button' style={{ position: 'absolute', top: '20px', right: '20px', display: length ? '' : 'none' }} onClick={e => e.preventDefault() || this.handleSubmit(this.state.dataCanGen, this.state.nganhMapper)} >
                            Điều chỉnh phòng <i className='fa fa-lg fa-arrow-right' />
                        </button>
                    </div>
                    <div className='tile-body'>
                        {this.genData(this.state?.dataCanGen || [])}
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
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionResult);