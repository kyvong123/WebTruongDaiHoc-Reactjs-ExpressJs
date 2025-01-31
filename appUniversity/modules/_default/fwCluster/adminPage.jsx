import React from 'react';
import { connect } from 'react-redux';
import { getClusterAll, createCluster, resetCluster, deleteCluster } from './redux';
import { AdminPage, FormTabs, FormCollapsedBox, TableCell, renderTable } from 'view/component/AdminPage';

const parseImageFilename = (filename) => {
    const texts = filename.split('-');
    let date = texts.length >= 1 ? texts[0] : null,
        time = texts.length >= 2 ? texts[1] : null,
        version = texts.length >= 3 ? texts[2] : '?';
    if (date && date.length == 8) date = date.substring(0, 4) + '/' + date.substring(4, 6) + '/' + date.substring(6, 8);
    if (time && time.length == 4) time = time.substring(0, 2) + ' ' + date.substring(2, 4);
    if (version.endsWith('.zip')) version = version.substring(0, version.length - 4);
    return { version, date: date ? date + ':' + time : '?' };
};

class ClusterPage extends AdminPage {
    state = {};

    componentDidMount() {
        T.ready();
        this.props.getClusterAll();
    }

    resetAllClusters = (serviceName) => T.confirm('Reset all clusters', `Are you sure you want to reset all clusters ${serviceName}?`, true, isConfirm =>
        isConfirm && this.props.resetCluster(serviceName, 'all'));

    resetCluster = (e, serviceName, item) => e.preventDefault() || T.confirm('Reset cluster', `Are you sure you want to reset cluster ${serviceName}:${item.pid}?`, true, isConfirm =>
        isConfirm && this.props.resetCluster(serviceName, item.pid));
    deleteCluster = (e, serviceName, item) => e.preventDefault() || T.confirm('Delete cluster', `Are you sure you want to delete cluster ${serviceName}:${item.pid}?`, true, isConfirm =>
        isConfirm && this.props.deleteCluster(serviceName, item.pid));

    onRefresh = (e) => e.preventDefault() || this.props.getClusterAll();

    renderServiceClusters = (permission, service, serviceName) => (
        <div style={{ marginTop: 6 }}>
            {permission.write ?
                <div style={{ position: 'absolute', top: -45, right: 0 }} >
                    <button className='btn btn-success' type='button' onClick={() => this.resetAllClusters(serviceName)}>
                        <i className='fa fa-fw fa-lg fa-refresh' />Reset all clusters
                    </button>&nbsp;&nbsp;
                    <button className='btn btn-primary' type='button' onClick={() => this.props.createCluster(serviceName)}>
                        <i className='fa fa-fw fa-lg fa-plus' />Create cluster
                    </button>
                </div> : null}
            {renderTable({
                getDataSource: () => (service.clusters || []).sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()),
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Id</th>
                        <th style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }}>Version</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Primary</th>
                        {/* <th style={{ width: 'auto' }} nowrap='true'>Image filename</th> */}
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Image date</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Start date</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Status</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Actions</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.pid} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.version} />
                        <TableCell type='text' style={{ textAlign: 'center' }} className='text-danger' content={item.primaryWorker ? <i className='fa fa-star' /> : ''} />
                        {/* <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.imageInfo} /> */}
                        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={parseImageFilename(item.imageInfo).date} />
                        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={new Date(item.createdDate).getShortText()} />
                        <TableCell type='text' className={item.status == 'running' ? 'text-primary' : 'text-danger'} content={item.status} />
                        <TableCell type='buttons' content={item} style={{ textAlign: 'center' }} permission={permission} onDelete={e => this.deleteCluster(e, serviceName, item)}>
                            {permission.write &&
                                <a className='btn btn-success' href='#' onClick={e => this.resetCluster(e, serviceName, item)}>
                                    <i className='fa fa-lg fa-refresh' />
                                </a>}
                        </TableCell>
                    </tr>),
            })}
        </div>);

    render() {
        const permission = this.getUserPermission('cluster');
        const services = (this.props.cluster || {});
        const serviceNames = Object.keys(services).sort((a, b) => a.includes('main') || a.startsWith('md') != b.startsWith('md') || a < b ? -1 : +1);

        const serviceBoxes = serviceNames.map((serviceName, index) => {
            let title = serviceName.upFirstChar(),
                titleStyle = { color: '#dc3545' };

            if (title.endsWith('Service')) {
                titleStyle.color = title.toLowerCase().startsWith('md') ? '#009688' : '#007bff';
                title = title.substring(0, title.length - 'Service'.length);
            }

            const tabs = [
                { title: 'Clusters', component: this.renderServiceClusters(permission, services[serviceName], serviceName) }
            ];

            return <FormCollapsedBox key={index} title={title} titleStyle={titleStyle} body={<FormTabs tabs={tabs} />} />;
        });

        return this.renderPage({
            icon: 'fa fa-braille',
            title: 'Cluster',
            breadcrumb: ['Cluster'],
            content: serviceBoxes,
            onRefresh: permission.write ? this.onRefresh : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, cluster: state.framework.cluster });
const mapActionsToProps = { getClusterAll, createCluster, resetCluster, deleteCluster };
export default connect(mapStateToProps, mapActionsToProps)(ClusterPage);