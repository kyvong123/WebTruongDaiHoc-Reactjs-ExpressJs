import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormDatePicker, FormSelect, FormTextBox, renderDataTable, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_DmPhongThi } from 'modules/mdDanhMuc/dmPhong/redux';
import { checkIfTrungLich } from 'modules/mdDaoTao/dtExam/redux';
const HOUR = 60 * 60 * 1000;

class SectionNgayPhongThi extends AdminPage {
    soLuong = {};
    batDau = {};
    ketThuc = {};
    phong = {};

    componentDidMount() {
    }

    setValue = () => {
        this.setState({ listHocPhan: this.props.listHocPhan, filter: this.props.filter, current: Date.now() }, () => {
            for (const hocPhan of this.state.listHocPhan) {
                this.soLuong[`${hocPhan.maHocPhan}_${hocPhan.caThi}`]?.value(hocPhan.soLuongDangKyCa || 0);
                this.batDau[`${hocPhan.maHocPhan}_${hocPhan.caThi}`]?.value('');
                this.ketThuc[`${hocPhan.maHocPhan}_${hocPhan.caThi}`]?.value('');
                this.phong[`${hocPhan.maHocPhan}_${hocPhan.caThi}`]?.value('');
            }
            let filter = {
                listMaHocPhan: this.state.listHocPhan.map(item => item.maHocPhan).join(','),
                namHocHocPhi: this.state.filter.namHoc,
                hocKyHocPhi: this.state.filter.hocKy
            };
            this.props.getSinhVien(filter, data => {
                this.setState({ dssvTong: data.groupBy('hocPhan') });
            });
        });
    }

