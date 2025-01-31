import React from 'react';
import { AdminModal, renderTimeline } from 'view/component/AdminPage';
import { getFileHistory } from '../redux';
import { connect } from 'react-redux';
class FileHistoryModal extends AdminModal {

    state = {
        historySortType: true
    }

    onShow = (item) => {
        const { id } = item;
        this.setState({ id, items: null }, () => {
            this.props.getFileHistory(id, (items) => this.setState({ items }));
        });
    }

    renderHistory = () => renderTimeline({
        getDataSource: () => this.state.items,
        handleItem: (item) => ({
            component: <>
                <span className='time'>{T.dateToText(item.thoiGian, 'dd/mm/yyyy HH:MM:ss')}</span>
                <p style={{ display: 'flex', justifyContent: 'space-between', color: 'blue' }}>
                    <a target='_blank' rel='noreferrer noopener' href={item.ten.endsWith('.pdf') ? `/user/van-ban-den/file?info=${T.stringify({ id: item.id, ten: item.ten, tenFile: item.tenFile, ma: item.ma })}` : `/api/hcth/van-ban-den/download/${item.ma}/${item.tenFile}`}>{item.ten}</a>
                    <span>{item.tenNguoiTao?.normalizedName() || ''}</span>
                </p>
            </>
        })
    });

    onChangeHistorySort = () => {
        this.setState(state => ({
            historySortType: !state.historySortType,
            item: { ...state.item, danhSachCapNhat: state.item.danhSachCapNhat.reverse() }
        }));
    }

    render = () => {

        return this.renderModal({
            title: <span><i className={`btn fa fa-sort-amount-${this.state.historySortType ? 'desc' : 'asc'}`} onClick={this.onChangeHistorySort} /> Lịch sử văn bản</span>,
            body: <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 16, paddingRight: 16, maxHeight: 400, overflowY: 'scroll' }}>
                    {this.renderHistory()}
                </div>
            </div>
        });
    }
}

const stateToProps = state => ({ system: state.system });
const actionsToProps = { getFileHistory };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(FileHistoryModal);