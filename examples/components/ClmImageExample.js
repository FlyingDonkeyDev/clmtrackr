import React from 'react';
import classNames from 'classnames';

import RaisedButton from 'material-ui/RaisedButton';

import Tracker from 'clmtrackr/js/Tracker';
import { resizeImage } from 'clmtrackr/js/utils/image';
import { requestAnimFrame, cancelRequestAnimFrame } from 'clmtrackr/js/utils/anim';

import TrackerContainer from 'clmtrackr/ui/container/TrackerContainer';

import './ClmImageExample.styl';


const MEDIA_SRC = 'media/franck_02159.jpg';
const MEDIA_SIZE = { width: 625, height: 500 };


export default class SimpleExample extends React.Component {
  constructor () {
    super();
    this.state = {
      tracker: null,
      isTrackerRunning: false,

      showLoadImageText: false,
      convergenceText: 'n/a',
      convergenceStatus: '',

      fileList: [],
      fileIndex: 0
    };

    this._boundOnFrame = this._onFrame.bind(this);
  }

  _loadMediaSrc (src) {
    const img = new Image();
    img.onload = () => {
      const trackerContainer = this.refs.trackerContainer;
      const mediaCanvas = trackerContainer.refs.media;
      resizeImage(img, {
        canvas: mediaCanvas,
        padding: 0,
        paddingJitter: 0
      });
    };
    img.src = MEDIA_SRC;
  }

  componentDidMount () {
    this._loadMediaSrc(MEDIA_SRC);

    const tracker = new Tracker({ stopOnConvergence: true });
    this.setState({ tracker });
    tracker.init();

    tracker.on('notFound', (event) => {
      tracker.stop();
      alert('The tracking had problems with finding a face in this image. Try selecting the face in the image manually.')
    });

    // detect if tracker loses tracking of face
    tracker.on('lost', (event) => {
      tracker.stop();
      alert('The tracking had problems converging on a face in this image. Try selecting the face in the image manually.')
    });

    // detect if tracker has converged
    tracker.on('converged', (event) => {
      this.setState({ convergenceText: 'CONVERGED', convergenceStatus: 'good' });
      // stop drawloop
      cancelRequestAnimFrame(this._boundOnFrame);
    });

    tracker.on('started', () => this.setState({ isTrackerRunning: true }));
    tracker.on('stopped', () => this.setState({ isTrackerRunning: false }));
  }

  _onFrame () {
    // Update overlay
    const trackerContainer = this.refs.trackerContainer;
    if (trackerContainer) {
      const tracker = this.state.tracker;
      const cc = trackerContainer.refs.canvas.getContext('2d');
      cc.clearRect(0, 0, MEDIA_SIZE.width, MEDIA_SIZE.height);
      tracker.draw(cc.canvas);
    }
    requestAnimFrame(this._boundOnFrame);
  }

  _start (e) {
    const trackerContainer = this.refs.trackerContainer;
    const tracker = this.state.tracker;
    tracker.start(trackerContainer.refs.media);
    this._onFrame();
  }

  _selectBox (e) {
    alert('Coming soon!');
  }

  _selectFile (e) {
    e.preventDefault();
    const fileInput = this.refs.fileInput;
    fileInput.click();
  }

  _handleFileSelect (e) {
    const files = e.target.files;
    const fileList = [];
    for (let i = 0; i < files.length; i++) {
      if (!files[i].type.match('image.*')) {
        continue;
      }
      fileList.push(files[i]);
    }
    if (files.length > 0) {
      this.setState({ fileIndex: 0 });
    }

    this.setState({ fileList });

    setTimeout(() => { this._loadImage(); });
  }

  _loadImage () {
    const { fileList, fileIndex, tracker } = this.state;
    if (fileList.indexOf(fileIndex) >= 0) { return; }

    const reader = new FileReader();
    reader.onload = (e) => {
      // Render thumbnail.
      this._loadMediaSrc(e.target.result);
    };
    reader.readAsDataURL(fileList[fileIndex]);

    const trackerContainer = this.refs.trackerContainer;
    const overlayCC = trackerContainer.refs.canvas.getContext('2d');
    overlayCC.clearRect(0, 0, MEDIA_SIZE.width, MEDIA_SIZE.height);
    this.setState({ convergenceText: 'n/a', convergenceStatus: '' });
    tracker.stop();
    tracker.reset();
  }

  render () {
    let loadImageText;
    if (this.state.showLoadImageText) {
      loadImageText = <p>To try it out with your own image, choose a file above by clicking "choose file". If the tracking has problems, try selecting the face in the image manually by clicking "manually select face", and click and hold to drag a square around the face in the image.</p>;
    }

    return (
      <div className='clm-image-example-cmpt'>
        <h1>Tracking a video tag</h1>

        <TrackerContainer
          ref='trackerContainer'
          mediaType={'image'}
          mediaSrc={MEDIA_SRC}
          mediaSize={MEDIA_SIZE}
          showStats={true}
          tracker={this.state.tracker}
        />

        <div className='control-row'>
          <div>
            <RaisedButton
              label='start'
              onClick={this._start.bind(this)}
              disabled={this.state.isTrackerRunning}
            />
            <RaisedButton
              label='manually select face'
              onClick={this._selectBox.bind(this)}
            />
            <RaisedButton
              label='Choose File'
              onClick={this._selectFile.bind(this)}
            />
            <input
              type='file'
              className='file-input'
              ref='fileInput'
              onChange={this._handleFileSelect.bind(this)}
            />
          </div>

          <div
            className={classNames(
              'convergence-text',
              this.state.convergenceStatus
            )}
          >
            Convergence: {this.state.convergenceText}
          </div>
        </div>

        <div>
          <p>This is an example of precise face-tracking in an image using the javascript library <a href='https://github.com/auduno/clmtrackr'><em>clmtrackr</em></a>. To try it out, simply click start.</p>
          {loadImageText}
        </div>

        <p>The image is from the <a href='http://www-prima.inrialpes.fr/FGnet/data/01-TalkingFace/talking_face.html‎'>FG-net Talking Face</a> project</p>
      </div>
    );
  }
}
