import React from 'react';
import { connect } from 'react-redux';
import { getDmPhongAll, deleteDmPhong, createDmPhong, updateDmPhong, updateMultipleDmPhong } from 'modules/mdDanhMuc/dmPhong/redux';
import { getDmToaNhaAll, SelectAdapter_DmToaNha } from 'modules/mdDanhMuc/dmToaNha/redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, FormSelect, FormRichTextBox, FormTabs } from 'view/component/AdminPage';
import { SelectAdapter_DmCoSo, getDmCoSoAll } from 'modules/mdDanhMuc/dmCoSo/redux';
import { SelectAdapter_TinhTrangPhong } from 'modules/mdDaoTao/dmTinhTrangPhong/redux';

class EditModal extends AdminModal {
    state = { kichHoat: 1 };

    componentDidMount() {
        this.onShown(() => {
            this.ten.focus();
        });
    }

    onShow = (item) => {
        let { ten, toaNha, moTa, kichHoat, sucChua, coSo, tinhTrangPhong } = item ? item : { ten: '', toaNha: '', moTa: '', kichHoat: 1, sucChua: 0, tinhTrangPhong: '' };
        this.setState({ ten });
        this.toaNha.value(toaNha ? item.toaNha : '');
        this.ten.value(ten);
        this.sucChua.value(sucChua);
        this.moTa.value(moTa);
        this.kichHoat.value(kichHoat);
        this.coSo.value(coSo || '');
        this.tinhTrangPhong.value(tinhTrangPhong || '');
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const
            changes = {
                ten: this.ten.value().trim(),
                toaNha: this.toaNha.value(),
                coSo: this.coSo.value(),
                moTa: this.moTa.value(),
                sucChua: this.sucChua.value(),
                kichHoat: Number(this.kichHoat.value()),
                tinhTrangPhong: this.tinhTrangPhong.value(),
            };
        if (changes.ten == '') {
            T.notify('Tên phòng học bị trống!', 'danger');
            this.ten.focus();
        } else if (changes.coSo == null) {
            T.notify('Cơ sở chưa được chọn!', 'danger');
            this.coSo.focus();
        } else {
            this.state.ten ? this.props.update(this.state.ten, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return (this.renderModal({
            title: this.state.ten ? 'Cập nhật Phòng' : 'Tạo mới Phòng',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên phòng học' readOnly={this.state.ten} required />
                <FormSelect className='col-md-6' ref={e => this.toaNha = e} label='Tòa nhà' data={SelectAdapter_DmToaNha} minimumResultsForSearch={-1} />
                <FormSelect className='col-md-6' ref={e => this.coSo = e} label='Cơ sở' data={SelectAdapter_DmCoSo} minimumResultsForSearch={-1} readOnly={this.state.ten} />
                <FormRichTextBox className='col-md-12' ref={e => this.moTa = e} label='Mô tả' />
                <FormTextBox type='number' className='col-md-12' ref={e => this.sucChua = e} label='Sức chứa tối đa' />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                <FormSelect className='col-md-12' ref={e => this.tinhTrangPhong = e} label='Tình trạng phòng' data={SelectAdapter_TinhTrangPhong} />
            </div>
        }));
    }
}

class MultipleModal extends AdminModal {
    onShow = (item) => {
        this.setState({ listPhong: item });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            tinhTrangPhong: this.tinhTrangPhong.value(),
        },
            { listPhong } = this.state;

        if (!listPhong.length) {
            T.notify('Chưa có danh sách phòng chọn!', 'danger');
        } else if (!changes.tinhTrangPhong) {
            T.notify('Tình trạng phòng bị trống!', 'danger');
            this.tinhTrangPhong.focus();
        } else {
            this.props.update(listPhong, changes, () => {
                this.hide();
                this.tinhTrangPhong.value('');
            });
        }
    }

    render = () => {
        return (this.renderModal({
            title: 'Cập nhật Phòng',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.tinhTrangPhong = e} label='Tình trạng phòng' data={SelectAdapter_TinhTrangPhong} required />
            </div>
        }));
    }
}

class DmPhongPage extends AdminPage {

    state = { listChosen: [] }

