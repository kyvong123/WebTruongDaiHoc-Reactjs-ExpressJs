import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { FormCheckbox, FormSelect, FormTextBox, getValue } from 'view/component/AdminPage';
import { ThongTinNhomKhoa, ThongTinNhomNganh } from './nhomKhoaComponent';
import { createDieuKienHocBong, updateDieuKienHocBong, deleteDieuKienHocBong, downloadDanhSachNhom } from '../redux/dieuKienRedux';

const dieuKienKhoa = 0;
const dieuKienNganh = 1;
class NhomDieuKien extends React.Component {
    state = { dsNhomKhoaEdit: [], dsNhomNganhEdit: [], editItem: null, isKhoaSelect: false, isAddNewKhoa: true, isAddNewNganh: true, isNhomNganhSelect: false, nhomKhoaEdit: null, nhomNganhEdit: null }
    componentDidMount = () => {
        this.load(this.props.dieuKien);
    }

    componentDidUpdate(prevProps) {
        if (this.props.dieuKien != prevProps.dieuKien || this.props.dieuKien?.id != prevProps.dieuKien?.id) {
            this.load(this.props.dieuKien);
        }
    }

    load = (dieuKien) => {
        if (!dieuKien) return;
        let dsNhomKhoa = [], dsNhomNganh = [];
        const { loaiDieuKien, dsNhom } = dieuKien;
        if (loaiDieuKien == dieuKienKhoa) {
            dsNhomKhoa = [...dsNhom];
        } else if (loaiDieuKien == dieuKienNganh) {
            dsNhomNganh = [...dsNhom];
        }
        this.setState({
            dieuKien, dsNhomKhoaEdit: dsNhomKhoa, dsNhomNganhEdit: dsNhomNganh,
            isKhoaSelect: (dsNhomKhoa && dsNhomKhoa.length), isNhomNganhSelect: (dsNhomNganh && dsNhomNganh.length),
            isAddNewKhoa: !(dsNhomKhoa && dsNhomKhoa.length), isAddNewNganh: !(dsNhomNganh && dsNhomNganh.length)
        }, () => {
            this.isKhoaSelect?.value(this.state.isKhoaSelect);
            this.isNhomNganhSelect?.value(this.state.isNhomNganhSelect);
        });
        this.setData(dieuKien);
    }
    setData = (dieuKien) => {
        dieuKien = dieuKien ?? this.state.dieuKien;
        const index = this.props.index;
        const { ten, khoaSinhVien, heDaoTao, tongKinhPhi } = dieuKien;
        this.ten.value(ten || `Cấu hình ${typeof index == 'number' ? index + 1 : 'mới'}`);
        this.khoaSinhVien.value(Array.isArray(khoaSinhVien) ? khoaSinhVien : khoaSinhVien.split(','));
        this.heDaoTao.value(Array.isArray(heDaoTao) ? heDaoTao : heDaoTao.split(','), () => this.changeHeDaoTao());
        this.tongKinhPhiDieuKien.value(tongKinhPhi);
    }

    addNewNhomKhoa = (nhomKhoa, done) => {
        const { dsNhomKhoaEdit } = this.state;
        const index = dsNhomKhoaEdit.findIndex((element) => element.idNhom === nhomKhoa.idNhom);
        if (index === -1) {
            dsNhomKhoaEdit.push({
                ...nhomKhoa,
                idNhom: dsNhomKhoaEdit.length
            });
        } else {
            dsNhomKhoaEdit[index] = {
                ...dsNhomKhoaEdit[index],
                ...nhomKhoa,
            };
        }
        this.setState({ dsNhomKhoaEdit, isAddNewKhoa: false }, () => {
            const tongKinhPhiNhomKhoa = Number(this.state.dsNhomKhoaEdit.reduce((init, nhomKhoa) => (init + Number(nhomKhoa.tongKinhPhi || 0)), 0));
            this.tongKinhPhiDieuKien.value(tongKinhPhiNhomKhoa);
            done && done();
        });
    }

