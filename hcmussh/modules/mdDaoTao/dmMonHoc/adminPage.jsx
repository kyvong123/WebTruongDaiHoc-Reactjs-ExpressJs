import React from 'react';
import { connect } from 'react-redux';
import { getDmMonHocPage, createDmMonHoc, updateDmMonHoc, deleteDmMonHoc, checkMonHoc, updateThanhPhanDmMonHoc, updateFacultyDmMonHoc, SelectAdapter_DmMonHoc, getDtPhanTramDiem } from './redux';
import { Link } from 'react-router-dom';
import { SelectAdapter_DtDmDonVi, SelectAdapter_DmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { AdminPage, TableHead, AdminModal, renderTable, renderDataTable, TableCell, FormTextBox, FormCheckbox, FormSelect, FormTabs, FormRichTextBox, getValue } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_LoaiDiemThanhPhan } from 'modules/mdDaoTao/dtDiemDmLoaiDiem/redux';
import T from 'view/js/common';
import { Tooltip } from '@mui/material';
class EditModal extends AdminModal {
    listMa = [];
    diem = {};
    state = { listDiem: [], listLoaiDiem: [], isEdit: false }
    componentDidMount() {
        this.onShown(() => {
            !this.props.permission.manage ? this.ma.focus() : this.tenVi.focus();
        });
        this.onHidden(() => {
            this.diem = {};
            this.setState({ listDiem: [], isEdit: false });
        });
    }

    onShow = (item) => {
        let { ma, ten, tinChiLt, tinChiTh, khoa, kichHoat, id, phanHoi, soHocPhan } = item ? item : { ma: null, ten: null, tinChiLt: 0, tinChiTh: 0, khoa: this.props.khoa, kichHoat: 1, id: null, phanHoi: null, soHocPhan: null };
        ten = ten && T.parse(ten, { vi: '', en: '' });
        ma ? this.listMa.push(ma) : this.listMa = [];

        if (!ma || soHocPhan == null || soHocPhan == 0) this.setState({ isEdit: true });

        this.setState({ ma, kichHoat, khoa, id, phanHoi }, () => {
            this.ma.value(ma || '');
            this.tenVi.value(ten ? ten.vi : '');
            this.tenEn.value(ten ? ten.en : '');
            this.tinChiLt.value(tinChiLt);
            this.tinChiTh.value(tinChiTh);
            this.khoa.value(khoa);
            this.kichHoat.value(kichHoat);
            this.phanHoi.value(phanHoi);
        });
        if (ma) {
            this.props.getPhanTram(ma, value => {
                this.setState({ listDiem: value }, () => {
                    let loaiDiem = value.map(e => e.loaiThanhPhan);
                    this.loaiDiem.value(loaiDiem);
                    if (value.length) {
                        for (let diem of value) {
                            this.diem[diem.loaiThanhPhan].value(diem.phanTram);
                        }
                    }
                });
            });
        } else {
            let listDiem = [
                { maMonHoc: '', loaiThanhPhan: 'GK', phanTram: 30, tenThanhPhan: 'Giữa kỳ' },
                { maMonHoc: '', loaiThanhPhan: 'CK', phanTram: 70, tenThanhPhan: 'Cuối kỳ' }
            ];
            this.setState({ listDiem }, () => {
                let loaiDiem = listDiem.map(e => e.loaiThanhPhan);
                this.loaiDiem.value(loaiDiem);
                for (let diem of listDiem) {
                    this.diem[diem.loaiThanhPhan].value(diem.phanTram);
                }
            });
        }
    };

    changeKichHoat = value => this.kichHoat.value(Number(value));

    changeIsTheChat = value => this.isTheChat.value(Number(value));

    changePhanTram = (value) => {
        let phanTram = 0;
        if (value) phanTram = value;
        this.phanTramCK?.value(100 - phanTram);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: getValue(this.ma),
            ten: T.stringify({
                vi: getValue(this.tenVi),
                en: getValue(this.tenEn)
            }),
            tinChiLt: Number(getValue(this.tinChiLt)),
            tinChiTh: Number(getValue(this.tinChiTh)),
            khoa: getValue(this.khoa),
            kichHoat: Number(getValue(this.kichHoat)),
            phanHoi: getValue(this.phanHoi),
            isTheChat: Number(getValue(this.isTheChat)),
        };

