import React from 'react';
import { FormCheckbox, FormSelect, FormTextBox, TableCell, getValue, renderTable } from 'view/component/AdminPage';
import T from 'view/js/common';

export class ThongTinNhomKhoa extends React.Component {
    state = { nhomKhoa: null, xemThem: false, lsKhoaSelect: [], dsSinhVien: [], showDsSv: false, filter: {} }
    kinhPhiKhoa = {}
    soLuongSinhVienKhoa = {}

    componentDidMount = () => {
        const { nhomKhoa } = this.props;
        if (nhomKhoa) {
            this.setData();
        }
    }

    componentDidUpdate = (prevProps) => {
        if (prevProps.nhomKhoa != this.props.nhomKhoa || prevProps.nhomKhoa?.idNhom != this.props.nhomKhoa?.idNhom) {
            this.setData();
        } else if (this.props.nhomKhoa) {
            this.tongKinhPhiNhomKhoa.value(this.props.nhomKhoa.tongKinhPhi);
            this.props.nhomKhoa.dsKhoa.forEach(khoa => {
                this.kinhPhiKhoa[khoa.idKhoa]?.value(khoa.kinhPhiKhoa);
                this.soLuongSinhVienKhoa[khoa.idKhoa]?.value(khoa.soLuongSinhVienKhoa);
            });
        }
    }

    setData = () => {
        const { nhomKhoa } = this.props;
        const { tenNhom, dsKhoa, tongKinhPhi, hocBongXuatSac, hocBongGioi, hocBongKha } = nhomKhoa;
        this.setState({
            nhomKhoa, lsKhoaSelect: dsKhoa.map(({ idKhoa, ten, daSuDung, kinhPhiKhoa, diemChuan, soLuongNhanHocBong }) => ({
                ma: idKhoa, ten,
                daSuDung: Number(daSuDung || 0),
                kinhPhiKhoa: Number(kinhPhiKhoa || 0),
                kinhPhiConLai: Math.max(0, Number((kinhPhiKhoa || 0) - (daSuDung || 0))),
                kinhPhiPhatSinh: Math.max(0, Number((daSuDung || 0) - (kinhPhiKhoa || 0))),
                diemChuan, soLuongNhanHocBong
            }))
        }, () => {
            this.khoa.value(dsKhoa.map(khoa => khoa.idKhoa));
            dsKhoa.forEach(khoa => {
                this.kinhPhiKhoa[khoa.idKhoa].value(khoa.kinhPhiKhoa);
                this.soLuongSinhVienKhoa[khoa.idKhoa].value(khoa.soLuongSinhVienKhoa);
            });
        });
        this.tenNhomKhoa.value(tenNhom);
        this.tongKinhPhiNhomKhoa.value(tongKinhPhi);
        this.hocBongNhomXuatSac.value(hocBongXuatSac);
        this.hocBongNhomGioi.value(hocBongGioi);
        this.hocBongNhomKha.value(hocBongKha);
    }

    checkAll = (value, ma) => {
        if (value == true) {
            if (ma == 'khoa') {
                let khoa = this.props.khoa?.map(e => e.ma);
                this.khoa.value(khoa);
                this.setState({ lsKhoaSelect: this.props.khoa });
            }
        } else if (ma == 'khoa') {
            this.khoa.value(null);
            this.setState({ lsKhoaSelect: [] });
        }
    }

    changeKhoaSelect = () => {
        const lsKhoaSelect = this.khoa.data();
        this.setState({ lsKhoaSelect: lsKhoaSelect.map(khoa => ({ ma: khoa.id, ten: khoa.text })) });
    }

