import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { renderTimeline } from 'view/component/AdminPage';
import { updateTrangThaiCanBo, getLichHopRange } from '../redux/congTac';
import { Link } from 'react-router-dom';
import { BaseCongTacModal } from './BaseCongTac';

class LichHopNgay extends BaseCongTacModal {
    state = { editing: null }

    onShow = (data) => {
        this.setState({ ...data });
    }

    reload = () => {
        const date = new Date(this.state.year, this.state.month - 1, this.state.date);
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        const startAt = date.getTime();
        const endAt = new Date(this.state.year, this.state.month - 1, this.state.date, 23, 59, 59, 999).getTime();
        this.setState({ items: null });
        this.props.getLichHopRange({ startAt, endAt }, (data) => {
            this.setState({ items: data[key] });
        });
    }

    updateVaiTro = (item, trangThai) => {
        this.props.updateTrangThaiCanBo(item.id, { trangThai }, this.reload);
    }

    render = () => {
        return this.renderModal({
            size: 'large',
            title: 'Lịch họp',
            body: <div>
                {renderTimeline({
                    handleItem: (item) => ({
                        className: item.trangThai == 'ACCEPTED' ? 'success' : item.trangThai == 'DECLINED' ? 'danger' : '',
                        component: <>
                            <span className='time'>{T.dateToText(item.batDau, 'dd/mm/yyyy HH:MM')} <span className={`text-${this.trangThaiXacNhanDict[item.trangThai ?? 'PENDING'].level}`}>{item.trangThai == 'ACCEPTED' ? 'Đã xác nhận tham gia' : item.trangThai == 'DECLINED' ? 'Đã từ chối tham gia' : ''}</span></span>
                            <div className='tile d-flex flex-column col-md-12 bg-light bg-gradient'>
                                <div className='d-flex justify-content-between align-items-begin'>
                                    <div style={{ flex: 1 }}>
                                        <h5 className='tile-subtitle' ><Link to={'/user/vpdt/lich-hop/' + item.id}>{item.chuDe}</Link></h5>
                                        <h6 className='tile-subtitle text-muted multiple-lines-3' style={{ width: '100%' }} >{item.noiDung}</h6>
                                    </div>
                                    {item.trangThai == 'INVITED' && <div className='d-flex ' style={{ gap: 10 }}>
                                        <Tooltip arrow title='Chấp nhận'>
                                            <button onClick={(e) => e.preventDefault() || this.updateVaiTro(item, 'ACCEPTED')} className='btn btn-circle btn-success d-flex justify-content-center align-items-center' style={{ width: 25, height: 25, padding: 'unset' }}>
                                                <i className='fa fa-check' style={{ marginRight: 0, fontSize: 12 }} />
                                            </button>
                                        </Tooltip>
                                        <Tooltip arrow title='Từ chối'>
                                            <button onClick={(e) => e.preventDefault() || this.updateVaiTro(item, 'DECLINED')} className='btn btn-circle btn-danger  d-flex justify-content-center align-items-center' style={{ width: 25, height: 25, padding: 'unset' }}>
                                                <i className='fa fa-times' style={{ marginRight: 0, fontSize: 12 }} />
                                            </button>
                                        </Tooltip>
                                    </div>}
                                </div>
                            </div>
                        </>
                    }),
                    getDataSource: () => this.state.items
                })}
            </div>
        });
    }
}

const stateToProps = (state) => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const actionsToProps = { updateTrangThaiCanBo, getLichHopRange };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(LichHopNgay);
