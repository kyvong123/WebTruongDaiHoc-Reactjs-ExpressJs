import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, FormTabs, FormTextBox, getValue, renderTable, TableCell } from 'view/component/AdminPage';
import { getSdhLopHocVienPage, createSdhLopMultiple, createMultipleSdhLop, getSdhLopHocVienDsNganh } from './redux';
import { getDmNganhSdhPage } from 'modules/mdSauDaiHoc/dmNganhSauDaiHoc/redux';
import { SelectAdapter_SdhKhoaDaoTao } from '../sdhKhoaDaoTao/redux';
import { getSdhKhoaDaoTao } from '../sdhKhoaDaoTao/redux';
import { getDmNganhSdhAll } from 'modules/mdSauDaiHoc/dmNganhSauDaiHoc/redux';
class CreateClassModal extends AdminModal {
    state = { list: [], check: true, isShowSubmit: true, result: [] }
    maLop = {}
    tenLop = {}
    namHocBatDau = {}
    componentDidMount() {
        this.onShown(() => this.khoaDaoTao.focus());
    }

    handleCheck = (ma, ten, maLop, check, type, tenVietTat) => {
        if (type == 'one') {
            this.setState({
                list: this.state.list.map(item => item.maNganh == ma ? ({ ...item, isCheck: !!check }) : item),
                // dsChuyenNganh: this.state.dsChuyenNganh.map(item => item.ma == ma ? ({ ...item, isCheck: !!value }) : item),
            }, () => {
                if (check) {
                    let { khoaSinhVien, tenHe } = this.state.filter;
                    this.maLop[ma] && this.maLop[ma].value(`${tenVietTat}${khoaSinhVien.substring(2, 4)}${this.khoaDaoTao && this.khoaDaoTao.value()}`);
                    this.tenLop[ma] && this.tenLop[ma].value(`Lớp ${ten}-K${khoaSinhVien.substring(2, 4)}-Hệ ${tenHe}`);
                    this.namHocBatDau[ma] && this.namHocBatDau[ma].value(`${khoaSinhVien} - ${parseInt(khoaSinhVien) + 1}`);
                } else {
                    this.maLop[ma] && this.maLop[ma].value('');
                    this.tenLop[ma] && this.tenLop[ma].value('');
                    this.namHocBatDau[ma] && this.namHocBatDau[ma].value('');
                }
                const rs = this.state.list.every(ele => ele.isCheck && ele.isCheck == true);
                rs ? $('#checkall').prop('checked', true) : $('#checkall').prop('checked', false);
            });
        } else {
            this.setState({
                list: check ? this.state.list.map(ele => ({ ...ele, isCheck: true })) :
                    this.state.list.map(ele => ({ ...ele, isCheck: ele.isCheck ? false : '' })),
                check: check ? true : false
            }
                , () => {
                    check ? this.state.list.forEach(ele => {
                        let { khoaSinhVien, tenHe } = this.state.filter;
                        this.maLop[ele.maNganh] && this.maLop[ele.maNganh].value(`${this.state.idInfoPhanHe ? ele.tenVietTat : ele.maVietTat}${khoaSinhVien.substring(2, 4)}${this.khoaDaoTao && this.khoaDaoTao.value()}`);
                        this.tenLop[ele.maNganh] && this.tenLop[ele.maNganh].value(`Lớp ${ele.ten}-K${khoaSinhVien.substring(2, 4)}-Hệ ${tenHe}`);
                        this.namHocBatDau[ele.maNganh] && this.namHocBatDau[ele.maNganh].value(`${khoaSinhVien} - ${parseInt(khoaSinhVien) + 1}`);
                    }) :
                        this.state.list.forEach(ele => {
                            this.maLop[ele.maNganh] && this.maLop[ele.maNganh].value('');
                            this.tenLop[ele.maNganh] && this.tenLop[ele.maNganh].value('');
                            this.namHocBatDau[ele.maNganh] && this.namHocBatDau[ele.maNganh].value('');
                        });
                });
        }
    }