    addNewNhomKhoa = () => {
        try {
            const { lsKhoaSelect, nhomKhoa } = this.state;
            const newNhom = {
                idNhom: nhomKhoa ? nhomKhoa.idNhom : null,
                idQuery: nhomKhoa ? nhomKhoa.idQuery : null,
                tenNhom: getValue(this.tenNhomKhoa),
                tongKinhPhi: getValue(this.tongKinhPhiNhomKhoa),
                hocBongXuatSac: getValue(this.hocBongNhomXuatSac),
                hocBongGioi: getValue(this.hocBongNhomGioi),
                hocBongKha: getValue(this.hocBongNhomKha),
                dsKhoa: lsKhoaSelect.map(khoa => ({
                    idKhoa: khoa.ma,
                    ten: khoa.ten,
                    kinhPhiKhoa: getValue(this.kinhPhiKhoa[khoa.ma]),
                    soLuongSinhVienKhoa: getValue(this.soLuongSinhVienKhoa[khoa.ma])
                }))
            };
            this.props.addNewNhomKhoa(newNhom, () => {
                this.khoa?.value(newNhom.dsKhoa.map(item => item.idKhoa));
            });
            nhomKhoa ? this.props.huyChinhSua() : this.props.huyAddNew();
        } catch (error) {
            error.props && T.notify(`${error.props.label || 'Dữ liệu'} bị trống!`, 'danger');
        }
    }

