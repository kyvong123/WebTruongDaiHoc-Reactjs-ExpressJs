import React from 'react';

import { Link } from 'react-router-dom';
import { AdminModal, FormCheckbox, FormSelect, FormTabs, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import T from 'view/js/common';

import { SelectAdapter_LoaiHoSo } from 'modules/mdDanhMuc/dmLoaiHoSo/redux';
import { SelectAdapter_HoSo } from './redux';
const { loaiLienKet } = require('../constant');


export class TaoHoSoModal extends AdminModal {

    onShow = () => {
        this.tieuDe.value('');
        this.loaiHoSo.value('');
    }

    onSubmit = () => {
        const data = {
            tieuDe: this.tieuDe.value(),
            loaiHoSo: this.loaiHoSo.value()
        };
        if (!data.tieuDe) {
            T.notify('Tiêu đề hồ sơ bị trống', 'danger');
            this.tieuDe.focus();
        } else if (!data.loaiHoSo) {
            T.notify('Loại hồ sơ bị trống', 'danger');
            this.loaiHoSo.focus();
        } else {
            this.props.create(data, () => {
                this.hide();
            });
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Tạo hồ sơ',
            body: <div className='row'>
                <FormTextBox ref={e => this.tieuDe = e} className='col-md-12' label='Tiêu đề' type='text' required />
                <FormSelect ref={e => this.loaiHoSo = e} data={SelectAdapter_LoaiHoSo} label='Loại hồ sơ' className='col-md-12' required />
            </div>
        });
    }
}

export class ThemVaoHoSoModal extends AdminModal {
    onShow = () => {
        this.hoSo.value('');
    }

    onSubmit = () => {
        const data = {
            hoSo: this.hoSo.value(),
            vanBan: this.props.vanBanId,
            loaiVanBan: this.props.loaiVanBan
        };

        if (!data.hoSo) {
            T.notify('Chưa có hồ sơ nào được chọn', 'danger');
            this.hoSo.focus();
        } else {
            this.props.add(data.hoSo, { vanBan: data.vanBan, loaiVanBan: data.loaiVanBan }, () => this.hide());
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Thêm văn bản vào hồ sơ',
            body: <div className='row'>
                <FormSelect className='col-md-12' label='Hồ sơ' ref={e => this.hoSo = e} data={SelectAdapter_HoSo(this.props.vanBanId, this.props.loaiVanBan)} required />
            </div>
        });
    }
}

const getYearRange = (from, to) => {
    if (!to) {
        to = from + 1;
    }
    return [new Date(`${from}-01-01`).getTime(), new Date(`${to}-01-01`).getTime()];
};

class VanBanDi extends React.Component {
    itemRef = {}

    state = { ids: [] }

    changeSearch = (e) => {
        e?.preventDefault && e.preventDefault();
        const { pageNumber = 1, pageSize = 25 } = this.props.hcthHoSo?.vanBanDiPage || {},
            searchTerm = this.search.value(),
            year = this.year.value(),
            [fromTime, toTime] = year && Number.isInteger(Number(year)) ? getYearRange(Number(year)) : [],
            currentVanBan = this.props.hcthHoSo?.item?.vanBan?.filter(item => item.loaiB == 'VAN_BAN_DI') || [],
            filter = { fromTime, toTime, hasIds: 0, excludeIds: currentVanBan.map(item => item.keyB).toString() };

        if (this.tabs.selectedTabIndex() == 1) {
            filter.ids = this.state.ids.toString();
            filter.hasIds = 1;
        }


        this.setState({ filter }, () => this.getPage(pageNumber, pageSize, searchTerm, this.setItem));
    }

    setItem = () => {
        this.state.ids.forEach(id => this.itemRef[id]?.value(true));
    }

    getSelected = () => this.state.ids


    getPage = (pageNumber, pageSize, pageCondition, done) => {
        this.props.getVanBanDiSelector(pageNumber, pageSize, pageCondition, this.state.filter, (data) => {
            this.setItem();
            done(data);
        });
    }

    handleToggleItem = (item, value) => {
        if (value) {
            this.setState({ ids: [...this.state.ids, item.id] });
        } else {
            this.setState({ ids: this.state.ids.filter(id => id != item.id) });
        }
    }

    resetSearch = (e) => {
        e?.preventDefault && e.preventDefault();
        this.year.value('');
        this.search.value('');
        this.changeSearch();
    }

