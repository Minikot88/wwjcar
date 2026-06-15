import imageManifest from '../data/generated/imageManifest.json';

export function getImageAsset(key) {
  return imageManifest[key] || null;
}

export function getCarImageAsset(car) {
  return getImageAsset(car.slug || car.id);
}

export function responsiveImageProps(asset, fallbackAlt) {
  if (!asset) {
    return {
      alt: fallbackAlt
    };
  }

  return {
    alt: asset.alt || fallbackAlt,
    srcSet: asset.srcSet,
    sizes: asset.sizes
  };
}

export function preloadImageHref(key) {
  return getImageAsset(key)?.src;
}