    addNewNhomNganh = (nhomNganh, done) => {
        const { dsNhomNganhEdit } = this.state;
        const index = dsNhomNganhEdit.findIndex((element) => element.idNhom === nhomNganh.idNhom);
        if (index === -1) {
            dsNhomNganhEdit.push({
                ...nhomNganh,
                idNhom: dsNhomNganhEdit.length
            });
        } else {
            dsNhomNganhEdit[index] = {
                ...dsNhomNganhEdit[index],
                ...nhomNganh,
            };
        }
        this.setState({ dsNhomNganhEdit, isAddNewNganh: false }, () => {
            const tongKinhPhiNhomNganh = Number(this.state.dsNhomNganhEdit.reduce((init, nhomNganh) => (init + Number(nhomNganh.tongKinhPhi || 0)), 0));
            this.tongKinhPhiDieuKien.value(tongKinhPhiNhomNganh);
            done && done();
        });
    }

    addNewDieuKien = () => {
        try {
            const done = () => this.props.onSave && this.props.onSave();
            const { dsNhomKhoaEdit, dieuKien, dsNhomNganhEdit, isKhoaSelect } = this.state;
            const newDieuKien = {
                idDieuKien: dieuKien ? dieuKien.idDieuKien : null,
                idDot: this.props.idDot,
                ten: getValue(this.ten),
                khoaSinhVien: getValue(this.khoaSinhVien),
                heDaoTao: getValue(this.heDaoTao),
                tongKinhPhi: getValue(this.tongKinhPhiDieuKien),
                loaiDieuKien: isKhoaSelect == true ? 0 : 1,
                dsNhom: isKhoaSelect == true ? dsNhomKhoaEdit : dsNhomNganhEdit
            };
            if (this.props.idDot == 'new') {
                this.props.addNewDieuKien(newDieuKien);
                dieuKien ? this.props.huyEditDieuKien() : this.props.huyAddNew();
            } else {
                dieuKien ? this.props.updateDieuKienHocBong(dieuKien.id, newDieuKien, done) : this.props.createDieuKienHocBong(newDieuKien, done);
            }

        } catch (error) {
            console.error(error);
            if (error.props) {
                T.notify(`${error.props.label || error.props.placeholder || 'Dữ liệu'} bị trống!`, 'danger');
                error.focus();
            }
        }
    }

    cloneDieuKien = () => {
        const { dsNhomKhoaEdit, dsNhomNganhEdit, isKhoaSelect } = this.state;
        const newDieuKien = {
            ten: `${this.ten.value()} sao chép`,
            idDot: this.props.idDot,
            khoaSinhVien: getValue(this.khoaSinhVien),
            heDaoTao: getValue(this.heDaoTao),
            tongKinhPhi: getValue(this.tongKinhPhiDieuKien),
            loaiDieuKien: isKhoaSelect == true ? 0 : 1,
            dsNhom: isKhoaSelect == true ? dsNhomKhoaEdit : dsNhomNganhEdit
        };
        return newDieuKien;
    }

    huyEditDieuKien = () => {
        this.setData();
        this.state.dieuKien ? this.props.huyEditDieuKien() : this.props.huyAddNew();
    }

    deleteNhom = (id, loaiDieuKien) => {
        T.confirm('Xác nhận xóa nhóm ngành', '', isConfirm => {
            if (!isConfirm) return;
            const { dsNhomKhoaEdit, dsNhomNganhEdit } = this.state;
            if (loaiDieuKien == dieuKienKhoa) {
                const newDsNhomKhoa = dsNhomKhoaEdit.filter(nhom => nhom.idNhom != id).map((nhom, index) => ({ ...nhom, idNhom: index }));
                this.setState({ dsNhomKhoaEdit: newDsNhomKhoa, isAddNewKhoa: newDsNhomKhoa.length ? false : true });
            } else if (loaiDieuKien == dieuKienNganh) {
                const newDsNhomNganh = dsNhomNganhEdit.filter(nhom => nhom.idNhom != id).map((nhom, index) => ({ ...nhom, idNhom: index }));
                this.setState({ dsNhomNganhEdit: newDsNhomNganh, isAddNewNganh: newDsNhomNganh.length ? false : true });
            }
        });
    }

    lockNhom = (id, toBeLock, typeNhom) => {
        if (!this.state[typeNhom]) return;
        const dsNhom = [...this.state[typeNhom]];
        dsNhom[id].isLock = Number(toBeLock);
        this.setState({ [typeNhom]: dsNhom });
    }

