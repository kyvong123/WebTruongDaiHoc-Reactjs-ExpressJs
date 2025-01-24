import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';
import { dtDanhSachXetTotNghiepGetDetail, saveChangeTotNghiep, checkDieuKienTotNghiep } from 'modules/mdDaoTao/dtDanhSachXetTotNghiep/redux';
import ComponentChuongTrinh from './componentChuongTrinh';
import { Tooltip } from '@mui/material';


class DetailPage extends AdminPage {
    state = { totNghiepDetail: {}, dataMonTotNghiep: [], dataMonCtdt: [], mucCha: {}, mucCon: {}, cauTrucTinChi: [] }
    chuongTrinh = {}
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            let params = T.getUrlParams(window.location.href);
            if (Object.keys(params).length) {
                let { idDot, mssv } = params;
                this.setState({ idDot, mssv }, () => {
                    T.alert('Đang tải dữ liệu. Vui lòng chờ trong giây lát!', 'info', false, null, true);
                    this.getData(() => T.alert('Tải dữ liệu thành công!', 'success', true, 5000));
                });
            }
        });
    }

    getData = (done) => {
        let { idDot, mssv } = this.state;
        this.props.dtDanhSachXetTotNghiepGetDetail({ idDot, mssv }, result => {
            const { totNghiepDetail } = result,
                { mssv, hoTen, tenNganh, tenKhoa, heDaoTao, sdt, khoaSinhVien, lop, maCtdt, emailTruong, mucCha, mucCon, cauTrucTinChi, diemTotNghiep, tinChiTotNghiep } = totNghiepDetail;

            this.setState({ ...result, mucCha, mucCon, cauTrucTinChi, khoaSinhVien, maCtdt }, () => {
                this.mssv.value(mssv);
                this.hoTen.value(hoTen);
                this.sdt.value(sdt);
                this.email.value(emailTruong);
                this.lop.value(lop);
                this.ctdt.value(maCtdt);
                this.he.value(heDaoTao);
                this.khoaSinhVien.value(khoaSinhVien);
                this.khoa.value(tenKhoa);
                this.nganh.value(tenNganh);
                this.diemTotNghiep.value(diemTotNghiep);
                this.tinChiTotNghiep.value(tinChiTotNghiep);
                Object.keys(mucCha).forEach(key => {
                    this.chuongTrinh[key]?.setVal(key, mucCha[key]);
                });
                done && done();
            });
        });
    }

    setMonTotNghiep = (mucCha, dataMonTotNghiep, done) => {
        this.setState({ dataMonTotNghiep }, () => {
            Object.keys(mucCha).forEach(key => {
                this.chuongTrinh[key]?.setVal(key, mucCha[key]);
            });
            done && done();
        });
    }

    handleThayThe = (item, monThayThe, done) => {
        let { dataMonTotNghiep, mucCha } = this.state,
            { maMonHoc, tenMonHoc, diem, isPass, tongTinChi } = monThayThe;

        const dataMonThayThe = dataMonTotNghiep.filter(i => i.maMonHoc == maMonHoc);
        dataMonTotNghiep = dataMonTotNghiep.filter(i => i.maMonHoc != maMonHoc);
        dataMonTotNghiep = dataMonTotNghiep.map(i => i.maMonHoc == item.maMonHoc ? { ...i, isThayThe: 1, maMonHoc, tenMonHoc, diem, monThayThe: i.maMonHoc, isDat: isPass, tenMonThayThe: i.tenMonHoc, dataMonThayThe, dataMon: item, tinChiTrungBinh: tongTinChi } : { ...i });

        this.setMonTotNghiep(mucCha, dataMonTotNghiep, done);
    }

    handleHuyThayThe = (item, done) => {
        let { dataMonTotNghiep, mucCha } = this.state;

        dataMonTotNghiep = dataMonTotNghiep.filter(i => i.idMon != item.idMon);
        dataMonTotNghiep.push(...item.dataMonThayThe);
        dataMonTotNghiep.push(item.dataMon);

        this.setMonTotNghiep(mucCha, dataMonTotNghiep, done);
    }

    handleHuyTichLuy = (item) => {
        let { dataMonTotNghiep, mucCha } = this.state;
        // TODO: check huy tich luy mon tuong duong
        dataMonTotNghiep = dataMonTotNghiep.map(i => i.maMonHoc == item.maMonHoc ? { ...i, isHuyTichLuy: 1 } : { ...i });

        this.setMonTotNghiep(mucCha, dataMonTotNghiep);
    }

    handleHoanTacTichLuy = (item) => {
        let { dataMonTotNghiep, mucCha } = this.state;

        dataMonTotNghiep = dataMonTotNghiep.map(i => i.maMonHoc == item.maMonHoc ? { ...i, isHuyTichLuy: 0 } : { ...i });

        this.setMonTotNghiep(mucCha, dataMonTotNghiep);
    }

    saveChange = (e) => {
        e && e.preventDefault();
        const { dataMonTotNghiep, idDot, mssv, khoaSinhVien } = this.state;
        T.confirm('Lưu thay đổi', 'Bạn có chắc bạn muốn lưu thay đổi môn tốt nghiệp của sinh viên không?', true, isConfirm => {
            if (isConfirm) {
                const dsMon = dataMonTotNghiep.filter(i => !i.isHuyTichLuy && !i.isThayThe),
                    dsMonThayThe = dataMonTotNghiep.filter(i => !i.isHuyTichLuy && i.isThayThe);
                T.alert('Đang lưu thay đổi. Vui lòng chờ trong giây lát!', 'info', false, null, true);
                this.props.saveChangeTotNghiep({ idDot, mssv, dsMon, dsMonThayThe, khoaSinhVien }, () => this.getData(() => T.alert('Lưu thay đổi thành công!', 'success', true, 5000)));
            }
        });
    }

    checkTotNghiep = (e) => {
        e && e.preventDefault();
        let { idDot, mssv, maCtdt } = this.state;
        T.confirm('Xét tốt nghiệp', 'Bạn có chắc bạn muốn xét điều kiện tốt nghiệp của sinh viên không?', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang xét điều kiện tốt nghiệp. Vui lòng chờ trong giây lát!', 'info', false, null, true);
                this.props.checkDieuKienTotNghiep({ idDot, mssv, maCtdt }, () => this.getData(() => T.alert('Xét điều kiện tốt nghiệp thành công!', 'success', true, 5000)));
            }
        });
    }

    dataNgoaiCT = (items) => renderTable({
        getDataSource: () => items,
        emptyTable: 'Chưa có thông tin môn học!',
        header: 'thead-light',
        stickyHead: items.length > 10,
        renderHead: () => <tr>
            <th style={{ width: '40%', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Môn học</th>
            <th style={{ width: '15%', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Tự chọn</th>
            <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', }}>Tín chỉ</th>
            <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', }}>Điểm</th>
            <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', }}>Tình trạng</th>
            <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Thao tác</th>
        </tr>,
        renderRow: (item, index) => {
            return <tr key={`NCT-${index}`} style={{ backgroundColor: item.isHuyTichLuy ? '#ffc6c4' : '' }}>
                <TableCell content={`${item.maMonHoc}: ${T.parse(item.tenMonHoc, { vi: '' }).vi}`} />
                <TableCell style={{ textAlign: 'center' }} content={item.loaiMonHoc ? <i className='fa fa-check' /> : ''} />
                <TableCell style={{ textAlign: 'center' }} content={item.tongTinChi} />
                <TableCell style={{ textAlign: 'center' }} content={item.diem} />
                <TableCell style={{ textAlign: 'center' }} content={item.isDat ? <Tooltip title='Đã qua môn'>
                    <i className='fa fa-lg fa-check-circle' />
                </Tooltip> : ''} />
                <TableCell type='buttons' content={item}>
                    <Tooltip title='Hủy tích lũy'>
                        <button style={{ display: item.isHuyTichLuy ? 'none' : '' }} className='btn btn-danger' onClick={e => e.preventDefault() || this.handleHuyTichLuy(item)}><i className='fa fa-pencil' /></button>
                    </Tooltip>
                    <Tooltip title='Hoàn tác tích lũy'>
                        <button style={{ display: item.isHuyTichLuy ? '' : 'none' }} className='btn btn-warning' onClick={e => e.preventDefault() || this.handleHoanTacTichLuy(item)}><i className='fa fa-retweet' /></button>
                    </Tooltip>
                </TableCell>
            </tr>;
        }
    })

    render() {
        let { mucCha, mucCon, cauTrucTinChi, dataMonTotNghiep, dataDiem } = this.state;
        return this.renderPage({
            icon: 'fa fa-info',
            title: 'Chi tiết xét tốt nghiệp sinh viên',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/graduation'>Xét tốt nghiệp</Link>,
                'Chi tiết xét tốt nghiệp sinh viên'
            ],
            content: <>
                <div className='tile'>
                    <div className='row'>
                        <FormTextBox ref={e => this.mssv = e} className='col-md-3' label='Mssv' readOnly />
                        <FormTextBox ref={e => this.hoTen = e} className='col-md-3' label='Họ tên' readOnly />
                        <FormTextBox ref={e => this.sdt = e} className='col-md-3' label='SDT' readOnly />
                        <FormTextBox ref={e => this.email = e} className='col-md-3' label='Email' readOnly />
                        <FormTextBox ref={e => this.lop = e} className='col-md-3' label='Lớp' readOnly />
                        <FormTextBox ref={e => this.ctdt = e} className='col-md-3' label='CTDT' readOnly />
                        <FormTextBox ref={e => this.he = e} className='col-md-3' label='Hệ' readOnly />
                        <FormTextBox ref={e => this.khoaSinhVien = e} className='col-md-3' label='Khóa' readOnly />
                        <FormTextBox ref={e => this.khoa = e} className='col-md-6' label='Khoa' readOnly />
                        <FormTextBox ref={e => this.nganh = e} className='col-md-6' label='Ngành' readOnly />
                        <FormTextBox ref={e => this.diemTotNghiep = e} className='col-md-6' label='Điểm tốt nghiệp' readOnly />
                        <FormTextBox ref={e => this.tinChiTotNghiep = e} className='col-md-6' label='Tín chỉ tốt nghiệp' readOnly />
                    </div>
                </div>
                {
                    Object.keys(mucCha).map((key) => {
                        const childs = mucCon;
                        const { id, text } = mucCha[key];
                        return (
                            <ComponentChuongTrinh key={`CTDT_${key}`} title={text} khoiKienThucId={id} childs={childs[key]} ref={e => this.chuongTrinh[key] = e}
                                cauTrucTinChi={cauTrucTinChi} dataMonTotNghiep={dataMonTotNghiep} dataDiem={dataDiem} handleThayThe={this.handleThayThe}
                                handleHuyTichLuy={this.handleHuyTichLuy} handleHoanTacTichLuy={this.handleHoanTacTichLuy} handleHuyThayThe={this.handleHuyThayThe} />
                        );
                    })
                }
                <div className='tile'>
                    <h5>Danh sách môn ngoài chương trình</h5>
                    {this.dataNgoaiCT(dataMonTotNghiep.filter(i => !i.idKhungTinChi))}
                </div>
            </>,
            buttons: [
                {
                    icon: 'fa-save', className: 'btn-success', onClick: this.saveChange, tooltip: 'Lưu thay đổi'
                },
                {
                    icon: 'fa-refresh', className: 'btn-warning', onClick: this.checkTotNghiep, tooltip: 'Xét điều kiện tốt nghiệp'
                },
            ],
            backRoute: '/user/dao-tao/graduation',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { dtDanhSachXetTotNghiepGetDetail, saveChangeTotNghiep, checkDieuKienTotNghiep };
export default connect(mapStateToProps, mapActionsToProps)(DetailPage);