import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { changeRole } from 'modules/_default/fwRole/redux';
import { getContact } from 'modules/mdTruyenThong/fwContact/redux';
import { getUnreadNotification, addNotification, readNotification } from 'modules/_default/fwNotification/redux';
import { getFwQuestionAnswerNotificationPage, readFwQuestionAnswerNotification, readAllFwQuestionAnswerNotification } from 'modules/mdTruyenThong/fwQuestionAnswer/redux/qa/redux';
import { updateSystemState, logout } from 'modules/_default/_init/reduxSystem';
import { SelectAdapter_FwUser, switchUser } from 'modules/_default/fwUser/reduxUser';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { AdminModal, AdminPage, FormSelect, } from 'view/component/AdminPage';
import AdminContactModal from './AdminContactModal';
import { SelectAdapter_FwStudent } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { SelectAdapter_FwSvSdh } from 'modules/mdSauDaiHoc/fwSinhVienSdh/redux';
import ExecuteTaskItem from './AdminExecuteTask';
class DebugModal extends AdminModal {
    state = { type: 'user' }
    onShow = () => {
        this.setState({ type: 'user' }, () => {
            this.user.value('');
            this.type.value('user');
        });
    }

    onSubmit = () => {
        const data = this.user.value();
        this.props.switchUser(data);
    }

    render = () => {
        let select = <FormSelect ref={e => this.user = e} placeholder='User' data={SelectAdapter_FwUser} className='col-md-6' />;
        switch (this.state.type) {
            case 'staff':
                select = <FormSelect ref={e => this.user = e} placeholder='Staff' data={SelectAdapter_FwCanBo} className='col-md-6' />;
                break;
            case 'student':
                select = <FormSelect ref={e => this.user = e} placeholder='Stud' data={SelectAdapter_FwStudent} className='col-md-6' />;
                break;
            case 'graduatedStudent':
                select = <FormSelect ref={e => this.user = e} placeholder='Grad Stud' data={SelectAdapter_FwSvSdh} className='col-md-6' />;
                break;
            default:
                break;
        }
        return this.renderModal({
            title: 'Developers request',
            body: <div className='row'>
                <FormSelect ref={e => this.type = e} data={['user', 'staff', 'student', 'graduatedStudent']} className='col-md-6' onChange={value => this.setState({ type: value.id }, () => this.user.value('') || this.user.focus())} />
                {select}
            </div>,
            submitText: 'Submit'
        });
    }
}

export const UrlItem = (props) => {
    const link = props.link || '#';
    if (link == '#') {
        return (
            <a href='#' className='app-notification__item' onClick={e => e.preventDefault() || (props.onClick && props.onClick(e))}>
                {props.children}
            </a>
        );
    } else if (link.startsWith('http')) {
        return (
            <a href={link} className='app-notification__item' target='_blank' rel='noreferrer' onClick={(e) => props.onClick && props.onClick(e)}>
                {props.children}
            </a>
        );
    } else {
        return (
            <Link to={link} className='app-notification__item' onClick={(e) => props.onClick && props.onClick(e)}>
                {props.children}
            </Link>
        );
    }
};

class ContactItem extends AdminPage {
    componentDidMount() {
        T.ready('/user', () => {
            const user = this.props.system && this.props.system.user ? this.props.system.user : {};
            if (user.isStaff) {
                T.socket.on('fwQANotificationAdminEvent', () => {
                    this.props.getFwQuestionAnswerNotificationPage();
                });
            }
            T.socket.on('fwQANotificationUserEvent', () => {
                this.props.getFwQuestionAnswerNotificationPage();
            });
            this.props.getFwQuestionAnswerNotificationPage();
        });
    }

    componentWillUnmount() {
        T.socket.off('fwQANotificationAdminEvent');
        T.socket.off('fwQANotificationUserEvent');
        super.componentWillUnmount();
    }

    readLienHeNoti = () => {
        // this.props.readFwQuestionAnswerNotification(item.id);
    }

    readAllLienHeNoti = (notiIdList) => {
        T.confirm('Đánh dấu thông báo Q&A, Blackbox đã đọc?', 'Bạn có chắc bạn muốn đánh dấu tất cả thông báo là đã đọc?', 'warning', true, (isConfirm) => {
            isConfirm && this.props.readAllFwQuestionAnswerNotification(notiIdList);
        });
    }