    validateKinhPhiNhom = (ref) => {
        const kinhPhiDieuKien = this.tongKinhPhiDieuKien.value();
        if (kinhPhiDieuKien == null) {
            T.notify('Vui lòng nhập tổng kinh phí cho cấu hình', 'warning');
            this.tongKinhPhiDieuKien.focus();
            ref.value('');
        } else {
            const kinhPhiCheck = ref.value();
            const totalUse = this.state.isKhoaSelect ? Number(this.state.dsNhomKhoaEdit.reduce((init, item) => init + Number(item.tongKinhPhi), 0)) : Number(this.state.dsNhomNganhEdit.reduce((init, item) => init + Number(item.tongKinhPhi), 0));
            if (kinhPhiCheck > (Number(kinhPhiDieuKien) - totalUse)) {
                T.notify('Kinh phí cho nhóm phải nhỏ hơn tổng kinh phí cấu hình', 'danger');
                ref.value('');
                ref.focus();
            }
        }
    }

    checkKinhPhiDieuKien = () => {
        this.props.validateKinhPhi(this.tongKinhPhiDieuKien);
    }

    phanTienAuto = (e) => {
        e.preventDefault();
        let { dsNhomNganhEdit, dsNhomKhoaEdit, isNhomNganhSelect, isKhoaSelect } = this.state;
        const [lockNhomNganh, dsNhomNganh] = dsNhomNganhEdit.reduce((cur, nhom) => {
            const [locked, rest] = cur;
            nhom.isLock ? locked.push(nhom) : rest.push(nhom);
            return cur;
        }, [[], []]);
        const [lockNhomKhoa, dsNhomKhoa] = dsNhomKhoaEdit.reduce((cur, nhom) => {
            const [locked, rest] = cur;
            nhom.isLock ? locked.push(nhom) : rest.push(nhom);
            return cur;
        }, [[], []]);
        const filter = {
            listKhoaSinhVien: getValue(this.khoaSinhVien).toString(),
            listHeDaoTao: getValue(this.heDaoTao).toString(),
            listNganh: isNhomNganhSelect ? dsNhomNganh.flatMap(nhom => nhom.dsNganh).map(nganh => nganh.idNganh).toString() : null,
            listKhoa: isKhoaSelect ? dsNhomKhoa.flatMap(nhom => nhom.dsKhoa).map(khoa => khoa.idKhoa).toString() : null,
        };
        let tongKinhPhi = getValue(this.tongKinhPhiDieuKien);
        if (tongKinhPhi) {
            tongKinhPhi -= isNhomNganhSelect ?
                lockNhomNganh.reduce((cur, nhom) => cur + (nhom.tongKinhPhi ?? 0), 0) :
                lockNhomKhoa.reduce((cur, nhom) => cur + (nhom.tongKinhPhi ?? 0), 0)
                ;
            this.props.autoPhanTienSvHocBongKkht(filter, tongKinhPhi, (data) => {
                const dsDoiTuong = data.reduce((acc, obj) => {
                    acc[obj.maDoiTuong] = { soLuongSinhVien: obj.soLuongSinhVien, kinhPhiHocBong: obj.kinhPhiHocBong };
                    return acc;
                }, {});
                if (isNhomNganhSelect) {
                    const newDsNhomNganh = dsNhomNganhEdit.map(nhom => nhom.isLock ? nhom : ({
                        ...nhom,
                        tongKinhPhi: nhom.dsNganh.reduce((init, nganh) => init + Number(dsDoiTuong[nganh.idNganh]?.kinhPhiHocBong || 0), 0),
                        dsNganh: nhom.dsNganh.map(nganh => ({
                            ...nganh,
                            kinhPhiNganh: dsDoiTuong[nganh.idNganh]?.kinhPhiHocBong || 0,
                            soLuongSinhVienNganh: dsDoiTuong[nganh.idNganh]?.soLuongSinhVien || 0
                        }))
                    }));
                    this.setState({ dsNhomNganhEdit: newDsNhomNganh });
                } else {
                    const newDsNhomKhoa = dsNhomKhoaEdit.map(nhom => nhom.isLock ? nhom : ({
                        ...nhom,
                        tongKinhPhi: nhom.dsKhoa.reduce((init, khoa) => init + Number(dsDoiTuong[khoa.idKhoa]?.kinhPhiHocBong || 0), 0),
                        dsKhoa: nhom.dsKhoa.map(khoa => ({
                            ...khoa,
                            kinhPhiKhoa: dsDoiTuong[khoa.idKhoa]?.kinhPhiHocBong || 0,
                            soLuongSinhVienKhoa: dsDoiTuong[khoa.idKhoa]?.soLuongSinhVien || 0
                        }))
                    }));
                    this.setState({ dsNhomKhoaEdit: newDsNhomKhoa });
                }

            });
        } else {
            T.notify('Vui lòng nhập tổng kinh phí trước khi phân tự động!', 'danger');
            this.tongKinhPhiDieuKien.focus();
        }

    }

