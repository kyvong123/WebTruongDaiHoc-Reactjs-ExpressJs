import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { getDtNganhPage } from 'modules/mdDaoTao/dtNganhDaoTao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, FormTabs, FormTextBox, getValue, renderTable, TableCell } from 'view/component/AdminPage';
import { getCtsvLopPage, createMultipleCtsvLop, createCtsvLopMultiple } from './redux';

class MultipleCreateModal extends AdminModal {
    state = { list: [], dsChuyenNganh: [] }
    maLop = {}
    tenLop = {}
    namHocBatDau = {}
    componentDidMount() {
        this.onShown(() => this.khoaSinhVien.focus());
    }

    handleCheck = (ma, ten, maLop, value) => {
        this.setState({
            list: this.state.list.map(item => item.maNganh == ma ? ({ ...item, isCheck: !!value }) : item),
            dsChuyenNganh: this.state.dsChuyenNganh.map(item => item.ma == ma ? ({ ...item, isCheck: !!value }) : item),
        }, () => {
            if (value) {
                let { khoaSinhVien, maLop: maLopHe, tenHe, maHe } = this.state.filter;
                this.maLop[ma].value(`${khoaSinhVien.substring(2, 4)}${maLopHe || maHe}${maLop}`);
                this.tenLop[ma].value(`${ten} ${khoaSinhVien.substring(2, 4)} ${tenHe}`);
                this.namHocBatDau[ma] && this.namHocBatDau[ma].value(`${khoaSinhVien} - ${parseInt(khoaSinhVien) + 1}`);
            } else {
                this.maLop[ma].value('');
                this.tenLop[ma].value('');
                this.namHocBatDau[ma].value('');
            }
        });
    }

    getData = (value) => {
        let khoaSinhVien = this.khoaSinhVien.value(),
            { maLop, text: tenHe, id: maHe } = value;
        // let { list: curList, dsChuyenNganh: curDsChuyenNganh } = this.state;
        this.setState({ filter: { khoaSinhVien, maLop, tenHe, maHe } });
        if (!maLop) {
            maLop = maHe;
            T.notify(`Hệ ${tenHe} chưa có mã lớp!`, 'warning');
        }
        this.props.getDtNganhPage(1, 1000, '', {}, data => {
            this.setState({
                list: data.page.list.filter(item => {
                    if (maHe == 'CLC') return item.maNganh.includes('_CLC');
                    else return !item.maNganh.includes('_CLC');
                }).map(item => {
                    if (item.maLop) {
                        return ({ ...item, isCheck: true });
                    }
                    return item;
                }),
                dsChuyenNganh: data.dsChuyenNganh.filter(item => {
                    if (maHe == 'CLC') return item.maNganh.includes('_CLC');
                    else return !item.maNganh.includes('_CLC');
                }).map(item => {
                    if (item.maLop) {
                        return ({ ...item, isCheck: true });
                    }
                    return item;
                })
            }, () => {
                this.props.getCtsvLopPage(1, 1000, '', { khoaSinhVien, heDaoTao: maHe }, page => {
                    let listLop = page.list, listChuyenNganh = page.dsLopCon;
                    this.setState({
                        list: this.state.list.map(item => {
                            if (item.maLop) {
                                if (listLop.some(lop => lop.maNganh == item.maNganh)) {
                                    let lopHienTai = listLop.find(lop => lop.maNganh == item.maNganh);
                                    return ({ ...item, isCheck: null, lopHienTai: lopHienTai.ten, maLopHienTai: lopHienTai.ma });
                                } else {
                                    item.isCheck = true;
                                }
                            }
                            return item;
                        }),
                        dsChuyenNganh: this.state.dsChuyenNganh.map(item => {
                            if (item.maLop) {
                                if (listChuyenNganh.some(lop => lop.maChuyenNganh == item.ma)) {
                                    let lopHienTai = listChuyenNganh.find(lop => lop.maChuyenNganh == item.ma);
                                    return ({ ...item, isCheck: null, lopHienTai: lopHienTai.ten, maLopHienTai: lopHienTai.ma });
                                } else {
                                    item.isCheck = true;
                                }
                            }
                            return item;
                        })
                    }, () => {
                        this.state.list.forEach(item => {
                            this.maLop[item.maNganh] && this.maLop[item.maNganh].value(`${khoaSinhVien.substring(2, 4)}${maLop}${item.maLop}`);
                            this.tenLop[item.maNganh] && this.tenLop[item.maNganh].value(`${item.tenNganh} ${khoaSinhVien.substring(2, 4)} ${tenHe}`);
                            this.namHocBatDau[item.maNganh] && this.namHocBatDau[item.maNganh].value(`${khoaSinhVien} - ${parseInt(khoaSinhVien) + 1}`);
                        });
                    });
                    this.state.dsChuyenNganh.filter(item => item.isCheck).forEach(item => {
                        this.maLop[item.ma].value(`${khoaSinhVien.substring(2, 4)}${maLop}${item.maLop}`);
                        this.tenLop[item.ma].value(`${item.ten} ${khoaSinhVien.substring(2, 4)} ${tenHe}`);
                        this.namHocBatDau[item.ma].value(`${khoaSinhVien} - ${parseInt(khoaSinhVien) + 1}`);
                    });
                });
            });
        });
    }
    onShow = () => {
        this.tab.tabClick(null, 0);
    }

