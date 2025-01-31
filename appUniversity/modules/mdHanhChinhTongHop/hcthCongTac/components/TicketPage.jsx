import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';
import { FormCheckbox, renderTable, TableCell } from 'view/component/AdminPage';
import BaseCongTac from './BaseCongTac';

export default class TicketPage extends BaseCongTac {
    state = { searching: false, loaiDonVi: [] };
    checkBox = {};

    componentDidMount() {
        T.ready(this.getSiteSetting().readyUrl, this.onDomReady);
    }

    onDomReady = () => {
        T.clearSearchBox();
        T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
        T.showSearchBox(() => {
            setTimeout(() => this.changeAdvancedSearch(), 100);
        });
        this.changeAdvancedSearch(true);
    }

    getSiteSetting = () => {
        return {
            readyUrl: '/user/van-phong-dien-tu',
            breadcrumb: [
                <Link key={0} to='/user/van-phong-dien-tu'>Văn phòng điện tử</Link>,
                'Đăng ký công tác',
            ],
            backRoute: '/user/van-phong-dien-tu',
            baseUrl: '/user/van-phong-dien-tu',
        };
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props.hcthCongTac?.ticketPage || { pageNumber: 1, pageSize: 50 };

        const pageFilter = isInitial ? {} : {};
        pageFilter.trangThai = this.trangThaiCongTacTicket.filter(i => this[i.id] && this[i.id].value()).map(i => i.id).toString();
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                }
            });
        });
    };

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getCongTacTicketPage(pageN, pageS, pageC, this.state.filter, (page) => this.setState({ loading: false }, () => done(page)));
    }

    clearAdvanceSearch = (e) => {
        e.preventDefault();
        this.changeAdvancedSearch();
    }

    getItemButtons = () => null;

    onCheckAllChange = () => null; //override this

    renderExtraRow = () => null;


    renderTicketTable = (list, pageNumber, pageSize, hasCheckbox) => {
        return renderTable({
            emptyTable: 'Không có lịch họp được đăng ký!',
            getDataSource: () => list,
            header: 'thead-light',
            // stickyHead: true,
            loadingOverlay: false,
            // className: 'table-fix-col',
            loadingClassName: 'd-flex justify-content-center align-items-center',
            renderHead: () => (
                <tr>
                    {!!hasCheckbox && <th style={{ width: 'auto', textAlign: 'center' }} ><FormCheckbox ref={e => this.checkAll = e} className='m-0 p-0' labelClassName='m-0 p-0' onChange={this.onCheckAllChange} /></th>}
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Từ ngày</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đến ngày</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Đăng ký bởi</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái</th>
                    <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Ghi chú</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => {
                return (<React.Fragment key={index}>
                    <tr>
                        {!!hasCheckbox && <TableCell style={{ textAlign: 'middle' }} content={<FormCheckbox ref={e => this.checkBox[`${item.id}`] = e} className='m-0 p-0' labelClassName='m-0 p-0' />} />}
                        <TableCell style={{ textAlign: 'right' }} content={<a href={'/user/vpdt/cong-tac/dang-ky/' + item.id} target='_blank' rel="noreferer noopener noreferrer">{(pageNumber - 1) * pageSize + index + 1}</a>} />
                        <TableCell type='text' content={<span className='text-primary'>{moment(new Date(item.batDau)).format('DD/MM/YYYY')}</span>} />
                        <TableCell type='text' content={<span className='text-danger'>{moment(new Date(item.ketThuc)).format('DD/MM/YYYY')}</span>} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<div className='d-flex flex-column'>
                            <span className=''>{item.tenNguoiTao?.normalizedName()}</span>
                            <span className=''>({item.tenDonVi})</span>
                        </div>} />
                        <TableCell type='text' content={<span className={`text-${this.trangThaiCongTacTicketDict[item.trangThai]?.level}`}>{this.trangThaiCongTacTicketDict[item.trangThai]?.text}</span>} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' style={{ textAlign: 'left' }} content={item.ghiChu} />
                        <TableCell type='buttons' style={{ textAlign: 'left' }} content={item} permission={{}}>
                            {this.getItemButtons(item)}
                        </TableCell>
                    </tr>
                    {this.renderExtraRow(item)}
                </React.Fragment>
                );
            }
        });
    }

}