        let { listDiem } = this.state,
            data = [];
        if (listDiem.length) {
            for (let diem of listDiem) {
                let item = {
                    maMonHoc: changes.ma,
                    loaiThanhPhan: diem.loaiThanhPhan,
                    phanTram: this.diem[diem.loaiThanhPhan].value(),
                    tenThanhPhan: diem.tenThanhPhan
                };
                data.push(item);
            }
        }

        if (changes.tenVi == '') {
            T.notify('Tên môn học (tiếng Việt) bị trống!', 'danger');
            this.tenVi.focus();
        } else if (changes.tinChiLt + changes.tinChiTh <= 0) {
            T.notify('Số tín chỉ lý thuyết phải lớn hơn 0!', 'danger');
            this.tinChiLt.focus();
        } else {
            let checked = true,
                count = 0,
                loaiDiem = this.loaiDiem.value();
            for (let item of data) {
                if (item.phanTram == null || item.phanTram == '') {
                    checked = false;
                    T.notify(`Phần trăm ${item.tenThanhPhan} bị trống!`, 'danger');
                    this.diem[item.loaiThanhPhan].focus();
                } else if (item.phanTram < 0) {
                    checked = false;
                    T.notify(`Phần trăm ${item.tenThanhPhan} phải lớn hơn 0!`, 'dangers');
                    this.diem[item.loaiThanhPhan].focus();
                } else count = count + item.phanTram;
            }
            if (count != 100 && loaiDiem.length != 0 && checked != false) {
                checked = false;
                T.notify('Tổng phần trăm  phải bằng 100!', 'danger');
                this.diem[data[0].loaiThanhPhan].focus();
            }
            if (checked == true) {
                if (this.state.ma) {
                    this.props.update(this.state.ma, changes, data, this.hide);
                } else {
                    changes.tongTinChi = changes.tinChiLt + changes.tinChiTh;
                    changes.tietLt = changes.tinChiLt * 15;
                    changes.tietTh = changes.tinChiTh * 30;
                    changes.tongTiet = changes.tietLt + changes.tietTh;
                    this.props.checkMon(changes.ma, (value) => {
                        if (value.length == 0) {
                            this.props.create(changes, data, this.hide);
                        } else {
                            T.notify('Mã môn học bị trùng!', 'danger');
                            this.ma.focus();
                        }
                    });
                }
            }
        }
    }

    loaiDiemConfigTable = (list) => {
        return renderTable({
            getDataSource: () => list,
            header: 'thead-light',
            emptyTable: '',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', }}>#</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên thành phần điểm</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Phần trăm</th>
                </tr>
            ),
            renderRow: (item, index) => {
                return <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell content={item.loaiThanhPhan} />
                    <TableCell content={item.tenThanhPhan} />
                    <TableCell style={{ textAlign: 'center' }} content={<FormTextBox type='number' suffix='%' min={0} max={100} style={{ marginBottom: '0' }} ref={e => this.diem[item.loaiThanhPhan] = e} placeholder='Phần trăm' required allowNegative={false} />} />
                </tr>;
            }
        });
    }

    handleLoaiDiem = (value) => {
        if (value) {
            let { listDiem } = this.state;
            if (value.selected) {
                let data = {
                    maMonHoc: this.state.ma,
                    loaiThanhPhan: value.id,
                    tenThanhPhan: value.text,
                    phanTram: ''
                };
                listDiem.push(data);
            } else listDiem = listDiem.filter(e => e.loaiThanhPhan != value.id);
            this.setState({ listDiem });
        }
    }

    render = () => {
        const isDaoTao = this.props.permission.write;
        let { listDiem, isEdit } = this.state;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật môn học' : 'Tạo mới môn học',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-12' ref={e => this.ma = e} label='Mã môn học' readOnly={this.state.ma ? true : false} required />

                <div className='col-12'>
                    <FormTabs tabs={[
                        {
                            title: <>Tên môn tiếng Việt  <span style={{ color: 'red' }}>*</span></>,
                            component: <FormTextBox ref={e => this.tenVi = e} placeholder='Tên ngành (tiếng Việt)' required />
                        },
                        {
                            title: <>Tên môn tiếng Anh</>,
                            component: <FormTextBox ref={e => this.tenEn = e} placeholder='Tên ngành (tiếng Anh)' />
                        }
                    ]} />
                </div>
                <FormTextBox type='number' className='col-6' ref={e => this.tinChiLt = e} label='Tín chỉ lý thuyết' readOnly={!isEdit} required />
                <FormTextBox type='number' className='col-6' ref={e => this.tinChiTh = e} label='Tín chỉ thực hành' readOnly={!isEdit} />
                <FormSelect className='col-12' ref={e => this.khoa = e} data={SelectAdapter_DtDmDonVi()} label='Đơn vị' required onChange={value => this.setState({ khoa: value.id })} />

                <FormSelect className='col-md-12' ref={e => this.loaiDiem = e} data={SelectAdapter_LoaiDiemThanhPhan} multiple label='Thành phần điểm' onChange={this.handleLoaiDiem} required />

                <div className='col-md-12'>
                    {this.loaiDiem && this.loaiDiemConfigTable(listDiem)}
                </div>

                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={this.state.ma ? true : false} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                <FormCheckbox className='col-md-6' ref={e => this.isTheChat = e} label='Thể chất' isSwitch={true} readOnly={this.state.ma ? true : false} onChange={value => this.changeIsTheChat(value ? 1 : 0)} />
                <FormRichTextBox style={{ display: isDaoTao ? (!this.state.ma ? 'block' : 'none') : (this.state.phanHoi) ? 'block' : 'none' }} className='col-md-12' ref={e => this.phanHoi = e} label='Phản hồi' readOnly={!isDaoTao} />
            </div>
        });
    }
}
class EditThanhPhanModal extends AdminModal {
    listMa = []
    diem = {};
    state = { listDiem: [], listLoaiDiem: [] }