    changeHeDaoTao = () => {
        this.setState({ heDaoTaoDieuKien: getValue(this.heDaoTao) });
    }

    checkHeDaoTaoNganh = (heDaoTaoNganh, heDaoTaoDieuKien) => {
        if (heDaoTaoDieuKien) {
            return heDaoTaoNganh.some(hdt => heDaoTaoDieuKien.includes(hdt));
        } else {
            return true;
        }
    }

    filterNganhList = (showAll = false) => {
        let { nganh } = this.props;
        const { heDaoTaoDieuKien, dsNhomNganhEdit } = this.state;
        const dsNganhExclude = dsNhomNganhEdit.reduce((cur, item) => [...cur, ...(item.dsNganh || [])], []);
        return nganh.filter(nganh => this.checkHeDaoTaoNganh(nganh.heDaoTao, heDaoTaoDieuKien) && (showAll || dsNganhExclude.every(item => item.idNganh != nganh.maNganh)));
    }

    filterKhoaList = () => {
        const { khoa } = this.props;
        const { dsNhomKhoaEdit } = this.state;
        const dsKhoaExclude = dsNhomKhoaEdit.reduce((cur, item) => [...cur, ...(item.dsKhoa || [])], []);
        return khoa.filter(khoa => dsKhoaExclude.every(item => item.idKhoa != khoa.ma));
    }

    deleteCauHinh = (dieuKien) => {
        if (this.props.idDot == 'new') {
            this.props.deleteDieuKien(dieuKien.idDieuKien);
        } else {
            T.confirm('Xác nhận xóa cấu hình?', '', isConfirm => isConfirm && this.props.deleteDieuKienHocBong(dieuKien.id, () => this.props.onSave()));
        }
    }

    cloneCauHinh = (index) => {
        if (this.props.idDot == 'new') {
            this.props.cloneCauHinh(index);
        } else {
            const newDieuKien = this.cloneDieuKien();
            this.props.createDieuKienHocBong(newDieuKien, () => this.props.onSave());
        }
    }

