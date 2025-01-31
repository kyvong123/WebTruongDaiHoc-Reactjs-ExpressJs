import React from 'react';
import { connect } from 'react-redux';
import { getDmNganhSdhAll, createDmNganhSdh, getDmNganhSdhPage, updateDmNganhSdh, deleteDmNganhSdh } from './redux';
import { SelectAdapter_DmDonViFaculty_V2, getDmDonViFaculty } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmHocSdhAll, SelectAdapter_DmHocSdhVer2 } from 'modules/mdSauDaiHoc/dmHocSdh/redux';
import { AdminPage, AdminModal, TableCell, FormTextBox, FormCheckbox, FormSelect, FormTabs, renderDataTable, TableHead } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';


class EditModal extends AdminModal {
    state = { active: true };

    componentDidMount() {
        this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.maVietTat.focus();
        });
    }

    onHide = () => {
        this.props.getDataNganh();
    }
    onShow = (item) => {
        const { maNganh, ten, ghiChu, kichHoat, maKhoa, phanHe, maVietTat, maLop } = item ? item : { maNganh: null, ten: '', ghiChu: '', kichHoat: true, maKhoa: '', phanHe: '', maVietTat: '', maLop: '' };
        this.setState({ ma: maNganh, item });
        this.ma.value(maNganh ? maNganh : '');
        this.ten.value(ten);
        this.ghiChu.value(ghiChu ? ghiChu : '');
        this.kichHoat.value(kichHoat);
        this.khoaSdh.value(maKhoa);
        this.phanHe.value(phanHe ? phanHe : '');
        this.maLop.value(maLop);
        this.maVietTat.value(maVietTat ? maVietTat : '');
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            maNganh: this.ma.value(),
            ten: this.ten.value(),
            ghiChu: this.ghiChu.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
            maKhoa: this.khoaSdh.value(),
            phanHe: this.phanHe.value(),
            maVietTat: this.maVietTat.value(),
            maLop: this.maLop.value()
        };
        if (changes.ma == '') {
            T.notify('Mã ngành sau đại học bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên ngành sau đại học bị trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    changeKichHoat = value => this.kichHoat.value(Number(value));

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật ngành sau đại học' : 'Tạo mới ngành sau đại học',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' style={{ marginTop: this.state.ma ? '35px' : '' }} className='col-md-6' ref={e => this.ma = e} label='Mã ngành'
                    readOnly={this.state.ma ? true : readOnly} required />
                <div style={{ position: 'absolute', top: '2px', right: '8px' }}>
                    <FormCheckbox style={{ width: '100%', margin: 0, }} ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                        readOnly={readOnly}
                        onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                </div>
                <FormTextBox type='text' className='col-md-6' ref={e => this.maVietTat = e} label='Mã viết tắt' required />
                <FormTextBox type='text' className='col-md-6' ref={e => this.maLop = e} label='Mã lớp' required />
                <FormSelect ref={e => this.phanHe = e} className='col-md-6' data={SelectAdapter_DmHocSdhVer2} label='Phân hệ' readOnly={readOnly} required />
                <FormSelect ref={e => this.khoaSdh = e} className='col-md-6' data={SelectAdapter_DmDonViFaculty_V2} label='Khoa sau đại học' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.ten = e} label='Tên ngành' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />
            </div>
        });
    }
}