    handleKeySearch = (data) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getDanhSachSinhVien();
        });
    }

    getDanhSachSinhVien = () => {
        const { nhomKhoa, filter } = this.state;
        if (nhomKhoa.idQuery) {
            this.props.getSvDsHocBongByNhom(nhomKhoa.idQuery, filter, (data) => {
                if (data.length) {
                    this.setState({ dsSinhVien: data, showDsSv: true });
                } else {
                    T.notify('Không tìm thấy sinh viên cho nhóm này', 'warning');
                }
            });
        }
    };

    checkChangeKinhPhi = () => {
        this.props.validateKinhPhiNhom(this.tongKinhPhiNhomKhoa);
    }

    checkChangeKinhPhiKhoa = () => {
        const { lsKhoaSelect } = this.state;
        const totalUse = Number(lsKhoaSelect.reduce((init, khoa) => (init + Number(this.kinhPhiKhoa[khoa.ma].value() || 0)), 0));
        this.tongKinhPhiNhomKhoa.value(totalUse);
    }

    render = () => {
        const { lsKhoaSelect } = this.state;
        const { readOnly } = this.props;
        let table = renderTable({
            getDataSource: () => lsKhoaSelect,
            emptyTable: '',
            header: 'thead-light',
            stickyHead: lsKhoaSelect && lsKhoaSelect > 12,
            multipleTbody: true, hover: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '50%', textAlign: 'left', whiteSpace: 'nowrap' }}>Tên khoa</th>
                    <th style={{ width: '10%', textAlign: 'right', whiteSpace: 'nowrap' }}>Tổng số sinh viên</th>
                    <th style={{ width: '10%', textAlign: 'right', whiteSpace: 'nowrap' }}>Kinh phí (VNĐ)</th>
                    <th style={{ width: '10%', textAlign: 'right', whiteSpace: 'nowrap' }}>Đã sử dụng</th>
                    <th style={{ width: '10%', textAlign: 'right', whiteSpace: 'nowrap' }}>Còn lại</th>
                    <th style={{ width: '10%', textAlign: 'right', whiteSpace: 'nowrap' }}>Phát sinh</th>
                    <th style={{ width: '10%', textAlign: 'right', whiteSpace: 'nowrap' }}>Số viên nhận</th>
                    <th style={{ width: '10%', textAlign: 'right', whiteSpace: 'nowrap' }}>Điểm chuẩn</th>
                </tr>),
            renderRow: <>
                <tbody>{lsKhoaSelect.map((item, index) => <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.ten || ''} />
                    <TableCell content={<FormTextBox className='mb-0' ref={e => this.soLuongSinhVienKhoa[item.ma] = e} type='number' allowNegative={false} readOnly={readOnly} />} style={{ textAlign: 'right' }} />
                    <TableCell content={<FormTextBox className='mb-0' ref={e => this.kinhPhiKhoa[item.ma] = e} type='number' allowNegative={false} readOnly={readOnly} onBLur={() => this.checkChangeKinhPhiKhoa()} />} style={{ textAlign: 'right' }} />
                    <TableCell style={{ textAlign: 'right' }} content={<b>{Number(item.daSuDung || 0).toLocaleString()}</b>} />
                    <TableCell style={{ textAlign: 'right' }} content={<b>{T.numberDisplay(item.kinhPhiConLai ?? '')}</b>} />
                    <TableCell style={{ textAlign: 'right' }} content={<b>{T.numberDisplay(item.kinhPhiPhatSinh ?? '')}</b>} />
                    <TableCell style={{ textAlign: 'right' }} content={<b>{item.soLuongNhanHocBong}</b>} />
                    <TableCell style={{ textAlign: 'right' }} content={<b>{item.diemChuan}</b>} />
                </tr>)}</tbody>
                <tfoot><tr style={{ textAlign: 'right', fontWeight: 'bold', backgroundColor: '#e6e6e6' }} >
                    <TableCell colSpan='3' content={<b>Tổng số</b>} style={{ textAlign: 'left' }} />
                    <TableCell content={T.numberDisplay(lsKhoaSelect.reduce((acc, item) => acc + parseInt(this.kinhPhiKhoa[item.ma]?.value() || 0), 0))} />
                    <TableCell content={T.numberDisplay(lsKhoaSelect.reduce((acc, item) => acc + parseInt(item.daSuDung || 0), 0))} />
                    <TableCell content={T.numberDisplay(lsKhoaSelect.reduce((acc, item) => acc + parseInt(item.kinhPhiConLai || 0), 0))} />
                    <TableCell content={T.numberDisplay(lsKhoaSelect.reduce((acc, item) => acc + parseInt(item.kinhPhiPhatSinh || 0), 0))} />
                    <TableCell colSpan='2' />
                </tr></tfoot>
            </>
        });

        return (
            <div className='row'>
                <FormTextBox ref={e => this.tenNhomKhoa = e} className='col-md-6' label='Tên nhóm khoa' readOnly={readOnly} />
                <FormTextBox className='col-md-6' ref={e => this.tongKinhPhiNhomKhoa = e} label='Tổng kinh phí cho nhóm khoa' type='number' allowNegative={false} readOnly={readOnly} />
                <FormTextBox ref={e => this.hocBongNhomXuatSac = e} className='col-md-4' label='Học bổng xuất sắc' type='number' allowNegative={false} readOnly={readOnly} required />
                <FormTextBox ref={e => this.hocBongNhomGioi = e} className='col-md-4' label='Học bổng giỏi' type='number' allowNegative={false} readOnly={readOnly} required />
                <FormTextBox ref={e => this.hocBongNhomKha = e} className='col-md-4' label='Học bổng khá' type='number' allowNegative={false} readOnly={readOnly} required />
                <div className='col-md-12'>
                    <div className='d-flex justifyBetween'>
                        <label>Chọn khoa</label>
                        {!readOnly && <FormCheckbox ref={e => this.allKhoa = e} className='col-md-4' label='Chọn tất cả'
                            onChange={(value) => {
                                this.checkAll(value, 'khoa');
                            }} />}
                    </div>
                    <FormSelect ref={e => this.khoa = e} data={this.props.khoa.map(item => ({ id: item.ma, text: item.ten }))} multiple onChange={(value) => this.changeKhoaSelect(value)} readOnly={readOnly} />
                </div>
                <div className='col-md-12'>
                    {table}
                </div>
                {!readOnly && <div className='col-md-12'>
                    <button className='btn btn-success mr-2' type='button' onClick={this.addNewNhomKhoa}>
                        <i className='fa fa-sm fa-pencil' /> {this.state.nhomKhoa ? 'Lưu' : 'Xác nhận'}
                    </button>
                    <button className='btn btn-danger' type='button' onClick={() => {
                        if (this.state.nhomKhoa) {
                            this.setData();
                            this.props.huyChinhSua();
                        } else {
                            this.props.huyAddNew();
                        }
                    }}>
                        <i className='fa fa-sm fa-ban' /> Hủy
                    </button>
                </div>}
            </div>
        );
    };
}

