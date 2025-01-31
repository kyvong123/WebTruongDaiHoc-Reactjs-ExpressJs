import React from 'react';
import { connect } from 'react-redux';
import { AdminPage } from 'view/component/AdminPage';
import { createENewsStructure } from 'modules/mdTruyenThong/fwENews/redux';

const structureArr = [
    { tag: '12', col: [12] },
    { tag: '6-6', col: [6, 6] },
    { tag: '4-4-4', col: [4, 4, 4] },
    { tag: '3-3-3-3', col: [3, 3, 3, 3] },
    { tag: '4-8', col: [4, 8] },
    { tag: '8-4', col: [8, 4] }
];

class SectionStructure extends AdminPage {

    createENewsStructure = (tag) => {
        const item = this.props.fwENews && this.props.fwENews.item || {};
        this.props.createENewsStructure({ eNewsId: item.id, tag });
    }

    render() {
        const permission = this.getUserPermission('fwENews');

        return (
            <div className='section-structure'>
                <h5 className='mt-2 ml-2'>Cấu trúc</h5>
                {structureArr.map(item => {
                    const elements = item.col.map((num, index) => (
                        <div key={`${item.tag}_${num}_${index}`} className={'col-' + num + ' row-padding'}>
                            <div className='structure-item' />
                        </div>
                    ));

                    return (
                        <div key={item.tag} className='structure-row' style={{ cursor: permission.write ? 'pointer' : '' }} onClick={() => permission.write && this.createENewsStructure(item.tag)}>
                            <div className='row'>{elements}</div>
                        </div>
                    );
                })}
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, fwENews: state.truyenThong.fwENews });
const mapActionsToProps = { createENewsStructure };
export default connect(mapStateToProps, mapActionsToProps)(SectionStructure);