    render = () => {
        const { isKhoaSelect, nhomKhoaEdit, nhomNganhEdit, isNhomNganhSelect, dsNhomKhoaEdit, dsNhomNganhEdit, isAddNewKhoa, isAddNewNganh } = this.state;
        const { khoa = [], readOnly, dieuKien = {}, index, isLoading } = this.props;
        return (
            <>
                <div className='d-flex justify-content-between align-items-baseline'>
                    <h5 className='flex-grow-1'><FormTextBox className='mr-1' placeholder={'Tên cấu hình'} ref={e => this.ten = e} value={`Cấu hình ${index + 1}`} readOnly={readOnly} required /></h5>
                    <div className='d-flex justify-content-end' style={{ gap: '0.5rem' }}>
                        {readOnly ? <>
                            <button className='btn btn-info' disabled={isLoading} onClick={() => this.props.setEditItem()}>Chỉnh sửa</button>
                            <button className='btn btn-danger' disabled={isLoading || !!dieuKien.tcHandled} onClick={() => this.deleteCauHinh(dieuKien)}> Xóa</button>
                            <button className='btn btn-warning' disabled={isLoading} onClick={() => this.cloneCauHinh(index)}> Sao chép</button>
                            <button className='btn btn-success' disabled={isLoading} onClick={() => this.props.downloadDanhSachNhom(dieuKien.id)}> Xuất Excel</button></>
                            :
                            <button className='btn btn-danger' disabled={isLoading} onClick={e => {
                                e.preventDefault();
                                if (this.state.dieuKien) {
                                    this.setData();
                                    this.props.huyEditDieuKien();
                                } else {
                                    this.props.huyAddNew();
                                }
                            }}> Hủy</button>
                        }
                    </div>
                </div>
                <hr className='mt-0' />
                <div className='row'>
                    <FormSelect ref={e => this.khoaSinhVien = e} className='col-md-4' label='Khóa sinh viên' data={SelectAdapter_DtKhoaDaoTao} multiple required readOnly={readOnly} />
                    <FormSelect ref={e => this.heDaoTao = e} className='col-md-4' label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} multiple required readOnly={readOnly} onChange={() => this.changeHeDaoTao()} />
                    <FormTextBox type='number' className='col-md-4' ref={e => this.tongKinhPhiDieuKien = e} allowNegative={false} readOnly={readOnly} placeholder='Tổng kinh phí' label={<span>Tổng kinh phí <span className='text-info' style={{ cursor: 'pointer' }} onClick={e => this.phanTienAuto(e)}>(Tự động phân)</span></span>} />
                    <div className='col-md-12'>
                        <div>
                            {!isNhomNganhSelect && <div className='row'>
                                <FormCheckbox label='Điều kiện theo khoa' className={isKhoaSelect ? 'col-md-3' : 'col-md-12'} onChange={value => this.setState({ isKhoaSelect: value, isAddNewKhoa: value })} ref={e => this.isKhoaSelect = e} readOnly={readOnly} />
                                {isKhoaSelect ? <div className='col-md-12'>
                                    {dsNhomKhoaEdit.length ? dsNhomKhoaEdit.map((nhomKhoa, index) => (
                                        <div key={index}>
                                            <h5>Nhóm khoa {index + 1}
                                                {!readOnly && nhomKhoaEdit == null ? (
                                                    <>
                                                        <a style={{ cursor: 'pointer' }} className='text-secondary' onClick={() => this.lockNhom(nhomKhoa.idNhom, Number(!nhomKhoa.isLock), 'dsNhomKhoaEdit')}> <i className={`fa fa-${nhomKhoa.isLock ? 'lock' : 'unlock'}`} aria-hidden='true'></i></a>
                                                        <a style={{ cursor: 'pointer' }} className='text-info ml-2 mt-1' onClick={() => this.setState({ nhomKhoaEdit: nhomKhoa.idNhom })}><i className='fa fa-pencil-square-o' aria-hidden='true'></i></a>
                                                        <a style={{ cursor: 'pointer' }} className='text-danger' onClick={() => this.deleteNhom(nhomKhoa.idNhom, 0)}> <i className='fa fa-trash' aria-hidden='true'></i></a>
                                                    </>) : ''
                                                }
                                            </h5>
                                            <hr />
                                            <ThongTinNhomKhoa khoa={khoa} key={index} nhomKhoa={nhomKhoa} readOnly={readOnly || nhomKhoaEdit !== nhomKhoa.idNhom}
                                                addNewNhomKhoa={this.addNewNhomKhoa} huyChinhSua={() => this.setState({ nhomKhoaEdit: null, isAddNewKhoa: false })}
                                                getSvDsHocBongByNhom={this.props.getSvDsHocBongByNhom} validateKinhPhiNhom={this.validateKinhPhiNhom} />
                                            <hr />
                                        </div>
                                    )) : ''}
                                    {(!readOnly && isAddNewKhoa) && <ThongTinNhomKhoa readOnly={false} khoa={this.filterKhoaList()}
                                        addNewNhomKhoa={this.addNewNhomKhoa}
                                        huyAddNew={() => this.setState({ isAddNewKhoa: false, isKhoaSelect: !!(dsNhomKhoaEdit?.length) }, () => this.isKhoaSelect.value(this.state.isKhoaSelect))}
                                        getSvDsHocBongByNhom={this.props.getSvDsHocBongByNhom} validateKinhPhiNhom={this.validateKinhPhiNhom} />}
                                    <div>
                                        {((!isAddNewKhoa && dsNhomKhoaEdit.length && nhomKhoaEdit == null && (readOnly == false || readOnly === undefined))) && <button className='btn btn-success mr-2' type='button' onClick={e => {
                                            e.preventDefault(); this.setState({ isAddNewKhoa: true, nhomKhoaEdit: null });
                                        }}>
                                            <i className='fa fa-sm fa-pencil' /> Thêm
                                        </button>}
                                    </div>
                                </div> : ''}
                            </div>}
                            {!isKhoaSelect && <div className='row'>
                                <FormCheckbox label='Điều kiện theo ngành' className={isNhomNganhSelect ? 'col-md-3' : 'col-md-12'} onChange={value => this.setState({ isNhomNganhSelect: value, isAddNewNganh: value })} ref={e => this.isNhomNganhSelect = e} readOnly={readOnly} />
                                {isNhomNganhSelect && <div className='col-md-12'>
                                    {dsNhomNganhEdit.length ? dsNhomNganhEdit.map((nhomNganh, index) => (
                                        <div key={index}>
                                            <h5>Nhóm ngành {index + 1}
                                                {!readOnly && nhomNganhEdit == null ? (
                                                    <>
                                                        <a style={{ cursor: 'pointer' }} className='text-secondary' onClick={() => this.lockNhom(nhomNganh.idNhom, Number(!nhomNganh.isLock), 'dsNhomNganhEdit')}> <i className={`fa fa-${nhomNganh.isLock ? 'lock' : 'unlock'}`}></i></a>
                                                        <a style={{ cursor: 'pointer' }} className='text-info ml-2 mt-1' onClick={() => this.setState({ nhomNganhEdit: nhomNganh.idNhom, isAddNewNganh: false })}><i className='fa fa-pencil-square-o mt-2' aria-hidden='true'></i></a>
                                                        <a style={{ cursor: 'pointer' }} className='text-danger' onClick={() => this.deleteNhom(nhomNganh.idNhom, 1)}> <i className='fa fa-trash' aria-hidden='true'></i></a>
                                                    </>) : ''
                                                }
                                            </h5>
                                            <hr />
                                            <ThongTinNhomNganh nganh={this.filterNganhList(true)} key={index} readOnly={readOnly || nhomNganhEdit !== nhomNganh.idNhom}
                                                addNewNhomNganh={this.addNewNhomNganh} nhomNganh={nhomNganh} huyChinhSua={() => this.setState({ nhomNganhEdit: null })}
                                                getSvDsHocBongByNhom={this.props.getSvDsHocBongByNhom} validateKinhPhiNhom={this.validateKinhPhiNhom} />
                                            <hr />
                                        </div>
                                    )) : ''}
                                    {(!readOnly && isAddNewNganh) && <ThongTinNhomNganh readOnly={false}
                                        nganh={this.filterNganhList(false)} addNewNhomNganh={this.addNewNhomNganh}
                                        huyAddNew={() => this.setState({ isAddNewNganh: false, isNhomNganhSelect: dsNhomNganhEdit.length ? true : false }, () => this.isNhomNganhSelect.value(this.state.isNhomNganhSelect))}
                                        getSvDsHocBongByNhom={this.props.getSvDsHocBongByNhom} validateKinhPhiNhom={this.validateKinhPhiNhom} />}
                                    <div>
                                        {((!isAddNewNganh && dsNhomNganhEdit.length && nhomNganhEdit == null && (readOnly == false || readOnly === undefined))) ? <button className='btn btn-success mr-2' type='button' onClick={e => {
                                            e.preventDefault(); this.setState({ isAddNewNganh: true, nhomNganhEdit: null });
                                        }}>
                                            <i className='fa fa-sm fa-pencil' /> Thêm
                                        </button> : null}
                                    </div>
                                </div>}
                            </div>}
                        </div>
                    </div>
                    <div className='col-md-12' style={{ textAlign: 'center' }}>
                        {!readOnly && <button className='btn btn-info' type='button' onClick={() => {
                            this.addNewDieuKien();
                        }}>
                            <i className='fa fa-sm fa-save' /> Lưu
                        </button>}
                        {!readOnly && <button className='btn btn-danger' type='button' onClick={e => {
                            e.preventDefault();
                            if (this.state.dieuKien) {
                                this.setData();
                                this.props.huyEditDieuKien();
                            } else {
                                this.props.huyAddNew();
                            }
                        }}>
                            <i className='fa fa-sm fa-ban' /> Hủy
                        </button>}

                    </div>
                </div ></>
        );
    }
}


const mapStateToProps = (state) => ({ system: state.system });
const mapDispatchToProps = { createDieuKienHocBong, updateDieuKienHocBong, deleteDieuKienHocBong, downloadDanhSachNhom };

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(NhomDieuKien);