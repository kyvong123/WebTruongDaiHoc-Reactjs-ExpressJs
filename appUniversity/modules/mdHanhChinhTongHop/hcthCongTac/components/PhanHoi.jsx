import React from 'react';
import { connect } from 'react-redux';
import { FormRichTextBox, renderComment } from 'view/component/AdminPage';
import { Img } from 'view/component/HomePage';
import { createPhanPhoi, getPhanHoi } from '../redux/congTac';
import BaseCongTac from './BaseCongTac';


class PhanHoi extends BaseCongTac {


    componentDidMount() {
        this.props.getPhanHoi(this.props.id);
    }

    renderPhanHoi = (listPhanHoi) => {
        return renderComment({
            getDataSource: () => listPhanHoi,
            emptyComment: 'Chưa có phản hồi',
            renderAvatar: (item) => <Img src={item.image || '/img/avatar.png'} style={{ width: '48px', height: '48px', paddingTop: '5px', borderRadius: '50%' }} />,
            renderName: (item) => <><span style={{ color: 'blue' }}>{item.ho?.normalizedName()} {item.ten?.normalizedName()}</span></>,
            renderTime: (item) => T.dateToText(item.ngayTao, 'dd/mm/yyyy HH:MM'),
            renderContent: (item) => item.noiDung
        });
    }

    onCreatePhanHoi = (e) => {
        e.preventDefault();
        const noiDung = this.phanHoi.value();
        this.setState({ isLoading: true }, () => {
            this.props.createPhanPhoi(this.getItem().id, noiDung, () => this.phanHoi.value(''), () => this.setState({ isLoading: false }));
        });
    }

    render() {
        return <div className='tile-body row'>
            <div className='col-md-12'>
                {
                    this.renderPhanHoi(this.getItem()?.phanHoi)
                }
            </div>
            <FormRichTextBox type='text' className='col-md-12' ref={e => this.phanHoi = e} label='Thêm phản hồi' />
            <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                <button type='submit' className='btn btn-success mr-2' onClick={this.onCreatePhanHoi}>
                    <i className='fa fa-paper-plane' />Thêm
                </button>
            </div>
        </div>;
    }
}

const stateToProps = (state) => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const actionsToProps = { getPhanHoi, createPhanPhoi };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(PhanHoi);
