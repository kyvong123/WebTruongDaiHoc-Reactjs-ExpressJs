import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTextBox, FormSelect, TableCell, TableHead, renderTable, getValue } from 'view/component/AdminPage';

class SectionSoLuongPhongThi extends AdminPage {
    soLuong = {};

    componentDidMount() {
    }

    resetSinhVien = () => {
        this.setState({ dssvTong: [] });
    }

    setValue = () => {
        this.setState({ listHocPhan: this.props.listHocPhan, filter: this.props.filter, current: Date.now() }, () => {
            for (const hocPhan of this.state.listHocPhan) {
                this.soLuong[`${hocPhan.maHocPhan}_${hocPhan.caThi}_${hocPhan.phong}`]?.value(hocPhan.soLuong);
            }
            this.cachXep.value('tatCa');
        });
    }

    tableSoLuong = (list) => renderTable({
        emptyTable: 'Không có dữ liệu',
        getDataSource: () => list == null ? null : Object.keys(list.groupBy('maHocPhan')),
        stickyHead: true,
        divStyle: { height: '54vh' },
        header: 'thead-light',
        renderHead: () => <tr>
            <TableHead style={{ width: 'auto' }} content='#' />
            <TableHead style={{ width: 'auto' }} content='Mã học phần' />
            <TableHead style={{ width: '100%' }} content='Tên môn học' />
            <TableHead style={{ width: 'auto' }} content='Ca thi' />
            <TableHead style={{ width: 'auto' }} content='Số lượng' />
            <TableHead style={{ width: 'auto' }} content='Ngày thi' />
            <TableHead style={{ width: 'auto' }} content='Giờ thi' />
            <TableHead style={{ width: 'auto' }} content='Phòng' />
            <TableHead style={{ width: 'auto' }} content={<div>Số lượng<br />của phòng</div>} />
        </tr>,
        renderRow: (item, index) => {
            const rows = [];
            let listPhongThi = list.groupBy('maHocPhan')[item] || [],
                phongThi = listPhongThi[0], rowSpan = listPhongThi.length;
            if (rowSpan) {
                let listHpCaThi = listPhongThi?.groupBy('caThi'), soCa = Object.keys(listHpCaThi);
                for (let caThi of soCa) {
                    let hpCaThi = listHpCaThi[caThi];
                    for (let [i, hocPhan] of hpCaThi.entries()) {
                        let caThiRowSpan = hpCaThi.length, key = `${hocPhan.maHocPhan}_${hocPhan.caThi}_${hocPhan.phong}_${this.state.current}`;
                        let { batDau, ketThuc } = hocPhan,
                            ngayThi = new Date(batDau).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
                        batDau = new Date(batDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                        ketThuc = new Date(ketThuc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                        if (i == 0) {
                            if (caThi == '1') {
                                rows.push(<tr key={key} style={{ backgroundColor: '#fff' }}>
                                    <TableCell rowSpan={rowSpan} content={index + 1} />
                                    <TableCell rowSpan={rowSpan} content={hocPhan.maHocPhan} />
                                    <TableCell rowSpan={rowSpan} content={T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi} nowrap />
                                    <TableCell rowSpan={caThiRowSpan} content={hocPhan.caThi} />
                                    <TableCell rowSpan={caThiRowSpan} content={hocPhan.soLuongDangKyCa} />
                                    <TableCell rowSpan={caThiRowSpan} content={ngayThi} />
                                    <TableCell rowSpan={caThiRowSpan} content={`${batDau}-${ketThuc}`} nowrap />
                                    <TableCell content={hocPhan.phong} nowrap />
                                    <TableCell content={
                                        <FormTextBox type='number' ref={e => this.soLuong[`${hocPhan.maHocPhan}_${hocPhan.caThi}_${hocPhan.phong}`] = e} className='mb-0' disabled={hocPhan.soPhong == 1} min={1} max={this.state.sum} onChange={value => this.handleSoLuong(value, hocPhan)} />
                                    } onClick={e => e.preventDefault() || this.click(hocPhan)} />
                                </tr>);
                            } else {
                                rows.push(<tr key={key} style={{ backgroundColor: '#fff' }}>
                                    <TableCell rowSpan={caThiRowSpan} content={hocPhan.caThi} />
                                    <TableCell rowSpan={caThiRowSpan} content={hocPhan.soLuongDangKyCa} />
                                    <TableCell rowSpan={caThiRowSpan} content={ngayThi} />
                                    <TableCell rowSpan={caThiRowSpan} content={`${batDau}-${ketThuc}`} nowrap />
                                    <TableCell content={hocPhan.phong} nowrap />
                                    <TableCell content={
                                        <FormTextBox type='number' ref={e => this.soLuong[`${hocPhan.maHocPhan}_${hocPhan.caThi}_${hocPhan.phong}`] = e} className='mb-0' disabled={hocPhan.soPhong == 1} min={1} max={this.state.sum} onChange={value => this.handleSoLuong(value, hocPhan)} />
                                    } onClick={e => e.preventDefault() || this.click(hocPhan)} />
                                </tr>);
                            }
                        } else {
                            rows.push(<tr key={key} style={{ backgroundColor: '#fff' }}>
                                <TableCell content={hocPhan.phong} nowrap />
                                <TableCell content={
                                    <FormTextBox type='number' ref={e => this.soLuong[`${hocPhan.maHocPhan}_${hocPhan.caThi}_${hocPhan.phong}`] = e} className='mb-0' min={1} max={this.state.sum} onChange={value => this.handleSoLuong(value, hocPhan)} />
                                } onClick={e => e.preventDefault() || this.click(hocPhan)} />
                            </tr>);
                        }
                    }
                }
            }
            else {
                rows.push(<tr key={index} style={{ backgroundColor: '#fff' }}>
                    <TableCell content={index + 1} />
                    <TableCell content={phongThi.maHocPhan} />
                    <TableCell content={phongThi.tenMonHoc} nowrap />
                    <TableCell content={phongThi.caThi} />
                    <TableCell content={phongThi.phong} nowrap />
                    <TableCell content={phongThi.soLuong || 0} />
                </tr>);
            }
            return rows;
        }
    })

    click = (hocPhan) => {
        let selector = `${hocPhan.maHocPhan}_${hocPhan.caThi}_${hocPhan.phong}`,
            currSoLuong = this.soLuong[selector].value(),
            nextPhongIndex = hocPhan.sttPhong == hocPhan.soPhong ? 1 : hocPhan.sttPhong + 1,
            nextPhong = this.state.listHocPhan.find(item => item.maHocPhan == hocPhan.maHocPhan && item.caThi == hocPhan.caThi && item.sttPhong == nextPhongIndex).phong,
            nextPhongSelector = `${hocPhan.maHocPhan}_${hocPhan.caThi}_${nextPhong}`,
            nextSoLuong = this.soLuong[nextPhongSelector].value();
        this.setState({ currSoLuong, nextSoLuong, sum: currSoLuong + nextSoLuong });
    }

    handleSoLuong = (value, hocPhan) => {
        if (value) {
            let listHocPhan = this.state.listHocPhan,
                nextPhongIndex = hocPhan.sttPhong == hocPhan.soPhong ? 1 : hocPhan.sttPhong + 1,
                currSoLuong = this.state.currSoLuong,
                nextPhong = this.state.listHocPhan.find(item => item.maHocPhan == hocPhan.maHocPhan && item.caThi == hocPhan.caThi && item.sttPhong == nextPhongIndex).phong,
                nextPhongSelector = `${hocPhan.maHocPhan}_${hocPhan.caThi}_${nextPhong}`,
                nextSoLuong = this.state.nextSoLuong;
            let curr = listHocPhan.findIndex(item => item.maHocPhan == hocPhan.maHocPhan && item.caThi == hocPhan.caThi && item.phong == hocPhan.phong),
                next = listHocPhan.findIndex(item => item.maHocPhan == hocPhan.maHocPhan && item.caThi == hocPhan.caThi && item.phong == nextPhong);
            listHocPhan[curr].soLuong = value;
            listHocPhan[next].soLuong = nextSoLuong + currSoLuong - value;
            this.setState({ listHocPhan }, () => {
                this.soLuong[nextPhongSelector].value(nextSoLuong + currSoLuong - value);
            });
        }
    }

    handleSubmitSoLuongPhongThi = (e) => {
        e.preventDefault();
        try {
            let cachXep = getValue(this.cachXep);
            this.setState({ onSaveSoLuongPhongThi: true });
            let listHocPhan = Object.keys(this.state.listHocPhan.groupBy('maHocPhan')),
                listHocPhanGroupBy = this.state.listHocPhan.groupBy('maHocPhan');
            for (let hocPhan of listHocPhan) {
                let { namHoc, hocKy } = this.state.filter,
                    filter = { listMaHocPhan: hocPhan, namHocHocPhi: namHoc, hocKyHocPhi: hocKy, cachXep };
                this.props.getSinhVien(filter, data => {
                    let dssvTong = this.state.dssvTong || [],
                        dssv = cachXep == 'tatCa' ? data : data.filter(item => item.tinhPhi != '0');
                    for (let caHocPhanThi of listHocPhanGroupBy[hocPhan]) {
                        let dssvPhong = dssv.slice(0, caHocPhanThi.soLuong),
                            soLuongPre = 0, soLuong = caHocPhanThi.soLuong;
                        dssvTong = [...dssvTong, ...dssvPhong.slice(0, soLuong).map((item, index) => {
                            let { mssv, ho, ten, tinhPhi } = item,
                                { maHocPhan, tenMonHoc, phong, batDau, ketThuc, caThi } = caHocPhanThi;
                            return { mssv, ho, ten, maHocPhan, tenMonHoc, phong, caThi, stt: soLuongPre + index + 1, batDau, ketThuc, namHoc, hocKy, isThanhToan: tinhPhi == '0' ? 0 : 1 };
                        })];
                        dssvPhong = dssvPhong.splice(soLuong);
                        soLuongPre = soLuongPre + soLuong;
                        this.setState({ dssvTong });
                        dssv = dssv.splice(caHocPhanThi.soLuong);
                    }
                });
            }
            setTimeout(() => {
                if (this.state.onSaveSoLuongPhongThi) {
                    this.setState({ onSaveSoLuongPhongThi: false }, () => {
                        this.props.submitSoLuongPhongThi(this.state.listHocPhan, this.state.dssvTong);
                    });
                }
            }, 1000);
        } catch (input) {
            if (input) {
                T.notify(`${input.props?.label || input.props?.placeholder} bị trống`, 'danger');
                input.focus();
            }
        }
    }

    render() {
        let { onSaveSoLuongPhongThi, listHocPhan } = this.state,
            dataCachXep = [
                {
                    id: 'tatCa', text: 'Xếp tất cả sinh viên'
                },
                {
                    id: 'tinhPhi', text: 'Chỉ xếp những SV đã đóng đủ phí'
                }
            ];
        return (
            <section id='ngayPhongThi'>
                <div className='tile mb-0' style={{ boxShadow: 'none' }}>
                    <div className='tile-body'>
                        <div className='row mx-0' style={{ flexDirection: 'row-reverse', alignItems: 'stretch' }}>
                            <div className='col-md-1 px-0' style={{ display: 'flex', gap: 10 }}>
                                <button className='btn btn-outline-primary mr-3' type='button' onClick={this.handleSubmitSoLuongPhongThi} style={{ height: '34px', alignSelf: 'flex-end' }} disabled={onSaveSoLuongPhongThi}>
                                    {onSaveSoLuongPhongThi ? 'Loading' : 'Tiếp theo'} <i className={onSaveSoLuongPhongThi ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-lg fa-arrow-right'} />
                                </button>
                            </div>
                            <FormSelect className='col-md-3 mb-0' ref={e => this.cachXep = e} label='Cách xếp' data={dataCachXep} required />
                        </div>
                        {this.tableSoLuong(listHocPhan)}
                    </div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dtExam: state.daoTao.dtExam });
const mapActionsToProps = {

};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionSoLuongPhongThi);