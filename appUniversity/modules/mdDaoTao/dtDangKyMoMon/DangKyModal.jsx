
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { getDanhSachMonChuongTrinhDaoTao } from '../dtChuongTrinhDaoTao/redux';
import { createDtDanhSachMonMo } from '../dtDanhSachMonMo/redux';
import { getAllDtSettings } from '../dtSettings/redux';
import { Tooltip } from '@mui/material';
class MonHocCtdtModal extends AdminModal {

    monChung = {}
    monChuyenNganh = {}
    subChuyenNganh = {}
    monNgoaiCtdt = {}
    listMonHocChung = {}
    listMonHocChungSelected = {}
    listMonHocChuyenNganh = {}
    listMonHocChuyenNganhSelected = {}
    listMonHocNgoaiCtdt = {}
    listMonHocNgoaiCtdtSelected = {}
    settings = {}
    listChon = {}

    state = { listMonHocChonChung: [], listMonHocChonChuyenNganh: [], listMonHocChonNgoaiCtdt: [] }
    onShow = (item) => {
        let { khoaSv, thongTinKhoaNganh, maDangKy, nam } = item;
        let { maNganh, khoaDangKy, loaiHinhDaoTao, bacDaoTao } = thongTinKhoaNganh;
        this.setState({ listMonHocChonChung: [], listMonHocChonChuyenNganh: [], listMonHocChonNgoaiCtdt: [] });
        this.props.getDanhSachMonChuongTrinhDaoTao({ maNganh, khoaSv, loaiHinhDaoTao, bacDaoTao }, value => {
            this.listMonHocChung = value.listMonHocChung || [];
            this.listMonHocChuyenNganh = value.listMonHocChuyenNganh || [];
            this.listMonHocNgoaiCtdt = value.listMonHocNgoaiCtdt || [];
            this.setState({ listMonHocChung: value.listMonHocChung || [], listMonHocChuyenNganh: value.listMonHocChuyenNganh || [], listMonHocNgoaiCtdt: value.listMonHocNgoaiCtdt || [], khoaSv, maNganh, khoaDangKy, maDangKy, loaiHinhDaoTao, bacDaoTao, nam }, () => {
                this.init();
            });
        });
    }    

