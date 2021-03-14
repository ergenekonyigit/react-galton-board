var sourceLinkRoot = 'https://github.com/ergenekonyigit/react-galton-board/blob/main';

MatterTools.Demo.create({
  fullPage: true,
  preventZoom: true,
  startExample: true,
  appendTo: document.body,

  toolbar: {
    title: 'react-galton-board-demo',
    url: 'https://github.com/ergenekonyigit/react-galton-board',
    reset: true,
    source: true,
    inspector: true,
    tools: true,
    fullscreen: true,
    exampleSelect: true
  },

  tools: {
    inspector: true,
    gui: true
  },

  examples: [
    {
      name: 'Galton Board',
      id: 'galton-board',
      init: Example.galtonBoard,
      sourceLink: sourceLinkRoot + '/docs/examples/galton-board.js'
    }
  ]
});