export class ThongTinNhomNganh extends React.Component {
    state = { nhomNganh: null, showDsSv: false, lsNganhSelect: [], dsSinhVien: [], filter: {} }
    kinhPhiNganh = {}
    soLuongSinhVienNganh = {}

    componentDidMount = () => {
        const { nhomNganh } = this.props;
        if (nhomNganh) {
            this.setData();
        }
    }

    componentDidUpdate = (prevProps) => {
        if (prevProps.nhomNganh != this.props.nhomNganh || prevProps.nhomNganh?.idNhom != this.props.nhomNganh?.idNhom) {
            this.setData();
        } else if (this.props.nhomNganh) {
            this.tongKinhPhiNhomNganh.value(this.props.nhomNganh.tongKinhPhi);
            // this.props.nganh && this.nganh.value(this.nganh.data().map(nganh => nganh.id));
            this.props.nhomNganh.dsNganh.forEach(nganh => {
                this.kinhPhiNganh[nganh.idNganh]?.value(nganh.kinhPhiNganh);
                this.soLuongSinhVienNganh[nganh.idNganh]?.value(nganh.soLuongSinhVienNganh);
            });
        }
    }

    setData = () => {
        const { nhomNganh } = this.props;
        const { tenNhom, dsNganh, tongKinhPhi, hocBongXuatSac, hocBongGioi, hocBongKha } = nhomNganh;
        this.setState({
            nhomNganh, lsNganhSelect: dsNganh.map(({ idNganh, ten, daSuDung, kinhPhiNganh, diemChuan, soLuongNhanHocBong }) => ({
                ma: idNganh, ten,
                daSuDung: Number(daSuDung || 0),
                kinhPhiNganh: Number(kinhPhiNganh || 0),
                kinhPhiConLai: Math.max(0, Number((kinhPhiNganh || 0) - (daSuDung || 0))),
                kinhPhiPhatSinh: Math.max(0, Number((daSuDung || 0) - (kinhPhiNganh || 0))),
                diemChuan, soLuongNhanHocBong
            }))
        }, () => {
            this.nganh.value(dsNganh.map(nganh => nganh.idNganh));
            dsNganh.forEach(nganh => {
                this.kinhPhiNganh[nganh.idNganh].value(nganh.kinhPhiNganh);
                this.soLuongSinhVienNganh[nganh.idNganh].value(nganh.soLuongSinhVienNganh);
            });
        });
        this.tenNhomNganh.value(tenNhom);
        this.tongKinhPhiNhomNganh.value(tongKinhPhi);
        this.hocBongNhomXuatSac.value(hocBongXuatSac);
        this.hocBongNhomGioi.value(hocBongGioi);
        this.hocBongNhomKha.value(hocBongKha);
    }

    checkAll = (value, ma) => {
        if (value == true) {
            if (ma == 'nganh') {
                let nganh = this.props.nganh?.map(e => e.maNganh);
                this.nganh.value(nganh);
                this.setState({ lsNganhSelect: this.props.nganh?.map(nganh => ({ ma: nganh.maNganh, ten: nganh.tenNganh })) });
            }
        } else if (ma == 'nganh') {
            this.nganh.value(null);
            this.setState({ lsNganhSelect: [] });
        }
    }

    changeNganhSelect = () => {
        const lsNganhSelect = this.nganh.data();
        this.setState({ lsNganhSelect: lsNganhSelect.map(nganh => ({ ma: nganh.id, ten: nganh.text })) });
    }

    addNewNhomNganh = () => {
        try {
            const { lsNganhSelect, nhomNganh } = this.state;
            const newNhom = {
                idNhom: nhomNganh ? nhomNganh.idNhom : null,
                idQuery: nhomNganh ? nhomNganh.idQuery : null,
                tenNhom: getValue(this.tenNhomNganh),
                tongKinhPhi: getValue(this.tongKinhPhiNhomNganh),
                hocBongXuatSac: getValue(this.hocBongNhomXuatSac),
                hocBongGioi: getValue(this.hocBongNhomGioi),
                hocBongKha: getValue(this.hocBongNhomKha),
                dsNganh: lsNganhSelect.map(nganh => ({
                    idNganh: nganh.ma,
                    ten: nganh.ten,
                    kinhPhiNganh: getValue(this.kinhPhiNganh[nganh.ma]),
                    soLuongSinhVienNganh: getValue(this.soLuongSinhVienNganh[nganh.ma])
                }))
            };
            this.props.addNewNhomNganh(newNhom, () => {
                this.nganh?.value(newNhom.dsNganh.map(item => item.idNganh));
            });
            nhomNganh ? this.props.huyChinhSua() : this.props.huyAddNew();
        } catch (error) {
            error.props && T.notify(`${error.props.label || 'Dữ liệu'} bị trống!`, 'danger');
        }
    }