    init = () => {
        this.props.getAllDtSettings(items => {
            this.settings = items;
        });
        this.setState({ listMonHocChonChung: this.state.listMonHocChung.filter(item => item.isMo) }, () => {
            this.state.listMonHocChonChung.forEach(item => {
                ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                    this.monChung[textBox][item.maMonHoc].value(item[textBox]);
                });
            });
        });

        this.setState({ listMonHocChonChuyenNganh: this.state.listMonHocChuyenNganh.filter(item => item.isMo) }, () => {
            for (let index = 0; index < this.state.listMonHocChonChuyenNganh.length; index++) {
                const item = this.state.listMonHocChonChuyenNganh[index];
                if (item.soLop && !isNaN(item.soLop)) {
                    item.soLop = Number(item.soLop);
                    if (item.soLop == 1 && item.chuyenNganh.length == 1) {
                        ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                            this.monChuyenNganh[textBox][item.maMonHoc].value(item[textBox]);
                        });
                    } else if (item.soLop > 1 && item.chuyenNganh.length > 1) {
                        this.setState({ [`CN_${item.maMonHoc}`]: item.soLop }, () => {
                            this.monChuyenNganh.soLop[item.maMonHoc].value(item.soLop);
                            Array.from({ length: Number(item.soLop) }, (_, i) => i).forEach(i => {
                                ['soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                                    this.subChuyenNganh[item.maMonHoc][textBox][i + 1].value(item[textBox][i]);
                                });
                                this.subChuyenNganh[item.maMonHoc]['chuyenNganh'][i + 1].value(item.currentCn[i]);
                            });
                        });
                    } else {
                        ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien', 'chuyenNganh'].forEach(textBox => {
                            this.monChuyenNganh[textBox][item.maMonHoc].value(item[textBox]);
                        });
                    }
                }
            }
        });
        
        this.setState({ listMonHocChonNgoaiCtdt: this.state.listMonHocNgoaiCtdt.filter(item => item.isMo) }, () => {
            this.state.listMonHocChonNgoaiCtdt.forEach(item => {
                ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                    this.monChung[textBox][item.maMonHoc].value(item[textBox]);
                });
            });
        });
    }

    componentDidUpdate() {
        $('.draggable tbody').draggable({
            helper: 'clone',
            containment: 'body',
            scroll: true,
            backgroundColor: 'red',
            zIndex: 99999,
            start: (event, ui) => {
                ui.helper.css('background-color', 'paleturquoise');
                ui.helper.css('cursor', 'grabbing');
            }

        });
        $('.droppable tbody').draggable({
            helper: 'clone',
            containment: 'body',
            cursor: 'grabbing',
            scroll: true,
            backgroundColor: null,
            zIndex: 99999,
            drag: (event, ui) => {
                ui.helper.css('background-color', 'paleturquoise');
                ui.helper.css('cursor', 'grabbing');
            }
        });

        $('.droppable').droppable({
            accept: 'tbody',
            drop: (event, ui) => {
                try {
                    const id = ui.draggable.attr('idbang');
                    const ma = ui.draggable.attr('mamon');
                    let listChon;
                    if (id == 'monChung') {
                        listChon = this.state.listMonHocChung.filter(e => e.maMonHoc == ma);
                    } else if (id == 'monChuyenNganh') {
                        listChon = this.state.listMonHocChuyenNganh.filter(e => e.maMonHoc == ma);
                    } else if (id == 'monNgoaiCtdt') {
                        listChon = this.state.listMonHocNgoaiCtdt.filter(e => e.maMonHoc == ma);
                    }
                    listChon[0].isMo = !listChon[0].isMo;
                    this.init();
                    if (listChon[0].isMo ==  true){
                        T.notify('Đã chọn môn ' + listChon[0].maMonHoc + '_' + listChon[0].tenMonHoc, 'success');
                    }
                    else if(listChon[0].isMo ==  false){
                        T.notify('Đã bỏ chọn môn ' + listChon[0].maMonHoc + '_' + listChon[0].tenMonHoc, 'danger');
                    }
                } catch (error) {
                    T.notify('Chọn môn không thành công!', 'danger');
                }
            }
        });
    }

    renderMonHocChung = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Không có môn học chưa chọn',
        header: 'thead-light',
        stickyHead: true,
        className: 'mamon',
        renderHead: () => <tr>
            <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
            <th style={{ width: '100%' }}>Mã môn học</th>
            <th style={{ width: 'auto' }}>Chọn</th>
        </tr>,
        multipleTbody: true,
        renderRow: (item, index) => {
            return (
                <tbody key={index} idbang='monChung' mamon={item.maMonHoc}>
                    <tr>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={
                            <Tooltip title={item.tenMonHoc} arrow>
                                <span style={{ color: 'blue' }}>{item.maMonHoc}</span>
                            </Tooltip>
                        } />
                        <TableCell type='checkbox' content={item.isMo} permission={{ write: true }}
                            onChanged={() => {
                                list[index].isMo = !list[index].isMo;
                                T.notify('Đã chọn môn ' + item.maMonHoc + '_' + item.tenMonHoc, 'success');
                                this.setState({ listMonHocChungSelected: list }, () => {
                                    ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => this.monChung[textBox][item.maMonHoc].value(item[textBox]));
                                    let listMonHocChonChung = this.state.listMonHocChonChung;
                                    listMonHocChonChung.push(item);
                                    this.setState({ listMonHocChonChung });
                                });                                
                            }} />
                    </tr>
                </tbody>
            );
        }
    })

    renderSelectedMonHocChung = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Không có môn học được chọn',
        header: 'thead-light',
        stickyHead: true,
        className: 'mamon',
        renderHead: () => <tr>
            <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã môn học</th>
            <th style={{ width: 'auto' }}>Chọn</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết LT/TH</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lớp</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết/buổi</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số buổi/tuần</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lượng dự kiến</th>
        </tr>,
        multipleTbody: true,
        renderRow: (item, index) => {
            ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                this.monChung[textBox] = {};
            });
            return (
                <tbody key={index} idbang='monChung' mamon={item.maMonHoc}>
                    <tr>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={
                            <Tooltip title={item.tenMonHoc} arrow>
                                <span style={{ color: 'blue' }}>{item.maMonHoc}</span>
                            </Tooltip>
                        } />
                        <TableCell type='checkbox' content={item.isMo} permission={{ write: true }}
                            onChanged={() => {
                                list[index].isMo = !list[index].isMo;
                                T.notify('Đã bỏ chọn môn ' + item.maMonHoc + '_' + item.tenMonHoc, 'danger');
                                this.setState({ listMonHocChungSelected: list }, () => {
                                    let listMonHocChonChung = this.state.listMonHocChonChung;
                                    listMonHocChonChung = listMonHocChonChung.filter(monHoc => monHoc.maMonHoc != item.maMonHoc);
                                    this.setState({ listMonHocChonChung });
                                });
                            }}
                        />
                        <TableCell style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content={
                                <div>{item.soTietLyThuyet} / {item.soTietThucHanh}</div>
                        } />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormTextBox type='number' ref={e => this.monChung.soLop[item.maMonHoc] = e}  style={{ marginBottom: '0' }} readOnly={!item.isMo}
                                placeholder={'Từ ' + this.settings.tkbSoLopMin + ' - đến ' + this.settings.tkbSoLopMax } min={ this.settings.tkbSoLopMin } max={ this.settings.tkbSoLopMax } />
                        } />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormTextBox type='number' ref={e => this.monChung.soTietBuoi[item.maMonHoc] = e} style={{ marginBottom: '0' }} readOnly={!item.isMo}
                                placeholder={'Từ ' + this.settings.tkbSoTietBuoiMin + ' - đến ' + this.settings.tkbSoTietBuoiMax } min={ this.settings.tkbSoTietBuoiMin } max={ this.settings.tkbSoTietBuoiMax } />
                        } />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormTextBox type='number' ref={e => this.monChung.soBuoiTuan[item.maMonHoc] = e} style={{ marginBottom: '0' }} readOnly={!item.isMo}
                                placeholder={'Từ ' + this.settings.tkbSoBuoiTuanMin + ' - đến ' + this.settings.tkbSoBuoiTuanMax } min={ this.settings.tkbSoBuoiTuanMin } max={ this.settings.tkbSoBuoiTuanMax } />
                        } />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormTextBox type='number' ref={e => this.monChung.soLuongDuKien[item.maMonHoc] = e} style={{ marginBottom: '0', width: '100px' }} readOnly={!item.isMo} />
                        } />
                    </tr>
                </tbody>
            );
        }
    })

    renderMonHocChuyenNganh = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Không có môn học chưa chọn',
        header: 'thead-light',
        stickyHead: true,
        className: 'mamon',
        renderHead: () => <tr>
            <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Mã môn học</th>
            <th style={{ width: 'auto' }}>Chọn</th>
        </tr>,
        multipleTbody: true,
        renderRow: (item, index) => {
            
            return (
                <React.Fragment key={index}>
                    <tbody key={0} idbang='monChuyenNganh' mamon={item.maMonHoc}><tr>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={
                            <Tooltip title={ item.tenMonHoc } arrow>
                                <span style={{ color: 'blue' }}>{ item.maMonHoc }</span>
                            </Tooltip>
                        } />
                        <TableCell type='checkbox' content={item.isMo} permission={{ write: true }}
                            onChanged={(value) => {
                                item.isMo = !item.isMo;
                                T.notify('Đã chọn môn ' + item.maMonHoc + '_' + item.tenMonHoc, 'success');
                                this.setState({ listMonHocChuyenNganhSelected: list }, () => {
                                    if (value) {
                                        ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => this.monChuyenNganh[textBox][item.maMonHoc]?.value(item.isMo ? Number(item[textBox]) : ''));

                                        if (item.isMo && (!item.soLop || item.soLop == '')) this.monChuyenNganh.soLop[item.maMonHoc].value(1);
                                        if (item.isMo && item.chuyenNganh.length > 1) this.monChuyenNganh.chuyenNganh[item.maMonHoc].value(item.chuyenNganh);
                                        this.monChuyenNganh.soLop[item.maMonHoc].focus();
                                        this.setState({ listMonHocChonChuyenNganh: [...this.state.listMonHocChonChuyenNganh, item] });
                                    } else {
                                        ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => this.monChuyenNganh[textBox][item.maMonHoc]?.value(''));

                                        if (item.chuyenNganh.length > 1) {
                                            this.setState({ [index]: null }, () => {
                                                this.subChuyenNganh[item.maMonHoc] = null;
                                            });
                                        }
                                        this.setState({ listMonHocChonChuyenNganh: [...this.state.listMonHocChonChuyenNganh].filter(monChon => monChon.maMonHoc != item.maMonHoc) });
                                    }
                                });
                            }}
                        />
                    </tr></tbody>
                </React.Fragment>
            );
        }
    })

    renderSelectedMonHocChuyenNganh = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Không có môn học được chọn',
        header: 'thead-light',
        stickyHead: true,
        className: 'mamon',
        renderHead: () => <tr>
            <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã môn học</th>
            <th style={{ width: 'auto' }}>Chọn</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lớp</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết/buổi</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số buổi/tuần</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lượng dự kiến</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Chuyên ngành</th>
        </tr>,
        multipleTbody: true,
        renderRow: (item, index) => {
            ['chuyenNganh', 'soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                this.monChuyenNganh[textBox] = {};
            });
            let readOnly = !item.isMo || this.state[`CN_${item.maMonHoc}`];
            return (
                <React.Fragment key={index}>
                    <tbody key={0} idbang='monChuyenNganh' mamon={item.maMonHoc}><tr>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={
                            <Tooltip title={ item.tenMonHoc } arrow>
                                <span style={{ color: 'blue' }}>{ item.maMonHoc }</span>
                            </Tooltip>
                        } />
                        <TableCell type='checkbox' content={item.isMo} permission={{ write: true }}
                            onChanged={(value) => {
                                item.isMo = !item.isMo;
                                T.notify('Đã bỏ chọn môn ' + item.maMonHoc + '_' + item.tenMonHoc, 'danger');
                                // this.setState({ listMonHocChuyenNganh: list }, () => {
                                    if (value) {
                                        ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => this.monChuyenNganh[textBox][item.maMonHoc]?.value(item.isMo ? Number(item[textBox]) : ''));

                                        if (item.isMo && (!item.soLop || item.soLop == '')) this.monChuyenNganh.soLop[item.maMonHoc].value(1);
                                        if (item.isMo && item.chuyenNganh.length > 1) this.monChuyenNganh.chuyenNganh[item.maMonHoc].value(item.chuyenNganh);
                                        this.monChuyenNganh.soLop[item.maMonHoc].focus();
                                        this.setState({ listMonHocChonChuyenNganh: [...this.state.listMonHocChonChuyenNganh, item] });
                                    } else {
                                        ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => this.monChuyenNganh[textBox][item.maMonHoc]?.value(''));

                                        if (item.chuyenNganh.length > 1) {
                                            this.setState({ [index]: null }, () => {
                                                this.subChuyenNganh[item.maMonHoc] = null;
                                            });
                                        }
                                        this.setState({ listMonHocChonChuyenNganh: [...this.state.listMonHocChonChuyenNganh].filter(monChon => monChon.maMonHoc != item.maMonHoc) });
                                    }

                                // });
                            }}
                        />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormTextBox type='number' ref={e => this.monChuyenNganh.soLop[item.maMonHoc] = e} style={{ marginBottom: '0' }} readOnly={!item.isMo}
                                placeholder={'Từ ' + this.settings.tkbSoLopMin + ' - đến ' + this.settings.tkbSoLopMax } min={ this.settings.tkbSoLopMin } max={ this.settings.tkbSoLopMax } 
                                onChange={e => {
                                    if (item.chuyenNganh.length > 1) {
                                        item.soLop = e;
                                        if (!isNaN(e) && e > 1) {
                                            this.setState({ [`CN_${item.maMonHoc}`]: e });
                                        } else if (e == 1) {
                                            this.setState({ [`CN_${item.maMonHoc}`]: null });
                                        }
                                    }
                                }}
                            />
                        } />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormTextBox type='number' ref={e => this.monChuyenNganh.soTietBuoi[item.maMonHoc] = e} style={{ marginBottom: '0' }} readOnly={readOnly}
                                placeholder={'Từ ' + this.settings.tkbSoTietBuoiMin + ' - đến ' + this.settings.tkbSoTietBuoiMax } min={ this.settings.tkbSoTietBuoiMin } max={ this.settings.tkbSoTietBuoiMax } />
                        } />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormTextBox type='number' ref={e => this.monChuyenNganh.soBuoiTuan[item.maMonHoc] = e} style={{ marginBottom: '0' }} readOnly={readOnly}
                                placeholder={'Từ ' + this.settings.tkbSoBuoiTuanMin + ' - đến ' + this.settings.tkbSoBuoiTuanMax } min={ this.settings.tkbSoBuoiTuanMin } max={ this.settings.tkbSoBuoiTuanMax } />
                        } />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormTextBox type='number' ref={e => this.monChuyenNganh.soLuongDuKien[item.maMonHoc] = e} style={{ marginBottom: '0', width: '100px' }} readOnly={readOnly} />
                        } />
                        <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={
                            item.chuyenNganh.length > 1 && item.isMo && !this.state[`CN_${item.maMonHoc}`] ?
                                <FormSelect ref={e => this.monChuyenNganh.chuyenNganh[item.maMonHoc] = e} style={{ marginBottom: '0', width: 'auto' }} data={item.chuyenNganh.map((cn, index) => ({ id: cn, text: item.tenChuyenNganh[index] }))} multiple /> : item.tenChuyenNganh.join(', ')
                        } />
                    </tr></tbody>
                    {Array.from({ length: this.state[`CN_${item.maMonHoc}`] }, (_, i) => i + 1).map(i => {
                        this.subChuyenNganh[item.maMonHoc] = {
                            soLuongDuKien: {},
                            soTietBuoi: {},
                            soBuoiTuan: {},
                            chuyenNganh: {}
                        };
                        const style = { marginBottom: '0', width: 'auto' };
                        return (
                            <tr key={`sub-${i}`} style={{ display: this.state[`CN_${item.maMonHoc}`] ? '' : 'none' }}>
                                <TableCell style={{ textAlign: 'right' }} content={`Lớp ${i}`} colSpan={4} />
                                <TableCell content={
                                    <FormTextBox type='number' ref={e => this.subChuyenNganh[item.maMonHoc].soTietBuoi[i] = e} min={ this.settings.tkbSoTietBuoiMin } max={ this.settings.tkbSoTietBuoiMax } style={style} />
                                } />
                                <TableCell content={
                                    <FormTextBox type='number' ref={e => this.subChuyenNganh[item.maMonHoc].soBuoiTuan[i] = e} min={ this.settings.tkbSoBuoiTuanMin } max={ this.settings.tkbSoBuoiTuanMax } style={style} />
                                } />
                                <TableCell content={
                                    <FormTextBox type='number' ref={e => this.subChuyenNganh[item.maMonHoc].soLuongDuKien[i] = e} style={style} />
                                } />
                                <TableCell content={
                                    <FormSelect ref={e => this.subChuyenNganh[item.maMonHoc].chuyenNganh[i] = e} data={item.chuyenNganh.map((cn, index) => ({ id: cn, text: item.tenChuyenNganh[index] }))} multiple style={style} />
                                } colSpan={2} />
                            </tr>
                        );
                    })
                    }
                </React.Fragment>
            );
        }
    })

    renderMonHocNgoaiCtdt = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Không có môn học chưa chọn',
        header: 'thead-light',
        stickyHead: true,
        className: 'mamon',
        renderHead: () => <tr>
            <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Mã môn học</th>
            <th style={{ width: 'auto' }}>Chọn</th>
        </tr>,
        multipleTbody: true,
        renderRow: (item, index) => {
            return (
                <React.Fragment key={index}>
                    <tbody key={0} idbang='monNgoaiCtdt' mamon={item.maMonHoc}><tr>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={
                            <Tooltip title={item.tenMonHoc} arrow>
                                <span style={{ color: 'blue' }}>{item.maMonHoc}</span>
                            </Tooltip>
                        } />
                        <TableCell type='checkbox' content={item.isMo} permission={{ write: true }}
                            onChanged={(value) => {
                                item.isMo = !item.isMo;
                                T.notify('Đã chọn môn ' + item.maMonHoc + '_' + item.tenMonHoc, 'success');
                                this.setState({ listMonHocNgoaiCtdtSelected: list }, () => {
                                    if (value) {
                                        ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => this.monNgoaiCtdt[textBox][item.maMonHoc]?.value(item.isMo ? Number(item[textBox]) : ''));

                                        if (item.isMo && (!item.soLop || item.soLop == '')) this.monNgoaiCtdt.soLop[item.maMonHoc].value(1);
                                        if (item.isMo && item.chuyenNganh.length > 1) this.monNgoaiCtdt.chuyenNganh[item.maMonHoc].value(item.chuyenNganh);
                                        this.monNgoaiCtdt.soLop[item.maMonHoc].focus();
                                        this.setState({ listMonHocNgoaiCtdtSelected: [...this.state.listMonHocChonNgoaiCtdt, item] });
                                    } else {
                                        ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => this.monNgoaiCtdt[textBox][item.maMonHoc]?.value(''));

                                        if (item.chuyenNganh.length > 1) {
                                            this.setState({ [index]: null }, () => {
                                                this.subChuyenNganh[item.maMonHoc] = null;
                                            });
                                        }
                                        this.setState({ listMonHocNgoaiCtdtSelected: [...this.state.listMonHocChonNgoaiCtdt].filter(monChon => monChon.maMonHoc != item.maMonHoc) });
                                    }
                                });
                            }}
                        />
                    </tr></tbody>
                </React.Fragment>
            );
        }
    })

    renderSelectedMonHocNgoaiCtdt = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Không có môn học được chọn',
        header: 'thead-light',
        stickyHead: true,
        className: 'mamon',
        renderHead: () => <tr>
            <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã môn học</th>
            <th style={{ width: 'auto' }}>Chọn</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lớp</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết/buổi</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số buổi/tuần</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lượng dự kiến</th>
        </tr>,
        multipleTbody: true,
        renderRow: (item, index) => {
            ['chuyenNganh', 'soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                this.monNgoaiCtdt[textBox] = {};
            });
            let readOnly = !item.isMo || this.state[`CN_${item.maMonHoc}`];
            return (
                <React.Fragment key={index}>
                    <tbody key={0} idbang='monNgoaiCtdt' mamon={item.maMonHoc}><tr>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={
                            <Tooltip title={item.tenMonHoc} arrow>
                                <span style={{ color: 'blue' }}>{item.maMonHoc}</span>
                            </Tooltip>
                        } />
                        <TableCell type='checkbox' content={item.isMo} permission={{ write: true }}
                            onChanged={(value) => {
                                item.isMo = !item.isMo;
                                T.notify('Đã bỏ chọn môn ' + item.maMonHoc + '_' + item.tenMonHoc, 'danger');
                                if (value) {
                                    ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => this.monNgoaiCtdt[textBox][item.maMonHoc]?.value(item.isMo ? Number(item[textBox]) : ''));

                                    if (item.isMo && (!item.soLop || item.soLop == '')) this.monNgoaiCtdt.soLop[item.maMonHoc].value(1);
                                    if (item.isMo && item.chuyenNganh.length > 1) this.monNgoaiCtdt.chuyenNganh[item.maMonHoc].value(item.chuyenNganh);
                                    this.monNgoaiCtdt.soLop[item.maMonHoc].focus();
                                    this.setState({ listMonHocChonNgoaiCtdt: [...this.state.listMonHocChonNgoaiCtdt, item] });
                                } else {
                                    ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => this.monNgoaiCtdt[textBox][item.maMonHoc]?.value(''));

                                    if (item.chuyenNganh.length > 1) {
                                        this.setState({ [index]: null }, () => {
                                            this.subChuyenNganh[item.maMonHoc] = null;
                                        });
                                    }
                                    this.setState({ listMonHocChonNgoaiCtdt: [...this.state.listMonHocChonNgoaiCtdt].filter(monChon => monChon.maMonHoc != item.maMonHoc) });
                                }
                            }}
                        />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormTextBox type='number' ref={e => this.monNgoaiCtdt.soLop[item.maMonHoc] = e} style={{ marginBottom: '0' }} readOnly={!item.isMo}
                                placeholder={'Từ ' + this.settings.tkbSoLopMin + ' - đến ' + this.settings.tkbSoLopMax } min={ this.settings.tkbSoLopMin } max={ this.settings.tkbSoLopMax }
                                onChange={e => {
                                    if (item.chuyenNganh.length > 1) {
                                        item.soLop = e;
                                        if (!isNaN(e) && e > 1) {
                                            this.setState({ [`CN_${item.maMonHoc}`]: e });
                                        } else if (e == 1) {
                                            this.setState({ [`CN_${item.maMonHoc}`]: null });
                                        }
                                    }
                                }}
                            />
                        } />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormTextBox type='number' ref={e => this.monNgoaiCtdt.soTietBuoi[item.maMonHoc] = e} style={{ marginBottom: '0' }} readOnly={readOnly}
                                placeholder={'Từ ' + this.settings.tkbSoTietBuoiMin + ' - đến ' + this.settings.tkbSoTietBuoiMax } min={ this.settings.tkbSoTietBuoiMin } max={ this.settings.tkbSoTietBuoiMax } />
                        } />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormTextBox type='number' ref={e => this.monNgoaiCtdt.soBuoiTuan[item.maMonHoc] = e} style={{ marginBottom: '0' }} readOnly={readOnly}
                                placeholder={'Từ ' + this.settings.tkbSoBuoiTuanMin + ' - đến ' + this.settings.tkbSoBuoiTuanMax } min={ this.settings.tkbSoBuoiTuanMin } max={ this.settings.tkbSoBuoiTuanMax } />
                        } />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormTextBox type='number' ref={e => this.monNgoaiCtdt.soLuongDuKien[item.maMonHoc] = e} style={{ marginBottom: '0', width: '100px' }} readOnly={readOnly} />
                        } />
                    </tr></tbody>
                </React.Fragment>
            );
        }
    })

    getData = () => {
        let { listMonHocChonChung, listMonHocChonChuyenNganh } = this.state;
        try {  
            listMonHocChonChung && listMonHocChonChung.length && listMonHocChonChung.forEach(monHoc => {
                ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                    if (!this.monChung[textBox][monHoc.maMonHoc].value()) {
                        this.monChung[textBox][monHoc.maMonHoc].focus();
                        throw ('Vui lòng nhập đầy đủ thông tin');
                    }
                    else monHoc[textBox] = this.monChung[textBox][monHoc.maMonHoc].value();
                });
                monHoc.khoa = this.state.khoaDangKy;
                monHoc.khoaSv = this.state.khoaSv;
                monHoc.maDangKy = this.state.maDangKy;
            });

            listMonHocChonChuyenNganh && listMonHocChonChuyenNganh.length && listMonHocChonChuyenNganh.forEach(monHoc => {
                if (monHoc.chuyenNganh.length == 1 || (monHoc.chuyenNganh.length > 1 && monHoc.soLop == 1)) {
                    ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                        if (!this.monChuyenNganh[textBox][monHoc.maMonHoc].value()) {
                            this.monChuyenNganh[textBox][monHoc.maMonHoc].focus();
                            throw ('Vui lòng nhập đầy đủ thông tin');
                        }
                        else monHoc[textBox] = this.monChuyenNganh[textBox][monHoc.maMonHoc].value();
                    });
                } else {
                    monHoc.monChuyenNganh = {};
                    ['soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                        monHoc.monChuyenNganh[textBox] = {};
                        Array.from({ length: monHoc.soLop }, (_, i) => i + 1).forEach(i => {
                            if (!this.subChuyenNganh[monHoc.maMonHoc][textBox][i].value()) {
                                this.subChuyenNganh[monHoc.maMonHoc][textBox][i].focus();
                                throw ('Vui lòng nhập đầy đủ thông tin');
                            }
                            else {
                                let value = textBox == 'chuyenNganh' ? this.subChuyenNganh[monHoc.maMonHoc][textBox][i].value() : this.subChuyenNganh[monHoc.maMonHoc][textBox][i].value();
                                monHoc.monChuyenNganh[textBox][i] = value;
                            }
                        });
                    });
                }
                monHoc.khoa = this.state.khoaDangKy;
                monHoc.khoaSv = this.state.khoaSv;
                monHoc.maDangKy = this.state.maDangKy;
            });
            return [...listMonHocChonChung, ...listMonHocChonChuyenNganh];
        } catch (error) {
            T.notify(error, 'danger');
            return [];
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        let { loaiHinhDaoTao, bacDaoTao } = this.state;
        let data = this.getData();
        if (data && data.length) {
            this.props.createDtDanhSachMonMo(this.state.maNganh, data, { loaiHinhDaoTao, bacDaoTao, maDangKy: this.state.maDangKy }, this.hide);
        } else {
            T.notify('Chưa chọn môn mở cho khóa!', 'danger');
        }
    }



    

    render = () => {
        let { listMonHocChung, listMonHocChuyenNganh, listMonHocNgoaiCtdt, khoaSv } = this.state;
        let monHocChung, selectedMonHocChung;
        let monHocChuyenNganh, selectedMonHocChuyenNganh;
        let monHocNgoaiCtdt, selectedMonHocNgoaiCtdt;
        if (listMonHocChung || listMonHocChuyenNganh || listMonHocNgoaiCtdt) {
            monHocChung = listMonHocChung.filter(e => e.isMo == false);
            selectedMonHocChung = listMonHocChung.filter(e => e.isMo == true);
            monHocChuyenNganh = listMonHocChuyenNganh.filter(e => e.isMo == false);
            selectedMonHocChuyenNganh = listMonHocChuyenNganh.filter(e => e.isMo == true);
            monHocNgoaiCtdt = listMonHocNgoaiCtdt.filter(e => e.isMo == false);
            selectedMonHocNgoaiCtdt = listMonHocNgoaiCtdt.filter(e => e.isMo == true);
        }

        return this.renderModal({
            title: `Chọn môn học từ Chương trình đào tạo khóa ${khoaSv || ''}`,
            size: 'elarge',
            isShowSubmit: listMonHocChung?.length && listMonHocChuyenNganh?.length && listMonHocNgoaiCtdt?.length,
            body: <div >
                <ul className='nav nav-tabs'>
                    <li className='nav-item'>
                        <a className='nav-link active show' data-toggle='tab' href='#monChung'>Chọn các môn cho toàn khóa {khoaSv || ''}</a>
                    </li>
                    <li className='nav-item'>
                        <a className='nav-link' data-toggle='tab' href='#monChuyenNganh'>Chọn các môn cho chuyên ngành</a>
                    </li>
                    <li className='nav-item'>
                        <a className='nav-link' data-toggle='tab' href='#monNgoaiCtdt'>Chọn các môn ngoài chương trình đào tạo</a>
                    </li>
                </ul>
                <div className='tab-content'>
                    <div className='tab-pane fade active show' id='monChung'>
                        <div className='subj-table' style={{ display: 'flex', flexDirection: 'row' }}>
                            <div className='draggable' style={{ width: '20%', padding: '5px 10px 0 0' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <h6>Môn học chung</h6>
                                </div>
                                {<FormTextBox ref={e => this.searchBox = e} style={{ marginBottom: '0' }} placeholder='Tìm kiếm môn chung' onChange={e => {
                                    if (e && e.target && e.target.value) {
                                        let textSearch = e.target.value;
                                        this.setState({ listMonHocChung: this.state.listMonHocChung.filter(item => item.maMonHoc.includes(textSearch) || item.tenMonHoc.includes(textSearch)) }, () => {
                                            this.init();
                                        });
                                    } else {
                                        this.setState({ listMonHocChung: this.listMonHocChung }, () => this.init);
                                    }
                                }} />}
                                {this.renderMonHocChung(monHocChung)}
                            </div>
                            <div className='droppable' style={{ width: '80%', padding: '5px 0 0 10px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <h6>Môn học chung đã được chọn</h6>
                                </div>
                                {<FormTextBox ref={e => this.searchBox = e} style={{ marginBottom: '0' }} placeholder='Tìm kiếm môn chung được chọn' onChange={e => {
                                    if (e && e.target && e.target.value) {
                                        let textSearch = e.target.value;
                                        this.setState({ listMonHocChung: this.state.listMonHocChung.filter(item => item.maMonHoc.includes(textSearch) || item.tenMonHoc.includes(textSearch)) }, () => {
                                            this.init();
                                        });
                                    } else {
                                        this.setState({ listMonHocChung: this.listMonHocChung }, () => this.init);
                                    }
                                }} />}
                                {this.renderSelectedMonHocChung(selectedMonHocChung)}
                            </div>
                        </div>
                    </div>
                    <div className='tab-pane fade' id='monChuyenNganh'>
                        <div className='subj-table' style={{ display: 'flex', flexDirection: 'row' }}>
                            <div className='draggable' style={{ width: '20%', padding: '5px 10px 0 0' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <h6>Môn chuyên ngành</h6>
                                </div>
                                {<FormTextBox style={{ marginBottom: '0' }} placeholder='Tìm kiếm môn chuyên ngành' onChange={e => {
                                    if (e && e.target && e.target.value) {
                                        let textSearch = e.target.value;
                                        this.setState({ listMonHocChuyenNganh: this.state.listMonHocChuyenNganh.filter(item => item.maMonHoc.includes(textSearch) || item.tenMonHoc.includes(textSearch)) }, () => {
                                            if (!this.state.listMonHocChuyenNganh.length) this.setState({ listMonHocChuyenNganh: this.listMonHocChuyenNganh });
                                            this.init();

                                        });
                                    } else {
                                        this.setState({ listMonHocChuyenNganh: this.listMonHocChuyenNganh }, () => this.init);
                                    }
                                }} />}
                                {this.renderMonHocChuyenNganh(monHocChuyenNganh)}
                            </div>
                            <div className='droppable' style={{ width: '80%', padding: '5px 0 0 10px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <h6>Môn chuyên ngành đã được chọn</h6>
                                </div>
                                {<FormTextBox style={{ marginBottom: '0' }} placeholder='Tìm kiếm môn chuyên ngành đã chọn' onChange={e => {
                                    if (e && e.target && e.target.value) {
                                        let textSearch = e.target.value;
                                        this.setState({ listMonHocChuyenNganh: this.state.listMonHocChuyenNganh.filter(item => item.maMonHoc.includes(textSearch) || item.tenMonHoc.includes(textSearch)) }, () => {
                                            if (!this.state.listMonHocChuyenNganh.length) this.setState({ listMonHocChuyenNganh: this.listMonHocChuyenNganh });
                                            this.init();

                                        });
                                    } else {
                                        this.setState({ listMonHocChuyenNganh: this.listMonHocChuyenNganh }, () => this.init);
                                    }
                                }} />}
                                {this.renderSelectedMonHocChuyenNganh(selectedMonHocChuyenNganh)}
                            </div>
                        </div>
                    </div>
                    <div className='tab-pane fade' id='monNgoaiCtdt'>
                        <div className='subj-table' style={{ display: 'flex', flexDirection: 'row' }}>
                            <div className='draggable' style={{ width: '20%', padding: '5px 10px 0 0' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <h6>Môn ngoài CTDT</h6>
                                </div>
                                {<FormTextBox style={{ marginBottom: '0' }} placeholder='Tìm kiếm môn ngoài CTDT' onChange={e => {
                                    if (e && e.target && e.target.value) {
                                        let textSearch = e.target.value;
                                        this.setState({ listMonHocNgoaiCtdt: this.state.listMonHocNgoaiCtdt.filter(item => item.maMonHoc.includes(textSearch) || item.tenMonHoc.includes(textSearch)) }, () => {
                                            if (!this.state.listMonHocNgoaiCtdt.length) this.setState({ listMonHocNgoaiCtdt: this.listMonHocNgoaiCtdt });
                                            this.init();

                                        });
                                    } else {
                                        this.setState({ listMonHocNgoaiCtdt: this.listMonHocNgoaiCtdt }, () => this.init);
                                    }
                                }} />}
                                {this.renderMonHocNgoaiCtdt(monHocNgoaiCtdt)}
                            </div>
                            <div className='droppable' style={{ width: '80%', padding: '5px 0 0 10px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <h6>Môn ngoài chương trình đào tạo đã được chọn</h6>
                                </div>
                                {<FormTextBox style={{ marginBottom: '0' }} placeholder='Tìm kiếm môn ngoài chương trình đào tạo đã chọn' onChange={e => {
                                    if (e && e.target && e.target.value) {
                                        let textSearch = e.target.value;
                                        this.setState({ listMonHocNgoaiCtdt: this.state.listMonHocNgoaiCtdt.filter(item => item.maMonHoc.includes(textSearch) || item.tenMonHoc.includes(textSearch)) }, () => {
                                            if (!this.state.listMonHocNgoaiCtdt.length) this.setState({ listMonHocNgoaiCtdt: this.listMonHocNgoaiCtdt });
                                            this.init();

                                        });
                                    } else {
                                        this.setState({ listMonHocChuyenNganh: this.listMonHocChuyenNganh }, () => this.init);
                                    }
                                }} />}
                                {this.renderSelectedMonHocNgoaiCtdt(selectedMonHocNgoaiCtdt)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getDanhSachMonChuongTrinhDaoTao, createDtDanhSachMonMo, getAllDtSettings
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(MonHocCtdtModal);