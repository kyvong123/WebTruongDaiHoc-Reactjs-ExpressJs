module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.truyenThong,
        menus: { 5090: { title: 'Menu', link: '/user/menu', groupIndex: 0, icon: 'fa-bars', backgroundColor: '#00b0ff' } }
    };
    app.permission.add(
        { name: 'menu:read', },
        { name: 'menu:write', },
        { name: 'menu:delete', },
        { name: 'menu:manage', menu }
    );

    app.get('/user/menu/edit/:id', app.permission.check('system:settings'), app.templates.admin);
    app.get('/user/menu', app.permission.check('system:settings'), app.templates.admin);
    app.get('/user/menu/:divisionId', app.permission.check('menu:read'), app.templates.admin);
    app.get('/user/menu/edit/:divisionId/:id', app.permission.check('menu:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.buildAppMenus = async () => { // Get đệ quy menu theo array của parentMenus, mỗi parentMenu có array của subMenus
        let menuTree = await app.model.fwHomeMenu.getMenuTree();
        if (menuTree == null) menuTree = [];
        const menus = {}, divisionMenus = {}; // 2 loại menu: Menu chung và menu cho đơn vị, menu đơn vị có maDonVi != '00'

        // Mapper link của từng menu, kể cả subMenus vào trong 2 danh sách menu kể trên
        while (menuTree.length) {
            const item = menuTree.shift(); // Lấy phần tử menuTree[0] ra khỏi menuTree
            if (item.maDonVi == '00') { // Nếu mã đơn vị == '00' nghĩa là không có đơn vị => Menu chung
                if (item.submenus && item.submenus.length) menuTree.push(...item.submenus);
                if (item.link != '#') {
                    menus[item.link] = app.clone(item, { submenus: null });
                }
            } else { // Ngược lại, mã đơn vị != '00' => Menu của đơn vị
                if (item.submenus && item.submenus.length) menuTree.push(...item.submenus);
                if (item.link != '#') {
                    divisionMenus[item.link] = app.clone(item, { submenus: null });
                }
            }
        }

        // Lưu vào trong redis
        app.database.redis.set(app.database.redis.menusKey, JSON.stringify(menus));
        app.database.redis.set(app.database.redis.divisionMenusKey, JSON.stringify(divisionMenus));
    };

    // Hook readyHooks ------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('readyMenu', {
        ready: () => app.database.redis && app.database.oracle.connected && app.database.oracle.buildCondition,
        run: () => {
            app.database.redis.menusKey = 'hcmussh_menus'; // TODO: sửa sau
            app.database.redis.divisionMenusKey = 'hcmussh_divisionMenus'; // TODO: sửa sau

            app.primaryWorker && app.model.fwHomeMenu.get({ link: '/' }, (error, menu) => {
                if (error) {
                    console.error('Get menu by link has errors!');
                } else if (menu == null) {
                    app.model.fwHomeMenu.createDefault(null, 'Home', '/', 1, '00', '', () => app.buildAppMenus());
                } else {
                    app.buildAppMenus();
                }
            });
        }
    });

    app.readyHooks.add('readyDivisionMenu', {
        ready: () => app.database.redis && app.database.oracle.connected && app.database.oracle.buildCondition,
        run: () => app.primaryWorker && app.model.dvWebsite.getAll((err, dvWebsites) => {
            if (err) {
                console.error('Get unit website has errors!');
            } else if (dvWebsites) {
                const handleCreateDefault = (index = 0) => {
                    if (index < dvWebsites.length) {
                        let dvWebsite = dvWebsites[index];
                        app.model.fwHomeMenu.get({ link: '/' + dvWebsite.shortname }, (error, menu) => {
                            if (error) {
                                console.error('Get menu by link has errors!');
                            } else if (menu == null) {
                                app.model.fwHomeMenu.createDefault(null, dvWebsite.shortname + ' home', '/' + dvWebsite.shortname, 1, dvWebsite.maDonVi, dvWebsite.shortname, () => {
                                    handleCreateDefault(index + 1);
                                });
                            } else {
                                handleCreateDefault(index + 1);
                            }
                        });
                    } else {
                        app.buildAppMenus();
                    }
                };
                handleCreateDefault();
            }
        }),
    });


    app.get('/api/menu/all', app.permission.check('menu:read'), async (req, res) => {
        try {
            const menuTree = await app.model.fwHomeMenu.getDivisionMenuTree('00', '');
            res.send({ items: menuTree });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/menu/item/:id', app.permission.check('menu:read'), (req, res) => {
        app.model.fwHomeMenu.get({ id: req.params.id }, (error, menu) => {
            if (error || menu == null) {
                res.send({ error: 'Lỗi khi lấy menu!' });
            } else {
                const menuComponentIds = [],
                    menuComponents = [];
                const getComponent = (level, index, componentIds, components, done) => {
                    if (index < componentIds.length) {
                        app.model.fwHomeComponent.get({ id: componentIds[index] }, (error, component) => {
                            if (error || component == null) {
                                res.send({ error: 'Lỗi khi lấy thành phần trang!' });
                            } else {
                                component = app.clone(component);
                                component.components = [];
                                components.push(component);

                                const getNextComponent = (viewName) => {
                                    component.viewName = viewName;
                                    if (component.componentIds) {
                                        const childComponentIds = component.componentIds.split(',').map(id => Number(id));
                                        getComponent(level + 1, 0, childComponentIds, component.components, () => {
                                            getComponent(level, index + 1, componentIds, components, done);
                                        });
                                    } else {
                                        getComponent(level, index + 1, componentIds, components, done);
                                    }
                                };
                                if (component.viewType && component.viewId) {
                                    let viewType = component.viewType;
                                    if (component.viewId && (['carousel', 'news', 'event', 'feature', 'video', 'gallery', 'content', 'all news', 'all divisions'].indexOf(viewType) != -1)) {
                                        if (viewType === 'carousel' || viewType === 'gallery') {
                                            viewType = 'fwHomeCarousel';
                                        } else if (viewType === 'video') {
                                            viewType = 'fwHomeVideo';
                                        } else if (viewType === 'feature') {
                                            viewType = 'fwHomeFeature';
                                        } else if (viewType === 'content') {
                                            viewType = 'fwHomeContent';
                                        } else if (viewType == 'all news') {
                                            viewType = 'fwCategory';
                                        } else if (viewType == 'all divisions') {
                                            viewType = 'dmLoaiDonVi';
                                        } else {
                                            viewType = 'fw' + viewType[0].toUpperCase() + viewType.substring(1);
                                        }
                                        app.model[viewType].get({ id: component.viewId }, (error, item) => getNextComponent(item ? item.title : '<empty>'));
                                    } else if (viewType == 'all companies') {
                                        app.model.dmLoaiDoanhNghiep.get({ id: component.viewId }, (error, item) => getNextComponent(item ? item.ten : '<empty>'));
                                    } else if (['all events', 'all jobs', 'last news', 'last events', 'all events', 'hot events', 'last jobs', 'jobs carousel', 'subscribe', 'all staffs', 'contact'].indexOf(viewType) != -1) {
                                        getNextComponent(viewType);
                                    } else {
                                        getNextComponent('<empty>');
                                    }
                                } else {
                                    getNextComponent('<empty>');
                                }
                            }
                        });
                    } else {
                        done();
                    }
                };

                const getAllComponents = () => {
                    menuComponentIds.push(menu.componentId);
                    getComponent(0, 0, menuComponentIds, menuComponents, () => {
                        menu = app.clone(menu);
                        const newComponents = menuComponents[0].components.sort((a, b) => a.priority - b.priority);
                        menu.component = Object.assign(menuComponents[0], { components: newComponents });
                        res.send({ menu });
                    });
                };

                if (menu.componentId == null || menu.componentId == undefined) {
                    app.model.fwHomeComponent.createNew('container', '', '<empty>', null, '', (error, result) => {
                        if (error == null && result && result.outBinds && result.outBinds.ret != null) {
                            menu.componentId = result.outBinds.ret;
                            app.model.fwHomeMenu.update({ id: menu.id }, { componentId: menu.componentId }, (error) => {
                                if (error) {
                                    res.send({ error: 'Tạo danh mục bị lỗi!' });
                                } else {
                                    getAllComponents();
                                }
                            });
                        } else {
                            res.send({ error: 'Tạo danh mục bị lỗi!' });
                        }
                    });
                } else {
                    getAllComponents();
                }
            }
        });
    });

    app.post('/api/menu', app.permission.check('menu:write'), (req, res) => {
        const parentId = req.body.id ? req.body.id : null,
            maDonVi = req.body.maDonVi ? req.body.maDonVi : '00',
            maWebsite = req.body.maWebsite ? req.body.maWebsite : '';
        app.model.fwHomeMenu.createDefault(parentId, 'Menu', '#', 0, maDonVi, maWebsite, (error, result) => {
            if (error == null && result && result.outBinds && result.outBinds.ret != null) {
                app.model.fwHomeMenu.get({ id: result.outBinds.ret }, (error, item) => {
                    if (error == null) app.buildAppMenus();
                    res.send({ error, item });
                });
            } else {
                res.send({ error: 'Tạo menu bị lỗi!' });
            }
        });
    });

    app.post('/api/menu/build', app.permission.check('menu:write'), (req, res) => { //TODO: delete
        app.buildAppMenus();
        res.send('OK');
    });

    app.put('/api/menu', app.permission.check('menu:write'), (req, res) => {
        app.model.fwHomeMenu.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.put('/api/menu/priorities', app.permission.check('menu:write'), (req, res) => {
        let error = null;
        const changes = req.body.changes,
            solve = (index) => {
                if (index < changes.length) {
                    const item = changes[index];
                    if (item) {
                        app.model.fwHomeMenu.update({ id: item.id }, { priority: item.priority }, err => {
                            if (err) error = err;
                            solve(index + 1);
                        });
                    }
                } else {
                    app.buildAppMenus();
                    res.send({ error });
                }
            };
        solve(0);
    });

    app.delete('/api/menu', app.permission.check('menu:write'), (req, res) => {
        app.model.fwHomeMenu.get({ id: req.body.id }, (error, item) => {
            if (error || item == null) {
                res.send({ error: 'Id không hợp lệ!' });
            } else {
                const componentId = Number(item.componentId);
                if (!isNaN(componentId)) app.model.fwHomeComponent.deleteComponent(componentId);
                app.model.fwHomeMenu.delete({ id: item.id }, error => {
                    if (!error) app.buildAppMenus();
                    res.send({ error });
                });
            }
        });
    });

    app.put('/api/menu/build', app.permission.check('component:write'), (req, res) => {
        app.buildAppMenus();
        res.send('OK');
    });

    app.get('/api/dvWebsite/menu/:maDonVi', app.permission.check('menu:read'), async (req, res) => {
        try {
            const maDonVi = req.params.maDonVi, maWebsite = req.query.maWebsite;
            const menuTree = await app.model.fwHomeMenu.getDivisionMenuTree(maDonVi, maWebsite);
            res.send({ items: menuTree });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/home/dvWebsite/menu/:maDonVi', async (req, res) => {
        try {
            const maDonVi = req.params.maDonVi, maWebsite = req.query.maWebsite;
            const menuTree = await app.model.fwHomeMenu.homeGetDivisionMenuTree(maDonVi, maWebsite);
            res.send({ items: menuTree });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/home/menu', async (req, res) => {
        try {
            const { maDonVi, link, language } = req.query;
            let condition = {}, menu = null;
            if (language && maDonVi) { // route from news page
                if (language == 'en') {
                    const enMenu = await app.model.fwHomeMenu.get({
                        statement: 'maWebsite LIKE :maWebsite AND maDonVi = :maDonVi AND active = :active',
                        parameter: { maWebsite: `%${maDonVi == '00' ? 'en' : '/en'}%`, maDonVi, active: 1 }
                    });
                    if (enMenu) return res.send({ menu: enMenu });
                }
                condition = { maDonVi, active: 1 };
            } else {
                condition = { link };
            }

            menu = await app.model.fwHomeMenu.get(condition);
            res.send({ menu });
        } catch (error) {
            res.send({ error });
        }
    });

};