import React from 'react';
import { connect } from 'react-redux';
import { SelectAdapter_DmMonHocAll } from 'modules/mdDaoTao/dmMonHoc/redux';
import { AdminModal, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { getDtChuongTrinhDaoTao } from './redux';
import { getDtKeHoachDaoTao, createDtKeHoachDaoTao, updateDtKeHoachDaoTao } from '../dtKeHoachDaoTao/redux';

class KeHoachDaoTaoModal extends AdminModal {
    rows = {};
    state = {
        monDaoTao: [],
        monPhuThuoc: [],
        monCtdt: [],
    };
    currIdx;

    componentDidMount = () => {
        this.disabledClickOutside();
    }

    onShow = (item) => {
        let data = Object.values(this.props.datas).find(data => data.id == item.id);
        this.props.getDtKeHoachDaoTao(this.props.maKhungCtdt, item.maMonHoc, dataKhdt => {
            let { items: khdt, dataMon } = dataKhdt, listMonCtdt = [];
            if (this.props.ctdt.length > 0) {
                listMonCtdt = this.props.ctdt.map(item => ({
                    id: item.maMonHoc,
                    text: `${item.maMonHoc}: ${item.tenMonHoc}`,
                    item,
                    tenVi: item.tenMonHoc
                }));
            }
            this.setState({ listMonKhdt: khdt, data, monCtdt: listMonCtdt.filter(ctdt => ctdt.id != item.maMonHoc), monDaoTao: [item] }, () => {
                let tienQuyet = khdt.filter(item => item.loai == 'TQ'),
                    hocTruoc = khdt.filter(item => item.loai == 'HT'),
                    songHanh = khdt.filter(item => item.loai == 'SH'),
                    tuongDuong = khdt.filter(item => item.loai == 'TD');
                this.monHocTienQuyet?.value(tienQuyet.map(item => item.maMonPhuThuoc));
                this.monHocHocTruoc?.value(hocTruoc.map(item => item.maMonPhuThuoc));
                this.monHocSongHanh?.value(songHanh.map(item => item.maMonPhuThuoc));
                this.monHocTuongDuong?.value(tuongDuong.map(item => item.maMonPhuThuoc));
                this.tcDangKy.value(dataMon.tinChiDangKy || '');
                this.tcTichLuy.value(dataMon.tinChiTichLuy || '');
                this.diemTrungBinh.value(dataMon.diemTrungBinh ? dataMon.diemTrungBinh.toFixed(2) : '');
            });
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        let { monPhuThuoc, data: dataMonHoc } = this.state, maMonHoc = this.state.monDaoTao[0].maMonHoc, maKhungDaoTao = this.props.maKhungCtdt,
            { idx, childId, childText, id } = dataMonHoc;
        for (let item of this.monHocTienQuyet.value()) {
            monPhuThuoc.push({
                maMonHoc,
                maMonPhuThuoc: item,
                loai: 'TQ',
                maKhungDaoTao
            });
        }
        for (let item of this.monHocHocTruoc.value()) {
            monPhuThuoc.push({
                maMonHoc,
                maMonPhuThuoc: item,
                loai: 'HT',
                maKhungDaoTao
            });
        }
        for (let item of this.monHocSongHanh.value()) {
            monPhuThuoc.push({
                maMonHoc,
                maMonPhuThuoc: item,
                loai: 'SH',
                maKhungDaoTao
            });
        }
        for (let item of this.monHocTuongDuong.value()) {
            monPhuThuoc.push({
                maMonHoc,
                maMonPhuThuoc: item,
                loai: 'TD',
                maKhungDaoTao
            });
        }
        let data = {
            maMonHoc, maKhungDaoTao,
            tinChiDangKy: this.tcDangKy.value() || '',
            tinChiTichLuy: this.tcTichLuy.value() || '',
            diemTrungBinh: this.diemTrungBinh.value() || '',
        };
        this.setState({ monPhuThuoc }, () => {
            (this.state.listMonKhdt.length > 0) ? (this.props.updateDtKeHoachDaoTao(maMonHoc, { changes: monPhuThuoc, data }, () => {
                this.setState({ monPhuThuoc: [] });
                this.props.setEditState(idx, childId, childText, true, id, false);
                this.props.editRow(null, idx);
                this.hide();
            })) : (this.props.createDtKeHoachDaoTao({ items: this.state.monPhuThuoc, data }, () => {
                this.setState({ monPhuThuoc: [] });
                this.props.setEditState(idx, childId, childText, true, id, false);
                this.props.editRow(null, idx);
                this.hide();
            }));
            this.hide();
        });
    };

    selectMhTienQuyet = () => {
        return (
            <>
                <FormSelect ref={e => this.monHocTienQuyet = e} data={this.state.monCtdt} multiple={true} style={{ marginBottom: 0, width: '250px' }} placeholder='Chọn môn học' />
            </>
        );
    };

    selectMhHocTruoc = () => {
        return (
            <>
                <FormSelect ref={e => this.monHocHocTruoc = e} data={this.state.monCtdt} multiple={true} style={{ marginBottom: 0, width: '250px' }} placeholder='Chọn môn học' />
            </>
        );
    };

    selectMhSongHanh = () => {
        return (
            <>
                <FormSelect ref={e => this.monHocSongHanh = e} data={this.state.monCtdt} multiple={true} style={{ marginBottom: 0, width: '250px' }} placeholder='Chọn môn học' />
            </>
        );
    };

    selectMhTuongDuong = () => {
        return (
            <>
                <FormSelect ref={e => this.monHocTuongDuong = e} data={SelectAdapter_DmMonHocAll()} multiple={true} style={{ marginBottom: 0, width: '250px' }} placeholder='Chọn môn học' onChange={this.handleMonTuongDuong} />
            </>
        );
    };

    handleMonTuongDuong = (value) => {
        let maMonCtdt = this.props.ctdt.map(item => item.maMonHoc);
        if (maMonCtdt.includes(value.id)) {
            this.monHocTuongDuong.value().pop();
            T.notify(`Môn <b>${value.text}</b> nằm trong chương trình đào tạo`, 'warning');
            this.monHocTuongDuong.focus();
        }
    }

    getValue = () => {
        const keys = Object.keys(this.props.ctdt);
        const updateDatas = [];
        let flag = true;
        keys.forEach((key, index, array) => {
            const item = {
                maMonHoc: this.rows[key].maMonHoc,
            };
            updateDatas.push(item);

            if (index == array.length - 1) return ({ updateDatas });
        });
        return flag ? { updateDatas } : null;
    }

    render = () => {
        const table = renderTable({
            getDataSource: () => this.state.monDaoTao,
            stickyHead: false,
            header: 'thead-light',
            emptyTable: 'Không có dữ liệu',
            renderHead: () => (
                <>
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã môn học</th>
                        <th style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }}>Môn học</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Môn học tiên quyết</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Môn học học trước</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Môn học song hành</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Môn học tương đương</th>
                    </tr>
                </>),
            renderRow: (item) => {
                const idx = this.props.ctdt.findIndex(ctdt => ctdt.maMonHoc == item.maMonHoc);
                return (<tr key={idx}>
                    <TableCell content={item.maMonHoc} style={{ textAlign: 'center', fontWeight: '500' }} />
                    <TableCell content={item.tenMonHoc} style={{ fontWeight: '500', whiteSpace: 'nowrap' }} />
                    <TableCell content={this.selectMhTienQuyet()} style={{ textAlign: 'left' }} />
                    <TableCell content={this.selectMhHocTruoc()} style={{ textAlign: 'left' }} />
                    <TableCell content={this.selectMhSongHanh()} style={{ textAlign: 'left' }} />
                    <TableCell content={this.selectMhTuongDuong()} style={{ textAlign: 'left' }} />
                </tr>);
            },
        });
        return this.renderModal({
            title: 'Điều chỉnh kế hoạch đào tạo',
            size: 'elarge',
            body: <>
                <div className='row'>
                    <FormTextBox ref={e => this.tcDangKy = e} className='col-md-4' type='number' label='Số tín chỉ đăng ký tối thiểu' />
                    <FormTextBox ref={e => this.tcTichLuy = e} className='col-md-4' type='number' label='Số tín chỉ tích luỹ tối thiểu' />
                    <FormTextBox ref={e => this.diemTrungBinh = e} className='col-md-4' type='number' label='Điểm trung bình tối thiểu' step decimalScale='2' />
                </div>
                {table}
            </>
        });
    };
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDtChuongTrinhDaoTao, getDtKeHoachDaoTao, createDtKeHoachDaoTao, updateDtKeHoachDaoTao };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(KeHoachDaoTaoModal);