    onShow = () => {
        this.listMa.value('');
        let listDiem = [
            { maMonHoc: '', loaiThanhPhan: 'GK', phanTram: 30, tenThanhPhan: 'Giữa kỳ' },
            { maMonHoc: '', loaiThanhPhan: 'CK', phanTram: 70, tenThanhPhan: 'Cuối kỳ' }
        ];
        this.setState({ listDiem }, () => {
            let loaiDiem = listDiem.map(e => e.loaiThanhPhan);
            this.loaiDiem.value(loaiDiem);
            for (let diem of listDiem) {
                this.diem[diem.loaiThanhPhan].value(diem.phanTram);
            }
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        let { listDiem } = this.state,
            data = [];
        if (listDiem.length) {
            for (let diem of listDiem) {
                let item = {
                    loaiThanhPhan: diem.loaiThanhPhan,
                    phanTram: this.diem[diem.loaiThanhPhan].value(),
                    tenThanhPhan: diem.tenThanhPhan
                };
                data.push(item);
            }
        }

        let listMa = this.listMa.value(),
            loaiDiem = this.loaiDiem.value();
        listMa = listMa.join(', ');
        if (this.listMa.value() == '') {
            T.notify('Chưa chọn môn học', 'danger');
            this.listMa.focus();
        } else if (loaiDiem.length == 0) {
            T.notify('Chưa chọn thành phần điểm', 'danger');
            this.loaiDiem.focus();
        } else {
            let checked = true,
                count = 0;
            for (let item of data) {
                if (item.phanTram == null || item.phanTram == '') {
                    checked = false;
                    T.notify(`Phần trăm ${item.tenThanhPhan} bị trống!`, 'danger');
                    this.diem[item.loaiThanhPhan].focus();
                } else if (item.phanTram < 0) {
                    checked = false;
                    T.notify(`Phần trăm ${item.tenThanhPhan} phải lớn hơn 0!`, 'danger');
                    this.diem[item.loaiThanhPhan].focus();
                } else count = count + item.phanTram;
            }
            if (count != 100 && checked != false) {
                checked = false;
                T.notify('Tổng phần trăm phải bằng 100!', 'danger');
                this.diem[data[0].loaiThanhPhan].focus();
            }
            if (checked == true) {
                this.props.update(listMa, data, this.hide());
            }
        }
    }

    loaiDiemConfigTable = (list) => {
        return renderTable({
            getDataSource: () => list,
            header: 'thead-light',
            emptyTable: '',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', }}>#</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã</th>
                    <th style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên thành phần điểm</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Phần trăm</th>
                </tr>
            ),
            renderRow: (item, index) => {
                return <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell content={item.loaiThanhPhan} />
                    <TableCell content={item.tenThanhPhan} />
                    <TableCell style={{ textAlign: 'center' }} content={<FormTextBox type='number' style={{ marginBottom: '0' }} ref={e => this.diem[item.loaiThanhPhan] = e} placeholder='Phần trăm' required />} />
                </tr>;
            }
        });
    }

    handleLoaiDiem = (value) => {
        if (value) {
            let { listDiem } = this.state;
            if (value.selected) {
                let data = {
                    loaiThanhPhan: value.id,
                    tenThanhPhan: value.text,
                    phanTram: ''
                };
                listDiem.push(data);
            } else listDiem = listDiem.filter(e => e.loaiThanhPhan != value.id);
            this.setState({ listDiem });
        }
    }

    render = () => {
        let { listDiem } = this.state;
        return this.renderModal({
            title: 'Cập nhật thành phần điểm',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.loaiDiem = e} data={SelectAdapter_LoaiDiemThanhPhan} multiple label='Thành phần điểm' onChange={this.handleLoaiDiem} required />

                <div className='col-md-12'>
                    {this.loaiDiem && this.loaiDiemConfigTable(listDiem)}
                </div>

                <FormSelect className='col-12' ref={e => this.listMa = e} data={SelectAdapter_DmMonHoc} label='Mã môn học' multiple required />
            </div>
        });
    }
}
class EditFacultyModal extends AdminModal {
    state = { listMonHoc: [] };