    render() {
        const { totalitem: totalItem, rows: list } = this.props.fwQuestionAnswer && this.props.fwQuestionAnswer.notificationPage ?
            this.props.fwQuestionAnswer.notificationPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        const permission = this.getUserPermission('staff', ['login']);

        const lienHeNotiElements = list ? list.map((item, index) => {
            return (
                <li key={index}>
                    <UrlItem link={item.targetLink} onClick={() => this.readLienHeNoti(item)}>
                        <span className='app-notification__icon' style={{ display: 'flex', alignItems: 'center' }}>
                            <span className='fa-stack fa-lg'>
                                <i className='fa fa-circle fa-stack-2x' style={{ color: item.iconColor }} />
                                <i className={`fa ${item.icon} fa-stack-1x fa-inverse`} />
                            </span>
                        </span>
                        <div>
                            <p className='app-notification__message' style={{ fontWeight: 'bold' }}>{item.title}</p>
                            <p className='app-notification__meta'>{T.dateToText(item.sendTime, 'HH:MM dd/mm/yyyy')}</p>
                            {item.subTitle && item.subTitle.length != 0 ? <p className='app-notification__meta' style={{ color: !item.read ? 'blue' : 'black' }}>{item.subTitle}</p> : null}
                        </div>
                    </UrlItem>
                </li>
            );
        }) : [];

        return (
            <li className='dropdown'>
                <a className='app-nav__item' href='#' data-toggle='dropdown' aria-label='Show notifications'>
                    <i className='fa fa-envelope-o fa-lg' />
                    {<span className='badge badge-pill badge-danger' style={{ position: 'absolute', top: '6px', right: totalItem >= 10 ? '-8px' : '-2px', fontSize: '87%' }}>{totalItem || 0}</span>}
                </a>
                <ul className='app-notification dropdown-menu dropdown-menu-right' style={{ top: '10px' }}>
                    {!lienHeNotiElements.length && <li className='app-notification__title'>Không có thông báo liên hệ mới!</li>}

                    <div className='app-notification__content'>
                        {lienHeNotiElements}
                    </div>
                    {list && list.length > 0 && <li className='app-notification__footer'>
                        <div className='btn btn-primary' onClick={() => this.readAllLienHeNoti(T.stringify(list.map(item => item.id)))}>Đánh dấu đã đọc hết thông báo</div>
                    </li>}
                    <li className='app-notification__footer'>
                        <Link to='/user/tt/lien-he/home'>Đến trang hộp thư liên hệ cá nhân</Link>
                    </li>
                    {permission && permission.login && <li className="app-notification__footer">
                        <Link to="/user/tt/lien-he/quan-ly">Đến trang quản lý hộp thư liên hệ đơn
                            vị</Link>
                    </li>}
                </ul>
            </li>
        );
    }
}

const SectionContact = withRouter(connect(state => ({ system: state.system, fwQuestionAnswer: state.lienHe.fwQuestionAnswer }), { getFwQuestionAnswerNotificationPage, readFwQuestionAnswerNotification, readAllFwQuestionAnswerNotification })(ContactItem));

class NotificationItem extends AdminPage {
    componentDidMount() {
        const handleGetNotification = () => {
            if (this.props.system && this.props.system.user) {
                // const contactRead = this.getUserPermission('contact', ['read']).read;
                // if (contactRead) this.props.getUnreadContacts();
                this.props.getUnreadNotification(1, 10, page => {
                    if (page && page.list && page.list.length) {
                        this.setState({ notificationLength: page.totalItem });
                        document.notification = `(${page.totalItem})`;
                    }
                });
            } else setTimeout(handleGetNotification, 250);
        };
        handleGetNotification();
        T.getNotification = handleGetNotification;
    }

    readNotify = (id, action) => {
        this.props.readNotification(id, action, () => this.props.getUnreadNotification(1, 10, page => {
            if (page && page.list && page.list.length) {
                this.setState({ notificationLength: page.totalItem });
                document.notification = `(${page.list.length})`;
            }
        }));
    }

    handleClickButton = (e, button, notiId) => {
        e.stopPropagation();
        e.preventDefault();
        let { method, url, body, text } = button;
        if (url) {
            if (!method) method = 'get';
            method = method.toLowerCase();
            // Redirect to another page
            if (method == 'get' && !url.startsWith('/api')) {
                // External link
                if (url.startsWith('http')) {
                    window.open(url, '_blank');
                } else if (!url.startsWith('/user')) {
                    // Homepage
                    document.location.pathname = url;
                } else {
                    this.props.history.push(url);
                }
                this.readNotify(notiId);
            } else {
                // Handle request
                T[method](url, body || {}, (data) => {
                    if (data) {
                        if (data.error) {
                            T.notify(data.error.message || 'Thao tác bị lỗi!', 'danger');
                        } else {
                            T.notify(data.success && data.success.message ? data.success.message : 'Thao tác thành công!', 'success');
                            this.readNotify(notiId, 'Đã ' + text.toLowerCase());
                        }
                    }
                }, () => T.notify('Thao tác bị lỗi!', 'danger'));
            }
        }
    }

