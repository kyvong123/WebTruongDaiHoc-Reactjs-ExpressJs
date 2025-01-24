import React from 'react';
import { AdminPage, AdminModal, TableCell, renderTable, CirclePageButton, FormCheckbox, FormTextBox } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { getDataKhungTinChi, setDefaultKhungTinChi, configNhomTuChon, editTongSoTinChi, configNhomTuongDuong, huyConfigNhomTuChon } from './redux';
import { Tooltip } from '@mui/material';


class TuChonModal extends AdminModal {
    state = { listMon: [], listChosen: [], isDinhHuong: 0, soNhom: 0, listInfo: {} }

    componentDidMount() {
        this.onHidden(() => {
            this.setState({ listChosen: [], isDinhHuong: 0, soNhom: 0, listInfo: {} }, () => {
                this.isDinhHuong.value('');
                this.soNhom.value('');
                this.tongSoTinChi.value('');
            });
        });
        this.disabledClickOutside();
    }

    onShow = (item) => {
        const listMon = this.props.monCtdt.filter(i => i.idKhungTinChi == item.id);
        this.setState({ listMon, item });
    }

    onSubmit = () => {
        const { listInfo, listMon, soNhom, isDinhHuong, item } = this.state,
            pTongSoTinChi = this.tongSoTinChi.value();

        T.confirm('Xác nhận', 'Bạn có chắc muốn cấu hình nhóm tự chọn cho chương trình đào tạo này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                let listCreate = [];

                if (!soNhom) return T.alert('Chưa có số nhóm tự chọn!', 'error', true, 5000);
                if (!pTongSoTinChi) return T.alert('Chưa có tổng số tín chỉ!', 'error', true, 5000);

                for (let idx of Object.keys(listInfo)) {
                    let { listMon, tongSoTinChi, tenNhomDinhHuong } = listInfo[idx];
                    if (!tongSoTinChi) return T.alert('Nhóm tự chọn chưa có tổng số tín chỉ!', 'error', true, 5000);

                    if (listMon.reduce((total, cur) => total + Number(cur.soTinChi), 0) < tongSoTinChi) return T.alert('Tổng số tín chỉ của các môn học trong nhóm nhỏ hơn số tín chỉ của nhóm!', 'error', true, 5000);

                    if (!tenNhomDinhHuong) return T.alert('Chưa có tên nhóm!', 'error', true, 5000);

                    if (!isDinhHuong && tongSoTinChi > pTongSoTinChi) return T.alert('Số tín chỉ của nhóm phải nhỏ hơn tổng số tín chỉ!', 'error', true, 5000);

                    if (isDinhHuong && tongSoTinChi != pTongSoTinChi) return T.alert('Tự chọn định hướng phải cùng số tín chỉ!', 'error', true, 5000);

                    listCreate.push({ ...listInfo[idx] });
                }

                if (listMon.find(mh => !Object.keys(listInfo).flatMap(i => listInfo[i].listMon.map(mon => mon.maMonHoc)).includes(mh.maMonHoc))) return T.alert('Danh sách môn tự chọn vẫn còn môn học!', 'error', true, 5000);

                if (isDinhHuong && [...new Set(listCreate.map(i => i.tongSoTinChi))].length != 1) return T.alert('Số tín chỉ của các nhóm định hướng phải bằng nhau!', 'error', true, 5000);

                if (!isDinhHuong && listCreate.map(i => i.tongSoTinChi).reduce((acc, cur) => acc + cur, 0) > pTongSoTinChi) return T.alert('Tổng tín chỉ của các nhóm không được lớn hơn tổng số tín chỉ!', 'error', true, 5000);
                T.alert('Đang cấu hình nhóm tự chọn. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.configNhomTuChon({ ...item, isDinhHuong, tongSoTinChi: this.tongSoTinChi.value(), isNhom: Number(!isDinhHuong) }, listCreate, () => {
                    this.hide();
                    this.props.handleSave();
                });
            }
        });
    }

    renderListChosen = (data) => renderTable({
        getDataSource: () => data,
        divStyle: { height: '50vh' },
        stickyHead: data && data.length > 10,
        renderHead: () => {
            return <tr>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>#</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Mã môn học</th>
                <th style={{ width: '80%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Tên môn học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Số tín chỉ</th>
            </tr>;
        },
        renderRow: (item, index) => {
            const { listChosen } = this.state;
            return <tr key={`listChon_${index}`}>
                <TableCell type='checkbox' isCheck content={listChosen.find(i => i.maMonHoc == item.maMonHoc)} permission={{ write: true }} onChanged={value => this.setState({ listChosen: value ? [...listChosen, item] : listChosen.filter(i => i.maMonHoc != item.maMonHoc) })} />
                <TableCell content={item.maMonHoc} />
                <TableCell content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soTinChi} />
            </tr>;
        }
    });

    handleTongTC = (value, idx) => {
        let { listInfo } = this.state;
        listInfo[idx] = { ...listInfo[idx], tongSoTinChi: value };
        this.setState({ listInfo });
    }

    handleSoNhom = (value) => {
        if (value < 1 || value > 3) return T.notify('Vui lòng nhập số nhóm từ 1 đến 3');
        this.setState({ soNhom: value, listMon: this.props.monCtdt.filter(i => i.idKhungTinChi == this.state.item.id), listInfo: {} });
    }

    handleTenNhom = (value, idx) => {
        let { listInfo } = this.state;
        listInfo[idx] = { ...listInfo[idx], tenNhomDinhHuong: value };
        this.setState({ listInfo });
    }

    hanldeGanMon = (idx) => {
        const { listChosen, listInfo } = this.state;
        if (!listChosen.length) return T.notify('Chưa có môn học được chọn!', 'danger');

        if ((listInfo[idx]?.listMon || []).some(mon => listChosen.map(i => i.maMonHoc).includes(mon.maMonHoc))) return T.notify('Trùng môn học trong nhóm!', 'danger');

        listInfo[idx] = { ...listInfo[idx], listMon: [...listChosen, ...(listInfo[idx]?.listMon || [])].sort((a, b) => a.maMonHoc < b.maMonHoc ? -1 : 1) };
        this.setState({ listInfo, listChosen: [] });
    }

    hanldeDeleteMon = (item, idx) => {
        const { listInfo, listMon } = this.state;
        listInfo[idx] = { ...listInfo[idx], listMon: listInfo[idx].listMon.filter(i => i.maMonHoc != item.maMonHoc) };
        this.setState({ listMon: [...listMon, item].sort((a, b) => a.maMonHoc < b.maMonHoc ? -1 : 1), listInfo });
    }

    renderNhom = () => {
        const { soNhom, listInfo } = this.state;

        const table = (data, idx) => renderTable({
            getDataSource: () => data,
            divStyle: { height: '50vh' },
            stickyHead: data && data.length > 5,
            renderHead: () => {
                return <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Mã môn học</th>
                    <th style={{ width: '80%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Tên môn học</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Số tín chỉ</th>
                    <th style={{ width: 'auto' }}>Thao tác</th>
                </tr>;
            },
            renderRow: (item, index) => {
                return <tr key={`listChon_${index}`}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.maMonHoc} />
                    <TableCell content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soTinChi} />
                    <TableCell type='buttons' content={item} permission={{ delete: true }} onDelete={() => this.hanldeDeleteMon(item, idx)} />
                </tr>;
            }
        });

        return <div className='row' style={{ overflow: 'auto', height: '65vh' }}>
            <FormCheckbox ref={e => this.isDinhHuong = e} className='col-md-4' label='Nhóm định hướng' onChange={value => this.setState({ isDinhHuong: Number(value) })} />
            <FormTextBox type='number' ref={e => this.soNhom = e} className='col-md-4' allowNegative={false} label='Số nhóm tự chọn' min={1} max={3} onChange={value => this.handleSoNhom(value)} />
            <FormTextBox type='number' ref={e => this.tongSoTinChi = e} className='col-md-4' allowNegative={false} label='Số tín chỉ' min={1} />
            {
                !!soNhom && Array.from({ length: soNhom }, (_, i) => i + 1).map(idx => {
                    let dsMon = listInfo[idx]?.listMon || [];
                    return <div key={`nhom-${idx}`} className='col-md-12'>
                        <section className='row'>
                            <hr style={{ width: '90%', border: '1.5px solid #a2a6a3' }} />
                            <FormTextBox className='col-md-2' value={`Nhóm ${idx}`} readOnly style={{ margin: 'auto 0', height: 'fit-content', marginBottom: '1rem' }} />
                            <FormTextBox className='col-md-6' placeholder='Tên nhóm' onChange={value => this.handleTenNhom(value.target.value, idx)} />
                            <FormTextBox type='number' allowNegative={false} className='col-md-3' placeholder='Tổng số TC' onChange={value => this.handleTongTC(value, idx)} />
                            <Tooltip title='Thêm môn'>
                                <button className='btn btn-success' style={{ margin: 'auto 0', height: 'fit-content', marginBottom: '1.1rem' }} onClick={e => e && e.preventDefault() || this.hanldeGanMon(idx)}
                                > <i className='fa fa-plus' /> </button>
                            </Tooltip>
                            <div className='col-md-12' style={{ display: dsMon.length ? '' : 'none' }}>
                                {table(dsMon, idx)}
                            </div>
                        </section>
                    </div>;
                })
            }
        </div>;
    }

    render = () => {
        return this.renderModal({
            title: 'Cấu hình nhóm tự chọn',
            size: 'elarge',
            body: <div className='row'>
                <div className='col-md-5'>
                    <h4>Danh sách môn tự chọn</h4>
                    {this.renderListChosen(this.state.listMon)}
                </div>
                <div className='col-md-7' style={{ borderLeft: '2px solid black' }}>
                    <h4>Danh sách nhóm tự chọn</h4>
                    {this.renderNhom()}
                </div>
            </div>
        });
    }
}