    componentDidMount = () => {
        this.onHidden(() => {
            this.setState({ listMonHoc: [] }, () => this.khoaMoi.value(''));
        });
    }

    onShow = (list) => {
        this.setState({ listMonHoc: list });
    };

    delete = (e, item) => {
        e.preventDefault();
        let { listMonHoc } = this.state;
        listMonHoc = listMonHoc.filter(mh => mh.ma != item.ma);
        this.setState({ listMonHoc });
    }

    monHocTable = (list) => renderTable({
        getDataSource: () => list,
        header: 'thead-light',
        stickyHead: list.length > 8,
        divStyle: { height: '50vh' },
        renderHead: () => <tr>
            <TableHead content='#' style={{ width: 'auto' }} />
            <TableHead content='Mã' style={{ width: '10%' }} />
            <TableHead content='Tên' style={{ width: '65%' }} />
            <TableHead content='Khoa/Bộ môn' style={{ width: '25%' }} />
            <TableHead content='Thao tác' style={{ width: 'auto' }} />
        </tr>,
        renderRow: (item, index) => <tr key={item.ma}>
            <TableCell content={index + 1} style={{ textAlign: 'right' }} />
            <TableCell content={item.ma} />
            <TableCell content={T.parse(item.ten, { vi: '' }).vi} nowrap />
            <TableCell content={item.tenKhoa} nowrap />
            <TableCell content={item} type='buttons' permission={this.props.permission} onDelete={this.delete} />
        </tr>
    })

    onSubmit = (e) => {
        e.preventDefault();
        let { listMonHoc } = this.state,
            listMa = listMonHoc.map(item => item.ma),
            khoa = getValue(this.khoaMoi);
        this.setState({ isLoading: true }, () => {
            this.props.update(listMa.join(', '), khoa, () => this.setState({ isLoading: false }, () => this.hide() || this.props.reset()));
        });
    }

    render = () => {
        let { listMonHoc, isLoading } = this.state;
        return this.renderModal({
            title: 'Cập nhật Khoa/Bộ môn',
            size: 'large',
            isShowSubmit: !!this.state.listMonHoc.length,
            isLoading,
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.khoaMoi = e} data={SelectAdapter_DmDonViAll} label='Khoa/Bộ môn mới' required />
                <div className='col-md-12'>
                    {!!this.state.listMonHoc.length && this.monHocTable(listMonHoc)}
                </div>
            </div>
        });
    }
}
class DmMonHocPage extends AdminPage {
    state = { sortTerm: 'ten_ASC', donViFilter: '', listChosen: [] }
    defaultSortTerm = 'ten_ASC'
    selectKichHoat = [
        { id: '1', text: 'Kích hoạt' },
        { id: '0', text: 'Chưa kích hoạt' },
    ]
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();

