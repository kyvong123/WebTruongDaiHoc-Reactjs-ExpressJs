import React from 'react';
import { connect } from 'react-redux';
import { AdminPage } from 'view/component/AdminPage';
import { TableHead, renderDataTable, FormCheckbox, TableCell, FormSelect, FormTextBox, AdminModal, getValue } from 'view/component/AdminPage';
import { genSdhTsPhach, getSdhTsDSBTPage, getSdhTsDsPhachPage } from './redux';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_MonThiDanhPhach } from './redux';

class DanhPhachModal extends AdminModal {

    onShow = (maMonThi, kyNang) => {
        this.setState({ maMonThi, kyNang }, () => {
            this.step.value('');

        });
    };

    onApply = () => {
        const { list } = this.props.sdhTsDanhPhach && this.props.sdhTsDanhPhach.donTuiPage ? this.props.sdhTsDanhPhach.donTuiPage : { list: [] };
        const changes = {
            maMonThi: this.state.maMonThi,
            kyNang: this.state.kyNang,
            step: getValue(this.step),
            maTui: getValue(this.maTui),

            data: list
        };
        if (!changes.step || !changes.data || !changes.maTui) {
            T.notify('Lỗi lấy dữ liệu', 'danger');
        }
        else {
            this.props.genPhach(changes, () => {
                this.props.getPage();
                this.hide();
            });
        }

    };
    render = () => {
        const permission = this.props.permission;
        const { list } = this.props.sdhTsDanhPhach && this.props.sdhTsDanhPhach.donTuiPage ? this.props.sdhTsDanhPhach.donTuiPage : { list: [] };

        return this.renderModal({
            title: 'Đánh phách ngắt đoạn',
            size: 'large',
            isShowSubmit: false,
            postButtons: <button className='btn btn-success' onClick={this.onApply}>
                <i className='fa fa-lg fa-arrow-right' /> Áp dụng
            </button>,
            body: <div className='row'>
                <FormTextBox type='number' max={list.length} min={0} allowNegative={false} ref={e => this.step = e} label='Bước nhảy' className='col-md-12' readOnly={!permission.write} />
                <FormTextBox ref={e => this.maTui = e} maxLength={8} label='Mã túi' className='col-md-12' readOnly={!permission.write} />
            </div>
        }
        );
    };
}


