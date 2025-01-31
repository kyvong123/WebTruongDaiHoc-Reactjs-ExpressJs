import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Img } from 'view/component/HomePage';

class AdminMenu extends React.Component {
    hasInit = false;
    hasReady = false;
    setMenu = () => {
        // Activate sidebar treeview toggle
        $('[data-toggle=\'treeview\']').click(function (event) {
            if (!$(this).parent().hasClass('is-expanded')) {
                $('.app-menu').find('[data-toggle=\'treeview\']').parent().removeClass('is-expanded');
            }
            $(this).parent().toggleClass('is-expanded');
            event.preventDefault();
        });
        // Set initial active toggle
        $('[data-toggle=\'treeview.\'].is-expanded').parent().toggleClass('is-expanded');

        // Toggle Sidebar
        $('[data-toggle=\'sidebar\']').click(function (event) {
            $('.app').toggleClass('sidenav-toggled');
            event.preventDefault();
        });
    }

    componentDidMount() {
        $(document).ready(() => {
            this.hasReady = true;
            let { user = null } = this.props.system ? this.props.system : {};
            if (user && !this.hasInit) {
                this.hasInit = true;
                this.setMenu();
            }
        });
    }

    componentDidUpdate(prevProps) {
        if (!this.hasInit) {
            let prevUser = prevProps.system && prevProps.system.user || null;
            let user = this.props.system && this.props.system.user || null;
            if (prevUser) prevUser = JSON.stringify(prevUser);
            if (user) user = JSON.stringify(user);
            if (prevUser != user && this.hasReady) {
                this.hasInit = true;
                this.setMenu();
            }
        } else {
            // Sau khi menu sidebar được render nhưng cần render lại khi update session;
            let prevUser = prevProps.system && prevProps.system.user || null;
            let user = this.props.system && this.props.system.user || null;
            if (user && user.isThiSinhSdh) {
                // Update memu cho tuyển sinh sau đại học
                prevUser && delete prevUser.expiration;
                user && delete user.expiration;
                if (prevUser) prevUser = JSON.stringify(prevUser);
                if (user) user = JSON.stringify(user);
                if (prevUser != user) {
                    this.setMenu();
                }
            }

        }
    }

    render() {
        let { user } = this.props.system ? this.props.system : {};
        if (user == null) user = { firstname: 'firstname', lastname: 'lastname', role: '', isStaff: false, isStudent: false };
        if (user.image == null) user.image = '/img/avatar.png';

        const menus = [];
        if (user.menu) {
            Object.keys(user.menu).sort().forEach(menuIndex => {
                const userMenuItem = user.menu[menuIndex],
                    parentMenu = userMenuItem.parentMenu;
                if (parentMenu) {
                    const submenuIndexes = userMenuItem.menus ? Object.keys(userMenuItem.menus).sort() : [];
                    if (parentMenu.subMenusRender && submenuIndexes.length) {
                        menus.push(
                            <li key={menus.length} className='treeview'>
                                <a className='app-menu__item' href='#' data-toggle='treeview'>
                                    <i className={'app-menu__icon fa ' + parentMenu.icon} />
                                    <span className='app-menu__label'>{parentMenu.title}</span>
                                    <i className='treeview-indicator fa fa-angle-right' />
                                </a>
                                <ul className='treeview-menu'>
                                    {submenuIndexes.map((menuIndex, key) => (
                                        <li key={key}>
                                            <Link className='treeview-item' to={userMenuItem.menus[menuIndex].link}>
                                                <i className='icon fa fa-circle-o' />{userMenuItem.menus[menuIndex].title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        );
                    } else {
                        menus.push(
                            <li key={menus.length}>
                                <Link className='app-menu__item' to={parentMenu.link}>
                                    <i className={'app-menu__icon fa ' + parentMenu.icon} />
                                    <span className='app-menu__label'>{parentMenu.title}</span>
                                </Link>
                            </li>
                        );
                    }
                }
            });
        }

        let firstname = '', lastname = '';
        firstname = user.firstName || '';
        lastname = user.lastName || '';

        return [
            <div key={1} className='app-sidebar__overlay' data-toggle='sidebar' />,
            <aside key={2} className='app-sidebar'>
                <Link to='/user' style={{ textDecoration: 'none' }}>
                    <div className='app-sidebar__user'>
                        <Img className='app-sidebar__user-avatar' src={user.image} alt='Avatar' />
                        <p className='app-sidebar__user-name' style={{ marginBottom: 0 }}>{lastname + ' ' + firstname}</p>
                    </div>
                    <p className='app-sidebar__user-designation'>{user.email}</p>
                </Link>
                <ul className='app-menu'>
                    {menus}
                </ul>
            </aside>
        ];
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(AdminMenu);