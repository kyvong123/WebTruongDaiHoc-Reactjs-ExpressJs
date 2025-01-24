import React from 'react';
import { connect } from 'react-redux';
import T from 'view/js/common';
import { AdminPage, FormEditor, loadSpinner, FormTextBox } from 'view/component/AdminPage';
import { getInstruction, updateInstruction, createInstruction } from './redux';
import { Link } from 'react-router-dom';

class userEditPage extends AdminPage {

    state = { id: null, isLoading: true };

    componentDidMount() {
        const { readyUrl, routeMatcherUrl } = this.getSiteSetting();
        T.ready(readyUrl, () => {
            const params = T.routeMatcher(routeMatcherUrl).parse(window.location.pathname);
            this.setState({
                id: params.id === 'new' ? null : params.id,
                isLoading: params.id === 'new' ? false : true,
            }, () => this.getData());
        });
    }

    getSiteSetting = () => {
        const pathName = window.location.pathname;
        if (pathName.startsWith('/user/hcth'))
            return {
                readyUrl: '/user/hcth',
                routeMatcherUrl: '/user/hcth/instruction/:id',
                breadcrumb: [
                    <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                    <Link key={1} to='/user/hcth/instruction'>Danh sách hướng dẫn sử dụng</Link>
                ],
                backRoute: '/user/hcth/instruction'
            };
        else
            return {
                readyUrl: '/user',
                routeMatcherUrl: '/user/instruction/:id',
                breadcrumb: [
                    <Link key={0} to='/user/van-phong-dien-tu'>...</Link>,
                    <Link key={1} to='/user/instruction'>Danh sách hướng dẫn sử dụng</Link>
                ],
                backRoute: '/user/instruction'
            };
    }

    getData = () => {
        if (this.state.id) {
            this.props.getInstruction(Number(this.state.id), (item) => this.setState({ isLoading: false }, () => this.setData(item)));
        } else this.setData();
    }

    setData = (data = null) => {
        let { noiDung, tieuDe } = data ? data : { noiDung: '', tieuDe: '' };
        this.setState({ noiDung, tieuDe });
        this.noiDungInstruction?.html(noiDung);
        this.tieuDeInstruction?.value(tieuDe);
    }

    saveContent = () => {
        const changes = {
            noiDung: this.noiDungInstruction?.value(),
            tieuDe: this.tieuDeInstruction?.value(),
        };
        if (!changes.tieuDe) {
            T.notify('Tiêu đề hướng dẫn bị trống', 'danger');
        } else if (!changes.noiDung) {
            T.notify('Nội dung hướng dẫn bị trống', 'danger');
        } else {
            if (this.state.id) {
                this.props.updateInstruction(this.state.id, changes);
            } else {
                this.props.createInstruction(changes, () => this.props.history.push(this.getSiteSetting().backRoute));
            }
        }
    }

    renderContent = () => {
        const permission = this.getUserPermission('developer', ['login']),
            readOnly = !permission.login;

        return <>
            <div className='tile'>
                <div className='tile-title'>
                    <FormTextBox ref={e => this.tieuDeInstruction = e} label='Tiêu đề' readOnly={readOnly} />
                </div>

                <div className='tile-body'>
                    {readOnly && <div dangerouslySetInnerHTML={{ __html: this.state.noiDung }} style={{ minHeight: '400px' }} ></div>}
                    {!readOnly && <FormEditor ref={e => this.noiDungInstruction = e} height={400} label='Nội dung' dangerouslySetInnerHTML={{ _html: this.state.noiDung }} readOnly={readOnly} uploadUrl='/user/upload?category=hcthInstruction' />}
                </div>
                {!readOnly && <div style={{ textAlign: 'right' }}>
                    <button className='btn btn-success' type='button' onClick={() => this.saveContent()}>
                        <i className='fa fa-lg fa-save'></i>
                        Lưu
                    </button>
                </div>}

            </div>
        </>;
    }

    render = () => {
        const { backRoute } = this.getSiteSetting();
        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Hướng dẫn',
            content: this.state.isLoading ? loadSpinner() : this.renderContent(),
            backRoute
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthInstruction: state.hcth.hcthInstruction });
const mapActionsToProps = { getInstruction, updateInstruction, createInstruction };

export default connect(mapStateToProps, mapActionsToProps)(userEditPage);