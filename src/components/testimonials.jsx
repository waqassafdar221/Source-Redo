import React, { useEffect, useMemo, useState } from "react";

// Redesigned testimonials with a simple, responsive slider (no external deps)
export const Testimonials = (props) => {
  const items = useMemo(() => props.data || [], [props.data]);
  const hideArrows = props.hideArrows || false;

  // Responsive slides per view
  function calcPerView(w) {
    if (w < 576) return 1; // phones
    if (w < 992) return 2; // tablets
    return 3; // desktops
  }

  const [perView, setPerView] = useState(() => calcPerView(window.innerWidth));
  useEffect(() => {
    const onResize = () => setPerView(calcPerView(window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const pages = useMemo(() => {
    const result = [];
    for (let i = 0; i < items.length; i += perView) {
      result.push(items.slice(i, i + perView));
    }
    return result.length ? result : [[]];
  }, [items, perView]);

  const [page, setPage] = useState(0);
  useEffect(() => {
    // Clamp page when perView changes
    const maxPage = Math.max(0, pages.length - 1);
    if (page > maxPage) setPage(maxPage);
  }, [pages, page]);

  const prev = () => setPage((p) => (p === 0 ? pages.length - 1 : p - 1));
  const next = () => setPage((p) => (p === pages.length - 1 ? 0 : p + 1));

  // Optional autoplay (can be toggled off if undesired)
  useEffect(() => {
    if (pages.length <= 1) return;
    const t = setInterval(() => setPage((p) => (p === pages.length - 1 ? 0 : p + 1)), 6000);
    return () => clearInterval(t);
  }, [pages.length]);

  return (
    <div id="testimonials" className="testimonial-section">
      <div className="container">
        <div className="section-title text-center">
          <h2>What our clients say</h2>
          <p className="section-subtitle">Real feedback from businesses we’ve helped</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center">loading</div>
        ) : (
          <div className={`ts-slider ${hideArrows ? "no-arrows" : ""}`} aria-roledescription="carousel">
            <button className="ts-nav prev" aria-label="Previous testimonial" onClick={prev}>
              <i className="fa fa-chevron-left" aria-hidden="true" />
            </button>
            <div className="ts-viewport">
              <div
                className="ts-track"
                style={{ width: `${pages.length * 100}%`, transform: `translateX(-${page * (100 / pages.length)}%)` }}
              >
                {pages.map((group, idx) => (
                  <div key={idx} className="ts-page" style={{ width: `${100 / pages.length}%` }}>
                    {group.map((d, i) => (
                      <div key={`${d.name}-${i}`} className="ts-card">
                        <div className="ts-quote-mark">“</div>
                        <div className="ts-content">{d.text}</div>
                        <div className="ts-footer">
                          <img className="ts-avatar" src={d.img} alt={d.name} />
                          <div className="ts-meta">
                            <div className="ts-name">{d.name}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <button className="ts-nav next" aria-label="Next testimonial" onClick={next}>
              <i className="fa fa-chevron-right" aria-hidden="true" />
            </button>

            <div className="ts-dots" role="tablist" aria-label="Testimonials pagination">
              {pages.map((_, i) => (
                <button
                  key={i}
                  className={`dot ${i === page ? "active" : ""}`}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === page ? "true" : undefined}
                  onClick={() => setPage(i)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
