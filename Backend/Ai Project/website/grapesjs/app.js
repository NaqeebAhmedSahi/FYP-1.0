import 'grapesjs/dist/css/grapes.min.css';
import grapesjs from 'grapesjs';

const editor = grapesjs.init({
  container: '#gjs',
  height: '300px',
  width: 'auto',
  storageManager: false,
  panels: { defaults: [] },
});


// Add a text block to the canvas
editor.addComponents('<h1>Hello World Component!</h1>');
