import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmMonHocAll } from 'modules/mdDaoTao/dmMonHoc/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import KeHoachDaoTaoModal from './TienQuyetModal';
class ComponentKienThuc extends AdminPage {
    maKhoa = null;
    rows = {};
    state = { datas: {} };
    monHoc = '';
    khoa = '';
    oldData = ''

    setVal = (data = [], maKhoa, childs) => {
        const permission = this.getUserPermission(this.props.prefixPermission || 'dtChuongTrinhDaoTao', ['write', 'manage']);

        this.maKhoa = maKhoa;
        if (childs) {
            const length = {};
            //add select monhoc row
            const addSelectRow = () => {
                const addEmptySelectRow = (childId, childText) => {
                    if (childId < 0) return;
                    if (length[childId] == null) length[childId] = 0;
                    this.addRow(length[childId], null, childId, childText);
                };
                childs.forEach(child => {
                    addEmptySelectRow(child.id, child.value.text);
                });
            };

            const addRow = (item, idx) => {
                if (!item) {
                    permission.write && addSelectRow();
                    return;
                }
                if (!length[item.maKhoiKienThucCon]) {
                    length[item.maKhoiKienThucCon] = 0;
                }
                this.addRow(length[item.maKhoiKienThucCon], item, item.maKhoiKienThucCon, childs.find(child => child.id == item.maKhoiKienThucCon)?.value?.text, () => {
                    length[item.maKhoiKienThucCon]++;
                    idx++;
                    addRow(data[idx], idx);
                });
            };
            addRow(data[0], 0);
        } else {
            const addRow = (length, item) => {
                if (!item) {
                    permission.write && this.addRow(length);
                    return;
                }
                this.addRow(length, item, null, null, () => {
                    length++;
                    addRow(length, data[length]);
                });
            };
            addRow(0, data[0]);
        }

    }

    addRow = (idx, item, childId, childText, done) => {
        const permission = this.getUserPermission(this.props.prefixPermission || 'dtChuongTrinhDaoTao', ['write', 'manage']);
        idx = childId !== null && childId >= 0 ? `${childId}_${idx}` : idx;
        const id = item ? item.id : -1;
        const editFlag = (permission.write || permission.manage) ? (id > 0 ? false : true) : false;
        const isDeleted = false;
        this.rows[idx] = {
            id: null, maMonHoc: null, tenMonHoc: null, loaiMonHoc: null, soTinChi: null, soTietLyThuyet: null, tinhChatMon: null, soTietThucHanh: null, soTiet: null, hocKyDuKien: null, namHocDuKien: null, khoa: null
        };
        setTimeout(() => {
            this.setEditState(idx, childId, childText, editFlag, id, isDeleted, () => {
                let namHoc_hocKy = '', namHoc = null;
                if (item && item.id) {
                    let { oldKhoaSv, newKhoaSv } = this.props.getKhoaSinhVien,
                        diff = newKhoaSv - oldKhoaSv;
                    namHoc = `${Number(item?.namHocDuKien?.split(' - ')[0]) + diff} - ${Number(item?.namHocDuKien?.split(' - ')[1]) + diff}`;
                }
                namHoc = namHoc ?? item?.namHocDuKien;
                if (this.props.SelectAdapter_NamHocHocKy?.length > 0) {
                    namHoc_hocKy = this.props.SelectAdapter_NamHocHocKy?.find(data => data.hocKyDuKien == item?.hocKyDuKien && data.namHocDuKien == namHoc);
                }
                this.rows[idx].id = id;
                this.rows[idx].ten = item ? item?.tenMonHoc : '';
                this.rows[idx].setKDHT = !this.state.editFlag;
                this.rows[idx]?.loaiMonHoc?.value(item ? item.loaiMonHoc : 0);
                // this.rows[idx].tinhChatMon.value(item ? item.tinhChatMon : 0);
                this.rows[idx]?.soTietLyThuyet?.value(item ? (item.soTietLyThuyet || 0).toString() : '0');
                this.rows[idx]?.soTietThucHanh?.value(item ? (item.soTietThucHanh || 0).toString() : '0');
                // this.rows[idx].hocKyDuKien.value(item ? item.hocKyDuKien : null);
                this.rows[idx]?.namHocHocKy?.value(namHoc_hocKy ? namHoc_hocKy.id : '');
                this.rows[idx]?.soTinChi?.value(item ? (item.soTinChi || 0).toString() : '0');
                // id != -1 && this.rows[idx]?.tenMonHoc?.value(item && item.tenMonHoc ? item.tenMonHoc : '');
                this.rows[idx]?.maMonHoc?.value(item ? item.maMonHoc : '');
                // item && item.maMonHoc && this.props.pushMonHocChosen(item.maMonHoc);
                // this.rows[idx].ma.value((item && item.maMonHoc) ? item.maMonHoc : '');
                this.rows[idx]?.khoa?.value(item ? item.khoa : '');
                this.rows[idx]?.soTiet?.value(item ? (item.tongSoTiet || 0).toString() : '0');
                done && done();
            });
        }, 10);
    }