    handleKeySearch = (data) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getDanhSachSinhVien();
        });
    }

    getDanhSachSinhVien = () => {
        const { nhomNganh, filter } = this.state;
        if (nhomNganh.idQuery) {
            this.props.getSvDsHocBongByNhom(nhomNganh.idQuery, filter, (data) => {
                if (data.length) {
                    this.setState({ dsSinhVien: data, showDsSv: true });
                } else {
                    T.notify('Không tìm thấy sinh viên cho nhóm này!', 'warning');
                }
            });
        }
    };

    checkChangeKinhPhi = () => {
        this.props.validateKinhPhiNhom(this.tongKinhPhiNhomNganh);
    }

    checkChangeKinhPhiNganh = () => {
        const { lsNganhSelect } = this.state;
        const totalUse = Number(lsNganhSelect.reduce((init, nganh) => (init + Number(this.kinhPhiNganh[nganh.ma].value() || 0)), 0));
        this.tongKinhPhiNhomNganh.value(totalUse);
    }

    render = () => {
        const { lsNganhSelect } = this.state;
        const { readOnly } = this.props;
        let table = renderTable({
            getDataSource: () => lsNganhSelect,
            emptyTable: '',
            header: 'thead-light',
            stickyHead: lsNganhSelect && lsNganhSelect > 12,
            multipleTbody: true,
            hover: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '50%', textAlign: 'left', whiteSpace: 'nowrap' }}>Tên ngành</th>
                    <th style={{ width: '10%', textAlign: 'right', whiteSpace: 'nowrap' }}>Số lượng sinh viên</th>
                    <th style={{ width: '10%', textAlign: 'right', whiteSpace: 'nowrap' }}>Kinh phí (VNĐ)</th>
                    <th style={{ width: '10%', textAlign: 'right', whiteSpace: 'nowrap' }}>Đã sử dụng</th>
                    <th style={{ width: '10%', textAlign: 'right', whiteSpace: 'nowrap' }}>Còn lại</th>
                    <th style={{ width: '10%', textAlign: 'right', whiteSpace: 'nowrap' }}>Phát sinh</th>
                    <th style={{ width: '10%', textAlign: 'right', whiteSpace: 'nowrap' }}>Số viên nhận</th>
                    <th style={{ width: '10%', textAlign: 'right', whiteSpace: 'nowrap' }}>Điểm chuẩn</th>
                </tr>),
            renderRow: <>
                <tbody>
                    {lsNganhSelect?.map((item, index) => <tr key={index}>
                        <TableCell content={index + 1} />
                        <TableCell content={item.ten || ''} />
                        <TableCell content={<FormTextBox className='mb-0' ref={e => this.soLuongSinhVienNganh[item.ma] = e} type='number' allowNegative={false} readOnly={readOnly} />} style={{ textAlign: 'right' }} />
                        <TableCell content={<FormTextBox className='mb-0' ref={e => this.kinhPhiNganh[item.ma] = e} type='number' allowNegative={false} readOnly={readOnly} onBlur={() => this.checkChangeKinhPhiNganh()} />} style={{ textAlign: 'right' }} />
                        <TableCell style={{ textAlign: 'right' }} content={<b>{Number(item.daSuDung || 0).toLocaleString()}</b>} />
                        <TableCell style={{ textAlign: 'right' }} content={<b>{T.numberDisplay(item.kinhPhiConLai ?? '')}</b>} />
                        <TableCell style={{ textAlign: 'right' }} content={<b>{T.numberDisplay(item.kinhPhiPhatSinh ?? '')}</b>} />
                        <TableCell style={{ textAlign: 'right' }} content={<b>{item.soLuongNhanHocBong}</b>} />
                        <TableCell style={{ textAlign: 'right' }} content={<b>{item.diemChuan}</b>} />
                    </tr>)}
                </tbody>
                <tfoot><tr style={{ textAlign: 'right', fontWeight: 'bold', backgroundColor: '#e6e6e6' }} >
                    <TableCell colSpan='3' content={<b>Tổng số</b>} style={{ textAlign: 'left' }} />
                    <TableCell content={T.numberDisplay(lsNganhSelect.reduce((acc, item) => acc + parseInt(this.kinhPhiNganh[item.ma]?.value() || 0), 0))} />
                    <TableCell content={T.numberDisplay(lsNganhSelect.reduce((acc, item) => acc + parseInt(item.daSuDung || 0), 0))} />
                    <TableCell content={T.numberDisplay(lsNganhSelect.reduce((acc, item) => acc + parseInt(item.kinhPhiConLai || 0), 0))} />
                    <TableCell content={T.numberDisplay(lsNganhSelect.reduce((acc, item) => acc + parseInt(item.kinhPhiPhatSinh || 0), 0))} />
                    <TableCell colSpan='2' />
                </tr></tfoot>
            </>
        });


        return (
            <div className='row'>
                <FormTextBox ref={e => this.tenNhomNganh = e} className='col-md-6' label='Tên nhóm ngành' readOnly={readOnly} required />
                <FormTextBox className='col-md-6' ref={e => this.tongKinhPhiNhomNganh = e} label='Tổng kinh phí cho nhóm ngành' type='number' allowNegative={false} readOnly={readOnly} />
                <FormTextBox ref={e => this.hocBongNhomXuatSac = e} className='col-md-4' label='Học bổng xuất sắc' type='number' allowNegative={false} readOnly={readOnly} required />
                <FormTextBox ref={e => this.hocBongNhomGioi = e} className='col-md-4' label='Học bổng giỏi' type='number' allowNegative={false} readOnly={readOnly} required />
                <FormTextBox ref={e => this.hocBongNhomKha = e} className='col-md-4' label='Học bổng khá' type='number' allowNegative={false} readOnly={readOnly} required />
                {/* <div className='col-md-12'>
                    <FormSelect label='Chọn ngành' ref={e => this.nganh = e} data={SelectAdapter_DtNganhDaoTao} multiple onChange={(value) => this.changeNganhSelect(value)} readOnly={readOnly} />
                </div> */}
                <div className='col-md-12'>
                    <div className='d-flex justifyBetween'>
                        <label>Chọn ngành</label>
                        {!readOnly && <FormCheckbox ref={e => this.allNganh = e} className='col-md-4' label='Chọn tất cả'
                            onChange={(value) => {
                                this.checkAll(value, 'nganh');
                            }} />}
                    </div>
                    <FormSelect ref={e => this.nganh = e} data={this.props.nganh?.map(nganh => ({ id: nganh.maNganh, text: `${nganh.maNganh}: ${nganh.tenNganh}` }))} multiple onChange={(value) => this.changeNganhSelect(value)} readOnly={readOnly} />
                </div>
                <div className='col-md-12'>
                    {table}
                </div>
                {!readOnly && <div className='col-md-12'>
                    <button className='btn btn-success mr-2' type='button' onClick={this.addNewNhomNganh}>
                        <i className='fa fa-sm fa-pencil' /> {this.state.nhomNganh ? 'Lưu' : 'Xác nhận'}
                    </button>
                    <button className='btn btn-danger' type='button' onClick={() => {
                        if (this.state.nhomNganh) {
                            this.setData();
                            this.props.huyChinhSua();
                        } else {
                            this.props.huyAddNew();
                        }
                    }}>
                        <i className='fa fa-sm fa-ban' /> Hủy
                    </button>
                </div>}
            </div>
        );
    };
}