import React from "react";

export const Team = (props) => {
  const founder = props.data;
  
  return (
    <div id="team" className="founder-section">
      <div className="container">
        <div className="section-title text-center">
          <h2>Our Founder</h2>
          <p className="section-subtitle">Meet the visionary behind SourceRedo</p>
        </div>
        {founder ? (
          <div className="founder-content">
            <div className="founder-image">
              <img src={founder.img} alt={founder.name} />
            </div>
            <div className="founder-details">
              <h3 className="founder-name">{founder.name}</h3>
              <p className="founder-designation">{founder.designation}</p>
              <div className="founder-bio">
                {founder.bio.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">loading</div>
        )}
      </div>
    </div>
  );
};