    componentDidMount() {
        let route = T.routeMatcher('/user/:menu/phong').parse(window.location.pathname);
        this.menu = route.menu;
        T.ready(`/user/${this.menu == 'dao-tao' ? 'dao-tao' : 'category'}`);
        T.showSearchBox(searchText => this.props.getDmPhongAll(searchText));
        this.props.getDmPhongAll();
        this.props.getDmToaNhaAll();
        this.props.getDmCoSoAll(dataCS => this.setState({ dataCS }));
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa phòng', 'Bạn có chắc bạn muốn xóa phòng này?', true, isConfirm =>
            isConfirm && this.props.deleteDmPhong(item.ma));
    }

    render() {
        const permission = this.getUserPermission('dmPhong', ['read', 'write', 'delete', 'upload']);
        let listToaNha = this.props.dmToaNha && this.props.dmToaNha.items ? this.props.dmToaNha.items : [],
            toaNhaMapper = {};
        listToaNha.forEach(item => toaNhaMapper[item.ma] = item.ten);

        let tabs = [];
        let items = this.props.dmPhong && this.props.dmPhong.items ? this.props.dmPhong.items : [];

        const { listChosen } = this.state;

        let table = (list) => renderTable({
            getDataSource: () => list,
            emptyTable: 'Không có phòng học!',
            stickyHead: list?.length > 15,
            divStyle: { height: '70vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ textAlign: 'center' }} >
                        <span className='animated-checkbox d-flex flex-column'>
                            <label>Chọn</label>
                            <label style={{ marginBottom: '0' }}>
                                <input type='checkbox' ref={e => this.checkAll = e} checked={list.every(item => listChosen.includes(item.ten))} onChange={e => this.setState({ listChosen: e.target.checked ? list.map(item => item.ten) : [] })} />
                                <s className='label-text' />
                            </label>
                        </span>
                    </th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Tên phòng</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Tòa nhà</th>
                    <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Ghi chú</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Sức chứa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng phòng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={listChosen.includes(item.ten)} permission={{ write: true }} onChanged={value => this.setState({ listChosen: value ? [...listChosen, item.ten] : listChosen.filter(i => i != item.ten) })} />
                    <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                    <TableCell type='text' content={toaNhaMapper[item.toaNha] || ''} />
                    <TableCell type='text' content={item.moTa} />
                    <TableCell style={{ textAlign: 'right' }} type='text' content={item.sucChua} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={value => this.props.updateDmPhong(item.ten, { kichHoat: value ? 1 : 0, })} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenTinhTrang} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} />
                </tr>)
        });

        let data = items.groupBy('coSo');

        Object.keys(data).map(item => {
            let coSo = this.state.dataCS?.find(cs => cs.ma == item);
            tabs.push({
                title: `${T.parse(coSo?.ten || '{ "vi":"Chưa có cơ sở" }')?.vi}`,
                component: <>{table(data[item])}</>,
            });
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách Phòng học',
            breadcrumb: [
                <Link key={0} to={`/user/${this.menu}`}>{this.menu == 'dao-tao' ? 'Đào tạo' : 'Danh mục'}</Link>,
                <Link key={1} to='/user/dao-tao/data-dictionary'>Từ điển dữ liệu</Link>,
                'Phòng học'
            ],
            content: <>
                <div className='tile'>
                    <FormTabs tabs={tabs} />
                </div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createDmPhong} update={this.props.updateDmPhong} />
                <MultipleModal ref={e => this.multipleModal = e} update={this.props.updateMultipleDmPhong} />
            </>,
            backRoute: this.menu == 'dao-tao' ? '/user/dao-tao/data-dictionary' : '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onSave: permission && permission.write ? e => e && e.preventDefault() || this.multipleModal.show(listChosen) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmPhong: state.danhMuc.dmPhong, dmToaNha: state.danhMuc.dmToaNha });
const mapActionsToProps = { getDmToaNhaAll, getDmPhongAll, deleteDmPhong, createDmPhong, updateDmPhong, getDmCoSoAll, updateMultipleDmPhong };
export default connect(mapStateToProps, mapActionsToProps)(DmPhongPage);