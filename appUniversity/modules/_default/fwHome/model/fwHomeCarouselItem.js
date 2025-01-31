// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.fwHomeCarouselItem.foo = () => { };
    app.model.fwHomeCarouselItem.sortable = async (condition, done) => {
        const { newPriority, oldPriority, carouselId } = condition;
        app.model.fwHomeCarouselItem.getAll({ carouselId: carouselId }, '*', '', (error, items) => {
            let sqlUpdate = '';
            if (newPriority > oldPriority) {
                items.forEach(item => {
                    sqlUpdate += `WHEN PRIORITY=${item.priority} AND CAROUSEL_ID=${carouselId} THEN ${(item.priority > oldPriority && item.priority <= newPriority) ? (item.priority - 1) : ((item.priority == oldPriority) ? newPriority : item.priority)
                        } `;
                });
            } else {
                items.forEach(item => {
                    sqlUpdate += `WHEN PRIORITY=${item.priority} AND CAROUSEL_ID=${carouselId} THEN ${(item.priority < oldPriority && item.priority >= newPriority) ? (item.priority + 1) : ((item.priority == oldPriority) ? newPriority : item.priority)
                        } `;
                });
            }
            app.database.oracle.connection.main.executeExtra(`UPDATE FW_HOME_CAROUSEL_ITEM SET PRIORITY=CASE ${sqlUpdate}END`, error => {
                if (done) return done(error);
            });
        });
    };
};