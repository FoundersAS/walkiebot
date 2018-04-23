import '../../stylesheets/full-json-import.scss';
import { connect } from 'react-redux';
import React from 'react';
import classNames from 'classnames';
import parseJson from 'parse-json';
import Joi from 'joi';
import { _initLocalBots } from '../redux/ducks/local-bots';
import * as api from '../utils/api';

const validator = Joi.array().items(
  Joi.object({
    bot: Joi.object().required(),
    stories: Joi.array().required(),
    messages: Joi.array().required()
  })
);


class FullJsonImport extends React.Component {
  constructor (props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);

    this._timeout = null;

    this.state = {
      contents: null,
      name: '',
      loading: false,
      error: '',
      errors: [],
      results: []
    };
  }

  onClick () {
    const { contents, name } = this.state;
    let localBotId;
    try {
      localBotId = localStorage.getItem('localBotId');
    } catch (e) {
      console.error('Could not access localStorage');
      console.error(e);
    }

    if (this.state.loading) return;
    this.setState({ loading: true });
    api.importJson({ localBotId, contents })
      .then(res => {
        this.setState({
          results: res.data.data,
          error: res.data.errors.length > 0 ? 'Error importing data' : '',
          errors: res.data.errors.map(e => e.message),
          loading: false
        });
        if (res.data.localBots) {
          this.props.dispatch(_initLocalBots(res.data.localBots));
        }
      })
      .catch(e => {
        this.setState({ loading: false });
        this._input.value = '';
        if (e.response) {
          console.error('Error importing JSON, response from server:', e.response.data);
          return this.setState({ error: 'Error importing JSON, response from server', errors: [e.response.data] });
        }
        if (e.request) {
          console.error('Error importing JSON, no response received from server, error:', e);
          return this.setState({ error: 'Error importing JSON, no response received from server' });
        }
        console.error('Error importing JSON, error:', e);
        return this.setState({ error: 'Error importing JSON', errors: [e.message] });
      });
  }

  onChange (e) {
    const file = e.target.files[0];

    const fileReader = new FileReader();

    fileReader.addEventListener('loadstart', () => {
      this._timeout = setTimeout(this.setState({ loading: true }), 250);
    });
    fileReader.addEventListener('loadend', () => {
      clearTimeout(this._timeout);
      this.setState({ loading: false });
    });
    fileReader.addEventListener('load', () => {
      try {
        const json = parseJson(fileReader.result);

        validator.validate(json, { stripUnknown: true }, (err, res) => {
          if (err) this.setState({ error: 'Error validating JSON', errors: err.details.map(d => `${d.message} in "${d.path}"`) });
          else this.setState({ contents: json, name: file.name, error: '', errors: [] });
        });
      } catch (e) {
        this.setState({ error: 'Error parsing JSON', errors: [e.message] });
      }
    });

    try {
      fileReader.readAsText(file);
    } catch (e) {
      this.setState({
        contents: null,
        name: '',
        loading: false,
        error: '',
        errors: [],
        results: []
      });
    }
  }

  render () {
    if (this.state.results.length > 0) {
      return (
        <div className='full-json-import'>
          <h3>The following bots were successfully imported</h3>
          <h4>You can find them in your bot list in the sidebar</h4>
          <ul>
            {this.state.results.map(r => {
              return <li key={r}><a href={`/anon/${r}`} target='_blank'>{`/anon/${r}`}</a></li>
            })}
          </ul>

          {this.state.error && <h3>These bots could not be imported:</h3>}
          {this.state.error && (
            <div className='full-json-import__error'>
              <h4>{this.state.error}</h4>
              <ul>
                {this.state.errors.map((error, i) => {
                  return <li key={i}>{error.message}</li>
                })}
              </ul>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className='full-json-import'>
        <input
          ref={el => {
            this._input = el;
          }}
          disabled={this.state.loading}
          type='file'
          onChange={this.onChange}
        />
        <div
          className={classNames('btn btn--small btn--primary', {
            'btn--disabled': this.state.loading
          })}
          onClick={this.onClick}
        >
          {this.state.loading ? 'Processing' : 'Upload'}
        </div>
        {this.state.contents && !this.state.error && (
          <div className='full-json-import__success'>
            Click upload to finish
          </div>
        )}
        {this.state.error && (
          <div className='full-json-import__error'>
            <h4>{this.state.error}</h4>
            <ul>
              {this.state.errors.map((error, i) => {
                return <li key={i} className='full-json-import__error-item'>{error}</li>
              })}
            </ul>
          </div>
        )}
      </div>
    );
  }
}


export default connect()(FullJsonImport);