class TuongDuongModal extends AdminModal {
    state = { datas: [] }

    soTinChi = {}

    componentDidMount() {
        this.onHidden(() => {
            this.setState({ datas: [] });
            this.soTinChi = {};
        });
    }

    onShow = (item) => {
        const { mucCha, mucCon, khungTinChi } = this.props;
        let datas = [];

        Object.keys(mucCha).forEach(key => {
            const children = mucCon[key];
            if (children && children.length) {
                children.forEach(child => {
                    let dataTinChi = khungTinChi.filter(i => i.maKhoiKienThuc == mucCha[key].id && i.maKhoiKienThucCon == child.id && i.loaiKhung == 'TC' && i.id != item.id && !i.khoiKienThucTuongDuong && i.parentId == null);
                    if (dataTinChi.length) {
                        dataTinChi = dataTinChi.flatMap(i => {
                            if (Number(i.isNhom) || Number(i.isDinhHuong)) {
                                let childTuChon = khungTinChi.filter(tc => tc.parentId == i.id);
                                return [{ ...i, childText: mucCha[key].text, text: child.value.text }, ...childTuChon];
                            } else return { ...i, childText: mucCha[key].text, text: child.value.text };
                        });
                        datas.push(...dataTinChi);
                    }
                });
            } else {
                let dataTinChi = khungTinChi.filter(i => i.maKhoiKienThuc == mucCha[key].id && i.maKhoiKienThucCon == null && i.loaiKhung == 'TC' && i.id != item.id && !i.khoiKienThucTuongDuong && i.parentId == null);
                if (dataTinChi.length) {
                    dataTinChi = dataTinChi.flatMap(i => {
                        if (Number(i.isNhom) || Number(i.isDinhHuong)) {
                            let childTuChon = khungTinChi.filter(tc => tc.parentId == i.id);
                            return [{ ...i, text: mucCha[key].text }, ...childTuChon];
                        } else return { ...i, text: mucCha[key].text };
                    });
                    datas.push(...dataTinChi);
                }
            }
        });
        this.setState({ datas, item }, () => {
            if (item.khoiKienThucTuongDuong) {
                item.khoiKienThucTuongDuong.split(';').forEach(i => {
                    const [idKhoi, tinChi] = i.split(':');
                    this.soTinChi[idKhoi]?.value(tinChi);
                });
            }
        });
    }