    render() {
        const notifications = this.props.notification && this.props.notification.unread && this.props.notification.unread ? this.props.notification.unread : [];
        const notificationLength = this.state.notificationLength;
        const notificationElements = notifications.map((item, index) => {
            let buttons;
            try {
                if (item.buttonLink) {
                    buttons = JSON.parse(item.buttonLink);
                } else {
                    buttons = [];
                }
            } catch (e) {
                console.error(e);
                buttons = [];
            }
            if (buttons.length) item.targetLink = '#';
            return (
                <li key={index}>
                    <UrlItem link={item.targetLink} onClick={e => buttons.length == 0 ? this.readNotify(item.id) : e.preventDefault()}>
                        <span className='app-notification__icon' style={{ display: 'flex', alignItems: 'center' }}>
                            <span className='fa-stack fa-lg'>
                                <i className='fa fa-circle fa-stack-2x' style={{ color: item.iconColor }} />
                                <i className={`fa ${item.icon} fa-stack-1x fa-inverse`} />
                            </span>
                        </span>
                        <div>
                            <p className='app-notification__message' style={{ fontWeight: 'bold' }}>{item.title}</p>
                            <p className='app-notification__meta'>{T.dateToText(item.sendTime, 'HH:MM dd/mm/yyyy')}</p>
                            <p className='app-notification__meta' style={{ color: !item.read ? 'blue' : 'black' }}>{item.subTitle}</p>
                            {buttons.length ? (
                                <div className='row'>
                                    {buttons.map((button, index) => (
                                        <div key={index} className='col-auto' style={{ padding: '0 5px' }}>
                                            <button key={index} className={`btn btn-${button.type} btn-sm`} onClick={(e) => this.handleClickButton(e, button, item.id)}>{button.text}</button>
                                        </div>
                                    ))}
                                </div>
                            ) : ''}
                        </div>
                    </UrlItem>
                </li>
            );
        });

        return (
            <li className='dropdown'>
                <a className='app-nav__item' href='#' data-toggle='dropdown' aria-label='Show notifications'>
                    <i className='fa fa-bell-o fa-lg' />
                    {notificationLength ? <span className='badge badge-pill badge-danger' style={{ position: 'absolute', top: '6px', right: notificationLength >= 10 ? '-8px' : '-2px', fontSize: '87%' }}>{notificationLength || 0}</span> : ''}
                </a>
                <ul className='app-notification dropdown-menu dropdown-menu-right' style={{ top: '10px' }}>
                    {!notificationLength && <li className='app-notification__title'>Không có thông báo mới!</li>}

                    <div className='app-notification__content'>
                        {notificationElements}
                    </div>
                    <li className='app-notification__footer'>
                        <Link to='/user/notification'>Đến trang thông báo</Link>
                    </li>
                </ul>
            </li>
        );
    }
}

const SectionNotification = withRouter(connect(state => ({ system: state.system, notification: state.notification }), { getUnreadNotification, readNotification })(NotificationItem));

class AdminHeader extends AdminPage {
    componentDidMount() {
        T.showSearchBox = (onSearchHide = null) => {
            this.searchBox && $(this.searchBox).parent().css('display', 'flex');
            this.advancedSearch && $(this.advancedSearch).css('display', onSearchHide ? 'flex' : 'none');
            if (onSearchHide && typeof onSearchHide == 'function') {
                T.onAdvanceSearchHide = onSearchHide;
            } else {
                T.onAdvanceSearchHide = null;
            }
        };
        T.setTextSearchBox = (searchText) => {
            this.searchBox && $(this.searchBox).val(searchText);
        };
        T.hideSearchBox = () => {
            this.searchBox && $(this.searchBox).parent().css('display', 'none');
            this.advancedSearch && $(this.advancedSearch).css('display', 'none');
        };


        T.hideAdvancedSearch = () => {
            this.advancedSearch && $(this.advancedSearch).css('display', 'none');
        };
        T.clearSearchBox = () => {
            if (this.searchBox) this.searchBox.value = '';
        };
        T.socket.on('receive-notification', (email, notifyItem) => {
            const user = this.props.system && this.props.system.user ? this.props.system.user : {};
            if (user.email && user.email == email) {
                this.props.addNotification(notifyItem);
            }
        });

        T.initAdvancedSearch = (onAdvanceSearch = null) => {
            this.advancedSearch && $(this.advancedSearch).css('display', 'flex');
            if (onAdvanceSearch && typeof onAdvanceSearch == 'function') {
                T.onAdvanceSearchHide = onAdvanceSearch;
            } else {
                T.onAdvanceSearchHide = null;
            }
        };
    }