    resetState = () => {
        this.setState({
            ids: [],
            filter: {},
        });
    }

    render = () => {
        const { pageNumber = 1, pageSize = 25, pageTotal = 0, totalItem = 0, pageCondition = '', list = null } = this.props.hcthHoSo?.vanBanDiPage || {};

        const table = renderTable({
            loadingOverlay: false,
            loadingClassName: 'd-flex justify-content-center',
            getDataSource: () => list,
            renderHead: () => <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}></th>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày gửi</th>
                <th style={{ width: '35%', whiteSpace: 'nowrap' }}>Đơn vị gửi</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }} >Văn bản giấy</th>
                <th style={{ width: '65%', whiteSpace: 'nowrap' }}>Trích yếu</th>
            </tr>,
            renderRow: (item, index) => {
                return (<tr key={item.id}>
                    <TableCell style={{}} content={<FormCheckbox ref={e => this.itemRef[item.id] = e} onChange={value => this.handleToggleItem(item, value)} />} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<Link to={`/user/van-ban-di/${item.id}`} target='_blank' rel='noopener noreferrer' >{item.soCongVan || 'Chưa có số'}</Link>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.ngayTao, 'dd/mm/yyyy')} />

                    <TableCell contentClassName='multiple-lines-3' contentStyle={{ width: '100%' }} content={item.tenDonViGui} />
                    <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.isPhysical} />

                    <TableCell contentClassName='multiple-lines-3' contentStyle={{ width: '100%' }} content={item.trichYeu} />
                </tr>);
            }
        });

        const TAB_ID = 'VanBanDiSelector';
        const tabs = [{ title: 'Danh sách' }, { title: 'Đã chọn' }];


        return (
            <div className='col-md-12'>
                <div className='form-group row' onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }}>
                    <FormTextBox label='Tìm kiếm' ref={e => this.search = e} className='col-md-8' />
                    <FormTextBox label='Năm' ref={e => this.year = e} className='col-md-4' />
                    <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type='submit' className='btn btn-danger' onClick={this.resetSearch}>
                            <i className='fa fa-lg fa-times-circle-o' />Hủy tìm kiếm
                        </button>
                        <button type='submit' className='btn btn-success' onClick={this.changeSearch}>
                            <i className='fa fa-lg fa-search' />Tìm kiếm
                        </button>
                    </div>

                    <FormTabs className='col-md-12' style={tabs.length == 1 ? { display: 'none' } : {}} ref={e => this.tabs = e} tabs={tabs} id={TAB_ID} onChange={this.changeSearch} />

                    <div className='col-md-12' style={{ maxHeight: '40vh', overflowY: 'scroll', padding: '10px 10px 10px 10px' }}>
                        {table}
                    </div>

                    <Pagination style={{ marginLeft: '50px', position: 'static', marginTop: '10px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />


                </div>
            </div>
        );
    }
}

class VanBanDen extends React.Component {
    itemRef = {}

    state = { ids: [] }

    changeSearch = (e) => {
        e?.preventDefault && e.preventDefault();
        const { pageNumber = 1, pageSize = 25 } = this.props.hcthHoSo?.vanBanDenPage || {},
            searchTerm = this.search.value(),
            year = this.year.value(),
            [fromTime, toTime] = year && Number.isInteger(Number(year)) ? getYearRange(Number(year)) : [],
            currentVanBan = this.props.hcthHoSo?.item?.vanBan?.filter(item => item.loaiB == loaiLienKet.VAN_BAN_DEN.id) || [],
            filter = { fromTime, toTime, hasIds: 0, excludeIds: currentVanBan.map(item => item.keyB).toString() };

        if (this.tabs.selectedTabIndex() == 1) {
            filter.ids = this.state.ids.toString();
            filter.hasIds = 1;
        }


        this.setState({ filter }, () => this.getPage(pageNumber, pageSize, searchTerm, this.setItem));
    }

    setItem = () => {
        this.state.ids.forEach(id => this.itemRef[id]?.value(true));
    }

    getSelected = () => this.state.ids


    getPage = (pageNumber, pageSize, pageCondition, done) => {
        this.props.getVanBanDenSelector(pageNumber, pageSize, pageCondition, this.state.filter, (data) => {
            this.setItem();
            done(data);
        });
    }

    handleToggleItem = (item, value) => {
        if (value) {
            this.setState({ ids: [...this.state.ids, item.id] });
        } else {
            this.setState({ ids: this.state.ids.filter(id => id != item.id) });
        }
    }

