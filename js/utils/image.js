export const jitter = (value, jitter) => (
  (value - jitter) + (Math.random() * jitter * 2)
);

const RESIZE_IMAGE_DEFAULT_OPTS = {
  canvas: null,
  maxHeight: 500,
  maxWidth: 700,
  padding: 50,
  paddingJitter: 0.25
};

/**
 * Takes an input image, resizes it, draws to canvas.
 * You can translate tracker points back to texture points using the returned
 * padding.
 * @param  {Image} image
 * @param  {Object} [opts]
 * @param  {Object} [opts.canvas]
 * @param  {Object} [opts.maxHeight=500]
 * @param  {Object} [opts.maxWidth=700]
 * @param  {Object} [opts.padding=50]
 * @param  {Object} [opts.paddingJitter=0.25]
 */
export const resizeImage = (image, opts = RESIZE_IMAGE_DEFAULT_OPTS) => {
  opts.canvas = opts.canvas || document.createElement('canvas');

  const c = opts.canvas;
  const cc = c.getContext('2d');

  let w;
  let h;

  if (image.height > opts.maxHeight || image.width > opts.maxWidth) {
    var rel = image.height / image.width;
    var neww = opts.maxHeight;
    var newh = neww * rel;
    if (newh > opts.maxWidth) {
      newh = opts.maxWidth;
      neww = newh / rel;
    }
    w = neww;
    h = newh;
  } else {
    w = image.width;
    h = image.height;
  }

  let padding = Math.max(
    Math.max((opts.maxWidth - w) / 2, opts.padding),
    Math.max((opts.maxHeight - h) / 2, opts.padding)
  );
  padding = jitter(padding, opts.paddingJitter);

  c.width = w + padding * 2;
  c.height = h + padding * 2;
  cc.drawImage(image, padding, padding, w, h);

  return { canvas: c, padding: padding };
}