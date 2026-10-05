import { site } from "../content.js";
import { useLightbox } from "./Lightbox.jsx";
import { Glyph } from "./Glyphs.jsx";
import { Icon } from "./Icons.jsx";

/*
  A set of photos: the first one large, the rest as thumbnails.
  With no photos yet, shows a drawing and where to put them.
*/
export default function Media({ items, glyph = "box", hint, label, layout = "lead" }) {
  const { open } = useLightbox();

  if (!items.length) {
    if (!site.showPhotoHints) return null;
    return (
      <figure className={`media media--empty media--${layout}`}>
        <div className="media__slot">
          <Glyph name={glyph} size={72} />
          {hint ? <figcaption className="media__hint">{hint}</figcaption> : null}
        </div>
      </figure>
    );
  }

  const lightboxItems = items.map((it) => ({ ...it, alt: it.caption || label }));
  const [first, ...rest] = items;
  const shown = rest.slice(0, 4);
  const more = rest.length - shown.length;

  return (
    <div className={`media media--${layout}`}>
      <figure className="media__main">
        <button type="button" className="media__open" onClick={() => open(lightboxItems, 0)} aria-label={`Open photo: ${first.caption || label}`}>
          <Thumb item={first} alt={first.caption || label} />
        </button>
        {first.caption ? <figcaption className="media__caption">{first.caption}</figcaption> : null}
      </figure>
      {shown.length ? (
        <ul className="media__thumbs">
          {shown.map((it, i) => (
            <li key={it.url}>
              <button type="button" className="media__open" onClick={() => open(lightboxItems, i + 1)} aria-label={`Open photo: ${it.caption || label}`}>
                <Thumb item={it} alt={it.caption || label} />
                {more > 0 && i === shown.length - 1 ? <span className="media__more">+{more}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function Thumb({ item, alt }) {
  if (item.type === "video") {
    return (
      <span className="thumb thumb--video">
        <video src={`${item.url}#t=0.5`} muted playsInline preload="metadata" />
        <span className="thumb__play" aria-hidden="true">
          <Icon name="play" size={22} />
        </span>
      </span>
    );
  }
  return (
    <span className="thumb">
      <img src={item.url} alt={alt || ""} loading="lazy" decoding="async" />
    </span>
  );
}