    onSubmit = () => {
        T.confirm('Xác nhận', 'Bạn có chắc muốn cấu hình nhóm tương đương cho chương trình đào tạo này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                let { datas, item } = this.state;
                datas = datas.map(i => ({ ...i, soTinChiTuongDuong: this.soTinChi[i.id].value() }));
                datas = datas.filter(i => i.soTinChiTuongDuong);

                T.alert('Đang cấu hình nhóm tương đương. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.configNhomTuongDuong({ ...item, khoiKienThucTuongDuong: datas.map(i => `${i.id}:${i.soTinChiTuongDuong}`).join(';') }, () => {
                    this.hide();
                    this.props.handleSave();
                });
            }
        });
    }

    renderData = (data) => renderTable({
        getDataSource: () => data,
        divStyle: { height: '50vh' },
        stickyHead: data && data.length > 10,
        renderHead: () => {
            return <tr>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>#</th>
                <th style={{ width: '80%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Khối kiến thức</th>
                <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Số tín chỉ quy định</th>
                <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Số tín chỉ tương đương</th>
            </tr>;
        },
        renderRow: (item, index) => {
            return <tr key={`listData_${index}`}>
                <TableCell content={index + 1} />
                <TableCell content={<>
                    <i style={{ display: item.childText ? '' : 'none' }}>{item.childText}</i>
                    <br style={{ display: item.childText ? '' : 'none' }}></br>
                    <b>{item.text}</b>
                    <br style={{ display: item.tenNhomDinhHuong ? '' : 'none' }}></br>
                    <p style={{ display: item.tenNhomDinhHuong ? '' : 'none' }}>{Number(item.isDinhHuong) ? 'Tự chọn định hướng:' : 'Tự chọn nhóm:'} {item.tenNhomDinhHuong}</p>
                </>} />
                <TableCell style={{ textAlign: 'center' }} content={item.tongSoTinChi} />
                <TableCell style={{ textAlign: 'center' }} content={<FormTextBox type='number' ref={e => this.soTinChi[item.id] = e} style={{ marginBottom: '0' }} placeholder='Số tín chỉ' allowNegative={false} />} />
            </tr>;
        }
    });

    render = () => {
        return this.renderModal({
            title: 'Cấu hình nhóm tương đương',
            size: 'elarge',
            body: <div>
                {this.renderData(this.state.datas)}
            </div>
        });
    }
}

class MonTuongDuongModal extends AdminModal {
    state = { listMonTuongDuong: [], item: {} }

    onShow = (item) => {
        this.setState({ listMonTuongDuong: this.props.monTuongDuong.filter(i => i.maMonHoc == item.maMonHoc), item });
    }

    table = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Không có dữ liệu',
        header: 'thead-light',
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto' }}>#</th>
                <th style={{ width: '30%', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Môn học</th>
                <th style={{ width: '50%', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Tên môn học</th>
                <th style={{ width: '20%', verticalAlign: 'middle', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tín chỉ</th>
            </tr>
        ),
        renderRow: (item, index) => {
            return (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.maMonPhuThuoc} />
                    <TableCell content={T.parse(item.tenMonPhuThuoc).vi} />
                    <TableCell style={{ textAlign: 'center' }} content={item.tongTinChiPhuThuoc} />
                </tr>
            );
        }
    });

    render = () => {
        const { item, listMonTuongDuong } = this.state;
        return this.renderModal({
            title: `Thông tin môn tương đương của môn học ${item.maMonHoc}: ${T.parse(item.tenMonHoc || '{"vi":""}')?.vi}`,
            body: <>
                {this.table(listMonTuongDuong)}
            </>
        });
    }
}

class KhungTinChi extends AdminPage {
    state = { mucCha: {}, mucCon: {}, khungTinChi: [], monCtdt: [], monTuongDuong: [] }

    setData = (ma) => {
        this.props.getDataKhungTinChi(ma, data => this.setState({ ...data }));
    }

    handleSetDefault = () => {
        T.confirm('Cấu hình mặc định tín chỉ', 'Bạn chắc chắn muốn cấu hình mặc định tín chỉ cho chương trình không!', 'warning', 'true', isConfirm => {
            if (isConfirm) {
                T.alert('Đang thực thi cấu hình. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.setDefaultKhungTinChi(this.props.maKhung, () => {
                    this.props.getDataKhungTinChi(this.props.maKhung, data => this.setState({ ...data }, () => T.alert('Cấu hình thành công', 'success', false, 1000)));
                });
            }
        });
    }

    editTinChi = (item) => {
        if (this.state.editItem == item.id) {
            T.confirm('Chỉnh sửa số tín chỉ', 'Bạn chắc chắn muốn chỉnh sửa số tín chỉ của khối kiến thức không!', 'warning', 'true', isConfirm => {
                if (isConfirm) {
                    const tongSoTinChi = this.tongSoTinChi.value();

                    if (!tongSoTinChi) return T.alert('Chưa có số tín chỉ!', 'error', true, 5000);
                    const soTinChiMon = this.state.monCtdt.filter(i => i.idKhungTinChi == item.id).reduce((total, cur) => total + Number(cur.soTinChi), 0);

                    if (tongSoTinChi > soTinChiMon) return T.alert('Tổng số tín chỉ của các môn trong khối kiến thức phải lớn hơn số tín chỉ cần đạt!', 'error', true, 5000);

                    T.alert('Đang chỉnh sửa số tín chỉ. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                    this.props.editTongSoTinChi({ ...item, tongSoTinChi }, () => {
                        this.props.getDataKhungTinChi(this.props.maKhung, data => this.setState({ ...data, editItem: null }, () => T.alert('Chỉnh sửa số tín chỉ thành công', 'success', false, 1000)));
                    });
                }
            });
        } else this.setState({ editItem: item.id });
    }

    huyTuChon = (item) => {
        T.confirm('Xác nhận', 'Bạn có chắc muốn hủy cấu hình nhóm tự chọn cho chương trình đào tạo này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                const { khungTinChi } = this.state;

                let nhomTuongDuong = khungTinChi.filter(i => i.khoiKienThucTuongDuong).flatMap(i => ({ ...i, khoiKienThucTuongDuong: i.khoiKienThucTuongDuong.split(';').flatMap(kkt => kkt.split(':')[0]) }));

                if (nhomTuongDuong.find(i => i == item.id)) return T.alert('Nhóm tự chọn đang được cấu hình nhóm tương đương', 'error', false, 2000);

                T.alert('Đang hủy cấu hình nhóm tự chọn. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.huyConfigNhomTuChon({ id: item.id, maKhungDaoTao: item.maKhungDaoTao, maKhoiKienThuc: item.maKhoiKienThuc, maKhoiKienThucCon: item.maKhoiKienThucCon }, () => {
                    this.props.getDataKhungTinChi(this.props.maKhung, data => this.setState({ ...data, editItem: null }, () => T.alert('Hủy cấu hình nhóm tự chọn thành công', 'success', false, 1000)));
                });
            }
        });
    }

    componentKhoiKienThuc = (mucCha, children) => {
        const { khungTinChi, monCtdt } = this.state,
            permission = this.getUserPermission('dtChuongTrinhDaoTao', ['manage']);

        let datas = [];
        if (children && children.length) {
            children.forEach(child => {
                let dataTinChi = khungTinChi.filter(i => i.maKhoiKienThuc == mucCha.id && i.maKhoiKienThucCon == child.id && i.parentId == null);
                if (dataTinChi.length) {
                    datas.push({ title: child.value.text });
                    let nhomBatBuoc = dataTinChi.find(i => i.loaiKhung == 'BB');
                    if (nhomBatBuoc) {
                        datas.push({ ...nhomBatBuoc });
                        monCtdt.filter(i => i.idKhungTinChi == nhomBatBuoc.id && i.loaiMonHoc == 0).map((mon, index) => {
                            datas.push({ ...mon, index });
                        });
                    }

                    let nhomTuChon = dataTinChi.find(i => i.loaiKhung == 'TC');
                    if (nhomTuChon) {
                        if (nhomTuChon.isDinhHuong || nhomTuChon.isNhom) {
                            let childTuChon = khungTinChi.filter(i => i.parentId == nhomTuChon.id);
                            childTuChon = childTuChon.flatMap(child => {
                                return [child, ...monCtdt.filter(i => i.loaiMonHoc == 1 && i.idKhungTinChi == child.id).map((mon, index) => ({ ...mon, index }))];
                            });
                            datas.push({ ...nhomTuChon, childTuChon });
                        } else {
                            datas.push({ ...nhomTuChon });
                            monCtdt.filter(i => i.idKhungTinChi == nhomTuChon.id && i.loaiMonHoc == 1).map((mon, index) => {
                                datas.push({ ...mon, index });
                            });
                        }
                    }
                }
            });
        } else {
            let dataTinChi = khungTinChi.filter(i => i.maKhoiKienThuc == mucCha.id && i.maKhoiKienThucCon == null && i.parentId == null);
            if (dataTinChi.length) {
                let nhomBatBuoc = dataTinChi.find(i => i.loaiKhung == 'BB');
                if (nhomBatBuoc) {
                    datas.push({ ...nhomBatBuoc });
                    monCtdt.filter(i => i.idKhungTinChi == nhomBatBuoc.id && i.loaiMonHoc == 0).map((mon, index) => {
                        datas.push({ ...mon, index });
                    });
                }

                let nhomTuChon = dataTinChi.find(i => i.loaiKhung == 'TC');
                if (nhomTuChon) {
                    if (nhomTuChon.isDinhHuong || nhomTuChon.isNhom) {
                        let childTuChon = khungTinChi.filter(i => i.parentId == nhomTuChon.id);
                        childTuChon = childTuChon.flatMap(child => {
                            return [child, ...monCtdt.filter(i => i.loaiMonHoc == 1 && i.idKhungTinChi == child.id)].map((mon, index) => ({ ...mon, index }));
                        });
                        datas.push({ ...nhomTuChon, childTuChon });
                    } else {
                        datas.push({ ...nhomTuChon });
                        monCtdt.filter(i => i.idKhungTinChi == nhomTuChon.id && i.loaiMonHoc == 1).map((mon, index) => {
                            datas.push({ ...mon, index });
                        });
                    }
                }
            }
        }

        const table = data => renderTable({
            getDataSource: () => data,
            emptyTable: 'Không có môn trong chương trình đào tạo',
            header: 'thead-light',
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Mã môn học</th>
                    <th style={{ width: '70%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Tên môn học</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Số tín chỉ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => {
                const { editItem, monTuongDuong } = this.state;
                if (item.childTuChon) return <React.Fragment key={`${index}-${item.idMon || item.id || ''}`}>
                    <tr>
                        <td colSpan={3} data-toggle='collapse' data-target={`#collapse-${item.id}`} aria-expanded='true' aria-controls={`collapse-${item.id}`}>
                            <b>{item.isDinhHuong ? 'Nhóm tự chọn định hướng' : 'Nhóm tự chọn'}</b>
                        </td>
                        <td style={{ textAlign: 'center' }}>{editItem == item.id ? <FormTextBox className='mb-0' type='number' allowNegative={false} min={1} ref={e => this.tongSoTinChi = e} value={item.tongSoTinChi} /> : <b>{item.tongSoTinChi}</b>}</td>
                        <TableCell type='buttons' permission={{ write: permission.manage }}>
                            {<Tooltip title={'Hủy cấu hình nhóm tự chọn'} arrow>
                                <button className='btn btn-danger' onClick={(e) => e && e.preventDefault() || this.huyTuChon(item)}>
                                    <i className='fa fa-lg fa-ban' />
                                </button>
                            </Tooltip>}
                        </TableCell>
                    </tr>
                    <tr className='collapse' id={`collapse-${item.id}`}>
                        <td colSpan={5}>
                            {
                                renderTable({
                                    getDataSource: () => item.childTuChon,
                                    emptyTable: 'Chưa có thông tin môn học!',
                                    header: 'thead-light',
                                    stickyHead: item.childTuChon.length > 10,
                                    renderHead: () => <tr>
                                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>#</th>
                                        <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Mã môn học</th>
                                        <th style={{ width: '70%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Tên môn học</th>
                                        <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Số tín chỉ</th>
                                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                                    </tr>,
                                    renderRow: (item, index) => {
                                        return <React.Fragment key={`child-tu-chon-${item.idMon}-${index}`}>
                                            <tr style={{ display: !item.idMon ? '' : 'none' }}>
                                                <td colSpan={3} style={{ backgroundColor: item.khoiKienThucTuongDuong ? '#f5aea9' : '' }}><b>{(item.isDinhHuong ? 'Tự chọn định hướng: ' : 'Tự chọn nhóm: ') + item.tenNhomDinhHuong}</b></td>
                                                <td style={{ textAlign: 'center' }}>{editItem == item.id ? <FormTextBox className='mb-0' type='number' allowNegative={false} min={1} ref={e => this.tongSoTinChi = e} value={item.tongSoTinChi} /> : <b>{item.tongSoTinChi}</b>}</td>
                                            </tr>
                                            <tr style={{ backgroundColor: 'white', display: item.idMon ? '' : 'none' }}>
                                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.index} />
                                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.maMonHoc} />
                                                <TableCell style={{ textAlign: 'left' }} content={T.parse(item.tenMonHoc)?.vi} />
                                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soTinChi} />
                                                <TableCell type='buttons' permission={{ write: permission.manage }}>
                                                    {<Tooltip title={'Môn học tương đương'} arrow>
                                                        <button style={{ display: monTuongDuong.find(td => td.maMonHoc == item.maMonHoc) ? '' : 'none' }} className='btn btn-primary' onClick={(e) => e && e.preventDefault() || this.monTuongDuongModal.show(item)}>
                                                            <i className='fa fa-lg fa-pencil' />
                                                        </button>
                                                    </Tooltip>}
                                                </TableCell>
                                            </tr>
                                        </React.Fragment>;
                                    }
                                })
                            }
                        </td>
                    </tr>
                </React.Fragment>;
                else return <React.Fragment key={`${index}-${item.idMon || item.id || ''}`}>
                    <tr style={{ display: item.title ? '' : 'none', backgroundColor: 'antiquewhite' }}>
                        <td colSpan={5}><b style={{ fontSize: 'medium' }}>{item.title}</b></td>
                    </tr>
                    <tr style={{ display: !item.idMon && !item.title ? '' : 'none' }}>
                        <td colSpan={3} data-toggle='collapse' data-target={`#collapse-${item.id}`} aria-expanded='true' aria-controls={`collapse-${item.id}`} style={{ backgroundColor: item.khoiKienThucTuongDuong ? '#f5aea9' : '' }}>
                            <b>{item.isDinhHuong ? 'Tự chọn định hướng: ' + item.tenNhomDinhHuong : (item.loaiKhung == 'BB' ? 'Môn bắt buộc' : 'Môn tự chọn')}</b>
                        </td>
                        <td style={{ textAlign: 'center' }}>{editItem == item.id ? <FormTextBox className='mb-0' type='number' allowNegative={false} min={1} ref={e => this.tongSoTinChi = e} value={item.tongSoTinChi} /> : <b>{item.tongSoTinChi}</b>}</td>
                        <TableCell type='buttons' permission={{ write: permission.manage }}>
                            {<Tooltip title={'Cấu hình nhóm tự chọn'} arrow>
                                <button style={{ display: item.loaiKhung == 'TC' && !item.isDinhHuong ? '' : 'none' }} className='btn btn-info' onClick={(e) => e && e.preventDefault() || this.modal.show(item)}>
                                    <i className='fa fa-lg fa-pencil' />
                                </button>
                            </Tooltip>}
                            {<Tooltip title={'Chỉnh sửa số tín chỉ'} arrow>
                                <button style={{ display: item.loaiKhung == 'TC' && !item.isDinhHuong ? '' : 'none' }} className='btn btn-warning' onClick={(e) => e && e.preventDefault() || this.editTinChi(item)}>
                                    <i className={`fa fa-lg ${editItem == item.id ? 'fa-save' : 'fa-pencil-square'}`} />
                                </button>
                            </Tooltip>}
                            {<Tooltip title={'Hủy chỉnh sửa'} arrow>
                                <button style={{ display: editItem == item.id ? '' : 'none' }} className='btn btn-secondary' onClick={(e) => e && e.preventDefault() || this.setState({ editItem: null })}>
                                    <i className='fa fa-lg fa-ban' />
                                </button>
                            </Tooltip>}
                            {<Tooltip title={'Cấu hình nhóm tương đương'} arrow>
                                <button style={{ display: item.loaiKhung == 'TC' ? '' : 'none' }} className='btn btn-success' onClick={(e) => e && e.preventDefault() || this.tuongDuongModal.show(item)}>
                                    <i className='fa fa-lg fa-retweet' />
                                </button>
                            </Tooltip>}
                        </TableCell>
                    </tr>
                    <tr style={{ backgroundColor: 'white', display: item.idMon ? '' : 'none' }} className='collapse' id={`collapse-${item.idKhungTinChi}`}>
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={item.index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.maMonHoc} />
                        <TableCell style={{ textAlign: 'left' }} content={T.parse(item.tenMonHoc)?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soTinChi} />
                        <TableCell type='buttons' permission={{ write: permission.manage }}>
                            {<Tooltip title={'Môn học tương đương'} arrow>
                                <button style={{ display: monTuongDuong.find(td => td.maMonHoc == item.maMonHoc) ? '' : 'none' }} className='btn btn-primary' onClick={(e) => e && e.preventDefault() || this.monTuongDuongModal.show(item)}>
                                    <i className='fa fa-lg fa-code' />
                                </button>
                            </Tooltip>}
                        </TableCell>
                    </tr>
                </React.Fragment>;
            }
        });

        return <div className='tile' key={mucCha.id}>
            <div>
                <h4>{mucCha.text}</h4>
            </div>
            {table(datas)}
        </div>;
    }

    render() {
        const { mucCha, mucCon, monCtdt, khungTinChi, monTuongDuong } = this.state,
            permission = this.getUserPermission('dtChuongTrinhDaoTao', ['manage']);

        return <>
            {Object.keys(mucCha).map(key => {
                const children = mucCon[key];
                return this.componentKhoiKienThuc(mucCha[key], children);
            })}
            <MonTuongDuongModal ref={e => this.monTuongDuongModal = e} monTuongDuong={monTuongDuong} />
            <TuChonModal ref={e => this.modal = e} monCtdt={monCtdt} configNhomTuChon={this.props.configNhomTuChon} handleSave={() => this.props.getDataKhungTinChi(this.props.maKhung, data => this.setState({ ...data }, () => T.alert('Cấu hình nhóm tự chọn thành công', 'success', false, 1000)))} />
            <TuongDuongModal ref={e => this.tuongDuongModal = e} khungTinChi={khungTinChi} mucCha={mucCha} mucCon={mucCon} configNhomTuongDuong={this.props.configNhomTuongDuong} handleSave={() => this.props.getDataKhungTinChi(this.props.maKhung, data => this.setState({ ...data }, () => T.alert('Cấu hình nhóm tương đương thành công', 'success', false, 1000)))} />
            {permission.manage && <CirclePageButton type='custom' tooltip='Cấu hình tín chỉ' customIcon='fa fa-lg fa-cog' customClassName='btn-info' style={{ marginRight: '20px' }} onClick={() => this.handleSetDefault()} />}
            <CirclePageButton type='export' tooltip='Export' style={{ marginRight: '80px' }} onClick={() => T.handleDownload(`/api/dt/chuong-trinh-dao-tao/khung-tin-chi/export?maKhungDaoTao=${this.props.maKhung}`)} />
        </>;
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDataKhungTinChi, setDefaultKhungTinChi, configNhomTuChon, editTongSoTinChi, configNhomTuongDuong, huyConfigNhomTuChon };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(KhungTinChi);
