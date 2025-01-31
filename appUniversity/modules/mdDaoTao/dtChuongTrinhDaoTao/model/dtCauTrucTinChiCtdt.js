// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    // app.model.dtCauTrucTinChiCtdt.foo = async () => { };
    app.model.dtCauTrucTinChiCtdt.setDefault = async (idKdt) => {
        let [khungDaoTao, monCtdt] = await Promise.all([
            app.model.dtKhungDaoTao.get({ id: idKdt }),
            app.model.dtChuongTrinhDaoTao.getAll({ maKhungDaoTao: idKdt, loaiMonHoc: 0 }, 'maMonHoc, soTinChi, maKhoiKienThuc, maKhoiKienThucCon'),
        ]);

        let [cauTrucKDT, cauTrucTinChi] = await Promise.all([
            app.model.dtCauTrucKhungDaoTao.get({ maKhung: khungDaoTao.maKhung }),
            app.model.dtCauTrucTinChiCtdt.getAll({ maCtdt: khungDaoTao.maCtdt }),
        ]),
            { mucCha, mucCon } = cauTrucKDT ? cauTrucKDT : {};

        mucCha = mucCha ? app.utils.parse(mucCha, { chuongTrinhDaoTao: {} }).chuongTrinhDaoTao : {};
        mucCon = mucCon ? app.utils.parse(mucCon, { chuongTrinhDaoTao: {} }).chuongTrinhDaoTao : {};

        let list = Object.keys(mucCha).flatMap(key => {
            let listMucCon = mucCon[key] || [];
            if (listMucCon && listMucCon.length) {
                listMucCon = listMucCon.map(child => {
                    let { tinChiBatBuoc, id, tinChiTuChon } = cauTrucTinChi.filter(e => e.idKhoiCha != null).find(i => i.idKhoiCha == `${mucCha[key].id}-${key}` && i.viTriKhoiKienThuc == child.id) || { tinChiBatBuoc: 0, id: null, tinChiTuChon: 0 },
                        listMon = monCtdt.filter(mon => mon.maKhoiKienThuc == mucCha[key].id && mon.maKhoiKienThucCon == child.id);

                    tinChiBatBuoc = listMon.reduce((total, cur) => total + Number(cur.soTinChi), 0);

                    return { itemId: id, viTriKhoiKienThuc: child.id, idKhoiKienThuc: child.value.id, idKhoiCha: `${mucCha[key].id}-${key}`, tinChiBatBuoc, tongSoTinChi: Number(tinChiBatBuoc) + Number(tinChiTuChon || 0) };
                });
            }
            let { tinChiBatBuoc, id, tinChiTuChon } = cauTrucTinChi.filter(e => e.idKhoiCha == null).find(i => i.idKhoiKienThuc == mucCha[key].id) || { tongSoTinChi: 0 } || { tinChiBatBuoc: 0, id: null, tinChiTuChon: 0 },
                listMon = monCtdt.filter(mon => mon.maKhoiKienThuc == mucCha[key].id);

            tinChiBatBuoc = listMon.reduce((total, cur) => total + Number(cur.soTinChi), 0);

            return [{ itemId: id, viTriKhoiKienThuc: key, idKhoiKienThuc: mucCha[key].id, tinChiBatBuoc, tongSoTinChi: Number(tinChiBatBuoc) + Number(tinChiTuChon || 0) }, ...listMucCon];
        });

        await Promise.all(list.map(i => i.itemId ? app.model.dtCauTrucTinChiCtdt.update({ id: i.itemId }, { ...i, maKhung: khungDaoTao.maKhung, maCtdt: khungDaoTao.maCtdt }) : app.model.dtCauTrucTinChiCtdt.create({ ...i, maKhung: khungDaoTao.maKhung, maCtdt: khungDaoTao.maCtdt, tinChiTuChon: 0 })));
    };
};