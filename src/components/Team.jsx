import { site, team } from "../content.js";
import { Rich, isPlaceholder, plain } from "../lib/text.jsx";
import { startingWith } from "../lib/photos.js";
import { Glyph } from "./Glyphs.jsx";

export default function Team() {
  return (
    <section id="team" className="section surface-paper" data-surface="paper">
      <div className="wrap">
        <div className="section-head">
          <h2 className="h2">{team.title}</h2>
        </div>

        <ul className="people">
          {team.members.map((m, i) => (
            <Person key={i} member={m} n={i + 1} />
          ))}
        </ul>

        <div className="reflections">
          <h3 className="h3">{team.reflectionsTitle}</h3>
          <div className="reflections__grid">
            {team.reflections.map((r) => (
              <article key={r.title} className="reflection">
                <h4 className="h4">{r.title}</h4>
                <p>
                  <Rich text={r.text} />
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Person({ member, n }) {
  const photo = startingWith("team", n)[0];
  const { linkedin, email, github } = member.links || {};
  const links = [
    linkedin ? { href: linkedin, label: "LinkedIn" } : null,
    github ? { href: github, label: "GitHub" } : null,
  ].filter(Boolean);
  return (
    <li className="person">
      <div className="person__photo">
        {photo ? (
          <img src={photo.url} alt={`Portrait of ${plain(member.name)}`} loading="lazy" decoding="async" />
        ) : (
          <div className="person__empty">
            <Glyph name="person" size={80} />
            {site.showPhotoHints ? (
              <span className="media__hint">
                Add <code>{n}.jpg</code> to <code>src/photos/team/</code>
              </span>
            ) : null}
          </div>
        )}
      </div>
      <h3 className="person__name">
        <Rich text={member.name} />
      </h3>
      <p className="person__role">
        <Rich text={member.role} />
      </p>
      <p className="person__bio">
        <Rich text={member.background} />
        {member.from && !(isPlaceholder(member.from) && !site.showPhotoHints) ? (
          <>
            <br />
            <Rich text={member.from} />
          </>
        ) : null}
      </p>
      {links.length || email ? (
        <p className="person__links">
          {links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
              {l.label}
            </a>
          ))}
          {email ? <span className="person__email">{email}</span> : null}
        </p>
      ) : null}
    </li>
  );
}