    resetSearch = (e) => {
        e?.preventDefault && e.preventDefault();
        this.year.value('');
        this.search.value('');
        this.changeSearch();
    }

    resetState = () => {
        this.setState({
            ids: [],
            filter: {},
        });
    }

    render = () => {
        const { pageNumber = 1, pageSize = 25, pageTotal = 0, totalItem = 0, pageCondition = '', list = null } = this.props.hcthHoSo?.vanBanDenPage || {};

        const table = renderTable({
            loadingOverlay: false,
            loadingClassName: 'd-flex justify-content-center',
            getDataSource: () => list,
            renderHead: () => <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}></th>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số CV</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số đến</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Đơn vị gửi</th>
                <th style={{ width: '80%', whiteSpace: 'nowrap' }}>Trích yếu</th>
            </tr>,
            renderRow: (item, index) => {
                return (<tr key={item.id}>
                    <TableCell style={{}} content={<FormCheckbox ref={e => this.itemRef[item.id] = e} onChange={(value) => this.handleToggleItem(item, value)} />} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<Link to={`/user/van-ban-den/${item.id}`} target='_blank' rel='noopener noreferrer' >{item.soCongVan || 'Chưa có số'}</Link>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soDen || 'Chưa có'} />
                    <TableCell contentClassName='multiple-lines-3' contentStyle={{ width: '100%' }} content={item.tenDonViGuiCV} />
                    <TableCell contentClassName='multiple-lines-3' contentStyle={{ width: '100%' }} content={item.trichYeu} />
                </tr>);
            }
        });

        const TAB_ID = 'VanBanDenSelector';
        const tabs = [{ title: 'Danh sách' }, { title: 'Đã chọn' }];

        return (
            <div className='col-md-12'>
                <div className='form-group row' onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }}>
                    <FormTextBox label='Tìm kiếm' ref={e => this.search = e} className='col-md-8' />
                    <FormTextBox label='Năm' ref={e => this.year = e} className='col-md-4' />
                    <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type='submit' className='btn btn-danger' onClick={this.resetSearch}>
                            <i className='fa fa-lg fa-times-circle-o' />Hủy tìm kiếm
                        </button>
                        <button type='submit' className='btn btn-success' onClick={this.changeSearch}>
                            <i className='fa fa-lg fa-search' />Tìm kiếm
                        </button>
                    </div>

                    <FormTabs className='col-md-12' style={tabs.length == 1 ? { display: 'none' } : {}} ref={e => this.tabs = e} tabs={tabs} id={TAB_ID} onChange={this.changeSearch} />

                    <div className='col-md-12' style={{ maxHeight: '40vh', overflowY: 'scroll', padding: '10px 10px 10px 10px' }}>
                        {table}
                    </div>

                    <Pagination style={{ marginLeft: '50px', position: 'static', marginTop: '10px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />


                </div>
            </div>
        );
    }
}

export class ThemVanBanModal extends AdminModal {

    state = {};

    onShow = (item = {}) => {
        this.setState({ ...item, loaiLienKet: '' }, () => {
            this.loaiLienKet.value('');
        });
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        const data = {
            id: this.state.id ? this.state.id : this.props.hoSoId,
            vanBan: this.vanBan?.getSelected() || [],
            loaiLienKet: this.loaiLienKet.value(),
            edit: this.state.id ? false : true,
            adPage: this.state.father ? false : true,
        };

        if (data.vanBan.length == 0) {
            T.notify('Chưa có văn bản nào được chọn', 'danger');
        } else {
            this.props.addVanBan(data.id, data, () => this.hide());
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Thêm văn bản',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect className='col-md-4' ref={e => this.loaiLienKet = e} label='Loại văn bản' data={Object.keys(loaiLienKet).map(key => ({ id: loaiLienKet[key]?.id, text: loaiLienKet[key]?.text }))} onChange={value => this.setState({ loaiLienKet: value })} required />
                {this.state.loaiLienKet?.id == loaiLienKet.VAN_BAN_DEN.id && <VanBanDen {...this.props} ref={e => this.vanBan = e} />}
                {this.state.loaiLienKet?.id == loaiLienKet.VAN_BAN_DI.id && <VanBanDi {...this.props} ref={e => this.vanBan = e} />}
            </div>
        });
    };
}