class DanhPhachSection extends AdminPage {
    defaultSortTerm = 'soBaoDanh_ASC'
    state = { idDot: '', isNgoaiNgu: '', filter: {}, sortTerm: 'soBaoDanh_ASC', listChosen: [], maMonThi: '', checked: false, isKeySearch: false, isFixCol: false, isCoDinh: false };
    componentDidMount() {
        this.setState({ idDot: this.props.idDot }, () => {
            this.getPage();
        });
    }
    componentDidUpdate(prevProps) {
        if (prevProps.idDot != this.props.idDot)
            this.setState({ idDot: this.props.idDot }, () => {
                this.getPage();

            });
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        let condition = {
            maMonThi: this.state.maMonThi || '',
            idDot: this.state.idDot
        };
        let filter = { ...this.state.filter, ...condition, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhTsDSBTPage(pageN, pageS, pageC, filter, done);
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    defaultSkill = [{ id: 'Listening', text: 'Nghe' }, { id: 'Speaking', text: 'Nói' }, { id: 'Reading', text: 'Đọc' }, { id: 'Writing', text: 'Viết' }]

    changeSelect = (value) => {
        if (this.defaultSkill.map(item => item.id).includes(value?.id)) {//select ky nang
            this.setState({ filter: { ...this.state.filter, ks_kyNang: value?.id } }, () => {
                this.getPage();
                this.props.callBackChangeKyNang(value?.id);
            });
        } else
            this.setState({ maMonThi: value?.id, idDot: this.state.idDot }, () => { //select mon thi
                if (value.isNgoaiNgu) { //select ngoại ngữ i.e tiếng anh
                    this.setState({ isNgoaiNgu: value.isNgoaiNgu, filter: { ...this.state.filter, ks_kyNang: '' } });//đợi select kynang roi searchpage
                    this.props.callBackChangeMonThi({ maMonThi: value?.id, isNgoaiNgu: value.isNgoaiNgu });

                } else {//select môn cb,cs
                    this.setState({ isNgoaiNgu: false, filter: { ...this.state.filter, ks_kyNang: '' } }, () => {//search page ko cần đợi select kỹ năng
                        this.getPage();
                        this.props.callBackChangeMonThi({ maMonThi: value?.id, isNgoaiNgu: value.isNgoaiNgu });
                    });//reset filter
                }
            });

    }
    render = () => {
        const { permission } = this.props;
        const isNgoaiNgu = this.state.isNgoaiNgu;
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.sdhTsDanhPhach && this.props.sdhTsDanhPhach.donTuiPage ? this.props.sdhTsDanhPhach.donTuiPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [], totalSlots: 0, arrangedSlots: [] };
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null,
            onSort = this.state.isSort ? this.onSort : null;
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu thí sinh',
            stickyHead: this.state.isCoDinh,
            loadingStyle: { backgroundColor: 'white' },
            header: 'thead-light',
            data: list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead keyCol='maTui' content='Mã túi' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='hoTen' content='Họ tên' style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='soBaoDanh' content='Số báo danh' style={{ width: '50%', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='maPhach' content='Mã phách' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.maTui} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`${item.ho} ${item.ten}`} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soBaoDanh} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.maPhach} />
                </tr>
            )
        });
        return <>
            <div className='tile'>
                <h4>Đánh phách bài thi</h4>
                <div className='tile-title-w-btn' style={{ marginBottom: '2' }}>
                    <FormSelect style={{ marginRight: '40', width: '300px', marginBottom: '0' }} ref={e => this.monThi = e} label='Chọn Môn thi'
                        data={SelectAdapter_MonThiDanhPhach(this.props.idDot)} onChange={(value) => this.changeSelect(value)} />
                    {isNgoaiNgu ? <FormSelect style={{ marginRight: '40', width: '300px', marginBottom: '0' }} ref={e => this.kyNang = e} label='Chọn kỹ năng'
                        data={this.defaultSkill} onChange={(value) => this.changeSelect(value)} /> : null}
                </div>
                {this.state.maMonThi ?
                    <div className='tile-body'>
                        <div style={{ marginBottom: '10px' }}>
                            Tìm thấy: {<b>{totalItem}</b>} bài thi <br />
                            Trong đó: {<b>{list.filter(item => item.maPhach).length}</b>} bài thi đã được đánh phách
                        </div>
                        <div className='tile-title-w-btn' style={{ marginBottom: '2' }}>
                            <div className='title'>
                                <div style={{ gap: 10, display: 'inline-flex' }}>
                                    <FormCheckbox label='Tìm theo cột' onChange={value => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }} />
                                    <FormCheckbox label='Cố định bảng' onChange={value => this.setState({ isCoDinh: value })} ref={e => this.isCoDinh = e} style={{ marginBottom: '0' }} />
                                    <FormCheckbox label='Sort' onChange={value => this.setState({ isSort: value })} style={{ marginBottom: '0' }} />
                                </div>
                            </div>
                            <div style={{ gap: 10 }} className='btn-group'>
                                <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem }} getPage={this.getPage} />
                            </div>
                        </div>
                        {(isNgoaiNgu && !this.state.filter.ks_kyNang) ? null :
                            <>
                                {table}
                                <div style={{ textAlign: 'right' }}>
                                    <button className='btn btn-primary' type='button' disabled={totalItem > 0 && permission.write ? false : true} onClick={e => e.preventDefault() || this.danhPhachModal.show(this.state.maMonThi, this.state.filter.ks_kyNang)}>
                                        <i className='fa fa-fw fa-lg fa-pencil' />Đánh phách
                                    </button>
                                </div>
                            </>}
                        <DanhPhachModal ref={e => this.danhPhachModal = e} maMonThi={this.state.maMonThi} kyNang={this.state.filter.kyNang} sdhTsDanhPhach={this.props.sdhTsDanhPhach} genPhach={this.props.genSdhTsPhach} getPage={this.getPage} permission={permission} />
                    </div> : null}
            </div>
        </>;
    }

}

const mapStateToProps = state => ({ system: state.system, sdhTsLichThi: state.sdh.sdhTsLichThi, sdhTsDanhPhach: state.sdh.sdhTsDanhPhach });
const mapActionsToProps = {
    getSdhTsDSBTPage, genSdhTsPhach, getSdhTsDsPhachPage
};
export default connect(mapStateToProps, mapActionsToProps)(DanhPhachSection);