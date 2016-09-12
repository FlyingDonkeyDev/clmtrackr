// function to draw pixeldata on some canvas, only used for debugging
export const drawData = (canvasContext, data, width, height, transposed, drawX, drawY) => {
  var psci = canvasContext.createImageData(width, height);
  var pscidata = psci.data;
  for (var j = 0;j < width*height;j++) {
    if (!transposed) {
      var val = data[(j%width)+((j/width) >> 0)*width];
    } else {
      var val = data[(j%height)*height+((j/height) >> 0)];
    }
    val = val > 255 ? 255 : val;
    val = val < 0 ? 0 : val;
    pscidata[j*4] = val;
    pscidata[(j*4)+1] = val;
    pscidata[(j*4)+2] = val;
    pscidata[(j*4)+3] = 255;
  }
  canvasContext.putImageData(psci, drawX, drawY);
}

export const requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
    return window.setTimeout(callback, 1000/60);
  };
})();

export const cancelRequestAnimFrame = (function() {
  return window.cancelAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.oCancelRequestAnimationFrame ||
    window.msCancelRequestAnimationFrame ||
    window.clearTimeout;
})();