    onComplete = (e) => {
        e.preventDefault();
        const listNganh = this.state.list.filter(item => item.isCheck == true),
            listChuyenNganh = this.state.dsChuyenNganh.filter(item => item.isCheck == true);
        listNganh.forEach(item => {
            item.maLop = getValue(this.maLop[item.maNganh]);
            item.tenLop = getValue(this.tenLop[item.maNganh]);
            item.namHocBatDau = getValue(this.namHocBatDau[item.maNganh]);
        });
        listChuyenNganh.forEach(item => {
            item.maLop = getValue(this.maLop[item.ma]);
            item.tenLop = getValue(this.tenLop[item.ma]);
            item.namHocBatDau = getValue(this.namHocBatDau[item.ma]);
        });
        const config = { khoaSinhVien: this.khoaSinhVien.value(), heDaoTao: this.heDaoTao.value() };
        this.props.createMultipleCtsvLop(listNganh, listChuyenNganh, config, result => {
            this.tab.tabClick(null, 1);
            if (result && result.length) this.setState({ result, isComplete: true });
        });
    }
    onSubmit = () => {
        T.confirm('Lưu ý', 'Bạn có chắc chắn muốn tạo các lớp này?', 'danger', true, isConfirm => {
            isConfirm && this.props.createCtsvLopMultiple(this.state.result, this.hide);
        });
    }

