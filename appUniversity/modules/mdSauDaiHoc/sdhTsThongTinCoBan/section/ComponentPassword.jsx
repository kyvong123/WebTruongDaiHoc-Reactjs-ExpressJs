import React from 'react';
import { AdminModal } from 'view/component/AdminPage';
import { getAccountById } from 'modules/mdSauDaiHoc/sdhTsThongTinCoBan/redux';
import { connect } from 'react-redux';

export class ViewAccount extends AdminModal {
    state = { data: {} };

    onShow = (id) => {
        this.props.getAccountById(id, (data) => {
            this.setState({ id, data });
        });
    };


    render = () => {
        const { data = {} } = this.state.data;
        return this.renderModal({
            title: 'Thông tin đăng nhập thí sinh',
            size: 'small',
            body: <div className='row'>
                {/* <FormTextBox className='col-12' ref={e => this.email = e} label='Email nhận' readOnly /> */}
                {data.error ? <div className='col-md-12 tile'>
                    <div className='d-flex justify-content-center'>
                        <strong className='text-danger'> <i className='fa fa-ban' aria-hidden='true' />{data.error.message || ''} </strong>
                    </div>
                </div> : <>
                    <div className='col-md-12'>Tên tài khoản: <strong>{data.userName}</strong></div>
                    <div className='col-md-12'>Mật khẩu: {data.password}</div>
                    <div className='col-md-12'>Lần sửa đổi cuối cùng: {T.dateToText(data.lastModified, 'dd/mm/yyyy HH:MM')} </div>
                </>
                }
            </div>,
            isShowSubmit: false,
        }
        );
    };
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getAccountById
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ViewAccount);