    getData = (value) => {
        let { maLop, text: tenHe, maHe, id, khoaSinhVien, idInfoPhanHe } = value;
        // let { list: curList, dsChuyenNganh: curDsChuyenNganh } = this.state;

        this.setState({ filter: { khoaSinhVien, maLop, tenHe, maHe } });
        if (idInfoPhanHe) {
            this.props.getSdhLopHocVienDsNganh(id, data => {
                const maNganh = data && data.map(ele => ele.maNganh);
                this.setState({
                    list: data && data.length > 0 && data.map(item => {
                        if (item.maLop) {
                            return ({ ...item, isCheck: true });
                        }
                        return item;
                    })
                }, () => {
                    this.props.getSdhLopHocVienPage(1, 1000, {}, { khoaSinhVien, heDaoTao: maHe, maNganh }, (page) => {
                        const pageNganh = page && page.list && page.list.map(ele => ele.maNganh);
                        this.setState({
                            list: this.state.list && this.state.list.length > 0 && this.state.list.map(item => {
                                if (pageNganh && pageNganh.length > 0 && pageNganh.find(ele => ele == item.maNganh)) {
                                    return { ...item, isCheck: true };
                                }
                                else return { ...item };
                            })
                        }, () => {
                            this.state.list && this.state.list.length > 0 && this.state.list.forEach(item => {
                                this.maLop[item.maNganh] && this.maLop[item.maNganh].value(`${item.tenVietTat}${khoaSinhVien.substring(2, 4)}${this.khoaDaoTao && this.khoaDaoTao.value()}`);
                                this.tenLop[item.maNganh] && this.tenLop[item.maNganh].value(`Lớp ${item.ten}-K${khoaSinhVien.substring(2, 4)}-Hệ ${tenHe}`);
                                this.namHocBatDau[item.maNganh] && this.namHocBatDau[item.maNganh].value(`${khoaSinhVien} - ${parseInt(khoaSinhVien) + 1}`);
                            });
                        });
                    });
                });
            });

        } else {
            T.notify('Không có thông tin tuyển sinh', 'warning');
            this.props.getDmNganhSdhAll(maHe, '', data => {
                const maNganh = data && data.map(ele => ele.maNganh);
                this.setState({
                    list: data && data.length > 0 && data.map(item => {
                        if (item.maLop) {
                            return ({ ...item, isCheck: true });
                        }
                        return item;
                    })
                }, () => {
                    this.props.getSdhLopHocVienPage(1, 1000, {}, { khoaSinhVien, heDaoTao: maHe, maNganh }, (page) => {
                        const pageNganh = page && page.list && page.list.map(ele => ele.maNganh);
                        this.setState({
                            list: this.state.list && this.state.list.length > 0 && this.state.list.map(item => {
                                if (pageNganh && pageNganh.length > 0 && pageNganh.find(ele => ele == item.maNganh)) {
                                    return { ...item, isCheck: true };
                                }
                                else return { ...item };
                            })
                        }, () => {
                            this.state.list && this.state.list.length > 0 && this.state.list.forEach(item => {
                                this.maLop[item.maNganh] && this.maLop[item.maNganh].value(`${item.maVietTat}${khoaSinhVien.substring(2, 4)}${this.khoaDaoTao && this.khoaDaoTao.value()}`);
                                this.tenLop[item.maNganh] && this.tenLop[item.maNganh].value(`Lớp ${item.ten}-K${khoaSinhVien.substring(2, 4)}-Hệ ${tenHe}`);
                                this.namHocBatDau[item.maNganh] && this.namHocBatDau[item.maNganh].value(`${khoaSinhVien} - ${parseInt(khoaSinhVien) + 1}`);
                            });
                        });
                    });
                });
            });
        }
    }
    onShow = () => {
        this.tab.tabClick(null, 0);
    }

    onComplete = (e) => {
        e.preventDefault();
        const listNganh = this.state.list.filter(item => typeof item.isCheck == 'boolean' && item.isCheck);
        listNganh && listNganh.length > 0 && listNganh.forEach(item => {
            item.maLop = getValue(this.maLop[item.maNganh]);
            item.tenLop = getValue(this.tenLop[item.maNganh]);
            item.namHocBatDau = getValue(this.namHocBatDau[item.maNganh]);
            item.tenPhanHe = this.state.tenPhanHe;
        });

        const config = { khoaSinhVien: this.state.khoaSinhVien && this.state.khoaSinhVien, heDaoTao: this.state.phanHe && this.state.phanHe, idKhoaDaoTao: this.state.idKhoaDaoTao && this.state.idKhoaDaoTao };
        this.props.createMultipleSdhLop(listNganh, config, result => {
            this.tab.tabClick(null, 1);
            if (result && result.length) this.setState({ result, isComplete: true });
        });
    }
    onSubmit = () => {
        T.confirm('Lưu ý', 'Bạn có chắc chắn muốn tạo các lớp này?', 'warning', true, isConfirm => {
            isConfirm && this.props.createSdhLopMultiple(this.state.result.filter(ele => !ele.isExist), this.state.idInfoPhanHe, this.hide);
        });
    }

    handleSelected = (ma, ten, maLop, item, flag) => {
        let currSelected = this.state.selected;
        if (!item) {
            if (!flag) {
                $(':checkbox').prop('checked', false);
                currSelected = [];
                this.setState({ selected: currSelected });
            }
            else {
                $('.monselected').prop('checked', true);
                this.state.freeList.forEach(item => {
                    const index = currSelected.indexOf(item);
                    index == -1 && currSelected.push(item);
                });
                this.setState({ selected: currSelected });
            }
        }
        else {
            const id = item.mssv;
            const index = currSelected.indexOf(id);
            flag ? (index == -1 && currSelected.push(id)) : (index != -1 && currSelected.splice(index, 1));
            this.setState({ selected: currSelected });
            if (currSelected.length == this.state.freeList.length)
                $('#checkall').prop('checked', true);
            else
                $('#checkall').prop('checked', false);
        }

    }