    toggleFullScreen = () => {
        // let a = $(window).height() - 10;
        if (!document.fullscreenElement && // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement) { // current working methods
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
            if (!$('.app').hasClass('sidenav-toggled')) {
                $('.app').addClass('sidenav-toggled');
            }
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
            if ($('.app').hasClass('sidenav-toggled')) {
                $('.app').removeClass('sidenav-toggled');
            }
        }
    }

    willUnmount = () => {
        T.socket.off('receive-notification');
    }

    search = (e) => e.preventDefault() || T.onSearch && T.onSearch(this.searchBox.value);

    onAdvanceSearch = (e) => {
        e.preventDefault();
        if ($('.app-advance-search')) {
            // Close advance search
            if ($('.app-advance-search').hasClass('show')) {
                T.onAdvanceSearchHide && T.onAdvanceSearchHide();
            }

            $('.app-advance-search').toggleClass('show');
        }
    }

    showContact = (e, contactId) => {
        e.preventDefault();
        this.props.getContact(contactId, contact => this.contactModal.show(contact));
    }

    showDebugModal = e => {
        e.preventDefault();
        this.debugModal.show();
    }

    logout = (e) => {
        e.preventDefault();
        this.props.logout();
    }

    render() {
        const isDebug = this.props.system && this.props.system.isDebug,
            isDeveloper = this.props.system?.user?.permissions?.length && this.props.system.user.permissions.some(permission => permission == 'developer:login' || permission == 'developer:switched');

        const user = this.props.system && this.props.system.user;

        const isTtLienHeBeta = false;

        return [
            <header key={0} className='app-header'>
                <Link className='app-header__logo' to='/user'>HCMUSSH</Link>
                <a className='app-sidebar__toggle' href='#' data-toggle='sidebar' aria-label='Hide Sidebar' />
                <a className='app-sidebar__fullscreen' href='#' onClick={e => e.preventDefault() || this.toggleFullScreen()} />
                <ul className='app-nav'>
                    <li className='app-search col-md-4' style={{ display: 'none' }}>
                        <input ref={e => this.searchBox = e} className='app-search__input col-md-12' type='search' placeholder='Tìm kiếm' onKeyUp={e => e.keyCode == 13 && this.search(e)} />
                        <button className='app-search__button' onClick={this.search}><i className='fa fa-search' /></button>
                    </li>
                    <li ref={e => this.advancedSearch = e} style={{ display: 'none' }} onClick={this.onAdvanceSearch}>
                        <a className='app-nav__item' href='#'>
                            <i className='fa fa-search-plus fa-lg' />
                        </a>
                    </li>
                    <ExecuteTaskItem />
                    {
                        (!isTtLienHeBeta || (user && (user.permissions.includes('fwQuestionAnswer:userTest') || user.permissions.includes('fwQuestionAnswer:staffTest')))) && <SectionContact />
                    }
                    <SectionNotification />
                    <li >
                        {isDeveloper || isDebug ? <a href='#' className='app-nav__item' style={{ color: 'white' }} onClick={this.showDebugModal}>
                            <i className='fa fa-code fa-lg' />
                        </a> : <Link className='app-nav__item' to='/user'>
                            <i className='fa fa-user fa-lg' />
                        </Link>}
                    </li>
                    <li>
                        <a className='app-nav__item' href='#' onClick={this.logout}>
                            <i className='fa fa-power-off fa-lg' style={{ color: 'red' }} />
                        </a>
                    </li>
                </ul>
            </header>,
            <AdminContactModal key={1} ref={e => this.contactModal = e} />,
            <DebugModal key={2} ref={e => this.debugModal = e} switchUser={this.props.switchUser} updateSystemState={this.props.updateSystemState} />
        ];
    }
}

const mapStateToProps = state => ({ system: state.system, role: state.role });
const mapActionsToProps = { changeRole, updateSystemState, switchUser, logout, getContact, addNotification };
export default connect(mapStateToProps, mapActionsToProps)(AdminHeader);
