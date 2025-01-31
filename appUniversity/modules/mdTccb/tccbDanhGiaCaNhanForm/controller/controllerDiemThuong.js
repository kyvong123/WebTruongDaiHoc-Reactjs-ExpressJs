module.exports = app => {
    //Trưởng đơn vị
    app.post('/api/tccb/danh-gia-ca-nhan-diem-thuong-hoi-dong-don-vi', app.permission.check('manager:login'), async (req, res) => {
        try {
            const item = req.body.item;
            item.tuDangKy = 1;
            item.duyet = 0;
            const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam: item.nam });
            if (danhGiaNam) {
                const currentDate = new Date().getTime();
                const isUpdate = !danhGiaNam.donViBatDauDanhGia || currentDate < danhGiaNam.donViBatDauDanhGia;
                if (isUpdate) {
                    const result = await app.model.tccbDanhGiaCaNhanDiemThuong.create(item);
                    res.send({ item: result });
                } else {
                    throw 'Không nằm trong thời gian cập nhật điểm thưởng!';
                }
            } else {
                throw 'Dữ liệu không hợp lệ!';
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/danh-gia-ca-nhan-diem-thuong-hoi-dong-don-vi', app.permission.check('manager:login'), async (req, res) => {
        try {
            const id = req.body.id, changes = req.body.changes;
            const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam: changes.nam });
            delete changes.nam;
            delete changes.maDiemThuong;
            delete changes.nam;
            delete changes.tuDangKy;
            delete changes.duyet;
            if (danhGiaNam) {
                const currentDate = new Date().getTime();
                const isUpdate = !danhGiaNam.donViBatDauDanhGia || currentDate < danhGiaNam.donViBatDauDanhGia;
                if (isUpdate) {
                    let item = await app.model.tccbDanhGiaCaNhanDiemThuong.get({ id });
                    if (!item || item.tuDangKy == 0 || item.duyet == 1) {
                        throw 'Bạn không thể chỉnh sửa mục điểm thưởng này!';
                    }
                    item = await app.model.tccbDanhGiaCaNhanDiemThuong.update({ id }, changes);
                    res.send({ item });
                } else {
                    throw 'Không nằm trong thời gian cập nhật điểm thưởng!';
                }
            } else {
                throw 'Dữ liệu không hợp lệ!';
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/tccb/danh-gia-ca-nhan-diem-thuong-hoi-dong-don-vi', app.permission.check('manager:login'), async (req, res) => {
        try {
            const id = req.body.id;
            const item = await app.model.tccbDanhGiaCaNhanDiemThuong.get({ id });
            if (item) {
                if (item.tuDangKy == 0) {
                    throw 'Bạn không thể xóa mục điểm thưởng này!';
                }
                if (item.duyet == 1) {
                    throw 'Mục điểm thưởng này đã được duyệt!';
                }
                const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam: item.nam });
                if (danhGiaNam) {
                    const currentDate = new Date().getTime();
                    const isDelete = !danhGiaNam.donViBatDauDanhGia || currentDate < danhGiaNam.donViBatDauDanhGia;
                    if (isDelete) {
                        if (item.minhChung) {
                            app.fs.deleteFile(app.path.join(app.assetPath, 'tccbMinhChungDiemThuong', item.minhChung));
                        }
                        await app.model.tccbDanhGiaCaNhanDiemThuong.delete({ id: item.id });
                        res.end();
                    } else {
                        throw 'Không nằm trong thời gian cập nhật điểm thưởng!';
                    }
                } else {
                    throw 'Dữ liệu không hợp lệ!';
                }
            } else {
                throw 'Dữ liệu không hợp lệ!';
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/tccb/danh-gia-ca-nhan-diem-thuong-user', app.permission.check('staff:login'), async (req, res) => {
        try {
            const shcc = req.session.user.shcc;
            const item = req.body.item;
            item.shcc = shcc;
            item.tuDangKy = 1;
            item.duyet = 0;
            const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam: item.nam });
            if (danhGiaNam) {
                const currentDate = new Date().getTime();
                const isUpdate = !danhGiaNam.donViBatDauDanhGia || currentDate < danhGiaNam.donViBatDauDanhGia;
                if (isUpdate) {
                    const result = await app.model.tccbDanhGiaCaNhanDiemThuong.create(item);
                    res.send({ item: result });
                } else {
                    throw 'Không nằm trong thời gian cập nhật điểm thưởng!';
                }
            } else {
                throw 'Dữ liệu không hợp lệ!';
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/danh-gia-ca-nhan-diem-thuong-user', app.permission.check('staff:login'), async (req, res) => {
        try {
            const shcc = req.session.user.shcc;
            const id = req.body.id, changes = req.body.changes;
            const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam: changes.nam });
            delete changes.nam;
            delete changes.maDiemThuong;
            delete changes.nam;
            delete changes.tuDangKy;
            delete changes.duyet;
            if (danhGiaNam) {
                const currentDate = new Date().getTime();
                const isUpdate = !danhGiaNam.donViBatDauDanhGia || currentDate < danhGiaNam.donViBatDauDanhGia;
                if (isUpdate) {
                    let item = await app.model.tccbDanhGiaCaNhanDiemThuong.get({ id, shcc });
                    if (!item || item.tuDangKy == 0 || item.duyet == 1) {
                        throw 'Bạn không thể chỉnh sửa mục điểm thưởng này!';
                    }
                    item = await app.model.tccbDanhGiaCaNhanDiemThuong.update({ id, shcc }, changes);
                    res.send({ item });
                } else {
                    throw 'Không nằm trong thời gian cập nhật điểm thưởng!';
                }
            } else {
                throw 'Dữ liệu không hợp lệ!';
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/tccb/danh-gia-ca-nhan-diem-thuong-user', app.permission.check('staff:login'), async (req, res) => {
       try {
           const shcc = req.session.user.shcc;
           const item = await app.model.tccbDanhGiaCaNhanDiemThuong.get({ id: req.body.id, shcc });
           if (item) {
               if (item.tuDangKy == 0) {
                   throw 'Bạn không thể xóa mục điểm thưởng này!';
               }
               if (item.duyet == 1) {
                   throw 'Mục điểm thưởng này đã được duyệt!';
               }

               const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam: item.nam });
               if (danhGiaNam) {
                   const currentDate = new Date().getTime();
                   const isDelete = !danhGiaNam.donViBatDauDanhGia || currentDate < danhGiaNam.donViBatDauDanhGia;
                   if (isDelete) {
                       if (item.minhChung) {
                           app.fs.deleteFile(app.path.join(app.assetPath, 'tccbMinhChungDiemThuong', item.minhChung));
                       }
                       await app.model.tccbDanhGiaCaNhanDiemThuong.delete({ id: item.id });
                       res.end();
                   } else {
                       throw 'Không nằm trong thời gian cập nhật điểm thưởng!';
                   }
               } else {
                   throw 'Dữ liệu không hợp lệ!';
               }
           } else {
               throw 'Dữ liệu không hợp lệ!';
           }
       } catch (error) {
           res.send({ error });
       }
    });

    app.get('/api/tccb/danh-gia-ca-nhan-diem-thuong-minh-chung/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const item = await app.model.tccbDanhGiaCaNhanDiemThuong.get({ id: req.params.id });
            if (item && item.minhChung) {
                res.sendFile(app.path.join(app.assetPath, 'tccbMinhChungDiemThuong', item.minhChung));
            } else {
                res.send({ error: 'Dữ liệu không hợp lệ!' });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    // UploadHooks
    app.fs.createFolder(app.path.join(app.assetPath, 'tccbMinhChungDiemThuong'));
    const uploadMinhChung = async (condition, changes, srcPath, done) => {
        try {
            const item = await app.model.tccbDanhGiaCaNhanDiemThuong.get(condition);
            if (item) {
                if (item.minhChung) {
                    app.fs.deleteFile(app.path.join(app.assetPath, 'tccbMinhChungDiemThuong', item.minhChung));
                }
                app.fs.createFolder(app.path.join(app.assetPath, 'tccbMinhChungDiemThuong', item.shcc));
                const minhChung = `/${item.shcc}/${item.id}_${item.shcc}${app.path.extname(srcPath)}`;
                app.fs.renameSync(srcPath, app.path.join(app.assetPath, 'tccbMinhChungDiemThuong', minhChung));
                await app.model.tccbDanhGiaCaNhanDiemThuong.update(condition, { ...changes, minhChung });
                done && done({ minhChung });
            } else {
                done && done({ error: 'Dữ liệu không hợp lệ!' });
            }
        } catch (error) {
            done && done(error);
        }
    };
    app.uploadHooks.add('tccbUserUploadMinhChungDiemThuong', (req, fields, files, params, done) => {
        app.permission.has(req, async () => {
            if (fields.userData && fields.userData[0] && fields.userData[0].startsWith('TccbCaNhanMinhChung:') && files.TccbCaNhanMinhChung && files.TccbCaNhanMinhChung.length) {
                try {
                    let id = fields.userData[0].substring('TccbCaNhanMinhChung:'.length);
                    const changes = fields.data && fields.data[0] ? app.utils.parse(fields.data[0]) : {};
                    const srcPath = files.TccbCaNhanMinhChung[0].path;
                    if (id == 'new') {
                        const shcc = req.session.user.shcc;
                        changes.shcc = shcc;
                        changes.tuDangKy = 1;
                        changes.duyet = 0;
                        const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam: changes.nam });
                        if (danhGiaNam) {
                            const currentDate = new Date().getTime();
                            const isUpdate = !danhGiaNam.donViBatDauDanhGia || currentDate < danhGiaNam.donViBatDauDanhGia;
                            if (isUpdate) {
                                const item = await app.model.tccbDanhGiaCaNhanDiemThuong.create(changes);
                                await uploadMinhChung({ id: item.id }, {}, srcPath, done);
                            } else {
                                app.fs.deleteFile(srcPath);
                                return done({ error: 'Không nằm trong thời gian cập nhật điểm thưởng!' });
                            }
                        } else {
                            app.fs.deleteFile(srcPath);
                            return done({ error: 'Dữ liệu không hợp lệ!' });
                        }
                    } else {
                        const shcc = req.session.user.shcc;
                        const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam: changes.nam });
                        delete changes.nam;
                        delete changes.maDiemThuong;
                        delete changes.nam;
                        delete changes.tuDangKy;
                        delete changes.duyet;
                        if (danhGiaNam) {
                            const currentDate = new Date().getTime();
                            const isUpdate = !danhGiaNam.donViBatDauDanhGia || currentDate < danhGiaNam.donViBatDauDanhGia;
                            if (isUpdate) {
                                let item = await app.model.tccbDanhGiaCaNhanDiemThuong.get({ id, shcc });
                                if (!item || item.tuDangKy == 0 || item.duyet == 1) {
                                    app.fs.deleteFile(srcPath);
                                    return done({ error: 'Bạn không thể chỉnh sửa mục điểm thưởng này!' });
                                }
                                await uploadMinhChung({ id: item.id }, changes, srcPath, done);
                            } else {
                                app.fs.deleteFile(srcPath);
                                return done({ error: 'Không nằm trong thời gian cập nhật điểm thưởng!' });
                            }
                        } else {
                            app.fs.deleteFile(srcPath);
                            return done({ error: 'Dữ liệu không hợp lệ!' });
                        }
                    }
                } catch (error) {
                    console.error(error);
                    done({ error: 'Lỗi hệ thống!' });
                }
            }
        }, done, 'staff:login');
    });

    app.uploadHooks.add('tccbUploadMinhChungDiemThuong', (req, fields, files, params, done) => {
        app.permission.has(req, async () => {
            if (fields.userData && fields.userData[0] && fields.userData[0].startsWith('TccbCaNhanMinhChungByDonVi:') && files.TccbCaNhanMinhChungByDonVi && files.TccbCaNhanMinhChungByDonVi.length) {
                try {
                    let id = fields.userData[0].substring('TccbCaNhanMinhChungByDonVi:'.length);
                    const changes = fields.data && fields.data[0] ? app.utils.parse(fields.data[0]) : {};
                    const srcPath = files.TccbCaNhanMinhChungByDonVi[0].path;
                    if (id == 'new') {
                        changes.tuDangKy = 1;
                        changes.duyet = 0;
                        const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam: changes.nam });
                        if (danhGiaNam) {
                            const currentDate = new Date().getTime();
                            const isUpdate = !danhGiaNam.donViBatDauDanhGia || currentDate < danhGiaNam.donViBatDauDanhGia;
                            if (isUpdate) {
                                const item = await app.model.tccbDanhGiaCaNhanDiemThuong.create(changes);
                                await uploadMinhChung({ id: item.id }, {}, srcPath, done);
                            } else {
                                app.fs.deleteFile(srcPath);
                                return done({ error: 'Không nằm trong thời gian cập nhật điểm thưởng!' });
                            }
                        } else {
                            app.fs.deleteFile(srcPath);
                            return done({ error: 'Dữ liệu không hợp lệ!' });
                        }
                    } else {
                        const danhGiaNam = await app.model.tccbDanhGiaNam.get({ nam: changes.nam });
                        delete changes.nam;
                        delete changes.maDiemThuong;
                        delete changes.nam;
                        delete changes.tuDangKy;
                        delete changes.duyet;
                        if (danhGiaNam) {
                            const currentDate = new Date().getTime();
                            const isUpdate = !danhGiaNam.donViBatDauDanhGia || currentDate < danhGiaNam.donViBatDauDanhGia;
                            if (isUpdate) {
                                let item = await app.model.tccbDanhGiaCaNhanDiemThuong.get({ id });
                                if (!item || item.tuDangKy == 0 || item.duyet == 1) {
                                    app.fs.deleteFile(srcPath);
                                    return done({ error: 'Bạn không thể chỉnh sửa mục điểm thưởng này!' });
                                }
                                await uploadMinhChung({ id: item.id }, changes, srcPath, done);
                            } else {
                                app.fs.deleteFile(srcPath);
                                return done({ error: 'Không nằm trong thời gian cập nhật điểm thưởng!' });
                            }
                        } else {
                            app.fs.deleteFile(srcPath);
                            return done({ error: 'Dữ liệu không hợp lệ!' });
                        }
                    }
                } catch (error) {
                    console.error(error);
                    done({ error: 'Lỗi hệ thống!' });
                }
            }
        }, done, 'manager:login');
    });
};