    renderResult = () => renderTable({
        getDataSource: () => this.state.result || [],
        header: 'thead-light',
        multipleTbody: true,
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã lớp</th>
                <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên lớp</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngành/Chuyên ngành</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Khoá sinh viên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hệ đào tạo</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Niên khoá</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm bắt đầu</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chú thích</th>

            </tr>),
        renderRow: (item, index) => <tbody key={index}>
            <tr key={`${index}-1`} style={{ fontWeight: 'bold', 'backgroundColor': item.isExist ? 'yellow' : '#67db67' }}>
                <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maLop} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLop} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.khoaSinhVien} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenPhanHe} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.nienKhoa} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namHocBatDau} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.isExist ? 'Đã tồn tại lớp' : 'Có thể tạo lớp'} />

            </tr>
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
                <th style={{ width: 'auto', verticalAlign: 'middle', alignItems: 'center', whiteSpace: 'nowrap' }}><input className='selectall' id='checkall' type='checkbox' checked={this.state.check} onChange={value => this.handleCheck('', '', '', value.target.checked, 'all', '')} /> </th>
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
                        <TableCell type='text' className='text-primary' content={item.ten} />
                        {item.maLop ? <>
                            <TableCell type='checkbox' isCheck content={item.isCheck} onChanged={(value) => this.handleCheck(item.maNganh, item.ten, item.maLop, value, 'one', this.state.idInfoPhanHe ? item.tenVietTat : item.maVietTat)} permission={{ write: true }} />
                            <TableCell content={
                                <FormTextBox ref={e => this.maLop[item.maNganh] = e} style={{ width: '150px', marginBottom: '0' }} placeholder='Mã lớp' readOnly={readOnly} />
                            } required />


                            <TableCell content={<FormTextBox ref={e => this.tenLop[item.maNganh] = e} style={{ width: '200px', marginBottom: '0' }} placeholder='Tên lớp' required readOnly={readOnly} />} />
                            <TableCell content={<FormTextBox type='scholastic' ref={e => this.namHocBatDau[item.maNganh] = e} style={{ width: '150px', marginBottom: '0' }} placeholder='Năm bắt đầu' required readOnly={readOnly} />} />
                        </> : <TableCell />}

                    </tr>

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
    setVal = (dataKhoaDaoTao) => {
        this.props.getSdhKhoaDaoTao(dataKhoaDaoTao.id, item => {
            this.heDaoTao.value(item.tenPhanHe);
            this.getData({ maLop: null, text: item.tenPhanHe, id: dataKhoaDaoTao.id, maHe: item.phanHe, khoaSinhVien: item.namTuyenSinh.toString(), idInfoPhanHe: dataKhoaDaoTao.data.idInfoPhanHe });
            this.setState({ phanHe: item.phanHe, khoaSinhVien: item.namTuyenSinh, tenPhanHe: item.tenPhanHe, idKhoaDaoTao: dataKhoaDaoTao.id, idInfoPhanHe: dataKhoaDaoTao.data.idInfoPhanHe });
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Cấu hình sinh lớp tự động',
            size: 'elarge',
            isShowSubmit: !!this.state.isComplete && this.state.result.filter(ele => ele.isExist == false).length > 0,
            postButtons: <button className='btn btn-success' style={{ display: !this.state.isComplete ? '' : 'none' }} onClick={this.onComplete}>
                <i className='fa fa-lg fa-arrow-right' /> Tạo lớp
            </button>,
            body: <div className='row align-content-start' style={{ height: '60vh', overflow: 'scroll' }}>
                <FormSelect ref={e => this.khoaDaoTao = e} data={SelectAdapter_SdhKhoaDaoTao} className='col-md-6' label='Khoá sinh viên' required onChange={item => item.id ? this.setVal(item) : null} />
                <FormTextBox type='text' ref={e => this.heDaoTao = e} className='col-md-6' label='Hệ đào tạo' readOnly required />
                <div className='form-group col-12'>
                    <FormTabs ref={e => this.tab = e} onChange={value => {
                        this.setState({ isComplete: value.tabIndex });
                    }} tabs={[{
                        id: 'data', title: 'Ngành/Chuyên ngành', component: <div> {this.renderData()}</div>
                    },
                    {
                        id: 'result', title: 'Kết quả sinh lớp', disabled: this.state.result.length == 0, component: <div>{this.renderResult()}</div>
                    }
                    ]} />
                </div>
            </div>
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, dtNganhDaoTao: state.daoTao.dtNganhDaoTao });
const mapActionsToProps = {
    getDmNganhSdhPage, getSdhLopHocVienPage, createSdhLopMultiple, createMultipleSdhLop, getSdhKhoaDaoTao, getSdhLopHocVienDsNganh, getDmNganhSdhAll
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(CreateClassModal);