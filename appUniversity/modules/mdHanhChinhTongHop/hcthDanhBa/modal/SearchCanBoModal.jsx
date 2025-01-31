import React from 'react';
import {
    FormCheckbox,
    AdminModal,
    FormTextBox,
    FormSelect
} from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { SelectAdapter_DmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_HcthDanhBa } from 'modules/mdHanhChinhTongHop/hcthDanhBa/redux';
import { getStaffByDonViDanhBa, getStaffFilterColumns } from 'modules/mdTccb/tccbCanBo/redux';
import InfiniteScroll from 'react-infinite-scroll-component';

class SearchCanBoModal extends AdminModal {
    state = {
        filterList: [],
        result: []
    };

    onShow = (initShccList) => {
        initShccList = (initShccList || []).toString();
        let initCanBoList = [];
        this.props.getStaffFilterColumns({ listShcc: initShccList }, 'ho,ten,shcc', (items) => {
            initCanBoList = items;
        });
        this.searchDmDonVi.value('');
        this.searchHcthDanhBa.value('');
        this.searchTerm.value('');
        const pageNumber = 1;
        const pageSize = 25;
        const filter = {};
        const searchTerm = '';
        this.props.getStaffByDonViDanhBa(pageNumber, pageSize, searchTerm, filter, (data) => {
            let { totalItem, pageSize, pageTotal, pageNumber, list } = data.page;
            this.setState({ hasMore: true, totalItem, pageSize, pageTotal, pageNumber, filterList: list, result: initCanBoList, searchTerm, filter });
        });
    };

    onSubmit = this.props.onSubmit ? (e) => {
        e.preventDefault();
        this.props.onSubmit(this.value());
        this.hide();
    } : null;

    onFilterChange = () => {
        const filterDonVi = this.searchDmDonVi.value() ? this.searchDmDonVi.value().toString() : '';
        const filterDanhBa = this.searchHcthDanhBa.value() ? this.searchHcthDanhBa.value().toString() : '';
        const searchTerm = this.searchTerm.value() || '';
        const filter = { filterDonVi, filterDanhBa };
        const pageNumber = 1;
        const pageSize = 25;
        this.props.getStaffByDonViDanhBa(pageNumber, pageSize, searchTerm, filter, (data) => {
            let { totalItem, pageSize, pageTotal, pageNumber, list } = data.page;
            this.setState({ hasMore: true, totalItem, pageSize, pageTotal, pageNumber, filterList: list, searchTerm, filter });
        });

    }

    onScrollChange = () => {
        if (this.state.pageNumber >= this.state.pageTotal) {
            this.setState({ hasMore: false });
        } else {
            const nextPage = this.state.pageNumber + 1;
            this.props.getStaffByDonViDanhBa(nextPage, this.state.pageSize, this.state.searchTerm, this.state.filter, (data) => {
                let { totalItem, pageSize, pageTotal, pageNumber, list: newList } = data.page;
                this.setState({ totalItem, pageSize, pageNumber, pageTotal, filterList: [...this.state.filterList, ...newList], });
            });
        }
    }

    renderItem = (item) => {
        const chucVu = T.parse(item.chucVu, []);
        return <div className='d-flex flex-column'>
            <span>{`${item.shcc}: ${item.phai == '01' ? 'Ô. ' : 'B. '} ${item.ho} ${item.ten}`}</span>
            <span>Đơn vị công tác: {item.donVi}</span>
            {chucVu?.map((i, index) => {
                return <span key={index}>
                    {i.chucVu} {i.donVi}
                </span>;
            })}
        </div>;
    }

    handleChangeResult = (value, item) => {
        const newResult = [...this.state.result];
        const newFilterList = [...this.state.filterList];
        /**
         * value == 1: Move from this.state.filterList -> this.state.result
         * value == 0: Move from this.state.result -> this.state.filterList
         */
        if (value) {
            this.setState({ filterList: newFilterList, result: [...newResult, item] }, () => {
                this.props.onChange && this.props.onChange(this.value());
            });
        } else {
            const idx = newResult.map(item => item.shcc).indexOf(item.shcc);
            if (idx > -1) {
                newResult.splice(idx, 1);
            }
            this.setState({ result: newResult }, () => {
                this.props.onChange && this.props.onChange(this.value());
            });
        }
    }

    value = () => {
        return this.state.result.map(item => item.shcc);
    }

    render = () => {
        return this.renderModal({
            title: this.props.title ? this.props.title : 'Tìm kiếm cán bộ nâng cao',
            size: 'elarge',
            // style: { height: '80vh', },
            body: <>
                <div className='row'>
                    <FormSelect onChange={this.onFilterChange} className='col-6' ref={(e) => this.searchDmDonVi = e} label='Thuộc đơn vị' data={SelectAdapter_DmDonViAll} allowClear={true} />
                    <FormSelect onChange={this.onFilterChange} className='col-6' ref={(e) => this.searchHcthDanhBa = e} label='Thuộc danh bạ' data={SelectAdapter_HcthDanhBa} allowClear={true} />
                    <FormTextBox onChange={this.onFilterChange} className='col-12' ref={(e) => this.searchTerm = e} label='Tìm theo tên hoặc mã số cán bộ' />
                    <div className='form-group col-6'>
                        <label>Kết quả lọc cán bộ</label>
                        <div id="scrollableDiv" style={{ height: '500px', overflow: 'auto' }}>
                            <InfiniteScroll dataLength={this.state.filterList.length} next={this.onScrollChange} hasMore={this.state.hasMore} loader={<p className='text-muted display-6' style={{ textAlign: 'center' }}>Loading dữ liệu...</p>} scrollableTarget="scrollableDiv" endMessage={
                                <p style={{ textAlign: 'center' }}>
                                    <b>Đã hiển thị toàn bộ kết quả lọc</b>
                                </p>
                            }>
                                <div className="list-group">
                                    {this.state.filterList.map(filterItem => (
                                        <FormCheckbox className="list-group-item" value={(this.state.result.map(item => item.shcc).includes(filterItem.shcc))} key={filterItem.shcc} onChange={(value) => this.handleChangeResult(value, filterItem)} label={this.renderItem(filterItem)} />
                                    ))}
                                </div>
                            </InfiniteScroll>
                        </div>
                    </div>
                    <div className='col-6'>
                        <label>Danh sách cán bộ đã chọn</label>
                        <div className="list-group" style={{ height: 500, overflow: 'auto' }}>
                            {this.state.result.map(resultItem => (
                                <FormCheckbox className="list-group-item" value={1} key={resultItem.shcc} onChange={(value) => this.handleChangeResult(value, resultItem)} label={this.renderItem(resultItem)} />
                            ))}
                        </div>
                    </div>
                </div>
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getStaffByDonViDanhBa, getStaffFilterColumns };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SearchCanBoModal);