            const user = this.props.system.user;
            if (!Number(user?.isPhongDaoTao)) {
                const maDonVi = user.maDonVi || '';
                this.donVi.value(Number(maDonVi));
                this.setState({ donViFilter: Number(maDonVi) }, () => this.getPage(undefined, undefined, ''));
            } else this.getPage(undefined, undefined, '');
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm, donViFilter: this.state.donViFilter };
        this.props.getDmMonHocPage(pageN, pageS, pageC, filter, done);
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    showEditModal = (e) => {
        e.preventDefault();
        this.editModal.show();
    }

    chonAll = (value, list) => {
        let { listChosen } = this.state;
        if (value) {
            listChosen = listChosen.concat(list);
            listChosen = [...new Set(listChosen)];
        } else {
            listChosen = [];
        }
        this.setState({ listChosen });
    }

    chonMonHoc = (value, item) => {
        let { listChosen } = this.state;
        if (value) {
            listChosen.push(item);
        } else {
            listChosen = listChosen.filter(mh => mh.ma != item.ma);
            if (!listChosen.length) this.checkAll.value(false);
        }
        this.setState({ listChosen });
    }

    reset = () => {
        this.setState({ listChosen: [] }, () => this.checkAll.value(false));
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xác nhận', 'Bạn có chắc muốn xoá môn học này không?', true, isConfirm => {
            if (isConfirm) {
                T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                this.props.deleteDmMonHoc(item.ma, data => {
                    if (data.warning) {
                        T.alert(data.warning, 'warning', false, 3000);
                    } else {
                        T.alert('Môn học đã xóa thành công!', 'success', false, 1000);
                    }
                });
            }
        });
    }

    downloadExcel = (e) => {
        e.preventDefault();
        let filter = this.state.donViFilter;
        T.handleDownload(`/api/dt/mon-hoc-export-data?filter=${filter}`, 'MON_HOC.xlsx');
    }

    render() {
        const permissionDaoTao = this.getUserPermission('dmMonHoc', ['read', 'write', 'delete', 'manage', 'upload', 'download']);
        let permission = {
            write: permissionDaoTao.write || permissionDaoTao.manage,
            delete: permissionDaoTao.delete || permissionDaoTao.manage,
            upload: permissionDaoTao.upload || permissionDaoTao.manage,
            download: permissionDaoTao.download || permissionDaoTao.manage,
        };
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dmMonHoc?.page || { pageNumber: 1, pageSize: 25, pageTotal: 0, totalItem: 0, list: null };

        let table = renderDataTable({
            emptyTable: 'Chưa có dữ liệu',
            header: 'thead-light',
            data: list,
            stickyHead: list && list.length > 8,
            divStyle: { height: '65vh' },
            renderHead: () => (
                <>
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Chọn<br />
                            <FormCheckbox ref={e => this.checkAll = e} onChange={value => this.chonAll(value, list)} readOnly={!permission.write} />
                        </th>
                        <TableHead style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Mã' keyCol='ma' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                        <TableHead style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên môn học' keyCol='ten' onKeySearch={this.handleKeySearch} onSort={this.onSort} />

                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tổng TC' keyCol='tongTC' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='TC LT' keyCol='tclt' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='TC TH' keyCol='tcth' onKeySearch={this.handleKeySearch} onSort={this.onSort} />

                        {/* <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng<br />tín chỉ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tín chỉ<br />LT</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tín chỉ<br />TH</th> */}

                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tổng tiết' keyCol='tongTiet' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tiết LT' keyCol='tietLT' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tiết TH' keyCol='tietTH' onKeySearch={this.handleKeySearch} onSort={this.onSort} />

                        {/* <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng<br /> tiết</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tiết<br />LT</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tiết<br />TH</th> */}

                        <TableHead style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }} content='Khoa/Bộ môn' keyCol='khoa' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Thành phần điểm' keyCol='phanTramDiem' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Kích hoạt' keyCol='kichHoat' onKeySearch={this.handleKeySearch} onSort={this.onSort} typeSearch='select' data={this.selectKichHoat} />

                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                </>),
            renderRow: (item, index) => {
                let indexOfItem = (pageNumber - 1) * pageSize + index + 1;
                return (
                    <tr key={index} >
                        <TableCell style={{ textAlign: 'right' }} content={indexOfItem} />
                        <TableCell style={{ textAlign: 'center' }} type='checkbox' isCheck permission={permissionDaoTao} content={!!this.state.listChosen.find(mh => mh.ma == item.ma)}
                            onChanged={value => this.chonMonHoc(value, item)} />
                        <TableCell type={permission.write ? 'link' : 'text'} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ma} onClick={() => permission.write && this.modal.show(item)} />
                        <TableCell contentClassName='multiple-lines-5' content={<>
                            <a href='#' onClick={e => e.preventDefault() || (permission.write && this.modal.show(item))} ><span style={{ color: 'black' }}>{T.parse(item.ten).vi}</span>< br />
                                {T.parse(item.ten).en != '' && <span style={{ color: 'blue' }}>{T.parse(item.ten).en}</span>}
                            </a>
                        </>} />
                        <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tongTinChi} />
                        <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tinChiLt} />
                        <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tinChiTh} />
                        <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tongTiet} />
                        <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tietLt} />
                        <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tietTh} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.tenKhoa} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.phanTramDiem?.split('; ').map((i, j) => <div key={j}>{i + '%'}</div>)} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmMonHoc(item.ma, { kichHoat: value ? 1 : 0, })
                            } />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => permission.write && this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                    </tr >
                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-leanpub',
            title: 'Danh sách Môn Học',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Danh sách Môn Học'
            ],
            header: permissionDaoTao.read && <FormSelect style={{ width: '300px', marginBottom: '0' }} placeholder='Danh sách khoa/bộ môn' ref={e => this.donVi = e} onChange={value => {
                T.clearSearchBox();
                this.setState({ donViFilter: value ? value.id : '' }, () => this.getPage());
            }} data={SelectAdapter_DmDonViAll} allowClear={true} />,
            content: <>
                <div className='tile'>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h4 className='tile-title'>Danh sách môn học hiện tại</h4>
                        <div style={{ display: 'flex' }}>
                            {!!this.state.listChosen.length && <Tooltip title='Cập nhật Khoa/Bộ môn' arrow>
                                <button className='btn btn-primary' style={{ height: ' 34px' }} onClick={e => e.preventDefault() || this.editFacultyModal.show(this.state.listChosen)}>
                                    <i className='fa fa-lg fa-edit' />
                                </button>
                            </Tooltip>}
                            <Pagination style={{ marginLeft: '70px', position: 'initial' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                                getPage={this.getPage} pageRange={5} done={() => this.checkAll.value(false)} />
                        </div>
                    </div>
                    {table}
                </div>
                <EditModal ref={e => this.modal = e} permission={permissionDaoTao} readOnly={!permission.write}
                    create={this.props.createDmMonHoc} update={this.props.updateDmMonHoc} checkMon={this.props.checkMonHoc}
                    khoa={this.state.donViFilter || this.props.system.user.staff?.maDonVi}
                    getPhanTram={this.props.getDtPhanTramDiem}
                />
                <EditThanhPhanModal ref={e => this.editModal = e} permission={permissionDaoTao} readOnly={!permission.write}
                    update={this.props.updateThanhPhanDmMonHoc} />
                <EditFacultyModal ref={e => this.editFacultyModal = e} permission={permissionDaoTao} update={this.props.updateFacultyDmMonHoc} reset={this.reset} />
            </>,
            backRoute: '/user/dao-tao',
            collapse: [
                { icon: 'fa-plus-square', name: 'Tạo môn học', permission: permission.write, type: 'info', onClick: e => this.showModal(e) },
                { icon: 'fa-edit', name: 'Chỉnh sửa thành phần điểm', permission: permission.write, type: 'primary', onClick: e => this.showEditModal(e) },
                { icon: 'fa-upload', name: 'Import môn học', permission: permission.upload, type: 'warning', onClick: e => e.preventDefault() || this.props.history.push('/user/dao-tao/mon-hoc/import') },
                { icon: 'fa-print', name: 'Export danh sách môn học', permission: permission.download, type: 'success', onClick: e => this.downloadExcel(e) },
            ]

        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmMonHoc: state.daoTao.dmMonHoc });
const mapActionsToProps = { getDmMonHocPage, createDmMonHoc, updateDmMonHoc, deleteDmMonHoc, checkMonHoc, updateThanhPhanDmMonHoc, updateFacultyDmMonHoc, getDtPhanTramDiem };
export default connect(mapStateToProps, mapActionsToProps)(DmMonHocPage);