class DmNganhSdhPage extends AdminPage {
    state = { dmKhoaSdh: {}, phanHe: {}, dsPhanHe: [], data: [], isCoDinh: false, isKeySearch: false };
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.onSearch = (searchText) => this.props.getDmNganhSdhPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.getDataNganh();
            this.props.getDmDonViFaculty(items => {
                let dmKhoaSdh = {};
                items.forEach(item => dmKhoaSdh[item.ma] = item.ten);
                this.setState({ dmKhoaSdh });
            });
            this.props.getDmHocSdhAll(items => {
                let phanHe = {};
                items.forEach(item => phanHe[item.ma] = item.ten);
                this.setState({ phanHe, dsPhanHe: items });
            });
        });
    }
    getDataNganh = (phanHe, filter) => {
        if (phanHe) {
            this.props.getDmNganhSdhAll(phanHe, filter, items => {
                let data = { ...this.state.data };
                data[phanHe] = items;
                this.setState({ data });
            });
        }
        else {
            this.props.getDmNganhSdhAll(null, filter, items => {
                let data = items.groupBy('phanHe');

                this.setState({ data });
            });
        }
    }


    renderList = (item) => {
        const handleKeySearch = (data) => {
            this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
                this.getDataNganh(item.ma, this.state.filter);
            });
        };
        const onKeySearch = this.state.isKeySearch ? handleKeySearch : null;
        const permission = this.getUserPermission('dmNganhSdh', ['write', 'delete']);
        const list = this.state.data && this.state.data[item.ma] ? this.state.data[item.ma] : [];

        let table = renderDataTable({
            emptyTable: 'Dữ liệu ngành đào tạo trống',
            data: list,
            stickyHead: this.state.isCoDinh,
            divStyle: { height: '80vh' },
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'top' }}>STT</th>
                    <TableHead style={{ width: 'auto', textAlign: 'left' }} keyCol='maNganh' content='Mã ngành' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: '20%', textAlign: 'left' }} keyCol='maVietTat' content='Mã viết tắt' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: '50%', textAlign: 'left' }} keyCol='tenNganh' content='Tên ngành' onKeySearch={onKeySearch} />
                    <TableHead style={{ width: '30%', textAlign: 'left' }} keyCol='khoa' content='Khoa' onKeySearch={onKeySearch} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'top' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'top' }}>Thao tác</th>
                </tr>
            ),
            multipleTbody: true,
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' style={{ textAlign: 'right' }} content={item.maNganh ? item.maNganh : ''}
                        onClick={() => this.modal.show(item)} />
                    <TableCell type='text' content={item.maVietTat ? item.maVietTat : ''} />
                    <TableCell type='text' content={item.ten ? item.ten : ''} />
                    <TableCell type='text' content={item.maKhoa ? this.state.dmKhoaSdh[item.maKhoa] : ''} />
                    <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission}
                        onChanged={value => this.props.updateDmNganhSdh(item.maNganh, { kichHoat: Number(value) }, () => this.getDataNganh(null, this.state.filter))} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                </tr>
            )
        });

        return (
            <div className='tile'>
                <div className='tile-title-w-btn'>
                    <div style={{ gap: 10, display: 'inline-flex' }}>
                        <div className={'animated-checkbox '} >
                            <label>
                                <input type='checkbox' checked={this.state.isKeySearch} onChange={() => this.setState({ isKeySearch: !this.state.isKeySearch }, () => !this.state.isKeySearch ? this.getDataNganh() : null)} />
                                <span className={'label-text ' + (this.state.isKeySearch ? 'text-primary' : 'text-secondary')} onChange={this.onCheck}>Tìm theo cột</span>
                            </label>
                        </div>
                        <div className={'animated-checkbox '} >
                            <label>
                                <input type='checkbox' checked={this.state.isCoDinh} onChange={() => this.setState({ isCoDinh: !this.state.isCoDinh })} />
                                <span className={'label-text ' + (this.state.isCoDinh ? 'text-primary' : 'text-secondary')} onChange={this.onCheck}>Cố định bảng</span>
                            </label>
                        </div>
                    </div>
                </div>
                {table}
            </div>);
    }
    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục ngành sau đại học', 'Bạn có chắc bạn muốn xóa ngành này?', true, isConfirm =>
            isConfirm && this.props.deleteDmNganhSdh(item.maNganh, () => this.getDataNganh(null, this.state.filter)));
    }

    render() {
        const permission = this.getUserPermission('dmNganhSdh', ['write', 'delete']),
            readOnly = !permission.write;
        const tabs = this.state.dsPhanHe.map(item => ({
            title: item.ten,
            component: this.renderList(item)
        }));
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục ngành sau đại học',
            breadcrumb: [<Link key={1} to='/user/sau-dai-hoc/'>Sau đại học</Link>,
                'Danh mục ngành sau đại học'
            ],
            content: <>
                <FormTabs tabs={tabs} />
                <EditModal ref={e => this.modal = e} permission={permission} create={this.props.createDmNganhSdh} update={this.props.updateDmNganhSdh} readOnly={readOnly} getDataNganh={this.getDataNganh} />
            </>,
            backRoute: '/user/sau-dai-hoc',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/sau-dai-hoc/danh-sach-nganh/upload') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmNganhSdh: state.sdh.dmNganhSdh });
const mapActionsToProps = { getDmNganhSdhAll, createDmNganhSdh, getDmNganhSdhPage, updateDmNganhSdh, deleteDmNganhSdh, getDmDonViFaculty, getDmHocSdhAll };
export default connect(mapStateToProps, mapActionsToProps)(DmNganhSdhPage);