    renderResult = () => renderTable({
        getDataSource: () => this.state.result?.filter(item => item.loaiLop == 'N') || [],
        header: 'thead-light',
        multipleTbody: true,
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã lớp</th>
                <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên lớp</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngành/Chuyên ngành</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoá sinh viên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Niên khoá</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã CTDT</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm bắt đầu</th>
            </tr>),
        renderRow: (item, index) => <tbody key={index}>
            <tr key={`${index}-1`} style={{ fontWeight: 'bold' }}>
                <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maLop} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLop} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.khoaSinhVien} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.nienKhoa} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maCtdt} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namHocBatDau} />
            </tr>
            {
                this.state.result?.filter(lopCN => lopCN.loaiLop == 'CN' && lopCN.maLopCha == item.maLop).map((subItem, subIndex) => <tr key={`${index}-2-${subIndex}`}>
                    <TableCell />
                    <TableCell content={subItem.maLop} />
                    <TableCell content={subItem.tenLop} />
                    <TableCell content={subItem.ten} />
                    <TableCell content={subItem.khoaSinhVien} />
                    <TableCell content={subItem.nienKhoa} />
                    <TableCell content={subItem.maCtdt} />
                    <TableCell content={subItem.namHocBatDau} />
                </tr>)
            }
        </tbody>
    })

    renderData = () => renderTable({
        getDataSource: () => this.state.list || [],
        header: 'thead-light',
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã ngành/CN</th>
                <th style={{ width: '100%' }}>Tên ngành/CN</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã lớp</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chọn mở</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã lớp tự động</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tên lớp</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm lớp bắt đầu</th>
            </tr>),
        multipleTbody: true,
        renderRow: (item, index) => {
            let readOnly = !this.state.filter;
            return (
                <tbody key={index}>
                    <tr key={`${index}-1`} style={{ fontWeight: 'bold' }}>
                        <TableCell type='text' className='text-primary' style={{ textAlign: 'center' }} content={index + 1} />
                        <TableCell type='text' className='text-primary' content={item.maNganh} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' className='text-primary' content={item.tenNganh} />
                        {item.maLop ? <>
                            <TableCell type='text' className='text-primary' content={item.maLop} />
                            {typeof item.isCheck == 'boolean' ?
                                <TableCell type='checkbox' isCheck content={item.isCheck} onChanged={(value) => this.handleCheck(item.maNganh, item.tenNganh, item.maLop, value)} permission={this.props.permission} /> :
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maLopHienTai || ''} />}
                            {typeof item.isCheck == 'boolean' ?
                                <TableCell content={
                                    <FormTextBox ref={e => this.maLop[item.maNganh] = e} style={{ width: '150px', marginBottom: '0' }} placeholder='Mã lớp' readOnly={readOnly} />
                                } required /> :
                                <TableCell />}
                            {typeof item.isCheck == 'boolean' ?
                                <TableCell content={<FormTextBox ref={e => this.tenLop[item.maNganh] = e} style={{ width: '200px', marginBottom: '0' }} placeholder='Tên lớp' required readOnly={readOnly} />} /> :
                                <TableCell />}
                            {typeof item.isCheck == 'boolean' ?
                                <TableCell content={<FormTextBox type='scholastic' ref={e => this.namHocBatDau[item.maNganh] = e} style={{ width: '150px', marginBottom: '0' }} placeholder='Năm bắt đầu' required readOnly={readOnly} />} /> :
                                <TableCell />}
                        </> : <TableCell />}

                    </tr>
                    {
                        (this.state.dsChuyenNganh).filter(subItem => subItem.maNganh ? subItem.maNganh == item.maNganh : false).map((subItem, subindex) => {
                            let readOnly = !this.state.filter;
                            return (
                                <tr key={`${index}-2-${subindex}`}>
                                    <TableCell />
                                    <TableCell type='text' style={{ textAlign: 'left' }} content={subItem.ma} />
                                    <TableCell type='text' content={subItem.ten} />
                                    {subItem.maLop ? <>
                                        <TableCell type='text' content={subItem.maLop} />
                                        {typeof subItem.isCheck == 'boolean' ?
                                            <TableCell type='checkbox' isCheck content={subItem.isCheck} onChanged={(value) => this.handleCheck(subItem.ma, subItem.ten, subItem.maLop, value)} permission={{ write: !!this.state.filter }} /> :
                                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={subItem.maLopHienTai || ''} />}
                                        {typeof subItem.isCheck == 'boolean' ?
                                            <TableCell content={
                                                <FormTextBox ref={e => this.maLop[subItem.ma] = e} style={{ width: '150px', marginBottom: '0' }} placeholder='Mã lớp' required readOnly={readOnly} />
                                            } /> :
                                            <TableCell />}
                                        {typeof subItem.isCheck == 'boolean' ?
                                            <TableCell content={
                                                <FormTextBox ref={e => this.tenLop[subItem.ma] = e} style={{ width: '200px', marginBottom: '0' }} placeholder='Tên lớp' required readOnly={readOnly} />
                                            } /> :
                                            <TableCell />}
                                        {typeof subItem.isCheck == 'boolean' ?
                                            <TableCell content={
                                                <FormTextBox type='scholastic' ref={e => this.namHocBatDau[subItem.ma] = e} style={{ width: '150px', marginBottom: '0' }} placeholder='Năm bắt đầu' required readOnly={readOnly} />
                                            } /> :
                                            <TableCell />}
                                    </> :
                                        <TableCell />}
                                </tr>
                            );
                        })
                    }
                </tbody>
            );
        }
    });

    handleChangenamHocBatDau = (value) => {
        let [start, end] = value.split(' - ');
        if (!isNaN(start) && !isNaN(end)) {
            start = parseInt(start);
            end = parseInt(end);
            if (start >= end || end - start != 1) {
                T.notify('Năm học không phù hợp', 'danger');
                setTimeout(() => {
                    this.namHocBatDau.value('');
                }, 500);
            }
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Cấu hình sinh lớp tự động',
            size: 'elarge',
            isShowSubmit: !!this.state.isComplete,
            postButtons: <button className='btn btn-success' style={{ display: !this.state.isComplete ? '' : 'none' }} onClick={this.onComplete}>
                <i className='fa fa-lg fa-arrow-right' /> Gán CTĐT
            </button>,
            body: <div className='row align-content-start' style={{ height: '60vh', overflow: 'scroll' }}>
                <FormSelect ref={e => this.khoaSinhVien = e} data={Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i)} className='col-md-6' label='Khoá sinh viên' required onChange={() => this.heDaoTao.focus()} />
                <FormSelect ref={e => this.heDaoTao = e} className='col-md-6' label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} required onChange={this.getData} />
                {/* <FormTextBox ref={e => this.namHocBatDau = e} type='scholastic' className='col-md-6' label='Năm bắt đầu của lớp' onChange={this.handleChangenamHocBatDau} /> */}
                <div className='form-group col-12'>
                    <FormTabs ref={e => this.tab = e} onChange={value => {
                        this.setState({ isComplete: value.tabIndex });
                    }} tabs={[{
                        id: 'data', title: 'Ngành/Chuyên ngành', component: <div> {this.renderData()}</div>
                    },
                    {
                        id: 'result', title: 'Kết quả sinh lớp', disabled: !this.state.result, component: <div>{this.renderResult()}</div>
                    }
                    ]} />
                </div>

            </div>
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, dtNganhDaoTao: state.daoTao.dtNganhDaoTao });
const mapActionsToProps = {
    getDtNganhPage, getCtsvLopPage, createMultipleCtsvLop, createCtsvLopMultiple
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(MultipleCreateModal);