import React from 'react';
import { AdminModal, renderTimeline } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { getCircuit, getStages } from '../redux/vanBanDi';
import moment from 'moment';
import { Img } from 'view/component/HomePage';

class VanBanHorizontalTimeTine extends AdminModal {
    onShow = (item) => {
        const id = item.id;
        this.setState({ circuit: null, stages: null }, () => {
            this.props.getStages(id, stages => {
                this.setState({ stages });
            });
        });
    }

    render = () => {
        return this.renderModal({
            // size: 'elarge',
            title: 'Theo dõi văn bản',
            body: this.state.stages ? renderTimeline({
                getDataSource: () => this.state.stages,
                loadingText: 'Đang tải chu trình văn bản',
                handleItem: (item) => ({
                    className: '',
                    component: <div className='btn d-flex flex-column justify-content-center' style={{
                        // display: 'flex', flexDirection: 'column', alignItems: 'left', padding: '20px',
                        flex: 1,
                        fontWeight: 'normal',
                        textAlign: 'left',
                        backgroundColor: item.shcc && !item.thoiGian ? '#b1d9e0' : '#FFFFFF',
                        boxShadow: item.shcc && !item.thoiGian ? '3px 3px 3px -2px rgba(108,117,125,0.9)' : 'none'
                    }} >
                        <h5 style={{ fontWeight: 'bold', marginTop: 0 }}>{item.tenTrangThai}</h5>
                        {
                            item.tenCanBo &&
                            <div className='d-flex justify-content-between align-items-center p-2 pr-3' style={{ border: '1px solid ' + (item.shcc && !item.thoiGian ? '#060700' : '#D6D6D6'), borderRadius: 10 }}>
                                <div className='d-flex align-items-center' style={{ padding: 5 }}>
                                    <Img src={item.image || '/img/avatar.png'} width='30' height='30' style={{ borderRadius: '50%' }} />
                                    <div className='d-flex flex-column justify-content-between' style={{ paddingLeft: 10 }}>
                                        <h5>{item.tenCanBo}</h5>
                                        <h6 style={{ color: '#757575' }}>{item.tenDonVi}</h6>
                                    </div>
                                </div>
                                {item.thoiGian && <span style={{ color: '#616161', fontWeight: 'bold' }}>{moment(new Date(item.thoiGian)).format('DD/MM/YYYY, HH:mm')}</span>}
                            </div>
                        }
                    </div >
                })
            }) : null
        });
    }
}
const stateToProps = state => ({ system: state.system });
const actionsToProps = { getCircuit, getStages };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(VanBanHorizontalTimeTine);