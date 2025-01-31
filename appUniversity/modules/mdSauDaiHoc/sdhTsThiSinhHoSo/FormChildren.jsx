import React from 'react';
import { Tooltip } from '@mui/material';
//show and hide form like chart
export class FormChildren extends React.Component {
    state = { showing: true }
    componentDidMount() {
        const showing = this.props.showing;
        this.setState({ showing });
    }
    componentDidUpdate(prevProps) {
        if (prevProps.showing != this.props.showing) {
            this.setState({ showing: this.props.showing });
        }
    }
    render() {
        let { className, titleSize, title, content, contentStyle, titleStyle, titleClassName } = this.props;
        let titleF = '';
        switch (titleSize) {
            case 'h5':
                titleF = <h5 style={{ ...titleStyle, position: 'relative' }}>{title}</h5>;
                break;
            case 'h3':
                titleF = <h3 style={{ ...titleStyle, position: 'relative' }}>{title}</h3>;
                break;
            default: titleF = <h5 style={{ ...titleStyle, position: 'relative' }}>{title}</h5>;
        }
        return (
            <div className={className} >
                <div className={titleClassName}>
                    {titleF}
                    <span style={{ position: 'absolute', top: '5px', right: '5px' }}>
                        {<Tooltip title={this.state[title] ? 'Hiện' : 'Ẩn'} arrow>
                            <button className='btn btn-white' onClick={e => e.preventDefault() || this.setState({ showing: !this.state.showing })} >{this.state.showing ? <i className='fa fa-lg fa-minus' /> : <i className='fa fa-lg fa-plus' />}</button>
                        </Tooltip>}
                    </span>
                </div>
                <div style={{ ...contentStyle, display: this.state.showing ? 'block' : 'none', paddingTop: '5px' }} >
                    {content}
                </div>
            </div>
        );
    }
}