    setEditState = (idx, childId, childText, editFlag, id, isDeleted, done) => {
        this.setState({
            datas: {
                ...this.state.datas,
                [idx]: {
                    idx: idx,
                    childText: childText,
                    childId: childId,
                    edit: editFlag,
                    id: id,
                    isDeleted: isDeleted,
                }
            }
        }, () => {
            done && done();
        });
    }

    editRow = (e, idx, childId) => {
        e?.preventDefault();
        idx = childId >= 0 ? `${childId}_${idx}` : idx;
        if (!this.rows[idx] || !this.rows[idx].maMonHoc.value()) {
            T.notify('Vui lòng chọn môn học!', 'danger');
            return;
        }
        this.oldData = this.rows[idx].maMonHoc.value();
        const permission = this.getUserPermission(this.props.prefixPermission || 'dtChuongTrinhDaoTao', ['write', 'manage']);
        if (permission.write || permission.manage) {
            let curData = this.rows[idx].maMonHoc.value();
            this.props.removeMonHoc(this.oldData);
            if (this.props.pushMonHocChosen(curData)) {
                const curEdit = this.state.datas[idx].edit;
                const id = this.state.datas[idx].id;
                const isDeleted = this.state.datas[idx].isDeleted;
                const childText = this.state.datas[idx].childText;
                const childId = this.state.datas[idx].childId;
                this.setEditState(idx, childId, childText, !curEdit, id, isDeleted, () => {
                    this.rows[idx].id = id;
                    this.rows[idx].setKDHT = !this.state.editFlag;
                    this.rows[idx].maMonHoc.value(this.rows[idx].maMonHoc.value());
                    this.rows[idx].loaiMonHoc.value(this.rows[idx].loaiMonHoc.value());
                    this.rows[idx].namHocHocKy.value(this.rows[idx].namHocHocKy.value());
                });
            } else {
                this.rows[idx].maMonHoc.focus();
            }
        }
    }