    tableXepLich = (list, filter) => renderDataTable({
        emptyTable: 'Không có học phần để tạo lịch thi',
        data: list == null ? null : Object.keys(list.groupBy('maHocPhan')),
        stickyHead: false,
        style: { height: '51vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã học phần</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Tên môn học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kỳ thi</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian thi (phút)</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SLĐK</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ca thi</th>
                <th style={{ minWidth: '70px', whiteSpace: 'nowrap', textAlign: 'center' }}>SL</th>
                <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Bắt đầu <span className='text-danger'>*</span></th>
                <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Kết thúc <span className='text-danger'>*</span></th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Phòng <span className='text-danger'>*</span></th>
            </tr>),
        renderRow: (item, index) => {
            const rows = [];
            let listHocPhan = list.groupBy('maHocPhan')[item] || [],
                rowSpan = listHocPhan.length;
            if (rowSpan) {
                for (let i = 0; i < rowSpan; i++) {
                    let hocPhan = listHocPhan[i], key = `${hocPhan.maHocPhan}_${hocPhan.caThi}_${this.state.current}`;
                    if (i == 0) {
                        rows.push(<tr key={key}>
                            <TableCell rowSpan={rowSpan} content={index + 1} />
                            <TableCell rowSpan={rowSpan} style={{ whiteSpace: 'nowrap' }} content={hocPhan.maHocPhan} />
                            <TableCell rowSpan={rowSpan} style={{ whiteSpace: 'nowrap' }} content={T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi} />
                            <TableCell rowSpan={rowSpan} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.loaiKyThi} />
                            <TableCell rowSpan={rowSpan} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.thoiGianThi} />
                            <TableCell rowSpan={rowSpan} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.soLuongDangKy || 0} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.caThi} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                                <FormTextBox ref={e => this.soLuong[`${hocPhan.maHocPhan}_${hocPhan.caThi}`] = e} className='mb-0' type='number' disabled={hocPhan.soCa == 1} min={1} max={this.state.sum} onChange={value => this.handleSoLuong(value, hocPhan)} />
                            } onClick={e => e.preventDefault() || this.click(hocPhan)} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={
                                <FormDatePicker ref={e => this.batDau[`${hocPhan.maHocPhan}_${hocPhan.caThi}`] = e} className='mb-0' type='time' onChange={value => this.handleBatDau(value, hocPhan)} />
                            } />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={
                                <FormDatePicker ref={e => this.ketThuc[`${hocPhan.maHocPhan}_${hocPhan.caThi}`] = e} className='mb-0' type='time' disabled />
                            } />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={
                                <FormSelect ref={e => this.phong[`${hocPhan.maHocPhan}_${hocPhan.caThi}`] = e} className='mb-0' data={SelectAdapter_DmPhongThi(filter)} multiple onChange={this.handlePhong} />
                            } />
                        </tr>);
                    } else {
                        rows.push(<tr key={key}>
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.caThi} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                                <FormTextBox ref={e => this.soLuong[`${hocPhan.maHocPhan}_${hocPhan.caThi}`] = e} className='mb-0' type='number' min={1} max={this.state.sum} onChange={value => this.handleSoLuong(value, hocPhan)} />
                            } onClick={e => e.preventDefault() || this.click(hocPhan)} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={
                                <FormDatePicker ref={e => this.batDau[`${hocPhan.maHocPhan}_${hocPhan.caThi}`] = e} className='mb-0' type='time' onChange={value => this.handleBatDau(value, hocPhan)} />
                            } />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={
                                <FormDatePicker ref={e => this.ketThuc[`${hocPhan.maHocPhan}_${hocPhan.caThi}`] = e} className='mb-0' type='time' disabled />
                            } />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={
                                <FormSelect ref={e => this.phong[`${hocPhan.maHocPhan}_${hocPhan.caThi}`] = e} className='mb-0' data={SelectAdapter_DmPhongThi(filter)} multiple onChange={this.handlePhong} />
                            } />
                        </tr>);
                    }
                }
            }
            return rows;
        }
    });

    click = (hocPhan) => {
        let selector = `${hocPhan.maHocPhan}_${hocPhan.caThi}`,
            currSoLuong = this.soLuong[selector].value(),
            nextCa = hocPhan.caThi == hocPhan.soCa ? 1 : hocPhan.caThi + 1,
            nextCaSelector = `${hocPhan.maHocPhan}_${nextCa}`,
            nextSoLuong = this.soLuong[nextCaSelector].value();
        this.setState({ currSoLuong, nextSoLuong, sum: currSoLuong + nextSoLuong });
    }

    handleSoLuong = (value, hocPhan) => {
        if (value) {
            let listHocPhan = this.state.listHocPhan,
                nextCa = hocPhan.caThi == hocPhan.soCa ? 1 : hocPhan.caThi + 1,
                currSoLuong = this.state.currSoLuong,
                nextCaSelector = `${hocPhan.maHocPhan}_${nextCa}`,
                nextSoLuong = this.state.nextSoLuong;
            let curr = listHocPhan.findIndex(item => item.maHocPhan == hocPhan.maHocPhan && item.caThi == hocPhan.caThi),
                next = listHocPhan.findIndex(item => item.maHocPhan == hocPhan.maHocPhan && item.caThi == nextCa);
            listHocPhan[curr].soLuongDangKyCa = value;
            listHocPhan[next].soLuongDangKyCa = nextSoLuong + currSoLuong - value;
            this.setState({ listHocPhan }, () => {
                this.soLuong[nextCaSelector].value(nextSoLuong + currSoLuong - value);
            });
        }
    }

    handleBatDau = (value, item) => {
        if (value) {
            let batDau = value.getTime(),
                ketThuc = batDau + item.thoiGianThi * HOUR / 60;
            this.setState({ filter: { ...this.state.filter, batDau, ketThuc, coSo: item.coSo } }, () => {
                this.phong[`${item.maHocPhan}_${item.caThi}`]?.value('');
                this.ketThuc[`${item.maHocPhan}_${item.caThi}`]?.value(ketThuc);
            });
        }
    }

    validation = (selector, field) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data && Array.isArray(data) && !data.length && isRequired) throw field;
        if (data || data === 0) return data;
        if (isRequired) throw field;
        return '';
    };


    handleSubmitNgayPhongThi = (e) => {
        e.preventDefault();
        try {
            let items = [], maHocPhanCur = this.state.listHocPhan[0].maHocPhan,
                dssv = this.state.dssvTong[maHocPhanCur];
            this.setState({ onSaveNgayPhongThi: true });
            const hocPhanCondition = (index) => {
                if (index == this.state.listHocPhan.length) {
                    this.setState({ onSaveNgayPhongThi: false }, () => {
                        this.props.submitNgayPhongThi(items);
                    });
                    return;
                } else {
                    let hocPhan = this.state.listHocPhan[index];
                    let phongThi = this.phong[`${hocPhan.maHocPhan}_${hocPhan.caThi}`].data().map(i => {
                        return {
                            ...hocPhan, phong: i.id, sucChuaThi: parseInt(i.text.split(': ')[1]), maMonHoc: hocPhan.maMonHoc
                        };
                    });
                    let batDau = this.validation(this.batDau[`${hocPhan.maHocPhan}_${hocPhan.caThi}`]),
                        { readOnly } = this.batDau[`${hocPhan.maHocPhan}_${hocPhan.caThi}`].props;
                    if (!batDau && !readOnly) {
                        this.setState({ onSaveNgayPhongThi: false }, () => {
                            T.notify('Nhập thời gian bắt đầu thi', 'warning');
                            this.batDau[`${hocPhan.maHocPhan}_${hocPhan.caThi}`].focus();
                            return;
                        });
                    } else if (!this.phong[`${hocPhan.maHocPhan}_${hocPhan.caThi}`].value().length) {
                        this.setState({ onSaveNgayPhongThi: false }, () => {
                            T.notify('Chọn phòng thi', 'warning');
                            this.phong[`${hocPhan.maHocPhan}_${hocPhan.caThi}`].focus();
                            return;
                        });
                    } else {
                        let filter = {
                            batDau, ketThuc: this.ketThuc[`${hocPhan.maHocPhan}_${hocPhan.caThi}`].value()
                        };
                        if (hocPhan.maHocPhan != maHocPhanCur) {
                            maHocPhanCur = hocPhan.maHocPhan;
                            dssv = this.state.dssvTong[maHocPhanCur];
                        }
                        this.props.checkIfTrungLich(JSON.stringify(dssv.slice(0, hocPhan.soLuongDangKyCa).map(item => item.mssv)), filter, (checkTrung) => {
                            if (checkTrung) {
                                this.setState({ onSaveNgayPhongThi: false }, () => {
                                    this.batDau[`${hocPhan.maHocPhan}_${hocPhan.caThi}`].focus();
                                });
                            } else {
                                let tongSucChua = phongThi.reduce((prev, curr) => prev + curr.sucChuaThi, 0);
                                if (tongSucChua < hocPhan.soLuongDangKyCa) {
                                    T.notify(`Sức chứa phòng thi không đủ cho học phần ${hocPhan.maHocPhan} ca ${hocPhan.caThi}`, 'warning');
                                }
                                phongThi = phongThi.sort((a, b) => a.phong > b.phong ? 1 : -1);
                                phongThi = phongThi.map((item, index) => {
                                    let soLuong = Math.floor(item.soLuongDangKyCa / phongThi.length),
                                        phanDu = item.soLuongDangKyCa % phongThi.length;
                                    if (index < phanDu) {
                                        soLuong++;
                                    }
                                    return { ...item, batDau: batDau.getTime(), ketThuc: batDau.getTime() + item.thoiGianThi * HOUR / 60, soLuong, sttPhong: index + 1, soPhong: phongThi.length };
                                });
                            }
                            items = items.concat(phongThi);
                            dssv = dssv.splice(hocPhan.soLuongDangKyCa);
                            index++;
                            hocPhanCondition(index);
                        });
                    }
                }
            };
            hocPhanCondition(0);
            // setTimeout(() => {
            // }, 1000);
        } catch (input) {
            if (input) {
                T.notify(`${input.props?.label || input.props?.placeholder} bị trống`, 'danger');
                input.focus();
            }
        }
    }

    render() {
        let { onSaveNgayPhongThi, filter } = this.state;
        return (
            <section id='ngayPhongThi'>
                <div className='tile mb-0' style={{ boxShadow: 'none' }}>
                    <div className='tile-body'>
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-outline-primary' type='button' onClick={this.handleSubmitNgayPhongThi} disabled={onSaveNgayPhongThi}>
                                {onSaveNgayPhongThi ? 'Loading' : 'Tiếp theo'} <i className={onSaveNgayPhongThi ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-lg fa-arrow-right'} />
                            </button>
                        </div>
                        {this.tableXepLich(this.state.listHocPhan, filter)}
                    </div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dtExam: state.daoTao.dtExam });
const mapActionsToProps = {
    checkIfTrungLich
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionNgayPhongThi);