import React from 'react';
import { connect } from 'react-redux';
import { renderTimeline } from 'view/component/AdminPage';
import { deleteChuongTrinh } from '../redux/congTac';
import HcthChuongTrinhHopModal from './ChuongTrinhModal';
import BaseCongTac from './BaseCongTac';

class HcthChuongTrinh extends BaseCongTac {

    delete = (item) => {
        T.confirm('Xóa cán bộ tham gia', 'Bạn có chắc bạn muốn xóa cán bộ tham gia này?', true, isConfirm => isConfirm && this.props.deleteChuongTrinh(item.id, this.getItem().id));
    }

    render() {
        return <div className='tile-body row justify-content-center'>
            <HcthChuongTrinhHopModal ref={e => this.chuongTrinhModal = e} />

            {this.isEditable() && <div className='col-md-12 d-flex justify-content-end align-items-center'>
                <button className='btn btn-success' onClick={(e) => {
                    e.preventDefault();
                    this.chuongTrinhModal.show({ item: this.state.item });
                }}><i className='fa fa-lg fa-plus' />Thêm chương trình</button>
            </div>}
            <div className='col-md-12'>
                {renderTimeline({
                    handleItem: (item) => ({
                        component: <>
                            <div className='primary-hover d-flex flex-column col-md-12 p-2 px-3 rounded'>
                                <span className='time'>{T.dateToText(item.batDau, 'dd/mm/yyyy HH:MM')}</span>
                                <div className='d-flex justify-content-between align-items-center'>
                                    <b style={{ color: 'blue' }}>{item.tenCanBo}</b>
                                    <div className='d-flex align-items-center hover-button hover-button' style={{ gap: 10 }}>
                                        {this.isEditable() && <><button className='btn btn-circle btn-primary d-flex justify-content-center align-items-center ' style={{ width: 25, height: 25, padding: 'unset' }} onClick={(e) => e.preventDefault() || this.chuongTrinhModal.show({ chuongTrinh: item })}>
                                            <i className='fa fa-pencil' style={{ marginRight: 0, fontSize: 12 }} />
                                        </button>
                                            <button className='btn btn-circle btn-danger  d-flex justify-content-center align-items-center' style={{ width: 25, height: 25, padding: 'unset' }} onClick={(e) => e.preventDefault() || this.delete(item)}>
                                                <i className='fa fa-times' style={{ marginRight: 0, fontSize: 12 }} />
                                            </button></>
                                        }
                                    </div>
                                </div>
                                <h6 className='tile-subtitle col-md-12 text-muted'>{item.moTa}</h6>
                                {item.fileName && <a download={item.fileName} href={`/api/hcth/cong-tac/chuong-trinh/file/${item.id}/${item.filePath}`}><i className='fa fa-file-o' /> {item.fileName}</a>}
                            </div>
                        </>
                    }),
                    getDataSource: () => this.getItem()?.chuongTrinh
                })}
            </div>
        </div>;
    }
}

const stateToProps = (state) => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const actionsToProps = { deleteChuongTrinh };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(HcthChuongTrinh);