    removeRow = (e, idx) => {
        e.preventDefault();
        const id = this.state.datas[idx].id;
        T.confirm('Xóa môn học', 'Bạn có chắc bạn muốn xóa môn học này?', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Xóa môn học thành công!', 'success', false, 800);
                const childId = this.state.datas[idx].childId;
                const childText = this.state.datas[idx].childText;
                this.setEditState(idx, childId, childText, false, id, true);
            }
        });
    }

    undoRow = (e, idx, childId) => {
        e.preventDefault();
        idx = childId >= 0 ? `${childId}_${idx}` : idx;
        const id = this.state.datas[idx].id;
        const childText = this.state.datas[idx].childText;
        this.setEditState(idx, childId, childText, false, id, false);
    }

    setMonHoc = (item, idx, value, childId, childText) => {
        // let listMonCtdt = Object.entries(this.rows).map(item => item[1].maMonHoc.value());
        // if (listMonCtdt.includes(value.id)) {

        // }
        const { tongTinChi, tietLt, tietTh, tongTiet, khoa, ten } = value.item;
        let preIdx, nextIdx;
        if (childId !== null && childId >= 0) {
            const arr = idx.split('_');
            preIdx = parseInt(arr[1]) - 1;
            nextIdx = parseInt(arr[1]) + 1;
        } else {
            preIdx = idx - 1;
            nextIdx = idx + 1;
        }
        const statePreIdx = childId >= 0 ? `${childId}_${preIdx}` : preIdx;
        if (this.rows[statePreIdx] && this.state.datas[statePreIdx]?.edit) {
            this.editRow(null, preIdx, childId);
            this.oldData = '';
        }
        if (this.props.pushMonHocChosen(value.id)) {
            this.props.removeMonHoc(this.oldData);
            this.setState({ khoa });
            this.rows[idx].id = item.id;
            this.rows[idx].setKDHT = false;
            this.rows[idx].khoa.value(khoa);
            this.rows[idx].ten = T.parse(ten, { vi: '' })?.vi;
            this.rows[idx].soTinChi.value(tongTinChi);
            this.rows[idx].soTietLyThuyet.value(tietLt.toString() || '0');
            this.rows[idx].soTietThucHanh.value(tietTh.toString() || '0');
            this.rows[idx].soTiet.value(tongTiet);
            // if (this.rows[idx].hocKyDuKien.value()) {
            //     this.rows[idx].hocKyDuKien.value(null);
            // }
            if (this.rows[idx].namHocHocKy.value()) {
                this.rows[idx].namHocHocKy.value('');
            }
            if (this.state.datas[idx].id == -1) {
                this.addRow(nextIdx, null, childId, childText);
            }
            this.oldData = value.id;
        }
        else {
            this.props.removeMonHoc(this.oldData);
            this.rows[idx].maMonHoc.value('');
            this.rows[idx].khoa.value('');
            this.rows[idx].maMonHoc.focus();
            this.oldData = '';
        }
    }

    selectMh = (item, idx, childId, childText) => {
        return (
            <>
                <FormSelect ref={e => this.rows[idx].maMonHoc = e} data={SelectAdapter_DmMonHocAll()} style={{ marginBottom: 0, width: '100%' }} placeholder='Chọn môn học' readOnly={!this.state.datas[idx].edit} onChange={value => this.setMonHoc(item, idx, value, childId, childText)} />
                <FormSelect ref={e => this.rows[idx].khoa = e} data={SelectAdapter_DmDonViFaculty_V2} style={{ marginBottom: 0, width: '100%', marginTop: 10 }} readOnly readOnlyNormal />
            </>
        );
    };

    selectMaMonHoc = (idx) => {
        return (
            <FormTextBox ref={e => this.rows[idx].ma = e} style={{ marginBottom: 0, width: '80px' }} readOnly readOnlyNormal />
        );
    }
    insertLoaiMh = (idx) => {
        return <FormCheckbox ref={e => this.rows[idx].loaiMonHoc = e} readOnly={this.state.datas[idx]?.isDeleted} />;
    };

    insertTinhChatMon = (idx) => {
        return <FormCheckbox ref={e => this.rows[idx].tinhChatMon = e} readOnly={this.state.datas[idx]?.isDeleted} />;
    };

    insertTongSoTc = (idx) => {
        return (<FormTextBox ref={e => this.rows[idx].soTinChi = e} readOnly={true} style={{ textAlign: 'center', marginBottom: 0, width: '30px' }} />);
    };

    insertTietLt = (idx) => {
        return (<FormTextBox ref={e => this.rows[idx].soTietLyThuyet = e} readOnly={true} max={999} style={{ textAlign: 'center', marginBottom: 0, width: '30px' }} />);
    };

    insertTietTh = (idx) => {
        return (<FormTextBox ref={e => this.rows[idx].soTietThucHanh = e} readOnly={true} style={{ textAlign: 'center', marginBottom: 0, width: '30px' }} />);
    };

    insertSoTiet = (idx) => {
        return (<FormTextBox ref={e => this.rows[idx].soTiet = e} className='col-12' readOnly={true} style={{ textAlign: 'center', marginBottom: 0, width: '30px' }} />);
    };

    insertNamHocHocKy = (idx) => {
        let SelectAdapter_NamHocHocKy = [];
        if (this.props.SelectAdapter_NamHocHocKy?.length > 0) {
            SelectAdapter_NamHocHocKy = this.props.SelectAdapter_NamHocHocKy;
        }
        return (<FormSelect ref={e => this.rows[idx].namHocHocKy = e} data={SelectAdapter_NamHocHocKy} placeholder='Học kỳ, năm học' readOnly={!this.state.datas[idx]?.edit} style={{ marginBottom: 0, width: '100%' }} />);
    };

    convertObjToArr = () => {
        const tmp = Object.values(this.state.datas).sort((a, b) => a.childId - b.childId);
        return tmp;
    }

    getValue = () => {
        const keys = Object.keys(this.rows);
        const updateDatas = [];
        const deleteDatas = [];
        let flag = true;
        keys.forEach((key, index, array) => {
            const id = this.state.datas[key].id;
            const childId = this.state.datas[key].childId;
            const item = {
                maMonHoc: this.rows[key].maMonHoc?.value(),
                tenMonHoc: this.rows[key].ten,
                tinhChatMon: Number(this.rows[key].tinhChatMon?.value()),
                loaiMonHoc: Number(this.rows[key].loaiMonHoc?.value()),
                maKhoiKienThuc: this.props.khoiKienThucId,
                soTinChi: Number(this.rows[key].soTinChi?.value()),
                soTietLyThuyet: Number(this.rows[key].soTietLyThuyet?.value()),
                soTietThucHanh: Number(this.rows[key].soTietThucHanh?.value()),
                tongSoTiet: this.rows[key].soTiet?.value(),
                hocKyDuKien: this.rows[key].namHocHocKy?.data()?.hocKyDuKien,
                namHocDuKien: this.rows[key].namHocHocKy?.data()?.namHocDuKien,
                tenKhoa: this.rows[key].khoa?.data()?.text,
                khoa: this.rows[key].khoa?.value(),
                maKhoiKienThucCon: childId
            };

            if (item.maMonHoc) {

                if (id > 0 && this.state.datas[key].isDeleted) {
                    deleteDatas.push(item);
                } else if (!this.state.datas[key].isDeleted) {
                    updateDatas.push(item);
                }
            }

            if (index == array.length - 1) return ({ updateDatas, deleteDatas });
        });
        return flag ? { updateDatas, deleteDatas } : null;
    }

    render() {
        const permission = this.getUserPermission(this.props.prefixPermission || 'dtChuongTrinhDaoTao', ['read', 'manage', 'write', 'delete']);
        const title = this.props.title;
        let styleRow = (idx) => ({ backgroundColor: `${this.state.datas[idx]?.isDeleted ? '#ffdad9' : (!this.state.datas[idx]?.edit ? '#C8F7C8' : null)}` });
        let count = 1;
        const table = renderTable({
            getDataSource: () => this.convertObjToArr(),
            stickyHead: false,
            header: 'thead-light',
            emptyTable: 'Không có dữ liệu',
            renderHead: () => (
                <>
                    <tr>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>STT</th>
                        {/* <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Môn riêng</th> */}
                        {/* <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Môn học</th> */}
                        <th rowSpan='2' style={{ width: '100%', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Môn học</th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Tự chọn</th>
                        <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', }}>Tín chỉ
                        </th>
                        <th rowSpan='1' colSpan='3' style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Số tiết</th>
                        {/* <th rowSpan='2' style={{ width: '100%', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Học kỳ dự kiến</th> */}
                        <th rowSpan='2' style={{ width: '100%', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Học kỳ, năm học dự kiến</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                    <tr>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>LT</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TH/TN</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng</th>
                    </tr>
                </>),
            renderRow: (item) => {
                const index = item.idx;
                const idx = item.childId !== null && item.childId >= 0 ? index.split('_')[1] : index;
                const stt = (!this.state.datas[index]?.edit && !this.state.datas[index]?.isDeleted) ? count++ : null;
                return (
                    <React.Fragment key={index}>
                        {item.childText && parseInt(idx) == 0 && <tr><td colSpan={10}><b>{item.childText}</b></td></tr>}
                        <tr>
                            <TableCell type='text' style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }} content={stt} />
                            <TableCell content={this.selectMh(item, index, item.childId, item.childText)} style={{ backgroundColor: styleRow(index).backgroundColor }} />
                            <TableCell content={this.insertLoaiMh(index)} style={{ backgroundColor: styleRow(index).backgroundColor, textAlign: 'center' }} />
                            <TableCell type='number' style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }} content={this.insertTongSoTc(index)} />
                            <TableCell type='number' style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }} content={this.insertTietLt(index)} />
                            <TableCell type='number' style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }} content={this.insertTietTh(index)} />
                            <TableCell type='number' style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }} content={this.insertSoTiet(index)} />
                            <TableCell content={this.insertNamHocHocKy(index)} style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }} />
                            <td rowSpan={1} colSpan={1} style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }}>
                                <div className='btn-group'>
                                    {
                                        (permission.write || permission.manage) ? (!item.isDeleted ?
                                            <>
                                                <a className='btn btn-primary' href='#' title={!item.edit ? 'Chỉnh sửa' : 'Xong'} onClick={(e) => this.editRow(e, index)}><i className={'fa fa-lg ' + (!item.edit ? 'fa-edit' : 'fa-check')} /></a>
                                                {!item.edit && (this.props.listMonCtdt.length > 0 || !this.rows[index].setKDHT) && <>
                                                    <a className='btn btn-info' href='#' title='Kế hoạch đào tạo' onClick={(e) => e.preventDefault() || this.khdtModal.show(this.props.listMonCtdt.find(item => item.maMonHoc == this.rows[index].maMonHoc?.value()))}><i className='fa fa-lg fa-pencil' /></a>
                                                    <KeHoachDaoTaoModal ref={e => this.khdtModal = e} ctdt={this.props.listMonCtdt} maKhungCtdt={this.props.maKhungCtdt}
                                                        setEditState={this.setEditState} editRow={this.editRow} datas={this.state.datas} />
                                                </>}
                                                {!item.edit && <a className='btn btn-danger' href='#' title='Xóa' onClick={(e) => this.removeRow(e, index)}><i className='fa fa-lg fa-trash' /></a>}
                                            </>
                                            : !item.edit && <a className='btn btn-danger' href='#' title='Hoàn tác' onClick={(e) => this.undoRow(e, index)}><i className='fa fa-lg fa-undo' /></a>) : null
                                    }
                                </div>
                            </td>
                        </tr>
                    </React.Fragment>
                );
            },
        });

        return (<>
            <div className='tile'>
                <div>
                    <h4>{title}</h4>
                    <p>{this.props.subTitle}</p>
                </div>
                {table}
                {/* <button onClick={() => this.getValue()}>Get Data</button> */}
            </div>
        </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dtChuongTrinhDaoTao: state.daoTao.dtChuongTrinhDaoTao });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentKienThuc);
