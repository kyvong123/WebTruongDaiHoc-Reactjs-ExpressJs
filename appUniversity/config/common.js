module.exports = (app, appConfig) => {
    app.adminRole = {};
    app.clone = function () {
        const length = arguments.length;
        let result = null;
        if (length && Array.isArray(arguments[0])) {
            result = [];
            for (let i = 0; i < length; i++) {
                result = result.concat(arguments[i]);
            }
        } else if (length && typeof arguments[0] == 'object') {
            result = {};
            for (let i = 0; i < length; i++) {
                const obj = JSON.parse(JSON.stringify(arguments[i]));
                Object.keys(obj).forEach(key => result[key] = obj[key]);
            }
        }
        return result;
    };

    // Template html file ---------------------------------------------------------------------------------------------------------------------------
    const devModule = require('../asset/devModule.json');
    const devModuleSelfDefine = require('../asset/devModule.selfDefine.json');
    const finalModule = app.isDebug ? Object.assign({}, devModule, devModuleSelfDefine) : devModule;

    const prefixMapper = {}, prefixes = [];
    Object.entries(finalModule).forEach(([moduleName, moduleSetting]) => {
        prefixMapper[moduleSetting.prefix] = { ...moduleSetting, moduleName };
        prefixes.push(moduleSetting.prefix);
    });
    app.templates = {};
    app.createTemplate = function () {
        for (let i = 0; i < arguments.length; i++) {
            const templateName = arguments[i],
                path = `/${templateName}.template`;
            app.templates[templateName] = (req, res) => {
                const today = new Date().yyyymmdd();
                if (req.session.today != today) {
                    app.database.redis.incr('hcmussh_state:todayViews'); // TODO: Sửa sau
                    app.database.redis.incr('hcmussh_state:allViews'); // TODO: Sửa sau
                    req.session.today = today;
                }

                if (templateName == 'admin' && req.session.user?.staff?.maDonVi == '68') {
                    if (!req.session.user?.lastVpdtVisit || Date.now() - req.session.user.lastVpdtVisit > (3600 * 5 * 1000)) {
                        req.session.user.lastVpdtVisit = Date.now();
                        req.session.save();
                        res.redirect('/user/van-phong-dien-tu/van-ban/cho-xu-ly');
                        return;
                    }
                }

                const prefix = prefixes.find(item => req.path.startsWith(item));

                if (app.isDebug) {
                    if (prefix) {
                        const prefixSetting = prefixMapper[prefix];
                        if (!prefixSetting.debug) {
                            const modulePath = `/${templateName}.${prefixSetting.moduleName}.template`;
                            app.fs.readFile(app.publicPath + modulePath, 'utf8', (error, data) => res.send(data));
                            return;
                        }
                    }

                    const http = require('http');
                    http.get(`http://localhost:${(app.port + 1) + path}`, response => {
                        let data = '';
                        response.on('data', chunk => data += chunk);
                        response.on('end', () => res.send(data));
                    });
                } else {
                    if (prefix) {
                        const prefixSetting = prefixMapper[prefix];
                        const modulePath = `/${templateName}.${prefixSetting.moduleName}.template`;
                        app.fs.readFile(app.publicPath + modulePath, 'utf8', (error, data) => res.send(data));
                        return;
                    }

                    app.fs.readFile(app.publicPath + path, 'utf8', (_, data) => res.send(data));
                }
            };
        }
    };

    // Parent menu ----------------------------------------------------------------------------------------------------------------------------------
    app.parentMenu = {
        dashboard: {
            index: 100, title: 'Dashboard', link: '/user/dashboard', icon: 'fa-dashboard',
            subMenusRender: false,
        },
        setting: {
            index: 2000, title: 'Cấu hình', link: '/user/settings', icon: 'fa-cog',
            subMenusRender: false
        },
        user: {
            index: 1000, title: 'Trang cá nhân', link: '/user', icon: 'fa-user',
            subMenusRender: false, groups: ['Thông tin cá nhân', 'Công tác', 'Khen thưởng - kỷ luật', 'Nghỉ', 'Chuyên môn', 'Văn phòng điện tử', 'Đánh giá', 'Quản lý khoa học']
        },
        tccb: {
            index: 3000, title: 'Tổ chức cán bộ', link: '/user/tccb', icon: 'fa-pie-chart',
            subMenusRender: false, groups: ['Cán bộ', 'Công tác', 'Hợp đồng', 'Khen thưởng - Kỷ luật', 'Nghỉ', 'Chuyên môn', 'Đánh giá', 'Quản lý khoa học']
        },
        finance: {
            index: 5000, title: 'Kế hoạch - Tài chính', link: '/user/finance', icon: 'fa-credit-card',
            subMenusRender: false, groups: ['Cấu hình', 'Thống kê', 'Chức năng', 'Quản lý thuế TNCN']
        },
        khcn: {
            index: 9500, title: 'Khoa học công nghệ', link: '/user/khcn', icon: 'fa-rocket ',
            subMenusRender: false
        },
        library: {
            index: 8000, title: 'Thư viện', link: '/user/library', icon: 'fa-th-large',
            subMenusRender: false
        },
        students: {
            index: 6100, title: 'Công tác sinh viên', link: '/user/ctsv', icon: 'fa-users', groups: ['Nhập học', 'Biểu mẫu - quyết định', 'Quản lý sinh viên', 'Từ điển dữ liệu'], subMenusRender: false
        },
        hocPhi: {
            index: 6200, title: 'Học phí', link: '/user/hoc-phi', icon: 'fa-credit-card',
            subMenusRender: false
        },
        svBaoHiemYte: {
            index: 6300, title: 'Bảo hiểm Y Tế', link: '/user/quan-ly-bhyt', icon: 'fa-medkit',
            subMenusRender: false
        },
        daoTao: {
            index: 7000, title: 'Đào tạo', link: '/user/dao-tao', icon: 'fa-diamond',
            subMenusRender: false, groups: ['NGÀNH - CHUYÊN NGÀNH', 'CÔNG TÁC ĐÀO TẠO', 'DANH MỤC', 'THÙ LAO GIẢNG DẠY']
        },
        sdh: {
            index: 7500, title: 'Sau đại học', link: '/user/sau-dai-hoc', icon: 'fa-graduation-cap ',
            subMenusRender: false, groups: ['NGÀNH', 'CÔNG TÁC', 'DANH MỤC', 'SINH VIÊN', 'QUẢN LÝ ĐIỂM']
        },
        category: {
            index: 4000, title: 'Danh mục', link: '/user/category', icon: 'fa-list-alt',
            subMenusRender: false,
        },
        truyenThong: {
            index: 6000, title: 'Truyền thông', link: '/user/truyen-thong', icon: 'fa-comments-o',
            subMenusRender: false,
            groups: ['Cấu hình', 'Bài viết', 'ENews', 'Sự kiện', 'Tuyển sinh', 'Doanh nghiệp', 'SMS']
        },
        websiteDv: {
            index: 1900, title: 'Website đơn vị', link: '/user/website', icon: 'fa-database',
            subMenusRender: false,
        },
        vpdt: {
            index: 400, title: 'Văn phòng điện tử', link: '/user/van-phong-dien-tu', icon: 'fa-desktop',
            countUrl: '/api/hcth/count',
            subMenusRender: false, groups: ['Văn bản', 'Nhiệm vụ', 'Hệ thống trạng thái', 'Chứng thư số']
        },
        hcth: {
            index: 500, title: 'Hành chính tổng hợp', link: '/user/hcth', icon: 'fa-book',
            subMenusRender: false, groups: ['Văn bản', 'Nhiệm vụ', 'Hệ thống trạng thái', 'Chứng thư số']
        },
        hocTap: {
            index: 7700, title: 'Học tập', link: '/user/hoc-tap', icon: 'fa-file-text-o', subMenusRender: true,
        },
        giangVien: {
            index: 7600, title: 'Công tác giảng dạy', link: '/user/affair', icon: 'fa-bookmark',
            subMenusRender: false
        },
        congTacSinhVien: {
            index: 7800, title: 'Công tác sinh viên', link: '/user/cong-tac-sinh-vien', icon: 'fa-graduation-cap',
            subMenusRender: true
        },
        baoHiemYTe: {
            index: 7900, title: 'Bảo hiểm Y Tế', link: '/user/bao-hiem-y-te', icon: 'fa-medkit',
            subMenusRender: false
        },
        thongTinThiSinh: {
            index: 8100, title: 'Thông tin thí sinh', link: '/user/sdh/ts/thi-sinh/thong-tin', icon: 'fa fa-book',
            subMenusRender: true
        },
        lienHe: {
            index: 4500, title: 'Liên hệ', link: '/user/tt/lien-he', icon: 'fa-dashboard',
            subMenusRender: false, groups: ['Q&A', 'Blackbox', 'Admin Blackbox']
        },
        tmdt: {
            index: 10000, title: 'Y-Shop', link: '/user/tmdt/y-shop', icon: 'fa-shopping-bag',
            subMenusRender: false, groups: ['Quản lý hệ thống', 'Đại lý', 'Từ điển dữ liệu']
        },
        // chatbox: {
        //     index: 11000, title: 'Chatbox', link: '/user/tt/chatbox', icon: 'fa-comments', subMenusRender: false
        // }
    };

    // Load modules ---------------------------------------------------------------------------------------------------------------------------------
    app.loadModules = (loadController = true) => {
        const modulePaths = app.fs.readdirSync(app.modulesPath, { withFileTypes: true }).filter(item => item.isDirectory()).map(item => app.modulesPath + '/' + item.name),
            modelPaths = [],
            controllerPaths = [],
            requireFolder = (loadPath) => app.fs.readdirSync(loadPath).forEach((filename) => {
                const filepath = app.path.join(loadPath, filename);
                if (app.fs.existsSync(filepath) && app.fs.statSync(filepath).isFile() && filepath.endsWith('.js')) {
                    require(filepath)(app);
                }
            });

        modulePaths.forEach(modulePath => {
            app.fs.readdirSync(modulePath).forEach(dirName => {
                const modelFilePath = app.path.join(modulePath, dirName, 'model.js'),
                    controllerFilePath = app.path.join(modulePath, dirName, 'controller.js'),
                    modelFolderPath = app.path.join(modulePath, dirName, 'model'),
                    controllerFolderPath = app.path.join(modulePath, dirName, 'controller');

                if (app.fs.existsSync(modelFilePath) && app.fs.statSync(modelFilePath).isFile())
                    modelPaths.push(modelFilePath);
                if (loadController && app.fs.existsSync(controllerFilePath) && app.fs.statSync(controllerFilePath).isFile())
                    controllerPaths.push(controllerFilePath);

                if (app.fs.existsSync(modelFolderPath) && app.fs.statSync(modelFolderPath).isDirectory())
                    requireFolder(modelFolderPath);
                if (loadController && controllerFolderPath && app.fs.existsSync(controllerFolderPath) && app.fs.statSync(controllerFolderPath).isDirectory())
                    requireFolder(controllerFolderPath);
            });
        });
        modelPaths.forEach(path => require(path)(app));
        if (loadController) controllerPaths.forEach(path => require(path)(app, appConfig));
    };

    // Load services --------------------------------------------------------------------------------------------------
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    const axios = require('axios'),
        axiosRequest = async (type, url, data, requestConfig) => {
            try {
                let response = null;
                if (!data) data = {};
                if (!requestConfig) requestConfig = {};
                requestConfig.httpsAgent = new require('https').Agent({ rejectUnauthorized: false });
                requestConfig.rejectUnauthorized = false;

                if (type == 'get') {
                    const params = new URLSearchParams(data).toString();
                    if (params.length) url = url + (url.includes('?') ? '&' : '?') + params;
                    response = await axios.get(url, requestConfig);
                } else if (type == 'delete') {
                    response = await axios.delete(url, { data }, requestConfig);
                } else {
                    response = await axios[type](url, data, requestConfig);
                }

                return response ? response.data : null;
            } catch (error) {
                console.error(` - #${process.pid}: app.service.main => axiosRequest: ${url}`);
                return { error };
            }
        };
    app.service = {
        url: (url, serviceConfig) => {
            if (!app.isDebug) {
                return `${serviceConfig.isHttps ? 'https' : 'http'}://${serviceConfig.host}${serviceConfig.port ? ':' + serviceConfig.port : ''}` + url + '?t=' + new Date().getTime();
            } else if (serviceConfig.isDebug) {
                return `http://localhost:${serviceConfig.port}` + url + '?t=' + new Date().getTime();
            } else {
                return `http://localhost:${app.port}` + url + '?t=' + new Date().getTime();
            }
        },

        clusterGetAll: async (serviceName, done) => {
            const serviceConfig = appConfig.services[serviceName],
                url = app.service.url(`/api/cluster/service/${serviceName}`, serviceConfig),
                response = await app.service.get(url);
            done && done(response);
            return response;
        },
        clusterCreate: async (serviceName, done) => {
            const serviceConfig = appConfig.services[serviceName],
                url = app.service.url(`/api/cluster/service/${serviceName}`, serviceConfig),
                response = await app.service.post(url);
            done && done(response);
            return response;
        },
        clusterReset: async (serviceName, id, done) => {
            const serviceConfig = appConfig.services[serviceName],
                url = app.service.url(`/api/cluster/service/${serviceName}`, serviceConfig),
                response = await app.service.put(url, { id });
            done && done(response);
            return response;
        },
        clusterDelete: async (serviceName, id, done) => {
            const serviceConfig = appConfig.services[serviceName],
                url = app.service.url(`/api/cluster/service/${serviceName}`, serviceConfig),
                response = await app.service.delete(url, { id });
            done && done(response);
            return response;
        },
    };
    ['get', 'post', 'put', 'delete'].forEach(type => app.service[type] = async (url, data, requestConfig) => await axiosRequest(type, url, data, requestConfig));
    if (app.isDebug) {
        app.service.main = {};
        ['get', 'post', 'put', 'delete'].forEach(type => app.service.main[type] = async (url, data, requestConfig) => await axiosRequest(type, `http://localhost:${appConfig.port}${url}`, data, requestConfig));
    }

    app.loadServices = () => {
        app.fs.existsSync(app.servicesPath) && app.fs.readdirSync(app.servicesPath, { withFileTypes: true }).forEach(serviceDirectory => {
            if (serviceDirectory.isDirectory() && serviceDirectory.name != 'config') {
                const serviceConfig = appConfig.services[serviceDirectory.name] || {};
                serviceConfig.name = serviceDirectory.name;
                if (!serviceConfig.isDebug) serviceConfig.isDebug = false;

                const mainPath = app.path.join(app.servicesPath, serviceDirectory.name, 'main.js');
                const servicePath = app.path.join(app.servicesPath, serviceDirectory.name, 'service.js');
                if (app.fs.existsSync(mainPath)) {
                    if (app.isDebug) {
                        serviceConfig.db = appConfig.db;
                        if (serviceConfig.isDebug) {
                            console.log(` - Debug service ${serviceConfig.name} on ${serviceConfig.host ? 'http://' + serviceConfig.host + ':' + serviceConfig.port : 'Service app!'}`);
                        } else {
                            console.log(` - Debug service ${serviceConfig.name} on Main app!`);
                            if (app.fs.existsSync(servicePath)) require(servicePath)(app, serviceConfig);
                        }
                    }
                    app.fs.existsSync(mainPath) && require(mainPath)(app, serviceConfig);
                }
            }
        });
    };

    app.isDebug && process.on('SIGINT', function () {
        console.log('\nGracefully shutting down from SIGINT (Ctrl-C)');
        // some other closing procedures go here
        // nodemon.emit('quit');
        process.exit(0);
    });
};
